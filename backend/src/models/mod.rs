pub mod user;
pub mod expert;
pub mod service;
pub mod category;
pub mod review;
pub mod message;
pub mod project;
pub mod portfolio;
pub mod availability;
pub mod client;
pub mod payment;
pub mod report;

pub use user::*;
pub use expert::*;
pub use service::*;
pub use category::*;
pub use review::*;
pub use message::*;
pub use project::*;
pub use portfolio::*;
pub use availability::*;
pub use client::*;
pub use payment::*;
pub use report::*;

use serde::{Deserialize, Serialize};

/// Common pagination parameters
#[derive(Debug, Deserialize)]
pub struct PaginationParams {
    #[serde(default = "default_page")]
    pub page: u32,
    #[serde(default = "default_per_page")]
    pub per_page: u32,
}

fn default_page() -> u32 { 1 }
fn default_per_page() -> u32 { 20 }

/// Paginated response wrapper
#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct PaginatedResponse<T> {
    pub data: Vec<T>,
    pub meta: PaginationMeta,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct PaginationMeta {
    pub current_page: u32,
    pub per_page: u32,
    pub total_items: i64,
    pub total_pages: u32,
    pub has_next: bool,
    pub has_prev: bool,
}

impl PaginationMeta {
    pub fn new(current_page: u32, per_page: u32, total_items: i64) -> Self {
        let total_pages = ((total_items as f64) / (per_page as f64)).ceil() as u32;
        Self {
            current_page,
            per_page,
            total_items,
            total_pages,
            has_next: current_page < total_pages,
            has_prev: current_page > 1,
        }
    }
}

/// Country enum for DACH region
#[derive(Debug, Clone, Serialize, Deserialize, sqlx::Type, PartialEq)]
#[sqlx(type_name = "country", rename_all = "lowercase")]
pub enum Country {
    #[serde(rename = "ch")]
    Switzerland,
    #[serde(rename = "de")]
    Germany,
    #[serde(rename = "at")]
    Austria,
}

/// Currency enum
#[derive(Debug, Clone, Serialize, Deserialize, sqlx::Type, PartialEq)]
#[sqlx(type_name = "currency", rename_all = "lowercase")]
pub enum Currency {
    CHF,
    EUR,
}

/// User role enum
#[derive(Debug, Clone, Serialize, Deserialize, sqlx::Type, PartialEq)]
#[sqlx(type_name = "user_role", rename_all = "lowercase")]
pub enum UserRole {
    Client,
    Expert,
    Admin,
}

impl std::fmt::Display for UserRole {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            UserRole::Client => write!(f, "client"),
            UserRole::Expert => write!(f, "expert"),
            UserRole::Admin => write!(f, "admin"),
        }
    }
}

/// Account status
#[derive(Debug, Clone, Serialize, Deserialize, sqlx::Type, PartialEq)]
#[sqlx(type_name = "account_status", rename_all = "lowercase")]
pub enum AccountStatus {
    Pending,
    Active,
    Suspended,
    Deleted,
}

/// Language preference
#[derive(Debug, Clone, Serialize, Deserialize, sqlx::Type, PartialEq)]
#[sqlx(type_name = "language", rename_all = "lowercase")]
pub enum Language {
    De, // German
    En, // English
    Fr, // French (for Swiss French speakers)
    It, // Italian (for Swiss Italian speakers)
}

