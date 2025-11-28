use axum::{extract::{State, Query}, Json};
use serde::{Deserialize, Serialize};
use sqlx::Row;
use uuid::Uuid;

use crate::AppState;
use crate::models::{PaginatedResponse, PaginationMeta, Category};
use super::{ApiError, ApiResult, SuccessResponse};

#[derive(Debug, Deserialize)]
pub struct SearchQuery {
    pub q: Option<String>,
    pub page: Option<u32>,
    pub per_page: Option<u32>,
}

#[derive(Debug, Deserialize)]
pub struct ExpertSearchQuery {
    pub q: Option<String>,
    pub skills: Option<String>,      // comma-separated
    pub tools: Option<String>,       // comma-separated
    pub countries: Option<String>,   // comma-separated
    pub min_rate: Option<i32>,
    pub max_rate: Option<i32>,
    pub min_rating: Option<f32>,
    pub verified_only: Option<bool>,
    pub sort_by: Option<String>,     // rating, hourly_rate, experience, newest
    pub page: Option<u32>,
    pub per_page: Option<u32>,
}

#[derive(Debug, Deserialize)]
pub struct ServiceSearchQuery {
    pub q: Option<String>,
    pub category_id: Option<Uuid>,
    pub min_price: Option<i32>,
    pub max_price: Option<i32>,
    pub min_rating: Option<f32>,
    pub max_delivery_days: Option<i16>,
    pub tags: Option<String>,        // comma-separated
    pub sort_by: Option<String>,     // price_asc, price_desc, rating, delivery, newest
    pub page: Option<u32>,
    pub per_page: Option<u32>,
}

#[derive(Debug, Serialize)]
pub struct SearchSuggestion {
    pub text: String,
    pub category: String,
    pub count: i64,
}

#[derive(Debug, Serialize)]
pub struct UnifiedSearchResult {
    pub experts: Vec<ExpertSearchResult>,
    pub services: Vec<ServiceSearchResult>,
    pub categories: Vec<Category>,
    pub suggestions: Vec<SearchSuggestion>,
}

#[derive(Debug, Serialize)]
pub struct ExpertSearchResult {
    pub id: Uuid,
    pub user_id: Uuid,
    pub first_name: String,
    pub last_name: String,
    pub avatar_url: Option<String>,
    pub headline: String,
    pub hourly_rate: i32,
    pub currency: String,
    pub skills: Vec<String>,
    pub tools: Vec<String>,
    pub rating_average: f32,
    pub rating_count: i32,
    pub is_verified: bool,
    pub country: String,
}

#[derive(Debug, Serialize)]
pub struct ServiceSearchResult {
    pub id: Uuid,
    pub expert_id: Uuid,
    pub expert_name: String,
    pub expert_avatar: Option<String>,
    pub title: String,
    pub short_description: String,
    pub price: i32,
    pub currency: String,
    pub delivery_time_days: i16,
    pub rating_average: f32,
    pub rating_count: i32,
    pub category_name: String,
    pub tags: Vec<String>,
}

/// Unified search across experts and services
pub async fn unified_search(
    State(state): State<AppState>,
    Query(query): Query<SearchQuery>,
) -> ApiResult<UnifiedSearchResult> {
    let search_term = query.q.unwrap_or_default();
    let limit = query.per_page.unwrap_or(5) as i64;

    // Search experts
    let experts: Vec<ExpertSearchResult> = if search_term.is_empty() {
        vec![]
    } else {
        let search_pattern = format!("%{}%", search_term.to_lowercase());
        sqlx::query(
            r#"
            SELECT
                e.id, e.user_id, u.first_name, u.last_name, u.avatar_url,
                e.headline, e.hourly_rate, e.currency::text,
                e.skills, e.tools, e.rating_average, e.rating_count,
                e.is_verified, u.country::text
            FROM expert_profiles e
            JOIN users u ON e.user_id = u.id
            WHERE
                LOWER(e.headline) LIKE $1
                OR LOWER(e.bio) LIKE $1
                OR EXISTS (SELECT 1 FROM unnest(e.skills) s WHERE LOWER(s) LIKE $1)
                OR EXISTS (SELECT 1 FROM unnest(e.tools) t WHERE LOWER(t) LIKE $1)
            ORDER BY e.rating_average DESC, e.rating_count DESC
            LIMIT $2
            "#
        )
        .bind(&search_pattern)
        .bind(limit)
        .fetch_all(state.db.pool())
        .await
        .map_err(|e| ApiError::internal(e.to_string()))?
        .into_iter()
        .map(|row| ExpertSearchResult {
            id: row.get("id"),
            user_id: row.get("user_id"),
            first_name: row.get("first_name"),
            last_name: row.get("last_name"),
            avatar_url: row.get("avatar_url"),
            headline: row.get("headline"),
            hourly_rate: row.get("hourly_rate"),
            currency: row.get("currency"),
            skills: row.get("skills"),
            tools: row.get("tools"),
            rating_average: row.get("rating_average"),
            rating_count: row.get("rating_count"),
            is_verified: row.get("is_verified"),
            country: row.get("country"),
        })
        .collect()
    };

    // Search services
    let services: Vec<ServiceSearchResult> = if search_term.is_empty() {
        vec![]
    } else {
        let search_pattern = format!("%{}%", search_term.to_lowercase());
        sqlx::query(
            r#"
            SELECT
                s.id, s.expert_id,
                CONCAT(u.first_name, ' ', u.last_name) as expert_name,
                u.avatar_url as expert_avatar,
                s.title, s.short_description, s.price, s.currency::text,
                s.delivery_time_days, s.rating_average, s.rating_count,
                c.name as category_name, s.tags
            FROM services s
            JOIN expert_profiles e ON s.expert_id = e.id
            JOIN users u ON e.user_id = u.id
            JOIN categories c ON s.category_id = c.id
            WHERE s.is_active = true AND (
                LOWER(s.title) LIKE $1
                OR LOWER(s.description) LIKE $1
                OR LOWER(s.short_description) LIKE $1
                OR EXISTS (SELECT 1 FROM unnest(s.tags) t WHERE LOWER(t) LIKE $1)
            )
            ORDER BY s.rating_average DESC, s.order_count DESC
            LIMIT $2
            "#
        )
        .bind(&search_pattern)
        .bind(limit)
        .fetch_all(state.db.pool())
        .await
        .map_err(|e| ApiError::internal(e.to_string()))?
        .into_iter()
        .map(|row| ServiceSearchResult {
            id: row.get("id"),
            expert_id: row.get("expert_id"),
            expert_name: row.get("expert_name"),
            expert_avatar: row.get("expert_avatar"),
            title: row.get("title"),
            short_description: row.get("short_description"),
            price: row.get("price"),
            currency: row.get("currency"),
            delivery_time_days: row.get("delivery_time_days"),
            rating_average: row.get("rating_average"),
            rating_count: row.get("rating_count"),
            category_name: row.get("category_name"),
            tags: row.get("tags"),
        })
        .collect()
    };

    // Search categories
    let categories: Vec<Category> = if search_term.is_empty() {
        vec![]
    } else {
        let search_pattern = format!("%{}%", search_term.to_lowercase());
        sqlx::query_as::<_, Category>(
            r#"
            SELECT id, parent_id, name, slug, description, icon, image_url,
                   sort_order, is_active, created_at, updated_at
            FROM categories
            WHERE is_active = true AND (
                LOWER(name) LIKE $1
                OR LOWER(description) LIKE $1
            )
            ORDER BY sort_order
            LIMIT $2
            "#
        )
        .bind(&search_pattern)
        .bind(limit)
        .fetch_all(state.db.pool())
        .await
        .map_err(|e| ApiError::internal(e.to_string()))?
    };

    // Get suggestions from popular skills and tools
    let suggestions = get_search_suggestions(&state, &search_term, 5).await?;

    Ok(Json(SuccessResponse::new(UnifiedSearchResult {
        experts,
        services,
        categories,
        suggestions,
    })))
}

/// Search experts with filters
pub async fn search_experts(
    State(state): State<AppState>,
    Query(query): Query<ExpertSearchQuery>,
) -> ApiResult<PaginatedResponse<ExpertSearchResult>> {
    let page = query.page.unwrap_or(1).max(1);
    let per_page = query.per_page.unwrap_or(20).min(100);
    let offset = ((page - 1) * per_page) as i64;
    let limit = per_page as i64;

    let search_pattern = query.q.as_ref()
        .map(|q| format!("%{}%", q.to_lowercase()))
        .unwrap_or_else(|| "%".to_string());

    let skills_filter: Vec<String> = query.skills
        .as_ref()
        .map(|s| s.split(',').map(|x| x.trim().to_lowercase()).collect())
        .unwrap_or_default();

    let tools_filter: Vec<String> = query.tools
        .as_ref()
        .map(|s| s.split(',').map(|x| x.trim().to_lowercase()).collect())
        .unwrap_or_default();

    let countries_filter: Vec<String> = query.countries
        .as_ref()
        .map(|s| s.split(',').map(|x| x.trim().to_lowercase()).collect())
        .unwrap_or_default();

    let min_rate = query.min_rate.unwrap_or(0);
    let max_rate = query.max_rate.unwrap_or(i32::MAX);
    let min_rating = query.min_rating.unwrap_or(0.0);
    let verified_only = query.verified_only.unwrap_or(false);

    let sort_clause = match query.sort_by.as_deref() {
        Some("rating") => "e.rating_average DESC, e.rating_count DESC",
        Some("hourly_rate") => "e.hourly_rate ASC",
        Some("hourly_rate_desc") => "e.hourly_rate DESC",
        Some("experience") => "e.years_experience DESC",
        Some("newest") => "e.created_at DESC",
        _ => "e.rating_average DESC, e.rating_count DESC",
    };

    // Build dynamic query
    let query_str = format!(
        r#"
        SELECT
            e.id, e.user_id, u.first_name, u.last_name, u.avatar_url,
            e.headline, e.hourly_rate, e.currency::text,
            e.skills, e.tools, e.rating_average, e.rating_count,
            e.is_verified, u.country::text
        FROM expert_profiles e
        JOIN users u ON e.user_id = u.id
        WHERE
            (LOWER(e.headline) LIKE $1 OR LOWER(e.bio) LIKE $1 OR $1 = '%')
            AND e.hourly_rate >= $2
            AND e.hourly_rate <= $3
            AND e.rating_average >= $4
            AND ($5 = false OR e.is_verified = true)
            AND ($6::text[] = '{{}}' OR e.skills && $6)
            AND ($7::text[] = '{{}}' OR e.tools && $7)
            AND ($8::text[] = '{{}}' OR LOWER(u.country::text) = ANY($8))
        ORDER BY {}
        LIMIT $9 OFFSET $10
        "#,
        sort_clause
    );

    let experts: Vec<ExpertSearchResult> = sqlx::query(&query_str)
        .bind(&search_pattern)
        .bind(min_rate)
        .bind(max_rate)
        .bind(min_rating)
        .bind(verified_only)
        .bind(&skills_filter)
        .bind(&tools_filter)
        .bind(&countries_filter)
        .bind(limit)
        .bind(offset)
        .fetch_all(state.db.pool())
        .await
        .map_err(|e| ApiError::internal(e.to_string()))?
        .into_iter()
        .map(|row| ExpertSearchResult {
            id: row.get("id"),
            user_id: row.get("user_id"),
            first_name: row.get("first_name"),
            last_name: row.get("last_name"),
            avatar_url: row.get("avatar_url"),
            headline: row.get("headline"),
            hourly_rate: row.get("hourly_rate"),
            currency: row.get("currency"),
            skills: row.get("skills"),
            tools: row.get("tools"),
            rating_average: row.get("rating_average"),
            rating_count: row.get("rating_count"),
            is_verified: row.get("is_verified"),
            country: row.get("country"),
        })
        .collect();

    // Get total count
    let count_query = format!(
        r#"
        SELECT COUNT(*) as count
        FROM expert_profiles e
        JOIN users u ON e.user_id = u.id
        WHERE
            (LOWER(e.headline) LIKE $1 OR LOWER(e.bio) LIKE $1 OR $1 = '%')
            AND e.hourly_rate >= $2
            AND e.hourly_rate <= $3
            AND e.rating_average >= $4
            AND ($5 = false OR e.is_verified = true)
            AND ($6::text[] = '{{}}' OR e.skills && $6)
            AND ($7::text[] = '{{}}' OR e.tools && $7)
            AND ($8::text[] = '{{}}' OR LOWER(u.country::text) = ANY($8))
        "#
    );

    let total: i64 = sqlx::query(&count_query)
        .bind(&search_pattern)
        .bind(min_rate)
        .bind(max_rate)
        .bind(min_rating)
        .bind(verified_only)
        .bind(&skills_filter)
        .bind(&tools_filter)
        .bind(&countries_filter)
        .fetch_one(state.db.pool())
        .await
        .map_err(|e| ApiError::internal(e.to_string()))?
        .get("count");

    Ok(Json(SuccessResponse::new(PaginatedResponse {
        data: experts,
        meta: PaginationMeta::new(page, per_page, total),
    })))
}

/// Search services with filters
pub async fn search_services(
    State(state): State<AppState>,
    Query(query): Query<ServiceSearchQuery>,
) -> ApiResult<PaginatedResponse<ServiceSearchResult>> {
    let page = query.page.unwrap_or(1).max(1);
    let per_page = query.per_page.unwrap_or(20).min(100);
    let offset = ((page - 1) * per_page) as i64;
    let limit = per_page as i64;

    let search_pattern = query.q.as_ref()
        .map(|q| format!("%{}%", q.to_lowercase()))
        .unwrap_or_else(|| "%".to_string());

    let tags_filter: Vec<String> = query.tags
        .as_ref()
        .map(|s| s.split(',').map(|x| x.trim().to_lowercase()).collect())
        .unwrap_or_default();

    let min_price = query.min_price.unwrap_or(0);
    let max_price = query.max_price.unwrap_or(i32::MAX);
    let min_rating = query.min_rating.unwrap_or(0.0);
    let max_delivery = query.max_delivery_days.unwrap_or(i16::MAX);

    let sort_clause = match query.sort_by.as_deref() {
        Some("price_asc") => "s.price ASC",
        Some("price_desc") => "s.price DESC",
        Some("rating") => "s.rating_average DESC, s.rating_count DESC",
        Some("delivery") => "s.delivery_time_days ASC",
        Some("popularity") => "s.order_count DESC",
        Some("newest") => "s.created_at DESC",
        _ => "s.rating_average DESC, s.order_count DESC",
    };

    let query_str = format!(
        r#"
        SELECT
            s.id, s.expert_id,
            CONCAT(u.first_name, ' ', u.last_name) as expert_name,
            u.avatar_url as expert_avatar,
            s.title, s.short_description, s.price, s.currency::text,
            s.delivery_time_days, s.rating_average, s.rating_count,
            c.name as category_name, s.tags
        FROM services s
        JOIN expert_profiles e ON s.expert_id = e.id
        JOIN users u ON e.user_id = u.id
        JOIN categories c ON s.category_id = c.id
        WHERE s.is_active = true
            AND (LOWER(s.title) LIKE $1 OR LOWER(s.description) LIKE $1 OR $1 = '%')
            AND s.price >= $2
            AND s.price <= $3
            AND s.rating_average >= $4
            AND s.delivery_time_days <= $5
            AND ($6::uuid IS NULL OR s.category_id = $6)
            AND ($7::text[] = '{{}}' OR s.tags && $7)
        ORDER BY {}
        LIMIT $8 OFFSET $9
        "#,
        sort_clause
    );

    let services: Vec<ServiceSearchResult> = sqlx::query(&query_str)
        .bind(&search_pattern)
        .bind(min_price)
        .bind(max_price)
        .bind(min_rating)
        .bind(max_delivery)
        .bind(query.category_id)
        .bind(&tags_filter)
        .bind(limit)
        .bind(offset)
        .fetch_all(state.db.pool())
        .await
        .map_err(|e| ApiError::internal(e.to_string()))?
        .into_iter()
        .map(|row| ServiceSearchResult {
            id: row.get("id"),
            expert_id: row.get("expert_id"),
            expert_name: row.get("expert_name"),
            expert_avatar: row.get("expert_avatar"),
            title: row.get("title"),
            short_description: row.get("short_description"),
            price: row.get("price"),
            currency: row.get("currency"),
            delivery_time_days: row.get("delivery_time_days"),
            rating_average: row.get("rating_average"),
            rating_count: row.get("rating_count"),
            category_name: row.get("category_name"),
            tags: row.get("tags"),
        })
        .collect();

    // Get total count
    let count_query = r#"
        SELECT COUNT(*) as count
        FROM services s
        JOIN expert_profiles e ON s.expert_id = e.id
        JOIN categories c ON s.category_id = c.id
        WHERE s.is_active = true
            AND (LOWER(s.title) LIKE $1 OR LOWER(s.description) LIKE $1 OR $1 = '%')
            AND s.price >= $2
            AND s.price <= $3
            AND s.rating_average >= $4
            AND s.delivery_time_days <= $5
            AND ($6::uuid IS NULL OR s.category_id = $6)
            AND ($7::text[] = '{}' OR s.tags && $7)
    "#;

    let total: i64 = sqlx::query(count_query)
        .bind(&search_pattern)
        .bind(min_price)
        .bind(max_price)
        .bind(min_rating)
        .bind(max_delivery)
        .bind(query.category_id)
        .bind(&tags_filter)
        .fetch_one(state.db.pool())
        .await
        .map_err(|e| ApiError::internal(e.to_string()))?
        .get("count");

    Ok(Json(SuccessResponse::new(PaginatedResponse {
        data: services,
        meta: PaginationMeta::new(page, per_page, total),
    })))
}

/// Get search suggestions (autocomplete)
pub async fn get_suggestions(
    State(state): State<AppState>,
    Query(query): Query<SearchQuery>,
) -> ApiResult<Vec<SearchSuggestion>> {
    let search_term = query.q.unwrap_or_default();
    let limit = query.per_page.unwrap_or(10) as i64;

    let suggestions = get_search_suggestions(&state, &search_term, limit).await?;
    Ok(Json(SuccessResponse::new(suggestions)))
}

async fn get_search_suggestions(
    state: &AppState,
    search_term: &str,
    limit: i64,
) -> Result<Vec<SearchSuggestion>, ApiError> {
    if search_term.is_empty() {
        return Ok(vec![]);
    }

    let search_pattern = format!("{}%", search_term.to_lowercase());

    // Get suggestions from skills
    let skill_suggestions: Vec<SearchSuggestion> = sqlx::query(
        r#"
        SELECT skill as text, 'skill' as category, COUNT(*) as count
        FROM expert_profiles, unnest(skills) as skill
        WHERE LOWER(skill) LIKE $1
        GROUP BY skill
        ORDER BY count DESC
        LIMIT $2
        "#
    )
    .bind(&search_pattern)
    .bind(limit / 2)
    .fetch_all(state.db.pool())
    .await
    .map_err(|e| ApiError::internal(e.to_string()))?
    .into_iter()
    .map(|row| SearchSuggestion {
        text: row.get("text"),
        category: row.get("category"),
        count: row.get("count"),
    })
    .collect();

    // Get suggestions from tools
    let tool_suggestions: Vec<SearchSuggestion> = sqlx::query(
        r#"
        SELECT tool as text, 'tool' as category, COUNT(*) as count
        FROM expert_profiles, unnest(tools) as tool
        WHERE LOWER(tool) LIKE $1
        GROUP BY tool
        ORDER BY count DESC
        LIMIT $2
        "#
    )
    .bind(&search_pattern)
    .bind(limit / 2)
    .fetch_all(state.db.pool())
    .await
    .map_err(|e| ApiError::internal(e.to_string()))?
    .into_iter()
    .map(|row| SearchSuggestion {
        text: row.get("text"),
        category: row.get("category"),
        count: row.get("count"),
    })
    .collect();

    let mut suggestions = skill_suggestions;
    suggestions.extend(tool_suggestions);
    suggestions.sort_by(|a, b| b.count.cmp(&a.count));
    suggestions.truncate(limit as usize);

    Ok(suggestions)
}

