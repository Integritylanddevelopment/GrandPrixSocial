from typing import Dict, List, Any, Optional
#!/usr/bin/env python3
"""
Embedding Manager - Handles embeddings for summary content
"""

import os
import json
import logging
import hashlib

class EmbeddingManager:
    def __init__(self):
        self.setup_logging()
        self.embeddings_dir = os.path.join(os.path.dirname(__file__), '..', '..', 'storage', 'embeddings')
        os.makedirs(self.embeddings_dir, exist_ok=True)
        
    def setup_logging(self):
        logging.basicConfig(level=logging.INFO)
        self.logger = logging.getLogger(__name__)
    
    def generate_embedding_key(self, content):
        """Generate unique key for content"""
        return hashlib.md5(content.encode('utf-8')).hexdigest()
    
    def store_embedding(self, content, embedding_vector):
        """Store embedding vector for content"""
        try:
            key = self.generate_embedding_key(content)
            embedding_data = {
                'content_hash': key,
                'vector': embedding_vector,
                'content_preview': content[:200] + '...' if len(content) > 200 else content
            }
            
            embedding_file = os.path.join(self.embeddings_dir, f'{key}.json')
            with open(embedding_file, 'w') as f:
                json.dump(embedding_data, f, indent=2)
            
            self.logger.info(f"Stored embedding for content hash: {key}")
            return key
            
        except Exception as e:
            self.logger.error(f"Failed to store embedding: {e}")
            return None
    
    def retrieve_embedding(self, content):
        """Retrieve embedding vector for content"""
        try:
            key = self.generate_embedding_key(content)
            embedding_file = os.path.join(self.embeddings_dir, f'{key}.json')
            
            if os.path.exists(embedding_file):
                with open(embedding_file, 'r') as f:
                    embedding_data = json.load(f)
                return embedding_data.get('vector')
            
            return None
            
        except Exception as e:
            self.logger.error(f"Failed to retrieve embedding: {e}")
            return None
    
    def cleanup_old_embeddings(self, max_age_days=90):
        """Clean up old embedding files"""
        try:
            import time
            current_time = time.time()
            removed_count = 0
            
            for filename in os.listdir(self.embeddings_dir):
                file_path = os.path.join(self.embeddings_dir, filename)
                if os.path.isfile(file_path):
                    file_age = (current_time - os.path.getctime(file_path)) / (24 * 3600)
                    if file_age > max_age_days:
                        os.remove(file_path)
                        removed_count += 1
            
            self.logger.info(f"Cleaned up {removed_count} old embedding files")
            
        except Exception as e:
            self.logger.error(f"Failed to cleanup embeddings: {e}")
