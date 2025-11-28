//! Authentication flow integration tests

mod common;

use axum::http::StatusCode;
use serde_json::json;

/// Helper macro to skip test if database is not available
macro_rules! require_db {
    ($app:ident) => {
        let Some($app) = common::TestApp::try_new().await else {
            eprintln!("⚠️ Skipping test: Database not available");
            return;
        };
    };
}

#[tokio::test]
async fn test_register_and_login() {
    require_db!(app);
    let email = common::test_email();

    // Register a new user
    let register_response = app.post("/api/v1/auth/register", &json!({
        "email": email,
        "password": "SecurePass123!",
        "firstName": "Test",
        "lastName": "User",
        "role": "client"
    })).await;

    register_response.assert_success();
    let register_json = register_response.json();
    assert!(register_json["data"]["accessToken"].is_string());
    assert!(register_json["data"]["refreshToken"].is_string());

    // Login with the same credentials
    let login_response = app.post("/api/v1/auth/login", &json!({
        "email": email,
        "password": "SecurePass123!"
    })).await;

    login_response.assert_success();
    let login_json = login_response.json();
    assert!(login_json["data"]["accessToken"].is_string());
}

#[tokio::test]
async fn test_register_duplicate_email() {
    require_db!(app);
    let email = common::test_email();

    // Register first user
    let first = app.post("/api/v1/auth/register", &json!({
        "email": email,
        "password": "SecurePass123!",
        "firstName": "First",
        "lastName": "User",
        "role": "client"
    })).await;
    first.assert_success();

    // Try to register with same email
    let second = app.post("/api/v1/auth/register", &json!({
        "email": email,
        "password": "AnotherPass456!",
        "firstName": "Second",
        "lastName": "User",
        "role": "client"
    })).await;

    // Should fail with conflict
    second.assert_status(StatusCode::CONFLICT);
}

#[tokio::test]
async fn test_login_wrong_password() {
    require_db!(app);
    let email = common::test_email();

    // Register a user
    app.post("/api/v1/auth/register", &json!({
        "email": email,
        "password": "CorrectPass123!",
        "firstName": "Test",
        "lastName": "User",
        "role": "client"
    })).await.assert_success();

    // Try to login with wrong password
    let response = app.post("/api/v1/auth/login", &json!({
        "email": email,
        "password": "WrongPassword123!"
    })).await;

    response.assert_status(StatusCode::UNAUTHORIZED);
}

#[tokio::test]
async fn test_get_me_authenticated() {
    require_db!(app);
    let email = common::test_email();

    // Register and get token
    let register = app.post("/api/v1/auth/register", &json!({
        "email": email,
        "password": "SecurePass123!",
        "firstName": "Test",
        "lastName": "User",
        "role": "client"
    })).await;
    register.assert_success();

    let register_json = register.json();
    let token = register_json["data"]["accessToken"].as_str().unwrap();

    // Get current user info
    let me = app.get_auth("/api/v1/auth/me", token).await;
    me.assert_success();

    let me_json = me.json();
    assert_eq!(me_json["data"]["email"], email);
    assert_eq!(me_json["data"]["firstName"], "Test");
    assert_eq!(me_json["data"]["lastName"], "User");
}

#[tokio::test]
async fn test_get_me_unauthenticated() {
    require_db!(app);

    // Try to access protected route without token
    let response = app.get("/api/v1/auth/me").await;

    response.assert_status(StatusCode::UNAUTHORIZED);
}

#[tokio::test]
async fn test_refresh_token() {
    require_db!(app);
    let email = common::test_email();

    // Register and get tokens
    let register = app.post("/api/v1/auth/register", &json!({
        "email": email,
        "password": "SecurePass123!",
        "firstName": "Test",
        "lastName": "User",
        "role": "client"
    })).await;
    register.assert_success();

    let register_json = register.json();
    let refresh_token = register_json["data"]["refreshToken"].as_str().unwrap();

    // Refresh the token
    let refresh = app.post("/api/v1/auth/refresh", &json!({
        "refreshToken": refresh_token
    })).await;

    refresh.assert_success();
    let refresh_json = refresh.json();
    assert!(refresh_json["data"]["accessToken"].is_string());
    assert!(refresh_json["data"]["refreshToken"].is_string());
}

