@echo off
REM Enhanced sync script with Vercel deployment monitoring
REM This script syncs changes and checks deployment status

echo 🚀 Grand Prix Social - Enhanced Sync with Deployment Check
echo.

cd /d "D:\ActiveProjects\GrandPrixSocial"

echo 📝 Checking for changes...
git status --porcelain > temp_status.txt
set /p changes=<temp_status.txt
del temp_status.txt

if "%changes%"=="" (
    echo ✅ No local changes to sync
    echo 🔍 Checking deployment status anyway...
    python "memory\a_memory_core\repo_sync_agent\check_deployment.py"
    goto :end
)

echo 📋 Changes detected, syncing...

REM Add all changes
git add .

REM Commit with timestamp
for /f "tokens=2-8 delims=/ " %%a in ('date /t') do set mydate=%%c-%%a-%%b
for /f "tokens=1-3 delims=: " %%a in ('time /t') do set mytime=%%a:%%b
set commit_msg=Auto-sync %mydate% %mytime% - Enhanced with deployment monitoring

git commit -m "%commit_msg%"

if errorlevel 1 (
    echo ❌ Commit failed
    pause
    exit /b 1
)

echo 📤 Pushing to remote...
git push

if errorlevel 1 (
    echo ❌ Push failed
    pause
    exit /b 1
)

echo ✅ Git push successful!
echo.
echo ⏳ Waiting 10 seconds for Vercel deployment to start...
timeout /t 10 /nobreak >nul

echo 🔍 Checking Vercel deployment status...
python "memory\a_memory_core\repo_sync_agent\check_deployment.py"

if errorlevel 1 (
    echo.
    echo 🚨 DEPLOYMENT FAILURE DETECTED!
    echo 📋 Deployment logs have been captured for Claude to review
    echo 💡 Claude will analyze and fix any deployment issues
    pause
    exit /b 1
)

:end
echo.
echo 🎉 Sync and deployment check complete!
pause