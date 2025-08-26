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
Merged Maintenance Agent - Cleanup and optimization for merged system
Handles cleanup, optimization, and maintenance tasks
"""

import os
import json
import logging
from datetime import datetime, timedelta
import shutil

class MergedMaintenance:
    def __init__(self):
        self.setup_logging()
        self.load_config()
        
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
        
    def load_config(self):
        """Load maintenance configuration"""
        config_path = os.path.join(os.path.dirname(__file__), '..', 'config', 'merge_config.json')
        try:
            with open(config_path, 'r') as f:
                config = json.load(f)
                self.config = config.get('maintenance', {
                    'cleanup_temp_files': True,
                    'archive_old_logs': True,
                    'optimize_merges': True,
                    'retention_days': 120
                })
        except FileNotFoundError:
            self.config = {
                'cleanup_temp_files': True,
                'archive_old_logs': True,
                'optimize_merges': True,
                'retention_days': 120
            }
    
    def run_maintenance(self):
        """Run all maintenance tasks"""
        self.logger.info("Starting merged system maintenance")
        
        tasks_completed = 0
        
        if self.config.get('cleanup_temp_files', True):
            if self.cleanup_temp_files():
                tasks_completed += 1
        
        if self.config.get('archive_old_logs', True):
            if self.archive_old_logs():
                tasks_completed += 1
        
        if self.config.get('optimize_merges', True):
            if self.optimize_merge_index():
                tasks_completed += 1
        
        self.cleanup_cache()
        tasks_completed += 1
        
        self.consolidate_relationships()
        tasks_completed += 1
        
        self.logger.info(f"Merged maintenance complete: {tasks_completed} tasks completed")
        self.update_maintenance_log(tasks_completed)
    
    def cleanup_temp_files(self):
        """Clean up temporary files"""
        try:
            temp_dir = os.path.join(os.path.dirname(__file__), '..', 'temp')
            
            if not os.path.exists(temp_dir):
                self.logger.info("Temp cleanup: No temp directory found")
                return True
            
            files_removed = 0
            for root, dirs, files in os.walk(temp_dir):
                for file in files:
                    file_path = os.path.join(root, file)
                    # Remove files older than 1 day
                    if os.path.getctime(file_path) < (datetime.now() - timedelta(days=1)).timestamp():
                        os.remove(file_path)
                        files_removed += 1
            
            self.logger.info(f"Temp cleanup: Removed {files_removed} old temp files")
            return True
            
        except Exception as e:
            self.logger.error(f"Temp cleanup failed: {e}")
            return False
    
    def archive_old_logs(self):
        """Archive old log files"""
        try:
            logs_dir = os.path.join(os.path.dirname(__file__), '..', 'logs')
            daily_reports_dir = os.path.join(logs_dir, 'daily_reports')
            
            if not os.path.exists(daily_reports_dir):
                self.logger.info("Log archive: No daily reports to archive")
                return True
            
            cutoff_date = datetime.now() - timedelta(days=self.config.get('retention_days', 120))
            archived_count = 0
            
            for report_file in os.listdir(daily_reports_dir):
                if report_file == 'archived':  # Skip archive directory
                    continue
                    
                file_path = os.path.join(daily_reports_dir, report_file)
                if os.path.isfile(file_path) and os.path.getctime(file_path) < cutoff_date.timestamp():
                    # Move to archive subdirectory
                    archive_dir = os.path.join(daily_reports_dir, 'archived')
                    os.makedirs(archive_dir, exist_ok=True)
                    shutil.move(file_path, os.path.join(archive_dir, report_file))
                    archived_count += 1
            
            self.logger.info(f"Log archive: Archived {archived_count} old log files")
            return True
            
        except Exception as e:
            self.logger.error(f"Log archive failed: {e}")
            return False
    
    def optimize_merge_index(self):
        """Optimize merge index by removing stale entries"""
        try:
            index_path = os.path.join(os.path.dirname(__file__), '..', 'data', 'merge_master.json')
            
            if not os.path.exists(index_path):
                self.logger.info("Merge optimization: No merge index to optimize")
                return True
            
            with open(index_path, 'r') as f:
                index = json.load(f)
            
            # Remove stale merge candidates
            original_candidates = len(index.get('merge_candidates', {}))
            valid_candidates = {}
            
            for file_key, file_info in index.get('merge_candidates', {}).items():
                file_path = file_info.get('path', '')
                if os.path.exists(file_path):
                    valid_candidates[file_key] = file_info
            
            index['merge_candidates'] = valid_candidates
            
            # Remove empty merged groups
            original_groups = len(index.get('merged_groups', {}))
            valid_groups = {}
            
            for group_id, group_data in index.get('merged_groups', {}).items():
                source_files = group_data.get('source_files', [])
                if source_files:  # Keep groups that have source files
                    valid_groups[group_id] = group_data
            
            index['merged_groups'] = valid_groups
            index['last_optimized'] = datetime.now().strftime("%m-%d_%I-%M%p")
            
            with open(index_path, 'w') as f:
                json.dump(index, f, indent=2)
            
            candidates_removed = original_candidates - len(valid_candidates)
            groups_removed = original_groups - len(valid_groups)
            
            self.logger.info(f"Merge optimization: Removed {candidates_removed} stale candidates, {groups_removed} empty groups")
            return True
            
        except Exception as e:
            self.logger.error(f"Merge optimization failed: {e}")
            return False
    
    def cleanup_cache(self):
        """Clean up cache files"""
        try:
            cache_dir = os.path.join(os.path.dirname(__file__), '..', 'storage', 'cache')
            
            if not os.path.exists(cache_dir):
                self.logger.info("Cache cleanup: No cache directory found")
                return
            
            # Clear old cache files
            for cache_file in os.listdir(cache_dir):
                file_path = os.path.join(cache_dir, cache_file)
                if os.path.isfile(file_path):
                    os.remove(file_path)
            
            self.logger.info("Cache cleanup: Cleared cache directory")
            
        except Exception as e:
            self.logger.error(f"Cache cleanup failed: {e}")
    
    def consolidate_relationships(self):
        """Consolidate and optimize merge relationships"""
        try:
            index_path = os.path.join(os.path.dirname(__file__), '..', 'data', 'merge_master.json')
            
            if not os.path.exists(index_path):
                return
            
            with open(index_path, 'r') as f:
                index = json.load(f)
            
            relationships = index.get('merge_relationships', {})
            merged_groups = index.get('merged_groups', {})
            
            # Remove relationships that reference non-existent groups
            valid_relationships = {}
            for rel_id, rel_data in relationships.items():
                connected_groups = rel_data.get('connected_groups', [])
                valid_connected_groups = [g for g in connected_groups if g in merged_groups]
                
                if len(valid_connected_groups) >= 2:  # Keep relationships with at least 2 valid groups
                    rel_data['connected_groups'] = valid_connected_groups
                    valid_relationships[rel_id] = rel_data
            
            index['merge_relationships'] = valid_relationships
            
            with open(index_path, 'w') as f:
                json.dump(index, f, indent=2)
            
            relationships_removed = len(relationships) - len(valid_relationships)
            self.logger.info(f"Relationship consolidation: Removed {relationships_removed} invalid relationships")
            
        except Exception as e:
            self.logger.error(f"Relationship consolidation failed: {e}")
    
    def update_maintenance_log(self, tasks_completed):
        """Update maintenance metrics"""
        metrics_path = os.path.join(os.path.dirname(__file__), '..', 'data', 'metrics.json')
        
        try:
            with open(metrics_path, 'r') as f:
                metrics = json.load(f)
        except FileNotFoundError:
            metrics = {}
        
        if 'maintenance_stats' not in metrics:
            metrics['maintenance_stats'] = {}
        
        timestamp = datetime.now().strftime("%m-%d_%I-%M%p")
        metrics['maintenance_stats'][timestamp] = {
            'tasks_completed': tasks_completed,
            'last_maintenance': timestamp
        }
        
        with open(metrics_path, 'w') as f:
            json.dump(metrics, f, indent=2)

def main():
    maintenance = MergedMaintenance()
    maintenance.run_maintenance()

if __name__ == "__main__":
    main()
