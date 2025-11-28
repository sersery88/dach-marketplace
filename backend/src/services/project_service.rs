use chrono::Utc;
use uuid::Uuid;

use crate::db::Database;
use crate::models::{Project, CreateProjectRequest, ProjectStatus, ProjectFilters, PaginationParams};

pub struct ProjectService;

impl ProjectService {
    /// Create a new project
    pub async fn create(
        db: &Database,
        client_id: Uuid,
        req: CreateProjectRequest,
    ) -> Result<Project, sqlx::Error> {
        let price = req.budget.unwrap_or(0);
        let (platform_fee, expert_payout) = Self::calculate_fees(price);

        sqlx::query_as::<_, Project>(
            r#"
            INSERT INTO projects (
                client_id, expert_id, service_id, package_id, title, description,
                requirements, price, currency, platform_fee, expert_payout,
                delivery_date, revisions_allowed
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, 2)
            RETURNING *
            "#
        )
        .bind(client_id)
        .bind(req.expert_id)
        .bind(req.service_id)
        .bind(req.package_id)
        .bind(&req.title)
        .bind(&req.description)
        .bind(&req.requirements)
        .bind(price)
        .bind(&req.currency)
        .bind(platform_fee)
        .bind(expert_payout)
        .bind(req.deadline)
        .fetch_one(&db.pool)
        .await
    }

    /// Get project by ID
    pub async fn get_by_id(db: &Database, id: Uuid) -> Result<Option<Project>, sqlx::Error> {
        sqlx::query_as::<_, Project>("SELECT * FROM projects WHERE id = $1")
            .bind(id)
            .fetch_optional(&db.pool)
            .await
    }

    /// Update project status
    pub async fn update_status(
        db: &Database,
        id: Uuid,
        status: ProjectStatus,
    ) -> Result<Project, sqlx::Error> {
        let now = Utc::now();

        // Update timestamps based on status
        let (delivered_at, completed_at, cancelled_at) = match status {
            ProjectStatus::Delivered => (Some(now), None, None),
            ProjectStatus::Completed => (None, Some(now), None),
            ProjectStatus::Cancelled => (None, None, Some(now)),
            _ => (None, None, None),
        };

        sqlx::query_as::<_, Project>(
            r#"
            UPDATE projects
            SET status = $2,
                updated_at = NOW(),
                delivered_at = COALESCE($3, delivered_at),
                completed_at = COALESCE($4, completed_at),
                cancelled_at = COALESCE($5, cancelled_at)
            WHERE id = $1
            RETURNING *
            "#
        )
        .bind(id)
        .bind(status)
        .bind(delivered_at)
        .bind(completed_at)
        .bind(cancelled_at)
        .fetch_one(&db.pool)
        .await
    }

    /// Deliver project (expert submits)
    pub async fn deliver(db: &Database, id: Uuid, _message: &str) -> Result<Project, sqlx::Error> {
        sqlx::query_as::<_, Project>(
            r#"
            UPDATE projects
            SET status = 'delivered', delivered_at = NOW(), updated_at = NOW()
            WHERE id = $1 AND status IN ('in_progress', 'revision')
            RETURNING *
            "#
        )
        .bind(id)
        .fetch_one(&db.pool)
        .await
    }

    /// Request revision (client)
    pub async fn request_revision(db: &Database, id: Uuid, _feedback: &str) -> Result<Project, sqlx::Error> {
        sqlx::query_as::<_, Project>(
            r#"
            UPDATE projects
            SET status = 'revision',
                revisions_used = revisions_used + 1,
                updated_at = NOW()
            WHERE id = $1 AND status = 'delivered' AND revisions_used < revisions_allowed
            RETURNING *
            "#
        )
        .bind(id)
        .fetch_one(&db.pool)
        .await
    }

    /// Complete project (client approves)
    pub async fn complete(db: &Database, id: Uuid) -> Result<Project, sqlx::Error> {
        sqlx::query_as::<_, Project>(
            r#"
            UPDATE projects
            SET status = 'completed', completed_at = NOW(), updated_at = NOW()
            WHERE id = $1 AND status = 'delivered'
            RETURNING *
            "#
        )
        .bind(id)
        .fetch_one(&db.pool)
        .await
    }

    /// Cancel project
    pub async fn cancel(db: &Database, id: Uuid, reason: Option<&str>) -> Result<Project, sqlx::Error> {
        sqlx::query_as::<_, Project>(
            r#"
            UPDATE projects
            SET status = 'cancelled',
                cancelled_at = NOW(),
                cancellation_reason = $2,
                updated_at = NOW()
            WHERE id = $1 AND status NOT IN ('completed', 'cancelled', 'refunded')
            RETURNING *
            "#
        )
        .bind(id)
        .bind(reason)
        .fetch_one(&db.pool)
        .await
    }

    /// Get projects for user (as client or expert)
    pub async fn get_for_user(
        db: &Database,
        user_id: Uuid,
        _filters: &ProjectFilters,
        pagination: &PaginationParams,
    ) -> Result<(Vec<Project>, i64), sqlx::Error> {
        let offset = (pagination.page.saturating_sub(1)) * pagination.per_page;

        // Count total
        let total: (i64,) = sqlx::query_as(
            "SELECT COUNT(*) FROM projects WHERE client_id = $1 OR expert_id = $1"
        )
        .bind(user_id)
        .fetch_one(&db.pool)
        .await?;

        // Fetch projects
        let projects = sqlx::query_as::<_, Project>(
            r#"
            SELECT * FROM projects
            WHERE client_id = $1 OR expert_id = $1
            ORDER BY created_at DESC
            LIMIT $2 OFFSET $3
            "#
        )
        .bind(user_id)
        .bind(pagination.per_page as i64)
        .bind(offset as i64)
        .fetch_all(&db.pool)
        .await?;

        Ok((projects, total.0))
    }

    /// Calculate platform fee (e.g., 10%)
    pub fn calculate_fees(price: i32) -> (i32, i32) {
        let platform_fee = (price as f64 * 0.10) as i32;
        let expert_payout = price - platform_fee;
        (platform_fee, expert_payout)
    }
}

