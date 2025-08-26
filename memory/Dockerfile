# Grand Prix Social Memory System Docker Image
FROM python:3.11-slim

# Set working directory
WORKDIR /app/memory

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    libpq-dev \
    git \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first for better caching
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy the entire memory system
COPY . .

# Create necessary directories
RUN mkdir -p /app/memory/logs \
    /app/memory/data \
    /app/memory/cache \
    /app/memory/a_memory_core/logs \
    /app/memory/a_memory_core/analytics \
    /app/memory/a_memory_core/dashboards \
    /app/memory/b_long_term_memory/promoted \
    /app/memory/c_short_term_memory/sessions \
    /app/memory/d_working_memory/active \
    /app/memory/e_procedural/protocols \
    /app/memory/f_semantic/knowledge \
    /app/memory/g_episodic/sessions

# Set environment variables
ENV PYTHONPATH=/app/memory
ENV PYTHONUNBUFFERED=1
ENV MEMORY_ROOT=/app/memory
ENV LOG_LEVEL=INFO

# Create a non-root user for security
RUN useradd --create-home --shell /bin/bash memory_user
RUN chown -R memory_user:memory_user /app/memory
USER memory_user

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD python -c "import sys; sys.path.insert(0, '.'); from config.health_check import check_system_health; exit(0 if check_system_health() else 1)"

# Expose ports for potential web interfaces
EXPOSE 8080 8081 8082

# Default command - start the memory system
CMD ["python", "start_all_agents.py"]