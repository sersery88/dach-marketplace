//! User service for authentication and user management
use argon2::{
    password_hash::{rand_core::OsRng, PasswordHash, PasswordHasher, PasswordVerifier, SaltString},
    Argon2,
};
use chrono::{DateTime, Duration, Utc};
use sha2::{Sha256, Digest};
use uuid::Uuid;

use crate::db::Database;
use crate::models::{User, CreateUserRequest, UpdateUserRequest, AccountStatus, Currency};

pub struct UserService;

impl UserService {
    /// Hash password using Argon2
    pub fn hash_password(password: &str) -> Result<String, argon2::password_hash::Error> {
        let salt = SaltString::generate(&mut OsRng);
        let argon2 = Argon2::default();
        let hash = argon2.hash_password(password.as_bytes(), &salt)?;
        Ok(hash.to_string())
    }

    /// Verify password against hash
    pub fn verify_password(password: &str, hash: &str) -> Result<bool, argon2::password_hash::Error> {
        let parsed_hash = PasswordHash::new(hash)?;
        Ok(Argon2::default()
            .verify_password(password.as_bytes(), &parsed_hash)
            .is_ok())
    }

    /// Create a new user
    pub async fn create_user(db: &Database, req: CreateUserRequest) -> Result<User, sqlx::Error> {
        let password_hash = Self::hash_password(&req.password)
            .map_err(|e| sqlx::Error::Protocol(e.to_string()))?;

        let user: User = sqlx::query_as(
            r#"
            INSERT INTO users (
                id, email, password_hash, first_name, last_name, role, status,
                country, preferred_currency, preferred_language, email_verified,
                phone_verified, two_factor_enabled, created_at, updated_at
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, false, false, false, NOW(), NOW())
            RETURNING *
            "#,
        )
        .bind(Uuid::new_v4())
        .bind(req.email.to_lowercase())
        .bind(password_hash)
        .bind(&req.first_name)
        .bind(&req.last_name)
        .bind(&req.role)
        .bind(AccountStatus::Pending)
        .bind(&req.country)
        .bind(Currency::CHF)
        .bind(&req.preferred_language)
        .fetch_one(&db.pool)
        .await?;

        Ok(user)
    }

    /// Find user by email
    pub async fn find_by_email(db: &Database, email: &str) -> Result<Option<User>, sqlx::Error> {
        let user: Option<User> = sqlx::query_as("SELECT * FROM users WHERE email = $1")
            .bind(email.to_lowercase())
            .fetch_optional(&db.pool)
            .await?;

        Ok(user)
    }

    /// Find user by ID
    pub async fn find_by_id(db: &Database, id: Uuid) -> Result<Option<User>, sqlx::Error> {
        let user: Option<User> = sqlx::query_as("SELECT * FROM users WHERE id = $1")
            .bind(id)
            .fetch_optional(&db.pool)
            .await?;

        Ok(user)
    }

    /// Update user
    pub async fn update_user(
        db: &Database,
        id: Uuid,
        req: UpdateUserRequest,
    ) -> Result<User, sqlx::Error> {
        let user: User = sqlx::query_as(
            r#"
            UPDATE users SET
                first_name = COALESCE($2, first_name),
                last_name = COALESCE($3, last_name),
                country = COALESCE($4, country),
                preferred_currency = COALESCE($5, preferred_currency),
                preferred_language = COALESCE($6, preferred_language),
                phone = COALESCE($7, phone),
                updated_at = NOW()
            WHERE id = $1
            RETURNING *
            "#,
        )
        .bind(id)
        .bind(&req.first_name)
        .bind(&req.last_name)
        .bind(&req.country)
        .bind(&req.preferred_currency)
        .bind(&req.preferred_language)
        .bind(&req.phone)
        .fetch_one(&db.pool)
        .await?;

        Ok(user)
    }

    /// Update last login timestamp
    pub async fn update_last_login(db: &Database, id: Uuid) -> Result<(), sqlx::Error> {
        sqlx::query("UPDATE users SET last_login_at = NOW() WHERE id = $1")
            .bind(id)
            .execute(&db.pool)
            .await?;

        Ok(())
    }

    /// Verify email
    pub async fn verify_email(db: &Database, id: Uuid) -> Result<(), sqlx::Error> {
        sqlx::query("UPDATE users SET email_verified = true, status = 'active', verification_token = NULL, updated_at = NOW() WHERE id = $1")
            .bind(id)
            .execute(&db.pool)
            .await?;

        Ok(())
    }

    /// Store password reset token
    pub async fn store_reset_token(db: &Database, id: Uuid, token: &str) -> Result<(), sqlx::Error> {
        sqlx::query(
            "UPDATE users SET reset_token = $2, reset_token_expires = NOW() + INTERVAL '1 hour', updated_at = NOW() WHERE id = $1"
        )
            .bind(id)
            .bind(token)
            .execute(&db.pool)
            .await?;

        Ok(())
    }

    /// Find user by reset token (only if not expired)
    pub async fn find_by_reset_token(db: &Database, token: &str) -> Result<Option<User>, sqlx::Error> {
        let user: Option<User> = sqlx::query_as(
            "SELECT * FROM users WHERE reset_token = $1 AND reset_token_expires > NOW()"
        )
            .bind(token)
            .fetch_optional(&db.pool)
            .await?;

        Ok(user)
    }

    /// Clear reset token
    pub async fn clear_reset_token(db: &Database, id: Uuid) -> Result<(), sqlx::Error> {
        sqlx::query("UPDATE users SET reset_token = NULL, reset_token_expires = NULL, updated_at = NOW() WHERE id = $1")
            .bind(id)
            .execute(&db.pool)
            .await?;

        Ok(())
    }

    /// Update password
    pub async fn update_password(db: &Database, id: Uuid, new_password: &str) -> Result<(), sqlx::Error> {
        let password_hash = Self::hash_password(new_password)
            .map_err(|e| sqlx::Error::Protocol(e.to_string()))?;

        sqlx::query("UPDATE users SET password_hash = $2, reset_token = NULL, reset_token_expires = NULL, updated_at = NOW() WHERE id = $1")
            .bind(id)
            .bind(password_hash)
            .execute(&db.pool)
            .await?;

        Ok(())
    }

    /// Find user by verification token
    pub async fn find_by_verification_token(db: &Database, token: &str) -> Result<Option<User>, sqlx::Error> {
        let user: Option<User> = sqlx::query_as(
            "SELECT * FROM users WHERE verification_token = $1"
        )
            .bind(token)
            .fetch_optional(&db.pool)
            .await?;

        Ok(user)
    }

    /// Store verification token
    pub async fn store_verification_token(db: &Database, id: Uuid, token: &str) -> Result<(), sqlx::Error> {
        sqlx::query("UPDATE users SET verification_token = $2, updated_at = NOW() WHERE id = $1")
            .bind(id)
            .bind(token)
            .execute(&db.pool)
            .await?;

        Ok(())
    }

    // ==================== Refresh Token Management ====================

    /// Hash a refresh token for secure storage
    fn hash_refresh_token(token: &str) -> String {
        let mut hasher = Sha256::new();
        hasher.update(token.as_bytes());
        format!("{:x}", hasher.finalize())
    }

    /// Store a refresh token in the database
    pub async fn store_refresh_token(
        db: &Database,
        user_id: Uuid,
        refresh_token: &str,
        expires_at: DateTime<Utc>,
    ) -> Result<Uuid, sqlx::Error> {
        let token_hash = Self::hash_refresh_token(refresh_token);

        let result: (Uuid,) = sqlx::query_as(
            r#"
            INSERT INTO refresh_tokens (id, user_id, token_hash, expires_at, created_at)
            VALUES ($1, $2, $3, $4, NOW())
            RETURNING id
            "#,
        )
        .bind(Uuid::new_v4())
        .bind(user_id)
        .bind(&token_hash)
        .bind(expires_at)
        .fetch_one(&db.pool)
        .await?;

        Ok(result.0)
    }

    /// Validate a refresh token (check if it exists and is not revoked/expired)
    pub async fn validate_refresh_token(
        db: &Database,
        refresh_token: &str,
    ) -> Result<bool, sqlx::Error> {
        let token_hash = Self::hash_refresh_token(refresh_token);

        let result: Option<(i64,)> = sqlx::query_as(
            r#"
            SELECT 1 FROM refresh_tokens
            WHERE token_hash = $1
              AND expires_at > NOW()
              AND revoked_at IS NULL
            "#,
        )
        .bind(&token_hash)
        .fetch_optional(&db.pool)
        .await?;

        Ok(result.is_some())
    }

    /// Revoke a specific refresh token
    pub async fn revoke_refresh_token(
        db: &Database,
        refresh_token: &str,
    ) -> Result<bool, sqlx::Error> {
        let token_hash = Self::hash_refresh_token(refresh_token);

        let result = sqlx::query(
            "UPDATE refresh_tokens SET revoked_at = NOW() WHERE token_hash = $1 AND revoked_at IS NULL"
        )
        .bind(&token_hash)
        .execute(&db.pool)
        .await?;

        Ok(result.rows_affected() > 0)
    }

    /// Revoke all refresh tokens for a user (e.g., on password change or logout from all devices)
    pub async fn revoke_all_refresh_tokens(
        db: &Database,
        user_id: Uuid,
    ) -> Result<u64, sqlx::Error> {
        let result = sqlx::query(
            "UPDATE refresh_tokens SET revoked_at = NOW() WHERE user_id = $1 AND revoked_at IS NULL"
        )
        .bind(user_id)
        .execute(&db.pool)
        .await?;

        Ok(result.rows_affected())
    }

    /// Clean up expired refresh tokens (can be run periodically)
    pub async fn cleanup_expired_tokens(db: &Database) -> Result<u64, sqlx::Error> {
        let result = sqlx::query(
            "DELETE FROM refresh_tokens WHERE expires_at < NOW() OR revoked_at IS NOT NULL"
        )
        .execute(&db.pool)
        .await?;

        Ok(result.rows_affected())
    }
}
