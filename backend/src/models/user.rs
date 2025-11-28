use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use sqlx::FromRow;
use uuid::Uuid;
use validator::{Validate, ValidationError};

use super::{AccountStatus, Country, Currency, Language, UserRole};

/// Validate password strength
/// Requires at least one uppercase, one lowercase, one digit
fn validate_password_strength(password: &str) -> Result<(), ValidationError> {
    let has_uppercase = password.chars().any(|c| c.is_uppercase());
    let has_lowercase = password.chars().any(|c| c.is_lowercase());
    let has_digit = password.chars().any(|c| c.is_ascii_digit());

    if !has_uppercase || !has_lowercase || !has_digit {
        return Err(ValidationError::new("password_weak")
            .with_message("Password must contain uppercase, lowercase, and a digit".into()));
    }

    Ok(())
}

/// User entity - core user account
#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
#[serde(rename_all = "camelCase")]
pub struct User {
    pub id: Uuid,
    pub email: String,
    #[serde(skip_serializing)]
    pub password_hash: String,
    pub first_name: String,
    pub last_name: String,
    pub role: UserRole,
    pub status: AccountStatus,
    pub country: Country,
    pub preferred_currency: Currency,
    pub preferred_language: Language,
    pub avatar_url: Option<String>,
    pub phone: Option<String>,
    pub email_verified: bool,
    pub phone_verified: bool,
    pub two_factor_enabled: bool,
    pub stripe_customer_id: Option<String>,
    pub last_login_at: Option<DateTime<Utc>>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

/// User registration request
#[derive(Debug, Deserialize, Validate)]
#[serde(rename_all = "camelCase")]
pub struct CreateUserRequest {
    #[validate(email(message = "Invalid email address"))]
    pub email: String,

    #[validate(
        length(min = 8, max = 128, message = "Password must be 8-128 characters"),
        custom(function = "validate_password_strength")
    )]
    pub password: String,

    #[validate(length(min = 1, max = 100, message = "First name is required"))]
    pub first_name: String,

    #[validate(length(min = 1, max = 100, message = "Last name is required"))]
    pub last_name: String,

    pub role: UserRole,
    pub country: Country,

    #[serde(default = "default_language")]
    pub preferred_language: Language,
}

fn default_language() -> Language {
    Language::De
}

/// User update request
#[derive(Debug, Deserialize, Validate)]
#[serde(rename_all = "camelCase")]
pub struct UpdateUserRequest {
    #[validate(length(min = 1, max = 100))]
    pub first_name: Option<String>,

    #[validate(length(min = 1, max = 100))]
    pub last_name: Option<String>,

    pub country: Option<Country>,
    pub preferred_currency: Option<Currency>,
    pub preferred_language: Option<Language>,
    pub phone: Option<String>,
}

/// User public profile (safe to expose)
#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct UserPublicProfile {
    pub id: Uuid,
    pub first_name: String,
    pub last_name: String,
    pub avatar_url: Option<String>,
    pub country: Country,
    pub role: UserRole,
    pub created_at: DateTime<Utc>,
}

impl From<User> for UserPublicProfile {
    fn from(user: User) -> Self {
        Self {
            id: user.id,
            first_name: user.first_name,
            last_name: user.last_name,
            avatar_url: user.avatar_url,
            country: user.country,
            role: user.role,
            created_at: user.created_at,
        }
    }
}

/// Login request
#[derive(Debug, Deserialize, Validate)]
pub struct LoginRequest {
    #[validate(email)]
    pub email: String,
    pub password: String,
}

/// Auth response with tokens
#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct AuthResponse {
    pub user: UserPublicProfile,
    pub access_token: String,
    pub refresh_token: String,
    pub token_type: String,
    pub expires_in: i64,
}

/// Password reset request
#[derive(Debug, Deserialize, Validate)]
#[serde(rename_all = "camelCase")]
pub struct PasswordResetRequest {
    #[validate(email)]
    pub email: String,
}

/// Password reset confirmation
#[derive(Debug, Deserialize, Validate)]
#[serde(rename_all = "camelCase")]
pub struct PasswordResetConfirm {
    pub token: String,
    #[validate(length(min = 8))]
    pub new_password: String,
}

/// Refresh token request
#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct RefreshTokenRequest {
    pub refresh_token: String,
}

/// Email verification request
#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct VerifyEmailRequest {
    pub token: String,
}

