#!/usr/bin/env python3
"""
Create Claude Memory Tables via HTTP API
"""
import os
import sys
from pathlib import Path
import requests
import json

# Add project root to path
project_root = Path(__file__).parent.parent.parent
sys.path.append(str(project_root))

from dotenv import load_dotenv

# Load environment from project root
env_path = project_root / ".env.local"
load_dotenv(env_path)

def create_tables_http():
    """Create tables using HTTP API"""
    
    # Get Supabase credentials
    supabase_url = os.getenv('NEXT_PUBLIC_SUPABASE_URL')
    supabase_key = os.getenv('SUPABASE_SERVICE_ROLE_KEY')
    
    if not supabase_url or not supabase_key:
        print("Missing credentials")
        return False
    
    print(f"Creating tables via HTTP API...")
    print(f"Target: {supabase_url}")
    
    # SQL to create all tables
    create_sql = """
-- Claude Agent State Table
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

-- Long Term Memory Table
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

-- Short Term Memory Table  
CREATE TABLE IF NOT EXISTS claude_short_term_memory (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id TEXT NOT NULL,
    message_type TEXT NOT NULL,
    content TEXT NOT NULL,
    sender TEXT DEFAULT 'user',
    importance_score INTEGER DEFAULT 3 CHECK (importance_score BETWEEN 1 AND 10),
    tags TEXT[] DEFAULT '{}',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (CURRENT_TIMESTAMP + INTERVAL '24 hours')
);

-- Working Memory Table
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

-- Episodic Memory Table
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

-- Semantic Memory Table
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

-- Procedural Memory Table
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

-- Create indices
CREATE INDEX IF NOT EXISTS idx_claude_ltm_importance ON claude_long_term_memory(importance_score DESC);
CREATE INDEX IF NOT EXISTS idx_claude_ltm_tags ON claude_long_term_memory USING gin(tags);
CREATE INDEX IF NOT EXISTS idx_claude_stm_session ON claude_short_term_memory(session_id);
CREATE INDEX IF NOT EXISTS idx_claude_wm_task ON claude_working_memory(task_id);
CREATE INDEX IF NOT EXISTS idx_agent_state_name ON claude_agent_state(agent_name);

-- Insert initial agents
INSERT INTO claude_agent_state (agent_name, status, current_task) VALUES
    ('ContextDocumentMonitor', 'active', 'Monitoring CLAUDE.md for changes'),
    ('ClaudeMemoryRouter', 'active', 'Routing memories to storage'),
    ('ClaudeSemanticTagger', 'active', 'Tagging and categorizing content'),
    ('ClaudeSessionManager', 'active', 'Managing conversation sessions')
ON CONFLICT (agent_name) DO UPDATE SET
    status = EXCLUDED.status,
    current_task = EXCLUDED.current_task,
    last_heartbeat = CURRENT_TIMESTAMP;
"""
    
    # Try different API endpoints for SQL execution
    endpoints_to_try = [
        f"{supabase_url}/rest/v1/rpc/sql",
        f"{supabase_url}/rest/v1/rpc/exec",
        f"{supabase_url}/sql",
        f"{supabase_url}/database/query"
    ]
    
    headers = {
        'apikey': supabase_key,
        'Authorization': f'Bearer {supabase_key}',
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
    }
    
    for endpoint in endpoints_to_try:
        print(f"\nTrying endpoint: {endpoint}")
        
        try:
            # Try different payload formats
            payloads_to_try = [
                {"query": create_sql},
                {"sql": create_sql},
                {"statement": create_sql},
                create_sql
            ]
            
            for payload in payloads_to_try:
                try:
                    response = requests.post(endpoint, headers=headers, json=payload, timeout=30)
                    print(f"  Payload format: {type(payload)} - Status: {response.status_code}")
                    
                    if response.status_code in [200, 201, 204]:
                        print(f"  SUCCESS! Tables created")
                        return True
                    elif response.status_code == 404:
                        print(f"  Endpoint not found")
                        break
                    else:
                        print(f"  Response: {response.text[:100]}...")
                        
                except requests.exceptions.RequestException as e:
                    print(f"  Request error: {str(e)[:50]}...")
                    
        except Exception as e:
            print(f"  Endpoint error: {str(e)[:50]}...")
    
    print(f"\nDirect API creation failed.")
    print(f"Will need to use Supabase dashboard SQL editor.")
    return False

if __name__ == "__main__":
    success = create_tables_http()
    if success:
        print("\nTables created successfully!")
    else:
        print("\nUse Supabase dashboard to run SQL manually")
        print("Copy from claude_memory_setup.sql")