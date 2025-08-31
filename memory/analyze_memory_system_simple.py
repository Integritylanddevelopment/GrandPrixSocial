#!/usr/bin/env python3
"""
Analyze Grand Prix Social Memory System Structure
Identify all agents and their database requirements
"""
import os
import json
from pathlib import Path
from typing import Dict, List, Any

def analyze_memory_system():
    """Analyze the complete memory system structure"""
    
    memory_root = Path(__file__).parent
    
    print("="*80)
    print("GRAND PRIX SOCIAL MEMORY SYSTEM ANALYSIS")
    print("="*80)
    
    # Memory type directories based on CommandCore structure
    memory_types = {
        'a_memory_core': 'Core orchestration and agent management',
        'b_long_term_memory': 'Permanent user profiles and historical data',
        'c_short_term_memory': 'Recent interactions and session data',
        'd_working_memory': 'Active development and temporary tasks',
        'e_episodic': 'Event history and user interaction episodes',
        'e_procedural': 'F1 rules, race procedures, and workflows',
        'f_semantic': 'F1 knowledge base and definitions',
        'g_episodic': 'Additional episodic memory (duplicate?)'
    }
    
    print("\nMEMORY TYPE STRUCTURE:")
    for memory_type, description in memory_types.items():
        type_path = memory_root / memory_type
        if type_path.exists():
            print(f"  SUCCESS {memory_type:<20} - {description}")
        else:
            print(f"  MISSING {memory_type:<20} - {description}")
    
    # Analyze a_memory_core agents
    print(f"\nMEMORY CORE AGENTS:")
    core_agents = {}
    
    core_path = memory_root / 'a_memory_core'
    if core_path.exists():
        for agent_dir in core_path.iterdir():
            if agent_dir.is_dir() and not agent_dir.name.startswith('.'):
                agent_name = agent_dir.name
                
                # Look for agent files
                agent_files = {
                    'main_script': None,
                    'state_file': None,
                    'manifest': None,
                    'metadata': None,
                    'config': None,
                    'logic': None
                }
                
                for file in agent_dir.iterdir():
                    if file.is_file():
                        filename = file.name.lower()
                        if filename.endswith('.py') and agent_name.replace('_agent', '') in filename:
                            agent_files['main_script'] = file.name
                        elif 'state' in filename and filename.endswith('.json'):
                            agent_files['state_file'] = file.name
                        elif 'manifest' in filename:
                            agent_files['manifest'] = file.name
                        elif 'metadata' in filename:
                            agent_files['metadata'] = file.name
                        elif 'config' in filename:
                            agent_files['config'] = file.name
                        elif 'logic' in filename:
                            agent_files['logic'] = file.name
                
                core_agents[agent_name] = {
                    'path': str(agent_dir),
                    'files': agent_files,
                    'active': agent_files['main_script'] is not None
                }
                
                status = "ACTIVE" if agent_files['main_script'] else "INACTIVE"
                print(f"    {status:>8} {agent_name}")
                if agent_files['main_script']:
                    print(f"             Script: {agent_files['main_script']}")
                if agent_files['state_file']:
                    print(f"             State:  {agent_files['state_file']}")
    
    # Analyze other memory directories
    print(f"\nOTHER MEMORY DIRECTORIES:")
    for memory_type in ['b_long_term_memory', 'c_short_term_memory', 'd_working_memory', 'e_episodic', 'e_procedural', 'f_semantic', 'g_episodic']:
        type_path = memory_root / memory_type
        if type_path.exists():
            file_count = len(list(type_path.glob('**/*')))
            print(f"    SUCCESS {memory_type:<20} - {file_count} items")
        else:
            print(f"    MISSING {memory_type:<20} - Directory missing")
    
    # Generate database requirements
    print(f"\nDATABASE REQUIREMENTS ANALYSIS:")
    
    database_requirements = {
        'core_agents': {},
        'memory_types': {},
        'system_tables': []
    }
    
    # Core agent requirements
    for agent_name, agent_info in core_agents.items():
        if agent_info['active']:
            # Each agent needs state storage, metrics, and coordination
            database_requirements['core_agents'][agent_name] = {
                'state_table': f"{agent_name}_state",
                'metrics_table': f"{agent_name}_metrics", 
                'logs_table': f"{agent_name}_logs",
                'coordination_table': f"{agent_name}_coordination"
            }
    
    # Memory type requirements  
    for memory_type in memory_types.keys():
        clean_name = memory_type.replace('_memory', '').replace('a_', '').replace('b_', '').replace('c_', '').replace('d_', '').replace('e_', '').replace('f_', '').replace('g_', '')
        database_requirements['memory_types'][memory_type] = {
            'storage_table': f"{clean_name}_memory_storage",
            'index_table': f"{clean_name}_memory_index",
            'metadata_table': f"{clean_name}_memory_metadata"
        }
    
    # System-wide tables
    database_requirements['system_tables'] = [
        'memory_system_state',
        'agent_registry',
        'memory_promotion_log',
        'system_metrics',
        'coordination_events',
        'f1_specific_data',
        'user_profiles',
        'race_data',
        'fantasy_data'
    ]
    
    print(f"    Core Agents: {len(database_requirements['core_agents'])} agents")
    print(f"    Memory Types: {len(database_requirements['memory_types'])} types") 
    print(f"    System Tables: {len(database_requirements['system_tables'])} tables")
    
    # Save analysis results
    analysis_file = memory_root / 'memory_system_analysis.json'
    with open(analysis_file, 'w') as f:
        json.dump({
            'memory_types': memory_types,
            'core_agents': core_agents,
            'database_requirements': database_requirements,
            'analysis_timestamp': '2025-08-30'
        }, f, indent=2)
    
    print(f"\nAnalysis saved to: {analysis_file}")
    
    return database_requirements

def generate_database_schema(database_requirements):
    """Generate SQL schema for all memory system tables"""
    
    print(f"\nGENERATING DATABASE SCHEMA...")
    
    sql_commands = []
    
    # Core agent tables
    for agent_name, tables in database_requirements['core_agents'].items():
        
        # State table
        sql_commands.append(f"""
-- {agent_name.replace('_', ' ').title()} State Table
CREATE TABLE IF NOT EXISTS {tables['state_table']} (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_name TEXT NOT NULL,
    status TEXT DEFAULT 'active',
    current_state JSONB DEFAULT '{{}}',
    last_heartbeat TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    current_task TEXT,
    processed_items INTEGER DEFAULT 0,
    error_count INTEGER DEFAULT 0,
    last_error TEXT,
    configuration JSONB DEFAULT '{{}}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);""")
        
        # Metrics table
        sql_commands.append(f"""
-- {agent_name.replace('_', ' ').title()} Metrics Table
CREATE TABLE IF NOT EXISTS {tables['metrics_table']} (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_name TEXT NOT NULL,
    metric_type TEXT NOT NULL,
    metric_value FLOAT NOT NULL,
    metric_metadata JSONB DEFAULT '{{}}',
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);""")
        
        # Logs table
        sql_commands.append(f"""
-- {agent_name.replace('_', ' ').title()} Logs Table
CREATE TABLE IF NOT EXISTS {tables['logs_table']} (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_name TEXT NOT NULL,
    log_level TEXT DEFAULT 'INFO',
    message TEXT NOT NULL,
    context JSONB DEFAULT '{{}}',
    logged_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);""")
    
    # Memory type tables
    for memory_type, tables in database_requirements['memory_types'].items():
        
        # Storage table
        sql_commands.append(f"""
-- {memory_type.replace('_', ' ').title()} Storage Table
CREATE TABLE IF NOT EXISTS {tables['storage_table']} (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    memory_type TEXT DEFAULT '{memory_type}',
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    content_type TEXT DEFAULT 'json',
    importance_score INTEGER DEFAULT 5 CHECK (importance_score BETWEEN 1 AND 10),
    access_count INTEGER DEFAULT 0,
    last_accessed TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    tags TEXT[] DEFAULT '{{}}',
    metadata JSONB DEFAULT '{{}}',
    source_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT NULL
);""")
        
        # Index table
        sql_commands.append(f"""
-- {memory_type.replace('_', ' ').title()} Index Table  
CREATE TABLE IF NOT EXISTS {tables['index_table']} (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    memory_id UUID REFERENCES {tables['storage_table']}(id),
    index_type TEXT NOT NULL,
    index_key TEXT NOT NULL,
    index_value TEXT NOT NULL,
    weight FLOAT DEFAULT 1.0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);""")
    
    # System tables
    sql_commands.append("""
-- Memory System State Table
CREATE TABLE IF NOT EXISTS memory_system_state (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    system_status TEXT DEFAULT 'active',
    active_agents TEXT[] DEFAULT '{}',
    system_metrics JSONB DEFAULT '{}',
    last_heartbeat TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);""")
    
    sql_commands.append("""
-- Agent Registry Table
CREATE TABLE IF NOT EXISTS agent_registry (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_name TEXT NOT NULL UNIQUE,
    agent_type TEXT NOT NULL,
    status TEXT DEFAULT 'registered',
    capabilities TEXT[] DEFAULT '{}',
    dependencies TEXT[] DEFAULT '{}',
    metadata JSONB DEFAULT '{}',
    registered_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_seen TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);""")
    
    sql_commands.append("""
-- F1 Specific Data Table
CREATE TABLE IF NOT EXISTS f1_specific_data (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    data_type TEXT NOT NULL,
    data_category TEXT NOT NULL,
    title TEXT NOT NULL,
    content JSONB NOT NULL,
    season INTEGER,
    race_id TEXT,
    driver_id TEXT,
    team_id TEXT,
    source TEXT,
    confidence_score FLOAT DEFAULT 1.0,
    tags TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);""")
    
    # Generate indices
    indices = [
        "CREATE INDEX IF NOT EXISTS idx_memory_core_importance ON memory_core_storage(importance_score DESC);",
        "CREATE INDEX IF NOT EXISTS idx_memory_core_tags ON memory_core_storage USING gin(tags);",
        "CREATE INDEX IF NOT EXISTS idx_memory_core_access ON memory_core_storage(last_accessed DESC);",
        "CREATE INDEX IF NOT EXISTS idx_agent_registry_name ON agent_registry(agent_name);",
        "CREATE INDEX IF NOT EXISTS idx_f1_data_type ON f1_specific_data(data_type);",
        "CREATE INDEX IF NOT EXISTS idx_f1_data_season ON f1_specific_data(season);",
    ]
    
    # Combine all SQL
    full_schema = "-- GRAND PRIX SOCIAL MEMORY SYSTEM DATABASE SCHEMA\n"
    full_schema += "-- Generated for CommandCore Memory Architecture\n\n"
    full_schema += "-- Enable necessary extensions\n"
    full_schema += "CREATE EXTENSION IF NOT EXISTS \"uuid-ossp\";\n"
    full_schema += "CREATE EXTENSION IF NOT EXISTS vector;\n\n"
    full_schema += "\n".join(sql_commands)
    full_schema += "\n\n-- Performance indices\n"
    full_schema += "\n".join(indices)
    
    return full_schema

if __name__ == "__main__":
    print("Starting Memory System Analysis...")
    
    # Analyze the system
    db_requirements = analyze_memory_system()
    
    # Generate schema
    schema = generate_database_schema(db_requirements)
    
    # Save schema
    schema_file = Path(__file__).parent / 'grand_prix_memory_schema.sql'
    with open(schema_file, 'w') as f:
        f.write(schema)
    
    print(f"\nDatabase schema generated: {schema_file}")
    print(f"Total tables to create: {schema.count('CREATE TABLE')}")
    print(f"Total indices to create: {schema.count('CREATE INDEX')}")
    
    print(f"\nNext steps:")
    print(f"   1. Review the generated schema file")
    print(f"   2. Run the deployment script to create all tables")
    print(f"   3. Test agent database connections")