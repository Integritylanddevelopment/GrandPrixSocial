#!/usr/bin/env python3
"""
Claude Code Watcher
Monitors for Claude Code activity and automatically starts the Claude context memory system

This script:
1. Detects when Claude Code is active in the Grand Prix Social directory
2. Automatically starts all Claude context memory agents
3. Starts the main memory agents from the parent directory
4. Maintains the memory system while Claude Code is active
"""

import os
import sys
import time
import psutil
import subprocess
import json
import threading
from datetime import datetime
from pathlib import Path
import logging

# Setup logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class ClaudeCodeWatcher:
    def __init__(self):
        self.script_dir = Path(__file__).parent
        self.project_root = self.script_dir.parent.parent  # Grand Prix Social root
        self.main_memory_root = self.project_root / "memory"
        
        # Process monitoring
        self.claude_code_processes = set()
        self.memory_system_active = False
        self.monitoring_active = True
        
        # State file
        self.state_file = self.script_dir / "watcher_state.json"
        
        # Claude Code detection patterns
        self.claude_code_patterns = [
            "claude-code",
            "claude_code",
            "ClaudeCode",
            "anthropic"
        ]
        
        # Directory patterns that indicate Claude Code activity
        self.project_patterns = [
            str(self.project_root),
            "GrandPrixSocial"
        ]
        
        logger.info(f"🔍 Claude Code Watcher initialized for project: {self.project_root}")

    def detect_claude_code_activity(self):
        """Detect if Claude Code is currently active in this project"""
        claude_processes = []
        
        try:
            for proc in psutil.process_iter(['pid', 'name', 'cmdline', 'cwd']):
                try:
                    proc_info = proc.info
                    
                    # Check process name
                    if proc_info['name'] and any(pattern in proc_info['name'].lower() for pattern in self.claude_code_patterns):
                        # Check if it's working in our project directory
                        if proc_info['cwd'] and any(pattern in str(proc_info['cwd']) for pattern in self.project_patterns):
                            claude_processes.append({
                                'pid': proc_info['pid'],
                                'name': proc_info['name'],
                                'cwd': proc_info['cwd']
                            })
                    
                    # Check command line arguments
                    if proc_info['cmdline']:
                        cmdline_str = ' '.join(proc_info['cmdline']).lower()
                        if any(pattern in cmdline_str for pattern in self.claude_code_patterns):
                            if any(pattern in cmdline_str for pattern in self.project_patterns):
                                claude_processes.append({
                                    'pid': proc_info['pid'],
                                    'name': proc_info['name'],
                                    'cmdline': proc_info['cmdline']
                                })
                
                except (psutil.NoSuchProcess, psutil.AccessDenied, psutil.ZombieProcess):
                    continue
        
        except Exception as e:
            logger.error(f"Error detecting Claude Code processes: {e}")
        
        return claude_processes

    def detect_vscode_activity(self):
        """Detect VS Code activity in the project directory as secondary indicator"""
        vscode_processes = []
        
        try:
            for proc in psutil.process_iter(['pid', 'name', 'cmdline', 'cwd']):
                try:
                    proc_info = proc.info
                    
                    if proc_info['name'] and 'code' in proc_info['name'].lower():
                        if proc_info['cwd'] and any(pattern in str(proc_info['cwd']) for pattern in self.project_patterns):
                            vscode_processes.append({
                                'pid': proc_info['pid'],
                                'name': proc_info['name'],
                                'cwd': proc_info['cwd']
                            })
                        
                        # Check if VS Code has this project open
                        if proc_info['cmdline']:
                            cmdline_str = ' '.join(proc_info['cmdline'])
                            if any(pattern in cmdline_str for pattern in self.project_patterns):
                                vscode_processes.append({
                                    'pid': proc_info['pid'],
                                    'name': proc_info['name'],
                                    'cmdline': proc_info['cmdline']
                                })
                
                except (psutil.NoSuchProcess, psutil.AccessDenied, psutil.ZombieProcess):
                    continue
        
        except Exception as e:
            logger.error(f"Error detecting VS Code processes: {e}")
        
        return vscode_processes

    def start_claude_memory_system(self):
        """Start the Claude context memory system"""
        if self.memory_system_active:
            logger.info("📝 Claude memory system already active")
            return
        
        logger.info("🚀 Starting Claude context memory system...")
        
        try:
            # 1. Start Claude Master Orchestrator
            orchestrator_script = self.script_dir / "a_memory_core" / "claude_master_orchestrator.py"
            if orchestrator_script.exists():
                subprocess.Popen(
                    [sys.executable, str(orchestrator_script), "start"],
                    cwd=str(self.script_dir),
                    stdout=subprocess.DEVNULL,
                    stderr=subprocess.DEVNULL
                )
                logger.info("✅ Started Claude Master Orchestrator")
            
            # 2. Start main memory system agents (from parent directory)
            main_start_script = self.main_memory_root / "start_all_agents.py"
            if main_start_script.exists():
                subprocess.Popen(
                    [sys.executable, str(main_start_script)],
                    cwd=str(self.main_memory_root),
                    stdout=subprocess.DEVNULL,
                    stderr=subprocess.DEVNULL
                )
                logger.info("✅ Started main memory agents")
            
            self.memory_system_active = True
            self.save_state()
            
        except Exception as e:
            logger.error(f"Failed to start memory system: {e}")

    def stop_claude_memory_system(self):
        """Stop the Claude context memory system"""
        if not self.memory_system_active:
            return
        
        logger.info("🛑 Stopping Claude context memory system...")
        
        try:
            # Stop Claude orchestrator
            orchestrator_script = self.script_dir / "a_memory_core" / "claude_master_orchestrator.py"
            if orchestrator_script.exists():
                subprocess.run([sys.executable, str(orchestrator_script), "stop"], timeout=30)
                logger.info("✅ Stopped Claude Master Orchestrator")
            
            self.memory_system_active = False
            self.save_state()
            
        except Exception as e:
            logger.error(f"Failed to stop memory system: {e}")

    def save_state(self):
        """Save watcher state"""
        state = {
            "memory_system_active": self.memory_system_active,
            "last_check": datetime.now().isoformat(),
            "claude_processes": list(self.claude_code_processes)
        }
        
        try:
            with open(self.state_file, 'w') as f:
                json.dump(state, f, indent=2)
        except Exception as e:
            logger.error(f"Failed to save state: {e}")

    def load_state(self):
        """Load watcher state"""
        if not self.state_file.exists():
            return
        
        try:
            with open(self.state_file, 'r') as f:
                state = json.load(f)
                self.memory_system_active = state.get("memory_system_active", False)
                self.claude_code_processes = set(state.get("claude_processes", []))
        except Exception as e:
            logger.error(f"Failed to load state: {e}")

    def watch_loop(self):
        """Main watching loop"""
        logger.info("👁️ Starting Claude Code watch loop...")
        
        while self.monitoring_active:
            try:
                # Detect Claude Code activity
                claude_processes = self.detect_claude_code_activity()
                vscode_processes = self.detect_vscode_activity()
                
                current_activity = len(claude_processes) > 0 or len(vscode_processes) > 0
                
                if current_activity and not self.memory_system_active:
                    logger.info(f"🔍 Claude Code activity detected! Processes: {len(claude_processes)} Claude, {len(vscode_processes)} VS Code")
                    self.start_claude_memory_system()
                
                elif not current_activity and self.memory_system_active:
                    # Wait a bit before shutting down in case of brief interruption
                    logger.info("⏳ No Claude Code activity detected, waiting before shutdown...")
                    time.sleep(60)  # Wait 1 minute
                    
                    # Check again
                    claude_processes = self.detect_claude_code_activity()
                    vscode_processes = self.detect_vscode_activity()
                    current_activity = len(claude_processes) > 0 or len(vscode_processes) > 0
                    
                    if not current_activity:
                        logger.info("📝 Claude Code session ended, stopping memory system")
                        self.stop_claude_memory_system()
                
                # Update process tracking
                self.claude_code_processes = {str(p['pid']) for p in claude_processes}
                
            except KeyboardInterrupt:
                logger.info("🛑 Watcher interrupted by user")
                self.monitoring_active = False
                break
            
            except Exception as e:
                logger.error(f"Error in watch loop: {e}")
            
            # Wait before next check
            time.sleep(10)  # Check every 10 seconds

    def start_monitoring(self):
        """Start the monitoring process"""
        self.load_state()
        
        # Start monitoring in background thread
        monitor_thread = threading.Thread(target=self.watch_loop, daemon=True)
        monitor_thread.start()
        
        logger.info("🎯 Claude Code Watcher active - monitoring for Claude Code activity...")
        
        try:
            while self.monitoring_active:
                time.sleep(1)
        except KeyboardInterrupt:
            logger.info("🛑 Stopping Claude Code Watcher...")
            self.monitoring_active = False
            if self.memory_system_active:
                self.stop_claude_memory_system()

    def get_status(self):
        """Get watcher status"""
        claude_processes = self.detect_claude_code_activity()
        vscode_processes = self.detect_vscode_activity()
        
        return {
            "watcher_active": self.monitoring_active,
            "memory_system_active": self.memory_system_active,
            "claude_processes": len(claude_processes),
            "vscode_processes": len(vscode_processes),
            "project_root": str(self.project_root),
            "timestamp": datetime.now().isoformat()
        }

def main():
    """Main execution function"""
    watcher = ClaudeCodeWatcher()
    
    if len(sys.argv) > 1:
        command = sys.argv[1].lower()
        
        if command == 'start':
            watcher.start_monitoring()
        
        elif command == 'status':
            status = watcher.get_status()
            print(json.dumps(status, indent=2))
        
        elif command == 'force-start':
            watcher.start_claude_memory_system()
        
        elif command == 'force-stop':
            watcher.stop_claude_memory_system()
        
        else:
            print("Usage: python claude_code_watcher.py [start|status|force-start|force-stop]")
    
    else:
        # Default: start monitoring
        watcher.start_monitoring()

if __name__ == "__main__":
    main()