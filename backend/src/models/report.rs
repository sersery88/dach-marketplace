use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use sqlx::FromRow;
use uuid::Uuid;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, sqlx::Type)]
#[sqlx(type_name = "VARCHAR", rename_all = "snake_case")]
#[serde(rename_all = "snake_case")]
pub enum ReportedType {
    Service,
    Review,
    Message,
    User,
    ProjectPosting,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, sqlx::Type)]
#[sqlx(type_name = "VARCHAR", rename_all = "snake_case")]
#[serde(rename_all = "snake_case")]
pub enum ReportReason {
    Spam,
    Inappropriate,
    Fraud,
    Harassment,
    Copyright,
    Other,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, sqlx::Type)]
#[sqlx(type_name = "VARCHAR", rename_all = "snake_case")]
#[serde(rename_all = "snake_case")]
pub enum ReportStatus {
    Pending,
    Reviewing,
    Resolved,
    Dismissed,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, sqlx::Type)]
#[sqlx(type_name = "VARCHAR", rename_all = "snake_case")]
#[serde(rename_all = "snake_case")]
pub enum ReportAction {
    None,
    Warning,
    ContentRemoved,
    UserSuspended,
    UserBanned,
}

#[derive(Debug, Clone, Serialize, FromRow)]
#[serde(rename_all = "camelCase")]
pub struct ContentReport {
    pub id: Uuid,
    pub reporter_id: Uuid,
    pub reported_type: String,
    pub reported_id: Uuid,
    pub reason: String,
    pub description: Option<String>,
    pub status: String,
    pub resolved_by: Option<Uuid>,
    pub resolution_notes: Option<String>,
    pub action_taken: Option<String>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
    pub resolved_at: Option<DateTime<Utc>>,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ContentReportWithDetails {
    pub id: Uuid,
    pub reporter_id: Uuid,
    pub reporter_name: String,
    pub reporter_email: String,
    pub reported_type: String,
    pub reported_id: Uuid,
    pub reported_content_preview: Option<String>,
    pub reason: String,
    pub description: Option<String>,
    pub status: String,
    pub resolved_by: Option<Uuid>,
    pub resolver_name: Option<String>,
    pub resolution_notes: Option<String>,
    pub action_taken: Option<String>,
    pub created_at: DateTime<Utc>,
    pub resolved_at: Option<DateTime<Utc>>,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CreateReportRequest {
    pub reported_type: ReportedType,
    pub reported_id: Uuid,
    pub reason: ReportReason,
    pub description: Option<String>,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ResolveReportRequest {
    pub action: ReportAction,
    pub notes: Option<String>,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ReportFilters {
    pub status: Option<ReportStatus>,
    pub reported_type: Option<ReportedType>,
    pub reason: Option<ReportReason>,
}

