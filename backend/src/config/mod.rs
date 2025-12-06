use std::env;

#[derive(Debug, Clone)]
pub struct Settings {
    pub server: ServerSettings,
    pub database: DatabaseSettings,
    pub jwt: JwtSettings,
    pub stripe: Option<StripeSettings>,
    pub meilisearch: Option<MeilisearchSettings>,
    pub email: Option<EmailSettings>,
    pub storage: StorageSettings,
    pub frontend_url: String,
    pub cors_origins: Vec<String>,
    pub rate_limit: RateLimitSettings,
}

#[derive(Debug, Clone)]
pub struct ServerSettings {
    pub port: u16,
    pub host: String,
    pub environment: String,
}

#[derive(Debug, Clone)]
pub struct RateLimitSettings {
    pub requests_per_second: u32,
    pub burst: u32,
}

#[derive(Debug, Clone)]
pub struct DatabaseSettings {
    pub url: String,
    pub max_connections: u32,
}

#[derive(Debug, Clone)]
pub struct JwtSettings {
    pub secret: String,
    pub access_token_expiry_hours: i64,
    pub refresh_token_expiry_days: i64,
}

#[derive(Debug, Clone)]
pub struct StripeSettings {
    pub secret_key: String,
    pub publishable_key: String,
    pub webhook_secret: String,
}

#[derive(Debug, Clone)]
pub struct MeilisearchSettings {
    pub url: String,
    pub api_key: String,
}

#[derive(Debug, Clone)]
pub struct EmailSettings {
    pub smtp_host: String,
    pub smtp_port: u16,
    pub smtp_user: String,
    pub smtp_password: String,
    pub from_email: String,
    pub from_name: String,
}

#[derive(Debug, Clone)]
pub enum StorageSettings {
    Local {
        path: String,
    },
    S3 {
        bucket: String,
        region: String,
        access_key: String,
        secret_key: String,
        endpoint: Option<String>,
    },
}

impl Settings {
    /// Load settings from environment variables
    pub fn from_env() -> Result<Self, String> {
        // Load .env file if it exists
        dotenvy::dotenv().ok();

        Ok(Self {
            server: ServerSettings {
                host: env::var("SERVER_HOST")
                    .or_else(|_| env::var("HOST"))
                    .unwrap_or_else(|_| "0.0.0.0".to_string()),
                port: env::var("SERVER_PORT")
                    .or_else(|_| env::var("PORT"))
                    .unwrap_or_else(|_| "8080".to_string())
                    .parse()
                    .map_err(|_| "Invalid SERVER_PORT/PORT")?,
                environment: env::var("ENVIRONMENT").unwrap_or_else(|_| "development".to_string()),
            },
            database: DatabaseSettings {
                url: Self::get_env_var("DATABASE_URL").ok_or("DATABASE_URL is required")?,
                max_connections: env::var("DATABASE_MAX_CONNECTIONS")
                    .unwrap_or_else(|_| "10".to_string())
                    .parse()
                    .unwrap_or(10),
            },
            jwt: {
                let secret = env::var("JWT_SECRET").map_err(|_| "JWT_SECRET is required")?;

                // Enforce minimum secret length for security
                if secret.len() < 32 {
                    return Err(
                        "JWT_SECRET must be at least 32 characters for security".to_string()
                    );
                }

                JwtSettings {
                    secret,
                    access_token_expiry_hours: env::var("JWT_ACCESS_EXPIRY_HOURS")
                        .unwrap_or_else(|_| "24".to_string())
                        .parse()
                        .unwrap_or(24),
                    refresh_token_expiry_days: env::var("JWT_REFRESH_EXPIRY_DAYS")
                        .unwrap_or_else(|_| "30".to_string())
                        .parse()
                        .unwrap_or(30),
                }
            },
            stripe: Self::load_stripe_settings(),
            meilisearch: Self::load_meilisearch_settings(),
            email: Self::load_email_settings(),
            storage: Self::load_storage_settings(),
            frontend_url: env::var("FRONTEND_URL")
                .unwrap_or_else(|_| "http://localhost:5173".to_string()),
            cors_origins: env::var("CORS_ORIGINS")
                .unwrap_or_else(|_| "http://localhost:3000,http://localhost:5173".to_string())
                .split(',')
                .map(|s| s.trim().to_string())
                .collect(),
            rate_limit: RateLimitSettings {
                requests_per_second: env::var("RATE_LIMIT_REQUESTS_PER_SECOND")
                    .unwrap_or_else(|_| "10".to_string())
                    .parse()
                    .unwrap_or(10),
                burst: env::var("RATE_LIMIT_BURST")
                    .unwrap_or_else(|_| "50".to_string())
                    .parse()
                    .unwrap_or(50),
            },
        })
    }

    /// Helper to get environment variable with fallback for potential whitespace/hidden char issues
    fn get_env_var(key: &str) -> Option<String> {
        // Try exact match first
        if let Ok(val) = env::var(key) {
            return Some(val);
        }

        // Fallback: iterate and find key that matches when trimmed
        for (k, v) in env::vars() {
            if k.trim() == key {
                tracing::warn!("⚠️ Found environment variable '{}' via fallback lookup (original key bytes: {:?})", key, k.as_bytes());
                return Some(v);
            }
        }

        None
    }

    fn load_stripe_settings() -> Option<StripeSettings> {
        let secret_key = env::var("STRIPE_SECRET_KEY").ok()?;
        if secret_key.is_empty() {
            return None;
        }

        Some(StripeSettings {
            secret_key,
            publishable_key: env::var("STRIPE_PUBLISHABLE_KEY").unwrap_or_default(),
            webhook_secret: env::var("STRIPE_WEBHOOK_SECRET").unwrap_or_default(),
        })
    }

    fn load_meilisearch_settings() -> Option<MeilisearchSettings> {
        let url = env::var("MEILISEARCH_URL").ok()?;
        if url.is_empty() {
            return None;
        }

        Some(MeilisearchSettings {
            url,
            api_key: env::var("MEILISEARCH_API_KEY").unwrap_or_default(),
        })
    }

    fn load_email_settings() -> Option<EmailSettings> {
        let smtp_host = env::var("SMTP_HOST").ok()?;
        if smtp_host.is_empty() {
            return None;
        }

        Some(EmailSettings {
            smtp_host,
            smtp_port: env::var("SMTP_PORT")
                .unwrap_or_else(|_| "587".to_string())
                .parse()
                .unwrap_or(587),
            smtp_user: env::var("SMTP_USER").unwrap_or_default(),
            smtp_password: env::var("SMTP_PASSWORD").unwrap_or_default(),
            from_email: env::var("FROM_EMAIL")
                .unwrap_or_else(|_| "noreply@dach-marketplace.com".to_string()),
            from_name: env::var("FROM_NAME").unwrap_or_else(|_| "DACH Marketplace".to_string()),
        })
    }

    fn load_storage_settings() -> StorageSettings {
        let storage_type = env::var("STORAGE_TYPE").unwrap_or_else(|_| "local".to_string());

        if storage_type == "s3" {
            if let (Ok(bucket), Ok(access_key), Ok(secret_key)) = (
                env::var("S3_BUCKET"),
                env::var("S3_ACCESS_KEY"),
                env::var("S3_SECRET_KEY"),
            ) {
                return StorageSettings::S3 {
                    bucket,
                    region: env::var("S3_REGION").unwrap_or_else(|_| "eu-central-1".to_string()),
                    access_key,
                    secret_key,
                    endpoint: env::var("S3_ENDPOINT").ok(),
                };
            }
        }

        StorageSettings::Local {
            path: env::var("STORAGE_LOCAL_PATH").unwrap_or_else(|_| "./uploads".to_string()),
        }
    }

    pub fn is_production(&self) -> bool {
        self.server.environment == "production"
    }

    pub fn is_development(&self) -> bool {
        self.server.environment == "development"
    }

    pub fn has_search(&self) -> bool {
        self.meilisearch.is_some()
    }

    pub fn has_email(&self) -> bool {
        self.email.is_some()
    }

    pub fn has_payments(&self) -> bool {
        self.stripe.is_some()
    }
}
