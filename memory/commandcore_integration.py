#!/usr/bin/env python3
"""
CommandCore Integration Layer for Grand Prix Social
Bridges CommandCore OS enterprise agents with Grand Prix Social memory system
"""

import os
import sys
import json
import logging
import asyncio
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Any, Optional

# Add CommandCore to path
COMMANDCORE_PATH = Path("C:\\D_Drive\\ActiveProjects\\CommandCore_Project")
sys.path.insert(0, str(COMMANDCORE_PATH))

# CommandCore imports
try:
    from memory.a_memory_core.master_orchestrator_agent.master_orchestrator_agent import MasterOrchestrator
    from memory.d_working_memory.cognitive_workspace.cognitive_engine import CognitiveWorkspace, ActiveThought
    from memory.a_memory_core.memory_router_agent.memory_router_agent import MemoryRouterAgent
    COMMANDCORE_AVAILABLE = True
except ImportError as e:
    logging.warning(f"CommandCore not available: {e}")
    COMMANDCORE_AVAILABLE = False

class CommandCoreIntegration:
    """
    Integration layer between CommandCore OS and Grand Prix Social
    
    Provides enterprise-grade agent capabilities:
    - Memory management with cognitive workspace
    - Intelligent routing and tagging
    - Agent orchestration
    - Cross-project knowledge sharing
    """
    
    def __init__(self, gps_memory_path: str = None):
        self.gps_memory_path = gps_memory_path or str(Path(__file__).parent)
        self.commandcore_path = str(COMMANDCORE_PATH)
        
        # Initialize logging
        self.setup_logging()
        
        # Integration state
        self.state = {
            'status': 'initializing',
            'commandcore_available': COMMANDCORE_AVAILABLE,
            'memory_bridges': {},
            'active_agents': {},
            'sync_status': 'pending'
        }
        
        # Initialize CommandCore components if available
        self.cognitive_workspace = None
        self.memory_router = None
        self.orchestrator = None
        
        if COMMANDCORE_AVAILABLE:
            self.initialize_commandcore_systems()
        
        self.logger.info("🌉 CommandCore Integration Layer initialized")
    
    def setup_logging(self):
        """Setup integrated logging system"""
        log_dir = Path(self.gps_memory_path) / "logs"
        log_dir.mkdir(exist_ok=True)
        
        log_file = log_dir / "commandcore_integration.log"
        
        logging.basicConfig(
            level=logging.INFO,
            format='%(asctime)s - CCIntegration - %(levelname)s - %(message)s',
            handlers=[
                logging.FileHandler(log_file),
                logging.StreamHandler()
            ]
        )
        self.logger = logging.getLogger("CommandCoreIntegration")
    
    def initialize_commandcore_systems(self):
        """Initialize CommandCore components"""
        try:
            # Initialize cognitive workspace for advanced memory management
            self.cognitive_workspace = CognitiveWorkspace(config={
                'max_concurrent_thoughts': 50,
                'thought_lifetime_minutes': 180,
                'auto_decay_enabled': True,
                'priority_preservation': True
            })
            
            # Initialize memory router for intelligent content routing
            self.memory_router = MemoryRouterAgent(self.commandcore_path)
            
            self.state['status'] = 'commandcore_ready'
            self.logger.info("✅ CommandCore systems initialized")
            
        except Exception as e:
            self.logger.error(f"❌ CommandCore initialization failed: {e}")
            self.state['status'] = 'commandcore_failed'
    
    def create_memory_bridge(self, gps_memory_type: str, commandcore_bucket: str) -> bool:
        """Create a bridge between GPS memory type and CommandCore bucket"""
        if not COMMANDCORE_AVAILABLE:
            return False
        
        try:
            bridge_config = {
                'gps_memory_type': gps_memory_type,
                'commandcore_bucket': commandcore_bucket,
                'sync_direction': 'bidirectional',
                'created_at': datetime.now().isoformat(),
                'sync_count': 0
            }
            
            self.state['memory_bridges'][gps_memory_type] = bridge_config
            self.logger.info(f"🌉 Memory bridge created: {gps_memory_type} <-> {commandcore_bucket}")
            return True
            
        except Exception as e:
            self.logger.error(f"❌ Failed to create memory bridge: {e}")
            return False
    
    def sync_memory_to_commandcore(self, content: str, memory_type: str, metadata: Dict = None) -> str:
        """Sync memory content from GPS to CommandCore"""
        if not self.cognitive_workspace:
            return "CommandCore not available"
        
        try:
            # Determine thought type based on content analysis
            thought_type = self._analyze_thought_type(content)
            
            # Create thought in cognitive workspace
            thought_id = self.cognitive_workspace.add_thought(
                content=content,
                thought_type=thought_type,
                priority=0.7,
                agent_id='gps_integration',
                tags=[memory_type, 'gps_sync', 'cross_project'],
                metadata=metadata or {}
            )
            
            # Update bridge stats
            if memory_type in self.state['memory_bridges']:
                self.state['memory_bridges'][memory_type]['sync_count'] += 1
            
            self.logger.info(f"💾 Synced to CommandCore: {thought_id}")
            return thought_id
            
        except Exception as e:
            self.logger.error(f"❌ CommandCore sync failed: {e}")
            return f"Sync failed: {str(e)}"
    
    def query_commandcore_memory(self, query: str, memory_types: List[str] = None, max_results: int = 5) -> List[Dict]:
        """Query CommandCore cognitive workspace for relevant memories"""
        if not self.cognitive_workspace:
            return []
        
        try:
            # Search thoughts with GPS-related tags
            search_tags = ['gps_sync'] + (memory_types or [])
            
            thoughts = self.cognitive_workspace.search_thoughts(
                query=query,
                tags=search_tags,
                max_results=max_results
            )
            
            # Convert thoughts to dictionary format
            results = []
            for thought in thoughts:
                results.append({
                    'thought_id': thought.thought_id,
                    'content': thought.content,
                    'type': thought.thought_type,
                    'priority': thought.priority,
                    'created_at': thought.created_at.isoformat(),
                    'tags': thought.tags,
                    'access_count': thought.access_count
                })
            
            self.logger.info(f"🔍 CommandCore query returned {len(results)} results")
            return results
            
        except Exception as e:
            self.logger.error(f"❌ CommandCore query failed: {e}")
            return []
    
    def create_reasoning_chain(self, initial_thought: str, agent_id: str = 'gps_integration') -> str:
        """Create a reasoning chain in CommandCore for complex problem solving"""
        if not self.cognitive_workspace:
            return "CommandCore not available"
        
        try:
            # Create initial thought
            root_thought_id = self.cognitive_workspace.add_thought(
                content=initial_thought,
                thought_type='reasoning',
                priority=0.8,
                agent_id=agent_id,
                tags=['reasoning_chain', 'gps_development']
            )
            
            # Create reasoning chain
            chain_id = self.cognitive_workspace.create_reasoning_chain(
                root_thought_id=root_thought_id,
                agent_id=agent_id,
                chain_type='linear'
            )
            
            self.logger.info(f"🔗 Created reasoning chain: {chain_id}")
            return chain_id
            
        except Exception as e:
            self.logger.error(f"❌ Reasoning chain creation failed: {e}")
            return f"Failed: {str(e)}"
    
    def extend_reasoning_chain(self, chain_id: str, thought_content: str) -> bool:
        """Add a thought to an existing reasoning chain"""
        if not self.cognitive_workspace:
            return False
        
        try:
            # Create new thought
            thought_id = self.cognitive_workspace.add_thought(
                content=thought_content,
                thought_type='reasoning',
                priority=0.7,
                agent_id='gps_integration',
                tags=['reasoning_chain', 'chain_extension']
            )
            
            # Extend the chain
            success = self.cognitive_workspace.extend_reasoning_chain(chain_id, thought_id)
            
            if success:
                self.logger.info(f"🔗 Extended reasoning chain {chain_id}")
            
            return success
            
        except Exception as e:
            self.logger.error(f"❌ Chain extension failed: {e}")
            return False
    
    def _analyze_thought_type(self, content: str) -> str:
        """Analyze content to determine appropriate thought type"""
        content_lower = content.lower()
        
        if any(keyword in content_lower for keyword in ['how to', 'steps', 'process', 'procedure']):
            return 'reasoning'
        elif any(keyword in content_lower for keyword in ['define', 'definition', 'concept', 'meaning']):
            return 'context'
        elif any(keyword in content_lower for keyword in ['conclude', 'result', 'outcome', 'solution']):
            return 'conclusion'
        elif any(keyword in content_lower for keyword in ['question', 'ask', 'why', 'how', 'what']):
            return 'question'
        else:
            return 'context'
    
    def get_commandcore_performance_metrics(self) -> Dict[str, Any]:
        """Get performance metrics from CommandCore systems"""
        if not self.cognitive_workspace:
            return {'status': 'unavailable'}
        
        try:
            metrics = self.cognitive_workspace.get_performance_metrics()
            
            return {
                'cognitive_workspace': metrics,
                'memory_bridges': len(self.state['memory_bridges']),
                'total_syncs': sum(bridge.get('sync_count', 0) for bridge in self.state['memory_bridges'].values()),
                'integration_status': self.state['status']
            }
            
        except Exception as e:
            self.logger.error(f"❌ Metrics retrieval failed: {e}")
            return {'status': 'error', 'message': str(e)}
    
    def setup_default_memory_bridges(self):
        """Set up default memory bridges between GPS and CommandCore"""
        default_bridges = [
            ('fantasy_data', 'f_semantic'),
            ('user_interactions', 'g_episodic'),
            ('development_notes', 'd_working_memory'),
            ('system_configs', 'e_procedural'),
            ('historical_data', 'b_long_term_memory'),
            ('current_session', 'c_short_term_memory')
        ]
        
        for gps_type, cc_bucket in default_bridges:
            self.create_memory_bridge(gps_type, cc_bucket)
        
        self.logger.info(f"🌉 Created {len(default_bridges)} default memory bridges")
    
    def get_integration_status(self) -> Dict[str, Any]:
        """Get comprehensive integration status"""
        return {
            'commandcore_available': self.state['commandcore_available'],
            'status': self.state['status'],
            'memory_bridges': self.state['memory_bridges'],
            'performance_metrics': self.get_commandcore_performance_metrics() if COMMANDCORE_AVAILABLE else None,
            'capabilities': self._get_available_capabilities()
        }
    
    def _get_available_capabilities(self) -> List[str]:
        """Get list of available capabilities"""
        capabilities = ['logging', 'state_management']
        
        if COMMANDCORE_AVAILABLE and self.cognitive_workspace:
            capabilities.extend([
                'cognitive_workspace',
                'thought_management', 
                'reasoning_chains',
                'memory_search',
                'cross_project_sync'
            ])
        
        if COMMANDCORE_AVAILABLE and self.memory_router:
            capabilities.extend([
                'intelligent_routing',
                'content_analysis',
                'bucket_management'
            ])
        
        return capabilities

def main():
    """Standalone testing of CommandCore integration"""
    print("🌉 CommandCore Integration Layer")
    print("=" * 50)
    
    integration = CommandCoreIntegration()
    
    # Setup default bridges
    integration.setup_default_memory_bridges()
    
    # Test sync
    if COMMANDCORE_AVAILABLE:
        print("\nTesting memory sync...")
        thought_id = integration.sync_memory_to_commandcore(
            "Test integration between Grand Prix Social and CommandCore OS",
            "development_notes",
            {'source': 'integration_test', 'priority': 'high'}
        )
        print(f"Synced thought ID: {thought_id}")
        
        # Test query
        print("\nTesting memory query...")
        results = integration.query_commandcore_memory("integration test")
        print(f"Query results: {len(results)} thoughts found")
        
        # Test reasoning chain
        print("\nTesting reasoning chain...")
        chain_id = integration.create_reasoning_chain(
            "How can we best integrate CommandCore agents with Grand Prix Social development?"
        )
        print(f"Created reasoning chain: {chain_id}")
    
    # Display status
    print("\nIntegration Status:")
    status = integration.get_integration_status()
    print(json.dumps(status, indent=2, default=str))

if __name__ == "__main__":
    main()