
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
import os
import sys
import json
import re
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

# Configure logging for the context router agent
logging.basicConfig(
level=logging.INFO,
format='[%(asctime)s] [%(levelname)s] %(message)s',
datefmt='%m-%d_%I-%M%p'
)

class MemoryContextRouterAgent:
"""
CommandCore Memory Context Router Agent
 
Advanced context routing with AI-powered semantic analysis and tagging intelligence.
Routes memory requests based on content semantics and user intent patterns.
 
Authority Level: CONTEXT_ROUTING
Version: 2.0 (aligned with Core Logic v2.0)
"""
 
    def __init__(self, base_path):
        self.base_path = base_path
        self.current_dir = os.path.dirname(__file__)
        self.state_path = os.path.join(self.current_dir, "memory_context_router_agent_state.json")
        self.interaction_log_path = os.path.join(self.current_dir, "agent_interactions.log")
        self.context_log_path = os.path.join(self.current_dir, "context_routing.log")
        # Global timestamp format (from Core Logic v2.0)
        self.mandatory_timestamp_format = "%m-%d_%I-%M%p"
        
        # Initialize AI tagging and search system
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
        self.load_logic_config()
        
        # Set up paths for memory access
        self.chat_index_path = os.path.join(base_path, "memory", "b_long_term_memory", "chat_index.json")
        self.full_chat_logs_dir = os.path.join(base_path, "memory", "b_long_term_memory", "full_chat", "full_chat_logs")
        self.working_memory_dir = os.path.join(base_path, "memory", "d_working_memory")
        self.semantic_memory_dir = os.path.join(base_path, "memory", "f_semantic")
        
        self.load_state()
        logging.info(f"MemoryContextRouterAgent initialized - Version 2.0 with AI tagging enabled")

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
            "total_context_requests": 0,
            "successful_injections": 0,
            "failed_injections": 0,
            "last_context_injection": "",
            "context_sources_used": {},
            "performance_metrics": {
                "average_context_time_ms": 0,
                "last_context_time_ms": 0,
                "average_context_size_chars": 0
            },
            "search_statistics": {
                "semantic_searches": 0,
                "tag_matches_found": 0,
                "files_processed": 0
            },
            "error_count": 0,
            "last_error": ""
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

    def log_interaction(self, action: str, result: str = ""):
        """Log agent interactions with standardized timestamp format."""
        timestamp = datetime.now().strftime("%m-%d_%I-%M%p")
        log_entry = f"[{timestamp}] [MemoryContextRouterAgent] {action} -- {result}\n"
        
        try:
            with open(self.interaction_log_path, "a", encoding="utf-8") as log_file:
                log_file.write(log_entry)
        except Exception as e:
            logging.error(f"Error writing to interaction log: {e}")

    def log_context_routing(self, user_prompt: str, context_size: int, sources: list):
        """Log context routing decisions."""
        timestamp = datetime.now().strftime("%m-%d_%I-%M%p")
        log_entry = f"[{timestamp}] Context injected - Prompt: {user_prompt[:100]}{'...' if len(user_prompt) > 100 else ''} | Context size: {context_size} chars | Sources: {', '.join(sources)}\n"
        
        try:
            with open(self.context_log_path, "a", encoding="utf-8") as log_file:
                log_file.write(log_entry)
        except Exception as e:
            logging.error(f"Error writing to context log: {e}")

    def load_json_safe(self, file_path: str) -> dict:
        """Safely load JSON file with error handling."""
        try:
            if os.path.exists(file_path):
                with open(file_path, "r", encoding="utf-8") as f:
                    return json.load(f)
            else:
                logging.warning(f"JSON file not found: {file_path}")
                return {}
        except Exception as e:
            logging.error(f"Error loading JSON file {file_path}: {e}")
            return {}

    def load_text_safe(self, file_path: str) -> list:
        """Safely load text file with error handling."""
        try:
            if os.path.exists(file_path):
                with open(file_path, "r", encoding="utf-8") as f:
                    return f.readlines()
            else:
                logging.warning(f"Text file not found: {file_path}")
                return []
        except Exception as e:
            logging.error(f"Error loading text file {file_path}: {e}")
            return []

    def semantic_tag_search(self, user_prompt: str) -> list:
        """Enhanced semantic search using AI tagging system."""
        try:
            self.state["search_statistics"]["semantic_searches"] += 1
            matches = []
            sources_checked = []
            
            # Generate query embedding for semantic similarity
            if self.tag_engine:
                try:
                    query_embedding = self.tag_engine.generate_embedding(user_prompt)
                    semantic_matches = self.tag_engine.find_similar_tags(query_embedding, threshold=0.7)
                    
                    for tag, similarity in semantic_matches:
                        matches.append({
                            "source": "ai_semantic",
                            "tag": tag,
                            "similarity_score": similarity,
                            "match_type": "semantic_embedding"
                        })
                        
                    sources_checked.append("ai_semantic_engine")
                except Exception as e:
                    logging.warning(f"AI semantic search failed: {e}")
                    
            # Search in chat index if available
            chat_index = self.load_json_safe(self.chat_index_path)
            if chat_index:
                sources_checked.append("chat_index")
                tags = chat_index.get("tags", [])
                for tag in tags:
                    if any(word.lower() in tag.lower() for word in user_prompt.split()):
                        matches.append(tag)
                        
            # Search in semantic memory directory
            if os.path.exists(self.semantic_memory_dir):
                sources_checked.append("semantic_memory")
                for file_name in os.listdir(self.semantic_memory_dir):
                    if file_name.endswith(('.txt', '.md', '.json')):
                        if any(word.lower() in file_name.lower() for word in user_prompt.split()):
                            matches.append(file_name.replace('.txt', '').replace('.md', '').replace('.json', ''))
                            
            # Search in working memory for recent context
            if os.path.exists(self.working_memory_dir):
                sources_checked.append("working_memory")
                for file_name in os.listdir(self.working_memory_dir):
                    if file_name.endswith(('.txt', '.md')):
                        if any(word.lower() in file_name.lower() for word in user_prompt.split()):
                            matches.append(file_name.replace('.txt', '').replace('.md', ''))
                            
            self.state["search_statistics"]["tag_matches_found"] += len(matches)
            for source in sources_checked:
                self.state["context_sources_used"][source] = self.state["context_sources_used"].get(source, 0) + 1
                
            logging.info(f"Found {len(matches)} semantic matches from {len(sources_checked)} sources")
            return matches[:50]  # Limit results
            
        except Exception as e:
            logging.error(f"Error in semantic tag search: {e}")
            self.state["error_count"] += 1
            self.state["last_error"] = str(e)
            return []

    def load_relevant_content(self, matches: list, user_prompt: str = "") -> str:
        """Load content based on matches with AI-powered relevance ranking."""
        try:
            content_blocks = []
            max_content_chars = self.logic_config.get("context_injection_logic", {}).get("summarization", {}).get("max_context_chars", 3000)
            current_chars = 0
            files_processed = 0
            
            # Sort matches by relevance if AI tagging is enabled
            if self.logic_config.get("ai_tagging_system", {}).get("enabled", False) and hasattr(self, '_rank_by_relevance'):
                matches = self._rank_by_relevance(matches, user_prompt)
                
            for match in matches[:10]:  # Limit to top 10 matches
                if current_chars >= max_content_chars:
                    break
                    
                # Handle different match types
                if isinstance(match, dict):
                    content = self._load_content_by_match_type(match)
                    if content:
                        content_blocks.append(f"[{match.get('source', 'unknown')}] {content[:500]}...")
                        current_chars += len(content)
                        files_processed += 1
                        
                    # Update tag effectiveness if this is an AI tag
                    if match.get("match_type") == "semantic_embedding" and self.tag_engine:
                        self.tag_engine.update_tag_effectiveness(match.get("tag", ""), True)
                else:
                    # Legacy string-based match - try different file locations
                    content = None
                    
                    # Try full chat logs first
                    chat_file = os.path.join(self.full_chat_logs_dir, f"{match}.md")
                    if not os.path.exists(chat_file):
                        chat_file = os.path.join(self.full_chat_logs_dir, f"{match}.txt")
                        
                    if os.path.exists(chat_file):
                        lines = self.load_text_safe(chat_file)
                        if lines:
                            content = f"=== {match} ===\n{''.join(lines[:100])}\n"  # First 100 lines
                            
                    if not content:
                        # Try semantic memory
                        semantic_file = os.path.join(self.semantic_memory_dir, f"{match}.md")
                        if not os.path.exists(semantic_file):
                            semantic_file = os.path.join(self.semantic_memory_dir, f"{match}.txt")
                            
                        if os.path.exists(semantic_file):
                            lines = self.load_text_safe(semantic_file)
                            if lines:
                                content = f"=== {match} (semantic) ===\n{''.join(lines[:50])}\n"
                                
                    if not content:
                        # Try working memory
                        working_file = os.path.join(self.working_memory_dir, f"{match}.md")
                        if not os.path.exists(working_file):
                            working_file = os.path.join(self.working_memory_dir, f"{match}.txt")
                            
                        if os.path.exists(working_file):
                            lines = self.load_text_safe(working_file)
                            if lines:
                                content = f"=== {match} (working) ===\n{''.join(lines[:25])}\n"
                                
                    if content:
                        content_blocks.append(content)
                        current_chars += len(content)
                        files_processed += 1
                        
            self.state["search_statistics"]["files_processed"] += files_processed
            result = "\n\n---\n\n".join(content_blocks)
            
            logging.info(f"Loaded {len(content_blocks)} content blocks from {files_processed} files ({current_chars} chars)")
            return result
            
        except Exception as e:
            logging.error(f"Error loading relevant content: {e}")
            return "Error loading content"

def generate_context_summary(self, content: str, max_chars: int = 2000) -> str:
"""Generate a summary of the loaded content."""
try:
if not content:
return "No relevant context found."
 
# If content is short enough, return as-is
if len(content) <= max_chars:
return content
 
# Simple summarization - extract key sections
lines = content.split('\n')
summary_lines = []
current_chars = 0
 
for line in lines:
if current_chars + len(line) > max_chars:
break
summary_lines.append(line)
current_chars += len(line)
 
summary = '\n'.join(summary_lines)
if len(summary) < len(content):
summary += f"\n\n[Context truncated - showing {len(summary)} of {len(content)} total characters]"
 
return summary
 
except Exception as e:
logging.error(f"Error generating context summary: {e}")
return "Error generating context summary."

def inject_memory_context(self, user_prompt: str, max_context_chars: int = 3000) -> dict:
"""Main function to inject memory context into user prompt."""
start_time = datetime.now()
 
try:
self.state["total_context_requests"] += 1
 
# Search for relevant content
matches = self.semantic_tag_search(user_prompt)
 
if not matches:
# No matches found
result = {
"user_prompt": user_prompt,
"injected_memory": "No relevant context found in memory.",
"full_request": f"USER PROMPT:\n{user_prompt}\n\nCONTEXT:\nNo relevant context found in memory.",
"context_metadata": {
"matches_found": 0,
"sources_used": [],
"context_size_chars": 0
}
}
self.log_interaction("Context injection", "No relevant context found")
return result
 
# Load and summarize relevant content
relevant_content = self.load_relevant_content(matches)
context_summary = self.generate_context_summary(relevant_content, max_context_chars)
 
# Build final prompt with context
full_request = f"USER PROMPT:\n{user_prompt}\n\nRELEVANT MEMORY CONTEXT:\n{context_summary}"
 
result = {
"user_prompt": user_prompt,
"injected_memory": context_summary,
"full_request": full_request,
"context_metadata": {
"matches_found": len(matches),
"sources_used": list(self.state["context_sources_used"].keys()),
"context_size_chars": len(context_summary),
"processing_time_ms": (datetime.now() - start_time).total_seconds() * 1000
}
}
 
# Update performance metrics
processing_time = result["context_metadata"]["processing_time_ms"]
self.state["performance_metrics"]["last_context_time_ms"] = processing_time
self.state["performance_metrics"]["average_context_size_chars"] = len(context_summary)
self.state["successful_injections"] += 1
self.state["last_context_injection"] = datetime.now().strftime("%m-%d_%I-%M%p")
 
self.save_state()
 
# Log the context routing
self.log_context_routing(user_prompt, len(context_summary), result["context_metadata"]["sources_used"])
self.log_interaction("Context injection successful", f"{len(matches)} matches, {len(context_summary)} chars")
 
logging.info(f"Context injection successful: {len(matches)} matches, {len(context_summary)} chars")
return result
 
except Exception as e:
self.state["failed_injections"] += 1
self.state["error_count"] += 1
self.state["last_error"] = str(e)
self.save_state()
 
logging.error(f"Error injecting memory context: {e}")
self.log_interaction("Context injection failed", str(e))
 
# Return fallback response
return {
"user_prompt": user_prompt,
"injected_memory": f"Error loading context: {str(e)}",
"full_request": f"USER PROMPT:\n{user_prompt}\n\nCONTEXT:\nError loading relevant context.",
"context_metadata": {
"matches_found": 0,
"sources_used": [],
"context_size_chars": 0,
"error": str(e)
}
}

def get_performance_metrics(self) -> dict:
"""Get performance metrics for the context router agent."""
success_rate = 0
if self.state["total_context_requests"] > 0:
success_rate = (self.state["successful_injections"] / self.state["total_context_requests"]) * 100
 
return {
"state": self.state,
"success_rate": success_rate,
"total_requests": self.state["total_context_requests"],
"average_context_size": self.state["performance_metrics"]["average_context_size_chars"]
}

def load_logic_config(self):
"""Load logic configuration for AI tagging system."""
logic_path = os.path.join(self.current_dir, "logic.json")
try:
if os.path.exists(logic_path):
with open(logic_path, "r", encoding="utf-8") as f:
self.logic_config = json.load(f)
else:
self.logic_config = {}
logging.info("Logic configuration loaded")
except Exception as e:
logging.error(f"Error loading logic config: {e}")
self.logic_config = {}

def _rank_by_relevance(self, matches: list, query: str) -> list:
"""Rank matches by AI-determined relevance."""
try:
ranked_matches = []
query_embedding = self.tag_engine.generate_embedding(query)
 
for match in matches:
relevance_score = 0
 
if isinstance(match, dict):
# AI semantic matches get base score from similarity
if match.get("match_type") == "semantic_embedding":
relevance_score = match.get("similarity_score", 0) * 10
 
# Boost based on tag effectiveness
tag = match.get("tag", "")
if tag in self.tag_engine.tag_dna.get("tags", {}):
effectiveness = self.tag_engine.tag_dna["tags"][tag].get("effectiveness_score", 0.5)
relevance_score *= (1 + effectiveness)
 
match["relevance_score"] = relevance_score
ranked_matches.append(match)
else:
# Legacy matches get default score
ranked_matches.append({"content": match, "relevance_score": 5.0})
 
# Sort by relevance score
ranked_matches.sort(key=lambda x: x.get("relevance_score", 0), reverse=True)
return ranked_matches
 
except Exception as e:
logging.warning(f"Relevance ranking failed: {e}")
return matches

def _load_content_by_match_type(self, match: dict) -> str:
"""Load content based on match type."""
try:
match_type = match.get("match_type", "")
source = match.get("source", "")
 
if match_type == "semantic_embedding":
# Find files with this tag
tag = match.get("tag", "")
return self._find_content_by_tag(tag)
elif source == "chat_index":
return self._load_chat_content(match)
else:
return self._load_generic_content(match)
 
except Exception as e:
logging.warning(f"Content loading failed for match {match}: {e}")
return ""

def _find_content_by_tag(self, tag: str) -> str:
"""Find content files that contain the specified tag."""
try:
content_pieces = []
 
# Search working memory
if os.path.exists(self.working_memory_dir):
for filename in os.listdir(self.working_memory_dir):
if filename.endswith(('.txt', '.md')):
file_path = os.path.join(self.working_memory_dir, filename)
content = self._read_file_content(file_path)
if tag.lower() in content.lower():
content_pieces.append(f"[Working Memory: {filename}] {content[:300]}")
 
# Search semantic memory
if os.path.exists(self.semantic_memory_dir):
for filename in os.listdir(self.semantic_memory_dir):
if filename.endswith(('.txt', '.md')):
file_path = os.path.join(self.semantic_memory_dir, filename)
content = self._read_file_content(file_path)
if tag.lower() in content.lower():
content_pieces.append(f"[Semantic Memory: {filename}] {content[:300]}")
 
return "\n".join(content_pieces[:3]) # Limit to 3 pieces
 
except Exception as e:
logging.warning(f"Tag content search failed: {e}")
return ""

def _read_file_content(self, file_path: str) -> str:
"""Safely read file content."""
try:
with open(file_path, 'r', encoding='utf-8') as f:
return f.read()
except Exception as e:
logging.warning(f"Failed to read {file_path}: {e}")
return ""

def _load_chat_content(self, match: dict) -> str:
"""Load content from chat logs."""
# Implement chat log content loading
return f"Chat content for tag: {match.get('tag', '')}"

def _load_generic_content(self, match: dict) -> str:
"""Load generic content."""
return str(match.get("content", ""))

def _load_legacy_content(self, match: str) -> str:
"""Load content using legacy string-based matching."""
# Check if it's a filename in working memory
potential_file = os.path.join(self.working_memory_dir, f"{match}.md")
if os.path.exists(potential_file):
return self._read_file_content(potential_file)
 
potential_file = os.path.join(self.working_memory_dir, f"{match}.txt")
if os.path.exists(potential_file):
return self._read_file_content(potential_file)
 
return f"Legacy content: {match}"

def main(auto_start=False, user_prompt=None):
"""Main entry point for the Memory Context Router Agent."""
# Determine base path dynamically
current_dir = Path(__file__).parent.absolute()
base_path = current_dir.parent.parent.parent # Go up to commandcore-helper root
 
logging.info(f"Memory Context Router Agent starting with base_path: {base_path}")
 
# Initialize the context router agent
context_router = MemoryContextRouterAgent(str(base_path))
 
if user_prompt:
# Process the provided prompt
result = context_router.inject_memory_context(user_prompt)
print(json.dumps(result, indent=4))
return result
elif auto_start:
# Auto-start mode - just initialize and log readiness
logging.info("Context router agent ready for context injection requests")
context_router.log_interaction("Auto-start complete", "Ready for context injection")
else:
# Interactive mode
logging.info("Memory Context Router Agent initialized (manual mode)")
user_input = input("Enter your prompt: ")
result = context_router.inject_memory_context(user_input)
print(json.dumps(result, indent=4))
return result
 
return context_router

if __name__ == "__main__":
if len(sys.argv) > 1:
# Process command line argument as prompt
user_prompt = " ".join(sys.argv[1:])
main(user_prompt=user_prompt)
else:
# Run in auto-start mode for orchestrator
main(auto_start=True)
