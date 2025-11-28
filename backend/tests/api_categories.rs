//! Category API integration tests

mod common;

use axum::http::StatusCode;

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
async fn test_list_categories() {
    require_db!(app);

    let response = app.get("/api/v1/categories").await;

    response.assert_success();

    let json = response.json();
    // Should return array of categories
    assert!(json["data"].is_array());
}

#[tokio::test]
async fn test_list_root_categories() {
    require_db!(app);

    let response = app.get("/api/v1/categories?root_only=true").await;

    response.assert_success();

    let json = response.json();
    assert!(json["data"].is_array());

    // All returned categories should have no parent
    if let Some(categories) = json["data"].as_array() {
        for cat in categories {
            assert!(cat["parentId"].is_null(), "Root categories should have no parent");
        }
    }
}

#[tokio::test]
async fn test_get_category_tree() {
    require_db!(app);

    let response = app.get("/api/v1/categories/tree").await;

    response.assert_success();

    let json = response.json();
    // Should return hierarchical structure
    assert!(json["data"].is_array());
}

#[tokio::test]
async fn test_get_featured_categories() {
    require_db!(app);

    let response = app.get("/api/v1/categories/featured").await;

    response.assert_success();

    let json = response.json();
    assert!(json["data"].is_array());

    // All returned should be featured
    if let Some(categories) = json["data"].as_array() {
        for cat in categories {
            assert!(cat["isFeatured"].as_bool().unwrap_or(false), "Featured endpoint should return only featured categories");
        }
    }
}

#[tokio::test]
async fn test_get_category_by_slug() {
    require_db!(app);

    // First get all categories to find a valid slug
    let list = app.get("/api/v1/categories").await;
    list.assert_success();

    if let Some(categories) = list.json()["data"].as_array() {
        if let Some(first) = categories.first() {
            if let Some(slug) = first["slug"].as_str() {
                // Get category by slug
                let response = app.get(&format!("/api/v1/categories/{}", slug)).await;
                response.assert_success();

                let json = response.json();
                assert_eq!(json["data"]["slug"], slug);
            }
        }
    }
}

#[tokio::test]
async fn test_get_nonexistent_category() {
    require_db!(app);

    let response = app.get("/api/v1/categories/nonexistent-slug-12345").await;

    response.assert_status(StatusCode::NOT_FOUND);
}

