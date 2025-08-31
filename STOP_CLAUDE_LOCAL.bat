@echo off
echo ========================================
echo    STOPPING LOCAL CLAUDE + QWEN3
echo ========================================
echo.

echo Stopping API Bridge...
taskkill /f /im python.exe /fi "WINDOWTITLE eq Claude API Bridge*" 2>nul

echo Stopping Mobile GUI...
taskkill /f /im python.exe /fi "WINDOWTITLE eq Mobile GUI*" 2>nul

echo.
echo ========================================
echo    SYSTEM STOPPED
echo ========================================
echo.
echo Press any key to close...
pause >nul