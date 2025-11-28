-- Portfolio items for experts
CREATE TABLE IF NOT EXISTS portfolio_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    expert_id UUID NOT NULL REFERENCES expert_profiles(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    project_url TEXT,
    image_urls TEXT[] NOT NULL DEFAULT '{}',
    video_url TEXT,
    tools_used TEXT[] NOT NULL DEFAULT '{}',
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    client_name VARCHAR(100),
    client_testimonial TEXT,
    completion_date DATE,
    is_featured BOOLEAN NOT NULL DEFAULT FALSE,
    sort_order SMALLINT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_portfolio_items_expert ON portfolio_items(expert_id);
CREATE INDEX IF NOT EXISTS idx_portfolio_items_featured ON portfolio_items(is_featured);
CREATE INDEX IF NOT EXISTS idx_portfolio_items_category ON portfolio_items(category_id);

