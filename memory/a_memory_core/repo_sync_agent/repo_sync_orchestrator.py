#!/usr/bin/env python3
"""
Enterprise Repo Sync Orchestrator - Main Agent Controller
Coordinates CI/CD pipeline: Local Dev → Git Push → Vercel Deploy → Build Monitor → Error Fix Loop
"""

import os
import sys
import json
import time
import logging
from typing import Dict, Optional
from pathlib import Path

# Add the repo_sync_agent directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from vercel_monitor import VercelBuildMonitor
from error_corrector import BuildErrorCorrector  
from health_monitor import AgentHealthMonitor
from sync_logger import SyncLogger
from repository_creator import RepositoryCreator

class RepoSyncOrchestrator:
    """
    Enterprise-grade repo sync orchestrator that handles complete CI/CD pipeline
    """
    
    def __init__(self, project_path: str = None):
        self.project_path = project_path or "C:\\D_Drive\\ActiveProjects\\GrandPrixSocial"
        self.config_path = os.path.join(
            self.project_path, "memory", "a_memory_core", 
            "repo_sync_agent", "repo_sync_config.json"
        )
        
        # Initialize sub-components
        self.vercel_monitor = VercelBuildMonitor(self.project_path)
        self.error_corrector = BuildErrorCorrector(self.project_path)
        self.health_monitor = AgentHealthMonitor(self.project_path)
        self.logger = SyncLogger(self.project_path)
        self.repository_creator = RepositoryCreator(self.project_path)
        
        # Load configuration
        self.config = self._load_config()
        
        # Setup logging
        self._setup_logging()
        
    def _load_config(self) -> Dict:
        """Load repository sync configuration"""
        try:
            with open(self.config_path, 'r') as f:
                config_data = json.load(f)
                return config_data.get('grandprix_main', {})
        except Exception as e:
            self.logger.error(f"Failed to load config: {e}")
            return {
                "sync_enabled": True,
                "check_deployment": True,
                "max_retry_attempts": 3,
                "build_timeout": 600
            }
    
    def _setup_logging(self):
        """Configure enterprise logging"""
        logging.basicConfig(
            level=logging.INFO,
            format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
            handlers=[
                logging.StreamHandler(),
                logging.FileHandler(
                    os.path.join(self.project_path, "memory", "a_memory_core", 
                               "repo_sync_agent", "orchestrator.log")
                )
            ]
        )
        self.log = logging.getLogger('RepoSyncOrchestrator')
    
    def execute_cicd_pipeline(self) -> Dict:
        """
        Execute complete CI/CD pipeline with monitoring and error correction
        Returns: Final pipeline result
        """
        pipeline_start = time.time()
        self.log.info("🚀 Starting Enterprise CI/CD Pipeline")
        
        try:
            # Stage 1: Analyze repository changes
            self.log.info("Stage 1: Analyzing repository changes...")
            changes_analysis = self._analyze_repository_changes()
            
            if changes_analysis.get("error"):
                return self._pipeline_error("Stage 1 Failed", changes_analysis["error"])
                
            if not changes_analysis.get("should_deploy", False):
                return self._pipeline_skip("No deployment needed", changes_analysis)
            
            # Stage 2: Execute Git operations (commit + push)
            self.log.info("Stage 2: Executing Git operations...")
            git_result = self._execute_git_operations(changes_analysis)
            
            if not git_result.get("success", False):
                return self._pipeline_error("Stage 2 Failed", git_result.get("error"))
            
            # Stage 3: Monitor Vercel deployment with error correction loop
            self.log.info("Stage 3: Monitoring Vercel deployment...")
            deployment_result = self._monitor_deployment_with_correction(git_result["commit_hash"])
            
            # Stage 4: Generate final pipeline report
            pipeline_duration = int(time.time() - pipeline_start)
            
            return self._generate_pipeline_report(
                changes_analysis, git_result, deployment_result, pipeline_duration
            )
            
        except Exception as e:
            self.log.error(f"Pipeline execution failed: {e}")
            return self._pipeline_error("Pipeline Exception", str(e))
    
    def _analyze_repository_changes(self) -> Dict:
        """Analyze repository to determine deployment needs"""
        try:
            import subprocess
            
            os.chdir(self.project_path)
            
            # Get git status
            result = subprocess.run(['git', 'status', '--porcelain'], 
                                  capture_output=True, text=True)
            
            if result.returncode != 0:
                return {"error": f"Git status failed: {result.stderr}"}
            
            if not result.stdout.strip():
                return {"should_deploy": False, "reason": "No changes detected"}
            
            # Parse changes
            lines = result.stdout.strip().split('\n')
            changes = {"modified": [], "added": [], "deleted": [], "untracked": []}
            
            for line in lines:
                if len(line) < 3:
                    continue
                status, filename = line[:2], line[3:]
                
                if 'M' in status:
                    changes["modified"].append(filename)
                elif 'A' in status:
                    changes["added"].append(filename)
                elif 'D' in status:
                    changes["deleted"].append(filename)
                elif '?' in status:
                    changes["untracked"].append(filename)
            
            total_files = sum(len(v) for v in changes.values())
            
            return {
                "should_deploy": total_files > 0,
                "changes": changes,
                "total_files": total_files,
                "significance": self._calculate_change_significance(changes)
            }
            
        except Exception as e:
            return {"error": f"Repository analysis failed: {str(e)}"}
    
    def _calculate_change_significance(self, changes: Dict) -> str:
        """Calculate significance of changes for deployment prioritization"""
        all_files = []
        for file_list in changes.values():
            all_files.extend(file_list)
        
        score = 0
        for filename in all_files:
            if filename.endswith(('.tsx', '.ts', '.js', '.jsx')):
                score += 3  # High impact files
            elif filename.endswith(('.json', '.md', '.yml', '.yaml')):
                score += 1  # Config/docs
            elif filename.endswith(('.css', '.scss')):
                score += 2  # Styling
        
        if score >= 10:
            return "high"
        elif score >= 5:
            return "medium"
        else:
            return "low"
    
    def _execute_git_operations(self, changes_analysis: Dict) -> Dict:
        """Execute git add, commit, and push operations"""
        try:
            import subprocess
            
            os.chdir(self.project_path)
            
            # Generate commit message
            commit_msg = self._generate_commit_message(changes_analysis)
            
            # Stage all changes
            subprocess.run(['git', 'add', '.'], check=True)
            
            # Commit changes
            commit_result = subprocess.run([
                'git', 'commit', '-m', commit_msg
            ], capture_output=True, text=True)
            
            if commit_result.returncode != 0:
                return {"success": False, "error": f"Commit failed: {commit_result.stderr}"}
            
            # Get commit hash
            hash_result = subprocess.run(['git', 'rev-parse', 'HEAD'], 
                                       capture_output=True, text=True)
            commit_hash = hash_result.stdout.strip()[:8] if hash_result.returncode == 0 else "unknown"
            
            # Push to remote
            push_result = subprocess.run([
                'git', 'push', 'origin', 'main'
            ], capture_output=True, text=True)
            
            if push_result.returncode != 0:
                return {"success": False, "error": f"Push failed: {push_result.stderr}"}
            
            return {
                "success": True,
                "commit_hash": commit_hash,
                "commit_message": commit_msg
            }
            
        except Exception as e:
            return {"success": False, "error": f"Git operations failed: {str(e)}"}
    
    def _generate_commit_message(self, changes_analysis: Dict) -> str:
        """Generate intelligent commit message"""
        changes = changes_analysis.get("changes", {})
        significance = changes_analysis.get("significance", "low")
        total_files = changes_analysis.get("total_files", 0)
        
        if changes.get("added") and changes.get("modified"):
            change_type = "Add new features and update components"
        elif changes.get("added"):
            change_type = "Add new features"
        elif changes.get("modified"):
            change_type = "Update components"
        elif changes.get("deleted"):
            change_type = "Remove components and cleanup"
        else:
            change_type = "Update project"
        
        prefix = {"high": "Major", "medium": "Feature", "low": "Update"}[significance]
        
        return f"{prefix}: {change_type} ({total_files} files)\n\n🤖 Generated with [Claude Code](https://claude.ai/code)\n\nCo-Authored-By: Claude <noreply@anthropic.com>"
    
    def _monitor_deployment_with_correction(self, commit_hash: str) -> Dict:
        """Monitor deployment with automatic error correction loop"""
        max_attempts = self.config.get("max_retry_attempts", 3)
        
        for attempt in range(max_attempts):
            self.log.info(f"Deployment monitoring attempt {attempt + 1}/{max_attempts}")
            
            # Monitor build via Vercel API
            deployment_result = self.vercel_monitor.monitor_latest_deployment()
            
            if deployment_result.get("status") == "ready":
                self.log.info("✅ Build completed successfully!")
                return deployment_result
            
            elif deployment_result.get("status") == "failed":
                self.log.warning(f"❌ Build failed on attempt {attempt + 1}")
                
                if attempt < max_attempts - 1:
                    # Attempt automatic error correction
                    correction_result = self.error_corrector.auto_correct_build_errors(
                        deployment_result.get("build_logs", [])
                    )
                    
                    if correction_result.get("fixed"):
                        self.log.info("🔧 Auto-correction applied, retrying...")
                        # Continue loop for next attempt
                        continue
                    else:
                        # Present errors to Claude for manual fixing
                        return self._present_errors_to_claude(deployment_result)
                else:
                    # Final attempt failed - present to Claude
                    return self._present_errors_to_claude(deployment_result)
            
            else:
                # Other status (building, timeout, etc.)
                self.log.info(f"Build status: {deployment_result.get('status', 'unknown')}")
                if attempt < max_attempts - 1:
                    time.sleep(30)  # Wait before retry
                    continue
        
        # All attempts exhausted
        return {"status": "timeout", "message": "Build monitoring timed out after max attempts"}
    
    def _present_errors_to_claude(self, deployment_result: Dict) -> Dict:
        """Present build errors to Claude for manual fixing"""
        build_logs = deployment_result.get("build_logs", [])
        dashboard_url = deployment_result.get("dashboard_url", "")
        
        print("\n" + "="*70)
        print("🔴 BUILD FAILED - CLAUDE INTERVENTION REQUIRED")
        print("="*70)
        print(f"Dashboard: {dashboard_url}")
        print("\nBuild Errors:")
        print("-" * 50)
        
        for log in build_logs[-20:]:  # Show last 20 log entries
            print(log)
        
        print("-" * 50)
        print("Please fix these errors and commit your changes.")
        print("The repo sync agent will automatically monitor the next deployment.")
        print("="*70 + "\n")
        
        return {
            "status": "claude_intervention_required",
            "build_logs": build_logs,
            "dashboard_url": dashboard_url,
            "message": "Build errors presented to Claude for manual correction"
        }
    
    def _generate_pipeline_report(self, changes_analysis: Dict, git_result: Dict, 
                                 deployment_result: Dict, pipeline_duration: int) -> Dict:
        """Generate comprehensive pipeline execution report"""
        
        report = {
            "pipeline_success": deployment_result.get("status") == "ready",
            "pipeline_duration": pipeline_duration,
            "commit_hash": git_result.get("commit_hash"),
            "commit_message": git_result.get("commit_message"),
            "files_changed": changes_analysis.get("total_files", 0),
            "change_significance": changes_analysis.get("significance", "unknown"),
            "deployment_status": deployment_result.get("status"),
            "deployment_url": deployment_result.get("url"),
            "build_duration": deployment_result.get("build_duration", 0),
            "timestamp": time.time()
        }
        
        # Log comprehensive report
        self.logger.log_pipeline_execution(report)
        
        # Print summary to console
        if report["pipeline_success"]:
            print(f"\n🎉 DEPLOYMENT SUCCESSFUL!")
            print(f"📱 Live URL: {report['deployment_url']}")
            print(f"⏱️  Total Pipeline Duration: {pipeline_duration}s")
            print(f"🏗️  Build Duration: {report['build_duration']}s")
            print(f"📦 Commit: {report['commit_hash']} - {report['files_changed']} files")
        else:
            print(f"\n⚠️  Pipeline Status: {report['deployment_status']}")
        
        return report
    
    def _pipeline_error(self, stage: str, error: str) -> Dict:
        """Handle pipeline errors with proper logging"""
        self.log.error(f"{stage}: {error}")
        
        return {
            "pipeline_success": False,
            "stage": stage,
            "error": error,
            "timestamp": time.time()
        }
    
    def _pipeline_skip(self, reason: str, analysis: Dict) -> Dict:
        """Handle pipeline skip scenarios"""
        self.log.info(f"Pipeline skipped: {reason}")
        
        return {
            "pipeline_success": True,
            "action": "skipped",
            "reason": reason,
            "analysis": analysis,
            "timestamp": time.time()
        }
    
    def health_check(self) -> Dict:
        """Perform comprehensive health check of the agent"""
        return self.health_monitor.perform_health_check()
    
    def force_deployment(self) -> Dict:
        """Force deployment even with no changes"""
        self.log.info("🚀 Force deployment initiated")
        
        # Create deployment trigger file
        trigger_file = os.path.join(self.project_path, "DEPLOYMENT_TRIGGER.txt")
        with open(trigger_file, 'w') as f:
            f.write(f"Force deployment: {time.strftime('%Y-%m-%d %H:%M:%S')}\n")
        
        # Execute CI/CD pipeline
        return self.execute_cicd_pipeline()
    
    def create_new_repository(self, repo_name: str, description: str = "", 
                            private: bool = False, framework: str = "nextjs") -> Dict:
        """Create complete new repository with GitHub and Vercel setup"""
        self.log.info(f"🆕 Creating new repository: {repo_name}")
        
        return self.repository_creator.create_complete_repository(
            repo_name, description, private, framework
        )
    
    def setup_existing_repository(self, github_url: str, local_path: str, 
                                framework: str = "nextjs") -> Dict:
        """Clone and set up enterprise sync for existing repository"""
        self.log.info(f"🔄 Setting up existing repository: {github_url}")
        
        return self.repository_creator.clone_and_setup_existing(
            github_url, local_path, framework
        )

def main():
    """Main entry point for enterprise repo sync orchestrator"""
    import argparse
    
    parser = argparse.ArgumentParser(description='Enterprise Repo Sync Orchestrator')
    parser.add_argument('action', choices=['deploy', 'health', 'force', 'create', 'clone'], 
                       help='Action to perform')
    parser.add_argument('--project-path', help='Project directory path')
    parser.add_argument('--repo-name', help='Repository name for creation')
    parser.add_argument('--github-url', help='GitHub URL for cloning')
    parser.add_argument('--description', help='Repository description', default="")
    parser.add_argument('--private', action='store_true', help='Create private repository')
    parser.add_argument('--framework', choices=['nextjs', 'react', 'python'], default='nextjs')
    
    args = parser.parse_args()
    
    orchestrator = RepoSyncOrchestrator(args.project_path)
    
    if args.action == 'deploy':
        result = orchestrator.execute_cicd_pipeline()
    elif args.action == 'health':
        result = orchestrator.health_check()
    elif args.action == 'force':
        result = orchestrator.force_deployment()
    elif args.action == 'create':
        if not args.repo_name:
            print("Error: --repo-name required for repository creation")
            return
        result = orchestrator.create_new_repository(
            args.repo_name, args.description, args.private, args.framework
        )
    elif args.action == 'clone':
        if not args.github_url:
            print("Error: --github-url required for repository cloning")
            return
        result = orchestrator.setup_existing_repository(
            args.github_url, args.project_path or os.getcwd(), args.framework
        )
    
    # Output result as JSON for programmatic consumption
    print(json.dumps(result, indent=2, default=str))

if __name__ == '__main__':
    main()