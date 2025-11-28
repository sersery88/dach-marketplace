use axum::{extract::{Path, State, Query}, Json};
use uuid::Uuid;

use crate::AppState;
use crate::models::{Category, CategoryTree, Service, PaginationParams, PaginatedResponse, PaginationMeta};
use super::{ApiError, ApiResult, SuccessResponse};

/// List all categories
pub async fn list_categories(
    State(state): State<AppState>,
) -> ApiResult<Vec<Category>> {
    let categories: Vec<Category> = sqlx::query_as::<_, Category>(
        r#"
        SELECT id, parent_id, name, name_de, slug, description, description_de,
               icon, image_url, is_active, is_featured, sort_order, service_count,
               created_at, updated_at
        FROM categories
        WHERE is_active = true
        ORDER BY sort_order, name
        "#
    )
    .fetch_all(state.db.pool())
    .await
    .map_err(|e| ApiError::internal(e.to_string()))?;

    Ok(Json(SuccessResponse::new(categories)))
}

/// Get category tree (hierarchical)
pub async fn get_category_tree(
    State(state): State<AppState>,
) -> ApiResult<Vec<CategoryTree>> {
    let categories: Vec<Category> = sqlx::query_as::<_, Category>(
        r#"
        SELECT id, parent_id, name, name_de, slug, description, description_de,
               icon, image_url, is_active, is_featured, sort_order, service_count,
               created_at, updated_at
        FROM categories
        WHERE is_active = true
        ORDER BY sort_order, name
        "#
    )
    .fetch_all(state.db.pool())
    .await
    .map_err(|e| ApiError::internal(e.to_string()))?;

    // Build tree structure
    let tree = build_category_tree(&categories, None);
    Ok(Json(SuccessResponse::new(tree)))
}

fn build_category_tree(categories: &[Category], parent_id: Option<Uuid>) -> Vec<CategoryTree> {
    categories
        .iter()
        .filter(|c| c.parent_id == parent_id)
        .map(|c| CategoryTree {
            category: c.clone(),
            children: build_category_tree(categories, Some(c.id)),
        })
        .collect()
}

/// Get category by ID or slug
pub async fn get_category(
    State(state): State<AppState>,
    Path(id_or_slug): Path<String>,
) -> ApiResult<Category> {
    // Try to parse as UUID first, otherwise treat as slug
    let category: Option<Category> = if let Ok(uuid) = Uuid::parse_str(&id_or_slug) {
        sqlx::query_as::<_, Category>(
            r#"
            SELECT id, parent_id, name, name_de, slug, description, description_de,
                   icon, image_url, is_active, is_featured, sort_order, service_count,
                   created_at, updated_at
            FROM categories
            WHERE id = $1 AND is_active = true
            "#
        )
        .bind(uuid)
        .fetch_optional(state.db.pool())
        .await
        .map_err(|e| ApiError::internal(e.to_string()))?
    } else {
        sqlx::query_as::<_, Category>(
            r#"
            SELECT id, parent_id, name, name_de, slug, description, description_de,
                   icon, image_url, is_active, is_featured, sort_order, service_count,
                   created_at, updated_at
            FROM categories
            WHERE slug = $1 AND is_active = true
            "#
        )
        .bind(&id_or_slug)
        .fetch_optional(state.db.pool())
        .await
        .map_err(|e| ApiError::internal(e.to_string()))?
    };

    match category {
        Some(c) => Ok(Json(SuccessResponse::new(c))),
        None => Err(ApiError::NotFound("Category not found".to_string())),
    }
}

/// Get services in category
pub async fn get_category_services(
    State(state): State<AppState>,
    Path(id_or_slug): Path<String>,
    Query(pagination): Query<PaginationParams>,
) -> ApiResult<PaginatedResponse<Service>> {
    use sqlx::Row;

    let page = pagination.page.max(1);
    let per_page = pagination.per_page.min(100);
    let offset = ((page - 1) * per_page) as i64;
    let limit = per_page as i64;

    // Get category ID
    let category_id: Option<Uuid> = if let Ok(uuid) = Uuid::parse_str(&id_or_slug) {
        Some(uuid)
    } else {
        sqlx::query("SELECT id FROM categories WHERE slug = $1")
            .bind(&id_or_slug)
            .fetch_optional(state.db.pool())
            .await
            .map_err(|e| ApiError::internal(e.to_string()))?
            .map(|row| row.get("id"))
    };

    let category_id = category_id.ok_or_else(|| ApiError::NotFound("Category not found".to_string()))?;

    // Get services using query_as
    let services: Vec<Service> = sqlx::query_as::<_, Service>(
        r#"
        SELECT id, expert_id, category_id, title, slug, description, short_description,
               pricing_type, price, currency, delivery_time_days, revisions_included,
               features, requirements, tags, images, video_url, is_active, is_featured,
               view_count, order_count, rating_average, rating_count, created_at, updated_at
        FROM services
        WHERE category_id = $1 AND is_active = true
        ORDER BY is_featured DESC, rating_average DESC, order_count DESC
        LIMIT $2 OFFSET $3
        "#
    )
    .bind(category_id)
    .bind(limit)
    .bind(offset)
    .fetch_all(state.db.pool())
    .await
    .map_err(|e| ApiError::internal(e.to_string()))?;

    // Get total count
    let total: i64 = sqlx::query("SELECT COUNT(*) as count FROM services WHERE category_id = $1 AND is_active = true")
        .bind(category_id)
        .fetch_one(state.db.pool())
        .await
        .map_err(|e| ApiError::internal(e.to_string()))?
        .get("count");

    Ok(Json(SuccessResponse::new(PaginatedResponse {
        data: services,
        meta: PaginationMeta::new(page, per_page, total),
    })))
}

/// Get featured categories
pub async fn get_featured_categories(
    State(state): State<AppState>,
) -> ApiResult<Vec<Category>> {
    let categories: Vec<Category> = sqlx::query_as::<_, Category>(
        r#"
        SELECT id, parent_id, name, name_de, slug, description, description_de,
               icon, image_url, is_active, is_featured, sort_order, service_count,
               created_at, updated_at
        FROM categories
        WHERE is_featured = true AND is_active = true
        ORDER BY sort_order, name
        LIMIT 8
        "#
    )
    .fetch_all(state.db.pool())
    .await
    .map_err(|e| ApiError::internal(e.to_string()))?;

    Ok(Json(SuccessResponse::new(categories)))
}

