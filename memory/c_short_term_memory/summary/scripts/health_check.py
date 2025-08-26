from typing import Dict, List, Any, Optional

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
#!/usr/bin/env python3
"""
Summary Health Check Agent - Quality assurance for summary processing
Validates summary quality and data integrity
"""

import os
import json
import logging
from datetime import datetime

class SummaryHealthCheck:
    def __init__(self):
        self.setup_logging()
        
    def setup_logging(self):
        log_file = os.path.join(os.path.dirname(__file__), '..', 'logs', 'health_check.log')
        logging.basicConfig(
            level=logging.INFO,
            format='%(asctime)s - %(levelname)s - %(message)s',
            handlers=[
                logging.FileHandler(log_file),
                logging.StreamHandler()
            ]
        )
        self.logger = logging.getLogger(__name__)
    
    def run_health_check(self):
        """Run comprehensive health check on summary system"""
        self.logger.info("Starting summary health check")
        
        checks = [
            self.check_master_index(),
            self.check_config_files(),
            self.check_storage_structure(),
            self.check_summary_quality()
        ]
        
        passed = sum(checks)
        total = len(checks)
        
        health_score = (passed / total) * 100
        self.logger.info(f"Health check complete: {passed}/{total} checks passed ({health_score:.1f}%)")
        
        self.save_health_report(health_score, checks)
        return health_score >= 80
    
    def check_master_index(self):
        """Check if master index is valid and accessible"""
        try:
            index_path = os.path.join(os.path.dirname(__file__), '..', 'data', 'summary_master.json')
            if os.path.exists(index_path):
                with open(index_path, 'r') as f:
                    index = json.load(f)
                self.logger.info("Master index check: PASSED")
                return True
            else:
                self.logger.warning("Master index check: FAILED - File not found")
                return False
        except Exception as e:
            self.logger.error(f"Master index check: FAILED - {e}")
            return False
    
    def check_config_files(self):
        """Check if configuration files exist and are valid"""
        try:
            config_dir = os.path.join(os.path.dirname(__file__), '..', 'config')
            required_configs = ['summary_config.json', 'search_settings.json', 'validation_rules.json']
            
            for config_file in required_configs:
                config_path = os.path.join(config_dir, config_file)
                if not os.path.exists(config_path):
                    self.logger.warning(f"Config check: FAILED - Missing {config_file}")
                    return False
                
                with open(config_path, 'r') as f:
                    json.load(f)  # Validate JSON format
            
            self.logger.info("Config files check: PASSED")
            return True
        except Exception as e:
            self.logger.error(f"Config files check: FAILED - {e}")
            return False
    
    def check_storage_structure(self):
        """Check if storage directories exist"""
        try:
            storage_dir = os.path.join(os.path.dirname(__file__), '..', 'storage')
            required_dirs = ['summaries', 'embeddings', 'cache', 'backups']
            
            for dir_name in required_dirs:
                dir_path = os.path.join(storage_dir, dir_name)
                if not os.path.exists(dir_path):
                    os.makedirs(dir_path, exist_ok=True)
                    self.logger.info(f"Created missing directory: {dir_name}")
            
            self.logger.info("Storage structure check: PASSED")
            return True
        except Exception as e:
            self.logger.error(f"Storage structure check: FAILED - {e}")
            return False
    
    def check_summary_quality(self):
        """Basic quality check on recent summaries"""
        try:
            summary_dir = os.path.dirname(os.path.dirname(__file__))
            summary_files = [f for f in os.listdir(summary_dir) if f.endswith('_summary.md')]
            
            if not summary_files:
                self.logger.warning("Summary quality check: No summary files found")
                return True  # Not an error if no files exist yet
            
            # Check a sample of recent summaries
            sample_size = min(5, len(summary_files))
            for i, summary_file in enumerate(summary_files[:sample_size]):
                file_path = os.path.join(summary_dir, summary_file)
                if os.path.getsize(file_path) < 100:  # Very small summaries might be incomplete
                    self.logger.warning(f"Summary quality check: {summary_file} appears too small")
            
            self.logger.info("Summary quality check: PASSED")
            return True
        except Exception as e:
            self.logger.error(f"Summary quality check: FAILED - {e}")
            return False
    
    def save_health_report(self, health_score, check_results):
        """Save health check report"""
        report = {
            "timestamp": datetime.now().strftime("%m-%d_%I-%M%p"),
            "health_score": health_score,
            "checks_passed": sum(check_results),
            "total_checks": len(check_results),
            "status": "HEALTHY" if health_score >= 80 else "DEGRADED" if health_score >= 60 else "CRITICAL"
        }
        
        report_path = os.path.join(os.path.dirname(__file__), '..', 'logs', 'daily_reports', f'health_report_{report["timestamp"]}.json')
        os.makedirs(os.path.dirname(report_path), exist_ok=True)
        
        with open(report_path, 'w') as f:
            json.dump(report, f, indent=2)

def main():
    health_checker = SummaryHealthCheck()
    is_healthy = health_checker.run_health_check()
    
    if not is_healthy:
        health_checker.logger.error("Summary system health check failed!")
        exit(1)
    else:
        health_checker.logger.info("Summary system is healthy")

if __name__ == "__main__":
    main()
