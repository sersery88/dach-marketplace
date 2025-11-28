use sqlx::PgPool;
use uuid::Uuid;

use crate::models::{Review, ReviewWithReviewer, CreateReviewRequest, ReviewSummary, ReviewFilters, RatingDistribution};

pub struct ReviewService;

impl ReviewService {
    /// Create a review
    pub async fn create(
        pool: &PgPool,
        reviewer_id: Uuid,
        req: CreateReviewRequest,
    ) -> Result<Review, sqlx::Error> {
        // Get the reviewee_id from the project
        let reviewee_id: Uuid = sqlx::query_scalar(
            "SELECT expert_id FROM projects WHERE id = $1"
        )
        .bind(req.project_id)
        .fetch_one(pool)
        .await?;

        let review: Review = sqlx::query_as(
            r#"
            INSERT INTO reviews (
                id, project_id, reviewer_id, reviewee_id, service_id, rating,
                communication_rating, quality_rating, timeliness_rating, value_rating,
                title, content, is_verified, is_public, helpful_count, created_at, updated_at
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, true, $13, 0, NOW(), NOW())
            RETURNING *
            "#,
        )
        .bind(Uuid::new_v4())
        .bind(req.project_id)
        .bind(reviewer_id)
        .bind(reviewee_id)
        .bind(req.service_id)
        .bind(req.rating)
        .bind(req.communication_rating)
        .bind(req.quality_rating)
        .bind(req.timeliness_rating)
        .bind(req.value_rating)
        .bind(&req.title)
        .bind(&req.content)
        .bind(req.is_public)
        .fetch_one(pool)
        .await?;

        Ok(review)
    }

    /// Get review by ID
    pub async fn get_by_id(pool: &PgPool, id: Uuid) -> Result<Option<Review>, sqlx::Error> {
        let review: Option<Review> = sqlx::query_as(
            "SELECT * FROM reviews WHERE id = $1"
        )
        .bind(id)
        .fetch_optional(pool)
        .await?;

        Ok(review)
    }

    /// Get review with reviewer info
    pub async fn get_with_reviewer(pool: &PgPool, id: Uuid) -> Result<Option<ReviewWithReviewer>, sqlx::Error> {
        #[derive(sqlx::FromRow)]
        struct ReviewRow {
            id: Uuid,
            project_id: Uuid,
            reviewer_id: Uuid,
            reviewee_id: Uuid,
            service_id: Option<Uuid>,
            rating: i16,
            title: Option<String>,
            content: String,
            communication_rating: Option<i16>,
            quality_rating: Option<i16>,
            timeliness_rating: Option<i16>,
            value_rating: Option<i16>,
            is_verified: bool,
            is_public: bool,
            helpful_count: i32,
            response: Option<String>,
            response_at: Option<chrono::DateTime<chrono::Utc>>,
            created_at: chrono::DateTime<chrono::Utc>,
            updated_at: chrono::DateTime<chrono::Utc>,
            reviewer_name: String,
            reviewer_avatar: Option<String>,
            reviewer_country: String,
        }

        let row: Option<ReviewRow> = sqlx::query_as(
            r#"
            SELECT r.id, r.project_id, r.reviewer_id, r.reviewee_id, r.service_id,
                   r.rating, r.title, r.content, r.communication_rating, r.quality_rating,
                   r.timeliness_rating, r.value_rating, r.is_verified, r.is_public,
                   r.helpful_count, r.response, r.response_at, r.created_at, r.updated_at,
                   u.full_name as reviewer_name, u.avatar_url as reviewer_avatar, u.country::text as reviewer_country
            FROM reviews r
            JOIN users u ON r.reviewer_id = u.id
            WHERE r.id = $1
            "#,
        )
        .bind(id)
        .fetch_optional(pool)
        .await?;

        Ok(row.map(|r| ReviewWithReviewer {
            review: Review {
                id: r.id,
                project_id: r.project_id,
                reviewer_id: r.reviewer_id,
                reviewee_id: r.reviewee_id,
                service_id: r.service_id,
                rating: r.rating,
                title: r.title,
                content: r.content,
                communication_rating: r.communication_rating,
                quality_rating: r.quality_rating,
                timeliness_rating: r.timeliness_rating,
                value_rating: r.value_rating,
                is_verified: r.is_verified,
                is_public: r.is_public,
                helpful_count: r.helpful_count,
                response: r.response,
                response_at: r.response_at,
                created_at: r.created_at,
                updated_at: r.updated_at,
            },
            reviewer_name: r.reviewer_name,
            reviewer_avatar: r.reviewer_avatar,
            reviewer_country: r.reviewer_country,
        }))
    }

    /// List reviews with filters
    pub async fn list(
        pool: &PgPool,
        filters: &ReviewFilters,
        page: u32,
        per_page: u32,
    ) -> Result<(Vec<ReviewWithReviewer>, i64), sqlx::Error> {
        #[derive(sqlx::FromRow)]
        struct ReviewRow {
            id: Uuid,
            project_id: Uuid,
            reviewer_id: Uuid,
            reviewee_id: Uuid,
            service_id: Option<Uuid>,
            rating: i16,
            title: Option<String>,
            content: String,
            communication_rating: Option<i16>,
            quality_rating: Option<i16>,
            timeliness_rating: Option<i16>,
            value_rating: Option<i16>,
            is_verified: bool,
            is_public: bool,
            helpful_count: i32,
            response: Option<String>,
            response_at: Option<chrono::DateTime<chrono::Utc>>,
            created_at: chrono::DateTime<chrono::Utc>,
            updated_at: chrono::DateTime<chrono::Utc>,
            reviewer_name: String,
            reviewer_avatar: Option<String>,
            reviewer_country: String,
        }

        let offset = (page.saturating_sub(1)) * per_page;

        let mut query = String::from(
            r#"
            SELECT r.id, r.project_id, r.reviewer_id, r.reviewee_id, r.service_id,
                   r.rating, r.title, r.content, r.communication_rating, r.quality_rating,
                   r.timeliness_rating, r.value_rating, r.is_verified, r.is_public,
                   r.helpful_count, r.response, r.response_at, r.created_at, r.updated_at,
                   u.full_name as reviewer_name, u.avatar_url as reviewer_avatar, u.country::text as reviewer_country
            FROM reviews r
            JOIN users u ON r.reviewer_id = u.id
            WHERE r.is_public = true
            "#
        );
        let mut count_query = String::from("SELECT COUNT(*) FROM reviews r WHERE r.is_public = true");

        if let Some(expert_id) = filters.expert_id {
            query.push_str(&format!(" AND r.reviewee_id = '{}'", expert_id));
            count_query.push_str(&format!(" AND r.reviewee_id = '{}'", expert_id));
        }
        if let Some(service_id) = filters.service_id {
            query.push_str(&format!(" AND r.service_id = '{}'", service_id));
            count_query.push_str(&format!(" AND r.service_id = '{}'", service_id));
        }
        if let Some(min_rating) = filters.min_rating {
            query.push_str(&format!(" AND r.rating >= {}", min_rating));
            count_query.push_str(&format!(" AND r.rating >= {}", min_rating));
        }
        if filters.verified_only == Some(true) {
            query.push_str(" AND r.is_verified = true");
            count_query.push_str(" AND r.is_verified = true");
        }

        // Sorting
        query.push_str(" ORDER BY r.created_at DESC");
        query.push_str(&format!(" LIMIT {} OFFSET {}", per_page, offset));

        let rows: Vec<ReviewRow> = sqlx::query_as(&query)
            .fetch_all(pool)
            .await?;

        let total: i64 = sqlx::query_scalar(&count_query)
            .fetch_one(pool)
            .await?;

        let reviews = rows.into_iter().map(|r| ReviewWithReviewer {
            review: Review {
                id: r.id,
                project_id: r.project_id,
                reviewer_id: r.reviewer_id,
                reviewee_id: r.reviewee_id,
                service_id: r.service_id,
                rating: r.rating,
                title: r.title,
                content: r.content,
                communication_rating: r.communication_rating,
                quality_rating: r.quality_rating,
                timeliness_rating: r.timeliness_rating,
                value_rating: r.value_rating,
                is_verified: r.is_verified,
                is_public: r.is_public,
                helpful_count: r.helpful_count,
                response: r.response,
                response_at: r.response_at,
                created_at: r.created_at,
                updated_at: r.updated_at,
            },
            reviewer_name: r.reviewer_name,
            reviewer_avatar: r.reviewer_avatar,
            reviewer_country: r.reviewer_country,
        }).collect();

        Ok((reviews, total))
    }

    /// Get reviews by expert (for expert profile page)
    pub async fn get_by_expert(
        pool: &PgPool,
        expert_id: Uuid,
        page: u32,
        per_page: u32,
    ) -> Result<(Vec<Review>, i64), sqlx::Error> {
        let offset = (page.saturating_sub(1)) * per_page;

        let reviews: Vec<Review> = sqlx::query_as(
            r#"
            SELECT * FROM reviews
            WHERE reviewee_id = $1 AND is_public = true
            ORDER BY created_at DESC
            LIMIT $2 OFFSET $3
            "#,
        )
        .bind(expert_id)
        .bind(per_page as i64)
        .bind(offset as i64)
        .fetch_all(pool)
        .await?;

        let total: i64 = sqlx::query_scalar(
            "SELECT COUNT(*) FROM reviews WHERE reviewee_id = $1 AND is_public = true"
        )
        .bind(expert_id)
        .fetch_one(pool)
        .await?;

        Ok((reviews, total))
    }

    /// Get review summary for expert
    pub async fn get_summary(pool: &PgPool, reviewee_id: Uuid) -> Result<ReviewSummary, sqlx::Error> {
        let row: (f32, i32, Option<f32>, Option<f32>, Option<f32>, Option<f32>, i32, i32, i32, i32, i32) = sqlx::query_as(
            r#"
            SELECT
                COALESCE(AVG(rating), 0)::real,
                COUNT(*)::int,
                AVG(communication_rating)::real,
                AVG(quality_rating)::real,
                AVG(timeliness_rating)::real,
                AVG(value_rating)::real,
                COUNT(CASE WHEN rating = 5 THEN 1 END)::int,
                COUNT(CASE WHEN rating = 4 THEN 1 END)::int,
                COUNT(CASE WHEN rating = 3 THEN 1 END)::int,
                COUNT(CASE WHEN rating = 2 THEN 1 END)::int,
                COUNT(CASE WHEN rating = 1 THEN 1 END)::int
            FROM reviews
            WHERE reviewee_id = $1
            "#,
        )
        .bind(reviewee_id)
        .fetch_one(pool)
        .await?;

        Ok(ReviewSummary {
            average_rating: row.0,
            total_reviews: row.1,
            average_communication: row.2,
            average_quality: row.3,
            average_timeliness: row.4,
            average_value: row.5,
            rating_distribution: RatingDistribution {
                five_star: row.6,
                four_star: row.7,
                three_star: row.8,
                two_star: row.9,
                one_star: row.10,
            },
        })
    }

    /// Add expert response to review
    pub async fn add_response(
        pool: &sqlx::PgPool,
        review_id: Uuid,
        expert_id: Uuid,
        response: &str,
    ) -> Result<Review, sqlx::Error> {
        // Verify the expert owns this review (is the reviewee)
        let review: Review = sqlx::query_as(
            r#"
            UPDATE reviews SET
                response = $2,
                response_at = NOW(),
                updated_at = NOW()
            WHERE id = $1 AND reviewee_id = $3
            RETURNING *
            "#,
        )
        .bind(review_id)
        .bind(response)
        .bind(expert_id)
        .fetch_one(pool)
        .await?;

        Ok(review)
    }

    /// Mark review as helpful
    pub async fn mark_helpful(pool: &PgPool, review_id: Uuid) -> Result<(), sqlx::Error> {
        sqlx::query("UPDATE reviews SET helpful_count = helpful_count + 1 WHERE id = $1")
            .bind(review_id)
            .execute(pool)
            .await?;
        Ok(())
    }
}

