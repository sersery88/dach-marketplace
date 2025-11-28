use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use sqlx::FromRow;
use uuid::Uuid;
use validator::Validate;

use super::Currency;

/// Project/Order - when a client hires an expert
#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
#[serde(rename_all = "camelCase")]
pub struct Project {
    pub id: Uuid,
    pub client_id: Uuid,
    pub expert_id: Uuid,
    pub service_id: Option<Uuid>,
    pub package_id: Option<Uuid>,
    pub title: String,
    pub description: String,
    pub requirements: Option<String>,
    pub status: ProjectStatus,
    pub price: i32,                 // in cents
    pub currency: Currency,
    pub platform_fee: i32,          // in cents
    pub expert_payout: i32,         // in cents
    pub delivery_date: Option<DateTime<Utc>>,
    pub delivered_at: Option<DateTime<Utc>>,
    pub completed_at: Option<DateTime<Utc>>,
    pub cancelled_at: Option<DateTime<Utc>>,
    pub cancellation_reason: Option<String>,
    pub revisions_used: i16,
    pub revisions_allowed: i16,
    pub stripe_payment_intent_id: Option<String>,
    pub stripe_transfer_id: Option<String>,
    pub is_disputed: bool,
    pub dispute_reason: Option<String>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

/// Project status
#[derive(Debug, Clone, Serialize, Deserialize, sqlx::Type, PartialEq)]
#[sqlx(type_name = "project_status", rename_all = "snake_case")]
pub enum ProjectStatus {
    Pending,        // Awaiting expert acceptance
    Accepted,       // Expert accepted, awaiting payment
    Paid,           // Payment received, work can begin
    InProgress,     // Expert is working
    Delivered,      // Expert delivered, awaiting client review
    Revision,       // Client requested revision
    Completed,      // Client approved, project done
    Cancelled,      // Cancelled by either party
    Disputed,       // Under dispute resolution
    Refunded,       // Refund issued
}

/// Project milestone
#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
#[serde(rename_all = "camelCase")]
pub struct ProjectMilestone {
    pub id: Uuid,
    pub project_id: Uuid,
    pub title: String,
    pub description: Option<String>,
    pub amount: i32,
    pub due_date: Option<DateTime<Utc>>,
    pub status: MilestoneStatus,
    pub completed_at: Option<DateTime<Utc>>,
    pub sort_order: i16,
    pub created_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize, sqlx::Type, PartialEq)]
#[sqlx(type_name = "milestone_status", rename_all = "snake_case")]
pub enum MilestoneStatus {
    Pending,
    InProgress,
    Completed,
    Cancelled,
}

/// Project deliverable
#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
#[serde(rename_all = "camelCase")]
pub struct ProjectDeliverable {
    pub id: Uuid,
    pub project_id: Uuid,
    pub milestone_id: Option<Uuid>,
    pub title: String,
    pub description: Option<String>,
    pub file_url: String,
    pub file_name: String,
    pub file_type: String,
    pub file_size: i64,
    pub version: i16,
    pub is_final: bool,
    pub created_at: DateTime<Utc>,
}

/// Create project request (client initiates)
#[derive(Debug, Deserialize, Validate)]
#[serde(rename_all = "camelCase")]
pub struct CreateProjectRequest {
    pub expert_id: Uuid,
    pub service_id: Option<Uuid>,
    pub package_id: Option<Uuid>,
    
    #[validate(length(min = 10, max = 200))]
    pub title: String,
    
    #[validate(length(min = 50, max = 5000))]
    pub description: String,
    
    pub requirements: Option<String>,
    
    #[validate(range(min = 0))]
    pub budget: Option<i32>,
    
    pub currency: Currency,
    pub deadline: Option<DateTime<Utc>>,
}

/// Update project status
#[derive(Debug, Deserialize)]
pub struct UpdateProjectStatusRequest {
    pub status: ProjectStatus,
    pub message: Option<String>,
}

/// Request revision
#[derive(Debug, Deserialize, Validate)]
pub struct RequestRevisionRequest {
    #[validate(length(min = 20, max = 2000))]
    pub feedback: String,
}

/// Project filters
#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ProjectFilters {
    pub status: Option<Vec<ProjectStatus>>,
    pub client_id: Option<Uuid>,
    pub expert_id: Option<Uuid>,
    pub service_id: Option<Uuid>,
    pub min_price: Option<i32>,
    pub max_price: Option<i32>,
    pub from_date: Option<DateTime<Utc>>,
    pub to_date: Option<DateTime<Utc>>,
}

