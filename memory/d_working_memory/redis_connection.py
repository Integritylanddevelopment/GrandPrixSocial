"""
REDIS CONNECTION UTILITY - Working Memory Redis Backend
======================================================

Centralized Redis connection management for Working Memory system.
Provides connection pooling, error handling, and configuration management.

Features:
- Connection pooling with automatic retry
- Environment-based configuration
- Health monitoring and reconnection
- Key namespace management
- Serialization utilities for complex data types
"""

import json
import os
import time
import pickle
import threading
from datetime import datetime, timedelta
from typing import Dict, Any, Optional, Union, List
from dataclasses import asdict, is_dataclass
import logging

try:
    import redis
    from redis.connection import ConnectionPool
    from redis.exceptions import ConnectionError, TimeoutError, RedisError
except ImportError:
    redis = None
    ConnectionPool = None
    logging.error("Redis not available. Install with: pip install redis>=5.0.0")

from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class RedisConnectionManager:
    """
    Centralized Redis connection manager for Working Memory.
    
    Provides connection pooling, health monitoring, and key management
    with automatic failover to local storage if Redis is unavailable.
    """
    
    def __init__(self):
        """Initialize Redis connection manager."""
        self.redis_client = None
        self.connection_pool = None
        self.is_connected = False
        self.last_health_check = 0
        self.health_check_interval = 30  # seconds
        self.fallback_storage = {}  # In-memory fallback
        self.connection_lock = threading.RLock()
        
        # Configuration from environment
        self.config = {
            'host': os.getenv('REDIS_HOST', 'localhost'),
            'port': int(os.getenv('REDIS_PORT', 6379)),
            'db': int(os.getenv('REDIS_DB', 0)),
            'password': os.getenv('REDIS_PASSWORD', None),
            'max_connections': int(os.getenv('REDIS_MAX_CONNECTIONS', 20)),
            'socket_timeout': int(os.getenv('REDIS_SOCKET_TIMEOUT', 5)),
            'socket_connect_timeout': int(os.getenv('REDIS_SOCKET_CONNECT_TIMEOUT', 5)),
            'key_prefix': os.getenv('WM_REDIS_KEY_PREFIX', 'wm'),
            'session_ttl': int(os.getenv('WM_SESSION_TTL', 7200)),
            'cache_ttl': int(os.getenv('WM_CACHE_TTL', 3600))
        }
        
        # Initialize connection
        self._initialize_connection()
        
        logger.info(f"RedisConnectionManager initialized (Connected: {self.is_connected})")
    
    def _initialize_connection(self):
        """Initialize Redis connection with retry logic."""
        if not redis:
            logger.warning("Redis library not available, using fallback storage")
            return
        
        try:
            # Create connection pool
            self.connection_pool = ConnectionPool(
                host=self.config['host'],
                port=self.config['port'],
                db=self.config['db'],
                password=self.config['password'] if self.config['password'] else None,
                max_connections=self.config['max_connections'],
                socket_timeout=self.config['socket_timeout'],
                socket_connect_timeout=self.config['socket_connect_timeout'],
                decode_responses=False  # We'll handle encoding ourselves
            )
            
            # Create Redis client
            self.redis_client = redis.Redis(connection_pool=self.connection_pool)
            
            # Test connection
            self.redis_client.ping()
            self.is_connected = True
            self.last_health_check = time.time()
            
            logger.info(f"Redis connected: {self.config['host']}:{self.config['port']}")
            
        except Exception as e:
            logger.warning(f"Redis connection failed: {e}, using fallback storage")
            self.is_connected = False
            self.redis_client = None
    
    def _health_check(self):
        """Perform Redis health check and reconnect if needed."""
        current_time = time.time()
        
        if current_time - self.last_health_check < self.health_check_interval:
            return self.is_connected
        
        with self.connection_lock:
            try:
                if self.redis_client:
                    self.redis_client.ping()
                    self.is_connected = True
                else:
                    self._initialize_connection()
                
                self.last_health_check = current_time
                return self.is_connected
                
            except Exception as e:
                logger.warning(f"Redis health check failed: {e}")
                self.is_connected = False
                return False
    
    def _get_key(self, key_type: str, session_id: Optional[str] = None, 
                 memory_key: Optional[str] = None, suffix: Optional[str] = None) -> str:
        """
        Generate Redis key with consistent namespace.
        
        Args:
            key_type: Type of key ('session', 'thought', 'context', 'cache', etc.)
            session_id: Session identifier
            memory_key: Memory/data identifier
            suffix: Optional suffix for the key
            
        Returns:
            Formatted Redis key
        """
        key_parts = [self.config['key_prefix'], key_type]
        
        if session_id:
            key_parts.append(session_id)
        
        if memory_key:
            key_parts.append(memory_key)
        
        if suffix:
            key_parts.append(suffix)
        
        return ':'.join(key_parts)
    
    def _serialize_value(self, value: Any) -> bytes:
        """Serialize value for Redis storage."""
        try:
            # Handle dataclasses
            if is_dataclass(value):
                value = asdict(value)
            
            # Convert to JSON first (handles most basic types)
            json_str = json.dumps(value, default=str, ensure_ascii=False)
            return json_str.encode('utf-8')
            
        except (TypeError, ValueError):
            # Fallback to pickle for complex objects
            return pickle.dumps(value)
    
    def _deserialize_value(self, data: bytes) -> Any:
        """Deserialize value from Redis storage."""
        try:
            # Try JSON first
            json_str = data.decode('utf-8')
            return json.loads(json_str)
            
        except (UnicodeDecodeError, json.JSONDecodeError):
            # Fallback to pickle
            return pickle.loads(data)
    
    def set(self, key_type: str, value: Any, session_id: Optional[str] = None,
            memory_key: Optional[str] = None, ttl: Optional[int] = None,
            suffix: Optional[str] = None) -> bool:
        """
        Store value in Redis with automatic serialization.
        
        Args:
            key_type: Type of key ('session', 'thought', 'context', etc.)
            value: Value to store
            session_id: Session identifier
            memory_key: Memory identifier
            ttl: Time to live in seconds
            suffix: Optional key suffix
            
        Returns:
            Success status
        """
        try:
            # Health check and reconnect if needed
            if not self._health_check():
                # Use fallback storage
                full_key = self._get_key(key_type, session_id, memory_key, suffix)
                self.fallback_storage[full_key] = {
                    'value': value,
                    'expires': time.time() + (ttl or self.config['cache_ttl'])
                }
                return True
            
            # Use Redis
            full_key = self._get_key(key_type, session_id, memory_key, suffix)
            serialized_value = self._serialize_value(value)
            
            if ttl:
                return bool(self.redis_client.setex(full_key, ttl, serialized_value))
            else:
                return bool(self.redis_client.set(full_key, serialized_value))
                
        except Exception as e:
            logger.error(f"Redis set failed for key {key_type}: {e}")
            return False
    
    def get(self, key_type: str, session_id: Optional[str] = None,
            memory_key: Optional[str] = None, suffix: Optional[str] = None,
            default: Any = None) -> Any:
        """
        Retrieve value from Redis with automatic deserialization.
        
        Args:
            key_type: Type of key
            session_id: Session identifier
            memory_key: Memory identifier
            suffix: Optional key suffix
            default: Default value if not found
            
        Returns:
            Stored value or default
        """
        try:
            full_key = self._get_key(key_type, session_id, memory_key, suffix)
            
            # Check fallback storage first
            if full_key in self.fallback_storage:
                entry = self.fallback_storage[full_key]
                if time.time() < entry['expires']:
                    return entry['value']
                else:
                    del self.fallback_storage[full_key]
            
            # Health check and reconnect if needed
            if not self._health_check():
                return default
            
            # Use Redis
            data = self.redis_client.get(full_key)
            if data is None:
                return default
            
            return self._deserialize_value(data)
            
        except Exception as e:
            logger.error(f"Redis get failed for key {key_type}: {e}")
            return default
    
    def delete(self, key_type: str, session_id: Optional[str] = None,
               memory_key: Optional[str] = None, suffix: Optional[str] = None) -> bool:
        """
        Delete value from Redis.
        
        Args:
            key_type: Type of key
            session_id: Session identifier
            memory_key: Memory identifier
            suffix: Optional key suffix
            
        Returns:
            Success status
        """
        try:
            full_key = self._get_key(key_type, session_id, memory_key, suffix)
            
            # Remove from fallback storage
            if full_key in self.fallback_storage:
                del self.fallback_storage[full_key]
            
            # Health check and reconnect if needed
            if not self._health_check():
                return True  # Already removed from fallback
            
            # Use Redis
            return bool(self.redis_client.delete(full_key))
            
        except Exception as e:
            logger.error(f"Redis delete failed for key {key_type}: {e}")
            return False
    
    def exists(self, key_type: str, session_id: Optional[str] = None,
               memory_key: Optional[str] = None, suffix: Optional[str] = None) -> bool:
        """
        Check if key exists in Redis.
        
        Args:
            key_type: Type of key
            session_id: Session identifier
            memory_key: Memory identifier
            suffix: Optional key suffix
            
        Returns:
            True if key exists
        """
        try:
            full_key = self._get_key(key_type, session_id, memory_key, suffix)
            
            # Check fallback storage
            if full_key in self.fallback_storage:
                entry = self.fallback_storage[full_key]
                if time.time() < entry['expires']:
                    return True
                else:
                    del self.fallback_storage[full_key]
            
            # Health check and reconnect if needed
            if not self._health_check():
                return False
            
            # Use Redis
            return bool(self.redis_client.exists(full_key))
            
        except Exception as e:
            logger.error(f"Redis exists check failed for key {key_type}: {e}")
            return False
    
    def keys_by_pattern(self, pattern: str) -> List[str]:
        """
        Get keys matching a pattern.
        
        Args:
            pattern: Redis key pattern (e.g., 'wm:session:*')
            
        Returns:
            List of matching keys
        """
        try:
            # Health check and reconnect if needed
            if not self._health_check():
                # Return keys from fallback storage
                import fnmatch
                return [key for key in self.fallback_storage.keys() 
                       if fnmatch.fnmatch(key, pattern)]
            
            # Use Redis
            keys = self.redis_client.keys(pattern)
            return [key.decode('utf-8') if isinstance(key, bytes) else key for key in keys]
            
        except Exception as e:
            logger.error(f"Redis keys pattern search failed: {e}")
            return []
    
    def set_hash(self, key_type: str, field_values: Dict[str, Any],
                 session_id: Optional[str] = None, memory_key: Optional[str] = None,
                 ttl: Optional[int] = None, suffix: Optional[str] = None) -> bool:
        """
        Store hash/dictionary in Redis.
        
        Args:
            key_type: Type of key
            field_values: Dictionary of field-value pairs
            session_id: Session identifier
            memory_key: Memory identifier
            ttl: Time to live in seconds
            suffix: Optional key suffix
            
        Returns:
            Success status
        """
        try:
            full_key = self._get_key(key_type, session_id, memory_key, suffix)
            
            # Health check and reconnect if needed
            if not self._health_check():
                # Store in fallback as regular value
                self.fallback_storage[full_key] = {
                    'value': field_values,
                    'expires': time.time() + (ttl or self.config['cache_ttl'])
                }
                return True
            
            # Serialize each field value
            serialized_fields = {}
            for field, value in field_values.items():
                serialized_fields[field] = self._serialize_value(value)
            
            # Use Redis hash
            result = self.redis_client.hset(full_key, mapping=serialized_fields)
            
            if ttl:
                self.redis_client.expire(full_key, ttl)
            
            return True
            
        except Exception as e:
            logger.error(f"Redis hash set failed for key {key_type}: {e}")
            return False
    
    def get_hash(self, key_type: str, session_id: Optional[str] = None,
                 memory_key: Optional[str] = None, suffix: Optional[str] = None) -> Dict[str, Any]:
        """
        Retrieve hash/dictionary from Redis.
        
        Args:
            key_type: Type of key
            session_id: Session identifier
            memory_key: Memory identifier
            suffix: Optional key suffix
            
        Returns:
            Dictionary of field-value pairs
        """
        try:
            full_key = self._get_key(key_type, session_id, memory_key, suffix)
            
            # Check fallback storage
            if full_key in self.fallback_storage:
                entry = self.fallback_storage[full_key]
                if time.time() < entry['expires']:
                    return entry['value']
                else:
                    del self.fallback_storage[full_key]
            
            # Health check and reconnect if needed
            if not self._health_check():
                return {}
            
            # Use Redis hash
            hash_data = self.redis_client.hgetall(full_key)
            if not hash_data:
                return {}
            
            # Deserialize each field value
            result = {}
            for field, value in hash_data.items():
                field_name = field.decode('utf-8') if isinstance(field, bytes) else field
                result[field_name] = self._deserialize_value(value)
            
            return result
            
        except Exception as e:
            logger.error(f"Redis hash get failed for key {key_type}: {e}")
            return {}
    
    def increment(self, key_type: str, session_id: Optional[str] = None,
                  memory_key: Optional[str] = None, suffix: Optional[str] = None,
                  amount: int = 1) -> int:
        """
        Increment a counter in Redis.
        
        Args:
            key_type: Type of key
            session_id: Session identifier
            memory_key: Memory identifier
            suffix: Optional key suffix
            amount: Amount to increment by
            
        Returns:
            New counter value
        """
        try:
            full_key = self._get_key(key_type, session_id, memory_key, suffix)
            
            # Health check and reconnect if needed
            if not self._health_check():
                # Use fallback storage
                if full_key not in self.fallback_storage:
                    self.fallback_storage[full_key] = {
                        'value': 0,
                        'expires': time.time() + self.config['cache_ttl']
                    }
                
                self.fallback_storage[full_key]['value'] += amount
                return self.fallback_storage[full_key]['value']
            
            # Use Redis
            return self.redis_client.incrby(full_key, amount)
            
        except Exception as e:
            logger.error(f"Redis increment failed for key {key_type}: {e}")
            return 0
    
    def get_connection_status(self) -> Dict[str, Any]:
        """Get Redis connection status and statistics."""
        return {
            'connected': self.is_connected,
            'config': self.config,
            'last_health_check': self.last_health_check,
            'fallback_entries': len(self.fallback_storage),
            'connection_pool_stats': {
                'created_connections': getattr(self.connection_pool, 'created_connections', 0),
                'available_connections': getattr(self.connection_pool, '_available_connections', []),
                'in_use_connections': getattr(self.connection_pool, '_in_use_connections', set())
            } if self.connection_pool else {}
        }
    
    def cleanup_fallback_storage(self):
        """Clean up expired entries in fallback storage."""
        current_time = time.time()
        expired_keys = [
            key for key, entry in self.fallback_storage.items()
            if current_time >= entry['expires']
        ]
        
        for key in expired_keys:
            del self.fallback_storage[key]
        
        logger.info(f"Cleaned up {len(expired_keys)} expired fallback entries")

# Global Redis connection manager instance
_redis_manager = None

def get_redis_manager() -> RedisConnectionManager:
    """Get global Redis connection manager instance."""
    global _redis_manager
    if _redis_manager is None:
        _redis_manager = RedisConnectionManager()
    return _redis_manager

# Convenience functions for common operations
def wm_set(key_type: str, value: Any, session_id: Optional[str] = None,
           memory_key: Optional[str] = None, ttl: Optional[int] = None) -> bool:
    """Store value in Working Memory Redis backend."""
    return get_redis_manager().set(key_type, value, session_id, memory_key, ttl)

def wm_get(key_type: str, session_id: Optional[str] = None,
           memory_key: Optional[str] = None, default: Any = None) -> Any:
    """Retrieve value from Working Memory Redis backend."""
    return get_redis_manager().get(key_type, session_id, memory_key, default=default)

def wm_delete(key_type: str, session_id: Optional[str] = None,
              memory_key: Optional[str] = None) -> bool:
    """Delete value from Working Memory Redis backend."""
    return get_redis_manager().delete(key_type, session_id, memory_key)

def wm_exists(key_type: str, session_id: Optional[str] = None,
              memory_key: Optional[str] = None) -> bool:
    """Check if key exists in Working Memory Redis backend."""
    return get_redis_manager().exists(key_type, session_id, memory_key)

if __name__ == "__main__":
    # Test Redis connection and functionality
    print("Testing Redis Connection Manager...")
    
    manager = get_redis_manager()
    
    # Test basic operations
    test_session_id = "test_session_001"
    test_memory_key = "test_thought"
    test_value = {
        "content": "This is a test thought",
        "timestamp": datetime.now().strftime("%m-%d_%I-%M%p"),
        "priority": 5
    }
    
    # Test set
    success = wm_set("thought", test_value, test_session_id, test_memory_key, ttl=300)
    print(f"Set operation: {'SUCCESS' if success else 'FAILED'}")
    
    # Test get
    retrieved = wm_get("thought", test_session_id, test_memory_key)
    print(f"Get operation: {'SUCCESS' if retrieved else 'FAILED'}")
    if retrieved:
        print(f"Retrieved value: {retrieved}")
    
    # Test exists
    exists = wm_exists("thought", test_session_id, test_memory_key)
    print(f"Exists check: {'EXISTS' if exists else 'NOT FOUND'}")
    
    # Test hash operations
    hash_data = {
        "field1": "value1",
        "field2": {"nested": "data"},
        "field3": 12345
    }
    hash_success = manager.set_hash("test_hash", hash_data, test_session_id, "hash_test", ttl=300)
    print(f"Hash set operation: {'SUCCESS' if hash_success else 'FAILED'}")
    
    retrieved_hash = manager.get_hash("test_hash", test_session_id, "hash_test")
    print(f"Hash get operation: {'SUCCESS' if retrieved_hash else 'FAILED'}")
    if retrieved_hash:
        print(f"Retrieved hash: {retrieved_hash}")
    
    # Show connection status
    status = manager.get_connection_status()
    print(f"\nConnection Status:")
    print(f"  Connected: {status['connected']}")
    print(f"  Fallback entries: {status['fallback_entries']}")
    print(f"  Redis host: {status['config']['host']}:{status['config']['port']}")
    
    # Cleanup
    wm_delete("thought", test_session_id, test_memory_key)
    manager.delete("test_hash", test_session_id, "hash_test")
    print("\nTest cleanup completed")
