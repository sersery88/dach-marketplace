use sqlx::postgres::{PgPool, PgPoolOptions};
use sqlx::migrate::Migrator;
use std::path::Path;

/// Database wrapper for PostgreSQL connection pool
#[derive(Clone)]
pub struct Database {
    pub pool: PgPool,
}

impl Database {
    /// Create a new database connection pool
    pub async fn new(database_url: &str) -> anyhow::Result<Self> {
        let pool = PgPoolOptions::new()
            .max_connections(10)
            .min_connections(2)
            .acquire_timeout(std::time::Duration::from_secs(30))
            .idle_timeout(std::time::Duration::from_secs(600))
            .connect(database_url)
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

