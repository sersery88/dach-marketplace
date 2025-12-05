use axum::{extract::{Path, State, Query, Multipart}, Json, Extension};
use uuid::Uuid;
use validator::Validate;

use crate::AppState;
use crate::models::{User, UpdateUserRequest, PaginationParams, PaginatedResponse, PaginationMeta, UserPublicProfile};
use crate::services::UserService;
use crate::middleware::auth::AuthUser;
use super::{ApiError, ApiResult, SuccessResponse, EmptyResponse};

/// Password change request
#[derive(Debug, serde::Deserialize, Validate)]
#[serde(rename_all = "camelCase")]
pub struct ChangePasswordRequest {
    pub current_password: String,
    #[validate(length(min = 8, max = 128, message = "Password must be 8-128 characters"))]
    pub new_password: String,
}

/// Notification preferences
#[derive(Debug, serde::Deserialize, serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct NotificationPreferences {
    pub email_messages: bool,
    pub email_projects: bool,
    pub email_marketing: bool,
    pub push_messages: bool,
    pub push_projects: bool,
}

/// List users (admin only)
pub async fn list_users(
    State(state): State<AppState>,
    Extension(auth_user): Extension<AuthUser>,
    Query(pagination): Query<PaginationParams>,
) -> ApiResult<PaginatedResponse<UserPublicProfile>> {
    // Check admin role
    if auth_user.role.to_string() != "admin" {
        return Err(ApiError::Forbidden("Admin access required".to_string()));
    }

    let page = pagination.page;
    let per_page = pagination.per_page.min(50);
    let offset = (page - 1) * per_page;

    let users: Vec<User> = sqlx::query_as(
        "SELECT * FROM users ORDER BY created_at DESC LIMIT $1 OFFSET $2"
    )
    .bind(per_page as i64)
    .bind(offset as i64)
    .fetch_all(state.db.pool())
    .await
    .map_err(|e| ApiError::Internal(e.into()))?;

    let total: (i64,) = sqlx::query_as("SELECT COUNT(*) FROM users")
        .fetch_one(state.db.pool())
        .await
        .map_err(|e| ApiError::Internal(e.into()))?;

    let profiles: Vec<UserPublicProfile> = users.into_iter().map(UserPublicProfile::from).collect();

    Ok(Json(SuccessResponse::new(PaginatedResponse {
        data: profiles,
        meta: PaginationMeta::new(page, per_page, total.0),
    })))
}

/// Get user by ID
pub async fn get_user(
    State(state): State<AppState>,
    Path(id): Path<Uuid>,
) -> ApiResult<UserPublicProfile> {
    let user = UserService::find_by_id(&state.db, id).await
        .map_err(|e| ApiError::Internal(e.into()))?
        .ok_or_else(|| ApiError::NotFound("User not found".to_string()))?;

    Ok(Json(SuccessResponse::new(UserPublicProfile::from(user))))
}

/// Update user profile
pub async fn update_user(
    State(state): State<AppState>,
    Extension(auth_user): Extension<AuthUser>,
    Path(id): Path<Uuid>,
    Json(payload): Json<UpdateUserRequest>,
) -> ApiResult<UserPublicProfile> {
    // Users can only update their own profile (unless admin)
    if auth_user.id != id && auth_user.role.to_string() != "admin" {
        return Err(ApiError::Forbidden("Cannot update other user's profile".to_string()));
    }

    payload.validate().map_err(|e| ApiError::Validation(e.to_string()))?;

    let user = UserService::update_user(&state.db, id, payload).await
        .map_err(|e| ApiError::Internal(e.into()))?;

    Ok(Json(SuccessResponse::new(UserPublicProfile::from(user))))
}

/// Change password
pub async fn change_password(
    State(state): State<AppState>,
    Extension(auth_user): Extension<AuthUser>,
    Json(payload): Json<ChangePasswordRequest>,
) -> Result<Json<EmptyResponse>, ApiError> {
    payload.validate().map_err(|e| ApiError::Validation(e.to_string()))?;

    // Get current user to verify old password
    let user = UserService::find_by_id(&state.db, auth_user.id).await
        .map_err(|e| ApiError::Internal(e.into()))?
        .ok_or_else(|| ApiError::NotFound("User not found".to_string()))?;

    // Verify current password
    let is_valid = UserService::verify_password(&payload.current_password, &user.password_hash)
        .map_err(|e| ApiError::Internal(anyhow::anyhow!("Password verification failed: {}", e)))?;

    if !is_valid {
        return Err(ApiError::Unauthorized("Current password is incorrect".to_string()));
    }

    // Update password
    UserService::update_password(&state.db, auth_user.id, &payload.new_password).await
        .map_err(|e| ApiError::Internal(e.into()))?;

    // Revoke all other refresh tokens for security
    UserService::revoke_all_refresh_tokens(&state.db, auth_user.id).await
        .map_err(|e| ApiError::Internal(e.into()))?;

    Ok(Json(EmptyResponse::new("Password changed successfully")))
}

/// Get notification preferences
pub async fn get_notifications(
    State(state): State<AppState>,
    Extension(auth_user): Extension<AuthUser>,
) -> ApiResult<NotificationPreferences> {
    // For now, return defaults - can be extended with DB storage later
    let prefs: Option<(bool, bool, bool, bool, bool)> = sqlx::query_as(
        r#"SELECT email_messages, email_projects, email_marketing, push_messages, push_projects
           FROM user_notification_preferences WHERE user_id = $1"#
    )
    .bind(auth_user.id)
    .fetch_optional(state.db.pool())
    .await
    .map_err(|e| ApiError::Internal(e.into()))?;

    let preferences = match prefs {
        Some((em, ep, emkt, pm, pp)) => NotificationPreferences {
            email_messages: em,
            email_projects: ep,
            email_marketing: emkt,
            push_messages: pm,
            push_projects: pp,
        },
        None => NotificationPreferences {
            email_messages: true,
            email_projects: true,
            email_marketing: false,
            push_messages: true,
            push_projects: true,
        },
    };

    Ok(Json(SuccessResponse::new(preferences)))
}

/// Update notification preferences
pub async fn update_notifications(
    State(state): State<AppState>,
    Extension(auth_user): Extension<AuthUser>,
    Json(payload): Json<NotificationPreferences>,
) -> ApiResult<NotificationPreferences> {
    sqlx::query(
        r#"INSERT INTO user_notification_preferences
           (user_id, email_messages, email_projects, email_marketing, push_messages, push_projects, updated_at)
           VALUES ($1, $2, $3, $4, $5, $6, NOW())
           ON CONFLICT (user_id) DO UPDATE SET
           email_messages = $2, email_projects = $3, email_marketing = $4,
           push_messages = $5, push_projects = $6, updated_at = NOW()"#
    )
    .bind(auth_user.id)
    .bind(payload.email_messages)
    .bind(payload.email_projects)
    .bind(payload.email_marketing)
    .bind(payload.push_messages)
    .bind(payload.push_projects)
    .execute(state.db.pool())
    .await
    .map_err(|e| ApiError::Internal(e.into()))?;

    Ok(Json(SuccessResponse::new(payload)))
}

/// Upload user avatar
pub async fn upload_avatar(
    State(state): State<AppState>,
    Extension(auth_user): Extension<AuthUser>,
    Path(id): Path<Uuid>,
    mut multipart: Multipart,
) -> ApiResult<String> {
    // Users can only update their own avatar
    if auth_user.id != id {
        return Err(ApiError::Forbidden("Cannot update other user's avatar".to_string()));
    }

    while let Some(field) = multipart.next_field().await.map_err(|e| ApiError::Validation(e.to_string()))? {
        let name = field.name().unwrap_or("").to_string();
        if name == "avatar" {
            let content_type = field.content_type().unwrap_or("application/octet-stream").to_string();

            // Validate content type
            if !["image/jpeg", "image/png", "image/gif", "image/webp"].contains(&content_type.as_str()) {
                return Err(ApiError::Validation("Invalid image type. Use JPEG, PNG, GIF or WebP".to_string()));
            }

            let data = field.bytes().await.map_err(|e| ApiError::Internal(e.into()))?;

            // Validate file size (max 5MB)
            if data.len() > 5 * 1024 * 1024 {
                return Err(ApiError::Validation("Image too large. Max 5MB allowed".to_string()));
            }

            // Generate filename
            let ext = match content_type.as_str() {
                "image/jpeg" => "jpg",
                "image/png" => "png",
                "image/gif" => "gif",
                "image/webp" => "webp",
                _ => "jpg",
            };
            let _filename = format!("avatars/{}.{}", id, ext);

            // Upload to storage based on configuration
            #[cfg(feature = "storage")]
            {
                use crate::config::StorageSettings;
                use crate::services::StorageService;

                if let StorageSettings::S3 { bucket, region, access_key, secret_key, endpoint } = &state.settings.storage {
                    let storage = StorageService::new(bucket, region, access_key, secret_key, endpoint.as_deref())
                        .map_err(|e| ApiError::Internal(anyhow::anyhow!("Storage init failed: {}", e)))?;

                    let url = storage.upload_avatar(id, data.to_vec(), &content_type).await
                        .map_err(|e| ApiError::Internal(anyhow::anyhow!("Storage upload failed: {}", e)))?;

                    // Update user avatar_url
                    sqlx::query("UPDATE users SET avatar_url = $2, updated_at = NOW() WHERE id = $1")
                        .bind(id)
                        .bind(&url)
                        .execute(state.db.pool())
                        .await
                        .map_err(|e| ApiError::Internal(e.into()))?;

                    return Ok(Json(SuccessResponse::new(url)));
                }
            }

            // Fallback: store as data URL for dev/testing (not recommended for prod)
            {
                use base64::Engine;
                let base64_data = base64::engine::general_purpose::STANDARD.encode(&data);
                let data_url = format!("data:{};base64,{}", content_type, base64_data);

                sqlx::query("UPDATE users SET avatar_url = $2, updated_at = NOW() WHERE id = $1")
                    .bind(id)
                    .bind(&data_url)
                    .execute(state.db.pool())
                    .await
                    .map_err(|e| ApiError::Internal(e.into()))?;

                return Ok(Json(SuccessResponse::new(data_url)));
            }
        }
    }

    Err(ApiError::Validation("No avatar file provided".to_string()))
}

