#!/usr/bin/env python3
"""
Claude Memory Database Schema Creator
Creates all necessary tables for Claude's memory system
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

def create_claude_memory_tables():
    """Create all Claude memory system tables"""
    
    # Get Supabase credentials
    supabase_url = os.getenv('NEXT_PUBLIC_SUPABASE_URL')
    supabase_key = os.getenv('SUPABASE_SERVICE_ROLE_KEY')
    
    if not supabase_url or not supabase_key:
        raise ValueError("Missing Supabase credentials in .env.local")
    
    client: Client = create_client(supabase_url, supabase_key)
    
    print(f"Creating Claude Memory Database Schema...")
    print(f"Target: {supabase_url}")
    
    # SQL for all Claude memory tables
    schemas = [
        # 1. Claude Agent State Table
        """
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
        """,
        
        # 2. Long Term Memory Table
        """
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
        """,
        
        # 3. Short Term Memory Table
        """
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
        """,
        
        # 4. Working Memory Table
        """
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
        """,
        
        # 5. Episodic Memory Table
        """
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
        """,
        
        # 6. Semantic Memory Table
        """
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
        """,
        
        # 7. Procedural Memory Table
        """
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
        """
    ]
    
    # Create indices
    indices = [
        "CREATE INDEX IF NOT EXISTS idx_claude_ltm_importance ON claude_long_term_memory(importance_score DESC);",
        "CREATE INDEX IF NOT EXISTS idx_claude_ltm_tags ON claude_long_term_memory USING gin(tags);",
        "CREATE INDEX IF NOT EXISTS idx_claude_ltm_access ON claude_long_term_memory(last_accessed DESC);",
        "CREATE INDEX IF NOT EXISTS idx_claude_stm_session ON claude_short_term_memory(session_id);",
        "CREATE INDEX IF NOT EXISTS idx_claude_stm_expires ON claude_short_term_memory(expires_at);",
        "CREATE INDEX IF NOT EXISTS idx_claude_wm_task ON claude_working_memory(task_id);",
        "CREATE INDEX IF NOT EXISTS idx_claude_wm_priority ON claude_working_memory(priority DESC);",
        "CREATE INDEX IF NOT EXISTS idx_claude_em_type ON claude_episodic_memory(episode_type);",
        "CREATE INDEX IF NOT EXISTS idx_claude_sm_concept ON claude_semantic_memory(concept);",
        "CREATE INDEX IF NOT EXISTS idx_claude_pm_name ON claude_procedural_memory(procedure_name);",
        "CREATE INDEX IF NOT EXISTS idx_agent_state_name ON claude_agent_state(agent_name);"
    ]
    
    created_tables = 0
    
    try:
        # Execute each schema
        for i, schema in enumerate(schemas, 1):
            table_name = schema.split("IF NOT EXISTS ")[1].split(" (")[0].strip()
            print(f"Creating table {i}/{len(schemas)}: {table_name}")
            
            # Use RPC call to execute raw SQL
            result = client.rpc('exec_sql', {'sql': schema.strip()}).execute()
            created_tables += 1
            print(f"  ✓ Created {table_name}")
        
        # Create indices
        print("\nCreating indices...")
        for i, index in enumerate(indices, 1):
            index_name = index.split("IF NOT EXISTS ")[1].split(" ON")[0].strip()
            print(f"Creating index {i}/{len(indices)}: {index_name}")
            
            result = client.rpc('exec_sql', {'sql': index.strip()}).execute()
            print(f"  ✓ Created {index_name}")
        
        print(f"\nDatabase schema creation completed successfully!")
        print(f"Created {created_tables} tables and {len(indices)} indices")
        
        # Insert initial agent data
        print("\nInserting initial agent data...")
        initial_agents = [
            {
                'agent_name': 'ContextDocumentMonitor',
                'status': 'active',
                'current_task': 'Monitoring CLAUDE.md for changes'
            },
            {
                'agent_name': 'ClaudeMemoryRouter',
                'status': 'active', 
                'current_task': 'Routing memories to appropriate storage'
            },
            {
                'agent_name': 'ClaudeSemanticTagger',
                'status': 'active',
                'current_task': 'Tagging and categorizing content'
            },
            {
                'agent_name': 'ClaudeSessionManager',
                'status': 'active',
                'current_task': 'Managing conversation sessions'
            }
        ]
        
        for agent in initial_agents:
            result = client.table('claude_agent_state').upsert(agent).execute()
            print(f"  ✓ Added agent: {agent['agent_name']}")
        
        print("\nTesting table access...")
        
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
        
        for table in test_tables:
            result = client.table(table).select("*").limit(1).execute()
            print(f"  ✓ {table}: Accessible")
        
        print(f"\n🎉 Claude Memory Database is ready!")
        print(f"📊 All {len(test_tables)} tables created and accessible")
        print(f"🤖 {len(initial_agents)} agents initialized")
        
        return True
        
    except Exception as e:
        print(f"Error creating tables: {e}")
        print(f"Successfully created {created_tables} tables before error")
        return False

if __name__ == "__main__":
    try:
        success = create_claude_memory_tables()
        if success:
            print("\nNext step: Run start_all_agents.py to activate the memory system")
        else:
            print("\nSome tables may need to be created manually in Supabase dashboard")
    except Exception as e:
        print(f"Setup failed: {e}")