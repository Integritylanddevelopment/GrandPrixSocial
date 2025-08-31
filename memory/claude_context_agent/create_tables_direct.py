#!/usr/bin/env python3
"""
Create Claude Memory Tables Directly
Uses service role key to create tables via API
"""
import os
import sys
from pathlib import Path

# Add project root to path
project_root = Path(__file__).parent.parent.parent
sys.path.append(str(project_root))

from supabase import create_client, Client
from dotenv import load_dotenv
import requests

# Load environment from project root
env_path = project_root / ".env.local"
load_dotenv(env_path)

def create_tables_via_api():
    """Create tables using direct API calls"""
    
    # Get Supabase credentials
    supabase_url = os.getenv('NEXT_PUBLIC_SUPABASE_URL')
    supabase_key = os.getenv('SUPABASE_SERVICE_ROLE_KEY')
    
    if not supabase_url or not supabase_key:
        raise ValueError("Missing Supabase credentials in .env.local")
    
    client: Client = create_client(supabase_url, supabase_key)
    
    print(f"Creating Claude Memory Database Schema...")
    print(f"Target: {supabase_url}")
    
    # Individual table creation statements
    tables = {
        'claude_agent_state': """
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
            )
        """,
        'claude_long_term_memory': """
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
            )
        """,
        'claude_short_term_memory': """
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
            )
        """,
        'claude_working_memory': """
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
            )
        """,
        'claude_episodic_memory': """
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
            )
        """,
        'claude_semantic_memory': """
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
            )
        """,
        'claude_procedural_memory': """
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
            )
        """
    }
    
    created_count = 0
    
    # Create tables using raw SQL via REST API
    api_url = f"{supabase_url}/rest/v1/rpc/exec_sql"
    headers = {
        'apikey': supabase_key,
        'Authorization': f'Bearer {supabase_key}',
        'Content-Type': 'application/json'
    }
    
    # First, try to create the exec_sql function
    create_function_sql = """
    CREATE OR REPLACE FUNCTION exec_sql(sql text)
    RETURNS void
    LANGUAGE plpgsql
    SECURITY DEFINER
    AS $$
    BEGIN
        EXECUTE sql;
    END;
    $$;
    """
    
    try:
        # Use direct SQL execution via PostgREST
        for table_name, sql in tables.items():
            print(f"Creating table: {table_name}")
            
            # Try using the client directly with raw SQL
            try:
                # Use a different approach - direct table creation via API
                response = requests.post(
                    f"{supabase_url}/rest/v1/rpc/exec_sql",
                    headers=headers,
                    json={"sql": sql.strip()}
                )
                
                if response.status_code == 200:
                    print(f"  ✓ Created {table_name}")
                    created_count += 1
                else:
                    print(f"  ✗ Failed to create {table_name}: {response.text}")
                    
            except Exception as e:
                print(f"  ✗ Error creating {table_name}: {str(e)}")
                
                # Fallback: Try to insert dummy data to trigger table creation
                try:
                    if table_name == 'claude_agent_state':
                        # Try creating a simple record - this might auto-create table
                        dummy_data = {
                            'agent_name': 'test_agent',
                            'status': 'active',
                            'current_task': 'test'
                        }
                        result = client.table(table_name).insert(dummy_data).execute()
                        print(f"  ✓ Table {table_name} exists (inserted test data)")
                        # Clean up
                        client.table(table_name).delete().eq('agent_name', 'test_agent').execute()
                        created_count += 1
                except Exception as e2:
                    print(f"  ✗ Fallback failed for {table_name}: {str(e2)}")
    
    except Exception as e:
        print(f"Setup error: {e}")
    
    # Create indices
    indices = [
        "CREATE INDEX IF NOT EXISTS idx_claude_ltm_importance ON claude_long_term_memory(importance_score DESC)",
        "CREATE INDEX IF NOT EXISTS idx_claude_ltm_tags ON claude_long_term_memory USING gin(tags)",
        "CREATE INDEX IF NOT EXISTS idx_claude_stm_session ON claude_short_term_memory(session_id)",
        "CREATE INDEX IF NOT EXISTS idx_claude_wm_task ON claude_working_memory(task_id)",
        "CREATE INDEX IF NOT EXISTS idx_agent_state_name ON claude_agent_state(agent_name)"
    ]
    
    print("\nCreating indices...")
    for index_sql in indices:
        try:
            response = requests.post(
                f"{supabase_url}/rest/v1/rpc/exec_sql",
                headers=headers,
                json={"sql": index_sql}
            )
            if response.status_code == 200:
                print(f"  ✓ Created index")
        except:
            print(f"  ✗ Index creation failed (may not be critical)")
    
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
    
    if created_count > 0:
        try:
            for agent in initial_agents:
                result = client.table('claude_agent_state').upsert(agent).execute()
                print(f"  ✓ Added agent: {agent['agent_name']}")
        except Exception as e:
            print(f"Agent insertion failed: {e}")
    
    print(f"\nCreated {created_count} out of {len(tables)} tables")
    return created_count > 0

if __name__ == "__main__":
    success = create_tables_via_api()
    print(f"\nSetup completed. Success: {success}")