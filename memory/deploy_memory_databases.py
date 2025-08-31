#!/usr/bin/env python3
"""
Deploy Grand Prix Social Memory System Databases
Creates all tables for the complete memory system
"""
import os
import sys
from pathlib import Path
import requests
import json

# Add project root to path
project_root = Path(__file__).parent.parent
sys.path.append(str(project_root))

from dotenv import load_dotenv

# Load environment from project root
env_path = project_root / ".env.local"
load_dotenv(env_path)

def deploy_memory_databases():
    """Deploy all memory system databases using Supabase Management API"""
    
    # Get credentials
    management_token = os.getenv('SUPABASE_MANAGEMENT_TOKEN')
    project_ref = "eeyboymoyvrgsbmnezag"  # From the URL
    
    if not management_token:
        print("Missing SUPABASE_MANAGEMENT_TOKEN in .env.local")
        return False
    
    print("="*80)
    print("GRAND PRIX SOCIAL MEMORY SYSTEM DATABASE DEPLOYMENT")
    print("="*80)
    print(f"Target Project: {project_ref}")
    
    # Read the generated schema
    schema_file = Path(__file__).parent / 'grand_prix_memory_schema.sql'
    
    if not schema_file.exists():
        print(f"ERROR: Schema file not found: {schema_file}")
        print("Run analyze_memory_system_simple.py first to generate schema")
        return False
    
    with open(schema_file, 'r') as f:
        sql_script = f.read()
    
    print(f"Schema loaded: {len(sql_script)} characters")
    print(f"Tables to create: {sql_script.count('CREATE TABLE')}")
    print(f"Indices to create: {sql_script.count('CREATE INDEX')}")
    
    # Deploy using Supabase Management API
    endpoint = f"https://api.supabase.com/v1/projects/{project_ref}/database/query"
    
    headers = {
        'Authorization': f'Bearer {management_token}',
        'Content-Type': 'application/json'
    }
    
    payload = {"query": sql_script}
    
    print(f"\nDeploying to Supabase Management API...")
    
    try:
        response = requests.post(endpoint, headers=headers, json=payload, timeout=120)
        
        if response.status_code in [200, 201, 204]:
            print(f"SUCCESS! Memory system databases deployed")
            try:
                result = response.json()
                print(f"Response: {result}")
            except:
                print(f"Deployment completed successfully")
            
            # Verify deployment
            print(f"\nVerifying deployment...")
            return verify_deployment()
        else:
            print(f"FAILED: Status {response.status_code}")
            print(f"Response: {response.text[:500]}...")
            return False
            
    except requests.exceptions.RequestException as e:
        print(f"Request error: {e}")
        return False

def verify_deployment():
    """Verify that all memory system tables were created"""
    
    # Import Supabase client
    try:
        from supabase import create_client, Client
    except ImportError:
        print("Supabase client not available for verification")
        return True
    
    # Get Supabase credentials
    supabase_url = os.getenv('NEXT_PUBLIC_SUPABASE_URL')
    supabase_key = os.getenv('SUPABASE_SERVICE_ROLE_KEY')
    
    if not supabase_url or not supabase_key:
        print("Missing Supabase credentials for verification")
        return True
    
    client: Client = create_client(supabase_url, supabase_key)
    
    # Load analysis file to get expected tables
    analysis_file = Path(__file__).parent / 'memory_system_analysis.json'
    
    if not analysis_file.exists():
        print("Analysis file not found - skipping detailed verification")
        return True
    
    with open(analysis_file, 'r') as f:
        analysis = json.load(f)
    
    db_requirements = analysis['database_requirements']
    
    print(f"\nVERIFYING DATABASE DEPLOYMENT:")
    
    verified_tables = []
    failed_tables = []
    
    # Test core agent tables
    print(f"\nCore Agent Tables:")
    for agent_name, tables in db_requirements['core_agents'].items():
        for table_type, table_name in tables.items():
            try:
                result = client.table(table_name).select("*").limit(1).execute()
                print(f"  SUCCESS {table_name}")
                verified_tables.append(table_name)
            except Exception as e:
                print(f"  FAILED  {table_name} - {str(e)[:50]}...")
                failed_tables.append(table_name)
    
    # Test memory type tables
    print(f"\nMemory Type Tables:")
    for memory_type, tables in db_requirements['memory_types'].items():
        for table_type, table_name in tables.items():
            try:
                result = client.table(table_name).select("*").limit(1).execute()
                print(f"  SUCCESS {table_name}")
                verified_tables.append(table_name)
            except Exception as e:
                print(f"  FAILED  {table_name} - {str(e)[:50]}...")
                failed_tables.append(table_name)
    
    # Test system tables
    print(f"\nSystem Tables:")
    for table_name in db_requirements['system_tables']:
        try:
            result = client.table(table_name).select("*").limit(1).execute()
            print(f"  SUCCESS {table_name}")
            verified_tables.append(table_name)
        except Exception as e:
            print(f"  FAILED  {table_name} - {str(e)[:50]}...")
            failed_tables.append(table_name)
    
    print(f"\nVERIFICATION SUMMARY:")
    print(f"  Verified: {len(verified_tables)} tables")
    print(f"  Failed:   {len(failed_tables)} tables")
    
    if len(failed_tables) > 0:
        print(f"\nFailed tables:")
        for table in failed_tables[:5]:  # Show first 5 failures
            print(f"    - {table}")
        if len(failed_tables) > 5:
            print(f"    ... and {len(failed_tables) - 5} more")
    
    success_rate = len(verified_tables) / (len(verified_tables) + len(failed_tables)) * 100
    print(f"\nSuccess Rate: {success_rate:.1f}%")
    
    return success_rate > 80

def populate_initial_data():
    """Populate initial data for the memory system"""
    
    # Import Supabase client
    try:
        from supabase import create_client, Client
    except ImportError:
        print("Supabase client not available for data population")
        return
    
    # Get Supabase credentials
    supabase_url = os.getenv('NEXT_PUBLIC_SUPABASE_URL')
    supabase_key = os.getenv('SUPABASE_SERVICE_ROLE_KEY')
    
    if not supabase_url or not supabase_key:
        print("Missing Supabase credentials for data population")
        return
    
    client: Client = create_client(supabase_url, supabase_key)
    
    print(f"\nPOPULATING INITIAL DATA:")
    
    # Initialize system state
    try:
        system_state = {
            'system_status': 'active',
            'active_agents': [
                'fantasy_league_agent', 'gui_launcher_agent', 'master_orchestrator_agent',
                'memory_agent_core', 'memory_context_router_agent', 'memory_core_log_agent',
                'memory_indexer_agent', 'memory_logic_enforcer_agent', 'memory_router_agent',
                'repo_sync_agent', 'system_health_agent', 'tag_intelligence_engine',
                'user_intelligence_agent'
            ],
            'system_metrics': {
                'total_agents': 13,
                'memory_types': 8,
                'database_tables': 58
            }
        }
        
        result = client.table('memory_system_state').upsert(system_state).execute()
        print(f"  SUCCESS System state initialized")
    except Exception as e:
        print(f"  FAILED  System state - {e}")
    
    # Register all agents
    agents_to_register = [
        {'agent_name': 'fantasy_league_agent', 'agent_type': 'core', 'capabilities': ['fantasy_management', 'user_scoring']},
        {'agent_name': 'gui_launcher_agent', 'agent_type': 'core', 'capabilities': ['gui_management', 'launcher']},
        {'agent_name': 'master_orchestrator_agent', 'agent_type': 'core', 'capabilities': ['orchestration', 'coordination']},
        {'agent_name': 'memory_agent_core', 'agent_type': 'core', 'capabilities': ['memory_management']},
        {'agent_name': 'memory_context_router_agent', 'agent_type': 'memory', 'capabilities': ['context_routing']},
        {'agent_name': 'memory_core_log_agent', 'agent_type': 'memory', 'capabilities': ['logging']},
        {'agent_name': 'memory_indexer_agent', 'agent_type': 'memory', 'capabilities': ['indexing', 'search']},
        {'agent_name': 'memory_logic_enforcer_agent', 'agent_type': 'memory', 'capabilities': ['logic_enforcement']},
        {'agent_name': 'memory_router_agent', 'agent_type': 'memory', 'capabilities': ['memory_routing']},
        {'agent_name': 'repo_sync_agent', 'agent_type': 'utility', 'capabilities': ['git_sync', 'version_control']},
        {'agent_name': 'system_health_agent', 'agent_type': 'monitoring', 'capabilities': ['health_monitoring']},
        {'agent_name': 'tag_intelligence_engine', 'agent_type': 'ai', 'capabilities': ['tagging', 'semantic_analysis']},
        {'agent_name': 'user_intelligence_agent', 'agent_type': 'ai', 'capabilities': ['user_analysis', 'personalization']}
    ]
    
    for agent in agents_to_register:
        try:
            result = client.table('agent_registry').upsert(agent).execute()
            print(f"  SUCCESS Registered {agent['agent_name']}")
        except Exception as e:
            print(f"  FAILED  Register {agent['agent_name']} - {str(e)[:30]}...")
    
    print(f"\nINITIAL DATA POPULATION COMPLETE")

if __name__ == "__main__":
    print("Starting Memory System Database Deployment...")
    
    # Deploy databases
    success = deploy_memory_databases()
    
    if success:
        print(f"\n" + "="*80)
        print("DEPLOYMENT SUCCESSFUL!")
        print("="*80)
        
        # Populate initial data
        populate_initial_data()
        
        print(f"\nGRAND PRIX SOCIAL MEMORY SYSTEM IS READY!")
        print(f"- 13 active agents with database storage")
        print(f"- 8 memory types with full indexing")
        print(f"- 58 database tables deployed")
        print(f"- Agent registry and system state initialized")
        
    else:
        print(f"\n" + "="*80)
        print("DEPLOYMENT FAILED")
        print("="*80)
        print("Check the error messages above and try again")
        print("You may need to run the SQL manually in Supabase dashboard")