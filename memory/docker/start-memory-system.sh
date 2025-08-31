#!/bin/bash
# Claude Enterprise Memory System - Startup Script

set -e

echo "🚀 Starting Claude Enterprise Memory System..."

# Load environment
source /home/claude/claude-env.sh

# Create required directories
mkdir -p /home/claude/{logs,data,backups,cache,tmp}

# Set permissions
chmod 755 /home/claude/{logs,data,backups,cache,tmp}

echo "📂 Directory structure created"

# Wait for dependencies
echo "⏳ Waiting for database connections..."

# Wait for PostgreSQL
while ! pg_isready -h postgres -p 5432 -U claude -d claude_memory; do
    echo "Waiting for PostgreSQL..."
    sleep 2
done

# Wait for Redis
while ! redis-cli -h redis -p 6379 -a claudecache ping; do
    echo "Waiting for Redis..."
    sleep 2
done

echo "✅ Database connections established"

# Initialize database schema if needed
echo "🗄️ Initializing database schema..."
cd /home/claude/memory
python deploy_memory_databases.py --skip-supabase

# Start background services
echo "🔄 Starting background services..."

# Start memory synchronization service
python cloud_memory_database_system.py &
CLOUD_MEMORY_PID=$!
echo "Cloud memory system started (PID: $CLOUD_MEMORY_PID)"

# Start tag intelligence engine
python claude_tag_intelligence_engine.py &
TAG_ENGINE_PID=$!
echo "Tag intelligence engine started (PID: $TAG_ENGINE_PID)"

# Start memory logic enforcer
python claude_memory_logic_enforcer.py &
LOGIC_ENFORCER_PID=$!
echo "Memory logic enforcer started (PID: $LOGIC_ENFORCER_PID)"

# Start repo sync agent if enabled
if [ "${ENABLE_REPO_SYNC:-false}" = "true" ]; then
    cd /home/claude/memory/a_memory_core/repo_sync_agent
    python repo_sync_orchestrator.py health &
    REPO_SYNC_PID=$!
    echo "Repo sync agent started (PID: $REPO_SYNC_PID)"
fi

# Start main Claude memory API
echo "🌐 Starting Claude Memory API server..."
cd /home/claude/memory
python -m uvicorn claude_memory_api:app --host 0.0.0.0 --port 8000 --reload &
API_PID=$!
echo "Claude Memory API started (PID: $API_PID)"

# Start memory management API
python -m uvicorn memory_management_api:app --host 0.0.0.0 --port 8001 &
MGMT_API_PID=$!
echo "Memory Management API started (PID: $MGMT_API_PID)"

# Start admin dashboard API
python -m uvicorn admin_dashboard_api:app --host 0.0.0.0 --port 8002 &
ADMIN_API_PID=$!
echo "Admin Dashboard API started (PID: $ADMIN_API_PID)"

# Create PID tracking file
cat > /home/claude/running_services.pid << EOF
CLOUD_MEMORY_PID=$CLOUD_MEMORY_PID
TAG_ENGINE_PID=$TAG_ENGINE_PID
LOGIC_ENFORCER_PID=$LOGIC_ENFORCER_PID
API_PID=$API_PID
MGMT_API_PID=$MGMT_API_PID
ADMIN_API_PID=$ADMIN_API_PID
REPO_SYNC_PID=${REPO_SYNC_PID:-}
EOF

echo "💾 Service PIDs saved to running_services.pid"

# Health check function
health_check() {
    echo "🏥 Performing health check..."
    
    # Check API endpoints
    if curl -f -s http://localhost:8000/health > /dev/null; then
        echo "✅ Main API healthy"
    else
        echo "❌ Main API unhealthy"
        return 1
    fi
    
    if curl -f -s http://localhost:8001/health > /dev/null; then
        echo "✅ Management API healthy"
    else
        echo "❌ Management API unhealthy"
        return 1
    fi
    
    # Check database connections
    if pg_isready -h postgres -p 5432 -U claude -d claude_memory > /dev/null; then
        echo "✅ PostgreSQL healthy"
    else
        echo "❌ PostgreSQL unhealthy"
        return 1
    fi
    
    if redis-cli -h redis -p 6379 -a claudecache ping > /dev/null; then
        echo "✅ Redis healthy"
    else
        echo "❌ Redis unhealthy"
        return 1
    fi
    
    echo "✅ All services healthy"
    return 0
}

# Wait for services to start
echo "⏳ Waiting for services to initialize..."
sleep 30

# Perform initial health check
health_check
if [ $? -eq 0 ]; then
    echo "🎉 Claude Enterprise Memory System started successfully!"
    echo ""
    echo "📊 Service URLs:"
    echo "  Main API: http://localhost:8000"
    echo "  Management API: http://localhost:8001"
    echo "  Admin Dashboard: http://localhost:8002"
    echo "  Database: postgresql://claude:claudepass@localhost:5432/claude_memory"
    echo "  Cache: redis://localhost:6379"
    echo ""
else
    echo "❌ Health check failed - some services may not be running properly"
fi

# Cleanup function
cleanup() {
    echo "🛑 Shutting down Claude Memory System..."
    
    if [ -f /home/claude/running_services.pid ]; then
        source /home/claude/running_services.pid
        
        # Kill all tracked processes
        for pid_var in CLOUD_MEMORY_PID TAG_ENGINE_PID LOGIC_ENFORCER_PID API_PID MGMT_API_PID ADMIN_API_PID REPO_SYNC_PID; do
            pid=${!pid_var}
            if [ ! -z "$pid" ] && kill -0 $pid 2>/dev/null; then
                echo "Stopping $pid_var (PID: $pid)"
                kill $pid
            fi
        done
        
        # Wait for graceful shutdown
        sleep 5
        
        # Force kill if needed
        for pid_var in CLOUD_MEMORY_PID TAG_ENGINE_PID LOGIC_ENFORCER_PID API_PID MGMT_API_PID ADMIN_API_PID REPO_SYNC_PID; do
            pid=${!pid_var}
            if [ ! -z "$pid" ] && kill -0 $pid 2>/dev/null; then
                echo "Force stopping $pid_var (PID: $pid)"
                kill -9 $pid
            fi
        done
        
        rm /home/claude/running_services.pid
    fi
    
    echo "✅ Claude Memory System stopped"
    exit 0
}

# Set up signal handlers
trap cleanup SIGTERM SIGINT

# Keep the main process running
echo "🔄 Claude Memory System is running. Press Ctrl+C to stop."

# Monitor services and restart if needed
while true do
    sleep 60
    
    # Check if any critical services died
    if ! kill -0 $API_PID 2>/dev/null; then
        echo "🚨 Main API died, restarting..."
        cd /home/claude/memory
        python -m uvicorn claude_memory_api:app --host 0.0.0.0 --port 8000 --reload &
        API_PID=$!
    fi
    
    if ! kill -0 $MGMT_API_PID 2>/dev/null; then
        echo "🚨 Management API died, restarting..."
        cd /home/claude/memory
        python -m uvicorn memory_management_api:app --host 0.0.0.0 --port 8001 &
        MGMT_API_PID=$!
    fi
    
    # Perform periodic health check
    if [ $(($(date +%s) % 300)) -eq 0 ]; then  # Every 5 minutes
        health_check || echo "⚠️ Health check failed at $(date)"
    fi
done