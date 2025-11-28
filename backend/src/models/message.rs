use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use sqlx::FromRow;
use uuid::Uuid;
use validator::Validate;

/// Conversation between users
#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
#[serde(rename_all = "camelCase")]
pub struct Conversation {
    pub id: Uuid,
    pub participant_one_id: Uuid,
    pub participant_two_id: Uuid,
    pub project_id: Option<Uuid>,   // Optional link to project
    pub service_id: Option<Uuid>,   // Optional link to service inquiry
    pub last_message_at: Option<DateTime<Utc>>,
    pub last_message_preview: Option<String>,
    pub unread_count_one: i32,      // Unread for participant one
    pub unread_count_two: i32,      // Unread for participant two
    pub is_archived_one: bool,
    pub is_archived_two: bool,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

/// Message in a conversation
#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
#[serde(rename_all = "camelCase")]
pub struct Message {
    pub id: Uuid,
    pub conversation_id: Uuid,
    pub sender_id: Uuid,
    pub content: String,
    pub message_type: MessageType,
    pub attachments: Option<sqlx::types::Json<Vec<MessageAttachment>>>,
    pub is_read: bool,
    pub read_at: Option<DateTime<Utc>>,
    pub is_edited: bool,
    pub edited_at: Option<DateTime<Utc>>,
    pub is_deleted: bool,
    pub deleted_at: Option<DateTime<Utc>>,
    pub created_at: DateTime<Utc>,
}

/// Message type
#[derive(Debug, Clone, Serialize, Deserialize, sqlx::Type, PartialEq, Default)]
#[sqlx(type_name = "message_type", rename_all = "snake_case")]
pub enum MessageType {
    #[default]
    Text,
    File,
    Image,
    System,         // System notifications
    Offer,          // Custom offer/quote
    ProjectUpdate,  // Project status update
}

/// Message attachment
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct MessageAttachment {
    pub id: Uuid,
    pub file_name: String,
    pub file_url: String,
    pub file_type: String,
    pub file_size: i64,
}

/// Send message request
#[derive(Debug, Deserialize, Validate)]
#[serde(rename_all = "camelCase")]
pub struct SendMessageRequest {
    pub conversation_id: Option<Uuid>,  // Existing conversation
    pub recipient_id: Option<Uuid>,     // Or start new conversation
    pub service_id: Option<Uuid>,       // Optional service context
    
    #[validate(length(min = 1, max = 5000))]
    pub content: String,
    
    #[serde(default)]
    pub message_type: Option<MessageType>,
    
    pub attachments: Option<Vec<AttachmentInput>>,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct AttachmentInput {
    pub file_name: String,
    pub file_url: String,
    pub file_type: String,
    pub file_size: i64,
}

/// Start conversation request
#[derive(Debug, Deserialize, Validate)]
#[serde(rename_all = "camelCase")]
pub struct StartConversationRequest {
    pub recipient_id: Uuid,
    pub service_id: Option<Uuid>,
    
    #[validate(length(min = 1, max = 5000))]
    pub initial_message: String,
}

/// Conversation with last message and other participant info
#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ConversationPreview {
    pub id: Uuid,
    pub other_participant: ParticipantInfo,
    pub last_message: Option<MessagePreview>,
    pub unread_count: i32,
    pub service_title: Option<String>,
    pub project_title: Option<String>,
    pub created_at: DateTime<Utc>,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ParticipantInfo {
    pub id: Uuid,
    pub name: String,
    pub avatar_url: Option<String>,
    pub is_online: bool,
    pub last_seen: Option<DateTime<Utc>>,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct MessagePreview {
    pub content: String,
    pub sender_id: Uuid,
    pub sent_at: DateTime<Utc>,
    pub is_read: bool,
}

/// Mark messages as read
#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct MarkReadRequest {
    pub message_ids: Vec<Uuid>,
}

