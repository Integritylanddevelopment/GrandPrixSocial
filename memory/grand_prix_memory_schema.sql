-- GRAND PRIX SOCIAL MEMORY SYSTEM DATABASE SCHEMA
-- Generated for CommandCore Memory Architecture

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS vector;


-- Fantasy League Agent State Table
CREATE TABLE IF NOT EXISTS fantasy_league_agent_state (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_name TEXT NOT NULL,
    status TEXT DEFAULT 'active',
    current_state JSONB DEFAULT '{}',
    last_heartbeat TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    current_task TEXT,
    processed_items INTEGER DEFAULT 0,
    error_count INTEGER DEFAULT 0,
    last_error TEXT,
    configuration JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Fantasy League Agent Metrics Table
CREATE TABLE IF NOT EXISTS fantasy_league_agent_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_name TEXT NOT NULL,
    metric_type TEXT NOT NULL,
    metric_value FLOAT NOT NULL,
    metric_metadata JSONB DEFAULT '{}',
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Fantasy League Agent Logs Table
CREATE TABLE IF NOT EXISTS fantasy_league_agent_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_name TEXT NOT NULL,
    log_level TEXT DEFAULT 'INFO',
    message TEXT NOT NULL,
    context JSONB DEFAULT '{}',
    logged_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Gui Launcher Agent State Table
CREATE TABLE IF NOT EXISTS gui_launcher_agent_state (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_name TEXT NOT NULL,
    status TEXT DEFAULT 'active',
    current_state JSONB DEFAULT '{}',
    last_heartbeat TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    current_task TEXT,
    processed_items INTEGER DEFAULT 0,
    error_count INTEGER DEFAULT 0,
    last_error TEXT,
    configuration JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Gui Launcher Agent Metrics Table
CREATE TABLE IF NOT EXISTS gui_launcher_agent_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_name TEXT NOT NULL,
    metric_type TEXT NOT NULL,
    metric_value FLOAT NOT NULL,
    metric_metadata JSONB DEFAULT '{}',
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Gui Launcher Agent Logs Table
CREATE TABLE IF NOT EXISTS gui_launcher_agent_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_name TEXT NOT NULL,
    log_level TEXT DEFAULT 'INFO',
    message TEXT NOT NULL,
    context JSONB DEFAULT '{}',
    logged_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Master Orchestrator Agent State Table
CREATE TABLE IF NOT EXISTS master_orchestrator_agent_state (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_name TEXT NOT NULL,
    status TEXT DEFAULT 'active',
    current_state JSONB DEFAULT '{}',
    last_heartbeat TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    current_task TEXT,
    processed_items INTEGER DEFAULT 0,
    error_count INTEGER DEFAULT 0,
    last_error TEXT,
    configuration JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Master Orchestrator Agent Metrics Table
CREATE TABLE IF NOT EXISTS master_orchestrator_agent_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_name TEXT NOT NULL,
    metric_type TEXT NOT NULL,
    metric_value FLOAT NOT NULL,
    metric_metadata JSONB DEFAULT '{}',
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Master Orchestrator Agent Logs Table
CREATE TABLE IF NOT EXISTS master_orchestrator_agent_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_name TEXT NOT NULL,
    log_level TEXT DEFAULT 'INFO',
    message TEXT NOT NULL,
    context JSONB DEFAULT '{}',
    logged_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Memory Agent Core State Table
CREATE TABLE IF NOT EXISTS memory_agent_core_state (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_name TEXT NOT NULL,
    status TEXT DEFAULT 'active',
    current_state JSONB DEFAULT '{}',
    last_heartbeat TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    current_task TEXT,
    processed_items INTEGER DEFAULT 0,
    error_count INTEGER DEFAULT 0,
    last_error TEXT,
    configuration JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Memory Agent Core Metrics Table
CREATE TABLE IF NOT EXISTS memory_agent_core_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_name TEXT NOT NULL,
    metric_type TEXT NOT NULL,
    metric_value FLOAT NOT NULL,
    metric_metadata JSONB DEFAULT '{}',
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Memory Agent Core Logs Table
CREATE TABLE IF NOT EXISTS memory_agent_core_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_name TEXT NOT NULL,
    log_level TEXT DEFAULT 'INFO',
    message TEXT NOT NULL,
    context JSONB DEFAULT '{}',
    logged_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Memory Context Router Agent State Table
CREATE TABLE IF NOT EXISTS memory_context_router_agent_state (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_name TEXT NOT NULL,
    status TEXT DEFAULT 'active',
    current_state JSONB DEFAULT '{}',
    last_heartbeat TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    current_task TEXT,
    processed_items INTEGER DEFAULT 0,
    error_count INTEGER DEFAULT 0,
    last_error TEXT,
    configuration JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Memory Context Router Agent Metrics Table
CREATE TABLE IF NOT EXISTS memory_context_router_agent_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_name TEXT NOT NULL,
    metric_type TEXT NOT NULL,
    metric_value FLOAT NOT NULL,
    metric_metadata JSONB DEFAULT '{}',
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Memory Context Router Agent Logs Table
CREATE TABLE IF NOT EXISTS memory_context_router_agent_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_name TEXT NOT NULL,
    log_level TEXT DEFAULT 'INFO',
    message TEXT NOT NULL,
    context JSONB DEFAULT '{}',
    logged_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Memory Core Log Agent State Table
CREATE TABLE IF NOT EXISTS memory_core_log_agent_state (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_name TEXT NOT NULL,
    status TEXT DEFAULT 'active',
    current_state JSONB DEFAULT '{}',
    last_heartbeat TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    current_task TEXT,
    processed_items INTEGER DEFAULT 0,
    error_count INTEGER DEFAULT 0,
    last_error TEXT,
    configuration JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Memory Core Log Agent Metrics Table
CREATE TABLE IF NOT EXISTS memory_core_log_agent_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_name TEXT NOT NULL,
    metric_type TEXT NOT NULL,
    metric_value FLOAT NOT NULL,
    metric_metadata JSONB DEFAULT '{}',
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Memory Core Log Agent Logs Table
CREATE TABLE IF NOT EXISTS memory_core_log_agent_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_name TEXT NOT NULL,
    log_level TEXT DEFAULT 'INFO',
    message TEXT NOT NULL,
    context JSONB DEFAULT '{}',
    logged_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Memory Indexer Agent State Table
CREATE TABLE IF NOT EXISTS memory_indexer_agent_state (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_name TEXT NOT NULL,
    status TEXT DEFAULT 'active',
    current_state JSONB DEFAULT '{}',
    last_heartbeat TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    current_task TEXT,
    processed_items INTEGER DEFAULT 0,
    error_count INTEGER DEFAULT 0,
    last_error TEXT,
    configuration JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Memory Indexer Agent Metrics Table
CREATE TABLE IF NOT EXISTS memory_indexer_agent_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_name TEXT NOT NULL,
    metric_type TEXT NOT NULL,
    metric_value FLOAT NOT NULL,
    metric_metadata JSONB DEFAULT '{}',
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Memory Indexer Agent Logs Table
CREATE TABLE IF NOT EXISTS memory_indexer_agent_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_name TEXT NOT NULL,
    log_level TEXT DEFAULT 'INFO',
    message TEXT NOT NULL,
    context JSONB DEFAULT '{}',
    logged_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Memory Logic Enforcer Agent State Table
CREATE TABLE IF NOT EXISTS memory_logic_enforcer_agent_state (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_name TEXT NOT NULL,
    status TEXT DEFAULT 'active',
    current_state JSONB DEFAULT '{}',
    last_heartbeat TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    current_task TEXT,
    processed_items INTEGER DEFAULT 0,
    error_count INTEGER DEFAULT 0,
    last_error TEXT,
    configuration JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Memory Logic Enforcer Agent Metrics Table
CREATE TABLE IF NOT EXISTS memory_logic_enforcer_agent_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_name TEXT NOT NULL,
    metric_type TEXT NOT NULL,
    metric_value FLOAT NOT NULL,
    metric_metadata JSONB DEFAULT '{}',
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Memory Logic Enforcer Agent Logs Table
CREATE TABLE IF NOT EXISTS memory_logic_enforcer_agent_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_name TEXT NOT NULL,
    log_level TEXT DEFAULT 'INFO',
    message TEXT NOT NULL,
    context JSONB DEFAULT '{}',
    logged_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Memory Router Agent State Table
CREATE TABLE IF NOT EXISTS memory_router_agent_state (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_name TEXT NOT NULL,
    status TEXT DEFAULT 'active',
    current_state JSONB DEFAULT '{}',
    last_heartbeat TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    current_task TEXT,
    processed_items INTEGER DEFAULT 0,
    error_count INTEGER DEFAULT 0,
    last_error TEXT,
    configuration JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Memory Router Agent Metrics Table
CREATE TABLE IF NOT EXISTS memory_router_agent_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_name TEXT NOT NULL,
    metric_type TEXT NOT NULL,
    metric_value FLOAT NOT NULL,
    metric_metadata JSONB DEFAULT '{}',
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Memory Router Agent Logs Table
CREATE TABLE IF NOT EXISTS memory_router_agent_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_name TEXT NOT NULL,
    log_level TEXT DEFAULT 'INFO',
    message TEXT NOT NULL,
    context JSONB DEFAULT '{}',
    logged_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Repo Sync Agent State Table
CREATE TABLE IF NOT EXISTS repo_sync_agent_state (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_name TEXT NOT NULL,
    status TEXT DEFAULT 'active',
    current_state JSONB DEFAULT '{}',
    last_heartbeat TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    current_task TEXT,
    processed_items INTEGER DEFAULT 0,
    error_count INTEGER DEFAULT 0,
    last_error TEXT,
    configuration JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Repo Sync Agent Metrics Table
CREATE TABLE IF NOT EXISTS repo_sync_agent_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_name TEXT NOT NULL,
    metric_type TEXT NOT NULL,
    metric_value FLOAT NOT NULL,
    metric_metadata JSONB DEFAULT '{}',
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Repo Sync Agent Logs Table
CREATE TABLE IF NOT EXISTS repo_sync_agent_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_name TEXT NOT NULL,
    log_level TEXT DEFAULT 'INFO',
    message TEXT NOT NULL,
    context JSONB DEFAULT '{}',
    logged_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- System Health Agent State Table
CREATE TABLE IF NOT EXISTS system_health_agent_state (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_name TEXT NOT NULL,
    status TEXT DEFAULT 'active',
    current_state JSONB DEFAULT '{}',
    last_heartbeat TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    current_task TEXT,
    processed_items INTEGER DEFAULT 0,
    error_count INTEGER DEFAULT 0,
    last_error TEXT,
    configuration JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- System Health Agent Metrics Table
CREATE TABLE IF NOT EXISTS system_health_agent_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_name TEXT NOT NULL,
    metric_type TEXT NOT NULL,
    metric_value FLOAT NOT NULL,
    metric_metadata JSONB DEFAULT '{}',
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- System Health Agent Logs Table
CREATE TABLE IF NOT EXISTS system_health_agent_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_name TEXT NOT NULL,
    log_level TEXT DEFAULT 'INFO',
    message TEXT NOT NULL,
    context JSONB DEFAULT '{}',
    logged_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tag Intelligence Engine State Table
CREATE TABLE IF NOT EXISTS tag_intelligence_engine_state (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_name TEXT NOT NULL,
    status TEXT DEFAULT 'active',
    current_state JSONB DEFAULT '{}',
    last_heartbeat TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    current_task TEXT,
    processed_items INTEGER DEFAULT 0,
    error_count INTEGER DEFAULT 0,
    last_error TEXT,
    configuration JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tag Intelligence Engine Metrics Table
CREATE TABLE IF NOT EXISTS tag_intelligence_engine_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_name TEXT NOT NULL,
    metric_type TEXT NOT NULL,
    metric_value FLOAT NOT NULL,
    metric_metadata JSONB DEFAULT '{}',
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tag Intelligence Engine Logs Table
CREATE TABLE IF NOT EXISTS tag_intelligence_engine_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_name TEXT NOT NULL,
    log_level TEXT DEFAULT 'INFO',
    message TEXT NOT NULL,
    context JSONB DEFAULT '{}',
    logged_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- User Intelligence Agent State Table
CREATE TABLE IF NOT EXISTS user_intelligence_agent_state (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_name TEXT NOT NULL,
    status TEXT DEFAULT 'active',
    current_state JSONB DEFAULT '{}',
    last_heartbeat TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    current_task TEXT,
    processed_items INTEGER DEFAULT 0,
    error_count INTEGER DEFAULT 0,
    last_error TEXT,
    configuration JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- User Intelligence Agent Metrics Table
CREATE TABLE IF NOT EXISTS user_intelligence_agent_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_name TEXT NOT NULL,
    metric_type TEXT NOT NULL,
    metric_value FLOAT NOT NULL,
    metric_metadata JSONB DEFAULT '{}',
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- User Intelligence Agent Logs Table
CREATE TABLE IF NOT EXISTS user_intelligence_agent_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_name TEXT NOT NULL,
    log_level TEXT DEFAULT 'INFO',
    message TEXT NOT NULL,
    context JSONB DEFAULT '{}',
    logged_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- A Memory Core Storage Table
CREATE TABLE IF NOT EXISTS core_memory_storage (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    memory_type TEXT DEFAULT 'a_memory_core',
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    content_type TEXT DEFAULT 'json',
    importance_score INTEGER DEFAULT 5 CHECK (importance_score BETWEEN 1 AND 10),
    access_count INTEGER DEFAULT 0,
    last_accessed TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    tags TEXT[] DEFAULT '{}',
    metadata JSONB DEFAULT '{}',
    source_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT NULL
);

-- A Memory Core Index Table  
CREATE TABLE IF NOT EXISTS core_memory_index (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    memory_id UUID REFERENCES core_memory_storage(id),
    index_type TEXT NOT NULL,
    index_key TEXT NOT NULL,
    index_value TEXT NOT NULL,
    weight FLOAT DEFAULT 1.0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- B Long Term Memory Storage Table
CREATE TABLE IF NOT EXISTS lonterm_memory_storage (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    memory_type TEXT DEFAULT 'b_long_term_memory',
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    content_type TEXT DEFAULT 'json',
    importance_score INTEGER DEFAULT 5 CHECK (importance_score BETWEEN 1 AND 10),
    access_count INTEGER DEFAULT 0,
    last_accessed TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    tags TEXT[] DEFAULT '{}',
    metadata JSONB DEFAULT '{}',
    source_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT NULL
);

-- B Long Term Memory Index Table  
CREATE TABLE IF NOT EXISTS lonterm_memory_index (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    memory_id UUID REFERENCES lonterm_memory_storage(id),
    index_type TEXT NOT NULL,
    index_key TEXT NOT NULL,
    index_value TEXT NOT NULL,
    weight FLOAT DEFAULT 1.0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- C Short Term Memory Storage Table
CREATE TABLE IF NOT EXISTS short_term_memory_storage (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    memory_type TEXT DEFAULT 'c_short_term_memory',
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    content_type TEXT DEFAULT 'json',
    importance_score INTEGER DEFAULT 5 CHECK (importance_score BETWEEN 1 AND 10),
    access_count INTEGER DEFAULT 0,
    last_accessed TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    tags TEXT[] DEFAULT '{}',
    metadata JSONB DEFAULT '{}',
    source_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT NULL
);

-- C Short Term Memory Index Table  
CREATE TABLE IF NOT EXISTS short_term_memory_index (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    memory_id UUID REFERENCES short_term_memory_storage(id),
    index_type TEXT NOT NULL,
    index_key TEXT NOT NULL,
    index_value TEXT NOT NULL,
    weight FLOAT DEFAULT 1.0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- D Working Memory Storage Table
CREATE TABLE IF NOT EXISTS working_memory_storage (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    memory_type TEXT DEFAULT 'd_working_memory',
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    content_type TEXT DEFAULT 'json',
    importance_score INTEGER DEFAULT 5 CHECK (importance_score BETWEEN 1 AND 10),
    access_count INTEGER DEFAULT 0,
    last_accessed TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    tags TEXT[] DEFAULT '{}',
    metadata JSONB DEFAULT '{}',
    source_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT NULL
);

-- D Working Memory Index Table  
CREATE TABLE IF NOT EXISTS working_memory_index (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    memory_id UUID REFERENCES working_memory_storage(id),
    index_type TEXT NOT NULL,
    index_key TEXT NOT NULL,
    index_value TEXT NOT NULL,
    weight FLOAT DEFAULT 1.0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- E Episodic Storage Table
CREATE TABLE IF NOT EXISTS episodic_memory_storage (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    memory_type TEXT DEFAULT 'e_episodic',
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    content_type TEXT DEFAULT 'json',
    importance_score INTEGER DEFAULT 5 CHECK (importance_score BETWEEN 1 AND 10),
    access_count INTEGER DEFAULT 0,
    last_accessed TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    tags TEXT[] DEFAULT '{}',
    metadata JSONB DEFAULT '{}',
    source_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT NULL
);

-- E Episodic Index Table  
CREATE TABLE IF NOT EXISTS episodic_memory_index (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    memory_id UUID REFERENCES episodic_memory_storage(id),
    index_type TEXT NOT NULL,
    index_key TEXT NOT NULL,
    index_value TEXT NOT NULL,
    weight FLOAT DEFAULT 1.0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- E Procedural Storage Table
CREATE TABLE IF NOT EXISTS procedural_memory_storage (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    memory_type TEXT DEFAULT 'e_procedural',
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    content_type TEXT DEFAULT 'json',
    importance_score INTEGER DEFAULT 5 CHECK (importance_score BETWEEN 1 AND 10),
    access_count INTEGER DEFAULT 0,
    last_accessed TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    tags TEXT[] DEFAULT '{}',
    metadata JSONB DEFAULT '{}',
    source_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT NULL
);

-- E Procedural Index Table  
CREATE TABLE IF NOT EXISTS procedural_memory_index (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    memory_id UUID REFERENCES procedural_memory_storage(id),
    index_type TEXT NOT NULL,
    index_key TEXT NOT NULL,
    index_value TEXT NOT NULL,
    weight FLOAT DEFAULT 1.0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- F Semantic Storage Table
CREATE TABLE IF NOT EXISTS semantic_memory_storage (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    memory_type TEXT DEFAULT 'f_semantic',
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    content_type TEXT DEFAULT 'json',
    importance_score INTEGER DEFAULT 5 CHECK (importance_score BETWEEN 1 AND 10),
    access_count INTEGER DEFAULT 0,
    last_accessed TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    tags TEXT[] DEFAULT '{}',
    metadata JSONB DEFAULT '{}',
    source_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT NULL
);

-- F Semantic Index Table  
CREATE TABLE IF NOT EXISTS semantic_memory_index (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    memory_id UUID REFERENCES semantic_memory_storage(id),
    index_type TEXT NOT NULL,
    index_key TEXT NOT NULL,
    index_value TEXT NOT NULL,
    weight FLOAT DEFAULT 1.0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- G Episodic Storage Table
CREATE TABLE IF NOT EXISTS episodic_memory_storage (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    memory_type TEXT DEFAULT 'g_episodic',
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    content_type TEXT DEFAULT 'json',
    importance_score INTEGER DEFAULT 5 CHECK (importance_score BETWEEN 1 AND 10),
    access_count INTEGER DEFAULT 0,
    last_accessed TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    tags TEXT[] DEFAULT '{}',
    metadata JSONB DEFAULT '{}',
    source_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT NULL
);

-- G Episodic Index Table  
CREATE TABLE IF NOT EXISTS episodic_memory_index (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    memory_id UUID REFERENCES episodic_memory_storage(id),
    index_type TEXT NOT NULL,
    index_key TEXT NOT NULL,
    index_value TEXT NOT NULL,
    weight FLOAT DEFAULT 1.0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Memory System State Table
CREATE TABLE IF NOT EXISTS memory_system_state (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    system_status TEXT DEFAULT 'active',
    active_agents TEXT[] DEFAULT '{}',
    system_metrics JSONB DEFAULT '{}',
    last_heartbeat TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Agent Registry Table
CREATE TABLE IF NOT EXISTS agent_registry (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_name TEXT NOT NULL UNIQUE,
    agent_type TEXT NOT NULL,
    status TEXT DEFAULT 'registered',
    capabilities TEXT[] DEFAULT '{}',
    dependencies TEXT[] DEFAULT '{}',
    metadata JSONB DEFAULT '{}',
    registered_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_seen TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- F1 Specific Data Table
CREATE TABLE IF NOT EXISTS f1_specific_data (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    data_type TEXT NOT NULL,
    data_category TEXT NOT NULL,
    title TEXT NOT NULL,
    content JSONB NOT NULL,
    season INTEGER,
    race_id TEXT,
    driver_id TEXT,
    team_id TEXT,
    source TEXT,
    confidence_score FLOAT DEFAULT 1.0,
    tags TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Performance indices
-- CREATE INDEX IF NOT EXISTS idx_memory_core_importance ON memory_core_storage(importance_score DESC); -- REMOVED: Table not found
-- CREATE INDEX IF NOT EXISTS idx_memory_core_tags ON memory_core_storage USING gin(tags); -- REMOVED: Table not found
-- CREATE INDEX IF NOT EXISTS idx_memory_core_access ON memory_core_storage(last_accessed DESC); -- REMOVED: Table not found
CREATE INDEX IF NOT EXISTS idx_agent_registry_name ON agent_registry(agent_name);
CREATE INDEX IF NOT EXISTS idx_f1_data_type ON f1_specific_data(data_type);
CREATE INDEX IF NOT EXISTS idx_f1_data_season ON f1_specific_data(season);
-- Valid indices for existing tables
CREATE INDEX IF NOT EXISTS idx_agent_registry_status ON agent_registry(status);
CREATE INDEX IF NOT EXISTS idx_memory_system_state_status ON memory_system_state(system_status);
CREATE INDEX IF NOT EXISTS idx_f1_data_category ON f1_specific_data(data_category);
