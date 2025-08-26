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
Merged Health Check Agent - Quality assurance for merge processing
Validates merge quality and data integrity
"""

import os
import json
import logging
from datetime import datetime

class MergedHealthCheck:
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
        """Run comprehensive health check on merged system"""
        self.logger.info("Starting merged system health check")
        
        checks = [
            self.check_merge_master_index(),
            self.check_config_files(),
            self.check_storage_structure(),
            self.check_merge_quality(),
            self.check_relationship_integrity()
        ]
        
        passed = sum(checks)
        total = len(checks)
        
        health_score = (passed / total) * 100
        self.logger.info(f"Health check complete: {passed}/{total} checks passed ({health_score:.1f}%)")
        
        self.save_health_report(health_score, checks)
        return health_score >= 80
    
    def check_merge_master_index(self):
        """Check if merge master index is valid and accessible"""
        try:
            index_path = os.path.join(os.path.dirname(__file__), '..', 'data', 'merge_master.json')
            if os.path.exists(index_path):
                with open(index_path, 'r') as f:
                    index = json.load(f)
                    # Validate required fields
                    required_fields = ["merged_groups", "merge_relationships"]
                    for field in required_fields:
                        if field not in index:
                            self.logger.warning(f"Missing required field in merge index: {field}")
                            return False
                self.logger.info("Merge master index check: PASSED")
                return True
            else:
                self.logger.warning("Merge master index check: FAILED - File not found")
                return False
        except Exception as e:
            self.logger.error(f"Merge master index check: FAILED - {e}")
            return False
    
    def check_config_files(self):
        """Check if configuration files exist and are valid"""
        try:
            config_dir = os.path.join(os.path.dirname(__file__), '..', 'config')
            required_configs = ['merge_config.json', 'search_settings.json', 'validation_rules.json']
            
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
            required_dirs = ['merged_content', 'embeddings', 'cache', 'backups']
            
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
    
    def check_merge_quality(self):
        """Check quality of recent merges"""
        try:
            index_path = os.path.join(os.path.dirname(__file__), '..', 'data', 'merge_master.json')
            if not os.path.exists(index_path):
                self.logger.info("Merge quality check: No merges to validate yet")
                return True
            
            with open(index_path, 'r') as f:
                index = json.load(f)
            
            merged_groups = index.get("merged_groups", {})
            if not merged_groups:
                self.logger.info("Merge quality check: No merged groups found")
                return True
            
            # Check for basic merge quality indicators
            quality_issues = 0
            for group_id, group_data in merged_groups.items():
                if "similarity_score" not in group_data:
                    quality_issues += 1
                elif group_data.get("similarity_score", 0) < 0.5:
                    quality_issues += 1
            
            if quality_issues > len(merged_groups) * 0.3:  # More than 30% quality issues
                self.logger.warning(f"Merge quality check: {quality_issues} quality issues found")
                return False
            
            self.logger.info("Merge quality check: PASSED")
            return True
        except Exception as e:
            self.logger.error(f"Merge quality check: FAILED - {e}")
            return False
    
    def check_relationship_integrity(self):
        """Check integrity of merge relationships"""
        try:
            index_path = os.path.join(os.path.dirname(__file__), '..', 'data', 'merge_master.json')
            if not os.path.exists(index_path):
                return True
            
            with open(index_path, 'r') as f:
                index = json.load(f)
            
            relationships = index.get("merge_relationships", {})
            merged_groups = index.get("merged_groups", {})
            
            # Check if all relationships reference valid merged groups
            orphaned_relationships = 0
            for rel_id, rel_data in relationships.items():
                connected_groups = rel_data.get("connected_groups", [])
                for group_id in connected_groups:
                    if group_id not in merged_groups:
                        orphaned_relationships += 1
            
            if orphaned_relationships > 0:
                self.logger.warning(f"Relationship integrity: {orphaned_relationships} orphaned relationships")
                return False
            
            self.logger.info("Relationship integrity check: PASSED")
            return True
        except Exception as e:
            self.logger.error(f"Relationship integrity check: FAILED - {e}")
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
    health_checker = MergedHealthCheck()
    is_healthy = health_checker.run_health_check()
    
    if not is_healthy:
        health_checker.logger.error("Merged system health check failed!")
        exit(1)
    else:
        health_checker.logger.info("Merged system is healthy")

if __name__ == "__main__":
    main()
