-- Initialize Memory System Database
-- Grand Prix Social Memory System

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "hstore";

-- Create schemas
CREATE SCHEMA IF NOT EXISTS memory_core;
CREATE SCHEMA IF NOT EXISTS semantic_memory;
CREATE SCHEMA IF NOT EXISTS procedural_memory;
CREATE SCHEMA IF NOT EXISTS episodic_memory;
CREATE SCHEMA IF NOT EXISTS working_memory;

-- Memory core tables
CREATE TABLE IF NOT EXISTS memory_core.agents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL UNIQUE,
    type VARCHAR(100) NOT NULL,
    status VARCHAR(50) DEFAULT 'inactive',
    config JSONB,
    metrics JSONB,
    last_activity TIMESTAMP DEFAULT NOW(),
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS memory_core.memory_index (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    content_hash VARCHAR(64) NOT NULL UNIQUE,
    memory_type VARCHAR(50) NOT NULL,
    file_path TEXT NOT NULL,
    tags TEXT[],
    metadata JSONB,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Semantic memory tables
CREATE TABLE IF NOT EXISTS semantic_memory.concepts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    relationships JSONB,
    embedding VECTOR(1536), -- For future vector similarity
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS semantic_memory.facts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    subject VARCHAR(255),
    predicate VARCHAR(255),
    object TEXT,
    confidence FLOAT DEFAULT 1.0,
    source VARCHAR(255),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Procedural memory tables
CREATE TABLE IF NOT EXISTS procedural_memory.procedures (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    steps JSONB NOT NULL,
    prerequisites JSONB,
    success_criteria JSONB,
    category VARCHAR(100),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Episodic memory tables
CREATE TABLE IF NOT EXISTS episodic_memory.episodes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id VARCHAR(255),
    timestamp TIMESTAMP NOT NULL,
    event_type VARCHAR(100),
    participants TEXT[],
    context JSONB,
    summary TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Working memory tables
CREATE TABLE IF NOT EXISTS working_memory.active_context (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    context_id VARCHAR(255) NOT NULL,
    content JSONB NOT NULL,
    priority INTEGER DEFAULT 5,
    expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_memory_index_type ON memory_core.memory_index(memory_type);
CREATE INDEX IF NOT EXISTS idx_memory_index_tags ON memory_core.memory_index USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_memory_index_hash ON memory_core.memory_index(content_hash);

CREATE INDEX IF NOT EXISTS idx_concepts_category ON semantic_memory.concepts(category);
CREATE INDEX IF NOT EXISTS idx_facts_subject ON semantic_memory.facts(subject);

CREATE INDEX IF NOT EXISTS idx_procedures_category ON procedural_memory.procedures(category);

CREATE INDEX IF NOT EXISTS idx_episodes_session ON episodic_memory.episodes(session_id);
CREATE INDEX IF NOT EXISTS idx_episodes_timestamp ON episodic_memory.episodes(timestamp);

CREATE INDEX IF NOT EXISTS idx_active_context_expires ON working_memory.active_context(expires_at);

-- Insert initial agent records
INSERT INTO memory_core.agents (name, type, status) VALUES
    ('memory_orchestrator', 'orchestrator', 'active'),
    ('tag_intelligence_engine', 'tagging', 'active'),
    ('context_router', 'routing', 'active'),
    ('working_memory_manager', 'memory_management', 'active')
ON CONFLICT (name) DO NOTHING;

-- Grant permissions
GRANT ALL ON ALL TABLES IN SCHEMA memory_core TO memory_user;
GRANT ALL ON ALL TABLES IN SCHEMA semantic_memory TO memory_user;
GRANT ALL ON ALL TABLES IN SCHEMA procedural_memory TO memory_user;
GRANT ALL ON ALL TABLES IN SCHEMA episodic_memory TO memory_user;
GRANT ALL ON ALL TABLES IN SCHEMA working_memory TO memory_user;

GRANT USAGE ON ALL SEQUENCES IN SCHEMA memory_core TO memory_user;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA semantic_memory TO memory_user;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA procedural_memory TO memory_user;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA episodic_memory TO memory_user;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA working_memory TO memory_user;