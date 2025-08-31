#!/usr/bin/env python3
"""
Vercel Build Monitor - Specialized component for monitoring Vercel deployments
Handles real-time build status tracking via Vercel API
"""

import os
import time
import json
import logging
import requests
from typing import Dict, List, Optional

class VercelBuildMonitor:
    """
    Specialized Vercel deployment monitor with real-time build tracking
    """
    
    def __init__(self, project_path: str):
        self.project_path = project_path
        self.logger = logging.getLogger('VercelBuildMonitor')
        
        # Vercel project configuration
        self.project_id = "prj_dIgPyjUY0HRFYw3cYKOxTrAPQsaZ"
        self.team_id = "team_qd9zTuDQ41euDNXJwHVVPocq"
        
        # Load API token
        self.vercel_token = self._load_vercel_token()
        
        # API configuration
        self.api_headers = {
            'Authorization': f'Bearer {self.vercel_token}',
            'Content-Type': 'application/json'
        } if self.vercel_token else None
        
        # Monitoring configuration
        self.max_build_duration = 600  # 10 minutes max build time
        self.check_interval = 15  # Check every 15 seconds
    
    def _load_vercel_token(self) -> Optional[str]:
        """Load Vercel API token from environment file"""
        try:
            env_path = os.path.join(self.project_path, ".env.local")
            if not os.path.exists(env_path):
                self.logger.error("No .env.local file found")
                return None
            
            with open(env_path, 'r') as f:
                for line in f:
                    line = line.strip()
                    if line.startswith('VERCEL_TOKEN='):
                        token = line.split('=', 1)[1].strip()
                        self.logger.info("Vercel API token loaded successfully")
                        return token
            
            self.logger.error("VERCEL_TOKEN not found in .env.local")
            return None
            
        except Exception as e:
            self.logger.error(f"Error loading Vercel token: {e}")
            return None
    
    def monitor_latest_deployment(self) -> Dict:
        """
        Monitor the latest deployment with real-time build status tracking
        Returns: Comprehensive deployment result with build status
        """
        if not self.vercel_token:
            return {
                "status": "error",
                "message": "VERCEL_TOKEN not available - cannot monitor deployments",
                "needs_manual_check": True
            }
        
        try:
            # Wait for Vercel to detect the git push
            self.logger.info("Waiting for Vercel to detect git push...")
            time.sleep(10)
            
            # Get latest deployment
            latest_deployment = self._get_latest_deployment()
            
            if not latest_deployment:
                return {
                    "status": "not_found",
                    "message": "No recent deployments found",
                    "needs_manual_check": True
                }
            
            deployment_id = latest_deployment.get('uid')
            deployment_url = latest_deployment.get('url', '')
            
            self.logger.info(f"Monitoring deployment: {deployment_id}")
            
            # Monitor build progress in real-time
            build_result = self._monitor_build_progress(deployment_id)
            
            # Enhance result with deployment info
            build_result.update({
                "deployment_id": deployment_id,
                "url": f"https://{deployment_url}" if deployment_url else None,
                "dashboard_url": f"https://vercel.com/dashboard/deployments/{deployment_id}"
            })
            
            return build_result
            
        except Exception as e:
            self.logger.error(f"Deployment monitoring failed: {e}")
            return {
                "status": "error",
                "message": f"Monitoring failed: {str(e)}",
                "needs_manual_check": True
            }
    
    def _get_latest_deployment(self) -> Optional[Dict]:
        """Get the most recent deployment from Vercel API"""
        try:
            response = requests.get(
                f'https://api.vercel.com/v6/deployments?projectId={self.project_id}&teamId={self.team_id}&limit=1',
                headers=self.api_headers,
                timeout=30
            )
            
            if response.status_code != 200:
                self.logger.error(f"Vercel API error: {response.status_code}")
                return None
            
            deployments = response.json().get('deployments', [])
            return deployments[0] if deployments else None
            
        except Exception as e:
            self.logger.error(f"Failed to get latest deployment: {e}")
            return None
    
    def _monitor_build_progress(self, deployment_id: str) -> Dict:
        """
        Monitor build progress with real-time status updates
        Returns: Final build status with logs if failed
        """
        start_time = time.time()
        self.logger.info("🟡 Starting real-time build monitoring...")
        
        while True:
            elapsed = int(time.time() - start_time)
            
            # Check for timeout
            if elapsed > self.max_build_duration:
                self.logger.error(f"Build monitoring timed out after {elapsed}s")
                return {
                    "status": "timeout",
                    "message": f"Build monitoring timed out after {elapsed} seconds",
                    "build_duration": elapsed
                }
            
            # Get current deployment status
            try:
                status_response = requests.get(
                    f'https://api.vercel.com/v13/deployments/{deployment_id}?teamId={self.team_id}',
                    headers=self.api_headers,
                    timeout=30
                )
                
                if status_response.status_code == 200:
                    deployment_data = status_response.json()
                    
                    ready_state = deployment_data.get('readyState', 'BUILDING')
                    build_state = deployment_data.get('state', 'BUILDING')
                    
                    self.logger.info(f"[{elapsed}s] Build status - ready: {ready_state}, state: {build_state}")
                    
                    # Success condition
                    if ready_state == 'READY' and build_state == 'READY':
                        self.logger.info(f"✅ Build completed successfully in {elapsed}s")
                        return {
                            "status": "ready",
                            "message": "Build completed successfully",
                            "build_duration": elapsed
                        }
                    
                    # Failure condition
                    elif build_state == 'ERROR' or ready_state == 'ERROR':
                        self.logger.error(f"❌ Build failed after {elapsed}s")
                        
                        # Fetch build logs for debugging
                        build_logs = self._fetch_build_logs(deployment_id)
                        
                        return {
                            "status": "failed",
                            "message": "Build failed with errors",
                            "build_duration": elapsed,
                            "build_logs": build_logs,
                            "needs_claude_fix": True
                        }
                    
                    # Still building - continue monitoring
                    else:
                        self.logger.info(f"[{elapsed}s] 🔄 Build in progress...")
                
                else:
                    self.logger.warning(f"[{elapsed}s] API response {status_response.status_code}")
                    
            except Exception as e:
                self.logger.warning(f"[{elapsed}s] Status check failed: {e}")
            
            # Wait before next check
            time.sleep(self.check_interval)
    
    def _fetch_build_logs(self, deployment_id: str) -> List[str]:
        """
        Fetch comprehensive build logs for failed deployments
        Returns: List of formatted log entries
        """
        try:
            self.logger.info(f"Fetching build logs for deployment: {deployment_id}")
            
            logs_response = requests.get(
                f'https://api.vercel.com/v2/deployments/{deployment_id}/events?teamId={self.team_id}',
                headers=self.api_headers,
                timeout=30
            )
            
            if logs_response.status_code != 200:
                return [f"Failed to fetch build logs: HTTP {logs_response.status_code}"]
            
            response_data = logs_response.json()
            events = response_data if isinstance(response_data, list) else response_data.get('events', [])
            
            self.logger.info(f"Processing {len(events)} log events")
            
            # Extract and format log entries
            build_logs = []
            for event in events:
                if isinstance(event, dict):
                    event_type = event.get('type', '')
                    payload = event.get('payload', {})
                    
                    # Extract text from payload
                    if isinstance(payload, dict):
                        text = payload.get('text', '')
                    else:
                        text = str(payload)
                    
                    if text:
                        # Clean Unicode characters that cause encoding issues
                        text = self._sanitize_log_text(text)
                        
                        # Filter for important log entries
                        if self._is_important_log_entry(text):
                            build_logs.append(f"[{event_type}] {text}")
            
            # Return most relevant logs
            if not build_logs:
                build_logs = [
                    "Build failed but no detailed error logs found.",
                    f"Check Vercel dashboard: https://vercel.com/dashboard/deployments/{deployment_id}"
                ]
            
            return build_logs[-30:]  # Return last 30 most recent logs
            
        except Exception as e:
            self.logger.error(f"Error fetching build logs: {e}")
            return [
                f"Error fetching build logs: {str(e)}",
                f"Manual check required: https://vercel.com/dashboard/deployments/{deployment_id}"
            ]
    
    def _sanitize_log_text(self, text: str) -> str:
        """Remove problematic Unicode characters from log text"""
        try:
            # Replace common Unicode symbols with ASCII equivalents
            replacements = {
                '\u2713': '✓',  # Check mark
                '\u2717': '✗',  # Cross mark  
                '\u26a0': '⚠',  # Warning sign
                '\u2192': '->',  # Arrow
                '\u2139': 'i'   # Information
            }
            
            for unicode_char, replacement in replacements.items():
                text = text.replace(unicode_char, replacement)
            
            # Encode to ASCII, ignoring problematic characters
            text = text.encode('ascii', 'ignore').decode('ascii')
            
            return text.strip()
            
        except Exception:
            return text.strip()
    
    def _is_important_log_entry(self, text: str) -> bool:
        """Determine if a log entry contains important information"""
        important_keywords = [
            'error', 'failed', 'fail', 'fatal', 'exception', 'warning', 'warn',
            'build', 'compile', 'syntax', 'missing', 'not found', 'undefined',
            'typescript', 'eslint', 'next.js', 'react', 'import', 'export'
        ]
        
        text_lower = text.lower()
        
        # Include entries with important keywords
        if any(keyword in text_lower for keyword in important_keywords):
            return True
        
        # Include entries that look like error messages (contain colons or line numbers)
        if ':' in text and (text.count(':') >= 2 or any(char.isdigit() for char in text)):
            return True
        
        # Include non-trivial entries (longer than 10 characters)
        if len(text.strip()) > 10:
            return True
        
        return False
    
    def get_deployment_status(self, deployment_id: str) -> Dict:
        """Get current status of a specific deployment"""
        try:
            response = requests.get(
                f'https://api.vercel.com/v13/deployments/{deployment_id}?teamId={self.team_id}',
                headers=self.api_headers,
                timeout=30
            )
            
            if response.status_code == 200:
                data = response.json()
                return {
                    "deployment_id": deployment_id,
                    "ready_state": data.get('readyState', 'UNKNOWN'),
                    "build_state": data.get('state', 'UNKNOWN'),
                    "url": data.get('url', ''),
                    "created_at": data.get('createdAt', ''),
                    "status": "success"
                }
            else:
                return {
                    "status": "error",
                    "message": f"API error: {response.status_code}"
                }
                
        except Exception as e:
            return {
                "status": "error",
                "message": f"Status check failed: {str(e)}"
            }
    
    def list_recent_deployments(self, limit: int = 5) -> List[Dict]:
        """List recent deployments for the project"""
        try:
            response = requests.get(
                f'https://api.vercel.com/v6/deployments?projectId={self.project_id}&teamId={self.team_id}&limit={limit}',
                headers=self.api_headers,
                timeout=30
            )
            
            if response.status_code == 200:
                deployments = response.json().get('deployments', [])
                
                formatted_deployments = []
                for deployment in deployments:
                    formatted_deployments.append({
                        "id": deployment.get('uid'),
                        "url": deployment.get('url', ''),
                        "state": deployment.get('state', 'UNKNOWN'),
                        "created_at": deployment.get('createdAt', ''),
                        "ready_state": deployment.get('readyState', 'UNKNOWN')
                    })
                
                return formatted_deployments
            else:
                self.logger.error(f"Failed to list deployments: {response.status_code}")
                return []
                
        except Exception as e:
            self.logger.error(f"Error listing deployments: {e}")
            return []

def main():
    """Standalone testing for Vercel monitor"""
    import argparse
    
    parser = argparse.ArgumentParser(description='Vercel Build Monitor')
    parser.add_argument('action', choices=['monitor', 'status', 'list'])
    parser.add_argument('--deployment-id', help='Deployment ID for status check')
    parser.add_argument('--project-path', help='Project directory path')
    
    args = parser.parse_args()
    
    # Setup logging
    logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
    
    project_path = args.project_path or "C:\\D_Drive\\ActiveProjects\\GrandPrixSocial"
    monitor = VercelBuildMonitor(project_path)
    
    if args.action == 'monitor':
        result = monitor.monitor_latest_deployment()
        print(json.dumps(result, indent=2, default=str))
        
    elif args.action == 'status':
        if not args.deployment_id:
            print("Error: --deployment-id required for status check")
            return
        result = monitor.get_deployment_status(args.deployment_id)
        print(json.dumps(result, indent=2, default=str))
        
    elif args.action == 'list':
        result = monitor.list_recent_deployments()
        print(json.dumps(result, indent=2, default=str))

if __name__ == '__main__':
    main()