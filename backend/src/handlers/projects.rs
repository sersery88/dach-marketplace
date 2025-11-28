use axum::{extract::{Path, State, Query}, Extension, Json};
use serde::Deserialize;
use uuid::Uuid;
use validator::Validate;

use crate::AppState;
use crate::models::{
    Project, CreateProjectRequest, UpdateProjectStatusRequest, RequestRevisionRequest,
    ProjectFilters, PaginationParams, PaginatedResponse, PaginationMeta,
};
use crate::services::ProjectService;
use crate::middleware::auth::AuthUser;
use super::{ApiError, ApiResult, SuccessResponse};

/// Delivery request body
#[derive(Debug, Deserialize)]
pub struct DeliverRequest {
    pub message: String,
    pub attachments: Option<Vec<String>>,
}

/// Cancel request body
#[derive(Debug, Deserialize)]
pub struct CancelRequest {
    pub reason: Option<String>,
}

/// List projects for current user
pub async fn list_projects(
    State(state): State<AppState>,
    Extension(auth_user): Extension<AuthUser>,
    Query(filters): Query<ProjectFilters>,
    Query(pagination): Query<PaginationParams>,
) -> ApiResult<PaginatedResponse<Project>> {
    let (projects, total) = ProjectService::get_for_user(&state.db, auth_user.id, &filters, &pagination)
        .await
        .map_err(|e| ApiError::Internal(e.into()))?;

    Ok(Json(SuccessResponse::new(PaginatedResponse {
        data: projects,
        meta: PaginationMeta::new(pagination.page, pagination.per_page, total),
    })))
}

/// Create a new project (client initiates)
pub async fn create_project(
    State(state): State<AppState>,
    Extension(auth_user): Extension<AuthUser>,
    Json(payload): Json<CreateProjectRequest>,
) -> ApiResult<Project> {
    payload.validate().map_err(|e| ApiError::Validation(e.to_string()))?;

    let project = ProjectService::create(&state.db, auth_user.id, payload)
        .await
        .map_err(|e| ApiError::Internal(e.into()))?;

    Ok(Json(SuccessResponse::new(project)))
}

/// Get project by ID
pub async fn get_project(
    State(state): State<AppState>,
    Extension(auth_user): Extension<AuthUser>,
    Path(id): Path<Uuid>,
) -> ApiResult<Project> {
    let project = ProjectService::get_by_id(&state.db, id)
        .await
        .map_err(|e| ApiError::Internal(e.into()))?
        .ok_or_else(|| ApiError::NotFound("Project not found".to_string()))?;

    // Check authorization - only client or expert can view
    if project.client_id != auth_user.id && project.expert_id != auth_user.id {
        return Err(ApiError::Forbidden("Not authorized to view this project".to_string()));
    }

    Ok(Json(SuccessResponse::new(project)))
}

/// Update project status
pub async fn update_status(
    State(state): State<AppState>,
    Extension(auth_user): Extension<AuthUser>,
    Path(id): Path<Uuid>,
    Json(payload): Json<UpdateProjectStatusRequest>,
) -> ApiResult<Project> {
    // Get existing project
    let existing = ProjectService::get_by_id(&state.db, id)
        .await
        .map_err(|e| ApiError::Internal(e.into()))?
        .ok_or_else(|| ApiError::NotFound("Project not found".to_string()))?;

    // Check authorization
    if existing.client_id != auth_user.id && existing.expert_id != auth_user.id {
        return Err(ApiError::Forbidden("Not authorized".to_string()));
    }

    let project = ProjectService::update_status(&state.db, id, payload.status)
        .await
        .map_err(|e| ApiError::Internal(e.into()))?;

    Ok(Json(SuccessResponse::new(project)))
}

/// Deliver project (expert submits deliverables)
pub async fn deliver_project(
    State(state): State<AppState>,
    Extension(auth_user): Extension<AuthUser>,
    Path(id): Path<Uuid>,
    Json(payload): Json<DeliverRequest>,
) -> ApiResult<Project> {
    // Get existing project
    let existing = ProjectService::get_by_id(&state.db, id)
        .await
        .map_err(|e| ApiError::Internal(e.into()))?
        .ok_or_else(|| ApiError::NotFound("Project not found".to_string()))?;

    // Only expert can deliver
    if existing.expert_id != auth_user.id {
        return Err(ApiError::Forbidden("Only the expert can deliver".to_string()));
    }

    let project = ProjectService::deliver(&state.db, id, &payload.message)
        .await
        .map_err(|e| ApiError::Internal(e.into()))?;

    Ok(Json(SuccessResponse::new(project)))
}

/// Request revision (client)
pub async fn request_revision(
    State(state): State<AppState>,
    Extension(auth_user): Extension<AuthUser>,
    Path(id): Path<Uuid>,
    Json(payload): Json<RequestRevisionRequest>,
) -> ApiResult<Project> {
    payload.validate().map_err(|e| ApiError::Validation(e.to_string()))?;

    // Get existing project
    let existing = ProjectService::get_by_id(&state.db, id)
        .await
        .map_err(|e| ApiError::Internal(e.into()))?
        .ok_or_else(|| ApiError::NotFound("Project not found".to_string()))?;

    // Only client can request revision
    if existing.client_id != auth_user.id {
        return Err(ApiError::Forbidden("Only the client can request revision".to_string()));
    }

    // Check revision limit
    if existing.revisions_used >= existing.revisions_allowed {
        return Err(ApiError::BadRequest("Revision limit reached".to_string()));
    }

    let project = ProjectService::request_revision(&state.db, id, &payload.feedback)
        .await
        .map_err(|e| ApiError::Internal(e.into()))?;

    Ok(Json(SuccessResponse::new(project)))
}

/// Complete project (client approves)
pub async fn complete_project(
    State(state): State<AppState>,
    Extension(auth_user): Extension<AuthUser>,
    Path(id): Path<Uuid>,
) -> ApiResult<Project> {
    // Get existing project
    let existing = ProjectService::get_by_id(&state.db, id)
        .await
        .map_err(|e| ApiError::Internal(e.into()))?
        .ok_or_else(|| ApiError::NotFound("Project not found".to_string()))?;

    // Only client can complete
    if existing.client_id != auth_user.id {
        return Err(ApiError::Forbidden("Only the client can complete the project".to_string()));
    }

    let project = ProjectService::complete(&state.db, id)
        .await
        .map_err(|e| ApiError::Internal(e.into()))?;

    Ok(Json(SuccessResponse::new(project)))
}

/// Cancel project
pub async fn cancel_project(
    State(state): State<AppState>,
    Extension(auth_user): Extension<AuthUser>,
    Path(id): Path<Uuid>,
    Json(payload): Json<CancelRequest>,
) -> ApiResult<Project> {
    // Get existing project
    let existing = ProjectService::get_by_id(&state.db, id)
        .await
        .map_err(|e| ApiError::Internal(e.into()))?
        .ok_or_else(|| ApiError::NotFound("Project not found".to_string()))?;

    // Check authorization
    if existing.client_id != auth_user.id && existing.expert_id != auth_user.id {
        return Err(ApiError::Forbidden("Not authorized".to_string()));
    }

    let project = ProjectService::cancel(&state.db, id, payload.reason.as_deref())
        .await
        .map_err(|e| ApiError::Internal(e.into()))?;

    Ok(Json(SuccessResponse::new(project)))
}

