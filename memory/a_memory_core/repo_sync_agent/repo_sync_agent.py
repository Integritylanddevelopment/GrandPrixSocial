#!/usr/bin/env python3
"""
CommandCore OS Repository Sync Agent
Copyright (c) 2025 CommandCore OS. All rights reserved.

This agent handles synchronization between local and remote repositories
for the CommandCore OS project management system.
"""

import os
import json
import subprocess
import requests
import time
import logging
from typing import Dict, List, Optional, Union
from dataclasses import dataclass, asdict
from pathlib import Path
import shutil
import tempfile
import base64
import zipfile
from urllib.parse import urlparse
import asyncio
from datetime import datetime

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger('repo_sync_agent')

@dataclass
class SyncResult:
    """Result of a sync operation"""
    success: bool
    message: str
    files_changed: int = 0
    conflicts: List[str] = None
    branch: str = None
    commit_hash: str = None
    vercel_deployment: Optional[Dict] = None
    deployment_logs: Optional[List[str]] = None
    
    def __post_init__(self):
        if self.conflicts is None:
            self.conflicts = []
        if self.deployment_logs is None:
            self.deployment_logs = []

@dataclass
class CherryPickResult:
    """Result of a cherry-pick download operation"""
    success: bool
    message: str
    downloaded_files: List[str] = None
    download_path: str = None
    file_size: int = 0
    
    def __post_init__(self):
        if self.downloaded_files is None:
            self.downloaded_files = []

@dataclass
class RepoConfig:
    """Repository configuration"""
    project_id: str
    name: str
    local_path: str
    remote_url: Optional[str] = None
    branch: str = "main"
    sync_enabled: bool = True
    last_sync: Optional[float] = None
    credentials: Optional[Dict[str, str]] = None
    vercel_project_id: Optional[str] = None
    vercel_team_id: Optional[str] = None
    vercel_token: Optional[str] = None
    check_deployment: bool = True

class RepoSyncAgent:
    """
    Repository synchronization agent for CommandCore OS
    Handles both local and remote repository operations
    """
    
    def __init__(self, config_path: str = "repo_sync_config.json"):
        self.config_path = config_path
        self.configs: Dict[str, RepoConfig] = {}
        self.load_config()
        
    def load_config(self):
        """Load repository configurations from file"""
        try:
            if os.path.exists(self.config_path):
                with open(self.config_path, 'r') as f:
                    data = json.load(f)
                    self.configs = {
                        k: RepoConfig(**v) for k, v in data.items()
                    }
                logger.info(f"Loaded {len(self.configs)} repository configurations")
            else:
                logger.info("No existing configuration found, starting fresh")
        except Exception as e:
            logger.error(f"Error loading config: {e}")
            self.configs = {}
    
    def save_config(self):
        """Save repository configurations to file"""
        try:
            data = {k: asdict(v) for k, v in self.configs.items()}
            with open(self.config_path, 'w') as f:
                json.dump(data, f, indent=2)
            logger.info("Configuration saved successfully")
        except Exception as e:
            logger.error(f"Error saving config: {e}")
    
    def add_repository(self, config: RepoConfig) -> bool:
        """Add a new repository configuration"""
        try:
            self.configs[config.project_id] = config
            self.save_config()
            logger.info(f"Added repository: {config.name} ({config.project_id})")
            return True
        except Exception as e:
            logger.error(f"Error adding repository: {e}")
            return False
    
    def remove_repository(self, project_id: str) -> bool:
        """Remove a repository configuration"""
        try:
            if project_id in self.configs:
                del self.configs[project_id]
                self.save_config()
                logger.info(f"Removed repository: {project_id}")
                return True
            else:
                logger.warning(f"Repository not found: {project_id}")
                return False
        except Exception as e:
            logger.error(f"Error removing repository: {e}")
            return False
    
    def init_local_repo(self, project_id: str) -> SyncResult:
        """Initialize a local Git repository"""
        try:
            config = self.configs.get(project_id)
            if not config:
                return SyncResult(False, "Repository configuration not found")
            
            # Create directory if it doesn't exist
            os.makedirs(config.local_path, exist_ok=True)
            
            # Initialize git repo
            result = subprocess.run(
                ['git', 'init'],
                cwd=config.local_path,
                capture_output=True,
                text=True
            )
            
            if result.returncode != 0:
                return SyncResult(False, f"Git init failed: {result.stderr}")
            
            # Create initial commit if no commits exist
            if not os.path.exists(os.path.join(config.local_path, '.git', 'refs', 'heads')):
                with open(os.path.join(config.local_path, 'README.md'), 'w') as f:
                    f.write(f"# {config.name}\n\nCommandCore OS Project\n")
                
                subprocess.run(['git', 'add', '.'], cwd=config.local_path)
                subprocess.run([
                    'git', 'commit', '-m', 'Initial commit'
                ], cwd=config.local_path)
            
            return SyncResult(True, "Local repository initialized successfully")
            
        except Exception as e:
            logger.error(f"Error initializing local repo: {e}")
            return SyncResult(False, f"Failed to initialize: {str(e)}")
    
    def clone_remote_repo(self, project_id: str) -> SyncResult:
        """Clone a remote repository"""
        try:
            config = self.configs.get(project_id)
            if not config or not config.remote_url:
                return SyncResult(False, "Repository configuration or remote URL not found")
            
            # Remove existing directory if it exists
            if os.path.exists(config.local_path):
                shutil.rmtree(config.local_path)
            
            # Clone repository
            clone_cmd = ['git', 'clone', config.remote_url, config.local_path]
            if config.branch != 'main':
                clone_cmd.extend(['-b', config.branch])
            
            result = subprocess.run(
                clone_cmd,
                capture_output=True,
                text=True
            )
            
            if result.returncode != 0:
                return SyncResult(False, f"Git clone failed: {result.stderr}")
            
            # Get current commit hash
            commit_result = subprocess.run(
                ['git', 'rev-parse', 'HEAD'],
                cwd=config.local_path,
                capture_output=True,
                text=True
            )
            
            commit_hash = commit_result.stdout.strip() if commit_result.returncode == 0 else None
            
            config.last_sync = time.time()
            self.save_config()
            
            return SyncResult(
                True, 
                "Repository cloned successfully",
                commit_hash=commit_hash,
                branch=config.branch
            )
            
        except Exception as e:
            logger.error(f"Error cloning remote repo: {e}")
            return SyncResult(False, f"Failed to clone: {str(e)}")
    
    def sync_to_remote(self, project_id: str, commit_message: str = None) -> SyncResult:
        """Sync local changes to remote repository with Vercel deployment monitoring"""
        try:
            config = self.configs.get(project_id)
            if not config or not config.remote_url:
                return SyncResult(False, "Repository configuration or remote URL not found")
            
            if not os.path.exists(config.local_path):
                return SyncResult(False, "Local repository path does not exist")
            
            # Check if there are changes to commit
            status_result = subprocess.run(
                ['git', 'status', '--porcelain'],
                cwd=config.local_path,
                capture_output=True,
                text=True
            )
            
            if not status_result.stdout.strip():
                # Even if no local changes, check deployment status
                if config.check_deployment and config.vercel_project_id:
                    deployment_status = self.check_vercel_deployment(config)
                    return SyncResult(
                        True, 
                        "No changes to sync",
                        vercel_deployment=deployment_status.get('deployment'),
                        deployment_logs=deployment_status.get('logs', [])
                    )
                return SyncResult(True, "No changes to sync")
            
            # Add all changes
            subprocess.run(['git', 'add', '.'], cwd=config.local_path)
            
            # Commit changes
            if not commit_message:
                commit_message = f"CommandCore OS sync - {time.strftime('%Y-%m-%d %H:%M:%S')}"
            
            commit_result = subprocess.run(
                ['git', 'commit', '-m', commit_message],
                cwd=config.local_path,
                capture_output=True,
                text=True
            )
            
            if commit_result.returncode != 0:
                return SyncResult(False, f"Git commit failed: {commit_result.stderr}")
            
            # Push to remote
            push_result = subprocess.run(
                ['git', 'push', 'origin', config.branch],
                cwd=config.local_path,
                capture_output=True,
                text=True
            )
            
            if push_result.returncode != 0:
                return SyncResult(False, f"Git push failed: {push_result.stderr}")
            
            # Get commit hash
            commit_hash_result = subprocess.run(
                ['git', 'rev-parse', 'HEAD'],
                cwd=config.local_path,
                capture_output=True,
                text=True
            )
            
            commit_hash = commit_hash_result.stdout.strip() if commit_hash_result.returncode == 0 else None
            
            config.last_sync = time.time()
            self.save_config()
            
            # Check Vercel deployment after push
            deployment_info = None
            deployment_logs = []
            if config.check_deployment and config.vercel_project_id:
                logger.info("Checking Vercel deployment status...")
                time.sleep(5)  # Wait for Vercel to start deployment
                deployment_status = self.check_vercel_deployment(config)
                deployment_info = deployment_status.get('deployment')
                deployment_logs = deployment_status.get('logs', [])
                
                # If deployment failed, include error details
                if deployment_info and deployment_info.get('state') == 'ERROR':
                    return SyncResult(
                        False,
                        f"Git push successful but Vercel deployment failed: {deployment_info.get('error', 'Unknown error')}",
                        files_changed=len(status_result.stdout.strip().split('\n')),
                        commit_hash=commit_hash,
                        branch=config.branch,
                        vercel_deployment=deployment_info,
                        deployment_logs=deployment_logs
                    )
            
            return SyncResult(
                True,
                "Changes synced to remote successfully" + (" and deployed to Vercel" if deployment_info and deployment_info.get('state') == 'READY' else ""),
                files_changed=len(status_result.stdout.strip().split('\n')),
                commit_hash=commit_hash,
                branch=config.branch,
                vercel_deployment=deployment_info,
                deployment_logs=deployment_logs
            )
            
        except Exception as e:
            logger.error(f"Error syncing to remote: {e}")
            return SyncResult(False, f"Failed to sync: {str(e)}")
    
    def sync_from_remote(self, project_id: str) -> SyncResult:
        """Sync changes from remote repository"""
        try:
            config = self.configs.get(project_id)
            if not config or not config.remote_url:
                return SyncResult(False, "Repository configuration or remote URL not found")
            
            if not os.path.exists(config.local_path):
                return self.clone_remote_repo(project_id)
            
            # Fetch from remote
            fetch_result = subprocess.run(
                ['git', 'fetch', 'origin'],
                cwd=config.local_path,
                capture_output=True,
                text=True
            )
            
            if fetch_result.returncode != 0:
                return SyncResult(False, f"Git fetch failed: {fetch_result.stderr}")
            
            # Check for conflicts
            merge_result = subprocess.run(
                ['git', 'merge', f'origin/{config.branch}'],
                cwd=config.local_path,
                capture_output=True,
                text=True
            )
            
            conflicts = []
            if merge_result.returncode != 0:
                # Check for merge conflicts
                if "CONFLICT" in merge_result.stdout:
                    conflicts = self._parse_conflicts(merge_result.stdout)
                    return SyncResult(
                        False,
                        "Merge conflicts detected",
                        conflicts=conflicts
                    )
                else:
                    return SyncResult(False, f"Git merge failed: {merge_result.stderr}")
            
            # Get updated commit hash
            commit_result = subprocess.run(
                ['git', 'rev-parse', 'HEAD'],
                cwd=config.local_path,
                capture_output=True,
                text=True
            )
            
            commit_hash = commit_result.stdout.strip() if commit_result.returncode == 0 else None
            
            config.last_sync = time.time()
            self.save_config()
            
            return SyncResult(
                True,
                "Successfully synced from remote",
                commit_hash=commit_hash,
                branch=config.branch
            )
            
        except Exception as e:
            logger.error(f"Error syncing from remote: {e}")
            return SyncResult(False, f"Failed to sync: {str(e)}")
    
    def cherry_pick_download(self, repo_url: str, file_or_folder_path: str, 
                           destination: str, branch: str = "main") -> CherryPickResult:
        """
        Download specific files or folders from a GitHub repository without cloning
        
        Args:
            repo_url: GitHub repository URL (e.g., 'https://github.com/user/repo')
            file_or_folder_path: Path to file or folder in the repo (e.g., 'src/components/Button.tsx')
            destination: Local destination path where files should be downloaded
            branch: Branch to download from (default: 'main')
        
        Returns:
            CherryPickResult with download status and details
        """
        try:
            # Parse repository URL to extract owner and repo name
            parsed_url = urlparse(repo_url)
            if 'github.com' not in parsed_url.netloc:
                return CherryPickResult(False, "Only GitHub repositories are supported")
            
            path_parts = parsed_url.path.strip('/').split('/')
            if len(path_parts) < 2:
                return CherryPickResult(False, "Invalid GitHub repository URL")
            
            owner, repo = path_parts[0], path_parts[1]
            if repo.endswith('.git'):
                repo = repo[:-4]
            
            logger.info(f"Cherry-picking from {owner}/{repo}: {file_or_folder_path}")
            
            # GitHub API URLs
            api_base = f"https://api.github.com/repos/{owner}/{repo}"
            contents_url = f"{api_base}/contents/{file_or_folder_path}?ref={branch}"
            
            # Create destination directory
            os.makedirs(destination, exist_ok=True)
            
            downloaded_files = []
            total_size = 0
            
            # Make API request to get file/folder contents
            headers = {'Accept': 'application/vnd.github.v3+json'}
            response = requests.get(contents_url, headers=headers)
            
            if response.status_code == 404:
                return CherryPickResult(False, f"File or folder '{file_or_folder_path}' not found in repository")
            elif response.status_code != 200:
                return CherryPickResult(False, f"GitHub API error: {response.status_code} - {response.text}")
            
            content_data = response.json()
            
            # Handle single file
            if isinstance(content_data, dict) and content_data.get('type') == 'file':
                file_result = self._download_single_file(content_data, destination, file_or_folder_path)
                if file_result['success']:
                    downloaded_files.append(file_result['path'])
                    total_size += file_result['size']
                else:
                    return CherryPickResult(False, f"Failed to download file: {file_result['error']}")
            
            # Handle directory
            elif isinstance(content_data, list):
                for item in content_data:
                    if item['type'] == 'file':
                        file_result = self._download_single_file(item, destination, item['path'])
                        if file_result['success']:
                            downloaded_files.append(file_result['path'])
                            total_size += file_result['size']
                    elif item['type'] == 'dir':
                        # Recursively download subdirectories
                        subdir_result = self.cherry_pick_download(
                            repo_url, item['path'], destination, branch
                        )
                        if subdir_result.success:
                            downloaded_files.extend(subdir_result.downloaded_files)
                            total_size += subdir_result.file_size
            
            else:
                return CherryPickResult(False, "Unexpected content type from GitHub API")
            
            if downloaded_files:
                logger.info(f"Successfully downloaded {len(downloaded_files)} files ({total_size} bytes)")
                return CherryPickResult(
                    True,
                    f"Successfully downloaded {len(downloaded_files)} files",
                    downloaded_files=downloaded_files,
                    download_path=destination,
                    file_size=total_size
                )
            else:
                return CherryPickResult(False, "No files were downloaded")
                
        except requests.RequestException as e:
            logger.error(f"Network error during cherry-pick download: {e}")
            return CherryPickResult(False, f"Network error: {str(e)}")
        except Exception as e:
            logger.error(f"Error during cherry-pick download: {e}")
            return CherryPickResult(False, f"Download failed: {str(e)}")
    
    def _download_single_file(self, file_data: dict, destination: str, original_path: str) -> dict:
        """
        Download a single file from GitHub API response
        
        Args:
            file_data: GitHub API file object
            destination: Local destination directory
            original_path: Original path in repository
        
        Returns:
            Dict with success status, local path, size, and error info
        """
        try:
            file_name = file_data['name']
            download_url = file_data['download_url']
            file_size = file_data['size']
            
            # Preserve directory structure
            relative_dir = os.path.dirname(original_path)
            if relative_dir:
                local_dir = os.path.join(destination, relative_dir)
                os.makedirs(local_dir, exist_ok=True)
                local_path = os.path.join(local_dir, file_name)
            else:
                local_path = os.path.join(destination, file_name)
            
            # Download file content
            file_response = requests.get(download_url)
            if file_response.status_code == 200:
                with open(local_path, 'wb') as f:
                    f.write(file_response.content)
                
                logger.debug(f"Downloaded: {original_path} -> {local_path}")
                return {
                    'success': True,
                    'path': local_path,
                    'size': file_size,
                    'original_path': original_path
                }
            else:
                return {
                    'success': False,
                    'error': f"Failed to download {file_name}: HTTP {file_response.status_code}"
                }
                
        except Exception as e:
            return {
                'success': False,
                'error': f"Error downloading {file_data.get('name', 'unknown')}: {str(e)}"
            }
    
    def _parse_conflicts(self, merge_output: str) -> List[str]:
        """Parse merge conflicts from git output"""
        conflicts = []
        lines = merge_output.split('\n')
        for line in lines:
            if line.startswith('CONFLICT'):
                conflicts.append(line.strip())
        return conflicts
    
    def get_repo_status(self, project_id: str) -> Dict:
        """Get repository status information"""
        try:
            config = self.configs.get(project_id)
            if not config:
                return {"error": "Repository configuration not found"}
            
            if not os.path.exists(config.local_path):
                return {
                    "exists": False,
                    "status": "not_initialized",
                    "message": "Local repository not found"
                }
            
            # Get git status
            status_result = subprocess.run(
                ['git', 'status', '--porcelain'],
                cwd=config.local_path,
                capture_output=True,
                text=True
            )
            
            # Get current branch
            branch_result = subprocess.run(
                ['git', 'branch', '--show-current'],
                cwd=config.local_path,
                capture_output=True,
                text=True
            )
            
            # Get commit hash
            commit_result = subprocess.run(
                ['git', 'rev-parse', 'HEAD'],
                cwd=config.local_path,
                capture_output=True,
                text=True
            )
            
            # Get last commit message
            message_result = subprocess.run(
                ['git', 'log', '-1', '--pretty=format:%s'],
                cwd=config.local_path,
                capture_output=True,
                text=True
            )
            
            return {
                "exists": True,
                "status": "clean" if not status_result.stdout.strip() else "dirty",
                "branch": branch_result.stdout.strip(),
                "commit_hash": commit_result.stdout.strip(),
                "last_commit_message": message_result.stdout.strip(),
                "files_changed": len(status_result.stdout.strip().split('\n')) if status_result.stdout.strip() else 0,
                "last_sync": config.last_sync,
                "remote_url": config.remote_url
            }
            
        except Exception as e:
            logger.error(f"Error getting repo status: {e}")
            return {"error": f"Failed to get status: {str(e)}"}
    
    def list_repositories(self) -> List[Dict]:
        """List all configured repositories with their status"""
        repos = []
        for project_id, config in self.configs.items():
            status = self.get_repo_status(project_id)
            repos.append({
                "project_id": project_id,
                "name": config.name,
                "local_path": config.local_path,
                "remote_url": config.remote_url,
                "branch": config.branch,
                "sync_enabled": config.sync_enabled,
                "status": status
            })
        return repos
    
    def check_vercel_deployment(self, config: RepoConfig) -> Dict:
        """Check Vercel deployment status and get logs"""
        try:
            if not config.vercel_project_id or not config.vercel_token:
                return {"error": "Vercel configuration missing"}
            
            team_param = f"&teamId={config.vercel_team_id}" if config.vercel_team_id else ""
            
            headers = {
                'Authorization': f'Bearer {config.vercel_token}',
                'Content-Type': 'application/json'
            }
            
            # Get latest deployments
            deployments_url = f"https://api.vercel.com/v6/deployments?projectId={config.vercel_project_id}&limit=5{team_param}"
            response = requests.get(deployments_url, headers=headers)
            
            if response.status_code != 200:
                return {"error": f"Vercel API error: {response.status_code}"}
            
            deployments_data = response.json()
            deployments = deployments_data.get('deployments', [])
            
            if not deployments:
                return {"error": "No deployments found"}
            
            # Get the latest deployment
            latest_deployment = deployments[0]
            deployment_id = latest_deployment['uid']
            deployment_state = latest_deployment.get('state', 'UNKNOWN')
            deployment_url = latest_deployment.get('url')
            
            logger.info(f"Latest deployment: {deployment_id} - State: {deployment_state}")
            
            # Get deployment logs if there's an error
            logs = []
            if deployment_state in ['ERROR', 'FAILED']:
                logs_team_param = f"?teamId={config.vercel_team_id}" if config.vercel_team_id else ""
                logs_url = f"https://api.vercel.com/v2/deployments/{deployment_id}/events{logs_team_param}"
                logs_response = requests.get(logs_url, headers=headers)
                
                if logs_response.status_code == 200:
                    logs_data = logs_response.json()
                    events = logs_data if isinstance(logs_data, list) else logs_data.get('events', [])
                    for event in events:
                        if event.get('type') == 'stderr' or 'error' in event.get('payload', {}).get('text', '').lower():
                            logs.append({
                                'timestamp': event.get('timestamp'),
                                'type': event.get('type'),
                                'text': event.get('payload', {}).get('text', '')
                            })
            
            deployment_info = {
                'id': deployment_id,
                'state': deployment_state,
                'url': deployment_url,
                'created': latest_deployment.get('createdAt'),
                'ready': latest_deployment.get('readyState')
            }
            
            if deployment_state == 'ERROR':
                deployment_info['error'] = latest_deployment.get('error', {}).get('message', 'Unknown deployment error')
            
            return {
                'deployment': deployment_info,
                'logs': logs
            }
            
        except Exception as e:
            logger.error(f"Error checking Vercel deployment: {e}")
            return {"error": f"Failed to check deployment: {str(e)}"}
    
    def get_deployment_failure_summary(self, project_id: str) -> str:
        """Get a summary of deployment failures for Claude to fix"""
        try:
            config = self.configs.get(project_id)
            if not config:
                return "Repository configuration not found"
            
            deployment_status = self.check_vercel_deployment(config)
            
            if 'error' in deployment_status:
                return f"Deployment check failed: {deployment_status['error']}"
            
            deployment = deployment_status.get('deployment', {})
            logs = deployment_status.get('logs', [])
            
            if deployment.get('state') not in ['ERROR', 'FAILED']:
                return f"Deployment is {deployment.get('state', 'UNKNOWN')} - no failures detected"
            
            # Format failure summary for Claude
            summary = f"🚨 VERCEL DEPLOYMENT FAILURE DETECTED\n\n"
            summary += f"Project: {config.name}\n"
            summary += f"Deployment ID: {deployment.get('id')}\n"
            summary += f"State: {deployment.get('state')}\n"
            summary += f"Error: {deployment.get('error', 'Unknown error')}\n\n"
            
            if logs:
                summary += "ERROR LOGS:\n"
                for log in logs[-10:]:  # Last 10 error logs
                    timestamp = log.get('timestamp', 'unknown')
                    text = log.get('text', '')
                    summary += f"[{timestamp}] {text}\n"
            
            summary += "\n🔧 ACTION REQUIRED: Claude, please analyze these deployment errors and fix the issues."
            
            return summary
            
        except Exception as e:
            return f"Error generating deployment failure summary: {str(e)}"

def continuous_sync_mode(agent, project_id: str):
    """Run continuous sync monitoring every 15 minutes"""
    try:
        logger.info(f"🔄 REPO SYNC: Starting continuous sync mode for project: {project_id}")
        
        while True:
            try:
                logger.info(f"🔄 Checking for changes to sync...")
                
                # Sync to remote if there are changes
                result = agent.sync_to_remote(project_id, "Auto-sync: Memory system update")
                
                if result.success:
                    if result.files_changed > 0:
                        logger.info(f"✅ Auto-synced {result.files_changed} files to remote")
                        
                        # If deployment monitoring is enabled, show deployment status
                        if result.vercel_deployment:
                            deployment_state = result.vercel_deployment.get('state', 'UNKNOWN')
                            logger.info(f"🚀 Vercel deployment: {deployment_state}")
                    else:
                        logger.debug("No changes to sync")
                else:
                    logger.warning(f"❌ Sync failed: {result.message}")
                
                # Wait 15 minutes before next sync
                logger.debug("💤 Waiting 15 minutes until next sync check...")
                time.sleep(900)  # 15 minutes
                
            except Exception as e:
                logger.error(f"Error during continuous sync: {e}")
                time.sleep(60)  # Wait 1 minute on error, then retry
                
    except KeyboardInterrupt:
        logger.info("🛑 Continuous sync stopped by user")
    except Exception as e:
        logger.error(f"Fatal error in continuous sync mode: {e}")

def main():
    """Main entry point for the sync agent"""
    import argparse
    
    parser = argparse.ArgumentParser(description='CommandCore OS Repository Sync Agent')
    parser.add_argument('action', choices=['init', 'clone', 'sync-to', 'sync-from', 'status', 'list', 'cherry-pick', 'check-deployment', 'deployment-summary', 'continuous'])
    parser.add_argument('--project-id', help='Project ID')
    parser.add_argument('--name', help='Repository name')
    parser.add_argument('--local-path', help='Local repository path')
    parser.add_argument('--remote-url', help='Remote repository URL')
    parser.add_argument('--branch', default='main', help='Git branch')
    parser.add_argument('--message', help='Commit message')
    parser.add_argument('--file-path', help='File or folder path for cherry-pick download')
    parser.add_argument('--destination', help='Destination directory for cherry-pick download')
    parser.add_argument('--vercel-project-id', help='Vercel project ID for deployment monitoring')
    parser.add_argument('--vercel-token', help='Vercel API token for deployment monitoring')
    
    args = parser.parse_args()
    
    agent = RepoSyncAgent()
    
    if args.action == 'init':
        if args.name and args.local_path:
            config = RepoConfig(
                project_id=args.project_id,
                name=args.name,
                local_path=args.local_path,
                remote_url=args.remote_url,
                branch=args.branch
            )
            agent.add_repository(config)
            result = agent.init_local_repo(args.project_id)
        else:
            result = SyncResult(False, "Name and local path are required for init")
    
    elif args.action == 'clone':
        if args.name and args.local_path and args.remote_url:
            config = RepoConfig(
                project_id=args.project_id,
                name=args.name,
                local_path=args.local_path,
                remote_url=args.remote_url,
                branch=args.branch
            )
            agent.add_repository(config)
            result = agent.clone_remote_repo(args.project_id)
        else:
            result = SyncResult(False, "Name, local path, and remote URL are required for clone")
    
    elif args.action == 'sync-to':
        result = agent.sync_to_remote(args.project_id, args.message)
    
    elif args.action == 'sync-from':
        result = agent.sync_from_remote(args.project_id)
    
    elif args.action == 'cherry-pick':
        if args.remote_url and args.file_path and args.destination:
            result = agent.cherry_pick_download(
                args.remote_url, 
                args.file_path, 
                args.destination, 
                args.branch
            )
        else:
            result = CherryPickResult(False, "Remote URL, file path, and destination are required for cherry-pick")
    
    elif args.action == 'status':
        status = agent.get_repo_status(args.project_id)
        print(json.dumps(status, indent=2))
        return
    
    elif args.action == 'list':
        repos = agent.list_repositories()
        print(json.dumps(repos, indent=2))
        return
    
    elif args.action == 'check-deployment':
        if not args.project_id:
            print(json.dumps({"error": "Project ID required for deployment check"}, indent=2))
            return
        
        config = agent.configs.get(args.project_id)
        if config:
            deployment_status = agent.check_vercel_deployment(config)
            print(json.dumps(deployment_status, indent=2))
        else:
            print(json.dumps({"error": "Project not found"}, indent=2))
        return
    
    elif args.action == 'deployment-summary':
        if not args.project_id:
            print(json.dumps({"error": "Project ID required for deployment summary"}, indent=2))
            return
        
        summary = agent.get_deployment_failure_summary(args.project_id)
        print(summary)
        return
    
    elif args.action == 'continuous':
        if not args.project_id:
            print(json.dumps({"error": "Project ID required for continuous sync"}, indent=2))
            return
        
        # Start continuous sync mode
        continuous_sync_mode(agent, args.project_id)
        return
    
    else:
        result = SyncResult(False, f"Unknown action: {args.action}")
    
    # Handle both SyncResult and CherryPickResult
    if hasattr(result, '__dict__'):
        print(json.dumps(asdict(result), indent=2))
    else:
        print(json.dumps({"success": False, "message": "Unknown result type"}, indent=2))

if __name__ == '__main__':
    main()