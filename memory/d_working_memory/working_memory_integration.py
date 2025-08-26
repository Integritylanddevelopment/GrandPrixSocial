"""
WORKING MEMORY INTEGRATION - Unified Working Memory Interface
============================================================

Central integration point for all Working Memory subsystems.
Provides unified API and orchestrates interactions between components.

Features:
- Unified API for all Working Memory operations
- Automatic subsystem initialization and coordination
- Performance optimization and load balancing
- Error handling and failover mechanisms
- Real-time monitoring integration
- Session-aware context management

Interactions:
- Session Engine: Session lifecycle management
- Cognitive Engine: Thought and reasoning management
- Context Injection: Smart context retrieval and injection
- Real-Time Cache: High-speed data access
- Agent Coordination: Multi-agent orchestration
- Monitor: Performance tracking and health monitoring
"""

import json
import time
import threading
import asyncio
from datetime import datetime
from typing import Dict, Any, Optional, List, Union, Callable
from dataclasses import dataclass, asdict
from concurrent.futures import ThreadPoolExecutor, Future
import logging

# Import Working Memory subsystems
try:
    from .cognitive_workspace.cognitive_engine import CognitiveEngine, ThoughtRequest, ReasoningChain
    from .session_manager.session_engine import SessionEngine, SessionState
    from .context_injection.context_injection_engine import ContextInjectionEngine, ContextInjectionRequest, ContextItem
    from .real_time_cache.cache_engine import RealTimeCacheEngine, cache_get, cache_put
    from .agent_coordination.coordination_engine import AgentCoordinationEngine, AgentMessage, MessagePriority
    from .monitoring.working_memory_monitor import RealTimeMonitor, record_metric
except ImportError as e:
    # Fallback for standalone testing
    logging.warning(f"Working Memory subsystem import failed: {e}")
    CognitiveEngine = SessionEngine = ContextInjectionEngine = None
    RealTimeCacheEngine = AgentCoordinationEngine = RealTimeMonitor = None

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@dataclass
class WorkingMemoryConfig:
    """Configuration for Working Memory system."""
    config_file_path: Optional[str] = None
    enable_cognitive_engine: bool = True
    enable_session_manager: bool = True
    enable_context_injection: bool = True
    enable_real_time_cache: bool = True
    enable_agent_coordination: bool = True
    enable_monitoring: bool = True
    performance_optimization: bool = True
    max_concurrent_operations: int = 100
    default_session_timeout_minutes: int = 120

@dataclass
class WorkingMemoryRequest:
    """Unified request for Working Memory operations."""
    request_id: str
    operation_type: str  # 'think', 'remember', 'coordinate', 'inject_context'
    session_id: Optional[str]
    agent_id: Optional[str]
    payload: Dict[str, Any]
    priority: int = 5  # 1-10, higher = more important
    timeout_seconds: Optional[int] = None
    require_session: bool = True

@dataclass
class WorkingMemoryResponse:
    """Unified response from Working Memory operations."""
    request_id: str
    success: bool
    result: Any
    error_message: Optional[str]
    processing_time_ms: float
    subsystems_used: List[str]
    session_id: Optional[str]
    performance_metrics: Dict[str, float]

class WorkingMemoryOrchestrator:
    """
    Central orchestrator for all Working Memory operations.
    
    Provides a unified interface to the Working Memory system while
    managing all subsystem interactions and performance optimization.
    """
    
    def __init__(self, config: Optional[WorkingMemoryConfig] = None):
        """Initialize the Working Memory orchestrator."""
        self.config = config or WorkingMemoryConfig()
        
        # Initialize subsystem engines
        self.engines = {}
        self._initialize_subsystems()
        
        # Request processing
        self.request_executor = ThreadPoolExecutor(
            max_workers=self.config.max_concurrent_operations,
            thread_name_prefix='WorkingMemory'
        )
        
        # Performance tracking
        self.performance_stats = {
            'total_requests': 0,
            'successful_requests': 0,
            'failed_requests': 0,
            'average_response_time_ms': 0.0,
            'subsystem_usage': {},
            'error_rates': {}
        }
        
        # Request routing
        self.operation_handlers = {
            'think': self._handle_think_operation,
            'remember': self._handle_remember_operation,
            'coordinate': self._handle_coordinate_operation,
            'inject_context': self._handle_inject_context_operation,
            'create_session': self._handle_create_session_operation,
            'end_session': self._handle_end_session_operation,
            'health_check': self._handle_health_check_operation
        }
        
        # Default session for non-session operations
        self.default_session_id = None
        if self.config.enable_session_manager and 'session_engine' in self.engines:
            self.default_session_id = self.engines['session_engine'].create_session({
                'default_session': True,
                'created_by': 'working_memory_orchestrator'
            })
        
        logger.info("WorkingMemoryOrchestrator initialized successfully")
    
    def _initialize_subsystems(self):
        """Initialize all Working Memory subsystems."""
        config_path = self.config.config_file_path
        
        # Initialize Cognitive Engine
        if self.config.enable_cognitive_engine and CognitiveEngine:
            try:
                self.engines['cognitive_engine'] = CognitiveEngine(config_path)
                logger.info("Cognitive Engine initialized")
            except Exception as e:
                logger.error(f"Failed to initialize Cognitive Engine: {e}")
        
        # Initialize Session Engine
        if self.config.enable_session_manager and SessionEngine:
            try:
                self.engines['session_engine'] = SessionEngine(config_path)
                logger.info("Session Engine initialized")
            except Exception as e:
                logger.error(f"Failed to initialize Session Engine: {e}")
        
        # Initialize Context Injection Engine
        if self.config.enable_context_injection and ContextInjectionEngine:
            try:
                self.engines['context_injection_engine'] = ContextInjectionEngine(config_path)
                logger.info("Context Injection Engine initialized")
            except Exception as e:
                logger.error(f"Failed to initialize Context Injection Engine: {e}")
        
        # Initialize Real-Time Cache Engine
        if self.config.enable_real_time_cache and RealTimeCacheEngine:
            try:
                self.engines['cache_engine'] = RealTimeCacheEngine(config_path)
                logger.info("Real-Time Cache Engine initialized")
            except Exception as e:
                logger.error(f"Failed to initialize Real-Time Cache Engine: {e}")
        
        # Initialize Agent Coordination Engine
        if self.config.enable_agent_coordination and AgentCoordinationEngine:
            try:
                self.engines['coordination_engine'] = AgentCoordinationEngine(config_path)
                logger.info("Agent Coordination Engine initialized")
            except Exception as e:
                logger.error(f"Failed to initialize Agent Coordination Engine: {e}")
        
        # Initialize Monitor
        if self.config.enable_monitoring and RealTimeMonitor:
            try:
                self.engines['monitor'] = RealTimeMonitor(config_path)
                logger.info("Working Memory Monitor initialized")
            except Exception as e:
                logger.error(f"Failed to initialize Monitor: {e}")
    
    def process_request(self, request: WorkingMemoryRequest) -> WorkingMemoryResponse:
        """
        Process a Working Memory request through appropriate subsystems.
        
        Args:
            request: Working Memory request to process
            
        Returns:
            WorkingMemoryResponse with results and performance metrics
        """
        start_time = time.perf_counter()
        subsystems_used = []
        
        try:
            # Validate request
            if request.operation_type not in self.operation_handlers:
                return self._create_error_response(
                    request,
                    f"Unknown operation type: {request.operation_type}",
                    start_time,
                    subsystems_used
                )
            
            # Ensure session exists if required
            session_id = request.session_id
            if request.require_session and not session_id:
                session_id = self.default_session_id
                if not session_id:
                    return self._create_error_response(
                        request,
                        "Session required but no session available",
                        start_time,
                        subsystems_used
                    )
            
            # Record metrics
            if 'monitor' in self.engines:
                record_metric('working_memory_request', 1, 'count', {
                    'operation_type': request.operation_type,
                    'has_session': session_id is not None,
                    'priority': request.priority
                })
            
            # Route to appropriate handler
            handler = self.operation_handlers[request.operation_type]
            result, used_subsystems = handler(request, session_id)
            subsystems_used.extend(used_subsystems)
            
            # Create successful response
            processing_time = (time.perf_counter() - start_time) * 1000
            response = WorkingMemoryResponse(
                request_id=request.request_id,
                success=True,
                result=result,
                error_message=None,
                processing_time_ms=processing_time,
                subsystems_used=subsystems_used,
                session_id=session_id,
                performance_metrics=self._get_request_metrics(processing_time, subsystems_used)
            )
            
            # Update performance stats
            self._update_performance_stats(response)
            
            return response
            
        except Exception as e:
            logger.error(f"Request processing failed for {request.request_id}: {e}")
            return self._create_error_response(request, str(e), start_time, subsystems_used)
    
    def _handle_think_operation(self, request: WorkingMemoryRequest, 
                              session_id: Optional[str]) -> tuple[Any, List[str]]:
        """Handle thinking/reasoning operations."""
        if 'cognitive_engine' not in self.engines:
            raise RuntimeError("Cognitive Engine not available")
        
        cognitive_engine = self.engines['cognitive_engine']
        subsystems_used = ['cognitive_engine']
        
        # Extract thought request data
        payload = request.payload
        thought_content = payload.get('content', '')
        thought_type = payload.get('type', 'general')
        priority = payload.get('priority', request.priority)
        
        # Create thought request
        if hasattr(cognitive_engine, 'process_thought'):
            # Use the actual cognitive engine method
            thought_request = ThoughtRequest(
                request_id=request.request_id,
                session_id=session_id,
                content=thought_content,
                thought_type=thought_type,
                priority=priority,
                timestamp=datetime.now().strftime("%m-%d_%I-%M%p"),
                context=payload.get('context', {}),
                reasoning_required=payload.get('reasoning_required', False)
            )
            
            result = cognitive_engine.process_thought(thought_request)
        else:
            # Fallback for testing
            result = {
                'thought_id': f"thought_{request.request_id}",
                'content': thought_content,
                'status': 'processed',
                'reasoning_chain': []
            }
        
        return result, subsystems_used
    
    def _handle_remember_operation(self, request: WorkingMemoryRequest, 
                                 session_id: Optional[str]) -> tuple[Any, List[str]]:
        """Handle memory retrieval operations."""
        subsystems_used = []
        
        # Try cache first for fast retrieval
        if 'cache_engine' in self.engines:
            cache_key = f"memory_{request.payload.get('query_hash', request.request_id)}"
            cached_result = self.engines['cache_engine'].get(cache_key)
            
            if cached_result:
                subsystems_used.append('cache_engine')
                return cached_result, subsystems_used
        
        # Use context injection for memory retrieval
        if 'context_injection_engine' not in self.engines:
            raise RuntimeError("Context Injection Engine not available")
        
        context_engine = self.engines['context_injection_engine']
        subsystems_used.append('context_injection_engine')
        
        # Create context injection request
        payload = request.payload
        query_context = payload.get('query', '')
        max_items = payload.get('max_items', 10)
        min_relevance = payload.get('min_relevance', 0.3)
        strategy = payload.get('strategy', 'balanced')
        
        if hasattr(context_engine, 'inject_context'):
            context_request = ContextInjectionRequest(
                request_id=request.request_id,
                session_id=session_id,
                query_context=query_context,
                target_thoughts=[],
                injection_strategy=strategy,
                max_items=max_items,
                min_relevance=min_relevance,
                timestamp=datetime.now().strftime("%m-%d_%I-%M%p")
            )
            
            context_result = context_engine.inject_context(context_request)
            result = {
                'memories': [asdict(item) for item in context_result.injected_items],
                'total_processing_time_ms': context_result.total_processing_time_ms,
                'success': context_result.success
            }
        else:
            # Fallback for testing
            result = {
                'memories': [],
                'total_processing_time_ms': 1.0,
                'success': True
            }
        
        # Cache the result for future use
        if 'cache_engine' in self.engines and result['success']:
            cache_key = f"memory_{request.payload.get('query_hash', request.request_id)}"
            self.engines['cache_engine'].put(cache_key, result, priority=request.priority, ttl_seconds=300)
            subsystems_used.append('cache_engine')
        
        return result, subsystems_used
    
    def _handle_coordinate_operation(self, request: WorkingMemoryRequest, 
                                   session_id: Optional[str]) -> tuple[Any, List[str]]:
        """Handle agent coordination operations."""
        if 'coordination_engine' not in self.engines:
            raise RuntimeError("Agent Coordination Engine not available")
        
        coordination_engine = self.engines['coordination_engine']
        subsystems_used = ['coordination_engine']
        
        payload = request.payload
        operation = payload.get('operation', 'send_message')
        
        if operation == 'send_message':
            message_id = coordination_engine.send_message(
                from_agent=payload.get('from_agent', ''),
                to_agent=payload.get('to_agent', ''),
                message_type=payload.get('message_type', ''),
                payload=payload.get('message_payload', {}),
                priority=MessagePriority(payload.get('priority', 3))
            )
            result = {'message_id': message_id, 'success': bool(message_id)}
        
        elif operation == 'register_agent':
            workspace_id = coordination_engine.register_agent(
                agent_id=payload.get('agent_id', ''),
                session_id=session_id,
                memory_requirement_mb=payload.get('memory_mb')
            )
            result = {'workspace_id': workspace_id, 'success': bool(workspace_id)}
        
        elif operation == 'receive_message':
            message = coordination_engine.receive_message(
                agent_id=payload.get('agent_id', ''),
                timeout_ms=payload.get('timeout_ms', 1)
            )
            result = {
                'message': asdict(message) if message else None,
                'success': message is not None
            }
        
        else:
            raise ValueError(f"Unknown coordination operation: {operation}")
        
        return result, subsystems_used
    
    def _handle_inject_context_operation(self, request: WorkingMemoryRequest, 
                                       session_id: Optional[str]) -> tuple[Any, List[str]]:
        """Handle context injection operations."""
        return self._handle_remember_operation(request, session_id)
    
    def _handle_create_session_operation(self, request: WorkingMemoryRequest, 
                                       session_id: Optional[str]) -> tuple[Any, List[str]]:
        """Handle session creation operations."""
        if 'session_engine' not in self.engines:
            raise RuntimeError("Session Engine not available")
        
        session_engine = self.engines['session_engine']
        subsystems_used = ['session_engine']
        
        initial_context = request.payload.get('initial_context', {})
        new_session_id = session_engine.create_session(initial_context)
        
        result = {
            'session_id': new_session_id,
            'success': bool(new_session_id)
        }
        
        return result, subsystems_used
    
    def _handle_end_session_operation(self, request: WorkingMemoryRequest, 
                                    session_id: Optional[str]) -> tuple[Any, List[str]]:
        """Handle session termination operations."""
        if 'session_engine' not in self.engines:
            raise RuntimeError("Session Engine not available")
        
        session_engine = self.engines['session_engine']
        subsystems_used = ['session_engine']
        
        target_session_id = request.payload.get('session_id', session_id)
        preserve_insights = request.payload.get('preserve_insights', True)
        
        success = session_engine.end_session(target_session_id, preserve_insights)
        
        result = {
            'session_id': target_session_id,
            'success': success
        }
        
        return result, subsystems_used
    
    def _handle_health_check_operation(self, request: WorkingMemoryRequest, 
                                     session_id: Optional[str]) -> tuple[Any, List[str]]:
        """Handle health check operations."""
        subsystems_used = []
        
        if 'monitor' in self.engines:
            monitor = self.engines['monitor']
            subsystems_used.append('monitor')
            
            check_name = request.payload.get('check_name')
            health_results = monitor.run_health_check(check_name)
            
            result = {
                'health_checks': {name: asdict(result) for name, result in health_results.items()},
                'overall_status': monitor._calculate_overall_health().value,
                'performance_summary': monitor.get_performance_summary(60)
            }
        else:
            result = {
                'health_checks': {},
                'overall_status': 'unknown',
                'message': 'Monitor not available'
            }
        
        return result, subsystems_used
    
    def _create_error_response(self, request: WorkingMemoryRequest, error_message: str,
                             start_time: float, subsystems_used: List[str]) -> WorkingMemoryResponse:
        """Create an error response."""
        processing_time = (time.perf_counter() - start_time) * 1000
        
        response = WorkingMemoryResponse(
            request_id=request.request_id,
            success=False,
            result=None,
            error_message=error_message,
            processing_time_ms=processing_time,
            subsystems_used=subsystems_used,
            session_id=request.session_id,
            performance_metrics={}
        )
        
        self._update_performance_stats(response)
        return response
    
    def _get_request_metrics(self, processing_time_ms: float, 
                           subsystems_used: List[str]) -> Dict[str, float]:
        """Get performance metrics for a request."""
        metrics = {
            'processing_time_ms': processing_time_ms,
            'subsystems_count': len(subsystems_used)
        }
        
        # Add individual subsystem metrics if available
        for subsystem in subsystems_used:
            if subsystem in self.engines:
                engine = self.engines[subsystem]
                if hasattr(engine, 'get_performance_metrics'):
                    try:
                        subsystem_metrics = engine.get_performance_metrics()
                        for key, value in subsystem_metrics.items():
                            if isinstance(value, (int, float)):
                                metrics[f"{subsystem}_{key}"] = value
                    except Exception as e:
                        logger.warning(f"Failed to get metrics from {subsystem}: {e}")
        
        return metrics
    
    def _update_performance_stats(self, response: WorkingMemoryResponse):
        """Update overall performance statistics."""
        self.performance_stats['total_requests'] += 1
        
        if response.success:
            self.performance_stats['successful_requests'] += 1
        else:
            self.performance_stats['failed_requests'] += 1
        
        # Update average response time
        current_avg = self.performance_stats['average_response_time_ms']
        total_requests = self.performance_stats['total_requests']
        
        self.performance_stats['average_response_time_ms'] = (
            (current_avg * (total_requests - 1) + response.processing_time_ms) / total_requests
        )
        
        # Update subsystem usage stats
        for subsystem in response.subsystems_used:
            if subsystem not in self.performance_stats['subsystem_usage']:
                self.performance_stats['subsystem_usage'][subsystem] = 0
            self.performance_stats['subsystem_usage'][subsystem] += 1
        
        # Record metric if monitor available
        if 'monitor' in self.engines:
            record_metric('working_memory_response_time', response.processing_time_ms, 'ms', {
                'success': response.success,
                'subsystems_count': len(response.subsystems_used)
            })
    
    def get_system_status(self) -> Dict[str, Any]:
        """Get comprehensive system status."""
        status = {
            'timestamp': datetime.now().strftime("%m-%d_%I-%M%p"),
            'subsystems': {},
            'performance_stats': self.performance_stats.copy(),
            'default_session_id': self.default_session_id
        }
        
        # Get status from each subsystem
        for name, engine in self.engines.items():
            try:
                if hasattr(engine, 'get_performance_metrics'):
                    status['subsystems'][name] = {
                        'status': 'active',
                        'metrics': engine.get_performance_metrics()
                    }
                else:
                    status['subsystems'][name] = {
                        'status': 'active',
                        'metrics': {}
                    }
            except Exception as e:
                status['subsystems'][name] = {
                    'status': 'error',
                    'error': str(e)
                }
        
        return status
    
    def shutdown(self):
        """Shutdown the Working Memory system gracefully."""
        logger.info("Shutting down Working Memory system...")
        
        # Stop monitoring if active
        if 'monitor' in self.engines:
            try:
                self.engines['monitor'].stop_monitoring()
            except Exception as e:
                logger.error(f"Error stopping monitor: {e}")
        
        # End default session if exists
        if self.default_session_id and 'session_engine' in self.engines:
            try:
                self.engines['session_engine'].end_session(self.default_session_id)
            except Exception as e:
                logger.error(f"Error ending default session: {e}")
        
        # Shutdown thread pool
        self.request_executor.shutdown(wait=True)
        
        logger.info("Working Memory system shutdown complete")

# Convenience functions for easy access
def create_working_memory(config: Optional[WorkingMemoryConfig] = None) -> WorkingMemoryOrchestrator:
    """Create a new Working Memory orchestrator."""
    return WorkingMemoryOrchestrator(config)

def think(orchestrator: WorkingMemoryOrchestrator, content: str, 
          session_id: Optional[str] = None, **kwargs) -> WorkingMemoryResponse:
    """Convenience function for thinking operations."""
    request = WorkingMemoryRequest(
        request_id=f"think_{int(time.time() * 1000)}",
        operation_type='think',
        session_id=session_id,
        agent_id=kwargs.get('agent_id'),
        payload={
            'content': content,
            'type': kwargs.get('type', 'general'),
            'reasoning_required': kwargs.get('reasoning_required', False),
            'context': kwargs.get('context', {})
        }
    )
    return orchestrator.process_request(request)

def remember(orchestrator: WorkingMemoryOrchestrator, query: str,
            session_id: Optional[str] = None, **kwargs) -> WorkingMemoryResponse:
    """Convenience function for memory retrieval operations."""
    request = WorkingMemoryRequest(
        request_id=f"remember_{int(time.time() * 1000)}",
        operation_type='remember',
        session_id=session_id,
        agent_id=kwargs.get('agent_id'),
        payload={
            'query': query,
            'max_items': kwargs.get('max_items', 10),
            'min_relevance': kwargs.get('min_relevance', 0.3),
            'strategy': kwargs.get('strategy', 'balanced')
        }
    )
    return orchestrator.process_request(request)

if __name__ == "__main__":
    # Test Working Memory integration
    print("Testing Working Memory Integration...")
    
    # Create Working Memory system
    config = WorkingMemoryConfig(
        enable_cognitive_engine=True,
        enable_session_manager=True,
        enable_context_injection=True,
        enable_real_time_cache=True,
        enable_agent_coordination=True,
        enable_monitoring=True
    )
    
    wm = create_working_memory(config)
    
    # Test thinking
    think_response = think(wm, "Testing the working memory system", type="test")
    print(f"Think response: {think_response.success}, time: {think_response.processing_time_ms:.2f}ms")
    
    # Test remembering
    remember_response = remember(wm, "working memory system test", max_items=5)
    print(f"Remember response: {remember_response.success}, time: {remember_response.processing_time_ms:.2f}ms")
    
    # Test health check
    health_request = WorkingMemoryRequest(
        request_id="health_001",
        operation_type='health_check',
        session_id=None,
        agent_id=None,
        payload={},
        require_session=False
    )
    health_response = wm.process_request(health_request)
    print(f"Health check: {health_response.success}")
    
    # Get system status
    status = wm.get_system_status()
    print(f"System status: {len(status['subsystems'])} subsystems active")
    print(f"Performance: {status['performance_stats']['total_requests']} requests processed")
    
    # Shutdown
    wm.shutdown()
    print("Working Memory integration test completed")
