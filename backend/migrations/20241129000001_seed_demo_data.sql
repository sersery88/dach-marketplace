-- Seed Demo Data for DACH Automation Marketplace
-- This creates sample users, experts, and services for demonstration
-- NOTE: This file is for reference. The actual seeding was done via Supabase API.

-- Create demo users (password: Demo123!!)
-- Password hash is bcrypt for 'Demo123!!'
INSERT INTO users (id, email, password_hash, first_name, last_name, role, country, email_verified, status) VALUES
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'max.mueller@demo.ch', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewYpfQV1KRFzUyDO', 'Max', 'Müller', 'expert', 'ch', TRUE, 'active'),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'anna.schmidt@demo.de', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewYpfQV1KRFzUyDO', 'Anna', 'Schmidt', 'expert', 'de', TRUE, 'active'),
('cccccccc-cccc-cccc-cccc-cccccccccccc', 'thomas.huber@demo.at', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewYpfQV1KRFzUyDO', 'Thomas', 'Huber', 'expert', 'at', TRUE, 'active'),
('dddddddd-dddd-dddd-dddd-dddddddddddd', 'lisa.weber@demo.de', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewYpfQV1KRFzUyDO', 'Lisa', 'Weber', 'expert', 'de', TRUE, 'active'),
('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'marco.rossi@demo.ch', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewYpfQV1KRFzUyDO', 'Marco', 'Rossi', 'expert', 'ch', TRUE, 'active'),
('ffffffff-ffff-ffff-ffff-ffffffffffff', 'client@demo.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewYpfQV1KRFzUyDO', 'Demo', 'Client', 'client', 'de', TRUE, 'active')
ON CONFLICT (id) DO NOTHING;

-- Create expert profiles
INSERT INTO expert_profiles (id, user_id, headline, bio, hourly_rate, currency, years_experience, skills, tools, industries, languages_spoken, availability_status, available_hours_per_week, timezone, is_verified, rating_average, rating_count, total_projects, total_earnings, featured) VALUES
('a1111111-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
 'Senior Automation Engineer',
 'Spezialisiert auf n8n und Make Workflows. 8+ Jahre Erfahrung in der Prozessautomatisierung für Schweizer KMUs.',
 150.00, 'CHF',
 ARRAY['n8n', 'Make', 'API Integration', 'Workflow Design'],
 ARRAY['n8n', 'Make', 'Airtable', 'Notion', 'Slack'],
 ARRAY['de', 'en', 'fr'],
 'available', TRUE, TRUE, 4.9, 47, 52, 'CH'),

('b2222222-2222-2222-2222-222222222222', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
 'AI & Automation Consultant',
 'KI-Expertin mit Fokus auf ChatGPT-Integration und intelligente Automatisierung. Beratung für deutsche Unternehmen.',
 120.00, 'EUR',
 ARRAY['OpenAI', 'LangChain', 'Python', 'AI Agents'],
 ARRAY['ChatGPT', 'Claude', 'n8n', 'Zapier'],
 ARRAY['de', 'en'],
 'available', TRUE, TRUE, 4.8, 38, 41, 'DE'),

('c3333333-3333-3333-3333-333333333333', 'cccccccc-cccc-cccc-cccc-cccccccccccc',
 'E-Commerce Automation Specialist',
 'Shopify und WooCommerce Automatisierung. Optimiere Bestellprozesse und Lagerverwaltung.',
 95.00, 'EUR',
 ARRAY['Shopify', 'WooCommerce', 'Inventory', 'Order Processing'],
 ARRAY['Shopify', 'Make', 'Klaviyo', 'ShipStation'],
 ARRAY['de', 'en'],
 'available', TRUE, FALSE, 4.7, 29, 33, 'AT'),

('d4444444-4444-4444-4444-444444444444', 'dddddddd-dddd-dddd-dddd-dddddddddddd',
 'CRM & Marketing Automation Expert',
 'HubSpot und Salesforce Spezialistin. Automatisierte Lead-Generierung und Nurturing-Kampagnen.',
 110.00, 'EUR',
 ARRAY['HubSpot', 'Salesforce', 'Email Marketing', 'Lead Gen'],
 ARRAY['HubSpot', 'Salesforce', 'ActiveCampaign', 'Mailchimp'],
 ARRAY['de', 'en'],
 'busy', TRUE, TRUE, 4.9, 56, 64, 'DE'),

('e5555555-5555-5555-5555-555555555555', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee',
 'Document & Process Automation',
 'Digitalisierung von Dokumentenprozessen. OCR, Invoice Processing und Vertragsmanagement.',
 130.00, 'CHF',
 ARRAY['OCR', 'Document Processing', 'PDF', 'Invoice Automation'],
 ARRAY['ABBYY', 'Docparser', 'Make', 'Power Automate'],
 ARRAY['de', 'en', 'it'],
 'available', TRUE, FALSE, 4.6, 21, 25, 'CH')
ON CONFLICT (id) DO NOTHING;

-- Create demo services
INSERT INTO services (id, expert_id, category_id, title, title_de, description, description_de, pricing_type, price_amount, currency, delivery_days, is_active, is_featured, view_count, order_count) VALUES
-- Max Müller's services
('s1111111-1111-1111-1111-111111111111', 'a1111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111',
 'Custom n8n Workflow Development', 'Individuelle n8n Workflow-Entwicklung',
 'I will create a custom n8n workflow tailored to your business needs. Includes setup, testing, and documentation.',
 'Ich erstelle einen individuellen n8n-Workflow für Ihre Geschäftsanforderungen. Inklusive Setup, Testing und Dokumentation.',
 'fixed', 500.00, 'CHF', 5, TRUE, TRUE, 234, 18),

('s1111111-1111-1111-1111-111111111112', 'a1111111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333333',
 'API Integration Service', 'API-Integrations-Service',
 'Connect any two systems via REST API. Custom middleware development included.',
 'Verbinden Sie beliebige Systeme über REST API. Inklusive individueller Middleware-Entwicklung.',
 'hourly', 150.00, 'CHF', 3, TRUE, FALSE, 156, 12),

-- Anna Schmidt's services
('s2222222-2222-2222-2222-222222222221', 'b2222222-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222',
 'ChatGPT Integration for Business', 'ChatGPT-Integration für Unternehmen',
 'Integrate ChatGPT into your existing workflows. Custom prompts, fine-tuning, and API setup.',
 'Integrieren Sie ChatGPT in Ihre bestehenden Workflows. Individuelle Prompts, Fine-Tuning und API-Setup.',
 'project_based', 2000.00, 'EUR', 10, TRUE, TRUE, 412, 24),

('s2222222-2222-2222-2222-222222222222', 'b2222222-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222',
 'AI Agent Development', 'KI-Agenten-Entwicklung',
 'Build autonomous AI agents using LangChain and OpenAI. Perfect for customer support and data analysis.',
 'Entwicklung autonomer KI-Agenten mit LangChain und OpenAI. Ideal für Kundensupport und Datenanalyse.',
 'project_based', 5000.00, 'EUR', 21, TRUE, TRUE, 289, 8),

-- Thomas Huber's services
('s3333333-3333-3333-3333-333333333331', 'c3333333-3333-3333-3333-333333333333', '55555555-5555-5555-5555-555555555555',
 'Shopify Store Automation', 'Shopify-Shop-Automatisierung',
 'Automate your Shopify store: inventory sync, order processing, customer notifications.',
 'Automatisieren Sie Ihren Shopify-Shop: Bestandssynchronisation, Bestellverarbeitung, Kundenbenachrichtigungen.',
 'fixed', 800.00, 'EUR', 7, TRUE, FALSE, 178, 15),

-- Lisa Weber's services
('s4444444-4444-4444-4444-444444444441', 'd4444444-4444-4444-4444-444444444444', '44444444-4444-4444-4444-444444444444',
 'HubSpot Automation Setup', 'HubSpot-Automatisierungs-Setup',
 'Complete HubSpot automation: workflows, sequences, lead scoring, and reporting dashboards.',
 'Komplettes HubSpot-Automatisierungs-Setup: Workflows, Sequenzen, Lead-Scoring und Reporting-Dashboards.',
 'fixed', 1500.00, 'EUR', 14, TRUE, TRUE, 345, 28),

('s4444444-4444-4444-4444-444444444442', 'd4444444-4444-4444-4444-444444444444', '66666666-6666-6666-6666-666666666666',
 'Email Marketing Automation', 'E-Mail-Marketing-Automatisierung',
 'Set up automated email campaigns with segmentation, A/B testing, and analytics.',
 'Einrichtung automatisierter E-Mail-Kampagnen mit Segmentierung, A/B-Tests und Analysen.',
 'fixed', 750.00, 'EUR', 7, TRUE, FALSE, 198, 19),

-- Marco Rossi's services
('s5555555-5555-5555-5555-555555555551', 'e5555555-5555-5555-5555-555555555555', '77777777-7777-7777-7777-777777777777',
 'Invoice Processing Automation', 'Rechnungsverarbeitungs-Automatisierung',
 'Automate invoice processing with OCR, data extraction, and ERP integration.',
 'Automatisieren Sie die Rechnungsverarbeitung mit OCR, Datenextraktion und ERP-Integration.',
 'project_based', 3000.00, 'CHF', 14, TRUE, TRUE, 267, 11),

('s5555555-5555-5555-5555-555555555552', 'e5555555-5555-5555-5555-555555555555', '77777777-7777-7777-7777-777777777777',
 'Contract Management System', 'Vertragsmanagement-System',
 'Digital contract management with automated reminders, version control, and e-signatures.',
 'Digitales Vertragsmanagement mit automatischen Erinnerungen, Versionskontrolle und E-Signaturen.',
 'project_based', 4500.00, 'CHF', 21, TRUE, FALSE, 145, 6)
ON CONFLICT (id) DO NOTHING;

-- Update category service counts
UPDATE categories SET service_count = (
  SELECT COUNT(*) FROM services WHERE services.category_id = categories.id AND services.is_active = TRUE
);

-- Add some reviews for credibility
INSERT INTO reviews (id, service_id, client_id, rating, title, content, is_verified) VALUES
('r1111111-1111-1111-1111-111111111111', 's1111111-1111-1111-1111-111111111111', 'ffffffff-ffff-ffff-ffff-ffffffffffff', 5, 'Excellent work!', 'Max delivered exactly what we needed. The n8n workflow works flawlessly.', TRUE),
('r2222222-2222-2222-2222-222222222222', 's2222222-2222-2222-2222-222222222221', 'ffffffff-ffff-ffff-ffff-ffffffffffff', 5, 'Transformed our business', 'The ChatGPT integration has saved us hours of work every day.', TRUE),
('r3333333-3333-3333-3333-333333333333', 's4444444-4444-4444-4444-444444444441', 'ffffffff-ffff-ffff-ffff-ffffffffffff', 5, 'Professional and thorough', 'Lisa set up our entire HubSpot automation. Highly recommended!', TRUE)
ON CONFLICT (id) DO NOTHING;
