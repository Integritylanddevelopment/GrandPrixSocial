#!/usr/bin/env python3
"""
Cloud Context Integration Service - Grand Prix Social
Integrates context agents with cloud database for seamless context management
"""

import os
import sys
import json
import time
import asyncio
import logging
import threading
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional, Tuple, Callable
from pathlib import Path
from dataclasses import dataclass, asdict
import hashlib
from concurrent.futures import ThreadPoolExecutor, as_completed
import queue

# Add project root to path
project_root = Path(__file__).parent.parent
sys.path.insert(0, str(project_root))

from cloud_memory_database_system import CloudMemoryDatabaseSystem, MemoryItem

# Setup logging
logging.basicConfig(level=logging.INFO, format='[%(asctime)s] [%(levelname)s] %(message)s')
logger = logging.getLogger(__name__)

@dataclass
class ContextRequest:
    """Represents a context request from an agent or system"""
    request_id: str
    requester_agent: str
    context_type: str  # 'document_monitor', 'injection', 'search', 'promotion'
    query: str
    priority: int  # 1-10
    max_items: int
    filters: Dict[str, Any]
    timestamp: str
    callback: Optional[Callable] = None

@dataclass
class ContextResponse:
    """Response to a context request"""
    request_id: str
    context_items: List[MemoryItem]
    processing_time_ms: float
    source_types: List[str]
    total_items_found: int
    success: bool
    error_message: Optional[str] = None

class CloudContextIntegrationService:
    """
    Cloud Context Integration Service
    
    Provides unified context management across all memory agents,
    integrating with cloud database for persistent, searchable context
    """
    
    def __init__(self):
        """Initialize the cloud context integration service"""
        self.cloud_memory = CloudMemoryDatabaseSystem()
        
        # Context processing queues
        self.high_priority_queue = queue.PriorityQueue()
        self.normal_priority_queue = queue.Queue()
        self.processing_threads = []
        
        # Context caching
        self.context_cache = {}
        self.cache_lock = threading.RLock()
        self.cache_ttl = 300  # 5 minutes
        
        # Performance tracking
        self.metrics = {
            'requests_processed': 0,
            'average_response_time': [],
            'cache_hits': 0,
            'cache_misses': 0,
            'context_items_served': 0,
            'agent_interactions': {}
        }
        
        # Active agent monitors
        self.active_monitors = {
            'document_monitor': False,
            'context_injection': False,
            'memory_promotion': False,
            'agent_coordination': False
        }
        
        # Context type handlers
        self.context_handlers = {
            'document_monitor': self._handle_document_context,
            'injection': self._handle_injection_context,
            'search': self._handle_search_context,
            'promotion': self._handle_promotion_context,
            'coordination': self._handle_coordination_context
        }
        
        # Start processing threads
        self._start_processing_threads()
        
        # Initialize context monitoring
        self._initialize_context_monitoring()
        
        logger.info("✅ Cloud Context Integration Service initialized")
    
    def _start_processing_threads(self):
        """Start background processing threads"""
        # High priority processor
        high_priority_thread = threading.Thread(
            target=self._process_high_priority_queue,
            daemon=True,
            name='HighPriorityContextProcessor'
        )
        high_priority_thread.start()
        self.processing_threads.append(high_priority_thread)
        
        # Normal priority processor
        normal_priority_thread = threading.Thread(
            target=self._process_normal_priority_queue,
            daemon=True,
            name='NormalPriorityContextProcessor'
        )
        normal_priority_thread.start()
        self.processing_threads.append(normal_priority_thread)
        
        # Cache cleanup thread
        cache_cleanup_thread = threading.Thread(
            target=self._cache_cleanup_loop,
            daemon=True,
            name='ContextCacheCleanup'
        )
        cache_cleanup_thread.start()
        self.processing_threads.append(cache_cleanup_thread)
        
        logger.info("🔧 Started context processing threads")
    
    def _initialize_context_monitoring(self):
        """Initialize context monitoring systems"""
        try:
            # Update system state to indicate cloud context integration
            self.cloud_memory.update_agent_state(
                agent_name='memory_context_router_agent',
                status='cloud_integrated',
                current_state={
                    'cloud_context_active': True,
                    'integration_service_running': True,
                    'context_types_supported': list(self.context_handlers.keys()),
                    'last_integration_check': datetime.now().isoformat()
                },
                current_task='Cloud context integration monitoring',
                configuration={
                    'cloud_integration': True,
                    'context_caching': True,
                    'priority_processing': True,
                    'agent_coordination': True
                }
            )
            
            # Mark monitors as active
            for monitor_type in self.active_monitors:
                self.active_monitors[monitor_type] = True
            
            logger.info("🎯 Context monitoring systems initialized")
            
        except Exception as e:
            logger.error(f"❌ Error initializing context monitoring: {e}")
    
    def request_context(self, request: ContextRequest) -> Optional[str]:
        """
        Submit a context request for processing
        
        Args:
            request: Context request object
            
        Returns:
            Optional[str]: Request ID if accepted, None if rejected
        """
        try:
            # Validate request
            if not self._validate_context_request(request):
                logger.error(f"❌ Invalid context request: {request.request_id}")
                return None
            
            # Update agent interaction metrics
            if request.requester_agent not in self.metrics['agent_interactions']:
                self.metrics['agent_interactions'][request.requester_agent] = 0
            self.metrics['agent_interactions'][request.requester_agent] += 1
            
            # Route to appropriate queue based on priority
            if request.priority >= 8:
                # High priority - immediate processing
                self.high_priority_queue.put((request.priority, time.time(), request))
                logger.info(f"🚨 High priority context request queued: {request.request_id}")
            else:
                # Normal priority
                self.normal_priority_queue.put(request)
                logger.info(f"📝 Context request queued: {request.request_id}")
            
            return request.request_id
            
        except Exception as e:
            logger.error(f"❌ Error processing context request: {e}")
            return None
    
    def _validate_context_request(self, request: ContextRequest) -> bool:
        """Validate context request"""
        required_fields = ['request_id', 'requester_agent', 'context_type', 'query']
        
        for field in required_fields:
            if not getattr(request, field, None):
                logger.error(f"❌ Missing required field: {field}")
                return False
        
        if request.context_type not in self.context_handlers:
            logger.error(f"❌ Unknown context type: {request.context_type}")
            return False
        
        if not (1 <= request.priority <= 10):
            logger.error(f"❌ Invalid priority: {request.priority}")
            return False
        
        return True
    
    def _process_high_priority_queue(self):
        """Process high priority context requests"""
        while True:
            try:
                # Get high priority request (priority, timestamp, request)
                _, _, request = self.high_priority_queue.get(timeout=1)
                
                # Process immediately
                self._process_context_request(request)
                
                self.high_priority_queue.task_done()
                
            except queue.Empty:
                continue
            except Exception as e:
                logger.error(f"❌ Error in high priority processing: {e}")
    
    def _process_normal_priority_queue(self):
        """Process normal priority context requests"""
        while True:
            try:
                request = self.normal_priority_queue.get(timeout=1)
                
                # Process request
                self._process_context_request(request)
                
                self.normal_priority_queue.task_done()
                
            except queue.Empty:
                continue
            except Exception as e:
                logger.error(f"❌ Error in normal priority processing: {e}")
    
    def _process_context_request(self, request: ContextRequest):
        """Process a context request"""
        start_time = time.time()
        
        try:
            logger.info(f"🔄 Processing context request: {request.request_id}")
            
            # Check cache first
            cache_key = self._generate_cache_key(request)
            cached_response = self._get_cached_response(cache_key)
            
            if cached_response:
                self.metrics['cache_hits'] += 1
                logger.info(f"⚡ Cache hit for request: {request.request_id}")
                response = cached_response
            else:
                self.metrics['cache_misses'] += 1
                
                # Get appropriate handler
                handler = self.context_handlers.get(request.context_type)
                if not handler:
                    raise ValueError(f"No handler for context type: {request.context_type}")
                
                # Process with handler
                response = handler(request)
                
                # Cache response
                self._cache_response(cache_key, response)
            
            # Update processing time
            processing_time = (time.time() - start_time) * 1000
            response.processing_time_ms = processing_time
            
            # Update metrics
            self.metrics['requests_processed'] += 1
            self.metrics['average_response_time'].append(processing_time)
            self.metrics['context_items_served'] += len(response.context_items)
            
            # Call callback if provided
            if request.callback:
                try:
                    request.callback(response)
                except Exception as e:
                    logger.error(f"❌ Error in callback for {request.request_id}: {e}")
            
            logger.info(f"✅ Processed context request {request.request_id} in {processing_time:.2f}ms")
            
        except Exception as e:
            logger.error(f"❌ Error processing context request {request.request_id}: {e}")
            
            # Send error response
            error_response = ContextResponse(
                request_id=request.request_id,
                context_items=[],
                processing_time_ms=(time.time() - start_time) * 1000,
                source_types=[],
                total_items_found=0,
                success=False,
                error_message=str(e)
            )
            
            if request.callback:
                try:
                    request.callback(error_response)
                except Exception as callback_error:
                    logger.error(f"❌ Error in error callback: {callback_error}")
    
    def _handle_document_context(self, request: ContextRequest) -> ContextResponse:
        """Handle document context monitoring requests"""
        try:
            # Search for document-related context
            context_items = self.cloud_memory.search_memory_items(
                query=request.query,
                memory_types=['c_short_term_memory', 'd_working_memory'],
                limit=request.max_items
            )
            
            # Filter for document-related items
            document_items = [
                item for item in context_items
                if any(tag in ['document', 'context_document', 'claude_context'] 
                      for tag in item.tags)
            ]
            
            # Store this interaction for future context
            self.cloud_memory.store_memory_item(
                memory_type='d_working_memory',
                title=f'Document Context Request: {request.query[:50]}',
                content={
                    'request_type': 'document_monitor',
                    'query': request.query,
                    'requester': request.requester_agent,
                    'results_count': len(document_items),
                    'timestamp': request.timestamp
                },
                importance_score=6,
                tags=['document_context', 'context_monitoring', 'agent_interaction'],
                source_agent='cloud_context_integration'
            )
            
            return ContextResponse(
                request_id=request.request_id,
                context_items=document_items,
                processing_time_ms=0,  # Will be set by caller
                source_types=['c_short_term_memory', 'd_working_memory'],
                total_items_found=len(context_items),
                success=True
            )
            
        except Exception as e:
            logger.error(f"❌ Error in document context handler: {e}")
            raise
    
    def _handle_injection_context(self, request: ContextRequest) -> ContextResponse:
        """Handle context injection requests"""
        try:
            # Get context from multiple memory types based on relevance
            memory_types = request.filters.get('memory_types', [
                'c_short_term_memory', 'd_working_memory', 'f_semantic_memory'
            ])
            
            context_items = self.cloud_memory.search_memory_items(
                query=request.query,
                memory_types=memory_types,
                limit=request.max_items
            )
            
            # Sort by relevance for injection
            context_items.sort(key=lambda x: x.importance_score, reverse=True)
            
            # Store injection event
            self.cloud_memory.store_memory_item(
                memory_type='d_working_memory',
                title=f'Context Injection: {request.query[:50]}',
                content={
                    'request_type': 'injection',
                    'query': request.query,
                    'injected_count': len(context_items),
                    'requester': request.requester_agent,
                    'memory_types_searched': memory_types
                },
                importance_score=7,
                tags=['context_injection', 'agent_interaction', 'memory_access'],
                source_agent='cloud_context_integration'
            )
            
            return ContextResponse(
                request_id=request.request_id,
                context_items=context_items,
                processing_time_ms=0,
                source_types=memory_types,
                total_items_found=len(context_items),
                success=True
            )
            
        except Exception as e:
            logger.error(f"❌ Error in injection context handler: {e}")
            raise
    
    def _handle_search_context(self, request: ContextRequest) -> ContextResponse:
        """Handle context search requests"""
        try:
            # Perform comprehensive search across all memory types
            context_items = self.cloud_memory.search_memory_items(
                query=request.query,
                limit=request.max_items
            )
            
            # Apply additional filters
            if request.filters:
                min_importance = request.filters.get('min_importance', 1)
                required_tags = request.filters.get('required_tags', [])
                
                filtered_items = []
                for item in context_items:
                    if item.importance_score >= min_importance:
                        if not required_tags or any(tag in item.tags for tag in required_tags):
                            filtered_items.append(item)
                
                context_items = filtered_items
            
            return ContextResponse(
                request_id=request.request_id,
                context_items=context_items,
                processing_time_ms=0,
                source_types=list(self.cloud_memory.memory_type_mappings.keys()),
                total_items_found=len(context_items),
                success=True
            )
            
        except Exception as e:
            logger.error(f"❌ Error in search context handler: {e}")
            raise
    
    def _handle_promotion_context(self, request: ContextRequest) -> ContextResponse:
        """Handle memory promotion context requests"""
        try:
            # Get items for potential promotion
            short_term_items = self.cloud_memory.retrieve_memory_items(
                memory_type='c_short_term_memory',
                limit=request.max_items,
                importance_min=7  # Only high-importance items for promotion
            )
            
            # Filter items that match promotion criteria
            promotion_candidates = []
            for item in short_term_items:
                # Check if item should be promoted based on age, access count, importance
                item_age_hours = self._calculate_item_age_hours(item.created_at)
                
                if (item_age_hours >= 24 and  # At least 1 day old
                    item.access_count > 2 and  # Accessed multiple times
                    item.importance_score >= 7):  # High importance
                    promotion_candidates.append(item)
            
            # Store promotion analysis
            self.cloud_memory.store_memory_item(
                memory_type='d_working_memory',
                title=f'Memory Promotion Analysis: {request.query[:50]}',
                content={
                    'request_type': 'promotion',
                    'candidates_found': len(promotion_candidates),
                    'total_short_term_items': len(short_term_items),
                    'promotion_criteria': {
                        'min_age_hours': 24,
                        'min_access_count': 2,
                        'min_importance': 7
                    }
                },
                importance_score=8,
                tags=['memory_promotion', 'memory_management', 'agent_coordination'],
                source_agent='cloud_context_integration'
            )
            
            return ContextResponse(
                request_id=request.request_id,
                context_items=promotion_candidates,
                processing_time_ms=0,
                source_types=['c_short_term_memory'],
                total_items_found=len(short_term_items),
                success=True
            )
            
        except Exception as e:
            logger.error(f"❌ Error in promotion context handler: {e}")
            raise
    
    def _handle_coordination_context(self, request: ContextRequest) -> ContextResponse:
        """Handle agent coordination context requests"""
        try:
            # Get current agent states
            agent_states = {}
            for agent_name in self.cloud_memory.agent_registry:
                state = self.cloud_memory.get_agent_state(agent_name)
                if state:
                    agent_states[agent_name] = {
                        'status': state.status,
                        'last_heartbeat': state.last_heartbeat,
                        'current_task': state.current_task,
                        'processed_items': state.processed_items
                    }
            
            # Create context items from agent coordination data
            coordination_items = []
            
            # Create a memory item with current agent coordination status
            coordination_item = MemoryItem(
                id='coordination_status_' + str(int(time.time())),
                memory_type='d_working_memory',
                title='Agent Coordination Status',
                content={
                    'agent_states': agent_states,
                    'total_agents': len(agent_states),
                    'active_agents': sum(1 for state in agent_states.values() 
                                       if state['status'] in ['active', 'cloud_integrated']),
                    'last_updated': datetime.now().isoformat()
                },
                importance_score=9,
                access_count=1,
                last_accessed=datetime.now().isoformat(),
                tags=['agent_coordination', 'system_status', 'real_time'],
                metadata={'generated_by': 'cloud_context_integration'},
                source_agent='cloud_context_integration',
                created_at=datetime.now().isoformat(),
                updated_at=datetime.now().isoformat()
            )
            
            coordination_items.append(coordination_item)
            
            return ContextResponse(
                request_id=request.request_id,
                context_items=coordination_items,
                processing_time_ms=0,
                source_types=['real_time_agent_states'],
                total_items_found=1,
                success=True
            )
            
        except Exception as e:
            logger.error(f"❌ Error in coordination context handler: {e}")
            raise
    
    def _calculate_item_age_hours(self, created_at: str) -> float:
        """Calculate age of item in hours"""
        try:
            created_time = datetime.fromisoformat(created_at.replace('Z', '+00:00'))
            current_time = datetime.now()
            age_delta = current_time - created_time
            return age_delta.total_seconds() / 3600
        except Exception:
            return 0.0
    
    def _generate_cache_key(self, request: ContextRequest) -> str:
        """Generate cache key for request"""
        key_data = f"{request.context_type}:{request.query}:{request.max_items}"
        return hashlib.md5(key_data.encode()).hexdigest()
    
    def _get_cached_response(self, cache_key: str) -> Optional[ContextResponse]:
        """Get cached response if available and not expired"""
        with self.cache_lock:
            if cache_key in self.context_cache:
                cached_data, timestamp = self.context_cache[cache_key]
                if time.time() - timestamp < self.cache_ttl:
                    return cached_data
                else:
                    # Remove expired cache entry
                    del self.context_cache[cache_key]
        return None
    
    def _cache_response(self, cache_key: str, response: ContextResponse):
        """Cache a response"""
        with self.cache_lock:
            self.context_cache[cache_key] = (response, time.time())
    
    def _cache_cleanup_loop(self):
        """Clean up expired cache entries"""
        while True:
            try:
                time.sleep(60)  # Check every minute
                
                current_time = time.time()
                with self.cache_lock:
                    expired_keys = [
                        key for key, (_, timestamp) in self.context_cache.items()
                        if current_time - timestamp >= self.cache_ttl
                    ]
                    
                    for key in expired_keys:
                        del self.context_cache[key]
                    
                    if expired_keys:
                        logger.info(f"🧹 Cleaned up {len(expired_keys)} expired cache entries")
                        
            except Exception as e:
                logger.error(f"❌ Error in cache cleanup: {e}")
    
    def get_service_status(self) -> Dict[str, Any]:
        """Get comprehensive service status"""
        return {
            'service_name': 'CloudContextIntegrationService',
            'timestamp': datetime.now().isoformat(),
            'active_monitors': self.active_monitors,
            'processing_threads': len(self.processing_threads),
            'queue_sizes': {
                'high_priority': self.high_priority_queue.qsize(),
                'normal_priority': self.normal_priority_queue.qsize()
            },
            'cache_stats': {
                'entries': len(self.context_cache),
                'hit_rate': (self.metrics['cache_hits'] / 
                           max(1, self.metrics['cache_hits'] + self.metrics['cache_misses'])) * 100
            },
            'performance_metrics': {
                'requests_processed': self.metrics['requests_processed'],
                'avg_response_time_ms': (sum(self.metrics['average_response_time']) / 
                                       max(1, len(self.metrics['average_response_time']))),
                'context_items_served': self.metrics['context_items_served']
            },
            'agent_interactions': self.metrics['agent_interactions'],
            'supported_context_types': list(self.context_handlers.keys())
        }

# Convenience functions for easy access
def create_context_request(requester_agent: str, context_type: str, query: str,
                          priority: int = 5, max_items: int = 10,
                          filters: Dict[str, Any] = None,
                          callback: Callable = None) -> ContextRequest:
    """Create a context request"""
    return ContextRequest(
        request_id=f"ctx_{int(time.time() * 1000)}_{hash(query) % 10000}",
        requester_agent=requester_agent,
        context_type=context_type,
        query=query,
        priority=priority,
        max_items=max_items,
        filters=filters or {},
        timestamp=datetime.now().isoformat(),
        callback=callback
    )

def main():
    """Main function for testing"""
    print("GRAND PRIX SOCIAL - CLOUD CONTEXT INTEGRATION SERVICE")
    print("=" * 60)
    
    # Initialize service
    print("Initializing cloud context integration service...")
    service = CloudContextIntegrationService()
    print("SUCCESS: Service initialized")
    
    # Test context requests
    print("\nTesting context request processing...")
    
    def test_callback(response: ContextResponse):
        print(f"  Callback: {response.request_id} -> {len(response.context_items)} items")
    
    # Create test requests
    requests = [
        create_context_request(
            requester_agent='test_agent',
            context_type='search',
            query='cloud memory integration',
            priority=7,
            max_items=5,
            callback=test_callback
        ),
        create_context_request(
            requester_agent='memory_orchestrator_agent',
            context_type='injection',
            query='memory promotion',
            priority=9,
            callback=test_callback
        ),
        create_context_request(
            requester_agent='context_monitor',
            context_type='coordination',
            query='agent status',
            priority=6,
            callback=test_callback
        )
    ]
    
    # Submit requests
    request_ids = []
    for req in requests:
        req_id = service.request_context(req)
        if req_id:
            request_ids.append(req_id)
            print(f"  Submitted: {req.context_type} request -> {req_id}")
    
    # Wait for processing
    print("\nWaiting for request processing...")
    time.sleep(3)
    
    # Get service status
    status = service.get_service_status()
    print("\nSERVICE STATUS:")
    print(f"  Requests Processed: {status['performance_metrics']['requests_processed']}")
    print(f"  Cache Hit Rate: {status['cache_stats']['hit_rate']:.1f}%")
    print(f"  Context Items Served: {status['performance_metrics']['context_items_served']}")
    print(f"  Active Monitors: {sum(status['active_monitors'].values())}")
    print(f"  Processing Threads: {status['processing_threads']}")
    
    print("\nCLOUD CONTEXT INTEGRATION SERVICE READY!")
    print("SUCCESS METRICS:")
    print("  - Real-time context processing active")
    print("  - Priority-based request handling")
    print("  - Multi-source memory integration")
    print("  - Agent coordination context")
    print("  - Document monitoring integration")
    print("  - Context injection capabilities")
    print("  - Memory promotion analysis")

if __name__ == "__main__":
    main()