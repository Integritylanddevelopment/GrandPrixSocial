@echo off
echo ========================================
echo    TESTING LOCAL CLAUDE SYSTEM
echo ========================================
echo.

cd /d "C:\D_Drive\ActiveProjects\GrandPrixSocial"

echo [1] Testing if API Bridge is running...
curl -s http://localhost:11434/health
echo.
echo.

echo [2] Testing if Qwen3 model is accessible...  
curl -s http://localhost:12434/engines/llama.cpp/v1/models
echo.
echo.

echo [3] Testing local Claude Code with simple query...
set ANTHROPIC_API_URL=http://localhost:11434
claude --print "Hello, are you running locally? Just say YES or NO."

echo.
echo ========================================
echo    TEST COMPLETE
echo ========================================
pause