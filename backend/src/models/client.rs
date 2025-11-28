use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use sqlx::FromRow;
use uuid::Uuid;
use validator::Validate;

use super::Currency;

/// Client profile - for users who hire experts
#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
#[serde(rename_all = "camelCase")]
pub struct ClientProfile {
    pub id: Uuid,
    pub user_id: Uuid,
    pub company_name: Option<String>,
    pub company_website: Option<String>,
    pub company_size: Option<String>,
    pub industry: Option<String>,
    pub description: Option<String>,
    pub preferred_budget_min: Option<i32>,
    pub preferred_budget_max: Option<i32>,
    pub preferred_tools: Vec<String>,
    pub preferred_industries: Vec<String>,
    pub total_projects: i32,
    pub total_spent: i32,
    pub is_verified: bool,
    pub verified_at: Option<DateTime<Utc>>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

/// Create client profile request
#[derive(Debug, Deserialize, Validate)]
#[serde(rename_all = "camelCase")]
pub struct CreateClientProfileRequest {
    #[validate(length(max = 200))]
    pub company_name: Option<String>,
    #[validate(url)]
    pub company_website: Option<String>,
    pub company_size: Option<String>,
    #[validate(length(max = 100))]
    pub industry: Option<String>,
    #[validate(length(max = 2000))]
    pub description: Option<String>,
    pub preferred_budget_min: Option<i32>,
    pub preferred_budget_max: Option<i32>,
    pub preferred_tools: Option<Vec<String>>,
    pub preferred_industries: Option<Vec<String>>,
}

/// Update client profile request
#[derive(Debug, Deserialize, Validate)]
#[serde(rename_all = "camelCase")]
pub struct UpdateClientProfileRequest {
    #[validate(length(max = 200))]
    pub company_name: Option<String>,
    #[validate(url)]
    pub company_website: Option<String>,
    pub company_size: Option<String>,
    #[validate(length(max = 100))]
    pub industry: Option<String>,
    #[validate(length(max = 2000))]
    pub description: Option<String>,
    pub preferred_budget_min: Option<i32>,
    pub preferred_budget_max: Option<i32>,
    pub preferred_tools: Option<Vec<String>>,
    pub preferred_industries: Option<Vec<String>>,
}

/// Client profile with user info
#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ClientProfileWithUser {
    pub id: Uuid,
    pub user_id: Uuid,
    pub first_name: String,
    pub last_name: String,
    pub avatar_url: Option<String>,
    pub company_name: Option<String>,
    pub company_website: Option<String>,
    pub company_size: Option<String>,
    pub industry: Option<String>,
    pub description: Option<String>,
    pub total_projects: i32,
    pub total_spent: i32,
    pub is_verified: bool,
    pub created_at: DateTime<Utc>,
}

/// Project posting status
#[derive(Debug, Clone, Serialize, Deserialize, sqlx::Type, PartialEq)]
#[sqlx(type_name = "project_posting_status", rename_all = "snake_case")]
pub enum ProjectPostingStatus {
    Draft,
    Open,
    InReview,
    Assigned,
    Completed,
    Cancelled,
}

/// Project posting budget type
#[derive(Debug, Clone, Serialize, Deserialize, sqlx::Type, PartialEq)]
#[sqlx(type_name = "project_posting_budget_type", rename_all = "snake_case")]
pub enum ProjectPostingBudgetType {
    Fixed,
    Hourly,
    Range,
}

/// Project posting - clients post projects for experts to bid on
#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
#[serde(rename_all = "camelCase")]
pub struct ProjectPosting {
    pub id: Uuid,
    pub client_id: Uuid,
    pub title: String,
    pub description: String,
    pub requirements: Option<String>,
    pub category_id: Option<Uuid>,
    pub skills_required: Vec<String>,
    pub tools_required: Vec<String>,
    pub budget_type: ProjectPostingBudgetType,
    pub budget_min: Option<i32>,
    pub budget_max: Option<i32>,
    pub currency: Currency,
    pub deadline: Option<DateTime<Utc>>,
    pub estimated_duration: Option<String>,
    pub status: ProjectPostingStatus,
    pub is_urgent: bool,
    pub is_featured: bool,
    pub attachments: Vec<String>,
    pub view_count: i32,
    pub proposal_count: i32,
    pub assigned_expert_id: Option<Uuid>,
    pub assigned_at: Option<DateTime<Utc>>,
    pub completed_at: Option<DateTime<Utc>>,
    pub cancelled_at: Option<DateTime<Utc>>,
    pub cancellation_reason: Option<String>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

/// Create project posting request
#[derive(Debug, Deserialize, Validate)]
#[serde(rename_all = "camelCase")]
pub struct CreateProjectPostingRequest {
    #[validate(length(min = 10, max = 200))]
    pub title: String,
    #[validate(length(min = 50, max = 5000))]
    pub description: String,
    pub requirements: Option<String>,
    pub category_id: Option<Uuid>,
    pub skills_required: Option<Vec<String>>,
    pub tools_required: Option<Vec<String>>,
    pub budget_type: ProjectPostingBudgetType,
    pub budget_min: Option<i32>,
    pub budget_max: Option<i32>,
    pub currency: Currency,
    pub deadline: Option<DateTime<Utc>>,
    pub estimated_duration: Option<String>,
    pub is_urgent: Option<bool>,
}

/// Update project posting request
#[derive(Debug, Deserialize, Validate)]
#[serde(rename_all = "camelCase")]
pub struct UpdateProjectPostingRequest {
    #[validate(length(min = 10, max = 200))]
    pub title: Option<String>,
    #[validate(length(min = 50, max = 5000))]
    pub description: Option<String>,
    pub requirements: Option<String>,
    pub category_id: Option<Uuid>,
    pub skills_required: Option<Vec<String>>,
    pub tools_required: Option<Vec<String>>,
    pub budget_type: Option<ProjectPostingBudgetType>,
    pub budget_min: Option<i32>,
    pub budget_max: Option<i32>,
    pub deadline: Option<DateTime<Utc>>,
    pub estimated_duration: Option<String>,
    pub is_urgent: Option<bool>,
    pub status: Option<ProjectPostingStatus>,
}

/// Project posting filters
#[derive(Debug, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct ProjectPostingFilters {
    pub status: Option<ProjectPostingStatus>,
    pub category_id: Option<Uuid>,
    pub skills: Option<Vec<String>>,
    pub tools: Option<Vec<String>>,
    pub budget_min: Option<i32>,
    pub budget_max: Option<i32>,
    pub is_urgent: Option<bool>,
    pub search: Option<String>,
}

/// Proposal status
#[derive(Debug, Clone, Serialize, Deserialize, sqlx::Type, PartialEq)]
#[sqlx(type_name = "proposal_status", rename_all = "snake_case")]
pub enum ProposalStatus {
    Pending,
    Shortlisted,
    Accepted,
    Rejected,
    Withdrawn,
}

/// Proposal - expert submits to project posting
#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
#[serde(rename_all = "camelCase")]
pub struct Proposal {
    pub id: Uuid,
    pub project_posting_id: Uuid,
    pub expert_id: Uuid,
    pub cover_letter: String,
    pub proposed_price: i32,
    pub currency: Currency,
    pub proposed_duration: Option<String>,
    pub proposed_milestones: Option<serde_json::Value>,
    pub attachments: Vec<String>,
    pub status: ProposalStatus,
    pub is_featured: bool,
    pub client_viewed_at: Option<DateTime<Utc>>,
    pub shortlisted_at: Option<DateTime<Utc>>,
    pub accepted_at: Option<DateTime<Utc>>,
    pub rejected_at: Option<DateTime<Utc>>,
    pub rejection_reason: Option<String>,
    pub withdrawn_at: Option<DateTime<Utc>>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

/// Create proposal request
#[derive(Debug, Deserialize, Validate)]
#[serde(rename_all = "camelCase")]
pub struct CreateProposalRequest {
    pub project_posting_id: Uuid,
    #[validate(length(min = 100, max = 5000))]
    pub cover_letter: String,
    #[validate(range(min = 0))]
    pub proposed_price: i32,
    pub currency: Currency,
    pub proposed_duration: Option<String>,
    pub proposed_milestones: Option<serde_json::Value>,
}

/// Booking status
#[derive(Debug, Clone, Serialize, Deserialize, sqlx::Type, PartialEq)]
#[sqlx(type_name = "booking_status", rename_all = "snake_case")]
pub enum BookingStatus {
    Pending,
    Accepted,
    Declined,
    Cancelled,
    Expired,
}

/// Booking request - direct booking without project posting
#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
#[serde(rename_all = "camelCase")]
pub struct BookingRequest {
    pub id: Uuid,
    pub client_id: Uuid,
    pub expert_id: Uuid,
    pub service_id: Option<Uuid>,
    pub package_id: Option<Uuid>,
    pub message: String,
    pub proposed_budget: Option<i32>,
    pub currency: Currency,
    pub proposed_start_date: Option<DateTime<Utc>>,
    pub proposed_deadline: Option<DateTime<Utc>>,
    pub status: BookingStatus,
    pub expert_response: Option<String>,
    pub responded_at: Option<DateTime<Utc>>,
    pub expires_at: DateTime<Utc>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

/// Create booking request
#[derive(Debug, Deserialize, Validate)]
#[serde(rename_all = "camelCase")]
pub struct CreateBookingRequest {
    pub expert_id: Uuid,
    pub service_id: Option<Uuid>,
    pub package_id: Option<Uuid>,
    #[validate(length(min = 50, max = 2000))]
    pub message: String,
    pub proposed_budget: Option<i32>,
    pub currency: Currency,
    pub proposed_start_date: Option<DateTime<Utc>>,
    pub proposed_deadline: Option<DateTime<Utc>>,
}

/// Respond to booking request
#[derive(Debug, Deserialize)]
pub struct RespondBookingRequest {
    pub accept: bool,
    pub response: Option<String>,
}

