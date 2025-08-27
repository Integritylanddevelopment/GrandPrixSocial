@echo off
REM Grand Prix Social - Continuous Monitoring and Sync Script
REM This script can be run periodically via Task Scheduler

cd /d "C:\D_Drive\ActiveProjects\GrandPrixSocial\memory\a_memory_core\repo_sync_agent"

echo [%DATE% %TIME%] Starting autonomous sync monitoring...

REM Run the autonomous sync cycle
python smart_sync.py autonomous > monitor_output.log 2>&1

REM Check if sync was successful
if %ERRORLEVEL% EQU 0 (
    echo [%DATE% %TIME%] Autonomous sync completed successfully
) else (
    echo [%DATE% %TIME%] Autonomous sync failed - check monitor_output.log
)

REM Optional: Add to system log
echo [%DATE% %TIME%] Autonomous sync cycle completed >> autonomous_sync_log.txt