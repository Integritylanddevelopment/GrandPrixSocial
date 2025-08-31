#!/usr/bin/env python3
"""
Fix the generated schema by removing invalid references
"""
from pathlib import Path

def fix_schema():
    """Fix the generated schema file"""
    
    schema_file = Path(__file__).parent / 'grand_prix_memory_schema.sql'
    
    # Read current schema
    with open(schema_file, 'r') as f:
        schema = f.read()
    
    # Fix invalid table references in indices
    fixed_schema = schema.replace(
        'CREATE INDEX IF NOT EXISTS idx_memory_core_importance ON memory_core_storage(importance_score DESC);',
        '-- CREATE INDEX IF NOT EXISTS idx_memory_core_importance ON memory_core_storage(importance_score DESC); -- REMOVED: Table not found'
    ).replace(
        'CREATE INDEX IF NOT EXISTS idx_memory_core_tags ON memory_core_storage USING gin(tags);',
        '-- CREATE INDEX IF NOT EXISTS idx_memory_core_tags ON memory_core_storage USING gin(tags); -- REMOVED: Table not found'
    ).replace(
        'CREATE INDEX IF NOT EXISTS idx_memory_core_access ON memory_core_storage(last_accessed DESC);',
        '-- CREATE INDEX IF NOT EXISTS idx_memory_core_access ON memory_core_storage(last_accessed DESC); -- REMOVED: Table not found'
    )
    
    # Add valid indices for existing tables
    valid_indices = """
-- Valid indices for existing tables
CREATE INDEX IF NOT EXISTS idx_agent_registry_status ON agent_registry(status);
CREATE INDEX IF NOT EXISTS idx_memory_system_state_status ON memory_system_state(system_status);
CREATE INDEX IF NOT EXISTS idx_f1_data_category ON f1_specific_data(data_category);
"""
    
    fixed_schema = fixed_schema.replace(
        'CREATE INDEX IF NOT EXISTS idx_f1_data_season ON f1_specific_data(season);',
        'CREATE INDEX IF NOT EXISTS idx_f1_data_season ON f1_specific_data(season);' + valid_indices
    )
    
    # Write fixed schema
    with open(schema_file, 'w') as f:
        f.write(fixed_schema)
    
    print("Schema fixed!")
    print(f"Tables: {fixed_schema.count('CREATE TABLE')}")
    print(f"Indices: {fixed_schema.count('CREATE INDEX')}")

if __name__ == "__main__":
    fix_schema()