
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
Agent Coordinator - Integration with Memory Core agents for Merged system
"""

import os
import json
import logging
from datetime import datetime
from typing import List

class AgentCoordinator:
    def __init__(self):
        self.setup_logging()
        self.memory_core_path = os.path.join(os.path.dirname(__file__), '..', '..', '..', '..', 'a_memory_core')
        
    def setup_logging(self):
        logging.basicConfig(level=logging.INFO)
        self.logger = logging.getLogger(__name__)
    
    def notify_orchestrator(self, message: str, priority: str = "normal"):
        """Send notification to Memory Orchestrator Agent"""
        try:
            orchestrator_inbox = os.path.join(self.memory_core_path, 'memory_orchestrator_agent', 'orchestrator_inbox.json')
            
            notification = {
                "timestamp": datetime.now().strftime("%m-%d_%I-%M%p"),
                "source": "merged_system",
                "message": message,
                "priority": priority,
                "type": "merge_notification"
            }
            
            # Load existing inbox or create new
            inbox = []
            if os.path.exists(orchestrator_inbox):
                with open(orchestrator_inbox, 'r') as f:
                    inbox = json.load(f)
            
            inbox.append(notification)
            
            with open(orchestrator_inbox, 'w') as f:
                json.dump(inbox, f, indent=2)
            
            self.logger.info(f"Notified orchestrator: {message}")
            
        except Exception as e:
            self.logger.error(f"Failed to notify orchestrator: {e}")
    
    def request_merge_processing(self, file_paths: List[str]):
        """Request Memory Merger Agent to process files"""
        try:
            merger_path = os.path.join(os.path.dirname(__file__), '..', '..', '..', '..', 'memory_agents', 'memory_merger_agent')
            
            if not os.path.exists(merger_path):
                self.logger.warning("Memory Merger Agent not found")
                return False
            
            request = {
                "timestamp": datetime.now().strftime("%m-%d_%I-%M%p"),
                "source": "merged_monitor",
                "file_paths": file_paths,
                "action": "merge",
                "priority": "normal"
            }
            
            request_file = os.path.join(merger_path, 'merger_requests.json')
            
            requests = []
            if os.path.exists(request_file):
                with open(request_file, 'r') as f:
                    requests = json.load(f)
            
            requests.append(request)
            
            with open(request_file, 'w') as f:
                json.dump(requests, f, indent=2)
            
            self.logger.info(f"Requested merging of {len(file_paths)} files")
            return True
            
        except Exception as e:
            self.logger.error(f"Failed to request merging: {e}")
            return False
    
    def update_agent_registry(self, status: str):
        """Update agent registry with merged system status"""
        try:
            registry_path = os.path.join(self.memory_core_path, 'memory_agent_registry_agent', 'agent_registry.json')
            
            if not os.path.exists(registry_path):
                self.logger.warning("Agent registry not found")
                return
            
            with open(registry_path, 'r') as f:
                registry = json.load(f)
            
            # Update merged system status
            if 'merged_system' not in registry:
                registry['merged_system'] = {}
            
            registry['merged_system'].update({
                'status': status,
                'last_update': datetime.now().strftime("%m-%d_%I-%M%p"),
                'location': 'c_short_term_memory/merged'
            })
            
            with open(registry_path, 'w') as f:
                json.dump(registry, f, indent=2)
            
            self.logger.info(f"Updated agent registry with status: {status}")
            
        except Exception as e:
            self.logger.error(f"Failed to update agent registry: {e}")
    
    def get_memory_context(self, query: str):
        """Request context from Memory Context Router Agent"""
        try:
            router_path = os.path.join(self.memory_core_path, 'memory_context_router_agent')
            
            if not os.path.exists(router_path):
                self.logger.warning("Memory Context Router Agent not found")
                return None
            
            context_request = {
                "timestamp": datetime.now().strftime("%m-%d_%I-%M%p"),
                "source": "merged_system",
                "query": query,
                "type": "context_request"
            }
            
            request_file = os.path.join(router_path, 'context_requests.json')
            
            requests = []
            if os.path.exists(request_file):
                with open(request_file, 'r') as f:
                    requests = json.load(f)
            
            requests.append(context_request)
            
            with open(request_file, 'w') as f:
                json.dump(requests, f, indent=2)
            
            self.logger.info(f"Requested context for: {query}")
            return True
            
        except Exception as e:
            self.logger.error(f"Failed to request context: {e}")
            return None
    
    def coordinate_with_index_system(self, merged_group_id: str):
        """Coordinate with Index system about new merged content"""
        try:
            index_coordinator_path = os.path.join(os.path.dirname(__file__), '..', '..', '..', 'Index', 'scripts', 'utils', 'agent_coordinator.py')
            
            coordination_request = {
                "timestamp": datetime.now().strftime("%m-%d_%I-%M%p"),
                "source": "merged_system",
                "merged_group_id": merged_group_id,
                "action": "index_merged_content",
                "priority": "normal"
            }
            
            # For now, log the coordination request
            self.logger.info(f"Coordination request prepared for merged group: {merged_group_id}")
            return True
            
        except Exception as e:
            self.logger.error(f"Failed to coordinate with index system: {e}")
            return False
    
    def notify_summary_system(self, merged_content_path: str):
        """Notify Summary system about new merged content"""
        try:
            summary_coordinator_path = os.path.join(os.path.dirname(__file__), '..', '..', '..', 'summary', 'scripts', 'utils', 'agent_coordinator.py')
            
            notification = {
                "timestamp": datetime.now().strftime("%m-%d_%I-%M%p"),
                "source": "merged_system",
                "merged_content_path": merged_content_path,
                "action": "summarize_merged_content",
                "priority": "normal"
            }
            
            # For now, log the notification
            self.logger.info(f"Summary notification prepared for: {merged_content_path}")
            return True
            
        except Exception as e:
            self.logger.error(f"Failed to notify summary system: {e}")
            return False
