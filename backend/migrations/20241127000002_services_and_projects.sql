-- Services table
CREATE TABLE services (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    expert_id UUID NOT NULL REFERENCES expert_profiles(id) ON DELETE CASCADE,
    category_id UUID NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
    title VARCHAR(200) NOT NULL,
    slug VARCHAR(250) NOT NULL,
    description TEXT NOT NULL,
    short_description VARCHAR(300) NOT NULL,
    pricing_type pricing_type NOT NULL DEFAULT 'fixed',
    price INTEGER NOT NULL DEFAULT 0,
    currency currency NOT NULL DEFAULT 'eur',
    delivery_time_days SMALLINT NOT NULL DEFAULT 7,
    revisions_included SMALLINT NOT NULL DEFAULT 1,
    features TEXT[] NOT NULL DEFAULT '{}',
    requirements TEXT,
    tags TEXT[] NOT NULL DEFAULT '{}',
    images TEXT[] NOT NULL DEFAULT '{}',
    video_url TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    is_featured BOOLEAN NOT NULL DEFAULT FALSE,
    view_count INTEGER NOT NULL DEFAULT 0,
    order_count INTEGER NOT NULL DEFAULT 0,
    rating_average REAL NOT NULL DEFAULT 0,
    rating_count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(expert_id, slug)
);

CREATE INDEX idx_services_expert ON services(expert_id);
CREATE INDEX idx_services_category ON services(category_id);
CREATE INDEX idx_services_active ON services(is_active);
CREATE INDEX idx_services_featured ON services(is_featured);
CREATE INDEX idx_services_rating ON services(rating_average DESC);
CREATE INDEX idx_services_tags ON services USING GIN(tags);

-- Service packages (Basic, Standard, Premium)
CREATE TABLE service_packages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    service_id UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
    name VARCHAR(50) NOT NULL,
    description TEXT NOT NULL,
    price INTEGER NOT NULL,
    delivery_time_days SMALLINT NOT NULL,
    revisions_included SMALLINT NOT NULL DEFAULT 1,
    features TEXT[] NOT NULL DEFAULT '{}',
    is_popular BOOLEAN NOT NULL DEFAULT FALSE,
    sort_order SMALLINT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_service_packages_service ON service_packages(service_id);

-- Projects table
CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    expert_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    service_id UUID REFERENCES services(id) ON DELETE SET NULL,
    package_id UUID REFERENCES service_packages(id) ON DELETE SET NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    requirements TEXT,
    status project_status NOT NULL DEFAULT 'pending',
    price INTEGER NOT NULL,
    currency currency NOT NULL,
    platform_fee INTEGER NOT NULL DEFAULT 0,
    expert_payout INTEGER NOT NULL DEFAULT 0,
    delivery_date TIMESTAMPTZ,
    delivered_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    cancelled_at TIMESTAMPTZ,
    cancellation_reason TEXT,
    revisions_used SMALLINT NOT NULL DEFAULT 0,
    revisions_allowed SMALLINT NOT NULL DEFAULT 1,
    stripe_payment_intent_id VARCHAR(255),
    stripe_transfer_id VARCHAR(255),
    is_disputed BOOLEAN NOT NULL DEFAULT FALSE,
    dispute_reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_projects_client ON projects(client_id);
CREATE INDEX idx_projects_expert ON projects(expert_id);
CREATE INDEX idx_projects_service ON projects(service_id);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_created ON projects(created_at DESC);

-- Project milestones
CREATE TABLE project_milestones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    amount INTEGER NOT NULL,
    due_date TIMESTAMPTZ,
    status milestone_status NOT NULL DEFAULT 'pending',
    completed_at TIMESTAMPTZ,
    sort_order SMALLINT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_project_milestones_project ON project_milestones(project_id);

-- Project deliverables
CREATE TABLE project_deliverables (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    milestone_id UUID REFERENCES project_milestones(id) ON DELETE SET NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    file_url TEXT NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_type VARCHAR(100) NOT NULL,
    file_size BIGINT NOT NULL,
    version SMALLINT NOT NULL DEFAULT 1,
    is_final BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_project_deliverables_project ON project_deliverables(project_id);

