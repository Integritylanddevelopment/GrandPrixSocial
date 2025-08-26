from typing import Dict, List, Any, Optional

# Auto-generated performance monitoring
import time
from functools import wraps

def monitor_performance(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        start_time = time.time()
        result = func(*args, **kwargs)
        end_time = time.time()
        print(f"{func.__name__} executed in {end_time - start_time:.4f} seconds")
        return result
    return wrapper
#!/usr/bin/env python3
"""
Memory Agent Core Launcher
Entry point script for starting the CommandCore memory system
"""

import sys
import os
import logging
from pathlib import Path

# Add project root to Python path
project_root = Path(__file__).parent.parent.parent.parent.absolute()
sys.path.insert(0, str(project_root))

def setup_logging():
    """Configure logging for the launcher."""
    log_format = '[%(asctime)s] [%(levelname)s] %(message)s'
    date_format = '%m-%d_%I-%M%p'
    
    logging.basicConfig(
        level=logging.INFO,
        format=log_format,
        datefmt=date_format,
        handlers=[
            logging.StreamHandler(sys.stdout),
            logging.FileHandler(
                Path(__file__).parent / 'memory_core_launcher.log',
                encoding='utf-8'
            )
        ]
    )

def main():
    """Main launcher function."""
    setup_logging()
    logger = logging.getLogger(__name__)
    
    logger.info("=" * 60)
    logger.info("CommandCore Memory Agent Core - Starting...")
    logger.info("=" * 60)
    
    try:
        # Import and start the memory agent core
        from memory.a_memory_core.memory_agent_core.memory_agent_core import main as core_main
        
        logger.info("Initializing Memory Agent Core...")
        core = core_main(auto_start=True)
        
        logger.info("Memory Agent Core initialized successfully")
        logger.info("Memory system is now live and operational")
        
        # Print system status
        registry = core.get_registry()
        active_agents = [name for name, meta in registry.items() if meta.get("status") == "active"]
        
        logger.info(f"Active Agents: {len(active_agents)}")
        for agent in active_agents:
            logger.info(f"  - {agent}")
        
        logger.info("=" * 60)
        logger.info("Memory system startup complete!")
        logger.info("=" * 60)
        
        return core
        
    except ImportError as e:
        logger.error(f"Failed to import memory core: {e}")
        logger.error("Please check your Python path and file structure")
        return None
    except Exception as e:
        logger.error(f"Unexpected error during startup: {e}")
        logger.exception("Full error details:")
        return None

if __name__ == "__main__":
    main()
