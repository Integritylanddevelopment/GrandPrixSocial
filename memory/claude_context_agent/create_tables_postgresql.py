#!/usr/bin/env python3
"""
Create Claude Memory Tables via PostgreSQL Direct Connection
"""
import os
import sys
from pathlib import Path
import psycopg2
from psycopg2 import sql

# Add project root to path
project_root = Path(__file__).parent.parent.parent
sys.path.append(str(project_root))

from dotenv import load_dotenv

# Load environment from project root
env_path = project_root / ".env.local"
load_dotenv(env_path)

def create_tables_postgresql():
    """Create tables using direct PostgreSQL connection"""
    
    # Get database URL
    database_url = os.getenv('DATABASE_URL')
    
    if not database_url:
        print("Missing DATABASE_URL in .env.local")
        return False
    
    print(f"Connecting to PostgreSQL database...")
    print(f"Host: {database_url.split('@')[1].split(':')[0] if '@' in database_url else 'unknown'}")
    
    try:
        # Connect to PostgreSQL
        conn = psycopg2.connect(database_url)
        cur = conn.cursor()
        
        print("Connected successfully!")
        
        # SQL to create all tables
        table_sqls = [
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
            )
            """,
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
            )
            """,
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
            )
            """,
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
            )
            """,
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
            )
            """,
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
            )
            """,
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
            )
            """
        ]
        
        table_names = [
            'claude_agent_state',
            'claude_long_term_memory',
            'claude_short_term_memory', 
            'claude_working_memory',
            'claude_episodic_memory',
            'claude_semantic_memory',
            'claude_procedural_memory'
        ]
        
        # Create each table
        created_count = 0
        for i, table_sql in enumerate(table_sqls):
            table_name = table_names[i]
            print(f"Creating table: {table_name}")
            
            try:
                cur.execute(table_sql)
                conn.commit()
                print(f"  SUCCESS: Created {table_name}")
                created_count += 1
            except Exception as e:
                print(f"  ERROR: {table_name} - {str(e)[:50]}...")
                conn.rollback()
        
        # Create indices
        print("\nCreating indices...")
        indices = [
            "CREATE INDEX IF NOT EXISTS idx_claude_ltm_importance ON claude_long_term_memory(importance_score DESC)",
            "CREATE INDEX IF NOT EXISTS idx_claude_ltm_tags ON claude_long_term_memory USING gin(tags)",
            "CREATE INDEX IF NOT EXISTS idx_claude_ltm_access ON claude_long_term_memory(last_accessed DESC)",
            "CREATE INDEX IF NOT EXISTS idx_claude_stm_session ON claude_short_term_memory(session_id)",
            "CREATE INDEX IF NOT EXISTS idx_claude_stm_expires ON claude_short_term_memory(expires_at)",
            "CREATE INDEX IF NOT EXISTS idx_claude_wm_task ON claude_working_memory(task_id)",
            "CREATE INDEX IF NOT EXISTS idx_claude_wm_priority ON claude_working_memory(priority DESC)",
            "CREATE INDEX IF NOT EXISTS idx_claude_em_type ON claude_episodic_memory(episode_type)",
            "CREATE INDEX IF NOT EXISTS idx_claude_sm_concept ON claude_semantic_memory(concept)",
            "CREATE INDEX IF NOT EXISTS idx_claude_pm_name ON claude_procedural_memory(procedure_name)",
            "CREATE INDEX IF NOT EXISTS idx_agent_state_name ON claude_agent_state(agent_name)"
        ]
        
        index_count = 0
        for index_sql in indices:
            try:
                cur.execute(index_sql)
                conn.commit()
                index_count += 1
            except Exception as e:
                print(f"  Index error: {str(e)[:30]}...")
                conn.rollback()
        
        print(f"Created {index_count} indices")
        
        # Insert initial agent data
        if created_count > 0:
            print("\nInserting initial agent data...")
            agent_sql = """
            INSERT INTO claude_agent_state (agent_name, status, current_task) VALUES
                ('ContextDocumentMonitor', 'active', 'Monitoring CLAUDE.md for changes'),
                ('ClaudeMemoryRouter', 'active', 'Routing memories to storage'),
                ('ClaudeSemanticTagger', 'active', 'Tagging and categorizing content'),
                ('ClaudeSessionManager', 'active', 'Managing conversation sessions')
            ON CONFLICT (agent_name) DO UPDATE SET
                status = EXCLUDED.status,
                current_task = EXCLUDED.current_task,
                last_heartbeat = CURRENT_TIMESTAMP
            """
            
            try:
                cur.execute(agent_sql)
                conn.commit()
                print("Initial agents inserted successfully")
            except Exception as e:
                print(f"Agent insertion error: {e}")
                conn.rollback()
        
        # Verify tables exist
        print("\nVerifying tables...")
        cur.execute("""
            SELECT table_name FROM information_schema.tables 
            WHERE table_schema = 'public' AND table_name LIKE 'claude_%' 
            ORDER BY table_name
        """)
        
        tables = cur.fetchall()
        print(f"Found {len(tables)} Claude tables:")
        for table in tables:
            print(f"  - {table[0]}")
        
        cur.close()
        conn.close()
        
        print(f"\nSUCCESS! Created {created_count}/{len(table_sqls)} tables")
        print(f"Claude Memory Database is ready!")
        
        return created_count == len(table_sqls)
        
    except Exception as e:
        print(f"Database connection error: {e}")
        return False

if __name__ == "__main__":
    success = create_tables_postgresql()
    if success:
        print("\n" + "="*50)
        print("CLAUDE MEMORY SYSTEM READY!")
        print("All tables created successfully")
        print("="*50)
    else:
        print("\n" + "="*50)
        print("PARTIAL SUCCESS")
        print("Some tables may need manual creation")
        print("="*50)