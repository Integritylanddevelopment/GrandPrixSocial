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
Index Monitor Agent - Main monitoring script for index processing
Monitors Memory Indexer Agent outputs and maintains index databases
"""

import os
import json
import logging
from datetime import datetime
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler

class IndexMonitor(FileSystemEventHandler):
    def __init__(self):
        self.setup_logging()
        self.config = self.load_config()
        
    def setup_logging(self):
        log_file = os.path.join(os.path.dirname(__file__), '..', 'logs', 'monitoring.log')
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
        
    def load_config(self):
        config_path = os.path.join(os.path.dirname(__file__), '..', 'config', 'index_config.json')
        try:
            with open(config_path, 'r') as f:
                return json.load(f)
        except FileNotFoundError:
            return {
                "watch_directories": [],
                "index_patterns": ["*_indexed.json"],
                "auto_process": True
            }
    
    def on_created(self, event):
        if not event.is_directory and self.is_indexable_file(event.src_path):
            self.logger.info(f"New indexable content detected: {event.src_path}")
            self.process_index_update(event.src_path)
    
    def on_modified(self, event):
        if not event.is_directory and self.is_indexable_file(event.src_path):
            self.logger.info(f"Index content modified: {event.src_path}")
            self.process_index_update(event.src_path)
    
    def is_indexable_file(self, file_path):
        """Check if file should be indexed"""
        indexable_extensions = ['.json', '.md', '.txt']
        return any(file_path.endswith(ext) for ext in indexable_extensions)
    
    def process_index_update(self, file_path):
        """Process new or modified files for indexing"""
        try:
            # Update master index
            self.update_master_index(file_path)
            # Generate embeddings if configured
            if self.config.get('generate_embeddings', True):
                self.generate_embeddings(file_path)
            # Update analytics
            self.update_analytics()
            self.logger.info(f"Successfully processed index update: {file_path}")
        except Exception as e:
            self.logger.error(f"Error processing index update {file_path}: {e}")
    
    def update_master_index(self, file_path):
        """Update the master index database"""
        index_path = os.path.join(os.path.dirname(__file__), '..', 'data', 'index_master.json')
        
        try:
            with open(index_path, 'r') as f:
                index = json.load(f)
        except FileNotFoundError:
            index = {"indexed_files": {}, "last_updated": "", "total_files": 0}
        
        timestamp = datetime.now().strftime("%m-%d_%I-%M%p")
        file_key = os.path.basename(file_path)
        
        index["indexed_files"][file_key] = {
            "path": file_path,
            "last_indexed": timestamp,
            "size": os.path.getsize(file_path) if os.path.exists(file_path) else 0,
            "type": self.get_file_type(file_path)
        }
        index["last_updated"] = timestamp
        index["total_files"] = len(index["indexed_files"])
        
        with open(index_path, 'w') as f:
            json.dump(index, f, indent=2)
    
    def get_file_type(self, file_path):
        """Determine file type for indexing"""
        if file_path.endswith('.json'):
            return "json_data"
        elif file_path.endswith('.md'):
            return "markdown"
        elif file_path.endswith('.txt'):
            return "text"
        else:
            return "unknown"
    
    def generate_embeddings(self, file_path):
        """Generate embeddings for content (placeholder for AI integration)"""
        try:
            # This would integrate with OpenAI embeddings API in full implementation
            self.logger.info(f"Embeddings generation requested for: {file_path}")
            
            # For now, create placeholder embedding entry
            embeddings_dir = os.path.join(os.path.dirname(__file__), '..', 'storage', 'embeddings')
            os.makedirs(embeddings_dir, exist_ok=True)
            
            embedding_file = os.path.join(embeddings_dir, f"{os.path.basename(file_path)}_embedding.json")
            embedding_data = {
                "file_path": file_path,
                "timestamp": datetime.now().strftime("%m-%d_%I-%M%p"),
                "status": "pending_ai_processing"
            }
            
            with open(embedding_file, 'w') as f:
                json.dump(embedding_data, f, indent=2)
                
        except Exception as e:
            self.logger.error(f"Embedding generation failed for {file_path}: {e}")
    
    def update_analytics(self):
        """Update analytics data"""
        analytics_path = os.path.join(os.path.dirname(__file__), '..', 'data', 'analytics.json')
        
        try:
            with open(analytics_path, 'r') as f:
                analytics = json.load(f)
        except FileNotFoundError:
            analytics = {"total_indexed": 0, "processing_stats": {}}
        
        analytics["total_indexed"] = analytics.get("total_indexed", 0) + 1
        analytics["last_update"] = datetime.now().strftime("%m-%d_%I-%M%p")
        
        with open(analytics_path, 'w') as f:
            json.dump(analytics, f, indent=2)

def main():
    monitor = IndexMonitor()
    observer = Observer()
    
    # Watch the parent memory directories for new content to index
    memory_root = os.path.join(os.path.dirname(__file__), '..', '..', '..')
    observer.schedule(monitor, memory_root, recursive=True)
    
    observer.start()
    monitor.logger.info("Index Monitor started")
    
    try:
        while True:
            observer.join(1)
    except KeyboardInterrupt:
        observer.stop()
        monitor.logger.info("Index Monitor stopped")
    
    observer.join()

if __name__ == "__main__":
    main()
