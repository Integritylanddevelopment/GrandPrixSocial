#!/usr/bin/env python3
"""
Grand Prix Social Repository Sync Agent Launcher
Copyright (c) 2025 Grand Prix Social. All rights reserved.

This launcher initializes and configures the repository sync agent for Grand Prix Social.
"""

import os
import json
import sys
import logging
import time
from pathlib import Path

# Add the current directory to Python path for imports
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from memory_integration import GrandPrixSyncAgent
from repo_sync_agent import RepoConfig

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('sync_launcher.log'),
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger('gps_sync_launcher')

class SyncAgentLauncher:
    """
    Launcher for Grand Prix Social Repository Sync Agent
    """
    
    def __init__(self):
        self.base_path = "D:\\ActiveProjects\\GrandPrixSocial"
        self.memory_path = os.path.join(self.base_path, "memory", "a_memory_core", "repo_sync_agent")
        self.agent = None
        
    def initialize_agent(self) -> bool:
        """
        Initialize the sync agent with Grand Prix Social configuration
        """
        try:
            logger.info("Initializing Grand Prix Social Sync Agent...")
            
            # Create agent instance
            self.agent = GrandPrixSyncAgent(self.memory_path)
            
            # Verify configuration exists
            config_path = os.path.join(self.memory_path, "repo_sync_config.json")
            if not os.path.exists(config_path):
                logger.warning("Configuration file not found, creating default configuration...")
                self._create_default_config()
            
            # Test agent functionality
            if self._test_agent():
                logger.info("✅ Sync agent initialized successfully")
                return True
            else:
                logger.error("❌ Agent initialization failed")
                return False
                
        except Exception as e:
            logger.error(f"Error initializing sync agent: {e}")
            return False
    
    def _create_default_config(self):
        """
        Create default configuration for Grand Prix Social
        """
        try:
            config = {
                "grandprix_main": {
                    "project_id": "grandprix_main",
                    "name": "Grand Prix Social",
                    "local_path": self.base_path,
                    "remote_url": "https://github.com/Integritylanddevelopment/GrandPrixSocial-zf.git",
                    "branch": "main",
                    "sync_enabled": True,
                    "last_sync": None,
                    "credentials": None,
                    "auto_sync_interval": 1800
                }
            }
            
            config_path = os.path.join(self.memory_path, "repo_sync_config.json")
            with open(config_path, 'w') as f:
                json.dump(config, f, indent=2)
            
            logger.info("Default configuration created")
            
        except Exception as e:
            logger.error(f"Error creating default config: {e}")
    
    def _test_agent(self) -> bool:
        """
        Test basic agent functionality
        """
        try:
            # Test repository status
            status = self.agent.get_repo_status("grandprix_main")
            if "error" in status:
                logger.warning(f"Repository status check returned: {status}")
            
            # Test memory integration
            memory_status = self.agent.get_memory_status()
            if "error" in memory_status:
                logger.warning(f"Memory status check returned: {memory_status}")
                return False
            
            logger.info("Agent functionality test passed")
            return True
            
        except Exception as e:
            logger.error(f"Agent test failed: {e}")
            return False
    
    def setup_auto_sync(self) -> bool:
        """
        Set up automatic synchronization
        """
        try:
            logger.info("Setting up auto-sync...")
            
            # Create auto-sync script
            auto_sync_script = """#!/usr/bin/env python3
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from memory_integration import GrandPrixSyncAgent
import json

def main():
    agent = GrandPrixSyncAgent()
    result = agent.auto_sync_with_memory()
    print(json.dumps(result, indent=2, default=str))

if __name__ == '__main__':
    main()
"""
            
            script_path = os.path.join(self.memory_path, "auto_sync.py")
            with open(script_path, 'w') as f:
                f.write(auto_sync_script)
            
            # Create batch file for Windows
            batch_content = f"""@echo off
cd /d "{self.memory_path}"
python auto_sync.py
"""
            
            batch_path = os.path.join(self.memory_path, "auto_sync.bat")
            with open(batch_path, 'w') as f:
                f.write(batch_content)
            
            logger.info("✅ Auto-sync setup completed")
            return True
            
        except Exception as e:
            logger.error(f"Error setting up auto-sync: {e}")
            return False
    
    def register_with_memory_orchestrator(self) -> bool:
        """
        Register the sync agent with the memory orchestrator
        """
        try:
            logger.info("Registering with memory orchestrator...")
            
            # Create agent manifest for orchestrator
            agent_manifest = {
                "agent_id": "repo_sync_agent",
                "name": "Repository Sync Agent",
                "type": "core_system",
                "status": "active",
                "capabilities": [
                    "bidirectional_sync",
                    "conflict_resolution",
                    "cherry_pick_download",
                    "auto_sync",
                    "memory_integration"
                ],
                "endpoints": {
                    "sync": "memory_integration.py",
                    "status": "memory_integration.py status",
                    "auto_sync": "auto_sync.py"
                },
                "memory_integration": True,
                "priority": "high",
                "initialized": time.time()
            }
            
            # Save manifest
            manifest_path = os.path.join(self.memory_path, "agent_manifest.json")
            with open(manifest_path, 'w') as f:
                json.dump(agent_manifest, f, indent=2)
            
            # Notify orchestrator (if exists)
            orchestrator_path = os.path.join(
                self.base_path, "memory", "a_memory_core", 
                "memory_orchestrator_agent", "orchestrator_inbox.json"
            )
            
            if os.path.exists(orchestrator_path):
                try:
                    with open(orchestrator_path, 'r') as f:
                        inbox = json.load(f)
                except (json.JSONDecodeError, FileNotFoundError):
                    inbox = []
                
                registration_message = {
                    "from": "repo_sync_agent",
                    "type": "agent_registration",
                    "timestamp": time.time(),
                    "data": agent_manifest,
                    "priority": "high"
                }
                
                inbox.append(registration_message)
                
                with open(orchestrator_path, 'w') as f:
                    json.dump(inbox, f, indent=2)
                
                logger.info("✅ Registered with memory orchestrator")
            else:
                logger.warning("Memory orchestrator not found, registration skipped")
            
            return True
            
        except Exception as e:
            logger.error(f"Error registering with orchestrator: {e}")
            return False
    
    def create_activation_status(self):
        """
        Create activation status file for memory system tracking
        """
        try:
            status_file = {
                "agent_name": "repo_sync_agent",
                "status": "READY",
                "initialization_time": time.time(),
                "last_sync": None,
                "auto_sync_enabled": True,
                "memory_integration": True,
                "health": "healthy",
                "configuration": {
                    "grandprix_main": "configured",
                    "memory_sync": "enabled",
                    "conflict_resolution": "automatic"
                }
            }
            
            status_path = os.path.join(self.memory_path, "agent_status.json")
            with open(status_path, 'w') as f:
                json.dump(status_file, f, indent=2)
            
            logger.info("✅ Agent activation status created")
            
        except Exception as e:
            logger.error(f"Error creating activation status: {e}")
    
    def launch(self) -> bool:
        """
        Complete launch sequence for the sync agent
        """
        logger.info("🏁 Starting Grand Prix Social Repository Sync Agent Launch Sequence...")
        
        steps = [
            ("Initialize Agent", self.initialize_agent),
            ("Setup Auto-Sync", self.setup_auto_sync),
            ("Register with Orchestrator", self.register_with_memory_orchestrator),
            ("Create Activation Status", self.create_activation_status)
        ]
        
        for step_name, step_func in steps:
            logger.info(f"📋 {step_name}...")
            try:
                if step_func():
                    logger.info(f"✅ {step_name} completed successfully")
                else:
                    logger.error(f"❌ {step_name} failed")
                    return False
            except Exception as e:
                logger.error(f"❌ {step_name} failed with error: {e}")
                return False
        
        logger.info("🎉 Grand Prix Social Repository Sync Agent launched successfully!")
        logger.info("🔄 Agent is ready for bidirectional synchronization")
        
        return True

def main():
    """
    Main entry point for sync agent launcher
    """
    launcher = SyncAgentLauncher()
    
    if launcher.launch():
        print("\\n✅ Repository Sync Agent is now active and integrated with Grand Prix Social memory system")
        print("\\n📋 Available commands:")
        print("  - python memory_integration.py auto-sync")
        print("  - python memory_integration.py manual-sync --message 'Your message'")
        print("  - python memory_integration.py status")
        print("  - python auto_sync.py (for scheduled runs)")
        sys.exit(0)
    else:
        print("\\n❌ Failed to launch Repository Sync Agent")
        sys.exit(1)

if __name__ == '__main__':
    main()