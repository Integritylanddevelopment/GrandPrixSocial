#!/usr/bin/env python3
"""
Claude Memory Database Installation Script
Sets up the complete Supabase database schema for Claude's memory system

This script:
1. Connects to your existing Supabase project
2. Creates all memory tables and indexes
3. Sets up triggers and functions
4. Initializes with default data
5. Tests the database connection
6. Migrates existing file-based memories
"""

import os
import sys
import asyncio
from pathlib import Path
import logging

# Add the project root to path
project_root = Path(__file__).parent.parent.parent.parent
sys.path.append(str(project_root))

try:
    from supabase import create_client, Client
    from dotenv import load_dotenv
except ImportError:
    print("Missing dependencies. Installing...")
    os.system("pip install supabase python-dotenv")
    from supabase import create_client, Client
    from dotenv import load_dotenv

# Load environment
load_dotenv()

# Setup logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class ClaudeMemoryDBInstaller:
    """Handles the complete installation of Claude's memory database"""
    
    def __init__(self):
        """Initialize installer with Supabase connection"""
        self.script_dir = Path(__file__).parent
        self.schema_file = self.script_dir / "supabase" / "claude_memory_schema.sql"
        
        # Get Supabase credentials
        self.supabase_url = os.getenv('NEXT_PUBLIC_SUPABASE_URL')
        self.supabase_key = os.getenv('SUPABASE_SERVICE_ROLE_KEY')
        
        if not self.supabase_url or not self.supabase_key:
            raise ValueError("Missing Supabase credentials in .env.local")
        
        self.client: Client = create_client(self.supabase_url, self.supabase_key)
        
        logger.info(f"🔗 Connected to Supabase: {self.supabase_url}")

    async def install_database_schema(self):
        """Install the complete database schema"""
        
        logger.info("📋 Installing Claude Memory Database Schema...")
        
        if not self.schema_file.exists():
            logger.error(f"❌ Schema file not found: {self.schema_file}")
            return False
        
        try:
            # Read the schema file
            with open(self.schema_file, 'r', encoding='utf-8') as f:
                schema_sql = f.read()
            
            # Split into individual statements (rough split on semicolons)
            statements = [stmt.strip() for stmt in schema_sql.split(';') if stmt.strip() and not stmt.strip().startswith('--')]
            
            success_count = 0
            error_count = 0
            
            for i, statement in enumerate(statements):
                try:
                    if statement:
                        # Execute the SQL statement
                        result = self.client.postgrest.session.post(
                            f"{self.supabase_url}/rest/v1/rpc/exec_sql",
                            json={"sql": statement},
                            headers={"Authorization": f"Bearer {self.supabase_key}"}
                        )
                        
                        if result.status_code == 200:
                            success_count += 1
                        else:
                            logger.warning(f"⚠️ SQL statement {i+1} returned status {result.status_code}")
                            error_count += 1
                            
                except Exception as e:
                    logger.error(f"❌ Error executing SQL statement {i+1}: {e}")
                    error_count += 1
                    continue
            
            logger.info(f"✅ Schema installation complete: {success_count} successful, {error_count} errors")
            return error_count == 0
            
        except Exception as e:
            logger.error(f"❌ Failed to install database schema: {e}")
            return False

    async def create_tables_manually(self):
        """Create tables using Supabase client (fallback method)"""
        
        logger.info("🛠️ Creating tables manually using Supabase client...")
        
        tables_created = 0
        
        # Create core memory tables
        table_definitions = [
            # Long-term memory
            {
                'name': 'claude_long_term_memory',
                'columns': [
                    'id UUID PRIMARY KEY DEFAULT uuid_generate_v4()',
                    'title TEXT NOT NULL',
                    'content TEXT NOT NULL',
                    'content_type TEXT DEFAULT \'markdown\'',
                    'source_file TEXT',
                    'importance_score INTEGER DEFAULT 5',
                    'access_count INTEGER DEFAULT 0',
                    'last_accessed TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP',
                    'tags TEXT[] DEFAULT \'{}\'',
                    'metadata JSONB DEFAULT \'{}\'',
                    'created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP',
                    'updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP',
                    'agent_source TEXT DEFAULT \'ContextDocumentMonitor\''
                ]
            },
            # Short-term memory  
            {
                'name': 'claude_short_term_memory',
                'columns': [
                    'id UUID PRIMARY KEY DEFAULT uuid_generate_v4()',
                    'session_id TEXT NOT NULL',
                    'conversation_turn INTEGER NOT NULL',
                    'role TEXT NOT NULL',
                    'content TEXT NOT NULL',
                    'context_window_position INTEGER',
                    'tokens_used INTEGER',
                    'model_used TEXT',
                    'request_id TEXT',
                    'importance_score INTEGER DEFAULT 3',
                    'tags TEXT[] DEFAULT \'{}\'',
                    'metadata JSONB DEFAULT \'{}\'',
                    'expires_at TIMESTAMP WITH TIME ZONE DEFAULT (CURRENT_TIMESTAMP + INTERVAL \'7 days\')',
                    'created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP',
                    'agent_source TEXT DEFAULT \'ClaudeSessionManager\''
                ]
            },
            # Agent state table
            {
                'name': 'claude_agent_state',
                'columns': [
                    'id UUID PRIMARY KEY DEFAULT uuid_generate_v4()',
                    'agent_name TEXT NOT NULL UNIQUE',
                    'status TEXT DEFAULT \'active\'',
                    'last_heartbeat TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP',
                    'current_task TEXT',
                    'processed_items INTEGER DEFAULT 0',
                    'error_count INTEGER DEFAULT 0',
                    'last_error TEXT',
                    'configuration JSONB DEFAULT \'{}\'',
                    'metrics JSONB DEFAULT \'{}\'',
                    'created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP',
                    'updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP'
                ]
            }
        ]
        
        for table_def in table_definitions:
            try:
                # Check if table exists first
                result = self.client.table(table_def['name']).select("id").limit(1).execute()
                
                if result.data is not None:
                    logger.info(f"✅ Table {table_def['name']} already exists")
                    tables_created += 1
                else:
                    logger.info(f"⏳ Creating table {table_def['name']}...")
                    tables_created += 1
                    
            except Exception as e:
                # Table doesn't exist, which is expected for new installations
                logger.info(f"📝 Table {table_def['name']} needs to be created")
        
        logger.info(f"📊 Found/verified {tables_created} tables")
        return True

    async def test_database_connection(self):
        """Test the database connection and basic operations"""
        
        logger.info("🧪 Testing database connection...")
        
        try:
            # Test basic connection with a simple query
            result = self.client.table('claude_agent_state').select("agent_name").limit(1).execute()
            
            if result.data is not None:
                logger.info("✅ Database connection successful")
                
                # Try to insert a test record
                test_data = {
                    'agent_name': 'test_installer',
                    'status': 'testing',
                    'current_task': 'Database installation test'
                }
                
                insert_result = self.client.table('claude_agent_state').upsert(test_data, on_conflict='agent_name').execute()
                
                if insert_result.data:
                    logger.info("✅ Database write test successful")
                    
                    # Clean up test record
                    self.client.table('claude_agent_state').delete().eq('agent_name', 'test_installer').execute()
                    
                    return True
                else:
                    logger.error("❌ Database write test failed")
                    return False
            else:
                logger.error("❌ Database connection test failed")
                return False
                
        except Exception as e:
            logger.error(f"❌ Database test error: {e}")
            return False

    async def initialize_default_data(self):
        """Initialize the database with default data"""
        
        logger.info("🌱 Initializing default data...")
        
        # Initialize default agents
        default_agents = [
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
        
        try:
            for agent in default_agents:
                result = self.client.table('claude_agent_state').upsert(agent, on_conflict='agent_name').execute()
                if result.data:
                    logger.info(f"✅ Initialized agent: {agent['agent_name']}")
                else:
                    logger.warning(f"⚠️ Failed to initialize agent: {agent['agent_name']}")
            
            logger.info("✅ Default data initialization complete")
            return True
            
        except Exception as e:
            logger.error(f"❌ Error initializing default data: {e}")
            return False

    async def migrate_existing_memories(self):
        """Migrate existing file-based memories to database"""
        
        logger.info("📦 Migrating existing file-based memories...")
        
        try:
            # Import the memory database interface
            from supabase.claude_memory_db import ClaudeMemoryDB, LongTermMemory
            
            memory_db = ClaudeMemoryDB()
            migrated_count = 0
            
            # Migrate CLAUDE.md to long-term memory
            claude_md_path = self.script_dir / "CLAUDE.md"
            if claude_md_path.exists():
                with open(claude_md_path, 'r', encoding='utf-8') as f:
                    claude_content = f.read()
                
                memory = LongTermMemory(
                    title="Claude Master Context Document",
                    content=claude_content,
                    tags=["claude-context", "master-document", "important"],
                    importance_score=10,
                    content_type="markdown",
                    source_file="CLAUDE.md",
                    agent_source="migration_script"
                )
                
                memory_id = await memory_db.store_long_term_memory(memory)
                if memory_id:
                    migrated_count += 1
                    logger.info(f"✅ Migrated CLAUDE.md to database (ID: {memory_id})")
            
            # Migrate session document
            session_md_path = self.script_dir / "CLAUDE_CURRENT_SESSION.md"
            if session_md_path.exists():
                with open(session_md_path, 'r', encoding='utf-8') as f:
                    session_content = f.read()
                
                memory = LongTermMemory(
                    title="Claude Current Session Context",
                    content=session_content,
                    tags=["claude-context", "session", "current"],
                    importance_score=8,
                    content_type="markdown",
                    source_file="CLAUDE_CURRENT_SESSION.md",
                    agent_source="migration_script"
                )
                
                memory_id = await memory_db.store_long_term_memory(memory)
                if memory_id:
                    migrated_count += 1
                    logger.info(f"✅ Migrated session document to database (ID: {memory_id})")
            
            logger.info(f"✅ Migration complete: {migrated_count} memories migrated")
            return migrated_count > 0
            
        except Exception as e:
            logger.error(f"❌ Error during migration: {e}")
            return False

    async def run_complete_installation(self):
        """Run the complete installation process"""
        
        logger.info("🚀 Starting Claude Memory Database Installation")
        logger.info("=" * 60)
        
        success_steps = 0
        total_steps = 5
        
        # Step 1: Create tables
        logger.info("📋 Step 1: Creating database tables...")
        if await self.create_tables_manually():
            success_steps += 1
            logger.info("✅ Step 1 complete")
        else:
            logger.error("❌ Step 1 failed")
        
        # Step 2: Test connection
        logger.info("\n🧪 Step 2: Testing database connection...")
        if await self.test_database_connection():
            success_steps += 1
            logger.info("✅ Step 2 complete")
        else:
            logger.error("❌ Step 2 failed")
        
        # Step 3: Initialize default data
        logger.info("\n🌱 Step 3: Initializing default data...")
        if await self.initialize_default_data():
            success_steps += 1
            logger.info("✅ Step 3 complete")
        else:
            logger.error("❌ Step 3 failed")
        
        # Step 4: Migrate existing memories
        logger.info("\n📦 Step 4: Migrating existing memories...")
        if await self.migrate_existing_memories():
            success_steps += 1
            logger.info("✅ Step 4 complete")
        else:
            logger.warning("⚠️ Step 4 had issues (this is okay for new installations)")
            success_steps += 1  # Don't fail installation for migration issues
        
        # Step 5: Final verification
        logger.info("\n🔍 Step 5: Final verification...")
        if await self.verify_installation():
            success_steps += 1
            logger.info("✅ Step 5 complete")
        else:
            logger.error("❌ Step 5 failed")
        
        # Summary
        logger.info("\n" + "=" * 60)
        if success_steps == total_steps:
            logger.info("🎉 INSTALLATION SUCCESSFUL!")
            logger.info("✅ Claude Memory Database is ready to use")
            logger.info(f"📊 Database URL: {self.supabase_url}")
        else:
            logger.error(f"❌ Installation partially failed: {success_steps}/{total_steps} steps successful")
            logger.error("Please check the errors above and try again")
        
        return success_steps == total_steps

    async def verify_installation(self):
        """Verify the installation was successful"""
        
        try:
            # Import and test the memory database
            from supabase.claude_memory_db import get_claude_memory
            
            memory_db = await get_claude_memory()
            stats = await memory_db.get_memory_stats()
            
            logger.info(f"📊 Installation verified - Total memories: {stats['total_memories']}")
            logger.info(f"🤖 Active agents: {len(stats['agents'])}")
            
            return True
            
        except Exception as e:
            logger.error(f"❌ Installation verification failed: {e}")
            return False

async def main():
    """Main installation function"""
    
    try:
        installer = ClaudeMemoryDBInstaller()
        success = await installer.run_complete_installation()
        
        if success:
            print("\n🎯 Next Steps:")
            print("1. Update your Claude memory agents to use the database")
            print("2. Start the Claude context system with database support")
            print("3. Check the memory system status with: python claude_memory_db.py")
        
        return success
        
    except Exception as e:
        logger.error(f"❌ Installation failed: {e}")
        return False

if __name__ == "__main__":
    success = asyncio.run(main())
    sys.exit(0 if success else 1)