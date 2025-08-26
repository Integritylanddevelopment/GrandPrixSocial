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
Merged Validator Agent - Data integrity validation for merged content
Ensures merge quality and consistency
"""

import os
import json
import logging
from datetime import datetime

class MergedValidator:
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
    
    def validate_all_merges(self):
        """Validate all merged content and data"""
        self.logger.info("Starting merged content validation")
        
        validation_results = {
            "merge_integrity": self.validate_merge_integrity(),
            "relationship_consistency": self.validate_relationship_consistency(),
            "data_completeness": self.validate_data_completeness(),
            "merge_quality": self.validate_merge_quality()
        }
        
        all_valid = all(validation_results.values())
        self.logger.info(f"Validation complete: {'PASSED' if all_valid else 'FAILED'}")
        
        self.save_validation_report(validation_results)
        return all_valid
    
    def validate_merge_integrity(self):
        """Check merge data integrity"""
        try:
            index_path = os.path.join(os.path.dirname(__file__), '..', 'data', 'merge_master.json')
            if not os.path.exists(index_path):
                self.logger.info("Merge integrity: No merge data to validate")
                return True
            
            with open(index_path, 'r') as f:
                index = json.load(f)
            
            merged_groups = index.get("merged_groups", {})
            integrity_issues = []
            
            for group_id, group_data in merged_groups.items():
                # Check required fields
                required_fields = ["source_files", "merge_timestamp", "similarity_score"]
                for field in required_fields:
                    if field not in group_data:
                        integrity_issues.append(f"Group {group_id} missing {field}")
                
                # Validate similarity score range
                score = group_data.get("similarity_score", 0)
                if not (0 <= score <= 1):
                    integrity_issues.append(f"Group {group_id} has invalid similarity score: {score}")
                
                # Check source files exist (if paths are provided)
                source_files = group_data.get("source_files", [])
                if not source_files:
                    integrity_issues.append(f"Group {group_id} has no source files")
            
            if integrity_issues:
                self.logger.warning(f"Merge integrity issues: {integrity_issues}")
                return False
            
            self.logger.info("Merge integrity check: PASSED")
            return True
            
        except Exception as e:
            self.logger.error(f"Merge integrity validation failed: {e}")
            return False
    
    def validate_relationship_consistency(self):
        """Validate merge relationship consistency"""
        try:
            index_path = os.path.join(os.path.dirname(__file__), '..', 'data', 'merge_master.json')
            if not os.path.exists(index_path):
                return True
            
            with open(index_path, 'r') as f:
                index = json.load(f)
            
            merged_groups = index.get("merged_groups", {})
            relationships = index.get("merge_relationships", {})
            
            consistency_issues = []
            
            # Check if all relationships reference valid groups
            for rel_id, rel_data in relationships.items():
                connected_groups = rel_data.get("connected_groups", [])
                for group_id in connected_groups:
                    if group_id not in merged_groups:
                        consistency_issues.append(f"Relationship {rel_id} references non-existent group {group_id}")
            
            # Check for circular references
            for rel_id, rel_data in relationships.items():
                if self.has_circular_reference(rel_id, rel_data, relationships):
                    consistency_issues.append(f"Circular reference detected in relationship {rel_id}")
            
            if consistency_issues:
                self.logger.warning(f"Relationship consistency issues: {consistency_issues}")
                return False
            
            self.logger.info("Relationship consistency check: PASSED")
            return True
            
        except Exception as e:
            self.logger.error(f"Relationship consistency validation failed: {e}")
            return False
    
    def has_circular_reference(self, rel_id, rel_data, all_relationships, visited=None):
        """Check for circular references in relationships"""
        if visited is None:
            visited = set()
        
        if rel_id in visited:
            return True
        
        visited.add(rel_id)
        
        # Check connected relationships
        connected_relationships = rel_data.get("connected_relationships", [])
        for connected_rel_id in connected_relationships:
            if connected_rel_id in all_relationships:
                if self.has_circular_reference(connected_rel_id, all_relationships[connected_rel_id], all_relationships, visited.copy()):
                    return True
        
        return False
    
    def validate_data_completeness(self):
        """Check data completeness in configuration and storage"""
        try:
            # Check config files
            config_dir = os.path.join(os.path.dirname(__file__), '..', 'config')
            required_configs = ['merge_config.json', 'search_settings.json', 'validation_rules.json']
            
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
            required_data_files = ['merge_master.json', 'metrics.json', 'analytics.json']
            
            for data_file in required_data_files:
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
    
    def validate_merge_quality(self):
        """Validate quality of merges"""
        try:
            # Load validation rules
            rules_path = os.path.join(os.path.dirname(__file__), '..', 'config', 'validation_rules.json')
            if os.path.exists(rules_path):
                with open(rules_path, 'r') as f:
                    rules = json.load(f)
            else:
                rules = {"quality_thresholds": {"min_merge_benefit_score": 0.5}}
            
            index_path = os.path.join(os.path.dirname(__file__), '..', 'data', 'merge_master.json')
            if not os.path.exists(index_path):
                return True
            
            with open(index_path, 'r') as f:
                index = json.load(f)
            
            merged_groups = index.get("merged_groups", {})
            quality_threshold = rules.get("quality_thresholds", {}).get("min_merge_benefit_score", 0.5)
            
            low_quality_merges = 0
            for group_id, group_data in merged_groups.items():
                similarity_score = group_data.get("similarity_score", 0)
                if similarity_score < quality_threshold:
                    low_quality_merges += 1
            
            # Allow up to 20% low quality merges
            if low_quality_merges > len(merged_groups) * 0.2:
                self.logger.warning(f"Merge quality: {low_quality_merges} low quality merges found")
                return False
            
            self.logger.info("Merge quality check: PASSED")
            return True
            
        except Exception as e:
            self.logger.error(f"Merge quality validation failed: {e}")
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
    validator = MergedValidator()
    is_valid = validator.validate_all_merges()
    
    if not is_valid:
        validator.logger.error("Merged content validation failed!")
        exit(1)
    else:
        validator.logger.info("Merged content validation passed")

if __name__ == "__main__":
    main()
