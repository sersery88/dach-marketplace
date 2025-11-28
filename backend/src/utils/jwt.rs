//! JWT token utilities for authentication
use chrono::{Duration, Utc};
use jsonwebtoken::{decode, encode, DecodingKey, EncodingKey, Header, Validation};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

use crate::models::UserRole;

/// JWT Claims structure
#[derive(Debug, Serialize, Deserialize)]
pub struct Claims {
    /// Subject (user ID)
    pub sub: Uuid,
    /// User email
    pub email: String,
    /// User role
    pub role: UserRole,
    /// Expiration time (Unix timestamp)
    pub exp: i64,
    /// Issued at (Unix timestamp)
    pub iat: i64,
    /// Token type (access or refresh)
    pub token_type: TokenType,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "lowercase")]
pub enum TokenType {
    Access,
    Refresh,
}

/// JWT configuration
pub struct JwtConfig {
    pub secret: String,
    pub access_token_expiry: Duration,
    pub refresh_token_expiry: Duration,
}

impl JwtConfig {
    pub fn new(secret: String) -> Self {
        Self {
            secret,
            access_token_expiry: Duration::minutes(15),
            refresh_token_expiry: Duration::days(7),
        }
    }
}

/// Generate an access token
pub fn generate_access_token(
    user_id: Uuid,
    email: &str,
    role: UserRole,
    secret: &str,
) -> Result<String, jsonwebtoken::errors::Error> {
    let now = Utc::now();
    let expiry = now + Duration::minutes(15);

    let claims = Claims {
        sub: user_id,
        email: email.to_string(),
        role,
        exp: expiry.timestamp(),
        iat: now.timestamp(),
        token_type: TokenType::Access,
    };

    encode(
        &Header::default(),
        &claims,
        &EncodingKey::from_secret(secret.as_bytes()),
    )
}

/// Generate a refresh token
pub fn generate_refresh_token(
    user_id: Uuid,
    email: &str,
    role: UserRole,
    secret: &str,
) -> Result<String, jsonwebtoken::errors::Error> {
    let now = Utc::now();
    let expiry = now + Duration::days(7);

    let claims = Claims {
        sub: user_id,
        email: email.to_string(),
        role,
        exp: expiry.timestamp(),
        iat: now.timestamp(),
        token_type: TokenType::Refresh,
    };

    encode(
        &Header::default(),
        &claims,
        &EncodingKey::from_secret(secret.as_bytes()),
    )
}

/// Validate and decode a token
pub fn validate_token(token: &str, secret: &str) -> Result<Claims, jsonwebtoken::errors::Error> {
    let token_data = decode::<Claims>(
        token,
        &DecodingKey::from_secret(secret.as_bytes()),
        &Validation::default(),
    )?;

    Ok(token_data.claims)
}

/// Token pair for auth responses
#[derive(Debug, Serialize)]
pub struct TokenPair {
    pub access_token: String,
    pub refresh_token: String,
    pub token_type: String,
    pub expires_in: i64,
}

/// Generate both access and refresh tokens
pub fn generate_token_pair(
    user_id: Uuid,
    email: &str,
    role: UserRole,
    secret: &str,
) -> Result<TokenPair, jsonwebtoken::errors::Error> {
    let access_token = generate_access_token(user_id, email, role.clone(), secret)?;
    let refresh_token = generate_refresh_token(user_id, email, role, secret)?;

    Ok(TokenPair {
        access_token,
        refresh_token,
        token_type: "Bearer".to_string(),
        expires_in: 900, // 15 minutes in seconds
    })
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_token_generation_and_validation() {
        let user_id = Uuid::new_v4();
        let email = "test@example.com";
        let role = UserRole::Client;
        let secret = "test_secret_key_12345";

        let token = generate_access_token(user_id, email, role.clone(), secret).unwrap();
        let claims = validate_token(&token, secret).unwrap();

        assert_eq!(claims.sub, user_id);
        assert_eq!(claims.email, email);
        assert_eq!(claims.token_type, TokenType::Access);
    }
}

