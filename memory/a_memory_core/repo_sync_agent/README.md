# 🔄 Repository Sync Agent - Grand Prix Social
*Memory System Integration*

## 🎯 **Agent Purpose**
Bidirectional synchronization agent that keeps Grand Prix Social's GitHub repository, local development, and cloud deployments synchronized across all environments.

## 🏗️ **Integration with Memory System**

### **Memory Core Location**
- **Path**: `memory/a_memory_core/repo_sync_agent/`
- **Agent Type**: Core System Agent
- **Priority**: High (Infrastructure)

### **Memory Architecture Integration**
```
a_memory_core/repo_sync_agent/
├── repo_sync_agent.py          → Main sync agent
├── repo_sync_config.json       → Repository configurations
├── sync_logs/                  → Synchronization history
├── conflict_resolutions/       → Merge conflict tracking
└── deployment_tracking/        → Cloud sync status
```

## 🚦 **Agent Activation Status**
- **Status**: `READY`
- **Auto-Sync**: `ENABLED`
- **Monitoring**: `ACTIVE`

## 🔄 **Sync Targets**

### **Primary Repository**
- **Name**: GrandPrixSocial-Main
- **GitHub**: `https://github.com/Integritylanddevelopment/GrandPrixSocial-zf.git`
- **Local**: `D:\ActiveProjects\GrandPrixSocial\`
- **Branch**: `main`

### **Cloud Deployments**
- **Vercel**: Auto-deploy from main branch
- **Supabase**: Database schema sync
- **Memory System**: File-based persistence

## 🧠 **Memory System Coordination**

### **Working Memory Integration**
- Sync operations logged to `d_working_memory/sync_operations/`
- Conflict resolutions stored in `d_working_memory/active/conflicts/`
- Deployment status tracked in `d_working_memory/deployment_status.md`

### **Long-term Memory**
- Historical sync data in `b_long_term_memory/sync_history/`
- Repository configuration backups
- Performance metrics and analytics

## ⚙️ **Configuration**

### **Auto-Sync Triggers**
- File changes detected in local repository
- GitHub webhook notifications
- Scheduled sync every 30 minutes
- Pre-deployment sync validation

### **Conflict Resolution Strategy**
1. **Automatic**: Simple merges with no conflicts
2. **Manual Alert**: Complex conflicts require human intervention
3. **Backup**: Create conflict backup before resolution
4. **Logging**: All conflicts logged to memory system

## 📊 **Monitoring & Analytics**

### **Sync Metrics**
- Last sync timestamp
- Files synchronized
- Conflict frequency
- Deployment success rate

### **Memory System Alerts**
- Sync failures trigger memory system alerts
- Conflict notifications routed through orchestrator
- Performance degradation monitoring

## 🔗 **Agent Dependencies**
- **Memory Orchestrator**: Coordinates sync operations
- **System Health Agent**: Monitors sync agent status
- **User Intelligence Agent**: Tracks developer activity

## 🚀 **Usage Examples**

### **Manual Sync**
```python
from repo_sync_agent import RepoSyncAgent

agent = RepoSyncAgent()
result = agent.sync_to_remote('grandprix_main', 'Feature: Added memory integration')
```

### **Status Check**
```python
status = agent.get_repo_status('grandprix_main')
print(status)
```

### **Cherry-pick Download**
```python
result = agent.cherry_pick_download(
    'https://github.com/Integritylanddevelopment/GrandPrixSocial-zf',
    'components/ui/button.tsx',
    './temp_downloads/',
    'main'
)
```

## 🎯 **Grand Prix Social Specific Features**

### **Memory System Sync**
- Syncs memory folder structure (excluding sensitive data)
- Maintains memory agent configurations
- Backs up user intelligence data

### **Database Schema Sync**
- Coordinates with Supabase migrations
- Tracks schema changes in memory
- Validates database consistency

### **Deployment Pipeline Integration**
- Pre-deployment validation
- Post-deployment memory updates
- Rollback coordination with memory system

## 📝 **Configuration File**

Create `repo_sync_config.json`:
```json
{
  "grandprix_main": {
    "project_id": "grandprix_main",
    "name": "Grand Prix Social",
    "local_path": "D:\\ActiveProjects\\GrandPrixSocial",
    "remote_url": "https://github.com/Integritylanddevelopment/GrandPrixSocial-zf.git",
    "branch": "main",
    "sync_enabled": true,
    "auto_sync_interval": 1800,
    "memory_sync_enabled": true,
    "deployment_sync": {
      "vercel": true,
      "supabase": true
    }
  }
}
```

## 🏁 **Launch Integration**
This agent is now integrated into Grand Prix Social's memory system and ready for bidirectional synchronization across all development environments.

## Tags
#type:sync #agent:core #priority:high #status:ready #integration:memory #project:grandprix