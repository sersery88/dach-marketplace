use axum::{
    body::Body,
    http::{Request, Response, header},
    middleware::Next,
};

/// Security headers middleware
/// Adds security headers to all responses
pub async fn security_headers(
    request: Request<Body>,
    next: Next,
) -> Response<Body> {
    let mut response = next.run(request).await;
    let headers = response.headers_mut();

    // Prevent clickjacking
    headers.insert(
        header::X_FRAME_OPTIONS,
        "DENY".parse().unwrap(),
    );

    // Prevent MIME type sniffing
    headers.insert(
        header::X_CONTENT_TYPE_OPTIONS,
        "nosniff".parse().unwrap(),
    );

    // Enable XSS protection
    headers.insert(
        "X-XSS-Protection",
        "1; mode=block".parse().unwrap(),
    );

    // Referrer policy
    headers.insert(
        header::REFERRER_POLICY,
        "strict-origin-when-cross-origin".parse().unwrap(),
    );

    // Content Security Policy
    headers.insert(
        header::CONTENT_SECURITY_POLICY,
        "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self'; connect-src 'self'".parse().unwrap(),
    );

    // Permissions Policy (formerly Feature-Policy)
    headers.insert(
        "Permissions-Policy",
        "camera=(), microphone=(), geolocation=(), payment=()".parse().unwrap(),
    );

    // Strict Transport Security (HSTS)
    headers.insert(
        header::STRICT_TRANSPORT_SECURITY,
        "max-age=31536000; includeSubDomains".parse().unwrap(),
    );

    response
}

#[cfg(test)]
mod tests {
    use super::*;
    use axum::{body::Body, http::Request, routing::get, Router};
    use tower::ServiceExt;

    async fn test_handler() -> &'static str {
        "OK"
    }

    #[tokio::test]
    async fn test_security_headers() {
        let app = Router::new()
            .route("/", get(test_handler))
            .layer(axum::middleware::from_fn(security_headers));

        let response = app
            .oneshot(Request::builder().uri("/").body(Body::empty()).unwrap())
            .await
            .unwrap();

        assert!(response.headers().contains_key(header::X_FRAME_OPTIONS));
        assert!(response.headers().contains_key(header::X_CONTENT_TYPE_OPTIONS));
        assert!(response.headers().contains_key(header::STRICT_TRANSPORT_SECURITY));
    }
}

