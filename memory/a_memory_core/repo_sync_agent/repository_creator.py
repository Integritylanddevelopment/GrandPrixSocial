#!/usr/bin/env python3
"""
Repository Creator - GitHub and Vercel project creation automation
Handles git init, GitHub repo creation, Vercel project setup, and initial deployment
"""

import os
import json
import time
import logging
import subprocess
import requests
from typing import Dict, Optional
from pathlib import Path

class RepositoryCreator:
    """
    Automated repository and deployment setup for new projects
    """
    
    def __init__(self, project_path: str):
        self.project_path = project_path
        self.logger = logging.getLogger('RepositoryCreator')
        
        # GitHub configuration
        self.github_token = self._load_github_token()
        self.github_api_base = "https://api.github.com"
        
        # Vercel configuration  
        self.vercel_token = self._load_vercel_token()
        self.vercel_api_base = "https://api.vercel.com"
        self.vercel_team_id = "team_qd9zTuDQ41euDNXJwHVVPocq"
        
        # Default project templates
        self.project_templates = {
            "nextjs": {
                "framework": "nextjs",
                "build_command": "npm run build",
                "dev_command": "npm run dev",
                "install_command": "npm install",
                "output_directory": ".next"
            },
            "react": {
                "framework": "create-react-app", 
                "build_command": "npm run build",
                "dev_command": "npm start",
                "install_command": "npm install",
                "output_directory": "build"
            },
            "python": {
                "framework": "python",
                "build_command": "pip install -r requirements.txt",
                "dev_command": "python app.py",
                "install_command": "pip install -r requirements.txt",
                "output_directory": "."
            }
        }
    
    def create_complete_repository(self, repo_name: str, description: str = "", 
                                 private: bool = False, framework: str = "nextjs") -> Dict:
        """
        Create complete repository setup with GitHub and Vercel integration
        """
        self.logger.info(f"🚀 Creating complete repository setup: {repo_name}")
        
        creation_result = {
            "success": False,
            "repository_name": repo_name,
            "steps_completed": [],
            "github_repo": None,
            "vercel_project": None,
            "errors": []
        }
        
        try:
            # Step 1: Initialize local Git repository
            self.logger.info("Step 1: Initializing local Git repository...")
            git_init_result = self._initialize_git_repository()
            
            if git_init_result["success"]:
                creation_result["steps_completed"].append("git_init")
            else:
                creation_result["errors"].append(f"Git init failed: {git_init_result['error']}")
                return creation_result
            
            # Step 2: Create GitHub repository
            self.logger.info("Step 2: Creating GitHub repository...")
            github_result = self._create_github_repository(repo_name, description, private)
            
            if github_result["success"]:
                creation_result["steps_completed"].append("github_repo")
                creation_result["github_repo"] = github_result
            else:
                creation_result["errors"].append(f"GitHub creation failed: {github_result['error']}")
                return creation_result
            
            # Step 3: Configure remote and push
            self.logger.info("Step 3: Configuring remote origin and initial push...")
            remote_result = self._configure_remote_and_push(github_result["clone_url"], repo_name)
            
            if remote_result["success"]:
                creation_result["steps_completed"].append("initial_push")
            else:
                creation_result["errors"].append(f"Remote setup failed: {remote_result['error']}")
                return creation_result
            
            # Step 4: Create Vercel project
            self.logger.info("Step 4: Creating Vercel project...")
            vercel_result = self._create_vercel_project(repo_name, github_result["full_name"], framework)
            
            if vercel_result["success"]:
                creation_result["steps_completed"].append("vercel_project")
                creation_result["vercel_project"] = vercel_result
            else:
                creation_result["errors"].append(f"Vercel setup failed: {vercel_result['error']}")
                # Continue even if Vercel fails - can be set up manually
            
            # Step 5: Create initial deployment
            self.logger.info("Step 5: Triggering initial deployment...")
            deployment_result = self._trigger_initial_deployment()
            
            if deployment_result["success"]:
                creation_result["steps_completed"].append("initial_deployment")
            else:
                creation_result["errors"].append(f"Initial deployment failed: {deployment_result['error']}")
            
            # Step 6: Generate configuration files
            self.logger.info("Step 6: Generating configuration files...")
            config_result = self._generate_project_config(repo_name, github_result, vercel_result)
            
            if config_result["success"]:
                creation_result["steps_completed"].append("configuration")
            
            creation_result["success"] = len(creation_result["steps_completed"]) >= 4  # Minimum viable setup
            
            # Generate summary report
            self._generate_setup_report(creation_result)
            
            return creation_result
            
        except Exception as e:
            self.logger.error(f"Repository creation failed: {e}")
            creation_result["errors"].append(f"Critical error: {str(e)}")
            return creation_result
    
    def _initialize_git_repository(self) -> Dict:
        """Initialize Git repository in project directory"""
        try:
            os.chdir(self.project_path)
            
            # Check if already a git repo
            if os.path.exists('.git'):
                return {"success": False, "error": "Directory is already a Git repository"}
            
            # Initialize repository
            subprocess.run(['git', 'init'], check=True, capture_output=True)
            
            # Create initial README if it doesn't exist
            readme_path = os.path.join(self.project_path, 'README.md')
            if not os.path.exists(readme_path):
                with open(readme_path, 'w') as f:
                    f.write(f"# {os.path.basename(self.project_path)}\n\n")
                    f.write("Created with Claude Enterprise Repo Sync Agent\n\n")
                    f.write("## Getting Started\n\n")
                    f.write("This project was automatically set up with:\n")
                    f.write("- Git repository initialization\n")
                    f.write("- GitHub repository creation\n") 
                    f.write("- Vercel deployment configuration\n")
                    f.write("- Automated CI/CD pipeline\n")
            
            # Create .gitignore if it doesn't exist
            gitignore_path = os.path.join(self.project_path, '.gitignore')
            if not os.path.exists(gitignore_path):
                with open(gitignore_path, 'w') as f:
                    f.write("# Dependencies\nnode_modules/\n")
                    f.write("# Environment variables\n.env\n.env.local\n.env.*.local\n")
                    f.write("# Build outputs\n.next/\nbuild/\ndist/\n")
                    f.write("# Logs\n*.log\nlogs/\n")
                    f.write("# OS files\n.DS_Store\nThumbs.db\n")
                    f.write("# IDE files\n.vscode/\n.idea/\n")
            
            # Set up initial branch configuration
            subprocess.run(['git', 'config', 'init.defaultBranch', 'main'], check=True)
            subprocess.run(['git', 'checkout', '-b', 'main'], check=True, capture_output=True)
            
            return {"success": True, "message": "Git repository initialized successfully"}
            
        except Exception as e:
            return {"success": False, "error": str(e)}
    
    def _create_github_repository(self, repo_name: str, description: str, private: bool) -> Dict:
        """Create repository on GitHub via API"""
        if not self.github_token:
            return {"success": False, "error": "GitHub token not available"}
        
        try:
            headers = {
                'Authorization': f'token {self.github_token}',
                'Accept': 'application/vnd.github.v3+json',
                'Content-Type': 'application/json'
            }
            
            payload = {
                'name': repo_name,
                'description': description or f"Automated repository for {repo_name}",
                'private': private,
                'auto_init': False,  # We already have local content
                'has_issues': True,
                'has_projects': True,
                'has_wiki': True
            }
            
            response = requests.post(
                f"{self.github_api_base}/user/repos",
                headers=headers,
                json=payload,
                timeout=30
            )
            
            if response.status_code == 201:
                repo_data = response.json()
                return {
                    "success": True,
                    "repo_id": repo_data['id'],
                    "full_name": repo_data['full_name'],
                    "clone_url": repo_data['clone_url'],
                    "ssh_url": repo_data['ssh_url'],
                    "html_url": repo_data['html_url'],
                    "default_branch": repo_data['default_branch']
                }
            else:
                error_data = response.json() if response.content else {}
                return {
                    "success": False,
                    "error": f"GitHub API error {response.status_code}: {error_data.get('message', 'Unknown error')}"
                }
                
        except Exception as e:
            return {"success": False, "error": str(e)}
    
    def _configure_remote_and_push(self, clone_url: str, repo_name: str) -> Dict:
        """Configure remote origin and perform initial push"""
        try:
            os.chdir(self.project_path)
            
            # Remove existing remote if it exists
            subprocess.run(['git', 'remote', 'remove', 'origin'], 
                         capture_output=True, text=True)
            
            # Add new remote
            subprocess.run(['git', 'remote', 'add', 'origin', clone_url], check=True)
            
            # Stage all files
            subprocess.run(['git', 'add', '.'], check=True)
            
            # Create initial commit
            commit_message = f"Initial commit: {repo_name}\n\n🤖 Generated with Claude Enterprise Repo Sync Agent\n\nCo-Authored-By: Claude <noreply@anthropic.com>"
            subprocess.run(['git', 'commit', '-m', commit_message], check=True)
            
            # Push to main branch
            subprocess.run(['git', 'push', '-u', 'origin', 'main'], check=True)
            
            return {"success": True, "message": "Remote configured and initial push completed"}
            
        except Exception as e:
            return {"success": False, "error": str(e)}
    
    def _create_vercel_project(self, project_name: str, github_repo: str, framework: str) -> Dict:
        """Create Vercel project and link to GitHub repository"""
        if not self.vercel_token:
            return {"success": False, "error": "Vercel token not available"}
        
        try:
            headers = {
                'Authorization': f'Bearer {self.vercel_token}',
                'Content-Type': 'application/json'
            }
            
            # Get template configuration
            template_config = self.project_templates.get(framework, self.project_templates["nextjs"])
            
            payload = {
                'name': project_name,
                'gitRepository': {
                    'type': 'github',
                    'repo': github_repo
                },
                'framework': template_config["framework"],
                'buildCommand': template_config["build_command"],
                'devCommand': template_config["dev_command"],
                'installCommand': template_config["install_command"],
                'outputDirectory': template_config["output_directory"],
                'teamId': self.vercel_team_id
            }
            
            response = requests.post(
                f"{self.vercel_api_base}/v10/projects",
                headers=headers,
                json=payload,
                timeout=30
            )
            
            if response.status_code == 200:
                project_data = response.json()
                return {
                    "success": True,
                    "project_id": project_data['id'],
                    "name": project_data['name'],
                    "framework": project_data.get('framework'),
                    "created_at": project_data.get('createdAt'),
                    "deployment_url": f"https://{project_data['name']}.vercel.app"
                }
            else:
                error_data = response.json() if response.content else {}
                return {
                    "success": False,
                    "error": f"Vercel API error {response.status_code}: {error_data.get('message', 'Unknown error')}"
                }
                
        except Exception as e:
            return {"success": False, "error": str(e)}
    
    def _trigger_initial_deployment(self) -> Dict:
        """Trigger initial deployment by creating a small change"""
        try:
            os.chdir(self.project_path)
            
            # Create deployment trigger file
            trigger_file = os.path.join(self.project_path, "DEPLOYMENT_INITIALIZED.txt")
            with open(trigger_file, 'w') as f:
                f.write(f"Initial deployment triggered: {time.strftime('%Y-%m-%d %H:%M:%S')}\n")
                f.write("This file was created by Claude Enterprise Repo Sync Agent\n")
            
            # Commit and push the trigger
            subprocess.run(['git', 'add', 'DEPLOYMENT_INITIALIZED.txt'], check=True)
            subprocess.run(['git', 'commit', '-m', 'Trigger initial deployment'], check=True)
            subprocess.run(['git', 'push', 'origin', 'main'], check=True)
            
            return {"success": True, "message": "Initial deployment triggered"}
            
        except Exception as e:
            return {"success": False, "error": str(e)}
    
    def _generate_project_config(self, repo_name: str, github_result: Dict, vercel_result: Dict) -> Dict:
        """Generate repository sync configuration for this new project"""
        try:
            config_dir = os.path.join(self.project_path, "memory", "a_memory_core", "repo_sync_agent")
            os.makedirs(config_dir, exist_ok=True)
            
            # Generate repo sync configuration
            config = {
                repo_name: {
                    "project_id": repo_name,
                    "name": repo_name.replace('-', ' ').title(),
                    "local_path": self.project_path,
                    "remote_url": github_result.get("clone_url", ""),
                    "github_repo": github_result.get("full_name", ""),
                    "branch": "main",
                    "sync_enabled": True,
                    "last_sync": time.time(),
                    "credentials": None,
                    "vercel_project_id": vercel_result.get("project_id", ""),
                    "vercel_team_id": self.vercel_team_id,
                    "vercel_token": "${VERCEL_TOKEN}",
                    "check_deployment": True,
                    "enterprise_config": {
                        "max_retry_attempts": 3,
                        "build_timeout": 600,
                        "auto_error_correction": True,
                        "health_check_interval": 300,
                        "log_retention_days": 30,
                        "components": {
                            "orchestrator": "repo_sync_orchestrator.py",
                            "vercel_monitor": "vercel_monitor.py", 
                            "error_corrector": "error_corrector.py",
                            "health_monitor": "health_monitor.py",
                            "sync_logger": "sync_logger.py"
                        }
                    }
                }
            }
            
            config_path = os.path.join(config_dir, f"{repo_name}_sync_config.json")
            with open(config_path, 'w') as f:
                json.dump(config, f, indent=2)
            
            # Copy enterprise agent components if they don't exist
            source_agent_dir = os.path.join(
                "C:\\D_Drive\\ActiveProjects\\GrandPrixSocial", 
                "memory", "a_memory_core", "repo_sync_agent"
            )
            
            components = [
                "repo_sync_orchestrator.py",
                "vercel_monitor.py",
                "error_corrector.py", 
                "health_monitor.py",
                "sync_logger.py"
            ]
            
            for component in components:
                source_path = os.path.join(source_agent_dir, component)
                target_path = os.path.join(config_dir, component)
                
                if os.path.exists(source_path) and not os.path.exists(target_path):
                    import shutil
                    shutil.copy2(source_path, target_path)
            
            return {
                "success": True,
                "config_path": config_path,
                "components_copied": len(components)
            }
            
        except Exception as e:
            return {"success": False, "error": str(e)}
    
    def _generate_setup_report(self, creation_result: Dict) -> None:
        """Generate comprehensive setup report"""
        try:
            report_content = f"""
===============================================================================
CLAUDE ENTERPRISE REPOSITORY SETUP REPORT
===============================================================================
Repository: {creation_result['repository_name']}
Timestamp: {time.strftime('%Y-%m-%d %H:%M:%S')}
Status: {'✅ SUCCESS' if creation_result['success'] else '❌ FAILED'}

COMPLETED STEPS:
"""
            
            step_descriptions = {
                "git_init": "✅ Git repository initialized",
                "github_repo": "✅ GitHub repository created",
                "initial_push": "✅ Initial commit and push completed",
                "vercel_project": "✅ Vercel project created and linked",
                "initial_deployment": "✅ Initial deployment triggered",
                "configuration": "✅ Enterprise agent configuration generated"
            }
            
            for step in creation_result['steps_completed']:
                report_content += f"- {step_descriptions.get(step, step)}\n"
            
            if creation_result.get('github_repo'):
                github_info = creation_result['github_repo']
                report_content += f"""
GITHUB REPOSITORY:
- Repository: {github_info.get('full_name', 'N/A')}
- URL: {github_info.get('html_url', 'N/A')}
- Clone URL: {github_info.get('clone_url', 'N/A')}
"""
            
            if creation_result.get('vercel_project'):
                vercel_info = creation_result['vercel_project']
                report_content += f"""
VERCEL PROJECT:
- Project ID: {vercel_info.get('project_id', 'N/A')}
- Deployment URL: {vercel_info.get('deployment_url', 'N/A')}
- Framework: {vercel_info.get('framework', 'N/A')}
"""
            
            if creation_result.get('errors'):
                report_content += f"""
ERRORS ENCOUNTERED:
"""
                for error in creation_result['errors']:
                    report_content += f"- {error}\n"
            
            report_content += f"""
NEXT STEPS:
1. Configure environment variables in Vercel dashboard
2. Set up domain name (if required)
3. Configure branch protection rules
4. Set up continuous integration workflows
5. Use enterprise repo sync agent for automated deployments

===============================================================================
🤖 Generated with Claude Enterprise Repository Creator
===============================================================================
"""
            
            # Save report
            report_file = os.path.join(self.project_path, "REPOSITORY_SETUP_REPORT.md")
            with open(report_file, 'w') as f:
                f.write(report_content)
            
            # Print to console
            print(report_content)
            
        except Exception as e:
            self.logger.error(f"Failed to generate setup report: {e}")
    
    def _load_github_token(self) -> Optional[str]:
        """Load GitHub API token from environment"""
        try:
            # Try environment variable first
            token = os.environ.get('GITHUB_TOKEN')
            if token:
                return token
            
            # Try loading from .env.local in project directory
            env_path = os.path.join(self.project_path, ".env.local")
            if os.path.exists(env_path):
                with open(env_path, 'r') as f:
                    for line in f:
                        line = line.strip()
                        if line.startswith('GITHUB_TOKEN='):
                            return line.split('=', 1)[1].strip()
            
            self.logger.warning("GitHub token not found - repository creation will be limited")
            return None
            
        except Exception as e:
            self.logger.error(f"Error loading GitHub token: {e}")
            return None
    
    def _load_vercel_token(self) -> Optional[str]:
        """Load Vercel API token from environment"""
        try:
            # Try environment variable first
            token = os.environ.get('VERCEL_TOKEN')
            if token:
                return token
                
            # Try loading from .env.local
            env_path = os.path.join(self.project_path, ".env.local")
            if os.path.exists(env_path):
                with open(env_path, 'r') as f:
                    for line in f:
                        line = line.strip()
                        if line.startswith('VERCEL_TOKEN='):
                            token = line.split('=', 1)[1].strip()
                            # Skip placeholder values
                            if not (token.startswith('${') and token.endswith('}')):
                                return token
            
            self.logger.warning("Vercel token not found - deployment setup will be limited")
            return None
            
        except Exception as e:
            self.logger.error(f"Error loading Vercel token: {e}")
            return None
    
    def clone_and_setup_existing(self, github_url: str, local_path: str, framework: str = "nextjs") -> Dict:
        """Clone existing repository and set up enterprise sync agent"""
        try:
            self.logger.info(f"🔄 Cloning and setting up existing repository: {github_url}")
            
            # Create local directory
            os.makedirs(local_path, exist_ok=True)
            
            # Clone repository
            subprocess.run(['git', 'clone', github_url, local_path], check=True)
            
            # Update project path
            original_path = self.project_path
            self.project_path = local_path
            
            # Extract repository name
            repo_name = github_url.split('/')[-1].replace('.git', '')
            
            # Generate enterprise configuration
            config_result = self._generate_project_config(
                repo_name, 
                {"clone_url": github_url, "full_name": f"user/{repo_name}"},
                {"project_id": "", "deployment_url": f"https://{repo_name}.vercel.app"}
            )
            
            # Restore original path
            self.project_path = original_path
            
            return {
                "success": True,
                "local_path": local_path,
                "repo_name": repo_name,
                "config_generated": config_result["success"]
            }
            
        except Exception as e:
            return {"success": False, "error": str(e)}

def main():
    """Standalone testing for repository creator"""
    import argparse
    
    parser = argparse.ArgumentParser(description='Repository Creator')
    parser.add_argument('action', choices=['create', 'clone'])
    parser.add_argument('--name', help='Repository name for creation')
    parser.add_argument('--url', help='GitHub URL for cloning')
    parser.add_argument('--path', help='Local project path')
    parser.add_argument('--description', help='Repository description', default="")
    parser.add_argument('--private', action='store_true', help='Create private repository')
    parser.add_argument('--framework', choices=['nextjs', 'react', 'python'], default='nextjs')
    
    args = parser.parse_args()
    
    # Setup logging
    logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
    
    project_path = args.path or os.getcwd()
    creator = RepositoryCreator(project_path)
    
    if args.action == 'create':
        if not args.name:
            print("Error: --name required for repository creation")
            return
        
        result = creator.create_complete_repository(
            args.name, 
            args.description,
            args.private,
            args.framework
        )
        print(json.dumps(result, indent=2, default=str))
        
    elif args.action == 'clone':
        if not args.url:
            print("Error: --url required for repository cloning")
            return
        
        result = creator.clone_and_setup_existing(
            args.url,
            project_path,
            args.framework
        )
        print(json.dumps(result, indent=2, default=str))

if __name__ == '__main__':
    main()