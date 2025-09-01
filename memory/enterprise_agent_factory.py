#!/usr/bin/env python3
"""
Enterprise Agent Factory for Grand Prix Social
Creates and manages enterprise-grade agents using CommandCore OS infrastructure
"""

import os
import sys
import json
import threading
import asyncio
import logging
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Any, Optional, Callable

# Import local components
from commandcore_integration import CommandCoreIntegration, COMMANDCORE_AVAILABLE
from a_memory_core.local_dev_agent.local_dev_agent import LocalDevAgent

class EnterpriseAgentFactory:
    """
    Factory for creating and managing enterprise-grade agents
    
    Combines:
    - CommandCore OS sophisticated agent infrastructure
    - Local Qwen3 AI inference
    - Grand Prix Social domain knowledge
    - Enterprise patterns and orchestration
    """
    
    def __init__(self):
        self.factory_dir = Path(__file__).parent / "enterprise_agents"
        self.factory_dir.mkdir(exist_ok=True)
        
        # Core systems
        self.commandcore_integration = CommandCoreIntegration()
        self.local_dev_agent = LocalDevAgent()
        
        # Factory state
        self.created_agents = {}
        self.agent_templates = {}
        self.active_processes = {}
        
        # Initialize logging
        self.setup_logging()
        
        # Load agent templates
        self.load_agent_templates()
        
        self.logger.info("🏭 Enterprise Agent Factory initialized")
    
    def setup_logging(self):
        """Setup factory logging system"""
        log_file = self.factory_dir / "agent_factory.log"
        
        logging.basicConfig(
            level=logging.INFO,
            format='%(asctime)s - AgentFactory - %(levelname)s - %(message)s',
            handlers=[
                logging.FileHandler(log_file),
                logging.StreamHandler()
            ]
        )
        self.logger = logging.getLogger("EnterpriseAgentFactory")
    
    def load_agent_templates(self):
        """Load agent templates for different types of enterprise agents"""
        self.agent_templates = {
            'development_assistant': {
                'base_class': 'LocalDevAgent',
                'capabilities': ['code_analysis', 'ai_queries', 'task_assistance'],
                'memory_bridges': ['development_notes', 'current_session'],
                'priority': 'high',
                'auto_start': True
            },
            'memory_manager': {
                'base_class': 'CommandCoreIntegration', 
                'capabilities': ['memory_sync', 'cognitive_workspace', 'reasoning_chains'],
                'memory_bridges': ['all'],
                'priority': 'critical',
                'auto_start': True
            },
            'fantasy_league_specialist': {
                'base_class': 'FantasyLeagueAgent',
                'capabilities': ['fantasy_analysis', 'scoring_engine', 'user_preferences'],
                'memory_bridges': ['fantasy_data', 'user_interactions'],
                'priority': 'medium',
                'auto_start': False
            },
            'system_orchestrator': {
                'base_class': 'SystemOrchestratorAgent',
                'capabilities': ['agent_management', 'health_monitoring', 'task_delegation'],
                'memory_bridges': ['system_configs', 'historical_data'],
                'priority': 'critical',
                'auto_start': True
            }
        }
        
        self.logger.info(f"📋 Loaded {len(self.agent_templates)} agent templates")
    
    def create_agent(self, agent_type: str, agent_name: str, config: Dict = None) -> str:
        """Create a new enterprise agent instance"""
        if agent_type not in self.agent_templates:
            raise ValueError(f"Unknown agent type: {agent_type}")
        
        template = self.agent_templates[agent_type]
        config = config or {}
        
        agent_id = f"{agent_type}_{agent_name}_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
        
        try:
            # Create agent configuration
            agent_config = {
                'agent_id': agent_id,
                'agent_type': agent_type,
                'agent_name': agent_name,
                'template': template,
                'custom_config': config,
                'created_at': datetime.now().isoformat(),
                'status': 'created'
            }
            
            # Set up memory bridges
            if COMMANDCORE_AVAILABLE:
                self._setup_agent_memory_bridges(agent_id, template['memory_bridges'])
            
            # Create agent instance based on template
            agent_instance = self._instantiate_agent(agent_config)
            
            # Store agent
            self.created_agents[agent_id] = {
                'config': agent_config,
                'instance': agent_instance,
                'status': 'ready'
            }
            
            self.logger.info(f"🤖 Created enterprise agent: {agent_id}")
            return agent_id
            
        except Exception as e:
            self.logger.error(f"❌ Agent creation failed: {e}")
            raise
    
    def _instantiate_agent(self, agent_config: Dict) -> Any:
        """Create actual agent instance based on configuration"""
        template = agent_config['template']
        base_class = template['base_class']
        
        if base_class == 'LocalDevAgent':
            return LocalDevAgent()
        elif base_class == 'CommandCoreIntegration':
            return CommandCoreIntegration()
        else:
            # For other agent types, create a generic enterprise agent wrapper
            return EnterpriseAgentWrapper(agent_config, self.commandcore_integration)
    
    def _setup_agent_memory_bridges(self, agent_id: str, memory_bridges: List[str]):
        """Setup memory bridges for an agent"""
        if not COMMANDCORE_AVAILABLE:
            return
        
        try:
            if 'all' in memory_bridges:
                self.commandcore_integration.setup_default_memory_bridges()
            else:
                for bridge_type in memory_bridges:
                    # Create specific bridge configuration
                    bridge_success = self.commandcore_integration.create_memory_bridge(
                        bridge_type, 
                        f"agent_{agent_id}_{bridge_type}"
                    )
                    if bridge_success:
                        self.logger.info(f"🌉 Bridge created for {agent_id}: {bridge_type}")
                        
        except Exception as e:
            self.logger.warning(f"⚠️ Memory bridge setup failed for {agent_id}: {e}")
    
    def start_agent(self, agent_id: str) -> bool:
        """Start an enterprise agent"""
        if agent_id not in self.created_agents:
            self.logger.error(f"❌ Agent not found: {agent_id}")
            return False
        
        try:
            agent_data = self.created_agents[agent_id]
            agent_instance = agent_data['instance']
            
            # Start agent in separate thread if it has a run method
            if hasattr(agent_instance, 'run'):
                thread = threading.Thread(
                    target=agent_instance.run,
                    daemon=True,
                    name=f"Agent_{agent_id}"
                )
                thread.start()
                self.active_processes[agent_id] = thread
            
            agent_data['status'] = 'running'
            self.logger.info(f"🚀 Started enterprise agent: {agent_id}")
            return True
            
        except Exception as e:
            self.logger.error(f"❌ Agent start failed: {e}")
            return False
    
    def stop_agent(self, agent_id: str) -> bool:
        """Stop an enterprise agent"""
        if agent_id not in self.created_agents:
            return False
        
        try:
            # Stop agent process if running
            if agent_id in self.active_processes:
                # Note: In a real implementation, you'd want proper shutdown signals
                del self.active_processes[agent_id]
            
            self.created_agents[agent_id]['status'] = 'stopped'
            self.logger.info(f"🛑 Stopped enterprise agent: {agent_id}")
            return True
            
        except Exception as e:
            self.logger.error(f"❌ Agent stop failed: {e}")
            return False
    
    def create_agent_swarm(self, swarm_config: Dict) -> List[str]:
        """Create a coordinated swarm of enterprise agents"""
        swarm_name = swarm_config.get('name', 'default_swarm')
        agent_specs = swarm_config.get('agents', [])
        
        created_agent_ids = []
        
        try:
            for spec in agent_specs:
                agent_type = spec['type']
                agent_name = f"{swarm_name}_{spec['name']}"
                config = spec.get('config', {})
                
                agent_id = self.create_agent(agent_type, agent_name, config)
                created_agent_ids.append(agent_id)
                
                # Auto-start if configured
                if self.agent_templates[agent_type].get('auto_start', False):
                    self.start_agent(agent_id)
            
            self.logger.info(f"🐝 Created agent swarm '{swarm_name}' with {len(created_agent_ids)} agents")
            return created_agent_ids
            
        except Exception as e:
            self.logger.error(f"❌ Swarm creation failed: {e}")
            # Clean up any partially created agents
            for agent_id in created_agent_ids:
                self.stop_agent(agent_id)
            raise
    
    def get_factory_status(self) -> Dict[str, Any]:
        """Get comprehensive factory status"""
        return {
            'factory_status': 'operational',
            'commandcore_available': COMMANDCORE_AVAILABLE,
            'total_agents': len(self.created_agents),
            'running_agents': len([a for a in self.created_agents.values() if a['status'] == 'running']),
            'available_templates': list(self.agent_templates.keys()),
            'agent_summary': {
                agent_id: {
                    'type': data['config']['agent_type'],
                    'name': data['config']['agent_name'],
                    'status': data['status'],
                    'created_at': data['config']['created_at']
                }
                for agent_id, data in self.created_agents.items()
            },
            'commandcore_metrics': self.commandcore_integration.get_commandcore_performance_metrics()
        }
    
    def create_default_enterprise_setup(self) -> List[str]:
        """Create a default enterprise agent setup for Grand Prix Social"""
        swarm_config = {
            'name': 'gps_enterprise',
            'agents': [
                {
                    'type': 'development_assistant',
                    'name': 'dev_assist',
                    'config': {'specialization': 'fullstack_development'}
                },
                {
                    'type': 'memory_manager', 
                    'name': 'memory_mgr',
                    'config': {'sync_interval': 300}
                },
                {
                    'type': 'system_orchestrator',
                    'name': 'orchestrator',
                    'config': {'monitoring_interval': 30}
                }
            ]
        }
        
        return self.create_agent_swarm(swarm_config)

class EnterpriseAgentWrapper:
    """Generic wrapper for enterprise agents that don't have specific implementations"""
    
    def __init__(self, config: Dict, commandcore_integration: CommandCoreIntegration):
        self.config = config
        self.commandcore = commandcore_integration
        self.status = 'initialized'
        
    def run(self):
        """Generic run method for enterprise agent"""
        self.status = 'running'
        # Implement generic agent behavior here
        pass
    
    def stop(self):
        """Stop the agent"""
        self.status = 'stopped'

def main():
    """Main entry point for enterprise agent factory"""
    print("🏭 Grand Prix Social - Enterprise Agent Factory")
    print("Powered by CommandCore OS")
    print("=" * 60)
    
    factory = EnterpriseAgentFactory()
    
    # Create default enterprise setup
    print("\n🚀 Creating default enterprise agent setup...")
    agent_ids = factory.create_default_enterprise_setup()
    
    print(f"✅ Created {len(agent_ids)} enterprise agents:")
    for agent_id in agent_ids:
        print(f"  - {agent_id}")
    
    # Display factory status
    print("\n📊 Factory Status:")
    status = factory.get_factory_status()
    print(json.dumps(status, indent=2, default=str))
    
    # Interactive mode
    print("\n🔧 Entering interactive mode...")
    print("Commands: create, start, stop, status, list, exit")
    
    while True:
        try:
            command = input("\nFactory> ").strip().lower()
            
            if command == 'exit':
                break
            elif command == 'status':
                status = factory.get_factory_status()
                print(json.dumps(status, indent=2, default=str))
            elif command == 'list':
                print("Available agent templates:")
                for template_name in factory.agent_templates.keys():
                    print(f"  - {template_name}")
            elif command.startswith('create '):
                # Simple create command: create <type> <name>
                parts = command.split()
                if len(parts) >= 3:
                    agent_type, agent_name = parts[1], parts[2]
                    try:
                        agent_id = factory.create_agent(agent_type, agent_name)
                        print(f"✅ Created agent: {agent_id}")
                    except Exception as e:
                        print(f"❌ Creation failed: {e}")
                else:
                    print("Usage: create <type> <name>")
            elif command.startswith('start '):
                agent_id = command[6:].strip()
                success = factory.start_agent(agent_id)
                if success:
                    print(f"✅ Started agent: {agent_id}")
                else:
                    print(f"❌ Failed to start agent: {agent_id}")
            elif command.startswith('stop '):
                agent_id = command[5:].strip()
                success = factory.stop_agent(agent_id)
                if success:
                    print(f"✅ Stopped agent: {agent_id}")
                else:
                    print(f"❌ Failed to stop agent: {agent_id}")
            else:
                print("Unknown command. Available: create, start, stop, status, list, exit")
                
        except KeyboardInterrupt:
            break
        except Exception as e:
            print(f"Error: {e}")
    
    print("\n👋 Enterprise Agent Factory shutting down...")

if __name__ == "__main__":
    main()