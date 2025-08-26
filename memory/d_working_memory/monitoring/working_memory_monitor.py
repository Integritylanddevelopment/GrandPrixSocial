"""
WORKING MEMORY MONITOR - Real-Time System Health & Performance
============================================================

Comprehensive monitoring system for Working Memory subsystems.
Provides real-time health checks, performance analytics, and quality assurance.

Features:
- Sub-millisecond performance monitoring
- Real-time anomaly detection
- Quality assurance validation
- System health dashboards
- Proactive alerting and failover
- Performance optimization recommendations

Interactions:
- All Working Memory subsystems for health monitoring
- Session Engine: Session lifecycle monitoring
- Cache Engine: Cache performance and hit rates
- Coordination Engine: Agent activity and resource usage
"""

import json
import time
import threading
import statistics
from datetime import datetime, timedelta
from typing import Dict, Any, Optional, List, Tuple, Callable
from dataclasses import dataclass, asdict
from collections import deque, defaultdict
from enum import Enum
import logging
import psutil
import gc

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class HealthStatus(Enum):
    """System health status levels."""
    EXCELLENT = "excellent"
    GOOD = "good"
    WARNING = "warning"
    CRITICAL = "critical"
    FAILURE = "failure"

class AlertSeverity(Enum):
    """Alert severity levels."""
    INFO = "info"
    WARNING = "warning"
    ERROR = "error"
    CRITICAL = "critical"

@dataclass
class PerformanceMetric:
    """Individual performance metric data point."""
    metric_name: str
    value: float
    unit: str
    timestamp: str
    context: Dict[str, Any]
    target_value: Optional[float] = None
    threshold_warning: Optional[float] = None
    threshold_critical: Optional[float] = None

@dataclass
class HealthCheckResult:
    """Result of a health check operation."""
    check_name: str
    status: HealthStatus
    message: str
    metrics: List[PerformanceMetric]
    timestamp: str
    execution_time_ms: float
    recommendations: List[str]

@dataclass
class SystemAlert:
    """System alert for monitoring events."""
    alert_id: str
    severity: AlertSeverity
    component: str
    message: str
    timestamp: str
    metrics: Dict[str, Any]
    auto_resolved: bool = False
    resolution_time: Optional[str] = None

class RealTimeMonitor:
    """
    Real-time monitoring system for Working Memory performance.
    
    Provides continuous monitoring with minimal performance impact.
    """
    
    def __init__(self, config_path: str = None):
        """Initialize the real-time monitor."""
        # Load configuration
        self.config = self._load_config(config_path) if config_path else self._default_config()
        
        # Performance tracking
        self.performance_history: Dict[str, deque] = defaultdict(lambda: deque(maxlen=10000))
        self.alert_history: deque = deque(maxlen=1000)
        self.health_check_results: Dict[str, HealthCheckResult] = {}
        
        # Monitoring state
        self.monitoring_active = True
        self.last_cleanup_time = time.time()
        self.monitoring_start_time = time.time()
        
        # Health check functions
        self.health_checks = {
            'response_time': self._check_response_time,
            'memory_usage': self._check_memory_usage,
            'cache_performance': self._check_cache_performance,
            'agent_coordination': self._check_agent_coordination,
            'session_health': self._check_session_health,
            'system_resources': self._check_system_resources
        }
        
        # Alert handlers
        self.alert_handlers: Dict[AlertSeverity, List[Callable]] = defaultdict(list)
        
        # Background monitoring threads
        self.monitor_thread = threading.Thread(target=self._monitoring_loop, daemon=True)
        self.alert_processor_thread = threading.Thread(target=self._alert_processing_loop, daemon=True)
        
        # Performance optimization tracking
        self.optimization_suggestions = deque(maxlen=100)
        self.performance_trends = {}
        
        # Start monitoring
        self.monitor_thread.start()
        self.alert_processor_thread.start()
        
        logger.info("WorkingMemoryMonitor initialized with real-time monitoring")
    
    def record_metric(self, metric_name: str, value: float, unit: str = "",
                     context: Optional[Dict[str, Any]] = None,
                     target_value: Optional[float] = None) -> None:
        """
        Record a performance metric with minimal overhead.
        
        Args:
            metric_name: Name of the metric
            value: Metric value
            unit: Unit of measurement
            context: Additional context data
            target_value: Target/expected value for comparison
        """
        try:
            timestamp = datetime.now().strftime("%m-%d_%I-%M%p")
            
            metric = PerformanceMetric(
                metric_name=metric_name,
                value=value,
                unit=unit,
                timestamp=timestamp,
                context=context or {},
                target_value=target_value
            )
            
            # Store in performance history
            self.performance_history[metric_name].append(metric)
            
            # Check for immediate alerts
            self._check_metric_thresholds(metric)
            
        except Exception as e:
            logger.error(f"Failed to record metric {metric_name}: {e}")
    
    def get_performance_summary(self, time_window_minutes: int = 60) -> Dict[str, Any]:
        """
        Get performance summary for specified time window.
        
        Args:
            time_window_minutes: Time window for analysis
            
        Returns:
            Performance summary with statistics and trends
        """
        try:
            current_time = datetime.now()
            cutoff_time = current_time - timedelta(minutes=time_window_minutes)
            
            summary = {
                'time_window_minutes': time_window_minutes,
                'generated_at': current_time.strftime("%m-%d_%I-%M%p"),
                'metrics': {},
                'overall_health': self._calculate_overall_health(),
                'active_alerts': len([alert for alert in self.alert_history if not alert.auto_resolved]),
                'uptime_minutes': (time.time() - self.monitoring_start_time) / 60
            }
            
            # Analyze each metric
            for metric_name, metric_history in self.performance_history.items():
                metric_values = []
                
                for metric in metric_history:
                    try:
                        metric_time = datetime.strptime(metric.timestamp, "%m-%d_%I-%M%p")
                        if metric_time >= cutoff_time:
                            metric_values.append(metric.value)
                    except:
                        continue
                
                if metric_values:
                    summary['metrics'][metric_name] = {
                        'count': len(metric_values),
                        'average': statistics.mean(metric_values),
                        'median': statistics.median(metric_values),
                        'min': min(metric_values),
                        'max': max(metric_values),
                        'std_dev': statistics.stdev(metric_values) if len(metric_values) > 1 else 0,
                        'latest': metric_values[-1],
                        'trend': self._calculate_trend(metric_values),
                        'unit': metric_history[-1].unit if metric_history else ""
                    }
            
            return summary
            
        except Exception as e:
            logger.error(f"Failed to generate performance summary: {e}")
            return {'error': str(e)}
    
    def run_health_check(self, check_name: Optional[str] = None) -> Dict[str, HealthCheckResult]:
        """
        Run health checks on Working Memory subsystems.
        
        Args:
            check_name: Specific check to run, or None for all checks
            
        Returns:
            Dictionary of health check results
        """
        results = {}
        
        checks_to_run = [check_name] if check_name and check_name in self.health_checks else self.health_checks.keys()
        
        for check in checks_to_run:
            try:
                start_time = time.perf_counter()
                result = self.health_checks[check]()
                execution_time = (time.perf_counter() - start_time) * 1000
                
                result.execution_time_ms = execution_time
                results[check] = result
                self.health_check_results[check] = result
                
                # Generate alerts for critical health issues
                if result.status in [HealthStatus.CRITICAL, HealthStatus.FAILURE]:
                    self._generate_alert(
                        AlertSeverity.CRITICAL,
                        f"health_check_{check}",
                        f"Health check failed: {result.message}",
                        {'check_name': check, 'status': result.status.value}
                    )
                
            except Exception as e:
                error_result = HealthCheckResult(
                    check_name=check,
                    status=HealthStatus.FAILURE,
                    message=f"Health check failed with exception: {e}",
                    metrics=[],
                    timestamp=datetime.now().strftime("%m-%d_%I-%M%p"),
                    execution_time_ms=0,
                    recommendations=["Investigate health check implementation"]
                )
                results[check] = error_result
                logger.error(f"Health check {check} failed: {e}")
        
        return results
    
    def _check_response_time(self) -> HealthCheckResult:
        """Check system response time performance."""
        timestamp = datetime.now().strftime("%m-%d_%I-%M%p")
        metrics = []
        recommendations = []
        
        # Check recent response time metrics
        response_time_metrics = list(self.performance_history.get('response_time_ms', []))
        
        if not response_time_metrics:
            return HealthCheckResult(
                check_name='response_time',
                status=HealthStatus.WARNING,
                message="No response time metrics available",
                metrics=[],
                timestamp=timestamp,
                execution_time_ms=0,
                recommendations=["Enable response time tracking"]
            )
        
        # Analyze recent response times (last 100 measurements)
        recent_times = [m.value for m in response_time_metrics[-100:]]
        avg_response_time = statistics.mean(recent_times)
        max_response_time = max(recent_times)
        
        target_response_time = self.config.get('target_response_time_ms', 1.0)
        warning_threshold = target_response_time * 5
        critical_threshold = target_response_time * 10
        
        # Create metrics
        metrics.append(PerformanceMetric(
            metric_name='average_response_time',
            value=avg_response_time,
            unit='ms',
            timestamp=timestamp,
            context={'sample_size': len(recent_times)},
            target_value=target_response_time,
            threshold_warning=warning_threshold,
            threshold_critical=critical_threshold
        ))
        
        metrics.append(PerformanceMetric(
            metric_name='max_response_time',
            value=max_response_time,
            unit='ms',
            timestamp=timestamp,
            context={'sample_size': len(recent_times)}
        ))
        
        # Determine status
        status = HealthStatus.EXCELLENT
        message = f"Response time excellent: {avg_response_time:.2f}ms average"
        
        if avg_response_time > critical_threshold:
            status = HealthStatus.CRITICAL
            message = f"Response time critical: {avg_response_time:.2f}ms average (target: {target_response_time}ms)"
            recommendations.extend([
                "Review cache hit rates",
                "Check for memory pressure",
                "Optimize frequently accessed code paths",
                "Consider scaling resources"
            ])
        elif avg_response_time > warning_threshold:
            status = HealthStatus.WARNING
            message = f"Response time degraded: {avg_response_time:.2f}ms average (target: {target_response_time}ms)"
            recommendations.extend([
                "Monitor for increasing trends",
                "Review recent configuration changes"
            ])
        elif avg_response_time <= target_response_time:
            status = HealthStatus.EXCELLENT
        else:
            status = HealthStatus.GOOD
        
        return HealthCheckResult(
            check_name='response_time',
            status=status,
            message=message,
            metrics=metrics,
            timestamp=timestamp,
            execution_time_ms=0,
            recommendations=recommendations
        )
    
    def _check_memory_usage(self) -> HealthCheckResult:
        """Check memory usage and pressure."""
        timestamp = datetime.now().strftime("%m-%d_%I-%M%p")
        metrics = []
        recommendations = []
        
        try:
            # Get process memory info
            process = psutil.Process()
            memory_info = process.memory_info()
            memory_mb = memory_info.rss / 1024 / 1024
            
            # Get system memory info
            system_memory = psutil.virtual_memory()
            system_memory_percent = system_memory.percent
            
            # Configuration thresholds
            max_memory_mb = self.config.get('max_memory_mb', 2048)
            warning_threshold = max_memory_mb * 0.8
            critical_threshold = max_memory_mb * 0.9
            
            # Create metrics
            metrics.append(PerformanceMetric(
                metric_name='process_memory_usage',
                value=memory_mb,
                unit='MB',
                timestamp=timestamp,
                context={'max_memory_mb': max_memory_mb},
                target_value=max_memory_mb * 0.5,
                threshold_warning=warning_threshold,
                threshold_critical=critical_threshold
            ))
            
            metrics.append(PerformanceMetric(
                metric_name='system_memory_usage',
                value=system_memory_percent,
                unit='%',
                timestamp=timestamp,
                context={'available_gb': system_memory.available / 1024 / 1024 / 1024}
            ))
            
            # Determine status
            status = HealthStatus.GOOD
            message = f"Memory usage normal: {memory_mb:.1f}MB ({memory_mb/max_memory_mb*100:.1f}% of limit)"
            
            if memory_mb > critical_threshold:
                status = HealthStatus.CRITICAL
                message = f"Memory usage critical: {memory_mb:.1f}MB ({memory_mb/max_memory_mb*100:.1f}% of limit)"
                recommendations.extend([
                    "Trigger aggressive cache cleanup",
                    "Force garbage collection",
                    "Review memory-intensive operations",
                    "Consider increasing memory limits"
                ])
            elif memory_mb > warning_threshold:
                status = HealthStatus.WARNING
                message = f"Memory usage high: {memory_mb:.1f}MB ({memory_mb/max_memory_mb*100:.1f}% of limit)"
                recommendations.extend([
                    "Monitor memory growth trends",
                    "Review cache eviction policies",
                    "Check for memory leaks"
                ])
            
            # Additional system memory checks
            if system_memory_percent > 90:
                status = min(status, HealthStatus.WARNING)
                recommendations.append("System memory pressure detected")
            
            return HealthCheckResult(
                check_name='memory_usage',
                status=status,
                message=message,
                metrics=metrics,
                timestamp=timestamp,
                execution_time_ms=0,
                recommendations=recommendations
            )
            
        except Exception as e:
            return HealthCheckResult(
                check_name='memory_usage',
                status=HealthStatus.FAILURE,
                message=f"Memory check failed: {e}",
                metrics=[],
                timestamp=timestamp,
                execution_time_ms=0,
                recommendations=["Investigate memory monitoring system"]
            )
    
    def _check_cache_performance(self) -> HealthCheckResult:
        """Check cache performance and hit rates."""
        timestamp = datetime.now().strftime("%m-%d_%I-%M%p")
        metrics = []
        recommendations = []
        
        # Get cache hit rate metrics
        hit_rate_metrics = list(self.performance_history.get('cache_hit_rate', []))
        
        if not hit_rate_metrics:
            return HealthCheckResult(
                check_name='cache_performance',
                status=HealthStatus.WARNING,
                message="No cache performance metrics available",
                metrics=[],
                timestamp=timestamp,
                execution_time_ms=0,
                recommendations=["Enable cache performance tracking"]
            )
        
        # Analyze recent hit rates
        recent_hit_rates = [m.value for m in hit_rate_metrics[-50:]]
        avg_hit_rate = statistics.mean(recent_hit_rates)
        
        target_hit_rate = self.config.get('target_cache_hit_rate', 0.9)
        warning_threshold = target_hit_rate * 0.8
        critical_threshold = target_hit_rate * 0.6
        
        metrics.append(PerformanceMetric(
            metric_name='cache_hit_rate',
            value=avg_hit_rate,
            unit='ratio',
            timestamp=timestamp,
            context={'sample_size': len(recent_hit_rates)},
            target_value=target_hit_rate,
            threshold_warning=warning_threshold,
            threshold_critical=critical_threshold
        ))
        
        # Determine status
        status = HealthStatus.GOOD
        message = f"Cache performance good: {avg_hit_rate:.1%} hit rate"
        
        if avg_hit_rate < critical_threshold:
            status = HealthStatus.CRITICAL
            message = f"Cache performance critical: {avg_hit_rate:.1%} hit rate (target: {target_hit_rate:.1%})"
            recommendations.extend([
                "Review cache eviction policies",
                "Increase cache size if possible",
                "Analyze access patterns",
                "Consider cache warming strategies"
            ])
        elif avg_hit_rate < warning_threshold:
            status = HealthStatus.WARNING
            message = f"Cache performance degraded: {avg_hit_rate:.1%} hit rate (target: {target_hit_rate:.1%})"
            recommendations.extend([
                "Monitor cache performance trends",
                "Review cache configuration"
            ])
        elif avg_hit_rate >= target_hit_rate:
            status = HealthStatus.EXCELLENT
            message = f"Cache performance excellent: {avg_hit_rate:.1%} hit rate"
        
        return HealthCheckResult(
            check_name='cache_performance',
            status=status,
            message=message,
            metrics=metrics,
            timestamp=timestamp,
            execution_time_ms=0,
            recommendations=recommendations
        )
    
    def _check_agent_coordination(self) -> HealthCheckResult:
        """Check agent coordination performance."""
        timestamp = datetime.now().strftime("%m-%d_%I-%M%p")
        metrics = []
        recommendations = []
        
        # Get coordination overhead metrics
        coordination_metrics = list(self.performance_history.get('coordination_overhead_ms', []))
        
        if not coordination_metrics:
            return HealthCheckResult(
                check_name='agent_coordination',
                status=HealthStatus.WARNING,
                message="No coordination performance metrics available",
                metrics=[],
                timestamp=timestamp,
                execution_time_ms=0,
                recommendations=["Enable coordination performance tracking"]
            )
        
        # Analyze recent coordination overhead
        recent_overhead = [m.value for m in coordination_metrics[-100:]]
        avg_overhead = statistics.mean(recent_overhead)
        max_overhead = max(recent_overhead)
        
        target_overhead = self.config.get('target_coordination_overhead_ms', 0.5)
        warning_threshold = target_overhead * 5
        critical_threshold = target_overhead * 10
        
        metrics.append(PerformanceMetric(
            metric_name='coordination_overhead',
            value=avg_overhead,
            unit='ms',
            timestamp=timestamp,
            context={'sample_size': len(recent_overhead)},
            target_value=target_overhead,
            threshold_warning=warning_threshold,
            threshold_critical=critical_threshold
        ))
        
        # Determine status
        status = HealthStatus.GOOD
        message = f"Agent coordination good: {avg_overhead:.2f}ms average overhead"
        
        if avg_overhead > critical_threshold:
            status = HealthStatus.CRITICAL
            message = f"Agent coordination critical: {avg_overhead:.2f}ms overhead (target: {target_overhead}ms)"
            recommendations.extend([
                "Review agent synchronization patterns",
                "Check for resource contention",
                "Optimize message passing",
                "Consider reducing concurrent agents"
            ])
        elif avg_overhead > warning_threshold:
            status = HealthStatus.WARNING
            message = f"Agent coordination degraded: {avg_overhead:.2f}ms overhead (target: {target_overhead}ms)"
            recommendations.extend([
                "Monitor coordination trends",
                "Review recent agent changes"
            ])
        elif avg_overhead <= target_overhead:
            status = HealthStatus.EXCELLENT
            message = f"Agent coordination excellent: {avg_overhead:.2f}ms overhead"
        
        return HealthCheckResult(
            check_name='agent_coordination',
            status=status,
            message=message,
            metrics=metrics,
            timestamp=timestamp,
            execution_time_ms=0,
            recommendations=recommendations
        )
    
    def _check_session_health(self) -> HealthCheckResult:
        """Check session management health."""
        timestamp = datetime.now().strftime("%m-%d_%I-%M%p")
        
        # Basic session health check (would integrate with actual session engine)
        return HealthCheckResult(
            check_name='session_health',
            status=HealthStatus.GOOD,
            message="Session management operational",
            metrics=[],
            timestamp=timestamp,
            execution_time_ms=0,
            recommendations=[]
        )
    
    def _check_system_resources(self) -> HealthCheckResult:
        """Check overall system resource health."""
        timestamp = datetime.now().strftime("%m-%d_%I-%M%p")
        metrics = []
        recommendations = []
        
        try:
            # CPU usage
            cpu_percent = psutil.cpu_percent(interval=0.1)
            
            # Disk usage
            disk_usage = psutil.disk_usage('.')
            disk_percent = (disk_usage.used / disk_usage.total) * 100
            
            # Network connections (if relevant)
            connections = len(psutil.net_connections())
            
            metrics.extend([
                PerformanceMetric('cpu_usage', cpu_percent, '%', timestamp, {}),
                PerformanceMetric('disk_usage', disk_percent, '%', timestamp, {}),
                PerformanceMetric('network_connections', connections, 'count', timestamp, {})
            ])
            
            # Determine overall system health
            status = HealthStatus.GOOD
            issues = []
            
            if cpu_percent > 90:
                issues.append(f"High CPU usage: {cpu_percent}%")
                recommendations.append("Review CPU-intensive operations")
            
            if disk_percent > 90:
                issues.append(f"High disk usage: {disk_percent:.1f}%")
                recommendations.append("Clean up disk space")
            
            if issues:
                status = HealthStatus.WARNING if len(issues) == 1 else HealthStatus.CRITICAL
                message = f"System resource issues: {', '.join(issues)}"
            else:
                message = f"System resources healthy: CPU {cpu_percent}%, Disk {disk_percent:.1f}%"
            
            return HealthCheckResult(
                check_name='system_resources',
                status=status,
                message=message,
                metrics=metrics,
                timestamp=timestamp,
                execution_time_ms=0,
                recommendations=recommendations
            )
            
        except Exception as e:
            return HealthCheckResult(
                check_name='system_resources',
                status=HealthStatus.FAILURE,
                message=f"System resource check failed: {e}",
                metrics=[],
                timestamp=timestamp,
                execution_time_ms=0,
                recommendations=["Investigate system monitoring"]
            )
    
    def _monitoring_loop(self):
        """Main monitoring loop running in background."""
        while self.monitoring_active:
            try:
                # Run periodic health checks
                if time.time() - self.last_cleanup_time > self.config.get('health_check_interval_seconds', 30):
                    self.run_health_check()
                    self.last_cleanup_time = time.time()
                
                # Cleanup old metrics
                self._cleanup_old_metrics()
                
                # Sleep for monitoring interval
                time.sleep(self.config.get('monitoring_interval_seconds', 5))
                
            except Exception as e:
                logger.error(f"Monitoring loop error: {e}")
                time.sleep(10)
    
    def _alert_processing_loop(self):
        """Background alert processing loop."""
        while self.monitoring_active:
            try:
                # Process and potentially auto-resolve alerts
                self._process_pending_alerts()
                
                time.sleep(5)  # Process alerts every 5 seconds
                
            except Exception as e:
                logger.error(f"Alert processing error: {e}")
                time.sleep(10)
    
    def _check_metric_thresholds(self, metric: PerformanceMetric):
        """Check if metric crosses alerting thresholds."""
        if metric.threshold_critical and metric.value > metric.threshold_critical:
            self._generate_alert(
                AlertSeverity.CRITICAL,
                f"metric_{metric.metric_name}",
                f"Metric {metric.metric_name} critical: {metric.value} {metric.unit}",
                {'metric': asdict(metric)}
            )
        elif metric.threshold_warning and metric.value > metric.threshold_warning:
            self._generate_alert(
                AlertSeverity.WARNING,
                f"metric_{metric.metric_name}",
                f"Metric {metric.metric_name} warning: {metric.value} {metric.unit}",
                {'metric': asdict(metric)}
            )
    
    def _generate_alert(self, severity: AlertSeverity, component: str, 
                       message: str, metrics: Dict[str, Any]):
        """Generate system alert."""
        alert = SystemAlert(
            alert_id=f"alert_{int(time.time() * 1000)}",
            severity=severity,
            component=component,
            message=message,
            timestamp=datetime.now().strftime("%m-%d_%I-%M%p"),
            metrics=metrics
        )
        
        self.alert_history.append(alert)
        
        # Call alert handlers
        for handler in self.alert_handlers[severity]:
            try:
                handler(alert)
            except Exception as e:
                logger.error(f"Alert handler error: {e}")
        
        # Log alert
        logger.log(
            logging.CRITICAL if severity == AlertSeverity.CRITICAL else
            logging.ERROR if severity == AlertSeverity.ERROR else
            logging.WARNING if severity == AlertSeverity.WARNING else
            logging.INFO,
            f"ALERT [{severity.value.upper()}] {component}: {message}"
        )
    
    def _process_pending_alerts(self):
        """Process pending alerts for auto-resolution."""
        for alert in self.alert_history:
            if not alert.auto_resolved and self._should_auto_resolve_alert(alert):
                alert.auto_resolved = True
                alert.resolution_time = datetime.now().strftime("%m-%d_%I-%M%p")
                logger.info(f"Auto-resolved alert {alert.alert_id}")
    
    def _should_auto_resolve_alert(self, alert: SystemAlert) -> bool:
        """Determine if alert should be auto-resolved."""
        # Simple time-based auto-resolution for demonstration
        try:
            alert_time = datetime.strptime(alert.timestamp, "%m-%d_%I-%M%p")
            age_minutes = (datetime.now() - alert_time).total_seconds() / 60
            
            # Auto-resolve info alerts after 5 minutes, warnings after 30 minutes
            if alert.severity == AlertSeverity.INFO and age_minutes > 5:
                return True
            elif alert.severity == AlertSeverity.WARNING and age_minutes > 30:
                return True
            
        except:
            pass
        
        return False
    
    def _calculate_overall_health(self) -> HealthStatus:
        """Calculate overall system health status."""
        if not self.health_check_results:
            return HealthStatus.WARNING
        
        statuses = [result.status for result in self.health_check_results.values()]
        
        if HealthStatus.FAILURE in statuses:
            return HealthStatus.FAILURE
        elif HealthStatus.CRITICAL in statuses:
            return HealthStatus.CRITICAL
        elif HealthStatus.WARNING in statuses:
            return HealthStatus.WARNING
        elif all(status == HealthStatus.EXCELLENT for status in statuses):
            return HealthStatus.EXCELLENT
        else:
            return HealthStatus.GOOD
    
    def _calculate_trend(self, values: List[float]) -> str:
        """Calculate trend direction for metric values."""
        if len(values) < 2:
            return "stable"
        
        # Simple trend calculation using first and last values
        if values[-1] > values[0] * 1.1:
            return "increasing"
        elif values[-1] < values[0] * 0.9:
            return "decreasing"
        else:
            return "stable"
    
    def _cleanup_old_metrics(self):
        """Clean up old metrics to prevent memory growth."""
        max_age_hours = self.config.get('max_metric_age_hours', 24)
        cutoff_time = datetime.now() - timedelta(hours=max_age_hours)
        
        for metric_name, metric_history in self.performance_history.items():
            # Keep only recent metrics
            filtered_metrics = deque(maxlen=metric_history.maxlen)
            
            for metric in metric_history:
                try:
                    metric_time = datetime.strptime(metric.timestamp, "%m-%d_%I-%M%p")
                    if metric_time >= cutoff_time:
                        filtered_metrics.append(metric)
                except:
                    # Keep metric if timestamp parsing fails
                    filtered_metrics.append(metric)
            
            self.performance_history[metric_name] = filtered_metrics
    
    def _load_config(self, config_path: str) -> Dict[str, Any]:
        """Load configuration from file."""
        try:
            with open(config_path, 'r') as f:
                full_config = json.load(f)
                return full_config.get('monitoring', {})
        except Exception as e:
            logger.warning(f"Failed to load config from {config_path}: {e}")
            return self._default_config()
    
    def _default_config(self) -> Dict[str, Any]:
        """Return default configuration."""
        return {
            'target_response_time_ms': 1.0,
            'target_cache_hit_rate': 0.9,
            'target_coordination_overhead_ms': 0.5,
            'max_memory_mb': 2048,
            'health_check_interval_seconds': 30,
            'monitoring_interval_seconds': 5,
            'max_metric_age_hours': 24
        }
    
    def stop_monitoring(self):
        """Stop the monitoring system."""
        self.monitoring_active = False
        logger.info("WorkingMemoryMonitor stopped")

# Global monitor instance
_monitor = None

def get_monitor(config_path: str = None) -> RealTimeMonitor:
    """Get global monitor instance."""
    global _monitor
    if _monitor is None:
        _monitor = RealTimeMonitor(config_path)
    return _monitor

def record_metric(metric_name: str, value: float, unit: str = "", 
                 context: Optional[Dict[str, Any]] = None) -> None:
    """Module-level function to record metric."""
    get_monitor().record_metric(metric_name, value, unit, context)

def get_performance_summary(time_window_minutes: int = 60) -> Dict[str, Any]:
    """Module-level function to get performance summary."""
    return get_monitor().get_performance_summary(time_window_minutes)

if __name__ == "__main__":
    # Test monitoring system
    print("Testing WorkingMemoryMonitor...")
    
    monitor = RealTimeMonitor()
    
    # Record test metrics
    for i in range(10):
        monitor.record_metric('test_response_time', 0.5 + i * 0.1, 'ms')
        monitor.record_metric('test_cache_hit_rate', 0.9 - i * 0.01, 'ratio')
        time.sleep(0.1)
    
    # Run health checks
    health_results = monitor.run_health_check()
    print("Health check results:")
    for check_name, result in health_results.items():
        print(f"  {check_name}: {result.status.value} - {result.message}")
    
    # Get performance summary
    summary = monitor.get_performance_summary(5)
    print("\nPerformance summary:")
    print(json.dumps(summary, indent=2))
    
    # Stop monitoring
    monitor.stop_monitoring()
    print("Monitoring test completed")
