"""
CONTEXT INJECTION ENGINE - Working Memory Context Management
==========================================================

Real-time context injection and management for CommandCore OS cognitive workspace.
Handles intelligent context retrieval, injection strategies, and memory integration.

Features:
- Sub-millisecond context retrieval and injection
- Multi-source memory integration (Short-term, Semantic, Procedural, Episodic)
- Relevance-based context scoring and selection
- Real-time context caching and optimization
- Agent-specific context customization

Interactions:
- Session Engine: Manages context state per session
- Cognitive Engine: Injects context into active thoughts
- Real-Time Cache: Caches frequently accessed context
- Memory Core Agents: Retrieves context from various memory types
"""

import json
import time
import threading
import numpy as np
from datetime import datetime, timedelta
from typing import Dict, Any, Optional, List, Tuple, Set
from concurrent.futures import ThreadPoolExecutor, as_completed
from dataclasses import dataclass, asdict
from collections import defaultdict, deque
import logging
import hashlib

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@dataclass
class ContextItem:
    """Represents a single piece of context for injection."""
    context_id: str
    source_type: str  # 'short_term', 'semantic', 'procedural', 'episodic'
    content: Dict[str, Any]
    relevance_score: float
    importance_score: float
    recency_score: float
    combined_score: float
    timestamp: str
    tags: List[str]
    metadata: Dict[str, Any]

@dataclass
class ContextInjectionRequest:
    """Request for context injection."""
    request_id: str
    session_id: str
    query_context: str
    target_thoughts: List[str]
    injection_strategy: str
    max_items: int
    min_relevance: float
    timestamp: str

@dataclass
class ContextInjectionResult:
    """Result of context injection operation."""
    request_id: str
    injected_items: List[ContextItem]
    total_processing_time_ms: float
    retrieval_time_ms: float
    scoring_time_ms: float
    injection_time_ms: float
    cache_hits: int
    cache_misses: int
    success: bool
    error_message: Optional[str]

class ContextInjectionEngine:
    """
    High-performance context injection engine for Working Memory.
    
    Provides real-time context retrieval and injection with intelligent
    scoring and multi-source memory integration.
    """
    
    def __init__(self, config_path: str = None):
        """Initialize the context injection engine."""
        # Load configuration
        self.config = self._load_config(config_path) if config_path else self._default_config()
        
        # Core storage and caching
        self.context_cache: Dict[str, ContextItem] = {}
        self.query_cache: Dict[str, List[ContextItem]] = {}
        self.cache_locks = threading.RLock()
        
        # Performance optimization structures
        self._embedding_cache: Dict[str, np.ndarray] = {}
        self._relevance_cache: Dict[str, float] = {}
        self._last_cleanup = time.time()
        
        # Thread pools for concurrent operations
        self.retrieval_executor = ThreadPoolExecutor(
            max_workers=self.config.get('max_retrieval_threads', 8),
            thread_name_prefix='ContextRetrieval'
        )
        self.scoring_executor = ThreadPoolExecutor(
            max_workers=self.config.get('max_scoring_threads', 4),
            thread_name_prefix='ContextScoring'
        )
        
        # Memory source connectors (mock for now, would connect to actual memory systems)
        self.memory_connectors = {
            'short_term': self._create_short_term_connector(),
            'semantic': self._create_semantic_connector(),
            'procedural': self._create_procedural_connector(),
            'episodic': self._create_episodic_connector()
        }
        
        # Performance tracking
        self.performance_metrics = {
            'injection_requests': 0,
            'average_response_time_ms': deque(maxlen=1000),
            'cache_hit_rate': deque(maxlen=1000),
            'context_items_served': 0,
            'memory_source_latency': defaultdict(list)
        }
        
        # Injection strategies
        self.injection_strategies = {
            'relevance_based': self._relevance_based_injection,
            'recency_based': self._recency_based_injection,
            'importance_based': self._importance_based_injection,
            'balanced': self._balanced_injection,
            'agent_customized': self._agent_customized_injection
        }
        
        logger.info("ContextInjectionEngine initialized with real-time optimization")
    
    def inject_context(self, request: ContextInjectionRequest) -> ContextInjectionResult:
        """
        Perform high-speed context injection with intelligent scoring.
        
        Args:
            request: Context injection request
            
        Returns:
            ContextInjectionResult with injected context and performance metrics
        """
        start_time = time.perf_counter()
        
        try:
            # Check query cache first
            cache_key = self._generate_cache_key(request)
            cached_result = self._check_query_cache(cache_key)
            
            if cached_result:
                return self._create_result_from_cache(request, cached_result, start_time)
            
            # Retrieve context from multiple sources concurrently
            retrieval_start = time.perf_counter()
            raw_context_items = self._retrieve_context_concurrent(request)
            retrieval_time = (time.perf_counter() - retrieval_start) * 1000
            
            # Score and rank context items
            scoring_start = time.perf_counter()
            scored_items = self._score_context_items(raw_context_items, request)
            scoring_time = (time.perf_counter() - scoring_start) * 1000
            
            # Apply injection strategy
            injection_start = time.perf_counter()
            strategy_func = self.injection_strategies.get(
                request.injection_strategy, 
                self._balanced_injection
            )
            final_items = strategy_func(scored_items, request)
            injection_time = (time.perf_counter() - injection_start) * 1000
            
            # Cache results for future use
            self._cache_query_result(cache_key, final_items)
            
            # Create result
            total_time = (time.perf_counter() - start_time) * 1000
            result = ContextInjectionResult(
                request_id=request.request_id,
                injected_items=final_items,
                total_processing_time_ms=total_time,
                retrieval_time_ms=retrieval_time,
                scoring_time_ms=scoring_time,
                injection_time_ms=injection_time,
                cache_hits=0,
                cache_misses=len(raw_context_items),
                success=True,
                error_message=None
            )
            
            # Update performance metrics
            self._update_performance_metrics(result)
            
            logger.debug(f"Context injection completed in {total_time:.2f}ms for request {request.request_id}")
            return result
            
        except Exception as e:
            total_time = (time.perf_counter() - start_time) * 1000
            logger.error(f"Context injection failed for request {request.request_id}: {e}")
            
            return ContextInjectionResult(
                request_id=request.request_id,
                injected_items=[],
                total_processing_time_ms=total_time,
                retrieval_time_ms=0,
                scoring_time_ms=0,
                injection_time_ms=0,
                cache_hits=0,
                cache_misses=0,
                success=False,
                error_message=str(e)
            )
    
    def _retrieve_context_concurrent(self, request: ContextInjectionRequest) -> List[ContextItem]:
        """Retrieve context from multiple memory sources concurrently."""
        enabled_sources = []
        for source_type, source_config in self.config.get('memory_source_integration', {}).items():
            if source_config.get('enabled', False):
                enabled_sources.append(source_type)
        
        # Submit retrieval tasks
        future_to_source = {}
        for source_type in enabled_sources:
            if source_type in self.memory_connectors:
                future = self.retrieval_executor.submit(
                    self._retrieve_from_source,
                    source_type,
                    request
                )
                future_to_source[future] = source_type
        
        # Collect results
        all_context_items = []
        for future in as_completed(future_to_source, timeout=self.config.get('retrieval_timeout_ms', 100) / 1000):
            source_type = future_to_source[future]
            try:
                source_items = future.result()
                all_context_items.extend(source_items)
            except Exception as e:
                logger.warning(f"Failed to retrieve from {source_type}: {e}")
        
        return all_context_items
    
    def _retrieve_from_source(self, source_type: str, request: ContextInjectionRequest) -> List[ContextItem]:
        """Retrieve context items from a specific memory source."""
        source_start = time.perf_counter()
        
        connector = self.memory_connectors.get(source_type)
        if not connector:
            return []
        
        try:
            # Get max items for this source
            source_config = self.config.get('memory_source_integration', {}).get(source_type, {})
            max_items = source_config.get('max_injections_per_request', 5)
            
            # Retrieve items using the connector
            raw_items = connector.retrieve(request.query_context, max_items)
            
            # Convert to ContextItem objects
            context_items = []
            timestamp = datetime.now().strftime("%m-%d_%I-%M%p")
            
            for item in raw_items:
                context_item = ContextItem(
                    context_id=f"{source_type}_{item.get('id', len(context_items))}",
                    source_type=source_type,
                    content=item.get('content', {}),
                    relevance_score=0.0,  # Will be calculated later
                    importance_score=item.get('importance', 0.5),
                    recency_score=0.0,  # Will be calculated later
                    combined_score=0.0,  # Will be calculated later
                    timestamp=timestamp,
                    tags=item.get('tags', []),
                    metadata=item.get('metadata', {})
                )
                context_items.append(context_item)
            
            # Track performance
            source_time = (time.perf_counter() - source_start) * 1000
            self.performance_metrics['memory_source_latency'][source_type].append(source_time)
            
            return context_items
            
        except Exception as e:
            logger.error(f"Error retrieving from {source_type}: {e}")
            return []
    
    def _score_context_items(self, items: List[ContextItem], request: ContextInjectionRequest) -> List[ContextItem]:
        """Score context items using multiple scoring strategies."""
        scored_items = []
        
        # Get strategy weights
        relevance_weight = self.config.get('injection_strategies', {}).get('relevance_based', {}).get('weight', 0.4)
        recency_weight = self.config.get('injection_strategies', {}).get('recency_based', {}).get('weight', 0.3)
        importance_weight = self.config.get('injection_strategies', {}).get('importance_based', {}).get('weight', 0.3)
        
        for item in items:
            # Calculate relevance score (using simple text similarity for now)
            item.relevance_score = self._calculate_relevance_score(item, request.query_context)
            
            # Calculate recency score
            item.recency_score = self._calculate_recency_score(item)
            
            # Item already has importance score from source
            
            # Calculate combined score
            item.combined_score = (
                item.relevance_score * relevance_weight +
                item.recency_score * recency_weight +
                item.importance_score * importance_weight
            )
            
            # Only include items that meet minimum relevance threshold
            if item.relevance_score >= request.min_relevance:
                scored_items.append(item)
        
        # Sort by combined score
        scored_items.sort(key=lambda x: x.combined_score, reverse=True)
        return scored_items
    
    def _calculate_relevance_score(self, item: ContextItem, query_context: str) -> float:
        """Calculate relevance score between context item and query."""
        # Simple implementation - in production would use embeddings/semantic similarity
        item_text = str(item.content).lower()
        query_text = query_context.lower()
        
        # Basic keyword matching
        item_words = set(item_text.split())
        query_words = set(query_text.split())
        
        if not query_words:
            return 0.5
        
        intersection = item_words.intersection(query_words)
        similarity = len(intersection) / len(query_words)
        
        return min(similarity * 2, 1.0)  # Scale and cap at 1.0
    
    def _calculate_recency_score(self, item: ContextItem) -> float:
        """Calculate recency score based on item timestamp."""
        try:
            item_time = datetime.strptime(item.timestamp, "%m-%d_%I-%M%p")
            current_time = datetime.now()
            
            # Calculate hours since item creation
            hours_old = (current_time - item_time).total_seconds() / 3600
            
            # Apply exponential decay
            decay_factor = self.config.get('injection_strategies', {}).get('recency_based', {}).get('time_decay_factor', 0.8)
            recency_score = max(0.1, decay_factor ** (hours_old / 24))  # Decay over days
            
            return recency_score
            
        except Exception:
            return 0.5  # Default score if timestamp parsing fails
    
    def _relevance_based_injection(self, items: List[ContextItem], request: ContextInjectionRequest) -> List[ContextItem]:
        """Injection strategy focused on relevance."""
        # Already sorted by combined score, but re-sort by relevance
        items.sort(key=lambda x: x.relevance_score, reverse=True)
        return items[:request.max_items]
    
    def _recency_based_injection(self, items: List[ContextItem], request: ContextInjectionRequest) -> List[ContextItem]:
        """Injection strategy focused on recency."""
        items.sort(key=lambda x: x.recency_score, reverse=True)
        return items[:request.max_items]
    
    def _importance_based_injection(self, items: List[ContextItem], request: ContextInjectionRequest) -> List[ContextItem]:
        """Injection strategy focused on importance."""
        items.sort(key=lambda x: x.importance_score, reverse=True)
        return items[:request.max_items]
    
    def _balanced_injection(self, items: List[ContextItem], request: ContextInjectionRequest) -> List[ContextItem]:
        """Balanced injection strategy using combined scores."""
        # Items are already sorted by combined score
        return items[:request.max_items]
    
    def _agent_customized_injection(self, items: List[ContextItem], request: ContextInjectionRequest) -> List[ContextItem]:
        """Agent-specific injection strategy."""
        # Could customize based on session metadata or agent type
        # For now, use balanced approach
        return self._balanced_injection(items, request)
    
    def _generate_cache_key(self, request: ContextInjectionRequest) -> str:
        """Generate cache key for query."""
        key_data = f"{request.query_context}:{request.injection_strategy}:{request.max_items}:{request.min_relevance}"
        return hashlib.md5(key_data.encode()).hexdigest()
    
    def _check_query_cache(self, cache_key: str) -> Optional[List[ContextItem]]:
        """Check if query result is cached."""
        with self.cache_locks:
            if cache_key in self.query_cache:
                return self.query_cache[cache_key]
        return None
    
    def _cache_query_result(self, cache_key: str, items: List[ContextItem]):
        """Cache query result."""
        with self.cache_locks:
            self.query_cache[cache_key] = items
            
            # Limit cache size
            max_cache_size = self.config.get('max_query_cache_size', 1000)
            if len(self.query_cache) > max_cache_size:
                # Remove oldest entries (simple FIFO)
                oldest_keys = list(self.query_cache.keys())[:len(self.query_cache) - max_cache_size + 100]
                for key in oldest_keys:
                    del self.query_cache[key]
    
    def _create_result_from_cache(self, request: ContextInjectionRequest, 
                                 cached_items: List[ContextItem], start_time: float) -> ContextInjectionResult:
        """Create result from cached items."""
        total_time = (time.perf_counter() - start_time) * 1000
        
        return ContextInjectionResult(
            request_id=request.request_id,
            injected_items=cached_items[:request.max_items],
            total_processing_time_ms=total_time,
            retrieval_time_ms=0,
            scoring_time_ms=0,
            injection_time_ms=0,
            cache_hits=len(cached_items),
            cache_misses=0,
            success=True,
            error_message=None
        )
    
    def _update_performance_metrics(self, result: ContextInjectionResult):
        """Update performance metrics."""
        self.performance_metrics['injection_requests'] += 1
        self.performance_metrics['average_response_time_ms'].append(result.total_processing_time_ms)
        
        total_accesses = result.cache_hits + result.cache_misses
        if total_accesses > 0:
            hit_rate = result.cache_hits / total_accesses
            self.performance_metrics['cache_hit_rate'].append(hit_rate)
        
        self.performance_metrics['context_items_served'] += len(result.injected_items)
    
    def get_performance_metrics(self) -> Dict[str, Any]:
        """Get real-time performance metrics."""
        metrics = {
            'total_requests': self.performance_metrics['injection_requests'],
            'total_items_served': self.performance_metrics['context_items_served']
        }
        
        if self.performance_metrics['average_response_time_ms']:
            response_times = list(self.performance_metrics['average_response_time_ms'])
            metrics['response_time_ms'] = {
                'avg': sum(response_times) / len(response_times),
                'max': max(response_times),
                'min': min(response_times)
            }
        
        if self.performance_metrics['cache_hit_rate']:
            hit_rates = list(self.performance_metrics['cache_hit_rate'])
            metrics['cache_hit_rate'] = sum(hit_rates) / len(hit_rates)
        
        # Memory source latencies
        metrics['memory_source_latency'] = {}
        for source, latencies in self.performance_metrics['memory_source_latency'].items():
            if latencies:
                metrics['memory_source_latency'][source] = {
                    'avg_ms': sum(latencies) / len(latencies),
                    'max_ms': max(latencies),
                    'count': len(latencies)
                }
        
        return metrics
    
    def _create_short_term_connector(self):
        """Create mock connector for short-term memory."""
        class MockShortTermConnector:
            def retrieve(self, query: str, max_items: int) -> List[Dict[str, Any]]:
                # Mock implementation - would connect to actual short-term memory
                return [
                    {
                        'id': f'st_{i}',
                        'content': {'text': f'Short-term context {i} related to: {query}'},
                        'importance': 0.7,
                        'tags': ['short_term', 'recent'],
                        'metadata': {'source': 'short_term_memory'}
                    }
                    for i in range(min(max_items, 3))
                ]
        
        return MockShortTermConnector()
    
    def _create_semantic_connector(self):
        """Create mock connector for semantic memory."""
        class MockSemanticConnector:
            def retrieve(self, query: str, max_items: int) -> List[Dict[str, Any]]:
                return [
                    {
                        'id': f'sem_{i}',
                        'content': {'text': f'Semantic knowledge {i} about: {query}'},
                        'importance': 0.8,
                        'tags': ['semantic', 'knowledge'],
                        'metadata': {'source': 'semantic_memory'}
                    }
                    for i in range(min(max_items, 2))
                ]
        
        return MockSemanticConnector()
    
    def _create_procedural_connector(self):
        """Create mock connector for procedural memory."""
        class MockProceduralConnector:
            def retrieve(self, query: str, max_items: int) -> List[Dict[str, Any]]:
                return [
                    {
                        'id': f'proc_{i}',
                        'content': {'text': f'Procedural step {i} for: {query}'},
                        'importance': 0.9,
                        'tags': ['procedural', 'steps'],
                        'metadata': {'source': 'procedural_memory'}
                    }
                    for i in range(min(max_items, 1))
                ]
        
        return MockProceduralConnector()
    
    def _create_episodic_connector(self):
        """Create mock connector for episodic memory."""
        class MockEpisodicConnector:
            def retrieve(self, query: str, max_items: int) -> List[Dict[str, Any]]:
                return [
                    {
                        'id': f'ep_{i}',
                        'content': {'text': f'Episodic memory {i} about: {query}'},
                        'importance': 0.6,
                        'tags': ['episodic', 'experience'],
                        'metadata': {'source': 'episodic_memory'}
                    }
                    for i in range(min(max_items, 2))
                ]
        
        return MockEpisodicConnector()
    
    def _load_config(self, config_path: str) -> Dict[str, Any]:
        """Load configuration from file."""
        try:
            with open(config_path, 'r') as f:
                full_config = json.load(f)
                return full_config.get('context_injection', {})
        except Exception as e:
            logger.warning(f"Failed to load config from {config_path}: {e}")
            return self._default_config()
    
    def _default_config(self) -> Dict[str, Any]:
        """Return default configuration."""
        return {
            'max_retrieval_threads': 8,
            'max_scoring_threads': 4,
            'retrieval_timeout_ms': 100,
            'max_query_cache_size': 1000,
            'injection_strategies': {
                'relevance_based': {'weight': 0.4},
                'recency_based': {'weight': 0.3, 'time_decay_factor': 0.8},
                'importance_based': {'weight': 0.3}
            },
            'memory_source_integration': {
                'short_term': {'enabled': True, 'max_injections_per_request': 5},
                'semantic': {'enabled': True, 'max_injections_per_request': 3},
                'procedural': {'enabled': True, 'max_injections_per_request': 2},
                'episodic': {'enabled': True, 'max_injections_per_request': 4}
            }
        }

# Module-level functions for easy access
def inject_context(session_id: str, query_context: str, 
                  injection_strategy: str = 'balanced',
                  max_items: int = 10, min_relevance: float = 0.3) -> ContextInjectionResult:
    """Module-level function to inject context."""
    engine = ContextInjectionEngine()
    
    request = ContextInjectionRequest(
        request_id=f"req_{int(time.time() * 1000)}",
        session_id=session_id,
        query_context=query_context,
        target_thoughts=[],
        injection_strategy=injection_strategy,
        max_items=max_items,
        min_relevance=min_relevance,
        timestamp=datetime.now().strftime("%m-%d_%I-%M%p")
    )
    
    return engine.inject_context(request)

if __name__ == "__main__":
    # Test context injection engine
    print("Testing ContextInjectionEngine performance...")
    
    engine = ContextInjectionEngine()
    
    # Create test request
    request = ContextInjectionRequest(
        request_id="test_001",
        session_id="test_session",
        query_context="debugging python error",
        target_thoughts=["thought_1"],
        injection_strategy="balanced",
        max_items=5,
        min_relevance=0.3,
        timestamp=datetime.now().strftime("%m-%d_%I-%M%p")
    )
    
    # Test injection
    result = engine.inject_context(request)
    
    print(f"Injection completed: {result.success}")
    print(f"Items injected: {len(result.injected_items)}")
    print(f"Total time: {result.total_processing_time_ms:.2f}ms")
    print(f"Retrieval time: {result.retrieval_time_ms:.2f}ms")
    print(f"Scoring time: {result.scoring_time_ms:.2f}ms")
    
    # Show performance metrics
    metrics = engine.get_performance_metrics()
    print("Performance metrics:", json.dumps(metrics, indent=2))
