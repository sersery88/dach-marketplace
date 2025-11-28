use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use sqlx::FromRow;
use uuid::Uuid;
use validator::Validate;

use super::{Country, Currency};

/// Expert profile - extended profile for service providers
#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
#[serde(rename_all = "camelCase")]
pub struct ExpertProfile {
    pub id: Uuid,
    pub user_id: Uuid,
    pub headline: String,
    pub bio: String,
    pub hourly_rate: i32,           // in cents
    pub currency: Currency,
    pub years_experience: i16,
    pub skills: Vec<String>,
    pub tools: Vec<String>,         // n8n, Make, Zapier, etc.
    pub industries: Vec<String>,    // Healthcare, Finance, etc.
    pub languages_spoken: Vec<String>,
    pub portfolio_url: Option<String>,
    pub linkedin_url: Option<String>,
    pub github_url: Option<String>,
    pub website_url: Option<String>,
    pub availability_status: AvailabilityStatus,
    pub available_hours_per_week: i16,
    pub timezone: String,
    pub is_verified: bool,
    pub verification_date: Option<DateTime<Utc>>,
    pub rating_average: f32,
    pub rating_count: i32,
    pub total_projects: i32,
    pub total_earnings: i64,        // in cents
    pub response_time_hours: Option<i16>,
    pub completion_rate: Option<f32>,
    pub stripe_connect_id: Option<String>,
    pub stripe_onboarding_complete: bool,
    pub featured: bool,
    pub featured_until: Option<DateTime<Utc>>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

/// Availability status
#[derive(Debug, Clone, Serialize, Deserialize, sqlx::Type, PartialEq)]
#[sqlx(type_name = "availability_status", rename_all = "snake_case")]
pub enum AvailabilityStatus {
    Available,
    PartiallyAvailable,
    Busy,
    NotAvailable,
}

/// Create expert profile request
#[derive(Debug, Deserialize, Validate)]
#[serde(rename_all = "camelCase")]
pub struct CreateExpertProfileRequest {
    #[validate(length(min = 10, max = 200, message = "Headline must be 10-200 characters"))]
    pub headline: String,
    
    #[validate(length(min = 50, max = 5000, message = "Bio must be 50-5000 characters"))]
    pub bio: String,
    
    #[validate(range(min = 0, max = 100000, message = "Hourly rate must be between 0 and 1000"))]
    pub hourly_rate: i32,  // in cents (e.g., 15000 = 150.00 CHF)
    
    pub currency: Currency,
    
    #[validate(range(min = 0, max = 50))]
    pub years_experience: i16,
    
    #[validate(length(min = 1, max = 20, message = "Add 1-20 skills"))]
    pub skills: Vec<String>,
    
    #[validate(length(min = 1, max = 10, message = "Add 1-10 tools"))]
    pub tools: Vec<String>,
    
    pub industries: Option<Vec<String>>,
    pub languages_spoken: Vec<String>,
    pub portfolio_url: Option<String>,
    pub linkedin_url: Option<String>,
    pub github_url: Option<String>,
    pub website_url: Option<String>,
    
    #[validate(range(min = 1, max = 60))]
    pub available_hours_per_week: i16,
    
    pub timezone: String,
}

/// Update expert profile request
#[derive(Debug, Deserialize, Validate)]
#[serde(rename_all = "camelCase")]
pub struct UpdateExpertProfileRequest {
    #[validate(length(min = 10, max = 200))]
    pub headline: Option<String>,
    
    #[validate(length(min = 50, max = 5000))]
    pub bio: Option<String>,
    
    #[validate(range(min = 0, max = 100000))]
    pub hourly_rate: Option<i32>,
    
    pub currency: Option<Currency>,
    pub years_experience: Option<i16>,
    pub skills: Option<Vec<String>>,
    pub tools: Option<Vec<String>>,
    pub industries: Option<Vec<String>>,
    pub languages_spoken: Option<Vec<String>>,
    pub portfolio_url: Option<String>,
    pub linkedin_url: Option<String>,
    pub github_url: Option<String>,
    pub website_url: Option<String>,
    pub availability_status: Option<AvailabilityStatus>,
    pub available_hours_per_week: Option<i16>,
    pub timezone: Option<String>,
}

/// Expert search filters
#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ExpertSearchFilters {
    pub query: Option<String>,
    pub skills: Option<Vec<String>>,
    pub tools: Option<Vec<String>>,
    pub industries: Option<Vec<String>>,
    pub countries: Option<Vec<Country>>,
    pub min_rate: Option<i32>,
    pub max_rate: Option<i32>,
    pub min_rating: Option<f32>,
    pub availability: Option<AvailabilityStatus>,
    pub verified_only: Option<bool>,
    pub languages: Option<Vec<String>>,
    pub sort_by: Option<ExpertSortBy>,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum ExpertSortBy {
    Rating,
    HourlyRate,
    Experience,
    TotalProjects,
    ResponseTime,
    Newest,
}

