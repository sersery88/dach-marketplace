//! Health check endpoint tests

mod common;

use axum::http::StatusCode;

#[tokio::test]
async fn test_health_check() {
    let Some(app) = common::TestApp::try_new().await else {
        eprintln!("⚠️ Skipping test_health_check: Database not available");
        return;
    };

    let response = app.get("/api/v1/health").await;

    response.assert_status(StatusCode::OK);

    let json = response.json();
    assert_eq!(json["status"], "healthy");
    assert!(json["database"].as_bool().unwrap_or(false));
}

#[tokio::test]
async fn test_not_found() {
    let Some(app) = common::TestApp::try_new().await else {
        eprintln!("⚠️ Skipping test_not_found: Database not available");
        return;
    };

    let response = app.get("/api/v1/nonexistent").await;

    // Should return 404 for unknown routes
    assert!(response.status == StatusCode::NOT_FOUND || response.status == StatusCode::METHOD_NOT_ALLOWED);
}

