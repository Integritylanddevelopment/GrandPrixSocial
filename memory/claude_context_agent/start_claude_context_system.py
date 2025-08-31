#!/usr/bin/env python3
"""
Start Claude Context System
Main entry point to start the complete Claude context memory system

This script:
1. Organizes files into proper memory structure
2. Starts Claude Code watcher
3. Starts Claude memory agents
4. Provides system status and management
"""

import os
import sys
import json
import time
import shutil
import subprocess
from datetime import datetime
from pathlib import Path
import logging

# Setup logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class ClaudeContextSystem:
    def __init__(self):
        self.script_dir = Path(__file__).parent
        self.project_root = self.script_dir.parent.parent
        
        # Memory structure paths
        self.memory_core = self.script_dir / "a_memory_core"
        self.long_term_memory = self.script_dir / "b_long_term_memory"
        self.short_term_memory = self.script_dir / "c_short_term_memory"
        self.working_memory = self.script_dir / "d_working_memory"
        self.procedural = self.script_dir / "e_procedural"
        self.semantic = self.script_dir / "f_semantic"
        self.episodic = self.script_dir / "g_episodic"
        
        logger.info(f"🧠 Claude Context System initialized for: {self.project_root}")

    def organize_files(self):
        """Organize existing files into proper memory structure"""
        logger.info("📁 Organizing files into memory structure...")
        
        # Ensure all directories exist
        for memory_path in [self.memory_core, self.long_term_memory, self.short_term_memory, 
                           self.working_memory, self.procedural, self.semantic, self.episodic]:
            memory_path.mkdir(exist_ok=True)
            logger.info(f"✅ Directory ready: {memory_path.name}")
        
        # Move context documents to long-term memory if they're not there
        claude_md = self.script_dir / "CLAUDE.md"
        session_md = self.script_dir / "CLAUDE_CURRENT_SESSION.md"
        
        if claude_md.exists():
            target = self.long_term_memory / "CLAUDE.md"
            if not target.exists():
                shutil.copy2(claude_md, target)
                logger.info(f"📝 Copied CLAUDE.md to long-term memory")
        
        if session_md.exists():
            target = self.short_term_memory / "CLAUDE_CURRENT_SESSION.md"
            if not target.exists():
                shutil.copy2(session_md, target)
                logger.info(f"📝 Copied session document to short-term memory")
        
        # Create README files for each memory type
        self.create_memory_readmes()
        
        logger.info("✅ File organization complete")

    def create_memory_readmes(self):
        """Create README files explaining each memory type"""
        readmes = {
            self.memory_core: {
                "title": "Claude Memory Core",
                "description": "Core agents that manage Claude's memory system",
                "contents": "- Claude Master Orchestrator\n- Memory routers and processors\n- System health monitoring"
            },
            self.long_term_memory: {
                "title": "Claude Long-Term Memory",
                "description": "Permanent storage for important Claude context and knowledge",
                "contents": "- CLAUDE.md (permanent context)\n- Important technical decisions\n- Project history and milestones"
            },
            self.short_term_memory: {
                "title": "Claude Short-Term Memory", 
                "description": "Recent Claude interactions and temporary context",
                "contents": "- Current session documents\n- Recent conversation context\n- Temporary working notes"
            },
            self.working_memory: {
                "title": "Claude Working Memory",
                "description": "Active development context and current tasks",
                "contents": "- Current sprint information\n- Active development context\n- Task progress and notes"
            },
            self.procedural: {
                "title": "Claude Procedural Memory",
                "description": "How-to knowledge and process memories for Claude",
                "contents": "- Development procedures\n- Best practices and patterns\n- Step-by-step guides"
            },
            self.semantic: {
                "title": "Claude Semantic Memory",
                "description": "Categorized knowledge and semantic relationships",
                "contents": "- Tagged content and topics\n- Semantic relationships\n- Knowledge categorization"
            },
            self.episodic: {
                "title": "Claude Episodic Memory",
                "description": "Specific experiences and interaction history",
                "contents": "- Conversation episodes\n- Problem-solving sessions\n- Learning experiences"
            }
        }
        
        for path, info in readmes.items():
            readme_file = path / "README.md"
            if not readme_file.exists():
                content = f"""# {info['title']}

{info['description']}

## Contents
{info['contents']}

## Status
- Directory: `{path.name}/`
- Created: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}
- Part of: Claude Context Memory System

---
*This directory is managed by the Claude Context System*
"""
                with open(readme_file, 'w') as f:
                    f.write(content)

    def start_claude_code_watcher(self):
        """Start the Claude Code watcher"""
        logger.info("👁️ Starting Claude Code watcher...")
        
        watcher_script = self.script_dir / "claude_code_watcher.py"
        if watcher_script.exists():
            try:
                subprocess.Popen(
                    [sys.executable, str(watcher_script), "start"],
                    cwd=str(self.script_dir)
                )
                logger.info("✅ Claude Code watcher started")
                return True
            except Exception as e:
                logger.error(f"Failed to start watcher: {e}")
                return False
        else:
            logger.error("Claude Code watcher script not found")
            return False

    def start_memory_agents(self):
        """Start Claude memory agents directly"""
        logger.info("🤖 Starting Claude memory agents...")
        
        orchestrator_script = self.memory_core / "claude_master_orchestrator.py"
        if orchestrator_script.exists():
            try:
                subprocess.Popen(
                    [sys.executable, str(orchestrator_script), "start"],
                    cwd=str(self.script_dir)
                )
                logger.info("✅ Claude memory agents started")
                return True
            except Exception as e:
                logger.error(f"Failed to start memory agents: {e}")
                return False
        else:
            logger.warning("Claude master orchestrator not found - creating placeholder")
            return False

    def start_main_memory_system(self):
        """Start the main Grand Prix Social memory system"""
        logger.info("🧠 Starting main memory system...")
        
        main_start_script = self.project_root / "memory" / "start_all_agents.py"
        if main_start_script.exists():
            try:
                subprocess.Popen(
                    [sys.executable, str(main_start_script)],
                    cwd=str(main_start_script.parent)
                )
                logger.info("✅ Main memory system started")
                return True
            except Exception as e:
                logger.error(f"Failed to start main memory system: {e}")
                return False
        else:
            logger.warning("Main memory system start script not found")
            return False

    def get_system_status(self):
        """Get status of the Claude context system"""
        status = {
            "timestamp": datetime.now().isoformat(),
            "project_root": str(self.project_root),
            "claude_context_dir": str(self.script_dir),
            "memory_structure": {
                "memory_core": self.memory_core.exists(),
                "long_term_memory": self.long_term_memory.exists(),
                "short_term_memory": self.short_term_memory.exists(),
                "working_memory": self.working_memory.exists(),
                "procedural": self.procedural.exists(),
                "semantic": self.semantic.exists(),
                "episodic": self.episodic.exists()
            },
            "key_files": {
                "claude_md": (self.script_dir / "CLAUDE.md").exists(),
                "session_md": (self.script_dir / "CLAUDE_CURRENT_SESSION.md").exists(),
                "context_monitor": (self.script_dir / "context_document_monitor_agent.py").exists(),
                "watcher": (self.script_dir / "claude_code_watcher.py").exists(),
                "orchestrator": (self.memory_core / "claude_master_orchestrator.py").exists()
            }
        }
        
        return status

    def full_startup(self):
        """Complete system startup sequence"""
        logger.info("🚀 Starting Claude Context System - Full Startup")
        
        # Step 1: Organize files
        self.organize_files()
        
        # Step 2: Start main memory system
        self.start_main_memory_system()
        
        # Step 3: Start Claude memory agents
        self.start_memory_agents()
        
        # Step 4: Start Claude Code watcher
        self.start_claude_code_watcher()
        
        logger.info("✅ Claude Context System startup complete!")
        logger.info("📊 System will now monitor for Claude Code activity and maintain context")
        
        # Show status
        status = self.get_system_status()
        logger.info(f"💾 Memory structure ready: {sum(status['memory_structure'].values())}/7 directories")
        logger.info(f"📁 Key files available: {sum(status['key_files'].values())}/5 files")

def main():
    """Main execution function"""
    system = ClaudeContextSystem()
    
    if len(sys.argv) > 1:
        command = sys.argv[1].lower()
        
        if command == 'start' or command == 'full':
            system.full_startup()
        
        elif command == 'organize':
            system.organize_files()
        
        elif command == 'status':
            status = system.get_system_status()
            print(json.dumps(status, indent=2))
        
        elif command == 'watcher':
            system.start_claude_code_watcher()
        
        elif command == 'agents':
            system.start_memory_agents()
        
        else:
            print("Usage: python start_claude_context_system.py [start|organize|status|watcher|agents]")
    
    else:
        # Default: full startup
        system.full_startup()

if __name__ == "__main__":
    main()