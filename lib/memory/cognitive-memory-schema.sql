-- ===================================
-- COGNITIVE MEMORY ARCHITECTURE SCHEMA
-- Grand Prix Social - Full Memory System
-- ===================================

-- ===================================
-- SEMANTIC MEMORY TABLES
-- ===================================

-- Core concept definitions and meanings
CREATE TABLE semantic_definitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  concept TEXT NOT NULL UNIQUE,
  definition TEXT NOT NULL,
  category TEXT NOT NULL, -- 'page', 'feature', 'agent', 'technical', 'business'
  domain TEXT NOT NULL, -- 'f1', 'fantasy', 'news', 'system', 'general'
  context JSONB, -- Additional context about the concept
  examples JSONB, -- Usage examples
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by TEXT DEFAULT 'system'
);

-- Relationships between concepts
CREATE TABLE semantic_relationships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_concept TEXT NOT NULL REFERENCES semantic_definitions(concept),
  target_concept TEXT NOT NULL REFERENCES semantic_definitions(concept),
  relationship_type TEXT NOT NULL, -- 'is_a', 'part_of', 'used_by', 'related_to', 'opposite_of'
  strength FLOAT DEFAULT 1.0, -- 0.0 to 1.0 relationship strength
  bidirectional BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Hierarchical concept organization
CREATE TABLE concept_hierarchy (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_concept TEXT NOT NULL REFERENCES semantic_definitions(concept),
  child_concept TEXT NOT NULL REFERENCES semantic_definitions(concept),
  hierarchy_type TEXT NOT NULL, -- 'category', 'subcategory', 'instance', 'feature'
  level INTEGER NOT NULL, -- depth in hierarchy
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===================================
-- PROCEDURAL MEMORY TABLES  
-- ===================================

-- Agent procedures and workflows
CREATE TABLE agent_procedures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_name TEXT NOT NULL,
  procedure_name TEXT NOT NULL,
  procedure_description TEXT,
  steps JSONB NOT NULL, -- Array of step objects with order, action, description
  input_requirements JSONB, -- What inputs this procedure needs
  output_results JSONB, -- What this procedure produces
  conditions JSONB, -- When to use this procedure
  version INTEGER DEFAULT 1,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(agent_name, procedure_name, version)
);

-- Workflow sequences between procedures
CREATE TABLE workflow_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_name TEXT NOT NULL,
  step_order INTEGER NOT NULL,
  agent_name TEXT NOT NULL,
  procedure_id UUID NOT NULL REFERENCES agent_procedures(id),
  next_step_id UUID REFERENCES workflow_steps(id), -- Points to next step
  conditions JSONB, -- Conditions for executing this step
  parallel_execution BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Procedure execution history and optimization
CREATE TABLE procedure_executions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  procedure_id UUID NOT NULL REFERENCES agent_procedures(id),
  agent_name TEXT NOT NULL,
  execution_start TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  execution_end TIMESTAMP WITH TIME ZONE,
  status TEXT NOT NULL DEFAULT 'running', -- 'running', 'completed', 'failed', 'cancelled'
  input_data JSONB,
  output_data JSONB,
  errors JSONB,
  performance_metrics JSONB, -- execution time, resource usage, etc.
  episode_id UUID -- Link to episodic memory
);

-- ===================================
-- EPISODIC MEMORY TABLES
-- ===================================

-- Time-bounded episodes of activity
CREATE TABLE episodes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  episode_name TEXT NOT NULL,
  episode_type TEXT NOT NULL, -- 'development_session', 'agent_processing', 'user_interaction', 'system_maintenance'
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE,
  context JSONB, -- Context at episode start
  summary TEXT, -- High-level summary of what happened
  participants JSONB, -- Agents, users involved
  outcomes JSONB, -- Key results/changes
  tags JSONB, -- Semantic tags for searchability
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Individual events within episodes
CREATE TABLE episode_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  episode_id UUID NOT NULL REFERENCES episodes(id),
  event_order INTEGER NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  agent_name TEXT,
  event_type TEXT NOT NULL, -- 'action', 'decision', 'observation', 'communication'
  event_description TEXT NOT NULL,
  event_data JSONB, -- Structured event data
  inputs JSONB, -- What led to this event
  outputs JSONB, -- What this event produced
  duration_ms INTEGER, -- How long this event took
  related_procedure_id UUID REFERENCES agent_procedures(id)
);

-- Episode state snapshots
CREATE TABLE episode_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  episode_id UUID NOT NULL REFERENCES episodes(id),
  snapshot_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  system_state JSONB, -- Overall system state
  agent_states JSONB, -- Individual agent states
  data_changes JSONB, -- What data changed since last snapshot
  memory_usage JSONB, -- Memory system metrics
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===================================
-- CROSS-MEMORY INTEGRATION TABLES
-- ===================================

-- Links between different memory types
CREATE TABLE memory_cross_references (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_memory_type TEXT NOT NULL, -- 'semantic', 'procedural', 'episodic'
  source_id UUID NOT NULL,
  target_memory_type TEXT NOT NULL,
  target_id UUID NOT NULL,
  relationship_type TEXT NOT NULL, -- 'used_in', 'defined_by', 'created_during', 'references'
  strength FLOAT DEFAULT 1.0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Memory access patterns and usage
CREATE TABLE memory_access_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  accessor TEXT NOT NULL, -- Which agent accessed memory
  memory_type TEXT NOT NULL,
  memory_id UUID NOT NULL,
  access_type TEXT NOT NULL, -- 'read', 'write', 'update', 'query'
  query_context TEXT, -- What was being looked for
  access_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  response_time_ms INTEGER
);

-- ===================================
-- INDEXES FOR PERFORMANCE
-- ===================================

-- Semantic memory indexes
CREATE INDEX idx_semantic_definitions_concept ON semantic_definitions(concept);
CREATE INDEX idx_semantic_definitions_category ON semantic_definitions(category);
CREATE INDEX idx_semantic_definitions_domain ON semantic_definitions(domain);
CREATE INDEX idx_semantic_relationships_source ON semantic_relationships(source_concept);
CREATE INDEX idx_semantic_relationships_target ON semantic_relationships(target_concept);

-- Procedural memory indexes  
CREATE INDEX idx_agent_procedures_agent ON agent_procedures(agent_name);
CREATE INDEX idx_agent_procedures_name ON agent_procedures(procedure_name);
CREATE INDEX idx_agent_procedures_active ON agent_procedures(is_active);
CREATE INDEX idx_procedure_executions_agent ON procedure_executions(agent_name);
CREATE INDEX idx_procedure_executions_status ON procedure_executions(status);

-- Episodic memory indexes
CREATE INDEX idx_episodes_type ON episodes(episode_type);
CREATE INDEX idx_episodes_start_time ON episodes(start_time);
CREATE INDEX idx_episode_events_episode ON episode_events(episode_id);
CREATE INDEX idx_episode_events_agent ON episode_events(agent_name);
CREATE INDEX idx_episode_events_timestamp ON episode_events(timestamp);

-- Cross-reference indexes
CREATE INDEX idx_memory_cross_refs_source ON memory_cross_references(source_memory_type, source_id);
CREATE INDEX idx_memory_cross_refs_target ON memory_cross_references(target_memory_type, target_id);
CREATE INDEX idx_memory_access_log_accessor ON memory_access_log(accessor);
CREATE INDEX idx_memory_access_log_type ON memory_access_log(memory_type);

-- ===================================
-- INITIAL SEMANTIC DEFINITIONS
-- ===================================

-- Insert core Grand Prix Social concepts
INSERT INTO semantic_definitions (concept, definition, category, domain, context, examples) VALUES
('paddock_talk', 'F1 news page on Grand Prix Social platform featuring real-time F1 news from RSS feeds with AI processing', 'page', 'f1', '{"url": "/paddock-talk", "features": ["news_feed", "real_time_updates", "ai_processing"]}', '["Click Paddock Talk to see latest F1 news", "Paddock Talk shows breaking news"]'),

('fantasy_formula', 'Fantasy sports game for F1 where users create teams and compete based on real race performance', 'feature', 'fantasy', '{"scoring_system": "performance_based", "team_composition": "driver_selection"}', '["Build your Fantasy Formula team", "Fantasy Formula scoring updates after each race"]'),

('semantic_agent_orchestrator', 'System that coordinates multiple specialized semantic analysis agents across different content domains', 'agent', 'system', '{"agent_types": ["news", "image", "user_content", "fantasy", "social", "cross_domain"]}', '["Semantic Agent Orchestrator processes all content types", "Agent orchestrator routes content to specialized agents"]'),

('schedule_intelligence', 'AI-powered F1 schedule management system with timezone handling and personalized notifications', 'feature', 'f1', '{"capabilities": ["timezone_conversion", "notifications", "conflict_detection"]}', '["Schedule Intelligence reminds you of qualifying", "Use schedule intelligence for race times"]'),

('f1_cafe', 'Community discussion area with expert voice elevation and content moderation', 'page', 'social', '{"moderation": "ai_powered", "expert_system": true}', '["Join the F1 Cafe discussion", "F1 Cafe highlights expert opinions"]'),

('memory_orchestrator', 'Agent that coordinates memory operations across all memory buckets and promotes content through memory hierarchy', 'agent', 'system', '{"authority": "orchestration", "scope": "all_memory_buckets"}', '["Memory Orchestrator manages content promotion", "Orchestrator coordinates agent memory operations"]'),

('context_document', 'CLAUDE.md file containing project context, agent roadmap, and development state', 'technical', 'system', '{"path": "memory/CLAUDE.md", "type": "markdown", "purpose": "development_context"}', '["Check context document for current priorities", "Context document updated with agent roadmap"]');

-- Insert procedural relationships
INSERT INTO semantic_relationships (source_concept, target_concept, relationship_type, strength) VALUES
('paddock_talk', 'f1_cafe', 'related_to', 0.8),
('fantasy_formula', 'schedule_intelligence', 'used_by', 0.9),
('semantic_agent_orchestrator', 'memory_orchestrator', 'coordinates_with', 0.9),
('context_document', 'memory_orchestrator', 'monitored_by', 1.0),
('f1_cafe', 'semantic_agent_orchestrator', 'processed_by', 0.8);

-- ===================================
-- FUNCTIONS FOR MEMORY OPERATIONS
-- ===================================

-- Function to get concept definition
CREATE OR REPLACE FUNCTION get_concept_definition(concept_name TEXT)
RETURNS TABLE(definition TEXT, category TEXT, domain TEXT, context JSONB, examples JSONB) 
LANGUAGE plpgsql AS $$
BEGIN
  RETURN QUERY 
  SELECT sd.definition, sd.category, sd.domain, sd.context, sd.examples
  FROM semantic_definitions sd 
  WHERE sd.concept = concept_name;
END;
$$;

-- Function to record episodic event
CREATE OR REPLACE FUNCTION record_episode_event(
  episode_uuid UUID,
  agent TEXT,
  event_type_param TEXT,
  description TEXT,
  event_data_param JSONB DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql AS $$
DECLARE
  event_uuid UUID;
  next_order INTEGER;
BEGIN
  -- Get next event order for this episode
  SELECT COALESCE(MAX(event_order), 0) + 1 INTO next_order
  FROM episode_events WHERE episode_id = episode_uuid;
  
  -- Insert event
  INSERT INTO episode_events (episode_id, event_order, agent_name, event_type, event_description, event_data)
  VALUES (episode_uuid, next_order, agent, event_type_param, description, event_data_param)
  RETURNING id INTO event_uuid;
  
  RETURN event_uuid;
END;
$$;

-- Function to start new episode
CREATE OR REPLACE FUNCTION start_episode(
  name TEXT,
  type TEXT,
  context_data JSONB DEFAULT NULL,
  participants_data JSONB DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql AS $$
DECLARE
  episode_uuid UUID;
BEGIN
  INSERT INTO episodes (episode_name, episode_type, start_time, context, participants)
  VALUES (name, type, NOW(), context_data, participants_data)
  RETURNING id INTO episode_uuid;
  
  RETURN episode_uuid;
END;
$$;