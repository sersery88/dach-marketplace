use axum::{extract::{Path, State, Query}, Extension, Json};
use uuid::Uuid;
use validator::Validate;

use crate::AppState;
use crate::models::{
    Service, ServicePackage, CreateServiceRequest, ServiceSearchFilters,
    PaginationParams, PaginatedResponse, UserRole,
};
use crate::services::{ServiceService, ExpertService};
use crate::middleware::auth::AuthUser;
use super::{ApiError, ApiResult, SuccessResponse, EmptyResponse};

/// List services with filters
pub async fn list_services(
    State(state): State<AppState>,
    Query(filters): Query<ServiceSearchFilters>,
    Query(pagination): Query<PaginationParams>,
) -> ApiResult<PaginatedResponse<Service>> {
    let (services, total) = ServiceService::search(&state.db, &filters, &pagination).await
        .map_err(|e| ApiError::Internal(e.into()))?;

    Ok(Json(SuccessResponse::new(PaginatedResponse {
        data: services,
        meta: crate::models::PaginationMeta::new(pagination.page, pagination.per_page, total),
    })))
}

/// Create a new service
pub async fn create_service(
    State(state): State<AppState>,
    Extension(auth_user): Extension<AuthUser>,
    Json(payload): Json<CreateServiceRequest>,
) -> ApiResult<Service> {
    // Validate input
    payload.validate().map_err(|e| ApiError::Validation(e.to_string()))?;

    // Get expert profile for this user
    let expert = ExpertService::get_by_user_id(&state.db, auth_user.id).await
        .map_err(|e| ApiError::Internal(e.into()))?
        .ok_or_else(|| ApiError::BadRequest("You must have an expert profile to create services".to_string()))?;

    // Create the service
    let service = ServiceService::create(&state.db, expert.id, payload).await
        .map_err(|e| ApiError::Internal(e.into()))?;

    Ok(Json(SuccessResponse::new(service)))
}

/// Get service by ID
pub async fn get_service(
    State(state): State<AppState>,
    Path(id): Path<Uuid>,
) -> ApiResult<Service> {
    let service = ServiceService::get_by_id(&state.db, id).await
        .map_err(|e| ApiError::Internal(e.into()))?
        .ok_or_else(|| ApiError::NotFound("Service not found".to_string()))?;

    // Increment view count (fire and forget)
    let _ = ServiceService::increment_views(&state.db, id).await;

    Ok(Json(SuccessResponse::new(service)))
}

/// Update service
pub async fn update_service(
    State(state): State<AppState>,
    Extension(auth_user): Extension<AuthUser>,
    Path(id): Path<Uuid>,
    Json(payload): Json<CreateServiceRequest>,
) -> ApiResult<Service> {
    // Validate input
    payload.validate().map_err(|e| ApiError::Validation(e.to_string()))?;

    // Get existing service
    let existing = ServiceService::get_by_id(&state.db, id).await
        .map_err(|e| ApiError::Internal(e.into()))?
        .ok_or_else(|| ApiError::NotFound("Service not found".to_string()))?;

    // Get expert profile
    let expert = ExpertService::get_by_user_id(&state.db, auth_user.id).await
        .map_err(|e| ApiError::Internal(e.into()))?;

    // Check ownership (or admin)
    let is_owner = expert.map(|e| e.id == existing.expert_id).unwrap_or(false);
    if !is_owner && auth_user.role != UserRole::Admin {
        return Err(ApiError::Forbidden("Not authorized to update this service".to_string()));
    }

    // Update the service
    let service = ServiceService::update(&state.db, id, payload).await
        .map_err(|e| ApiError::Internal(e.into()))?;

    Ok(Json(SuccessResponse::new(service)))
}

/// Delete service
pub async fn delete_service(
    State(state): State<AppState>,
    Extension(auth_user): Extension<AuthUser>,
    Path(id): Path<Uuid>,
) -> Result<Json<EmptyResponse>, ApiError> {
    // Get existing service
    let existing = ServiceService::get_by_id(&state.db, id).await
        .map_err(|e| ApiError::Internal(e.into()))?
        .ok_or_else(|| ApiError::NotFound("Service not found".to_string()))?;

    // Get expert profile
    let expert = ExpertService::get_by_user_id(&state.db, auth_user.id).await
        .map_err(|e| ApiError::Internal(e.into()))?;

    // Check ownership (or admin)
    let is_owner = expert.map(|e| e.id == existing.expert_id).unwrap_or(false);
    if !is_owner && auth_user.role != UserRole::Admin {
        return Err(ApiError::Forbidden("Not authorized to delete this service".to_string()));
    }

    // Soft delete the service
    ServiceService::delete(&state.db, id).await
        .map_err(|e| ApiError::Internal(e.into()))?;

    Ok(Json(EmptyResponse::new("Service deleted successfully")))
}

/// Get service packages
pub async fn get_packages(
    State(state): State<AppState>,
    Path(id): Path<Uuid>,
) -> ApiResult<Vec<ServicePackage>> {
    // Verify service exists
    let _service = ServiceService::get_by_id(&state.db, id).await
        .map_err(|e| ApiError::Internal(e.into()))?
        .ok_or_else(|| ApiError::NotFound("Service not found".to_string()))?;

    let packages = ServiceService::get_packages(&state.db, id).await
        .map_err(|e| ApiError::Internal(e.into()))?;

    Ok(Json(SuccessResponse::new(packages)))
}

/// Get featured services
pub async fn get_featured_services(
    State(state): State<AppState>,
) -> ApiResult<Vec<Service>> {
    let services = ServiceService::get_featured(&state.db, 6).await
        .map_err(|e| ApiError::Internal(e.into()))?;

    Ok(Json(SuccessResponse::new(services)))
}

/// Get service by slug
pub async fn get_service_by_slug(
    State(state): State<AppState>,
    Path(slug): Path<String>,
) -> ApiResult<Service> {
    let service = ServiceService::get_by_slug(&state.db, &slug).await
        .map_err(|e| ApiError::Internal(e.into()))?
        .ok_or_else(|| ApiError::NotFound("Service not found".to_string()))?;

    // Increment view count
    let _ = ServiceService::increment_views(&state.db, service.id).await;

    Ok(Json(SuccessResponse::new(service)))
}

