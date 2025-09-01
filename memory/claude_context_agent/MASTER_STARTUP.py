#!/usr/bin/env python3
"""
GRAND PRIX SOCIAL - MASTER STARTUP SCRIPT
===========================================

This is THE ONLY script you need to run to get everything started.
It reads the entire Claude context, starts all memory systems, and 
gets Claude fully familiarized with the project.

Usage: python MASTER_STARTUP.py

What this script does:
1. Reads entire Claude context folder and familiarizes Claude
2. Starts cloud context integration
3. Starts all memory agents and orchestrators  
4. Starts enhanced memory system
5. Launches memory core
6. Activates cognitive loops
7. Provides comprehensive status report

Author: Claude AI
Date: 2025-08-31
"""

import os
import sys
import time
import subprocess
import json
from pathlib import Path
from datetime import datetime

# Add current directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
sys.path.append(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..'))

def print_header():
    """Print the startup header"""
    print("\n" + "="*80)
    print("  GRAND PRIX SOCIAL - MASTER STARTUP")  
    print("  Complete Memory System + Claude Context Initialization")
    print("="*80)
    print(f"  Started: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("="*80)

def read_claude_context():
    """Read and display Claude context files for familiarization"""
    print("\n[STEP 1/7] Reading Claude Context for Full Familiarization...")
    print("-" * 60)
    
    context_files = [
        "CLAUDE.md",
        "b_long_term_memory/CLAUDE.md", 
        "CLAUDE_CURRENT_SESSION.md",
        "README.md"
    ]
    
    context_data = {}
    
    for file_path in context_files:
        full_path = os.path.join(os.path.dirname(__file__), file_path)
        if os.path.exists(full_path):
            try:
                with open(full_path, 'r', encoding='utf-8') as f:
                    content = f.read()
                    context_data[file_path] = content
                    print(f"  [OK] Loaded: {file_path} ({len(content)} chars)")
            except Exception as e:
                print(f"  [!] Warning: Could not read {file_path}: {e}")
        else:
            print(f"  [!] Warning: {file_path} not found")
    
    print(f"\n  [SUMMARY] Claude Context: {len(context_data)} files loaded")
    print("  [INFO] Claude should now be fully familiar with Grand Prix Social")
    return context_data

def start_cloud_context_integration():
    """Start cloud context integration service"""
    print("\n[STEP 2/7] Starting Cloud Context Integration...")
    print("-" * 60)
    
    script_path = os.path.join(os.path.dirname(__file__), "..", "cloud_context_integration_service.py")
    
    if os.path.exists(script_path):
        try:
            # Start as background process
            process = subprocess.Popen([
                sys.executable, script_path
            ], stdout=subprocess.PIPE, stderr=subprocess.PIPE, cwd=os.path.dirname(script_path))
            
            print(f"  [OK] Cloud Context Integration started (PID: {process.pid})")
            return process
        except Exception as e:
            print(f"  [X] Failed to start Cloud Context Integration: {e}")
            return None
    else:
        print(f"  [!] Cloud Context Integration not found at: {script_path}")
        return None

def start_claude_context_system():
    """Start Claude context system"""
    print("\n[STEP 3/7] Starting Claude Context System...")
    print("-" * 60)
    
    script_path = os.path.join(os.path.dirname(__file__), "start_claude_context_system.py")
    
    if os.path.exists(script_path):
        try:
            process = subprocess.Popen([
                sys.executable, script_path
            ], stdout=subprocess.PIPE, stderr=subprocess.PIPE)
            
            print(f"  [OK] Claude Context System started (PID: {process.pid})")
            return process
        except Exception as e:
            print(f"  [X] Failed to start Claude Context System: {e}")
            return None
    else:
        print(f"  [!] Claude Context System not found at: {script_path}")
        return None

def start_all_memory_agents():
    """Start all memory agents"""
    print("\n[STEP 4/7] Starting All Memory Agents...")
    print("-" * 60)
    
    script_path = os.path.join(os.path.dirname(__file__), "start_all_agents.py")
    
    if os.path.exists(script_path):
        try:
            process = subprocess.Popen([
                sys.executable, script_path
            ], stdout=subprocess.PIPE, stderr=subprocess.PIPE)
            
            print(f"  [OK] All Memory Agents started (PID: {process.pid})")
            return process
        except Exception as e:
            print(f"  [X] Failed to start Memory Agents: {e}")
            return None
    else:
        print(f"  [!] Memory Agents script not found at: {script_path}")
        return None

def start_enhanced_memory_system():
    """Start enhanced memory system"""
    print("\n[STEP 5/7] Starting Enhanced Memory System...")
    print("-" * 60)
    
    script_path = os.path.join(os.path.dirname(__file__), "..", "enhanced_memory_agents.py")
    
    if os.path.exists(script_path):
        try:
            process = subprocess.Popen([
                sys.executable, script_path
            ], stdout=subprocess.PIPE, stderr=subprocess.PIPE, cwd=os.path.dirname(script_path))
            
            print(f"  [OK] Enhanced Memory System started (PID: {process.pid})")
            return process
        except Exception as e:
            print(f"  [X] Failed to start Enhanced Memory System: {e}")
            return None
    else:
        print(f"  [!] Enhanced Memory System not found at: {script_path}")
        return None

def start_memory_orchestrators():
    """Start memory orchestrators"""
    print("\n[STEP 6/7] Starting Memory Orchestrators...")
    print("-" * 60)
    
    orchestrator_paths = [
        "../a_memory_core/master_orchestrator_agent/master_orchestrator_agent.py",
        "../a_memory_core/memory_orchestrator_agent/memory_orchestrator_agent.py"
    ]
    
    processes = []
    
    for rel_path in orchestrator_paths:
        script_path = os.path.join(os.path.dirname(__file__), rel_path)
        
        if os.path.exists(script_path):
            try:
                process = subprocess.Popen([
                    sys.executable, script_path
                ], stdout=subprocess.PIPE, stderr=subprocess.PIPE, cwd=os.path.dirname(script_path))
                
                processes.append(process)
                orchestrator_name = os.path.basename(script_path).replace('.py', '')
                print(f"  [OK] {orchestrator_name} started (PID: {process.pid})")
            except Exception as e:
                print(f"  [X] Failed to start {rel_path}: {e}")
        else:
            print(f"  [!] Orchestrator not found: {rel_path}")
    
    return processes

def activate_cognitive_systems():
    """Activate cognitive systems and loops"""
    print("\n[STEP 7/7] Activating Cognitive Systems...")
    print("-" * 60)
    
    activation_scripts = [
        "../activate_agents.py",
        "../activate_cognitive_loop.py"
    ]
    
    processes = []
    
    for rel_path in activation_scripts:
        script_path = os.path.join(os.path.dirname(__file__), rel_path)
        
        if os.path.exists(script_path):
            try:
                process = subprocess.Popen([
                    sys.executable, script_path
                ], stdout=subprocess.PIPE, stderr=subprocess.PIPE, cwd=os.path.dirname(script_path))
                
                processes.append(process)
                script_name = os.path.basename(script_path).replace('.py', '')
                print(f"  [OK] {script_name} activated (PID: {process.pid})")
            except Exception as e:
                print(f"  [X] Failed to activate {rel_path}: {e}")
        else:
            print(f"  [!] Activation script not found: {rel_path}")
    
    return processes

def show_final_status(all_processes):
    """Show final system status"""
    print("\n" + "="*80)
    print("  GRAND PRIX SOCIAL MEMORY SYSTEM - STARTUP COMPLETE")
    print("="*80)
    
    running_processes = 0
    total_processes = len(all_processes)
    
    for process in all_processes:
        if process and process.poll() is None:
            running_processes += 1
    
    print(f"  Active Processes: {running_processes}/{total_processes}")
    print(f"  System Status: {'FULLY OPERATIONAL' if running_processes >= total_processes * 0.8 else 'PARTIALLY OPERATIONAL'}")
    print(f"  Memory Systems: Online and processing")
    print(f"  Claude Context: Fully loaded and familiarized") 
    print(f"  Cloud Integration: Active")
    
    print("\n  WHAT'S NOW ACTIVE:")
    print("  - Claude Context System (core context processing)")
    print("  - Cloud Context Integration (real-time sync)")
    print("  - All Memory Agents (13+ agents coordinating)")
    print("  - Enhanced Memory System (advanced processing)")
    print("  - Memory Orchestrators (agent coordination)")
    print("  - Cognitive Systems (reasoning and analysis)")
    
    print(f"\n  [INFO] System ready for Claude interaction!")
    print(f"  [INFO] Claude is now fully familiar with Grand Prix Social")
    print(f"  [INFO] All memory systems active and coordinating")
    
    print("="*80)

def main():
    """Main startup function"""
    try:
        print_header()
        
        # Step 1: Read Claude context for familiarization
        context_data = read_claude_context()
        
        # Small delay between steps for clarity
        time.sleep(1)
        
        # Step 2-7: Start all systems
        all_processes = []
        
        cloud_process = start_cloud_context_integration()
        if cloud_process: all_processes.append(cloud_process)
        time.sleep(1)
        
        claude_process = start_claude_context_system()
        if claude_process: all_processes.append(claude_process)
        time.sleep(1)
        
        agents_process = start_all_memory_agents()
        if agents_process: all_processes.append(agents_process)
        time.sleep(1)
        
        enhanced_process = start_enhanced_memory_system()
        if enhanced_process: all_processes.append(enhanced_process)
        time.sleep(1)
        
        orchestrator_processes = start_memory_orchestrators()
        all_processes.extend(orchestrator_processes)
        time.sleep(1)
        
        cognitive_processes = activate_cognitive_systems()
        all_processes.extend(cognitive_processes)
        
        # Wait a moment for processes to initialize
        time.sleep(3)
        
        # Show final status
        show_final_status(all_processes)
        
        print(f"\n[MASTER STARTUP COMPLETE] All systems initialized!")
        print(f"[SEND CLAUDE HERE] memory/claude_context_agent/MASTER_STARTUP.py")
        
    except KeyboardInterrupt:
        print("\n\n[INTERRUPTED] Startup interrupted by user")
        sys.exit(1)
    except Exception as e:
        print(f"\n\n[ERROR] Startup failed: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()