use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use sqlx::FromRow;
use uuid::Uuid;
use validator::Validate;

/// Service category - hierarchical categories for automation services
#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
#[serde(rename_all = "camelCase")]
pub struct Category {
    pub id: Uuid,
    pub parent_id: Option<Uuid>,
    pub name: String,
    pub name_de: String,            // German name
    pub slug: String,
    pub description: Option<String>,
    pub description_de: Option<String>,
    pub icon: Option<String>,       // Icon class or URL
    pub image_url: Option<String>,
    pub is_active: bool,
    pub is_featured: bool,
    pub sort_order: i16,
    pub service_count: i32,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

/// Category with children (for tree structure)
#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct CategoryTree {
    #[serde(flatten)]
    pub category: Category,
    pub children: Vec<CategoryTree>,
}

/// Create category request (admin only)
#[derive(Debug, Deserialize, Validate)]
#[serde(rename_all = "camelCase")]
pub struct CreateCategoryRequest {
    pub parent_id: Option<Uuid>,
    
    #[validate(length(min = 2, max = 100))]
    pub name: String,
    
    #[validate(length(min = 2, max = 100))]
    pub name_de: String,
    
    #[validate(length(max = 500))]
    pub description: Option<String>,
    
    #[validate(length(max = 500))]
    pub description_de: Option<String>,
    
    pub icon: Option<String>,
    pub image_url: Option<String>,
    pub sort_order: Option<i16>,
}

/// Predefined automation service categories
pub fn get_default_categories() -> Vec<CreateCategoryRequest> {
    vec![
        // Main Categories
        CreateCategoryRequest {
            parent_id: None,
            name: "Workflow Automation".to_string(),
            name_de: "Workflow-Automatisierung".to_string(),
            description: Some("Automate repetitive tasks and business processes".to_string()),
            description_de: Some("Automatisieren Sie wiederkehrende Aufgaben und Geschäftsprozesse".to_string()),
            icon: Some("workflow".to_string()),
            image_url: None,
            sort_order: Some(1),
        },
        CreateCategoryRequest {
            parent_id: None,
            name: "AI & Machine Learning".to_string(),
            name_de: "KI & Maschinelles Lernen".to_string(),
            description: Some("AI-powered solutions and intelligent automation".to_string()),
            description_de: Some("KI-gestützte Lösungen und intelligente Automatisierung".to_string()),
            icon: Some("brain".to_string()),
            image_url: None,
            sort_order: Some(2),
        },
        CreateCategoryRequest {
            parent_id: None,
            name: "Data Integration".to_string(),
            name_de: "Datenintegration".to_string(),
            description: Some("Connect and sync data across systems".to_string()),
            description_de: Some("Verbinden und synchronisieren Sie Daten über Systeme hinweg".to_string()),
            icon: Some("database".to_string()),
            image_url: None,
            sort_order: Some(3),
        },
        CreateCategoryRequest {
            parent_id: None,
            name: "CRM Automation".to_string(),
            name_de: "CRM-Automatisierung".to_string(),
            description: Some("Automate customer relationship management".to_string()),
            description_de: Some("Automatisieren Sie das Kundenbeziehungsmanagement".to_string()),
            icon: Some("users".to_string()),
            image_url: None,
            sort_order: Some(4),
        },
        CreateCategoryRequest {
            parent_id: None,
            name: "E-Commerce Automation".to_string(),
            name_de: "E-Commerce-Automatisierung".to_string(),
            description: Some("Automate online store operations".to_string()),
            description_de: Some("Automatisieren Sie Online-Shop-Operationen".to_string()),
            icon: Some("shopping-cart".to_string()),
            image_url: None,
            sort_order: Some(5),
        },
        CreateCategoryRequest {
            parent_id: None,
            name: "Marketing Automation".to_string(),
            name_de: "Marketing-Automatisierung".to_string(),
            description: Some("Automate marketing campaigns and analytics".to_string()),
            description_de: Some("Automatisieren Sie Marketingkampagnen und Analysen".to_string()),
            icon: Some("megaphone".to_string()),
            image_url: None,
            sort_order: Some(6),
        },
        CreateCategoryRequest {
            parent_id: None,
            name: "Document Processing".to_string(),
            name_de: "Dokumentenverarbeitung".to_string(),
            description: Some("Automate document handling and OCR".to_string()),
            description_de: Some("Automatisieren Sie Dokumentenverarbeitung und OCR".to_string()),
            icon: Some("file-text".to_string()),
            image_url: None,
            sort_order: Some(7),
        },
        CreateCategoryRequest {
            parent_id: None,
            name: "Chatbots & Assistants".to_string(),
            name_de: "Chatbots & Assistenten".to_string(),
            description: Some("Build intelligent conversational agents".to_string()),
            description_de: Some("Erstellen Sie intelligente Konversationsagenten".to_string()),
            icon: Some("message-circle".to_string()),
            image_url: None,
            sort_order: Some(8),
        },
    ]
}

