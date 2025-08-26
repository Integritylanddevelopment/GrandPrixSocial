@echo off
REM CommandCore Memory Agent Core Launcher
REM This script starts the memory system with proper environment setup

echo.
echo ========================================
echo CommandCore Memory Agent Core Launcher
echo ========================================
echo.

REM Set the working directory to the script location
cd /d "%~dp0"

REM Check if Python is available
python --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Python is not installed or not in PATH
    echo Please install Python 3.8+ and add it to your PATH
    pause
    exit /b 1
)

echo Starting Memory Agent Core...
echo.

REM Run the memory core launcher
python start_memory_core.py

REM Check exit code
if errorlevel 1 (
    echo.
    echo ERROR: Memory Agent Core failed to start
    echo Check the logs for more details
    pause
    exit /b 1
) else (
    echo.
    echo Memory Agent Core started successfully!
    echo.
)

echo Press any key to exit...
pause >nul
