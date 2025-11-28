use axum::{extract::{Path, State, Query}, Json};
use uuid::Uuid;

use crate::AppState;
use crate::models::{User, UpdateUserRequest, PaginationParams, PaginatedResponse, UserPublicProfile};
use super::{ApiError, ApiResult, SuccessResponse};

/// List users (admin only)
pub async fn list_users(
    State(state): State<AppState>,
    Query(pagination): Query<PaginationParams>,
) -> ApiResult<PaginatedResponse<UserPublicProfile>> {
    Err(ApiError::Internal(anyhow::anyhow!("Not implemented yet")))
}

/// Get user by ID
pub async fn get_user(
    State(state): State<AppState>,
    Path(id): Path<Uuid>,
) -> ApiResult<UserPublicProfile> {
    Err(ApiError::Internal(anyhow::anyhow!("Not implemented yet")))
}

/// Update user profile
pub async fn update_user(
    State(state): State<AppState>,
    Path(id): Path<Uuid>,
    Json(payload): Json<UpdateUserRequest>,
) -> ApiResult<UserPublicProfile> {
    Err(ApiError::Internal(anyhow::anyhow!("Not implemented yet")))
}

/// Upload user avatar
pub async fn upload_avatar(
    State(state): State<AppState>,
    Path(id): Path<Uuid>,
) -> ApiResult<String> {
    Err(ApiError::Internal(anyhow::anyhow!("Not implemented yet")))
}

