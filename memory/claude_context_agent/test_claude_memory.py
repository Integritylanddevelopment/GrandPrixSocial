#!/usr/bin/env python3
"""
Test Claude Memory Database
Verifies all tables exist and are working correctly
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

def test_claude_memory_system():
    """Test all Claude memory tables and functionality"""
    
    # Get Supabase credentials
    supabase_url = os.getenv('NEXT_PUBLIC_SUPABASE_URL')
    supabase_key = os.getenv('SUPABASE_SERVICE_ROLE_KEY')
    
    if not supabase_url or not supabase_key:
        print("Missing Supabase credentials in .env.local")
        return False
    
    client: Client = create_client(supabase_url, supabase_key)
    
    print("Testing Claude Memory Database Connection...")
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
            print(f"  SUCCESS {table}: Accessible ({len(result.data)} records)")
            accessible_tables += 1
        except Exception as e:
            print(f"  ERROR {table}: {str(e)[:100]}...")
    
    if accessible_tables == len(test_tables):
        print(f"\nSUCCESS! All {len(test_tables)} Claude memory tables are working!")
        
        # Test agent data
        try:
            agents = client.table('claude_agent_state').select("agent_name, status, current_task").execute()
            print(f"\nActive Agents ({len(agents.data)}):")
            for agent in agents.data:
                print(f"  - {agent['agent_name']}: {agent['status']}")
                print(f"    Task: {agent['current_task']}")
        except Exception as e:
            print(f"Agent data test failed: {e}")
        
        print(f"\nClaude Memory System is fully operational!")
        print(f"Ready for: conversations, context storage, agent coordination")
        
        # Test basic operations
        try:
            # Test inserting a sample memory
            test_memory = {
                'title': 'Database Connection Test',
                'content': 'Successfully connected to Claude Memory Database',
                'importance_score': 7,
                'tags': ['test', 'database', 'connection'],
                'metadata': {'test': True, 'timestamp': 'now'}
            }
            
            result = client.table('claude_long_term_memory').insert(test_memory).execute()
            print(f"\nMemory insert test: SUCCESS (ID: {result.data[0]['id'][:8]}...)")
            
            # Clean up test data
            client.table('claude_long_term_memory').delete().eq('title', 'Database Connection Test').execute()
            print("Test data cleaned up: SUCCESS")
            
        except Exception as e:
            print(f"Memory operations test: ERROR - {e}")
        
        return True
    else:
        print(f"\nWARNING: {accessible_tables}/{len(test_tables)} tables accessible")
        print("Some tables still need to be created.")
        print("\nTo fix this:")
        print("1. Go to: https://supabase.com/dashboard/project/eeyboymoyvrgsbmnezag/editor")
        print("2. Copy the SQL from claude_memory_setup.sql")
        print("3. Paste and run it in the SQL Editor")
        return False

if __name__ == "__main__":
    success = test_claude_memory_system()
    if success:
        print("\n" + "="*60)
        print("CLAUDE MEMORY SYSTEM READY!")
        print("Next: Run agent scripts or start memory operations")
        print("="*60)
    else:
        print("\n" + "="*60)
        print("DATABASE SETUP NEEDED")
        print("Run the SQL script first, then test again")
        print("="*60)