@echo off
echo =========================================
echo   GRAND PRIX SOCIAL - LOCAL DEV AGENT
echo =========================================
echo.

cd /d "C:\D_Drive\ActiveProjects\GrandPrixSocial"

echo [1] Checking Docker container status...
docker ps -a --filter name=claude-qwen3-local
echo.

echo [2] Starting Qwen3 container if not running...
docker start claude-qwen3-local 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo Container not found, running fresh...
    docker run --rm -d --name claude-qwen3-local -p 11434:11434 -v ollama-models:/root/.ollama claude-qwen3-integrated:latest
)
echo.

echo [3] Waiting for model to be ready...
timeout /t 10 /nobreak >nul
echo.

echo [4] Testing local inference...
curl -s http://localhost:11434/api/tags
echo.
echo.

echo [5] Starting Local Dev Agent...
echo Agent will integrate CommandCore OS agents with local Qwen3 inference
echo.
python "memory\a_memory_core\local_dev_agent\local_dev_agent.py"

echo.
echo =========================================
echo   LOCAL DEV AGENT SHUTDOWN
echo =========================================
pause