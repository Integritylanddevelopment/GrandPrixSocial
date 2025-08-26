#!/usr/bin/env python3
"""
Quick deployment check script for Grand Prix Social
Checks Vercel deployment status and reports failures to Claude
"""

import os
import sys
import json
from repo_sync_agent import RepoSyncAgent

def main():
    """Check deployment and report any failures"""
    
    # Initialize sync agent
    script_dir = os.path.dirname(os.path.abspath(__file__))
    config_path = os.path.join(script_dir, "repo_sync_config.json")
    
    agent = RepoSyncAgent(config_path)
    
    # Check Grand Prix Social deployment
    project_id = "grandprix_main"
    
    print("🔍 Checking Grand Prix Social deployment status...")
    
    # Get deployment summary
    summary = agent.get_deployment_failure_summary(project_id)
    print(summary)
    
    # Also get detailed status
    config = agent.configs.get(project_id)
    if config:
        deployment_status = agent.check_vercel_deployment(config)
        
        if deployment_status.get('deployment'):
            deployment = deployment_status['deployment']
            state = deployment.get('state', 'UNKNOWN')
            
            if state == 'READY':
                print(f"✅ Deployment successful: {deployment.get('url')}")
                return 0
            elif state in ['BUILDING', 'QUEUED']:
                print(f"⏳ Deployment in progress: {state}")
                return 0
            elif state in ['ERROR', 'FAILED']:
                print(f"❌ Deployment failed: {state}")
                print(f"🔗 Deployment URL: {deployment.get('url', 'N/A')}")
                return 1
            else:
                print(f"⚠️ Unknown deployment state: {state}")
                return 0
        else:
            print("⚠️ No deployment information available")
            return 0
    else:
        print("❌ Project configuration not found")
        return 1

if __name__ == "__main__":
    sys.exit(main())