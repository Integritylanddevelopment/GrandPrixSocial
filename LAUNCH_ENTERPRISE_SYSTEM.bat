@echo off
echo =========================================================
echo   GRAND PRIX SOCIAL - ENTERPRISE AGENT SYSTEM
echo   Powered by CommandCore OS + Local Qwen3 AI
echo =========================================================
echo.

cd /d "C:\D_Drive\ActiveProjects\GrandPrixSocial"

echo [PHASE 1] Docker Infrastructure Setup
echo ========================================
echo Checking Docker service...
docker --version >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Docker not found! Please install Docker Desktop
    pause
    exit /b 1
)

echo ✅ Docker is available
echo.

echo Starting Qwen3 inference container...
docker ps -a --filter name=claude-qwen3-local --format "table {{.Names}}\t{{.Status}}"

echo Ensuring container is running...
docker start claude-qwen3-local 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo Creating fresh container...
    docker run --rm -d --name claude-qwen3-local -p 11434:11434 -v ollama-models:/root/.ollama claude-qwen3-integrated:latest
    echo Waiting for container startup...
    timeout /t 15 /nobreak >nul
)

echo.
echo [PHASE 2] AI Inference Validation
echo ===================================
echo Testing local Qwen3 model...
timeout /t 5 /nobreak >nul
curl -s -X GET http://localhost:11434/api/tags --connect-timeout 10 --max-time 30

if %ERRORLEVEL% NEQ 0 (
    echo ⚠️  Warning: Local inference may not be ready
    echo Continuing anyway...
) else (
    echo ✅ Local AI inference is ready
)
echo.

echo [PHASE 3] CommandCore Integration
echo ===================================
echo Testing CommandCore availability...
if exist "C:\D_Drive\ActiveProjects\CommandCore_Project\memory\a_memory_core" (
    echo ✅ CommandCore OS found
) else (
    echo ⚠️  CommandCore OS not found at expected location
    echo Enterprise features may be limited
)
echo.

echo [PHASE 4] Memory System Initialization  
echo ==========================================
echo Initializing CommandCore integration layer...
python memory\commandcore_integration.py
echo.

echo [PHASE 5] Enterprise Agent Factory Launch
echo ===========================================
echo Starting Enterprise Agent Factory...
echo This will create and orchestrate sophisticated agents for development assistance
echo.

python memory\enterprise_agent_factory.py

echo.
echo =========================================================
echo   ENTERPRISE AGENT SYSTEM SHUTDOWN COMPLETE
echo =========================================================
echo.
echo System Components Status:
echo - Docker Container: Check with 'docker ps'
echo - Local AI: Test at http://localhost:11434
echo - Agent Logs: Check memory/enterprise_agents/ directory
echo - Integration Logs: Check memory/logs/ directory
echo.
pause