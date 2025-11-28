use axum::{extract::{Path, Query, State}, http::StatusCode, Json, Extension};
use uuid::Uuid;
use validator::Validate;

use crate::{
    AppState,
    middleware::AuthUser,
    models::{
        ClientProfile, CreateClientProfileRequest, UpdateClientProfileRequest,
        ProjectPosting, CreateProjectPostingRequest, UpdateProjectPostingRequest,
        ProjectPostingFilters, PaginationParams, PaginatedResponse,
        BookingRequest, CreateBookingRequest, RespondBookingRequest,
        Proposal, CreateProposalRequest,
    },
    services::ClientService,
};

use super::common::{ApiResponse, ApiError, EmptyResponse};

// ==================== Client Profile Handlers ====================

pub async fn get_my_profile(
    State(state): State<AppState>,
    Extension(user): Extension<AuthUser>,
) -> Result<Json<ApiResponse<ClientProfile>>, ApiError> {
    let profile = ClientService::get_profile_by_user(state.db.pool(), user.id).await
        .map_err(|e| ApiError::internal(e.to_string()))?
        .ok_or_else(|| ApiError::not_found("Client profile not found"))?;

    Ok(Json(ApiResponse::success(profile)))
}

pub async fn create_profile(
    State(state): State<AppState>,
    Extension(user): Extension<AuthUser>,
    Json(req): Json<CreateClientProfileRequest>,
) -> Result<(StatusCode, Json<ApiResponse<ClientProfile>>), ApiError> {
    req.validate().map_err(|e| ApiError::validation(e.to_string()))?;

    let profile = ClientService::create_profile(state.db.pool(), user.id, req).await
        .map_err(|e| ApiError::internal(e.to_string()))?;

    Ok((StatusCode::CREATED, Json(ApiResponse::success(profile))))
}

pub async fn update_profile(
    State(state): State<AppState>,
    Extension(user): Extension<AuthUser>,
    Json(req): Json<UpdateClientProfileRequest>,
) -> Result<Json<ApiResponse<ClientProfile>>, ApiError> {
    req.validate().map_err(|e| ApiError::validation(e.to_string()))?;

    let profile = ClientService::update_profile(state.db.pool(), user.id, req).await
        .map_err(|e| ApiError::internal(e.to_string()))?;

    Ok(Json(ApiResponse::success(profile)))
}

// ==================== Project Posting Handlers ====================

pub async fn list_project_postings(
    State(state): State<AppState>,
    Query(filters): Query<ProjectPostingFilters>,
    Query(pagination): Query<PaginationParams>,
) -> Result<Json<PaginatedResponse<ProjectPosting>>, ApiError> {
    let postings = ClientService::list_project_postings(state.db.pool(), filters, pagination.page, pagination.per_page).await
        .map_err(|e| ApiError::internal(e.to_string()))?;

    Ok(Json(postings))
}

pub async fn get_project_posting(
    State(state): State<AppState>,
    Path(id): Path<Uuid>,
) -> Result<Json<ApiResponse<ProjectPosting>>, ApiError> {
    let posting = ClientService::get_project_posting(state.db.pool(), id).await
        .map_err(|e| ApiError::internal(e.to_string()))?
        .ok_or_else(|| ApiError::not_found("Project posting not found"))?;

    Ok(Json(ApiResponse::success(posting)))
}

pub async fn create_project_posting(
    State(state): State<AppState>,
    Extension(user): Extension<AuthUser>,
    Json(req): Json<CreateProjectPostingRequest>,
) -> Result<(StatusCode, Json<ApiResponse<ProjectPosting>>), ApiError> {
    req.validate().map_err(|e| ApiError::validation(e.to_string()))?;

    let posting = ClientService::create_project_posting(state.db.pool(), user.id, req).await
        .map_err(|e| ApiError::internal(e.to_string()))?;

    Ok((StatusCode::CREATED, Json(ApiResponse::success(posting))))
}

pub async fn update_project_posting(
    State(state): State<AppState>,
    Extension(user): Extension<AuthUser>,
    Path(id): Path<Uuid>,
    Json(req): Json<UpdateProjectPostingRequest>,
) -> Result<Json<ApiResponse<ProjectPosting>>, ApiError> {
    req.validate().map_err(|e| ApiError::validation(e.to_string()))?;

    let posting = ClientService::update_project_posting(state.db.pool(), id, user.id, req).await
        .map_err(|e| ApiError::internal(e.to_string()))?;

    Ok(Json(ApiResponse::success(posting)))
}

pub async fn delete_project_posting(
    State(state): State<AppState>,
    Extension(user): Extension<AuthUser>,
    Path(id): Path<Uuid>,
) -> Result<Json<ApiResponse<EmptyResponse>>, ApiError> {
    ClientService::delete_project_posting(state.db.pool(), id, user.id).await
        .map_err(|e| ApiError::internal(e.to_string()))?;

    Ok(Json(ApiResponse::success(EmptyResponse::new("Project posting deleted"))))
}

// ==================== Booking Request Handlers ====================

pub async fn create_booking_request(
    State(state): State<AppState>,
    Extension(user): Extension<AuthUser>,
    Json(req): Json<CreateBookingRequest>,
) -> Result<(StatusCode, Json<ApiResponse<BookingRequest>>), ApiError> {
    req.validate().map_err(|e| ApiError::validation(e.to_string()))?;

    let booking = ClientService::create_booking_request(state.db.pool(), user.id, req).await
        .map_err(|e| ApiError::internal(e.to_string()))?;

    Ok((StatusCode::CREATED, Json(ApiResponse::success(booking))))
}

pub async fn list_my_bookings(
    State(state): State<AppState>,
    Extension(user): Extension<AuthUser>,
    Query(pagination): Query<PaginationParams>,
) -> Result<Json<PaginatedResponse<BookingRequest>>, ApiError> {
    let bookings = ClientService::list_client_bookings(state.db.pool(), user.id, pagination.page, pagination.per_page).await
        .map_err(|e| ApiError::internal(e.to_string()))?;

    Ok(Json(bookings))
}

pub async fn respond_to_booking(
    State(state): State<AppState>,
    Extension(user): Extension<AuthUser>,
    Path(id): Path<Uuid>,
    Json(req): Json<RespondBookingRequest>,
) -> Result<Json<ApiResponse<BookingRequest>>, ApiError> {
    let booking = ClientService::respond_to_booking(state.db.pool(), id, user.id, req).await
        .map_err(|e| ApiError::internal(e.to_string()))?;

    Ok(Json(ApiResponse::success(booking)))
}

// ==================== Proposal Handlers ====================

pub async fn create_proposal(
    State(state): State<AppState>,
    Extension(user): Extension<AuthUser>,
    Json(req): Json<CreateProposalRequest>,
) -> Result<(StatusCode, Json<ApiResponse<Proposal>>), ApiError> {
    req.validate().map_err(|e| ApiError::validation(e.to_string()))?;

    let proposal = ClientService::create_proposal(state.db.pool(), user.id, req).await
        .map_err(|e| ApiError::internal(e.to_string()))?;

    Ok((StatusCode::CREATED, Json(ApiResponse::success(proposal))))
}

pub async fn list_proposals_for_posting(
    State(state): State<AppState>,
    Path(posting_id): Path<Uuid>,
    Query(pagination): Query<PaginationParams>,
) -> Result<Json<PaginatedResponse<Proposal>>, ApiError> {
    let proposals = ClientService::list_proposals_for_posting(state.db.pool(), posting_id, pagination.page, pagination.per_page).await
        .map_err(|e| ApiError::internal(e.to_string()))?;

    Ok(Json(proposals))
}

pub async fn accept_proposal(
    State(state): State<AppState>,
    Extension(user): Extension<AuthUser>,
    Path(proposal_id): Path<Uuid>,
) -> Result<Json<ApiResponse<Proposal>>, ApiError> {
    let proposal = ClientService::accept_proposal(state.db.pool(), proposal_id, user.id).await
        .map_err(|e| ApiError::internal(e.to_string()))?;

    Ok(Json(ApiResponse::success(proposal)))
}

