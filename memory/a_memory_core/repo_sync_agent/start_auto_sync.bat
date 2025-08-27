@echo off
echo Starting Grand Prix Social Autonomous Sync Agent...
cd /d "C:\D_Drive\ActiveProjects\GrandPrixSocial\memory\a_memory_core\repo_sync_agent"

echo Testing current status...
python smart_sync.py status

echo.
echo Running autonomous sync cycle...
echo This will:
echo - Check git status
echo - Verify push completion  
echo - Monitor Vercel deployment
echo - Generate comprehensive report
echo.
python smart_sync.py autonomous

echo.
echo Autonomous sync cycle completed.
echo Check the sync_reports.log file for detailed reports.
echo.
pause