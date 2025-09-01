
@echo off
echo ========================================
echo    CLAUDE CODE - LOCAL PROCESSING
echo ========================================
echo.
echo This opens Claude Code using your local Qwen3 model
echo (No internet required!)
echo.
echo Setting environment variable...
echo ANTHROPIC_API_URL=http://localhost:11434
echo.

cd /d "C:\D_Drive\ActiveProjects\GrandPrixSocial"

REM Force the environment variable and start Claude in same process
cmd /k "set ANTHROPIC_API_URL=http://localhost:11434 && echo Local API URL set to: %ANTHROPIC_API_URL% && claude --dangerously-skip-permissions"
