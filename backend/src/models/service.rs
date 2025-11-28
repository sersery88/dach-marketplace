use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use sqlx::FromRow;
use uuid::Uuid;
use validator::Validate;

use super::Currency;

/// Service listing - what experts offer
#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
#[serde(rename_all = "camelCase")]
pub struct Service {
    pub id: Uuid,
    pub expert_id: Uuid,
    pub category_id: Uuid,
    pub title: String,
    pub slug: String,
    pub description: String,
    pub short_description: String,
    pub pricing_type: PricingType,
    pub price: i32,                 // in cents
    pub currency: Currency,
    pub delivery_time_days: i16,
    pub revisions_included: i16,
    pub features: Vec<String>,
    pub requirements: Option<String>,
    pub tags: Vec<String>,
    pub images: Vec<String>,
    pub video_url: Option<String>,
    pub is_active: bool,
    pub is_featured: bool,
    pub view_count: i32,
    pub order_count: i32,
    pub rating_average: f32,
    pub rating_count: i32,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

/// Pricing type for services
#[derive(Debug, Clone, Serialize, Deserialize, sqlx::Type, PartialEq)]
#[sqlx(type_name = "pricing_type", rename_all = "snake_case")]
pub enum PricingType {
    Fixed,
    Hourly,
    ProjectBased,
    Custom,
}

/// Service package (Basic, Standard, Premium tiers)
#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
#[serde(rename_all = "camelCase")]
pub struct ServicePackage {
    pub id: Uuid,
    pub service_id: Uuid,
    pub name: String,               // Basic, Standard, Premium
    pub description: String,
    pub price: i32,
    pub delivery_time_days: i16,
    pub revisions_included: i16,
    pub features: Vec<String>,
    pub is_popular: bool,
    pub sort_order: i16,
}

/// Create service request
#[derive(Debug, Deserialize, Validate)]
#[serde(rename_all = "camelCase")]
pub struct CreateServiceRequest {
    pub category_id: Uuid,
    
    #[validate(length(min = 10, max = 200, message = "Title must be 10-200 characters"))]
    pub title: String,
    
    #[validate(length(min = 100, max = 10000, message = "Description must be 100-10000 characters"))]
    pub description: String,
    
    #[validate(length(min = 20, max = 300))]
    pub short_description: String,
    
    pub pricing_type: PricingType,
    
    #[validate(range(min = 0, max = 10000000))]
    pub price: i32,
    
    pub currency: Currency,
    
    #[validate(range(min = 1, max = 365))]
    pub delivery_time_days: i16,
    
    #[validate(range(min = 0, max = 10))]
    pub revisions_included: i16,
    
    #[validate(length(min = 1, max = 20))]
    pub features: Vec<String>,
    
    pub requirements: Option<String>,
    
    #[validate(length(max = 10))]
    pub tags: Option<Vec<String>>,
    
    pub packages: Option<Vec<CreateServicePackageRequest>>,
}

#[derive(Debug, Deserialize, Validate)]
#[serde(rename_all = "camelCase")]
pub struct CreateServicePackageRequest {
    #[validate(length(min = 1, max = 50))]
    pub name: String,
    
    #[validate(length(min = 10, max = 500))]
    pub description: String,
    
    #[validate(range(min = 0, max = 10000000))]
    pub price: i32,
    
    #[validate(range(min = 1, max = 365))]
    pub delivery_time_days: i16,
    
    #[validate(range(min = 0, max = 10))]
    pub revisions_included: i16,
    
    pub features: Vec<String>,
    pub is_popular: Option<bool>,
}

/// Service search filters
#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ServiceSearchFilters {
    pub query: Option<String>,
    pub category_id: Option<Uuid>,
    pub expert_id: Option<Uuid>,
    pub min_price: Option<i32>,
    pub max_price: Option<i32>,
    pub pricing_type: Option<PricingType>,
    pub min_rating: Option<f32>,
    pub max_delivery_days: Option<i16>,
    pub tags: Option<Vec<String>>,
    pub sort_by: Option<ServiceSortBy>,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum ServiceSortBy {
    Relevance,
    PriceLowToHigh,
    PriceHighToLow,
    Rating,
    DeliveryTime,
    Popularity,
    Newest,
}

