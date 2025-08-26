
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
Search Interface - Optimized search functionality for merged content
"""

import os
import json
import logging
import re
from typing import List, Dict, Tuple

class SearchInterface:
    def __init__(self):
        self.setup_logging()
        self.load_search_config()
        
    def setup_logging(self):
        logging.basicConfig(level=logging.INFO)
        self.logger = logging.getLogger(__name__)
        
    def load_search_config(self):
        """Load search configuration"""
        config_path = os.path.join(os.path.dirname(__file__), '..', '..', 'config', 'search_settings.json')
        try:
            with open(config_path, 'r') as f:
                self.config = json.load(f)
        except FileNotFoundError:
            self.config = {
                "search_algorithms": ["content_similarity", "relationship_search"],
                "max_results": 30,
                "similarity_threshold": 0.6
            }
    
    def search_merged_content(self, query: str, search_type: str = "content_similarity") -> List[Dict]:
        """Search merged content using specified algorithm"""
        try:
            if search_type == "content_similarity":
                return self.similarity_search(query)
            elif search_type == "relationship_search":
                return self.relationship_search(query)
            elif search_type == "merged_content_search":
                return self.merged_group_search(query)
            else:
                self.logger.warning(f"Unknown search type: {search_type}")
                return self.similarity_search(query)
                
        except Exception as e:
            self.logger.error(f"Search failed: {e}")
            return []
    
    def similarity_search(self, query: str) -> List[Dict]:
        """Search based on content similarity"""
        results = []
        merged_dir = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))
        
        # Get merged content files
        storage_dir = os.path.join(merged_dir, 'storage', 'merged_content')
        if not os.path.exists(storage_dir):
            return results
        
        query_terms = query.lower().split()
        
        for root, dirs, files in os.walk(storage_dir):
            for file in files:
                if file.endswith('.md') or file.endswith('.txt'):
                    file_path = os.path.join(root, file)
                    try:
                        with open(file_path, 'r', encoding='utf-8') as f:
                            content = f.read().lower()
                        
                        # Calculate relevance score
                        score = 0
                        for term in query_terms:
                            score += content.count(term)
                        
                        if score > 0:
                            results.append({
                                'file': file,
                                'path': file_path,
                                'score': score,
                                'search_type': 'content_similarity'
                            })
                            
                    except Exception as e:
                        self.logger.warning(f"Error reading {file}: {e}")
        
        # Sort by relevance score
        results.sort(key=lambda x: x['score'], reverse=True)
        return results[:self.config.get('max_results', 30)]
    
    def relationship_search(self, query: str) -> List[Dict]:
        """Search based on merge relationships"""
        results = []
        
        try:
            index_path = os.path.join(os.path.dirname(__file__), '..', '..', 'data', 'merge_master.json')
            if not os.path.exists(index_path):
                return results
            
            with open(index_path, 'r') as f:
                index = json.load(f)
            
            relationships = index.get('merge_relationships', {})
            merged_groups = index.get('merged_groups', {})
            
            query_lower = query.lower()
            
            for rel_id, rel_data in relationships.items():
                connection_reason = rel_data.get('connection_reason', '').lower()
                if query_lower in connection_reason:
                    connected_groups = rel_data.get('connected_groups', [])
                    
                    for group_id in connected_groups:
                        if group_id in merged_groups:
                            group_data = merged_groups[group_id]
                            results.append({
                                'group_id': group_id,
                                'relationship_id': rel_id,
                                'connection_reason': rel_data.get('connection_reason'),
                                'source_files': group_data.get('source_files', []),
                                'search_type': 'relationship'
                            })
            
        except Exception as e:
            self.logger.error(f"Relationship search failed: {e}")
        
        return results
    
    def merged_group_search(self, query: str) -> List[Dict]:
        """Search within merged groups"""
        results = []
        
        try:
            index_path = os.path.join(os.path.dirname(__file__), '..', '..', 'data', 'merge_master.json')
            if not os.path.exists(index_path):
                return results
            
            with open(index_path, 'r') as f:
                index = json.load(f)
            
            merged_groups = index.get('merged_groups', {})
            query_lower = query.lower()
            
            for group_id, group_data in merged_groups.items():
                # Check merge reason
                merge_reason = group_data.get('merge_reason', '').lower()
                source_files = group_data.get('source_files', [])
                
                score = 0
                if query_lower in merge_reason:
                    score += 10
                
                # Check source file names
                for file_path in source_files:
                    filename = os.path.basename(file_path).lower()
                    if query_lower in filename:
                        score += 5
                
                if score > 0:
                    results.append({
                        'group_id': group_id,
                        'merge_reason': group_data.get('merge_reason'),
                        'source_files': source_files,
                        'created': group_data.get('created'),
                        'score': score,
                        'search_type': 'merged_group'
                    })
            
            results.sort(key=lambda x: x['score'], reverse=True)
            
        except Exception as e:
            self.logger.error(f"Merged group search failed: {e}")
        
        return results[:self.config.get('max_results', 25)]
    
    def get_merge_suggestions(self, content: str) -> List[Dict]:
        """Get suggestions for potential merges based on content"""
        suggestions = []
        
        try:
            # This would integrate with the merge manager to find similar content
            content_preview = content[:200] + "..." if len(content) > 200 else content
            
            # For now, return placeholder suggestions
            suggestions.append({
                'suggestion_type': 'content_similarity',
                'confidence': 0.8,
                'reason': 'Similar topic detected',
                'preview': content_preview
            })
            
        except Exception as e:
            self.logger.error(f"Error getting merge suggestions: {e}")
        
        return suggestions
