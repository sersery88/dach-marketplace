use chrono::{DateTime, NaiveDate, NaiveTime, Utc};
use serde::{Deserialize, Serialize};
use sqlx::FromRow;
use uuid::Uuid;
use validator::Validate;

/// Weekly availability slot
#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
#[serde(rename_all = "camelCase")]
pub struct AvailabilitySlot {
    pub id: Uuid,
    pub expert_id: Uuid,
    pub day_of_week: i16, // 0=Sunday, 6=Saturday
    pub start_time: NaiveTime,
    pub end_time: NaiveTime,
    pub is_available: bool,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

/// Blocked date range (vacation, etc.)
#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
#[serde(rename_all = "camelCase")]
pub struct BlockedDate {
    pub id: Uuid,
    pub expert_id: Uuid,
    pub start_date: NaiveDate,
    pub end_date: NaiveDate,
    pub reason: Option<String>,
    pub created_at: DateTime<Utc>,
}

/// Request to set availability slots
#[derive(Debug, Clone, Serialize, Deserialize, Validate)]
pub struct SetAvailabilityRequest {
    pub slots: Vec<AvailabilitySlotInput>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct AvailabilitySlotInput {
    pub day_of_week: i16,
    pub start_time: String, // "09:00"
    pub end_time: String,   // "17:00"
    pub is_available: bool,
}

/// Request to block dates
#[derive(Debug, Clone, Serialize, Deserialize, Validate)]
#[serde(rename_all = "camelCase")]
pub struct BlockDatesRequest {
    pub start_date: NaiveDate,
    pub end_date: NaiveDate,
    #[validate(length(max = 200))]
    pub reason: Option<String>,
}

/// Expert's full availability info
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ExpertAvailability {
    pub weekly_slots: Vec<AvailabilitySlot>,
    pub blocked_dates: Vec<BlockedDate>,
    pub timezone: String,
    pub available_hours_per_week: i16,
}

