use axum::{
    routing::{delete, get, post, put},
    Router,
};

use crate::handlers;
use crate::AppState;

/// Build all API routes
pub fn api_routes() -> Router<AppState> {
    Router::new()
        // Health check
        .route("/health", get(handlers::health::health_check))
        // OpenAPI documentation
        .route("/openapi.yaml", get(handlers::health::openapi_spec))
        .route("/openapi.json", get(handlers::health::openapi_json))
        // Authentication routes
        .nest("/auth", auth_routes())
        // User routes
        .nest("/users", user_routes())
        // Expert routes
        .nest("/experts", expert_routes())
        // Service routes
        .nest("/services", service_routes())
        // Category routes
        .nest("/categories", category_routes())
        // Project routes
        .nest("/projects", project_routes())
        // Message routes
        .nest("/messages", message_routes())
        // Review routes
        .nest("/reviews", review_routes())
        // Search routes
        .nest("/search", search_routes())
        // Client routes
        .nest("/clients", client_routes())
        // Project postings routes
        .nest("/postings", posting_routes())
        // Booking routes
        .nest("/bookings", booking_routes())
        // Admin routes
        .nest("/admin", admin_routes())
        // Payment routes
        .nest("/payments", payment_routes())
        // Report routes (content moderation)
        .nest("/reports", report_routes())
        // Newsletter routes
        .nest("/newsletter", newsletter_routes())
}

fn newsletter_routes() -> Router<AppState> {
    Router::new().route("/subscribe", post(handlers::newsletter::subscribe))
}

fn auth_routes() -> Router<AppState> {
    Router::new()
        .route("/register", post(handlers::auth::register))
        .route("/login", post(handlers::auth::login))
        .route("/logout", post(handlers::auth::logout))
        .route("/refresh", post(handlers::auth::refresh_token))
        .route("/forgot-password", post(handlers::auth::forgot_password))
        .route("/reset-password", post(handlers::auth::reset_password))
        .route("/verify-email", post(handlers::auth::verify_email))
        .route("/me", get(handlers::auth::get_current_user))
}

fn user_routes() -> Router<AppState> {
    Router::new()
        .route("/", get(handlers::users::list_users))
        .route("/{id}", get(handlers::users::get_user))
        .route("/{id}", put(handlers::users::update_user))
        .route("/{id}/avatar", post(handlers::users::upload_avatar))
        .route("/me/password", post(handlers::users::change_password))
        .route("/me/notifications", get(handlers::users::get_notifications))
        .route(
            "/me/notifications",
            put(handlers::users::update_notifications),
        )
}

fn expert_routes() -> Router<AppState> {
    Router::new()
        .route("/", get(handlers::experts::list_experts))
        .route("/", post(handlers::experts::create_profile))
        .route("/{id}", get(handlers::experts::get_expert))
        .route("/{id}", put(handlers::experts::update_profile))
        .route(
            "/{id}/services",
            get(handlers::experts::get_expert_services),
        )
        .route("/{id}/reviews", get(handlers::experts::get_expert_reviews))
        .route("/{id}/portfolio", get(handlers::experts::get_portfolio))
        .route("/featured", get(handlers::experts::get_featured_experts))
}

fn service_routes() -> Router<AppState> {
    Router::new()
        .route("/", get(handlers::services::list_services))
        .route("/", post(handlers::services::create_service))
        .route("/{id}", get(handlers::services::get_service))
        .route("/{id}", put(handlers::services::update_service))
        .route("/{id}", delete(handlers::services::delete_service))
        .route("/{id}/packages", get(handlers::services::get_packages))
        .route("/featured", get(handlers::services::get_featured_services))
}

fn category_routes() -> Router<AppState> {
    Router::new()
        .route("/", get(handlers::categories::list_categories))
        .route("/tree", get(handlers::categories::get_category_tree))
        .route(
            "/featured",
            get(handlers::categories::get_featured_categories),
        )
        .route("/{id}", get(handlers::categories::get_category))
        .route(
            "/{id}/services",
            get(handlers::categories::get_category_services),
        )
}

fn project_routes() -> Router<AppState> {
    Router::new()
        .route("/", get(handlers::projects::list_projects))
        .route("/", post(handlers::projects::create_project))
        .route("/{id}", get(handlers::projects::get_project))
        .route("/{id}/status", put(handlers::projects::update_status))
        .route("/{id}/deliver", post(handlers::projects::deliver_project))
        .route("/{id}/revision", post(handlers::projects::request_revision))
        .route("/{id}/complete", post(handlers::projects::complete_project))
        .route("/{id}/cancel", post(handlers::projects::cancel_project))
}

fn message_routes() -> Router<AppState> {
    Router::new()
        .route(
            "/conversations",
            get(handlers::messages::list_conversations),
        )
        .route(
            "/conversations",
            post(handlers::messages::start_conversation),
        )
        .route(
            "/conversations/{id}",
            get(handlers::messages::get_conversation),
        )
        .route(
            "/conversations/{id}/messages",
            get(handlers::messages::get_messages),
        )
        .route("/send", post(handlers::messages::send_message))
        .route("/read", post(handlers::messages::mark_as_read))
        .route("/unread-count", get(handlers::messages::get_unread_count))
}

fn review_routes() -> Router<AppState> {
    Router::new()
        .route("/", get(handlers::reviews::list_reviews))
        .route("/", post(handlers::reviews::create_review))
        .route("/{id}", get(handlers::reviews::get_review))
        .route("/{id}/response", post(handlers::reviews::respond_to_review))
        .route("/{id}/helpful", post(handlers::reviews::mark_helpful))
        .route(
            "/summary/{expert_id}",
            get(handlers::reviews::get_review_summary),
        )
}

fn report_routes() -> Router<AppState> {
    Router::new().route("/", post(handlers::reports::create_report))
}

fn search_routes() -> Router<AppState> {
    Router::new()
        .route("/", get(handlers::search::unified_search))
        .route("/experts", get(handlers::search::search_experts))
        .route("/services", get(handlers::search::search_services))
        .route("/suggestions", get(handlers::search::get_suggestions))
}

fn admin_routes() -> Router<AppState> {
    Router::new()
        .route("/stats", get(handlers::admin::get_stats))
        .route("/users", get(handlers::admin::list_all_users))
        .route("/users/{id}", get(handlers::admin::get_user))
        .route("/users/{id}", delete(handlers::admin::delete_user))
        .route(
            "/users/{id}/status",
            put(handlers::admin::update_user_status),
        )
        .route(
            "/experts/pending",
            get(handlers::admin::get_pending_experts),
        )
        .route("/experts/{id}/verify", post(handlers::admin::verify_expert))
        .route("/categories", post(handlers::admin::create_category))
        .route("/categories/{id}", put(handlers::admin::update_category))
        .route("/categories/{id}", delete(handlers::admin::delete_category))
        .route(
            "/categories/{id}/featured",
            post(handlers::admin::toggle_category_featured),
        )
        // Content moderation
        .route("/reports", get(handlers::admin::list_reports))
        .route("/reports/{id}", get(handlers::admin::get_report))
        .route(
            "/reports/{id}/resolve",
            post(handlers::admin::resolve_report),
        )
        .route(
            "/reports/{id}/dismiss",
            post(handlers::admin::dismiss_report),
        )
        // Analytics
        .route("/analytics", get(handlers::admin::get_analytics))
}

fn client_routes() -> Router<AppState> {
    Router::new()
        .route("/profile", get(handlers::clients::get_my_profile))
        .route("/profile", post(handlers::clients::create_profile))
        .route("/profile", put(handlers::clients::update_profile))
}

fn posting_routes() -> Router<AppState> {
    Router::new()
        .route("/", get(handlers::clients::list_project_postings))
        .route("/", post(handlers::clients::create_project_posting))
        .route("/{id}", get(handlers::clients::get_project_posting))
        .route("/{id}", put(handlers::clients::update_project_posting))
        .route("/{id}", delete(handlers::clients::delete_project_posting))
        .route(
            "/{id}/proposals",
            get(handlers::clients::list_proposals_for_posting),
        )
        .route("/{id}/proposals", post(handlers::clients::create_proposal))
        .route(
            "/proposals/{proposal_id}/accept",
            post(handlers::clients::accept_proposal),
        )
}

fn booking_routes() -> Router<AppState> {
    Router::new()
        .route("/", get(handlers::clients::list_my_bookings))
        .route("/", post(handlers::clients::create_booking_request))
        .route("/{id}/respond", post(handlers::clients::respond_to_booking))
}

fn payment_routes() -> Router<AppState> {
    Router::new()
        .route("/", get(handlers::payments::get_payment_history))
        .route("/", post(handlers::payments::create_payment))
        .route("/{id}", get(handlers::payments::get_payment))
        .route("/balance", get(handlers::payments::get_pending_balance))
        .route("/payouts", get(handlers::payments::get_payouts))
        .route("/invoices", get(handlers::payments::get_invoices))
        .route(
            "/invoices/{invoice_id}",
            get(handlers::payments::get_invoice),
        )
        .route(
            "/invoices/{invoice_id}/html",
            get(handlers::payments::get_invoice_html),
        )
        .route(
            "/checkout",
            post(handlers::payments::create_checkout_session),
        )
        .route("/webhook", post(handlers::payments::stripe_webhook))
        // Stripe Connect routes
        .route(
            "/connect/status",
            get(handlers::payments::get_connect_status),
        )
        .route(
            "/connect/create",
            post(handlers::payments::create_connect_account),
        )
        .route(
            "/connect/refresh",
            post(handlers::payments::refresh_connect_onboarding),
        )
}
