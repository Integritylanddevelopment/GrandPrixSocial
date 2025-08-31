#!/usr/bin/env python3
"""
Complete Missing Tables for Grand Prix Social Memory System
Creates the coordination, metadata, and system tables that were missing
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

def create_missing_tables():
    """Create all missing tables for complete memory system"""
    
    # Get credentials
    management_token = os.getenv('SUPABASE_MANAGEMENT_TOKEN')
    project_ref = "eeyboymoyvrgsbmnezag"
    
    if not management_token:
        print("Missing SUPABASE_MANAGEMENT_TOKEN in .env.local")
        return False
    
    print("="*80)
    print("COMPLETING MISSING MEMORY SYSTEM TABLES")
    print("="*80)
    
    # Generate SQL for missing tables
    missing_tables_sql = generate_missing_tables_sql()
    
    print(f"Missing tables SQL: {len(missing_tables_sql)} characters")
    print(f"Tables to create: {missing_tables_sql.count('CREATE TABLE')}")
    
    # Deploy missing tables
    endpoint = f"https://api.supabase.com/v1/projects/{project_ref}/database/query"
    
    headers = {
        'Authorization': f'Bearer {management_token}',
        'Content-Type': 'application/json'
    }
    
    payload = {"query": missing_tables_sql}
    
    print(f"\nDeploying missing tables...")
    
    try:
        response = requests.post(endpoint, headers=headers, json=payload, timeout=60)
        
        if response.status_code in [200, 201, 204]:
            print(f"SUCCESS! Missing tables created")
            return True
        else:
            print(f"FAILED: Status {response.status_code}")
            print(f"Response: {response.text[:500]}...")
            return False
            
    except requests.exceptions.RequestException as e:
        print(f"Request error: {e}")
        return False

def generate_missing_tables_sql():
    """Generate SQL for all missing tables"""
    
    sql_parts = []
    
    # Agent coordination tables (missing for all 13 agents)
    agents = [
        'fantasy_league_agent', 'gui_launcher_agent', 'master_orchestrator_agent',
        'memory_agent_core', 'memory_context_router_agent', 'memory_core_log_agent',
        'memory_indexer_agent', 'memory_logic_enforcer_agent', 'memory_router_agent',
        'repo_sync_agent', 'system_health_agent', 'tag_intelligence_engine',
        'user_intelligence_agent'
    ]
    
    for agent in agents:
        sql_parts.append(f"""
-- {agent.replace('_', ' ').title()} Coordination Table
CREATE TABLE IF NOT EXISTS {agent}_coordination (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_name TEXT NOT NULL DEFAULT '{agent}',
    coordination_type TEXT NOT NULL,
    target_agent TEXT NOT NULL,
    message JSONB NOT NULL,
    status TEXT DEFAULT 'pending',
    priority INTEGER DEFAULT 5,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    processed_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
    response JSONB DEFAULT NULL
);""")
    
    # Memory type metadata tables (missing for all 8 memory types) 
    memory_types = [
        ('core', 'a_memory_core'),
        ('lonterm', 'b_long_term_memory'), 
        ('short_term', 'c_short_term_memory'),
        ('working', 'd_working_memory'),
        ('episodic', 'e_episodic'),
        ('procedural', 'e_procedural'),
        ('semantic', 'f_semantic'),
        ('episodic', 'g_episodic')  # Duplicate name but different type
    ]
    
    for clean_name, full_name in memory_types:
        sql_parts.append(f"""
-- {clean_name.title()} Memory Metadata Table
CREATE TABLE IF NOT EXISTS {clean_name}_memory_metadata (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    memory_id UUID NOT NULL,
    metadata_type TEXT NOT NULL,
    metadata_key TEXT NOT NULL,
    metadata_value JSONB NOT NULL,
    confidence_score FLOAT DEFAULT 1.0,
    source_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);""")
    
    # Missing system tables
    sql_parts.extend([
        """
-- Memory Promotion Log Table
CREATE TABLE IF NOT EXISTS memory_promotion_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_memory_type TEXT NOT NULL,
    target_memory_type TEXT NOT NULL,
    memory_id UUID NOT NULL,
    promotion_reason TEXT NOT NULL,
    promotion_criteria JSONB DEFAULT '{}',
    promoting_agent TEXT,
    promoted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    success BOOLEAN DEFAULT true,
    notes TEXT
);""",
        
        """
-- System Metrics Table
CREATE TABLE IF NOT EXISTS system_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    metric_category TEXT NOT NULL,
    metric_name TEXT NOT NULL,
    metric_value FLOAT NOT NULL,
    metric_unit TEXT DEFAULT 'count',
    metadata JSONB DEFAULT '{}',
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    recorded_by TEXT
);""",
        
        """
-- Coordination Events Table
CREATE TABLE IF NOT EXISTS coordination_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_type TEXT NOT NULL,
    source_agent TEXT NOT NULL,
    target_agent TEXT DEFAULT NULL,
    event_data JSONB NOT NULL,
    event_status TEXT DEFAULT 'active',
    priority INTEGER DEFAULT 5,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    processed_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
    result JSONB DEFAULT NULL
);""",
        
        """
-- User Profiles Table
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL UNIQUE,
    profile_data JSONB NOT NULL,
    preferences JSONB DEFAULT '{}',
    f1_interests JSONB DEFAULT '{}',
    fantasy_stats JSONB DEFAULT '{}',
    interaction_history JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_active TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);""",
        
        """
-- Race Data Table
CREATE TABLE IF NOT EXISTS race_data (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    race_id TEXT NOT NULL,
    season INTEGER NOT NULL,
    race_name TEXT NOT NULL,
    circuit_name TEXT NOT NULL,
    race_date DATE NOT NULL,
    race_results JSONB DEFAULT '{}',
    qualifying_results JSONB DEFAULT '{}',
    practice_results JSONB DEFAULT '{}',
    weather_data JSONB DEFAULT '{}',
    race_statistics JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);""",
        
        """
-- Fantasy Data Table  
CREATE TABLE IF NOT EXISTS fantasy_data (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL,
    fantasy_type TEXT NOT NULL,
    season INTEGER NOT NULL,
    team_data JSONB NOT NULL,
    scoring_data JSONB DEFAULT '{}',
    performance_metrics JSONB DEFAULT '{}',
    league_info JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);"""
    ])
    
    # Add indices for the new tables
    indices = [
        "CREATE INDEX IF NOT EXISTS idx_coordination_agent ON fantasy_league_agent_coordination(agent_name);",
        "CREATE INDEX IF NOT EXISTS idx_coordination_status ON fantasy_league_agent_coordination(status);",
        "CREATE INDEX IF NOT EXISTS idx_metadata_memory_id ON core_memory_metadata(memory_id);",
        "CREATE INDEX IF NOT EXISTS idx_promotion_log_date ON memory_promotion_log(promoted_at DESC);",
        "CREATE INDEX IF NOT EXISTS idx_system_metrics_category ON system_metrics(metric_category);",
        "CREATE INDEX IF NOT EXISTS idx_coordination_events_type ON coordination_events(event_type);",
        "CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);",
        "CREATE INDEX IF NOT EXISTS idx_race_data_season ON race_data(season DESC);",
        "CREATE INDEX IF NOT EXISTS idx_fantasy_data_user ON fantasy_data(user_id);"
    ]
    
    # Combine all SQL
    full_sql = "\n".join(sql_parts)
    full_sql += "\n\n-- Indices for new tables\n" + "\n".join(indices)
    
    return full_sql

def final_verification():
    """Final verification of complete memory system deployment"""
    
    try:
        from supabase import create_client, Client
    except ImportError:
        print("Supabase client not available for final verification")
        return
    
    # Get Supabase credentials
    supabase_url = os.getenv('NEXT_PUBLIC_SUPABASE_URL')
    supabase_key = os.getenv('SUPABASE_SERVICE_ROLE_KEY')
    
    if not supabase_url or not supabase_key:
        print("Missing Supabase credentials for verification")
        return
    
    client: Client = create_client(supabase_url, supabase_key)
    
    print(f"\nFINAL VERIFICATION:")
    
    # Check critical tables
    critical_tables = [
        'memory_system_state',
        'agent_registry', 
        'f1_specific_data',
        'user_profiles',
        'race_data',
        'fantasy_data',
        'fantasy_league_agent_state',
        'memory_agent_core_state',
        'core_memory_storage',
        'lonterm_memory_storage'
    ]
    
    working_tables = 0
    
    for table in critical_tables:
        try:
            result = client.table(table).select("*").limit(1).execute()
            print(f"  SUCCESS {table}")
            working_tables += 1
        except Exception as e:
            print(f"  FAILED  {table} - {str(e)[:50]}...")
    
    print(f"\nCRITICAL TABLES: {working_tables}/{len(critical_tables)} working")
    
    if working_tables >= 8:  # At least 80% working
        print(f"\nGRAND PRIX SOCIAL MEMORY SYSTEM IS OPERATIONAL!")
        return True
    else:
        print(f"\nSystem needs more tables to be fully operational")
        return False

if __name__ == "__main__":
    print("Completing Missing Memory System Tables...")
    
    # Create missing tables
    success = create_missing_tables()
    
    if success:
        print(f"\n" + "="*80)
        print("MISSING TABLES CREATED SUCCESSFULLY!")
        print("="*80)
        
        # Final verification
        final_verification()
        
    else:
        print(f"\n" + "="*80)
        print("FAILED TO CREATE MISSING TABLES") 
        print("="*80)