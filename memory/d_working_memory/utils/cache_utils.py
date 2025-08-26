
# Auto-generated logging configuration
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - cache_utils - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('cache_utils.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

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
"""
WORKING MEMORY CACHE UTILITIES
=============================

Subordinate cache utilities for working memory Redis integration.
Provides caching helpers for memory agents to use with Redis backend.

This is NOT a standalone agent - utilities called by memory agents.

Features:
- Redis session cache management
- TTL-aware cache operations
- Session state preservation utilities
- Live reasoning support cache
- Memory agent coordination cache helpers

Authority: SUBORDINATE_UTILITY
"""

import json
import logging
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional

# Redis import with fallback
try:
    import redis
    REDIS_AVAILABLE = True
except ImportError:
    REDIS_AVAILABLE = False
    logging.warning("Redis not available - using file-based fallback cache")

class WorkingMemoryCacheUtils:
    """
    Redis-based cache utilities for working memory operations.
    Used by memory agents for real-time session management.
    """
    
    def __init__(self, calling_agent: str = "unknown", redis_host: str = "localhost", 
                 redis_port: int = 6379, redis_db: int = 0):
        self.calling_agent = calling_agent
        self.timestamp = datetime.now().strftime("%m-%d_%I-%M%p")
        
        # Initialize Redis connection
        if REDIS_AVAILABLE:
            try:
                self.redis_client = redis.Redis(
                    host=redis_host, 
                    port=redis_port, 
                    db=redis_db,
                    decode_responses=True
                )
                # Test connection
                self.redis_client.ping()
                self.cache_backend = "redis"
                logging.info(f"[{calling_agent}] Connected to Redis cache")
            except Exception as e:
                logging.warning(f"Redis connection failed: {e}, using file fallback")
                self.cache_backend = "file"
                self.redis_client = None
        else:
            self.cache_backend = "file"
            self.redis_client = None

    def cache_session_for_agent(self, session_id: str, session_data: Dict[str, Any], 
                               ttl_hours: int = 2) -> bool:
        """
        Cache session data for calling memory agent.
        
        Key format: wm:{calling_agent}:{session_id}
        """
        cache_key = f"wm:{self.calling_agent}:{session_id}"
        
        # Add metadata
        enriched_data = {
            **session_data,
            "cached_by": self.calling_agent,
            "cached_at": self.timestamp,
            "ttl_hours": ttl_hours
        }
        
        if self.cache_backend == "redis":
            try:
                # Store in Redis with TTL
                ttl_seconds = ttl_hours * 3600
                self.redis_client.setex(
                    cache_key, 
                    ttl_seconds, 
                    json.dumps(enriched_data)
                )
                logging.info(f"[{self.calling_agent}] Cached session {session_id} (TTL: {ttl_hours}h)")
                return True
            except Exception as e:
                logging.error(f"Redis cache error: {e}")
                return False
        else:
            # File-based fallback
            return self._file_cache_session(session_id, enriched_data, ttl_hours)

    def get_cached_session_for_agent(self, session_id: str) -> Optional[Dict[str, Any]]:
        """Get cached session data for calling memory agent."""
        cache_key = f"wm:{self.calling_agent}:{session_id}"
        
        if self.cache_backend == "redis":
            try:
                cached_data = self.redis_client.get(cache_key)
                if cached_data:
                    return json.loads(cached_data)
                return None
            except Exception as e:
                logging.error(f"Redis retrieval error: {e}")
                return None
        else:
            return self._file_get_session(session_id)

    def cache_agent_state(self, state_data: Dict[str, Any], ttl_hours: int = 1) -> bool:
        """Cache current agent state for coordination."""
        cache_key = f"agent_state:{self.calling_agent}"
        
        state_with_metadata = {
            **state_data,
            "updated_at": self.timestamp,
            "agent": self.calling_agent
        }
        
        if self.cache_backend == "redis":
            try:
                ttl_seconds = ttl_hours * 3600
                self.redis_client.setex(
                    cache_key,
                    ttl_seconds,
                    json.dumps(state_with_metadata)
                )
                return True
            except Exception as e:
                logging.error(f"State cache error: {e}")
                return False
        else:
            return self._file_cache_state(state_with_metadata, ttl_hours)

    def get_agent_coordination_info(self) -> Dict[str, Any]:
        """Get coordination info for all active memory agents."""
        if self.cache_backend == "redis":
            try:
                agent_keys = self.redis_client.keys("agent_state:*")
                coordination_info = {}
                
                for key in agent_keys:
                    agent_name = key.replace("agent_state:", "")
                    state_data = self.redis_client.get(key)
                    if state_data:
                        coordination_info[agent_name] = json.loads(state_data)
                
                return coordination_info
            except Exception as e:
                logging.error(f"Coordination info error: {e}")
                return {}
        else:
            return self._file_get_coordination_info()

    def invalidate_session_cache(self, session_id: str) -> bool:
        """Invalidate cached session (for TTL expiration)."""
        cache_key = f"wm:{self.calling_agent}:{session_id}"
        
        if self.cache_backend == "redis":
            try:
                self.redis_client.delete(cache_key)
                logging.info(f"[{self.calling_agent}] Invalidated cache for {session_id}")
                return True
            except Exception as e:
                logging.error(f"Cache invalidation error: {e}")
                return False
        else:
            return self._file_invalidate_session(session_id)

    def cleanup_expired_cache(self) -> int:
        """Clean up expired cache entries (Redis handles TTL automatically)."""
        if self.cache_backend == "redis":
            # Redis handles TTL automatically
            return 0
        else:
            return self._file_cleanup_expired()

    # File-based fallback methods
    def _file_cache_session(self, session_id: str, data: Dict[str, Any], ttl_hours: int) -> bool:
        """File-based session caching fallback."""
        import os
        cache_dir = os.path.join(os.path.dirname(__file__), "..", "temp", "cache")
        os.makedirs(cache_dir, exist_ok=True)
        
        cache_file = os.path.join(cache_dir, f"{self.calling_agent}_{session_id}.json")
        
        try:
            # Add expiration time
            expires_at = datetime.now() + timedelta(hours=ttl_hours)
            data["expires_at"] = expires_at.isoformat()
            
            with open(cache_file, "w") as f:
                json.dump(data, f, indent=2)
            return True
        except Exception as e:
            logging.error(f"File cache error: {e}")
            return False

    def _file_get_session(self, session_id: str) -> Optional[Dict[str, Any]]:
        """File-based session retrieval fallback."""
        import os
        cache_dir = os.path.join(os.path.dirname(__file__), "..", "temp", "cache")
        cache_file = os.path.join(cache_dir, f"{self.calling_agent}_{session_id}.json")
        
        try:
            if os.path.exists(cache_file):
                with open(cache_file, "r") as f:
                    data = json.load(f)
                
                # Check expiration
                expires_at = datetime.fromisoformat(data.get("expires_at", "1970-01-01T00:00:00"))
                if datetime.now() > expires_at:
                    os.remove(cache_file)
                    return None
                
                return data
            return None
        except Exception as e:
            logging.error(f"File retrieval error: {e}")
            return None

    def _file_cache_state(self, state_data: Dict[str, Any], ttl_hours: int) -> bool:
        """File-based state caching fallback."""
        import os
        cache_dir = os.path.join(os.path.dirname(__file__), "..", "temp", "cache")
        os.makedirs(cache_dir, exist_ok=True)
        
        state_file = os.path.join(cache_dir, f"state_{self.calling_agent}.json")
        
        try:
            expires_at = datetime.now() + timedelta(hours=ttl_hours)
            state_data["expires_at"] = expires_at.isoformat()
            
            with open(state_file, "w") as f:
                json.dump(state_data, f, indent=2)
            return True
        except Exception as e:
            logging.error(f"State file cache error: {e}")
            return False

    def _file_get_coordination_info(self) -> Dict[str, Any]:
        """File-based coordination info fallback."""
        import os
        import glob
        
        cache_dir = os.path.join(os.path.dirname(__file__), "..", "temp", "cache")
        coordination_info = {}
        
        try:
            state_files = glob.glob(os.path.join(cache_dir, "state_*.json"))
            
            for state_file in state_files:
                with open(state_file, "r") as f:
                    data = json.load(f)
                
                # Check expiration
                expires_at = datetime.fromisoformat(data.get("expires_at", "1970-01-01T00:00:00"))
                if datetime.now() > expires_at:
                    os.remove(state_file)
                    continue
                
                agent_name = data.get("agent", "unknown")
                coordination_info[agent_name] = data
            
            return coordination_info
        except Exception as e:
            logging.error(f"Coordination file error: {e}")
            return {}

    def _file_invalidate_session(self, session_id: str) -> bool:
        """File-based session invalidation fallback."""
        import os
        cache_dir = os.path.join(os.path.dirname(__file__), "..", "temp", "cache")
        cache_file = os.path.join(cache_dir, f"{self.calling_agent}_{session_id}.json")
        
        try:
            if os.path.exists(cache_file):
                os.remove(cache_file)
            return True
        except Exception as e:
            logging.error(f"File invalidation error: {e}")
            return False

    def _file_cleanup_expired(self) -> int:
        """File-based expired cache cleanup."""
        import os
        import glob
        
        cache_dir = os.path.join(os.path.dirname(__file__), "..", "temp", "cache")
        cleaned_count = 0
        
        try:
            cache_files = glob.glob(os.path.join(cache_dir, "*.json"))
            
            for cache_file in cache_files:
                try:
                    with open(cache_file, "r") as f:
                        data = json.load(f)
                    
                    expires_at = datetime.fromisoformat(data.get("expires_at", "1970-01-01T00:00:00"))
                    if datetime.now() > expires_at:
                        os.remove(cache_file)
                        cleaned_count += 1
                except Exception:
                    # Remove corrupted cache files
                    os.remove(cache_file)
                    cleaned_count += 1
            
            return cleaned_count
        except Exception as e:
            logging.error(f"Cleanup error: {e}")
            return 0


# Utility functions for memory agents to import
def cache_session_for_agent(calling_agent: str, session_id: str, 
                           session_data: Dict[str, Any], ttl_hours: int = 2) -> bool:
    """Utility for memory agents to cache session data."""
    cache_utils = WorkingMemoryCacheUtils(calling_agent)
    return cache_utils.cache_session_for_agent(session_id, session_data, ttl_hours)

def get_cached_session_for_agent(calling_agent: str, session_id: str) -> Optional[Dict[str, Any]]:
    """Utility for memory agents to retrieve cached session data."""
    cache_utils = WorkingMemoryCacheUtils(calling_agent)
    return cache_utils.get_cached_session_for_agent(session_id)

def update_agent_coordination_cache(calling_agent: str, state_data: Dict[str, Any]) -> bool:
    """Utility for memory agents to update coordination cache."""
    cache_utils = WorkingMemoryCacheUtils(calling_agent)
    return cache_utils.cache_agent_state(state_data)

def get_agent_coordination_info() -> Dict[str, Any]:
    """Utility to get coordination info for all active agents."""
    cache_utils = WorkingMemoryCacheUtils("coordination_query")
    return cache_utils.get_agent_coordination_info()
