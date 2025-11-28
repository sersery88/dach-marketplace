use axum::{
    extract::Request,
    http::StatusCode,
    middleware::Next,
    response::Response,
};
use governor::{
    clock::DefaultClock,
    state::{InMemoryState, NotKeyed},
    Quota, RateLimiter,
};
use std::num::NonZeroU32;
use std::sync::Arc;

/// Rate limiter type
pub type GlobalRateLimiter = Arc<RateLimiter<NotKeyed, InMemoryState, DefaultClock>>;

/// Create a new rate limiter
pub fn create_rate_limiter(requests_per_second: u32) -> GlobalRateLimiter {
    Arc::new(RateLimiter::direct(Quota::per_second(
        NonZeroU32::new(requests_per_second).unwrap(),
    )))
}

/// Rate limiting middleware
pub async fn rate_limit_middleware(
    limiter: GlobalRateLimiter,
    request: Request,
    next: Next,
) -> Result<Response, StatusCode> {
    match limiter.check() {
        Ok(_) => Ok(next.run(request).await),
        Err(_) => Err(StatusCode::TOO_MANY_REQUESTS),
    }
}

