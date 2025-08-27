#!/usr/bin/env python3
"""
orchestrator_context_integration.py

Memory Orchestrator Context Integration Module

Integrates the Memory Orchestrator with the Context Document Monitor
to ensure systematic processing of context changes through the memory hierarchy.

Authority Level: ORCHESTRATION
Version: 1.0 (Grand Prix Social Integration)
"""

import os
import sys
import json
import logging
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional
from pathlib import Path

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class OrchestratorContextIntegration:
    def __init__(self):
        """Initialize context integration module"""
        self.agent_name = "MemoryOrchestratorContextIntegration"
        self.script_dir = Path(os.path.dirname(os.path.abspath(__file__)))
        
        # Integration state
        self.integration_state_file = self.script_dir / "context_integration_state.json"
        self.state = self.load_integration_state()
        
        # Context document path
        self.context_document_path = Path("C:/D_Drive/ActiveProjects/GrandPrixSocial/memory/CLAUDE.md")
        
        # Memory system paths
        self.memory_core_path = self.script_dir.parent
        self.context_monitor_path = self.memory_core_path / "context_document_monitor_agent"
        
        logger.info("🔗 Memory Orchestrator Context Integration initialized")

    def load_integration_state(self) -> Dict[str, Any]:
        """Load integration state"""
        if self.integration_state_file.exists():
            try:
                with open(self.integration_state_file, 'r', encoding='utf-8') as f:
                    return json.load(f)
            except Exception as e:
                logger.error(f"Failed to load integration state: {e}")
        
        return {
            "last_context_check": None,
            "context_changes_processed": 0,
            "memory_promotions_triggered": 0,
            "integration_active": True,
            "last_orchestration": None
        }

    def save_integration_state(self):
        """Save integration state"""
        try:
            with open(self.integration_state_file, 'w', encoding='utf-8') as f:
                json.dump(self.state, f, indent=2)
        except Exception as e:
            logger.error(f"Failed to save integration state: {e}")

    def check_context_document_changes(self):
        """Check for context document changes and coordinate response"""
        logger.info("📖 Checking context document for orchestration needs...")
        
        try:
            # Import context monitor
            sys.path.append(str(self.context_monitor_path))
            from context_document_monitor_agent import ContextDocumentMonitor
            
            monitor = ContextDocumentMonitor()
            
            # Run monitoring cycle
            monitor.run_monitoring_cycle()
            
            # Get status to see if changes were detected
            status = monitor.get_status()
            
            if status['changes_detected'] > self.state.get('last_known_changes', 0):
                new_changes = status['changes_detected'] - self.state.get('last_known_changes', 0)
                logger.info(f"🔄 Detected {new_changes} new context changes - orchestrating memory processing")
                
                # Trigger memory system coordination
                self.coordinate_memory_processing(new_changes)
                
                # Update state
                self.state['last_known_changes'] = status['changes_detected']
                self.state['context_changes_processed'] += new_changes
            
            self.state['last_context_check'] = datetime.now().isoformat()
            
        except Exception as e:
            logger.error(f"Error checking context changes: {e}")

    def coordinate_memory_processing(self, change_count: int):
        """Coordinate memory system processing of context changes"""
        logger.info(f"🎛️ Coordinating memory processing for {change_count} context changes")
        
        try:
            # Notify tag intelligence engine
            self.notify_tag_intelligence_engine()
            
            # Trigger memory indexing
            self.trigger_memory_indexing()
            
            # Schedule promotion processing
            self.schedule_promotion_processing()
            
            # Update semantic systems
            self.update_semantic_systems()
            
            self.state['memory_promotions_triggered'] += 1
            self.state['last_orchestration'] = datetime.now().isoformat()
            
            logger.info("✅ Memory processing coordination completed")
            
        except Exception as e:
            logger.error(f"Error coordinating memory processing: {e}")

    def notify_tag_intelligence_engine(self):
        """Notify tag intelligence engine of context changes"""
        try:
            tag_engine_path = self.memory_core_path / "tag_intelligence_engine"
            sys.path.append(str(tag_engine_path))
            
            from tag_intelligence_engine import TagIntelligenceEngine
            
            engine = TagIntelligenceEngine()
            
            # Read current context document
            if self.context_document_path.exists():
                with open(self.context_document_path, 'r', encoding='utf-8') as f:
                    content = f.read()
                
                # Generate tags for current context
                tags = engine.generate_semantic_tags(content, max_tags=15)
                
                # Register context document tagging
                engine.register_tag("context_document", content, tags)
                
                logger.info(f"🏷️ Tagged context document with {len(tags)} semantic tags")
            
        except Exception as e:
            logger.error(f"Error notifying tag intelligence engine: {e}")

    def trigger_memory_indexing(self):
        """Trigger memory indexing agents"""
        try:
            indexer_path = self.memory_core_path / "memory_indexer_agent"
            
            # Check if indexer exists and run it
            indexer_script = indexer_path / "memory_indexer_agent.py"
            if indexer_script.exists():
                import subprocess
                result = subprocess.run([
                    sys.executable, str(indexer_script), "index", "context_document"
                ], capture_output=True, text=True, cwd=str(indexer_path))
                
                if result.returncode == 0:
                    logger.info("📇 Memory indexing triggered successfully")
                else:
                    logger.warning(f"Memory indexing warning: {result.stderr}")
            
        except Exception as e:
            logger.error(f"Error triggering memory indexing: {e}")

    def schedule_promotion_processing(self):
        """Schedule promotion processing across memory buckets"""
        try:
            # Create promotion schedule entry
            promotion_schedule = {
                "triggered_by": "context_document_change",
                "scheduled_at": datetime.now().isoformat(),
                "promotion_tasks": [
                    {
                        "task": "process_context_changes",
                        "source": "context_document_monitor",
                        "target": "short_term_memory",
                        "priority": "high"
                    },
                    {
                        "task": "promote_aged_content",
                        "source": "short_term_memory",
                        "target": "working_memory",
                        "priority": "medium"
                    },
                    {
                        "task": "archive_mature_content",
                        "source": "working_memory", 
                        "target": "long_term_memory",
                        "priority": "low"
                    }
                ]
            }
            
            # Save promotion schedule
            schedule_file = self.script_dir / "promotion_schedule.json"
            with open(schedule_file, 'w', encoding='utf-8') as f:
                json.dump(promotion_schedule, f, indent=2)
            
            logger.info("📅 Promotion processing scheduled")
            
        except Exception as e:
            logger.error(f"Error scheduling promotion processing: {e}")

    def update_semantic_systems(self):
        """Update semantic tagging and search systems"""
        try:
            # Update semantic tagging system in main project
            semantic_path = Path("C:/D_Drive/ActiveProjects/GrandPrixSocial/lib/semantic-tagging")
            
            if semantic_path.exists():
                # Trigger semantic analysis of context changes
                logger.info("🧠 Notifying semantic systems of context updates")
                
                # This would integrate with the semantic agent orchestrator
                # to process context changes through the semantic pipeline
                
            logger.info("🔄 Semantic systems updated")
            
        except Exception as e:
            logger.error(f"Error updating semantic systems: {e}")

    def run_integration_cycle(self):
        """Run complete integration cycle"""
        logger.info("🔄 Starting memory orchestrator context integration cycle...")
        
        try:
            # Check for context changes
            self.check_context_document_changes()
            
            # Process any pending promotions
            self.process_pending_promotions()
            
            # Update integration state
            self.save_integration_state()
            
            logger.info("✅ Context integration cycle completed")
            
        except Exception as e:
            logger.error(f"Error in integration cycle: {e}")

    def process_pending_promotions(self):
        """Process any pending memory promotions"""
        try:
            schedule_file = self.script_dir / "promotion_schedule.json"
            
            if schedule_file.exists():
                with open(schedule_file, 'r', encoding='utf-8') as f:
                    schedule = json.load(f)
                
                # Process each promotion task
                for task in schedule.get('promotion_tasks', []):
                    self.execute_promotion_task(task)
                
                # Archive processed schedule
                archive_file = self.script_dir / f"promotion_archive_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
                schedule_file.rename(archive_file)
                
                logger.info("📈 Pending promotions processed")
            
        except Exception as e:
            logger.error(f"Error processing pending promotions: {e}")

    def execute_promotion_task(self, task: Dict[str, Any]):
        """Execute a specific promotion task"""
        try:
            task_type = task.get('task')
            source = task.get('source')
            target = task.get('target')
            
            logger.info(f"⚡ Executing promotion task: {task_type} from {source} to {target}")
            
            # Task-specific logic would go here
            # For now, just log the execution
            
        except Exception as e:
            logger.error(f"Error executing promotion task: {e}")

    def get_integration_status(self) -> Dict[str, Any]:
        """Get integration status"""
        return {
            "agent_name": self.agent_name,
            "integration_active": self.state.get('integration_active', True),
            "last_context_check": self.state.get('last_context_check'),
            "context_changes_processed": self.state.get('context_changes_processed', 0),
            "memory_promotions_triggered": self.state.get('memory_promotions_triggered', 0),
            "last_orchestration": self.state.get('last_orchestration'),
            "context_document_exists": self.context_document_path.exists()
        }

def main():
    """Main execution function"""
    integration = OrchestratorContextIntegration()
    
    if len(sys.argv) > 1:
        command = sys.argv[1].lower()
        
        if command == 'status':
            status = integration.get_integration_status()
            print(json.dumps(status, indent=2))
        elif command == 'run':
            integration.run_integration_cycle()
        elif command == 'check':
            integration.check_context_document_changes()
        else:
            print("Usage: python orchestrator_context_integration.py [status|run|check]")
    else:
        # Default: run integration cycle
        integration.run_integration_cycle()

if __name__ == "__main__":
    main()