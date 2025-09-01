#!/usr/bin/env python3
"""
Trigger orchestrator to restart fixed agents
"""

import json
import os
import time

def trigger_restart():
    """Force orchestrator to retry starting fixed agents"""
    
    # Clear the cached status to force retry
    status_file = "memory/a_memory_core/master_orchestrator_agent/orchestrator_status.json"
    
    if os.path.exists(status_file):
        print("Clearing cached agent status to force retry...")
        
        # Load current status
        with open(status_file, 'r') as f:
            status = json.load(f)
        
        # Reset status for fixed agents to trigger retry
        fixed_agents = ["memory_agent_router_agent", "repo_sync_agent"]
        
        for agent in fixed_agents:
            if agent in status["health"]:
                print(f"  Resetting status for {agent}")
                # Set to a state that will trigger retry
                status["health"][agent]["status"] = "retry_needed"
                status["health"][agent]["last_check"] = "2025-08-31T14:00:00.000000"  # Old timestamp
                status["health"][agent]["exit_code"] = 0
        
        # Save updated status
        with open(status_file, 'w') as f:
            json.dump(status, f, indent=2)
        
        print("Status reset complete. The orchestrator should retry these agents on next cycle.")
    else:
        print(f"Status file not found: {status_file}")

def main():
    print("Agent Restart Trigger")
    print("=" * 30)
    trigger_restart()
    
    print("\nTo manually test the fixed agents:")
    print("1. memory_agent_router_agent: python memory/a_memory_core/memory_agent_router_agent/memory_agent_router_agent.py")
    print("2. repo_sync_agent: python memory/a_memory_core/repo_sync_agent/repo_sync_agent.py")

if __name__ == "__main__":
    main()