
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
memory_indexer_agent.py

CommandCore Memory Indexer Agent

Advanced agent for creating and maintaining search indexes for the memory system.
Provides AI-powered full-text search capabilities with semantic tagging across all memory buckets.

Authority Level: INDEXING
Version: 2.0 (aligned with Core Logic v2.0)
"""

import os
import sys
import json
import logging
import hashlib
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Any, Optional, Tuple

# Add the root project directory to Python path for imports
project_root = Path(__file__).parent.parent.parent.parent.absolute()
if str(project_root) not in sys.path:
    sys.path.insert(0, str(project_root))

# Add parent directory for tag intelligence
sys.path.append(os.path.dirname(os.path.dirname(__file__)))

# Dynamic import of TagIntelligenceEngine with fallback
TagIntelligenceEngine = None
try:
    import importlib.util
    spec = importlib.util.spec_from_file_location(
        "tag_intelligence_engine", 
        os.path.join(os.path.dirname(__file__), "..", "tag_intelligence_engine", "tag_intelligence_engine.py")
    )
    if spec and spec.loader:
        tag_module = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(tag_module)
        TagIntelligenceEngine = tag_module.TagIntelligenceEngine
        logging.info("TagIntelligenceEngine imported successfully via importlib")
    else:
        raise ImportError("Could not load tag intelligence engine spec")
except Exception as e:
    logging.warning(f"Failed to import TagIntelligenceEngine via importlib: {e}")
    try:
        from memory.a_memory_core.tag_intelligence_engine.tag_intelligence_engine import TagIntelligenceEngine
        logging.info("TagIntelligenceEngine imported via fallback method")
    except ImportError as fallback_error:
        logging.error(f"Both import methods failed for TagIntelligenceEngine: {fallback_error}")
        TagIntelligenceEngine = None

# Configure logging for the indexer agent
logging.basicConfig(
    level=logging.INFO,
    format='[%(asctime)s] [%(levelname)s] %(message)s',
    datefmt='%m-%d_%I-%M%p'
)

class MemoryIndexerAgent:
    """
    CommandCore Memory Indexer Agent
    
    Advanced indexing system with AI-powered semantic analysis and tag intelligence.
    Creates searchable indexes with tag DNA for enhanced memory retrieval.
    
    Authority Level: INDEXING
    Version: 2.0 (aligned with Core Logic v2.0)
    """
    
    def __init__(self, base_path):
        self.base_path = base_path
        self.current_dir = os.path.dirname(__file__)
        self.state_path = os.path.join(self.current_dir, "memory_indexer_state.json")
        self.index_path = os.path.join(self.current_dir, "memory_index.json")
        self.interaction_log_path = os.path.join(self.current_dir, "agent_interactions.log")
        self.indexing_log_path = os.path.join(self.current_dir, "indexing_operations.log")
        
        # Global timestamp format (from Core Logic v2.0)
        self.mandatory_timestamp_format = "%m-%d_%I-%M%p"
        
        # Initialize AI tagging system
        if TagIntelligenceEngine:
            try:
                self.tag_engine = TagIntelligenceEngine()
                logging.info("TagIntelligenceEngine initialized successfully")
            except Exception as e:
                logging.error(f"Failed to initialize TagIntelligenceEngine: {e}")
                self.tag_engine = None
        else:
            logging.warning("TagIntelligenceEngine not available, AI tagging disabled")
            self.tag_engine = None
        
        # Memory directories to index
        self.memory_directories = [
            os.path.join(base_path, "memory", "b_long_term_memory"),
            os.path.join(base_path, "memory", "c_short_term_memory"),
            os.path.join(base_path, "memory", "d_working_memory"),
            os.path.join(base_path, "memory", "e_procedural"),
            os.path.join(base_path, "memory", "f_semantic"),
            os.path.join(base_path, "memory", "g_episodic")
        ]
        
        self.load_state()
        self.load_index()
        logging.info(f"MemoryIndexerAgent initialized")

    def load_state(self):
        """Load agent state from JSON file."""
        try:
            if os.path.exists(self.state_path):
                with open(self.state_path, "r", encoding="utf-8") as f:
                    self.state = json.load(f)
            else:
                self.state = self._create_default_state()
                self.save_state()
            logging.info("State loaded successfully")
        except Exception as e:
            logging.error(f"Error loading state: {e}")
            self.state = self._create_default_state()

    def _create_default_state(self):
        """Create default state configuration."""
        return {
            "total_files_indexed": 0,
            "last_index_update": "",
            "indexing_operations": 0,
            "files_by_type": {},
            "memory_bucket_stats": {},
            "performance_metrics": {
                "average_index_time_ms": 0,
                "last_index_time_ms": 0,
                "index_size_mb": 0
            },
            "error_count": 0,
            "last_error": "",
            "file_hashes": {}
        }

    def save_state(self):
        """Save state to JSON file with atomic writing."""
        try:
            # Use atomic writing to prevent corruption
            temp_path = self.state_path + ".tmp"
            with open(temp_path, "w", encoding="utf-8") as f:
                json.dump(self.state, f, indent=4)
            
            # Atomic move
            if os.path.exists(self.state_path):
                os.remove(self.state_path)
            os.rename(temp_path, self.state_path)
            
        except Exception as e:
            logging.error(f"Error saving state: {e}")
            # Cleanup temp file if it exists
            if os.path.exists(self.state_path + ".tmp"):
                try:
                    os.remove(self.state_path + ".tmp")
                except:
                    pass

    def load_index(self):
        """Load the memory index."""
        try:
            if os.path.exists(self.index_path):
                with open(self.index_path, "r", encoding="utf-8") as f:
                    self.memory_index = json.load(f)
            else:
                self.memory_index = self._create_default_index()
                self.save_index()
            logging.info(f"Index loaded with {len(self.memory_index.get('files', []))} files")
        except Exception as e:
            logging.error(f"Error loading index: {e}")
            self.memory_index = self._create_default_index()

    def _create_default_index(self):
        """Create default index structure."""
        return {
            "index_metadata": {
                "created": datetime.now().strftime("%m-%d_%I-%M%p"),
                "last_updated": "",
                "version": "2.0.0",
                "total_files": 0,
                "ai_tagging_enabled": True
            },
            "files": [],
            "tags": {},
            "ai_tags": {},
            "semantic_embeddings": {},
            "tag_relationships": {},
            "content_types": {},
            "memory_buckets": {}
        }

    def save_index(self):
        """Save the memory index with atomic writing."""
        try:
            self.memory_index["index_metadata"]["last_updated"] = datetime.now().strftime("%m-%d_%I-%M%p")
            
            # Use atomic writing to prevent corruption
            temp_path = self.index_path + ".tmp"
            with open(temp_path, "w", encoding="utf-8") as f:
                json.dump(self.memory_index, f, indent=4)
            
            # Atomic move
            if os.path.exists(self.index_path):
                os.remove(self.index_path)
            os.rename(temp_path, self.index_path)
            
        except Exception as e:
            logging.error(f"Error saving index: {e}")
            # Cleanup temp file if it exists
            if os.path.exists(self.index_path + ".tmp"):
                try:
                    os.remove(self.index_path + ".tmp")
                except:
                    pass

    def log_interaction(self, action: str, result: str = ""):
        """Log agent interactions with standardized timestamp format."""
        timestamp = datetime.now().strftime("%m-%d_%I-%M%p")
        log_entry = f"[{timestamp}] [MemoryIndexerAgent] {action} — {result}\n"
        
        try:
            with open(self.interaction_log_path, "a", encoding="utf-8") as log_file:
                log_file.write(log_entry)
        except Exception as e:
            logging.error(f"Error writing to interaction log: {e}")

    def log_indexing_operation(self, operation: str, file_path: str, details: str = ""):
        """Log indexing operations."""
        timestamp = datetime.now().strftime("%m-%d_%I-%M%p")
        log_entry = f"[{timestamp}] {operation}: {file_path} | {details}\n"
        
        try:
            with open(self.indexing_log_path, "a", encoding="utf-8") as log_file:
                log_file.write(log_entry)
        except Exception as e:
            logging.error(f"Error writing to indexing log: {e}")

    def calculate_file_hash(self, file_path: str) -> str:
        """Calculate hash of file content for change detection."""
        try:
            with open(file_path, "rb") as f:
                return hashlib.md5(f.read()).hexdigest()
        except Exception as e:
            logging.error(f"Error calculating hash for {file_path}: {e}")
            return ""

    def extract_tags_from_content(self, content: str) -> list:
        """Extract semantic tags from file content."""
        tags = []
        lines = content.split('\n')
        
        # Extract manual tags from first 10 lines
        for line in lines[:10]:
            line = line.strip()
            if line.startswith('tags:') or line.startswith('Tags:'):
                tag_part = line.split(':', 1)[1].strip()
                file_tags = [tag.strip() for tag in tag_part.split(',')]
                tags.extend(file_tags)
            elif line.startswith('type:') or line.startswith('Type:'):
                type_tag = line.split(':', 1)[1].strip()
                tags.append(f"type:{type_tag}")
            elif line.startswith('tier:') or line.startswith('Tier:'):
                tier_tag = line.split(':', 1)[1].strip()
                tags.append(f"tier:{tier_tag}")
        
        # Generate AI semantic tags
        if self.tag_engine:
            try:
                semantic_tags = self.tag_engine.generate_semantic_tags(content[:2000])
                for tag in semantic_tags:
                    if tag and tag not in tags:
                        tags.append(tag)
                        # Register tag in DNA system
                        self.tag_engine.register_tag(tag, content, [])
            except Exception as e:
                logging.warning(f"AI tag generation failed: {e}")
        else:
            logging.debug("AI tagging disabled - tag_engine not available")
        
        return tags

    def get_memory_bucket(self, file_path: str) -> str:
        """Determine which memory bucket a file belongs to."""
        for bucket_dir in self.memory_directories:
            if file_path.startswith(bucket_dir):
                return os.path.basename(bucket_dir)
        return "unknown"

    def index_file(self, file_path: str) -> dict:
        """Index a single file and return its metadata."""
        try:
            # Read file content
            with open(file_path, "r", encoding="utf-8") as f:
                content = f.read()
            
            # Calculate file hash for change detection
            file_hash = self.calculate_file_hash(file_path)
            
            # Extract metadata
            file_stats = os.stat(file_path)
            memory_bucket = self.get_memory_bucket(file_path)
            tags = self.extract_tags_from_content(content)
            
            # Generate semantic embedding for the file
            content_embedding = []
            if self.tag_engine:
                try:
                    content_embedding = self.tag_engine.generate_embedding(content[:1000])
                except Exception as e:
                    logging.warning(f"Embedding generation failed for {file_path}: {e}")
            else:
                logging.debug("Embedding generation skipped - tag_engine not available")
            
            # Create file entry
            file_entry = {
                "path": file_path,
                "filename": os.path.basename(file_path),
                "size_bytes": file_stats.st_size,
                "modified_time": datetime.fromtimestamp(file_stats.st_mtime).strftime("%m-%d_%I-%M%p"),
                "indexed_time": datetime.now().strftime("%m-%d_%I-%M%p"),
                "memory_bucket": memory_bucket,
                "content_preview": content[:200] + "..." if len(content) > 200 else content,
                "content_length": len(content),
                "tags": tags,
                "semantic_embedding": content_embedding,
                "file_hash": file_hash,
                "file_type": os.path.splitext(file_path)[1]
            }
            
            # Update statistics
            file_type = file_entry["file_type"]
            self.state["files_by_type"][file_type] = self.state["files_by_type"].get(file_type, 0) + 1
            self.state["memory_bucket_stats"][memory_bucket] = self.state["memory_bucket_stats"].get(memory_bucket, 0) + 1
            
            # Store file hash for change detection
            self.state["file_hashes"][file_path] = file_hash
            
            self.log_indexing_operation("INDEXED", file_path, f"Size: {file_stats.st_size} bytes, Tags: {len(tags)}")
            return file_entry
            
        except Exception as e:
            logging.error(f"Error indexing file {file_path}: {e}")
            self.state["error_count"] += 1
            self.state["last_error"] = str(e)
            return None

    def has_file_changed(self, file_path: str) -> bool:
        """Check if a file has changed since last indexing."""
        if file_path not in self.state["file_hashes"]:
            return True  # New file
        
        current_hash = self.calculate_file_hash(file_path)
        return current_hash != self.state["file_hashes"][file_path]

    def rebuild_full_index(self) -> int:
        """Rebuild the complete memory index."""
        start_time = datetime.now()
        
        try:
            self.log_interaction("Starting full index rebuild", "")
            
            # Reset index
            self.memory_index = self._create_default_index()
            indexed_files = []
            
            # Scan all memory directories
            for memory_dir in self.memory_directories:
                if os.path.exists(memory_dir):
                    for root, dirs, files in os.walk(memory_dir):
                        for file in files:
                            if file.endswith(('.txt', '.md', '.json', '.log')):
                                file_path = os.path.join(root, file)
                                file_entry = self.index_file(file_path)
                                if file_entry:
                                    indexed_files.append(file_entry)
            
            # Update index
            self.memory_index["files"] = indexed_files
            self.memory_index["index_metadata"]["total_files"] = len(indexed_files)
            
            # Build AI tag index
            self._build_ai_tag_index()
            # Build tag index
            self._build_tag_index()
            
            # Update performance metrics
            index_time = (datetime.now() - start_time).total_seconds() * 1000
            self.state["performance_metrics"]["last_index_time_ms"] = index_time
            self.state["total_files_indexed"] = len(indexed_files)
            self.state["indexing_operations"] += 1
            self.state["last_index_update"] = datetime.now().strftime("%m-%d_%I-%M%p")
            
            # Save everything
            self.save_index()
            self.save_state()
            
            self.log_interaction("Full index rebuild complete", f"{len(indexed_files)} files indexed")
            logging.info(f"Index rebuild complete: {len(indexed_files)} files indexed in {index_time:.2f}ms")
            
            return len(indexed_files)
            
        except Exception as e:
            self.state["error_count"] += 1
            self.state["last_error"] = str(e)
            self.save_state()
            logging.error(f"Error rebuilding index: {e}")
            return 0

    def update_index(self, file_path: str = None) -> bool:
        """Update index for a specific file or check for changes."""
        try:
            if file_path:
                # Update specific file
                if os.path.exists(file_path) and self.has_file_changed(file_path):
                    file_entry = self.index_file(file_path)
                    if file_entry:
                        # Update or add file in index
                        existing_files = [f for f in self.memory_index["files"] if f["path"] != file_path]
                        existing_files.append(file_entry)
                        self.memory_index["files"] = existing_files
                        self._build_tag_index()
                        self.save_index()
                        self.save_state()
                        self.log_interaction("File index updated", file_path)
                        return True
            else:
                # Check for changes across all indexed files
                changes_found = 0
                for file_data in self.memory_index["files"][:]:
                    file_path = file_data["path"]
                    if not os.path.exists(file_path):
                        # File was deleted
                        self.memory_index["files"] = [f for f in self.memory_index["files"] if f["path"] != file_path]
                        changes_found += 1
                        self.log_indexing_operation("REMOVED", file_path, "File deleted")
                    elif self.has_file_changed(file_path):
                        # File was modified
                        file_entry = self.index_file(file_path)
                        if file_entry:
                            self.memory_index["files"] = [f for f in self.memory_index["files"] if f["path"] != file_path]
                            self.memory_index["files"].append(file_entry)
                            changes_found += 1
                
                if changes_found > 0:
                    self._build_ai_tag_index()
                    self._build_tag_index()
                    self.save_index()
                    self.save_state()
                    self.log_interaction("Index updated", f"{changes_found} files changed")
                    return True
            
            return False
            
        except Exception as e:
            logging.error(f"Error updating index: {e}")
            return False

    def _build_tag_index(self):
        """Build reverse index of tags to files."""
        tag_index = {}
        content_types = {}
        bucket_stats = {}
        
        for file_data in self.memory_index["files"]:
            # Index tags
            for tag in file_data.get("tags", []):
                if tag not in tag_index:
                    tag_index[tag] = []
                tag_index[tag].append(file_data["path"])
            
            # Index content types
            file_type = file_data.get("file_type", "unknown")
            content_types[file_type] = content_types.get(file_type, 0) + 1
            
            # Index memory buckets
            bucket = file_data.get("memory_bucket", "unknown")
            bucket_stats[bucket] = bucket_stats.get(bucket, 0) + 1
        
        self.memory_index["tags"] = tag_index
        self.memory_index["content_types"] = content_types
        self.memory_index["memory_buckets"] = bucket_stats

    def _build_ai_tag_index(self):
        """Build AI-powered semantic tag relationships."""
        ai_tag_index = {}
        semantic_embeddings = {}
        tag_relationships = {}
        
        for file_data in self.memory_index["files"]:
            file_path = file_data["path"]
            
            # Store semantic embeddings
            if "semantic_embedding" in file_data and file_data["semantic_embedding"]:
                semantic_embeddings[file_path] = file_data["semantic_embedding"]
            
            # Index AI-generated tags
            for tag in file_data.get("tags", []):
                if tag not in ai_tag_index:
                    ai_tag_index[tag] = {
                        "files": [],
                        "usage_count": 0,
                        "effectiveness_score": 0.5,
                        "related_tags": []
                    }
                ai_tag_index[tag]["files"].append(file_path)
                ai_tag_index[tag]["usage_count"] += 1
        
        # Build tag relationships using similarity
        for tag1 in ai_tag_index:
            for tag2 in ai_tag_index:
                if tag1 != tag2:
                    common_files = set(ai_tag_index[tag1]["files"]) & set(ai_tag_index[tag2]["files"])
                    if len(common_files) > 0:
                        relationship_strength = len(common_files) / max(len(ai_tag_index[tag1]["files"]), len(ai_tag_index[tag2]["files"]))
                        if relationship_strength > 0.3:
                            if tag1 not in tag_relationships:
                                tag_relationships[tag1] = []
                            tag_relationships[tag1].append({
                                "tag": tag2,
                                "strength": relationship_strength,
                                "common_files": len(common_files)
                            })
        
        # Update index
        self.memory_index["ai_tags"] = ai_tag_index
        self.memory_index["semantic_embeddings"] = semantic_embeddings
        self.memory_index["tag_relationships"] = tag_relationships
        
        logging.info(f"AI tag index built: {len(ai_tag_index)} unique tags, {len(tag_relationships)} relationships")

    def _semantic_search(self, query_embedding, query_text):
        """Perform semantic search using embeddings."""
        semantic_results = []
        
        if not self.tag_engine:
            return semantic_results
        
        for file_path, embedding in self.memory_index.get("semantic_embeddings", {}).items():
            if embedding:
                try:
                    similarity = self.tag_engine.cosine_similarity(query_embedding, embedding)
                    if similarity > 0.6:  # Threshold for semantic similarity
                        # Find the file data
                        file_data = next((f for f in self.memory_index["files"] if f["path"] == file_path), None)
                        if file_data:
                            result = file_data.copy()
                            result["relevance_score"] = similarity * 15  # Boost semantic matches
                            result["match_type"] = "semantic"
                            semantic_results.append(result)
                except Exception as e:
                    logging.warning(f"Error calculating similarity for {file_path}: {e}")
        
        return semantic_results

    def search_index(self, query: str, max_results: int = 20) -> list:
        """Search the memory index for files matching the query."""
        try:
            results = []
            query_lower = query.lower()
            
            # Try AI-powered semantic search first
            if self.tag_engine:
                try:
                    query_embedding = self.tag_engine.generate_embedding(query)
                    semantic_results = self._semantic_search(query_embedding, query_lower)
                    results.extend(semantic_results)
                except Exception as e:
                    logging.warning(f"Semantic search failed, falling back to keyword search: {e}")
            
            # Keyword search for files not already found semantically
            semantic_paths = [r["path"] for r in results if "path" in r]
            
            for file_data in self.memory_index["files"]:
                if file_data["path"] in semantic_paths:
                    continue  # Skip files already found by semantic search
                
                score = 0
                
                # Check filename match
                if query_lower in file_data["filename"].lower():
                    score += 10
                
                # Check content preview match
                if query_lower in file_data["content_preview"].lower():
                    score += 5
                
                # Check tag matches
                for tag in file_data.get("tags", []):
                    if query_lower in tag.lower():
                        score += 8
                
                # Check memory bucket match
                if query_lower in file_data.get("memory_bucket", "").lower():
                    score += 3
                
                if score > 0:
                    result = file_data.copy()
                    result["relevance_score"] = score
                    result["match_type"] = "keyword"
                    results.append(result)
            
            # Sort by relevance score
            results.sort(key=lambda x: x.get("relevance_score", 0), reverse=True)
            
            self.log_interaction("Search performed", f"Query: {query}, Results: {len(results[:max_results])}")
            return results[:max_results]
            
        except Exception as e:
            logging.error(f"Error searching index: {e}")
            return []

    def get_index_statistics(self) -> dict:
        """Get comprehensive statistics about the index."""
        return {
            "state": self.state,
            "index_metadata": self.memory_index.get("index_metadata", {}),
            "total_files": len(self.memory_index.get("files", [])),
            "content_types": self.memory_index.get("content_types", {}),
            "memory_buckets": self.memory_index.get("memory_buckets", {}),
            "total_tags": len(self.memory_index.get("tags", {}))
        }

def main(auto_start=False, file_path=None, rebuild=False, continuous=False):
    """Main entry point for the Memory Indexer Agent."""
    # Determine base path dynamically
    current_dir = Path(__file__).parent.absolute()
    base_path = current_dir.parent.parent.parent  # Go up to commandcore-helper root
    
    logging.info(f"Memory Indexer Agent starting with base_path: {base_path}")
    
    # Initialize the indexer agent
    indexer_agent = MemoryIndexerAgent(str(base_path))
    
    if rebuild:
        # Force rebuild of entire index
        file_count = indexer_agent.rebuild_full_index()
        print(f"Index rebuilt: {file_count} files indexed")
        return file_count
    elif file_path:
        # Index specific file
        success = indexer_agent.update_index(file_path)
        print(f"File indexing {'successful' if success else 'failed'}: {file_path}")
        return success
    elif continuous:
        # CONTINUOUS MODE - Keep running and update index every 5 minutes
        logging.info("🧠 MEMORY INDEXER: Starting continuous vectoring mode")
        indexer_agent.log_interaction("Continuous mode started", "Vector database monitoring active")
        
        # Initial index update
        indexer_agent.update_index()
        stats = indexer_agent.get_index_statistics()
        logging.info(f"Initial index: {stats['total_files']} files, {stats['total_tags']} tags")
        
        try:
            while True:
                time.sleep(300)  # Wait 5 minutes
                
                logging.info("🔄 Updating vector database...")
                start_time = datetime.now()
                
                # Check for changes and update
                changes_found = indexer_agent.update_index()
                
                if changes_found:
                    stats = indexer_agent.get_index_statistics()
                    update_time = (datetime.now() - start_time).total_seconds()
                    
                    logging.info(f"✅ Vector DB updated: {stats['total_files']} files, {stats['total_tags']} tags ({update_time:.2f}s)")
                    indexer_agent.log_interaction("Vector database updated", 
                        f"Files: {stats['total_files']}, Tags: {stats['total_tags']}, Time: {update_time:.2f}s")
                else:
                    logging.debug("No changes detected in memory system")
                
        except KeyboardInterrupt:
            logging.info("🛑 Memory Indexer stopped by user")
            indexer_agent.log_interaction("Continuous mode stopped", "Vector database monitoring ended")
        except Exception as e:
            logging.error(f"Error in continuous mode: {e}")
            indexer_agent.log_interaction("Continuous mode error", str(e))
            
        return indexer_agent
    elif auto_start:
        # Auto-start mode - check for changes and update if needed
        success = indexer_agent.update_index()
        stats = indexer_agent.get_index_statistics()
        logging.info(f"Index check complete. Total files: {stats['total_files']}")
        indexer_agent.log_interaction("Auto-start complete", f"Index has {stats['total_files']} files")
    else:
        # Manual mode - show statistics
        stats = indexer_agent.get_index_statistics()
        print(f"Memory Index Statistics:")
        print(f"Total files: {stats['total_files']}")
        print(f"Content types: {stats['content_types']}")
        print(f"Memory buckets: {stats['memory_buckets']}")
        print(f"Total tags: {stats['total_tags']}")
    
    return indexer_agent

if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description='Memory Indexer Agent - Smart Vector Database')
    parser.add_argument('--rebuild', action='store_true', help='Rebuild entire index')
    parser.add_argument('--file', type=str, help='Index specific file')
    parser.add_argument('--auto-start', action='store_true', help='Auto-start mode')
    parser.add_argument('--continuous', action='store_true', help='Continuous vector database monitoring (updates every 5 minutes)')
    
    args = parser.parse_args()
    
    # Default to continuous mode when run without arguments
    if not any([args.rebuild, args.file, args.auto_start, args.continuous]):
        args.continuous = True
    
    main(auto_start=args.auto_start, file_path=args.file, rebuild=args.rebuild, continuous=args.continuous)
