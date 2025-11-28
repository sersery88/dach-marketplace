-- Client Profiles and Project Postings
-- Migration for Phase 5: Client Features

-- Client profiles table (for clients who want to hire experts)
CREATE TABLE client_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    company_name VARCHAR(200),
    company_website VARCHAR(255),
    company_size VARCHAR(50), -- 'solo', '2-10', '11-50', '51-200', '201-500', '500+'
    industry VARCHAR(100),
    description TEXT,
    preferred_budget_min INTEGER, -- in cents
    preferred_budget_max INTEGER, -- in cents
    preferred_tools TEXT[] NOT NULL DEFAULT '{}',
    preferred_industries TEXT[] NOT NULL DEFAULT '{}',
    total_projects INTEGER NOT NULL DEFAULT 0,
    total_spent INTEGER NOT NULL DEFAULT 0, -- in cents
    is_verified BOOLEAN NOT NULL DEFAULT FALSE,
    verified_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_client_profiles_user ON client_profiles(user_id);
CREATE INDEX idx_client_profiles_verified ON client_profiles(is_verified);

-- Project postings (clients post projects for experts to bid on)
CREATE TYPE project_posting_status AS ENUM ('draft', 'open', 'in_review', 'assigned', 'completed', 'cancelled');
CREATE TYPE project_posting_budget_type AS ENUM ('fixed', 'hourly', 'range');

CREATE TABLE project_postings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    requirements TEXT,
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    skills_required TEXT[] NOT NULL DEFAULT '{}',
    tools_required TEXT[] NOT NULL DEFAULT '{}',
    budget_type project_posting_budget_type NOT NULL DEFAULT 'fixed',
    budget_min INTEGER, -- in cents
    budget_max INTEGER, -- in cents
    currency currency NOT NULL DEFAULT 'eur',
    deadline TIMESTAMPTZ,
    estimated_duration VARCHAR(50), -- '1-2 weeks', '1 month', etc.
    status project_posting_status NOT NULL DEFAULT 'draft',
    is_urgent BOOLEAN NOT NULL DEFAULT FALSE,
    is_featured BOOLEAN NOT NULL DEFAULT FALSE,
    attachments TEXT[] NOT NULL DEFAULT '{}',
    view_count INTEGER NOT NULL DEFAULT 0,
    proposal_count INTEGER NOT NULL DEFAULT 0,
    assigned_expert_id UUID REFERENCES users(id) ON DELETE SET NULL,
    assigned_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    cancelled_at TIMESTAMPTZ,
    cancellation_reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_project_postings_client ON project_postings(client_id);
CREATE INDEX idx_project_postings_status ON project_postings(status);
CREATE INDEX idx_project_postings_category ON project_postings(category_id);
CREATE INDEX idx_project_postings_created ON project_postings(created_at DESC);
CREATE INDEX idx_project_postings_skills ON project_postings USING GIN(skills_required);

-- Proposals (experts submit proposals to project postings)
CREATE TYPE proposal_status AS ENUM ('pending', 'shortlisted', 'accepted', 'rejected', 'withdrawn');

CREATE TABLE proposals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_posting_id UUID NOT NULL REFERENCES project_postings(id) ON DELETE CASCADE,
    expert_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    cover_letter TEXT NOT NULL,
    proposed_price INTEGER NOT NULL, -- in cents
    currency currency NOT NULL DEFAULT 'eur',
    proposed_duration VARCHAR(50),
    proposed_milestones JSONB, -- array of milestone objects
    attachments TEXT[] NOT NULL DEFAULT '{}',
    status proposal_status NOT NULL DEFAULT 'pending',
    is_featured BOOLEAN NOT NULL DEFAULT FALSE,
    client_viewed_at TIMESTAMPTZ,
    shortlisted_at TIMESTAMPTZ,
    accepted_at TIMESTAMPTZ,
    rejected_at TIMESTAMPTZ,
    rejection_reason TEXT,
    withdrawn_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(project_posting_id, expert_id)
);

CREATE INDEX idx_proposals_project ON proposals(project_posting_id);
CREATE INDEX idx_proposals_expert ON proposals(expert_id);
CREATE INDEX idx_proposals_status ON proposals(status);

-- Booking requests (direct booking without project posting)
CREATE TYPE booking_status AS ENUM ('pending', 'accepted', 'declined', 'cancelled', 'expired');

CREATE TABLE booking_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    expert_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    service_id UUID REFERENCES services(id) ON DELETE SET NULL,
    package_id UUID REFERENCES service_packages(id) ON DELETE SET NULL,
    message TEXT NOT NULL,
    proposed_budget INTEGER, -- in cents
    currency currency NOT NULL DEFAULT 'eur',
    proposed_start_date TIMESTAMPTZ,
    proposed_deadline TIMESTAMPTZ,
    status booking_status NOT NULL DEFAULT 'pending',
    expert_response TEXT,
    responded_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '7 days'),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_booking_requests_client ON booking_requests(client_id);
CREATE INDEX idx_booking_requests_expert ON booking_requests(expert_id);
CREATE INDEX idx_booking_requests_status ON booking_requests(status);

-- Saved experts (clients can save/favorite experts)
CREATE TABLE saved_experts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    expert_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(client_id, expert_id)
);

CREATE INDEX idx_saved_experts_client ON saved_experts(client_id);

