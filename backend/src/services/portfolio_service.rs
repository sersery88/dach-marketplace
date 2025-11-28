use uuid::Uuid;
use crate::db::Database;
use crate::models::{PortfolioItem, CreatePortfolioItemRequest, UpdatePortfolioItemRequest};

pub struct PortfolioService;

impl PortfolioService {
    /// Create a portfolio item
    pub async fn create(
        db: &Database,
        expert_id: Uuid,
        req: CreatePortfolioItemRequest,
    ) -> Result<PortfolioItem, sqlx::Error> {
        let item: PortfolioItem = sqlx::query_as(
            r#"
            INSERT INTO portfolio_items (
                id, expert_id, title, description, project_url, image_urls,
                video_url, tools_used, category_id, client_name, client_testimonial,
                completion_date, is_featured, sort_order, created_at, updated_at
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, NOW(), NOW())
            RETURNING *
            "#,
        )
        .bind(Uuid::new_v4())
        .bind(expert_id)
        .bind(&req.title)
        .bind(&req.description)
        .bind(&req.project_url)
        .bind(&req.image_urls.unwrap_or_default())
        .bind(&req.video_url)
        .bind(&req.tools_used.unwrap_or_default())
        .bind(req.category_id)
        .bind(&req.client_name)
        .bind(&req.client_testimonial)
        .bind(req.completion_date)
        .bind(req.is_featured.unwrap_or(false))
        .bind(req.sort_order.unwrap_or(0))
        .fetch_one(&db.pool)
        .await?;

        Ok(item)
    }

    /// Get portfolio item by ID
    pub async fn get_by_id(db: &Database, id: Uuid) -> Result<Option<PortfolioItem>, sqlx::Error> {
        let item = sqlx::query_as::<_, PortfolioItem>("SELECT * FROM portfolio_items WHERE id = $1")
            .bind(id)
            .fetch_optional(&db.pool)
            .await?;
        Ok(item)
    }

    /// Get all portfolio items for an expert
    pub async fn get_by_expert(db: &Database, expert_id: Uuid) -> Result<Vec<PortfolioItem>, sqlx::Error> {
        let items: Vec<PortfolioItem> = sqlx::query_as(
            r#"
            SELECT * FROM portfolio_items 
            WHERE expert_id = $1 
            ORDER BY sort_order ASC, created_at DESC
            "#,
        )
        .bind(expert_id)
        .fetch_all(&db.pool)
        .await?;

        Ok(items)
    }

    /// Update a portfolio item
    pub async fn update(
        db: &Database,
        id: Uuid,
        req: UpdatePortfolioItemRequest,
    ) -> Result<PortfolioItem, sqlx::Error> {
        let item: PortfolioItem = sqlx::query_as(
            r#"
            UPDATE portfolio_items SET
                title = COALESCE($2, title),
                description = COALESCE($3, description),
                project_url = COALESCE($4, project_url),
                image_urls = COALESCE($5, image_urls),
                video_url = COALESCE($6, video_url),
                tools_used = COALESCE($7, tools_used),
                category_id = COALESCE($8, category_id),
                client_name = COALESCE($9, client_name),
                client_testimonial = COALESCE($10, client_testimonial),
                completion_date = COALESCE($11, completion_date),
                is_featured = COALESCE($12, is_featured),
                sort_order = COALESCE($13, sort_order),
                updated_at = NOW()
            WHERE id = $1
            RETURNING *
            "#,
        )
        .bind(id)
        .bind(&req.title)
        .bind(&req.description)
        .bind(&req.project_url)
        .bind(&req.image_urls)
        .bind(&req.video_url)
        .bind(&req.tools_used)
        .bind(req.category_id)
        .bind(&req.client_name)
        .bind(&req.client_testimonial)
        .bind(req.completion_date)
        .bind(req.is_featured)
        .bind(req.sort_order)
        .fetch_one(&db.pool)
        .await?;

        Ok(item)
    }

    /// Delete a portfolio item
    pub async fn delete(db: &Database, id: Uuid) -> Result<(), sqlx::Error> {
        sqlx::query("DELETE FROM portfolio_items WHERE id = $1")
            .bind(id)
            .execute(&db.pool)
            .await?;
        Ok(())
    }
}

