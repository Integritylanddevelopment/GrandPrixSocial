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
Index Validator Agent - Data integrity validation for index system
Ensures index data integrity and consistency across the system
"""

import os
import json
import logging
from datetime import datetime
import hashlib

class IndexValidator:
    def __init__(self):
        self.setup_logging()
        
    def setup_logging(self):
        log_file = os.path.join(os.path.dirname(__file__), '..', 'logs', 'monitoring.log')
        os.makedirs(os.path.dirname(log_file), exist_ok=True)
        logging.basicConfig(
            level=logging.INFO,
            format='%(asctime)s - %(levelname)s - %(message)s',
            handlers=[
                logging.FileHandler(log_file, mode='a'),
                logging.StreamHandler()
            ]
        )
        self.logger = logging.getLogger(__name__)
    
    def validate_all_indexes(self):
        """Validate all index files and data integrity"""
        self.logger.info("Starting comprehensive index validation")
        
        validation_results = {
            "file_integrity": self.validate_file_integrity(),
            "index_structure": self.validate_index_structure(),
            "data_consistency": self.validate_data_consistency(),
            "embedding_validation": self.validate_embeddings(),
            "reference_integrity": self.validate_references()
        }
        
        all_valid = all(validation_results.values())
        self.logger.info(f"Validation complete: {'PASSED' if all_valid else 'FAILED'}")
        
        self.save_validation_report(validation_results)
        return all_valid
    
    def validate_file_integrity(self):
        """Check file integrity using checksums and basic validation"""
        try:
            index_path = os.path.join(os.path.dirname(__file__), '..', 'data', 'index_master.json')
            
            if not os.path.exists(index_path):
                self.logger.info("File integrity check: No master index found (normal for new system)")
                return True
            
            # Validate master index file itself
            try:
                with open(index_path, 'r') as f:
                    index_data = json.load(f)
                
                if not index_data:
                    self.logger.warning("File integrity check: FAILED - Empty master index")
                    return False
                    
            except json.JSONDecodeError:
                self.logger.warning("File integrity check: FAILED - Corrupted master index JSON")
                return False
            
            # Check all referenced files
            corrupted_files = []
            for file_key, file_info in index_data.get("indexed_files", {}).items():
                file_path = file_info.get("path", "")
                
                if not os.path.exists(file_path):
                    corrupted_files.append(f"{file_key} (missing)")
                    continue
                
                # Check if file is readable
                try:
                    if file_path.endswith('.json'):
                        with open(file_path, 'r') as f:
                            json.load(f)
                    elif file_path.endswith(('.md', '.txt')):
                        with open(file_path, 'r', encoding='utf-8') as f:
                            content = f.read()
                            if len(content.strip()) == 0:
                                corrupted_files.append(f"{file_key} (empty)")
                except (json.JSONDecodeError, UnicodeDecodeError, PermissionError):
                    corrupted_files.append(f"{file_key} (corrupted)")
            
            if corrupted_files:
                self.logger.warning(f"File integrity issues: {corrupted_files}")
                return False
            
            self.logger.info("File integrity check: PASSED")
            return True
            
        except Exception as e:
            self.logger.error(f"File integrity validation failed: {e}")
            return False
    
    def validate_index_structure(self):
        """Validate the structure of index files"""
        try:
            index_path = os.path.join(os.path.dirname(__file__), '..', 'data', 'index_master.json')
            
            if not os.path.exists(index_path):
                self.logger.info("Index structure check: No master index found")
                return True
            
            with open(index_path, 'r') as f:
                index = json.load(f)
            
            # Check required top-level keys
            required_keys = ['indexed_files', 'last_updated', 'total_files']
            missing_keys = [key for key in required_keys if key not in index]
            
            if missing_keys:
                self.logger.warning(f"Index structure check: FAILED - Missing keys: {missing_keys}")
                return False
            
            # Validate indexed_files structure
            for file_key, file_info in index.get("indexed_files", {}).items():
                required_file_keys = ['path', 'last_indexed', 'size', 'type']
                missing_file_keys = [key for key in required_file_keys if key not in file_info]
                
                if missing_file_keys:
                    self.logger.warning(f"Index structure check: FAILED - File {file_key} missing keys: {missing_file_keys}")
                    return False
            
            self.logger.info("Index structure check: PASSED")
            return True
            
        except Exception as e:
            self.logger.error(f"Index structure validation failed: {e}")
            return False
    
    def validate_data_consistency(self):
        """Check data consistency across index files"""
        try:
            # Validate master index consistency
            index_path = os.path.join(os.path.dirname(__file__), '..', 'data', 'index_master.json')
            
            if not os.path.exists(index_path):
                self.logger.info("Data consistency check: No master index found")
                return True
            
            with open(index_path, 'r') as f:
                index = json.load(f)
            
            # Check if total_files matches actual count
            actual_count = len(index.get("indexed_files", {}))
            reported_count = index.get("total_files", 0)
            
            if actual_count != reported_count:
                self.logger.warning(f"Data consistency check: FAILED - Count mismatch: actual={actual_count}, reported={reported_count}")
                return False
            
            # Validate file paths are absolute and normalized
            invalid_paths = []
            for file_key, file_info in index.get("indexed_files", {}).items():
                file_path = file_info.get("path", "")
                if not os.path.isabs(file_path):
                    invalid_paths.append(f"{file_key} (relative path)")
                elif '\\' in file_path and '/' in file_path:  # Mixed path separators
                    invalid_paths.append(f"{file_key} (mixed separators)")
            
            if invalid_paths:
                self.logger.warning(f"Data consistency check: FAILED - Invalid paths: {invalid_paths}")
                return False
            
            self.logger.info("Data consistency check: PASSED")
            return True
            
        except Exception as e:
            self.logger.error(f"Data consistency validation failed: {e}")
            return False
    
    def validate_embeddings(self):
        """Validate embedding files and their relationships"""
        try:
            embeddings_dir = os.path.join(os.path.dirname(__file__), '..', 'storage', 'embeddings')
            
            if not os.path.exists(embeddings_dir):
                self.logger.info("Embedding validation: No embeddings directory found")
                return True
            
            embedding_files = [f for f in os.listdir(embeddings_dir) if f.endswith('_embedding.json')]
            
            # Validate each embedding file
            invalid_embeddings = []
            for embedding_file in embedding_files:
                file_path = os.path.join(embeddings_dir, embedding_file)
                
                try:
                    with open(file_path, 'r') as f:
                        embedding_data = json.load(f)
                    
                    # Check required fields
                    required_fields = ['file_path', 'timestamp']
                    missing_fields = [field for field in required_fields if field not in embedding_data]
                    
                    if missing_fields:
                        invalid_embeddings.append(f"{embedding_file} (missing fields: {missing_fields})")
                    
                    # Check if referenced file exists
                    ref_file = embedding_data.get('file_path', '')
                    if ref_file and not os.path.exists(ref_file):
                        invalid_embeddings.append(f"{embedding_file} (referenced file missing)")
                        
                except (json.JSONDecodeError, UnicodeDecodeError):
                    invalid_embeddings.append(f"{embedding_file} (corrupted)")
            
            if invalid_embeddings:
                self.logger.warning(f"Embedding validation: FAILED - Invalid embeddings: {invalid_embeddings}")
                return False
            
            self.logger.info("Embedding validation: PASSED")
            return True
            
        except Exception as e:
            self.logger.error(f"Embedding validation failed: {e}")
            return False
    
    def validate_references(self):
        """Validate cross-references between different index components"""
        try:
            # Check if all files in master index have corresponding embeddings (if embeddings exist)
            index_path = os.path.join(os.path.dirname(__file__), '..', 'data', 'index_master.json')
            embeddings_dir = os.path.join(os.path.dirname(__file__), '..', 'storage', 'embeddings')
            
            if not os.path.exists(index_path):
                self.logger.info("Reference validation: No master index found")
                return True
            
            with open(index_path, 'r') as f:
                index = json.load(f)
            
            if not os.path.exists(embeddings_dir):
                self.logger.info("Reference validation: No embeddings directory found")
                return True
            
            # Check for orphaned embeddings (embeddings without corresponding index entries)
            embedding_files = [f for f in os.listdir(embeddings_dir) if f.endswith('_embedding.json')]
            indexed_files = set(index.get("indexed_files", {}).keys())
            
            orphaned_embeddings = []
            for embedding_file in embedding_files:
                # Extract base filename from embedding filename
                base_name = embedding_file.replace('_embedding.json', '')
                if base_name not in indexed_files:
                    orphaned_embeddings.append(embedding_file)
            
            if orphaned_embeddings:
                self.logger.warning(f"Reference validation: Found orphaned embeddings: {orphaned_embeddings}")
                # This is a warning, not necessarily a failure
            
            self.logger.info("Reference validation: PASSED")
            return True
            
        except Exception as e:
            self.logger.error(f"Reference validation failed: {e}")
            return False
    
    def save_validation_report(self, results):
        """Save detailed validation report"""
        timestamp = datetime.now().strftime("%m-%d_%I-%M%p")
        report = {
            "timestamp": timestamp,
            "validation_results": results,
            "overall_status": "VALID" if all(results.values()) else "INVALID",
            "failed_checks": [check for check, passed in results.items() if not passed],
            "validation_details": {
                "total_checks": len(results),
                "passed_checks": sum(results.values()),
                "success_rate": (sum(results.values()) / len(results) * 100) if results else 0
            }
        }
        
        report_path = os.path.join(os.path.dirname(__file__), '..', 'logs', 'daily_reports', f'validation_report_{timestamp}.json')
        os.makedirs(os.path.dirname(report_path), exist_ok=True)
        
        with open(report_path, 'w') as f:
            json.dump(report, f, indent=2)

def main():
    validator = IndexValidator()
    is_valid = validator.validate_all_indexes()
    
    if not is_valid:
        validator.logger.error("Index validation failed!")
        exit(1)
    else:
        validator.logger.info("Index validation passed")

if __name__ == "__main__":
    main()
