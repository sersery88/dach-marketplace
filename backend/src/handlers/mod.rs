pub mod admin;
pub mod auth;
pub mod categories;
pub mod clients;
pub mod experts;
pub mod health;
pub mod messages;
pub mod newsletter;
pub mod payments;
pub mod projects;
pub mod reports;
pub mod reviews;
pub mod search;
pub mod services;
pub mod users;

pub mod common {
    pub use super::{ApiError, EmptyResponse, SuccessResponse as ApiResponse};

    impl ApiError {
        pub fn not_found(msg: &str) -> Self {
            ApiError::NotFound(msg.to_string())
        }
        pub fn validation(msg: String) -> Self {
            ApiError::Validation(msg)
        }
        pub fn internal(msg: String) -> Self {
            ApiError::Internal(anyhow::anyhow!(msg))
        }
        pub fn unauthorized(msg: &str) -> Self {
            ApiError::Unauthorized(msg.to_string())
        }
    }

    impl<T: serde::Serialize> ApiResponse<T> {
        pub fn success(data: T) -> Self {
            Self {
                success: true,
                data,
            }
        }
    }
}

use axum::{
    http::StatusCode,
    response::{IntoResponse, Response},
    Json,
};
use serde::Serialize;
use thiserror::Error;

/// API Error types
#[derive(Error, Debug)]
pub enum ApiError {
    #[error("Not found: {0}")]
    NotFound(String),

    #[error("Bad request: {0}")]
    BadRequest(String),

    #[error("Unauthorized: {0}")]
    Unauthorized(String),

    #[error("Forbidden: {0}")]
    Forbidden(String),

    #[error("Conflict: {0}")]
    Conflict(String),

    #[error("Validation error: {0}")]
    Validation(String),

    #[error("Internal server error")]
    Internal(#[from] anyhow::Error),

    #[error("Database error")]
    Database(#[from] sqlx::Error),
}

/// Error response body
#[derive(Serialize)]
pub struct ErrorResponse {
    pub error: String,
    pub message: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub details: Option<Vec<String>>,
}

impl IntoResponse for ApiError {
    fn into_response(self) -> Response {
        let (status, error_type, message) = match &self {
            ApiError::NotFound(msg) => (StatusCode::NOT_FOUND, "not_found", msg.clone()),
            ApiError::BadRequest(msg) => (StatusCode::BAD_REQUEST, "bad_request", msg.clone()),
            ApiError::Unauthorized(msg) => (StatusCode::UNAUTHORIZED, "unauthorized", msg.clone()),
            ApiError::Forbidden(msg) => (StatusCode::FORBIDDEN, "forbidden", msg.clone()),
            ApiError::Conflict(msg) => (StatusCode::CONFLICT, "conflict", msg.clone()),
            ApiError::Validation(msg) => (
                StatusCode::UNPROCESSABLE_ENTITY,
                "validation_error",
                msg.clone(),
            ),
            ApiError::Internal(err) => (
                StatusCode::INTERNAL_SERVER_ERROR,
                "internal_error",
                format!("An internal error occurred: {}", err),
            ),
            ApiError::Database(err) => (
                StatusCode::INTERNAL_SERVER_ERROR,
                "database_error",
                format!("A database error occurred: {}", err),
            ),
        };

        let body = Json(ErrorResponse {
            error: error_type.to_string(),
            message,
            details: None,
        });

        (status, body).into_response()
    }
}

/// Success response wrapper
#[derive(Serialize)]
pub struct SuccessResponse<T: Serialize> {
    pub success: bool,
    pub data: T,
}

impl<T: Serialize> SuccessResponse<T> {
    pub fn new(data: T) -> Self {
        Self {
            success: true,
            data,
        }
    }
}

/// Empty success response
#[derive(Serialize)]
pub struct EmptyResponse {
    pub success: bool,
    pub message: String,
}

impl EmptyResponse {
    pub fn new(message: &str) -> Self {
        Self {
            success: true,
            message: message.to_string(),
        }
    }
}

pub type ApiResult<T> = Result<Json<SuccessResponse<T>>, ApiError>;
