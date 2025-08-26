
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
REAL-TIME CACHE ENGINE - Working Memory High-Speed Cache
=======================================================

Sub-millisecond cache system for CommandCore OS cognitive workspace.
Provides in-memory caching with optional Redis backend for ultra-fast data access.

Features:
- Sub-millisecond read/write operations
- Lock-free concurrent access for reads
- Priority-based eviction policies
- Automatic failover to persistent storage
- Real-time performance monitoring
- Memory pressure management

Interactions:
- Session Engine: Caches session state and snapshots
- Cognitive Engine: Caches active thoughts and reasoning chains
- Context Injection: Caches context items and query results
- Agent Coordination: Caches agent workspace data
"""

import json
import time
import threading
import weakref
from datetime import datetime, timedelta
from typing import Dict, Any, Optional, List, Tuple, Union, Callable
from concurrent.futures import ThreadPoolExecutor
from dataclasses import dataclass, asdict
from collections import OrderedDict, defaultdict
import hashlib
import logging
import gc
import psutil
import os

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@dataclass
class CacheItem:
    """Represents a cached item with metadata."""
    key: str
    value: Any
    priority: int  # Higher = more important
    access_count: int
    last_access_time: float
    creation_time: float
    size_bytes: int
    ttl_seconds: Optional[int]
    tags: List[str]
    metadata: Dict[str, Any]

@dataclass
class CacheStats:
    """Cache performance statistics."""
    total_requests: int
    cache_hits: int
    cache_misses: int
    hit_rate: float
    average_access_time_ms: float
    memory_usage_mb: float
    eviction_count: int
    items_count: int
    last_cleanup_time: str

class LockFreeReadCache:
    """
    Lock-free cache optimized for concurrent reads with minimal write contention.
    Uses atomic operations and copy-on-write for thread safety.
    """
    
    def __init__(self, max_size: int = 10000):
        self.max_size = max_size
        self._data = {}  # Primary data store
        self._metadata = {}  # Item metadata
        self._write_lock = threading.RLock()  # Only for writes
        self._stats = CacheStats(0, 0, 0, 0.0, 0.0, 0.0, 0, 0, "")
        
    def get(self, key: str) -> Optional[Any]:
        """Lock-free read operation."""
        start_time = time.perf_counter()
        
        # No locks needed for reads - atomic dict access
        item = self._data.get(key)
        if item is not None:
            # Update access metadata without blocking
            self._update_access_metadata(key, start_time)
            self._stats.cache_hits += 1
            return item
        
        self._stats.cache_misses += 1
        self._stats.total_requests += 1
        access_time = (time.perf_counter() - start_time) * 1000
        self._update_average_access_time(access_time)
        return None
    
    def put(self, key: str, value: Any, priority: int = 1, ttl_seconds: Optional[int] = None, 
            tags: Optional[List[str]] = None) -> bool:
        """Thread-safe write operation with minimal locking."""
        with self._write_lock:
            # Check if eviction is needed
            if len(self._data) >= self.max_size and key not in self._data:
                self._evict_items(1)
            
            # Store item
            self._data[key] = value
            self._metadata[key] = {
                'priority': priority,
                'access_count': 1,
                'last_access_time': time.perf_counter(),
                'creation_time': time.perf_counter(),
                'ttl_seconds': ttl_seconds,
                'tags': tags or [],
                'size_bytes': self._estimate_size(value)
            }
            
            self._stats.items_count = len(self._data)
            return True
    
    def _update_access_metadata(self, key: str, access_time: float):
        """Update access metadata without blocking reads."""
        # Use a separate thread to update metadata to avoid blocking
        def update_metadata():
            with self._write_lock:
                if key in self._metadata:
                    self._metadata[key]['access_count'] += 1
                    self._metadata[key]['last_access_time'] = access_time
        
        # Execute in background to keep reads non-blocking
        threading.Thread(target=update_metadata, daemon=True).start()
    
    def _evict_items(self, count: int):
        """Evict items based on priority and access patterns."""
        if not self._data:
            return
        
        # Calculate eviction scores (lower = evict first)
        eviction_candidates = []
        current_time = time.perf_counter()
        
        for key, metadata in self._metadata.items():
            score = self._calculate_eviction_score(metadata, current_time)
            eviction_candidates.append((score, key))
        
        # Sort by eviction score and remove lowest scoring items
        eviction_candidates.sort()
        for _, key in eviction_candidates[:count]:
            if key in self._data:
                del self._data[key]
                del self._metadata[key]
                self._stats.eviction_count += 1
    
    def _calculate_eviction_score(self, metadata: Dict[str, Any], current_time: float) -> float:
        """Calculate eviction score (lower = evict first)."""
        priority = metadata.get('priority', 1)
        access_count = metadata.get('access_count', 1)
        last_access = metadata.get('last_access_time', current_time)
        
        # Time since last access (in hours)
        hours_since_access = (current_time - last_access) / 3600
        
        # Combined score: higher priority and recent access = higher score
        score = (priority * access_count) / (1 + hours_since_access)
        return score
    
    def _estimate_size(self, obj: Any) -> int:
        """Estimate object size in bytes."""
        try:
            if isinstance(obj, (str, bytes)):
                return len(obj)
            elif isinstance(obj, (int, float)):
                return 8
            elif isinstance(obj, (list, tuple)):
                return sum(self._estimate_size(item) for item in obj)
            elif isinstance(obj, dict):
                return sum(self._estimate_size(k) + self._estimate_size(v) for k, v in obj.items())
            else:
                return 64  # Default estimate
        except:
            return 64
    
    def _update_average_access_time(self, access_time_ms: float):
        """Update average access time with minimal overhead."""
        # Simple exponential moving average
        if self._stats.average_access_time_ms == 0:
            self._stats.average_access_time_ms = access_time_ms
        else:
            alpha = 0.1  # Smoothing factor
            self._stats.average_access_time_ms = (
                alpha * access_time_ms + 
                (1 - alpha) * self._stats.average_access_time_ms
            )

class RealTimeCacheEngine:
    """
    High-performance cache engine optimized for real-time access patterns.
    
    Provides multiple cache layers with different optimization strategies:
    - Hot cache: Lock-free, in-memory for ultra-fast access
    - Warm cache: Priority-based with TTL support
    - Cold cache: Persistent storage fallback
    """
    
    def __init__(self, config_path: str = None):
        """Initialize the real-time cache engine."""
        # Load configuration
        self.config = self._load_config(config_path) if config_path else self._default_config()
        
        # Initialize cache layers
        self.hot_cache = LockFreeReadCache(max_size=self.config.get('hot_cache_max_items', 5000))
        self.warm_cache = OrderedDict()  # LRU-style cache
        self.warm_cache_lock = threading.RLock()
        
        # Cache configuration
        self.max_warm_cache_size = self.config.get('warm_cache_max_items', 20000)
        self.max_memory_mb = self.config.get('cache_size_mb', 1024)
        self.eviction_policy = self.config.get('eviction_policy', 'lru_with_priority')
        
        # Optional Redis backend
        self.redis_client = None
        self.redis_enabled = self.config.get('secondary_cache', '') == 'redis_optional'
        if self.redis_enabled:
            self._initialize_redis()
        
        # Performance tracking
        self.performance_metrics = {
            'hot_cache_hits': 0,
            'warm_cache_hits': 0,
            'cold_cache_hits': 0,
            'total_misses': 0,
            'total_requests': 0,
            'access_times_ms': [],
            'memory_pressure_events': 0,
            'eviction_events': 0
        }
        
        # Memory monitoring
        self.memory_monitor = threading.Thread(target=self._monitor_memory_pressure, daemon=True)
        self.memory_monitor.start()
        
        # Cleanup scheduler
        self.cleanup_scheduler = threading.Thread(target=self._periodic_cleanup, daemon=True)
        self.cleanup_scheduler.start()
        
        logger.info("RealTimeCacheEngine initialized with high-performance configuration")
    
    def get(self, key: str, default: Any = None) -> Any:
        """
        Retrieve value from cache with sub-millisecond target access time.
        
        Args:
            key: Cache key
            default: Default value if key not found
            
        Returns:
            Cached value or default
        """
        start_time = time.perf_counter()
        self.performance_metrics['total_requests'] += 1
        
        try:
            # Try hot cache first (lock-free, fastest)
            value = self.hot_cache.get(key)
            if value is not None:
                self.performance_metrics['hot_cache_hits'] += 1
                self._record_access_time(start_time)
                return value
            
            # Try warm cache (with lock, still fast)
            with self.warm_cache_lock:
                if key in self.warm_cache:
                    value = self.warm_cache[key]['value']
                    # Move to end (LRU)
                    self.warm_cache.move_to_end(key)
                    # Update access metadata
                    self.warm_cache[key]['access_count'] += 1
                    self.warm_cache[key]['last_access'] = time.perf_counter()
                    
                    self.performance_metrics['warm_cache_hits'] += 1
                    self._record_access_time(start_time)
                    return value
            
            # Try cold cache (Redis/persistent storage)
            if self.redis_enabled and self.redis_client:
                try:
                    redis_value = self.redis_client.get(key)
                    if redis_value is not None:
                        # Deserialize and promote to warm cache
                        value = json.loads(redis_value.decode('utf-8'))
                        self._put_warm_cache(key, value, priority=1)
                        
                        self.performance_metrics['cold_cache_hits'] += 1
                        self._record_access_time(start_time)
                        return value
                except Exception as e:
                    logger.warning(f"Redis cache access failed: {e}")
            
            # Cache miss
            self.performance_metrics['total_misses'] += 1
            self._record_access_time(start_time)
            return default
            
        except Exception as e:
            logger.error(f"Cache get error for key {key}: {e}")
            return default
    
    def put(self, key: str, value: Any, priority: int = 1, ttl_seconds: Optional[int] = None,
            tags: Optional[List[str]] = None, cache_layer: str = 'auto') -> bool:
        """
        Store value in cache with intelligent layer selection.
        
        Args:
            key: Cache key
            value: Value to cache
            priority: Priority level (1-10, higher = more important)
            ttl_seconds: Time to live in seconds
            tags: Tags for categorization
            cache_layer: 'hot', 'warm', 'cold', or 'auto'
            
        Returns:
            Success status
        """
        try:
            # Determine cache layer
            if cache_layer == 'auto':
                cache_layer = self._determine_optimal_layer(value, priority)
            
            # Store in appropriate layer(s)
            success = True
            
            if cache_layer == 'hot' or (cache_layer == 'auto' and priority >= 7):
                success &= self.hot_cache.put(key, value, priority, ttl_seconds, tags)
            
            if cache_layer in ['warm', 'auto']:
                success &= self._put_warm_cache(key, value, priority, ttl_seconds, tags)
            
            if cache_layer == 'cold' or (self.redis_enabled and priority <= 3):
                success &= self._put_cold_cache(key, value, ttl_seconds)
            
            return success
            
        except Exception as e:
            logger.error(f"Cache put error for key {key}: {e}")
            return False
    
    def _put_warm_cache(self, key: str, value: Any, priority: int = 1, 
                       ttl_seconds: Optional[int] = None, tags: Optional[List[str]] = None) -> bool:
        """Store in warm cache with eviction management."""
        with self.warm_cache_lock:
            # Check if eviction needed
            if len(self.warm_cache) >= self.max_warm_cache_size and key not in self.warm_cache:
                self._evict_warm_cache_items(1)
            
            # Store item
            self.warm_cache[key] = {
                'value': value,
                'priority': priority,
                'creation_time': time.perf_counter(),
                'last_access': time.perf_counter(),
                'access_count': 1,
                'ttl_seconds': ttl_seconds,
                'tags': tags or [],
                'size_bytes': self._estimate_object_size(value)
            }
            
            # Move to end (most recently used)
            self.warm_cache.move_to_end(key)
            return True
    
    def _put_cold_cache(self, key: str, value: Any, ttl_seconds: Optional[int] = None) -> bool:
        """Store in cold cache (Redis)."""
        if not self.redis_enabled or not self.redis_client:
            return False
        
        try:
            serialized_value = json.dumps(value, default=str)
            if ttl_seconds:
                self.redis_client.setex(key, ttl_seconds, serialized_value)
            else:
                self.redis_client.set(key, serialized_value)
            return True
        except Exception as e:
            logger.warning(f"Redis put failed for key {key}: {e}")
            return False
    
    def _determine_optimal_layer(self, value: Any, priority: int) -> str:
        """Determine optimal cache layer based on value characteristics."""
        size = self._estimate_object_size(value)
        
        # Small, high-priority items go to hot cache
        if size < 1024 and priority >= 7:
            return 'hot'
        
        # Medium items or medium priority go to warm cache
        if size < 10240 or priority >= 4:
            return 'warm'
        
        # Large or low-priority items go to cold cache
        return 'cold'
    
    def _evict_warm_cache_items(self, count: int):
        """Evict items from warm cache using configured policy."""
        if not self.warm_cache:
            return
        
        if self.eviction_policy == 'lru_with_priority':
            # Combine LRU with priority considerations
            eviction_candidates = []
            current_time = time.perf_counter()
            
            for key, item in self.warm_cache.items():
                # Calculate eviction score (lower = evict first)
                priority = item.get('priority', 1)
                last_access = item.get('last_access', current_time)
                access_count = item.get('access_count', 1)
                
                time_since_access = current_time - last_access
                score = (priority * access_count) / (1 + time_since_access)
                eviction_candidates.append((score, key))
            
            # Sort by score and evict lowest scoring items
            eviction_candidates.sort()
            for _, key in eviction_candidates[:count]:
                if key in self.warm_cache:
                    del self.warm_cache[key]
                    self.performance_metrics['eviction_events'] += 1
        
        else:  # Simple LRU
            for _ in range(min(count, len(self.warm_cache))):
                if self.warm_cache:
                    self.warm_cache.popitem(last=False)  # Remove oldest
                    self.performance_metrics['eviction_events'] += 1
    
    def invalidate(self, key: str) -> bool:
        """Remove item from all cache layers."""
        success = True
        
        # Remove from hot cache
        with self.hot_cache._write_lock:
            if key in self.hot_cache._data:
                del self.hot_cache._data[key]
                if key in self.hot_cache._metadata:
                    del self.hot_cache._metadata[key]
        
        # Remove from warm cache
        with self.warm_cache_lock:
            if key in self.warm_cache:
                del self.warm_cache[key]
        
        # Remove from cold cache
        if self.redis_enabled and self.redis_client:
            try:
                self.redis_client.delete(key)
            except Exception as e:
                logger.warning(f"Redis delete failed for key {key}: {e}")
                success = False
        
        return success
    
    def invalidate_by_tags(self, tags: List[str]) -> int:
        """Invalidate all items matching any of the provided tags."""
        invalidated_count = 0
        
        # Check warm cache
        with self.warm_cache_lock:
            keys_to_remove = []
            for key, item in self.warm_cache.items():
                item_tags = item.get('tags', [])
                if any(tag in item_tags for tag in tags):
                    keys_to_remove.append(key)
            
            for key in keys_to_remove:
                del self.warm_cache[key]
                invalidated_count += 1
        
        # Check hot cache (simplified - would need more sophisticated tag tracking)
        # For now, skip hot cache tag invalidation to maintain performance
        
        return invalidated_count
    
    def _monitor_memory_pressure(self):
        """Monitor system memory pressure and trigger cleanup."""
        while True:
            try:
                # Get current memory usage
                process = psutil.Process()
                memory_info = process.memory_info()
                memory_mb = memory_info.rss / 1024 / 1024
                
                # Check if we're approaching memory limits
                if memory_mb > self.max_memory_mb * 0.8:
                    self.performance_metrics['memory_pressure_events'] += 1
                    self._handle_memory_pressure()
                
                # Update metrics
                self.hot_cache._stats.memory_usage_mb = memory_mb
                
                time.sleep(10)  # Check every 10 seconds
                
            except Exception as e:
                logger.error(f"Memory monitoring error: {e}")
                time.sleep(30)
    
    def _handle_memory_pressure(self):
        """Handle memory pressure by aggressive cache cleanup."""
        logger.info("Memory pressure detected, initiating cache cleanup")
        
        # Evict items from warm cache
        items_to_evict = max(1, len(self.warm_cache) // 10)  # Evict 10%
        self._evict_warm_cache_items(items_to_evict)
        
        # Force garbage collection
        gc.collect()
    
    def _periodic_cleanup(self):
        """Periodic cleanup of expired items."""
        while True:
            try:
                current_time = time.perf_counter()
                
                # Clean up warm cache expired items
                with self.warm_cache_lock:
                    expired_keys = []
                    for key, item in self.warm_cache.items():
                        ttl = item.get('ttl_seconds')
                        if ttl:
                            creation_time = item.get('creation_time', current_time)
                            if current_time - creation_time > ttl:
                                expired_keys.append(key)
                    
                    for key in expired_keys:
                        del self.warm_cache[key]
                
                # Trim performance metrics to prevent memory growth
                max_metrics_size = 10000
                if len(self.performance_metrics['access_times_ms']) > max_metrics_size:
                    self.performance_metrics['access_times_ms'] = \
                        self.performance_metrics['access_times_ms'][-max_metrics_size//2:]
                
                time.sleep(300)  # Clean up every 5 minutes
                
            except Exception as e:
                logger.error(f"Cleanup error: {e}")
                time.sleep(60)
    
    def _record_access_time(self, start_time: float):
        """Record access time for performance tracking."""
        access_time_ms = (time.perf_counter() - start_time) * 1000
        self.performance_metrics['access_times_ms'].append(access_time_ms)
        
        # Keep only recent measurements
        if len(self.performance_metrics['access_times_ms']) > 1000:
            self.performance_metrics['access_times_ms'] = \
                self.performance_metrics['access_times_ms'][-500:]
    
    def _estimate_object_size(self, obj: Any) -> int:
        """Estimate object size in bytes."""
        try:
            import sys
            return sys.getsizeof(obj)
        except:
            return 64  # Default estimate
    
    def _initialize_redis(self):
        """Initialize Redis client if available."""
        try:
            import redis
            self.redis_client = redis.Redis(
                host=self.config.get('redis_host', 'localhost'),
                port=self.config.get('redis_port', 6379),
                db=self.config.get('redis_db', 0),
                decode_responses=False
            )
            # Test connection
            self.redis_client.ping()
            logger.info("Redis cache backend initialized")
        except Exception as e:
            logger.warning(f"Redis initialization failed: {e}")
            self.redis_enabled = False
            self.redis_client = None
    
    def get_performance_metrics(self) -> Dict[str, Any]:
        """Get comprehensive performance metrics."""
        total_requests = self.performance_metrics['total_requests']
        total_hits = (self.performance_metrics['hot_cache_hits'] + 
                     self.performance_metrics['warm_cache_hits'] + 
                     self.performance_metrics['cold_cache_hits'])
        
        hit_rate = total_hits / total_requests if total_requests > 0 else 0
        
        access_times = self.performance_metrics['access_times_ms']
        avg_access_time = sum(access_times) / len(access_times) if access_times else 0
        
        return {
            'cache_performance': {
                'total_requests': total_requests,
                'hit_rate': hit_rate,
                'hot_cache_hits': self.performance_metrics['hot_cache_hits'],
                'warm_cache_hits': self.performance_metrics['warm_cache_hits'],
                'cold_cache_hits': self.performance_metrics['cold_cache_hits'],
                'total_misses': self.performance_metrics['total_misses'],
                'average_access_time_ms': avg_access_time
            },
            'cache_sizes': {
                'hot_cache_items': len(self.hot_cache._data),
                'warm_cache_items': len(self.warm_cache),
                'memory_usage_mb': self.hot_cache._stats.memory_usage_mb
            },
            'system_health': {
                'memory_pressure_events': self.performance_metrics['memory_pressure_events'],
                'eviction_events': self.performance_metrics['eviction_events'],
                'redis_enabled': self.redis_enabled
            }
        }
    
    def _load_config(self, config_path: str) -> Dict[str, Any]:
        """Load configuration from file."""
        try:
            with open(config_path, 'r') as f:
                full_config = json.load(f)
                return full_config.get('real_time_cache', {})
        except Exception as e:
            logger.warning(f"Failed to load config from {config_path}: {e}")
            return self._default_config()
    
    def _default_config(self) -> Dict[str, Any]:
        """Return default configuration."""
        return {
            'hot_cache_max_items': 5000,
            'warm_cache_max_items': 20000,
            'cache_size_mb': 1024,
            'eviction_policy': 'lru_with_priority',
            'secondary_cache': 'redis_optional',
            'redis_host': 'localhost',
            'redis_port': 6379,
            'redis_db': 0
        }

# Global cache engine instance
_cache_engine = None

def get_cache_engine(config_path: str = None) -> RealTimeCacheEngine:
    """Get global cache engine instance."""
    global _cache_engine
    if _cache_engine is None:
        _cache_engine = RealTimeCacheEngine(config_path)
    return _cache_engine

def cache_get(key: str, default: Any = None) -> Any:
    """Module-level function to get cached value."""
    return get_cache_engine().get(key, default)

def cache_put(key: str, value: Any, priority: int = 1, ttl_seconds: Optional[int] = None,
              tags: Optional[List[str]] = None) -> bool:
    """Module-level function to cache value."""
    return get_cache_engine().put(key, value, priority, ttl_seconds, tags)

def cache_invalidate(key: str) -> bool:
    """Module-level function to invalidate cached value."""
    return get_cache_engine().invalidate(key)

if __name__ == "__main__":
    # Test cache engine performance
    print("Testing RealTimeCacheEngine performance...")
    
    cache = RealTimeCacheEngine()
    
    # Performance test
    import random
    import string
    
    print("Running performance test...")
    start_time = time.perf_counter()
    
    # Test put operations
    for i in range(1000):
        key = f"test_key_{i}"
        value = ''.join(random.choices(string.ascii_letters, k=100))
        cache.put(key, value, priority=random.randint(1, 10))
    
    # Test get operations
    hit_count = 0
    for i in range(1000):
        key = f"test_key_{random.randint(0, 999)}"
        result = cache.get(key)
        if result is not None:
            hit_count += 1
    
    total_time = (time.perf_counter() - start_time) * 1000
    
    print(f"Performance test completed in {total_time:.2f}ms")
    print(f"Hit rate: {hit_count/1000:.2%}")
    
    # Show performance metrics
    metrics = cache.get_performance_metrics()
    print("Performance metrics:", json.dumps(metrics, indent=2))
