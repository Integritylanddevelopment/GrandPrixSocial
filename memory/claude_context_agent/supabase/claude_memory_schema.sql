-- Claude Context Memory System - Supabase Schema
-- Complete database schema for Claude's memory system
-- 
-- This replaces file-based memory with searchable, queryable database storage
-- Each memory type has its own table with proper relationships and indexing

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS vector;

-- =====================================================================
-- CORE MEMORY TABLES
-- =====================================================================

-- Long-Term Memory: Permanent context and important knowledge
CREATE TABLE IF NOT EXISTS claude_long_term_memory (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    content_type TEXT DEFAULT 'markdown' CHECK (content_type IN ('markdown', 'json', 'text', 'code')),
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

-- Short-Term Memory: Recent sessions and temporary context  
CREATE TABLE IF NOT EXISTS claude_short_term_memory (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id TEXT NOT NULL,
    conversation_turn INTEGER NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
    content TEXT NOT NULL,
    context_window_position INTEGER,
    tokens_used INTEGER,
    model_used TEXT,
    request_id TEXT,
    importance_score INTEGER DEFAULT 3 CHECK (importance_score BETWEEN 1 AND 10),
    tags TEXT[] DEFAULT '{}',
    metadata JSONB DEFAULT '{}',
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (CURRENT_TIMESTAMP + INTERVAL '7 days'),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    agent_source TEXT DEFAULT 'ClaudeSessionManager'
);

-- Working Memory: Active tasks and current development context
CREATE TABLE IF NOT EXISTS claude_working_memory (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    task_id TEXT NOT NULL,
    task_title TEXT NOT NULL,
    task_description TEXT,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused', 'archived')),
    priority INTEGER DEFAULT 5 CHECK (priority BETWEEN 1 AND 10),
    progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage BETWEEN 0 AND 100),
    context_data JSONB DEFAULT '{}',
    related_files TEXT[] DEFAULT '{}',
    dependencies TEXT[] DEFAULT '{}',
    notes TEXT,
    tags TEXT[] DEFAULT '{}',
    due_date TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    archived_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    agent_source TEXT DEFAULT 'ClaudeWorkingMemoryAgent'
);

-- Procedural Memory: How-to knowledge and step-by-step procedures
CREATE TABLE IF NOT EXISTS claude_procedural_memory (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    procedure_name TEXT NOT NULL,
    category TEXT NOT NULL,
    description TEXT,
    steps JSONB NOT NULL, -- Array of step objects with instructions
    prerequisites TEXT[] DEFAULT '{}',
    expected_outcomes TEXT[] DEFAULT '{}',
    difficulty_level INTEGER DEFAULT 3 CHECK (difficulty_level BETWEEN 1 AND 5),
    success_rate DECIMAL(3,2) DEFAULT 1.00,
    usage_count INTEGER DEFAULT 0,
    last_used TIMESTAMP WITH TIME ZONE,
    tags TEXT[] DEFAULT '{}',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    agent_source TEXT DEFAULT 'ClaudeProcedureAgent'
);

-- Semantic Memory: Tagged knowledge and categorized information
CREATE TABLE IF NOT EXISTS claude_semantic_memory (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    concept_name TEXT NOT NULL,
    concept_type TEXT NOT NULL,
    definition TEXT,
    content TEXT NOT NULL,
    category TEXT NOT NULL,
    subcategory TEXT,
    confidence_score DECIMAL(3,2) DEFAULT 0.80 CHECK (confidence_score BETWEEN 0.0 AND 1.0),
    source_reliability INTEGER DEFAULT 7 CHECK (source_reliability BETWEEN 1 AND 10),
    related_concepts TEXT[] DEFAULT '{}',
    tags TEXT[] DEFAULT '{}',
    evidence JSONB DEFAULT '{}',
    contradictions TEXT[] DEFAULT '{}',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    agent_source TEXT DEFAULT 'ClaudeSemanticAgent'
);

-- Episodic Memory: Specific experiences and conversation episodes
CREATE TABLE IF NOT EXISTS claude_episodic_memory (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    episode_id TEXT NOT NULL,
    episode_title TEXT NOT NULL,
    episode_type TEXT DEFAULT 'conversation' CHECK (episode_type IN ('conversation', 'problem_solving', 'learning', 'error', 'success')),
    context_summary TEXT NOT NULL,
    key_insights TEXT[] DEFAULT '{}',
    emotional_tone TEXT,
    outcome TEXT,
    lessons_learned TEXT[] DEFAULT '{}',
    participants TEXT[] DEFAULT '{}',
    duration_minutes INTEGER,
    importance_score INTEGER DEFAULT 5 CHECK (importance_score BETWEEN 1 AND 10),
    recall_count INTEGER DEFAULT 0,
    tags TEXT[] DEFAULT '{}',
    full_transcript JSONB,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    agent_source TEXT DEFAULT 'ClaudeEpisodicAgent'
);

-- =====================================================================
-- SUPPORT AND COORDINATION TABLES  
-- =====================================================================

-- Memory Tags: Centralized tag management and relationships
CREATE TABLE IF NOT EXISTS claude_memory_tags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tag_name TEXT NOT NULL UNIQUE,
    category TEXT NOT NULL,
    description TEXT,
    usage_count INTEGER DEFAULT 0,
    parent_tag TEXT REFERENCES claude_memory_tags(tag_name),
    child_tags TEXT[] DEFAULT '{}',
    color_hex TEXT DEFAULT '#6B7280',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Memory Relationships: Links between different memories
CREATE TABLE IF NOT EXISTS claude_memory_relationships (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    source_table TEXT NOT NULL,
    source_id UUID NOT NULL,
    target_table TEXT NOT NULL,
    target_id UUID NOT NULL,
    relationship_type TEXT NOT NULL CHECK (relationship_type IN ('relates_to', 'caused_by', 'leads_to', 'part_of', 'similar_to', 'contradicts')),
    strength DECIMAL(3,2) DEFAULT 0.50 CHECK (strength BETWEEN 0.0 AND 1.0),
    bidirectional BOOLEAN DEFAULT false,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by TEXT DEFAULT 'system'
);

-- Memory Embeddings: Vector embeddings for semantic search
CREATE TABLE IF NOT EXISTS claude_memory_embeddings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    memory_table TEXT NOT NULL,
    memory_id UUID NOT NULL,
    content_hash TEXT NOT NULL,
    embedding VECTOR(1536), -- OpenAI ada-002 embedding size
    model_used TEXT DEFAULT 'text-embedding-ada-002',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Agent State: Track agent status and coordination
CREATE TABLE IF NOT EXISTS claude_agent_state (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agent_name TEXT NOT NULL UNIQUE,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'error', 'maintenance')),
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

-- =====================================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================================

-- Long-term memory indexes
CREATE INDEX IF NOT EXISTS idx_claude_ltm_importance ON claude_long_term_memory(importance_score DESC);
CREATE INDEX IF NOT EXISTS idx_claude_ltm_tags ON claude_long_term_memory USING gin(tags);
CREATE INDEX IF NOT EXISTS idx_claude_ltm_content ON claude_long_term_memory USING gin(to_tsvector('english', content));
CREATE INDEX IF NOT EXISTS idx_claude_ltm_access ON claude_long_term_memory(last_accessed DESC);

-- Short-term memory indexes
CREATE INDEX IF NOT EXISTS idx_claude_stm_session ON claude_short_term_memory(session_id);
CREATE INDEX IF NOT EXISTS idx_claude_stm_expires ON claude_short_term_memory(expires_at);
CREATE INDEX IF NOT EXISTS idx_claude_stm_created ON claude_short_term_memory(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_claude_stm_importance ON claude_short_term_memory(importance_score DESC);

-- Working memory indexes
CREATE INDEX IF NOT EXISTS idx_claude_wm_status ON claude_working_memory(status);
CREATE INDEX IF NOT EXISTS idx_claude_wm_priority ON claude_working_memory(priority DESC);
CREATE INDEX IF NOT EXISTS idx_claude_wm_task ON claude_working_memory(task_id);
CREATE INDEX IF NOT EXISTS idx_claude_wm_due ON claude_working_memory(due_date) WHERE due_date IS NOT NULL;

-- Procedural memory indexes
CREATE INDEX IF NOT EXISTS idx_claude_pm_category ON claude_procedural_memory(category);
CREATE INDEX IF NOT EXISTS idx_claude_pm_usage ON claude_procedural_memory(usage_count DESC);
CREATE INDEX IF NOT EXISTS idx_claude_pm_success ON claude_procedural_memory(success_rate DESC);

-- Semantic memory indexes
CREATE INDEX IF NOT EXISTS idx_claude_sm_concept ON claude_semantic_memory(concept_name);
CREATE INDEX IF NOT EXISTS idx_claude_sm_category ON claude_semantic_memory(category, subcategory);
CREATE INDEX IF NOT EXISTS idx_claude_sm_confidence ON claude_semantic_memory(confidence_score DESC);
CREATE INDEX IF NOT EXISTS idx_claude_sm_content ON claude_semantic_memory USING gin(to_tsvector('english', content));

-- Episodic memory indexes
CREATE INDEX IF NOT EXISTS idx_claude_em_episode ON claude_episodic_memory(episode_id);
CREATE INDEX IF NOT EXISTS idx_claude_em_type ON claude_episodic_memory(episode_type);
CREATE INDEX IF NOT EXISTS idx_claude_em_importance ON claude_episodic_memory(importance_score DESC);
CREATE INDEX IF NOT EXISTS idx_claude_em_recall ON claude_episodic_memory(recall_count DESC);

-- Support table indexes
CREATE INDEX IF NOT EXISTS idx_claude_tags_category ON claude_memory_tags(category);
CREATE INDEX IF NOT EXISTS idx_claude_tags_usage ON claude_memory_tags(usage_count DESC);
CREATE INDEX IF NOT EXISTS idx_claude_relationships_source ON claude_memory_relationships(source_table, source_id);
CREATE INDEX IF NOT EXISTS idx_claude_relationships_target ON claude_memory_relationships(target_table, target_id);
CREATE INDEX IF NOT EXISTS idx_claude_embeddings_memory ON claude_memory_embeddings(memory_table, memory_id);

-- =====================================================================
-- FUNCTIONS AND TRIGGERS
-- =====================================================================

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers to relevant tables
CREATE TRIGGER update_claude_ltm_updated_at BEFORE UPDATE ON claude_long_term_memory FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_claude_wm_updated_at BEFORE UPDATE ON claude_working_memory FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_claude_pm_updated_at BEFORE UPDATE ON claude_procedural_memory FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_claude_sm_updated_at BEFORE UPDATE ON claude_semantic_memory FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_claude_em_updated_at BEFORE UPDATE ON claude_episodic_memory FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_claude_agent_updated_at BEFORE UPDATE ON claude_agent_state FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to clean up expired short-term memories
CREATE OR REPLACE FUNCTION cleanup_expired_memories()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM claude_short_term_memory WHERE expires_at < CURRENT_TIMESTAMP;
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- =====================================================================
-- ROW LEVEL SECURITY (Optional - for multi-tenant if needed)
-- =====================================================================

-- Enable RLS on all tables (commented out by default)
-- ALTER TABLE claude_long_term_memory ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE claude_short_term_memory ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE claude_working_memory ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE claude_procedural_memory ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE claude_semantic_memory ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE claude_episodic_memory ENABLE ROW LEVEL SECURITY;

-- =====================================================================
-- INITIAL DATA
-- =====================================================================

-- Insert default tags
INSERT INTO claude_memory_tags (tag_name, category, description, color_hex) VALUES
    ('development', 'project', 'Software development related content', '#3B82F6'),
    ('f1-social', 'project', 'Grand Prix Social project content', '#EF4444'),
    ('memory-system', 'technical', 'Memory system architecture and operations', '#10B981'),
    ('claude-context', 'system', 'Claude context and conversation management', '#8B5CF6'),
    ('important', 'priority', 'High importance content that should be retained', '#F59E0B'),
    ('temporary', 'priority', 'Temporary content with limited retention', '#6B7280'),
    ('learning', 'category', 'Learning experiences and insights', '#EC4899'),
    ('error', 'category', 'Error cases and troubleshooting', '#DC2626'),
    ('success', 'category', 'Successful outcomes and achievements', '#059669'),
    ('procedure', 'category', 'Step-by-step procedures and workflows', '#7C3AED')
ON CONFLICT (tag_name) DO NOTHING;

-- Insert initial agent states
INSERT INTO claude_agent_state (agent_name, status, current_task) VALUES
    ('ContextDocumentMonitor', 'active', 'Monitoring CLAUDE.md for changes'),
    ('ClaudeMemoryRouter', 'active', 'Routing memories to appropriate storage'),
    ('ClaudeSemanticTagger', 'active', 'Tagging and categorizing content'),
    ('ClaudeSessionManager', 'active', 'Managing conversation sessions'),
    ('ClaudeContextInjector', 'active', 'Injecting relevant context'),
    ('ClaudeMemoryPromoter', 'active', 'Promoting important memories to long-term storage')
ON CONFLICT (agent_name) DO UPDATE SET
    status = EXCLUDED.status,
    current_task = EXCLUDED.current_task,
    updated_at = CURRENT_TIMESTAMP;

COMMENT ON SCHEMA public IS 'Claude Context Memory System - Supabase database schema for sophisticated memory management, search, and retrieval capabilities.';