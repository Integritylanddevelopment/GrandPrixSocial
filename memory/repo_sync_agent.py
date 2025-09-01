#!/usr/bin/env python3
"""
Repository Sync Agent - Grand Prix Social
Automated git operations with intelligent commit messaging
"""

import subprocess
import json
import os
from datetime import datetime

def run_git_command(cmd):
    """Execute git command and return output"""
    try:
        result = subprocess.run(cmd, shell=True, capture_output=True, text=True, cwd=os.getcwd())
        return result.returncode == 0, result.stdout.strip(), result.stderr.strip()
    except Exception as e:
        return False, "", str(e)

def analyze_changes():
    """Analyze staged changes to generate intelligent commit message"""
    success, status_output, _ = run_git_command("git status --porcelain --staged")
    
    if not success:
        return "Update project files"
    
    changes = {
        'new': [],
        'modified': [],
        'deleted': []
    }
    
    for line in status_output.split('\n'):
        if not line:
            continue
        
        status = line[:2]
        filename = line[3:]
        
        if status.startswith('A'):
            changes['new'].append(filename)
        elif status.startswith('M'):
            changes['modified'].append(filename)
        elif status.startswith('D'):
            changes['deleted'].append(filename)
    
    return generate_commit_message(changes)

def generate_commit_message(changes):
    """Generate intelligent commit message based on changes"""
    msg_parts = []
    
    # Detect major feature additions
    if any('claude-interface' in f for f in changes['new']):
        msg_parts.append("Add mobile Claude interface for team owners")
    
    if any('fantasy' in f and 'scoring' in f for f in changes['new']):
        msg_parts.append("Implement Fantasy Formula scoring engine")
    
    if any('init' in f and 'protocol' in f for f in changes['new']):
        msg_parts.append("Add system initialization protocol")
    
    if any('race-schedule' in f for f in changes['modified']):
        msg_parts.append("Enhance race schedule UI")
    
    if any('database' in f for f in changes['new']):
        msg_parts.append("Add database schema updates")
    
    # Default message if no specific patterns found
    if not msg_parts:
        new_count = len(changes['new'])
        mod_count = len(changes['modified'])
        del_count = len(changes['deleted'])
        
        if new_count > 0:
            msg_parts.append(f"Add {new_count} new file{'s' if new_count != 1 else ''}")
        if mod_count > 0:
            msg_parts.append(f"Update {mod_count} file{'s' if mod_count != 1 else ''}")
        if del_count > 0:
            msg_parts.append(f"Remove {del_count} file{'s' if del_count != 1 else ''}")
    
    # Create final message
    if len(msg_parts) == 1:
        main_msg = msg_parts[0]
    else:
        main_msg = "Complete F1 system integration"
        
    return f"🏁 {main_msg}\n\n🤖 Generated with [Claude Code](https://claude.ai/code)\n\nCo-Authored-By: Claude <noreply@anthropic.com>"

def main():
    print("🚀 Repository Sync Agent - Grand Prix Social")
    print("=" * 50)
    
    # Check if there are staged changes
    success, status, _ = run_git_command("git status --porcelain --staged")
    if not success:
        print("❌ Failed to check git status")
        return False
    
    if not status.strip():
        print("ℹ️  No staged changes to commit")
        return True
    
    print(f"📋 Found {len(status.strip().split())} staged changes")
    
    # Generate commit message
    commit_msg = analyze_changes()
    print(f"💬 Generated commit message:")
    print(f"   {commit_msg.split()[1]} {' '.join(commit_msg.split()[2:]).split('🤖')[0].strip()}")
    
    # Commit changes
    print("📦 Committing changes...")
    success, stdout, stderr = run_git_command(f'git commit -m "{commit_msg}"')
    
    if not success:
        print(f"❌ Commit failed: {stderr}")
        return False
    
    print("✅ Changes committed successfully")
    
    # Push to remote
    print("🚀 Pushing to remote repository...")
    success, stdout, stderr = run_git_command("git push")
    
    if not success:
        print(f"❌ Push failed: {stderr}")
        # Try to get more info about the error
        if "rejected" in stderr.lower():
            print("💡 Tip: You may need to pull first if remote has changes")
        return False
    
    print("🎉 Successfully pushed to remote repository!")
    
    # Update memory system
    update_memory_log(commit_msg)
    
    return True

def update_memory_log(commit_msg):
    """Update memory system with sync completion"""
    try:
        log_entry = {
            "timestamp": datetime.now().isoformat(),
            "action": "repo_sync_complete",
            "commit_message": commit_msg.split('\n')[0],
            "agent": "repo_sync_agent"
        }
        
        # Append to working memory log
        log_path = "memory/d_working_memory/repo_sync_log.json"
        
        if os.path.exists(log_path):
            with open(log_path, 'r') as f:
                logs = json.load(f)
        else:
            logs = []
        
        logs.append(log_entry)
        
        # Keep only last 50 entries
        logs = logs[-50:]
        
        with open(log_path, 'w') as f:
            json.dump(logs, f, indent=2)
        
        print("📝 Memory system updated with sync completion")
        
    except Exception as e:
        print(f"⚠️  Failed to update memory log: {e}")

if __name__ == "__main__":
    success = main()
    exit(0 if success else 1)