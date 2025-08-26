
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
Search Interface - Optimized search functionality for indexed content
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
                "search_algorithms": ["keyword", "fuzzy", "semantic"],
                "max_results": 20,
                "relevance_threshold": 0.3
            }
    
    def search_indexed_content(self, query: str, search_type: str = "keyword") -> List[Dict]:
        """Search indexed content using specified algorithm"""
        try:
            if search_type == "keyword":
                return self.keyword_search(query)
            elif search_type == "fuzzy":
                return self.fuzzy_search(query)
            elif search_type == "semantic":
                return self.semantic_search(query)
            else:
                self.logger.warning(f"Unknown search type: {search_type}")
                return self.keyword_search(query)
                
        except Exception as e:
            self.logger.error(f"Search failed: {e}")
            return []
    
    def keyword_search(self, query: str) -> List[Dict]:
        """Basic keyword search in indexed files"""
        results = []
        index_dir = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))
        
        # Get all markdown files in the index
        index_files = [f for f in os.listdir(index_dir) if f.endswith('.md')]
        
        query_terms = query.lower().split()
        
        for index_file in index_files:
            file_path = os.path.join(index_dir, index_file)
            try:
                with open(file_path, 'r', encoding='utf-8') as f:
                    content = f.read().lower()
                
                # Calculate relevance score
                score = 0
                for term in query_terms:
                    score += content.count(term)
                
                if score > 0:
                    results.append({
                        'file': index_file,
                        'path': file_path,
                        'score': score,
                        'search_type': 'keyword'
                    })
                    
            except Exception as e:
                self.logger.warning(f"Error reading {index_file}: {e}")
        
        # Sort by relevance score
        results.sort(key=lambda x: x['score'], reverse=True)
        return results[:self.config.get('max_results', 20)]
    
    def fuzzy_search(self, query: str) -> List[Dict]:
        """Fuzzy search allowing for typos and partial matches"""
        results = []
        index_dir = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))
        
        index_files = [f for f in os.listdir(index_dir) if f.endswith('.md')]
        
        # Create regex pattern for fuzzy matching
        fuzzy_pattern = self.create_fuzzy_pattern(query)
        
        for index_file in index_files:
            file_path = os.path.join(index_dir, index_file)
            try:
                with open(file_path, 'r', encoding='utf-8') as f:
                    content = f.read()
                
                matches = re.findall(fuzzy_pattern, content, re.IGNORECASE)
                if matches:
                    results.append({
                        'file': index_file,
                        'path': file_path,
                        'score': len(matches),
                        'matches': matches[:5],  # Show first 5 matches
                        'search_type': 'fuzzy'
                    })
                    
            except Exception as e:
                self.logger.warning(f"Error reading {index_file}: {e}")
        
        results.sort(key=lambda x: x['score'], reverse=True)
        return results[:self.config.get('max_results', 20)]
    
    def semantic_search(self, query: str) -> List[Dict]:
        """Semantic search using embeddings (placeholder for future implementation)"""
        self.logger.info("Semantic search not yet implemented, falling back to keyword search")
        return self.keyword_search(query)
    
    def create_fuzzy_pattern(self, query: str) -> str:
        """Create regex pattern for fuzzy matching"""
        # Simple fuzzy pattern - allows for one character substitution per word
        words = query.split()
        fuzzy_words = []
        
        for word in words:
            if len(word) <= 3:
                fuzzy_words.append(word)
            else:
                # Allow 1 character difference for longer words
                fuzzy_pattern = '.{0,1}'.join(word)
                fuzzy_words.append(f'({word}|{fuzzy_pattern})')
        
        return '\\b' + '.*?'.join(fuzzy_words) + '\\b'
    
    def search_by_metadata(self, metadata_filter: Dict) -> List[Dict]:
        """Search indexed content by metadata criteria"""
        results = []
        
        try:
            index_path = os.path.join(os.path.dirname(__file__), '..', '..', 'data', 'index_master.json')
            if not os.path.exists(index_path):
                return results
            
            with open(index_path, 'r') as f:
                index = json.load(f)
            
            for file_key, file_info in index.get('indexed_files', {}).items():
                match = True
                for key, value in metadata_filter.items():
                    if key not in file_info or file_info[key] != value:
                        match = False
                        break
                
                if match:
                    results.append({
                        'file': file_key,
                        'path': file_info.get('path', ''),
                        'metadata': file_info,
                        'search_type': 'metadata'
                    })
            
        except Exception as e:
            self.logger.error(f"Metadata search failed: {e}")
        
        return results
    
    def get_search_suggestions(self, partial_query: str) -> List[str]:
        """Get search suggestions based on partial query"""
        suggestions = []
        
        # Load recent searches or common terms
        try:
            analytics_path = os.path.join(os.path.dirname(__file__), '..', '..', 'data', 'analytics.json')
            if os.path.exists(analytics_path):
                with open(analytics_path, 'r') as f:
                    analytics = json.load(f)
                    
                common_terms = analytics.get('common_search_terms', [])
                suggestions = [term for term in common_terms if partial_query.lower() in term.lower()]
                
        except Exception as e:
            self.logger.error(f"Error getting suggestions: {e}")
        
        return suggestions[:10]  # Return top 10 suggestions
