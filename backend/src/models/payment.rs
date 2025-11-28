use chrono::{DateTime, NaiveDate, Utc};
use serde::{Deserialize, Serialize};
use sqlx::FromRow;
use uuid::Uuid;
use validator::Validate;

/// Payment status enum
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize, sqlx::Type)]
#[sqlx(type_name = "payment_status", rename_all = "snake_case")]
pub enum PaymentStatus {
    Pending,
    Processing,
    Succeeded,
    Failed,
    Refunded,
    PartiallyRefunded,
    Disputed,
    Cancelled,
}

/// Payout status enum
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize, sqlx::Type)]
#[sqlx(type_name = "payout_status", rename_all = "snake_case")]
pub enum PayoutStatus {
    Pending,
    InTransit,
    Paid,
    Failed,
    Cancelled,
}

/// Invoice status enum
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize, sqlx::Type)]
#[sqlx(type_name = "invoice_status", rename_all = "snake_case")]
pub enum InvoiceStatus {
    Draft,
    Open,
    Paid,
    Void,
    Uncollectible,
}

/// Payment record
#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
#[serde(rename_all = "camelCase")]
pub struct Payment {
    pub id: Uuid,
    pub project_id: Uuid,
    pub payer_id: Uuid,
    pub payee_id: Uuid,
    pub amount: i32,
    pub currency: String,
    pub platform_fee: i32,
    pub net_amount: i32,
    pub status: PaymentStatus,
    pub stripe_payment_intent_id: Option<String>,
    pub stripe_charge_id: Option<String>,
    pub stripe_transfer_id: Option<String>,
    pub description: Option<String>,
    pub metadata: Option<sqlx::types::Json<serde_json::Value>>,
    pub failure_reason: Option<String>,
    pub refund_amount: Option<i32>,
    pub refund_reason: Option<String>,
    pub paid_at: Option<DateTime<Utc>>,
    pub refunded_at: Option<DateTime<Utc>>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

/// Payout record
#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
#[serde(rename_all = "camelCase")]
pub struct Payout {
    pub id: Uuid,
    pub expert_id: Uuid,
    pub amount: i32,
    pub currency: String,
    pub status: PayoutStatus,
    pub stripe_payout_id: Option<String>,
    pub stripe_transfer_id: Option<String>,
    pub destination_account: Option<String>,
    pub arrival_date: Option<NaiveDate>,
    pub description: Option<String>,
    pub metadata: Option<sqlx::types::Json<serde_json::Value>>,
    pub failure_reason: Option<String>,
    pub paid_at: Option<DateTime<Utc>>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

/// Invoice record
#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
#[serde(rename_all = "camelCase")]
pub struct Invoice {
    pub id: Uuid,
    pub invoice_number: String,
    pub project_id: Option<Uuid>,
    pub payment_id: Option<Uuid>,
    pub issuer_id: Uuid,
    pub recipient_id: Uuid,
    pub subtotal: i32,
    pub tax_rate: Option<rust_decimal::Decimal>,
    pub tax_amount: Option<i32>,
    pub total: i32,
    pub currency: String,
    pub status: InvoiceStatus,
    pub stripe_invoice_id: Option<String>,
    pub due_date: Option<NaiveDate>,
    pub paid_at: Option<DateTime<Utc>>,
    pub notes: Option<String>,
    pub line_items: sqlx::types::Json<Vec<InvoiceLineItem>>,
    pub issuer_details: sqlx::types::Json<CompanyDetails>,
    pub recipient_details: sqlx::types::Json<CompanyDetails>,
    pub pdf_url: Option<String>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

/// Invoice line item
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct InvoiceLineItem {
    pub description: String,
    pub quantity: i32,
    pub unit_price: i32,
    pub amount: i32,
}

/// Company details for invoices
#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct CompanyDetails {
    pub name: Option<String>,
    pub address_line1: Option<String>,
    pub address_line2: Option<String>,
    pub city: Option<String>,
    pub postal_code: Option<String>,
    pub country: Option<String>,
    pub vat_id: Option<String>,
    pub email: Option<String>,
}

/// Create payment request
#[derive(Debug, Deserialize, Validate)]
#[serde(rename_all = "camelCase")]
pub struct CreatePaymentRequest {
    pub project_id: Uuid,
    #[validate(range(min = 100))]  // Minimum 1 EUR/CHF
    pub amount: i32,
    #[validate(length(min = 3, max = 3))]
    pub currency: String,
    pub description: Option<String>,
}

/// Create payout request
#[derive(Debug, Deserialize, Validate)]
#[serde(rename_all = "camelCase")]
pub struct CreatePayoutRequest {
    #[validate(range(min = 100))]
    pub amount: i32,
    #[validate(length(min = 3, max = 3))]
    pub currency: String,
    pub description: Option<String>,
}

/// Create checkout session request
#[derive(Debug, Deserialize, Validate)]
#[serde(rename_all = "camelCase")]
pub struct CreateCheckoutSessionRequest {
    pub service_id: Uuid,
    /// Optional package tier: "basic", "standard", or "premium"
    pub package_tier: Option<String>,
    /// Custom amount in cents (for custom quotes)
    pub custom_amount: Option<i32>,
    /// Currency code (EUR, CHF)
    #[validate(length(min = 3, max = 3))]
    pub currency: Option<String>,
}

/// Checkout session response
#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct CheckoutSessionResponse {
    pub session_id: String,
    pub checkout_url: String,
}

/// Request to create a Stripe Connect account for an expert
#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CreateConnectAccountRequest {
    /// Country code (CH, DE, AT)
    pub country: String,
}

/// Response with Stripe Connect onboarding link
#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ConnectOnboardingResponse {
    /// The Stripe account ID
    pub account_id: String,
    /// The onboarding URL to redirect the user to
    pub onboarding_url: String,
    /// When the link expires
    pub expires_at: i64,
}

/// Response with Connect account status
#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ConnectAccountStatus {
    /// Whether the expert has a Connect account
    pub has_account: bool,
    /// The Stripe account ID (if exists)
    pub account_id: Option<String>,
    /// Whether charges are enabled
    pub charges_enabled: bool,
    /// Whether payouts are enabled
    pub payouts_enabled: bool,
    /// Whether onboarding is complete
    pub onboarding_complete: bool,
}
