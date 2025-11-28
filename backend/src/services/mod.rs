pub mod user_service;
pub mod expert_service;
pub mod service_service;
pub mod project_service;
pub mod message_service;
pub mod review_service;
pub mod portfolio_service;
pub mod availability_service;
pub mod client_service;
pub mod payment_service;
pub mod admin_service;
pub mod category_service;
pub mod report_service;

// Optional feature-gated modules
#[cfg(feature = "search")]
pub mod search_service;
#[cfg(feature = "email")]
pub mod email_service;
#[cfg(feature = "storage")]
pub mod storage_service;

pub use user_service::*;
pub use expert_service::*;
pub use service_service::*;
pub use project_service::*;
pub use message_service::*;
pub use review_service::*;
pub use portfolio_service::*;
pub use availability_service::*;
pub use client_service::*;
pub use payment_service::*;
pub use admin_service::*;
pub use category_service::*;
pub use report_service::*;

#[cfg(feature = "search")]
pub use search_service::*;
#[cfg(feature = "email")]
pub use email_service::*;
#[cfg(feature = "storage")]
pub use storage_service::*;
