#!/usr/bin/env python3
"""
Create Claude Memory Tables - Simple Version
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

def create_claude_tables():
    """Create Claude memory tables"""
    
    # Get Supabase credentials
    supabase_url = os.getenv('NEXT_PUBLIC_SUPABASE_URL')
    supabase_key = os.getenv('SUPABASE_SERVICE_ROLE_KEY')
    
    if not supabase_url or not supabase_key:
        print("Missing credentials")
        return False
    
    client: Client = create_client(supabase_url, supabase_key)
    print(f"Creating tables at: {supabase_url}")
    
    # Try creating tables by inserting sample data
    tables_to_create = [
        {
            'name': 'claude_agent_state',
            'sample': {
                'agent_name': 'test_setup',
                'status': 'active',
                'current_task': 'Table creation test',
                'processed_items': 0,
                'error_count': 0,
                'configuration': {},
                'metrics': {}
            }
        },
        {
            'name': 'claude_long_term_memory', 
            'sample': {
                'title': 'Setup Test Memory',
                'content': 'This is a test memory for table creation',
                'content_type': 'text',
                'importance_score': 5,
                'access_count': 0,
                'tags': ['test', 'setup'],
                'metadata': {'test': True}
            }
        },
        {
            'name': 'claude_short_term_memory',
            'sample': {
                'session_id': 'test_session',
                'message_type': 'test',
                'content': 'Test message for table creation',
                'sender': 'system',
                'importance_score': 3,
                'tags': ['test'],
                'metadata': {'test': True}
            }
        }
    ]
    
    created_tables = []
    
    for table_info in tables_to_create:
        table_name = table_info['name']
        sample_data = table_info['sample']
        
        try:
            print(f"Testing table: {table_name}")
            
            # First check if table exists
            result = client.table(table_name).select("*").limit(1).execute()
            print(f"  Table {table_name} already exists")
            created_tables.append(table_name)
            
        except Exception as e:
            if "Could not find the table" in str(e):
                print(f"  Table {table_name} does not exist - this is expected")
                print(f"  Need to create via Supabase dashboard")
            else:
                print(f"  Error checking {table_name}: {str(e)[:50]}...")
    
    if len(created_tables) == 0:
        print("\nNo tables exist yet.")
        print("Tables need to be created manually in Supabase dashboard.")
        print("Use the SQL from claude_memory_setup.sql")
        return False
    else:
        print(f"\nFound {len(created_tables)} existing tables:")
        for table in created_tables:
            print(f"  - {table}")
        
        # Try to add sample agents if agent table exists
        if 'claude_agent_state' in created_tables:
            try:
                agents = [
                    {
                        'agent_name': 'ContextDocumentMonitor',
                        'status': 'active',
                        'current_task': 'Monitoring CLAUDE.md for changes'
                    },
                    {
                        'agent_name': 'ClaudeMemoryRouter',
                        'status': 'active',
                        'current_task': 'Routing memories to storage'
                    }
                ]
                
                for agent in agents:
                    result = client.table('claude_agent_state').upsert(agent).execute()
                    print(f"  Added agent: {agent['agent_name']}")
                    
            except Exception as e:
                print(f"  Agent setup error: {e}")
    
    return len(created_tables) > 0

if __name__ == "__main__":
    success = create_claude_tables()
    if success:
        print("\nSome tables ready!")
    else:
        print("\nTables need manual creation in Supabase dashboard")
        print("Copy SQL from claude_memory_setup.sql")