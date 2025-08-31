@echo off
set ANTHROPIC_API_URL=http://localhost:11434
echo Setting up local Claude Code...
echo Environment: %ANTHROPIC_API_URL%
echo.
echo Testing simple query...
echo Please create a simple ASCII art car | claude --print