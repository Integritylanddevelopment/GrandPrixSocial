#!/usr/bin/env python3
"""
Health check for the memory system Docker container
"""

import os
import sys
import json
import time
from pathlib import Path

def check_system_health() -> bool:
    """Check if the memory system is healthy"""
    try:
        memory_root = Path("/app/memory")
        
        # Check if essential directories exist
        essential_dirs = [
            "a_memory_core",
            "d_working_memory/active", 
            "f_semantic/knowledge",
            "e_procedural/protocols",
            "g_episodic/sessions"
        ]
        
        for dir_path in essential_dirs:
            if not (memory_root / dir_path).exists():
                print(f"FAIL: Missing directory {dir_path}")
                return False
        
        # Check if Python path is set correctly
        if memory_root not in [Path(p) for p in sys.path]:
            sys.path.insert(0, str(memory_root))
        
        # Try to import core components
        try:
            from a_memory_core.tag_intelligence_engine.tag_intelligence_engine import TagIntelligenceEngine
        except ImportError as e:
            print(f"FAIL: Cannot import TagIntelligenceEngine: {e}")
            return False
        
        try:
            from a_memory_core.memory_context_router_agent.memory_context_router_agent import MemoryContextRouterAgent
        except ImportError as e:
            print(f"FAIL: Cannot import MemoryContextRouterAgent: {e}")
            return False
        
        # Check if orchestrator state file exists and is valid
        orchestrator_state = memory_root / "a_memory_core/memory_orchestrator_agent/memory_orchestrator_agent_state.json"
        if orchestrator_state.exists():
            try:
                with open(orchestrator_state) as f:
                    state = json.load(f)
                if state.get("system_health") == "HEALTHY":
                    print("OK: System health check passed")
                    return True
            except Exception as e:
                print(f"WARN: Could not read orchestrator state: {e}")
        
        # Basic health - all checks passed
        print("OK: Basic health check passed")
        return True
        
    except Exception as e:
        print(f"FAIL: Health check exception: {e}")
        return False

if __name__ == "__main__":
    healthy = check_system_health()
    sys.exit(0 if healthy else 1)