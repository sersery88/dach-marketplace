//! Report handlers for content reporting

use axum::{extract::State, Json};

use crate::AppState;
use crate::models::{ContentReport, CreateReportRequest};
use crate::services::ReportService;
use crate::middleware::AuthUser;
use super::{ApiError, SuccessResponse};

/// Create a content report (authenticated users)
pub async fn create_report(
    State(state): State<AppState>,
    axum::Extension(user): axum::Extension<AuthUser>,
    Json(req): Json<CreateReportRequest>,
) -> Result<Json<SuccessResponse<ContentReport>>, ApiError> {
    let report = ReportService::create(state.db.pool(), user.id, &req)
        .await
        .map_err(|e| ApiError::Internal(e.into()))?;

    Ok(Json(SuccessResponse::new(report)))
}

