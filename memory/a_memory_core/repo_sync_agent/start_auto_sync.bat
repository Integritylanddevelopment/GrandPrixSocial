@echo off
echo Starting Grand Prix Social Auto-Sync Agent...
cd /d "D:\ActiveProjects\GrandPrixSocial\memory\a_memory_core\repo_sync_agent"

echo Testing current status...
python smart_sync.py status

echo.
echo Running auto-sync check...
python smart_sync.py sync

echo.
echo Auto-sync agent is now monitoring the repository.
echo Changes will be automatically committed and pushed when:
echo - 5+ files are modified (configurable)
echo - Significant changes are detected
echo - 30+ minutes have passed since last sync
echo.
pause