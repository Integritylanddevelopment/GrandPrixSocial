-- CLAUDE MEMORY SYSTEM DATABASE SCHEMA
-- Execute this entire script in Supabase SQL Editor
-- URL: https://supabase.com/dashboard/project/eeyboymoyvrgsbmnezag/editor

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS vector;

-- 1. Claude Agent State Table
CREATE TABLE IF NOT EXISTS claude_agent_state (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_name TEXT NOT NULL UNIQUE,
    status TEXT DEFAULT 'active',
    last_heartbeat TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    current_task TEXT,
    processed_items INTEGER DEFAULT 0,
    error_count INTEGER DEFAULT 0,
    last_error TEXT,
    configuration JSONB DEFAULT '{}',
    metrics JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Long Term Memory Table
CREATE TABLE IF NOT EXISTS claude_long_term_memory (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    content_type TEXT DEFAULT 'markdown',
    source_file TEXT,
    importance_score INTEGER DEFAULT 5 CHECK (importance_score BETWEEN 1 AND 10),
    access_count INTEGER DEFAULT 0,
    last_accessed TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    tags TEXT[] DEFAULT '{}',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    agent_source TEXT DEFAULT 'ContextDocumentMonitor'
);

-- 3. Short Term Memory Table
CREATE TABLE IF NOT EXISTS claude_short_term_memory (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id TEXT NOT NULL,
    message_type TEXT NOT NULL,
    
    sender TEXT DEFAULT 'user',
    importance_score INTEGER DEFAULT 3 CHECK (importance_score BETWEEN 1 AND 10),
    tags TEXT[] DEFAULT '{}',
    metadata JSONB DEFAULT '{}',

    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (CURRENT_TIMESTAMP + INTERVAL '24 hours')
);

-- 4. Working Memory Table
CREATE TABLE IF NOT EXISTS claude_working_memory (

    
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id TEXT NOT NULL,
    content TEXT NOT NULL,
    task_type TEXT DEFAULT 'development',
    priority INTEGER DEFAULT 5 CHECK (priority BETWEEN 1 AND 10),
    status TEXT DEFAULT 'active',
    assigned_agent TEXT,
    tags TEXT[] DEFAULT '{}',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (CURRENT_TIMESTAMP + INTERVAL '7 days')
);

-- 5. Episodic Memory Table
CREATE TABLE IF NOT EXISTS claude_episodic_memory (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    episode_type TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    participants TEXT[] DEFAULT '{}',
    outcome TEXT,
    importance_score INTEGER DEFAULT 5 CHECK (importance_score BETWEEN 1 AND 10),
    tags TEXT[] DEFAULT '{}',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    occurred_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. Semantic Memory Table
CREATE TABLE IF NOT EXISTS claude_semantic_memory (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    concept TEXT NOT NULL UNIQUE,
    definition TEXT NOT NULL,
    category TEXT DEFAULT 'general',
    related_concepts TEXT[] DEFAULT '{}',
    confidence_score FLOAT DEFAULT 0.8 CHECK (confidence_score BETWEEN 0.0 AND 1.0),
    source TEXT DEFAULT 'learned',
    tags TEXT[] DEFAULT '{}',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. Procedural Memory Table
CREATE TABLE IF NOT EXISTS claude_procedural_memory (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    procedure_name TEXT NOT NULL UNIQUE,
    description TEXT NOT NULL,
    steps JSONB NOT NULL,
    category TEXT DEFAULT 'general',
    success_rate FLOAT DEFAULT 1.0 CHECK (success_rate BETWEEN 0.0 AND 1.0),
    usage_count INTEGER DEFAULT 0,
    tags TEXT[] DEFAULT '{}',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create performance indices
CREATE INDEX IF NOT EXISTS idx_claude_ltm_importance ON claude_long_term_memory(importance_score DESC);
CREATE INDEX IF NOT EXISTS idx_claude_ltm_tags ON claude_long_term_memory USING gin(tags);
CREATE INDEX IF NOT EXISTS idx_claude_ltm_access ON claude_long_term_memory(last_accessed DESC);
CREATE INDEX IF NOT EXISTS idx_claude_stm_session ON claude_short_term_memory(session_id);
CREATE INDEX IF NOT EXISTS idx_claude_stm_expires ON claude_short_term_memory(expires_at);
CREATE INDEX IF NOT EXISTS idx_claude_wm_task ON claude_working_memory(task_id);
CREATE INDEX IF NOT EXISTS idx_claude_wm_priority ON claude_working_memory(priority DESC);
CREATE INDEX IF NOT EXISTS idx_claude_em_type ON claude_episodic_memory(episode_type);
CREATE INDEX IF NOT EXISTS idx_claude_sm_concept ON claude_semantic_memory(concept);
CREATE INDEX IF NOT EXISTS idx_claude_pm_name ON claude_procedural_memory(procedure_name);
CREATE INDEX IF NOT EXISTS idx_agent_state_name ON claude_agent_state(agent_name);

-- Insert initial agent data
INSERT INTO claude_agent_state (agent_name, status, current_task) VALUES
    ('ContextDocumentMonitor', 'active', 'Monitoring CLAUDE.md for changes'),
    ('ClaudeMemoryRouter', 'active', 'Routing memories to appropriate storage'),
    ('ClaudeSemanticTagger', 'active', 'Tagging and categorizing content'),
    ('ClaudeSessionManager', 'active', 'Managing conversation sessions')
ON CONFLICT (agent_name) DO UPDATE SET
    status = EXCLUDED.status,
    current_task = EXCLUDED.current_task,
    last_heartbeat = CURRENT_TIMESTAMP;

-- Verify installation
SELECT 'Claude Memory System Installed Successfully!' as message;
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' AND table_name LIKE 'claude_%' 
ORDER BY table_name;