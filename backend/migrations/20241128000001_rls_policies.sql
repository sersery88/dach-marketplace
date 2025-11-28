-- Row Level Security Policies for DACH Marketplace
-- These policies provide defense-in-depth security
-- The Rust backend uses service_role which bypasses RLS
-- These policies protect against accidental exposure of anon/authenticated keys

-- ============================================================================
-- TIER 1: PUBLIC READ ACCESS (Catalog Data)
-- ============================================================================

-- Categories: Public read access
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "categories_public_read" ON categories
    FOR SELECT TO anon, authenticated
    USING (true);

CREATE POLICY "categories_service_all" ON categories
    FOR ALL TO service_role
    USING (true)
    WITH CHECK (true);

-- Services: Public read for active services only
ALTER TABLE services ENABLE ROW LEVEL SECURITY;

CREATE POLICY "services_public_read" ON services
    FOR SELECT TO anon, authenticated
    USING (is_active = true);

CREATE POLICY "services_service_all" ON services
    FOR ALL TO service_role
    USING (true)
    WITH CHECK (true);

-- Service Packages: Public read access
ALTER TABLE service_packages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "service_packages_public_read" ON service_packages
    FOR SELECT TO anon, authenticated
    USING (true);

CREATE POLICY "service_packages_service_all" ON service_packages
    FOR ALL TO service_role
    USING (true)
    WITH CHECK (true);

-- Expert Profiles: Public read for verified experts only
ALTER TABLE expert_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "expert_profiles_public_read" ON expert_profiles
    FOR SELECT TO anon, authenticated
    USING (is_verified = true);

CREATE POLICY "expert_profiles_service_all" ON expert_profiles
    FOR ALL TO service_role
    USING (true)
    WITH CHECK (true);

-- Portfolio Items: Public read access
ALTER TABLE portfolio_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "portfolio_items_public_read" ON portfolio_items
    FOR SELECT TO anon, authenticated
    USING (true);

CREATE POLICY "portfolio_items_service_all" ON portfolio_items
    FOR ALL TO service_role
    USING (true)
    WITH CHECK (true);

-- Reviews: Public read access
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "reviews_public_read" ON reviews
    FOR SELECT TO anon, authenticated
    USING (true);

CREATE POLICY "reviews_service_all" ON reviews
    FOR ALL TO service_role
    USING (true)
    WITH CHECK (true);

-- ============================================================================
-- TIER 2: BACKEND-ONLY ACCESS (Sensitive Data)
-- No policies for anon/authenticated = no direct access
-- ============================================================================

-- Users: Backend only
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_service_all" ON users
    FOR ALL TO service_role
    USING (true)
    WITH CHECK (true);

-- Client Profiles: Backend only
ALTER TABLE client_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "client_profiles_service_all" ON client_profiles
    FOR ALL TO service_role
    USING (true)
    WITH CHECK (true);

-- Refresh Tokens: Backend only
ALTER TABLE refresh_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "refresh_tokens_service_all" ON refresh_tokens
    FOR ALL TO service_role
    USING (true)
    WITH CHECK (true);

-- Email Verification Tokens: Backend only
ALTER TABLE email_verification_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "email_verification_tokens_service_all" ON email_verification_tokens
    FOR ALL TO service_role
    USING (true)
    WITH CHECK (true);

-- Password Reset Tokens: Backend only
ALTER TABLE password_reset_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "password_reset_tokens_service_all" ON password_reset_tokens
    FOR ALL TO service_role
    USING (true)
    WITH CHECK (true);

-- Notifications: Backend only
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "notifications_service_all" ON notifications
    FOR ALL TO service_role
    USING (true)
    WITH CHECK (true);

-- Saved Experts: Backend only
ALTER TABLE saved_experts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "saved_experts_service_all" ON saved_experts
    FOR ALL TO service_role
    USING (true)
    WITH CHECK (true);

-- Conversations: Backend only
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "conversations_service_all" ON conversations
    FOR ALL TO service_role
    USING (true)
    WITH CHECK (true);

-- Messages: Backend only
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "messages_service_all" ON messages
    FOR ALL TO service_role
    USING (true)
    WITH CHECK (true);

-- Projects: Backend only
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "projects_service_all" ON projects
    FOR ALL TO service_role
    USING (true)
    WITH CHECK (true);

-- Project Deliverables: Backend only
ALTER TABLE project_deliverables ENABLE ROW LEVEL SECURITY;

CREATE POLICY "project_deliverables_service_all" ON project_deliverables
    FOR ALL TO service_role
    USING (true)
    WITH CHECK (true);

-- Project Milestones: Backend only
ALTER TABLE project_milestones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "project_milestones_service_all" ON project_milestones
    FOR ALL TO service_role
    USING (true)
    WITH CHECK (true);

-- Proposals: Backend only
ALTER TABLE proposals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "proposals_service_all" ON proposals
    FOR ALL TO service_role
    USING (true)
    WITH CHECK (true);

-- Booking Requests: Backend only
ALTER TABLE booking_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "booking_requests_service_all" ON booking_requests
    FOR ALL TO service_role
    USING (true)
    WITH CHECK (true);

-- Project Postings: Backend only
ALTER TABLE project_postings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "project_postings_service_all" ON project_postings
    FOR ALL TO service_role
    USING (true)
    WITH CHECK (true);

-- Availability Slots: Backend only
ALTER TABLE availability_slots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "availability_slots_service_all" ON availability_slots
    FOR ALL TO service_role
    USING (true)
    WITH CHECK (true);

-- Blocked Dates: Backend only
ALTER TABLE blocked_dates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "blocked_dates_service_all" ON blocked_dates
    FOR ALL TO service_role
    USING (true)
    WITH CHECK (true);

-- ============================================================================
-- TIER 3: FINANCIAL DATA (Strictly Backend Only)
-- ============================================================================

-- Payments: Backend only
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "payments_service_all" ON payments
    FOR ALL TO service_role
    USING (true)
    WITH CHECK (true);

-- Payouts: Backend only
ALTER TABLE payouts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "payouts_service_all" ON payouts
    FOR ALL TO service_role
    USING (true)
    WITH CHECK (true);

-- Invoices: Backend only
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "invoices_service_all" ON invoices
    FOR ALL TO service_role
    USING (true)
    WITH CHECK (true);

-- ============================================================================
-- TIER 4: MODERATION DATA (Admin/Backend Only)
-- ============================================================================

-- Content Reports: Backend only (if table exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'content_reports') THEN
        ALTER TABLE content_reports ENABLE ROW LEVEL SECURITY;

        EXECUTE 'CREATE POLICY "content_reports_service_all" ON content_reports
            FOR ALL TO service_role
            USING (true)
            WITH CHECK (true)';
    END IF;
END $$;
