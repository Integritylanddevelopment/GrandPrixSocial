#!/bin/bash
set -e

echo "=== Claude + Qwen3 Integrated System Starting ==="

# Start Ollama server in background
echo "Starting Ollama server..."
ollama serve &
OLLAMA_PID=$!

# Wait for Ollama to be ready
echo "Waiting for Ollama server to start..."
timeout=60
counter=0
while ! curl -s http://localhost:11434/api/version >/dev/null; do
    if [ $counter -eq $timeout ]; then
        echo "Timeout waiting for Ollama server"
        exit 1
    fi
    sleep 2
    counter=$((counter + 1))
done

echo "Ollama server ready!"

# Pull Qwen3 model if not already present
echo "Ensuring Qwen2.5:7b model is available..."
ollama pull qwen2.5:7b &
PULL_PID=$!

# Start API bridge in background
echo "Starting Claude-Qwen3 API bridge..."
cd /app
python3 claude_ollama_bridge.py &
BRIDGE_PID=$!

# Wait for bridge to be ready
echo "Waiting for API bridge to start..."
timeout=30
counter=0
while ! curl -s http://localhost:11434/health >/dev/null; do
    if [ $counter -eq $timeout ]; then
        echo "Timeout waiting for API bridge"
        exit 1
    fi
    sleep 2
    counter=$((counter + 1))
done

echo "API bridge ready!"

# Wait for model pull to complete
wait $PULL_PID
echo "Qwen3 model ready!"

echo ""
echo "=== Claude + Qwen3 Integrated System Ready ==="
echo "Access Point: http://localhost:11434"
echo "Health Check: http://localhost:11434/health" 
echo "Model: qwen2.5:7b"
echo "Claude Code: Set ANTHROPIC_API_URL=http://localhost:11434"
echo "=============================================="

# Keep container running with proper signal handling
trap 'echo "Shutting down..."; kill $OLLAMA_PID $BRIDGE_PID; exit 0' SIGTERM SIGINT

# Wait for both processes
wait $OLLAMA_PID $BRIDGE_PID