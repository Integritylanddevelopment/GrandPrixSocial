
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
import hashlib
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Any, Optional, Tuple

# Add the root project directory to Python path for imports
project_root = Path(__file__).parent.parent.parent.parent.absolute()
if str(project_root) not in sys.path:
    sys.path.insert(0, str(project_root))

# Add parent directory for tag intelligence
sys.path.append(os.path.dirname(os.path.dirname(__file__)))
from memory.a_memory_core.tag_intelligence_engine.tag_intelligence_engine import TagIntelligenceEngine

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='[%(asctime)s] [%(levelname)s] %(message)s',
    datefmt='%m-%d_%I-%M%p'
)

class MemoryRouterAgent:
    """
    CommandCore Memory Router Agent
    
    AI-powered routing system for memory content with semantic analysis.
    Routes content to appropriate memory buckets using tag intelligence.
    
    Authority Level: ROUTING
    Version: 2.0 (aligned with Core Logic v2.0)
    """
    
    def __init__(self, base_path):
        self.base_path = base_path
        self.current_dir = os.path.dirname(__file__)
        self.state_path = os.path.join(self.current_dir, "memory_router_agent_state.json")
        self.interaction_log_path = os.path.join(self.current_dir, "agent_interactions.log")
        
        # Global timestamp format (from Core Logic v2.0)
        self.mandatory_timestamp_format = "%m-%d_%I-%M%p"
        
        # Core Logic v2.0 memory buckets
        self.allowed_buckets = [
            "b_long_term_memory",
            "c_short_term_memory", 
            "d_working_memory",
            "e_procedural",
            "f_semantic",
            "g_episodic"
        ]
        
        # Initialize AI tagging system
        self.tag_engine = TagIntelligenceEngine()
        self.ai_routing_enabled = True
        
        self.load_state()
        self._ensure_directories()
        logging.info(f"MemoryRouterAgent initialized - Version 2.0")

    def get_current_timestamp(self) -> str:
        """Generate timestamp using mandatory format."""
        return datetime.now().strftime(self.mandatory_timestamp_format)

    def load_state(self):
        """Load agent state from JSON file."""
        try:
            if os.path.exists(self.state_path):
                with open(self.state_path, "r", encoding="utf-8") as f:
                    self.state = json.load(f)
            else:
                self.state = self._create_default_state()
                self.save_state()
            logging.info("Router state loaded successfully")
        except Exception as e:
            logging.error(f"Error loading state: {e}")
            self.state = self._create_default_state()

    def _create_default_state(self):
        """Create default state configuration."""
        return {
            "agent_name": "memory_router_agent",
            "version": "2.0",
            "total_routes": 0,
            "successful_routes": 0,
            "failed_routes": 0,
            "ai_routes": 0,
            "manual_routes": 0,
            "bucket_distribution": {bucket: 0 for bucket in self.allowed_buckets},
            "last_update": self.get_current_timestamp(),
            "ai_routing_enabled": True
        }

    def _ensure_directories(self):
        for bucket in self.allowed_buckets:
            os.makedirs(os.path.join(self.base_path, bucket), exist_ok=True)

    def route_by_tags(self, content):
        tags = content.lower()
        if "definition" in tags or "architecture" in tags:
            return "semantic_memory"
        elif "step-by-step" in tags or "instructions" in tags:
            return "procedural_memory"
        elif "prompt" in tags and "response" in tags:
            return "episodic_memory"
        else:
            return "working_memory"

    def auto_route(self, content: str) -> str:
        lines = content.splitlines()
        memory_type = None
        for line in lines:
            if line.startswith("#type:"):
                memory_type = line.split(":", 1)[1].strip()
                break

        if not memory_type or memory_type not in self.allowed_buckets:
            raise ValueError(f"Invalid or missing memory type in content: {memory_type}")

        self.indexer_agent.save_to_bucket(memory_type, content)
        log_message = f"[AUTO-ROUTED] {datetime.now().isoformat()} — Routed to {memory_type} via tag"
        self.log_decision(memory_type, log_message)

        return memory_type

    def log_decision(self, bucket, message):
        log_path = os.path.join(self.base_path, "logs", "memory_router_log.txt")
        os.makedirs(os.path.dirname(log_path), exist_ok=True)
        with open(log_path, "a", encoding="utf-8") as f:
            f.write(f"[{datetime.now().isoformat()}] Bucket: {bucket}, Message: {message}\n")

if __name__ == "__main__":
    base_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../"))
    agent = MemoryRouterAgent(base_path)
    test_content = "#type:semantic\nThis is a test content for semantic memory."
    routed_bucket = agent.auto_route(test_content)
    print(f"Content routed to: {routed_bucket}")
