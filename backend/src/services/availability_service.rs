use chrono::NaiveTime;
use uuid::Uuid;
use crate::db::Database;
use crate::models::{AvailabilitySlot, BlockedDate, SetAvailabilityRequest, BlockDatesRequest, ExpertAvailability};

pub struct AvailabilityService;

impl AvailabilityService {
    /// Get expert's full availability
    pub async fn get_availability(db: &Database, expert_id: Uuid) -> Result<ExpertAvailability, sqlx::Error> {
        let weekly_slots: Vec<AvailabilitySlot> = sqlx::query_as(
            "SELECT * FROM availability_slots WHERE expert_id = $1 ORDER BY day_of_week, start_time"
        )
        .bind(expert_id)
        .fetch_all(&db.pool)
        .await?;

        let blocked_dates: Vec<BlockedDate> = sqlx::query_as(
            "SELECT * FROM blocked_dates WHERE expert_id = $1 AND end_date >= CURRENT_DATE ORDER BY start_date"
        )
        .bind(expert_id)
        .fetch_all(&db.pool)
        .await?;

        // Get expert's timezone and hours
        let (timezone, hours): (String, i16) = sqlx::query_as(
            "SELECT timezone, available_hours_per_week FROM expert_profiles WHERE id = $1"
        )
        .bind(expert_id)
        .fetch_one(&db.pool)
        .await?;

        Ok(ExpertAvailability {
            weekly_slots,
            blocked_dates,
            timezone,
            available_hours_per_week: hours,
        })
    }

    /// Set weekly availability slots (replaces existing)
    pub async fn set_availability(
        db: &Database,
        expert_id: Uuid,
        req: SetAvailabilityRequest,
    ) -> Result<Vec<AvailabilitySlot>, sqlx::Error> {
        // Delete existing slots
        sqlx::query("DELETE FROM availability_slots WHERE expert_id = $1")
            .bind(expert_id)
            .execute(&db.pool)
            .await?;

        // Insert new slots
        let mut slots = Vec::new();
        for slot_input in req.slots {
            let start_time = NaiveTime::parse_from_str(&slot_input.start_time, "%H:%M")
                .unwrap_or_else(|_| NaiveTime::from_hms_opt(9, 0, 0).unwrap());
            let end_time = NaiveTime::parse_from_str(&slot_input.end_time, "%H:%M")
                .unwrap_or_else(|_| NaiveTime::from_hms_opt(17, 0, 0).unwrap());

            let slot: AvailabilitySlot = sqlx::query_as(
                r#"
                INSERT INTO availability_slots (id, expert_id, day_of_week, start_time, end_time, is_available, created_at, updated_at)
                VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
                RETURNING *
                "#,
            )
            .bind(Uuid::new_v4())
            .bind(expert_id)
            .bind(slot_input.day_of_week)
            .bind(start_time)
            .bind(end_time)
            .bind(slot_input.is_available)
            .fetch_one(&db.pool)
            .await?;

            slots.push(slot);
        }

        Ok(slots)
    }

    /// Block dates (vacation, etc.)
    pub async fn block_dates(
        db: &Database,
        expert_id: Uuid,
        req: BlockDatesRequest,
    ) -> Result<BlockedDate, sqlx::Error> {
        let blocked: BlockedDate = sqlx::query_as(
            r#"
            INSERT INTO blocked_dates (id, expert_id, start_date, end_date, reason, created_at)
            VALUES ($1, $2, $3, $4, $5, NOW())
            RETURNING *
            "#,
        )
        .bind(Uuid::new_v4())
        .bind(expert_id)
        .bind(req.start_date)
        .bind(req.end_date)
        .bind(&req.reason)
        .fetch_one(&db.pool)
        .await?;

        Ok(blocked)
    }

    /// Remove blocked dates
    pub async fn unblock_dates(db: &Database, id: Uuid) -> Result<(), sqlx::Error> {
        sqlx::query("DELETE FROM blocked_dates WHERE id = $1")
            .bind(id)
            .execute(&db.pool)
            .await?;
        Ok(())
    }
}

