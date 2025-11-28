-- Payments and Transactions Migration
-- Supports Stripe Connect marketplace payments for DACH region

-- Payment status enum
CREATE TYPE payment_status AS ENUM (
    'pending',
    'processing',
    'succeeded',
    'failed',
    'refunded',
    'partially_refunded',
    'disputed',
    'cancelled'
);

-- Payout status enum
CREATE TYPE payout_status AS ENUM (
    'pending',
    'in_transit',
    'paid',
    'failed',
    'cancelled'
);

-- Invoice status enum
CREATE TYPE invoice_status AS ENUM (
    'draft',
    'open',
    'paid',
    'void',
    'uncollectible'
);

-- Payments table (tracks all payment transactions)
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    payer_id UUID NOT NULL REFERENCES users(id),
    payee_id UUID NOT NULL REFERENCES users(id),
    amount INTEGER NOT NULL,  -- Amount in cents
    currency VARCHAR(3) NOT NULL DEFAULT 'EUR',
    platform_fee INTEGER NOT NULL DEFAULT 0,  -- Platform fee in cents
    net_amount INTEGER NOT NULL,  -- Amount after platform fee
    status payment_status NOT NULL DEFAULT 'pending',
    stripe_payment_intent_id VARCHAR(255),
    stripe_charge_id VARCHAR(255),
    stripe_transfer_id VARCHAR(255),
    description TEXT,
    metadata JSONB DEFAULT '{}',
    failure_reason TEXT,
    refund_amount INTEGER DEFAULT 0,
    refund_reason TEXT,
    paid_at TIMESTAMPTZ,
    refunded_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Payouts table (tracks payouts to experts)
CREATE TABLE payouts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    expert_id UUID NOT NULL REFERENCES users(id),
    amount INTEGER NOT NULL,  -- Amount in cents
    currency VARCHAR(3) NOT NULL DEFAULT 'EUR',
    status payout_status NOT NULL DEFAULT 'pending',
    stripe_payout_id VARCHAR(255),
    stripe_transfer_id VARCHAR(255),
    destination_account VARCHAR(255),  -- Stripe Connect account ID
    arrival_date DATE,
    description TEXT,
    metadata JSONB DEFAULT '{}',
    failure_reason TEXT,
    paid_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Invoices table
CREATE TABLE invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_number VARCHAR(50) NOT NULL UNIQUE,
    project_id UUID REFERENCES projects(id),
    payment_id UUID REFERENCES payments(id),
    issuer_id UUID NOT NULL REFERENCES users(id),
    recipient_id UUID NOT NULL REFERENCES users(id),
    subtotal INTEGER NOT NULL,  -- Amount before tax in cents
    tax_rate DECIMAL(5,2) DEFAULT 0,  -- VAT rate
    tax_amount INTEGER DEFAULT 0,  -- Tax in cents
    total INTEGER NOT NULL,  -- Total amount in cents
    currency VARCHAR(3) NOT NULL DEFAULT 'EUR',
    status invoice_status NOT NULL DEFAULT 'draft',
    stripe_invoice_id VARCHAR(255),
    due_date DATE,
    paid_at TIMESTAMPTZ,
    notes TEXT,
    line_items JSONB NOT NULL DEFAULT '[]',
    issuer_details JSONB NOT NULL DEFAULT '{}',  -- Company name, address, VAT ID
    recipient_details JSONB NOT NULL DEFAULT '{}',
    pdf_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add Stripe Connect fields to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS stripe_customer_id VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS stripe_connect_account_id VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS stripe_connect_onboarded BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS stripe_connect_payouts_enabled BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS default_currency VARCHAR(3) DEFAULT 'EUR';
ALTER TABLE users ADD COLUMN IF NOT EXISTS vat_id VARCHAR(50);
ALTER TABLE users ADD COLUMN IF NOT EXISTS billing_address JSONB DEFAULT '{}';

-- Indexes for payments
CREATE INDEX idx_payments_project ON payments(project_id);
CREATE INDEX idx_payments_payer ON payments(payer_id);
CREATE INDEX idx_payments_payee ON payments(payee_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_stripe_intent ON payments(stripe_payment_intent_id);
CREATE INDEX idx_payments_created ON payments(created_at DESC);

-- Indexes for payouts
CREATE INDEX idx_payouts_expert ON payouts(expert_id);
CREATE INDEX idx_payouts_status ON payouts(status);
CREATE INDEX idx_payouts_created ON payouts(created_at DESC);

-- Indexes for invoices
CREATE INDEX idx_invoices_issuer ON invoices(issuer_id);
CREATE INDEX idx_invoices_recipient ON invoices(recipient_id);
CREATE INDEX idx_invoices_project ON invoices(project_id);
CREATE INDEX idx_invoices_status ON invoices(status);
CREATE INDEX idx_invoices_number ON invoices(invoice_number);

-- Triggers for updated_at
CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payouts_updated_at BEFORE UPDATE ON payouts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_invoices_updated_at BEFORE UPDATE ON invoices
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

