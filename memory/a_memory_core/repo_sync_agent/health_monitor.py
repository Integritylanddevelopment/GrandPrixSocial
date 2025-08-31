#!/usr/bin/env python3
"""
Agent Health Monitor - Comprehensive health checking and system status monitoring
Monitors git status, Vercel connectivity, environment variables, and agent dependencies
"""

import os
import time
import json
import logging
import subprocess
import requests
from typing import Dict, List, Optional
from pathlib import Path

class AgentHealthMonitor:
    """
    Comprehensive health monitoring for the repo sync agent ecosystem
    """
    
    def __init__(self, project_path: str):
        self.project_path = project_path
        self.logger = logging.getLogger('AgentHealthMonitor')
        
        # Health check configuration
        self.checks = {
            'git_repository': True,
            'vercel_connectivity': True,
            'environment_variables': True,
            'file_system': True,
            'dependencies': True,
            'agent_components': True
        }
        
        # Critical files and directories
        self.critical_paths = [
            'memory/a_memory_core/repo_sync_agent',
            '.env.local',
            'package.json',
            '.git'
        ]
        
        # Required environment variables
        self.required_env_vars = [
            'VERCEL_TOKEN'
        ]
        
        # Agent component files
        self.agent_components = [
            'repo_sync_orchestrator.py',
            'vercel_monitor.py',
            'error_corrector.py',
            'sync_logger.py',
            'repo_sync_config.json'
        ]
    
    def perform_health_check(self) -> Dict:
        """
        Perform comprehensive health check of all agent systems
        Returns: Complete health status report
        """
        health_start = time.time()
        self.logger.info("🩺 Starting comprehensive health check")
        
        health_report = {
            "timestamp": time.time(),
            "overall_status": "unknown",
            "checks_completed": 0,
            "checks_passed": 0,
            "checks_failed": 0,
            "critical_issues": [],
            "warnings": [],
            "recommendations": [],
            "detailed_results": {}
        }
        
        try:
            # Run all enabled health checks
            if self.checks['git_repository']:
                health_report['detailed_results']['git'] = self._check_git_repository()
                health_report['checks_completed'] += 1
            
            if self.checks['vercel_connectivity']:
                health_report['detailed_results']['vercel'] = self._check_vercel_connectivity()
                health_report['checks_completed'] += 1
            
            if self.checks['environment_variables']:
                health_report['detailed_results']['environment'] = self._check_environment_variables()
                health_report['checks_completed'] += 1
            
            if self.checks['file_system']:
                health_report['detailed_results']['filesystem'] = self._check_file_system()
                health_report['checks_completed'] += 1
            
            if self.checks['dependencies']:
                health_report['detailed_results']['dependencies'] = self._check_dependencies()
                health_report['checks_completed'] += 1
            
            if self.checks['agent_components']:
                health_report['detailed_results']['agent_components'] = self._check_agent_components()
                health_report['checks_completed'] += 1
            
            # Analyze results and determine overall status
            self._analyze_health_results(health_report)
            
            # Calculate health check duration
            health_duration = int(time.time() - health_start)
            health_report['health_check_duration'] = health_duration
            
            self.logger.info(f"✅ Health check completed in {health_duration}s - Status: {health_report['overall_status']}")
            
            return health_report
            
        except Exception as e:
            self.logger.error(f"Health check failed: {e}")
            
            health_report.update({
                "overall_status": "error",
                "error": str(e),
                "health_check_duration": int(time.time() - health_start)
            })
            
            return health_report
    
    def _check_git_repository(self) -> Dict:
        """Check Git repository status and configuration"""
        check_result = {
            "status": "unknown",
            "details": {},
            "issues": [],
            "passed": False
        }
        
        try:
            os.chdir(self.project_path)
            
            # Check if we're in a git repository
            git_status = subprocess.run(['git', 'status'], 
                                      capture_output=True, text=True)
            
            if git_status.returncode != 0:
                check_result.update({
                    "status": "failed",
                    "issues": ["Not in a valid git repository"],
                    "details": {"error": git_status.stderr}
                })
                return check_result
            
            # Get repository information
            details = {}
            
            # Current branch
            branch_result = subprocess.run(['git', 'branch', '--show-current'], 
                                         capture_output=True, text=True)
            details['current_branch'] = branch_result.stdout.strip() if branch_result.returncode == 0 else "unknown"
            
            # Remote origin
            remote_result = subprocess.run(['git', 'remote', 'get-url', 'origin'], 
                                         capture_output=True, text=True)
            details['remote_origin'] = remote_result.stdout.strip() if remote_result.returncode == 0 else "none"
            
            # Uncommitted changes
            status_result = subprocess.run(['git', 'status', '--porcelain'], 
                                         capture_output=True, text=True)
            uncommitted_files = len(status_result.stdout.strip().split('\n')) if status_result.stdout.strip() else 0
            details['uncommitted_changes'] = uncommitted_files
            
            # Behind/ahead status
            status_lines = git_status.stdout.split('\n')
            behind_ahead_info = ""
            for line in status_lines:
                if 'behind' in line or 'ahead' in line:
                    behind_ahead_info = line.strip()
                    break
            details['sync_status'] = behind_ahead_info or "up-to-date"
            
            # Last commit info
            commit_result = subprocess.run(['git', 'log', '-1', '--pretty=format:%h - %s (%cr)'], 
                                         capture_output=True, text=True)
            details['last_commit'] = commit_result.stdout.strip() if commit_result.returncode == 0 else "unknown"
            
            check_result.update({
                "status": "healthy",
                "details": details,
                "passed": True
            })
            
            # Add warnings for potential issues
            if uncommitted_files > 0:
                check_result["issues"].append(f"{uncommitted_files} uncommitted files")
            
            if "behind" in details['sync_status']:
                check_result["issues"].append("Repository is behind remote")
                
        except Exception as e:
            check_result.update({
                "status": "error",
                "issues": [f"Git check failed: {str(e)}"],
                "details": {"error": str(e)}
            })
        
        return check_result
    
    def _check_vercel_connectivity(self) -> Dict:
        """Check Vercel API connectivity and project access"""
        check_result = {
            "status": "unknown",
            "details": {},
            "issues": [],
            "passed": False
        }
        
        try:
            # Load Vercel token
            vercel_token = self._load_vercel_token()
            
            if not vercel_token:
                check_result.update({
                    "status": "failed",
                    "issues": ["VERCEL_TOKEN not found in .env.local"],
                    "details": {"token_status": "missing"}
                })
                return check_result
            
            # Test API connectivity
            headers = {
                'Authorization': f'Bearer {vercel_token}',
                'Content-Type': 'application/json'
            }
            
            # Get user info
            user_response = requests.get(
                'https://api.vercel.com/v2/user',
                headers=headers,
                timeout=10
            )
            
            details = {
                "token_status": "valid" if user_response.status_code == 200 else "invalid",
                "api_connectivity": user_response.status_code == 200
            }
            
            if user_response.status_code == 200:
                user_data = user_response.json()
                details['user_id'] = user_data.get('user', {}).get('id', 'unknown')
                details['user_name'] = user_data.get('user', {}).get('name', 'unknown')
            
            # Test project access
            project_id = "prj_dIgPyjUY0HRFYw3cYKOxTrAPQsaZ"
            team_id = "team_qd9zTuDQ41euDNXJwHVVPocq"
            
            project_response = requests.get(
                f'https://api.vercel.com/v9/projects/{project_id}?teamId={team_id}',
                headers=headers,
                timeout=10
            )
            
            details['project_access'] = project_response.status_code == 200
            
            if project_response.status_code == 200:
                project_data = project_response.json()
                details['project_name'] = project_data.get('name', 'unknown')
                details['project_framework'] = project_data.get('framework', 'unknown')
            
            # Get recent deployments to test full access
            deployments_response = requests.get(
                f'https://api.vercel.com/v6/deployments?projectId={project_id}&teamId={team_id}&limit=1',
                headers=headers,
                timeout=10
            )
            
            details['deployments_access'] = deployments_response.status_code == 200
            
            if deployments_response.status_code == 200:
                deployments = deployments_response.json().get('deployments', [])
                details['recent_deployments'] = len(deployments)
                if deployments:
                    latest = deployments[0]
                    details['latest_deployment'] = {
                        'id': latest.get('uid', 'unknown'),
                        'state': latest.get('state', 'unknown'),
                        'created': latest.get('createdAt', 'unknown')
                    }
            
            # Determine overall status
            if all([
                details.get('api_connectivity', False),
                details.get('project_access', False),
                details.get('deployments_access', False)
            ]):
                check_result.update({
                    "status": "healthy",
                    "passed": True
                })
            else:
                check_result.update({
                    "status": "degraded",
                    "issues": ["Limited Vercel API access"]
                })
            
            check_result['details'] = details
            
        except Exception as e:
            check_result.update({
                "status": "error",
                "issues": [f"Vercel connectivity check failed: {str(e)}"],
                "details": {"error": str(e)}
            })
        
        return check_result
    
    def _check_environment_variables(self) -> Dict:
        """Check required environment variables"""
        check_result = {
            "status": "unknown",
            "details": {},
            "issues": [],
            "passed": False
        }
        
        try:
            env_file = os.path.join(self.project_path, '.env.local')
            
            details = {
                "env_file_exists": os.path.exists(env_file),
                "required_vars": {},
                "missing_vars": [],
                "total_vars": 0
            }
            
            if not details["env_file_exists"]:
                check_result.update({
                    "status": "failed",
                    "issues": [".env.local file not found"],
                    "details": details
                })
                return check_result
            
            # Read environment file
            env_vars = {}
            with open(env_file, 'r') as f:
                for line in f:
                    line = line.strip()
                    if '=' in line and not line.startswith('#'):
                        key, value = line.split('=', 1)
                        env_vars[key] = value
            
            details['total_vars'] = len(env_vars)
            
            # Check required variables
            for var_name in self.required_env_vars:
                if var_name in env_vars:
                    details['required_vars'][var_name] = "present"
                else:
                    details['required_vars'][var_name] = "missing"
                    details['missing_vars'].append(var_name)
            
            # Validate specific variables
            if 'VERCEL_TOKEN' in env_vars:
                token_value = env_vars['VERCEL_TOKEN']
                if token_value.startswith('${') and token_value.endswith('}'):
                    details['required_vars']['VERCEL_TOKEN'] = "placeholder"
                    details['missing_vars'].append('VERCEL_TOKEN (placeholder value)')
                elif len(token_value) < 10:
                    details['required_vars']['VERCEL_TOKEN'] = "invalid"
                    details['missing_vars'].append('VERCEL_TOKEN (invalid format)')
            
            # Determine status
            if not details['missing_vars']:
                check_result.update({
                    "status": "healthy",
                    "passed": True
                })
            else:
                check_result.update({
                    "status": "failed",
                    "issues": [f"Missing or invalid environment variables: {', '.join(details['missing_vars'])}"]
                })
            
            check_result['details'] = details
            
        except Exception as e:
            check_result.update({
                "status": "error",
                "issues": [f"Environment check failed: {str(e)}"],
                "details": {"error": str(e)}
            })
        
        return check_result
    
    def _check_file_system(self) -> Dict:
        """Check critical files and directories"""
        check_result = {
            "status": "unknown",
            "details": {},
            "issues": [],
            "passed": False
        }
        
        try:
            details = {
                "project_path": self.project_path,
                "paths_checked": len(self.critical_paths),
                "paths_found": 0,
                "missing_paths": [],
                "path_status": {}
            }
            
            for path in self.critical_paths:
                full_path = os.path.join(self.project_path, path)
                exists = os.path.exists(full_path)
                
                if exists:
                    details['paths_found'] += 1
                    if os.path.isdir(full_path):
                        details['path_status'][path] = "directory_exists"
                    else:
                        details['path_status'][path] = "file_exists"
                else:
                    details['missing_paths'].append(path)
                    details['path_status'][path] = "missing"
            
            # Check disk space
            try:
                import shutil
                total, used, free = shutil.disk_usage(self.project_path)
                details['disk_space'] = {
                    "total_gb": round(total / (1024**3), 2),
                    "used_gb": round(used / (1024**3), 2),
                    "free_gb": round(free / (1024**3), 2),
                    "usage_percent": round((used / total) * 100, 1)
                }
                
                if details['disk_space']['free_gb'] < 1.0:
                    check_result['issues'].append(f"Low disk space: {details['disk_space']['free_gb']}GB free")
                    
            except Exception:
                details['disk_space'] = "check_failed"
            
            # Determine status
            if not details['missing_paths']:
                check_result.update({
                    "status": "healthy",
                    "passed": True
                })
            else:
                check_result.update({
                    "status": "degraded" if len(details['missing_paths']) <= 1 else "failed",
                    "issues": [f"Missing critical paths: {', '.join(details['missing_paths'])}"]
                })
            
            check_result['details'] = details
            
        except Exception as e:
            check_result.update({
                "status": "error",
                "issues": [f"File system check failed: {str(e)}"],
                "details": {"error": str(e)}
            })
        
        return check_result
    
    def _check_dependencies(self) -> Dict:
        """Check Python and Node.js dependencies"""
        check_result = {
            "status": "unknown",
            "details": {},
            "issues": [],
            "passed": False
        }
        
        try:
            details = {
                "python_version": "unknown",
                "node_version": "unknown",
                "npm_version": "unknown",
                "python_packages": {},
                "node_packages_status": "unknown"
            }
            
            # Check Python version
            try:
                python_result = subprocess.run(['python', '--version'], 
                                             capture_output=True, text=True)
                if python_result.returncode == 0:
                    details['python_version'] = python_result.stdout.strip()
            except Exception:
                try:
                    python_result = subprocess.run(['python3', '--version'], 
                                                 capture_output=True, text=True)
                    if python_result.returncode == 0:
                        details['python_version'] = python_result.stdout.strip()
                except Exception:
                    check_result['issues'].append("Python not found in PATH")
            
            # Check required Python packages
            required_packages = ['requests', 'pathlib']
            for package in required_packages:
                try:
                    import importlib
                    importlib.import_module(package)
                    details['python_packages'][package] = "installed"
                except ImportError:
                    details['python_packages'][package] = "missing"
                    check_result['issues'].append(f"Missing Python package: {package}")
            
            # Check Node.js version
            try:
                node_result = subprocess.run(['node', '--version'], 
                                           capture_output=True, text=True)
                if node_result.returncode == 0:
                    details['node_version'] = node_result.stdout.strip()
            except Exception:
                check_result['issues'].append("Node.js not found in PATH")
            
            # Check npm version
            try:
                npm_result = subprocess.run(['npm', '--version'], 
                                          capture_output=True, text=True)
                if npm_result.returncode == 0:
                    details['npm_version'] = npm_result.stdout.strip()
            except Exception:
                check_result['issues'].append("npm not found in PATH")
            
            # Check package.json
            package_json_path = os.path.join(self.project_path, 'package.json')
            if os.path.exists(package_json_path):
                try:
                    with open(package_json_path, 'r') as f:
                        package_data = json.load(f)
                    
                    details['node_packages_status'] = "package.json_found"
                    details['project_name'] = package_data.get('name', 'unknown')
                    details['project_version'] = package_data.get('version', 'unknown')
                    
                    # Check if node_modules exists
                    node_modules_path = os.path.join(self.project_path, 'node_modules')
                    if os.path.exists(node_modules_path):
                        details['node_modules'] = "installed"
                    else:
                        details['node_modules'] = "missing"
                        check_result['issues'].append("node_modules directory missing - run npm install")
                        
                except Exception as e:
                    check_result['issues'].append(f"Cannot read package.json: {str(e)}")
            else:
                check_result['issues'].append("package.json not found")
            
            # Determine status
            critical_issues = [issue for issue in check_result['issues'] 
                             if 'missing' in issue.lower() and ('python' in issue.lower() or 'node' in issue.lower())]
            
            if not critical_issues:
                check_result.update({
                    "status": "healthy",
                    "passed": True
                })
            elif len(critical_issues) <= 1:
                check_result.update({
                    "status": "degraded"
                })
            else:
                check_result.update({
                    "status": "failed"
                })
            
            check_result['details'] = details
            
        except Exception as e:
            check_result.update({
                "status": "error",
                "issues": [f"Dependencies check failed: {str(e)}"],
                "details": {"error": str(e)}
            })
        
        return check_result
    
    def _check_agent_components(self) -> Dict:
        """Check that all agent component files are present and functional"""
        check_result = {
            "status": "unknown",
            "details": {},
            "issues": [],
            "passed": False
        }
        
        try:
            agent_dir = os.path.join(self.project_path, 'memory', 'a_memory_core', 'repo_sync_agent')
            
            details = {
                "agent_directory": agent_dir,
                "directory_exists": os.path.exists(agent_dir),
                "components_checked": len(self.agent_components),
                "components_found": 0,
                "missing_components": [],
                "component_status": {}
            }
            
            if not details["directory_exists"]:
                check_result.update({
                    "status": "failed",
                    "issues": ["Agent directory not found"],
                    "details": details
                })
                return check_result
            
            # Check each component file
            for component in self.agent_components:
                component_path = os.path.join(agent_dir, component)
                exists = os.path.exists(component_path)
                
                if exists:
                    details['components_found'] += 1
                    
                    # Check file size (should be > 100 bytes)
                    file_size = os.path.getsize(component_path)
                    if file_size > 100:
                        details['component_status'][component] = f"exists ({file_size} bytes)"
                    else:
                        details['component_status'][component] = f"exists_but_small ({file_size} bytes)"
                        check_result['issues'].append(f"{component} seems too small ({file_size} bytes)")
                else:
                    details['missing_components'].append(component)
                    details['component_status'][component] = "missing"
            
            # Check for legacy smart_sync.py
            legacy_file = os.path.join(agent_dir, 'smart_sync.py')
            if os.path.exists(legacy_file):
                details['legacy_file'] = "present"
                check_result['issues'].append("Legacy smart_sync.py still present - consider archiving")
            else:
                details['legacy_file'] = "absent"
            
            # Test import capability for Python modules
            python_components = [comp for comp in self.agent_components if comp.endswith('.py')]
            details['import_tests'] = {}
            
            for py_component in python_components:
                module_name = py_component[:-3]  # Remove .py extension
                try:
                    # Add agent directory to path temporarily for import test
                    import sys
                    original_path = sys.path.copy()
                    sys.path.insert(0, agent_dir)
                    
                    # Try to import the module
                    import importlib.util
                    spec = importlib.util.spec_from_file_location(
                        module_name, 
                        os.path.join(agent_dir, py_component)
                    )
                    if spec and spec.loader:
                        details['import_tests'][module_name] = "importable"
                    else:
                        details['import_tests'][module_name] = "not_importable"
                        check_result['issues'].append(f"{py_component} cannot be imported")
                    
                    # Restore original path
                    sys.path = original_path
                    
                except Exception as e:
                    details['import_tests'][module_name] = f"import_error: {str(e)}"
                    check_result['issues'].append(f"{py_component} import failed: {str(e)}")
            
            # Determine status
            if not details['missing_components'] and len(check_result['issues']) == 0:
                check_result.update({
                    "status": "healthy",
                    "passed": True
                })
            elif len(details['missing_components']) <= 1 and len(check_result['issues']) <= 2:
                check_result.update({
                    "status": "degraded"
                })
            else:
                check_result.update({
                    "status": "failed"
                })
            
            check_result['details'] = details
            
        except Exception as e:
            check_result.update({
                "status": "error",
                "issues": [f"Agent components check failed: {str(e)}"],
                "details": {"error": str(e)}
            })
        
        return check_result
    
    def _analyze_health_results(self, health_report: Dict):
        """Analyze individual check results to determine overall health"""
        passed_checks = 0
        failed_checks = 0
        critical_issues = []
        warnings = []
        recommendations = []
        
        for check_name, result in health_report['detailed_results'].items():
            if result.get('passed', False):
                passed_checks += 1
            else:
                failed_checks += 1
            
            # Collect issues by severity
            status = result.get('status', 'unknown')
            issues = result.get('issues', [])
            
            if status == 'failed':
                critical_issues.extend([f"[{check_name}] {issue}" for issue in issues])
            elif status == 'degraded':
                warnings.extend([f"[{check_name}] {issue}" for issue in issues])
            elif status == 'error':
                critical_issues.extend([f"[{check_name}] {issue}" for issue in issues])
        
        # Generate recommendations
        if 'vercel' in health_report['detailed_results']:
            vercel_result = health_report['detailed_results']['vercel']
            if not vercel_result.get('passed', False):
                recommendations.append("Configure VERCEL_TOKEN in .env.local file")
        
        if 'dependencies' in health_report['detailed_results']:
            deps_result = health_report['detailed_results']['dependencies']
            if 'node_modules directory missing' in str(deps_result.get('issues', [])):
                recommendations.append("Run 'npm install' to install Node.js dependencies")
        
        # Determine overall status
        if failed_checks == 0:
            overall_status = "healthy"
        elif failed_checks <= 2 and len(critical_issues) <= 3:
            overall_status = "degraded"
        else:
            overall_status = "unhealthy"
        
        # Update health report
        health_report.update({
            "overall_status": overall_status,
            "checks_passed": passed_checks,
            "checks_failed": failed_checks,
            "critical_issues": critical_issues,
            "warnings": warnings,
            "recommendations": recommendations
        })
    
    def _load_vercel_token(self) -> Optional[str]:
        """Load Vercel API token from environment file"""
        try:
            env_path = os.path.join(self.project_path, ".env.local")
            if not os.path.exists(env_path):
                return None
            
            with open(env_path, 'r') as f:
                for line in f:
                    line = line.strip()
                    if line.startswith('VERCEL_TOKEN='):
                        token = line.split('=', 1)[1].strip()
                        # Skip placeholder values
                        if not (token.startswith('${') and token.endswith('}')):
                            return token
            
            return None
            
        except Exception:
            return None
    
    def quick_status(self) -> Dict:
        """Perform a quick status check (essential checks only)"""
        self.logger.info("⚡ Performing quick status check")
        
        # Temporarily disable non-essential checks
        original_checks = self.checks.copy()
        self.checks = {
            'git_repository': True,
            'vercel_connectivity': False,
            'environment_variables': True,
            'file_system': False,
            'dependencies': False,
            'agent_components': True
        }
        
        try:
            result = self.perform_health_check()
            result['check_type'] = 'quick_status'
            return result
        finally:
            # Restore original checks
            self.checks = original_checks

def main():
    """Standalone testing for health monitor"""
    import argparse
    
    parser = argparse.ArgumentParser(description='Agent Health Monitor')
    parser.add_argument('action', choices=['health', 'quick'])
    parser.add_argument('--project-path', help='Project directory path')
    
    args = parser.parse_args()
    
    # Setup logging
    logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
    
    project_path = args.project_path or "C:\\D_Drive\\ActiveProjects\\GrandPrixSocial"
    monitor = AgentHealthMonitor(project_path)
    
    if args.action == 'health':
        result = monitor.perform_health_check()
        print(json.dumps(result, indent=2, default=str))
        
    elif args.action == 'quick':
        result = monitor.quick_status()
        print(json.dumps(result, indent=2, default=str))

if __name__ == '__main__':
    main()