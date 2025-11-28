//! Admin service for platform management

use sqlx::PgPool;
use uuid::Uuid;

use crate::models::{User, AccountStatus, PaginationMeta};

pub struct AdminService;

#[derive(Debug, sqlx::FromRow)]
pub struct AdminStats {
    pub total_users: i64,
    pub total_experts: i64,
    pub total_clients: i64,
    pub total_services: i64,
    pub total_projects: i64,
    pub pending_verifications: i64,
}

#[derive(Debug, sqlx::FromRow)]
pub struct UserRow {
    pub id: Uuid,
    pub email: String,
    pub first_name: String,
    pub last_name: String,
    pub role: String,
    pub account_status: String,
    pub email_verified: bool,
    pub created_at: chrono::DateTime<chrono::Utc>,
    pub updated_at: chrono::DateTime<chrono::Utc>,
}

impl AdminService {
    /// Get platform statistics
    pub async fn get_stats(pool: &PgPool) -> Result<AdminStats, sqlx::Error> {
        let stats = sqlx::query_as::<_, AdminStats>(
            r#"
            SELECT 
                (SELECT COUNT(*) FROM users) as total_users,
                (SELECT COUNT(*) FROM users WHERE role = 'expert') as total_experts,
                (SELECT COUNT(*) FROM users WHERE role = 'client') as total_clients,
                (SELECT COUNT(*) FROM services) as total_services,
                (SELECT COUNT(*) FROM projects) as total_projects,
                (SELECT COUNT(*) FROM expert_profiles WHERE is_verified = false) as pending_verifications
            "#
        )
        .fetch_one(pool)
        .await?;

        Ok(stats)
    }

    /// List all users with pagination
    pub async fn list_users(
        pool: &PgPool,
        page: i64,
        per_page: i64,
        role_filter: Option<&str>,
        status_filter: Option<&str>,
    ) -> Result<(Vec<UserRow>, PaginationMeta), sqlx::Error> {
        let offset = (page - 1) * per_page;

        // Build dynamic query based on filters
        let mut query = String::from(
            "SELECT id, email, first_name, last_name, role, account_status, email_verified, created_at, updated_at FROM users WHERE 1=1"
        );
        let mut count_query = String::from("SELECT COUNT(*) FROM users WHERE 1=1");

        if let Some(role) = role_filter {
            query.push_str(&format!(" AND role = '{}'", role));
            count_query.push_str(&format!(" AND role = '{}'", role));
        }

        if let Some(status) = status_filter {
            query.push_str(&format!(" AND account_status = '{}'", status));
            count_query.push_str(&format!(" AND account_status = '{}'", status));
        }

        query.push_str(" ORDER BY created_at DESC LIMIT $1 OFFSET $2");

        let users = sqlx::query_as::<_, UserRow>(&query)
            .bind(per_page)
            .bind(offset)
            .fetch_all(pool)
            .await?;

        let total: (i64,) = sqlx::query_as(&count_query)
            .fetch_one(pool)
            .await?;

        let meta = PaginationMeta::new(page as u32, per_page as u32, total.0);

        Ok((users, meta))
    }

    /// Get user by ID
    pub async fn get_user(pool: &PgPool, user_id: Uuid) -> Result<Option<UserRow>, sqlx::Error> {
        let user = sqlx::query_as::<_, UserRow>(
            "SELECT id, email, first_name, last_name, role, account_status, email_verified, created_at, updated_at FROM users WHERE id = $1"
        )
        .bind(user_id)
        .fetch_optional(pool)
        .await?;

        Ok(user)
    }

    /// Update user account status
    pub async fn update_user_status(
        pool: &PgPool,
        user_id: Uuid,
        status: AccountStatus,
    ) -> Result<UserRow, sqlx::Error> {
        let status_str = match status {
            AccountStatus::Active => "active",
            AccountStatus::Suspended => "suspended",
            AccountStatus::Pending => "pending",
            AccountStatus::Deleted => "deleted",
        };

        let user = sqlx::query_as::<_, UserRow>(
            r#"
            UPDATE users
            SET account_status = $1, updated_at = NOW()
            WHERE id = $2
            RETURNING id, email, first_name, last_name, role, account_status, email_verified, created_at, updated_at
            "#
        )
        .bind(status_str)
        .bind(user_id)
        .fetch_one(pool)
        .await?;

        Ok(user)
    }

    /// Verify expert profile
    pub async fn verify_expert(pool: &PgPool, user_id: Uuid) -> Result<(), sqlx::Error> {
        sqlx::query(
            "UPDATE expert_profiles SET is_verified = true, updated_at = NOW() WHERE user_id = $1"
        )
        .bind(user_id)
        .execute(pool)
        .await?;

        Ok(())
    }

    /// Delete user (soft delete by setting status to banned)
    pub async fn delete_user(pool: &PgPool, user_id: Uuid) -> Result<(), sqlx::Error> {
        sqlx::query(
            "UPDATE users SET account_status = 'banned', updated_at = NOW() WHERE id = $1"
        )
        .bind(user_id)
        .execute(pool)
        .await?;

        Ok(())
    }

    /// Get pending expert verifications with profile details
    pub async fn get_pending_experts(pool: &PgPool) -> Result<Vec<PendingExpert>, sqlx::Error> {
        let experts = sqlx::query_as::<_, PendingExpert>(
            r#"
            SELECT
                u.id, u.email, u.first_name, u.last_name, u.created_at,
                ep.headline, ep.bio, ep.hourly_rate, ep.currency,
                ep.years_experience, ep.portfolio_url, ep.linkedin_url
            FROM users u
            JOIN expert_profiles ep ON u.id = ep.user_id
            WHERE u.role = 'expert' AND ep.is_verified = false
            ORDER BY u.created_at DESC
            "#
        )
        .fetch_all(pool)
        .await?;

        Ok(experts)
    }

    /// Get platform analytics
    pub async fn get_analytics(pool: &PgPool) -> Result<PlatformAnalytics, sqlx::Error> {
        // Revenue metrics
        let revenue = sqlx::query_as::<_, RevenueMetrics>(
            r#"
            SELECT
                COALESCE(SUM(amount), 0) as total_gmv,
                COALESCE(SUM(platform_fee), 0) as total_platform_revenue,
                COUNT(*) as total_transactions,
                COALESCE(AVG(amount), 0) as average_order_value
            FROM payments
            WHERE status = 'completed'
            "#
        )
        .fetch_one(pool)
        .await?;

        // User growth (last 30 days)
        let user_growth = sqlx::query_as::<_, GrowthMetrics>(
            r#"
            SELECT
                (SELECT COUNT(*) FROM users WHERE created_at >= NOW() - INTERVAL '30 days') as new_users_30d,
                (SELECT COUNT(*) FROM users WHERE created_at >= NOW() - INTERVAL '7 days') as new_users_7d,
                (SELECT COUNT(*) FROM expert_profiles WHERE created_at >= NOW() - INTERVAL '30 days') as new_experts_30d,
                (SELECT COUNT(*) FROM services WHERE created_at >= NOW() - INTERVAL '30 days') as new_services_30d
            "#
        )
        .fetch_one(pool)
        .await?;

        // Popular categories
        let popular_categories = sqlx::query_as::<_, PopularCategory>(
            r#"
            SELECT
                c.id, c.name, c.slug,
                COUNT(s.id) as service_count,
                COALESCE(SUM(s.order_count), 0) as total_orders
            FROM categories c
            LEFT JOIN services s ON s.category_id = c.id
            GROUP BY c.id, c.name, c.slug
            ORDER BY total_orders DESC, service_count DESC
            LIMIT 10
            "#
        )
        .fetch_all(pool)
        .await?;

        // Top experts by revenue
        let top_experts = sqlx::query_as::<_, TopExpert>(
            r#"
            SELECT
                u.id, u.first_name, u.last_name, u.email,
                ep.headline,
                COALESCE(ep.total_earnings, 0) as total_earnings,
                COALESCE(ep.completed_projects, 0) as completed_projects,
                COALESCE(ep.rating, 0) as rating
            FROM users u
            JOIN expert_profiles ep ON u.id = ep.user_id
            WHERE ep.is_verified = true
            ORDER BY ep.total_earnings DESC
            LIMIT 10
            "#
        )
        .fetch_all(pool)
        .await?;

        // Conversion metrics
        let conversions = sqlx::query_as::<_, ConversionMetrics>(
            r#"
            SELECT
                (SELECT COUNT(*) FROM project_postings WHERE status = 'open') as open_postings,
                (SELECT COUNT(*) FROM project_postings WHERE status = 'in_progress') as active_projects,
                (SELECT COUNT(*) FROM project_postings WHERE status = 'completed') as completed_postings,
                (SELECT COUNT(*) FROM proposals) as total_proposals,
                (SELECT COUNT(*) FROM proposals WHERE status = 'accepted') as accepted_proposals
            "#
        )
        .fetch_one(pool)
        .await?;

        Ok(PlatformAnalytics {
            revenue,
            user_growth,
            popular_categories,
            top_experts,
            conversions,
        })
    }
}

#[derive(Debug, sqlx::FromRow, serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct PendingExpert {
    pub id: Uuid,
    pub email: String,
    pub first_name: String,
    pub last_name: String,
    pub created_at: chrono::DateTime<chrono::Utc>,
    pub headline: Option<String>,
    pub bio: Option<String>,
    pub hourly_rate: Option<rust_decimal::Decimal>,
    pub currency: Option<String>,
    pub years_experience: Option<i32>,
    pub portfolio_url: Option<String>,
    pub linkedin_url: Option<String>,
}

// Analytics structs
#[derive(Debug, serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct PlatformAnalytics {
    pub revenue: RevenueMetrics,
    pub user_growth: GrowthMetrics,
    pub popular_categories: Vec<PopularCategory>,
    pub top_experts: Vec<TopExpert>,
    pub conversions: ConversionMetrics,
}

#[derive(Debug, sqlx::FromRow, serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct RevenueMetrics {
    pub total_gmv: i64,
    pub total_platform_revenue: i64,
    pub total_transactions: i64,
    pub average_order_value: rust_decimal::Decimal,
}

#[derive(Debug, sqlx::FromRow, serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct GrowthMetrics {
    pub new_users_30d: i64,
    pub new_users_7d: i64,
    pub new_experts_30d: i64,
    pub new_services_30d: i64,
}

#[derive(Debug, sqlx::FromRow, serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct PopularCategory {
    pub id: Uuid,
    pub name: String,
    pub slug: String,
    pub service_count: i64,
    pub total_orders: i64,
}

#[derive(Debug, sqlx::FromRow, serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct TopExpert {
    pub id: Uuid,
    pub first_name: String,
    pub last_name: String,
    pub email: String,
    pub headline: Option<String>,
    pub total_earnings: i64,
    pub completed_projects: i32,
    pub rating: rust_decimal::Decimal,
}

#[derive(Debug, sqlx::FromRow, serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ConversionMetrics {
    pub open_postings: i64,
    pub active_projects: i64,
    pub completed_postings: i64,
    pub total_proposals: i64,
    pub accepted_proposals: i64,
}
