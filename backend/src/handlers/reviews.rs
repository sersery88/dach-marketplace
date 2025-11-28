use axum::{extract::{Path, State, Query}, Extension, Json};
use uuid::Uuid;

use crate::AppState;
use crate::middleware::auth::AuthUser;
use crate::models::{
    Review, ReviewWithReviewer, CreateReviewRequest, ReviewResponseRequest, ReviewSummary,
    ReviewFilters, PaginationParams, PaginatedResponse, PaginationMeta,
};
use crate::services::ReviewService;
use super::{ApiError, ApiResult, SuccessResponse, EmptyResponse};

/// List reviews with filters
pub async fn list_reviews(
    State(state): State<AppState>,
    Query(filters): Query<ReviewFilters>,
    Query(pagination): Query<PaginationParams>,
) -> ApiResult<PaginatedResponse<ReviewWithReviewer>> {
    let page = pagination.page;
    let per_page = pagination.per_page.min(50);

    let (reviews, total) = ReviewService::list(
        state.db.pool(),
        &filters,
        page,
        per_page,
    )
    .await
    .map_err(|e| ApiError::Internal(e.into()))?;

    Ok(Json(SuccessResponse {
        success: true,
        data: PaginatedResponse {
            data: reviews,
            meta: PaginationMeta::new(page, per_page, total),
        },
    }))
}

/// Create a review
pub async fn create_review(
    State(state): State<AppState>,
    Extension(auth_user): Extension<AuthUser>,
    Json(payload): Json<CreateReviewRequest>,
) -> ApiResult<Review> {
    let review = ReviewService::create(
        state.db.pool(),
        auth_user.id,
        payload,
    )
    .await
    .map_err(|e| ApiError::Internal(e.into()))?;

    Ok(Json(SuccessResponse {
        success: true,
        data: review,
    }))
}

/// Get review by ID
pub async fn get_review(
    State(state): State<AppState>,
    Path(id): Path<Uuid>,
) -> ApiResult<ReviewWithReviewer> {
    let review = ReviewService::get_with_reviewer(state.db.pool(), id)
        .await
        .map_err(|e| ApiError::Internal(e.into()))?
        .ok_or_else(|| ApiError::NotFound("Review not found".into()))?;

    Ok(Json(SuccessResponse {
        success: true,
        data: review,
    }))
}

/// Get review summary for an expert
pub async fn get_review_summary(
    State(state): State<AppState>,
    Path(expert_id): Path<Uuid>,
) -> ApiResult<ReviewSummary> {
    let summary = ReviewService::get_summary(state.db.pool(), expert_id)
        .await
        .map_err(|e| ApiError::Internal(e.into()))?;

    Ok(Json(SuccessResponse {
        success: true,
        data: summary,
    }))
}

/// Respond to a review (expert only)
pub async fn respond_to_review(
    State(state): State<AppState>,
    Extension(auth_user): Extension<AuthUser>,
    Path(id): Path<Uuid>,
    Json(payload): Json<ReviewResponseRequest>,
) -> ApiResult<Review> {
    let review = ReviewService::add_response(
        state.db.pool(),
        id,
        auth_user.id,
        &payload.response,
    )
    .await
    .map_err(|e| match e {
        sqlx::Error::RowNotFound => ApiError::NotFound("Review not found or you don't have permission".into()),
        _ => ApiError::Internal(e.into()),
    })?;

    Ok(Json(SuccessResponse {
        success: true,
        data: review,
    }))
}

/// Mark review as helpful
pub async fn mark_helpful(
    State(state): State<AppState>,
    Path(id): Path<Uuid>,
) -> Result<Json<EmptyResponse>, ApiError> {
    ReviewService::mark_helpful(state.db.pool(), id)
        .await
        .map_err(|e| ApiError::Internal(e.into()))?;

    Ok(Json(EmptyResponse::new("Review marked as helpful")))
}

