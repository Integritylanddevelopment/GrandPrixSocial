@echo off
echo ========================================
echo    STARTING LOCAL CLAUDE + QWEN3
echo ========================================
echo.

cd /d "C:\D_Drive\ActiveProjects\GrandPrixSocial"

echo [1/3] Starting API Bridge...
start "Claude API Bridge" python claude_qwen3_api_bridge.py
timeout /t 3 /nobreak >nul

echo [2/3] Starting Mobile Web GUI...
start "Mobile GUI" python web_gui.py  
timeout /t 3 /nobreak >nul

echo [3/3] Ready!
echo.
echo ========================================
echo    SYSTEM IS NOW RUNNING!
echo ========================================
echo.
echo Mobile Access: http://192.168.1.100:8080
echo (Open this on your phone's browser)
echo.
echo Claude Code: Run this in any folder:
echo set ANTHROPIC_API_URL=http://localhost:11434 && claude
echo.
echo Press any key to close this window...
pause >nul