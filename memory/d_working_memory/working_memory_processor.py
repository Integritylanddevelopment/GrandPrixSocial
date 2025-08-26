
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
WORKING MEMORY PROCESSOR - Unified Processing & Promotion
=========================================================

Unified script that handles all working memory processing tasks:
1. File organization and routing to subsystems
2. Content analysis and chunking into dynamic sessions  
3. Promotion to semantic, procedural, and episodic memory buckets
4. Coordination with memory agents for further processing

This replaces multiple separate scripts with one comprehensive processor.

Features:
- Automatic content categorization and routing
- Dynamic session creation with TTL management
- Content promotion to long-term memory buckets
- Integration with memory agents (indexer, promotion, merger)
- Redis cache coordination
- Comprehensive processing metrics

Usage:
- python working_memory_processor.py --organize    # File organization only
- python working_memory_processor.py --sessions    # Session creation only  
- python working_memory_processor.py --promote     # Memory promotion only
- python working_memory_processor.py --all         # Full processing pipeline
- python working_memory_processor.py               # Interactive mode
"""

import os
import json
import re
import shutil
import argparse
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Tuple, Any
from pathlib import Path
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class WorkingMemoryProcessor:
    """Unified processor for all working memory operations."""
    
    def __init__(self, working_memory_path: str):
        """Initialize the processor."""
        self.working_memory_path = Path(working_memory_path)
        self.timestamp = datetime.now().strftime("%m-%d_%I-%M%p")
        
        # Load configuration
        self.config = self._load_config()
        
        # File organization categories
        self.file_categories = {
            'agent_analysis': {
                'patterns': ['agent_.*analysis', 'agent_folder_index', 'agent_fleet', 'memory_orcastrator'],
                'destination': 'agent_coordination/processed'
            },
            'chat_sessions': {
                'patterns': ['chat_session', 'gpt_session', 'copilot.*working', 'sve'],
                'destination': 'session_manager/sessions'
            },
            'system_plans': {
                'patterns': ['GLOBAL.*SYSTEM', 'breaking.*project', 'next_steps', 'co-pilot_working'],
                'destination': 'cognitive_workspace/plans'
            },
            'gui_setup': {
                'patterns': ['gui_setup', 'interface_folder', 'plugins_folder'],
                'destination': 'context_injection/gui_context'
            },
            'memory_content': {
                'patterns': ['memory_.*', 'memoryagents', 'memory_router', 'commandcore_neroscience', 'context', 'copilot_prompts'],
                'destination': 'real_time_cache/memory_data'
            },
            'schema_content': {
                'patterns': ['schema_updater', 'chatgpt_organizer_index'],
                'destination': 'monitoring/schema_tracking'
            }
        }
        
        # Content analysis categories
        self.content_categories = {
            "agent_analysis": ["agent", "memory_agent", "orchestrator", "router"],
            "system_design": ["architecture", "design", "system", "commandcore"],
            "session_logs": ["chat", "session", "gpt", "copilot"],
            "integration_plans": ["gui", "interface", "integration", "wiring"],
            "debugging": ["debug", "error", "fix", "issue", "problem"],
            "planning": ["plan", "next_steps", "todo", "roadmap"]
        }
        
        # Memory bucket promotion rules
        self.promotion_rules = {
            "semantic": {
                "categories": ["system_design", "agent_analysis"],
                "keywords": ["architecture", "design", "memory", "system"],
                "min_importance": 0.7
            },
            "procedural": {
                "categories": ["debugging", "integration_plans"],
                "keywords": ["debug", "fix", "setup", "install", "configure"],
                "min_importance": 0.6
            },
            "episodic": {
                "categories": ["session_logs", "planning"],
                "keywords": ["session", "chat", "conversation", "experience"],
                "min_importance": 0.5
            }
        }
        
        # Processing metrics
        self.metrics = {
            'files_organized': 0,
            'sessions_created': 0,
            'files_promoted': 0,
            'processing_errors': 0,
            'timestamp_fixes': 0
        }

    def _load_config(self) -> Dict[str, Any]:
        """Load working memory configuration."""
        config_path = self.working_memory_path / "working_memory_config.json"
        try:
            with open(config_path, 'r') as f:
                return json.load(f)
        except FileNotFoundError:
            logger.warning("Config file not found, using defaults")
            return {"default": True}

    def organize_files(self) -> Dict[str, Any]:
        """Organize loose markdown files into appropriate subsystem folders."""
        logger.info("Starting file organization...")
        
        # Get all markdown files in root
        md_files = [f for f in self.working_memory_path.iterdir() 
                   if f.is_file() and f.suffix == '.md' and f.name not in ['README.md']]
        
        logger.info(f"Found {len(md_files)} markdown files to organize")
        
        organized_files = []
        for md_file in md_files:
            try:
                category = self._categorize_file(md_file.name)
                if category:
                    destination = self._move_file_to_category(md_file, category)
                    organized_files.append({
                        'file': md_file.name,
                        'category': category,
                        'destination': destination
                    })
                    self.metrics['files_organized'] += 1
                else:
                    logger.warning(f"Could not categorize: {md_file.name}")
                    
            except Exception as e:
                logger.error(f"Error organizing {md_file.name}: {e}")
                self.metrics['processing_errors'] += 1
        
        return {
            'organized_files': organized_files,
            'total_processed': len(organized_files),
            'metrics': self.metrics
        }

    def create_sessions(self) -> Dict[str, Any]:
        """Create dynamic sessions from remaining content."""
        logger.info("Starting session creation...")
        
        # Get remaining markdown files (after organization)
        md_files = [f for f in self.working_memory_path.iterdir() 
                   if f.is_file() and f.suffix == '.md' and f.name not in ['README.md', 'REFACTOR_COMPLETE.md']]
        
        created_sessions = []
        for md_file in md_files:
            try:
                session_id = self._create_dynamic_session(md_file)
                if session_id:
                    created_sessions.append({
                        'file': md_file.name,
                        'session_id': session_id
                    })
                    self.metrics['sessions_created'] += 1
                    
            except Exception as e:
                logger.error(f"Error creating session for {md_file.name}: {e}")
                self.metrics['processing_errors'] += 1
        
        return {
            'created_sessions': created_sessions,
            'total_sessions': len(created_sessions),
            'metrics': self.metrics
        }

    def promote_to_memory_buckets(self) -> Dict[str, Any]:
        """Promote processed content to semantic/procedural/episodic memory."""
        logger.info("Starting memory bucket promotion...")
        
        # Check active sessions for promotion candidates
        active_sessions_path = self.working_memory_path / "active" / "sessions"
        if not active_sessions_path.exists():
            logger.warning("No active sessions found for promotion")
            return {'promoted_content': [], 'total_promoted': 0}
        
        promoted_content = []
        
        for session_dir in active_sessions_path.iterdir():
            if session_dir.is_dir():
                try:
                    promotion_result = self._evaluate_for_promotion(session_dir)
                    if promotion_result['should_promote']:
                        bucket = promotion_result['target_bucket']
                        promoted_path = self._promote_to_bucket(session_dir, bucket)
                        
                        promoted_content.append({
                            'session': session_dir.name,
                            'bucket': bucket,
                            'promoted_path': promoted_path,
                            'importance_score': promotion_result['importance_score']
                        })
                        self.metrics['files_promoted'] += 1
                        
                except Exception as e:
                    logger.error(f"Error promoting session {session_dir.name}: {e}")
                    self.metrics['processing_errors'] += 1
        
        return {
            'promoted_content': promoted_content,
            'total_promoted': len(promoted_content),
            'metrics': self.metrics
        }

    def run_full_pipeline(self) -> Dict[str, Any]:
        """Run the complete processing pipeline."""
        logger.info("Running full working memory processing pipeline...")
        
        # Step 1: Organize files
        organization_results = self.organize_files()
        
        # Step 2: Create sessions  
        session_results = self.create_sessions()
        
        # Step 3: Promote to memory buckets
        promotion_results = self.promote_to_memory_buckets()
        
        # Step 4: Notify memory agents for further processing
        agent_notification_results = self._notify_memory_agents()
        
        # Generate comprehensive report
        report = self._generate_processing_report(
            organization_results, session_results, promotion_results, agent_notification_results
        )
        
        return report

    def _categorize_file(self, filename: str) -> Optional[str]:
        """Categorize a file based on its name."""
        filename_lower = filename.lower()
        
        for category, config in self.file_categories.items():
            for pattern in config['patterns']:
                if re.search(pattern, filename_lower):
                    return category
        
        return None

    def _move_file_to_category(self, file_path: Path, category: str) -> str:
        """Move file to appropriate category folder."""
        destination_folder = self.working_memory_path / self.file_categories[category]['destination']
        destination_folder.mkdir(parents=True, exist_ok=True)
        
        # Fix timestamp format if needed
        new_filename = self._fix_timestamp_format(file_path.name)
        if new_filename != file_path.name:
            self.metrics['timestamp_fixes'] += 1
            logger.info(f"Fixed timestamp: {file_path.name} -> {new_filename}")
        
        destination_path = destination_folder / new_filename
        shutil.move(str(file_path), str(destination_path))
        
        logger.info(f"Moved {file_path.name} to {destination_path}")
        return str(destination_path)

    def _fix_timestamp_format(self, filename: str) -> str:
        """Fix timestamp format to CommandCore standard."""
        # Convert 2025-06-11_17-20-58 to 06-11_05-20PM format
        pattern = r'(\d{4})-(\d{2})-(\d{2})_(\d{2})-(\d{2})-(\d{2})'
        match = re.search(pattern, filename)
        
        if match:
            year, month, day, hour, minute, second = match.groups()
            
            # Convert to 12-hour format
            hour_int = int(hour)
            if hour_int == 0:
                hour_12 = "12"
                am_pm = "AM"
            elif hour_int < 12:
                hour_12 = f"{hour_int:02d}"
                am_pm = "AM"
            elif hour_int == 12:
                hour_12 = "12"
                am_pm = "PM"
            else:
                hour_12 = f"{hour_int - 12:02d}"
                am_pm = "PM"
            
            new_timestamp = f"{month}-{day}_{hour_12}-{minute}{am_pm}"
            return filename.replace(match.group(), new_timestamp)
        
        return filename

    def _create_dynamic_session(self, file_path: Path) -> Optional[str]:
        """Create a dynamic session from file content."""
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            # Analyze content
            analysis = self._analyze_content(content, file_path.name)
            
            # Create session
            session_type = analysis['estimated_session_type']
            session_id = f"{session_type}_{self.timestamp}_{file_path.stem}"
            session_path = self.working_memory_path / "active" / "sessions" / session_id
            session_path.mkdir(parents=True, exist_ok=True)
            
            # Create session metadata
            ttl_hours = self._calculate_ttl(analysis)
            expires_at = datetime.now() + timedelta(hours=ttl_hours)
            
            session_metadata = {
                "session_id": session_id,
                "created_at": self.timestamp,
                "original_file": file_path.name,
                "session_type": session_type,
                "primary_category": analysis["primary_category"],
                "topics": analysis["topics"],
                "ttl_expires": expires_at.strftime("%m-%d_%I-%M%p"),
                "status": "active",
                "content_length": len(content),
                "importance_score": analysis.get("importance_score", 0.5)
            }
            
            # Save metadata
            with open(session_path / "session_metadata.json", "w") as f:
                json.dump(session_metadata, f, indent=2)
            
            # Handle chunking or save as single file
            if analysis["should_chunk"]:
                chunks = self._chunk_content(content)
                for i, chunk in enumerate(chunks):
                    chunk_file = session_path / f"chunk_{i:02d}_{chunk['header'].replace(' ', '_')}.md"
                    with open(chunk_file, "w", encoding="utf-8") as f:
                        f.write(f"# {chunk['header']}\n\n")
                        f.write(f"*Session: {session_id}*\n")
                        f.write(f"*TTL Expires: {session_metadata['ttl_expires']}*\n\n")
                        f.write(chunk['content'])
            else:
                content_file = session_path / f"{session_type}_content.md"
                with open(content_file, "w", encoding="utf-8") as f:
                    f.write(f"# {file_path.stem.replace('_', ' ').title()}\n\n")
                    f.write(f"*Session: {session_id}*\n")
                    f.write(f"*TTL Expires: {session_metadata['ttl_expires']}*\n\n")
                    f.write(content)
            
            # Archive original
            self._archive_original(file_path, session_id)
            
            logger.info(f"Created session: {session_id}")
            return session_id
            
        except Exception as e:
            logger.error(f"Error creating session for {file_path.name}: {e}")
            return None

    def _analyze_content(self, content: str, filename: str) -> Dict[str, Any]:
        """Analyze content for categorization and processing."""
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
        
        return {
            "primary_category": primary_category,
            "category_scores": category_scores,
            "topics": topics,
            "should_chunk": len(content) > 5000,
            "content_length": len(content),
            "estimated_session_type": self._determine_session_type(content, topics),
            "importance_score": self._calculate_importance_score(content, primary_category)
        }

    def _extract_topics(self, content: str) -> List[str]:
        """Extract key topics from content."""
        topics = []
        
        # Headers
        headers = re.findall(r'^#+\s+(.+)$', content, re.MULTILINE)
        topics.extend([h.strip() for h in headers])
        
        # Technical terms
        tech_terms = re.findall(r'\b(memory|agent|gui|session|redis|json|python|api)\b', content.lower())
        topics.extend(list(set(tech_terms)))
        
        return list(set(topics))[:10]

    def _determine_session_type(self, content: str, topics: List[str]) -> str:
        """Determine session type for organization."""
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

    def _calculate_importance_score(self, content: str, category: str) -> float:
        """Calculate importance score for promotion decisions."""
        score = 0.5  # Base score
        
        # Length factor
        if len(content) > 10000:
            score += 0.2
        elif len(content) > 5000:
            score += 0.1
        
        # Category factor
        high_importance_categories = ["system_design", "agent_analysis"]
        if category in high_importance_categories:
            score += 0.2
        
        # Keyword factor
        important_keywords = ["architecture", "design", "system", "critical", "important"]
        for keyword in important_keywords:
            if keyword in content.lower():
                score += 0.1
                break
        
        return min(score, 1.0)

    def _calculate_ttl(self, analysis: Dict[str, Any]) -> int:
        """Calculate TTL hours based on content analysis."""
        category = analysis["primary_category"]
        importance = analysis.get("importance_score", 0.5)
        
        if category in ["debugging", "planning"] or importance > 0.8:
            return 6  # High priority: 6 hours
        elif category in ["system_design", "agent_analysis"] or importance > 0.6:
            return 4  # Medium priority: 4 hours
        else:
            return 2  # Standard: 2 hours

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
        
        if current_chunk.strip():
            chunks.append({
                "header": current_header,
                "content": current_chunk.strip(),
                "chunk_index": len(chunks)
            })
        
        return chunks

    def _archive_original(self, file_path: Path, session_id: str):
        """Archive original file with metadata."""
        archive_path = self.working_memory_path / "history" / "processed_originals"
        archive_path.mkdir(parents=True, exist_ok=True)
        
        archive_filename = f"{self.timestamp}_{file_path.name}"
        archive_filepath = archive_path / archive_filename
        
        # Copy original
        shutil.copy2(str(file_path), str(archive_filepath))
        
        # Create metadata
        metadata = {
            "original_file": file_path.name,
            "archived_at": self.timestamp,
            "created_session": session_id,
            "archive_reason": "processed_by_working_memory_processor",
            "restoration_possible": True
        }
        
        metadata_filepath = archive_path / f"{archive_filename.replace('.md', '_metadata.json')}"
        with open(metadata_filepath, "w") as f:
            json.dump(metadata, f, indent=2)
        
        # Remove original
        file_path.unlink()
        
        logger.info(f"Archived {file_path.name} to {archive_filepath}")

    def _evaluate_for_promotion(self, session_dir: Path) -> Dict[str, Any]:
        """Evaluate session for promotion to memory buckets."""
        try:
            metadata_file = session_dir / "session_metadata.json"
            with open(metadata_file, 'r') as f:
                metadata = json.load(f)
            
            category = metadata.get("primary_category", "general")
            importance = metadata.get("importance_score", 0.5)
            
            # Check promotion rules
            for bucket, rules in self.promotion_rules.items():
                if category in rules["categories"] and importance >= rules["min_importance"]:
                    return {
                        "should_promote": True,
                        "target_bucket": bucket,
                        "importance_score": importance,
                        "reason": f"Category '{category}' matches {bucket} bucket rules"
                    }
            
            return {"should_promote": False, "reason": "Does not meet promotion criteria"}
            
        except Exception as e:
            logger.error(f"Error evaluating session {session_dir.name}: {e}")
            return {"should_promote": False, "reason": f"Evaluation error: {e}"}

    def _promote_to_bucket(self, session_dir: Path, bucket: str) -> str:
        """Promote session content to specified memory bucket."""
        # Get memory bucket paths
        memory_root = self.working_memory_path.parent
        bucket_path = memory_root / f"{bucket[0]}_{bucket}"  # e.g., e_episodic, f_semantic, etc.
        
        if not bucket_path.exists():
            bucket_path.mkdir(parents=True, exist_ok=True)
        
        # Create promotion destination
        promotion_filename = f"promoted_{session_dir.name}.md"
        promotion_path = bucket_path / promotion_filename
        
        # Consolidate session content
        consolidated_content = self._consolidate_session_content(session_dir)
        
        # Write to bucket
        with open(promotion_path, "w", encoding="utf-8") as f:
            f.write(f"# Promoted from Working Memory\n\n")
            f.write(f"*Original Session: {session_dir.name}*\n")
            f.write(f"*Promoted At: {self.timestamp}*\n")
            f.write(f"*Memory Bucket: {bucket}*\n\n")
            f.write(consolidated_content)
        
        # Move session to transition/promoted
        promoted_dir = self.working_memory_path / "transition" / "promoted"
        promoted_dir.mkdir(parents=True, exist_ok=True)
        shutil.move(str(session_dir), str(promoted_dir / session_dir.name))
        
        logger.info(f"Promoted session {session_dir.name} to {bucket} bucket")
        return str(promotion_path)

    def _consolidate_session_content(self, session_dir: Path) -> str:
        """Consolidate all session content into single text."""
        content_parts = []
        
        # Add metadata
        try:
            metadata_file = session_dir / "session_metadata.json"
            if metadata_file.exists():
                with open(metadata_file, 'r') as f:
                    metadata = json.load(f)
                content_parts.append(f"## Session Metadata\n```json\n{json.dumps(metadata, indent=2)}\n```\n")
        except Exception:
            pass
        
        # Add all markdown content
        for content_file in session_dir.glob("*.md"):
            try:
                with open(content_file, 'r', encoding='utf-8') as f:
                    content = f.read()
                content_parts.append(f"## {content_file.name}\n{content}\n")
            except Exception as e:
                logger.warning(f"Could not read {content_file}: {e}")
        
        return "\n---\n".join(content_parts)

    def _notify_memory_agents(self) -> Dict[str, Any]:
        """Notify memory agents about new content for processing."""
        notifications = []
        
        try:
            # Import utilities to notify agents
            from utils.cache_utils import update_agent_coordination_cache
            
            # Notify about working memory processing completion
            coordination_data = {
                "working_memory_processing": "complete",
                "processed_at": self.timestamp,
                "metrics": self.metrics,
                "next_agents": ["memory_indexer_agent", "memory_promotion_agent"]
            }
            
            success = update_agent_coordination_cache("working_memory_processor", coordination_data)
            
            notifications.append({
                "agent": "coordination_cache",
                "status": "success" if success else "failed",
                "data": coordination_data
            })
            
        except Exception as e:
            logger.error(f"Error notifying memory agents: {e}")
            notifications.append({
                "agent": "coordination_cache", 
                "status": "failed",
                "error": str(e)
            })
        
        return {"notifications": notifications}

    def _generate_processing_report(self, org_results: Dict, session_results: Dict, 
                                  promotion_results: Dict, notification_results: Dict) -> Dict[str, Any]:
        """Generate comprehensive processing report."""
        report = {
            "processing_summary": {
                "completed_at": self.timestamp,
                "total_files_organized": org_results["total_processed"],
                "total_sessions_created": session_results["total_sessions"],
                "total_content_promoted": promotion_results["total_promoted"],
                "total_errors": self.metrics["processing_errors"]
            },
            "file_organization": org_results,
            "session_creation": session_results,
            "memory_promotion": promotion_results,
            "agent_notifications": notification_results,
            "final_metrics": self.metrics
        }
        
        # Save report
        report_path = self.working_memory_path / f"processing_report_{self.timestamp}.json"
        with open(report_path, "w") as f:
            json.dump(report, f, indent=2)
        
        logger.info(f"Processing report saved to: {report_path}")
        return report


def main():
    """Main entry point with argument parsing."""
    parser = argparse.ArgumentParser(description="Working Memory Processor")
    parser.add_argument("--organize", action="store_true", help="File organization only")
    parser.add_argument("--sessions", action="store_true", help="Session creation only")
    parser.add_argument("--promote", action="store_true", help="Memory promotion only")
    parser.add_argument("--all", action="store_true", help="Full processing pipeline")
    
    args = parser.parse_args()
    
    # Initialize processor
    working_memory_path = os.path.dirname(os.path.abspath(__file__))
    processor = WorkingMemoryProcessor(working_memory_path)
    
    # Execute based on arguments
    if args.organize:
        results = processor.organize_files()
        print(f"✅ File organization complete: {results['total_processed']} files organized")
    elif args.sessions:
        results = processor.create_sessions()
        print(f"✅ Session creation complete: {results['total_sessions']} sessions created")
    elif args.promote:
        results = processor.promote_to_memory_buckets()
        print(f"✅ Memory promotion complete: {results['total_promoted']} items promoted")
    elif args.all:
        results = processor.run_full_pipeline()
        print(f"✅ Full pipeline complete:")
        print(f"   📁 Files organized: {results['processing_summary']['total_files_organized']}")
        print(f"   🗂️ Sessions created: {results['processing_summary']['total_sessions_created']}")
        print(f"   📤 Content promoted: {results['processing_summary']['total_content_promoted']}")
    else:
        # Interactive mode
        print("🧠 Working Memory Processor")
        print("Available operations:")
        print("1. Organize files")
        print("2. Create sessions")
        print("3. Promote to memory buckets") 
        print("4. Run full pipeline")
        
        choice = input("Select operation (1-4): ").strip()
        
        if choice == "1":
            results = processor.organize_files()
            print(f"✅ File organization complete: {results['total_processed']} files organized")
        elif choice == "2":
            results = processor.create_sessions()
            print(f"✅ Session creation complete: {results['total_sessions']} sessions created")
        elif choice == "3":
            results = processor.promote_to_memory_buckets()
            print(f"✅ Memory promotion complete: {results['total_promoted']} items promoted")
        elif choice == "4":
            results = processor.run_full_pipeline()
            print(f"✅ Full pipeline complete!")
            print(f"   📁 Files organized: {results['processing_summary']['total_files_organized']}")
            print(f"   🗂️ Sessions created: {results['processing_summary']['total_sessions_created']}")
            print(f"   📤 Content promoted: {results['processing_summary']['total_content_promoted']}")
        else:
            print("Invalid choice")

if __name__ == "__main__":
    main()
