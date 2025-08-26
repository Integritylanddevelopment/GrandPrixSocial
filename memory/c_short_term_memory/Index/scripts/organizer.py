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
Index Organizer Agent - Auto-organization for indexed content
Organizes indexed files and maintains structured storage
"""

import os
import json
import shutil
import logging
from datetime import datetime
import hashlib

class IndexOrganizer:
    def __init__(self):
        self.setup_logging()
        self.load_config()
        
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
        
    def load_config(self):
        """Load organization configuration"""
        config_path = os.path.join(os.path.dirname(__file__), '..', 'config', 'index_config.json')
        try:
            with open(config_path, 'r') as f:
                config = json.load(f)
                self.config = config.get('organization', {
                    "auto_organize": True,
                    "organize_by_type": True,
                    "organize_by_date": True,
                    "max_files_per_dir": 1000
                })
        except FileNotFoundError:
            self.config = {
                "auto_organize": True,
                "organize_by_type": True,
                "organize_by_date": True,
                "max_files_per_dir": 1000
            }
    
    def organize_indexed_content(self):
        """Main organization method for indexed content"""
        self.logger.info("Starting index organization")
        
        storage_dir = os.path.join(os.path.dirname(__file__), '..', 'storage', 'indexed_content')
        os.makedirs(storage_dir, exist_ok=True)
        
        # Load master index
        index_path = os.path.join(os.path.dirname(__file__), '..', 'data', 'index_master.json')
        
        try:
            with open(index_path, 'r') as f:
                index = json.load(f)
        except FileNotFoundError:
            self.logger.warning("No master index found - nothing to organize")
            return
        
        organized_count = 0
        for file_key, file_info in index.get("indexed_files", {}).items():
            try:
                if self.organize_single_file(file_info, storage_dir):
                    organized_count += 1
            except Exception as e:
                self.logger.error(f"Error organizing {file_key}: {e}")
        
        self.logger.info(f"Organization complete: {organized_count} files organized")
        self.update_organization_metrics(organized_count, len(index.get("indexed_files", {})))
    
    def organize_single_file(self, file_info, storage_dir):
        """Organize a single indexed file"""
        source_path = file_info.get("path", "")
        file_type = file_info.get("type", "unknown")
        
        if not os.path.exists(source_path):
            self.logger.warning(f"Source file not found: {source_path}")
            return False
        
        # Determine target directory structure
        if self.config.get("organize_by_type", True):
            type_dir = os.path.join(storage_dir, file_type)
        else:
            type_dir = storage_dir
        
        if self.config.get("organize_by_date", True):
            # Extract date from file info or use current date
            timestamp = file_info.get("last_indexed", datetime.now().strftime("%m-%d_%I-%M%p"))
            try:
                month_day = timestamp.split('_')[0]  # Get MM-DD part
                date_dir = os.path.join(type_dir, f"2025-{month_day.replace('-', '')[:2]}", month_day)
            except:
                date_dir = os.path.join(type_dir, "unknown_date")
        else:
            date_dir = type_dir
        
        os.makedirs(date_dir, exist_ok=True)
        
        # Check if directory has too many files
        if len(os.listdir(date_dir)) >= self.config.get("max_files_per_dir", 1000):
            # Create overflow directory
            overflow_dir = os.path.join(date_dir, "overflow")
            os.makedirs(overflow_dir, exist_ok=True)
            date_dir = overflow_dir
        
        # Generate organized filename
        filename = os.path.basename(source_path)
        target_path = os.path.join(date_dir, filename)
        
        # Handle filename conflicts
        counter = 1
        while os.path.exists(target_path):
            name, ext = os.path.splitext(filename)
            target_path = os.path.join(date_dir, f"{name}_{counter}{ext}")
            counter += 1
        
        # Copy file to organized location
        try:
            shutil.copy2(source_path, target_path)
            self.logger.info(f"Organized {filename} to {date_dir}")
            
            # Update file info with organized path
            file_info["organized_path"] = target_path
            file_info["organized_timestamp"] = datetime.now().strftime("%m-%d_%I-%M%p")
            
            return True
        except Exception as e:
            self.logger.error(f"Failed to organize {filename}: {e}")
            return False
    
    def create_index_categories(self):
        """Create category-based organization structure"""
        storage_dir = os.path.join(os.path.dirname(__file__), '..', 'storage', 'indexed_content')
        
        categories = {
            "json_data": "Structured data files",
            "markdown": "Documentation and text files", 
            "text": "Plain text files",
            "unknown": "Unclassified files"
        }
        
        for category, description in categories.items():
            category_dir = os.path.join(storage_dir, category)
            os.makedirs(category_dir, exist_ok=True)
            
            # Create category info file
            info_file = os.path.join(category_dir, "category_info.json")
            if not os.path.exists(info_file):
                info = {
                    "category": category,
                    "description": description,
                    "created": datetime.now().strftime("%m-%d_%I-%M%p"),
                    "file_count": 0
                }
                with open(info_file, 'w') as f:
                    json.dump(info, f, indent=2)
    
    def update_organization_metrics(self, organized_count, total_count):
        """Update organization metrics"""
        metrics_path = os.path.join(os.path.dirname(__file__), '..', 'data', 'metrics.json')
        
        try:
            with open(metrics_path, 'r') as f:
                metrics = json.load(f)
        except FileNotFoundError:
            metrics = {"organization_stats": {}}
        
        timestamp = datetime.now().strftime("%m-%d_%I-%M%p")
        if "organization_stats" not in metrics:
            metrics["organization_stats"] = {}
            
        metrics["organization_stats"][timestamp] = {
            "files_organized": organized_count,
            "total_indexed_files": total_count,
            "organization_rate": (organized_count / total_count * 100) if total_count > 0 else 0
        }
        
        with open(metrics_path, 'w') as f:
            json.dump(metrics, f, indent=2)
    
    def cleanup_empty_directories(self):
        """Clean up empty directories in organized storage"""
        storage_dir = os.path.join(os.path.dirname(__file__), '..', 'storage', 'indexed_content')
        
        for root, dirs, files in os.walk(storage_dir, topdown=False):
            for dir_name in dirs:
                dir_path = os.path.join(root, dir_name)
                try:
                    # Only remove if completely empty (no files or subdirs)
                    if not os.listdir(dir_path):
                        os.rmdir(dir_path)
                        self.logger.info(f"Removed empty directory: {dir_path}")
                except OSError:
                    pass  # Directory not empty or other error

def main():
    organizer = IndexOrganizer()
    organizer.create_index_categories()
    organizer.organize_indexed_content()
    organizer.cleanup_empty_directories()

if __name__ == "__main__":
    main()
