#!/usr/bin/env python3
"""
Simple Supabase Connection Test
Tests basic connection to Supabase and creates a simple table
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
print(f"Loading .env from: {env_path}")
print(f"File exists: {env_path.exists()}")
load_dotenv(env_path)

def test_supabase_connection():
    """Test basic Supabase connection"""
    
    print("Testing Supabase connection...")
    
    # Get credentials
    supabase_url = os.getenv('NEXT_PUBLIC_SUPABASE_URL')
    supabase_key = os.getenv('SUPABASE_SERVICE_ROLE_KEY')
    
    if not supabase_url or not supabase_key:
        print("Error: Missing Supabase credentials in .env.local")
        return False
    
    print(f"Connecting to: {supabase_url}")
    
    try:
        # Create client
        client: Client = create_client(supabase_url, supabase_key)
        
        # Test with existing table (users should exist)
        result = client.table('users').select("id").limit(1).execute()
        
        print("Successfully connected to Supabase!")
        print(f"Found users table with {len(result.data)} sample records")
        
        return True
        
    except Exception as e:
        print(f"Connection failed: {e}")
        return False

def create_simple_test_table():
    """Create a simple test table"""
    
    print("\nTesting table creation...")
    
    supabase_url = os.getenv('NEXT_PUBLIC_SUPABASE_URL')
    supabase_key = os.getenv('SUPABASE_SERVICE_ROLE_KEY')
    
    try:
        client: Client = create_client(supabase_url, supabase_key)
        
        # Try to insert test data into claude_agent_state (will create table if doesn't exist)
        test_data = {
            'agent_name': 'connection_test',
            'status': 'testing',
            'current_task': 'Testing database connection'
        }
        
        # First try to read from the table to see if it exists
        try:
            result = client.table('claude_agent_state').select("agent_name").limit(1).execute()
            print("claude_agent_state table exists")
            
            # Try to insert test data
            insert_result = client.table('claude_agent_state').upsert(test_data).execute()
            if insert_result.data:
                print("Successfully inserted test data")
                
                # Clean up
                client.table('claude_agent_state').delete().eq('agent_name', 'connection_test').execute()
                print("Test data cleaned up")
                
                return True
            
        except Exception as table_error:
            print(f"Table doesn't exist yet: {table_error}")
            return False
        
    except Exception as e:
        print(f"Table test failed: {e}")
        return False

if __name__ == "__main__":
    print("=== Supabase Connection Test ===")
    
    # Test basic connection
    connection_ok = test_supabase_connection()
    
    if connection_ok:
        # Test table operations
        table_ok = create_simple_test_table()
        
        if table_ok:
            print("\nAll tests passed! Ready for Claude memory database setup.")
        else:
            print("\nConnection works but tables need to be created.")
            print("Run the database schema setup next.")
    else:
        print("\nConnection failed. Check your .env.local file.")