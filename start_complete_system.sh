#!/bin/bash
set -e

echo "=== Complete Claude + Qwen3 + Mobile GUI System Starting ==="

# Start Ollama in background briefly to pull model
ollama serve &
OLLAMA_PID=$!

# Wait for Ollama to be ready
echo "Waiting for Ollama to start..."
timeout=60
counter=0
while ! curl -s http://localhost:11434/api/version >/dev/null; do
    if [ $counter -eq $timeout ]; then
        echo "Timeout waiting for Ollama"
        exit 1
    fi
    sleep 2
    counter=$((counter + 1))
done

echo "Pulling Qwen2.5:7b model (this may take a while)..."
ollama pull qwen2.5:7b

echo "Model ready! Stopping temporary Ollama..."
kill $OLLAMA_PID
sleep 3

echo ""
echo "=== Starting All Services ==="
echo "1. Ollama + Qwen3 LLM"
echo "2. Claude API Bridge" 
echo "3. Mobile Web GUI"
echo ""

# Start Ollama server
echo "Starting Ollama server..."
ollama serve &
OLLAMA_PID=$!
sleep 5

# Start API Bridge
echo "Starting Claude API Bridge..."
cd /app
python3 claude_ollama_bridge.py &
BRIDGE_PID=$!
sleep 3

# Start Mobile GUI
echo "Starting Mobile Web GUI..."
python3 web_gui.py &
GUI_PID=$!
sleep 3

echo ""
echo "=== Complete System Ready ==="
echo "📱 Mobile GUI: http://YOUR_IP:8080 (access from phone)"
echo "🔌 Claude API: http://localhost:11434"
echo "🧠 Local Model: qwen2.5:7b"
echo "💻 Claude Code: Set ANTHROPIC_API_URL=http://localhost:11434"
echo ""
echo "🎯 From your phone, visit: http://YOUR_IP:8080"
echo "💡 Use Claude Code with: claude --print 'Hello world!'"
echo "=============================================="

# Handle signals properly
trap 'echo "Shutting down..."; kill $OLLAMA_PID $BRIDGE_PID $GUI_PID; exit 0' SIGTERM SIGINT

# Wait for all processes
wait $OLLAMA_PID $BRIDGE_PID $GUI_PID