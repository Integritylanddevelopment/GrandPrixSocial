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
CommandCore OS - GUI Launcher Agent
Manages web server startup, health monitoring, and auto-restart
"""

import os
import sys
import json
import time
import subprocess
import threading
import logging
from datetime import datetime
from pathlib import Path

# Add project root to path
BASE_DIR = Path(__file__).parent.parent.parent.parent
sys.path.append(str(BASE_DIR))

class GUILauncherAgent:
    """Agent responsible for launching and managing the web GUI"""
    
    def __init__(self):
        self.agent_dir = Path(__file__).parent
        self.base_dir = BASE_DIR
        self.web_gui_path = self.base_dir / "web_neural_gui.py"
        self.launcher_path = self.base_dir / "Launch_Neural_GUI.bat"
        
        self.server_process = None
        self.server_port = None
        self.monitoring = False
        
        # Setup logging
        self.setup_logging()
        
        # Load agent state
        self.load_state()
        
        self.logger.info("GUI Launcher Agent initialized")
    
    def setup_logging(self):
        """Setup logging for the agent"""
        log_file = self.agent_dir / "gui_launcher_log.txt"
        logging.basicConfig(
            level=logging.INFO,
            format='%(asctime)s - %(levelname)s - %(message)s',
            handlers=[
                logging.FileHandler(log_file),
                logging.StreamHandler()
            ]
        )
        self.logger = logging.getLogger(__name__)
    
    def load_state(self):
        """Load agent state from JSON file"""
        state_file = self.agent_dir / "gui_launcher_agent_state.json"
        try:
            if state_file.exists():
                with open(state_file, 'r') as f:
                    self.state = json.load(f)
            else:
                self.state = {
                    "status": "idle",
                    "last_started": None,
                    "start_count": 0,
                    "crash_count": 0,
                    "auto_restart": True
                }
        except Exception as e:
            self.logger.error(f"Error loading state: {e}")
            self.state = {}
    
    def save_state(self):
        """Save agent state to JSON file"""
        state_file = self.agent_dir / "gui_launcher_agent_state.json"
        try:
            with open(state_file, 'w') as f:
                json.dump(self.state, f, indent=2)
        except Exception as e:
            self.logger.error(f"Error saving state: {e}")
    
    def check_dependencies(self):
        """Check if all required files and dependencies exist"""
        missing = []
        
        if not self.web_gui_path.exists():
            missing.append("web_neural_gui.py")
        
        # Check Python environment
        try:
            import anthropic
        except ImportError:
            missing.append("anthropic library")
        
        try:
            from dotenv import load_dotenv
        except ImportError:
            missing.append("python-dotenv library")
        
        # Check .env file
        env_file = self.base_dir / ".env"
        if not env_file.exists():
            missing.append(".env configuration file")
        
        return missing
    
    def find_available_port(self, start_port=8080):
        """Find an available port for the web server"""
        import socket
        
        for port in range(start_port, start_port + 10):
            try:
                with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
                    s.bind(('localhost', port))
                    return port
            except OSError:
                continue
        
        return None
    
    def start_gui_server(self):
        """Start the web GUI server"""
        try:
            # Check dependencies first
            missing = self.check_dependencies()
            if missing:
                self.logger.error(f"Missing dependencies: {', '.join(missing)}")
                return False
            
            # Find Python executable
            python_exe = self.find_python_executable()
            if not python_exe:
                self.logger.error("Python executable not found")
                return False
            
            # Start the server process
            cmd = [python_exe, str(self.web_gui_path)]
            self.logger.info(f"Starting GUI server: {' '.join(cmd)}")
            
            self.server_process = subprocess.Popen(
                cmd,
                cwd=str(self.base_dir),
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=True
            )
            
            # Wait a moment and check if process started successfully
            time.sleep(2)
            if self.server_process.poll() is None:
                self.logger.info("GUI server started successfully")
                self.state["status"] = "running"
                self.state["last_started"] = datetime.now().isoformat()
                self.state["start_count"] += 1
                self.save_state()
                
                # Start monitoring thread
                self.start_monitoring()
                return True
            else:
                self.logger.error("GUI server failed to start")
                return False
                
        except Exception as e:
            self.logger.error(f"Error starting GUI server: {e}")
            return False
    
    def find_python_executable(self):
        """Find the appropriate Python executable"""
        # Try virtual environment first
        venv_python = self.base_dir / ".venv" / "Scripts" / "python.exe"
        if venv_python.exists():
            return str(venv_python)
        
        # Try common Python executables
        for exe in ["python3", "python", "py"]:
            try:
                result = subprocess.run([exe, "--version"], capture_output=True, text=True)
                if result.returncode == 0:
                    return exe
            except FileNotFoundError:
                continue
        
        return None
    
    def stop_gui_server(self):
        """Stop the web GUI server"""
        if self.server_process:
            try:
                self.server_process.terminate()
                self.server_process.wait(timeout=5)
                self.logger.info("GUI server stopped")
            except subprocess.TimeoutExpired:
                self.server_process.kill()
                self.logger.warning("GUI server killed (timeout)")
            except Exception as e:
                self.logger.error(f"Error stopping GUI server: {e}")
            
            self.server_process = None
        
        self.monitoring = False
        self.state["status"] = "stopped"
        self.save_state()
    
    def start_monitoring(self):
        """Start monitoring the server process"""
        if not self.monitoring:
            self.monitoring = True
            monitor_thread = threading.Thread(target=self.monitor_server, daemon=True)
            monitor_thread.start()
    
    def monitor_server(self):
        """Monitor server health and restart if needed"""
        while self.monitoring and self.server_process:
            try:
                # Check if process is still running
                if self.server_process.poll() is not None:
                    self.logger.warning("GUI server process terminated unexpectedly")
                    self.state["crash_count"] += 1
                    
                    if self.state.get("auto_restart", True):
                        self.logger.info("Attempting to restart GUI server...")
                        time.sleep(5)  # Wait before restart
                        self.start_gui_server()
                    else:
                        self.state["status"] = "crashed"
                        self.save_state()
                        break
                
                # Health check every 30 seconds
                time.sleep(30)
                
            except Exception as e:
                self.logger.error(f"Error in monitoring: {e}")
                time.sleep(30)
    
    def get_status(self):
        """Get current agent status"""
        return {
            "agent": "GUI Launcher Agent",
            "status": self.state.get("status", "unknown"),
            "server_running": self.server_process is not None and self.server_process.poll() is None,
            "last_started": self.state.get("last_started"),
            "start_count": self.state.get("start_count", 0),
            "crash_count": self.state.get("crash_count", 0),
            "auto_restart": self.state.get("auto_restart", True)
        }
    
    def run(self):
        """Main agent execution loop"""
        self.logger.info("GUI Launcher Agent starting...")
        
        try:
            # Start the GUI server
            if self.start_gui_server():
                self.logger.info("GUI Launcher Agent running successfully")
                
                # Keep the agent running
                while True:
                    time.sleep(60)  # Agent loop interval
                    
            else:
                self.logger.error("Failed to start GUI server")
                
        except KeyboardInterrupt:
            self.logger.info("Agent stopped by user")
        except Exception as e:
            self.logger.error(f"Agent error: {e}")
        finally:
            self.stop_gui_server()

def main():
    """Main entry point"""
    agent = GUILauncherAgent()
    agent.run()

if __name__ == "__main__":
    main()