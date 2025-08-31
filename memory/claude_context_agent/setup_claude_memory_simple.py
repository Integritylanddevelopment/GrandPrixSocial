#!/usr/bin/env python3
"""
Simple Claude Memory Database Setup
Creates Claude memory tables using Supabase SQL Editor queries
"""
import os
import sys
from pathlib import Path

# Add project root to path
project_root = Path(__file__).parent.parent.parent
sys.path.append(str(project_root))

from supabase import create_client, Client
from dotenv import load_dotenv

# Load environment from project root
env_path = project_root / ".env.local"
load_dotenv(env_path)

def generate_sql_commands():
    """Generate SQL commands for manual execution in Supabase dashboard"""
    
    print("=" * 60)
    print("CLAUDE MEMORY DATABASE SETUP")
    print("=" * 60)
    print("\n🎯 STEP 1: Open Supabase Dashboard")
    print("Go to: https://supabase.com/dashboard/project/eeyboymoyvrgsbmnezag/editor")
    print("\n🎯 STEP 2: Copy and paste this SQL into the SQL Editor:")
    print("\n" + "=" * 60)
    
    sql_script = '''-- CLAUDE MEMORY SYSTEM DATABASE SCHEMA
-- Execute this entire script in Supabase SQL Editor

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
    content TEXT NOT NULL,
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
ORDER BY table_name;'''
    
    print(sql_script)
    print("\n" + "=" * 60)
    print("\n🎯 STEP 3: Run the script and verify results")
    print("You should see:")
    print("- 'Claude Memory System Installed Successfully!'")
    print("- List of 7 claude_* tables")
    print("\n🎯 STEP 4: Test the connection")
    print("After running the SQL, come back here and I'll test the connection!")
    
    return True

def test_connection():
    """Test connection and verify tables exist"""
    try:
        # Get Supabase credentials
        supabase_url = os.getenv('NEXT_PUBLIC_SUPABASE_URL')
        supabase_key = os.getenv('SUPABASE_SERVICE_ROLE_KEY')
        
        if not supabase_url or not supabase_key:
            print("❌ Missing Supabase credentials in .env.local")
            return False
        
        client: Client = create_client(supabase_url, supabase_key)
        
        print("\n🔍 Testing Claude Memory Database Connection...")
        print(f"Target: {supabase_url}")
        
        # Test each table
        test_tables = [
            'claude_agent_state',
            'claude_long_term_memory', 
            'claude_short_term_memory',
            'claude_working_memory',
            'claude_episodic_memory',
            'claude_semantic_memory',
            'claude_procedural_memory'
        ]
        
        accessible_tables = 0
        
        for table in test_tables:
            try:
                result = client.table(table).select("*").limit(1).execute()
                print(f"  ✅ {table}: Accessible ({len(result.data)} records)")
                accessible_tables += 1
            except Exception as e:
                print(f"  ❌ {table}: Not found - {str(e)[:50]}...")
        
        if accessible_tables == len(test_tables):
            print(f"\n🎉 SUCCESS! All {len(test_tables)} Claude memory tables are working!")
            
            # Test agent data
            agents = client.table('claude_agent_state').select("agent_name, status").execute()
            print(f"\n🤖 Active Agents ({len(agents.data)}):")
            for agent in agents.data:
                print(f"  • {agent['agent_name']}: {agent['status']}")
            
            print(f"\n✅ Claude Memory System is fully operational!")
            print(f"📚 Ready for: conversations, context storage, agent coordination")
            return True
        else:
            print(f"\n⚠️  {accessible_tables}/{len(test_tables)} tables accessible")
            print("Some tables still need to be created. Run the SQL script in Supabase dashboard.")
            return False
            
    except Exception as e:
        print(f"Connection test failed: {e}")
        return False

if __name__ == "__main__":
    print("Choose an option:")
    print("1. Generate SQL script for manual setup")
    print("2. Test existing connection")
    
    choice = input("\nEnter choice (1 or 2): ").strip()
    
    if choice == "1":
        generate_sql_commands()
    elif choice == "2":
        test_connection()
    else:
        print("Invalid choice. Run again and choose 1 or 2.")