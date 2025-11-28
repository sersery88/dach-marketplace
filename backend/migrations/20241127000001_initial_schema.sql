-- DACH Marketplace Initial Schema
-- PostgreSQL Migration

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Custom ENUM types
CREATE TYPE user_role AS ENUM ('client', 'expert', 'admin');
CREATE TYPE account_status AS ENUM ('pending', 'active', 'suspended', 'deleted');
CREATE TYPE country AS ENUM ('ch', 'de', 'at');
CREATE TYPE currency AS ENUM ('chf', 'eur');
CREATE TYPE language AS ENUM ('de', 'en', 'fr', 'it');
CREATE TYPE availability_status AS ENUM ('available', 'partially_available', 'busy', 'not_available');
CREATE TYPE pricing_type AS ENUM ('fixed', 'hourly', 'project_based', 'custom');
CREATE TYPE project_status AS ENUM ('pending', 'accepted', 'paid', 'in_progress', 'delivered', 'revision', 'completed', 'cancelled', 'disputed', 'refunded');
CREATE TYPE milestone_status AS ENUM ('pending', 'in_progress', 'completed', 'cancelled');
CREATE TYPE message_type AS ENUM ('text', 'file', 'image', 'system', 'offer', 'project_update');

-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    role user_role NOT NULL DEFAULT 'client',
    status account_status NOT NULL DEFAULT 'pending',
    country country NOT NULL,
    preferred_currency currency NOT NULL DEFAULT 'eur',
    preferred_language language NOT NULL DEFAULT 'de',
    avatar_url TEXT,
    phone VARCHAR(20),
    email_verified BOOLEAN NOT NULL DEFAULT FALSE,
    phone_verified BOOLEAN NOT NULL DEFAULT FALSE,
    two_factor_enabled BOOLEAN NOT NULL DEFAULT FALSE,
    stripe_customer_id VARCHAR(255),
    last_login_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_status ON users(status);
CREATE INDEX idx_users_country ON users(country);

-- Categories table
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    parent_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    name VARCHAR(100) NOT NULL,
    name_de VARCHAR(100) NOT NULL,
    slug VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    description_de TEXT,
    icon VARCHAR(50),
    image_url TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    is_featured BOOLEAN NOT NULL DEFAULT FALSE,
    sort_order SMALLINT NOT NULL DEFAULT 0,
    service_count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_categories_parent ON categories(parent_id);
CREATE INDEX idx_categories_slug ON categories(slug);
CREATE INDEX idx_categories_active ON categories(is_active);

-- Expert profiles table
CREATE TABLE expert_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    headline VARCHAR(200) NOT NULL,
    bio TEXT NOT NULL,
    hourly_rate INTEGER NOT NULL DEFAULT 0,
    currency currency NOT NULL DEFAULT 'eur',
    years_experience SMALLINT NOT NULL DEFAULT 0,
    skills TEXT[] NOT NULL DEFAULT '{}',
    tools TEXT[] NOT NULL DEFAULT '{}',
    industries TEXT[] NOT NULL DEFAULT '{}',
    languages_spoken TEXT[] NOT NULL DEFAULT '{}',
    portfolio_url TEXT,
    linkedin_url TEXT,
    github_url TEXT,
    website_url TEXT,
    availability_status availability_status NOT NULL DEFAULT 'available',
    available_hours_per_week SMALLINT NOT NULL DEFAULT 40,
    timezone VARCHAR(50) NOT NULL DEFAULT 'Europe/Zurich',
    is_verified BOOLEAN NOT NULL DEFAULT FALSE,
    verification_date TIMESTAMPTZ,
    rating_average REAL NOT NULL DEFAULT 0,
    rating_count INTEGER NOT NULL DEFAULT 0,
    total_projects INTEGER NOT NULL DEFAULT 0,
    total_earnings BIGINT NOT NULL DEFAULT 0,
    response_time_hours SMALLINT,
    completion_rate REAL,
    stripe_connect_id VARCHAR(255),
    stripe_onboarding_complete BOOLEAN NOT NULL DEFAULT FALSE,
    featured BOOLEAN NOT NULL DEFAULT FALSE,
    featured_until TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_expert_profiles_user ON expert_profiles(user_id);
CREATE INDEX idx_expert_profiles_verified ON expert_profiles(is_verified);
CREATE INDEX idx_expert_profiles_featured ON expert_profiles(featured);
CREATE INDEX idx_expert_profiles_rating ON expert_profiles(rating_average DESC);
CREATE INDEX idx_expert_profiles_skills ON expert_profiles USING GIN(skills);
CREATE INDEX idx_expert_profiles_tools ON expert_profiles USING GIN(tools);

