use axum::{extract::{Path, State, Query}, Extension, Json};
use uuid::Uuid;
use validator::Validate;

use crate::AppState;
use crate::models::{
    ExpertProfile, CreateExpertProfileRequest, UpdateExpertProfileRequest,
    ExpertSearchFilters, PaginationParams, PaginatedResponse, Service, Review, UserRole,
};
use crate::services::{ExpertService, ServiceService, ReviewService};
use crate::middleware::auth::AuthUser;
use super::{ApiError, ApiResult, SuccessResponse, EmptyResponse};

/// List experts with filters
pub async fn list_experts(
    State(state): State<AppState>,
    Query(filters): Query<ExpertSearchFilters>,
    Query(pagination): Query<PaginationParams>,
) -> ApiResult<PaginatedResponse<ExpertProfile>> {
    let (experts, total) = ExpertService::search(&state.db, &filters, &pagination).await
        .map_err(|e| ApiError::Internal(e.into()))?;

    Ok(Json(SuccessResponse::new(PaginatedResponse {
        data: experts,
        meta: crate::models::PaginationMeta::new(pagination.page, pagination.per_page, total),
    })))
}

/// Create expert profile
pub async fn create_profile(
    State(state): State<AppState>,
    Extension(auth_user): Extension<AuthUser>,
    Json(payload): Json<CreateExpertProfileRequest>,
) -> ApiResult<ExpertProfile> {
    // Validate input
    payload.validate().map_err(|e| ApiError::Validation(e.to_string()))?;

    // Check if user already has an expert profile
    let existing = ExpertService::get_by_user_id(&state.db, auth_user.id).await
        .map_err(|e| ApiError::Internal(e.into()))?;

    if existing.is_some() {
        return Err(ApiError::BadRequest("Expert profile already exists".to_string()));
    }

    // Create the profile
    let profile = ExpertService::create_profile(&state.db, auth_user.id, payload).await
        .map_err(|e| ApiError::Internal(e.into()))?;

    Ok(Json(SuccessResponse::new(profile)))
}

/// Get expert by ID
pub async fn get_expert(
    State(state): State<AppState>,
    Path(id): Path<Uuid>,
) -> ApiResult<ExpertProfile> {
    let profile = ExpertService::get_by_id(&state.db, id).await
        .map_err(|e| ApiError::Internal(e.into()))?
        .ok_or_else(|| ApiError::NotFound("Expert not found".to_string()))?;

    Ok(Json(SuccessResponse::new(profile)))
}

/// Update expert profile
pub async fn update_profile(
    State(state): State<AppState>,
    Extension(auth_user): Extension<AuthUser>,
    Path(id): Path<Uuid>,
    Json(payload): Json<UpdateExpertProfileRequest>,
) -> ApiResult<ExpertProfile> {
    // Validate input
    payload.validate().map_err(|e| ApiError::Validation(e.to_string()))?;

    // Get existing profile
    let existing = ExpertService::get_by_id(&state.db, id).await
        .map_err(|e| ApiError::Internal(e.into()))?
        .ok_or_else(|| ApiError::NotFound("Expert not found".to_string()))?;

    // Check ownership (or admin)
    if existing.user_id != auth_user.id && auth_user.role != UserRole::Admin {
        return Err(ApiError::Forbidden("Not authorized to update this profile".to_string()));
    }

    // Update the profile
    let profile = ExpertService::update_profile(&state.db, id, payload).await
        .map_err(|e| ApiError::Internal(e.into()))?;

    Ok(Json(SuccessResponse::new(profile)))
}

/// Get expert's services
pub async fn get_expert_services(
    State(state): State<AppState>,
    Path(id): Path<Uuid>,
    Query(pagination): Query<PaginationParams>,
) -> ApiResult<PaginatedResponse<Service>> {
    let (services, total) = ServiceService::get_by_expert(&state.db, id, pagination.page, pagination.per_page).await
        .map_err(|e| ApiError::Internal(e.into()))?;

    Ok(Json(SuccessResponse::new(PaginatedResponse {
        data: services,
        meta: crate::models::PaginationMeta::new(pagination.page, pagination.per_page, total),
    })))
}

/// Get expert's reviews
pub async fn get_expert_reviews(
    State(state): State<AppState>,
    Path(id): Path<Uuid>,
    Query(pagination): Query<PaginationParams>,
) -> ApiResult<PaginatedResponse<Review>> {
    let (reviews, total) = ReviewService::get_by_expert(state.db.pool(), id, pagination.page, pagination.per_page).await
        .map_err(|e| ApiError::Internal(e.into()))?;

    Ok(Json(SuccessResponse::new(PaginatedResponse {
        data: reviews,
        meta: crate::models::PaginationMeta::new(pagination.page, pagination.per_page, total),
    })))
}

/// Get expert's portfolio items
pub async fn get_portfolio(
    State(state): State<AppState>,
    Path(id): Path<Uuid>,
) -> ApiResult<Vec<crate::models::PortfolioItem>> {
    use crate::services::PortfolioService;

    let items = PortfolioService::get_by_expert(&state.db, id).await
        .map_err(|e| ApiError::Internal(e.into()))?;

    Ok(Json(SuccessResponse::new(items)))
}

/// Get featured experts
pub async fn get_featured_experts(
    State(state): State<AppState>,
) -> ApiResult<Vec<ExpertProfile>> {
    let experts = ExpertService::get_featured(&state.db, 6).await
        .map_err(|e| ApiError::Internal(e.into()))?;

    Ok(Json(SuccessResponse::new(experts)))
}

/// Get current user's expert profile
pub async fn get_my_profile(
    State(state): State<AppState>,
    Extension(auth_user): Extension<AuthUser>,
) -> ApiResult<ExpertProfile> {
    let profile = ExpertService::get_by_user_id(&state.db, auth_user.id).await
        .map_err(|e| ApiError::Internal(e.into()))?
        .ok_or_else(|| ApiError::NotFound("Expert profile not found".to_string()))?;

    Ok(Json(SuccessResponse::new(profile)))
}

/// Create a portfolio item
pub async fn create_portfolio_item(
    State(state): State<AppState>,
    Extension(auth_user): Extension<AuthUser>,
    Json(payload): Json<crate::models::CreatePortfolioItemRequest>,
) -> ApiResult<crate::models::PortfolioItem> {
    use crate::services::PortfolioService;
    use validator::Validate;

    payload.validate().map_err(|e| ApiError::Validation(e.to_string()))?;

    // Get expert profile
    let expert = ExpertService::get_by_user_id(&state.db, auth_user.id).await
        .map_err(|e| ApiError::Internal(e.into()))?
        .ok_or_else(|| ApiError::BadRequest("You must have an expert profile".to_string()))?;

    let item = PortfolioService::create(&state.db, expert.id, payload).await
        .map_err(|e| ApiError::Internal(e.into()))?;

    Ok(Json(SuccessResponse::new(item)))
}

/// Update a portfolio item
pub async fn update_portfolio_item(
    State(state): State<AppState>,
    Extension(auth_user): Extension<AuthUser>,
    Path(id): Path<Uuid>,
    Json(payload): Json<crate::models::UpdatePortfolioItemRequest>,
) -> ApiResult<crate::models::PortfolioItem> {
    use crate::services::PortfolioService;
    use validator::Validate;

    payload.validate().map_err(|e| ApiError::Validation(e.to_string()))?;

    // Get existing item
    let existing = PortfolioService::get_by_id(&state.db, id).await
        .map_err(|e| ApiError::Internal(e.into()))?
        .ok_or_else(|| ApiError::NotFound("Portfolio item not found".to_string()))?;

    // Check ownership
    let expert = ExpertService::get_by_user_id(&state.db, auth_user.id).await
        .map_err(|e| ApiError::Internal(e.into()))?;

    let is_owner = expert.map(|e| e.id == existing.expert_id).unwrap_or(false);
    if !is_owner && auth_user.role != crate::models::UserRole::Admin {
        return Err(ApiError::Forbidden("Not authorized".to_string()));
    }

    let item = PortfolioService::update(&state.db, id, payload).await
        .map_err(|e| ApiError::Internal(e.into()))?;

    Ok(Json(SuccessResponse::new(item)))
}

/// Delete a portfolio item
pub async fn delete_portfolio_item(
    State(state): State<AppState>,
    Extension(auth_user): Extension<AuthUser>,
    Path(id): Path<Uuid>,
) -> Result<Json<EmptyResponse>, ApiError> {
    use crate::services::PortfolioService;

    // Get existing item
    let existing = PortfolioService::get_by_id(&state.db, id).await
        .map_err(|e| ApiError::Internal(e.into()))?
        .ok_or_else(|| ApiError::NotFound("Portfolio item not found".to_string()))?;

    // Check ownership
    let expert = ExpertService::get_by_user_id(&state.db, auth_user.id).await
        .map_err(|e| ApiError::Internal(e.into()))?;

    let is_owner = expert.map(|e| e.id == existing.expert_id).unwrap_or(false);
    if !is_owner && auth_user.role != crate::models::UserRole::Admin {
        return Err(ApiError::Forbidden("Not authorized".to_string()));
    }

    PortfolioService::delete(&state.db, id).await
        .map_err(|e| ApiError::Internal(e.into()))?;

    Ok(Json(EmptyResponse::new("Portfolio item deleted")))
}

/// Get expert's availability
pub async fn get_availability(
    State(state): State<AppState>,
    Path(id): Path<Uuid>,
) -> ApiResult<crate::models::ExpertAvailability> {
    use crate::services::AvailabilityService;

    let availability = AvailabilityService::get_availability(&state.db, id).await
        .map_err(|e| ApiError::Internal(e.into()))?;

    Ok(Json(SuccessResponse::new(availability)))
}

/// Set expert's weekly availability
pub async fn set_availability(
    State(state): State<AppState>,
    Extension(auth_user): Extension<AuthUser>,
    Json(payload): Json<crate::models::SetAvailabilityRequest>,
) -> ApiResult<Vec<crate::models::AvailabilitySlot>> {
    use crate::services::AvailabilityService;

    // Get expert profile
    let expert = ExpertService::get_by_user_id(&state.db, auth_user.id).await
        .map_err(|e| ApiError::Internal(e.into()))?
        .ok_or_else(|| ApiError::BadRequest("You must have an expert profile".to_string()))?;

    let slots = AvailabilityService::set_availability(&state.db, expert.id, payload).await
        .map_err(|e| ApiError::Internal(e.into()))?;

    Ok(Json(SuccessResponse::new(slots)))
}

/// Block dates (vacation, etc.)
pub async fn block_dates(
    State(state): State<AppState>,
    Extension(auth_user): Extension<AuthUser>,
    Json(payload): Json<crate::models::BlockDatesRequest>,
) -> ApiResult<crate::models::BlockedDate> {
    use crate::services::AvailabilityService;
    use validator::Validate;

    payload.validate().map_err(|e| ApiError::Validation(e.to_string()))?;

    // Get expert profile
    let expert = ExpertService::get_by_user_id(&state.db, auth_user.id).await
        .map_err(|e| ApiError::Internal(e.into()))?
        .ok_or_else(|| ApiError::BadRequest("You must have an expert profile".to_string()))?;

    let blocked = AvailabilityService::block_dates(&state.db, expert.id, payload).await
        .map_err(|e| ApiError::Internal(e.into()))?;

    Ok(Json(SuccessResponse::new(blocked)))
}

/// Unblock dates
pub async fn unblock_dates(
    State(state): State<AppState>,
    Extension(auth_user): Extension<AuthUser>,
    Path(id): Path<Uuid>,
) -> Result<Json<EmptyResponse>, ApiError> {
    use crate::services::AvailabilityService;

    // Get expert profile (for authorization)
    let _expert = ExpertService::get_by_user_id(&state.db, auth_user.id).await
        .map_err(|e| ApiError::Internal(e.into()))?
        .ok_or_else(|| ApiError::BadRequest("You must have an expert profile".to_string()))?;

    AvailabilityService::unblock_dates(&state.db, id).await
        .map_err(|e| ApiError::Internal(e.into()))?;

    Ok(Json(EmptyResponse::new("Dates unblocked")))
}

