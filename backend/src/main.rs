use tokio::net::TcpListener;
use tracing_subscriber::{layer::SubscriberExt, util::SubscriberInitExt, fmt};

use dach_marketplace_api::{
    config::Settings,
    db::Database,
    create_app,
    AppState,
};
#[cfg(feature = "email")]
use dach_marketplace_api::services::EmailService;

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

    tracing::info!("🚀 Starting DACH Marketplace API v0.1.1...");

    // Load configuration from environment
    let mut settings = Settings::from_env().map_err(|e| anyhow::anyhow!(e))?;

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
        .map_err(|e| {
            tracing::error!("Failed to connect to database: {}", e);
            e
        })?;
    tracing::info!("✅ Database connected");

    // Run migrations (skip if SKIP_MIGRATIONS=true, useful for PgBouncer/Supavisor)
    if std::env::var("SKIP_MIGRATIONS").unwrap_or_default() != "true" {
        match db.run_migrations().await {
            Ok(_) => tracing::info!("✅ Migrations completed"),
            Err(e) => tracing::error!("❌ Migrations failed: {}", e),
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
    let app = create_app(state.clone());

    // Start server
    let addr = format!("{}:{}", state.settings.server.host, state.settings.server.port);
    let listener = TcpListener::bind(&addr).await?;

    tracing::info!("🌐 Server listening on http://{}", addr);
    tracing::info!("📚 Health check: http://{}/api/v1/health", addr);

    axum::serve(listener, app).await?;

    Ok(())
}

