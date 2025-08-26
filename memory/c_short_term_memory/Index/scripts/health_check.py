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
Index Health Check Agent - Quality assurance for index system
Validates index integrity and data consistency
"""

import os
import json
import logging
from datetime import datetime

class IndexHealthCheck:
    def __init__(self):
        self.setup_logging()
        
    def setup_logging(self):
        log_file = os.path.join(os.path.dirname(__file__), '..', 'logs', 'health_check.log')
        os.makedirs(os.path.dirname(log_file), exist_ok=True)
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
        """Run comprehensive health check on index system"""
        self.logger.info("Starting index health check")
        
        checks = [
            self.check_master_index(),
            self.check_config_files(),
            self.check_storage_structure(),
            self.check_embedding_integrity(),
            self.check_index_consistency()
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
            index_path = os.path.join(os.path.dirname(__file__), '..', 'data', 'index_master.json')
            if os.path.exists(index_path):
                with open(index_path, 'r') as f:
                    index = json.load(f)
                
                # Validate structure
                required_keys = ['indexed_files', 'last_updated', 'total_files']
                if all(key in index for key in required_keys):
                    self.logger.info("Master index check: PASSED")
                    return True
                else:
                    self.logger.warning("Master index check: FAILED - Invalid structure")
                    return False
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
            required_configs = ['index_config.json', 'search_settings.json', 'validation_rules.json']
            
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
        """Check if storage directories exist and are properly structured"""
        try:
            storage_dir = os.path.join(os.path.dirname(__file__), '..', 'storage')
            required_dirs = ['indexed_content', 'embeddings', 'cache', 'backups']
            
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
    
    def check_embedding_integrity(self):
        """Check embedding files for integrity"""
        try:
            embeddings_dir = os.path.join(os.path.dirname(__file__), '..', 'storage', 'embeddings')
            
            if not os.path.exists(embeddings_dir):
                self.logger.info("Embedding integrity check: No embeddings directory found (normal for new system)")
                return True
            
            embedding_files = [f for f in os.listdir(embeddings_dir) if f.endswith('_embedding.json')]
            
            corrupted_files = []
            for embedding_file in embedding_files:
                file_path = os.path.join(embeddings_dir, embedding_file)
                try:
                    with open(file_path, 'r') as f:
                        embedding_data = json.load(f)
                        
                    # Basic validation
                    if 'file_path' not in embedding_data or 'timestamp' not in embedding_data:
                        corrupted_files.append(embedding_file)
                        
                except (json.JSONDecodeError, UnicodeDecodeError):
                    corrupted_files.append(embedding_file)
            
            if corrupted_files:
                self.logger.warning(f"Embedding integrity check: FAILED - Corrupted files: {corrupted_files}")
                return False
            
            self.logger.info("Embedding integrity check: PASSED")
            return True
            
        except Exception as e:
            self.logger.error(f"Embedding integrity check: FAILED - {e}")
            return False
    
    def check_index_consistency(self):
        """Check consistency between index and actual files"""
        try:
            index_path = os.path.join(os.path.dirname(__file__), '..', 'data', 'index_master.json')
            
            if not os.path.exists(index_path):
                self.logger.warning("Index consistency check: No master index to check")
                return True  # Not an error if no index exists yet
            
            with open(index_path, 'r') as f:
                index = json.load(f)
            
            missing_files = []
            for file_key, file_info in index.get("indexed_files", {}).items():
                file_path = file_info.get("path", "")
                if not os.path.exists(file_path):
                    missing_files.append(file_key)
            
            if missing_files:
                self.logger.warning(f"Index consistency check: FAILED - Missing files: {missing_files}")
                return False
            
            self.logger.info("Index consistency check: PASSED")
            return True
            
        except Exception as e:
            self.logger.error(f"Index consistency check: FAILED - {e}")
            return False
    
    def save_health_report(self, health_score, check_results):
        """Save health check report"""
        report = {
            "timestamp": datetime.now().strftime("%m-%d_%I-%M%p"),
            "health_score": health_score,
            "checks_passed": sum(check_results),
            "total_checks": len(check_results),
            "status": "HEALTHY" if health_score >= 80 else "DEGRADED" if health_score >= 60 else "CRITICAL",
            "check_details": {
                "master_index": check_results[0],
                "config_files": check_results[1],
                "storage_structure": check_results[2],
                "embedding_integrity": check_results[3],
                "index_consistency": check_results[4]
            }
        }
        
        report_path = os.path.join(os.path.dirname(__file__), '..', 'logs', 'daily_reports', f'health_report_{report["timestamp"]}.json')
        os.makedirs(os.path.dirname(report_path), exist_ok=True)
        
        with open(report_path, 'w') as f:
            json.dump(report, f, indent=2)

def main():
    health_checker = IndexHealthCheck()
    is_healthy = health_checker.run_health_check()
    
    if not is_healthy:
        health_checker.logger.error("Index system health check failed!")
        exit(1)
    else:
        health_checker.logger.info("Index system is healthy")

if __name__ == "__main__":
    main()
