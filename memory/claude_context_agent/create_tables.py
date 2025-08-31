#!/usr/bin/env python3
"""
Create Claude Memory Tables
Manually creates the essential tables for Claude's memory system
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
    """Create the core Claude memory tables"""
    
    print("Creating Claude Memory Tables...")
    
    # Get credentials
    supabase_url = os.getenv('NEXT_PUBLIC_SUPABASE_URL')
    supabase_key = os.getenv('SUPABASE_SERVICE_ROLE_KEY')
    
    if not supabase_url or not supabase_key:
        print("Error: Missing Supabase credentials")
        return False
    
    client: Client = create_client(supabase_url, supabase_key)
    
    # Create the agent state table first (simplest)
    print("Creating claude_agent_state table...")
    
    try:
        # Try to create table using a simple insert with proper schema
        test_agent = {
            'agent_name': 'test_creation',
            'status': 'creating',
            'current_task': 'Creating table structure',
            'processed_items': 0,
            'error_count': 0,
            'configuration': {},
            'metrics': {}
        }
        
        result = client.table('claude_agent_state').insert(test_agent).execute()
        
        if result.data:
            print("✅ claude_agent_state table created successfully!")
            
            # Clean up test data
            client.table('claude_agent_state').delete().eq('agent_name', 'test_creation').execute()
            
            return True
        else:
            print(f"❌ Failed to create table: {result}")
            return False
            
    except Exception as e:
        print(f"Error creating table: {e}")
        
        # If table doesn't exist, we'll need to use SQL DDL
        print("Trying to create table with SQL...")
        return create_tables_with_sql(client)

def create_tables_with_sql(client):
    """Create tables using direct SQL execution"""
    
    # SQL to create the agent state table
    create_table_sql = """
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
    """
    
    try:
        # Use the RPC function to execute SQL (if available)
        result = client.rpc('exec_sql', {'query': create_table_sql}).execute()
        print("✅ Table created with SQL!")
        return True
        
    except Exception as e:
        print(f"❌ SQL creation failed: {e}")
        print("You may need to create the table manually in the Supabase dashboard.")
        return False

def test_table_creation():
    """Test that the table was created properly"""
    
    supabase_url = os.getenv('NEXT_PUBLIC_SUPABASE_URL')
    supabase_key = os.getenv('SUPABASE_SERVICE_ROLE_KEY')
    client: Client = create_client(supabase_url, supabase_key)
    
    try:
        # Insert a real test record
        test_data = {
            'agent_name': 'ContextDocumentMonitor',
            'status': 'active',
            'current_task': 'Monitoring CLAUDE.md for changes'
        }
        
        result = client.table('claude_agent_state').upsert(test_data, on_conflict='agent_name').execute()
        
        if result.data:
            print("✅ Table test successful - inserted agent data")
            
            # Query it back
            query_result = client.table('claude_agent_state').select("*").eq('agent_name', 'ContextDocumentMonitor').execute()
            
            if query_result.data:
                print(f"✅ Query test successful - found: {query_result.data[0]['agent_name']}")
                return True
        
        return False
        
    except Exception as e:
        print(f"❌ Table test failed: {e}")
        return False

if __name__ == "__main__":
    print("=== Claude Memory Table Creation ===")
    
    # Create tables
    if create_claude_memory_tables():
        print("\n🧪 Testing table functionality...")
        if test_table_creation():
            print("\n🎉 Success! Claude memory database is ready.")
            print("You can now run the full memory system.")
        else:
            print("\n⚠️ Tables created but tests failed.")
    else:
        print("\n❌ Table creation failed.")
        print("Try creating the tables manually in Supabase dashboard:")
        print("https://supabase.com/dashboard/project/eeyboymoyvrgsbmnezag/editor")