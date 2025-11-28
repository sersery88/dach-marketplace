use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use sqlx::FromRow;
use uuid::Uuid;
use validator::Validate;

/// Review for completed projects/services
#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
#[serde(rename_all = "camelCase")]
pub struct Review {
    pub id: Uuid,
    pub project_id: Uuid,
    pub reviewer_id: Uuid,          // User who wrote the review
    pub reviewee_id: Uuid,          // User being reviewed
    pub service_id: Option<Uuid>,
    pub rating: i16,                // 1-5 stars
    pub title: Option<String>,
    pub content: String,
    pub communication_rating: Option<i16>,
    pub quality_rating: Option<i16>,
    pub timeliness_rating: Option<i16>,
    pub value_rating: Option<i16>,
    pub is_verified: bool,          // Verified purchase
    pub is_public: bool,
    pub helpful_count: i32,
    pub response: Option<String>,   // Expert's response
    pub response_at: Option<DateTime<Utc>>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

/// Create review request
#[derive(Debug, Deserialize, Validate)]
#[serde(rename_all = "camelCase")]
pub struct CreateReviewRequest {
    pub project_id: Uuid,
    pub service_id: Option<Uuid>,
    
    #[validate(range(min = 1, max = 5))]
    pub rating: i16,
    
    #[validate(length(max = 200))]
    pub title: Option<String>,
    
    #[validate(length(min = 20, max = 2000, message = "Review must be 20-2000 characters"))]
    pub content: String,
    
    #[validate(range(min = 1, max = 5))]
    pub communication_rating: Option<i16>,
    
    #[validate(range(min = 1, max = 5))]
    pub quality_rating: Option<i16>,
    
    #[validate(range(min = 1, max = 5))]
    pub timeliness_rating: Option<i16>,
    
    #[validate(range(min = 1, max = 5))]
    pub value_rating: Option<i16>,
    
    #[serde(default = "default_true")]
    pub is_public: bool,
}

fn default_true() -> bool { true }

/// Expert response to review
#[derive(Debug, Deserialize, Validate)]
pub struct ReviewResponseRequest {
    #[validate(length(min = 10, max = 1000))]
    pub response: String,
}

/// Review summary for expert profile
#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ReviewSummary {
    pub total_reviews: i32,
    pub average_rating: f32,
    pub rating_distribution: RatingDistribution,
    pub average_communication: Option<f32>,
    pub average_quality: Option<f32>,
    pub average_timeliness: Option<f32>,
    pub average_value: Option<f32>,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct RatingDistribution {
    pub five_star: i32,
    pub four_star: i32,
    pub three_star: i32,
    pub two_star: i32,
    pub one_star: i32,
}

/// Review with reviewer info
#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ReviewWithReviewer {
    #[serde(flatten)]
    pub review: Review,
    pub reviewer_name: String,
    pub reviewer_avatar: Option<String>,
    pub reviewer_country: String,
}

/// Review filters
#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ReviewFilters {
    pub expert_id: Option<Uuid>,
    pub service_id: Option<Uuid>,
    pub min_rating: Option<i16>,
    pub verified_only: Option<bool>,
    pub sort_by: Option<ReviewSortBy>,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum ReviewSortBy {
    Newest,
    Oldest,
    HighestRating,
    LowestRating,
    MostHelpful,
}

