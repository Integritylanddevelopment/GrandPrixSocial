#!/usr/bin/env python3
"""
Environment-based configuration loader for repo sync agent
Loads Vercel token and other credentials from environment files
"""

import os
import json
from pathlib import Path
from typing import Dict, Optional

def load_env_file(env_path: str) -> Dict[str, str]:
    """Load environment variables from .env file"""
    env_vars = {}
    
    if os.path.exists(env_path):
        with open(env_path, 'r') as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith('#') and '=' in line:
                    key, value = line.split('=', 1)
                    # Remove quotes if present
                    value = value.strip('"').strip("'")
                    env_vars[key] = value
    
    return env_vars

def update_repo_config_from_env(project_root: str = None) -> bool:
    """Update repo sync config with environment variables"""
    try:
        if not project_root:
            project_root = Path(__file__).parent.parent.parent.parent
        
        # Load environment variables from .env.local
        env_local_path = os.path.join(project_root, '.env.local')
        env_vars = load_env_file(env_local_path)
        
        # Get Vercel token from environment
        vercel_token = env_vars.get('VERCEL_TOKEN')
        
        if not vercel_token:
            print("⚠️  VERCEL_TOKEN not found in .env.local")
            return False
        
        # Load existing config
        config_path = os.path.join(os.path.dirname(__file__), 'repo_sync_config.json')
        
        with open(config_path, 'r') as f:
            config = json.load(f)
        
        # Update with environment token
        if 'grandprix_main' in config:
            config['grandprix_main']['vercel_token'] = vercel_token
            print(f"✅ Updated config with Vercel token from environment")
        
        # Save updated config
        with open(config_path, 'w') as f:
            json.dump(config, f, indent=2)
        
        print(f"✅ Repo sync config updated with environment variables")
        return True
        
    except Exception as e:
        print(f"❌ Error updating config from environment: {e}")
        return False

if __name__ == '__main__':
    update_repo_config_from_env()