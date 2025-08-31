#!/bin/bash
# Claude Enterprise Memory System - Docker Health Check

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "🏥 Claude Memory System Health Check"

# Function to check service
check_service() {
    local service_name="$1"
    local url="$2"
    local timeout="${3:-5}"
    
    if curl -f -s -m $timeout "$url" > /dev/null 2>&1; then
        echo -e "✅ ${GREEN}$service_name${NC} - Healthy"
        return 0
    else
        echo -e "❌ ${RED}$service_name${NC} - Unhealthy"
        return 1
    fi
}

# Function to check database
check_database() {
    local db_name="$1"
    local check_command="$2"
    
    if eval "$check_command" > /dev/null 2>&1; then
        echo -e "✅ ${GREEN}$db_name${NC} - Connected"
        return 0
    else
        echo -e "❌ ${RED}$db_name${NC} - Connection Failed"
        return 1
    fi
}

# Initialize health status
HEALTH_STATUS=0

# Check main API services
echo "🔍 Checking API Services..."
check_service "Claude Memory API" "http://localhost:8000/health" || HEALTH_STATUS=1
check_service "Memory Management API" "http://localhost:8001/health" || HEALTH_STATUS=1
check_service "Admin Dashboard API" "http://localhost:8002/health" || HEALTH_STATUS=1

# Check database connections
echo ""
echo "🗄️ Checking Database Connections..."
check_database "PostgreSQL" "pg_isready -h postgres -p 5432 -U claude -d claude_memory" || HEALTH_STATUS=1
check_database "Redis Cache" "redis-cli -h redis -p 6379 -a claudecache ping | grep -q PONG" || HEALTH_STATUS=1

# Check Supabase connection
echo ""
echo "☁️ Checking Cloud Services..."
if [ ! -z "$SUPABASE_URL" ] && [ ! -z "$SUPABASE_KEY" ]; then
    check_service "Supabase Connection" "$SUPABASE_URL/rest/v1/" || HEALTH_STATUS=1
else
    echo -e "⚠️ ${YELLOW}Supabase${NC} - Not configured"
fi

# Check memory usage
echo ""
echo "💾 Checking System Resources..."
MEMORY_USAGE=$(free | grep Mem | awk '{printf "%.1f", $3/$2 * 100.0}')
DISK_USAGE=$(df -h /home/claude | awk 'NR==2 {print $5}' | sed 's/%//')

if [ "${MEMORY_USAGE%.*}" -lt 90 ]; then
    echo -e "✅ ${GREEN}Memory Usage${NC} - ${MEMORY_USAGE}%"
else
    echo -e "⚠️ ${YELLOW}Memory Usage${NC} - ${MEMORY_USAGE}% (High)"
fi

if [ "$DISK_USAGE" -lt 85 ]; then
    echo -e "✅ ${GREEN}Disk Usage${NC} - ${DISK_USAGE}%"
else
    echo -e "⚠️ ${YELLOW}Disk Usage${NC} - ${DISK_USAGE}% (High)"
fi

# Check running processes
echo ""
echo "⚙️ Checking Running Processes..."
if [ -f /home/claude/running_services.pid ]; then
    source /home/claude/running_services.pid
    
    # Check each tracked process
    for pid_var in CLOUD_MEMORY_PID TAG_ENGINE_PID LOGIC_ENFORCER_PID API_PID MGMT_API_PID ADMIN_API_PID; do
        pid=${!pid_var}
        if [ ! -z "$pid" ] && kill -0 $pid 2>/dev/null; then
            echo -e "✅ ${GREEN}$pid_var${NC} - Running (PID: $pid)"
        else
            echo -e "❌ ${RED}$pid_var${NC} - Not running"
            HEALTH_STATUS=1
        fi
    done
else
    echo -e "⚠️ ${YELLOW}Process tracking${NC} - PID file not found"
    HEALTH_STATUS=1
fi

# Check log files
echo ""
echo "📋 Checking Log Files..."
if [ -d "/home/claude/logs" ]; then
    LOG_COUNT=$(find /home/claude/logs -name "*.log" 2>/dev/null | wc -l)
    echo -e "✅ ${GREEN}Log Files${NC} - $LOG_COUNT files found"
    
    # Check for recent errors
    ERROR_COUNT=$(find /home/claude/logs -name "*.log" -mtime -1 -exec grep -l "ERROR\|CRITICAL" {} \; 2>/dev/null | wc -l)
    if [ "$ERROR_COUNT" -gt 0 ]; then
        echo -e "⚠️ ${YELLOW}Recent Errors${NC} - $ERROR_COUNT log files contain errors"
    else
        echo -e "✅ ${GREEN}Error Status${NC} - No recent errors"
    fi
else
    echo -e "⚠️ ${YELLOW}Log Directory${NC} - Not found"
fi

# Check data persistence
echo ""
echo "💾 Checking Data Persistence..."
if [ -d "/home/claude/data" ]; then
    DATA_SIZE=$(du -sh /home/claude/data 2>/dev/null | cut -f1)
    echo -e "✅ ${GREEN}Data Directory${NC} - ${DATA_SIZE:-0B}"
else
    echo -e "⚠️ ${YELLOW}Data Directory${NC} - Not found"
fi

if [ -d "/home/claude/backups" ]; then
    BACKUP_COUNT=$(find /home/claude/backups -name "*.backup" 2>/dev/null | wc -l)
    echo -e "✅ ${GREEN}Backup Files${NC} - $BACKUP_COUNT backups"
else
    echo -e "⚠️ ${YELLOW}Backup Directory${NC} - Not found"
fi

# Performance check
echo ""
echo "⚡ Checking Performance..."
if command -v python3 >/dev/null 2>&1; then
    PYTHON_RESPONSE_TIME=$(python3 -c "
import time
import requests
try:
    start = time.time()
    response = requests.get('http://localhost:8000/health', timeout=5)
    end = time.time()
    print(f'{(end-start)*1000:.0f}ms')
except:
    print('timeout')
" 2>/dev/null)
    
    if [ "$PYTHON_RESPONSE_TIME" != "timeout" ] && [ "${PYTHON_RESPONSE_TIME%ms}" -lt 1000 ]; then
        echo -e "✅ ${GREEN}API Response Time${NC} - $PYTHON_RESPONSE_TIME"
    else
        echo -e "⚠️ ${YELLOW}API Response Time${NC} - $PYTHON_RESPONSE_TIME (Slow)"
    fi
fi

# Summary
echo ""
echo "📊 Health Check Summary"
echo "======================="

if [ $HEALTH_STATUS -eq 0 ]; then
    echo -e "🎉 ${GREEN}SYSTEM HEALTHY${NC} - All checks passed"
    echo "Claude Enterprise Memory System is operating normally"
    exit 0
else
    echo -e "⚠️ ${YELLOW}SYSTEM DEGRADED${NC} - Some checks failed"
    echo "Check the logs and service status above for details"
    exit 1
fi