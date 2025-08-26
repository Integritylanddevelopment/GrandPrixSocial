#!/usr/bin/env python3
"""
Grand Prix Social - Repository Sync Agent Memory Integration
Copyright (c) 2025 Grand Prix Social. All rights reserved.

This module integrates the repository sync agent with Grand Prix Social's memory system.
"""

import os
import json
import time
import logging
from typing import Dict, List, Optional
from pathlib import Path
from repo_sync_agent import RepoSyncAgent, SyncResult, RepoConfig

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger('gps_repo_sync_integration')

class GrandPrixSyncAgent(RepoSyncAgent):
    """
    Grand Prix Social specific repository sync agent with memory system integration
    """
    
    def __init__(self, memory_path: str = None):
        # Set up memory-aware config path
        if memory_path is None:
            memory_path = os.path.join(
                "D:", "ActiveProjects", "GrandPrixSocial", 
                "memory", "a_memory_core", "repo_sync_agent"
            )
        
        self.memory_path = memory_path
        config_path = os.path.join(memory_path, "repo_sync_config.json")
        
        # Initialize parent class
        super().__init__(config_path)
        
        # Memory system paths
        self.working_memory_path = os.path.join(
            "D:", "ActiveProjects", "GrandPrixSocial", 
            "memory", "d_working_memory"
        )
        self.sync_logs_path = os.path.join(memory_path, "sync_logs")
        self.conflict_path = os.path.join(memory_path, "conflict_resolutions")
        
        # Ensure directories exist
        os.makedirs(self.sync_logs_path, exist_ok=True)
        os.makedirs(self.conflict_path, exist_ok=True)
        
        logger.info("Grand Prix Social Sync Agent initialized with memory integration")
    
    def sync_with_memory_logging(self, project_id: str, commit_message: str = None) -> Dict:
        """
        Perform sync operation with comprehensive memory system logging
        """
        try:
            # Log sync start to working memory
            sync_start_time = time.time()
            sync_id = f"sync_{int(sync_start_time)}"
            
            self._log_to_working_memory(
                f"SYNC_START",
                f"Starting sync operation for {project_id}",
                {"sync_id": sync_id, "timestamp": sync_start_time}
            )
            
            # Perform the actual sync
            result = self.sync_to_remote(project_id, commit_message)
            
            # Create comprehensive sync log
            sync_log = {
                "sync_id": sync_id,
                "project_id": project_id,
                "timestamp": sync_start_time,
                "duration": time.time() - sync_start_time,
                "success": result.success,
                "message": result.message,
                "files_changed": result.files_changed,
                "conflicts": result.conflicts,
                "branch": result.branch,
                "commit_hash": result.commit_hash,
                "memory_integration": True
            }
            
            # Save sync log
            log_filename = f"sync_log_{sync_id}.json"
            log_filepath = os.path.join(self.sync_logs_path, log_filename)
            
            with open(log_filepath, 'w') as f:
                json.dump(sync_log, f, indent=2)
            
            # Update working memory
            self._log_to_working_memory(
                "SYNC_COMPLETE",
                f"Sync operation completed for {project_id}",
                sync_log
            )
            
            # Handle conflicts if any
            if result.conflicts:
                self._handle_conflicts(project_id, result.conflicts, sync_id)
            
            # Update memory orchestrator about sync status
            self._notify_memory_orchestrator(sync_log)
            
            return {
                "sync_result": result,
                "sync_log": sync_log,
                "memory_integration": True
            }
            
        except Exception as e:
            logger.error(f"Error in memory-integrated sync: {e}")
            error_log = {
                "error": str(e),
                "project_id": project_id,
                "timestamp": time.time(),
                "sync_id": sync_id if 'sync_id' in locals() else "unknown"
            }
            
            self._log_to_working_memory(
                "SYNC_ERROR",
                f"Sync operation failed for {project_id}: {str(e)}",
                error_log
            )
            
            return {"error": str(e), "sync_result": None, "memory_integration": True}
    
    def auto_sync_with_memory(self, project_id: str = "grandprix_main") -> Dict:
        """
        Automatic sync with memory system coordination
        """
        try:
            config = self.configs.get(project_id)
            if not config or not config.sync_enabled:
                return {"status": "disabled", "message": "Auto-sync disabled for project"}
            
            # Check if sync is needed
            if self._should_sync(project_id):
                commit_message = f"Grand Prix Social auto-sync - {time.strftime('%Y-%m-%d %H:%M:%S')}"
                return self.sync_with_memory_logging(project_id, commit_message)
            else:
                return {"status": "no_changes", "message": "No changes detected, sync skipped"}
                
        except Exception as e:
            logger.error(f"Error in auto-sync: {e}")
            return {"error": str(e), "status": "error"}
    
    def cherry_pick_to_memory(self, repo_url: str, file_path: str, memory_section: str) -> Dict:
        """
        Cherry-pick files directly to memory system locations
        """
        try:
            # Determine memory destination based on section
            memory_destinations = {
                "working": os.path.join(self.working_memory_path, "active"),
                "components": os.path.join("D:", "ActiveProjects", "GrandPrixSocial", "components"),
                "lib": os.path.join("D:", "ActiveProjects", "GrandPrixSocial", "lib"),
                "temp": os.path.join(self.memory_path, "temp_downloads")
            }
            
            destination = memory_destinations.get(memory_section, memory_destinations["temp"])
            os.makedirs(destination, exist_ok=True)
            
            # Perform cherry-pick download
            result = self.cherry_pick_download(repo_url, file_path, destination)
            
            # Log to memory system
            if result.success:
                self._log_to_working_memory(
                    "CHERRY_PICK_SUCCESS",
                    f"Cherry-picked {file_path} to {memory_section}",
                    {
                        "file_path": file_path,
                        "destination": destination,
                        "downloaded_files": result.downloaded_files,
                        "file_size": result.file_size
                    }
                )
            
            return {
                "cherry_pick_result": result,
                "destination": destination,
                "memory_section": memory_section
            }
            
        except Exception as e:
            logger.error(f"Error in cherry-pick to memory: {e}")
            return {"error": str(e)}
    
    def get_memory_status(self) -> Dict:
        """
        Get comprehensive status including memory system health
        """
        try:
            # Get basic repo status
            repos_status = self.list_repositories()
            
            # Add memory-specific information
            memory_status = {
                "memory_path": self.memory_path,
                "sync_logs_count": len(os.listdir(self.sync_logs_path)),
                "conflicts_count": len(os.listdir(self.conflict_path)),
                "working_memory_active": os.path.exists(os.path.join(self.working_memory_path, "active")),
                "last_memory_update": self._get_last_memory_update(),
                "orchestrator_status": self._check_orchestrator_status()
            }
            
            return {
                "repositories": repos_status,
                "memory_integration": memory_status,
                "system_health": "healthy"
            }
            
        except Exception as e:
            logger.error(f"Error getting memory status: {e}")
            return {"error": str(e), "system_health": "error"}
    
    def _log_to_working_memory(self, event_type: str, message: str, data: Dict = None):
        """
        Log events to working memory for orchestrator visibility
        """
        try:
            log_entry = {
                "timestamp": time.time(),
                "event_type": event_type,
                "message": message,
                "agent": "repo_sync_agent",
                "data": data or {}
            }
            
            # Append to working memory log
            working_log_path = os.path.join(self.working_memory_path, "repo_sync_events.json")
            
            if os.path.exists(working_log_path):
                with open(working_log_path, 'r') as f:
                    logs = json.load(f)
            else:
                logs = []
            
            logs.append(log_entry)
            
            # Keep only last 100 entries
            if len(logs) > 100:
                logs = logs[-100:]
            
            with open(working_log_path, 'w') as f:
                json.dump(logs, f, indent=2)
                
        except Exception as e:
            logger.error(f"Error logging to working memory: {e}")
    
    def _handle_conflicts(self, project_id: str, conflicts: List[str], sync_id: str):
        """
        Handle merge conflicts with memory system coordination
        """
        try:
            conflict_log = {
                "sync_id": sync_id,
                "project_id": project_id,
                "timestamp": time.time(),
                "conflicts": conflicts,
                "status": "requires_resolution",
                "resolution_method": "manual"
            }
            
            # Save conflict log
            conflict_file = os.path.join(self.conflict_path, f"conflict_{sync_id}.json")
            with open(conflict_file, 'w') as f:
                json.dump(conflict_log, f, indent=2)
            
            # Alert memory orchestrator
            self._log_to_working_memory(
                "CONFLICT_DETECTED",
                f"Merge conflicts detected in {project_id}",
                conflict_log
            )
            
        except Exception as e:
            logger.error(f"Error handling conflicts: {e}")
    
    def _should_sync(self, project_id: str) -> bool:
        """
        Determine if sync is needed based on file changes and timing
        """
        try:
            config = self.configs.get(project_id)
            if not config:
                return False
            
            # Check for file changes
            status = self.get_repo_status(project_id)
            if status.get("status") == "dirty":
                return True
            
            # Check sync interval
            if config.last_sync:
                time_since_sync = time.time() - config.last_sync
                auto_interval = getattr(config, 'auto_sync_interval', 1800)  # 30 minutes default
                return time_since_sync > auto_interval
            
            return False
            
        except Exception:
            return False
    
    def _notify_memory_orchestrator(self, sync_log: Dict):
        """
        Notify memory orchestrator about sync operations
        """
        try:
            orchestrator_inbox = os.path.join(
                "D:", "ActiveProjects", "GrandPrixSocial", 
                "memory", "a_memory_core", "memory_orchestrator_agent", 
                "orchestrator_inbox.json"
            )
            
            notification = {
                "from": "repo_sync_agent",
                "type": "sync_notification",
                "timestamp": time.time(),
                "data": sync_log,
                "priority": "normal"
            }
            
            if os.path.exists(orchestrator_inbox):
                with open(orchestrator_inbox, 'r') as f:
                    inbox = json.load(f)
            else:
                inbox = []
            
            inbox.append(notification)
            
            with open(orchestrator_inbox, 'w') as f:
                json.dump(inbox, f, indent=2)
                
        except Exception as e:
            logger.error(f"Error notifying orchestrator: {e}")
    
    def _get_last_memory_update(self) -> Optional[float]:
        """
        Get timestamp of last memory system update
        """
        try:
            memory_log = os.path.join(self.working_memory_path, "repo_sync_events.json")
            if os.path.exists(memory_log):
                return os.path.getmtime(memory_log)
            return None
        except Exception:
            return None
    
    def _check_orchestrator_status(self) -> str:
        """
        Check if memory orchestrator is active
        """
        try:
            orchestrator_state = os.path.join(
                "D:", "ActiveProjects", "GrandPrixSocial", 
                "memory", "a_memory_core", "memory_orchestrator_agent", 
                "memory_orchestrator_state.json"
            )
            
            if os.path.exists(orchestrator_state):
                with open(orchestrator_state, 'r') as f:
                    state = json.load(f)
                return state.get("status", "unknown")
            return "not_found"
        except Exception:
            return "error"

def main():
    """
    Main entry point for Grand Prix Social sync agent
    """
    import argparse
    
    parser = argparse.ArgumentParser(description='Grand Prix Social Repository Sync Agent')
    parser.add_argument('action', choices=['auto-sync', 'manual-sync', 'status', 'cherry-pick'])
    parser.add_argument('--message', help='Commit message for manual sync')
    parser.add_argument('--repo-url', help='Repository URL for cherry-pick')
    parser.add_argument('--file-path', help='File path for cherry-pick')
    parser.add_argument('--memory-section', choices=['working', 'components', 'lib', 'temp'], 
                       default='temp', help='Memory section for cherry-pick')
    
    args = parser.parse_args()
    
    agent = GrandPrixSyncAgent()
    
    if args.action == 'auto-sync':
        result = agent.auto_sync_with_memory()
        print(json.dumps(result, indent=2, default=str))
    
    elif args.action == 'manual-sync':
        result = agent.sync_with_memory_logging('grandprix_main', args.message)
        print(json.dumps(result, indent=2, default=str))
    
    elif args.action == 'status':
        status = agent.get_memory_status()
        print(json.dumps(status, indent=2, default=str))
    
    elif args.action == 'cherry-pick':
        if args.repo_url and args.file_path:
            result = agent.cherry_pick_to_memory(args.repo_url, args.file_path, args.memory_section)
            print(json.dumps(result, indent=2, default=str))
        else:
            print(json.dumps({"error": "Repository URL and file path required for cherry-pick"}, indent=2))

if __name__ == '__main__':
    main()