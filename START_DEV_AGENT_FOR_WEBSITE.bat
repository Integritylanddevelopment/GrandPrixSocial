@echo off
echo =========================================
echo   STARTING DEV AGENT FOR WEBSITE
echo =========================================
echo.

cd /d "C:\D_Drive\ActiveProjects\GrandPrixSocial"

echo [1] Starting local AI container...
docker start claude-qwen3-local 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo Starting fresh container...
    docker run --rm -d --name claude-qwen3-local -p 11434:11434 -v ollama-models:/root/.ollama claude-qwen3-integrated:latest
    timeout /t 8 /nobreak >nul
)

echo ✅ Local AI container ready
echo.

echo [2] Starting dev agent API server...
echo This connects your website to the local dev agent
echo.

python mobile_interface\dev_agent_api_server.py

echo.
echo ❌ Dev agent API server stopped
pause