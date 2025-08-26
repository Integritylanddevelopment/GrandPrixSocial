
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
tag_intelligence_engine.py - Version 2.0

CommandCore Tag Intelligence Engine

Advanced AI-powered semantic tagging system with machine learning capabilities.
Provides intelligent tag generation, DNA fingerprinting, relationship mapping,
and continuous learning optimization.

Authority Level: TAG_INTELLIGENCE
Version: 2.0 (aligned with Core Logic v2.0)
"""

import os
import sys
import json
import logging
from datetime import datetime
from typing import Dict, List, Tuple, Any, Optional
from pathlib import Path

# Handle numpy import gracefully
try:
    import numpy as np
    NUMPY_AVAILABLE = True
except ImportError:
    NUMPY_AVAILABLE = False
    logging.warning("NumPy not available - using fallback similarity calculations")

# Handle OpenAI import gracefully
try:
    import openai
    from dotenv import load_dotenv
    load_dotenv()
    OPENAI_AVAILABLE = True
except ImportError:
    OPENAI_AVAILABLE = False
    logging.warning("OpenAI not available - using fallback tag generation")

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='[%(asctime)s] [TAG_ENGINE] %(levelname)s - %(message)s',
    datefmt='%m-%d_%I-%M%p'
)

class TagIntelligenceEngine:
    """
    CommandCore Tag Intelligence Engine
    
    Advanced AI-powered semantic tagging system with machine learning capabilities.
    Features:
    - AI-powered tag generation using GPT models
    - Semantic vector embeddings for tag relationships
    - Tag DNA system with effectiveness tracking
    - Continuous learning and optimization
    - Cross-system tag intelligence sharing
    
    Authority Level: TAG_INTELLIGENCE
    Version: 2.0 (aligned with Core Logic v2.0)
    """
    
    def __init__(self, base_path: Optional[str] = None):
        """Initialize the Tag Intelligence Engine."""
        self.base_path = base_path or os.path.dirname(__file__)
        self.timestamp_format = "%m-%d_%I-%M%p"
        
        # Core files
        self.tag_dna_file = os.path.join(self.base_path, "tag_dna_database.json")
        self.usage_index_file = os.path.join(self.base_path, "tag_usage_index.json")
        self.metrics_file = os.path.join(self.base_path, "agent_metrics.json")
        
        # Initialize OpenAI client if available
        if OPENAI_AVAILABLE:
            try:
                self.openai_client = openai.OpenAI(api_key=os.getenv('OPENAI_API_KEY'))
                self.ai_enabled = True
                logging.info("OpenAI client initialized successfully")
            except Exception as e:
                self.ai_enabled = False
                logging.warning(f"OpenAI initialization failed: {e}")
        else:
            self.openai_client = None
            self.ai_enabled = False
            
        # Load data
        self.tag_dna = self.load_tag_dna()
        self.usage_index = self.load_usage_index()
        self.metrics = self.load_metrics()
          # Performance tracking
        self.session_stats = {
            "tags_generated": 0,
            "embeddings_created": 0,
            "similarity_calculations": 0,
            "dna_updates": 0,
            "session_start": self.get_timestamp()        }
        
        logging.info("Tag Intelligence Engine v2.0 initialized successfully")
    
    def get_timestamp(self) -> str:
        """Get current timestamp in standard format."""
        return datetime.now().strftime(self.timestamp_format)
        
    def load_tag_dna(self) -> Dict:
        """Load tag DNA database from file with comprehensive error handling."""
        try:
            if os.path.exists(self.tag_dna_file):
                with open(self.tag_dna_file, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                    logging.debug(f"Loaded {len(data.get('tags', {}))} tags from DNA database")
                    return data
            else:
                logging.info("Tag DNA file does not exist - creating default structure")
        except json.JSONDecodeError as e:
            logging.error(f"Invalid JSON in tag DNA file: {e}")
        except Exception as e:
            logging.error(f"Failed to load tag DNA: {e}")
          # Return default structure on any error
        return {"tags": {}, "relationships": {}, "effectiveness": {}}
    
    def load_usage_index(self) -> Dict:
        """Load tag usage index from file with comprehensive error handling."""
        try:
            if os.path.exists(self.usage_index_file):
                with open(self.usage_index_file, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                    logging.debug("Loaded usage index successfully")
                    return data
            else:            logging.info("Usage index file does not exist - creating default structure")
        except json.JSONDecodeError as e:
            logging.error(f"Invalid JSON in usage index file: {e}")
        except Exception as e:
            logging.error(f"Failed to load usage index: {e}")
        
        return {"usage_stats": {}, "frequency_data": {}, "last_updated": self.get_timestamp()}
    
    def load_metrics(self) -> Dict:
        """Load agent metrics from file with comprehensive error handling."""
        try:
            if os.path.exists(self.metrics_file):
                with open(self.metrics_file, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                    logging.debug("Loaded metrics successfully")
                    return data
            else:
                logging.info("Metrics file does not exist - creating default structure")
        except json.JSONDecodeError as e:
            logging.error(f"Invalid JSON in metrics file: {e}")
        except Exception as e:
            logging.error(f"Failed to load metrics: {e}")
        
        return {"performance": {}, "accuracy": {}, "optimization": {}}
    
    def save_tag_dna(self):
        """Save tag DNA database to file with atomic writing and backup."""
        try:
            # Create backup if file exists
            if os.path.exists(self.tag_dna_file):
                backup_file = f"{self.tag_dna_file}.backup"
                import shutil
                shutil.copy2(self.tag_dna_file, backup_file)
            
            # Write to temporary file first (atomic operation)
            temp_file = f"{self.tag_dna_file}.tmp"
            with open(temp_file, 'w', encoding='utf-8') as f:
                json.dump(self.tag_dna, f, indent=2)
            
            # Move temp file to actual file (atomic on most filesystems)
            import os
            os.replace(temp_file, self.tag_dna_file)
            logging.debug("Tag DNA database saved successfully")
        except Exception as e:
            logging.error(f"Failed to save tag DNA: {e}")
            # Try to restore from backup if available
            backup_file = f"{self.tag_dna_file}.backup"
            if os.path.exists(backup_file):
                try:
                    import shutil
                    shutil.copy2(backup_file, self.tag_dna_file)
                    logging.info("Restored tag DNA from backup")
                except Exception as restore_e:
                    logging.error(f"Failed to restore from backup: {restore_e}")
    
    def save_usage_index(self):
        """Save usage index to file."""
        try:
            self.usage_index["last_updated"] = self.get_timestamp()
            with open(self.usage_index_file, 'w', encoding='utf-8') as f:
                json.dump(self.usage_index, f, indent=2)
        except Exception as e:
            logging.error(f"Failed to save usage index: {e}")
    
    def save_metrics(self):
        """Save metrics to file."""
        try:
            with open(self.metrics_file, 'w', encoding='utf-8') as f:
                json.dump(self.metrics, f, indent=2)
        except Exception as e:            logging.error(f"Failed to save metrics: {e}")
    
    def generate_semantic_tags(self, content: str, max_tags: int = 8) -> List[str]:
        """Generate semantic tags from content using AI or fallback methods."""
        # Input validation
        if not content or not content.strip():
            logging.warning("Empty content provided for tag generation")
            return ["empty_content"]
        
        if max_tags <= 0:
            logging.warning("Invalid max_tags value, using default of 8")
            max_tags = 8
        
        if self.ai_enabled:
            return self._generate_ai_tags(content, max_tags)
        else:
            return self._generate_fallback_tags(content, max_tags)
    
    def _generate_ai_tags(self, content: str, max_tags: int) -> List[str]:
        """Generate tags using OpenAI API."""
        try:
            response = self.openai_client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {
                        "role": "system", 
                        "content": "Extract 3-8 semantic tags from the content. Return only tags separated by commas. Focus on concepts, topics, and key themes."
                    },
                    {"role": "user", "content": f"Content: {content[:2000]}"}
                ],
                max_tokens=100,
                temperature=0.3
            )
            tags = [tag.strip() for tag in response.choices[0].message.content.split(',')]
            self.session_stats["tags_generated"] += len(tags)
            return tags[:max_tags]
        except Exception as e:
            logging.error(f"AI tag generation failed: {e}")
            return self._generate_fallback_tags(content, max_tags)
    
    def _generate_fallback_tags(self, content: str, max_tags: int) -> List[str]:
        """Generate tags using keyword extraction as fallback."""
        # Simple keyword-based tag generation
        keywords = []
        content_lower = content.lower()
        
        # Common technical terms
        tech_terms = ['python', 'javascript', 'api', 'database', 'server', 'client', 'function', 'class', 'method']
        for term in tech_terms:
            if term in content_lower:
                keywords.append(term)
          # Extract words that appear multiple times
        words = content_lower.split()
        word_freq = {}
        for word in words:
            if len(word) > 4:  # Only consider longer words
                word_freq[word] = word_freq.get(word, 0) + 1
        
        # Add frequently used words
        frequent_words = sorted(word_freq.items(), key=lambda x: x[1], reverse=True)[:5]
        keywords.extend([word for word, freq in frequent_words if freq > 1])
        
        return list(set(keywords))[:max_tags] or ["content_analysis"]
    
    def generate_embedding(self, text: str) -> List[float]:
        """Generate embeddings with comprehensive fallback."""
        if not self.ai_enabled:
            logging.warning("AI not enabled - returning zero vector")
            return [0.0] * 1536
            
        try:
            response = self.openai_client.embeddings.create(
                model="text-embedding-ada-002",
                input=text
            )
            self.session_stats["embeddings_created"] += 1
            return response.data[0].embedding
        except Exception as e:
            logging.error(f"Embedding generation failed: {e}")
            return [0.0] * 1536
    
    def create_tag_dna(self, tag: str, content: str, keywords: List[str]) -> Dict:
        embedding = self.generate_embedding(f"{tag} {' '.join(keywords)}")
        patterns = self.extract_context_patterns(content)
        
        return {
            "tag": tag,
            "semantic_vector": embedding,
            "related_keywords": keywords,
            "context_patterns": patterns,
            "usage_frequency": 1,
            "effectiveness_score": 0.5,
            "last_updated": datetime.now().strftime(self.timestamp_format),
            "created": datetime.now().strftime(self.timestamp_format)
        }
    
    def extract_context_patterns(self, content: str) -> List[str]:
        patterns = []
        lines = content.lower().split('\n')
        
        for line in lines[:20]:
            if any(keyword in line for keyword in ['error', 'exception', 'traceback']):
                patterns.append("error_context")
            if any(keyword in line for keyword in ['def ', 'class ', 'import ']):
                patterns.append("code_context")
            if any(keyword in line for keyword in ['todo', 'fix', 'bug']):
                patterns.append("task_context")
                
        return list(set(patterns))
    
    def find_similar_tags(self, query_embedding: List[float], threshold: float = 0.8) -> List[Tuple[str, float]]:
        similar_tags = []
        
        for tag, dna in self.tag_dna.get("tags", {}).items():
            if "semantic_vector" in dna:
                similarity = self.cosine_similarity(query_embedding, dna["semantic_vector"])
                if similarity >= threshold:
                    similar_tags.append((tag, similarity))
        
        return sorted(similar_tags, key=lambda x: x[1], reverse=True)
    
    def cosine_similarity(self, vec1: List[float], vec2: List[float]) -> float:
        """Calculate cosine similarity between two vectors."""
        try:
            if NUMPY_AVAILABLE:
                # Use numpy for efficient calculation
                vec1_np = np.array(vec1)
                vec2_np = np.array(vec2)
                return np.dot(vec1_np, vec2_np) / (np.linalg.norm(vec1_np) * np.linalg.norm(vec2_np))
            else:
                # Fallback implementation without numpy
                return self._cosine_similarity_fallback(vec1, vec2)
        except Exception as e:
            logging.error(f"Cosine similarity calculation failed: {e}")
            return 0.0
    
    def _cosine_similarity_fallback(self, vec1: List[float], vec2: List[float]) -> float:
        """Fallback cosine similarity calculation without numpy."""
        try:
            # Calculate dot product
            dot_product = sum(a * b for a, b in zip(vec1, vec2))
            
            # Calculate magnitudes
            magnitude1 = sum(a * a for a in vec1) ** 0.5
            magnitude2 = sum(b * b for b in vec2) ** 0.5
            
            if magnitude1 == 0 or magnitude2 == 0:
                return 0.0
                
            return dot_product / (magnitude1 * magnitude2)
        except Exception:            return 0.0
    
    def update_tag_effectiveness(self, tag: str, success: bool):
        """Update tag effectiveness with comprehensive validation and logging."""
        if not tag or not tag.strip():
            logging.warning("Empty tag provided for effectiveness update")
            return
        
        # Ensure tags section exists
        if "tags" not in self.tag_dna:
            self.tag_dna["tags"] = {}
        
        if tag in self.tag_dna["tags"]:
            current_score = self.tag_dna["tags"][tag].get("effectiveness_score", 0.5)
            usage_count = self.tag_dna["tags"][tag].get("usage_frequency", 1)
            
            # Adaptive learning rate based on usage count
            base_adjustment = 0.1 if success else -0.05
            learning_rate = max(0.01, 1.0 / (1.0 + usage_count * 0.1))
            adjustment = base_adjustment * learning_rate
            
            new_score = max(0.0, min(1.0, current_score + adjustment))
            
            self.tag_dna["tags"][tag]["effectiveness_score"] = new_score
            self.tag_dna["tags"][tag]["usage_frequency"] = usage_count + 1
            self.tag_dna["tags"][tag]["last_updated"] = self.get_timestamp()
            
            logging.debug(f"Updated tag '{tag}' effectiveness: {current_score:.3f} -> {new_score:.3f} (success: {success})")
            self.save_tag_dna()
        else:
            logging.warning(f"Tag '{tag}' not found in DNA database for effectiveness update")
    
    def suggest_tag_merges(self, similarity_threshold: float = 0.9) -> List[Tuple[str, str, float]]:
        suggestions = []
        tags = list(self.tag_dna.get("tags", {}).keys())
        
        for i, tag1 in enumerate(tags):
            for tag2 in tags[i+1:]:
                dna1 = self.tag_dna["tags"][tag1]
                dna2 = self.tag_dna["tags"][tag2]
                
                if "semantic_vector" in dna1 and "semantic_vector" in dna2:
                    similarity = self.cosine_similarity(dna1["semantic_vector"], dna2["semantic_vector"])
                    if similarity >= similarity_threshold:
                        suggestions.append((tag1, tag2, similarity))
        
        return sorted(suggestions, key=lambda x: x[2], reverse=True)
    
    def register_tag(self, tag: str, content: str, keywords: List[str] = None):
        if keywords is None:
            keywords = []
            
        if tag not in self.tag_dna.get("tags", {}):
            if "tags" not in self.tag_dna:
                self.tag_dna["tags"] = {}
                
            self.tag_dna["tags"][tag] = self.create_tag_dna(tag, content, keywords)
        else:
            self.tag_dna["tags"][tag]["usage_frequency"] += 1
            self.tag_dna["tags"][tag]["last_updated"] = datetime.now().strftime(self.timestamp_format)
        
        self.save_tag_dna()
    
    def get_tag_recommendations(self, content: str, existing_tags: List[str]) -> List[str]:
        content_embedding = self.generate_embedding(content[:1000])
        similar_tags = self.find_similar_tags(content_embedding, threshold=0.7)
        
        recommendations = []
        for tag, similarity in similar_tags[:5]:
            if tag not in existing_tags:
                recommendations.append(tag)
        
        return recommendations
    
    def get_engine_status(self) -> Dict[str, Any]:
        """Get comprehensive engine status and statistics."""
        return {
            "version": "2.0",
            "ai_enabled": self.ai_enabled,
            "numpy_available": NUMPY_AVAILABLE,
            "openai_available": OPENAI_AVAILABLE,
            "total_tags": len(self.tag_dna.get("tags", {})),
            "session_stats": self.session_stats,
            "files": {
                "tag_dna": os.path.exists(self.tag_dna_file),
                "usage_index": os.path.exists(self.usage_index_file),
                "metrics": os.path.exists(self.metrics_file)
            },
            "last_updated": self.get_timestamp()
        }
    
    def optimize_tag_database(self):
        """Optimize the tag database by removing ineffective tags and merging similar ones."""
        if not self.tag_dna.get("tags"):
            return
        
        optimization_log = []
        
        # Remove tags with very low effectiveness scores
        tags_to_remove = []
        for tag, dna in self.tag_dna["tags"].items():
            if dna.get("effectiveness_score", 0.5) < 0.2 and dna.get("usage_frequency", 0) < 3:
                tags_to_remove.append(tag)
        
        for tag in tags_to_remove:
            del self.tag_dna["tags"][tag]
            optimization_log.append(f"Removed ineffective tag: {tag}")
        
        # Suggest merges for similar tags
        merge_suggestions = self.suggest_tag_merges(0.95)
        for tag1, tag2, similarity in merge_suggestions[:5]:  # Only top 5 suggestions
            optimization_log.append(f"Merge suggestion: {tag1} + {tag2} (similarity: {similarity:.3f})")
        
        if optimization_log:
            logging.info(f"Tag database optimization complete: {len(optimization_log)} actions")
            self.save_tag_dna()
        
        return optimization_log
    
    def get_tag_relationships(self, tag: str, threshold: float = 0.7) -> List[Tuple[str, float]]:
        """Get related tags based on semantic similarity and co-occurrence."""
        if not tag or tag not in self.tag_dna.get("tags", {}):
            logging.warning(f"Tag '{tag}' not found for relationship analysis")
            return []
        
        relationships = []
        target_dna = self.tag_dna["tags"][tag]
        
        if "semantic_vector" not in target_dna:
            logging.warning(f"No semantic vector for tag '{tag}'")
            return []
        
        # Find semantically similar tags
        for other_tag, other_dna in self.tag_dna["tags"].items():
            if other_tag == tag or "semantic_vector" not in other_dna:
                continue
            
            similarity = self.cosine_similarity(
                target_dna["semantic_vector"], 
                other_dna["semantic_vector"]
            )
            
            if similarity >= threshold:
                # Weight by effectiveness scores
                effectiveness_weight = (
                    target_dna.get("effectiveness_score", 0.5) + 
                    other_dna.get("effectiveness_score", 0.5)
                ) / 2.0
                
                weighted_similarity = similarity * effectiveness_weight
                relationships.append((other_tag, weighted_similarity))
        
        return sorted(relationships, key=lambda x: x[1], reverse=True)
