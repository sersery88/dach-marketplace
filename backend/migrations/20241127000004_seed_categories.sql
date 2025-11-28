-- Seed default categories for DACH Automation Marketplace

INSERT INTO categories (id, name, name_de, slug, description, description_de, icon, is_active, is_featured, sort_order) VALUES
-- Main categories
('11111111-1111-1111-1111-111111111111', 'Workflow Automation', 'Workflow-Automatisierung', 'workflow-automation', 'Automate repetitive tasks and business processes', 'Automatisieren Sie wiederkehrende Aufgaben und Geschäftsprozesse', 'workflow', TRUE, TRUE, 1),
('22222222-2222-2222-2222-222222222222', 'AI & Machine Learning', 'KI & Maschinelles Lernen', 'ai-machine-learning', 'Intelligent automation with AI and ML', 'Intelligente Automatisierung mit KI und ML', 'brain', TRUE, TRUE, 2),
('33333333-3333-3333-3333-333333333333', 'Data Integration', 'Datenintegration', 'data-integration', 'Connect and sync data across systems', 'Verbinden und synchronisieren Sie Daten über Systeme hinweg', 'database', TRUE, TRUE, 3),
('44444444-4444-4444-4444-444444444444', 'CRM Automation', 'CRM-Automatisierung', 'crm-automation', 'Automate customer relationship management', 'Automatisieren Sie das Kundenbeziehungsmanagement', 'users', TRUE, TRUE, 4),
('55555555-5555-5555-5555-555555555555', 'E-Commerce Automation', 'E-Commerce-Automatisierung', 'ecommerce-automation', 'Automate online store operations', 'Automatisieren Sie Online-Shop-Operationen', 'shopping-cart', TRUE, TRUE, 5),
('66666666-6666-6666-6666-666666666666', 'Marketing Automation', 'Marketing-Automatisierung', 'marketing-automation', 'Automate marketing campaigns and analytics', 'Automatisieren Sie Marketingkampagnen und Analysen', 'megaphone', TRUE, TRUE, 6),
('77777777-7777-7777-7777-777777777777', 'Document Processing', 'Dokumentenverarbeitung', 'document-processing', 'Automate document handling and OCR', 'Automatisieren Sie Dokumentenverarbeitung und OCR', 'file-text', TRUE, TRUE, 7),
('88888888-8888-8888-8888-888888888888', 'Chatbots & Assistants', 'Chatbots & Assistenten', 'chatbots-assistants', 'Build intelligent conversational agents', 'Erstellen Sie intelligente Konversationsagenten', 'message-circle', TRUE, TRUE, 8);

-- Subcategories for Workflow Automation
INSERT INTO categories (parent_id, name, name_de, slug, description, description_de, icon, is_active, sort_order) VALUES
('11111111-1111-1111-1111-111111111111', 'n8n Workflows', 'n8n Workflows', 'n8n-workflows', 'Custom n8n automation workflows', 'Individuelle n8n-Automatisierungs-Workflows', 'n8n', TRUE, 1),
('11111111-1111-1111-1111-111111111111', 'Make (Integromat)', 'Make (Integromat)', 'make-integromat', 'Make.com automation scenarios', 'Make.com Automatisierungsszenarien', 'make', TRUE, 2),
('11111111-1111-1111-1111-111111111111', 'Zapier', 'Zapier', 'zapier', 'Zapier zaps and integrations', 'Zapier Zaps und Integrationen', 'zapier', TRUE, 3),
('11111111-1111-1111-1111-111111111111', 'Power Automate', 'Power Automate', 'power-automate', 'Microsoft Power Automate flows', 'Microsoft Power Automate Flows', 'microsoft', TRUE, 4);

-- Subcategories for AI & ML
INSERT INTO categories (parent_id, name, name_de, slug, description, description_de, icon, is_active, sort_order) VALUES
('22222222-2222-2222-2222-222222222222', 'OpenAI Integration', 'OpenAI-Integration', 'openai-integration', 'ChatGPT and GPT API integrations', 'ChatGPT und GPT-API-Integrationen', 'openai', TRUE, 1),
('22222222-2222-2222-2222-222222222222', 'Custom AI Models', 'Individuelle KI-Modelle', 'custom-ai-models', 'Train and deploy custom AI models', 'Trainieren und deployen Sie individuelle KI-Modelle', 'cpu', TRUE, 2),
('22222222-2222-2222-2222-222222222222', 'AI Agents', 'KI-Agenten', 'ai-agents', 'Autonomous AI agents and assistants', 'Autonome KI-Agenten und Assistenten', 'bot', TRUE, 3),
('22222222-2222-2222-2222-222222222222', 'Computer Vision', 'Computer Vision', 'computer-vision', 'Image and video analysis automation', 'Bild- und Videoanalyse-Automatisierung', 'eye', TRUE, 4);

-- Subcategories for Data Integration
INSERT INTO categories (parent_id, name, name_de, slug, description, description_de, icon, is_active, sort_order) VALUES
('33333333-3333-3333-3333-333333333333', 'API Development', 'API-Entwicklung', 'api-development', 'Custom API development and integration', 'Individuelle API-Entwicklung und Integration', 'code', TRUE, 1),
('33333333-3333-3333-3333-333333333333', 'ETL Pipelines', 'ETL-Pipelines', 'etl-pipelines', 'Extract, transform, load data pipelines', 'Extrahieren, transformieren, laden Datenpipelines', 'git-branch', TRUE, 2),
('33333333-3333-3333-3333-333333333333', 'Database Sync', 'Datenbank-Synchronisation', 'database-sync', 'Real-time database synchronization', 'Echtzeit-Datenbanksynchronisation', 'refresh-cw', TRUE, 3);

-- Subcategories for CRM Automation
INSERT INTO categories (parent_id, name, name_de, slug, description, description_de, icon, is_active, sort_order) VALUES
('44444444-4444-4444-4444-444444444444', 'Salesforce', 'Salesforce', 'salesforce', 'Salesforce automation and integration', 'Salesforce-Automatisierung und Integration', 'salesforce', TRUE, 1),
('44444444-4444-4444-4444-444444444444', 'HubSpot', 'HubSpot', 'hubspot', 'HubSpot automation and workflows', 'HubSpot-Automatisierung und Workflows', 'hubspot', TRUE, 2),
('44444444-4444-4444-4444-444444444444', 'Pipedrive', 'Pipedrive', 'pipedrive', 'Pipedrive automation', 'Pipedrive-Automatisierung', 'pipedrive', TRUE, 3);

-- Subcategories for E-Commerce
INSERT INTO categories (parent_id, name, name_de, slug, description, description_de, icon, is_active, sort_order) VALUES
('55555555-5555-5555-5555-555555555555', 'Shopify', 'Shopify', 'shopify', 'Shopify store automation', 'Shopify-Shop-Automatisierung', 'shopify', TRUE, 1),
('55555555-5555-5555-5555-555555555555', 'WooCommerce', 'WooCommerce', 'woocommerce', 'WooCommerce automation', 'WooCommerce-Automatisierung', 'wordpress', TRUE, 2),
('55555555-5555-5555-5555-555555555555', 'Inventory Management', 'Bestandsverwaltung', 'inventory-management', 'Automated inventory tracking', 'Automatisierte Bestandsverfolgung', 'package', TRUE, 3);

-- Subcategories for Marketing
INSERT INTO categories (parent_id, name, name_de, slug, description, description_de, icon, is_active, sort_order) VALUES
('66666666-6666-6666-6666-666666666666', 'Email Marketing', 'E-Mail-Marketing', 'email-marketing', 'Automated email campaigns', 'Automatisierte E-Mail-Kampagnen', 'mail', TRUE, 1),
('66666666-6666-6666-6666-666666666666', 'Social Media', 'Social Media', 'social-media', 'Social media automation', 'Social-Media-Automatisierung', 'share-2', TRUE, 2),
('66666666-6666-6666-6666-666666666666', 'Analytics & Reporting', 'Analysen & Berichte', 'analytics-reporting', 'Automated analytics and reports', 'Automatisierte Analysen und Berichte', 'bar-chart', TRUE, 3);

-- Subcategories for Document Processing
INSERT INTO categories (parent_id, name, name_de, slug, description, description_de, icon, is_active, sort_order) VALUES
('77777777-7777-7777-7777-777777777777', 'OCR & Text Extraction', 'OCR & Textextraktion', 'ocr-text-extraction', 'Optical character recognition', 'Optische Zeichenerkennung', 'scan', TRUE, 1),
('77777777-7777-7777-7777-777777777777', 'Invoice Processing', 'Rechnungsverarbeitung', 'invoice-processing', 'Automated invoice handling', 'Automatisierte Rechnungsbearbeitung', 'file-invoice', TRUE, 2),
('77777777-7777-7777-7777-777777777777', 'Contract Management', 'Vertragsmanagement', 'contract-management', 'Automated contract workflows', 'Automatisierte Vertrags-Workflows', 'file-signature', TRUE, 3);

-- Subcategories for Chatbots
INSERT INTO categories (parent_id, name, name_de, slug, description, description_de, icon, is_active, sort_order) VALUES
('88888888-8888-8888-8888-888888888888', 'Customer Support Bots', 'Kundensupport-Bots', 'customer-support-bots', 'AI-powered customer service', 'KI-gestützter Kundenservice', 'headphones', TRUE, 1),
('88888888-8888-8888-8888-888888888888', 'WhatsApp Bots', 'WhatsApp-Bots', 'whatsapp-bots', 'WhatsApp Business automation', 'WhatsApp Business-Automatisierung', 'whatsapp', TRUE, 2),
('88888888-8888-8888-8888-888888888888', 'Voice Assistants', 'Sprachassistenten', 'voice-assistants', 'Voice-enabled AI assistants', 'Sprachgesteuerte KI-Assistenten', 'mic', TRUE, 3);

