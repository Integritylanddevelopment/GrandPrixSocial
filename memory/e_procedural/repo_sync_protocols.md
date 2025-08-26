# 🔄 REPO SYNC AGENT PROTOCOLS
*Created: 2025-08-20*
*Type: Procedural Memory - Critical*

## 🎯 AGENT RESPONSIBILITY MATRIX

### **REPO SYNC AGENT HANDLES:**
- ✅ All git operations (add, commit, push)
- ✅ Repository monitoring and status
- ✅ Vercel deployment coordination  
- ✅ GitHub integration and sync
- ✅ Deployment error reporting
- ✅ Branch management and merging
- ✅ Commit message generation
- ✅ Push operations to remote repos

### **CLAUDE SHOULD NEVER:**
- ❌ Run git commands directly
- ❌ Push to repositories manually
- ❌ Handle deployment processes
- ❌ Manage git status or commits
- ❌ Interface with Vercel directly

## 🧠 MEMORY SYSTEM INTEGRATION

### **Context Injection Engine MUST:**
- Notify Claude on initialization that repo sync agent exists
- Provide current repo sync agent capabilities
- Route all git-related requests to repo sync agent
- Maintain awareness of agent specializations

### **Memory Orchestrator MUST:**
- Coordinate between Claude and repo sync agent
- Queue git operations for repo sync agent
- Provide status updates on repository state
- Handle cross-agent communication

### **Procedural Memory STORES:**
- Repo sync agent location: `memory/a_memory_core/repo_sync_agent/`
- Known repositories and their configurations
- Standard operating procedures for git operations
- Deployment protocols and error handling

## 📋 CORRECT WORKFLOW

### **When Changes Need Pushing:**
1. **Claude**: Completes code changes
2. **Claude**: Notifies memory orchestrator of completed work
3. **Memory Orchestrator**: Routes push request to repo sync agent
4. **Repo Sync Agent**: Handles all git operations
5. **Repo Sync Agent**: Reports deployment status back
6. **Claude**: Receives status update, continues work

### **Repository Information:**
- **Project**: Grand Prix Social
- **Location**: `D:\ActiveProjects\GrandPrixSocial`
- **Remote**: `https://github.com/Integritylanddevelopment/GrandPrixSocial.git`
- **Deployment**: Vercel (automated on push)
- **Branch**: main

## 🔧 REPO SYNC AGENT CONFIGURATION

### **Known Capabilities:**
```python
# Commands repo sync agent handles:
- sync-to: Push local changes to remote
- sync-from: Pull remote changes locally  
- status: Check repository status
- check-deployment: Monitor Vercel deployment
- deployment-summary: Get deployment reports
```

### **Deployment Monitoring:**
- Vercel integration configured
- Error reporting enabled
- Production deployment tracking
- Build log collection

## 🚨 VIOLATION CORRECTION

### **What Happened (ERROR):**
Claude manually executed:
- `git status`
- `git add`
- `git commit` 
- `git push`
- `npx vercel --prod`

### **What Should Have Happened:**
1. Claude notifies orchestrator: "Fantasy Formula UI fixes complete"
2. Orchestrator routes to repo sync agent
3. Repo sync agent handles entire git workflow
4. Agent reports back deployment status
5. Claude receives confirmation and continues

## 📝 MEMORY UPDATE REQUIRED

### **Context Injection Engine Update:**
```json
{
  "agent_capabilities": {
    "repo_sync_agent": {
      "handles": ["git_operations", "deployments", "github_sync"],
      "never_bypass": true,
      "location": "memory/a_memory_core/repo_sync_agent/",
      "priority": "high"
    }
  },
  "claude_restrictions": {
    "git_commands": "forbidden",
    "deployment_commands": "forbidden", 
    "must_use_agent": "repo_sync_agent"
  }
}
```

### **Orchestrator Inbox Addition:**
```json
{
  "message_type": "agent_protocol_update",
  "content": {
    "action": "update_claude_context", 
    "agent": "repo_sync_agent",
    "responsibility": "all_git_and_deployment_operations",
    "claude_role": "code_changes_only"
  },
  "priority": "critical"
}
```

## 🔄 IMMEDIATE CORRECTIVE ACTIONS

1. **Update Context Injection** to always notify about repo sync agent
2. **Configure Orchestrator** to route git requests automatically
3. **Test Agent Communication** - ensure proper handoff
4. **Document Agent Protocols** in long-term memory
5. **Set Agent Auto-Activation** on memory system startup

## Tags
#type:procedural #project:grandprix #intent:agent_protocols #priority:critical #agent:repo_sync #orchestrator:required