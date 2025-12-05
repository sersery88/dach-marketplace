// v0.1.3 - Guaranteed startup: bind port FIRST, then initialize
use tokio::net::TcpListener;
use tracing_subscriber::{layer::SubscriberExt, util::SubscriberInitExt, fmt};
use axum::{Router, Json, routing::get};
use serde::Serialize;

use dach_marketplace_api::{
    config::Settings,
    db::Database,
    create_app,
    AppState,
};
#[cfg(feature = "email")]
use dach_marketplace_api::services::EmailService;

/// Minimal health response for fallback mode
#[derive(Serialize)]
struct FallbackHealth {
    status: String,
    version: String,
    error: String,
}

/// Create a minimal fallback app that always starts (for debugging)
fn create_fallback_app(error_message: String) -> Router {
    let error_clone = error_message.clone();
    Router::new()
        .route("/api/v1/health", get(move || async move {
            Json(FallbackHealth {
                status: "error".to_string(),
                version: env!("CARGO_PKG_VERSION").to_string(),
                error: error_clone.clone(),
            })
        }))
        .route("/", get(|| async { "DACH Marketplace API - Fallback Mode" }))
}

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    // Determine if we're in production
    let is_production = std::env::var("ENVIRONMENT")
        .map(|e| e == "production")
        .unwrap_or(false);

    // Initialize tracing with JSON format in production, pretty format in development
    let filter = tracing_subscriber::EnvFilter::try_from_default_env()
        .unwrap_or_else(|_| {
            if is_production {
                "dach_marketplace_api=info,tower_http=info".into()
            } else {
                "dach_marketplace_api=debug,tower_http=debug".into()
            }
        });

    if is_production {
        // JSON format for production (easier to parse by log aggregators)
        tracing_subscriber::registry()
            .with(filter)
            .with(fmt::layer().json())
            .init();
    } else {
        // Pretty format for development
        tracing_subscriber::registry()
            .with(filter)
            .with(fmt::layer().pretty())
            .init();
    }

    tracing::info!("🚀 Starting DACH Marketplace API v{}...", env!("CARGO_PKG_VERSION"));

    // Get port early - this MUST work or we can't start at all
    let port: u16 = std::env::var("PORT")
        .unwrap_or_else(|_| "10000".to_string())
        .parse()
        .unwrap_or(10000);
    let host = std::env::var("HOST").unwrap_or_else(|_| "0.0.0.0".to_string());
    let addr = format!("{}:{}", host, port);

    // Start the TCP listener FIRST - this is what Render checks for
    let listener = match TcpListener::bind(&addr).await {
        Ok(l) => {
            tracing::info!("🌐 Server listening on http://{}", addr);
            l
        }
        Err(e) => {
            tracing::error!("❌ Failed to bind to {}: {}", addr, e);
            return Err(e.into());
        }
    };

    // Now try to initialize the full application
    let app = match try_init_full_app(is_production).await {
        Ok(app) => {
            tracing::info!("✅ Full application initialized successfully");
            app
        }
        Err(e) => {
            tracing::error!("❌ Failed to initialize full application: {}", e);
            tracing::warn!("⚠️ Starting in fallback mode - only /api/v1/health will work");
            create_fallback_app(e.to_string())
        }
    };

    tracing::info!("📚 Health check: http://{}/api/v1/health", addr);

    // Serve the application (either full or fallback)
    axum::serve(listener, app).await?;

    Ok(())
}

/// Try to initialize the full application, returning error on any failure
async fn try_init_full_app(is_production: bool) -> anyhow::Result<Router> {
    // Load configuration from environment
    let mut settings = Settings::from_env().map_err(|e| anyhow::anyhow!("Config error: {}", e))?;

    // Enforce SSL mode for production database connections (Render requires this)
    if settings.server.environment == "production" {
        if !settings.database.url.contains("sslmode=") {
            if settings.database.url.contains('?') {
                settings.database.url.push_str("&sslmode=require");
            } else {
                settings.database.url.push_str("?sslmode=require");
            }
            tracing::info!("🔒 Enforced SSL mode for production database connection");
        }
    }

    tracing::info!("✅ Configuration loaded");
    tracing::info!("   Environment: {}", settings.server.environment);
    tracing::info!("   Search enabled: {}", settings.has_search());
    tracing::info!("   Payments enabled: {}", settings.has_payments());
    tracing::info!("   Email enabled: {}", settings.has_email());
    tracing::info!("   Rate limit: {} req/s", settings.rate_limit.requests_per_second);

    // Initialize database
    let db = Database::new(&settings.database.url).await
        .map_err(|e| anyhow::anyhow!("Database error: {}", e))?;
    tracing::info!("✅ Database connected");

    // Run migrations (skip if SKIP_MIGRATIONS=true, useful for PgBouncer/Supavisor)
    if std::env::var("SKIP_MIGRATIONS").unwrap_or_default() != "true" {
        match db.run_migrations().await {
            Ok(_) => tracing::info!("✅ Migrations completed"),
            Err(e) => tracing::warn!("⚠️ Migrations failed (continuing anyway): {}", e),
        }
    } else {
        tracing::info!("⏭️ Migrations skipped (SKIP_MIGRATIONS=true)");
    }

    // Create application state with rate limiter
    let mut state = AppState::new(db, settings);

    // Initialize email service if configured
    #[cfg(feature = "email")]
    if let Some(ref email_settings) = state.settings.email {
        match EmailService::new(
            &email_settings.smtp_host,
            email_settings.smtp_port,
            &email_settings.smtp_user,
            &email_settings.smtp_password,
            &email_settings.from_email,
            &email_settings.from_name,
        ) {
            Ok(service) => {
                tracing::info!("✅ Email service initialized");
                state = state.with_email(service);
            }
            Err(e) => {
                tracing::warn!("⚠️ Email service failed to initialize: {}", e);
            }
        }
    }

    // Build the application
    Ok(create_app(state))
}
