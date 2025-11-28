use axum::{extract::State, Json, Extension};
use chrono::{Duration, Utc};
use validator::Validate;

use crate::AppState;
use crate::models::{
    CreateUserRequest, LoginRequest, AuthResponse, PasswordResetRequest,
    PasswordResetConfirm, UserPublicProfile, AccountStatus, RefreshTokenRequest,
    VerifyEmailRequest,
};
use crate::services::UserService;
use crate::utils::jwt::{generate_token_pair, validate_token, TokenType};
use crate::middleware::auth::AuthUser;
use super::{ApiError, ApiResult, EmptyResponse};
#[cfg(feature = "email")]
use std::sync::Arc;

/// Request body for logout
#[derive(Debug, serde::Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct LogoutRequest {
    pub refresh_token: String,
}

/// Register a new user
pub async fn register(
    State(state): State<AppState>,
    Json(payload): Json<CreateUserRequest>,
) -> ApiResult<AuthResponse> {
    // Validate input
    payload.validate().map_err(|e| ApiError::Validation(e.to_string()))?;

    // Check if email already exists
    if let Some(_) = UserService::find_by_email(&state.db, &payload.email).await
        .map_err(|e| ApiError::Internal(e.into()))?
    {
        return Err(ApiError::Conflict("Email already registered".to_string()));
    }

    // Create user (password hashing is done in the service)
    let user = UserService::create_user(&state.db, payload).await
        .map_err(|e| ApiError::Internal(e.into()))?;

    // Generate JWT tokens
    let tokens = generate_token_pair(user.id, &user.email, user.role.clone(), &state.settings.jwt.secret)
        .map_err(|e| ApiError::Internal(anyhow::anyhow!("Token generation failed: {}", e)))?;

    // Store refresh token in database for later validation/revocation
    let refresh_token_expiry = Utc::now() + Duration::days(7);
    UserService::store_refresh_token(&state.db, user.id, &tokens.refresh_token, refresh_token_expiry)
        .await
        .map_err(|e| ApiError::Internal(e.into()))?;

    // Generate verification token and send email
    let verification_token = crate::utils::crypto::generate_reset_token();
    UserService::store_verification_token(&state.db, user.id, &verification_token)
        .await
        .map_err(|e| ApiError::Internal(e.into()))?;

    // Send verification email asynchronously (don't block response)
    #[cfg(feature = "email")]
    if let Some(ref email_service) = state.email {
        let email_service = Arc::clone(email_service);
        let user_email = user.email.clone();
        let user_name = format!("{} {}", user.first_name, user.last_name);
        let frontend_url = state.settings.frontend_url.clone();
        let verification_url = format!("{}/verify-email?token={}", frontend_url, verification_token);

        tokio::spawn(async move {
            if let Err(e) = email_service.send_verification_email(&user_email, &user_name, &verification_url).await {
                tracing::error!("Failed to send verification email to {}: {}", user_email, e);
            } else {
                tracing::info!("Verification email sent to {}", user_email);
            }
        });
    }

    Ok(Json(crate::handlers::SuccessResponse::new(AuthResponse {
        user: UserPublicProfile::from(user),
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        token_type: tokens.token_type,
        expires_in: tokens.expires_in,
    })))
}

/// Login with email and password
pub async fn login(
    State(state): State<AppState>,
    Json(payload): Json<LoginRequest>,
) -> ApiResult<AuthResponse> {
    payload.validate().map_err(|e| ApiError::Validation(e.to_string()))?;

    // Find user by email
    let user = UserService::find_by_email(&state.db, &payload.email).await
        .map_err(|e| ApiError::Internal(e.into()))?
        .ok_or_else(|| ApiError::Unauthorized("Invalid email or password".to_string()))?;

    // Check account status
    if user.status == AccountStatus::Suspended {
        return Err(ApiError::Forbidden("Account is suspended".to_string()));
    }

    // Verify password
    let is_valid = UserService::verify_password(&payload.password, &user.password_hash)
        .map_err(|e| ApiError::Internal(anyhow::anyhow!("Password verification failed: {}", e)))?;

    if !is_valid {
        return Err(ApiError::Unauthorized("Invalid email or password".to_string()));
    }

    // Update last login
    UserService::update_last_login(&state.db, user.id).await
        .map_err(|e| ApiError::Internal(e.into()))?;

    // Generate JWT tokens
    let tokens = generate_token_pair(user.id, &user.email, user.role.clone(), &state.settings.jwt.secret)
        .map_err(|e| ApiError::Internal(anyhow::anyhow!("Token generation failed: {}", e)))?;

    // Store refresh token in database for later validation/revocation
    let refresh_token_expiry = Utc::now() + Duration::days(7);
    UserService::store_refresh_token(&state.db, user.id, &tokens.refresh_token, refresh_token_expiry)
        .await
        .map_err(|e| ApiError::Internal(e.into()))?;

    Ok(Json(crate::handlers::SuccessResponse::new(AuthResponse {
        user: UserPublicProfile::from(user),
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        token_type: tokens.token_type,
        expires_in: tokens.expires_in,
    })))
}

/// Logout (invalidate refresh token)
pub async fn logout(
    State(state): State<AppState>,
    Json(payload): Json<LogoutRequest>,
) -> Result<Json<EmptyResponse>, ApiError> {
    // Revoke the refresh token in the database
    UserService::revoke_refresh_token(&state.db, &payload.refresh_token)
        .await
        .map_err(|e| ApiError::Internal(e.into()))?;

    Ok(Json(EmptyResponse::new("Logged out successfully")))
}

/// Refresh access token
pub async fn refresh_token(
    State(state): State<AppState>,
    Json(payload): Json<RefreshTokenRequest>,
) -> ApiResult<AuthResponse> {
    // Validate the refresh token JWT signature and expiry
    let claims = validate_token(&payload.refresh_token, &state.settings.jwt.secret)
        .map_err(|_| ApiError::Unauthorized("Invalid or expired refresh token".to_string()))?;

    // Ensure it's a refresh token
    if claims.token_type != TokenType::Refresh {
        return Err(ApiError::Unauthorized("Invalid token type".to_string()));
    }

    // Check if the token is still valid in the database (not revoked)
    let is_valid = UserService::validate_refresh_token(&state.db, &payload.refresh_token)
        .await
        .map_err(|e| ApiError::Internal(e.into()))?;

    if !is_valid {
        return Err(ApiError::Unauthorized("Refresh token has been revoked".to_string()));
    }

    // Find the user
    let user = UserService::find_by_id(&state.db, claims.sub).await
        .map_err(|e| ApiError::Internal(e.into()))?
        .ok_or_else(|| ApiError::Unauthorized("User not found".to_string()))?;

    // Check account status
    if user.status == AccountStatus::Suspended {
        return Err(ApiError::Forbidden("Account is suspended".to_string()));
    }

    // Revoke the old refresh token
    UserService::revoke_refresh_token(&state.db, &payload.refresh_token)
        .await
        .map_err(|e| ApiError::Internal(e.into()))?;

    // Generate new token pair
    let tokens = generate_token_pair(user.id, &user.email, user.role.clone(), &state.settings.jwt.secret)
        .map_err(|e| ApiError::Internal(anyhow::anyhow!("Token generation failed: {}", e)))?;

    // Store the new refresh token
    let refresh_token_expiry = Utc::now() + Duration::days(7);
    UserService::store_refresh_token(&state.db, user.id, &tokens.refresh_token, refresh_token_expiry)
        .await
        .map_err(|e| ApiError::Internal(e.into()))?;

    Ok(Json(crate::handlers::SuccessResponse::new(AuthResponse {
        user: UserPublicProfile::from(user),
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        token_type: tokens.token_type,
        expires_in: tokens.expires_in,
    })))
}

/// Request password reset
pub async fn forgot_password(
    State(state): State<AppState>,
    Json(payload): Json<PasswordResetRequest>,
) -> Result<Json<EmptyResponse>, ApiError> {
    payload.validate().map_err(|e| ApiError::Validation(e.to_string()))?;

    // Find user by email (silently fail if not found to prevent enumeration)
    if let Ok(Some(user)) = UserService::find_by_email(&state.db, &payload.email).await {
        // Generate reset token
        let reset_token = crate::utils::crypto::generate_reset_token();

        // Store reset token with expiry (1 hour)
        let _ = UserService::store_reset_token(&state.db, user.id, &reset_token).await;

        // Send reset email asynchronously
        #[cfg(feature = "email")]
        if let Some(ref email_service) = state.email {
            let email_service = Arc::clone(email_service);
            let user_email = user.email.clone();
            let user_name = format!("{} {}", user.first_name, user.last_name);
            let frontend_url = state.settings.frontend_url.clone();
            let reset_url = format!("{}/reset-password?token={}", frontend_url, reset_token);

            tokio::spawn(async move {
                if let Err(e) = email_service.send_password_reset_email(&user_email, &user_name, &reset_url).await {
                    tracing::error!("Failed to send password reset email to {}: {}", user_email, e);
                } else {
                    tracing::info!("Password reset email sent to {}", user_email);
                }
            });
        }

        // Log token in development when email is not configured
        #[cfg(not(feature = "email"))]
        tracing::info!("Password reset token for {}: {}", user.email, reset_token);
    }

    // Always return success to prevent email enumeration
    Ok(Json(EmptyResponse::new("If the email exists, a reset link has been sent")))
}

/// Reset password with token
pub async fn reset_password(
    State(state): State<AppState>,
    Json(payload): Json<PasswordResetConfirm>,
) -> Result<Json<EmptyResponse>, ApiError> {
    payload.validate().map_err(|e| ApiError::Validation(e.to_string()))?;

    // Find user by reset token
    let user = UserService::find_by_reset_token(&state.db, &payload.token).await
        .map_err(|e| ApiError::Internal(e.into()))?
        .ok_or_else(|| ApiError::BadRequest("Invalid or expired reset token".to_string()))?;

    // Update password
    UserService::update_password(&state.db, user.id, &payload.new_password).await
        .map_err(|e| ApiError::Internal(e.into()))?;

    // Clear reset token
    let _ = UserService::clear_reset_token(&state.db, user.id).await;

    Ok(Json(EmptyResponse::new("Password has been reset successfully")))
}

/// Verify email address
pub async fn verify_email(
    State(state): State<AppState>,
    Json(payload): Json<VerifyEmailRequest>,
) -> Result<Json<EmptyResponse>, ApiError> {
    // Find user by verification token
    let user = UserService::find_by_verification_token(&state.db, &payload.token).await
        .map_err(|e| ApiError::Internal(e.into()))?
        .ok_or_else(|| ApiError::BadRequest("Invalid or expired verification token".to_string()))?;

    // Mark email as verified
    UserService::verify_email(&state.db, user.id).await
        .map_err(|e| ApiError::Internal(e.into()))?;

    Ok(Json(EmptyResponse::new("Email verified successfully")))
}

/// Get current authenticated user
pub async fn get_current_user(
    State(state): State<AppState>,
    Extension(auth_user): Extension<AuthUser>,
) -> ApiResult<UserPublicProfile> {
    // Find user by ID from JWT claims
    let user = UserService::find_by_id(&state.db, auth_user.id).await
        .map_err(|e| ApiError::Internal(e.into()))?
        .ok_or_else(|| ApiError::NotFound("User not found".to_string()))?;

    Ok(Json(crate::handlers::SuccessResponse::new(UserPublicProfile::from(user))))
}

