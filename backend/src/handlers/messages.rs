use axum::{extract::{Path, State, Query}, Extension, Json};
use uuid::Uuid;

use crate::AppState;
use crate::middleware::auth::AuthUser;
use crate::models::{
    Conversation, ConversationPreview, Message, SendMessageRequest,
    StartConversationRequest, MarkReadRequest, PaginationParams, PaginatedResponse, PaginationMeta,
};
use crate::services::MessageService;
use super::{ApiError, ApiResult, SuccessResponse, EmptyResponse};

/// List conversations for current user
pub async fn list_conversations(
    State(state): State<AppState>,
    Extension(auth_user): Extension<AuthUser>,
    Query(pagination): Query<PaginationParams>,
) -> ApiResult<PaginatedResponse<ConversationPreview>> {
    let page = pagination.page;
    let per_page = pagination.per_page.min(50);

    let (conversations, total) = MessageService::get_conversations(
        state.db.pool(),
        auth_user.id,
        page,
        per_page,
    )
    .await
    .map_err(|e| ApiError::Internal(e.into()))?;

    Ok(Json(SuccessResponse {
        success: true,
        data: PaginatedResponse {
            data: conversations,
            meta: PaginationMeta::new(page, per_page, total),
        },
    }))
}

/// Start a new conversation
pub async fn start_conversation(
    State(state): State<AppState>,
    Extension(auth_user): Extension<AuthUser>,
    Json(payload): Json<StartConversationRequest>,
) -> ApiResult<Conversation> {
    let conversation = MessageService::start_conversation(
        state.db.pool(),
        auth_user.id,
        payload,
    )
    .await
    .map_err(|e| ApiError::Internal(e.into()))?;

    Ok(Json(SuccessResponse {
        success: true,
        data: conversation,
    }))
}

/// Get conversation by ID
pub async fn get_conversation(
    State(state): State<AppState>,
    Extension(auth_user): Extension<AuthUser>,
    Path(id): Path<Uuid>,
) -> ApiResult<ConversationPreview> {
    let conversation = MessageService::get_conversation_preview(
        state.db.pool(),
        id,
        auth_user.id,
    )
    .await
    .map_err(|e| ApiError::Internal(e.into()))?
    .ok_or_else(|| ApiError::NotFound("Conversation not found".into()))?;

    Ok(Json(SuccessResponse {
        success: true,
        data: conversation,
    }))
}

/// Get messages in conversation
pub async fn get_messages(
    State(state): State<AppState>,
    Extension(auth_user): Extension<AuthUser>,
    Path(id): Path<Uuid>,
    Query(pagination): Query<PaginationParams>,
) -> ApiResult<PaginatedResponse<Message>> {
    let page = pagination.page;
    let per_page = pagination.per_page.min(100);

    let (messages, total) = MessageService::get_messages(
        state.db.pool(),
        id,
        auth_user.id,
        page,
        per_page,
    )
    .await
    .map_err(|e| match e {
        sqlx::Error::RowNotFound => ApiError::NotFound("Conversation not found".into()),
        _ => ApiError::Internal(e.into()),
    })?;

    Ok(Json(SuccessResponse {
        success: true,
        data: PaginatedResponse {
            data: messages,
            meta: PaginationMeta::new(page, per_page, total),
        },
    }))
}

/// Send a message
pub async fn send_message(
    State(state): State<AppState>,
    Extension(auth_user): Extension<AuthUser>,
    Json(payload): Json<SendMessageRequest>,
) -> ApiResult<Message> {
    let message = MessageService::send_message(
        state.db.pool(),
        auth_user.id,
        payload,
    )
    .await
    .map_err(|e| ApiError::Internal(e.into()))?;

    Ok(Json(SuccessResponse {
        success: true,
        data: message,
    }))
}

/// Mark messages as read
pub async fn mark_as_read(
    State(state): State<AppState>,
    Extension(auth_user): Extension<AuthUser>,
    Json(payload): Json<MarkReadRequest>,
) -> Result<Json<EmptyResponse>, ApiError> {
    let count = MessageService::mark_as_read(
        state.db.pool(),
        auth_user.id,
        payload.message_ids,
    )
    .await
    .map_err(|e| ApiError::Internal(e.into()))?;

    Ok(Json(EmptyResponse::new(&format!("{} messages marked as read", count))))
}

/// Get unread message count
pub async fn get_unread_count(
    State(state): State<AppState>,
    Extension(auth_user): Extension<AuthUser>,
) -> ApiResult<i64> {
    let count = MessageService::get_unread_count(state.db.pool(), auth_user.id)
        .await
        .map_err(|e| ApiError::Internal(e.into()))?;

    Ok(Json(SuccessResponse {
        success: true,
        data: count,
    }))
}

