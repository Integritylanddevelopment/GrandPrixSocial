# Claude + Qwen3 Integrated Docker Container
# Complete local AI processing in one container
FROM ollama/ollama:latest

# Install dependencies
RUN apt-get update && apt-get install -y \
    curl \
    python3 \
    python3-pip \
    nodejs \
    npm \
    wget \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
RUN pip3 install flask requests

# Create app directory
WORKDIR /app

# Copy application files
COPY claude_ollama_bridge.py /app/
COPY start_integrated_system.sh /app/
RUN chmod +x /app/start_integrated_system.sh

# Install Claude Code (specific version for reliability)
RUN npm install -g @anthropic-ai/claude-code@1.0.98

# Create Claude Code wrapper script
RUN echo '#!/bin/bash\n\
export ANTHROPIC_API_URL=http://localhost:11434\n\
export CLAUDECODE=1\n\
claude "$@"' > /usr/local/bin/claude-local && chmod +x /usr/local/bin/claude-local

# Expose port for API bridge
EXPOSE 11434

# Set environment variables
ENV ANTHROPIC_API_URL=http://localhost:11434
ENV OLLAMA_HOST=0.0.0.0
ENV OLLAMA_ORIGINS=*

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s \
  CMD curl -f http://localhost:11434/health || exit 1

# Start integrated system
CMD ["/app/start_integrated_system.sh"]