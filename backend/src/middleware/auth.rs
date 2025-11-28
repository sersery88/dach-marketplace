use axum::{
    extract::{Request, State},
    http::{header, StatusCode},
    middleware::Next,
    response::Response,
};
use jsonwebtoken::{decode, DecodingKey, Validation, Algorithm};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

use crate::AppState;
use crate::models::UserRole;

/// JWT Claims structure
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Claims {
    pub sub: Uuid,          // User ID
    pub email: String,
    pub role: UserRole,
    pub exp: i64,           // Expiration time
    pub iat: i64,           // Issued at
}

/// Authenticated user extracted from JWT
#[derive(Debug, Clone)]
pub struct AuthUser {
    pub id: Uuid,
    pub email: String,
    pub role: UserRole,
}

impl From<Claims> for AuthUser {
    fn from(claims: Claims) -> Self {
        Self {
            id: claims.sub,
            email: claims.email,
            role: claims.role,
        }
    }
}

/// Authentication middleware
pub async fn auth_middleware(
    State(state): State<AppState>,
    mut request: Request,
    next: Next,
) -> Result<Response, StatusCode> {
    // Extract token from Authorization header
    let auth_header = request
        .headers()
        .get(header::AUTHORIZATION)
        .and_then(|h| h.to_str().ok())
        .and_then(|h| h.strip_prefix("Bearer "));

    let token = match auth_header {
        Some(t) => t,
        None => return Err(StatusCode::UNAUTHORIZED),
    };

    // Decode and validate JWT
    let claims = decode::<Claims>(
        token,
        &DecodingKey::from_secret(state.settings.jwt.secret.as_bytes()),
        &Validation::new(Algorithm::HS256),
    )
    .map_err(|_| StatusCode::UNAUTHORIZED)?
    .claims;

    // Check if token is expired
    let now = chrono::Utc::now().timestamp();
    if claims.exp < now {
        return Err(StatusCode::UNAUTHORIZED);
    }

    // Insert authenticated user into request extensions
    request.extensions_mut().insert(AuthUser::from(claims));

    Ok(next.run(request).await)
}

/// Admin-only middleware (must be used after auth_middleware)
pub async fn admin_middleware(
    request: Request,
    next: Next,
) -> Result<Response, StatusCode> {
    // Get auth user from extensions (set by auth_middleware)
    let auth_user = request
        .extensions()
        .get::<AuthUser>()
        .ok_or(StatusCode::UNAUTHORIZED)?;

    // Check if user is admin
    if auth_user.role != UserRole::Admin {
        return Err(StatusCode::FORBIDDEN);
    }

    Ok(next.run(request).await)
}

/// Expert-only middleware (must be used after auth_middleware)
pub async fn expert_middleware(
    request: Request,
    next: Next,
) -> Result<Response, StatusCode> {
    let auth_user = request
        .extensions()
        .get::<AuthUser>()
        .ok_or(StatusCode::UNAUTHORIZED)?;

    if auth_user.role != UserRole::Expert && auth_user.role != UserRole::Admin {
        return Err(StatusCode::FORBIDDEN);
    }

    Ok(next.run(request).await)
}

/// Generate JWT tokens
pub fn generate_tokens(
    user_id: Uuid,
    email: &str,
    role: UserRole,
    secret: &str,
    access_expiry: i64,
    refresh_expiry: i64,
) -> Result<(String, String), jsonwebtoken::errors::Error> {
    let now = chrono::Utc::now().timestamp();

    // Access token
    let access_claims = Claims {
        sub: user_id,
        email: email.to_string(),
        role: role.clone(),
        exp: now + access_expiry,
        iat: now,
    };

    let access_token = jsonwebtoken::encode(
        &jsonwebtoken::Header::default(),
        &access_claims,
        &jsonwebtoken::EncodingKey::from_secret(secret.as_bytes()),
    )?;

    // Refresh token (longer expiry)
    let refresh_claims = Claims {
        sub: user_id,
        email: email.to_string(),
        role,
        exp: now + refresh_expiry,
        iat: now,
    };

    let refresh_token = jsonwebtoken::encode(
        &jsonwebtoken::Header::default(),
        &refresh_claims,
        &jsonwebtoken::EncodingKey::from_secret(secret.as_bytes()),
    )?;

    Ok((access_token, refresh_token))
}

