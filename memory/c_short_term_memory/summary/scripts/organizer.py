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
Summary Organizer Agent - Auto-organization for summary files
Organizes summaries based on content, date, and metadata
"""

import os
import json
import shutil
import logging
from datetime import datetime
import re

class SummaryOrganizer:
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
        """Load organization configuration"""
        config_path = os.path.join(os.path.dirname(__file__), '..', 'config', 'summary_config.json')
        try:
            with open(config_path, 'r') as f:
                self.config = json.load(f)
        except FileNotFoundError:
            self.config = {
                "auto_organize": True,
                "organization_rules": {
                    "by_date": True,
                    "by_topic": False,
                    "archive_older_than_days": 90
                }
            }
    
    def organize_summaries(self):
        """Main organization method"""
        self.logger.info("Starting summary organization")
        
        summary_dir = os.path.dirname(os.path.dirname(__file__))
        storage_dir = os.path.join(os.path.dirname(__file__), '..', 'storage', 'summaries')
        
        # Get all summary files
        summary_files = [f for f in os.listdir(summary_dir) if f.endswith('_summary.md')]
        
        organized_count = 0
        for summary_file in summary_files:
            try:
                if self.organize_single_summary(summary_file, summary_dir, storage_dir):
                    organized_count += 1
            except Exception as e:
                self.logger.error(f"Error organizing {summary_file}: {e}")
        
        self.logger.info(f"Organization complete: {organized_count} files organized")
        self.update_organization_metrics(organized_count, len(summary_files))
    
    def organize_single_summary(self, filename, source_dir, target_dir):
        """Organize a single summary file"""
        source_path = os.path.join(source_dir, filename)
        
        # Extract date from filename
        date_match = re.search(r'(\d{2}-\d{2})', filename)
        if not date_match:
            self.logger.warning(f"Could not extract date from {filename}")
            return False
        
        date_str = date_match.group(1)
        month, day = date_str.split('-')
        
        # Create organized directory structure
        target_subdir = os.path.join(target_dir, f"2025-{month}", f"{month}-{day}")
        os.makedirs(target_subdir, exist_ok=True)
        
        target_path = os.path.join(target_subdir, filename)
        
        # Move file if it doesn't already exist in target
        if not os.path.exists(target_path):
            shutil.move(source_path, target_path)
            self.logger.info(f"Organized {filename} to {target_subdir}")
            return True
        
        return False
    
    def update_organization_metrics(self, organized_count, total_count):
        """Update organization metrics"""
        metrics_path = os.path.join(os.path.dirname(__file__), '..', 'data', 'metrics.json')
        
        try:
            with open(metrics_path, 'r') as f:
                metrics = json.load(f)
        except FileNotFoundError:
            metrics = {"organization_stats": {}}
        
        timestamp = datetime.now().strftime("%m-%d_%I-%M%p")
        metrics["organization_stats"][timestamp] = {
            "files_organized": organized_count,
            "total_files": total_count,
            "organization_rate": (organized_count / total_count * 100) if total_count > 0 else 0
        }
        
        with open(metrics_path, 'w') as f:
            json.dump(metrics, f, indent=2)
    
    def cleanup_empty_directories(self):
        """Clean up empty directories in storage"""
        storage_dir = os.path.join(os.path.dirname(__file__), '..', 'storage', 'summaries')
        
        for root, dirs, files in os.walk(storage_dir, topdown=False):
            for dir_name in dirs:
                dir_path = os.path.join(root, dir_name)
                try:
                    if not os.listdir(dir_path):  # Directory is empty
                        os.rmdir(dir_path)
                        self.logger.info(f"Removed empty directory: {dir_path}")
                except OSError:
                    pass  # Directory not empty or other error

def main():
    organizer = SummaryOrganizer()
    organizer.organize_summaries()
    organizer.cleanup_empty_directories()

if __name__ == "__main__":
    main()
