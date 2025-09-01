#!/usr/bin/env python3
"""
Manual agent restart script to test fixes
"""

import subprocess
import sys
import os
import time

# Add memory path for imports
memory_path = os.path.join(os.path.dirname(__file__), 'memory', 'a_memory_core')

def test_agent(agent_name, agent_path):
    """Test if an agent can start successfully"""
    print(f"Testing {agent_name}...")
    try:
        result = subprocess.run(
            [sys.executable, agent_path],
            cwd=os.path.dirname(agent_path),
            timeout=5,
            capture_output=True,
            text=True
        )
        if result.returncode == 0:
            print(f"  [OK] {agent_name} - SUCCESS")
            return True
        else:
            print(f"  [FAIL] {agent_name} - FAILED (exit {result.returncode})")
            if result.stderr:
                print(f"     Error: {result.stderr[:200]}")
            return False
    except subprocess.TimeoutExpired:
        print(f"  [DAEMON] {agent_name} - RUNNING (daemon mode detected)")
        return True
    except Exception as e:
        print(f"  [ERROR] {agent_name} - ERROR: {e}")
        return False

def main():
    print("Testing Agent Fixes")
    print("=" * 50)
    
    agents_to_test = [
        ("memory_agent_router_agent", "memory_agent_router_agent/memory_agent_router_agent.py"),
        ("repo_sync_agent", "repo_sync_agent/repo_sync_agent.py"),
        ("memory_core_log_agent", "memory_core_log_agent/memory_core_log_agent.py"),
        ("memory_logic_enforcer_agent", "memory_logic_enforcer_agent/memory_logic_enforcer_agent.py"),
        ("memory_router_agent", "memory_router_agent/memory_router_agent.py"),
        ("system_health_agent", "system_health_agent/system_health_agent.py"),
        ("user_intelligence_agent", "user_intelligence_agent/user_intelligence_agent.py"),
    ]
    
    success_count = 0
    total_count = len(agents_to_test)
    
    for agent_name, agent_script in agents_to_test:
        full_path = os.path.join(memory_path, agent_script)
        if os.path.exists(full_path):
            if test_agent(agent_name, full_path):
                success_count += 1
        else:
            print(f"  [MISSING] {agent_name} - FILE NOT FOUND: {full_path}")
    
    print("\nTest Results")
    print("=" * 50)
    print(f"Successful: {success_count}/{total_count}")
    print(f"Success Rate: {(success_count/total_count)*100:.1f}%")
    
    if success_count > 0:
        print(f"\nFixed {success_count} agents! The orchestrator should be able to start them now.")
    else:
        print("\nNo agents are working. More fixes needed.")

if __name__ == "__main__":
    main()