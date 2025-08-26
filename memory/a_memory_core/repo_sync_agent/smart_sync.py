#!/usr/bin/env python3
"""
Smart Auto-Sync Agent for Grand Prix Social
Automatically commits and pushes changes based on intelligent criteria
"""

import os
import json
import time
import subprocess
import logging
from typing import Dict, List, Tuple
from pathlib import Path

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger('smart_sync')

class SmartSyncAgent:
    """
    Intelligent sync agent that automatically commits and pushes changes
    based on the amount and type of changes detected
    """
    
    def __init__(self, project_path: str = None):
        self.project_path = project_path or "D:\\ActiveProjects\\GrandPrixSocial"
        self.config_path = os.path.join(
            self.project_path, "memory", "a_memory_core", 
            "repo_sync_agent", "auto_sync_config.json"
        )
        self.load_config()
        
    def load_config(self):
        """Load auto-sync configuration"""
        try:
            with open(self.config_path, 'r') as f:
                data = json.load(f)
                self.config = data.get('auto_sync_settings', {})
        except Exception as e:
            logger.error(f"Error loading config: {e}")
            # Default configuration
            self.config = {
                "enabled": True,
                "sync_threshold": {"files_changed": 5, "minutes_elapsed": 30},
                "auto_commit_patterns": {"general": "Auto-sync: {description}"}
            }
    
    def analyze_changes(self) -> Dict:
        """
        Analyze current repository changes to determine if sync is needed
        """
        try:
            os.chdir(self.project_path)
            
            # Get git status
            result = subprocess.run(['git', 'status', '--porcelain'], 
                                  capture_output=True, text=True)
            
            if result.returncode != 0:
                return {"error": "Git status failed"}
            
            lines = result.stdout.strip().split('\\n') if result.stdout.strip() else []
            
            # Analyze changes by type
            changes = {
                "modified": [],
                "added": [],
                "deleted": [],
                "untracked": []
            }
            
            for line in lines:
                if not line:
                    continue
                    
                status = line[:2]
                filename = line[3:]
                
                # Skip excluded patterns
                if self._is_excluded(filename):
                    continue
                
                if 'M' in status:
                    changes["modified"].append(filename)
                elif 'A' in status:
                    changes["added"].append(filename)
                elif 'D' in status:
                    changes["deleted"].append(filename)
                elif '?' in status:
                    changes["untracked"].append(filename)
            
            # Calculate significance
            total_changes = sum(len(v) for v in changes.values())
            
            # Determine change significance
            significance = self._calculate_significance(changes)
            
            return {
                "changes": changes,
                "total_files": total_changes,
                "significance": significance,
                "should_sync": self._should_auto_sync(total_changes, significance)
            }
            
        except Exception as e:
            logger.error(f"Error analyzing changes: {e}")
            return {"error": str(e)}
    
    def _is_excluded(self, filename: str) -> bool:
        """Check if file should be excluded from auto-sync"""
        exclude_patterns = self.config.get("exclude_patterns", [])
        
        for pattern in exclude_patterns:
            if pattern.endswith("/**"):
                if filename.startswith(pattern[:-3]):
                    return True
            elif pattern.endswith("*"):
                if filename.startswith(pattern[:-1]):
                    return True
            elif pattern == filename:
                return True
        
        return False
    
    def _calculate_significance(self, changes: Dict) -> str:
        """
        Calculate the significance level of changes
        Returns: 'low', 'medium', 'high'
        """
        # Check for significant file types
        significant_files = 0
        
        all_files = []
        for file_list in changes.values():
            all_files.extend(file_list)
        
        for filename in all_files:
            if any(filename.endswith(ext) for ext in ['.tsx', '.ts', '.js', '.jsx']):
                significant_files += 2  # UI/Logic files are more significant
            elif any(filename.endswith(ext) for ext in ['.json', '.md']):
                significant_files += 1  # Config/docs are moderately significant
        
        # Determine significance
        if significant_files >= 10:
            return "high"
        elif significant_files >= 5:
            return "medium"
        else:
            return "low"
    
    def _should_auto_sync(self, total_files: int, significance: str) -> bool:
        """
        Determine if auto-sync should be triggered
        """
        if not self.config.get("enabled", True):
            return False
        
        threshold = self.config.get("sync_threshold", {})
        file_threshold = threshold.get("files_changed", 5)
        
        # Always sync high significance changes
        if significance == "high":
            return True
        
        # Sync medium significance if enough files changed
        if significance == "medium" and total_files >= file_threshold // 2:
            return True
        
        # Sync low significance only if many files changed
        if significance == "low" and total_files >= file_threshold:
            return True
        
        return False
    
    def generate_commit_message(self, changes: Dict, significance: str) -> str:
        """
        Generate intelligent commit message based on changes
        """
        total_files = sum(len(v) for v in changes.values())
        
        # Analyze change types
        if changes["added"] and changes["modified"]:
            change_type = "Add new features and update existing components"
        elif changes["added"]:
            change_type = "Add new components and features"
        elif changes["modified"]:
            change_type = "Update existing components and functionality"
        elif changes["deleted"]:
            change_type = "Remove outdated components and cleanup"
        else:
            change_type = "Update project files"
        
        # Create descriptive message
        if significance == "high":
            return f"Major update: {change_type} ({total_files} files)"
        elif significance == "medium":
            return f"Update: {change_type} ({total_files} files)"
        else:
            return f"Minor update: {change_type} ({total_files} files)"
    
    def perform_auto_sync(self) -> Dict:
        """
        Perform automatic commit and push
        """
        try:
            # Analyze changes
            analysis = self.analyze_changes()
            
            if "error" in analysis:
                return {"success": False, "error": analysis["error"]}
            
            if not analysis.get("should_sync", False):
                return {
                    "success": True, 
                    "action": "skipped",
                    "reason": "Changes don't meet auto-sync criteria",
                    "analysis": analysis
                }
            
            # Generate commit message
            commit_message = self.generate_commit_message(
                analysis["changes"], 
                analysis["significance"]
            )
            
            # Stage changes (excluding memory files)
            os.chdir(self.project_path)
            
            # Add all changes except excluded patterns
            subprocess.run(['git', 'add', '.'], check=True)
            
            # Commit changes
            commit_result = subprocess.run([
                'git', 'commit', '-m', commit_message
            ], capture_output=True, text=True)
            
            if commit_result.returncode != 0:
                return {
                    "success": False, 
                    "error": f"Commit failed: {commit_result.stderr}"
                }
            
            # Push to remote
            push_result = subprocess.run([
                'git', 'push', 'origin', 'main'
            ], capture_output=True, text=True)
            
            if push_result.returncode != 0:
                return {
                    "success": False, 
                    "error": f"Push failed: {push_result.stderr}"
                }
            
            # Log successful sync
            self._log_sync_success(commit_message, analysis)
            
            return {
                "success": True,
                "action": "synced",
                "commit_message": commit_message,
                "files_synced": analysis["total_files"],
                "significance": analysis["significance"],
                "timestamp": time.time()
            }
            
        except Exception as e:
            logger.error(f"Error during auto-sync: {e}")
            return {"success": False, "error": str(e)}
    
    def _log_sync_success(self, commit_message: str, analysis: Dict):
        """Log successful sync operation"""
        try:
            log_entry = {
                "timestamp": time.time(),
                "commit_message": commit_message,
                "files_changed": analysis["total_files"],
                "significance": analysis["significance"],
                "changes": analysis["changes"]
            }
            
            log_file = os.path.join(
                self.project_path, "memory", "a_memory_core", 
                "repo_sync_agent", "sync_history.json"
            )
            
            # Load existing log
            if os.path.exists(log_file):
                with open(log_file, 'r') as f:
                    history = json.load(f)
            else:
                history = []
            
            history.append(log_entry)
            
            # Keep only last 50 entries
            if len(history) > 50:
                history = history[-50:]
            
            with open(log_file, 'w') as f:
                json.dump(history, f, indent=2)
                
        except Exception as e:
            logger.error(f"Error logging sync: {e}")
    
    def status_report(self) -> Dict:
        """Generate status report of sync agent"""
        try:
            analysis = self.analyze_changes()
            
            return {
                "agent_status": "active",
                "config_loaded": True,
                "auto_sync_enabled": self.config.get("enabled", True),
                "current_analysis": analysis,
                "project_path": self.project_path,
                "last_check": time.time()
            }
            
        except Exception as e:
            return {
                "agent_status": "error",
                "error": str(e)
            }

def main():
    """Main entry point for smart sync agent"""
    import argparse
    
    parser = argparse.ArgumentParser(description='Smart Auto-Sync Agent')
    parser.add_argument('action', choices=['sync', 'status', 'analyze'])
    parser.add_argument('--project-path', help='Project directory path')
    
    args = parser.parse_args()
    
    agent = SmartSyncAgent(args.project_path)
    
    if args.action == 'sync':
        result = agent.perform_auto_sync()
        print(json.dumps(result, indent=2, default=str))
        
    elif args.action == 'status':
        result = agent.status_report()
        print(json.dumps(result, indent=2, default=str))
        
    elif args.action == 'analyze':
        result = agent.analyze_changes()
        print(json.dumps(result, indent=2, default=str))

if __name__ == '__main__':
    main()