use sqlx::PgPool;
use uuid::Uuid;

use crate::models::{
    ClientProfile, CreateClientProfileRequest, UpdateClientProfileRequest,
    ProjectPosting, CreateProjectPostingRequest, UpdateProjectPostingRequest,
    ProjectPostingFilters, PaginatedResponse, PaginationMeta,
    BookingRequest, CreateBookingRequest, RespondBookingRequest, BookingStatus,
    Proposal, CreateProposalRequest,
};

pub struct ClientService;

impl ClientService {
    // ==================== Client Profile ====================

    pub async fn create_profile(pool: &PgPool, user_id: Uuid, req: CreateClientProfileRequest) -> Result<ClientProfile, sqlx::Error> {
        let profile = sqlx::query_as::<_, ClientProfile>(
            r#"INSERT INTO client_profiles (user_id, company_name, company_website, company_size, industry, description, preferred_budget_min, preferred_budget_max, preferred_tools, preferred_industries)
               VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
               RETURNING *"#
        )
        .bind(user_id)
        .bind(&req.company_name)
        .bind(&req.company_website)
        .bind(&req.company_size)
        .bind(&req.industry)
        .bind(&req.description)
        .bind(req.preferred_budget_min)
        .bind(req.preferred_budget_max)
        .bind(&req.preferred_tools.unwrap_or_default())
        .bind(&req.preferred_industries.unwrap_or_default())
        .fetch_one(pool)
        .await?;
        Ok(profile)
    }

    pub async fn get_profile_by_user(pool: &PgPool, user_id: Uuid) -> Result<Option<ClientProfile>, sqlx::Error> {
        let profile = sqlx::query_as::<_, ClientProfile>("SELECT * FROM client_profiles WHERE user_id = $1")
            .bind(user_id)
            .fetch_optional(pool)
            .await?;
        Ok(profile)
    }

    pub async fn update_profile(pool: &PgPool, user_id: Uuid, req: UpdateClientProfileRequest) -> Result<ClientProfile, sqlx::Error> {
        let profile = sqlx::query_as::<_, ClientProfile>(
            r#"UPDATE client_profiles SET
               company_name = COALESCE($2, company_name),
               company_website = COALESCE($3, company_website),
               company_size = COALESCE($4, company_size),
               industry = COALESCE($5, industry),
               description = COALESCE($6, description),
               preferred_budget_min = COALESCE($7, preferred_budget_min),
               preferred_budget_max = COALESCE($8, preferred_budget_max),
               preferred_tools = COALESCE($9, preferred_tools),
               preferred_industries = COALESCE($10, preferred_industries),
               updated_at = NOW()
               WHERE user_id = $1 RETURNING *"#
        )
        .bind(user_id)
        .bind(&req.company_name)
        .bind(&req.company_website)
        .bind(&req.company_size)
        .bind(&req.industry)
        .bind(&req.description)
        .bind(req.preferred_budget_min)
        .bind(req.preferred_budget_max)
        .bind(&req.preferred_tools)
        .bind(&req.preferred_industries)
        .fetch_one(pool)
        .await?;
        Ok(profile)
    }

    // ==================== Project Postings ====================

    pub async fn create_project_posting(pool: &PgPool, client_id: Uuid, req: CreateProjectPostingRequest) -> Result<ProjectPosting, sqlx::Error> {
        let posting = sqlx::query_as::<_, ProjectPosting>(
            r#"INSERT INTO project_postings (client_id, title, description, requirements, category_id, skills_required, tools_required, budget_type, budget_min, budget_max, currency, deadline, estimated_duration, is_urgent)
               VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
               RETURNING *"#
        )
        .bind(client_id)
        .bind(&req.title)
        .bind(&req.description)
        .bind(&req.requirements)
        .bind(req.category_id)
        .bind(&req.skills_required.unwrap_or_default())
        .bind(&req.tools_required.unwrap_or_default())
        .bind(&req.budget_type)
        .bind(req.budget_min)
        .bind(req.budget_max)
        .bind(&req.currency)
        .bind(req.deadline)
        .bind(&req.estimated_duration)
        .bind(req.is_urgent.unwrap_or(false))
        .fetch_one(pool)
        .await?;
        Ok(posting)
    }

    pub async fn get_project_posting(pool: &PgPool, id: Uuid) -> Result<Option<ProjectPosting>, sqlx::Error> {
        let posting = sqlx::query_as::<_, ProjectPosting>("SELECT * FROM project_postings WHERE id = $1")
            .bind(id)
            .fetch_optional(pool)
            .await?;
        Ok(posting)
    }

    pub async fn list_project_postings(pool: &PgPool, filters: ProjectPostingFilters, page: u32, per_page: u32) -> Result<PaginatedResponse<ProjectPosting>, sqlx::Error> {
        let offset = (page - 1) * per_page;
        let mut query = String::from("SELECT * FROM project_postings WHERE 1=1");
        let mut count_query = String::from("SELECT COUNT(*) FROM project_postings WHERE 1=1");

        if let Some(ref status) = filters.status {
            let filter = format!(" AND status = '{:?}'", status).to_lowercase();
            query.push_str(&filter);
            count_query.push_str(&filter);
        }
        if filters.is_urgent == Some(true) {
            query.push_str(" AND is_urgent = true");
            count_query.push_str(" AND is_urgent = true");
        }

        query.push_str(&format!(" ORDER BY created_at DESC LIMIT {} OFFSET {}", per_page, offset));

        let postings = sqlx::query_as::<_, ProjectPosting>(&query).fetch_all(pool).await?;
        let total: (i64,) = sqlx::query_as(&count_query).fetch_one(pool).await?;

        Ok(PaginatedResponse {
            data: postings,
            meta: PaginationMeta::new(page, per_page, total.0),
        })
    }

    pub async fn update_project_posting(pool: &PgPool, id: Uuid, client_id: Uuid, req: UpdateProjectPostingRequest) -> Result<ProjectPosting, sqlx::Error> {
        let posting = sqlx::query_as::<_, ProjectPosting>(
            r#"UPDATE project_postings SET
               title = COALESCE($3, title),
               description = COALESCE($4, description),
               requirements = COALESCE($5, requirements),
               updated_at = NOW()
               WHERE id = $1 AND client_id = $2 RETURNING *"#
        )
        .bind(id)
        .bind(client_id)
        .bind(&req.title)
        .bind(&req.description)
        .bind(&req.requirements)
        .fetch_one(pool)
        .await?;
        Ok(posting)
    }

    // ==================== Booking Requests ====================

    pub async fn create_booking_request(pool: &PgPool, client_id: Uuid, req: CreateBookingRequest) -> Result<BookingRequest, sqlx::Error> {
        let booking = sqlx::query_as::<_, BookingRequest>(
            r#"INSERT INTO booking_requests (client_id, expert_id, service_id, package_id, message, proposed_budget, currency, proposed_start_date, proposed_deadline)
               VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
               RETURNING *"#
        )
        .bind(client_id)
        .bind(req.expert_id)
        .bind(req.service_id)
        .bind(req.package_id)
        .bind(&req.message)
        .bind(req.proposed_budget)
        .bind(&req.currency)
        .bind(req.proposed_start_date)
        .bind(req.proposed_deadline)
        .fetch_one(pool)
        .await?;
        Ok(booking)
    }

    pub async fn get_booking_request(pool: &PgPool, id: Uuid) -> Result<Option<BookingRequest>, sqlx::Error> {
        let booking = sqlx::query_as::<_, BookingRequest>("SELECT * FROM booking_requests WHERE id = $1")
            .bind(id)
            .fetch_optional(pool)
            .await?;
        Ok(booking)
    }

    pub async fn list_client_bookings(pool: &PgPool, client_id: Uuid, page: u32, per_page: u32) -> Result<PaginatedResponse<BookingRequest>, sqlx::Error> {
        let offset = (page - 1) * per_page;
        let bookings = sqlx::query_as::<_, BookingRequest>(
            "SELECT * FROM booking_requests WHERE client_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3"
        )
        .bind(client_id)
        .bind(per_page as i64)
        .bind(offset as i64)
        .fetch_all(pool)
        .await?;

        let total: (i64,) = sqlx::query_as("SELECT COUNT(*) FROM booking_requests WHERE client_id = $1")
            .bind(client_id)
            .fetch_one(pool)
            .await?;

        Ok(PaginatedResponse {
            data: bookings,
            meta: PaginationMeta::new(page, per_page, total.0),
        })
    }

    pub async fn list_expert_bookings(pool: &PgPool, expert_id: Uuid, page: u32, per_page: u32) -> Result<PaginatedResponse<BookingRequest>, sqlx::Error> {
        let offset = (page - 1) * per_page;
        let bookings = sqlx::query_as::<_, BookingRequest>(
            "SELECT * FROM booking_requests WHERE expert_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3"
        )
        .bind(expert_id)
        .bind(per_page as i64)
        .bind(offset as i64)
        .fetch_all(pool)
        .await?;

        let total: (i64,) = sqlx::query_as("SELECT COUNT(*) FROM booking_requests WHERE expert_id = $1")
            .bind(expert_id)
            .fetch_one(pool)
            .await?;

        Ok(PaginatedResponse {
            data: bookings,
            meta: PaginationMeta::new(page, per_page, total.0),
        })
    }

    pub async fn respond_to_booking(pool: &PgPool, id: Uuid, expert_id: Uuid, req: RespondBookingRequest) -> Result<BookingRequest, sqlx::Error> {
        let status = if req.accept { BookingStatus::Accepted } else { BookingStatus::Declined };
        let booking = sqlx::query_as::<_, BookingRequest>(
            r#"UPDATE booking_requests SET
               status = $3,
               expert_response = $4,
               responded_at = NOW(),
               updated_at = NOW()
               WHERE id = $1 AND expert_id = $2 RETURNING *"#
        )
        .bind(id)
        .bind(expert_id)
        .bind(status)
        .bind(&req.response)
        .fetch_one(pool)
        .await?;
        Ok(booking)
    }

    // ==================== Proposals ====================

    pub async fn create_proposal(pool: &PgPool, expert_id: Uuid, req: CreateProposalRequest) -> Result<Proposal, sqlx::Error> {
        let proposal = sqlx::query_as::<_, Proposal>(
            r#"INSERT INTO proposals (project_posting_id, expert_id, cover_letter, proposed_price, currency, proposed_duration, proposed_milestones)
               VALUES ($1, $2, $3, $4, $5, $6, $7)
               RETURNING *"#
        )
        .bind(req.project_posting_id)
        .bind(expert_id)
        .bind(&req.cover_letter)
        .bind(req.proposed_price)
        .bind(&req.currency)
        .bind(&req.proposed_duration)
        .bind(&req.proposed_milestones)
        .fetch_one(pool)
        .await?;

        // Increment proposal count
        sqlx::query("UPDATE project_postings SET proposal_count = proposal_count + 1 WHERE id = $1")
            .bind(req.project_posting_id)
            .execute(pool)
            .await?;

        Ok(proposal)
    }

    pub async fn list_proposals_for_posting(pool: &PgPool, posting_id: Uuid, page: u32, per_page: u32) -> Result<PaginatedResponse<Proposal>, sqlx::Error> {
        let offset = (page - 1) * per_page;
        let proposals = sqlx::query_as::<_, Proposal>(
            "SELECT * FROM proposals WHERE project_posting_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3"
        )
        .bind(posting_id)
        .bind(per_page as i64)
        .bind(offset as i64)
        .fetch_all(pool)
        .await?;

        let total: (i64,) = sqlx::query_as("SELECT COUNT(*) FROM proposals WHERE project_posting_id = $1")
            .bind(posting_id)
            .fetch_one(pool)
            .await?;

        Ok(PaginatedResponse {
            data: proposals,
            meta: PaginationMeta::new(page, per_page, total.0),
        })
    }

    pub async fn accept_proposal(pool: &PgPool, proposal_id: Uuid, client_id: Uuid) -> Result<Proposal, sqlx::Error> {
        // First verify the client owns the project posting
        let proposal = sqlx::query_as::<_, Proposal>(
            r#"UPDATE proposals p SET
               status = 'accepted',
               accepted_at = NOW(),
               updated_at = NOW()
               FROM project_postings pp
               WHERE p.id = $1 AND p.project_posting_id = pp.id AND pp.client_id = $2
               RETURNING p.*"#
        )
        .bind(proposal_id)
        .bind(client_id)
        .fetch_one(pool)
        .await?;
        Ok(proposal)
    }

    pub async fn delete_project_posting(pool: &PgPool, id: Uuid, client_id: Uuid) -> Result<(), sqlx::Error> {
        sqlx::query("DELETE FROM project_postings WHERE id = $1 AND client_id = $2")
            .bind(id)
            .bind(client_id)
            .execute(pool)
            .await?;
        Ok(())
    }
}

