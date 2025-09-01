
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
import os
import sys
import json
import logging
import importlib
import hashlib
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Any, Optional, Tuple

# Add the root project directory to Python path for imports
project_root = Path(__file__).parent.parent.parent.parent.absolute()
if str(project_root) not in sys.path:
    sys.path.insert(0, str(project_root))

# Configure logging for the router agent
logging.basicConfig(
    level=logging.INFO,
    format='[%(asctime)s] [%(levelname)s] %(message)s',
    datefmt='%m-%d_%I-%M%p'
)

class MemoryAgentRouterAgent:
    """
    CommandCore Memory Agent Router Agent
    
    Routes memory requests between agents with AI-powered routing intelligence.
    Integrates with tagging system for semantic routing decisions.
    
    Authority Level: ROUTING
    Version: 2.0 (aligned with Core Logic v2.0)
    """
    
    def __init__(self, base_path):
        self.base_path = base_path
        self.current_dir = os.path.dirname(__file__)
        self.registry_path = os.path.join(base_path, "memory", "a_memory_core", "memory_agent_core", "agent_registry.json")
        self.routes_log_path = os.path.join(self.current_dir, "memory_agent_routes.log")
        self.interaction_log_path = os.path.join(self.current_dir, "agent_interactions.log")
        self.state_path = os.path.join(self.current_dir, "memory_agent_router_agent_state.json")
        
        # Global timestamp format (from Core Logic v2.0)
        self.mandatory_timestamp_format = "%m-%d_%I-%M%p"
        
        # AI tagging integration
        self.tag_intelligence_path = os.path.join(self.base_path, "memory", "a_memory_core", "tag_intelligence_engine.py")
        self.ai_routing_enabled = True
        
        self.load_state()
        self.load_registry()
        logging.info(f"MemoryAgentRouterAgent initialized - Version 2.0")

    def load_state(self):
        """Load agent state from JSON file."""
        try:
            if os.path.exists(self.state_path):
                with open(self.state_path, "r", encoding="utf-8") as f:
                    self.state = json.load(f)
            else:
                self.state = self._create_default_state()
                self.save_state()
            logging.info("State loaded successfully")
        except Exception as e:
            logging.error(f"Error loading state: {e}")
            self.state = self._create_default_state()

    def _create_default_state(self):
        """Create default state configuration."""
        return {
            "total_routes": 0,
            "successful_routes": 0,
            "failed_routes": 0,
            "last_route": "",
            "most_used_agents": {},
            "route_patterns": {},
            "performance_metrics": {
                "average_route_time_ms": 0,
                "last_route_time_ms": 0
            },
            "error_count": 0,
            "last_error": ""
        }

    def save_state(self):
        """Save state to JSON file."""
        try:
            with open(self.state_path, "w", encoding="utf-8") as f:
                json.dump(self.state, f, indent=4)
        except Exception as e:
            logging.error(f"Error saving state: {e}")

    def load_registry(self):
        """Load the agent registry for routing decisions."""
        try:
            if os.path.exists(self.registry_path):
                with open(self.registry_path, "r", encoding="utf-8") as f:
                    self.agent_registry = json.load(f)
                logging.info(f"Loaded registry with {len(self.agent_registry)} agents")
            else:
                self.agent_registry = {}
                logging.warning("Agent registry not found, using empty registry")
        except Exception as e:
            logging.error(f"Error loading registry: {e}")
            self.agent_registry = {}

    def log_interaction(self, action: str, result: str = ""):
        """Log agent interactions with standardized timestamp format."""
        timestamp = datetime.now().strftime("%m-%d_%I-%M%p")
        log_entry = f"[{timestamp}] [MemoryAgentRouterAgent] {action} — {result}\n"
        
        try:
            with open(self.interaction_log_path, "a", encoding="utf-8") as log_file:
                log_file.write(log_entry)
        except Exception as e:
            logging.error(f"Error writing to interaction log: {e}")

    def log_route(self, agent_name: str, query: str, success: bool = True):
        """Log routing decisions with standardized timestamp format."""
        timestamp = datetime.now().strftime("%m-%d_%I-%M%p")
        status = "SUCCESS" if success else "FAILED"
        entry = f"[{timestamp}] [{status}] Routed to: {agent_name} — Query: {query[:100]}{'...' if len(query) > 100 else ''}\n"
        
        try:
            with open(self.routes_log_path, "a", encoding="utf-8") as f:
                f.write(entry)
            
            # Update statistics
            self.state["total_routes"] += 1
            if success:
                self.state["successful_routes"] += 1
                self.state["most_used_agents"][agent_name] = self.state["most_used_agents"].get(agent_name, 0) + 1
            else:
                self.state["failed_routes"] += 1
                
            self.state["last_route"] = timestamp
            self.save_state()
            
        except Exception as e:
            logging.error(f"Error writing to routes log: {e}")

    def get_routing_keywords(self):
        """Define routing keywords for different agent types."""
        return {
            "memory_search_agent": [
                "search", "find", "lookup", "query", "retrieve", "get"
            ],
            "memory_recall_agent": [
                "recall", "remember", "what did", "previous", "before", "history"
            ],
            "memory_summarizer_agent": [
                "summarize", "summary", "overview", "digest", "brief", "what's this about"
            ],
            "memory_decay_agent": [
                "decay", "archive", "promote", "clean up", "expire", "old"
            ],
            "memory_merger_agent": [
                "merge", "combine", "consolidate", "join", "unite"
            ],
            "memory_indexer_agent": [
                "index", "catalog", "organize", "structure", "tag"
            ],
            "memory_renamer_agent": [
                "rename", "organize files", "file management", "naming"
            ],
            "context_injection_agent": [
                "context", "inject", "enhance", "enrich", "add context"
            ],
            "memory_tag_insight_agent": [
                "tags", "insights", "analysis", "patterns", "tag analysis"
            ],
            "schema_updater": [
                "schema", "update schema", "schema change", "structure update"
            ]
        }

    def route_query(self, query: str) -> str:
        """Route a query to the appropriate memory agent based on keywords and registry."""
        start_time = datetime.now()
        
        try:
            routing_keywords = self.get_routing_keywords()
            query_lower = query.lower()
            
            # Find matching agents based on keywords
            for agent_name, keywords in routing_keywords.items():
                if any(keyword in query_lower for keyword in keywords):
                    # Check if agent is available in registry
                    if agent_name in self.agent_registry:
                        agent_info = self.agent_registry[agent_name]
                        
                        # Check if agent is active
                        if agent_info.get("status") == "active":
                            result = self._execute_agent(agent_name, query, agent_info)
                            
                            # Calculate route time
                            route_time = (datetime.now() - start_time).total_seconds() * 1000
                            self.state["performance_metrics"]["last_route_time_ms"] = route_time
                            
                            if result:
                                self.log_route(agent_name, query, True)
                                self.log_interaction(f"Routed query to {agent_name}", "SUCCESS")
                                return f"[{agent_name.replace('_', ' ').title()}]\n{result}"
                            else:
                                self.log_route(agent_name, query, False)
                                self.log_interaction(f"Failed to execute {agent_name}", "FAILED")
                        else:
                            logging.warning(f"Agent {agent_name} is not active (status: {agent_info.get('status')})")
                    else:
                        logging.warning(f"Agent {agent_name} not found in registry")
            
            # No matching agent found
            self.log_interaction("No matching agent found", query[:50])
            return "No matching agent found for the query. Available agents: " + ", ".join(self.agent_registry.keys())
            
        except Exception as e:
            self.state["error_count"] += 1
            self.state["last_error"] = str(e)
            self.save_state()
            logging.error(f"Error routing query: {e}")
            return f"Error routing query: {str(e)}"

    def _execute_agent(self, agent_name: str, query: str, agent_info: dict) -> str:
        """Execute the specified agent with the given query."""
        try:
            module_path = agent_info.get("module_path")
            if not module_path:
                logging.error(f"No module path found for agent {agent_name}")
                return ""
            
            # Dynamically import and execute the agent
            module = importlib.import_module(module_path)
            
            # Try to get the main function
            if hasattr(module, 'main'):
                agent_function = getattr(module, 'main')
                result = agent_function(query)
                return str(result) if result else ""
            elif hasattr(module, agent_name.split('_')[-1]):  # Try agent-specific function
                function_name = agent_name.split('_')[-1]
                agent_function = getattr(module, function_name)
                result = agent_function(query)
                return str(result) if result else ""
            else:
                logging.warning(f"No suitable function found in {module_path}")
                return f"Agent {agent_name} loaded but no suitable function found"
                
        except ImportError as e:
            logging.error(f"Could not import agent {agent_name}: {e}")
            return ""
        except Exception as e:
            logging.error(f"Error executing agent {agent_name}: {e}")
            return ""

    def get_available_agents(self) -> list:
        """Get list of available active agents."""
        return [name for name, info in self.agent_registry.items() 
                if isinstance(info, dict) and info.get("status") == "active"]

    def get_routing_statistics(self) -> dict:
        """Get routing statistics and performance metrics."""
        return {
            "state": self.state,
            "available_agents": len(self.get_available_agents()),
            "success_rate": (self.state["successful_routes"] / max(self.state["total_routes"], 1)) * 100,
            "most_used_agents": self.state["most_used_agents"]
        }

    def route(self, query: str) -> str:
        """Main routing function (legacy compatibility)."""
        return self.route_query(query)

def main(auto_start=False, query=None):
    """Main entry point for the Memory Agent Router Agent."""
    # Determine base path dynamically
    current_dir = Path(__file__).parent.absolute()
    base_path = current_dir.parent.parent.parent  # Go up to commandcore-helper root
    
    logging.info(f"Memory Agent Router Agent starting with base_path: {base_path}")
    
    # Initialize the router agent
    router_agent = MemoryAgentRouterAgent(str(base_path))
    
    if query:
        # Route the provided query
        result = router_agent.route_query(query)
        print(result)
        return result
    elif auto_start:
        # Auto-start mode - just initialize and log readiness
        available_agents = router_agent.get_available_agents()
        logging.info(f"Router agent ready. Available agents: {len(available_agents)}")
        router_agent.log_interaction("Auto-start complete", f"{len(available_agents)} agents available")
    else:
        logging.info("Memory Agent Router Agent initialized (manual mode)")
    
    return router_agent

if __name__ == "__main__":
    if len(sys.argv) > 1:
        # Route the query provided as command line argument
        query = " ".join(sys.argv[1:])
        main(query=query)
    else:
        # No query provided, run in auto-start mode
        main(auto_start=True)