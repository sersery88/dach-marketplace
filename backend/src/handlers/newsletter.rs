//! Newsletter handlers

use axum::{
    extract::{State},
    Json,
};
use serde::{Deserialize, Serialize};
use validator::Validate;

use crate::{
    AppState,
    handlers::{ApiError, ApiResult, SuccessResponse},
};

#[derive(Debug, Deserialize, Validate)]
pub struct SubscribeRequest {
    #[validate(email(message = "Invalid email format"))]
    pub email: String,
}

#[derive(Debug, Serialize)]
pub struct SubscribeResponse {
    pub message: String,
}

/// Subscribe to newsletter
pub async fn subscribe(
    State(state): State<AppState>,
    Json(req): Json<SubscribeRequest>,
) -> ApiResult<SubscribeResponse> {
    // Validate request
    if let Err(e) = req.validate() {
        return Err(ApiError::Validation(e.to_string()));
    }

    let email = req.email.to_lowercase();

    // Check if already subscribed
    let existing: Option<(bool,)> = sqlx::query_as(
        "SELECT is_active FROM newsletter_subscriptions WHERE email = $1"
    )
    .bind(&email)
    .fetch_optional(state.db.pool())
    .await
    .map_err(|e| ApiError::Internal(e.into()))?;

    if let Some((is_active,)) = existing {
        if is_active {
            return Ok(Json(SuccessResponse::new(SubscribeResponse {
                message: "Already subscribed".to_string(),
            })));
        } else {
            // Re-subscribe
            sqlx::query(
                "UPDATE newsletter_subscriptions SET is_active = TRUE, unsubscribed_at = NULL WHERE email = $1"
            )
            .bind(&email)
            .execute(state.db.pool())
            .await
            .map_err(|e| ApiError::Internal(e.into()))?;
        }
    } else {
        // New subscription
        sqlx::query(
            "INSERT INTO newsletter_subscriptions (email, source) VALUES ($1, 'website_footer')"
        )
        .bind(&email)
        .execute(state.db.pool())
        .await
        .map_err(|e| ApiError::Internal(e.into()))?;
    }

    // Send welcome email (fire and forget)
    #[cfg(feature = "email")]
    {
        if let Some(email_service) = &state.email {
            let _ = email_service.send_newsletter_welcome(&email).await;
        }
    }

    Ok(Json(SuccessResponse::new(SubscribeResponse {
        message: "Successfully subscribed".to_string(),
    })))
}
