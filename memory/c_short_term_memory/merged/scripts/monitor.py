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
Merged Monitor Agent - Main monitoring script for merge processing
Monitors Memory Merger Agent outputs and maintains merge indexes
"""

import os
import json
import logging
from datetime import datetime
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler

class MergedMonitor(FileSystemEventHandler):
    def __init__(self):
        self.setup_logging()
        self.config = self.load_config()
        
    def setup_logging(self):
        log_file = os.path.join(os.path.dirname(__file__), '..', 'logs', 'monitoring.log')
        logging.basicConfig(
            level=logging.INFO,
            format='%(asctime)s - %(levelname)s - %(message)s',
            handlers=[
                logging.FileHandler(log_file),
                logging.StreamHandler()
            ]
        )
        self.logger = logging.getLogger(__name__)
        
    def load_config(self):
        config_path = os.path.join(os.path.dirname(__file__), '..', 'config', 'merge_config.json')
        try:
            with open(config_path, 'r') as f:
                return json.load(f)
        except FileNotFoundError:
            return {"watch_directories": [], "merge_patterns": ["*.md"]}
    
    def on_created(self, event):
        if not event.is_directory and self.is_mergeable_file(event.src_path):
            self.logger.info(f"New mergeable content detected: {event.src_path}")
            self.process_merge_candidate(event.src_path)
    
    def on_modified(self, event):
        if not event.is_directory and self.is_mergeable_file(event.src_path):
            self.logger.info(f"Mergeable content modified: {event.src_path}")
            self.process_merge_candidate(event.src_path)
    
    def is_mergeable_file(self, file_path):
        """Check if file matches merge patterns"""
        patterns = self.config.get("merge_patterns", ["*.md"])
        for pattern in patterns:
            if file_path.endswith(pattern.replace("*", "")):
                return True
        return False
    
    def process_merge_candidate(self, file_path):
        """Process new merge candidate"""
        try:
            # Update master merge index
            self.update_merge_index(file_path)
            # Update analytics
            self.update_analytics()
            self.logger.info(f"Successfully processed merge candidate: {file_path}")
        except Exception as e:
            self.logger.error(f"Error processing merge candidate {file_path}: {e}")
    
    def update_merge_index(self, file_path):
        """Update the merge master index"""
        index_path = os.path.join(os.path.dirname(__file__), '..', 'data', 'merge_master.json')
        
        try:
            with open(index_path, 'r') as f:
                index = json.load(f)
        except FileNotFoundError:
            index = {"merged_groups": {}, "merge_relationships": {}, "last_updated": ""}
        
        timestamp = datetime.now().strftime("%m-%d_%I-%M%p")
        file_key = os.path.basename(file_path)
        
        # Add to potential merge candidates
        if "merge_candidates" not in index:
            index["merge_candidates"] = {}
        
        index["merge_candidates"][file_key] = {
            "path": file_path,
            "detected": timestamp,
            "processed": False,
            "size": os.path.getsize(file_path) if os.path.exists(file_path) else 0
        }
        index["last_updated"] = timestamp
        
        with open(index_path, 'w') as f:
            json.dump(index, f, indent=2)
    
    def update_analytics(self):
        """Update analytics data"""
        analytics_path = os.path.join(os.path.dirname(__file__), '..', 'data', 'analytics.json')
        
        try:
            with open(analytics_path, 'r') as f:
                analytics = json.load(f)
        except FileNotFoundError:
            analytics = {"total_merge_operations": 0, "merge_patterns": {}}
        
        analytics["total_merge_operations"] = analytics.get("total_merge_operations", 0) + 1
        analytics["last_update"] = datetime.now().strftime("%m-%d_%I-%M%p")
        
        with open(analytics_path, 'w') as f:
            json.dump(analytics, f, indent=2)

def main():
    monitor = MergedMonitor()
    observer = Observer()
    
    # Watch the Index folder and other configured directories
    watch_dirs = monitor.config.get("watch_directories", ["../Index"])
    for watch_dir in watch_dirs:
        full_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', watch_dir))
        if os.path.exists(full_path):
            observer.schedule(monitor, full_path, recursive=True)
            monitor.logger.info(f"Watching directory: {full_path}")
    
    observer.start()
    monitor.logger.info("Merged Monitor started")
    
    try:
        while True:
            observer.join(1)
    except KeyboardInterrupt:
        observer.stop()
        monitor.logger.info("Merged Monitor stopped")
    
    observer.join()

if __name__ == "__main__":
    main()
