 GLOBAL SYSTEM UPGRADES (Cross-Module)


memory_index.json – Auto-generated searchable memory index


promote_to_ltm.py – Script to move STM/EPI/WM → LTM


memory_decay.py – Prunes old STM and WM entries (TTL logic)


memory_linker.py – NLP-based cross-referencing of SEM, EPI, LTM


memory_router.py – Unified read/write interface for all memory folders



🤖 AGENT CORE + FLEET SYSTEM


agent_log.py – Track agent start, stop, failures, and performance


heartbeat_monitor.py – Detect crashed or stalled agents


agent_profile.json – Per-agent traits, ID, and history


task_recovery.py – Requeue stuck or failed agent tasks


metrics_reporter.py – Runtime analytics (task durations, load)


strategy_loader.py – Dynamic strategy switching or injection



🗂️ AGENT FOLDER STRUCTURE


agent.meta.json – Standard identity file for each agent


role.md / purpose.md – Human-readable function overview per agent


contract.md – Define agent I/O expectations (format, protocol)


permissions.json – Optional security constraints per agent


validate_agent_folder.py – Batch validator for agent completeness



🧠 CHATGPT ORGANIZER (Brainstem + Router)


registry.json – Maps tasks to specific agents


router_config.yaml – Binds tasks → agent → template


fallback_templates.md – Default outputs for broken/missing templates


sanitize_input.py – Strip harmful or malformed input text


router_log.py – Logs all input → agent → output mappings with metadata



🔌 PLUGINS SYSTEM


plugin_registry.json – Master list of plugins with path, language, status


plugin_loader.py – Lifecycle manager for loading/enabling plugins


plugin_contract.md – Required functions: init(), run(), shutdown()


sandbox_runner.py – Isolated subprocess wrapper for each plugin


plugin_log.py – Track plugin runs, errors, and latency



🎛️ INTERFACE (REACT FRONTEND)


contexts/ folder – Global state store (auth, roles, UI state)


api/agentApi.js – Axios wrapper for backend calls to memory/agents


authGuard.jsx – Conditional route rendering based on login/role


NotificationContext.js – Global snackbar/alert support


useMemorySnapshot() – Hook to read live memory data into components



🧩 BONUS RECOMMENDATIONS


agent_test_runner.py – CLI script to run unit tests across all agents


memory_mirror.db – Optional SQLite cache for memory summary view


commandcore_launcher.py – One script to initialize all systems (memory, fleet, UI, plugins)


commandcore_healthcheck.py – Pings agents, plugins, memory for uptime status report


system_dashboard.md – Living doc that links to all registries, logs, and scripts




---
**Last Auto-Updated:** 2025-07-30 23:14:38


## Autonomous Improvements

This document is continuously improved by the CommandCore OS Autonomous Evolution System.

### Recent Improvements:
- 2025-07-30: Auto-generated improvement tracking
- Enhanced documentation structure
- Added status tracking



**Last Updated:** 2025-07-30 23:16:00
