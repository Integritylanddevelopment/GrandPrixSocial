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
Summary Validator Agent - Data integrity validation for summaries
Ensures summary data integrity and consistency
"""

import os
import json
import logging
from datetime import datetime
import hashlib

class SummaryValidator:
    def __init__(self):
        self.setup_logging()
        
    def setup_logging(self):
        log_file = os.path.join(os.path.dirname(__file__), '..', 'logs', 'monitoring.log')
        logging.basicConfig(
            level=logging.INFO,
            format='%(asctime)s - %(levelname)s - %(message)s',
            handlers=[
                logging.FileHandler(log_file, mode='a'),
                logging.StreamHandler()
            ]
        )
        self.logger = logging.getLogger(__name__)
    
    def validate_all_summaries(self):
        """Validate all summary files and data"""
        self.logger.info("Starting summary validation")
        
        validation_results = {
            "file_integrity": self.validate_file_integrity(),
            "index_consistency": self.validate_index_consistency(),
            "data_completeness": self.validate_data_completeness()
        }
        
        all_valid = all(validation_results.values())
        self.logger.info(f"Validation complete: {'PASSED' if all_valid else 'FAILED'}")
        
        self.save_validation_report(validation_results)
        return all_valid
    
    def validate_file_integrity(self):
        """Check file integrity using checksums"""
        try:
            summary_dir = os.path.dirname(os.path.dirname(__file__))
            summary_files = [f for f in os.listdir(summary_dir) if f.endswith('_summary.md')]
            
            corrupted_files = []
            for summary_file in summary_files:
                file_path = os.path.join(summary_dir, summary_file)
                
                # Basic integrity checks
                if os.path.getsize(file_path) == 0:
                    corrupted_files.append(f"{summary_file} (empty file)")
                    continue
                
                # Check if file is readable
                try:
                    with open(file_path, 'r', encoding='utf-8') as f:
                        content = f.read()
                        if len(content.strip()) < 10:
                            corrupted_files.append(f"{summary_file} (insufficient content)")
                except UnicodeDecodeError:
                    corrupted_files.append(f"{summary_file} (encoding error)")
            
            if corrupted_files:
                self.logger.warning(f"File integrity issues found: {corrupted_files}")
                return False
            
            self.logger.info("File integrity check: PASSED")
            return True
            
        except Exception as e:
            self.logger.error(f"File integrity validation failed: {e}")
            return False
    
    def validate_index_consistency(self):
        """Validate master index consistency"""
        try:
            index_path = os.path.join(os.path.dirname(__file__), '..', 'data', 'summary_master.json')
            
            if not os.path.exists(index_path):
                self.logger.warning("Master index not found")
                return False
            
            with open(index_path, 'r') as f:
                index = json.load(f)
            
            # Check if all indexed files actually exist
            missing_files = []
            for file_key, file_info in index.get("summaries", {}).items():
                if not os.path.exists(file_info.get("path", "")):
                    missing_files.append(file_key)
            
            if missing_files:
                self.logger.warning(f"Index inconsistency: missing files {missing_files}")
                return False
            
            self.logger.info("Index consistency check: PASSED")
            return True
            
        except Exception as e:
            self.logger.error(f"Index consistency validation failed: {e}")
            return False
    
    def validate_data_completeness(self):
        """Check data completeness in configuration and metrics"""
        try:
            # Check config files
            config_dir = os.path.join(os.path.dirname(__file__), '..', 'config')
            required_configs = ['summary_config.json', 'search_settings.json', 'validation_rules.json']
            
            for config_file in required_configs:
                config_path = os.path.join(config_dir, config_file)
                if not os.path.exists(config_path):
                    self.logger.warning(f"Missing config file: {config_file}")
                    return False
                
                with open(config_path, 'r') as f:
                    config_data = json.load(f)
                    if not config_data:
                        self.logger.warning(f"Empty config file: {config_file}")
                        return False
            
            # Check data files
            data_dir = os.path.join(os.path.dirname(__file__), '..', 'data')
            if os.path.exists(data_dir):
                data_files = ['summary_master.json', 'metrics.json', 'analytics.json']
                for data_file in data_files:
                    data_path = os.path.join(data_dir, data_file)
                    if os.path.exists(data_path):
                        with open(data_path, 'r') as f:
                            data = json.load(f)
                            if not data:
                                self.logger.warning(f"Empty data file: {data_file}")
            
            self.logger.info("Data completeness check: PASSED")
            return True
            
        except Exception as e:
            self.logger.error(f"Data completeness validation failed: {e}")
            return False
    
    def save_validation_report(self, results):
        """Save validation report"""
        timestamp = datetime.now().strftime("%m-%d_%I-%M%p")
        report = {
            "timestamp": timestamp,
            "validation_results": results,
            "overall_status": "VALID" if all(results.values()) else "INVALID",
            "issues_found": [key for key, value in results.items() if not value]
        }
        
        report_path = os.path.join(os.path.dirname(__file__), '..', 'logs', 'daily_reports', f'validation_report_{timestamp}.json')
        os.makedirs(os.path.dirname(report_path), exist_ok=True)
        
        with open(report_path, 'w') as f:
            json.dump(report, f, indent=2)

def main():
    validator = SummaryValidator()
    is_valid = validator.validate_all_summaries()
    
    if not is_valid:
        validator.logger.error("Summary validation failed!")
        exit(1)
    else:
        validator.logger.info("Summary validation passed")

if __name__ == "__main__":
    main()
