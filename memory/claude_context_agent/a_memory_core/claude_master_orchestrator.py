#!/usr/bin/env python3
"""
Claude Context Master Orchestrator
Manages all Claude-specific memory agents within the claude_context_agent directory
"""

import os
import sys
import json
import threading
import time
import subprocess
import asyncio
import queue
from datetime import datetime
from pathlib import Path
import logging
import glob

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class ClaudeMasterOrchestrator:
    """Master orchestrator for Claude context memory system"""
    
    def __init__(self):
        self.script_dir = Path(__file__).parent.parent  # claude_context_agent directory
        self.agent_name = "ClaudeMasterOrchestrator"
        
        # Agent management
        self.managed_agents = {}
        self.agent_processes = {}
        self.agent_health = {}
        self.command_queue = queue.Queue()
        self.response_queue = queue.Queue()
        
        # Claude-specific memory paths
        self.memory_core_path = self.script_dir / "a_memory_core"
        self.long_term_path = self.script_dir / "b_long_term_memory"
        self.short_term_path = self.script_dir / "c_short_term_memory"
        self.working_memory_path = self.script_dir / "d_working_memory"
        self.procedural_path = self.script_dir / "e_procedural"
        self.semantic_path = self.script_dir / "f_semantic"
        self.episodic_path = self.script_dir / "g_episodic"
        
        # State management
        self.state_file = self.script_dir / "claude_orchestrator_state.json"
        self.config_file = self.script_dir / "claude_orchestrator_config.json"
        
        self.load_configuration()
        self.discover_claude_agents()
        
        logger.info(f"🎛️ Claude Master Orchestrator initialized with {len(self.managed_agents)} agents")

    def load_configuration(self):
        """Load orchestrator configuration"""
        default_config = {
            "auto_start_agents": True,
            "health_check_interval": 30,
            "agent_startup_delay": 2,
            "max_restart_attempts": 3,
            "claude_context_focus": True,
            "memory_promotion_enabled": True,
            "semantic_tagging_enabled": True
        }
        
        if self.config_file.exists():
            try:
                with open(self.config_file, 'r') as f:
                    self.config = {**default_config, **json.load(f)}
            except Exception as e:
                logger.error(f"Failed to load config: {e}")
                self.config = default_config
        else:
            self.config = default_config
            self.save_configuration()

    def save_configuration(self):
        """Save orchestrator configuration"""
        try:
            with open(self.config_file, 'w') as f:
                json.dump(self.config, f, indent=2)
        except Exception as e:
            logger.error(f"Failed to save config: {e}")

    def discover_claude_agents(self):
        """Discover all Claude context agents"""
        self.managed_agents = {}
        
        # Core Claude agents
        claude_agents = [
            {
                "name": "ContextDocumentMonitor",
                "script": self.script_dir / "context_document_monitor_agent.py",
                "type": "core",
                "priority": 1,
                "description": "Monitors CLAUDE.md for changes"
            },
            {
                "name": "ClaudeMemoryRouter",
                "script": self.memory_core_path / "claude_memory_router.py",
                "type": "memory",
                "priority": 2,
                "description": "Routes Claude memories to appropriate storage"
            },
            {
                "name": "ClaudeSemanticTagger",
                "script": self.semantic_path / "claude_semantic_tagger.py", 
                "type": "semantic",
                "priority": 3,
                "description": "Tags Claude conversations and context"
            },
            {
                "name": "ClaudeSessionManager",
                "script": self.short_term_path / "claude_session_manager.py",
                "type": "session",
                "priority": 3,
                "description": "Manages Claude conversation sessions"
            },
            {
                "name": "ClaudeContextInjector",
                "script": self.procedural_path / "claude_context_injector.py",
                "type": "context",
                "priority": 4,
                "description": "Injects relevant context into Claude conversations"
            },
            {
                "name": "ClaudeMemoryPromoter",
                "script": self.long_term_path / "claude_memory_promoter.py",
                "type": "promotion",
                "priority": 5,
                "description": "Promotes important Claude memories to long-term storage"
            }
        ]
        
        for agent in claude_agents:
            self.managed_agents[agent["name"]] = agent
            self.agent_health[agent["name"]] = {
                "status": "stopped",
                "last_check": None,
                "restart_count": 0,
                "start_time": None
            }
        
        logger.info(f"🔍 Discovered {len(self.managed_agents)} Claude context agents")

    def start_all_claude_agents(self):
        """Start all Claude context agents in priority order"""
        logger.info("🚀 Starting all Claude context agents...")
        
        # Sort agents by priority
        sorted_agents = sorted(self.managed_agents.items(), key=lambda x: x[1]["priority"])
        
        for agent_name, agent_config in sorted_agents:
            self.start_agent(agent_name)
            time.sleep(self.config["agent_startup_delay"])
        
        # Start health monitoring
        self.start_health_monitoring()
        
        logger.info("✅ All Claude context agents started")

    def start_agent(self, agent_name: str):
        """Start a specific Claude agent"""
        if agent_name not in self.managed_agents:
            logger.error(f"Unknown agent: {agent_name}")
            return False
        
        agent_config = self.managed_agents[agent_name]
        script_path = agent_config["script"]
        
        # Check if script exists
        if not script_path.exists():
            logger.warning(f"Agent script not found: {script_path}")
            # Create placeholder if doesn't exist
            self.create_agent_placeholder(agent_name, script_path)
            return False
        
        try:
            # Start the agent process
            process = subprocess.Popen(
                [sys.executable, str(script_path)],
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                cwd=str(script_path.parent)
            )
            
            self.agent_processes[agent_name] = process
            self.agent_health[agent_name].update({
                "status": "running",
                "start_time": datetime.now().isoformat(),
                "process_id": process.pid
            })
            
            logger.info(f"✅ Started {agent_name} (PID: {process.pid})")
            return True
            
        except Exception as e:
            logger.error(f"Failed to start {agent_name}: {e}")
            self.agent_health[agent_name]["status"] = "failed"
            return False

    def create_agent_placeholder(self, agent_name: str, script_path: Path):
        """Create placeholder agent script"""
        agent_config = self.managed_agents[agent_name]
        
        # Ensure directory exists
        script_path.parent.mkdir(parents=True, exist_ok=True)
        
        placeholder_content = f'''#!/usr/bin/env python3
"""
{agent_name} - Claude Context Memory Agent
{agent_config["description"]}

Status: Placeholder - Needs Implementation
Type: {agent_config["type"]}
Priority: {agent_config["priority"]}
"""

import time
import logging
from datetime import datetime
from pathlib import Path

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class {agent_name}:
    def __init__(self):
        self.agent_name = "{agent_name}"
        self.script_dir = Path(__file__).parent
        logger.info(f"🤖 {{self.agent_name}} initialized (placeholder)")
    
    def run(self):
        """Main agent loop"""
        logger.info(f"🔄 {{self.agent_name}} running...")
        
        while True:
            # Placeholder functionality
            logger.info(f"📝 {{self.agent_name}} monitoring... (placeholder)")
            time.sleep(30)
    
    def get_status(self):
        """Get agent status"""
        return {{
            "agent_name": self.agent_name,
            "status": "placeholder",
            "timestamp": datetime.now().isoformat()
        }}

if __name__ == "__main__":
    agent = {agent_name}()
    agent.run()
'''
        
        try:
            with open(script_path, 'w') as f:
                f.write(placeholder_content)
            logger.info(f"📝 Created placeholder for {agent_name}")
        except Exception as e:
            logger.error(f"Failed to create placeholder for {agent_name}: {e}")

    def start_health_monitoring(self):
        """Start health monitoring for all agents"""
        def health_monitor():
            while True:
                for agent_name in self.managed_agents:
                    self.check_agent_health(agent_name)
                time.sleep(self.config["health_check_interval"])
        
        monitor_thread = threading.Thread(target=health_monitor, daemon=True)
        monitor_thread.start()
        logger.info("🏥 Health monitoring started")

    def check_agent_health(self, agent_name: str):
        """Check health of a specific agent"""
        if agent_name not in self.agent_processes:
            return
        
        process = self.agent_processes[agent_name]
        health = self.agent_health[agent_name]
        
        # Check if process is still running
        if process.poll() is None:
            health["status"] = "running"
            health["last_check"] = datetime.now().isoformat()
        else:
            health["status"] = "stopped"
            health["last_check"] = datetime.now().isoformat()
            
            # Attempt restart if configured
            if health["restart_count"] < self.config["max_restart_attempts"]:
                logger.warning(f"🔄 Restarting {agent_name} (attempt {health['restart_count'] + 1})")
                health["restart_count"] += 1
                self.start_agent(agent_name)

    def stop_all_agents(self):
        """Stop all Claude context agents"""
        logger.info("🛑 Stopping all Claude context agents...")
        
        for agent_name, process in self.agent_processes.items():
            try:
                process.terminate()
                process.wait(timeout=10)
                self.agent_health[agent_name]["status"] = "stopped"
                logger.info(f"✅ Stopped {agent_name}")
            except Exception as e:
                logger.error(f"Failed to stop {agent_name}: {e}")
                try:
                    process.kill()
                except:
                    pass
        
        self.agent_processes.clear()

    def get_system_status(self):
        """Get status of all Claude context agents"""
        return {
            "orchestrator": self.agent_name,
            "timestamp": datetime.now().isoformat(),
            "agents": self.agent_health,
            "total_agents": len(self.managed_agents),
            "running_agents": len([h for h in self.agent_health.values() if h["status"] == "running"]),
            "config": self.config
        }

def main():
    """Main execution function"""
    orchestrator = ClaudeMasterOrchestrator()
    
    if len(sys.argv) > 1:
        command = sys.argv[1].lower()
        
        if command == 'start':
            orchestrator.start_all_claude_agents()
            # Keep running to maintain agents
            try:
                while True:
                    time.sleep(10)
            except KeyboardInterrupt:
                orchestrator.stop_all_agents()
        
        elif command == 'stop':
            orchestrator.stop_all_agents()
        
        elif command == 'status':
            status = orchestrator.get_system_status()
            print(json.dumps(status, indent=2))
        
        elif command == 'restart':
            orchestrator.stop_all_agents()
            time.sleep(2)
            orchestrator.start_all_claude_agents()
        
        else:
            print("Usage: python claude_master_orchestrator.py [start|stop|status|restart]")
    
    else:
        # Default: start all agents
        orchestrator.start_all_claude_agents()
        try:
            while True:
                time.sleep(10)
        except KeyboardInterrupt:
            orchestrator.stop_all_agents()

if __name__ == "__main__":
    main()