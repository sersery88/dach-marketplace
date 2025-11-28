-- Performance optimization indexes
-- Additional indexes for common query patterns

-- Composite indexes for common filters
CREATE INDEX IF NOT EXISTS idx_services_active_category ON services(category_id, is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_services_active_featured ON services(is_featured, created_at DESC) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_services_expert_active ON services(expert_id, is_active) WHERE is_active = true;

-- Expert search optimization
CREATE INDEX IF NOT EXISTS idx_expert_profiles_available ON expert_profiles(availability_status, is_verified) WHERE is_verified = true;
CREATE INDEX IF NOT EXISTS idx_expert_profiles_rating_verified ON expert_profiles(rating_average DESC, rating_count DESC) WHERE is_verified = true;

-- Project queries optimization
CREATE INDEX IF NOT EXISTS idx_projects_client_status ON projects(client_id, status);
CREATE INDEX IF NOT EXISTS idx_projects_expert_status ON projects(expert_id, status);
CREATE INDEX IF NOT EXISTS idx_projects_active ON projects(status, updated_at DESC) WHERE status NOT IN ('completed', 'cancelled', 'refunded');

-- Messages optimization for conversation queries
CREATE INDEX IF NOT EXISTS idx_messages_conversation_time ON messages(conversation_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_unread ON messages(conversation_id, is_read, created_at DESC) WHERE is_read = false;

-- Conversations optimization
CREATE INDEX IF NOT EXISTS idx_conversations_participant1_updated ON conversations(participant1_id, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_conversations_participant2_updated ON conversations(participant2_id, updated_at DESC);

-- Reviews optimization
CREATE INDEX IF NOT EXISTS idx_reviews_service_rating ON reviews(service_id, rating DESC) WHERE is_public = true;
CREATE INDEX IF NOT EXISTS idx_reviews_expert_rating ON reviews(expert_id, rating DESC) WHERE is_public = true;

-- Payments optimization
CREATE INDEX IF NOT EXISTS idx_payments_user_status ON payments(user_id, status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_payments_project ON payments(project_id, status);

-- Project postings optimization
CREATE INDEX IF NOT EXISTS idx_project_postings_status_created ON project_postings(status, created_at DESC) WHERE status = 'open';
CREATE INDEX IF NOT EXISTS idx_project_postings_category ON project_postings(category_id, status) WHERE status = 'open';

-- Proposals optimization
CREATE INDEX IF NOT EXISTS idx_proposals_posting_status ON proposals(posting_id, status);
CREATE INDEX IF NOT EXISTS idx_proposals_expert ON proposals(expert_id, status, created_at DESC);

-- Full-text search indexes (if not using Meilisearch)
CREATE INDEX IF NOT EXISTS idx_services_title_trgm ON services USING gin(title gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_services_description_trgm ON services USING gin(description gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_expert_profiles_headline_trgm ON expert_profiles USING gin(headline gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_expert_profiles_bio_trgm ON expert_profiles USING gin(bio gin_trgm_ops);

-- Enable pg_trgm extension for trigram indexes (fuzzy search)
CREATE EXTENSION IF NOT EXISTS pg_trgm;

