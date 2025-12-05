//! Payment service using Stripe
//! This module handles all payment operations including Stripe Connect for marketplace payments.

use sqlx::PgPool;
use uuid::Uuid;
use crate::models::{Payment, PaymentStatus, Payout, Invoice, CreatePaymentRequest};

/// Platform fee percentage (e.g., 10% = 0.10)
const PLATFORM_FEE_RATE: f64 = 0.10;

pub struct PaymentService;

impl PaymentService {
    /// Create a new payment record
    pub async fn create_payment(
        pool: &PgPool,
        payer_id: Uuid,
        payee_id: Uuid,
        req: &CreatePaymentRequest,
    ) -> Result<Payment, sqlx::Error> {
        let platform_fee = ((req.amount as f64) * PLATFORM_FEE_RATE) as i32;
        let net_amount = req.amount - platform_fee;

        sqlx::query_as::<_, Payment>(
            r#"
            INSERT INTO payments (project_id, payer_id, payee_id, amount, currency, platform_fee, net_amount, description)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING *
            "#,
        )
        .bind(req.project_id)
        .bind(payer_id)
        .bind(payee_id)
        .bind(req.amount)
        .bind(&req.currency)
        .bind(platform_fee)
        .bind(net_amount)
        .bind(&req.description)
        .fetch_one(pool)
        .await
    }

    /// Get payment by ID
    pub async fn get_by_id(pool: &PgPool, id: Uuid) -> Result<Option<Payment>, sqlx::Error> {
        sqlx::query_as::<_, Payment>("SELECT * FROM payments WHERE id = $1")
            .bind(id)
            .fetch_optional(pool)
            .await
    }

    /// Get payments for a user (as payer or payee)
    pub async fn get_user_payments(
        pool: &PgPool,
        user_id: Uuid,
        page: u32,
        per_page: u32,
    ) -> Result<(Vec<Payment>, i64), sqlx::Error> {
        let offset = (page.saturating_sub(1)) * per_page;

        let payments = sqlx::query_as::<_, Payment>(
            r#"
            SELECT * FROM payments
            WHERE payer_id = $1 OR payee_id = $1
            ORDER BY created_at DESC
            LIMIT $2 OFFSET $3
            "#,
        )
        .bind(user_id)
        .bind(per_page as i64)
        .bind(offset as i64)
        .fetch_all(pool)
        .await?;

        let total: i64 = sqlx::query_scalar(
            "SELECT COUNT(*) FROM payments WHERE payer_id = $1 OR payee_id = $1"
        )
        .bind(user_id)
        .fetch_one(pool)
        .await?;

        Ok((payments, total))
    }

    /// Update payment status
    pub async fn update_status(
        pool: &PgPool,
        id: Uuid,
        status: PaymentStatus,
        stripe_payment_intent_id: Option<&str>,
    ) -> Result<Payment, sqlx::Error> {
        let paid_at = if status == PaymentStatus::Succeeded {
            Some(chrono::Utc::now())
        } else {
            None
        };

        sqlx::query_as::<_, Payment>(
            r#"
            UPDATE payments
            SET status = $2, stripe_payment_intent_id = COALESCE($3, stripe_payment_intent_id),
                paid_at = COALESCE($4, paid_at), updated_at = NOW()
            WHERE id = $1
            RETURNING *
            "#,
        )
        .bind(id)
        .bind(status)
        .bind(stripe_payment_intent_id)
        .bind(paid_at)
        .fetch_one(pool)
        .await
    }

    /// Process refund
    pub async fn process_refund(
        pool: &PgPool,
        id: Uuid,
        refund_amount: i32,
        reason: &str,
    ) -> Result<Payment, sqlx::Error> {
        sqlx::query_as::<_, Payment>(
            r#"
            UPDATE payments
            SET status = CASE WHEN refund_amount + $2 >= amount THEN 'refunded'::payment_status ELSE 'partially_refunded'::payment_status END,
                refund_amount = COALESCE(refund_amount, 0) + $2,
                refund_reason = $3,
                refunded_at = NOW(),
                updated_at = NOW()
            WHERE id = $1
            RETURNING *
            "#,
        )
        .bind(id)
        .bind(refund_amount)
        .bind(reason)
        .fetch_one(pool)
        .await
    }

    /// Get expert's pending payout balance
    pub async fn get_pending_balance(pool: &PgPool, expert_id: Uuid) -> Result<i64, sqlx::Error> {
        let balance: Option<i64> = sqlx::query_scalar(
            r#"
            SELECT COALESCE(SUM(net_amount), 0)
            FROM payments
            WHERE payee_id = $1 AND status = 'succeeded' AND stripe_transfer_id IS NULL
            "#,
        )
        .bind(expert_id)
        .fetch_one(pool)
        .await?;

        Ok(balance.unwrap_or(0))
    }

    /// Create payout record
    pub async fn create_payout(
        pool: &PgPool,
        expert_id: Uuid,
        amount: i32,
        currency: &str,
        destination_account: &str,
    ) -> Result<Payout, sqlx::Error> {
        sqlx::query_as::<_, Payout>(
            r#"
            INSERT INTO payouts (expert_id, amount, currency, destination_account)
            VALUES ($1, $2, $3, $4)
            RETURNING *
            "#,
        )
        .bind(expert_id)
        .bind(amount)
        .bind(currency)
        .bind(destination_account)
        .fetch_one(pool)
        .await
    }

    /// Get expert's payouts
    pub async fn get_expert_payouts(
        pool: &PgPool,
        expert_id: Uuid,
        page: u32,
        per_page: u32,
    ) -> Result<(Vec<Payout>, i64), sqlx::Error> {
        let offset = (page.saturating_sub(1)) * per_page;

        let payouts = sqlx::query_as::<_, Payout>(
            r#"
            SELECT * FROM payouts
            WHERE expert_id = $1
            ORDER BY created_at DESC
            LIMIT $2 OFFSET $3
            "#,
        )
        .bind(expert_id)
        .bind(per_page as i64)
        .bind(offset as i64)
        .fetch_all(pool)
        .await?;

        let total: i64 = sqlx::query_scalar("SELECT COUNT(*) FROM payouts WHERE expert_id = $1")
            .bind(expert_id)
            .fetch_one(pool)
            .await?;

        Ok((payouts, total))
    }

    /// Generate invoice number
    fn generate_invoice_number() -> String {
        let now = chrono::Utc::now();
        format!("INV-{}-{:04}", now.format("%Y%m"), rand::random::<u16>())
    }

    /// Create invoice
    pub async fn create_invoice(
        pool: &PgPool,
        issuer_id: Uuid,
        recipient_id: Uuid,
        project_id: Option<Uuid>,
        subtotal: i32,
        tax_rate: f64,
        currency: &str,
        line_items: serde_json::Value,
    ) -> Result<Invoice, sqlx::Error> {
        let tax_amount = ((subtotal as f64) * tax_rate) as i32;
        let total = subtotal + tax_amount;
        let invoice_number = Self::generate_invoice_number();

        sqlx::query_as::<_, Invoice>(
            r#"
            INSERT INTO invoices (invoice_number, project_id, issuer_id, recipient_id, subtotal, tax_rate, tax_amount, total, currency, line_items)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
            RETURNING *
            "#,
        )
        .bind(&invoice_number)
        .bind(project_id)
        .bind(issuer_id)
        .bind(recipient_id)
        .bind(subtotal)
        .bind(rust_decimal::Decimal::from_f64_retain(tax_rate * 100.0))
        .bind(tax_amount)
        .bind(total)
        .bind(currency)
        .bind(line_items)
        .fetch_one(pool)
        .await
    }

    /// Get user's invoices
    pub async fn get_user_invoices(
        pool: &PgPool,
        user_id: Uuid,
        page: u32,
        per_page: u32,
    ) -> Result<(Vec<Invoice>, i64), sqlx::Error> {
        let offset = (page.saturating_sub(1)) * per_page;

        let invoices = sqlx::query_as::<_, Invoice>(
            r#"
            SELECT * FROM invoices
            WHERE issuer_id = $1 OR recipient_id = $1
            ORDER BY created_at DESC
            LIMIT $2 OFFSET $3
            "#,
        )
        .bind(user_id)
        .bind(per_page as i64)
        .bind(offset as i64)
        .fetch_all(pool)
        .await?;

        let total: i64 = sqlx::query_scalar(
            "SELECT COUNT(*) FROM invoices WHERE issuer_id = $1 OR recipient_id = $1"
        )
        .bind(user_id)
        .fetch_one(pool)
        .await?;

        Ok((invoices, total))
    }

    /// Get invoice by ID (only if user is issuer or recipient)
    pub async fn get_invoice_by_id(
        pool: &PgPool,
        invoice_id: Uuid,
        user_id: Uuid,
    ) -> Result<Option<Invoice>, sqlx::Error> {
        sqlx::query_as::<_, Invoice>(
            r#"
            SELECT * FROM invoices
            WHERE id = $1 AND (issuer_id = $2 OR recipient_id = $2)
            "#,
        )
        .bind(invoice_id)
        .bind(user_id)
        .fetch_optional(pool)
        .await
    }
}

// Stripe-specific functionality (only when payments feature is enabled)
#[cfg(feature = "payments")]
pub mod stripe_service {
    use stripe::{Client, CreatePaymentIntent, Currency, PaymentIntent, PaymentIntentId, CheckoutSession, CreateCheckoutSession};
    use std::collections::HashMap;

    pub struct StripeService {
        client: Client,
    }

    impl StripeService {
        pub fn new(secret_key: &str) -> Self {
            let client = Client::new(secret_key);
            Self { client }
        }

        /// Create a Stripe Checkout Session for service purchase
        pub async fn create_checkout_session(
            &self,
            service_title: &str,
            amount: i64,
            currency: &str,
            success_url: &str,
            cancel_url: &str,
            metadata: HashMap<String, String>,
            expert_stripe_account_id: Option<&str>,
            platform_fee: i64,
        ) -> Result<CheckoutSession, stripe::StripeError> {
            let currency_enum = match currency.to_lowercase().as_str() {
                "chf" => Currency::CHF,
                "eur" => Currency::EUR,
                _ => Currency::EUR,
            };

            let mut params = CreateCheckoutSession::new();
            params.mode = Some(stripe::CheckoutSessionMode::Payment);
            params.success_url = Some(success_url);
            params.cancel_url = Some(cancel_url);
            params.metadata = Some(metadata);

            // Line items
            params.line_items = Some(vec![stripe::CreateCheckoutSessionLineItems {
                price_data: Some(stripe::CreateCheckoutSessionLineItemsPriceData {
                    currency: currency_enum,
                    unit_amount: Some(amount),
                    product_data: Some(stripe::CreateCheckoutSessionLineItemsPriceDataProductData {
                        name: service_title.to_string(),
                        ..Default::default()
                    }),
                    ..Default::default()
                }),
                quantity: Some(1),
                ..Default::default()
            }]);

            // If expert has Stripe Connect account, set up application fee
            if let Some(account_id) = expert_stripe_account_id {
                params.payment_intent_data = Some(stripe::CreateCheckoutSessionPaymentIntentData {
                    application_fee_amount: Some(platform_fee),
                    transfer_data: Some(stripe::CreateCheckoutSessionPaymentIntentDataTransferData {
                        destination: account_id.to_string(),
                        ..Default::default()
                    }),
                    ..Default::default()
                });
            }

            CheckoutSession::create(&self.client, params).await
        }

        pub async fn create_payment_intent(
            &self,
            amount: i64,
            currency: &str,
            customer_id: Option<&str>,
            metadata: HashMap<String, String>,
        ) -> Result<PaymentIntent, stripe::StripeError> {
            let currency = match currency.to_lowercase().as_str() {
                "chf" => Currency::CHF,
                "eur" => Currency::EUR,
                _ => Currency::EUR,
            };

            let mut params = CreatePaymentIntent::new(amount, currency);
            params.metadata = Some(metadata);

            if let Some(cid) = customer_id {
                params.customer = Some(cid.parse().unwrap());
            }

            PaymentIntent::create(&self.client, params).await
        }

        pub async fn confirm_payment(
            &self,
            payment_intent_id: &str,
        ) -> Result<PaymentIntent, stripe::StripeError> {
            let id: PaymentIntentId = payment_intent_id.parse().unwrap();
            PaymentIntent::confirm(&self.client, &id, Default::default()).await
        }

        pub async fn create_connect_account(
            &self,
            email: &str,
            country: &str,
        ) -> Result<stripe::Account, stripe::StripeError> {
            let mut params = stripe::CreateAccount::new();
            params.type_ = Some(stripe::AccountType::Express);
            params.email = Some(email);
            params.country = Some(country);
            params.capabilities = Some(stripe::CreateAccountCapabilities {
                transfers: Some(stripe::CreateAccountCapabilitiesTransfers {
                    requested: Some(true),
                }),
                ..Default::default()
            });

            stripe::Account::create(&self.client, params).await
        }

        pub async fn create_account_link(
            &self,
            account_id: &str,
            refresh_url: &str,
            return_url: &str,
        ) -> Result<stripe::AccountLink, stripe::StripeError> {
            let mut params = stripe::CreateAccountLink::new(
                account_id.parse().unwrap(),
                stripe::AccountLinkType::AccountOnboarding,
            );
            params.refresh_url = Some(refresh_url);
            params.return_url = Some(return_url);

            stripe::AccountLink::create(&self.client, params).await
        }

        pub async fn transfer_to_expert(
            &self,
            amount: i64,
            currency: &str,
            destination_account: &str,
            transfer_group: Option<&str>,
        ) -> Result<stripe::Transfer, stripe::StripeError> {
            let currency = match currency.to_lowercase().as_str() {
                "chf" => Currency::CHF,
                "eur" => Currency::EUR,
                _ => Currency::EUR,
            };

            let mut params = stripe::CreateTransfer::new(currency, destination_account.to_string());
            params.amount = Some(amount);
            if let Some(group) = transfer_group {
                params.transfer_group = Some(group);
            }

            stripe::Transfer::create(&self.client, params).await
        }

        /// Retrieve a checkout session by ID
        pub async fn get_checkout_session(
            &self,
            session_id: &str,
        ) -> Result<CheckoutSession, stripe::StripeError> {
            CheckoutSession::retrieve(&self.client, &session_id.parse().unwrap(), &[]).await
        }
    }
}
