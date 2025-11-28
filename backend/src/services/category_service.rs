use sqlx::PgPool;
use uuid::Uuid;

use crate::models::{Category, CreateCategoryRequest};

pub struct CategoryService;

impl CategoryService {
    /// Create a new category
    pub async fn create(pool: &PgPool, req: CreateCategoryRequest) -> Result<Category, sqlx::Error> {
        let slug = Self::generate_slug(&req.name);
        let sort_order = req.sort_order.unwrap_or(0);

        let category = sqlx::query_as::<_, Category>(
            r#"
            INSERT INTO categories (
                parent_id, name, name_de, slug, description, description_de,
                icon, image_url, is_active, is_featured, sort_order, service_count
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, true, false, $9, 0)
            RETURNING *
            "#
        )
        .bind(req.parent_id)
        .bind(&req.name)
        .bind(&req.name_de)
        .bind(&slug)
        .bind(&req.description)
        .bind(&req.description_de)
        .bind(&req.icon)
        .bind(&req.image_url)
        .bind(sort_order)
        .fetch_one(pool)
        .await?;

        Ok(category)
    }

    /// Update an existing category
    pub async fn update(pool: &PgPool, id: Uuid, req: CreateCategoryRequest) -> Result<Category, sqlx::Error> {
        let slug = Self::generate_slug(&req.name);
        let sort_order = req.sort_order.unwrap_or(0);

        let category = sqlx::query_as::<_, Category>(
            r#"
            UPDATE categories SET
                parent_id = $2,
                name = $3,
                name_de = $4,
                slug = $5,
                description = $6,
                description_de = $7,
                icon = $8,
                image_url = $9,
                sort_order = $10,
                updated_at = NOW()
            WHERE id = $1
            RETURNING *
            "#
        )
        .bind(id)
        .bind(req.parent_id)
        .bind(&req.name)
        .bind(&req.name_de)
        .bind(&slug)
        .bind(&req.description)
        .bind(&req.description_de)
        .bind(&req.icon)
        .bind(&req.image_url)
        .bind(sort_order)
        .fetch_one(pool)
        .await?;

        Ok(category)
    }

    /// Delete a category (soft delete)
    pub async fn delete(pool: &PgPool, id: Uuid) -> Result<(), sqlx::Error> {
        sqlx::query("UPDATE categories SET is_active = false, updated_at = NOW() WHERE id = $1")
            .bind(id)
            .execute(pool)
            .await?;
        Ok(())
    }

    /// Get category by ID
    pub async fn get_by_id(pool: &PgPool, id: Uuid) -> Result<Option<Category>, sqlx::Error> {
        let category = sqlx::query_as::<_, Category>(
            "SELECT * FROM categories WHERE id = $1"
        )
        .bind(id)
        .fetch_optional(pool)
        .await?;
        Ok(category)
    }

    /// Toggle featured status
    pub async fn toggle_featured(pool: &PgPool, id: Uuid) -> Result<Category, sqlx::Error> {
        let category = sqlx::query_as::<_, Category>(
            r#"
            UPDATE categories SET
                is_featured = NOT is_featured,
                updated_at = NOW()
            WHERE id = $1
            RETURNING *
            "#
        )
        .bind(id)
        .fetch_one(pool)
        .await?;
        Ok(category)
    }

    /// Generate slug from name
    fn generate_slug(name: &str) -> String {
        name.to_lowercase()
            .chars()
            .map(|c| if c.is_alphanumeric() { c } else { '-' })
            .collect::<String>()
            .split('-')
            .filter(|s| !s.is_empty())
            .collect::<Vec<_>>()
            .join("-")
    }
}

