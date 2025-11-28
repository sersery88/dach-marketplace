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

        // If direct parsing fails, manually parse the connection string
        tracing::info!("Direct URL parsing failed, attempting to parse URL manually...");

        // Expected format: postgresql://user:password@host:port/database?options
        // or: postgres://user:password@host:port/database?options

        // Remove the scheme
        let url_without_scheme = database_url
            .strip_prefix("postgresql://")
            .or_else(|| database_url.strip_prefix("postgres://"))
            .ok_or_else(|| anyhow::anyhow!("DATABASE_URL must start with postgresql:// or postgres://"))?;

        // Split off query string if present
        let (main_part, query_string) = match url_without_scheme.find('?') {
            Some(idx) => (&url_without_scheme[..idx], Some(&url_without_scheme[idx + 1..])),
            None => (url_without_scheme, None),
        };

        // Split into credentials@host_part
        // Find the LAST @ to handle passwords containing @
        let at_pos = main_part.rfind('@')
            .ok_or_else(|| anyhow::anyhow!("DATABASE_URL must contain @ separator"))?;

        let credentials = &main_part[..at_pos];
        let host_part = &main_part[at_pos + 1..];

        // Parse credentials (user:password) - find FIRST : to handle passwords containing :
        let colon_pos = credentials.find(':')
            .ok_or_else(|| anyhow::anyhow!("DATABASE_URL must contain user:password"))?;

        let username = &credentials[..colon_pos];
        let password = &credentials[colon_pos + 1..];

        // Parse host_part (host:port/database)
        let (host_port, database) = match host_part.find('/') {
            Some(idx) => (&host_part[..idx], &host_part[idx + 1..]),
            None => (host_part, "postgres"),
        };

        // Parse host:port
        let (host, port) = match host_port.rfind(':') {
            Some(idx) => {
                let port_str = &host_port[idx + 1..];
                let port: u16 = port_str.parse()
                    .map_err(|_| anyhow::anyhow!("Invalid port number: {}", port_str))?;
                (&host_port[..idx], port)
            }
            None => (host_port, 5432),
        };

        tracing::info!("Parsed connection: host={}, port={}, database={}, user={}", host, port, database, username);

        // Build PgConnectOptions manually
        let mut options = PgConnectOptions::new()
            .host(host)
            .port(port)
            .database(database)
            .username(username)
            .password(password);

        // Handle SSL mode from query parameters
        if let Some(qs) = query_string {
            for pair in qs.split('&') {
                if let Some((key, value)) = pair.split_once('=') {
                    if key == "sslmode" {
                        options = match value {
                            "disable" => options.ssl_mode(sqlx::postgres::PgSslMode::Disable),
                            "prefer" => options.ssl_mode(sqlx::postgres::PgSslMode::Prefer),
                            "require" => options.ssl_mode(sqlx::postgres::PgSslMode::Require),
                            _ => options,
                        };
                    }
                }
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

