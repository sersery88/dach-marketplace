use uuid::Uuid;

use crate::db::Database;
use crate::models::{
    ExpertProfile, CreateExpertProfileRequest, UpdateExpertProfileRequest, ExpertSearchFilters, PaginationParams,
};

pub struct ExpertService;

impl ExpertService {
    /// Create expert profile
    pub async fn create_profile(
        db: &Database,
        user_id: Uuid,
        req: CreateExpertProfileRequest,
    ) -> Result<ExpertProfile, sqlx::Error> {
        let profile: ExpertProfile = sqlx::query_as(
            r#"
            INSERT INTO expert_profiles (
                id, user_id, headline, bio, hourly_rate, currency,
                years_experience, skills, tools, industries, languages_spoken,
                portfolio_url, linkedin_url, github_url, website_url,
                availability_status, available_hours_per_week, timezone,
                is_verified, rating_average, rating_count, total_projects,
                total_earnings, stripe_onboarding_complete, featured,
                created_at, updated_at
            )
            VALUES (
                $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15,
                'available', $16, $17, false, 0.0, 0, 0, 0, false, false, NOW(), NOW()
            )
            RETURNING *
            "#,
        )
        .bind(Uuid::new_v4())
        .bind(user_id)
        .bind(&req.headline)
        .bind(&req.bio)
        .bind(req.hourly_rate)
        .bind(&req.currency)
        .bind(req.years_experience)
        .bind(&req.skills)
        .bind(&req.tools)
        .bind(&req.industries.unwrap_or_default())
        .bind(&req.languages_spoken)
        .bind(&req.portfolio_url)
        .bind(&req.linkedin_url)
        .bind(&req.github_url)
        .bind(&req.website_url)
        .bind(req.available_hours_per_week)
        .bind(&req.timezone)
        .fetch_one(&db.pool)
        .await?;

        Ok(profile)
    }

    /// Get expert by ID
    pub async fn get_by_id(db: &Database, id: Uuid) -> Result<Option<ExpertProfile>, sqlx::Error> {
        let profile: Option<ExpertProfile> = sqlx::query_as(
            "SELECT * FROM expert_profiles WHERE id = $1"
        )
        .bind(id)
        .fetch_optional(&db.pool)
        .await?;

        Ok(profile)
    }

    /// Get expert by user ID
    pub async fn get_by_user_id(db: &Database, user_id: Uuid) -> Result<Option<ExpertProfile>, sqlx::Error> {
        let profile: Option<ExpertProfile> = sqlx::query_as(
            "SELECT * FROM expert_profiles WHERE user_id = $1"
        )
        .bind(user_id)
        .fetch_optional(&db.pool)
        .await?;

        Ok(profile)
    }

    /// Update expert profile
    pub async fn update_profile(
        db: &Database,
        id: Uuid,
        req: UpdateExpertProfileRequest,
    ) -> Result<ExpertProfile, sqlx::Error> {
        let profile: ExpertProfile = sqlx::query_as(
            r#"
            UPDATE expert_profiles SET
                headline = COALESCE($2, headline),
                bio = COALESCE($3, bio),
                hourly_rate = COALESCE($4, hourly_rate),
                currency = COALESCE($5, currency),
                years_experience = COALESCE($6, years_experience),
                skills = COALESCE($7, skills),
                tools = COALESCE($8, tools),
                industries = COALESCE($9, industries),
                languages_spoken = COALESCE($10, languages_spoken),
                portfolio_url = COALESCE($11, portfolio_url),
                linkedin_url = COALESCE($12, linkedin_url),
                github_url = COALESCE($13, github_url),
                website_url = COALESCE($14, website_url),
                availability_status = COALESCE($15, availability_status),
                available_hours_per_week = COALESCE($16, available_hours_per_week),
                timezone = COALESCE($17, timezone),
                updated_at = NOW()
            WHERE id = $1
            RETURNING *
            "#,
        )
        .bind(id)
        .bind(&req.headline)
        .bind(&req.bio)
        .bind(req.hourly_rate)
        .bind(&req.currency)
        .bind(req.years_experience)
        .bind(&req.skills)
        .bind(&req.tools)
        .bind(&req.industries)
        .bind(&req.languages_spoken)
        .bind(&req.portfolio_url)
        .bind(&req.linkedin_url)
        .bind(&req.github_url)
        .bind(&req.website_url)
        .bind(&req.availability_status)
        .bind(req.available_hours_per_week)
        .bind(&req.timezone)
        .fetch_one(&db.pool)
        .await?;

        Ok(profile)
    }

    /// Get featured experts
    pub async fn get_featured(db: &Database, limit: i32) -> Result<Vec<ExpertProfile>, sqlx::Error> {
        let profiles: Vec<ExpertProfile> = sqlx::query_as(
            r#"
            SELECT * FROM expert_profiles
            WHERE featured = true AND (featured_until IS NULL OR featured_until > NOW())
            ORDER BY rating_average DESC, total_projects DESC
            LIMIT $1
            "#,
        )
        .bind(limit)
        .fetch_all(&db.pool)
        .await?;

        Ok(profiles)
    }

    /// Search experts with filters
    pub async fn search(
        db: &Database,
        filters: &ExpertSearchFilters,
        pagination: &PaginationParams,
    ) -> Result<(Vec<ExpertProfile>, i64), sqlx::Error> {
        // Build dynamic query based on filters
        let mut query = String::from(
            "SELECT ep.* FROM expert_profiles ep JOIN users u ON ep.user_id = u.id WHERE 1=1"
        );
        let mut count_query = String::from(
            "SELECT COUNT(*) FROM expert_profiles ep JOIN users u ON ep.user_id = u.id WHERE 1=1"
        );

        // Text search in headline, bio, skills
        if let Some(ref q) = filters.query {
            let escaped = q.replace("'", "''");
            let filter = format!(
                " AND (ep.headline ILIKE '%{}%' OR ep.bio ILIKE '%{}%' OR '{}' = ANY(ep.skills) OR '{}' = ANY(ep.tools))",
                escaped, escaped, escaped, escaped
            );
            query.push_str(&filter);
            count_query.push_str(&filter);
        }

        // Skills filter (any match)
        if let Some(ref skills) = filters.skills {
            if !skills.is_empty() {
                let skills_arr = skills.iter().map(|s| format!("'{}'", s.replace("'", "''"))).collect::<Vec<_>>().join(",");
                let filter = format!(" AND ep.skills && ARRAY[{}]::text[]", skills_arr);
                query.push_str(&filter);
                count_query.push_str(&filter);
            }
        }

        // Tools filter (any match)
        if let Some(ref tools) = filters.tools {
            if !tools.is_empty() {
                let tools_arr = tools.iter().map(|t| format!("'{}'", t.replace("'", "''"))).collect::<Vec<_>>().join(",");
                let filter = format!(" AND ep.tools && ARRAY[{}]::text[]", tools_arr);
                query.push_str(&filter);
                count_query.push_str(&filter);
            }
        }

        // Industries filter
        if let Some(ref industries) = filters.industries {
            if !industries.is_empty() {
                let ind_arr = industries.iter().map(|i| format!("'{}'", i.replace("'", "''"))).collect::<Vec<_>>().join(",");
                let filter = format!(" AND ep.industries && ARRAY[{}]::text[]", ind_arr);
                query.push_str(&filter);
                count_query.push_str(&filter);
            }
        }

        // Languages filter
        if let Some(ref languages) = filters.languages {
            if !languages.is_empty() {
                let lang_arr = languages.iter().map(|l| format!("'{}'", l.replace("'", "''"))).collect::<Vec<_>>().join(",");
                let filter = format!(" AND ep.languages_spoken && ARRAY[{}]::text[]", lang_arr);
                query.push_str(&filter);
                count_query.push_str(&filter);
            }
        }

        // Country filter
        if let Some(ref countries) = filters.countries {
            if !countries.is_empty() {
                let country_arr = countries.iter().map(|c| format!("'{:?}'", c).to_lowercase()).collect::<Vec<_>>().join(",");
                let filter = format!(" AND u.country IN ({})", country_arr);
                query.push_str(&filter);
                count_query.push_str(&filter);
            }
        }

        // Verified only
        if filters.verified_only.unwrap_or(false) {
            let filter = " AND ep.is_verified = true";
            query.push_str(filter);
            count_query.push_str(filter);
        }

        // Rate range
        if let Some(min_rate) = filters.min_rate {
            let filter = format!(" AND ep.hourly_rate >= {}", min_rate);
            query.push_str(&filter);
            count_query.push_str(&filter);
        }
        if let Some(max_rate) = filters.max_rate {
            let filter = format!(" AND ep.hourly_rate <= {}", max_rate);
            query.push_str(&filter);
            count_query.push_str(&filter);
        }

        // Rating filter
        if let Some(min_rating) = filters.min_rating {
            let filter = format!(" AND ep.rating_average >= {}", min_rating);
            query.push_str(&filter);
            count_query.push_str(&filter);
        }

        // Availability status
        if let Some(ref availability) = filters.availability {
            let status = match availability {
                crate::models::AvailabilityStatus::Available => "available",
                crate::models::AvailabilityStatus::PartiallyAvailable => "partially_available",
                crate::models::AvailabilityStatus::Busy => "busy",
                crate::models::AvailabilityStatus::NotAvailable => "not_available",
            };
            let filter = format!(" AND ep.availability_status = '{}'", status);
            query.push_str(&filter);
            count_query.push_str(&filter);
        }

        // Sorting
        let order_by = match &filters.sort_by {
            Some(crate::models::ExpertSortBy::Rating) => "ep.rating_average DESC",
            Some(crate::models::ExpertSortBy::HourlyRate) => "ep.hourly_rate ASC",
            Some(crate::models::ExpertSortBy::Experience) => "ep.years_experience DESC",
            Some(crate::models::ExpertSortBy::TotalProjects) => "ep.total_projects DESC",
            Some(crate::models::ExpertSortBy::ResponseTime) => "ep.response_time_hours ASC NULLS LAST",
            Some(crate::models::ExpertSortBy::Newest) => "ep.created_at DESC",
            None => "ep.rating_average DESC, ep.total_projects DESC",
        };
        query.push_str(&format!(" ORDER BY {}", order_by));

        // Pagination
        let page = pagination.page.max(1);
        let per_page = pagination.per_page.min(100);
        let offset = (page - 1) * per_page;
        query.push_str(&format!(" LIMIT {} OFFSET {}", per_page, offset));

        // Execute queries
        let profiles: Vec<ExpertProfile> = sqlx::query_as(&query)
            .fetch_all(&db.pool)
            .await?;

        let total: i64 = sqlx::query_scalar(&count_query)
            .fetch_one(&db.pool)
            .await?;

        Ok((profiles, total))
    }

    /// Update expert rating (recalculate from reviews)
    pub async fn update_rating(db: &Database, expert_id: Uuid) -> Result<(), sqlx::Error> {
        sqlx::query(
            r#"
            UPDATE expert_profiles SET
                rating_average = COALESCE((
                    SELECT AVG(rating)::real FROM reviews WHERE expert_id = $1
                ), 0.0),
                rating_count = (
                    SELECT COUNT(*) FROM reviews WHERE expert_id = $1
                ),
                updated_at = NOW()
            WHERE id = $1
            "#,
        )
        .bind(expert_id)
        .execute(&db.pool)
        .await?;

        Ok(())
    }

    /// Increment total projects count
    pub async fn increment_projects(db: &Database, expert_id: Uuid) -> Result<(), sqlx::Error> {
        sqlx::query(
            "UPDATE expert_profiles SET total_projects = total_projects + 1, updated_at = NOW() WHERE id = $1"
        )
        .bind(expert_id)
        .execute(&db.pool)
        .await?;

        Ok(())
    }

    /// Add to total earnings
    pub async fn add_earnings(db: &Database, expert_id: Uuid, amount: i64) -> Result<(), sqlx::Error> {
        sqlx::query(
            "UPDATE expert_profiles SET total_earnings = total_earnings + $2, updated_at = NOW() WHERE id = $1"
        )
        .bind(expert_id)
        .bind(amount)
        .execute(&db.pool)
        .await?;

        Ok(())
    }
}

