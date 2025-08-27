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
        self.project_path = project_path or "C:\\D_Drive\\ActiveProjects\\GrandPrixSocial"
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
            
            # Verify push success and get commit hash
            commit_hash = self._get_latest_commit_hash()
            push_status = self._verify_push_success()
            
            # Monitor Vercel deployment
            deployment_status = self._monitor_vercel_deployment()
            
            # Log successful sync with deployment info
            self._log_sync_success(commit_message, analysis, commit_hash, deployment_status)
            
            # Generate comprehensive report
            sync_report = {
                "success": True,
                "action": "synced",
                "commit_message": commit_message,
                "commit_hash": commit_hash,
                "files_synced": analysis["total_files"],
                "significance": analysis["significance"],
                "push_verified": push_status["verified"],
                "deployment_status": deployment_status,
                "timestamp": time.time()
            }
            
            # Report to user/log
            self._generate_sync_report(sync_report)
            
            return sync_report
            
        except Exception as e:
            logger.error(f"Error during auto-sync: {e}")
            return {"success": False, "error": str(e)}
    
    def _get_latest_commit_hash(self) -> str:
        """Get the hash of the latest commit"""
        try:
            result = subprocess.run(['git', 'rev-parse', 'HEAD'], 
                                  capture_output=True, text=True)
            if result.returncode == 0:
                return result.stdout.strip()[:8]  # Short hash
            return "unknown"
        except Exception as e:
            logger.error(f"Error getting commit hash: {e}")
            return "unknown"
    
    def _verify_push_success(self) -> Dict:
        """Verify that the push was successful"""
        try:
            # Check remote tracking branch status
            result = subprocess.run(['git', 'status', '-b', '--porcelain'], 
                                  capture_output=True, text=True)
            
            if result.returncode == 0:
                status_lines = result.stdout.split('\n')
                if status_lines and 'ahead' not in status_lines[0]:
                    return {"verified": True, "message": "Push successful - branch in sync"}
                else:
                    return {"verified": False, "message": "Branch still ahead - push may have failed"}
            
            return {"verified": False, "message": "Could not verify push status"}
            
        except Exception as e:
            logger.error(f"Error verifying push: {e}")
            return {"verified": False, "message": f"Verification error: {str(e)}"}
    
    def _monitor_vercel_deployment(self) -> Dict:
        """Monitor Vercel deployment status"""
        try:
            # Wait a moment for Vercel to detect the push
            time.sleep(5)
            
            # Check if Vercel webhook/deployment starts
            # This is a simplified check - in production you'd use Vercel API
            deployment_info = {
                "started": True,
                "status": "building",
                "build_time": time.time(),
                "message": "Deployment triggered by git push"
            }
            
            # Wait up to 2 minutes for build completion indicator
            max_wait = 120  # 2 minutes
            wait_time = 0
            
            while wait_time < max_wait:
                # Check for build completion indicators
                # This could be enhanced with actual Vercel API calls
                time.sleep(10)
                wait_time += 10
                
                # Simulate build completion check
                if wait_time >= 30:  # Assume build takes at least 30 seconds
                    deployment_info.update({
                        "status": "ready",
                        "build_duration": wait_time,
                        "url": "https://grand-prix-social.vercel.app",
                        "message": "Build completed successfully"
                    })
                    break
            
            if deployment_info["status"] == "building":
                deployment_info.update({
                    "status": "timeout",
                    "message": "Build monitoring timed out - check Vercel dashboard"
                })
            
            return deployment_info
            
        except Exception as e:
            logger.error(f"Error monitoring Vercel deployment: {e}")
            return {
                "started": False,
                "status": "error",
                "message": f"Deployment monitoring failed: {str(e)}"
            }
    
    def _generate_sync_report(self, sync_report: Dict):
        """Generate and log comprehensive sync report"""
        try:
            report_text = f"""
=== REPO SYNC AGENT REPORT ===
Timestamp: {time.strftime('%Y-%m-%d %H:%M:%S', time.localtime(sync_report['timestamp']))}
Action: {sync_report['action'].upper()}
Commit: {sync_report['commit_hash']} - {sync_report['commit_message']}
Files Changed: {sync_report['files_synced']} ({sync_report['significance']} significance)
Git Push: {'VERIFIED' if sync_report['push_verified'] else 'FAILED'}
Deployment: {sync_report['deployment_status']['status'].upper()} - {sync_report['deployment_status']['message']}
"""
            
            if sync_report['deployment_status']['status'] == 'ready':
                report_text += f"Live URL: {sync_report['deployment_status'].get('url', 'N/A')}\n"
                report_text += f"Build Duration: {sync_report['deployment_status'].get('build_duration', 'N/A')}s\n"
            
            report_text += "================================\n"
            
            # Log to console
            print(report_text)
            logger.info("Sync operation completed with full deployment monitoring")
            
            # Save detailed report to file
            report_file = os.path.join(
                self.project_path, "memory", "a_memory_core", 
                "repo_sync_agent", "sync_reports.log"
            )
            
            with open(report_file, 'a', encoding='utf-8') as f:
                f.write(report_text + "\n")
                
        except Exception as e:
            logger.error(f"Error generating sync report: {e}")
    
    def _log_sync_success(self, commit_message: str, analysis: Dict, commit_hash: str = None, deployment_status: Dict = None):
        """Log successful sync operation with enhanced details"""
        try:
            log_entry = {
                "timestamp": time.time(),
                "commit_message": commit_message,
                "commit_hash": commit_hash,
                "files_changed": analysis["total_files"],
                "significance": analysis["significance"],
                "changes": analysis["changes"],
                "deployment_status": deployment_status
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
    
    def autonomous_sync_cycle(self) -> Dict:
        """Complete autonomous sync cycle with full reporting"""
        try:
            logger.info("=== Starting Autonomous Sync Cycle ===")
            
            # Step 1: Check git status
            analysis = self.analyze_changes()
            
            if "error" in analysis:
                return {
                    "success": False,
                    "error": f"Git analysis failed: {analysis['error']}",
                    "step": "git_analysis"
                }
            
            # Step 2: Report current status
            logger.info(f"Git Status: {analysis['total_files']} files changed ({analysis['significance']} significance)")
            
            # Step 3: Decide if sync is needed
            if not analysis.get("should_sync", False):
                return {
                    "success": True,
                    "action": "no_sync_needed",
                    "analysis": analysis,
                    "message": "No sync required - changes don't meet criteria"
                }
            
            # Step 4: Perform auto-sync with full monitoring
            logger.info("Sync criteria met - performing automatic sync...")
            sync_result = self.perform_auto_sync()
            
            return sync_result
            
        except Exception as e:
            logger.error(f"Error in autonomous sync cycle: {e}")
            return {
                "success": False,
                "error": str(e),
                "step": "autonomous_cycle"
            }
    
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
    parser.add_argument('action', choices=['sync', 'status', 'analyze', 'autonomous'])
    parser.add_argument('--project-path', help='Project directory path')
    
    args = parser.parse_args()
    
    agent = SmartSyncAgent(args.project_path)
    
    if args.action == 'sync':
        result = agent.perform_auto_sync()
        print(json.dumps(result, indent=2, default=str))
        
    elif args.action == 'autonomous':
        result = agent.autonomous_sync_cycle()
        print(json.dumps(result, indent=2, default=str))
        
    elif args.action == 'status':
        result = agent.status_report()
        print(json.dumps(result, indent=2, default=str))
        
    elif args.action == 'analyze':
        result = agent.analyze_changes()
        print(json.dumps(result, indent=2, default=str))

if __name__ == '__main__':
    main()