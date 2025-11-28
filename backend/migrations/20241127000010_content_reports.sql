-- Content reports for moderation
CREATE TABLE IF NOT EXISTS content_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reporter_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- What is being reported (polymorphic)
    reported_type VARCHAR(50) NOT NULL, -- 'service', 'review', 'message', 'user', 'project_posting'
    reported_id UUID NOT NULL,
    
    -- Report details
    reason VARCHAR(100) NOT NULL, -- 'spam', 'inappropriate', 'fraud', 'harassment', 'copyright', 'other'
    description TEXT,
    
    -- Status
    status VARCHAR(50) NOT NULL DEFAULT 'pending', -- 'pending', 'reviewing', 'resolved', 'dismissed'
    
    -- Resolution
    resolved_by UUID REFERENCES users(id),
    resolution_notes TEXT,
    action_taken VARCHAR(100), -- 'none', 'warning', 'content_removed', 'user_suspended', 'user_banned'
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    resolved_at TIMESTAMPTZ
);

-- Indexes
CREATE INDEX idx_content_reports_status ON content_reports(status);
CREATE INDEX idx_content_reports_reporter ON content_reports(reporter_id);
CREATE INDEX idx_content_reports_reported ON content_reports(reported_type, reported_id);
CREATE INDEX idx_content_reports_created ON content_reports(created_at DESC);

-- Trigger for updated_at
CREATE TRIGGER update_content_reports_updated_at
    BEFORE UPDATE ON content_reports
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

