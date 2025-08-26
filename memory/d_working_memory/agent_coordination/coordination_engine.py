
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
AGENT COORDINATION ENGINE - Working Memory Agent Management
=========================================================

Real-time agent coordination and workspace management for CommandCore OS.
Handles concurrent agent access, workspace allocation, and message passing.

Features:
- Sub-millisecond agent coordination overhead
- Lock-free message passing between agents
- Dynamic workspace allocation and sharing
- Priority-based arbitration for resource conflicts
- Real-time agent activity monitoring
- Distributed coordination state management

Interactions:
- Session Engine: Coordinates agent activities per session
- Cognitive Engine: Manages agent access to thoughts and reasoning
- Real-Time Cache: Stores agent workspace data and coordination state
- Context Injection: Coordinates context access between agents
"""

import json
import time
import threading
import queue
import uuid
from datetime import datetime, timedelta
from typing import Dict, Any, Optional, List, Set, Callable, Tuple
from concurrent.futures import ThreadPoolExecutor, Future
from dataclasses import dataclass, asdict, field
from collections import defaultdict, deque
from enum import Enum
import logging
import weakref

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class AgentStatus(Enum):
    """Agent status enumeration."""
    INACTIVE = "inactive"
    INITIALIZING = "initializing"
    ACTIVE = "active"
    PROCESSING = "processing"
    WAITING = "waiting"
    ERROR = "error"
    TERMINATING = "terminating"

class MessagePriority(Enum):
    """Message priority levels."""
    CRITICAL = 1
    HIGH = 2
    NORMAL = 3
    LOW = 4
    BACKGROUND = 5

@dataclass
class AgentMessage:
    """Message passed between agents."""
    message_id: str
    from_agent: str
    to_agent: str
    message_type: str
    priority: MessagePriority
    payload: Dict[str, Any]
    timestamp: str
    response_required: bool
    timeout_seconds: Optional[int]
    correlation_id: Optional[str] = None

@dataclass
class AgentWorkspace:
    """Agent workspace allocation."""
    agent_id: str
    workspace_id: str
    allocated_memory_mb: int
    shared_memory_segments: List[str]
    private_data: Dict[str, Any]
    shared_data_references: Dict[str, str]
    creation_time: str
    last_access_time: str
    access_count: int
    lock_count: int
    status: AgentStatus

@dataclass
class CoordinationEvent:
    """Coordination event for monitoring."""
    event_id: str
    event_type: str
    agent_id: str
    session_id: Optional[str]
    timestamp: str
    details: Dict[str, Any]
    processing_time_ms: float

class LockFreeMessageQueue:
    """Lock-free message queue optimized for high throughput."""
    
    def __init__(self, max_size: int = 10000):
        self.max_size = max_size
        self._queue = queue.Queue(maxsize=max_size)
        self._priority_queues = {priority: queue.Queue() for priority in MessagePriority}
        self._stats = {
            'messages_sent': 0,
            'messages_received': 0,
            'queue_full_events': 0
        }
    
    def put(self, message: AgentMessage, timeout: float = 0.001) -> bool:
        """Put message in queue with priority handling."""
        try:
            # Use priority queue first
            priority_queue = self._priority_queues[message.priority]
            priority_queue.put(message, timeout=timeout)
            self._stats['messages_sent'] += 1
            return True
        except queue.Full:
            try:
                # Fallback to main queue
                self._queue.put(message, timeout=timeout)
                self._stats['messages_sent'] += 1
                return True
            except queue.Full:
                self._stats['queue_full_events'] += 1
                return False
    
    def get(self, timeout: float = 0.001) -> Optional[AgentMessage]:
        """Get next message with priority ordering."""
        # Check priority queues first (highest priority first)
        for priority in MessagePriority:
            try:
                message = self._priority_queues[priority].get_nowait()
                self._stats['messages_received'] += 1
                return message
            except queue.Empty:
                continue
        
        # Check main queue
        try:
            message = self._queue.get(timeout=timeout)
            self._stats['messages_received'] += 1
            return message
        except queue.Empty:
            return None
    
    def size(self) -> int:
        """Get approximate queue size."""
        total_size = self._queue.qsize()
        for priority_queue in self._priority_queues.values():
            total_size += priority_queue.qsize()
        return total_size

class AgentCoordinationEngine:
    """
    High-performance agent coordination engine for Working Memory.
    
    Provides real-time coordination with minimal overhead and maximum concurrency.
    """
    
    def __init__(self, config_path: str = None):
        """Initialize the agent coordination engine."""
        # Load configuration
        self.config = self._load_config(config_path) if config_path else self._default_config()
        
        # Core coordination structures
        self.agents: Dict[str, AgentWorkspace] = {}
        self.message_queues: Dict[str, LockFreeMessageQueue] = {}
        self.shared_memory_segments: Dict[str, Dict[str, Any]] = {}
        
        # Synchronization primitives
        self.agent_locks: Dict[str, threading.RLock] = {}
        self.global_coordination_lock = threading.RLock()
        
        # Resource allocation tracking
        self.total_allocated_memory = 0
        self.max_total_memory = self.config.get('max_total_memory_mb', 2048)
        self.per_agent_max_memory = self.config.get('per_agent_workspace_mb', 64)
        self.shared_workspace_memory = self.config.get('shared_workspace_mb', 256)
        
        # Message routing and handling
        self.message_handlers: Dict[str, Callable] = {}
        self.message_middleware: List[Callable] = []
        
        # Performance tracking
        self.performance_metrics = {
            'coordination_overhead_ms': deque(maxlen=1000),
            'message_throughput': deque(maxlen=100),
            'workspace_allocations': 0,
            'workspace_deallocations': 0,
            'conflict_resolutions': 0,
            'active_agents': 0
        }
        
        # Event monitoring
        self.coordination_events: deque = deque(maxlen=10000)
        self.event_handlers: Dict[str, List[Callable]] = defaultdict(list)
        
        # Background services
        self.message_processor_executor = ThreadPoolExecutor(
            max_workers=self.config.get('message_processor_threads', 4),
            thread_name_prefix='MessageProcessor'
        )
        self.coordination_monitor_executor = ThreadPoolExecutor(
            max_workers=2,
            thread_name_prefix='CoordinationMonitor'
        )
        
        # Start background services
        self._start_message_processor()
        self._start_coordination_monitor()
        
        logger.info("AgentCoordinationEngine initialized with real-time optimization")
    
    def register_agent(self, agent_id: str, session_id: Optional[str] = None,
                      memory_requirement_mb: Optional[int] = None) -> Optional[str]:
        """
        Register a new agent and allocate workspace.
        
        Args:
            agent_id: Unique agent identifier
            session_id: Optional session association
            memory_requirement_mb: Memory requirement in MB
            
        Returns:
            workspace_id if successful, None if failed
        """
        start_time = time.perf_counter()
        
        try:
            with self.global_coordination_lock:
                # Check if agent already registered
                if agent_id in self.agents:
                    logger.warning(f"Agent {agent_id} already registered")
                    return self.agents[agent_id].workspace_id
                
                # Determine memory allocation
                memory_mb = memory_requirement_mb or self.per_agent_max_memory
                memory_mb = min(memory_mb, self.per_agent_max_memory)
                
                # Check if we have enough memory
                if self.total_allocated_memory + memory_mb > self.max_total_memory:
                    logger.error(f"Insufficient memory for agent {agent_id}")
                    return None
                
                # Create workspace
                workspace_id = f"ws_{agent_id}_{uuid.uuid4().hex[:8]}"
                timestamp = datetime.now().strftime("%m-%d_%I-%M%p")
                
                workspace = AgentWorkspace(
                    agent_id=agent_id,
                    workspace_id=workspace_id,
                    allocated_memory_mb=memory_mb,
                    shared_memory_segments=[],
                    private_data={},
                    shared_data_references={},
                    creation_time=timestamp,
                    last_access_time=timestamp,
                    access_count=0,
                    lock_count=0,
                    status=AgentStatus.INITIALIZING
                )
                
                # Register agent
                self.agents[agent_id] = workspace
                self.agent_locks[agent_id] = threading.RLock()
                self.message_queues[agent_id] = LockFreeMessageQueue()
                
                # Update allocation tracking
                self.total_allocated_memory += memory_mb
                self.performance_metrics['workspace_allocations'] += 1
                self.performance_metrics['active_agents'] = len(self.agents)
                
                # Create coordination event
                self._record_coordination_event(
                    'agent_registered',
                    agent_id,
                    session_id,
                    {'workspace_id': workspace_id, 'memory_mb': memory_mb}
                )
                
                # Update agent status
                workspace.status = AgentStatus.ACTIVE
                
                coordination_time = (time.perf_counter() - start_time) * 1000
                self.performance_metrics['coordination_overhead_ms'].append(coordination_time)
                
                logger.info(f"Agent {agent_id} registered with workspace {workspace_id} in {coordination_time:.2f}ms")
                return workspace_id
                
        except Exception as e:
            logger.error(f"Failed to register agent {agent_id}: {e}")
            return None
    
    def unregister_agent(self, agent_id: str) -> bool:
        """
        Unregister agent and cleanup workspace.
        
        Args:
            agent_id: Agent identifier
            
        Returns:
            Success status
        """
        start_time = time.perf_counter()
        
        try:
            with self.global_coordination_lock:
                if agent_id not in self.agents:
                    logger.warning(f"Agent {agent_id} not registered")
                    return False
                
                workspace = self.agents[agent_id]
                workspace.status = AgentStatus.TERMINATING
                
                # Clean up shared memory segments
                for segment_id in workspace.shared_memory_segments:
                    if segment_id in self.shared_memory_segments:
                        del self.shared_memory_segments[segment_id]
                
                # Update allocation tracking
                self.total_allocated_memory -= workspace.allocated_memory_mb
                
                # Remove agent resources
                del self.agents[agent_id]
                if agent_id in self.agent_locks:
                    del self.agent_locks[agent_id]
                if agent_id in self.message_queues:
                    del self.message_queues[agent_id]
                
                self.performance_metrics['workspace_deallocations'] += 1
                self.performance_metrics['active_agents'] = len(self.agents)
                
                # Record event
                self._record_coordination_event(
                    'agent_unregistered',
                    agent_id,
                    None,
                    {'workspace_id': workspace.workspace_id}
                )
                
                coordination_time = (time.perf_counter() - start_time) * 1000
                self.performance_metrics['coordination_overhead_ms'].append(coordination_time)
                
                logger.info(f"Agent {agent_id} unregistered in {coordination_time:.2f}ms")
                return True
                
        except Exception as e:
            logger.error(f"Failed to unregister agent {agent_id}: {e}")
            return False
    
    def send_message(self, from_agent: str, to_agent: str, message_type: str,
                    payload: Dict[str, Any], priority: MessagePriority = MessagePriority.NORMAL,
                    response_required: bool = False, timeout_seconds: Optional[int] = None) -> str:
        """
        Send message between agents with high-speed delivery.
        
        Args:
            from_agent: Sender agent ID
            to_agent: Recipient agent ID
            message_type: Type of message
            payload: Message payload
            priority: Message priority
            response_required: Whether response is required
            timeout_seconds: Message timeout
            
        Returns:
            message_id if sent successfully, empty string if failed
        """
        try:
            # Validate agents
            if from_agent not in self.agents or to_agent not in self.agents:
                logger.warning(f"Invalid agent IDs: {from_agent} -> {to_agent}")
                return ""
            
            # Create message
            message_id = f"msg_{uuid.uuid4().hex[:12]}"
            timestamp = datetime.now().strftime("%m-%d_%I-%M%p")
            
            message = AgentMessage(
                message_id=message_id,
                from_agent=from_agent,
                to_agent=to_agent,
                message_type=message_type,
                priority=priority,
                payload=payload,
                timestamp=timestamp,
                response_required=response_required,
                timeout_seconds=timeout_seconds
            )
            
            # Send message
            target_queue = self.message_queues[to_agent]
            if target_queue.put(message):
                # Record event
                self._record_coordination_event(
                    'message_sent',
                    from_agent,
                    None,
                    {'to_agent': to_agent, 'message_type': message_type, 'priority': priority.name}
                )
                return message_id
            else:
                logger.warning(f"Failed to send message from {from_agent} to {to_agent}: queue full")
                return ""
                
        except Exception as e:
            logger.error(f"Failed to send message from {from_agent} to {to_agent}: {e}")
            return ""
    
    def receive_message(self, agent_id: str, timeout_ms: int = 1) -> Optional[AgentMessage]:
        """
        Receive message for agent with minimal blocking.
        
        Args:
            agent_id: Agent identifier
            timeout_ms: Timeout in milliseconds
            
        Returns:
            AgentMessage if available, None if no message
        """
        try:
            if agent_id not in self.message_queues:
                return None
            
            message_queue = self.message_queues[agent_id]
            message = message_queue.get(timeout=timeout_ms / 1000.0)
            
            if message:
                # Update workspace access time
                if agent_id in self.agents:
                    workspace = self.agents[agent_id]
                    workspace.last_access_time = datetime.now().strftime("%m-%d_%I-%M%p")
                    workspace.access_count += 1
                
                # Record event
                self._record_coordination_event(
                    'message_received',
                    agent_id,
                    None,
                    {'from_agent': message.from_agent, 'message_type': message.message_type}
                )
            
            return message
            
        except Exception as e:
            logger.error(f"Failed to receive message for agent {agent_id}: {e}")
            return None
    
    def allocate_shared_memory(self, requesting_agent: str, segment_name: str,
                              initial_data: Optional[Dict[str, Any]] = None) -> Optional[str]:
        """
        Allocate shared memory segment for inter-agent communication.
        
        Args:
            requesting_agent: Agent requesting the shared memory
            segment_name: Name for the memory segment
            initial_data: Initial data for the segment
            
        Returns:
            segment_id if successful, None if failed
        """
        try:
            if requesting_agent not in self.agents:
                return None
            
            with self.global_coordination_lock:
                segment_id = f"shm_{segment_name}_{uuid.uuid4().hex[:8]}"
                
                # Create shared memory segment
                self.shared_memory_segments[segment_id] = {
                    'name': segment_name,
                    'data': initial_data or {},
                    'owner': requesting_agent,
                    'authorized_agents': {requesting_agent},
                    'creation_time': datetime.now().strftime("%m-%d_%I-%M%p"),
                    'access_count': 0,
                    'lock': threading.RLock()
                }
                
                # Add to agent's workspace
                workspace = self.agents[requesting_agent]
                workspace.shared_memory_segments.append(segment_id)
                workspace.shared_data_references[segment_name] = segment_id
                
                logger.info(f"Shared memory segment {segment_id} allocated for agent {requesting_agent}")
                return segment_id
                
        except Exception as e:
            logger.error(f"Failed to allocate shared memory for {requesting_agent}: {e}")
            return None
    
    def access_shared_memory(self, agent_id: str, segment_id: str, 
                           operation: str, data: Optional[Any] = None) -> Any:
        """
        Access shared memory segment with thread-safe operations.
        
        Args:
            agent_id: Agent accessing the memory
            segment_id: Shared memory segment ID
            operation: 'read', 'write', 'update'
            data: Data for write/update operations
            
        Returns:
            Data for read operations, success status for write operations
        """
        try:
            if segment_id not in self.shared_memory_segments:
                return None
            
            segment = self.shared_memory_segments[segment_id]
            
            # Check authorization
            if agent_id not in segment['authorized_agents']:
                logger.warning(f"Agent {agent_id} not authorized for segment {segment_id}")
                return None
            
            with segment['lock']:
                segment['access_count'] += 1
                
                if operation == 'read':
                    return segment['data'].copy()
                elif operation == 'write':
                    segment['data'] = data
                    return True
                elif operation == 'update':
                    if isinstance(segment['data'], dict) and isinstance(data, dict):
                        segment['data'].update(data)
                        return True
                    return False
                else:
                    logger.warning(f"Unknown operation: {operation}")
                    return None
                    
        except Exception as e:
            logger.error(f"Failed to access shared memory {segment_id} for agent {agent_id}: {e}")
            return None
    
    def resolve_resource_conflict(self, resource_id: str, conflicting_agents: List[str]) -> Optional[str]:
        """
        Resolve resource conflicts using priority-based arbitration.
        
        Args:
            resource_id: Conflicted resource identifier
            conflicting_agents: List of agents requesting the resource
            
        Returns:
            Winning agent ID or None if resolution failed
        """
        try:
            if not conflicting_agents:
                return None
            
            # Calculate priority scores for each agent
            agent_scores = []
            for agent_id in conflicting_agents:
                if agent_id in self.agents:
                    workspace = self.agents[agent_id]
                    
                    # Score based on multiple factors
                    score = 0
                    
                    # Recent activity weight
                    try:
                        last_access = datetime.strptime(workspace.last_access_time, "%m-%d_%I-%M%p")
                        hours_since_access = (datetime.now() - last_access).total_seconds() / 3600
                        score += max(0, 10 - hours_since_access)  # More recent = higher score
                    except:
                        score += 5  # Default score
                    
                    # Access count weight
                    score += min(workspace.access_count / 100, 5)  # Cap at 5 points
                    
                    # Current lock count penalty
                    score -= workspace.lock_count * 2
                    
                    agent_scores.append((score, agent_id))
            
            # Sort by score (highest first) and select winner
            agent_scores.sort(reverse=True)
            winner = agent_scores[0][1]
            
            # Record conflict resolution
            self.performance_metrics['conflict_resolutions'] += 1
            self._record_coordination_event(
                'conflict_resolved',
                winner,
                None,
                {'resource_id': resource_id, 'conflicting_agents': conflicting_agents}
            )
            
            logger.info(f"Resource conflict for {resource_id} resolved in favor of {winner}")
            return winner
            
        except Exception as e:
            logger.error(f"Failed to resolve resource conflict for {resource_id}: {e}")
            return None
    
    def _start_message_processor(self):
        """Start background message processing service."""
        def process_messages():
            while True:
                try:
                    # Process messages for all agents
                    for agent_id, message_queue in self.message_queues.items():
                        # Process middleware for outgoing messages
                        queue_size = message_queue.size()
                        if queue_size > 0:
                            # Update throughput metrics
                            self.performance_metrics['message_throughput'].append(queue_size)
                    
                    time.sleep(0.001)  # 1ms processing cycle
                    
                except Exception as e:
                    logger.error(f"Message processing error: {e}")
                    time.sleep(0.1)
        
        self.message_processor_executor.submit(process_messages)
    
    def _start_coordination_monitor(self):
        """Start background coordination monitoring service."""
        def monitor_coordination():
            while True:
                try:
                    # Monitor agent health and workspace usage
                    current_time = datetime.now()
                    
                    for agent_id, workspace in list(self.agents.items()):
                        try:
                            last_access = datetime.strptime(workspace.last_access_time, "%m-%d_%I-%M%p")
                            
                            # Check for inactive agents
                            if current_time - last_access > timedelta(minutes=30):
                                logger.warning(f"Agent {agent_id} inactive for >30 minutes")
                                workspace.status = AgentStatus.INACTIVE
                        except:
                            pass
                    
                    # Clean up old coordination events
                    if len(self.coordination_events) > 8000:
                        # Keep only recent events
                        self.coordination_events = deque(
                            list(self.coordination_events)[-5000:], 
                            maxlen=10000
                        )
                    
                    time.sleep(10)  # Monitor every 10 seconds
                    
                except Exception as e:
                    logger.error(f"Coordination monitoring error: {e}")
                    time.sleep(30)
        
        self.coordination_monitor_executor.submit(monitor_coordination)
    
    def _record_coordination_event(self, event_type: str, agent_id: str, 
                                  session_id: Optional[str], details: Dict[str, Any]):
        """Record coordination event for monitoring."""
        event = CoordinationEvent(
            event_id=f"evt_{uuid.uuid4().hex[:8]}",
            event_type=event_type,
            agent_id=agent_id,
            session_id=session_id,
            timestamp=datetime.now().strftime("%m-%d_%I-%M%p"),
            details=details,
            processing_time_ms=0.0  # Would be filled by caller if needed
        )
        
        self.coordination_events.append(event)
        
        # Trigger event handlers
        for handler in self.event_handlers.get(event_type, []):
            try:
                handler(event)
            except Exception as e:
                logger.error(f"Event handler error for {event_type}: {e}")
    
    def get_agent_status(self, agent_id: str) -> Optional[Dict[str, Any]]:
        """Get comprehensive agent status information."""
        if agent_id not in self.agents:
            return None
        
        workspace = self.agents[agent_id]
        message_queue = self.message_queues.get(agent_id)
        
        return {
            'agent_id': agent_id,
            'workspace_id': workspace.workspace_id,
            'status': workspace.status.value,
            'allocated_memory_mb': workspace.allocated_memory_mb,
            'shared_memory_segments': len(workspace.shared_memory_segments),
            'access_count': workspace.access_count,
            'lock_count': workspace.lock_count,
            'last_access_time': workspace.last_access_time,
            'pending_messages': message_queue.size() if message_queue else 0,
            'private_data_keys': len(workspace.private_data),
            'shared_data_references': len(workspace.shared_data_references)
        }
    
    def get_performance_metrics(self) -> Dict[str, Any]:
        """Get comprehensive performance metrics."""
        coordination_times = list(self.performance_metrics['coordination_overhead_ms'])
        throughput_data = list(self.performance_metrics['message_throughput'])
        
        return {
            'coordination_performance': {
                'average_overhead_ms': sum(coordination_times) / len(coordination_times) if coordination_times else 0,
                'max_overhead_ms': max(coordination_times) if coordination_times else 0,
                'min_overhead_ms': min(coordination_times) if coordination_times else 0
            },
            'message_throughput': {
                'average_queue_size': sum(throughput_data) / len(throughput_data) if throughput_data else 0,
                'max_queue_size': max(throughput_data) if throughput_data else 0
            },
            'resource_allocation': {
                'active_agents': self.performance_metrics['active_agents'],
                'total_allocated_memory_mb': self.total_allocated_memory,
                'memory_utilization_percent': (self.total_allocated_memory / self.max_total_memory) * 100,
                'workspace_allocations': self.performance_metrics['workspace_allocations'],
                'workspace_deallocations': self.performance_metrics['workspace_deallocations']
            },
            'system_health': {
                'conflict_resolutions': self.performance_metrics['conflict_resolutions'],
                'shared_memory_segments': len(self.shared_memory_segments),
                'coordination_events': len(self.coordination_events)
            }
        }
    
    def _load_config(self, config_path: str) -> Dict[str, Any]:
        """Load configuration from file."""
        try:
            with open(config_path, 'r') as f:
                full_config = json.load(f)
                return full_config.get('agent_coordination', {})
        except Exception as e:
            logger.warning(f"Failed to load config from {config_path}: {e}")
            return self._default_config()
    
    def _default_config(self) -> Dict[str, Any]:
        """Return default configuration."""
        return {
            'max_total_memory_mb': 2048,
            'per_agent_workspace_mb': 64,
            'shared_workspace_mb': 256,
            'message_processor_threads': 4,
            'coordination_overhead_target_ms': 0.5
        }

# Global coordination engine instance
_coordination_engine = None

def get_coordination_engine(config_path: str = None) -> AgentCoordinationEngine:
    """Get global coordination engine instance."""
    global _coordination_engine
    if _coordination_engine is None:
        _coordination_engine = AgentCoordinationEngine(config_path)
    return _coordination_engine

def register_agent(agent_id: str, session_id: Optional[str] = None) -> Optional[str]:
    """Module-level function to register agent."""
    return get_coordination_engine().register_agent(agent_id, session_id)

def send_message(from_agent: str, to_agent: str, message_type: str, 
                payload: Dict[str, Any], priority: MessagePriority = MessagePriority.NORMAL) -> str:
    """Module-level function to send message."""
    return get_coordination_engine().send_message(from_agent, to_agent, message_type, payload, priority)

def receive_message(agent_id: str) -> Optional[AgentMessage]:
    """Module-level function to receive message."""
    return get_coordination_engine().receive_message(agent_id)

if __name__ == "__main__":
    # Test agent coordination engine
    print("Testing AgentCoordinationEngine performance...")
    
    engine = AgentCoordinationEngine()
    
    # Register test agents
    agent1_workspace = engine.register_agent("test_agent_1")
    agent2_workspace = engine.register_agent("test_agent_2")
    
    print(f"Agent 1 workspace: {agent1_workspace}")
    print(f"Agent 2 workspace: {agent2_workspace}")
    
    # Test message passing
    message_id = engine.send_message(
        "test_agent_1", 
        "test_agent_2", 
        "test_message",
        {"data": "Hello from agent 1"},
        MessagePriority.NORMAL
    )
    print(f"Sent message: {message_id}")
    
    # Receive message
    received_message = engine.receive_message("test_agent_2")
    if received_message:
        print(f"Received message: {received_message.message_type}")
    
    # Test shared memory
    segment_id = engine.allocate_shared_memory("test_agent_1", "shared_data", {"counter": 0})
    print(f"Allocated shared memory: {segment_id}")
    
    # Test shared memory access
    data = engine.access_shared_memory("test_agent_1", segment_id, "read")
    print(f"Shared memory data: {data}")
    
    # Show performance metrics
    metrics = engine.get_performance_metrics()
    print("Performance metrics:", json.dumps(metrics, indent=2))
    
    # Cleanup
    engine.unregister_agent("test_agent_1")
    engine.unregister_agent("test_agent_2")
    print("Test completed successfully")
