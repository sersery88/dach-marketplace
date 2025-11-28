use uuid::Uuid;

use crate::db::Database;
use crate::models::{Service, ServicePackage, CreateServiceRequest, CreateServicePackageRequest, ServiceSearchFilters, PaginationParams};

pub struct ServiceService;

impl ServiceService {
    /// Create a new service
    pub async fn create(
        db: &Database,
        expert_id: Uuid,
        req: CreateServiceRequest,
    ) -> Result<Service, sqlx::Error> {
        let slug = Self::generate_slug(&req.title);

        let service: Service = sqlx::query_as(
            r#"
            INSERT INTO services (
                id, expert_id, category_id, title, slug, description, short_description,
                pricing_type, price, currency, delivery_time_days, revisions_included,
                features, requirements, tags, images, is_active, is_featured,
                view_count, order_count, rating_average, rating_count,
                created_at, updated_at
            )
            VALUES (
                $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15,
                ARRAY[]::text[], true, false, 0, 0, 0.0, 0, NOW(), NOW()
            )
            RETURNING *
            "#,
        )
        .bind(Uuid::new_v4())
        .bind(expert_id)
        .bind(req.category_id)
        .bind(&req.title)
        .bind(&slug)
        .bind(&req.description)
        .bind(&req.short_description)
        .bind(&req.pricing_type)
        .bind(req.price)
        .bind(&req.currency)
        .bind(req.delivery_time_days)
        .bind(req.revisions_included)
        .bind(&req.features)
        .bind(&req.requirements)
        .bind(&req.tags.unwrap_or_default())
        .fetch_one(&db.pool)
        .await?;

        Ok(service)
    }

    /// Get service by ID
    pub async fn get_by_id(db: &Database, id: Uuid) -> Result<Option<Service>, sqlx::Error> {
        let service: Option<Service> = sqlx::query_as(
            "SELECT * FROM services WHERE id = $1"
        )
        .bind(id)
        .fetch_optional(&db.pool)
        .await?;

        Ok(service)
    }

    /// Get service by slug
    pub async fn get_by_slug(db: &Database, slug: &str) -> Result<Option<Service>, sqlx::Error> {
        let service: Option<Service> = sqlx::query_as(
            "SELECT * FROM services WHERE slug = $1"
        )
        .bind(slug)
        .fetch_optional(&db.pool)
        .await?;

        Ok(service)
    }

    /// Get services by expert
    pub async fn get_by_expert(
        db: &Database,
        expert_id: Uuid,
        page: u32,
        per_page: u32,
    ) -> Result<(Vec<Service>, i64), sqlx::Error> {
        let offset = (page.saturating_sub(1)) * per_page;

        let services: Vec<Service> = sqlx::query_as(
            r#"
            SELECT * FROM services
            WHERE expert_id = $1 AND is_active = true
            ORDER BY created_at DESC
            LIMIT $2 OFFSET $3
            "#,
        )
        .bind(expert_id)
        .bind(per_page as i64)
        .bind(offset as i64)
        .fetch_all(&db.pool)
        .await?;

        let total: i64 = sqlx::query_scalar(
            "SELECT COUNT(*) FROM services WHERE expert_id = $1 AND is_active = true"
        )
        .bind(expert_id)
        .fetch_one(&db.pool)
        .await?;

        Ok((services, total))
    }

    /// Get services by category
    pub async fn get_by_category(
        db: &Database,
        category_id: Uuid,
        page: u32,
        per_page: u32,
    ) -> Result<(Vec<Service>, i64), sqlx::Error> {
        let offset = (page.saturating_sub(1)) * per_page;

        let services: Vec<Service> = sqlx::query_as(
            r#"
            SELECT * FROM services
            WHERE category_id = $1 AND is_active = true
            ORDER BY rating_average DESC, order_count DESC
            LIMIT $2 OFFSET $3
            "#,
        )
        .bind(category_id)
        .bind(per_page as i64)
        .bind(offset as i64)
        .fetch_all(&db.pool)
        .await?;

        let total: i64 = sqlx::query_scalar(
            "SELECT COUNT(*) FROM services WHERE category_id = $1 AND is_active = true"
        )
        .bind(category_id)
        .fetch_one(&db.pool)
        .await?;

        Ok((services, total))
    }

    /// Get featured services
    pub async fn get_featured(db: &Database, limit: i32) -> Result<Vec<Service>, sqlx::Error> {
        let services: Vec<Service> = sqlx::query_as(
            r#"
            SELECT * FROM services
            WHERE is_featured = true AND is_active = true
            ORDER BY rating_average DESC, order_count DESC
            LIMIT $1
            "#,
        )
        .bind(limit)
        .fetch_all(&db.pool)
        .await?;

        Ok(services)
    }

    /// Search services with filters
    pub async fn search(
        db: &Database,
        filters: &ServiceSearchFilters,
        pagination: &PaginationParams,
    ) -> Result<(Vec<Service>, i64), sqlx::Error> {
        let page = pagination.page.max(1);
        let per_page = pagination.per_page.min(100);
        let offset = (page - 1) * per_page;

        // Build query with filters
        let mut conditions = vec!["is_active = true".to_string()];

        if let Some(ref q) = filters.query {
            conditions.push(format!("(title ILIKE '%{}%' OR description ILIKE '%{}%')", q, q));
        }

        if let Some(category_id) = filters.category_id {
            conditions.push(format!("category_id = '{}'", category_id));
        }

        if let Some(expert_id) = filters.expert_id {
            conditions.push(format!("expert_id = '{}'", expert_id));
        }

        if let Some(min_price) = filters.min_price {
            conditions.push(format!("price >= {}", min_price));
        }

        if let Some(max_price) = filters.max_price {
            conditions.push(format!("price <= {}", max_price));
        }

        if let Some(min_rating) = filters.min_rating {
            conditions.push(format!("rating_average >= {}", min_rating));
        }

        if let Some(max_days) = filters.max_delivery_days {
            conditions.push(format!("delivery_time_days <= {}", max_days));
        }

        let where_clause = conditions.join(" AND ");

        let order_by = match &filters.sort_by {
            Some(crate::models::ServiceSortBy::PriceLowToHigh) => "price ASC",
            Some(crate::models::ServiceSortBy::PriceHighToLow) => "price DESC",
            Some(crate::models::ServiceSortBy::Rating) => "rating_average DESC",
            Some(crate::models::ServiceSortBy::DeliveryTime) => "delivery_time_days ASC",
            Some(crate::models::ServiceSortBy::Popularity) => "order_count DESC",
            Some(crate::models::ServiceSortBy::Newest) => "created_at DESC",
            _ => "rating_average DESC, order_count DESC",
        };

        let query = format!(
            "SELECT * FROM services WHERE {} ORDER BY {} LIMIT {} OFFSET {}",
            where_clause, order_by, per_page, offset
        );

        let services: Vec<Service> = sqlx::query_as(&query)
            .fetch_all(&db.pool)
            .await?;

        let count_query = format!(
            "SELECT COUNT(*) FROM services WHERE {}",
            where_clause
        );

        let total: i64 = sqlx::query_scalar(&count_query)
            .fetch_one(&db.pool)
            .await?;

        Ok((services, total))
    }

    /// Update service
    pub async fn update(
        db: &Database,
        id: Uuid,
        req: CreateServiceRequest,
    ) -> Result<Service, sqlx::Error> {
        let service: Service = sqlx::query_as(
            r#"
            UPDATE services SET
                category_id = $2,
                title = $3,
                description = $4,
                short_description = $5,
                pricing_type = $6,
                price = $7,
                currency = $8,
                delivery_time_days = $9,
                revisions_included = $10,
                features = $11,
                requirements = $12,
                tags = $13,
                updated_at = NOW()
            WHERE id = $1
            RETURNING *
            "#,
        )
        .bind(id)
        .bind(req.category_id)
        .bind(&req.title)
        .bind(&req.description)
        .bind(&req.short_description)
        .bind(&req.pricing_type)
        .bind(req.price)
        .bind(&req.currency)
        .bind(req.delivery_time_days)
        .bind(req.revisions_included)
        .bind(&req.features)
        .bind(&req.requirements)
        .bind(&req.tags.unwrap_or_default())
        .fetch_one(&db.pool)
        .await?;

        Ok(service)
    }

    /// Delete service (soft delete)
    pub async fn delete(db: &Database, id: Uuid) -> Result<(), sqlx::Error> {
        sqlx::query("UPDATE services SET is_active = false, updated_at = NOW() WHERE id = $1")
            .bind(id)
            .execute(&db.pool)
            .await?;
        Ok(())
    }

    /// Increment view count
    pub async fn increment_views(db: &Database, id: Uuid) -> Result<(), sqlx::Error> {
        sqlx::query("UPDATE services SET view_count = view_count + 1 WHERE id = $1")
            .bind(id)
            .execute(&db.pool)
            .await?;
        Ok(())
    }

    /// Increment order count
    pub async fn increment_orders(db: &Database, id: Uuid) -> Result<(), sqlx::Error> {
        sqlx::query("UPDATE services SET order_count = order_count + 1, updated_at = NOW() WHERE id = $1")
            .bind(id)
            .execute(&db.pool)
            .await?;
        Ok(())
    }

    /// Generate slug from title
    pub fn generate_slug(title: &str) -> String {
        title
            .to_lowercase()
            .chars()
            .map(|c| if c.is_alphanumeric() { c } else { '-' })
            .collect::<String>()
            .split('-')
            .filter(|s| !s.is_empty())
            .collect::<Vec<_>>()
            .join("-")
    }

    /// Get packages for a service
    pub async fn get_packages(db: &Database, service_id: Uuid) -> Result<Vec<ServicePackage>, sqlx::Error> {
        let packages: Vec<ServicePackage> = sqlx::query_as(
            r#"
            SELECT id, service_id, name, description, price, delivery_time_days,
                   revisions_included, features, is_popular, sort_order
            FROM service_packages
            WHERE service_id = $1
            ORDER BY sort_order ASC
            "#,
        )
        .bind(service_id)
        .fetch_all(&db.pool)
        .await?;

        Ok(packages)
    }

    /// Create a package for a service
    pub async fn create_package(
        db: &Database,
        service_id: Uuid,
        req: CreateServicePackageRequest,
        sort_order: i16,
    ) -> Result<ServicePackage, sqlx::Error> {
        let package: ServicePackage = sqlx::query_as(
            r#"
            INSERT INTO service_packages (
                id, service_id, name, description, price, delivery_time_days,
                revisions_included, features, is_popular, sort_order
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
            RETURNING id, service_id, name, description, price, delivery_time_days,
                      revisions_included, features, is_popular, sort_order
            "#,
        )
        .bind(Uuid::new_v4())
        .bind(service_id)
        .bind(&req.name)
        .bind(&req.description)
        .bind(req.price)
        .bind(req.delivery_time_days)
        .bind(req.revisions_included)
        .bind(&req.features)
        .bind(req.is_popular.unwrap_or(false))
        .bind(sort_order)
        .fetch_one(&db.pool)
        .await?;

        Ok(package)
    }

    /// Update a package
    pub async fn update_package(
        db: &Database,
        package_id: Uuid,
        req: CreateServicePackageRequest,
    ) -> Result<ServicePackage, sqlx::Error> {
        let package: ServicePackage = sqlx::query_as(
            r#"
            UPDATE service_packages SET
                name = $2,
                description = $3,
                price = $4,
                delivery_time_days = $5,
                revisions_included = $6,
                features = $7,
                is_popular = $8
            WHERE id = $1
            RETURNING id, service_id, name, description, price, delivery_time_days,
                      revisions_included, features, is_popular, sort_order
            "#,
        )
        .bind(package_id)
        .bind(&req.name)
        .bind(&req.description)
        .bind(req.price)
        .bind(req.delivery_time_days)
        .bind(req.revisions_included)
        .bind(&req.features)
        .bind(req.is_popular.unwrap_or(false))
        .fetch_one(&db.pool)
        .await?;

        Ok(package)
    }

    /// Delete a package
    pub async fn delete_package(db: &Database, package_id: Uuid) -> Result<(), sqlx::Error> {
        sqlx::query("DELETE FROM service_packages WHERE id = $1")
            .bind(package_id)
            .execute(&db.pool)
            .await?;
        Ok(())
    }

    /// Delete all packages for a service
    pub async fn delete_packages_for_service(db: &Database, service_id: Uuid) -> Result<(), sqlx::Error> {
        sqlx::query("DELETE FROM service_packages WHERE service_id = $1")
            .bind(service_id)
            .execute(&db.pool)
            .await?;
        Ok(())
    }
}

