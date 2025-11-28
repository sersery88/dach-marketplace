use chrono::{DateTime, Utc};
use sqlx::{PgPool, FromRow};
use uuid::Uuid;
use crate::models::{
    ContentReport, ContentReportWithDetails, CreateReportRequest,
    ResolveReportRequest, ReportFilters,
    PaginationMeta, PaginatedResponse,
};

#[derive(Debug, FromRow)]
struct ContentReportRow {
    id: Uuid,
    reporter_id: Uuid,
    reported_type: String,
    reported_id: Uuid,
    reason: String,
    description: Option<String>,
    status: String,
    resolved_by: Option<Uuid>,
    resolution_notes: Option<String>,
    action_taken: Option<String>,
    created_at: DateTime<Utc>,
    resolved_at: Option<DateTime<Utc>>,
    reporter_name: String,
    reporter_email: String,
    resolver_name: String,
}

impl From<ContentReportRow> for ContentReportWithDetails {
    fn from(row: ContentReportRow) -> Self {
        Self {
            id: row.id,
            reporter_id: row.reporter_id,
            reporter_name: row.reporter_name,
            reporter_email: row.reporter_email,
            reported_type: row.reported_type,
            reported_id: row.reported_id,
            reported_content_preview: None, // Could be fetched separately
            reason: row.reason,
            description: row.description,
            status: row.status,
            resolved_by: row.resolved_by,
            resolver_name: if row.resolver_name.is_empty() { None } else { Some(row.resolver_name) },
            resolution_notes: row.resolution_notes,
            action_taken: row.action_taken,
            created_at: row.created_at,
            resolved_at: row.resolved_at,
        }
    }
}

pub struct ReportService;

impl ReportService {
    /// Create a new content report
    pub async fn create(
        pool: &PgPool,
        reporter_id: Uuid,
        req: &CreateReportRequest,
    ) -> Result<ContentReport, sqlx::Error> {
        let reported_type = format!("{:?}", req.reported_type).to_lowercase();
        let reason = format!("{:?}", req.reason).to_lowercase();
        
        let report = sqlx::query_as::<_, ContentReport>(
            r#"
            INSERT INTO content_reports (reporter_id, reported_type, reported_id, reason, description)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *
            "#
        )
        .bind(reporter_id)
        .bind(&reported_type)
        .bind(req.reported_id)
        .bind(&reason)
        .bind(&req.description)
        .fetch_one(pool)
        .await?;

        Ok(report)
    }

    /// List reports with filters (for admin)
    pub async fn list(
        pool: &PgPool,
        filters: &ReportFilters,
        page: u32,
        per_page: u32,
    ) -> Result<PaginatedResponse<ContentReportWithDetails>, sqlx::Error> {
        let offset = ((page - 1) * per_page) as i64;
        let limit = per_page as i64;

        // Build filter conditions
        let status_filter = filters.status.as_ref().map(|s| format!("{:?}", s).to_lowercase());
        let type_filter = filters.reported_type.as_ref().map(|t| format!("{:?}", t).to_lowercase());
        let reason_filter = filters.reason.as_ref().map(|r| format!("{:?}", r).to_lowercase());

        // Count total
        let total: (i64,) = sqlx::query_as(
            r#"
            SELECT COUNT(*) FROM content_reports
            WHERE ($1::text IS NULL OR status = $1)
              AND ($2::text IS NULL OR reported_type = $2)
              AND ($3::text IS NULL OR reason = $3)
            "#
        )
        .bind(&status_filter)
        .bind(&type_filter)
        .bind(&reason_filter)
        .fetch_one(pool)
        .await?;

        // Fetch reports with details
        let reports = sqlx::query_as::<_, ContentReportRow>(
            r#"
            SELECT 
                cr.id, cr.reporter_id, cr.reported_type, cr.reported_id,
                cr.reason, cr.description, cr.status, cr.resolved_by,
                cr.resolution_notes, cr.action_taken, cr.created_at, cr.resolved_at,
                CONCAT(reporter.first_name, ' ', reporter.last_name) as reporter_name,
                reporter.email as reporter_email,
                COALESCE(CONCAT(resolver.first_name, ' ', resolver.last_name), '') as resolver_name
            FROM content_reports cr
            JOIN users reporter ON cr.reporter_id = reporter.id
            LEFT JOIN users resolver ON cr.resolved_by = resolver.id
            WHERE ($1::text IS NULL OR cr.status = $1)
              AND ($2::text IS NULL OR cr.reported_type = $2)
              AND ($3::text IS NULL OR cr.reason = $3)
            ORDER BY cr.created_at DESC
            LIMIT $4 OFFSET $5
            "#
        )
        .bind(&status_filter)
        .bind(&type_filter)
        .bind(&reason_filter)
        .bind(limit)
        .bind(offset)
        .fetch_all(pool)
        .await?;

        let data: Vec<ContentReportWithDetails> = reports.into_iter().map(|r| r.into()).collect();

        Ok(PaginatedResponse {
            data,
            meta: PaginationMeta::new(page, per_page, total.0),
        })
    }

    /// Get a single report by ID
    pub async fn get_by_id(pool: &PgPool, id: Uuid) -> Result<Option<ContentReport>, sqlx::Error> {
        sqlx::query_as::<_, ContentReport>("SELECT * FROM content_reports WHERE id = $1")
            .bind(id)
            .fetch_optional(pool)
            .await
    }

    /// Resolve a report (admin action)
    pub async fn resolve(
        pool: &PgPool,
        id: Uuid,
        admin_id: Uuid,
        req: &ResolveReportRequest,
    ) -> Result<ContentReport, sqlx::Error> {
        let action = format!("{:?}", req.action).to_lowercase();
        
        let report = sqlx::query_as::<_, ContentReport>(
            r#"
            UPDATE content_reports
            SET status = 'resolved', resolved_by = $1, action_taken = $2, 
                resolution_notes = $3, resolved_at = NOW(), updated_at = NOW()
            WHERE id = $4
            RETURNING *
            "#
        )
        .bind(admin_id)
        .bind(&action)
        .bind(&req.notes)
        .bind(id)
        .fetch_one(pool)
        .await?;

        Ok(report)
    }

    /// Dismiss a report (no action needed)
    pub async fn dismiss(pool: &PgPool, id: Uuid, admin_id: Uuid) -> Result<ContentReport, sqlx::Error> {
        let report = sqlx::query_as::<_, ContentReport>(
            r#"
            UPDATE content_reports
            SET status = 'dismissed', resolved_by = $1, action_taken = 'none',
                resolved_at = NOW(), updated_at = NOW()
            WHERE id = $2
            RETURNING *
            "#
        )
        .bind(admin_id)
        .bind(id)
        .fetch_one(pool)
        .await?;

        Ok(report)
    }
}

