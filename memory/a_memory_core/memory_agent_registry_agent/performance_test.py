
# Auto-generated logging configuration
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - performance_test - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('performance_test.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)
import logging
#!/usr/bin/env python3
"""
Performance testing module for memory_agent_registry_agent
"""

import time
import threading
import statistics
from typing import List, Dict, Any

class PerformanceTester:
    def __init__(self):
        self.agent_name = "memory_agent_registry_agent"
    
    def benchmark_response_time(self, function, iterations: int = 100) -> Dict[str, float]:
        """Benchmark function response time"""
        times = []
        for _ in range(iterations):
            start = time.time()
            try:
                function()
            except:
                pass  # Continue testing even if function fails
            end = time.time()
            times.append((end - start) * 1000)  # Convert to milliseconds
        
        return {
            "min_time": min(times),
            "max_time": max(times),
            "avg_time": statistics.mean(times),
            "median_time": statistics.median(times),
            "std_dev": statistics.stdev(times) if len(times) > 1 else 0
        }
    
    def load_test(self, function, concurrent_users: int = 10, duration: int = 60) -> Dict[str, Any]:
        """Perform load testing"""
        results = []
        threads = []
        start_time = time.time()
        
        def worker():
            while time.time() - start_time < duration:
                test_start = time.time()
                try:
                    function()
                    success = True
                except:
                    success = False
                test_end = time.time()
                results.append({
                    "success": success,
                    "response_time": (test_end - test_start) * 1000
                })
                time.sleep(0.1)  # Small delay between requests
        
        for _ in range(concurrent_users):
            thread = threading.Thread(target=worker)
            threads.append(thread)
            thread.start()
        
        for thread in threads:
            thread.join()
        
        successful_requests = [r for r in results if r["success"]]
        failed_requests = [r for r in results if not r["success"]]
        
        return {
            "total_requests": len(results),
            "successful_requests": len(successful_requests),
            "failed_requests": len(failed_requests),
            "success_rate": len(successful_requests) / len(results) * 100,
            "avg_response_time": statistics.mean([r["response_time"] for r in successful_requests]) if successful_requests else 0
        }

if __name__ == "__main__":
    tester = PerformanceTester()
    print("Performance testing module ready")
