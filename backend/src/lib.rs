//! DACH Marketplace API Library
//!
//! This module exposes the application components for integration testing.

use std::sync::Arc;

use axum::{Router, http::{HeaderValue, Method}};
use tower_http::cors::CorsLayer;
use tower_http::trace::{TraceLayer, DefaultMakeSpan, DefaultOnResponse};
use tower_http::limit::RequestBodyLimitLayer;
use tower_http::request_id::{MakeRequestUuid, PropagateRequestIdLayer, SetRequestIdLayer};
use tracing::Level;

pub mod config;
pub mod db;
pub mod handlers;
pub mod middleware;
pub mod models;
pub mod routes;
pub mod services;
pub mod utils;

use crate::config::Settings;
use crate::db::Database;
use crate::middleware::rate_limit::{create_rate_limiter, GlobalRateLimiter};
#[cfg(feature = "email")]
use crate::services::EmailService;

/// Application state shared across all handlers
#[derive(Clone)]
pub struct AppState {
    pub db: Database,
    pub settings: Arc<Settings>,
    pub rate_limiter: GlobalRateLimiter,
    #[cfg(feature = "email")]
    pub email: Option<Arc<EmailService>>,
}

impl AppState {
    /// Create a new AppState with rate limiter
    pub fn new(db: Database, settings: Settings) -> Self {
        let rate_limiter = create_rate_limiter(settings.rate_limit.requests_per_second);
        Self {
            db,
            rate_limiter,
            settings: Arc::new(settings),
            #[cfg(feature = "email")]
            email: None,
        }
    }

    /// Create AppState with email service
    #[cfg(feature = "email")]
    pub fn with_email(mut self, email: EmailService) -> Self {
        self.email = Some(Arc::new(email));
        self
    }
}

/// Create the application router
pub fn create_app(state: AppState) -> Router {
    let settings = &state.settings;
    let rate_limiter = state.rate_limiter.clone();

    // Build CORS layer
    let cors = if settings.is_production() {
        let origins: Vec<HeaderValue> = settings.cors_origins
            .iter()
            .filter_map(|o| o.parse().ok())
            .collect();
        CorsLayer::new()
            .allow_origin(origins)
            .allow_methods([Method::GET, Method::POST, Method::PUT, Method::PATCH, Method::DELETE])
            .allow_headers([
                axum::http::header::CONTENT_TYPE,
                axum::http::header::AUTHORIZATION,
                axum::http::header::ACCEPT,
            ])
            .allow_credentials(true)
    } else {
        CorsLayer::very_permissive()
    };

    // Build the router with rate limiting, body size limit, and request tracing
    let x_request_id = axum::http::HeaderName::from_static("x-request-id");

    let app = Router::new()
        .nest("/api/v1", routes::api_routes())
        // Rate limiting middleware (in production only)
        .layer(axum::middleware::from_fn(move |req, next| {
            let limiter = rate_limiter.clone();
            middleware::rate_limit::rate_limit_middleware(limiter, req, next)
        }))
        // Request ID tracking for distributed tracing
        .layer(PropagateRequestIdLayer::new(x_request_id.clone()))
        .layer(SetRequestIdLayer::new(x_request_id, MakeRequestUuid))
        // Enhanced tracing with request ID
        .layer(
            TraceLayer::new_for_http()
                .make_span_with(DefaultMakeSpan::new().level(Level::INFO))
                .on_response(DefaultOnResponse::new().level(Level::INFO))
        )
        .layer(cors)
        // Limit request body size to 10MB to prevent DoS
        .layer(RequestBodyLimitLayer::new(10 * 1024 * 1024));

    // Add security headers in production
    let app = if settings.is_production() {
        app.layer(axum::middleware::from_fn(middleware::security_headers))
    } else {
        app
    };

    app.with_state(state)
}

