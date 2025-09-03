from typing import Dict, List, Any, Optional

# Auto-generated performance monitoring
import time
from functools import wraps

def monitor_performance(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        start_time = time.time()
        result = func(*args, **kwargs)
        end_time = time.time()
        print(f"{func.__name__} executed in {end_time - start_time:.4f} seconds")
        return result
    return wrapper
#!/usr/bin/env python3
"""
CommandCore OS - System Health Agent
Comprehensive health monitoring, dependency management, and agent repair system
"""

import os
import sys
import json
import subprocess
import importlib
import logging
import threading
import time
from datetime import datetime
from pathlib import Path

class SystemHealthAgent:
"""Comprehensive system health monitoring and repair agent"""
 
    def __init__(self):
        self.agent_dir = Path(__file__).parent
        self.agent_dir.mkdir(exist_ok=True)
        
        self.base_dir = self.agent_dir.parent.parent.parent
        self.setup_logging()
        
        # Required dependencies for CommandCore OS
        self.required_dependencies = {
            'watchdog': 'File system monitoring for agents',
            'anthropic': 'Claude API integration',
            'openai': 'OpenAI API integration', 
            'speechrecognition': 'Voice input for GUI',
            'python-dotenv': 'Environment variable management',
            'requests': 'HTTP requests for APIs',
            'psutil': 'System monitoring',
            'schedule': 'Task scheduling for agents',
            'pathlib': 'Enhanced path handling'
        }
        
        # System components to monitor
        self.critical_components = [
            'memory/a_memory_core',
            'builder_gui',
            'logs',
            '.env'
        ]
        
        self.logger.info("[?] System Health Agent initialized")
 
    def setup_logging(self):
        """Setup comprehensive logging"""
        log_file = self.agent_dir / "system_health.log"
        
        logging.basicConfig(
            level=logging.INFO,
            format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
            handlers=[
                logging.FileHandler(log_file),
                logging.StreamHandler(sys.stdout)
            ]
        )
        self.logger = logging.getLogger("SystemHealthAgent")
 
    def check_system_health(self):
        """Run comprehensive system health check"""
        self.logger.info("[SEARCH] Starting comprehensive system health check...")
        
        health_report = {
            'timestamp': datetime.now().isoformat(),
            'components': {},
            'dependencies': {},
            'repairs': [],
            'overall_health': 'UNKNOWN'
        }
        
        # Check dependencies
        dependency_health = self.check_dependencies()
        health_report['dependencies'] = dependency_health
        
        # Check critical components
        component_health = self.check_critical_components()
        health_report['components'] = component_health
        
        # Check agent integrity
        agent_health = self.check_agent_integrity()
        health_report['agents'] = agent_health
        
        # Determine overall health
        overall_health = self.calculate_overall_health(dependency_health, component_health, agent_health)
        health_report['overall_health'] = overall_health
        
        # Save health report
        self.save_health_report(health_report)
        
        return health_report
 
    def check_dependencies(self):
        """Check and install missing dependencies"""
        self.logger.info("[PACKAGE] Checking Python dependencies...")
        
        dependency_status = {}
        missing_dependencies = []
        
        for dep, description in self.required_dependencies.items():
            try:
                # Try to import the dependency
                if dep == 'python-dotenv':
                    importlib.import_module('dotenv')
                else:
                    importlib.import_module(dep)
                
                dependency_status[dep] = {
                    'status': 'installed',
                    'description': description
                }
                self.logger.info(f"[OK] {dep}: OK")
                
            except ImportError:
                dependency_status[dep] = {
                    'status': 'missing',
                    'description': description
                }
                missing_dependencies.append(dep)
                self.logger.warning(f"[X] {dep}: MISSING")
                
        # Auto-repair: Install missing dependencies
        if missing_dependencies:
            self.logger.info(f"[TOOL] Auto-repairing: Installing {len(missing_dependencies)} missing dependencies...")
            self.install_missing_dependencies(missing_dependencies)
            
        return dependency_status
 
    def install_missing_dependencies(self, missing_deps):
        """Automatically install missing dependencies"""
        self.logger.info("[TOOL] Starting automatic dependency installation...")
        
        # Find Python executable and pip
        python_exe = sys.executable
        venv_pip = self.base_dir / ".venv" / "Scripts" / "pip.exe"
        
        # Use venv pip if available, otherwise system pip
        if venv_pip.exists():
            pip_cmd = [str(venv_pip)]
            self.logger.info("[?] Using virtual environment pip")
        else:
            pip_cmd = [python_exe, "-m", "pip"]
            self.logger.info("[?] Using system pip")
            
        successful_installs = []
        failed_installs = []
        
        for dep in missing_deps:
            try:
                self.logger.info(f"[?] Installing {dep}...")
                
                result = subprocess.run(
                    pip_cmd + ["install", dep],
                    capture_output=True,
                    text=True,
                    timeout=120 # 2 minute timeout per package
                )
                
                if result.returncode == 0:
                    successful_installs.append(dep)
                    self.logger.info(f"[OK] Successfully installed {dep}")
                else:
                    failed_installs.append((dep, result.stderr))
                    self.logger.error(f"[X] Failed to install {dep}: {result.stderr}")
                    
            except subprocess.TimeoutExpired:
                failed_installs.append((dep, "Installation timeout"))
                self.logger.error(f"[ALARM] Installation of {dep} timed out")
            except Exception as e:
                failed_installs.append((dep, str(e)))
                self.logger.error(f"[X] Error installing {dep}: {e}")
                
        # Report results
        if successful_installs:
            self.logger.info(f"[PARTY] Successfully installed: {', '.join(successful_installs)}")
            
        if failed_installs:
            self.logger.warning(f"[WARNING] Failed to install: {[dep for dep, _ in failed_installs]}")
            
        return successful_installs, failed_installs
 
    def check_critical_components(self):
        """Check critical system components"""
        self.logger.info("[?][?] Checking critical system components...")
        
        component_status = {}
        
        for component in self.critical_components:
            component_path = self.base_dir / component
            
            if component_path.exists():
                if component_path.is_file():
                    # File component
                    size = component_path.stat().st_size
                    component_status[component] = {
                        'status': 'present',
                        'type': 'file',
                        'size': size,
                        'readable': os.access(component_path, os.R_OK)
                    }
                else:
                    # Directory component
                    file_count = len(list(component_path.rglob('*')))
                    component_status[component] = {
                        'status': 'present',
                        'type': 'directory',
                        'file_count': file_count,
                        'readable': os.access(component_path, os.R_OK)
                    }
                    
                self.logger.info(f"[OK] {component}: OK")
            else:
                component_status[component] = {
                    'status': 'missing',
                    'type': 'unknown'
                }
                self.logger.warning(f"[X] {component}: MISSING")
                
        return component_status
 
    def check_agent_integrity(self):
        """Check agent file integrity and basic structure"""
        self.logger.info("[BOT] Checking agent integrity...")
        
        agent_status = {}
        
        # Find all agent files
        agent_patterns = [
            "builder_gui/**/*_agent.py",
            "memory/**/*_agent.py", 
            "logs/**/*_agent.py",
            "memory_agents/**/*_agent.py"
        ]
        
        for pattern in agent_patterns:
            for agent_file in self.base_dir.glob(pattern):
                agent_name = agent_file.stem
                
                # Skip this health agent
                if agent_name == "system_health_agent":
                    continue
                    
                try:
                    # Basic file checks
                    size = agent_file.stat().st_size
                    readable = os.access(agent_file, os.R_OK)
                    
                    # Try to read and do basic syntax check
                    with open(agent_file, 'r', encoding='utf-8') as f:
                        content = f.read()
                        
                    # Basic integrity checks
                    has_main = 'def main(' in content or '__main__' in content
                    has_import = 'import ' in content
                    has_class = 'class ' in content
                    
                    integrity_score = sum([has_main, has_import, has_class]) / 3 * 100
                    
                    agent_status[agent_name] = {
                        'status': 'healthy' if integrity_score >= 66 else 'degraded',
                        'size': size,
                        'readable': readable,
                        'integrity_score': integrity_score,
                        'path': str(agent_file.relative_to(self.base_dir))
                    }
                    
                    if integrity_score >= 66:
                        self.logger.info(f"[OK] {agent_name}: Healthy ({integrity_score:.0f}%)")
                    else:
                        self.logger.warning(f"[WARNING] {agent_name}: Degraded ({integrity_score:.0f}%)")
                        
                except Exception as e:
                    agent_status[agent_name] = {
                        'status': 'corrupted',
                        'error': str(e),
                        'path': str(agent_file.relative_to(self.base_dir))
                    }
                    self.logger.error(f"[X] {agent_name}: Corrupted - {e}")
                    
        return agent_status
 
    def calculate_overall_health(self, dependencies, components, agents):
        """Calculate overall system health score"""
        scores = []
        
        # Dependency score
        dep_healthy = sum(1 for dep in dependencies.values() if dep['status'] == 'installed')
        dep_total = len(dependencies)
        dep_score = (dep_healthy / dep_total * 100) if dep_total > 0 else 100
        scores.append(dep_score)
        
        # Component score
        comp_healthy = sum(1 for comp in components.values() if comp['status'] == 'present')
        comp_total = len(components)
        comp_score = (comp_healthy / comp_total * 100) if comp_total > 0 else 100
        scores.append(comp_score)
        
        # Agent score
        agent_healthy = sum(1 for agent in agents.values() if agent['status'] == 'healthy')
        agent_total = len(agents)
        agent_score = (agent_healthy / agent_total * 100) if agent_total > 0 else 100
        scores.append(agent_score)
        
        overall_score = sum(scores) / len(scores)
        
        if overall_score >= 90:
            return 'EXCELLENT'
        elif overall_score >= 75:
            return 'GOOD'
        elif overall_score >= 60:
            return 'FAIR'
        elif overall_score >= 40:
            return 'POOR'
        else:
            return 'CRITICAL'
 
    def save_health_report(self, report):
        """Save consolidated health report"""
        # Save only latest report - consolidated logging
        latest_file = self.agent_dir / "latest_health_report.json"
        with open(latest_file, 'w') as f:
            json.dump(report, f, indent=2)
            
        # Update agent state
        self.update_agent_state(report)
        
        self.logger.info(f"[CHART] Health report updated: {latest_file}")
 
    def update_agent_state(self, report):
        """Update agent state file with latest health information"""
        state_file = self.agent_dir / "system_health_agent_state.json"
        
        try:
            # Load existing state
            if state_file.exists():
                with open(state_file, 'r') as f:
                    state = json.load(f)
            else:
                state = {}
                
            # Update with current health info
            timestamp = datetime.now().strftime("%m-%d_%I-%M%p")
            
            state.update({
                "current_state": {
                    "status": "healthy" if report['overall_health'] in ['EXCELLENT', 'GOOD'] else "monitoring",
                    "last_execution": timestamp,
                    "execution_count": state.get("current_state", {}).get("execution_count", 0) + 1,
                    "last_health_check": timestamp,
                    "monitoring_active": False,
                    "auto_repair_enabled": True
                },
                "system_status": {
                    "overall_health": report['overall_health'],
                    "dependency_status": "HEALTHY" if all(d['status'] == 'installed' for d in report['dependencies'].values()) else "NEEDS_REPAIR",
                    "component_status": "HEALTHY" if all(c['status'] == 'present' for c in report['components'].values()) else "DEGRADED",
                    "agent_integrity": "GOOD",
                    "last_repair_action": timestamp
                }
            })
            
            # Save updated state
            with open(state_file, 'w') as f:
                json.dump(state, f, indent=2)
                
        except Exception as e:
            self.logger.error(f"Failed to update agent state: {e}")
 
    def run_continuous_monitoring(self, interval_minutes=30):
        """Run continuous system health monitoring"""
        self.logger.info(f"[CYCLE] Starting continuous monitoring (every {interval_minutes} minutes)")
        
        while True:
            try:
                report = self.check_system_health()
                health = report['overall_health']
                
                if health in ['POOR', 'CRITICAL']:
                    self.logger.warning(f"[WARNING] System health is {health} - repair may be needed")
                else:
                    self.logger.info(f"[OK] System health is {health}")
                    
                time.sleep(interval_minutes * 60)
                
            except KeyboardInterrupt:
                self.logger.info("[?] Continuous monitoring stopped by user")
                break
            except Exception as e:
                self.logger.error(f"[X] Error in continuous monitoring: {e}")
                time.sleep(300)  # Wait 5 minutes before retry

def main():
"""Main entry point"""
print("[?] CommandCore OS - System Health Agent")
print("Comprehensive health monitoring and automatic repair")
print("=" * 60)
 
health_agent = SystemHealthAgent()
 
if len(sys.argv) > 1:
if sys.argv[1] == "monitor":
interval = int(sys.argv[2]) if len(sys.argv) > 2 else 30
health_agent.run_continuous_monitoring(interval)
elif sys.argv[1] == "repair":
print("\n[TOOL] Running system repair...")
report = health_agent.check_system_health()
print(f"\n[CHART] System Health: {report['overall_health']}")
else:
print("Usage: python system_health_agent.py [monitor|repair] [interval_minutes]")
else:
# Default: run single health check
report = health_agent.check_system_health()
print(f"\n[CHART] System Health: {report['overall_health']}")
 
dep_issues = sum(1 for dep in report['dependencies'].values() if dep['status'] != 'installed')
comp_issues = sum(1 for comp in report['components'].values() if comp['status'] != 'present')
agent_issues = sum(1 for agent in report['agents'].values() if agent['status'] != 'healthy')
 
print(f"[PACKAGE] Dependencies: {len(report['dependencies']) - dep_issues}/{len(report['dependencies'])} OK")
print(f"[?][?] Components: {len(report['components']) - comp_issues}/{len(report['components'])} OK")
print(f"[BOT] Agents: {len(report['agents']) - agent_issues}/{len(report['agents'])} OK")

if __name__ == "__main__":
main()