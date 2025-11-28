//! Experts API integration tests

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
async fn test_list_experts() {
    require_db!(app);

    let response = app.get("/api/v1/experts").await;

    response.assert_success();

    let json = response.json();
    assert!(json["data"].is_array());
    assert!(json["meta"].is_object()); // Pagination meta
}

#[tokio::test]
async fn test_list_experts_with_filters() {
    require_db!(app);

    // Filter by min rate
    let response = app.get("/api/v1/experts?min_rate=50").await;
    response.assert_success();

    // Filter by availability
    let response2 = app.get("/api/v1/experts?available_only=true").await;
    response2.assert_success();
}

#[tokio::test]
async fn test_featured_experts() {
    require_db!(app);

    let response = app.get("/api/v1/experts/featured").await;

    response.assert_success();

    let json = response.json();
    assert!(json["data"].is_array());
}

#[tokio::test]
async fn test_get_nonexistent_expert() {
    require_db!(app);

    let response = app.get("/api/v1/experts/00000000-0000-0000-0000-000000000000").await;

    response.assert_status(StatusCode::NOT_FOUND);
}

#[tokio::test]
async fn test_create_expert_profile() {
    require_db!(app);
    let email = common::test_email();

    // Register as expert
    let register = app.post("/api/v1/auth/register", &json!({
        "email": email,
        "password": "SecurePass123!",
        "firstName": "Expert",
        "lastName": "User",
        "role": "expert"
    })).await;
    register.assert_success();

    let register_json = register.json();
    let token = register_json["data"]["accessToken"].as_str().unwrap();

    // Create expert profile
    let profile = app.post_auth("/api/v1/experts/profile", &json!({
        "headline": "n8n & Make.com Specialist",
        "bio": "10 years of automation experience",
        "hourlyRate": 150,
        "currency": "CHF",
        "yearsExperience": 10,
        "skills": ["n8n", "Make", "Zapier", "Python"],
        "tools": ["n8n", "Make.com", "Airtable"],
        "languages": ["German", "English"],
        "industries": ["E-Commerce", "SaaS"]
    }), token).await;

    profile.assert_success();

    let json = profile.json();
    assert_eq!(json["data"]["headline"], "n8n & Make.com Specialist");
    assert_eq!(json["data"]["hourlyRate"], 150);
}

#[tokio::test]
async fn test_update_expert_profile() {
    require_db!(app);
    let email = common::test_email();

    // Register and create profile
    let register = app.post("/api/v1/auth/register", &json!({
        "email": email,
        "password": "SecurePass123!",
        "firstName": "Expert",
        "lastName": "User",
        "role": "expert"
    })).await;
    let register_json = register.json();
    let token = register_json["data"]["accessToken"].as_str().unwrap();

    app.post_auth("/api/v1/experts/profile", &json!({
        "headline": "Initial Headline",
        "bio": "Initial bio",
        "hourlyRate": 100,
        "currency": "CHF"
    }), token).await;

    // Update profile
    let update = app.put_auth("/api/v1/experts/profile", &json!({
        "headline": "Updated Headline",
        "hourlyRate": 200
    }), token).await;

    update.assert_success();

    let json = update.json();
    assert_eq!(json["data"]["headline"], "Updated Headline");
    assert_eq!(json["data"]["hourlyRate"], 200);
}

#[tokio::test]
async fn test_search_experts() {
    require_db!(app);

    let response = app.get("/api/v1/search/experts?q=automation").await;

    response.assert_success();

    let json = response.json();
    assert!(json["data"].is_array());
}

