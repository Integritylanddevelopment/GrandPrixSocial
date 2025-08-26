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
Memory Core Log Agent
Simple agent that collects all Memory Core agent logs and centralizes them
for the Echo Collector Agent to pick up.

Features:
- Monitors all memory_core folders for new logs
- Copies logs to hot_storage (recent) and cold_storage (archived)
- Simple file-based coordination
- Minimal complexity - just log collection and organization
"""

import os
import shutil
import time
import json
import logging
from datetime import datetime, timedelta
from pathlib import Path
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler

class MemoryCoreLogHandler(FileSystemEventHandler):
    def __init__(self, agent):
        self.agent = agent
    
    def on_modified(self, event):
        if event.is_directory:
            return
        if event.src_path.endswith('.log'):
            self.agent.collect_log_file(event.src_path)

class MemoryCoreLogAgent:
    def __init__(self):
        self.agent_dir = Path(__file__).parent
        self.memory_core_dir = self.agent_dir.parent
        self.hot_storage = self.agent_dir / "hot_storage"
        self.cold_storage = self.agent_dir / "cold_storage"
        self.timestamp_format = "%m-%d_%I-%M%p"
        
        # Create storage directories
        self.hot_storage.mkdir(exist_ok=True)
        self.cold_storage.mkdir(exist_ok=True)
        
        # Setup logging
        self.setup_logging()
        
        # State tracking
        self.state = self.load_state()
    
    def setup_logging(self):
        """Simple logging setup"""
        log_file = self.agent_dir / "agent_interactions.log"
        logging.basicConfig(
            level=logging.INFO,
            format='[%(asctime)s] %(message)s',
            handlers=[
                logging.FileHandler(log_file),
                logging.StreamHandler()
            ]
        )
        self.logger = logging.getLogger(__name__)
    
    def load_state(self):
        """Load simple state file"""
        state_file = self.agent_dir / "memory_core_log_agent_state.json"
        if state_file.exists():
            with open(state_file, 'r') as f:
                return json.load(f)
        return {
            "last_collection": None,
            "files_processed": 0,
            "created": self.get_timestamp()
        }
    
    def save_state(self):
        """Save simple state file"""
        state_file = self.agent_dir / "memory_core_log_agent_state.json"
        with open(state_file, 'w') as f:
            json.dump(self.state, f, indent=2)
    
    def get_timestamp(self):
        """Get standardized timestamp"""
        return datetime.now().strftime(self.timestamp_format)
    
    def collect_log_file(self, log_path):
        """Collect a single log file to hot storage"""
        try:
            log_path = Path(log_path)
            if not log_path.exists():
                return
            
            # Generate timestamped filename
            timestamp = self.get_timestamp()
            agent_name = log_path.parent.name
            new_filename = f"{timestamp}_{agent_name}_{log_path.name}"
            
            # Copy to hot storage
            hot_dest = self.hot_storage / new_filename
            shutil.copy2(log_path, hot_dest)
            
            self.logger.info(f"Collected log: {agent_name} -> {new_filename}")
            
            # Update state
            self.state["files_processed"] += 1
            self.state["last_collection"] = timestamp
            self.save_state()
            
        except Exception as e:
            self.logger.error(f"Error collecting log {log_path}: {e}")
    
    def collect_all_logs(self):
        """Collect all existing logs from memory core agents"""
        if not self.memory_core_dir.exists():
            self.logger.warning("Memory core directory not found")
            return
        
        collected = 0
        for agent_folder in self.memory_core_dir.iterdir():
            if not agent_folder.is_dir() or agent_folder.name == "memory_core_log_agent":
                continue
            
            # Look for log files in agent folder
            for log_file in agent_folder.glob("*.log"):
                self.collect_log_file(log_file)
                collected += 1
        
        self.logger.info(f"Bulk collection complete: {collected} logs processed")
    
    def archive_old_logs(self):
        """Move old logs from hot to cold storage"""
        cutoff_time = datetime.now() - timedelta(days=7)
        archived = 0
        
        for log_file in self.hot_storage.glob("*.log"):
            file_time = datetime.fromtimestamp(log_file.stat().st_mtime)
            if file_time < cutoff_time:
                cold_dest = self.cold_storage / log_file.name
                shutil.move(log_file, cold_dest)
                archived += 1
        
        if archived > 0:
            self.logger.info(f"Archived {archived} old logs to cold storage")
    
    def start_monitoring(self):
        """Start watching for new logs"""
        if not self.memory_core_dir.exists():
            self.logger.error("Cannot start monitoring - memory_core directory not found")
            return
        
        event_handler = MemoryCoreLogHandler(self)
        observer = Observer()
        observer.schedule(event_handler, str(self.memory_core_dir), recursive=True)
        
        self.logger.info("Starting Memory Core Log Agent monitoring...")
        observer.start()
        
        try:
            while True:
                # Periodic archiving
                self.archive_old_logs()
                time.sleep(3600)  # Check every hour
        except KeyboardInterrupt:
            observer.stop()
            self.logger.info("Memory Core Log Agent stopped")
        
        observer.join()

def main():
    """Simple main function"""
    agent = MemoryCoreLogAgent()
    
    # Do initial collection
    agent.collect_all_logs()
    
    # Start monitoring
    agent.start_monitoring()

if __name__ == "__main__":
    main()
