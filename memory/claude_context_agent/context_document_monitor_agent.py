#!/usr/bin/env python3
"""
context_document_monitor_agent.py

Context Document Monitoring Agent for Grand Prix Social

Monitors the main CLAUDE.md context document for changes, tags content,
and promotes information through the memory cycle for long-term preservation
and searchability.

Authority Level: CONTEXT_MONITORING
Version: 1.0 (Grand Prix Social Integration)
"""

import os
import sys
import json
import logging
import hashlib
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional
from pathlib import Path
import difflib

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class ContextDocumentMonitor:
    def __init__(self, config_path: str = None):
        """Initialize the Context Document Monitor Agent"""
        self.agent_name = "ContextDocumentMonitor"
        self.script_dir = Path(os.path.dirname(os.path.abspath(__file__)))
        
        # Paths (CLAUDE.md is in the main memory folder, but we monitor it from claude_context_agent)
        self.context_document_path = self.script_dir / "CLAUDE.md"  # Local Claude context
        self.main_context_path = self.script_dir.parent / "CLAUDE.md"  # Main memory CLAUDE.md
        self.state_file = self.script_dir / "context_monitor_state.json"
        self.content_cache_file = self.script_dir / "context_content_cache.json"
        self.promotion_queue_file = self.script_dir / "promotion_queue.json"
        
        # Claude-specific memory system paths (within claude_context_agent)
        self.short_term_path = self.script_dir / "c_short_term_memory"
        self.working_memory_path = self.script_dir / "d_working_memory" 
        self.long_term_path = self.script_dir / "b_long_term_memory"
        
        # Load configuration and state
        self.config = self.load_config()
        self.state = self.load_state()
        
        logger.info(f"🔍 Context Document Monitor Agent initialized")

    def load_config(self) -> Dict[str, Any]:
        """Load agent configuration"""
        return {
            "monitoring_interval": 300,  # 5 minutes
            "change_detection_threshold": 0.1,  # 10% content change
            "promotion_schedule": {
                "short_term_retention": 7,     # days
                "working_memory_retention": 30, # days
                "long_term_archive": True
            },
            "tagging_categories": [
                "agent_development", 
                "project_status", 
                "technical_decisions",
                "architecture_changes",
                "roadmap_updates",
                "deployment_issues"
            ]
        }

    def load_state(self) -> Dict[str, Any]:
        """Load agent state from file"""
        if self.state_file.exists():
            try:
                with open(self.state_file, 'r', encoding='utf-8') as f:
                    return json.load(f)
            except Exception as e:
                logger.error(f"Failed to load state: {e}")
        
        # Default state
        return {
            "last_check": None,
            "last_content_hash": None,
            "last_promotion": None,
            "monitoring_active": True,
            "changes_detected": 0,
            "promotions_completed": 0
        }

    def save_state(self):
        """Save agent state to file"""
        try:
            with open(self.state_file, 'w', encoding='utf-8') as f:
                json.dump(self.state, f, indent=2)
        except Exception as e:
            logger.error(f"Failed to save state: {e}")

    def monitor_context_document(self):
        """Main monitoring function - checks for changes in CLAUDE.md"""
        logger.info("📖 Checking context document for changes...")
        
        try:
            # Read current content
            if not self.context_document_path.exists():
                logger.error(f"Context document not found: {self.context_document_path}")
                return
            
            with open(self.context_document_path, 'r', encoding='utf-8') as f:
                current_content = f.read()
            
            # Calculate content hash
            current_hash = hashlib.md5(current_content.encode()).hexdigest()
            
            # Check for changes
            if self.state["last_content_hash"] != current_hash:
                logger.info("🔄 Context document changes detected!")
                
                # Get previous content for diff analysis
                previous_content = self.load_cached_content()
                
                # Analyze changes
                changes = self.analyze_content_changes(previous_content, current_content)
                
                # Process and tag changes
                self.process_content_changes(changes, current_content)
                
                # Update state
                self.state["last_content_hash"] = current_hash
                self.state["last_check"] = datetime.now().isoformat()
                self.state["changes_detected"] += 1
                
                # Cache current content
                self.cache_current_content(current_content)
                
                logger.info(f"✅ Processed {len(changes)} changes")
            else:
                logger.info("📝 No changes detected in context document")
                self.state["last_check"] = datetime.now().isoformat()
            
            self.save_state()
            
        except Exception as e:
            logger.error(f"Error monitoring context document: {e}")

    def load_cached_content(self) -> str:
        """Load previously cached content"""
        if self.content_cache_file.exists():
            try:
                with open(self.content_cache_file, 'r', encoding='utf-8') as f:
                    cache_data = json.load(f)
                    return cache_data.get('content', '')
            except Exception as e:
                logger.error(f"Failed to load cached content: {e}")
        return ''

    def cache_current_content(self, content: str):
        """Cache current content for future comparison"""
        try:
            cache_data = {
                'content': content,
                'cached_at': datetime.now().isoformat(),
                'hash': hashlib.md5(content.encode()).hexdigest()
            }
            with open(self.content_cache_file, 'w', encoding='utf-8') as f:
                json.dump(cache_data, f, indent=2)
        except Exception as e:
            logger.error(f"Failed to cache content: {e}")

    def analyze_content_changes(self, previous_content: str, current_content: str) -> List[Dict[str, Any]]:
        """Analyze what changed in the content"""
        changes = []
        
        # Split content into sections for analysis
        prev_sections = self.parse_content_sections(previous_content)
        curr_sections = self.parse_content_sections(current_content)
        
        # Compare sections
        for section_name in curr_sections:
            if section_name not in prev_sections:
                # New section added
                changes.append({
                    'type': 'section_added',
                    'section': section_name,
                    'content': curr_sections[section_name],
                    'timestamp': datetime.now().isoformat(),
                    'significance': 'high' if 'agent' in section_name.lower() or 'roadmap' in section_name.lower() else 'medium'
                })
            elif prev_sections[section_name] != curr_sections[section_name]:
                # Section modified
                changes.append({
                    'type': 'section_modified',
                    'section': section_name,
                    'previous_content': prev_sections[section_name],
                    'current_content': curr_sections[section_name],
                    'timestamp': datetime.now().isoformat(),
                    'significance': self.assess_change_significance(section_name, prev_sections[section_name], curr_sections[section_name])
                })
        
        # Check for removed sections
        for section_name in prev_sections:
            if section_name not in curr_sections:
                changes.append({
                    'type': 'section_removed',
                    'section': section_name,
                    'content': prev_sections[section_name],
                    'timestamp': datetime.now().isoformat(),
                    'significance': 'medium'
                })
        
        return changes

    def parse_content_sections(self, content: str) -> Dict[str, str]:
        """Parse markdown content into sections"""
        sections = {}
        current_section = None
        current_content = []
        
        for line in content.split('\n'):
            if line.startswith('#'):
                # Save previous section
                if current_section:
                    sections[current_section] = '\n'.join(current_content)
                
                # Start new section
                current_section = line.strip('#').strip()
                current_content = []
            else:
                current_content.append(line)
        
        # Save last section
        if current_section:
            sections[current_section] = '\n'.join(current_content)
        
        return sections

    def assess_change_significance(self, section_name: str, previous: str, current: str) -> str:
        """Assess the significance of a content change"""
        # Calculate similarity ratio
        similarity = difflib.SequenceMatcher(None, previous, current).ratio()
        
        # High significance keywords
        high_keywords = ['agent', 'roadmap', 'priority', 'architecture', 'development']
        medium_keywords = ['status', 'technical', 'integration']
        
        section_lower = section_name.lower()
        
        if similarity < 0.5:  # Major change
            return 'high'
        elif any(keyword in section_lower for keyword in high_keywords):
            return 'high'
        elif any(keyword in section_lower for keyword in medium_keywords):
            return 'medium'
        elif similarity < 0.8:  # Moderate change
            return 'medium'
        else:
            return 'low'

    def process_content_changes(self, changes: List[Dict[str, Any]], full_content: str):
        """Process detected changes and prepare for memory promotion"""
        
        for change in changes:
            # Generate semantic tags
            tags = self.generate_semantic_tags(change)
            
            # Create memory entry
            memory_entry = {
                'id': f"context_change_{datetime.now().strftime('%Y%m%d_%H%M%S')}_{len(changes)}",
                'type': 'context_document_change',
                'source': 'CLAUDE.md',
                'change_type': change['type'],
                'section': change['section'],
                'significance': change['significance'],
                'content': change.get('current_content', change.get('content', '')),
                'previous_content': change.get('previous_content', ''),
                'timestamp': change['timestamp'],
                'tags': tags,
                'full_context_snapshot': full_content if change['significance'] == 'high' else None
            }
            
            # Queue for memory promotion
            self.queue_for_promotion(memory_entry)
            
            # Immediate processing for high-significance changes
            if change['significance'] == 'high':
                self.immediate_index_and_tag(memory_entry)

    def generate_semantic_tags(self, change: Dict[str, Any]) -> List[str]:
        """Generate semantic tags for a change"""
        tags = ['context_document', 'claude_context']
        
        # Section-based tags
        section = change['section'].lower()
        if 'agent' in section:
            tags.extend(['agent_development', 'agent_architecture'])
        if 'roadmap' in section:
            tags.extend(['development_roadmap', 'planning'])
        if 'status' in section:
            tags.extend(['project_status', 'development_state'])
        if 'technical' in section:
            tags.extend(['technical_decisions', 'system_architecture'])
        if 'memory' in section:
            tags.extend(['memory_architecture', 'system_design'])
        
        # Change type tags
        tags.append(f"change_type_{change['type']}")
        tags.append(f"significance_{change['significance']}")
        
        # Content-based tags
        content = change.get('current_content', change.get('content', '')).lower()
        if 'fantasy' in content:
            tags.append('fantasy_formula')
        if 'schedule' in content:
            tags.append('schedule_intelligence')
        if 'news' in content:
            tags.append('news_system')
        if 'premium' in content:
            tags.append('premium_features')
        if 'supabase' in content:
            tags.append('database_architecture')
        if 'vercel' in content:
            tags.append('deployment_pipeline')
        
        return list(set(tags))  # Remove duplicates

    def queue_for_promotion(self, memory_entry: Dict[str, Any]):
        """Queue memory entry for promotion through memory cycle"""
        
        # Load existing queue
        promotion_queue = []
        if self.promotion_queue_file.exists():
            try:
                with open(self.promotion_queue_file, 'r', encoding='utf-8') as f:
                    promotion_queue = json.load(f)
            except Exception as e:
                logger.error(f"Failed to load promotion queue: {e}")
        
        # Add new entry
        promotion_queue.append({
            'memory_entry': memory_entry,
            'queued_at': datetime.now().isoformat(),
            'promotion_target': 'short_term',
            'processed': False
        })
        
        # Save queue
        try:
            with open(self.promotion_queue_file, 'w', encoding='utf-8') as f:
                json.dump(promotion_queue, f, indent=2)
        except Exception as e:
            logger.error(f"Failed to save promotion queue: {e}")

    def immediate_index_and_tag(self, memory_entry: Dict[str, Any]):
        """Immediately index and tag high-significance changes"""
        logger.info(f"🚨 High-significance change detected: {memory_entry['section']}")
        
        # Write to short-term memory immediately
        short_term_file = self.short_term_path / "index" / f"context_change_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        
        try:
            # Ensure directory exists
            short_term_file.parent.mkdir(parents=True, exist_ok=True)
            
            with open(short_term_file, 'w', encoding='utf-8') as f:
                json.dump(memory_entry, f, indent=2)
            
            logger.info(f"✅ Indexed high-significance change to short-term memory")
            
        except Exception as e:
            logger.error(f"Failed to write to short-term memory: {e}")

    def process_promotion_queue(self):
        """Process queued items for memory promotion"""
        
        if not self.promotion_queue_file.exists():
            return
        
        try:
            with open(self.promotion_queue_file, 'r', encoding='utf-8') as f:
                promotion_queue = json.load(f)
        except Exception as e:
            logger.error(f"Failed to load promotion queue: {e}")
            return
        
        processed_items = []
        
        for item in promotion_queue:
            if item['processed']:
                processed_items.append(item)
                continue
            
            # Check if item should be promoted
            queued_time = datetime.fromisoformat(item['queued_at'])
            age_days = (datetime.now() - queued_time).days
            
            if age_days >= self.config["promotion_schedule"]["short_term_retention"]:
                # Promote to working memory
                if self.promote_to_working_memory(item['memory_entry']):
                    item['processed'] = True
                    item['promoted_to'] = 'working_memory'
                    item['promoted_at'] = datetime.now().isoformat()
                    processed_items.append(item)
                    self.state["promotions_completed"] += 1
                    logger.info(f"📈 Promoted context change to working memory: {item['memory_entry']['section']}")
            else:
                processed_items.append(item)
        
        # Save updated queue
        try:
            with open(self.promotion_queue_file, 'w', encoding='utf-8') as f:
                json.dump(processed_items, f, indent=2)
        except Exception as e:
            logger.error(f"Failed to save promotion queue: {e}")

    def promote_to_working_memory(self, memory_entry: Dict[str, Any]) -> bool:
        """Promote memory entry to working memory"""
        
        working_memory_file = self.working_memory_path / "context_changes" / f"{memory_entry['id']}.json"
        
        try:
            # Ensure directory exists
            working_memory_file.parent.mkdir(parents=True, exist_ok=True)
            
            # Add working memory metadata
            memory_entry['promoted_to_working'] = datetime.now().isoformat()
            memory_entry['retention_until'] = (datetime.now() + timedelta(days=self.config["promotion_schedule"]["working_memory_retention"])).isoformat()
            
            with open(working_memory_file, 'w', encoding='utf-8') as f:
                json.dump(memory_entry, f, indent=2)
            
            return True
            
        except Exception as e:
            logger.error(f"Failed to promote to working memory: {e}")
            return False

    def run_monitoring_cycle(self):
        """Run complete monitoring and promotion cycle"""
        logger.info("🔄 Starting context document monitoring cycle...")
        
        try:
            # Monitor for changes
            self.monitor_context_document()
            
            # Process promotion queue
            self.process_promotion_queue()
            
            # Update state
            self.save_state()
            
            logger.info("✅ Context monitoring cycle completed")
            
        except Exception as e:
            logger.error(f"Error in monitoring cycle: {e}")

    def get_status(self) -> Dict[str, Any]:
        """Get agent status and statistics"""
        return {
            'agent_name': self.agent_name,
            'monitoring_active': self.state.get('monitoring_active', True),
            'last_check': self.state.get('last_check'),
            'changes_detected': self.state.get('changes_detected', 0),
            'promotions_completed': self.state.get('promotions_completed', 0),
            'context_document_path': str(self.context_document_path),
            'context_exists': self.context_document_path.exists()
        }

def main():
    """Main execution function"""
    monitor = ContextDocumentMonitor()
    
    if len(sys.argv) > 1:
        command = sys.argv[1].lower()
        
        if command == 'status':
            status = monitor.get_status()
            print(json.dumps(status, indent=2))
        elif command == 'monitor':
            monitor.run_monitoring_cycle()
        elif command == 'promote':
            monitor.process_promotion_queue()
        else:
            print("Usage: python context_document_monitor_agent.py [status|monitor|promote]")
    else:
        # Default: run monitoring cycle
        monitor.run_monitoring_cycle()

if __name__ == "__main__":
    main()