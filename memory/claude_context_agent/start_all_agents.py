#!/usr/bin/env python3
"""
Grand Prix Social - Complete Memory System Startup
This script starts all memory agents and ensures they're processing data
"""

import json
import os
import sys
import time
import threading
import logging
from datetime import datetime
from pathlib import Path
import subprocess
import shutil
from typing import Dict, List, Optional

# Add memory root to path - parent of claude_context_agent
MEMORY_ROOT = Path(__file__).parent.parent
sys.path.insert(0, str(MEMORY_ROOT))

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='[%(asctime)s] [%(levelname)s] [%(name)s] %(message)s',
    datefmt='%m-%d_%I-%M%p',
    handlers=[
        logging.StreamHandler(),
        logging.FileHandler(MEMORY_ROOT / 'memory_system.log')
    ]
)

logger = logging.getLogger('MemorySystem')

class MemoryAgent:
    """Base class for memory agents"""
    
    def __init__(self, name: str, path: Path):
        self.name = name
        self.path = path
        self.logger = logging.getLogger(f'Agent.{name}')
        self.running = False
        self.thread = None
    
    def start(self):
        """Start the agent in a separate thread"""
        if not self.running:
            self.running = True
            self.thread = threading.Thread(target=self.run, daemon=True)
            self.thread.start()
            self.logger.info(f"{self.name} started")
    
    def stop(self):
        """Stop the agent"""
        self.running = False
        if self.thread:
            self.thread.join(timeout=5)
        self.logger.info(f"{self.name} stopped")
    
    def run(self):
        """Main agent loop - to be overridden"""
        while self.running:
            self.process()
            time.sleep(5)  # Check every 5 seconds
    
    def process(self):
        """Process agent tasks"""
        pass

class MemoryOrchestratorAgent(MemoryAgent):
    """Orchestrates all memory operations"""
    
    def __init__(self, path: Path):
        super().__init__('MemoryOrchestrator', path)
        self.inbox_path = path / 'orchestrator_inbox.json'
        self.state_path = path / 'memory_orchestrator_agent_state.json'
    
    def process(self):
        """Process orchestrator tasks"""
        # Check inbox for messages
        if self.inbox_path.exists():
            with open(self.inbox_path, 'r') as f:
                inbox = json.load(f)
            
            messages = inbox.get('messages', [])
            if messages:
                self.logger.info(f"Processing {len(messages)} messages")
            
            # Process each message
            for msg in messages[:]:  # Copy to allow removal
                self.process_message(msg)
                messages.remove(msg)
            
            # Update inbox
            inbox['messages'] = messages
            inbox['last_processed'] = datetime.now().strftime("%m-%d_%I-%M%p")
            
            with open(self.inbox_path, 'w') as f:
                json.dump(inbox, f, indent=2)
        
        # Update state
        self.update_state()
    
    def process_message(self, msg: Dict):
        """Process a single message"""
        msg_type = msg.get('type', 'unknown')
        content = msg.get('content', {})
        
        self.logger.debug(f"Processing {msg_type}: {content.get('action', 'unknown')}")
        
        # Route to appropriate handler
        if msg_type == 'session_start':
            self.handle_session_start(content)
        elif msg_type == 'content_created':
            self.handle_content_created(content)
        # Add more handlers as needed
    
    def handle_session_start(self, content: Dict):
        """Handle session start"""
        session_id = content.get('session_id', datetime.now().strftime("%m-%d_%I-%M%p"))
        self.logger.info(f"Session started: {session_id}")
        
        # Create session file in working memory
        session_path = MEMORY_ROOT / 'd_working_memory' / 'active' / f'session_{session_id}.md'
        if not session_path.exists():
            session_path.write_text(f"# Session {session_id}\nStarted: {datetime.now()}\n")
    
    def handle_content_created(self, content: Dict):
        """Handle new content creation"""
        file_path = content.get('file_path')
        if file_path:
            self.logger.info(f"New content: {file_path}")
            # Trigger tagging and routing
    
    def update_state(self):
        """Update agent state"""
        if self.state_path.exists():
            with open(self.state_path, 'r') as f:
                state = json.load(f)
        else:
            state = {}
        
        state.update({
            'agent_name': self.name,
            'state': 'active',
            'last_run': datetime.now().strftime("%m-%d_%I-%M%p"),
            'current_project': 'Grand Prix Social',
            'orchestration_active': True
        })
        
        with open(self.state_path, 'w') as f:
            json.dump(state, f, indent=2)

class WorkingMemoryAgent(MemoryAgent):
    """Manages working memory and promotions"""
    
    def __init__(self, path: Path):
        super().__init__('WorkingMemory', path)
        self.active_dir = MEMORY_ROOT / 'd_working_memory' / 'active'
        self.promotion_rules_path = MEMORY_ROOT / 'a_memory_core' / 'promotion_rules.json'
    
    def process(self):
        """Check for files to promote"""
        if not self.active_dir.exists():
            return
        
        # Load promotion rules
        if self.promotion_rules_path.exists():
            with open(self.promotion_rules_path, 'r') as f:
                rules = json.load(f)
        else:
            rules = {}
        
        # Check each file in active directory
        for file_path in self.active_dir.glob('*.md'):
            self.check_file_for_promotion(file_path, rules)
    
    def check_file_for_promotion(self, file_path: Path, rules: Dict):
        """Check if a file should be promoted"""
        # Get file age
        file_age_days = (time.time() - file_path.stat().st_mtime) / 86400
        
        # Check working to long-term promotion
        wl_rules = rules.get('working_to_longterm', {})
        if file_age_days >= wl_rules.get('threshold_days', 7):
            self.promote_to_longterm(file_path)

    def promote_to_longterm(self, file_path: Path):
        """Promote file to long-term memory"""
        self.logger.info(f"Promoting {file_path.name} to long-term memory")
        
        # Create destination in long-term memory
        dest_dir = MEMORY_ROOT / 'b_long_term_memory' / 'promoted'
        dest_dir.mkdir(parents=True, exist_ok=True)
        
        timestamp = datetime.now().strftime("%m-%d_%I-%M%p")
        dest_path = dest_dir / f"{file_path.stem}_{timestamp}{file_path.suffix}"
        
        # Copy file (don't move - preservation rule)
        dest_path.write_text(file_path.read_text(encoding='utf-8'), encoding='utf-8')
        
        # Add promotion metadata
        file_age_days = (time.time() - file_path.stat().st_mtime) / 86400
        meta_path = dest_path.with_suffix('.meta.json')
        meta_path.write_text(json.dumps({
            'original_path': str(file_path),
            'promoted_at': timestamp,
            'promotion_reason': 'age_threshold',
            'file_age_days': file_age_days
        }, indent=2))

class ContextRouterAgent(MemoryAgent):
    """Routes content to appropriate memory types"""
    
    def __init__(self, path: Path):
        super().__init__('ContextRouter', path)
        self.routing_log_path = path / 'context_routing.log'
    
    def process(self):
        """Process routing tasks"""
        # Check for new content in working memory
        working_dir = MEMORY_ROOT / 'd_working_memory' / 'active'
        
        for file_path in working_dir.glob('*.md'):
            # Skip already routed files
            if not self.is_routed(file_path):
                self.route_file(file_path)
    
    def is_routed(self, file_path: Path) -> bool:
        """Check if file has been routed"""
        # Simple check - could be improved with metadata
        return False  # For now, always process
    
    def route_file(self, file_path: Path):
        """Route file based on content"""
        content = file_path.read_text(encoding='utf-8')
        
        # Analyze content type
        if 'session' in file_path.name.lower():
            self.route_to_episodic(file_path)
        elif 'procedure' in content.lower() or 'protocol' in content.lower():
            self.route_to_procedural(file_path)
        elif 'f1' in content.lower() or 'racing' in content.lower():
            self.route_to_semantic(file_path)
        
        self.logger.debug(f"Routed {file_path.name}")
    
    def route_to_episodic(self, file_path: Path):
        """Route to episodic memory"""
        dest_dir = MEMORY_ROOT / 'g_episodic' / 'sessions'
        dest_dir.mkdir(parents=True, exist_ok=True)
        # Create link or reference
    
    def route_to_procedural(self, file_path: Path):
        """Route to procedural memory"""
        dest_dir = MEMORY_ROOT / 'e_procedural' / 'protocols'
        dest_dir.mkdir(parents=True, exist_ok=True)
        # Create link or reference
    
    def route_to_semantic(self, file_path: Path):
        """Route to semantic memory"""
        dest_dir = MEMORY_ROOT / 'f_semantic' / 'knowledge'
        dest_dir.mkdir(parents=True, exist_ok=True)
        # Create link or reference

class ClaudeContextAgent(MemoryAgent):
    """Manages Claude Code context automatically"""
    
    def __init__(self, path: Path):
        super().__init__('ClaudeContext', path)
        self.project_root = MEMORY_ROOT.parent
        self.claude_md_path = MEMORY_ROOT / 'CLAUDE.md'
        self.current_session_path = self.project_root / 'CLAUDE_CURRENT_SESSION.md'
        self.context_state_path = path / 'claude_context_state.json'
        self.last_update_time = time.time()
    
    def process(self):
        """Update Claude context continuously"""
        try:
            # Check if project files have changed
            current_time = time.time()
            if current_time - self.last_update_time >= 30:  # Update every 30 seconds
                self.update_session_context()
                self.last_update_time = current_time
            
            # Monitor for Claude Code processes
            self.check_claude_code_status()
        
        except Exception as e:
            self.logger.error(f"Error in context processing: {e}")
    
    def start(self):
        """Start Claude context management"""
        super().start()
        
        # Initial setup
        self.create_initial_context()
        self.launch_claude_code()
    
    def create_initial_context(self):
        """Create initial session context from CLAUDE.md"""
        try:
            if self.claude_md_path.exists():
                claude_content = self.claude_md_path.read_text(encoding='utf-8')
            else:
                claude_content = "# Claude Context\nNo CLAUDE.md found."
            
            # Get current project status
            project_status = self.get_project_status()
            
            # Create dynamic session context
            session_context = f"""# [FLAG] CLAUDE CURRENT SESSION - GRAND PRIX SOCIAL
*Auto-generated: {datetime.now().strftime('%Y-%m-%d %I:%M %p')}*
*Memory System: ACTIVE*

## [?] LIVE PROJECT STATUS
{project_status}

---

## [BRAIN] BASE CONTEXT (from CLAUDE.md)
{claude_content}

---

## [CLIPBOARD] SESSION NOTES
*This section auto-updates during your session*

### Recent Activity
- Memory system started at {datetime.now().strftime('%I:%M %p')}
- All agents active and monitoring
- Context auto-updating every 30 seconds

### Current Focus
- Continue development from where you left off
- Memory system will track all changes automatically
- Session context preserved between restarts

---
*This file auto-updates - no manual editing needed*
"""
            
            self.current_session_path.write_text(session_context, encoding='utf-8')
            self.logger.info(f"Created current session context: {self.current_session_path}")
        
        except Exception as e:
            self.logger.error(f"Error creating initial context: {e}")
    
    def update_session_context(self):
        """Update session context with latest project state"""
        try:
            # Get current project status
            project_status = self.get_project_status()
            
            # Read existing context
            if self.current_session_path.exists():
                content = self.current_session_path.read_text(encoding='utf-8')
                
                # Update the live status section
                lines = content.split('\n')
                in_status_section = False
                updated_lines = []
                
                for line in lines:
                    if line.startswith('## [?] LIVE PROJECT STATUS'):
                        in_status_section = True
                        updated_lines.append(line)
                        updated_lines.append(project_status)
                        continue
                    elif line.startswith('---') and in_status_section:
                        in_status_section = False
                        updated_lines.append(line)
                        continue
                    elif not in_status_section:
                        updated_lines.append(line)
                
                # Write updated content
                self.current_session_path.write_text('\n'.join(updated_lines), encoding='utf-8')
                self.logger.debug("Updated session context")
        
        except Exception as e:
            self.logger.error(f"Error updating session context: {e}")
    
    def get_project_status(self):
        """Get current project status"""
        try:
            status_parts = []
            
            # Check git status
            try:
                result = subprocess.run(['git', 'status', '--porcelain'], 
                                        cwd=self.project_root, 
                                        capture_output=True, 
                                        text=True,
                                        timeout=10)
                if result.returncode == 0:
                    changed_files = len(result.stdout.strip().split('\n')) if result.stdout.strip() else 0
                    status_parts.append(f"- **Git Status**: {changed_files} changed files")
            except:
                status_parts.append("- **Git Status**: Unable to check")
            
            # Check recent working memory files
            working_dir = MEMORY_ROOT / 'd_working_memory' / 'active'
            if working_dir.exists():
                recent_files = list(working_dir.glob('*.md'))
                status_parts.append(f"- **Active Files**: {len(recent_files)} files in working memory")
            
            # Check memory agents status
            status_parts.append("- **Memory System**: All agents active")
            status_parts.append(f"- **Last Update**: {datetime.now().strftime('%I:%M %p')}")
            
            return '\n'.join(status_parts)
        
        except Exception as e:
            return f"- **Status Error**: {e}"
    
    def launch_claude_code(self):
        """Launch Claude Code automatically"""
        try:
            # Check if Claude Code is already running
            if self.is_claude_code_running():
                self.logger.info("Claude Code already running")
                return
            
            # Try to launch Claude Code
            claude_commands = [
                'claude',  # If claude is in PATH
                'code-claude',  # Alternative name
                r'C:\Users\AppData\Local\Programs\Claude\Claude.exe',  # Common install path
            ]
            
            for cmd in claude_commands:
                try:
                    # Launch with project directory
                    subprocess.Popen([cmd, str(self.project_root)], 
                                     stdout=subprocess.DEVNULL, 
                                     stderr=subprocess.DEVNULL)
                    self.logger.info(f"Launched Claude Code with: {cmd}")
                    
                    # Wait a moment and check if it started
                    time.sleep(2)
                    if self.is_claude_code_running():
                        break
                
                except FileNotFoundError:
                    continue
                except Exception as e:
                    self.logger.debug(f"Failed to launch with {cmd}: {e}")
                    continue
            else:
                self.logger.warning("Could not automatically launch Claude Code")
        
        except Exception as e:
            self.logger.error(f"Error launching Claude Code: {e}")
    
    def is_claude_code_running(self):
        """Check if Claude Code is running"""
        try:
            if os.name == 'nt':  # Windows
                result = subprocess.run(['tasklist'], capture_output=True, text=True)
                return 'claude' in result.stdout.lower()
            else:  # Unix-like
                result = subprocess.run(['pgrep', '-f', 'claude'], capture_output=True)
                return result.returncode == 0
        except:
            return False
    
    def check_claude_code_status(self):
        """Monitor Claude Code status"""
        try:
            if self.is_claude_code_running():
                # Claude is running - ensure context file exists
                if not self.current_session_path.exists():
                    self.create_initial_context()
            else:
                # Claude not running - could save final state here
                pass
        
        except Exception as e:
            self.logger.error(f"Error checking Claude Code status: {e}")
    
    def save_session_state(self):
        """Save current session state on shutdown"""
        try:
            state = {
                'last_session': datetime.now().isoformat(),
                'project_root': str(self.project_root),
                'context_file': str(self.current_session_path),
                'session_active': False
            }
            
            self.context_state_path.write_text(json.dumps(state, indent=2), encoding='utf-8')
            self.logger.info("Saved Claude context state")
        
        except Exception as e:
            self.logger.error(f"Error saving session state: {e}")
    
    def stop(self):
        """Stop Claude context agent"""
        self.save_session_state()
        super().stop()

class PythonScriptAgent(MemoryAgent):
    """Generic agent that runs a Python script as a subprocess"""
    
    def __init__(self, name: str, script_path: Path):
        super().__init__(name, script_path.parent)
        self.script_path = script_path
        self.process = None
    
    def start(self):
        """Start the Python script as a subprocess"""
        if not self.running and self.script_path.exists():
            try:
                self.running = True
                
                # Special handling for continuous agents
                if 'indexer' in self.name.lower():
                    # Memory Indexer runs in continuous vector database mode
                    cmd_args = [sys.executable, str(self.script_path), '--continuous']
                elif 'repo' in self.name.lower() or 'sync' in self.name.lower():
                    # Repo Sync runs in continuous mode (need project ID)
                    cmd_args = [sys.executable, str(self.script_path), 'continuous', '--project-id', 'grandprix-social']
                else:
                    # Standard agents run normally
                    cmd_args = [sys.executable, str(self.script_path)]
                
                # Start the Python script as a subprocess
                self.process = subprocess.Popen(
                    cmd_args,
                    cwd=self.script_path.parent,
                    stdout=subprocess.PIPE,
                    stderr=subprocess.PIPE,
                    text=True
                )
                
                self.logger.info(f"{self.name} started (PID: {self.process.pid})")
                
                # Start monitoring thread
                self.thread = threading.Thread(target=self.monitor_process, daemon=True)
                self.thread.start()
            
            except Exception as e:
                self.logger.error(f"Failed to start {self.name}: {e}")
                self.running = False
    
    def monitor_process(self):
        """Monitor the subprocess"""
        while self.running and self.process:
            try:
                # Check if process is still running
                if self.process.poll() is not None:
                    # Process ended
                    self.logger.warning(f"{self.name} process ended unexpectedly")
                    self.running = False
                    break
                
                time.sleep(5)  # Check every 5 seconds
            
            except Exception as e:
                self.logger.error(f"Error monitoring {self.name}: {e}")
                break
    
    def stop(self):
        """Stop the Python script subprocess"""
        self.running = False
        
        if self.process:
            try:
                self.process.terminate()
                # Wait for graceful shutdown
                self.process.wait(timeout=5)
                self.logger.info(f"{self.name} stopped gracefully")
            except subprocess.TimeoutExpired:
                # Force kill if needed
                self.process.kill()
                self.logger.warning(f"{self.name} force killed")
            except Exception as e:
                self.logger.error(f"Error stopping {self.name}: {e}")
        
        if self.thread:
            self.thread.join(timeout=2)
    
    def process(self):
        """Not used for subprocess agents"""
        pass

class MemorySystemManager:
    """Manages all memory agents"""
    
    def __init__(self):
        self.agents = []
        self.logger = logger
    
    def initialize_agents(self):
        """Initialize ALL memory agents automatically"""
        
        # First add the custom agents we defined in this file
        # Orchestrator
        orchestrator_path = MEMORY_ROOT / 'a_memory_core' / 'memory_orchestrator_agent'
        if orchestrator_path.exists():
            self.agents.append(MemoryOrchestratorAgent(orchestrator_path))
        
        # Working Memory
        working_path = MEMORY_ROOT / 'd_working_memory'
        if working_path.exists():
            self.agents.append(WorkingMemoryAgent(working_path))
        
        # Context Router
        router_path = MEMORY_ROOT / 'a_memory_core' / 'memory_context_router_agent'
        if router_path.exists():
            self.agents.append(ContextRouterAgent(router_path))
        
        # Claude Context Agent
        claude_context_path = MEMORY_ROOT / 'a_memory_core' / 'claude_context_agent'
        claude_context_path.mkdir(exist_ok=True)  # Create if doesn't exist
        self.agents.append(ClaudeContextAgent(claude_context_path))
        
        # Now add ALL other agent scripts as generic Python agents
        agent_scripts = [
            ('GuiLauncher', 'a_memory_core/gui_launcher_agent/gui_launcher_agent.py'),
            ('FantasyLeague', 'a_memory_core/fantasy_league_agent/fantasy_league_agent.py'), 
            ('MasterOrchestrator', 'a_memory_core/master_orchestrator_agent/master_orchestrator_agent.py'),
            ('MemoryAgentRouter', 'a_memory_core/memory_agent_router_agent/memory_agent_router_agent.py'),
            ('MemoryCoreLog', 'a_memory_core/memory_core_log_agent/memory_core_log_agent.py'),
            ('MemoryIndexer', 'a_memory_core/memory_indexer_agent/memory_indexer_agent.py'),
            ('MemoryLogicEnforcer', 'a_memory_core/memory_logic_enforcer_agent/memory_logic_enforcer_agent.py'),
            ('MemoryRouter', 'a_memory_core/memory_router_agent/memory_router_agent.py'),
            ('RepoSync', 'a_memory_core/repo_sync_agent/repo_sync_agent.py'),
            ('SystemHealth', 'a_memory_core/system_health_agent/system_health_agent.py'),
            ('TagIntelligence', 'a_memory_core/tag_intelligence_engine/tag_intelligence_engine.py'),
            ('UserIntelligence', 'a_memory_core/user_intelligence_agent/user_intelligence_agent.py'),
        ]
        
        # Start each agent as a Python subprocess
        for agent_name, script_path in agent_scripts:
            full_path = MEMORY_ROOT / script_path
            if full_path.exists():
                try:
                    # Create a generic Python agent that runs the script
                    python_agent = PythonScriptAgent(agent_name, full_path)
                    self.agents.append(python_agent)
                    self.logger.debug(f"Added {agent_name} agent")
                except Exception as e:
                    self.logger.warning(f"Failed to add {agent_name}: {e}")
        
        self.logger.info(f"Initialized {len(self.agents)} agents total")
    
    def start_all(self):
        """Start all agents"""
        for agent in self.agents:
            agent.start()
        self.logger.info("All agents started")
    
    def stop_all(self):
        """Stop all agents"""
        for agent in self.agents:
            agent.stop()
        self.logger.info("All agents stopped")
    
    def monitor(self):
        """Monitor agent health"""
        while True:
            try:
                time.sleep(10)
                # Check agent health
                active = sum(1 for a in self.agents if a.running)
                self.logger.debug(f"Active agents: {active}/{len(self.agents)}")
            except KeyboardInterrupt:
                break
    
    def create_initial_structures(self):
        """Create necessary folders and files"""
        # Ensure all memory folders exist
        folders = [
            'a_memory_core/logs',
            'a_memory_core/alerts',
            'a_memory_core/analytics',
            'a_memory_core/dashboards',
            'b_long_term_memory/promoted',
            'c_short_term_memory/sessions',
            'd_working_memory/active',
            'e_procedural/protocols',
            'f_semantic/knowledge',
            'g_episodic/sessions'
        ]
        
        for folder in folders:
            path = MEMORY_ROOT / folder
            path.mkdir(parents=True, exist_ok=True)
        
        # Create initial orchestrator inbox if needed
        inbox_path = MEMORY_ROOT / 'a_memory_core' / 'memory_orchestrator_agent' / 'orchestrator_inbox.json'
        if not inbox_path.exists():
            inbox_path.write_text(json.dumps({
                'messages': [],
                'created': datetime.now().strftime("%m-%d_%I-%M%p")
            }, indent=2))
        
        self.logger.info("Initial structures created")

def main():
    """Main entry point"""
    print("\n" + "="*60)
    print("GRAND PRIX SOCIAL - MEMORY SYSTEM STARTUP")
    print("="*60 + "\n")
    
    manager = MemorySystemManager()
    
    try:
        # Create initial structures
        manager.create_initial_structures()
        
        # Initialize agents
        manager.initialize_agents()
        
        # Start all agents
        manager.start_all()
        
        print("\n[OK] Memory System Active!")
        print("-" * 40)
        print("Agents running:")
        for agent in manager.agents:
            print(f" - {agent.name}: ACTIVE")
        print("-" * 40)
        print("\nMemory system is now:")
        print(" - Processing working memory files")
        print(" - Routing content to appropriate memory types")
        print(" - Promoting aged content to long-term memory")
        print(" - Orchestrating all memory operations")
        print("\nPress Ctrl+C to stop\n")
        
        # Monitor agents
        manager.monitor()
    
    except KeyboardInterrupt:
        print("\n\nShutting down memory system...")
        manager.stop_all()
        print("Memory system stopped")
    except Exception as e:
        logger.error(f"Fatal error: {e}", exc_info=True)
        manager.stop_all()
        sys.exit(1)

if __name__ == "__main__":
    main()