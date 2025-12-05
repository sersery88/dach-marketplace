-- Seed Demo Data for DACH Automation Marketplace
-- This creates sample users, experts, and services for demonstration
-- NOTE: Using valid hex UUIDs (0-9, a-f only)

-- Create demo users (password: Demo123!!)
-- Password hash is bcrypt for 'Demo123!!'
INSERT INTO users (id, email, password_hash, first_name, last_name, role, country, email_verified, status) VALUES
('a0a0a0a0-a0a0-a0a0-a0a0-a0a0a0a0a0a0', 'max.mueller@demo.ch', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewYpfQV1KRFzUyDO', 'Max', 'Müller', 'expert', 'ch', TRUE, 'active'),
('b0b0b0b0-b0b0-b0b0-b0b0-b0b0b0b0b0b0', 'anna.schmidt@demo.de', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewYpfQV1KRFzUyDO', 'Anna', 'Schmidt', 'expert', 'de', TRUE, 'active'),
('c0c0c0c0-c0c0-c0c0-c0c0-c0c0c0c0c0c0', 'thomas.huber@demo.at', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewYpfQV1KRFzUyDO', 'Thomas', 'Huber', 'expert', 'at', TRUE, 'active'),
('d0d0d0d0-d0d0-d0d0-d0d0-d0d0d0d0d0d0', 'lisa.weber@demo.de', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewYpfQV1KRFzUyDO', 'Lisa', 'Weber', 'expert', 'de', TRUE, 'active'),
('e0e0e0e0-e0e0-e0e0-e0e0-e0e0e0e0e0e0', 'marco.rossi@demo.ch', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewYpfQV1KRFzUyDO', 'Marco', 'Rossi', 'expert', 'ch', TRUE, 'active'),
('f0f0f0f0-f0f0-f0f0-f0f0-f0f0f0f0f0f0', 'client@demo.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewYpfQV1KRFzUyDO', 'Demo', 'Client', 'client', 'de', TRUE, 'active')
ON CONFLICT (email) DO NOTHING;

-- Create expert profiles
INSERT INTO expert_profiles (id, user_id, headline, bio, hourly_rate, currency, years_experience, skills, tools, languages_spoken, availability_status, available_hours_per_week, timezone, is_verified, rating_average, rating_count, total_projects, total_earnings, featured) VALUES
('a1a1a1a1-a1a1-a1a1-a1a1-a1a1a1a1a1a1', 'a0a0a0a0-a0a0-a0a0-a0a0-a0a0a0a0a0a0',
 'Senior Automation Engineer',
 'Spezialisiert auf n8n und Make Workflows. 8+ Jahre Erfahrung in der Prozessautomatisierung für Schweizer KMUs.',
 150, 'chf', 8,
 ARRAY['n8n', 'Make', 'API Integration', 'Workflow Design'],
 ARRAY['n8n', 'Make', 'Airtable', 'Notion', 'Slack'],
 ARRAY['de', 'en', 'fr'],
 'available', 40, 'Europe/Zurich', TRUE, 4.9, 47, 52, 78000, TRUE),

('b2b2b2b2-b2b2-b2b2-b2b2-b2b2b2b2b2b2', 'b0b0b0b0-b0b0-b0b0-b0b0-b0b0b0b0b0b0',
 'AI & Automation Consultant',
 'KI-Expertin mit Fokus auf ChatGPT-Integration und intelligente Automatisierung. Beratung für deutsche Unternehmen.',
 120, 'eur', 6,
 ARRAY['OpenAI', 'LangChain', 'Python', 'AI Agents'],
 ARRAY['ChatGPT', 'Claude', 'n8n', 'Zapier'],
 ARRAY['de', 'en'],
 'available', 35, 'Europe/Berlin', TRUE, 4.8, 38, 41, 49200, TRUE),

('c3c3c3c3-c3c3-c3c3-c3c3-c3c3c3c3c3c3', 'c0c0c0c0-c0c0-c0c0-c0c0-c0c0c0c0c0c0',
 'E-Commerce Automation Specialist',
 'Shopify und WooCommerce Automatisierung. Optimiere Bestellprozesse und Lagerverwaltung.',
 95, 'eur', 5,
 ARRAY['Shopify', 'WooCommerce', 'Inventory', 'Order Processing'],
 ARRAY['Shopify', 'Make', 'Klaviyo', 'ShipStation'],
 ARRAY['de', 'en'],
 'available', 40, 'Europe/Vienna', TRUE, 4.7, 29, 33, 31350, FALSE),

('d4d4d4d4-d4d4-d4d4-d4d4-d4d4d4d4d4d4', 'd0d0d0d0-d0d0-d0d0-d0d0-d0d0d0d0d0d0',
 'CRM & Marketing Automation Expert',
 'HubSpot und Salesforce Spezialistin. Automatisierte Lead-Generierung und Nurturing-Kampagnen.',
 110, 'eur', 7,
 ARRAY['HubSpot', 'Salesforce', 'Email Marketing', 'Lead Gen'],
 ARRAY['HubSpot', 'Salesforce', 'ActiveCampaign', 'Mailchimp'],
 ARRAY['de', 'en'],
 'busy', 20, 'Europe/Berlin', TRUE, 4.9, 56, 64, 70400, TRUE),

('e5e5e5e5-e5e5-e5e5-e5e5-e5e5e5e5e5e5', 'e0e0e0e0-e0e0-e0e0-e0e0-e0e0e0e0e0e0',
 'Document & Process Automation',
 'Digitalisierung von Dokumentenprozessen. OCR, Invoice Processing und Vertragsmanagement.',
 130, 'chf', 6,
 ARRAY['OCR', 'Document Processing', 'PDF', 'Invoice Automation'],
 ARRAY['ABBYY', 'Docparser', 'Make', 'Power Automate'],
 ARRAY['de', 'en', 'it'],
 'available', 40, 'Europe/Zurich', TRUE, 4.6, 21, 25, 32500, FALSE)
ON CONFLICT (id) DO NOTHING;

-- Create demo services
INSERT INTO services (id, expert_id, category_id, title, slug, description, short_description, pricing_type, price, currency, delivery_time_days, revisions_included, features, tags, is_active, is_featured, view_count, order_count) VALUES
-- Max Müller's services
('01010101-0101-0101-0101-010101010101', 'a1a1a1a1-a1a1-a1a1-a1a1-a1a1a1a1a1a1', '11111111-1111-1111-1111-111111111111',
 'Custom n8n Workflow Development', 'custom-n8n-workflow-development',
 'I will create a custom n8n workflow tailored to your business needs. Includes setup, testing, and documentation. Full support for complex integrations with any API.',
 'Custom n8n workflows for your business automation needs',
 'fixed', 500, 'chf', 5, 2,
 ARRAY['Custom workflow design', 'API integrations', 'Testing & debugging', 'Documentation'],
 ARRAY['n8n', 'automation', 'workflow', 'integration'],
 TRUE, TRUE, 234, 18),

('01010101-0101-0101-0101-010101010102', 'a1a1a1a1-a1a1-a1a1-a1a1-a1a1a1a1a1a1', '33333333-3333-3333-3333-333333333333',
 'API Integration Service', 'api-integration-service',
 'Connect any two systems via REST API. Custom middleware development included. I handle authentication, data transformation, and error handling.',
 'Professional API integration between any systems',
 'hourly', 150, 'chf', 3, 1,
 ARRAY['REST API integration', 'Authentication setup', 'Data transformation', 'Error handling'],
 ARRAY['api', 'integration', 'rest', 'middleware'],
 TRUE, FALSE, 156, 12),

-- Anna Schmidt's services
('02020202-0202-0202-0202-020202020201', 'b2b2b2b2-b2b2-b2b2-b2b2-b2b2b2b2b2b2', '22222222-2222-2222-2222-222222222222',
 'ChatGPT Integration for Business', 'chatgpt-integration-business',
 'Integrate ChatGPT into your existing workflows. Custom prompts, fine-tuning, and API setup. Perfect for customer service, content generation, and data analysis.',
 'Integrate ChatGPT into your business workflows',
 'project_based', 2000, 'eur', 10, 3,
 ARRAY['Custom prompt engineering', 'API integration', 'Fine-tuning', 'Training & documentation'],
 ARRAY['chatgpt', 'openai', 'ai', 'automation'],
 TRUE, TRUE, 412, 24),

('02020202-0202-0202-0202-020202020202', 'b2b2b2b2-b2b2-b2b2-b2b2-b2b2b2b2b2b2', '22222222-2222-2222-2222-222222222222',
 'AI Agent Development', 'ai-agent-development',
 'Build autonomous AI agents using LangChain and OpenAI. Perfect for customer support and data analysis. Includes memory, tool use, and multi-step reasoning.',
 'Autonomous AI agents for your business',
 'project_based', 5000, 'eur', 21, 2,
 ARRAY['LangChain development', 'Tool integration', 'Memory systems', 'Multi-agent orchestration'],
 ARRAY['ai-agents', 'langchain', 'openai', 'automation'],
 TRUE, TRUE, 289, 8),

-- Thomas Huber's services
('03030303-0303-0303-0303-030303030301', 'c3c3c3c3-c3c3-c3c3-c3c3-c3c3c3c3c3c3', '55555555-5555-5555-5555-555555555555',
 'Shopify Store Automation', 'shopify-store-automation',
 'Automate your Shopify store: inventory sync, order processing, customer notifications. Reduce manual work and improve customer experience.',
 'Complete Shopify automation solution',
 'fixed', 800, 'eur', 7, 2,
 ARRAY['Inventory sync', 'Order automation', 'Customer notifications', 'Reporting'],
 ARRAY['shopify', 'ecommerce', 'automation', 'inventory'],
 TRUE, FALSE, 178, 15),

-- Lisa Weber's services
('04040404-0404-0404-0404-040404040401', 'd4d4d4d4-d4d4-d4d4-d4d4-d4d4d4d4d4d4', '44444444-4444-4444-4444-444444444444',
 'HubSpot Automation Setup', 'hubspot-automation-setup',
 'Complete HubSpot automation: workflows, sequences, lead scoring, and reporting dashboards. Maximize your CRM investment with smart automation.',
 'Professional HubSpot automation setup',
 'fixed', 1500, 'eur', 14, 3,
 ARRAY['Workflow automation', 'Lead scoring', 'Email sequences', 'Custom dashboards'],
 ARRAY['hubspot', 'crm', 'marketing', 'automation'],
 TRUE, TRUE, 345, 28),

('04040404-0404-0404-0404-040404040402', 'd4d4d4d4-d4d4-d4d4-d4d4-d4d4d4d4d4d4', '66666666-6666-6666-6666-666666666666',
 'Email Marketing Automation', 'email-marketing-automation',
 'Set up automated email campaigns with segmentation, A/B testing, and analytics. Increase engagement and conversions with personalized messaging.',
 'Automated email marketing campaigns',
 'fixed', 750, 'eur', 7, 2,
 ARRAY['Campaign setup', 'Segmentation', 'A/B testing', 'Analytics dashboard'],
 ARRAY['email', 'marketing', 'automation', 'campaigns'],
 TRUE, FALSE, 198, 19),

-- Marco Rossi's services
('05050505-0505-0505-0505-050505050501', 'e5e5e5e5-e5e5-e5e5-e5e5-e5e5e5e5e5e5', '77777777-7777-7777-7777-777777777777',
 'Invoice Processing Automation', 'invoice-processing-automation',
 'Automate invoice processing with OCR, data extraction, and ERP integration. Reduce manual data entry and processing time by 90%.',
 'Automated invoice processing with OCR',
 'project_based', 3000, 'chf', 14, 2,
 ARRAY['OCR extraction', 'Data validation', 'ERP integration', 'Exception handling'],
 ARRAY['invoice', 'ocr', 'automation', 'document'],
 TRUE, TRUE, 267, 11),

('05050505-0505-0505-0505-050505050502', 'e5e5e5e5-e5e5-e5e5-e5e5-e5e5e5e5e5e5', '77777777-7777-7777-7777-777777777777',
 'Contract Management System', 'contract-management-system',
 'Digital contract management with automated reminders, version control, and e-signatures. Never miss a renewal or deadline again.',
 'Digital contract management solution',
 'project_based', 4500, 'chf', 21, 2,
 ARRAY['Contract repository', 'Automated reminders', 'Version control', 'E-signature integration'],
 ARRAY['contract', 'document', 'management', 'automation'],
 TRUE, FALSE, 145, 6)
ON CONFLICT (id) DO NOTHING;

-- Update category service counts
UPDATE categories SET service_count = (
  SELECT COUNT(*) FROM services WHERE services.category_id = categories.id AND services.is_active = TRUE
);

-- Create demo projects (completed ones for reviews)
INSERT INTO projects (id, client_id, expert_id, service_id, title, description, status, price, currency, platform_fee, expert_payout, completed_at) VALUES
('0a0a0a0a-0a0a-0a0a-0a0a-0a0a0a0a0a01', 'f0f0f0f0-f0f0-f0f0-f0f0-f0f0f0f0f0f0', 'a0a0a0a0-a0a0-a0a0-a0a0-a0a0a0a0a0a0', '01010101-0101-0101-0101-010101010101',
 'n8n Workflow for CRM Integration', 'Need a workflow to sync our CRM with email marketing tool', 'completed', 500, 'chf', 50, 450, NOW() - INTERVAL '30 days'),
('0a0a0a0a-0a0a-0a0a-0a0a-0a0a0a0a0a02', 'f0f0f0f0-f0f0-f0f0-f0f0-f0f0f0f0f0f0', 'b0b0b0b0-b0b0-b0b0-b0b0-b0b0b0b0b0b0', '02020202-0202-0202-0202-020202020201',
 'ChatGPT Customer Support Bot', 'Integrate ChatGPT for automated customer support', 'completed', 2000, 'eur', 200, 1800, NOW() - INTERVAL '20 days'),
('0a0a0a0a-0a0a-0a0a-0a0a-0a0a0a0a0a03', 'f0f0f0f0-f0f0-f0f0-f0f0-f0f0f0f0f0f0', 'd0d0d0d0-d0d0-d0d0-d0d0-d0d0d0d0d0d0', '04040404-0404-0404-0404-040404040401',
 'HubSpot Marketing Automation', 'Set up complete marketing automation in HubSpot', 'completed', 1500, 'eur', 150, 1350, NOW() - INTERVAL '15 days')
ON CONFLICT (id) DO NOTHING;

-- Add reviews for completed projects
INSERT INTO reviews (id, project_id, reviewer_id, reviewee_id, service_id, rating, title, content, communication_rating, quality_rating, timeliness_rating, value_rating, is_verified) VALUES
('0b0b0b0b-0b0b-0b0b-0b0b-0b0b0b0b0b01', '0a0a0a0a-0a0a-0a0a-0a0a-0a0a0a0a0a01', 'f0f0f0f0-f0f0-f0f0-f0f0-f0f0f0f0f0f0', 'a0a0a0a0-a0a0-a0a0-a0a0-a0a0a0a0a0a0', '01010101-0101-0101-0101-010101010101',
 5, 'Excellent work!', 'Max delivered exactly what we needed. The n8n workflow works flawlessly and has saved us hours of manual work every week.', 5, 5, 5, 5, TRUE),
('0b0b0b0b-0b0b-0b0b-0b0b-0b0b0b0b0b02', '0a0a0a0a-0a0a-0a0a-0a0a-0a0a0a0a0a02', 'f0f0f0f0-f0f0-f0f0-f0f0-f0f0f0f0f0f0', 'b0b0b0b0-b0b0-b0b0-b0b0-b0b0b0b0b0b0', '02020202-0202-0202-0202-020202020201',
 5, 'Transformed our business', 'The ChatGPT integration has saved us hours of work every day. Anna was professional and delivered ahead of schedule.', 5, 5, 5, 5, TRUE),
('0b0b0b0b-0b0b-0b0b-0b0b-0b0b0b0b0b03', '0a0a0a0a-0a0a-0a0a-0a0a-0a0a0a0a0a03', 'f0f0f0f0-f0f0-f0f0-f0f0-f0f0f0f0f0f0', 'd0d0d0d0-d0d0-d0d0-d0d0-d0d0d0d0d0d0', '04040404-0404-0404-0404-040404040401',
 5, 'Professional and thorough', 'Lisa set up our entire HubSpot automation. The workflows are exactly what we needed. Highly recommended!', 5, 5, 5, 5, TRUE)
ON CONFLICT (id) DO NOTHING;

-- Update service ratings based on reviews
UPDATE services SET rating_average = 5.0, rating_count = 1 WHERE id IN ('01010101-0101-0101-0101-010101010101', '02020202-0202-0202-0202-020202020201', '04040404-0404-0404-0404-040404040401');
