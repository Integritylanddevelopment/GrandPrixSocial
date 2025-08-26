
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
Agent Coordinator - Integration with Memory Core agents for Index system
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
                "source": "index_system",
                "message": message,
                "priority": priority,
                "type": "index_notification"
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
    
    def request_indexing(self, file_path: str):
        """Request Memory Indexer Agent to process a file"""
        try:
            indexer_path = os.path.join(self.memory_core_path, 'memory_indexer_agent')
            
            if not os.path.exists(indexer_path):
                self.logger.warning("Memory Indexer Agent not found")
                return False
            
            request = {
                "timestamp": datetime.now().strftime("%m-%d_%I-%M%p"),
                "source": "index_monitor",
                "file_path": file_path,
                "action": "index",
                "priority": "normal"
            }
            
            request_file = os.path.join(indexer_path, 'indexer_requests.json')
            
            requests = []
            if os.path.exists(request_file):
                with open(request_file, 'r') as f:
                    requests = json.load(f)
            
            requests.append(request)
            
            with open(request_file, 'w') as f:
                json.dump(requests, f, indent=2)
            
            self.logger.info(f"Requested indexing of: {file_path}")
            return True
            
        except Exception as e:
            self.logger.error(f"Failed to request indexing: {e}")
            return False
    
    def update_agent_registry(self, status: str):
        """Update agent registry with index system status"""
        try:
            registry_path = os.path.join(self.memory_core_path, 'memory_agent_registry_agent', 'agent_registry.json')
            
            if not os.path.exists(registry_path):
                self.logger.warning("Agent registry not found")
                return
            
            with open(registry_path, 'r') as f:
                registry = json.load(f)
            
            # Update index system status
            if 'index_system' not in registry:
                registry['index_system'] = {}
            
            registry['index_system'].update({
                'status': status,
                'last_update': datetime.now().strftime("%m-%d_%I-%M%p"),
                'location': 'c_short_term_memory/Index'
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
                "source": "index_system",
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
    
    def coordinate_with_tag_intelligence(self, content: str, tags: List[str]):
        """Coordinate with Tag Intelligence Engine for content tagging"""
        try:
            # This will integrate with the Tag Intelligence Engine when implemented
            tag_request = {
                "timestamp": datetime.now().strftime("%m-%d_%I-%M%p"),
                "source": "index_system",
                "content_preview": content[:500] + "..." if len(content) > 500 else content,
                "suggested_tags": tags,
                "action": "generate_tags"
            }
            
            # For now, log the request - will be connected to Tag Intelligence Engine later
            self.logger.info(f"Tag intelligence request prepared for content with {len(tags)} suggested tags")
            return True
            
        except Exception as e:
            self.logger.error(f"Failed to coordinate with tag intelligence: {e}")
            return False
