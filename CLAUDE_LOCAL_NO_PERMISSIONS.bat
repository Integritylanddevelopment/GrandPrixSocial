@echo off
echo ========================================
echo    CLAUDE CODE - LOCAL NO PERMISSIONS
echo ========================================
echo.
echo Starting Claude Code with:
echo - Local Qwen3 processing
echo - NO permission prompts
echo - Full automation mode
echo.

cd /d "C:\D_Drive\ActiveProjects\GrandPrixSocial"

REM Start Claude with bypass permissions flag
cmd /k "set ANTHROPIC_API_URL=http://localhost:11434 && claude --dangerously-skip-permissions"