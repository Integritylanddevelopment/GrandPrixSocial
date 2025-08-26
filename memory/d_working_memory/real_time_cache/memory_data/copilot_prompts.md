# CommandCore GUI Agent Build Prompts

## 1. builder_secrets_obfuscator_agent

```
🧠 Create `builder_secrets_obfuscator_agent` in `/builder_gui/gui_agents/`

Create folder structure:
```
/builder_gui/gui_agents/builder_secrets_obfuscator_agent/
├── builder_secrets_obfuscator_agent.py
├── builder_secrets_obfuscator_agent_metadata.json
├── builder_secrets_obfuscator_agent_logic.json
└── builder_secrets_obfuscator_agent_state.json
```

**Agent Script (builder_secrets_obfuscator_agent.py):**
```python
import os
import re
import json
from datetime import datetime
from dotenv import load_dotenv

load_dotenv()

## Table of Contents
- [Overview](#overview)
- [Installation](#installation)
- [Usage](#usage)
- [Contributing](#contributing)


# Patterns to detect secrets
SECRET_PATTERNS = [
    r'sk-[a-zA-Z0-9]{48}',  # OpenAI API keys
    r'Bearer [a-zA-Z0-9]+',  # Bearer tokens
    r'password\s*=\s*["\'][^"\']+["\']',  # Password assignments
    r'api_key\s*=\s*["\'][^"\']+["\']',  # API key assignments
    r'token\s*=\s*["\'][^"\']+["\']',  # Token assignments
]

def scan_file_for_secrets(file_path):
    """Scan a single file for potential secrets"""
    secrets_found = []
    try:
        with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
            content = f.read()
            for i, line in enumerate(content.split('\n'), 1):
                for pattern in SECRET_PATTERNS:
                    matches = re.findall(pattern, line, re.IGNORECASE)
                    for match in matches:
                        secrets_found.append({
                            'file': file_path,
                            'line': i,
                            'pattern': pattern,
                            'match': match[:10] + '...' if len(match) > 10 else match
                        })
    except Exception as e:
        print(f"Error scanning {file_path}: {e}")
    return secrets_found

def create_redacted_copy(file_path, output_dir):
    """Create a redacted copy of the file"""
    try:
        with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
            content = f.read()
        
        # Apply redaction patterns
        for pattern in SECRET_PATTERNS:
            content = re.sub(pattern, '🔐 [REDACTED]', content, flags=re.IGNORECASE)
        
        # Create output path
        rel_path = os.path.relpath(file_path, start=os.getcwd())
        output_path = os.path.join(output_dir, rel_path)
        os.makedirs(os.path.dirname(output_path), exist_ok=True)
        
        with open(output_path, 'w', encoding='utf-8') as f:
            f.write(content)
        
        return output_path
    except Exception as e:
        print(f"Error creating redacted copy of {file_path}: {e}")
        return None

def main():
    """Main function to scan for secrets and create redacted copies"""
    print("🔍 Scanning for secrets...")
    
    # Directories to scan
    scan_dirs = ['memory/', 'builder_gui/', 'memory_agents/', 'os_agents/']
    file_extensions = ['.py', '.json', '.md', '.txt', '.env']
    
    all_secrets = []
    safe_export_dir = 'safe_exports'
    os.makedirs(safe_export_dir, exist_ok=True)
    
    for scan_dir in scan_dirs:
        if os.path.exists(scan_dir):
            for root, dirs, files in os.walk(scan_dir):
                for file in files:
                    if any(file.endswith(ext) for ext in file_extensions):
                        file_path = os.path.join(root, file)
                        secrets = scan_file_for_secrets(file_path)
                        all_secrets.extend(secrets)
                        
                        # Create redacted copy if secrets found
                        if secrets:
                            create_redacted_copy(file_path, safe_export_dir)
    
    # Generate audit report
    timestamp = datetime.now().strftime("%m-%d_%I-%M%p")
    audit_file = f"logs/secrets_audit_{timestamp}.md"
    os.makedirs('logs', exist_ok=True)
    
    with open(audit_file, 'w', encoding='utf-8') as f:
        f.write(f"# Secrets Audit Report - {timestamp}\n\n")
        f.write(f"**Files Scanned:** {sum(1 for _ in scan_dirs)}\n")
        f.write(f"**Secrets Found:** {len(all_secrets)}\n\n")
        
        if all_secrets:
            f.write("## Detected Secrets:\n\n")
            for secret in all_secrets:
                f.write(f"- **File:** {secret['file']}\n")
                f.write(f"  **Line:** {secret['line']}\n")
                f.write(f"  **Pattern:** {secret['match']}\n\n")
        else:
            f.write("✅ No secrets detected!\n")
    
    print(f"✅ Scan complete. Report saved to: {audit_file}")
    print(f"🔐 Redacted copies saved to: {safe_export_dir}/")
    
    return len(all_secrets)

if __name__ == "__main__":
    main()
```

**Metadata JSON:**
```json
{
  "agent_name": "builder_secrets_obfuscator_agent",
  "agent_type": "gui",
  "author": "Stephen Alexander",
  "license": "CommandCore OS License Agreement — Version 2025.06.11-A — © 2025 Stephen Alexander. All rights reserved.",
  "status": "active",
  "description": "Scans codebase for exposed secrets and creates redacted copies"
}
```

**Logic JSON:**
```json
{
  "purpose": "Prevent accidental secret exposure in GitHub uploads",
  "scan_patterns": ["OpenAI keys", "Bearer tokens", "passwords", "API keys"],
  "output_locations": ["safe_exports/", "logs/secrets_audit_*.md"],
  "trigger": "manual or pre-commit hook"
}
```

**State JSON:**
```json
{
  "last_scan": null,
  "secrets_found_count": 0,
  "last_audit_file": null,
  "scan_directories": ["memory/", "builder_gui/", "memory_agents/", "os_agents/"]
}
```

Create all files and test the agent by running `python builder_secrets_obfuscator_agent.py`.
```

Copy and paste this prompt to Copilot to create your first strategic GUI agent!


---
**Last Auto-Updated:** 2025-07-30 23:14:38


## Autonomous Improvements

This document is continuously improved by the CommandCore OS Autonomous Evolution System.

### Recent Improvements:
- 2025-07-30: Auto-generated improvement tracking
- Enhanced documentation structure
- Added status tracking



**Last Updated:** 2025-07-30 23:15:54
