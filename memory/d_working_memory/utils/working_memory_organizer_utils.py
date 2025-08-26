
# Auto-generated logging configuration
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - working_memory_organizer_utils - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('working_memory_organizer_utils.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

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
"""
WORKING MEMORY ORGANIZER UTILITIES
=================================

Subordinate utilities for working memory organization, serving the main memory agents.
These utilities handle chunking, categorization, and dynamic session management
for the Memory Indexer Agent, Memory Promotion Agent, and Memory Merger Agent.

This is NOT a standalone agent - it's a utility module called by memory agents.

Features:
- Content analysis and intelligent categorization
- Dynamic session context creation for memory agents
- TTL-aware archival utilities (preserves originals)
- Integration with memory agent TTL/preservation patterns
- Subordinate helper functions for existing memory agents

Usage by Memory Agents:
- Memory Indexer Agent: Uses for content categorization during indexing
- Memory Promotion Agent: Uses for TTL-based organization during promotion cycles
- Memory Merger Agent: Uses for intelligent session grouping during merges
- Memory Orchestrator Agent: Coordinates utility usage across agents

Authority: SUBORDINATE_UTILITY (serves memory agents, not standalone)
"""

import os
import json
import re
import shutil
from datetime import datetime, timedelta
from typing import Dict, List, Tuple, Any, Optional
import logging

class WorkingMemoryUtils:
    """
    Utility class for working memory organization.
    Designed to be called by memory agents, not run standalone.
    """
    
    def __init__(self, working_memory_root: str, calling_agent: str = "unknown"):
        self.working_memory_root = working_memory_root
        self.calling_agent = calling_agent
        self.timestamp = datetime.now().strftime("%m-%d_%I-%M%p")
        
        # Content categorization patterns (used by Memory Indexer Agent)
        self.content_categories = {
            "agent_analysis": ["agent", "memory_agent", "orchestrator", "router"],
            "system_design": ["architecture", "design", "system", "commandcore"],
            "session_logs": ["chat", "session", "gpt", "copilot"],
            "integration_plans": ["gui", "interface", "integration", "wiring"],
            "debugging": ["debug", "error", "fix", "issue", "problem"],
            "planning": ["plan", "next_steps", "todo", "roadmap"]
        }
        
        # TTL patterns (used by Memory Promotion Agent)
        self.ttl_patterns = {
            "high_priority": timedelta(hours=4),    # Debugging, critical sessions
            "standard": timedelta(hours=2),         # Normal working sessions
            "planning": timedelta(hours=6),         # Planning documents
            "archive": timedelta(hours=1)           # Low-priority content
        }

    def analyze_content_for_agent(self, content: str, filename: str, 
                                  agent_context: str = "indexer") -> Dict[str, Any]:
        """
        Analyze content on behalf of a calling memory agent.
        
        Args:
            content: File content to analyze
            filename: Original filename
            agent_context: Which agent is calling ("indexer", "promotion", "merger")
        
        Returns:
            Analysis results tailored for the calling agent
        """
        content_lower = content.lower()
        filename_lower = filename.lower()
        
        # Score categories
        category_scores = {}
        for category, indicators in self.content_categories.items():
            score = 0
            for indicator in indicators:
                score += content_lower.count(indicator) * 2
                score += filename_lower.count(indicator) * 5
            category_scores[category] = score
        
        primary_category = max(category_scores, key=category_scores.get)
        topics = self._extract_topics(content)
        
        # Agent-specific analysis
        if agent_context == "indexer":
            # Focus on search/indexing metadata
            analysis = {
                "primary_category": primary_category,
                "topics": topics,
                "indexing_priority": self._determine_indexing_priority(content),
                "search_tags": self._extract_search_tags(content, topics),
                "content_type": self._determine_content_type(content)
            }
        elif agent_context == "promotion":
            # Focus on TTL and promotion decisions
            analysis = {
                "primary_category": primary_category,
                "promotion_priority": self._determine_promotion_priority(content, primary_category),
                "recommended_ttl": self._calculate_ttl(content, primary_category),
                "target_bucket": self._suggest_target_bucket(content, primary_category),
                "preservation_value": self._assess_preservation_value(content)
            }
        elif agent_context == "merger":
            # Focus on merging and consolidation
            analysis = {
                "primary_category": primary_category,
                "topics": topics,
                "merge_candidates": self._identify_merge_candidates(content, topics),
                "session_grouping": self._suggest_session_grouping(content),
                "consolidation_value": self._assess_consolidation_value(content)
            }
        else:
            # Default analysis
            analysis = {
                "primary_category": primary_category,
                "topics": topics,
                "content_length": len(content)
            }
        
        # Common metadata for all agents
        analysis.update({
            "analyzed_by": f"working_memory_utils_for_{self.calling_agent}",
            "analyzed_at": self.timestamp,
            "should_chunk": len(content) > 5000,
            "session_type": self._determine_session_type(content, topics)
        })
        
        return analysis

    def create_dynamic_session_for_agent(self, analysis: Dict[str, Any], 
                                       content: str, original_filename: str,
                                       agent_metadata: Optional[Dict] = None) -> str:
        """
        Create dynamic session context for calling memory agent.
        
        This follows the "Soft Ephemerality, Hard Preservation" model:
        - Creates active session with TTL
        - Preserves original in history/
        - Provides agent with organized chunks
        """
        session_type = analysis.get("session_type", "general")
        session_id = f"{session_type}_{self.timestamp}_{original_filename.replace('.md', '')}"
        session_path = os.path.join(self.working_memory_root, "active", "sessions", session_id)
        
        os.makedirs(session_path, exist_ok=True)
        
        # Calculate TTL based on content analysis
        recommended_ttl = analysis.get("recommended_ttl", self.ttl_patterns["standard"])
        expires_at = datetime.now() + recommended_ttl
        expires_formatted = expires_at.strftime("%m-%d_%I-%M%p")
        
        # Create session metadata (includes calling agent info)
        session_metadata = {
            "session_id": session_id,
            "created_at": self.timestamp,
            "created_by_agent": self.calling_agent,
            "original_file": original_filename,
            "session_type": session_type,
            "primary_category": analysis["primary_category"],
            "topics": analysis.get("topics", []),
            "ttl_expires": expires_formatted,
            "status": "active",
            "preservation_value": analysis.get("preservation_value", "standard"),
            "agent_metadata": agent_metadata or {}
        }
        
        # Save session metadata
        with open(os.path.join(session_path, "session_metadata.json"), "w") as f:
            json.dump(session_metadata, f, indent=2)
        
        # Handle chunking if needed
        if analysis["should_chunk"]:
            chunks = self._chunk_content(content)
            for i, chunk in enumerate(chunks):
                chunk_filename = f"chunk_{i:02d}_{chunk['header'].replace(' ', '_')}.md"
                chunk_path = os.path.join(session_path, chunk_filename)
                
                with open(chunk_path, "w", encoding="utf-8") as f:
                    f.write(f"# {chunk['header']}\n\n")
                    f.write(f"*Session: {session_id}*\n")
                    f.write(f"*Created by: {self.calling_agent}*\n")
                    f.write(f"*TTL Expires: {expires_formatted}*\n\n")
                    f.write(chunk['content'])
        else:
            # Single file session
            main_file = os.path.join(session_path, f"{session_type}_content.md")
            with open(main_file, "w", encoding="utf-8") as f:
                f.write(f"# {original_filename.replace('.md', '').replace('_', ' ').title()}\n\n")
                f.write(f"*Session: {session_id}*\n")
                f.write(f"*Created by: {self.calling_agent}*\n")
                f.write(f"*TTL Expires: {expires_formatted}*\n\n")
                f.write(content)
        
        return session_id

    def preserve_original_for_agent(self, filepath: str, session_id: str, 
                                   agent_metadata: Optional[Dict] = None):
        """
        Preserve original file following "Hard Preservation" principle.
        Never truly delete - always archive with full metadata.
        """
        filename = os.path.basename(filepath)
        archive_path = os.path.join(self.working_memory_root, "history", "processed_originals")
        os.makedirs(archive_path, exist_ok=True)
        
        # Create comprehensive preservation metadata
        preservation_metadata = {
            "original_file": filename,
            "preserved_at": self.timestamp,
            "preserved_by_agent": self.calling_agent,
            "created_session": session_id,
            "preservation_reason": f"processed_by_{self.calling_agent}",
            "preservation_status": "complete",
            "restoration_possible": True,
            "agent_metadata": agent_metadata or {}
        }
        
        # Archive with agent prefix for traceability
        archive_filename = f"{self.calling_agent}_{self.timestamp}_{filename}"
        archive_filepath = os.path.join(archive_path, archive_filename)
        
        # Copy original file (preserve, don't move)
        shutil.copy2(filepath, archive_filepath)
        
        # Save preservation metadata
        metadata_filepath = archive_filepath.replace(".md", "_preservation.json")
        with open(metadata_filepath, "w") as f:
            json.dump(preservation_metadata, f, indent=2)
        
        # Update preservation log
        self._update_preservation_log(filename, session_id, archive_filepath)
        
        # Remove original only after successful preservation
        os.remove(filepath)
        
        logging.info(f"[{self.calling_agent}] Preserved {filename} -> {archive_filepath}")

    def process_files_for_agent(self, file_paths: List[str], 
                               agent_context: str = "indexer") -> Dict[str, Any]:
        """
        Process multiple files on behalf of calling memory agent.
        
        Returns processing results for agent to use in its workflow.
        """
        results = {
            "processed_sessions": [],
            "preserved_files": [],
            "processing_errors": [],
            "agent_statistics": {
                "files_processed": 0,
                "sessions_created": 0,
                "files_preserved": 0,
                "processing_time": self.timestamp
            }
        }
        
        for filepath in file_paths:
            try:
                filename = os.path.basename(filepath)
                
                # Read content
                with open(filepath, "r", encoding="utf-8") as f:
                    content = f.read()
                
                # Analyze for calling agent
                analysis = self.analyze_content_for_agent(content, filename, agent_context)
                
                # Create session
                session_id = self.create_dynamic_session_for_agent(
                    analysis, content, filename, {"source_agent": self.calling_agent}
                )
                
                # Preserve original
                self.preserve_original_for_agent(
                    filepath, session_id, {"processing_context": agent_context}
                )
                
                # Record results
                results["processed_sessions"].append({
                    "session_id": session_id,
                    "original_file": filename,
                    "analysis": analysis
                })
                results["preserved_files"].append(filename)
                results["agent_statistics"]["files_processed"] += 1
                results["agent_statistics"]["sessions_created"] += 1
                results["agent_statistics"]["files_preserved"] += 1
                
            except Exception as e:
                results["processing_errors"].append({
                    "file": filepath,
                    "error": str(e),
                    "timestamp": self.timestamp
                })
                logging.error(f"[{self.calling_agent}] Error processing {filepath}: {e}")
        
        return results

    # Private helper methods
    def _extract_topics(self, content: str) -> List[str]:
        """Extract key topics from content."""
        topics = []
        
        # Headers
        headers = re.findall(r'^#+\s+(.+)$', content, re.MULTILINE)
        topics.extend([h.strip() for h in headers])
        
        # Technical terms
        tech_terms = re.findall(r'\b(memory|agent|gui|session|redis|json|python|api)\b', 
                               content.lower())
        topics.extend(list(set(tech_terms)))
        
        return list(set(topics))[:10]

    def _determine_session_type(self, content: str, topics: List[str]) -> str:
        """Determine session type for dynamic organization."""
        content_lower = content.lower()
        
        if any(term in content_lower for term in ["gui", "interface", "button"]):
            return "gui_development"
        elif any(term in content_lower for term in ["memory", "agent", "orchestrator"]):
            return "memory_system"
        elif any(term in content_lower for term in ["debug", "error", "fix"]):
            return "debugging_session"
        elif any(term in content_lower for term in ["plan", "roadmap", "next"]):
            return "planning_session"
        else:
            return "general_analysis"

    def _determine_indexing_priority(self, content: str) -> str:
        """Determine indexing priority for Memory Indexer Agent."""
        if any(term in content.lower() for term in ["critical", "urgent", "error"]):
            return "high"
        elif any(term in content.lower() for term in ["debug", "fix", "issue"]):
            return "medium"
        else:
            return "standard"

    def _extract_search_tags(self, content: str, topics: List[str]) -> List[str]:
        """Extract tags for Memory Indexer Agent search optimization."""
        tags = topics[:]
        
        # Add content-based tags
        if "memory" in content.lower():
            tags.append("memory_system")
        if "agent" in content.lower():
            tags.append("agent_related")
        if "gui" in content.lower():
            tags.append("interface")
        
        return list(set(tags))

    def _determine_content_type(self, content: str) -> str:
        """Determine content type for indexing."""
        if content.startswith("```"):
            return "code_snippet"
        elif "# " in content:
            return "structured_document"
        elif len(content.split('\n')) < 10:
            return "note"
        else:
            return "document"

    def _determine_promotion_priority(self, content: str, category: str) -> str:
        """Determine promotion priority for Memory Promotion Agent."""
        if category in ["debugging", "planning"]:
            return "high"
        elif category in ["agent_analysis", "system_design"]:
            return "medium"
        else:
            return "standard"

    def _calculate_ttl(self, content: str, category: str) -> timedelta:
        """Calculate TTL for Memory Promotion Agent."""
        if category == "debugging":
            return self.ttl_patterns["high_priority"]
        elif category == "planning":
            return self.ttl_patterns["planning"]
        else:
            return self.ttl_patterns["standard"]

    def _suggest_target_bucket(self, content: str, category: str) -> str:
        """Suggest target memory bucket for promotion."""
        if category in ["agent_analysis", "system_design"]:
            return "semantic"
        elif category == "debugging":
            return "procedural"
        else:
            return "long_term"

    def _assess_preservation_value(self, content: str) -> str:
        """Assess preservation value for archival decisions."""
        if len(content) > 10000:
            return "high"
        elif any(term in content.lower() for term in ["design", "architecture", "plan"]):
            return "high"
        else:
            return "standard"

    def _identify_merge_candidates(self, content: str, topics: List[str]) -> List[str]:
        """Identify potential merge candidates for Memory Merger Agent."""
        candidates = []
        for topic in topics:
            if topic in ["memory", "agent", "system"]:
                candidates.append(f"similar_{topic}_sessions")
        return candidates

    def _suggest_session_grouping(self, content: str) -> str:
        """Suggest session grouping for merger operations."""
        if "debug" in content.lower():
            return "debugging_group"
        elif "plan" in content.lower():
            return "planning_group"
        else:
            return "general_group"

    def _assess_consolidation_value(self, content: str) -> str:
        """Assess value for consolidation operations."""
        if len(content) < 1000:
            return "high"  # Small files are good consolidation candidates
        else:
            return "medium"

    def _chunk_content(self, content: str, max_chunk_size: int = 2000) -> List[Dict[str, Any]]:
        """Break large content into logical chunks."""
        chunks = []
        sections = re.split(r'^#+\s+(.+)$', content, flags=re.MULTILINE)
        
        current_chunk = ""
        current_header = "Introduction"
        
        for i, section in enumerate(sections):
            if i % 2 == 0:  # Content
                if len(current_chunk + section) > max_chunk_size and current_chunk:
                    chunks.append({
                        "header": current_header,
                        "content": current_chunk.strip(),
                        "chunk_index": len(chunks)
                    })
                    current_chunk = section
                else:
                    current_chunk += section
            else:  # Header
                if current_chunk.strip():
                    chunks.append({
                        "header": current_header,
                        "content": current_chunk.strip(),
                        "chunk_index": len(chunks)
                    })
                current_header = section
                current_chunk = ""
        
        # Add final chunk
        if current_chunk.strip():
            chunks.append({
                "header": current_header,
                "content": current_chunk.strip(),
                "chunk_index": len(chunks)
            })
        
        return chunks

    def _update_preservation_log(self, filename: str, session_id: str, archive_path: str):
        """Update preservation log in metadata."""
        log_path = os.path.join(self.working_memory_root, "metadata", "preservation_log.json")
        
        try:
            with open(log_path, "r") as f:
                preservation_log = json.load(f)
        except FileNotFoundError:
            preservation_log = {"preservation_entries": []}
        
        preservation_log["preservation_entries"].append({
            "filename": filename,
            "session_id": session_id,
            "archive_path": archive_path,
            "preserved_by": self.calling_agent,
            "preserved_at": self.timestamp
        })
        
        with open(log_path, "w") as f:
            json.dump(preservation_log, f, indent=2)


# Utility functions for memory agents to import
def organize_for_indexer(working_memory_root: str, file_paths: List[str]) -> Dict[str, Any]:
    """Utility function for Memory Indexer Agent."""
    utils = WorkingMemoryUtils(working_memory_root, "memory_indexer_agent")
    return utils.process_files_for_agent(file_paths, "indexer")

def organize_for_promotion(working_memory_root: str, file_paths: List[str]) -> Dict[str, Any]:
    """Utility function for Memory Promotion Agent."""
    utils = WorkingMemoryUtils(working_memory_root, "memory_promotion_agent")
    return utils.process_files_for_agent(file_paths, "promotion")

def organize_for_merger(working_memory_root: str, file_paths: List[str]) -> Dict[str, Any]:
    """Utility function for Memory Merger Agent."""
    utils = WorkingMemoryUtils(working_memory_root, "memory_merger_agent")
    return utils.process_files_for_agent(file_paths, "merger")

def analyze_content_for_agent(working_memory_root: str, content: str, filename: str, 
                            calling_agent: str, context: str) -> Dict[str, Any]:
    """General utility for any memory agent to analyze content."""
    utils = WorkingMemoryUtils(working_memory_root, calling_agent)
    return utils.analyze_content_for_agent(content, filename, context)
