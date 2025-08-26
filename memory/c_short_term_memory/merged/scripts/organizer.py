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
Merged Organizer Agent - Auto-organization for merged content
Organizes merged content based on topics, relationships, and metadata
"""

import os
import json
import shutil
import logging
from datetime import datetime
import re

class MergedOrganizer:
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
        config_path = os.path.join(os.path.dirname(__file__), '..', 'config', 'merge_config.json')
        try:
            with open(config_path, 'r') as f:
                self.config = json.load(f)
        except FileNotFoundError:
            self.config = {
                "auto_organize": True,
                "organization_rules": {
                    "by_topic": True,
                    "by_similarity": True,
                    "by_date": False
                }
            }
    
    def organize_merged_content(self):
        """Main organization method"""
        self.logger.info("Starting merged content organization")
        
        # Load merge master index
        index_path = os.path.join(os.path.dirname(__file__), '..', 'data', 'merge_master.json')
        try:
            with open(index_path, 'r') as f:
                index = json.load(f)
        except FileNotFoundError:
            self.logger.warning("No merge master index found - nothing to organize")
            return
        
        merged_groups = index.get("merged_groups", {})
        organized_count = 0
        
        for group_id, group_data in merged_groups.items():
            try:
                if self.organize_single_group(group_id, group_data):
                    organized_count += 1
            except Exception as e:
                self.logger.error(f"Error organizing group {group_id}: {e}")
        
        self.logger.info(f"Organization complete: {organized_count} groups organized")
        self.update_organization_metrics(organized_count, len(merged_groups))
    
    def organize_single_group(self, group_id, group_data):
        """Organize a single merged group"""
        storage_dir = os.path.join(os.path.dirname(__file__), '..', 'storage', 'merged_content')
        
        # Extract organization criteria
        topic = group_data.get("primary_topic", "general")
        similarity_score = group_data.get("similarity_score", 0.5)
        merge_date = group_data.get("merge_timestamp", "unknown")
        
        # Create organized directory structure
        if similarity_score >= 0.8:
            quality_tier = "high_similarity"
        elif similarity_score >= 0.6:
            quality_tier = "medium_similarity"
        else:
            quality_tier = "low_similarity"
        
        target_dir = os.path.join(storage_dir, quality_tier, self.sanitize_topic(topic))
        os.makedirs(target_dir, exist_ok=True)
        
        # Create group summary file
        summary_file = os.path.join(target_dir, f"merged_group_{group_id}.json")
        if not os.path.exists(summary_file):
            with open(summary_file, 'w') as f:
                json.dump(group_data, f, indent=2)
            
            self.logger.info(f"Organized group {group_id} to {target_dir}")
            return True
        
        return False
    
    def sanitize_topic(self, topic):
        """Sanitize topic name for filesystem"""
        # Remove invalid characters and normalize
        sanitized = re.sub(r'[<>:"/\\|?*]', '_', topic)
        sanitized = re.sub(r'\s+', '_', sanitized)
        return sanitized[:50]  # Limit length
    
    def organize_by_relationships(self):
        """Organize content based on merge relationships"""
        try:
            index_path = os.path.join(os.path.dirname(__file__), '..', 'data', 'merge_master.json')
            with open(index_path, 'r') as f:
                index = json.load(f)
            
            relationships = index.get("merge_relationships", {})
            relationship_dir = os.path.join(os.path.dirname(__file__), '..', 'storage', 'merged_content', 'relationships')
            os.makedirs(relationship_dir, exist_ok=True)
            
            for rel_id, rel_data in relationships.items():
                rel_file = os.path.join(relationship_dir, f"relationship_{rel_id}.json")
                with open(rel_file, 'w') as f:
                    json.dump(rel_data, f, indent=2)
            
            self.logger.info(f"Organized {len(relationships)} relationships")
            
        except Exception as e:
            self.logger.error(f"Error organizing relationships: {e}")
    
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
            "groups_organized": organized_count,
            "total_groups": total_count,
            "organization_rate": (organized_count / total_count * 100) if total_count > 0 else 0
        }
        
        with open(metrics_path, 'w') as f:
            json.dump(metrics, f, indent=2)
    
    def cleanup_empty_directories(self):
        """Clean up empty directories in storage"""
        storage_dir = os.path.join(os.path.dirname(__file__), '..', 'storage', 'merged_content')
        
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
    organizer = MergedOrganizer()
    organizer.organize_merged_content()
    organizer.organize_by_relationships()
    organizer.cleanup_empty_directories()

if __name__ == "__main__":
    main()
