use axum::{
    extract::State,
    http::{header, StatusCode},
    response::{IntoResponse, Response},
    Json,
};
use serde::Serialize;

use crate::AppState;

#[derive(Serialize)]
pub struct HealthResponse {
    pub status: String,
    pub version: String,
    pub database: bool,
    pub timestamp: String,
}

/// Health check endpoint
pub async fn health_check(State(state): State<AppState>) -> Json<HealthResponse> {
    let db_healthy = state.db.health_check().await;

    Json(HealthResponse {
        status: if db_healthy { "healthy".to_string() } else { "degraded".to_string() },
        version: env!("CARGO_PKG_VERSION").to_string(),
        database: db_healthy,
        timestamp: chrono::Utc::now().to_rfc3339(),
    })
}

/// OpenAPI specification endpoint
pub async fn openapi_spec() -> Response {
    const OPENAPI_YAML: &str = include_str!("../../openapi.yaml");

    (
        StatusCode::OK,
        [(header::CONTENT_TYPE, "application/yaml")],
        OPENAPI_YAML,
    )
        .into_response()
}

/// OpenAPI specification as JSON
pub async fn openapi_json() -> Response {
    const OPENAPI_YAML: &str = include_str!("../../openapi.yaml");

    // Parse YAML and convert to JSON
    match serde_yaml::from_str::<serde_json::Value>(OPENAPI_YAML) {
        Ok(value) => (
            StatusCode::OK,
            [(header::CONTENT_TYPE, "application/json")],
            serde_json::to_string_pretty(&value).unwrap_or_default(),
        )
            .into_response(),
        Err(_) => (StatusCode::INTERNAL_SERVER_ERROR, "Failed to parse OpenAPI spec").into_response(),
    }
}

