//! Common test utilities and fixtures

use std::sync::Arc;
use axum::Router;
use axum::body::Body;
use axum::http::{Request, StatusCode};
use tower::ServiceExt;
use serde_json::Value;

use dach_marketplace_api::config::Settings;
use dach_marketplace_api::db::Database;
use dach_marketplace_api::AppState;
use dach_marketplace_api::create_app;

/// Test application wrapper
pub struct TestApp {
    pub app: Router,
    #[allow(dead_code)]
    pub db: Database,
}

impl TestApp {
    /// Create a new test application with a real database
    /// Returns None if database connection fails (allows tests to be skipped)
    pub async fn try_new() -> Option<Self> {
        // Load .env file for tests
        dotenvy::dotenv().ok();

        // Load settings from environment
        let settings = match Settings::from_env() {
            Ok(s) => Arc::new(s),
            Err(e) => {
                eprintln!("⚠️ Skipping test: Failed to load settings: {}", e);
                return None;
            }
        };

        // Connect to database
        let db = match Database::new(&settings.database.url).await {
            Ok(db) => db,
            Err(e) => {
                eprintln!("⚠️ Skipping test: Failed to connect to database: {}", e);
                return None;
            }
        };

        // Run migrations to ensure schema is up to date
        if let Err(e) = db.run_migrations().await {
            eprintln!("⚠️ Skipping test: Failed to run migrations: {}", e);
            return None;
        }

        // Create app state
        let state = AppState {
            db: db.clone(),
            settings,
            #[cfg(feature = "email")]
            email: None,
        };

        let app = create_app(state);

        Some(Self { app, db })
    }

    /// Create a new test application, panicking if database is unavailable
    pub async fn new() -> Self {
        Self::try_new().await.expect("Database connection required for this test")
    }
    
    /// Make a GET request
    pub async fn get(&self, uri: &str) -> TestResponse {
        let request = Request::builder()
            .method("GET")
            .uri(uri)
            .body(Body::empty())
            .unwrap();
        
        let response = self.app.clone().oneshot(request).await.unwrap();
        TestResponse::from_response(response).await
    }
    
    /// Make a POST request with JSON body
    pub async fn post(&self, uri: &str, body: &Value) -> TestResponse {
        let request = Request::builder()
            .method("POST")
            .uri(uri)
            .header("Content-Type", "application/json")
            .body(Body::from(serde_json::to_string(body).unwrap()))
            .unwrap();
        
        let response = self.app.clone().oneshot(request).await.unwrap();
        TestResponse::from_response(response).await
    }
    
    /// Make an authenticated GET request
    pub async fn get_auth(&self, uri: &str, token: &str) -> TestResponse {
        let request = Request::builder()
            .method("GET")
            .uri(uri)
            .header("Authorization", format!("Bearer {}", token))
            .body(Body::empty())
            .unwrap();
        
        let response = self.app.clone().oneshot(request).await.unwrap();
        TestResponse::from_response(response).await
    }
    
    /// Make an authenticated POST request
    pub async fn post_auth(&self, uri: &str, body: &Value, token: &str) -> TestResponse {
        let request = Request::builder()
            .method("POST")
            .uri(uri)
            .header("Content-Type", "application/json")
            .header("Authorization", format!("Bearer {}", token))
            .body(Body::from(serde_json::to_string(body).unwrap()))
            .unwrap();
        
        let response = self.app.clone().oneshot(request).await.unwrap();
        TestResponse::from_response(response).await
    }
    
    /// Make an authenticated PUT request
    pub async fn put_auth(&self, uri: &str, body: &Value, token: &str) -> TestResponse {
        let request = Request::builder()
            .method("PUT")
            .uri(uri)
            .header("Content-Type", "application/json")
            .header("Authorization", format!("Bearer {}", token))
            .body(Body::from(serde_json::to_string(body).unwrap()))
            .unwrap();
        
        let response = self.app.clone().oneshot(request).await.unwrap();
        TestResponse::from_response(response).await
    }
}

/// Test response wrapper
pub struct TestResponse {
    pub status: StatusCode,
    pub body: String,
}

impl TestResponse {
    async fn from_response(response: axum::http::Response<Body>) -> Self {
        let status = response.status();
        let body = axum::body::to_bytes(response.into_body(), usize::MAX)
            .await
            .unwrap();
        let body = String::from_utf8_lossy(&body).to_string();
        
        Self { status, body }
    }
    
    /// Parse body as JSON
    pub fn json(&self) -> Value {
        serde_json::from_str(&self.body).unwrap_or(Value::Null)
    }
    
    /// Assert status code
    pub fn assert_status(&self, expected: StatusCode) -> &Self {
        assert_eq!(self.status, expected, "Expected status {}, got {}. Body: {}", expected, self.status, self.body);
        self
    }
    
    /// Assert success (2xx)
    pub fn assert_success(&self) -> &Self {
        assert!(self.status.is_success(), "Expected success, got {}. Body: {}", self.status, self.body);
        self
    }
}

/// Generate a unique test email
pub fn test_email() -> String {
    format!("test_{}@example.com", uuid::Uuid::new_v4())
}

