
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
Merge Manager - Handles content merging operations
"""

import os
import json
import logging
import hashlib
from datetime import datetime
from typing import List, Dict, Tuple

class MergeManager:
    def __init__(self):
        self.setup_logging()
        self.load_config()
        
    def setup_logging(self):
        logging.basicConfig(level=logging.INFO)
        self.logger = logging.getLogger(__name__)
        
    def load_config(self):
        """Load merge configuration"""
        config_path = os.path.join(os.path.dirname(__file__), '..', '..', 'config', 'merge_config.json')
        try:
            with open(config_path, 'r') as f:
                config = json.load(f)
                self.config = config.get('merging', {
                    'similarity_threshold': 0.7,
                    'max_merge_group_size': 10
                })
        except FileNotFoundError:
            self.config = {
                'similarity_threshold': 0.7,
                'max_merge_group_size': 10
            }
    
    def calculate_content_similarity(self, content1: str, content2: str) -> float:
        """Calculate similarity between two content pieces"""
        try:
            # Simple word-based similarity calculation
            words1 = set(content1.lower().split())
            words2 = set(content2.lower().split())
            
            if not words1 and not words2:
                return 1.0
            if not words1 or not words2:
                return 0.0
            
            intersection = words1.intersection(words2)
            union = words1.union(words2)
            
            similarity = len(intersection) / len(union)
            return similarity
            
        except Exception as e:
            self.logger.error(f"Error calculating similarity: {e}")
            return 0.0
    
    def identify_merge_candidates(self, content_files: List[Dict]) -> List[Tuple]:
        """Identify files that are candidates for merging"""
        merge_candidates = []
        
        try:
            for i, file1 in enumerate(content_files):
                for j, file2 in enumerate(content_files[i+1:], i+1):
                    similarity = self.calculate_content_similarity(
                        file1.get('content', ''),
                        file2.get('content', '')
                    )
                    
                    if similarity >= self.config['similarity_threshold']:
                        merge_candidates.append((
                            file1['path'],
                            file2['path'],
                            similarity
                        ))
            
            # Sort by similarity score (highest first)
            merge_candidates.sort(key=lambda x: x[2], reverse=True)
            
        except Exception as e:
            self.logger.error(f"Error identifying merge candidates: {e}")
        
        return merge_candidates
    
    def create_merge_group(self, files: List[str], merge_reason: str) -> Dict:
        """Create a merged group from multiple files"""
        try:
            group_id = self.generate_group_id(files)
            timestamp = datetime.now().strftime("%m-%d_%I-%M%p")
            
            merge_group = {
                'group_id': group_id,
                'created': timestamp,
                'source_files': files,
                'merge_reason': merge_reason,
                'merge_strategy': 'content_similarity',
                'status': 'active'
            }
            
            self.logger.info(f"Created merge group {group_id} with {len(files)} files")
            return merge_group
            
        except Exception as e:
            self.logger.error(f"Error creating merge group: {e}")
            return {}
    
    def generate_group_id(self, files: List[str]) -> str:
        """Generate unique ID for merge group"""
        content = '|'.join(sorted(files))
        return hashlib.md5(content.encode('utf-8')).hexdigest()[:12]
    
    def merge_content(self, source_files: List[str]) -> str:
        """Merge content from multiple files"""
        try:
            merged_content = []
            timestamp = datetime.now().strftime("%m-%d_%I-%M%p")
            
            merged_content.append(f"# Merged Content - {timestamp}")
            merged_content.append(f"Sources: {len(source_files)} files")
            merged_content.append("")
            
            for i, file_path in enumerate(source_files, 1):
                if os.path.exists(file_path):
                    with open(file_path, 'r', encoding='utf-8') as f:
                        content = f.read()
                    
                    merged_content.append(f"## Source {i}: {os.path.basename(file_path)}")
                    merged_content.append(content)
                    merged_content.append("")
            
            return '\n'.join(merged_content)
            
        except Exception as e:
            self.logger.error(f"Error merging content: {e}")
            return ""
    
    def validate_merge_quality(self, original_files: List[str], merged_content: str) -> float:
        """Validate the quality of a merge operation"""
        try:
            # Simple validation based on content preservation
            original_length = 0
            for file_path in original_files:
                if os.path.exists(file_path):
                    with open(file_path, 'r', encoding='utf-8') as f:
                        original_length += len(f.read())
            
            merged_length = len(merged_content)
            
            # Quality score based on content preservation
            if original_length == 0:
                return 0.0
            
            preservation_ratio = min(merged_length / original_length, 1.0)
            
            # Bonus for organization and structure
            structure_bonus = 0.1 if "# Merged Content" in merged_content else 0.0
            
            quality_score = preservation_ratio + structure_bonus
            return min(quality_score, 1.0)
            
        except Exception as e:
            self.logger.error(f"Error validating merge quality: {e}")
            return 0.0
