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
CommandCore OS - Master Orchestrator Agent
The supreme agent that manages all other agents and coordinates the entire ecosystem
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

# Project configuration
BASE_DIR = Path(__file__).parent.parent.parent.parent
sys.path.append(str(BASE_DIR))

class MasterOrchestrator:
    """Supreme orchestrator managing the entire CommandCore OS agent ecosystem"""
    
    def __init__(self):
        self.agent_dir = BASE_DIR / "memory" / "a_memory_core" / "master_orchestrator_agent"
        self.agent_dir.mkdir(exist_ok=True)
        
        # Agent management
        self.managed_agents = {}
        self.agent_processes = {}
        self.agent_health = {}
        self.command_queue = queue.Queue()
        self.response_queue = queue.Queue()
        
        # Communication protocols
        self.api_port = 8888
        self.running = False
        
        # Initialize logging
        self.setup_logging()
        
        # Load agent registry
        self.load_agent_registry()
        
        self.logger.info("🧠 Master Orchestrator initialized")
    
    def setup_logging(self):
        """Setup comprehensive logging system"""
        log_file = self.agent_dir / "orchestrator.log"
        
        logging.basicConfig(
            level=logging.INFO,
            format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
            handlers=[
                logging.FileHandler(log_file),
                logging.StreamHandler(sys.stdout)
            ]
        )
        self.logger = logging.getLogger("MasterOrchestrator")
    
    def load_agent_registry(self):
        """Discover and register all available agents"""
        self.logger.info("🔍 Discovering CommandCore OS agents...")
        
        # Agent discovery patterns
        agent_patterns = [
            "**/builder_gui_agents/**/*_agent.py",
            "**/memory/**/*_agent.py", 
            "**/logs/**/*_agent.py",
            "**/interface/**/*_agent.py"
        ]
        
        discovered_agents = {}
        
        for pattern in agent_patterns:
            for agent_file in BASE_DIR.glob(pattern):
                if agent_file.name != "master_orchestrator_agent.py":  # Don't manage self
                    agent_name = agent_file.stem
                    system = self._categorize_agent(agent_file)
                    
                    discovered_agents[agent_name] = {
                        'path': str(agent_file),
                        'system': system,
                        'status': 'discovered',
                        'priority': self._get_agent_priority(agent_name, system),
                        'dependencies': self._get_agent_dependencies(agent_name),
                        'capabilities': self._get_agent_capabilities(agent_name)
                    }
        
        self.managed_agents = discovered_agents
        self.logger.info(f"📋 Registered {len(discovered_agents)} agents across {len(set(a['system'] for a in discovered_agents.values()))} systems")
        
        # Save registry
        self.save_agent_registry()
    
    def _categorize_agent(self, agent_path):
        """Categorize agent by its location and purpose"""
        path_str = str(agent_path).lower()
        
        if 'memory_core' in path_str:
            return 'memory_core'
        elif 'builder_gui' in path_str:
            return 'builder_gui' 
        elif 'log' in path_str:
            return 'logging'
        elif 'schema' in path_str:
            return 'schema'
        else:
            return 'general'
    
    def _get_agent_priority(self, agent_name, system):
        """Determine agent startup priority"""
        # Core memory agents have highest priority
        if system == 'memory_core':
            return 1
        # Builder GUI agents second
        elif system == 'builder_gui':
            return 2
        # Everything else
        else:
            return 3
    
    def _get_agent_dependencies(self, agent_name):
        """Get agent dependencies (simplified)"""
        dependencies = []
        
        if 'orchestrator' in agent_name.lower():
            dependencies = ['memory_indexer_agent', 'memory_router_agent']
        elif 'context' in agent_name.lower():
            dependencies = ['memory_indexer_agent']
        
        return dependencies
    
    def _get_agent_capabilities(self, agent_name):
        """Get agent capabilities based on name patterns"""
        capabilities = []
        
        name_lower = agent_name.lower()
        
        if 'memory' in name_lower:
            capabilities.append('memory_management')
        if 'log' in name_lower:
            capabilities.append('logging')
        if 'search' in name_lower:
            capabilities.append('search')
        if 'sync' in name_lower:
            capabilities.append('synchronization')
        if 'export' in name_lower:
            capabilities.append('data_export')
        
        return capabilities
    
    def save_agent_registry(self):
        """Save agent registry to file"""
        registry_file = self.agent_dir / "agent_registry.json"
        
        registry_data = {
            'last_updated': datetime.now().isoformat(),
            'total_agents': len(self.managed_agents),
            'agents': self.managed_agents,
            'systems': {}
        }
        
        # Group by system
        for agent_name, agent_info in self.managed_agents.items():
            system = agent_info['system']
            if system not in registry_data['systems']:
                registry_data['systems'][system] = []
            registry_data['systems'][system].append(agent_name)
        
        with open(registry_file, 'w') as f:
            json.dump(registry_data, f, indent=2)
        
        self.logger.info(f"💾 Agent registry saved to {registry_file}")
    
    def start_agent(self, agent_name):
        """Start a specific agent"""
        if agent_name not in self.managed_agents:
            self.logger.error(f"❌ Agent {agent_name} not found in registry")
            return False
        
        agent_info = self.managed_agents[agent_name]
        agent_path = agent_info['path']
        
        self.logger.info(f"🚀 Starting agent: {agent_name}")
        
        try:
            # Check dependencies first
            for dep in agent_info.get('dependencies', []):
                if dep not in self.agent_processes or not self._is_agent_healthy(dep):
                    self.logger.warning(f"⚠️  Dependency {dep} not available for {agent_name}")
            
            # Start the agent process
            process = subprocess.Popen([
                sys.executable, agent_path
            ], cwd=os.path.dirname(agent_path), 
               stdout=subprocess.PIPE, 
               stderr=subprocess.PIPE,
               text=True)
            
            self.agent_processes[agent_name] = process
            self.managed_agents[agent_name]['status'] = 'starting'
            self.managed_agents[agent_name]['start_time'] = datetime.now().isoformat()
            
            # Monitor agent health
            self._monitor_agent_health(agent_name)
            
            self.logger.info(f"✅ Agent {agent_name} started successfully")
            return True
            
        except Exception as e:
            self.logger.error(f"❌ Failed to start {agent_name}: {e}")
            self.managed_agents[agent_name]['status'] = 'failed'
            self.managed_agents[agent_name]['error'] = str(e)
            return False
    
    def stop_agent(self, agent_name):
        """Stop a specific agent"""
        if agent_name in self.agent_processes:
            process = self.agent_processes[agent_name]
            process.terminate()
            
            # Wait for graceful shutdown
            try:
                process.wait(timeout=5)
            except subprocess.TimeoutExpired:
                process.kill()
            
            del self.agent_processes[agent_name]
            self.managed_agents[agent_name]['status'] = 'stopped'
            self.logger.info(f"🛑 Agent {agent_name} stopped")
    
    def _monitor_agent_health(self, agent_name):
        """Monitor agent health in background thread"""
        def monitor():
            while agent_name in self.agent_processes:
                process = self.agent_processes[agent_name]
                
                if process.poll() is None:
                    # Process is running
                    self.managed_agents[agent_name]['status'] = 'running'
                    self.agent_health[agent_name] = {
                        'status': 'healthy',
                        'last_check': datetime.now().isoformat(),
                        'pid': process.pid
                    }
                else:
                    # Process has exited
                    self.managed_agents[agent_name]['status'] = 'exited'
                    self.agent_health[agent_name] = {
                        'status': 'dead',
                        'last_check': datetime.now().isoformat(),
                        'exit_code': process.returncode
                    }
                    break
                
                time.sleep(10)  # Check every 10 seconds
        
        monitor_thread = threading.Thread(target=monitor, daemon=True)
        monitor_thread.start()
    
    def _is_agent_healthy(self, agent_name):
        """Check if agent is healthy"""
        if agent_name not in self.agent_health:
            return False
        
        health = self.agent_health[agent_name]
        return health.get('status') == 'healthy'
    
    def start_all_agents(self):
        """Start all agents in proper order"""
        self.logger.info("🚀 Starting agent orchestra...")
        
        # Sort agents by priority
        agents_by_priority = {}
        for name, info in self.managed_agents.items():
            priority = info['priority']
            if priority not in agents_by_priority:
                agents_by_priority[priority] = []
            agents_by_priority[priority].append(name)
        
        # Start agents wave by wave
        for priority in sorted(agents_by_priority.keys()):
            wave_agents = agents_by_priority[priority]
            self.logger.info(f"🌊 Priority {priority}: Starting {len(wave_agents)} agents")
            
            for agent_name in wave_agents:
                self.start_agent(agent_name)
                time.sleep(0.5)  # Small delay between starts
            
            # Wait between priority waves
            if priority < max(agents_by_priority.keys()):
                time.sleep(3)
        
        self.logger.info("🎉 Agent orchestra startup complete")
    
    def stop_all_agents(self):
        """Stop all managed agents"""
        self.logger.info("🛑 Stopping all agents...")
        
        for agent_name in list(self.agent_processes.keys()):
            self.stop_agent(agent_name)
        
        self.logger.info("✅ All agents stopped")
    
    def get_system_status(self):
        """Get comprehensive system status"""
        total_agents = len(self.managed_agents)
        running_agents = len([a for a in self.managed_agents.values() if a['status'] == 'running'])
        failed_agents = len([a for a in self.managed_agents.values() if a['status'] == 'failed'])
        
        status = {
            'orchestrator': {
                'status': 'running' if self.running else 'stopped',
                'uptime': datetime.now().isoformat(),
                'managed_agents': total_agents
            },
            'agents': {
                'total': total_agents,
                'running': running_agents,
                'failed': failed_agents,
                'success_rate': (running_agents / total_agents * 100) if total_agents > 0 else 0
            },
            'systems': {},
            'health': self.agent_health
        }
        
        # System breakdown
        for agent_name, agent_info in self.managed_agents.items():
            system = agent_info['system']
            if system not in status['systems']:
                status['systems'][system] = {'total': 0, 'running': 0}
            
            status['systems'][system]['total'] += 1
            if agent_info['status'] == 'running':
                status['systems'][system]['running'] += 1
        
        return status
    
    def handle_gui_request(self, request):
        """Handle requests from the GUI"""
        command = request.get('command')
        params = request.get('params', {})
        
        self.logger.info(f"📨 GUI Request: {command}")
        
        if command == 'get_status':
            return self.get_system_status()
        
        elif command == 'start_agent':
            agent_name = params.get('agent_name')
            success = self.start_agent(agent_name)
            return {'success': success, 'agent': agent_name}
        
        elif command == 'stop_agent':
            agent_name = params.get('agent_name')
            self.stop_agent(agent_name)
            return {'success': True, 'agent': agent_name}
        
        elif command == 'start_all':
            self.start_all_agents()
            return {'success': True, 'message': 'Agent orchestra starting'}
        
        elif command == 'stop_all':
            self.stop_all_agents()
            return {'success': True, 'message': 'All agents stopped'}
        
        elif command == 'memory_search':
            # Delegate to memory agents
            return self._delegate_to_memory_agents('search', params)
        
        elif command == 'file_operation':
            # Delegate to file management agents
            return self._delegate_to_file_agents(params)
        
        else:
            return {'error': f'Unknown command: {command}'}
    
    def _delegate_to_memory_agents(self, operation, params):
        """Delegate memory operations to memory agents"""
        # This would communicate with memory agents
        self.logger.info(f"🧠 Delegating memory operation: {operation}")
        
        # For now, return a placeholder
        return {
            'success': True,
            'operation': operation,
            'delegated_to': 'memory_indexer_agent',
            'results': f"Memory operation {operation} delegated to agents"
        }
    
    def _delegate_to_file_agents(self, params):
        """Delegate file operations to file management agents"""
        self.logger.info(f"📁 Delegating file operation: {params}")
        
        # This would communicate with file management agents
        return {
            'success': True,
            'operation': 'file_operation',
            'delegated_to': 'file_management_agent',
            'results': "File operation delegated to agents"
        }
    
    def start_orchestrator(self):
        """Start the master orchestrator"""
        self.running = True
        self.logger.info("🎭 Master Orchestrator starting...")
        
        # Start all agents
        self.start_all_agents()
        
        # Start main loop
        self.main_loop()
    
    def main_loop(self):
        """Main orchestrator loop"""
        self.logger.info("🔄 Master Orchestrator main loop started")
        
        try:
            while self.running:
                # Check agent health
                self._health_check_cycle()
                
                # Process any queued commands
                self._process_command_queue()
                
                # Update status
                self._update_status_file()
                
                # Sleep before next cycle
                time.sleep(30)  # Check every 30 seconds
                
        except KeyboardInterrupt:
            self.logger.info("⏹️  Orchestrator shutdown requested")
        finally:
            self.shutdown()
    
    def _health_check_cycle(self):
        """Perform health checks on all agents"""
        for agent_name in list(self.agent_processes.keys()):
            if not self._is_agent_healthy(agent_name):
                self.logger.warning(f"⚠️  Agent {agent_name} appears unhealthy")
    
    def _process_command_queue(self):
        """Process any queued commands"""
        try:
            while True:
                command = self.command_queue.get_nowait()
                response = self.handle_gui_request(command)
                self.response_queue.put(response)
        except queue.Empty:
            pass
    
    def _update_status_file(self):
        """Update status file for GUI communication"""
        status_file = self.agent_dir / "orchestrator_status.json"
        status = self.get_system_status()
        
        with open(status_file, 'w') as f:
            json.dump(status, f, indent=2)
    
    def shutdown(self):
        """Graceful shutdown"""
        self.logger.info("🔄 Master Orchestrator shutting down...")
        self.running = False
        
        # Stop all agents
        self.stop_all_agents()
        
        self.logger.info("✅ Master Orchestrator shutdown complete")

def main():
    """Main entry point"""
    print("🧠 CommandCore OS - Master Orchestrator Agent")
    print("Supreme coordination of the entire agent ecosystem")
    print("=" * 60)
    
    orchestrator = MasterOrchestrator()
    orchestrator.start_orchestrator()

if __name__ == "__main__":
    main()