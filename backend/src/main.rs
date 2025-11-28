use std::sync::Arc;

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
    let settings = Settings::from_env().map_err(|e| anyhow::anyhow!(e))?;
    let settings = Arc::new(settings);

    tracing::info!("✅ Configuration loaded");
    tracing::info!("   Environment: {}", settings.server.environment);
    tracing::info!("   Search enabled: {}", settings.has_search());
    tracing::info!("   Payments enabled: {}", settings.has_payments());
    tracing::info!("   Email enabled: {}", settings.has_email());

    // Initialize database
    let db = Database::new(&settings.database.url).await
        .map_err(|e| {
            tracing::error!("Failed to connect to database: {}", e);
            e
        })?;
    tracing::info!("✅ Database connected");

    // Run migrations
    db.run_migrations().await?;
    tracing::info!("✅ Migrations completed");

    // Initialize email service if configured
    #[cfg(feature = "email")]
    let email_service = if let Some(ref email_settings) = settings.email {
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
                Some(Arc::new(service))
            }
            Err(e) => {
                tracing::warn!("⚠️ Email service failed to initialize: {}", e);
                None
            }
        }
    } else {
        None
    };

    // Create application state
    let state = AppState {
        db,
        settings: settings.clone(),
        #[cfg(feature = "email")]
        email: email_service,
    };

    // Build the application
    let app = create_app(state);

    // Start server
    let addr = format!("{}:{}", settings.server.host, settings.server.port);
    let listener = TcpListener::bind(&addr).await?;

    tracing::info!("🌐 Server listening on http://{}", addr);
    tracing::info!("📚 Health check: http://{}/api/v1/health", addr);

    axum::serve(listener, app).await?;

    Ok(())
}

