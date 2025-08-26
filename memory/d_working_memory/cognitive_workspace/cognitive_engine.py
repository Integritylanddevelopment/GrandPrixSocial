
# Auto-generated logging configuration
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - cognitive_engine - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('cognitive_engine.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

# Auto-generated comprehensive error handling
import traceback
import logging

def handle_error(func):
    def wrapper(*args, **kwargs):
        try:
            return func(*args, **kwargs)
        except Exception as e:
            logging.error(f"Error in {func.__name__}: {e}")
            logging.error(traceback.format_exc())
            return None
    return wrapper
"""
Cognitive Workspace Engine - Real-Time Thought Management
Live cognitive workspace for CommandCore OS working memory system.
Optimized for sub-millisecond access and concurrent agent operations.
"""

import time
import json
import threading
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any, Tuple
from dataclasses import dataclass, field
from collections import defaultdict, deque
import uuid
import hashlib
from concurrent.futures import ThreadPoolExecutor
import weakref

@dataclass
class ActiveThought:
    """Represents an active thought in the cognitive workspace."""
    thought_id: str
    content: str
    thought_type: str  # 'reasoning', 'context', 'conclusion', 'question'
    priority: float
    created_at: datetime
    last_accessed: datetime
    access_count: int = 0
    agent_id: Optional[str] = None
    parent_thought_id: Optional[str] = None
    children_thought_ids: List[str] = field(default_factory=list)
    tags: List[str] = field(default_factory=list)
    metadata: Dict[str, Any] = field(default_factory=dict)
    
    def update_access(self):
        """Update access tracking for LRU and priority calculations."""
        self.last_accessed = datetime.now()
        self.access_count += 1

@dataclass
class ReasoningChain:
    """Represents a chain of reasoning thoughts."""
    chain_id: str
    root_thought_id: str
    thought_sequence: List[str]
    chain_type: str  # 'linear', 'branching', 'convergent'
    completion_status: str  # 'active', 'paused', 'completed', 'abandoned'
    created_at: datetime
    last_updated: datetime
    agent_id: str
    confidence_score: float = 0.0
    
class CognitiveWorkspace:
    """
    High-performance cognitive workspace for real-time thought management.
    Optimized for concurrent access and sub-millisecond response times.
    """
    
    def __init__(self, config: Dict[str, Any] = None):
        self.config = config or self._load_default_config()
        
        # Core data structures optimized for speed
        self._thoughts: Dict[str, ActiveThought] = {}
        self._reasoning_chains: Dict[str, ReasoningChain] = {}
        self._agent_workspaces: Dict[str, Dict[str, Any]] = defaultdict(dict)
        self._context_cache: Dict[str, Any] = {}
        
        # Indexing for fast retrieval
        self._thoughts_by_type: Dict[str, set] = defaultdict(set)
        self._thoughts_by_agent: Dict[str, set] = defaultdict(set)
        self._thoughts_by_priority: List[Tuple[float, str]] = []
        self._tag_index: Dict[str, set] = defaultdict(set)
        
        # Thread safety and performance
        self._lock = threading.RLock()
        self._read_write_lock = threading.RWLock() if hasattr(threading, 'RWLock') else threading.RLock()
        self._executor = ThreadPoolExecutor(max_threads=8)
        
        # Performance monitoring
        self._performance_metrics = {
            'operation_times': deque(maxlen=1000),
            'cache_hits': 0,
            'cache_misses': 0,
            'total_operations': 0
        }
        
        # Auto-cleanup timer
        self._cleanup_timer = None
        self._start_auto_cleanup()
        
    def _load_default_config(self) -> Dict[str, Any]:
        """Load default configuration for cognitive workspace."""
        return {
            'max_concurrent_thoughts': 20,
            'thought_lifetime_minutes': 60,
            'auto_decay_enabled': True,
            'priority_preservation': True,
            'cleanup_interval_seconds': 300
        }
    
    def add_thought(self, content: str, thought_type: str = 'reasoning', 
                   priority: float = 0.5, agent_id: str = None,
                   parent_thought_id: str = None, tags: List[str] = None,
                   metadata: Dict[str, Any] = None) -> str:
        """
        Add a new thought to the cognitive workspace.
        Returns: thought_id for reference
        """
        start_time = time.perf_counter()
        
        thought_id = self._generate_thought_id()
        now = datetime.now()
        
        thought = ActiveThought(
            thought_id=thought_id,
            content=content,
            thought_type=thought_type,
            priority=priority,
            created_at=now,
            last_accessed=now,
            agent_id=agent_id,
            parent_thought_id=parent_thought_id,
            tags=tags or [],
            metadata=metadata or {}
        )
        
        with self._lock:
            # Store thought
            self._thoughts[thought_id] = thought
            
            # Update indexes
            self._thoughts_by_type[thought_type].add(thought_id)
            if agent_id:
                self._thoughts_by_agent[agent_id].add(thought_id)
            
            # Update priority index (maintain sorted order)
            self._insert_priority_sorted(priority, thought_id)
            
            # Update tag index
            for tag in (tags or []):
                self._tag_index[tag].add(thought_id)
            
            # Handle parent-child relationships
            if parent_thought_id and parent_thought_id in self._thoughts:
                self._thoughts[parent_thought_id].children_thought_ids.append(thought_id)
            
            # Enforce thought limits
            self._enforce_thought_limits()
        
        self._record_operation_time(start_time)
        return thought_id
    
    def get_thought(self, thought_id: str) -> Optional[ActiveThought]:
        """Retrieve a thought by ID with access tracking."""
        start_time = time.perf_counter()
        
        thought = self._thoughts.get(thought_id)
        if thought:
            thought.update_access()
            self._performance_metrics['cache_hits'] += 1
        else:
            self._performance_metrics['cache_misses'] += 1
        
        self._record_operation_time(start_time)
        return thought
    
    def search_thoughts(self, query: str = None, thought_type: str = None,
                       agent_id: str = None, tags: List[str] = None,
                       min_priority: float = None, max_results: int = 10) -> List[ActiveThought]:
        """
        Fast search across thoughts with multiple criteria.
        Optimized for real-time performance.
        """
        start_time = time.perf_counter()
        
        candidate_ids = set(self._thoughts.keys())
        
        # Apply filters using indexes for speed
        if thought_type:
            candidate_ids &= self._thoughts_by_type.get(thought_type, set())
        
        if agent_id:
            candidate_ids &= self._thoughts_by_agent.get(agent_id, set())
        
        if tags:
            for tag in tags:
                candidate_ids &= self._tag_index.get(tag, set())
        
        # Filter by priority
        if min_priority is not None:
            candidate_ids = {tid for tid in candidate_ids 
                           if self._thoughts[tid].priority >= min_priority}
        
        # Content search (simple keyword matching for speed)
        if query:
            query_lower = query.lower()
            candidate_ids = {tid for tid in candidate_ids 
                           if query_lower in self._thoughts[tid].content.lower()}
        
        # Sort by priority and recency, limit results
        results = []
        for thought_id in candidate_ids:
            thought = self._thoughts[thought_id]
            thought.update_access()
            results.append(thought)
        
        # Sort by priority (desc) then by recency (desc)
        results.sort(key=lambda t: (t.priority, t.last_accessed), reverse=True)
        
        self._record_operation_time(start_time)
        return results[:max_results]
    
    def create_reasoning_chain(self, root_thought_id: str, agent_id: str,
                             chain_type: str = 'linear') -> str:
        """Create a new reasoning chain starting from a root thought."""
        chain_id = str(uuid.uuid4())
        now = datetime.now()
        
        chain = ReasoningChain(
            chain_id=chain_id,
            root_thought_id=root_thought_id,
            thought_sequence=[root_thought_id],
            chain_type=chain_type,
            completion_status='active',
            created_at=now,
            last_updated=now,
            agent_id=agent_id
        )
        
        with self._lock:
            self._reasoning_chains[chain_id] = chain
        
        return chain_id
    
    def extend_reasoning_chain(self, chain_id: str, thought_id: str) -> bool:
        """Add a thought to an existing reasoning chain."""
        with self._lock:
            if chain_id in self._reasoning_chains:
                chain = self._reasoning_chains[chain_id]
                chain.thought_sequence.append(thought_id)
                chain.last_updated = datetime.now()
                return True
        return False
    
    def get_agent_workspace(self, agent_id: str) -> Dict[str, Any]:
        """Get or create a workspace for an agent."""
        if agent_id not in self._agent_workspaces:
            self._agent_workspaces[agent_id] = {
                'active_thoughts': [],
                'reasoning_chains': [],
                'scratch_space': {},
                'last_activity': datetime.now()
            }
        return self._agent_workspaces[agent_id]
    
    def update_agent_workspace(self, agent_id: str, updates: Dict[str, Any]):
        """Update agent workspace with new data."""
        workspace = self.get_agent_workspace(agent_id)
        workspace.update(updates)
        workspace['last_activity'] = datetime.now()
    
    def get_context_for_injection(self, query: str, max_items: int = 5) -> List[Dict[str, Any]]:
        """
        Get relevant context for injection into current reasoning.
        Optimized for real-time context injection.
        """
        start_time = time.perf_counter()
        
        # Fast relevance calculation using simple metrics
        relevant_thoughts = self.search_thoughts(
            query=query,
            max_results=max_items * 2  # Get extra to filter
        )
        
        context_items = []
        for thought in relevant_thoughts[:max_items]:
            context_items.append({
                'content': thought.content,
                'type': thought.thought_type,
                'priority': thought.priority,
                'age_minutes': (datetime.now() - thought.created_at).total_seconds() / 60,
                'access_count': thought.access_count,
                'tags': thought.tags
            })
        
        self._record_operation_time(start_time)
        return context_items
    
    def cleanup_expired_thoughts(self):
        """Remove expired thoughts based on age and access patterns."""
        now = datetime.now()
        lifetime_delta = timedelta(minutes=self.config.get('thought_lifetime_minutes', 60))
        
        expired_thoughts = []
        with self._lock:
            for thought_id, thought in self._thoughts.items():
                # Check if thought has expired
                if (now - thought.last_accessed) > lifetime_delta:
                    # Preserve high-priority thoughts
                    if self.config.get('priority_preservation', True) and thought.priority > 0.8:
                        continue
                    expired_thoughts.append(thought_id)
            
            # Remove expired thoughts and update indexes
            for thought_id in expired_thoughts:
                self._remove_thought_from_indexes(thought_id)
                del self._thoughts[thought_id]
    
    def get_performance_metrics(self) -> Dict[str, Any]:
        """Get current performance metrics."""
        if self._performance_metrics['operation_times']:
            avg_time = sum(self._performance_metrics['operation_times']) / len(self._performance_metrics['operation_times'])
        else:
            avg_time = 0
        
        total_requests = self._performance_metrics['cache_hits'] + self._performance_metrics['cache_misses']
        hit_rate = self._performance_metrics['cache_hits'] / max(total_requests, 1)
        
        return {
            'average_operation_time_ms': avg_time * 1000,
            'cache_hit_rate': hit_rate,
            'total_thoughts': len(self._thoughts),
            'total_reasoning_chains': len(self._reasoning_chains),
            'active_agents': len(self._agent_workspaces),
            'memory_usage_mb': self._estimate_memory_usage()
        }
    
    def _generate_thought_id(self) -> str:
        """Generate a unique thought ID."""
        return f"thought_{int(time.time() * 1000000)}_{uuid.uuid4().hex[:8]}"
    
    def _insert_priority_sorted(self, priority: float, thought_id: str):
        """Insert thought into priority-sorted index."""
        # Simple insertion for now; could optimize with heap
        self._thoughts_by_priority.append((priority, thought_id))
        self._thoughts_by_priority.sort(reverse=True)
        
        # Keep only top N for memory efficiency
        if len(self._thoughts_by_priority) > 100:
            self._thoughts_by_priority = self._thoughts_by_priority[:100]
    
    def _enforce_thought_limits(self):
        """Enforce maximum thought limits using LRU eviction."""
        max_thoughts = self.config.get('max_concurrent_thoughts', 20)
        
        if len(self._thoughts) > max_thoughts:
            # Find least recently used thoughts
            thoughts_by_access = sorted(
                self._thoughts.items(),
                key=lambda item: (item[1].priority, item[1].last_accessed)
            )
            
            # Remove oldest, lowest priority thoughts
            thoughts_to_remove = thoughts_by_access[:len(self._thoughts) - max_thoughts]
            for thought_id, _ in thoughts_to_remove:
                self._remove_thought_from_indexes(thought_id)
                del self._thoughts[thought_id]
    
    def _remove_thought_from_indexes(self, thought_id: str):
        """Remove thought from all indexes."""
        thought = self._thoughts.get(thought_id)
        if not thought:
            return
        
        # Remove from type index
        self._thoughts_by_type[thought.thought_type].discard(thought_id)
        
        # Remove from agent index
        if thought.agent_id:
            self._thoughts_by_agent[thought.agent_id].discard(thought_id)
        
        # Remove from tag index
        for tag in thought.tags:
            self._tag_index[tag].discard(thought_id)
        
        # Remove from priority index
        self._thoughts_by_priority = [(p, tid) for p, tid in self._thoughts_by_priority if tid != thought_id]
    
    def _start_auto_cleanup(self):
        """Start automatic cleanup timer."""
        cleanup_interval = self.config.get('cleanup_interval_seconds', 300)
        
        def cleanup_worker():
            while True:
                time.sleep(cleanup_interval)
                if self.config.get('auto_decay_enabled', True):
                    self.cleanup_expired_thoughts()
        
        cleanup_thread = threading.Thread(target=cleanup_worker, daemon=True)
        cleanup_thread.start()
    
    def _record_operation_time(self, start_time: float):
        """Record operation time for performance monitoring."""
        operation_time = time.perf_counter() - start_time
        self._performance_metrics['operation_times'].append(operation_time)
        self._performance_metrics['total_operations'] += 1
    
    def _estimate_memory_usage(self) -> float:
        """Estimate current memory usage in MB."""
        # Rough estimation based on data structures
        thought_size = len(self._thoughts) * 1024  # ~1KB per thought estimate
        chain_size = len(self._reasoning_chains) * 512  # ~512B per chain estimate
        workspace_size = len(self._agent_workspaces) * 2048  # ~2KB per workspace estimate
        
        total_bytes = thought_size + chain_size + workspace_size
        return total_bytes / (1024 * 1024)  # Convert to MB
