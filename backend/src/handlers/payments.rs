//! Payment handlers for marketplace transactions

use axum::{
    extract::{Path, Query, State},
    Extension, Json,
};
use uuid::Uuid;
use std::collections::HashMap;

use crate::{
    AppState,
    middleware::AuthUser,
    models::{
        CreatePaymentRequest, CreateCheckoutSessionRequest, CheckoutSessionResponse,
        CreateConnectAccountRequest, ConnectOnboardingResponse, ConnectAccountStatus,
        PaginatedResponse, PaginationMeta, PaginationParams, Payment, Payout, Invoice,
    },
    services::PaymentService,
    handlers::{ApiError, ApiResult, SuccessResponse},
};

/// Get payment history for authenticated user
pub async fn get_payment_history(
    State(state): State<AppState>,
    Extension(auth_user): Extension<AuthUser>,
    Query(pagination): Query<PaginationParams>,
) -> ApiResult<PaginatedResponse<Payment>> {
    let (payments, total) = PaymentService::get_user_payments(
        state.db.pool(),
        auth_user.id,
        pagination.page,
        pagination.per_page,
    )
    .await
    .map_err(|e| ApiError::Internal(e.into()))?;

    Ok(Json(SuccessResponse::new(PaginatedResponse {
        data: payments,
        meta: PaginationMeta::new(pagination.page, pagination.per_page, total),
    })))
}

/// Get single payment by ID
pub async fn get_payment(
    State(state): State<AppState>,
    Extension(auth_user): Extension<AuthUser>,
    Path(id): Path<Uuid>,
) -> ApiResult<Payment> {
    let payment = PaymentService::get_by_id(state.db.pool(), id)
        .await
        .map_err(|e| ApiError::Internal(e.into()))?
        .ok_or(ApiError::NotFound("Payment not found".into()))?;

    // Verify user has access to this payment
    if payment.payer_id != auth_user.id && payment.payee_id != auth_user.id {
        return Err(ApiError::Forbidden("Access denied".into()));
    }

    Ok(Json(SuccessResponse::new(payment)))
}

/// Create a new payment (initiate checkout)
pub async fn create_payment(
    State(state): State<AppState>,
    Extension(auth_user): Extension<AuthUser>,
    Json(req): Json<CreatePaymentRequest>,
) -> ApiResult<Payment> {
    // Get project to find the expert (payee)
    let project: Option<(Uuid,)> = sqlx::query_as(
        "SELECT expert_id FROM projects WHERE id = $1"
    )
    .bind(req.project_id)
    .fetch_optional(state.db.pool())
    .await
    .map_err(|e| ApiError::Internal(e.into()))?;

    let (payee_id,) = project.ok_or(ApiError::NotFound("Project not found".into()))?;

    let payment = PaymentService::create_payment(
        state.db.pool(),
        auth_user.id,
        payee_id,
        &req,
    )
    .await
    .map_err(|e| ApiError::Internal(e.into()))?;

    Ok(Json(SuccessResponse::new(payment)))
}

/// Get expert's pending balance
pub async fn get_pending_balance(
    State(state): State<AppState>,
    Extension(auth_user): Extension<AuthUser>,
) -> ApiResult<serde_json::Value> {
    let balance = PaymentService::get_pending_balance(state.db.pool(), auth_user.id)
        .await
        .map_err(|e| ApiError::Internal(e.into()))?;

    Ok(Json(SuccessResponse::new(serde_json::json!({
        "pending_balance": balance,
        "currency": "EUR"
    }))))
}

/// Get expert's payout history
pub async fn get_payouts(
    State(state): State<AppState>,
    Extension(auth_user): Extension<AuthUser>,
    Query(pagination): Query<PaginationParams>,
) -> ApiResult<PaginatedResponse<Payout>> {
    let (payouts, total) = PaymentService::get_expert_payouts(
        state.db.pool(),
        auth_user.id,
        pagination.page,
        pagination.per_page,
    )
    .await
    .map_err(|e| ApiError::Internal(e.into()))?;

    Ok(Json(SuccessResponse::new(PaginatedResponse {
        data: payouts,
        meta: PaginationMeta::new(pagination.page, pagination.per_page, total),
    })))
}

/// Get user's invoices
pub async fn get_invoices(
    State(state): State<AppState>,
    Extension(auth_user): Extension<AuthUser>,
    Query(pagination): Query<PaginationParams>,
) -> ApiResult<PaginatedResponse<Invoice>> {
    let (invoices, total) = PaymentService::get_user_invoices(
        state.db.pool(),
        auth_user.id,
        pagination.page,
        pagination.per_page,
    )
    .await
    .map_err(|e| ApiError::Internal(e.into()))?;

    Ok(Json(SuccessResponse::new(PaginatedResponse {
        data: invoices,
        meta: PaginationMeta::new(pagination.page, pagination.per_page, total),
    })))
}

/// Get single invoice by ID
pub async fn get_invoice(
    State(state): State<AppState>,
    Extension(auth_user): Extension<AuthUser>,
    Path(id): Path<Uuid>,
) -> ApiResult<Invoice> {
    let invoice = PaymentService::get_invoice_by_id(state.db.pool(), id, auth_user.id)
        .await
        .map_err(|e| ApiError::Internal(e.into()))?
        .ok_or_else(|| ApiError::NotFound("Invoice not found".to_string()))?;

    Ok(Json(SuccessResponse::new(invoice)))
}

/// Get invoice as HTML for printing/PDF generation
pub async fn get_invoice_html(
    State(state): State<AppState>,
    Extension(auth_user): Extension<AuthUser>,
    Path(id): Path<Uuid>,
) -> Result<axum::response::Html<String>, ApiError> {
    let invoice = PaymentService::get_invoice_by_id(state.db.pool(), id, auth_user.id)
        .await
        .map_err(|e| ApiError::Internal(e.into()))?
        .ok_or_else(|| ApiError::NotFound("Invoice not found".to_string()))?;

    let html = generate_invoice_html(&invoice);
    Ok(axum::response::Html(html))
}

/// Generate HTML invoice template
fn generate_invoice_html(invoice: &Invoice) -> String {
    let issuer = &invoice.issuer_details;
    let recipient = &invoice.recipient_details;

    let line_items_html: String = invoice.line_items.iter().map(|item| {
        format!(
            r#"<tr>
                <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">{}</td>
                <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: center;">{}</td>
                <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">{:.2} {}</td>
                <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">{:.2} {}</td>
            </tr>"#,
            item.description,
            item.quantity,
            item.unit_price as f64 / 100.0,
            invoice.currency,
            item.amount as f64 / 100.0,
            invoice.currency
        )
    }).collect();

    let tax_rate_display = invoice.tax_rate
        .map(|r| format!("{:.1}%", r))
        .unwrap_or_else(|| "0%".to_string());

    let tax_amount = invoice.tax_amount.unwrap_or(0) as f64 / 100.0;

    format!(
        r#"<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Rechnung {}</title>
    <style>
        * {{ margin: 0; padding: 0; box-sizing: border-box; }}
        body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1f2937; background: #fff; }}
        .invoice {{ max-width: 800px; margin: 0 auto; padding: 40px; }}
        .header {{ display: flex; justify-content: space-between; margin-bottom: 40px; }}
        .logo {{ font-size: 24px; font-weight: bold; color: #4f46e5; }}
        .invoice-title {{ text-align: right; }}
        .invoice-title h1 {{ font-size: 28px; color: #1f2937; margin-bottom: 8px; }}
        .invoice-number {{ color: #6b7280; font-size: 14px; }}
        .parties {{ display: flex; justify-content: space-between; margin-bottom: 40px; }}
        .party {{ width: 45%; }}
        .party-label {{ font-size: 12px; color: #6b7280; text-transform: uppercase; margin-bottom: 8px; }}
        .party-name {{ font-weight: 600; font-size: 16px; margin-bottom: 4px; }}
        .party-details {{ font-size: 14px; color: #4b5563; }}
        .meta {{ display: flex; gap: 40px; margin-bottom: 40px; padding: 20px; background: #f9fafb; border-radius: 8px; }}
        .meta-item {{ }}
        .meta-label {{ font-size: 12px; color: #6b7280; text-transform: uppercase; }}
        .meta-value {{ font-size: 16px; font-weight: 600; }}
        table {{ width: 100%; border-collapse: collapse; margin-bottom: 24px; }}
        th {{ text-align: left; padding: 12px; background: #f3f4f6; font-size: 12px; text-transform: uppercase; color: #6b7280; }}
        th:nth-child(2), th:nth-child(3), th:nth-child(4) {{ text-align: right; }}
        th:nth-child(2) {{ text-align: center; }}
        .totals {{ margin-left: auto; width: 300px; }}
        .total-row {{ display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e5e7eb; }}
        .total-row.grand {{ font-size: 18px; font-weight: bold; border-bottom: 2px solid #1f2937; padding: 12px 0; }}
        .footer {{ margin-top: 60px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #6b7280; text-align: center; }}
        .status {{ display: inline-block; padding: 4px 12px; border-radius: 9999px; font-size: 12px; font-weight: 600; }}
        .status-paid {{ background: #d1fae5; color: #065f46; }}
        .status-open {{ background: #fef3c7; color: #92400e; }}
        .status-draft {{ background: #e5e7eb; color: #374151; }}
        @media print {{
            body {{ print-color-adjust: exact; -webkit-print-color-adjust: exact; }}
            .invoice {{ padding: 20px; }}
            .no-print {{ display: none; }}
        }}
    </style>
</head>
<body>
    <div class="invoice">
        <div class="header">
            <div class="logo">DACH Marketplace</div>
            <div class="invoice-title">
                <h1>RECHNUNG</h1>
                <div class="invoice-number">{}</div>
            </div>
        </div>

        <div class="parties">
            <div class="party">
                <div class="party-label">Von</div>
                <div class="party-name">{}</div>
                <div class="party-details">
                    {}<br>
                    {} {}<br>
                    {}<br>
                    {}
                </div>
            </div>
            <div class="party">
                <div class="party-label">An</div>
                <div class="party-name">{}</div>
                <div class="party-details">
                    {}<br>
                    {} {}<br>
                    {}<br>
                    {}
                </div>
            </div>
        </div>

        <div class="meta">
            <div class="meta-item">
                <div class="meta-label">Rechnungsdatum</div>
                <div class="meta-value">{}</div>
            </div>
            <div class="meta-item">
                <div class="meta-label">Fälligkeitsdatum</div>
                <div class="meta-value">{}</div>
            </div>
            <div class="meta-item">
                <div class="meta-label">Status</div>
                <div class="meta-value"><span class="status {}">{}</span></div>
            </div>
        </div>

        <table>
            <thead>
                <tr>
                    <th>Beschreibung</th>
                    <th>Menge</th>
                    <th>Einzelpreis</th>
                    <th>Betrag</th>
                </tr>
            </thead>
            <tbody>
                {}
            </tbody>
        </table>

        <div class="totals">
            <div class="total-row">
                <span>Zwischensumme</span>
                <span>{:.2} {}</span>
            </div>
            <div class="total-row">
                <span>MwSt. ({})</span>
                <span>{:.2} {}</span>
            </div>
            <div class="total-row grand">
                <span>Gesamtbetrag</span>
                <span>{:.2} {}</span>
            </div>
        </div>

        {}

        <div class="footer">
            <p>DACH Automation Marketplace • Schweiz, Deutschland, Österreich</p>
            <p style="margin-top: 8px;">Bei Fragen zu dieser Rechnung kontaktieren Sie uns unter support@dach-marketplace.com</p>
        </div>

        <div class="no-print" style="text-align: center; margin-top: 40px;">
            <button onclick="window.print()" style="padding: 12px 24px; background: #4f46e5; color: white; border: none; border-radius: 8px; font-size: 16px; cursor: pointer;">
                Rechnung drucken / Als PDF speichern
            </button>
        </div>
    </div>
</body>
</html>"#,
        invoice.invoice_number,
        invoice.invoice_number,
        issuer.name.as_deref().unwrap_or(""),
        issuer.address_line1.as_deref().unwrap_or(""),
        issuer.postal_code.as_deref().unwrap_or(""),
        issuer.city.as_deref().unwrap_or(""),
        issuer.country.as_deref().unwrap_or(""),
        issuer.vat_id.as_ref().map(|v| format!("USt-IdNr.: {}", v)).unwrap_or_default(),
        recipient.name.as_deref().unwrap_or(""),
        recipient.address_line1.as_deref().unwrap_or(""),
        recipient.postal_code.as_deref().unwrap_or(""),
        recipient.city.as_deref().unwrap_or(""),
        recipient.country.as_deref().unwrap_or(""),
        recipient.vat_id.as_ref().map(|v| format!("USt-IdNr.: {}", v)).unwrap_or_default(),
        invoice.created_at.format("%d.%m.%Y"),
        invoice.due_date.map(|d| d.format("%d.%m.%Y").to_string()).unwrap_or_else(|| "Sofort fällig".to_string()),
        match invoice.status {
            crate::models::InvoiceStatus::Paid => "status-paid",
            crate::models::InvoiceStatus::Open => "status-open",
            _ => "status-draft",
        },
        match invoice.status {
            crate::models::InvoiceStatus::Paid => "Bezahlt",
            crate::models::InvoiceStatus::Open => "Offen",
            crate::models::InvoiceStatus::Draft => "Entwurf",
            crate::models::InvoiceStatus::Void => "Storniert",
            crate::models::InvoiceStatus::Uncollectible => "Uneinbringlich",
        },
        line_items_html,
        invoice.subtotal as f64 / 100.0,
        invoice.currency,
        tax_rate_display,
        tax_amount,
        invoice.currency,
        invoice.total as f64 / 100.0,
        invoice.currency,
        invoice.notes.as_ref().map(|n| format!(r#"<div style="margin-top: 40px; padding: 20px; background: #f9fafb; border-radius: 8px;"><strong>Anmerkungen:</strong><br>{}</div>"#, n)).unwrap_or_default(),
    )
}

/// Create a Stripe checkout session for purchasing a service
pub async fn create_checkout_session(
    State(state): State<AppState>,
    Extension(auth_user): Extension<AuthUser>,
    Json(req): Json<CreateCheckoutSessionRequest>,
) -> ApiResult<CheckoutSessionResponse> {
    // Get the service details
    let service: Option<(String, i32, String, Uuid)> = sqlx::query_as(
        r#"
        SELECT s.title, s.price, s.currency, s.expert_id
        FROM services s
        WHERE s.id = $1 AND s.is_active = true
        "#
    )
    .bind(req.service_id)
    .fetch_optional(state.db.pool())
    .await
    .map_err(|e| ApiError::Internal(e.into()))?;

    let (title, base_price, currency, expert_id) = service
        .ok_or(ApiError::NotFound("Service not found".into()))?;

    // Determine the amount based on package tier or custom amount
    let amount = if let Some(custom) = req.custom_amount {
        custom
    } else if let Some(tier) = &req.package_tier {
        // Get package price
        let package_price: Option<(i32,)> = sqlx::query_as(
            "SELECT price FROM service_packages WHERE service_id = $1 AND tier = $2"
        )
        .bind(req.service_id)
        .bind(tier)
        .fetch_optional(state.db.pool())
        .await
        .map_err(|e| ApiError::Internal(e.into()))?;

        package_price.map(|(p,)| p).unwrap_or(base_price)
    } else {
        base_price
    };

    let currency = req.currency.as_deref().unwrap_or(&currency);

    // Get expert's Stripe Connect account ID (if they have one)
    let expert_stripe_account: Option<(Option<String>,)> = sqlx::query_as(
        "SELECT stripe_account_id FROM expert_profiles WHERE id = $1"
    )
    .bind(expert_id)
    .fetch_optional(state.db.pool())
    .await
    .map_err(|e| ApiError::Internal(e.into()))?;

    let stripe_account_id = expert_stripe_account.and_then(|(id,)| id);

    // Calculate platform fee (10%)
    let platform_fee = (amount as f64 * 0.10) as i64;

    // Build metadata
    let mut metadata = HashMap::new();
    metadata.insert("service_id".to_string(), req.service_id.to_string());
    metadata.insert("buyer_id".to_string(), auth_user.id.to_string());
    metadata.insert("expert_id".to_string(), expert_id.to_string());
    if let Some(tier) = &req.package_tier {
        metadata.insert("package_tier".to_string(), tier.clone());
    }

    // Get frontend URL from config
    let frontend_url = std::env::var("FRONTEND_URL").unwrap_or_else(|_| "http://localhost:5173".to_string());
    let success_url = format!("{}/checkout/success?session_id={{CHECKOUT_SESSION_ID}}", frontend_url);
    let cancel_url = format!("{}/services/{}", frontend_url, req.service_id);

    // Create Stripe checkout session
    #[cfg(feature = "payments")]
    {
        use crate::services::payment_service::stripe_service::StripeService;

        let stripe_key = std::env::var("STRIPE_SECRET_KEY")
            .map_err(|_| ApiError::Internal(anyhow::anyhow!("Stripe not configured")))?;

        let stripe = StripeService::new(&stripe_key);

        let session = stripe.create_checkout_session(
            &title,
            amount as i64,
            currency,
            &success_url,
            &cancel_url,
            metadata,
            stripe_account_id.as_deref(),
            platform_fee,
        )
        .await
        .map_err(|e| ApiError::Internal(anyhow::anyhow!("Stripe error: {}", e)))?;

        Ok(Json(SuccessResponse::new(CheckoutSessionResponse {
            session_id: session.id.to_string(),
            checkout_url: session.url.unwrap_or_default(),
        })))
    }

    #[cfg(not(feature = "payments"))]
    {
        // Return mock response for development without Stripe
        Ok(Json(SuccessResponse::new(CheckoutSessionResponse {
            session_id: format!("cs_test_{}", uuid::Uuid::new_v4()),
            checkout_url: format!("{}/checkout/mock?service={}", frontend_url, req.service_id),
        })))
    }
}

/// Get Connect account status for the authenticated expert
pub async fn get_connect_status(
    State(state): State<AppState>,
    Extension(auth_user): Extension<AuthUser>,
) -> ApiResult<ConnectAccountStatus> {
    // Check if user is an expert and get their Connect account info
    let expert_info: Option<(Option<String>, Option<bool>, Option<bool>)> = sqlx::query_as(
        r#"
        SELECT stripe_account_id, stripe_charges_enabled, stripe_payouts_enabled
        FROM expert_profiles
        WHERE user_id = $1
        "#
    )
    .bind(auth_user.id)
    .fetch_optional(state.db.pool())
    .await
    .map_err(|e| ApiError::Internal(e.into()))?;

    match expert_info {
        Some((account_id, charges_enabled, payouts_enabled)) => {
            let has_account = account_id.is_some();
            let charges = charges_enabled.unwrap_or(false);
            let payouts = payouts_enabled.unwrap_or(false);

            Ok(Json(SuccessResponse::new(ConnectAccountStatus {
                has_account,
                account_id,
                charges_enabled: charges,
                payouts_enabled: payouts,
                onboarding_complete: has_account && charges && payouts,
            })))
        }
        None => {
            Err(ApiError::NotFound("Expert profile not found".into()))
        }
    }
}

/// Create a Stripe Connect account for an expert and return onboarding link
pub async fn create_connect_account(
    State(state): State<AppState>,
    Extension(auth_user): Extension<AuthUser>,
    Json(req): Json<CreateConnectAccountRequest>,
) -> ApiResult<ConnectOnboardingResponse> {
    // Validate country
    let country = req.country.to_uppercase();
    if !["CH", "DE", "AT"].contains(&country.as_str()) {
        return Err(ApiError::BadRequest("Country must be CH, DE, or AT".into()));
    }

    // Get expert profile and email
    let expert_info: Option<(Uuid, Option<String>, String)> = sqlx::query_as(
        r#"
        SELECT ep.id, ep.stripe_account_id, u.email
        FROM expert_profiles ep
        JOIN users u ON u.id = ep.user_id
        WHERE ep.user_id = $1
        "#
    )
    .bind(auth_user.id)
    .fetch_optional(state.db.pool())
    .await
    .map_err(|e| ApiError::Internal(e.into()))?;

    let (expert_id, existing_account_id, email) = expert_info
        .ok_or_else(|| ApiError::NotFound("Expert profile not found".into()))?;

    // Check if already has an account
    if existing_account_id.is_some() {
        return Err(ApiError::BadRequest("Expert already has a Stripe Connect account".into()));
    }

    let frontend_url = std::env::var("FRONTEND_URL").unwrap_or_else(|_| "http://localhost:5173".to_string());
    let refresh_url = format!("{}/dashboard/payments/connect/refresh", frontend_url);
    let return_url = format!("{}/dashboard/payments/connect/complete", frontend_url);

    #[cfg(feature = "payments")]
    {
        use crate::services::payment_service::stripe_service::StripeService;

        let stripe_key = std::env::var("STRIPE_SECRET_KEY")
            .map_err(|_| ApiError::Internal(anyhow::anyhow!("Stripe not configured")))?;
        let stripe = StripeService::new(&stripe_key);

        // Create Stripe Connect account
        let account = stripe
            .create_connect_account(&email, &country)
            .await
            .map_err(|e| ApiError::Internal(anyhow::anyhow!("Failed to create Connect account: {}", e)))?;

        let account_id = account.id.to_string();

        // Save account ID to database
        sqlx::query(
            r#"
            UPDATE expert_profiles
            SET stripe_account_id = $2, updated_at = NOW()
            WHERE id = $1
            "#
        )
        .bind(expert_id)
        .bind(&account_id)
        .execute(state.db.pool())
        .await
        .map_err(|e| ApiError::Internal(e.into()))?;

        // Create onboarding link
        let account_link = stripe
            .create_account_link(&account_id, &refresh_url, &return_url)
            .await
            .map_err(|e| ApiError::Internal(anyhow::anyhow!("Failed to create account link: {}", e)))?;

        Ok(Json(SuccessResponse::new(ConnectOnboardingResponse {
            account_id,
            onboarding_url: account_link.url,
            expires_at: account_link.expires_at,
        })))
    }

    #[cfg(not(feature = "payments"))]
    {
        // Mock response for development
        let mock_account_id = format!("acct_mock_{}", uuid::Uuid::new_v4().to_string().replace("-", "")[..16].to_string());

        // Save mock account ID to database
        sqlx::query(
            r#"
            UPDATE expert_profiles
            SET stripe_account_id = $2, stripe_charges_enabled = true, stripe_payouts_enabled = true, updated_at = NOW()
            WHERE id = $1
            "#
        )
        .bind(expert_id)
        .bind(&mock_account_id)
        .execute(state.db.pool())
        .await
        .map_err(|e| ApiError::Internal(e.into()))?;

        Ok(Json(SuccessResponse::new(ConnectOnboardingResponse {
            account_id: mock_account_id,
            onboarding_url: format!("{}/dashboard/payments/connect/complete?mock=true", frontend_url),
            expires_at: chrono::Utc::now().timestamp() + 3600,
        })))
    }
}

/// Generate a new onboarding link for an existing Connect account
pub async fn refresh_connect_onboarding(
    State(state): State<AppState>,
    Extension(auth_user): Extension<AuthUser>,
) -> ApiResult<ConnectOnboardingResponse> {
    // Get expert's existing Connect account
    let expert_info: Option<(Uuid, Option<String>)> = sqlx::query_as(
        r#"
        SELECT id, stripe_account_id
        FROM expert_profiles
        WHERE user_id = $1
        "#
    )
    .bind(auth_user.id)
    .fetch_optional(state.db.pool())
    .await
    .map_err(|e| ApiError::Internal(e.into()))?;

    let (_expert_id, account_id) = expert_info
        .ok_or_else(|| ApiError::NotFound("Expert profile not found".into()))?;

    let account_id = account_id
        .ok_or_else(|| ApiError::BadRequest("No Connect account found. Please create one first.".into()))?;

    let frontend_url = std::env::var("FRONTEND_URL").unwrap_or_else(|_| "http://localhost:5173".to_string());
    let refresh_url = format!("{}/dashboard/payments/connect/refresh", frontend_url);
    let return_url = format!("{}/dashboard/payments/connect/complete", frontend_url);

    #[cfg(feature = "payments")]
    {
        use crate::services::payment_service::stripe_service::StripeService;

        let stripe_key = std::env::var("STRIPE_SECRET_KEY")
            .map_err(|_| ApiError::Internal(anyhow::anyhow!("Stripe not configured")))?;
        let stripe = StripeService::new(&stripe_key);

        let account_link = stripe
            .create_account_link(&account_id, &refresh_url, &return_url)
            .await
            .map_err(|e| ApiError::Internal(anyhow::anyhow!("Failed to create account link: {}", e)))?;

        Ok(Json(SuccessResponse::new(ConnectOnboardingResponse {
            account_id,
            onboarding_url: account_link.url,
            expires_at: account_link.expires_at,
        })))
    }

    #[cfg(not(feature = "payments"))]
    {
        Ok(Json(SuccessResponse::new(ConnectOnboardingResponse {
            account_id,
            onboarding_url: format!("{}/dashboard/payments/connect/complete?mock=true", frontend_url),
            expires_at: chrono::Utc::now().timestamp() + 3600,
        })))
    }
}

/// Stripe webhook handler
pub async fn stripe_webhook(
    State(state): State<AppState>,
    headers: axum::http::HeaderMap,
    body: String,
) -> ApiResult<()> {
    #[cfg(feature = "payments")]
    {
        use stripe::{Webhook, EventType, EventObject};

        // Get the Stripe signature from headers
        let signature = headers
            .get("stripe-signature")
            .and_then(|v| v.to_str().ok())
            .ok_or(ApiError::BadRequest("Missing Stripe signature".into()))?;

        // Get webhook secret from environment
        let webhook_secret = std::env::var("STRIPE_WEBHOOK_SECRET")
            .map_err(|_| ApiError::Internal(anyhow::anyhow!("Stripe webhook secret not configured")))?;

        // Verify and construct the event
        let event = Webhook::construct_event(&body, signature, &webhook_secret)
            .map_err(|e| ApiError::BadRequest(format!("Invalid webhook signature: {}", e)))?;

        // Handle different event types
        match event.type_ {
            EventType::CheckoutSessionCompleted => {
                if let EventObject::CheckoutSession(session) = event.data.object {
                    // Extract metadata
                    let metadata = session.metadata.unwrap_or_default();
                    let service_id = metadata.get("service_id").cloned();
                    let buyer_id = metadata.get("buyer_id").cloned();
                    let expert_id = metadata.get("expert_id").cloned();
                    let package_tier = metadata.get("package_tier").cloned();

                    // Get payment intent ID
                    let payment_intent_id = session.payment_intent
                        .map(|pi| match pi {
                            stripe::Expandable::Id(id) => id.to_string(),
                            stripe::Expandable::Object(obj) => obj.id.to_string(),
                        });

                    // Get amount
                    let amount = session.amount_total.unwrap_or(0) as i32;
                    let currency = session.currency
                        .map(|c| c.to_string())
                        .unwrap_or_else(|| "eur".to_string());

                    // Create payment record if we have the required info
                    if let (Some(buyer_id_str), Some(expert_id_str)) = (buyer_id, expert_id) {
                        if let (Ok(buyer_uuid), Ok(expert_uuid)) = (
                            buyer_id_str.parse::<Uuid>(),
                            expert_id_str.parse::<Uuid>()
                        ) {
                            // Calculate platform fee (10%)
                            let platform_fee = (amount as f64 * 0.10) as i32;
                            let net_amount = amount - platform_fee;

                            // Create payment record
                            let _payment = sqlx::query(
                                r#"
                                INSERT INTO payments (
                                    payer_id, payee_id, amount, currency,
                                    platform_fee, net_amount, status,
                                    stripe_payment_intent_id, paid_at,
                                    description, metadata
                                )
                                VALUES ($1, $2, $3, $4, $5, $6, 'succeeded', $7, NOW(), $8, $9)
                                "#
                            )
                            .bind(buyer_uuid)
                            .bind(expert_uuid)
                            .bind(amount)
                            .bind(&currency)
                            .bind(platform_fee)
                            .bind(net_amount)
                            .bind(payment_intent_id.as_deref())
                            .bind(format!("Service purchase{}",
                                package_tier.as_ref().map(|t| format!(" - {} package", t)).unwrap_or_default()
                            ))
                            .bind(sqlx::types::Json(serde_json::json!({
                                "service_id": service_id,
                                "package_tier": package_tier,
                                "checkout_session_id": session.id.to_string()
                            })))
                            .execute(state.db.pool())
                            .await
                            .map_err(|e| ApiError::Internal(e.into()))?;

                            tracing::info!(
                                "Payment recorded: {} {} from {} to {}",
                                amount, currency, buyer_uuid, expert_uuid
                            );

                            // Send order confirmation email
                            #[cfg(feature = "email")]
                            if let Some(email_service) = &state.email {
                                // Get buyer email
                                if let Ok(Some((buyer_email,))) = sqlx::query_as::<_, (String,)>(
                                    "SELECT email FROM users WHERE id = $1"
                                )
                                .bind(buyer_uuid)
                                .fetch_optional(state.db.pool())
                                .await {
                                    let service_name = metadata.get("service_title")
                                        .cloned()
                                        .unwrap_or_else(|| "Dienstleistung".to_string());
                                    
                                    let _ = email_service.send_order_confirmation(
                                        &buyer_email,
                                        amount,
                                        &currency,
                                        &service_name,
                                        &session.id.to_string(),
                                    ).await;
                                }
                            }
                        }
                    }
                }
            }

            EventType::CheckoutSessionExpired => {
                if let EventObject::CheckoutSession(session) = event.data.object {
                    tracing::info!("Checkout session expired: {}", session.id);
                }
            }

            EventType::PaymentIntentSucceeded => {
                if let EventObject::PaymentIntent(intent) = event.data.object {
                    // Update any pending payment with this intent ID
                    let _ = sqlx::query(
                        r#"
                        UPDATE payments
                        SET status = 'succeeded', paid_at = NOW(), updated_at = NOW()
                        WHERE stripe_payment_intent_id = $1 AND status = 'pending'
                        "#
                    )
                    .bind(intent.id.to_string())
                    .execute(state.db.pool())
                    .await;

                    tracing::info!("Payment intent succeeded: {}", intent.id);
                }
            }

            EventType::PaymentIntentPaymentFailed => {
                if let EventObject::PaymentIntent(intent) = event.data.object {
                    let failure_message = intent.last_payment_error
                        .and_then(|e| e.message)
                        .unwrap_or_else(|| "Unknown error".to_string());

                    // Update payment status to failed
                    let _ = sqlx::query(
                        r#"
                        UPDATE payments
                        SET status = 'failed', failure_reason = $2, updated_at = NOW()
                        WHERE stripe_payment_intent_id = $1
                        "#
                    )
                    .bind(intent.id.to_string())
                    .bind(&failure_message)
                    .execute(state.db.pool())
                    .await;

                    tracing::warn!("Payment intent failed: {} - {}", intent.id, failure_message);
                }
            }

            EventType::ChargeRefunded => {
                if let EventObject::Charge(charge) = event.data.object {
                    let refund_amount = charge.amount_refunded as i32;
                    let payment_intent_id = charge.payment_intent
                        .map(|pi| match pi {
                            stripe::Expandable::Id(id) => id.to_string(),
                            stripe::Expandable::Object(obj) => obj.id.to_string(),
                        });

                    if let Some(pi_id) = payment_intent_id {
                        // Update payment with refund info
                        let _ = sqlx::query(
                            r#"
                            UPDATE payments
                            SET status = CASE
                                WHEN $2 >= amount THEN 'refunded'::payment_status
                                ELSE 'partially_refunded'::payment_status
                            END,
                            refund_amount = $2,
                            refunded_at = NOW(),
                            updated_at = NOW()
                            WHERE stripe_payment_intent_id = $1
                            "#
                        )
                        .bind(&pi_id)
                        .bind(refund_amount)
                        .execute(state.db.pool())
                        .await;

                        tracing::info!("Charge refunded: {} - {} cents", pi_id, refund_amount);
                    }
                }
            }

            EventType::ChargeDisputeCreated => {
                if let EventObject::Dispute(dispute) = event.data.object {
                    let payment_intent_id = dispute.payment_intent
                        .map(|pi| match pi {
                            stripe::Expandable::Id(id) => id.to_string(),
                            stripe::Expandable::Object(obj) => obj.id.to_string(),
                        });

                    if let Some(pi_id) = payment_intent_id {
                        // Mark payment as disputed
                        let _ = sqlx::query(
                            r#"
                            UPDATE payments
                            SET status = 'disputed'::payment_status, updated_at = NOW()
                            WHERE stripe_payment_intent_id = $1
                            "#
                        )
                        .bind(&pi_id)
                        .execute(state.db.pool())
                        .await;

                        tracing::warn!("Dispute created for payment: {}", pi_id);
                    }
                }
            }

            EventType::AccountUpdated => {
                if let EventObject::Account(account) = event.data.object {
                    // Update expert's Stripe account status
                    let charges_enabled = account.charges_enabled.unwrap_or(false);
                    let payouts_enabled = account.payouts_enabled.unwrap_or(false);

                    let _ = sqlx::query(
                        r#"
                        UPDATE expert_profiles
                        SET stripe_charges_enabled = $2,
                            stripe_payouts_enabled = $3,
                            updated_at = NOW()
                        WHERE stripe_account_id = $1
                        "#
                    )
                    .bind(account.id.to_string())
                    .bind(charges_enabled)
                    .bind(payouts_enabled)
                    .execute(state.db.pool())
                    .await;

                    tracing::info!(
                        "Account updated: {} - charges: {}, payouts: {}",
                        account.id, charges_enabled, payouts_enabled
                    );
                }
            }

            _ => {
                tracing::debug!("Unhandled webhook event type: {:?}", event.type_);
            }
        }

        Ok(Json(SuccessResponse::new(())))
    }

    #[cfg(not(feature = "payments"))]
    {
        // In development without Stripe, just acknowledge the webhook
        tracing::info!("Webhook received (payments feature disabled)");
        Ok(Json(SuccessResponse::new(())))
    }
}

