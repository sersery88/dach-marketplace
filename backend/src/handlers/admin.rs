//! Admin handlers for platform management

use axum::{extract::{Path, State, Query}, Json};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

use crate::AppState;
use crate::models::{
    Category, CreateCategoryRequest, AccountStatus,
    PaginationParams, PaginatedResponse, PaginationMeta,
    ContentReport, ContentReportWithDetails, ResolveReportRequest, ReportFilters,
};
use crate::services::{AdminService, AdminStats as ServiceAdminStats, UserRow, CategoryService, PendingExpert, ReportService, PlatformAnalytics};
use crate::middleware::AuthUser;
use super::{ApiError, ApiResult, SuccessResponse, EmptyResponse};

#[derive(Debug, Serialize)]
pub struct AdminStatsResponse {
    pub total_users: i64,
    pub total_experts: i64,
    pub total_clients: i64,
    pub total_services: i64,
    pub total_projects: i64,
    pub pending_verifications: i64,
}

impl From<ServiceAdminStats> for AdminStatsResponse {
    fn from(stats: ServiceAdminStats) -> Self {
        Self {
            total_users: stats.total_users,
            total_experts: stats.total_experts,
            total_clients: stats.total_clients,
            total_services: stats.total_services,
            total_projects: stats.total_projects,
            pending_verifications: stats.pending_verifications,
        }
    }
}

#[derive(Debug, Serialize)]
pub struct UserResponse {
    pub id: uuid::Uuid,
    pub email: String,
    pub first_name: String,
    pub last_name: String,
    pub role: String,
    pub account_status: String,
    pub email_verified: bool,
    pub created_at: chrono::DateTime<chrono::Utc>,
    pub updated_at: chrono::DateTime<chrono::Utc>,
}

impl From<UserRow> for UserResponse {
    fn from(row: UserRow) -> Self {
        Self {
            id: row.id,
            email: row.email,
            first_name: row.first_name,
            last_name: row.last_name,
            role: row.role,
            account_status: row.account_status,
            email_verified: row.email_verified,
            created_at: row.created_at,
            updated_at: row.updated_at,
        }
    }
}

#[derive(Debug, Deserialize)]
pub struct UserListParams {
    #[serde(flatten)]
    pub pagination: PaginationParams,
    pub role: Option<String>,
    pub status: Option<String>,
}

/// Get admin statistics
pub async fn get_stats(
    State(state): State<AppState>,
) -> ApiResult<AdminStatsResponse> {
    let stats = AdminService::get_stats(state.db.pool())
        .await
        .map_err(|e| ApiError::Internal(e.into()))?;

    Ok(Json(SuccessResponse::new(AdminStatsResponse::from(stats))))
}

/// List all users (admin only)
pub async fn list_all_users(
    State(state): State<AppState>,
    Query(params): Query<UserListParams>,
) -> ApiResult<PaginatedResponse<UserResponse>> {
    let page = params.pagination.page as i64;
    let per_page = params.pagination.per_page as i64;

    let (users, meta) = AdminService::list_users(
        state.db.pool(),
        page,
        per_page,
        params.role.as_deref(),
        params.status.as_deref(),
    )
    .await
    .map_err(|e| ApiError::Internal(e.into()))?;

    let user_responses: Vec<UserResponse> = users.into_iter().map(UserResponse::from).collect();

    Ok(Json(SuccessResponse::new(PaginatedResponse {
        data: user_responses,
        meta,
    })))
}

/// Get user by ID (admin only)
pub async fn get_user(
    State(state): State<AppState>,
    Path(id): Path<uuid::Uuid>,
) -> ApiResult<UserResponse> {
    let user = AdminService::get_user(state.db.pool(), id)
        .await
        .map_err(|e| ApiError::Internal(e.into()))?
        .ok_or_else(|| ApiError::NotFound("User not found".to_string()))?;

    Ok(Json(SuccessResponse::new(UserResponse::from(user))))
}

#[derive(Debug, Deserialize)]
pub struct UpdateStatusRequest {
    pub status: AccountStatus,
}

/// Update user status (admin only)
pub async fn update_user_status(
    State(state): State<AppState>,
    Path(id): Path<uuid::Uuid>,
    Json(payload): Json<UpdateStatusRequest>,
) -> ApiResult<UserResponse> {
    let user = AdminService::update_user_status(state.db.pool(), id, payload.status)
        .await
        .map_err(|e| ApiError::Internal(e.into()))?;

    Ok(Json(SuccessResponse::new(UserResponse::from(user))))
}

/// Verify expert (admin only)
pub async fn verify_expert(
    State(state): State<AppState>,
    Path(id): Path<uuid::Uuid>,
) -> Result<Json<EmptyResponse>, ApiError> {
    AdminService::verify_expert(state.db.pool(), id)
        .await
        .map_err(|e| ApiError::Internal(e.into()))?;

    Ok(Json(EmptyResponse::new("Expert verified successfully")))
}

/// Delete user (admin only) - soft delete
pub async fn delete_user(
    State(state): State<AppState>,
    Path(id): Path<uuid::Uuid>,
) -> Result<Json<EmptyResponse>, ApiError> {
    AdminService::delete_user(state.db.pool(), id)
        .await
        .map_err(|e| ApiError::Internal(e.into()))?;

    Ok(Json(EmptyResponse::new("User deleted successfully")))
}

/// Get pending expert verifications with profile details
pub async fn get_pending_experts(
    State(state): State<AppState>,
) -> Result<Json<SuccessResponse<Vec<PendingExpert>>>, ApiError> {
    let experts = AdminService::get_pending_experts(state.db.pool())
        .await
        .map_err(|e| ApiError::Internal(e.into()))?;

    Ok(Json(SuccessResponse::new(experts)))
}

/// Create category (admin only)
pub async fn create_category(
    State(state): State<AppState>,
    Json(payload): Json<CreateCategoryRequest>,
) -> ApiResult<Category> {
    let category = CategoryService::create(state.db.pool(), payload)
        .await
        .map_err(|e| ApiError::Internal(e.into()))?;

    Ok(Json(SuccessResponse::new(category)))
}

/// Update category (admin only)
pub async fn update_category(
    State(state): State<AppState>,
    Path(id): Path<uuid::Uuid>,
    Json(payload): Json<CreateCategoryRequest>,
) -> ApiResult<Category> {
    let category = CategoryService::update(state.db.pool(), id, payload)
        .await
        .map_err(|e| ApiError::Internal(e.into()))?;

    Ok(Json(SuccessResponse::new(category)))
}

/// Delete category (admin only)
pub async fn delete_category(
    State(state): State<AppState>,
    Path(id): Path<uuid::Uuid>,
) -> Result<Json<EmptyResponse>, ApiError> {
    CategoryService::delete(state.db.pool(), id)
        .await
        .map_err(|e| ApiError::Internal(e.into()))?;

    Ok(Json(EmptyResponse::new("Category deleted successfully")))
}

/// Toggle category featured status (admin only)
pub async fn toggle_category_featured(
    State(state): State<AppState>,
    Path(id): Path<uuid::Uuid>,
) -> ApiResult<Category> {
    let category = CategoryService::toggle_featured(state.db.pool(), id)
        .await
        .map_err(|e| ApiError::Internal(e.into()))?;

    Ok(Json(SuccessResponse::new(category)))
}

// ============ Content Moderation Handlers ============

#[derive(Debug, Deserialize)]
pub struct ReportQueryParams {
    #[serde(flatten)]
    pub filters: ReportFilters,
    #[serde(flatten)]
    pub pagination: PaginationParams,
}

/// List content reports (admin only)
pub async fn list_reports(
    State(state): State<AppState>,
    Query(params): Query<ReportQueryParams>,
) -> Result<Json<PaginatedResponse<ContentReportWithDetails>>, ApiError> {
    let reports = ReportService::list(
        state.db.pool(),
        &params.filters,
        params.pagination.page,
        params.pagination.per_page,
    )
    .await
    .map_err(|e| ApiError::Internal(e.into()))?;

    Ok(Json(reports))
}

/// Get a single report by ID (admin only)
pub async fn get_report(
    State(state): State<AppState>,
    Path(id): Path<Uuid>,
) -> ApiResult<ContentReport> {
    let report = ReportService::get_by_id(state.db.pool(), id)
        .await
        .map_err(|e| ApiError::Internal(e.into()))?
        .ok_or_else(|| ApiError::NotFound("Report not found".to_string()))?;

    Ok(Json(SuccessResponse::new(report)))
}

/// Resolve a report with action (admin only)
pub async fn resolve_report(
    State(state): State<AppState>,
    axum::Extension(user): axum::Extension<AuthUser>,
    Path(id): Path<Uuid>,
    Json(req): Json<ResolveReportRequest>,
) -> ApiResult<ContentReport> {
    let report = ReportService::resolve(state.db.pool(), id, user.id, &req)
        .await
        .map_err(|e| ApiError::Internal(e.into()))?;

    Ok(Json(SuccessResponse::new(report)))
}

/// Dismiss a report (admin only)
pub async fn dismiss_report(
    State(state): State<AppState>,
    axum::Extension(user): axum::Extension<AuthUser>,
    Path(id): Path<Uuid>,
) -> ApiResult<ContentReport> {
    let report = ReportService::dismiss(state.db.pool(), id, user.id)
        .await
        .map_err(|e| ApiError::Internal(e.into()))?;

    Ok(Json(SuccessResponse::new(report)))
}

// ============ Analytics Handlers ============

/// Get platform analytics (admin only)
pub async fn get_analytics(
    State(state): State<AppState>,
) -> ApiResult<PlatformAnalytics> {
    let analytics = AdminService::get_analytics(state.db.pool())
        .await
        .map_err(|e| ApiError::Internal(e.into()))?;

    Ok(Json(SuccessResponse::new(analytics)))
}
