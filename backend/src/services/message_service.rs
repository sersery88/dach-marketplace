use chrono::Utc;
use sqlx::PgPool;
use uuid::Uuid;

use crate::models::{
    Conversation, ConversationPreview, Message, MessagePreview, MessageType,
    ParticipantInfo, SendMessageRequest, StartConversationRequest,
};

pub struct MessageService;

impl MessageService {
    /// Get user's conversations with previews
    pub async fn get_conversations(
        pool: &PgPool,
        user_id: Uuid,
        page: u32,
        per_page: u32,
    ) -> Result<(Vec<ConversationPreview>, i64), sqlx::Error> {
        let offset = (page.saturating_sub(1) * per_page) as i64;
        let limit = per_page as i64;

        // Get total count
        let count: (i64,) = sqlx::query_as(
            r#"
            SELECT COUNT(*) FROM conversations
            WHERE (participant_one_id = $1 AND NOT is_archived_one)
               OR (participant_two_id = $1 AND NOT is_archived_two)
            "#,
        )
        .bind(user_id)
        .fetch_one(pool)
        .await?;

        // Get conversations with participant info
        let rows: Vec<(Uuid, Uuid, Uuid, Option<chrono::DateTime<Utc>>, Option<String>, i32, i32, Option<Uuid>, Option<Uuid>, chrono::DateTime<Utc>)> = sqlx::query_as(
            r#"
            SELECT c.id, c.participant_one_id, c.participant_two_id,
                   c.last_message_at, c.last_message_preview,
                   c.unread_count_one, c.unread_count_two,
                   c.service_id, c.project_id, c.created_at
            FROM conversations c
            WHERE (c.participant_one_id = $1 AND NOT c.is_archived_one)
               OR (c.participant_two_id = $1 AND NOT c.is_archived_two)
            ORDER BY c.last_message_at DESC NULLS LAST
            LIMIT $2 OFFSET $3
            "#,
        )
        .bind(user_id)
        .bind(limit)
        .bind(offset)
        .fetch_all(pool)
        .await?;

        let mut previews = Vec::new();
        for row in rows {
            let other_id = if row.1 == user_id { row.2 } else { row.1 };
            let unread = if row.1 == user_id { row.5 } else { row.6 };

            // Get other participant info
            let participant: Option<(String, String, Option<String>)> = sqlx::query_as(
                "SELECT first_name, last_name, avatar_url FROM users WHERE id = $1",
            )
            .bind(other_id)
            .fetch_optional(pool)
            .await?;

            let (first_name, last_name, avatar_url) = participant.unwrap_or_default();

            // Get service title if linked
            let service_title: Option<(String,)> = if let Some(sid) = row.7 {
                sqlx::query_as("SELECT title FROM services WHERE id = $1")
                    .bind(sid)
                    .fetch_optional(pool)
                    .await?
            } else {
                None
            };

            // Get project title if linked
            let project_title: Option<(String,)> = if let Some(pid) = row.8 {
                sqlx::query_as("SELECT title FROM projects WHERE id = $1")
                    .bind(pid)
                    .fetch_optional(pool)
                    .await?
            } else {
                None
            };

            previews.push(ConversationPreview {
                id: row.0,
                other_participant: ParticipantInfo {
                    id: other_id,
                    name: format!("{} {}", first_name, last_name),
                    avatar_url,
                    is_online: false, // Would need real-time tracking
                    last_seen: None,
                },
                last_message: row.3.map(|sent_at| MessagePreview {
                    content: row.4.clone().unwrap_or_default(),
                    sender_id: Uuid::nil(), // Would need to track
                    sent_at,
                    is_read: unread == 0,
                }),
                unread_count: unread,
                service_title: service_title.map(|s| s.0),
                project_title: project_title.map(|p| p.0),
                created_at: row.9,
            });
        }

        Ok((previews, count.0))
    }

    /// Start or get existing conversation
    pub async fn get_or_create_conversation(
        pool: &PgPool,
        user_one: Uuid,
        user_two: Uuid,
        service_id: Option<Uuid>,
    ) -> Result<Conversation, sqlx::Error> {
        // Normalize order for unique constraint
        let (p1, p2) = if user_one < user_two {
            (user_one, user_two)
        } else {
            (user_two, user_one)
        };

        // Try to find existing
        let existing: Option<Conversation> = sqlx::query_as(
            r#"
            SELECT * FROM conversations
            WHERE participant_one_id = $1 AND participant_two_id = $2
            "#,
        )
        .bind(p1)
        .bind(p2)
        .fetch_optional(pool)
        .await?;

        if let Some(conv) = existing {
            return Ok(conv);
        }

        // Create new
        let conv: Conversation = sqlx::query_as(
            r#"
            INSERT INTO conversations (participant_one_id, participant_two_id, service_id)
            VALUES ($1, $2, $3)
            RETURNING *
            "#,
        )
        .bind(p1)
        .bind(p2)
        .bind(service_id)
        .fetch_one(pool)
        .await?;

        Ok(conv)
    }

    /// Start a new conversation with initial message
    pub async fn start_conversation(
        pool: &PgPool,
        sender_id: Uuid,
        req: StartConversationRequest,
    ) -> Result<Conversation, sqlx::Error> {
        let conv = Self::get_or_create_conversation(pool, sender_id, req.recipient_id, req.service_id).await?;

        // Send initial message
        Self::send_message_internal(pool, sender_id, conv.id, &req.initial_message, MessageType::Text).await?;

        // Refresh conversation to get updated fields
        let updated: Conversation = sqlx::query_as("SELECT * FROM conversations WHERE id = $1")
            .bind(conv.id)
            .fetch_one(pool)
            .await?;

        Ok(updated)
    }

    /// Send a message
    pub async fn send_message(
        pool: &PgPool,
        sender_id: Uuid,
        req: SendMessageRequest,
    ) -> Result<Message, sqlx::Error> {
        let conversation_id = if let Some(cid) = req.conversation_id {
            cid
        } else if let Some(recipient_id) = req.recipient_id {
            let conv = Self::get_or_create_conversation(pool, sender_id, recipient_id, req.service_id).await?;
            conv.id
        } else {
            return Err(sqlx::Error::Protocol("conversation_id or recipient_id required".into()));
        };

        let msg_type = req.message_type.unwrap_or(MessageType::Text);
        Self::send_message_internal(pool, sender_id, conversation_id, &req.content, msg_type).await
    }

    async fn send_message_internal(
        pool: &PgPool,
        sender_id: Uuid,
        conversation_id: Uuid,
        content: &str,
        message_type: MessageType,
    ) -> Result<Message, sqlx::Error> {
        // Insert message
        let message: Message = sqlx::query_as(
            r#"
            INSERT INTO messages (conversation_id, sender_id, content, message_type)
            VALUES ($1, $2, $3, $4)
            RETURNING id, conversation_id, sender_id, content, message_type,
                      NULL::jsonb as attachments, is_read, read_at, is_edited, edited_at,
                      is_deleted, deleted_at, created_at
            "#,
        )
        .bind(conversation_id)
        .bind(sender_id)
        .bind(content)
        .bind(&message_type)
        .fetch_one(pool)
        .await?;

        // Update conversation
        let preview = if content.len() > 200 {
            format!("{}...", &content[..197])
        } else {
            content.to_string()
        };

        // Determine which unread counter to increment
        let conv: Conversation = sqlx::query_as("SELECT * FROM conversations WHERE id = $1")
            .bind(conversation_id)
            .fetch_one(pool)
            .await?;

        let (inc_one, inc_two) = if sender_id == conv.participant_one_id {
            (0, 1)
        } else {
            (1, 0)
        };

        sqlx::query(
            r#"
            UPDATE conversations
            SET last_message_at = NOW(),
                last_message_preview = $2,
                unread_count_one = unread_count_one + $3,
                unread_count_two = unread_count_two + $4,
                updated_at = NOW()
            WHERE id = $1
            "#,
        )
        .bind(conversation_id)
        .bind(&preview)
        .bind(inc_one)
        .bind(inc_two)
        .execute(pool)
        .await?;

        Ok(message)
    }

    /// Get messages in conversation
    pub async fn get_messages(
        pool: &PgPool,
        conversation_id: Uuid,
        user_id: Uuid,
        page: u32,
        per_page: u32,
    ) -> Result<(Vec<Message>, i64), sqlx::Error> {
        // Verify user is participant
        let conv: Option<Conversation> = sqlx::query_as(
            r#"
            SELECT * FROM conversations WHERE id = $1
            AND (participant_one_id = $2 OR participant_two_id = $2)
            "#,
        )
        .bind(conversation_id)
        .bind(user_id)
        .fetch_optional(pool)
        .await?;

        if conv.is_none() {
            return Err(sqlx::Error::RowNotFound);
        }

        let offset = (page.saturating_sub(1) * per_page) as i64;
        let limit = per_page as i64;

        let count: (i64,) = sqlx::query_as(
            "SELECT COUNT(*) FROM messages WHERE conversation_id = $1 AND NOT is_deleted",
        )
        .bind(conversation_id)
        .fetch_one(pool)
        .await?;

        let messages: Vec<Message> = sqlx::query_as(
            r#"
            SELECT id, conversation_id, sender_id, content, message_type,
                   attachments, is_read, read_at, is_edited, edited_at,
                   is_deleted, deleted_at, created_at
            FROM messages
            WHERE conversation_id = $1 AND NOT is_deleted
            ORDER BY created_at DESC
            LIMIT $2 OFFSET $3
            "#,
        )
        .bind(conversation_id)
        .bind(limit)
        .bind(offset)
        .fetch_all(pool)
        .await?;

        Ok((messages, count.0))
    }

    /// Mark messages as read
    pub async fn mark_as_read(
        pool: &PgPool,
        user_id: Uuid,
        message_ids: Vec<Uuid>,
    ) -> Result<u64, sqlx::Error> {
        if message_ids.is_empty() {
            return Ok(0);
        }

        // Mark messages as read (only if user is recipient)
        let result = sqlx::query(
            r#"
            UPDATE messages m
            SET is_read = TRUE, read_at = NOW()
            FROM conversations c
            WHERE m.conversation_id = c.id
              AND m.id = ANY($1)
              AND m.sender_id != $2
              AND (c.participant_one_id = $2 OR c.participant_two_id = $2)
              AND NOT m.is_read
            "#,
        )
        .bind(&message_ids)
        .bind(user_id)
        .execute(pool)
        .await?;

        // Update unread counts on conversations
        sqlx::query(
            r#"
            UPDATE conversations c
            SET unread_count_one = CASE WHEN participant_one_id = $2 THEN 0 ELSE unread_count_one END,
                unread_count_two = CASE WHEN participant_two_id = $2 THEN 0 ELSE unread_count_two END
            WHERE id IN (
                SELECT DISTINCT conversation_id FROM messages WHERE id = ANY($1)
            )
            "#,
        )
        .bind(&message_ids)
        .bind(user_id)
        .execute(pool)
        .await?;

        Ok(result.rows_affected())
    }

    /// Get unread count for user
    pub async fn get_unread_count(pool: &PgPool, user_id: Uuid) -> Result<i64, sqlx::Error> {
        let count: (i64,) = sqlx::query_as(
            r#"
            SELECT COALESCE(SUM(
                CASE
                    WHEN participant_one_id = $1 THEN unread_count_one
                    WHEN participant_two_id = $1 THEN unread_count_two
                    ELSE 0
                END
            ), 0)
            FROM conversations
            WHERE participant_one_id = $1 OR participant_two_id = $1
            "#,
        )
        .bind(user_id)
        .fetch_one(pool)
        .await?;

        Ok(count.0)
    }

    /// Get single conversation preview
    pub async fn get_conversation_preview(
        pool: &PgPool,
        conversation_id: Uuid,
        user_id: Uuid,
    ) -> Result<Option<ConversationPreview>, sqlx::Error> {
        let row: Option<(Uuid, Uuid, Uuid, Option<chrono::DateTime<Utc>>, Option<String>, i32, i32, Option<Uuid>, Option<Uuid>, chrono::DateTime<Utc>)> = sqlx::query_as(
            r#"
            SELECT c.id, c.participant_one_id, c.participant_two_id,
                   c.last_message_at, c.last_message_preview,
                   c.unread_count_one, c.unread_count_two,
                   c.service_id, c.project_id, c.created_at
            FROM conversations c
            WHERE c.id = $1
              AND (c.participant_one_id = $2 OR c.participant_two_id = $2)
            "#,
        )
        .bind(conversation_id)
        .bind(user_id)
        .fetch_optional(pool)
        .await?;

        let Some(row) = row else {
            return Ok(None);
        };

        let other_id = if row.1 == user_id { row.2 } else { row.1 };
        let unread = if row.1 == user_id { row.5 } else { row.6 };

        let participant: Option<(String, String, Option<String>)> = sqlx::query_as(
            "SELECT first_name, last_name, avatar_url FROM users WHERE id = $1",
        )
        .bind(other_id)
        .fetch_optional(pool)
        .await?;

        let (first_name, last_name, avatar_url) = participant.unwrap_or_default();

        let service_title: Option<(String,)> = if let Some(sid) = row.7 {
            sqlx::query_as("SELECT title FROM services WHERE id = $1")
                .bind(sid)
                .fetch_optional(pool)
                .await?
        } else {
            None
        };

        let project_title: Option<(String,)> = if let Some(pid) = row.8 {
            sqlx::query_as("SELECT title FROM projects WHERE id = $1")
                .bind(pid)
                .fetch_optional(pool)
                .await?
        } else {
            None
        };

        Ok(Some(ConversationPreview {
            id: row.0,
            other_participant: ParticipantInfo {
                id: other_id,
                name: format!("{} {}", first_name, last_name),
                avatar_url,
                is_online: false,
                last_seen: None,
            },
            last_message: row.3.map(|sent_at| MessagePreview {
                content: row.4.clone().unwrap_or_default(),
                sender_id: Uuid::nil(),
                sent_at,
                is_read: unread == 0,
            }),
            unread_count: unread,
            service_title: service_title.map(|s| s.0),
            project_title: project_title.map(|p| p.0),
            created_at: row.9,
        }))
    }
}

