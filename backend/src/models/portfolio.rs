use chrono::{DateTime, NaiveDate, Utc};
use serde::{Deserialize, Serialize};
use sqlx::FromRow;
use uuid::Uuid;
use validator::Validate;

/// Portfolio item for expert showcase
#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
#[serde(rename_all = "camelCase")]
pub struct PortfolioItem {
    pub id: Uuid,
    pub expert_id: Uuid,
    pub title: String,
    pub description: String,
    pub project_url: Option<String>,
    pub image_urls: Vec<String>,
    pub video_url: Option<String>,
    pub tools_used: Vec<String>,
    pub category_id: Option<Uuid>,
    pub client_name: Option<String>,
    pub client_testimonial: Option<String>,
    pub completion_date: Option<NaiveDate>,
    pub is_featured: bool,
    pub sort_order: i16,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

/// Request to create a portfolio item
#[derive(Debug, Clone, Serialize, Deserialize, Validate)]
#[serde(rename_all = "camelCase")]
pub struct CreatePortfolioItemRequest {
    #[validate(length(min = 3, max = 200, message = "Title must be 3-200 characters"))]
    pub title: String,
    
    #[validate(length(min = 10, max = 5000, message = "Description must be 10-5000 characters"))]
    pub description: String,
    
    #[validate(url(message = "Invalid project URL"))]
    pub project_url: Option<String>,
    
    pub image_urls: Option<Vec<String>>,
    
    #[validate(url(message = "Invalid video URL"))]
    pub video_url: Option<String>,
    
    pub tools_used: Option<Vec<String>>,
    pub category_id: Option<Uuid>,
    pub client_name: Option<String>,
    pub client_testimonial: Option<String>,
    pub completion_date: Option<NaiveDate>,
    pub is_featured: Option<bool>,
    pub sort_order: Option<i16>,
}

/// Request to update a portfolio item
#[derive(Debug, Clone, Serialize, Deserialize, Validate)]
#[serde(rename_all = "camelCase")]
pub struct UpdatePortfolioItemRequest {
    #[validate(length(min = 3, max = 200, message = "Title must be 3-200 characters"))]
    pub title: Option<String>,
    
    #[validate(length(min = 10, max = 5000, message = "Description must be 10-5000 characters"))]
    pub description: Option<String>,
    
    #[validate(url(message = "Invalid project URL"))]
    pub project_url: Option<String>,
    
    pub image_urls: Option<Vec<String>>,
    
    #[validate(url(message = "Invalid video URL"))]
    pub video_url: Option<String>,
    
    pub tools_used: Option<Vec<String>>,
    pub category_id: Option<Uuid>,
    pub client_name: Option<String>,
    pub client_testimonial: Option<String>,
    pub completion_date: Option<NaiveDate>,
    pub is_featured: Option<bool>,
    pub sort_order: Option<i16>,
}

