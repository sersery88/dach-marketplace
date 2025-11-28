use sqlx::postgres::{PgPool, PgPoolOptions};

/// Database wrapper for PostgreSQL connection pool
#[derive(Clone)]
pub struct Database {
    pub pool: PgPool,
}

impl Database {
    /// Create a new database connection pool
    pub async fn new(database_url: &str) -> anyhow::Result<Self> {

        // Log the database URL (redacted for security)
        let redacted_url = if database_url.contains('@') {
            let parts: Vec<&str> = database_url.splitn(2, '@').collect();
            format!("***@{}", parts.get(1).unwrap_or(&""))
        } else {
            "***".to_string()
        };
        tracing::info!("Connecting to database: {}", redacted_url);

        // Parse the URL and properly encode the password
        let connect_options = Self::parse_database_url(database_url)
            .map_err(|e| anyhow::anyhow!("Failed to parse DATABASE_URL: {}. URL format: {}", e, redacted_url))?
            // Disable statement caching for PgBouncer/Supavisor transaction mode compatibility
            .statement_cache_capacity(0);

        let pool = PgPoolOptions::new()
            .max_connections(10)
            .min_connections(2)
            .acquire_timeout(std::time::Duration::from_secs(30))
            .idle_timeout(std::time::Duration::from_secs(600))
            .connect_with(connect_options)
            .await?;

        Ok(Self { pool })
    }

    /// Run database migrations
    pub async fn run_migrations(&self) -> anyhow::Result<()> {
        sqlx::migrate!("./migrations")
            .run(&self.pool)
            .await?;
        Ok(())
    }

    /// Check database health
    pub async fn health_check(&self) -> bool {
        sqlx::query("SELECT 1")
            .fetch_one(&self.pool)
            .await
            .is_ok()
    }

    /// Get the connection pool
    pub fn pool(&self) -> &PgPool {
        &self.pool
    }

    /// Parse a database URL, handling special characters in the password
    fn parse_database_url(database_url: &str) -> anyhow::Result<sqlx::postgres::PgConnectOptions> {
        use sqlx::postgres::PgConnectOptions;
        use std::str::FromStr;

        // Try parsing directly first
        if let Ok(options) = PgConnectOptions::from_str(database_url) {
            return Ok(options);
        }

        // If direct parsing fails, try to fix the URL by encoding the password
        tracing::info!("Direct URL parsing failed, attempting to parse URL manually...");

        // Parse the URL manually to extract and encode the password
        let url = url::Url::parse(database_url)
            .map_err(|e| anyhow::anyhow!("Invalid URL format: {}", e))?;

        // Build PgConnectOptions manually
        let mut options = PgConnectOptions::new()
            .host(url.host_str().unwrap_or("localhost"))
            .port(url.port().unwrap_or(5432))
            .database(url.path().trim_start_matches('/'));

        if !url.username().is_empty() {
            options = options.username(url.username());
        }

        if let Some(password) = url.password() {
            // URL::password() already decodes percent-encoded characters
            options = options.password(password);
        }

        // Handle SSL mode from query parameters
        for (key, value) in url.query_pairs() {
            if key == "sslmode" {
                options = match value.as_ref() {
                    "disable" => options.ssl_mode(sqlx::postgres::PgSslMode::Disable),
                    "prefer" => options.ssl_mode(sqlx::postgres::PgSslMode::Prefer),
                    "require" => options.ssl_mode(sqlx::postgres::PgSslMode::Require),
                    _ => options,
                };
            }
        }

        Ok(options)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_database_connection() {
        // This test requires a running PostgreSQL instance
        // Skip in CI if DATABASE_URL is not set
        if std::env::var("DATABASE_URL").is_err() {
            return;
        }

        let db = Database::new(&std::env::var("DATABASE_URL").unwrap())
            .await
            .expect("Failed to connect to database");

        assert!(db.health_check().await);
    }
}

