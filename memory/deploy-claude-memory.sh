#!/bin/bash
# Claude Enterprise Memory System - Deployment Script

set -e

echo "🚀 Claude Enterprise Memory System - Docker Deployment"
echo "====================================================="

# Configuration
PROJECT_NAME="claude-memory-system"
COMPOSE_FILE="docker-compose.claude-memory.yml"
ENV_FILE=".env.local"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check prerequisites
check_prerequisites() {
    print_status "Checking prerequisites..."
    
    # Check Docker
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed. Please install Docker first."
        exit 1
    fi
    
    # Check Docker Compose
    if ! command -v docker-compose &> /dev/null; then
        print_error "Docker Compose is not installed. Please install Docker Compose first."
        exit 1
    fi
    
    # Check environment file
    if [ ! -f "$ENV_FILE" ]; then
        print_warning "Environment file $ENV_FILE not found. Creating template..."
        create_env_template
    fi
    
    print_success "Prerequisites check completed"
}

# Create environment template
create_env_template() {
    cat > $ENV_FILE << 'EOF'
# Claude Enterprise Memory System - Environment Configuration

# Supabase Configuration (Cloud Database)
SUPABASE_URL=https://eeyboymoyvrgsbmnezag.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here

# GitHub Integration (Optional)
GITHUB_TOKEN=your_github_token_here

# Vercel Integration (Optional)
VERCEL_TOKEN=your_vercel_token_here

# Claude Memory System Configuration
CLAUDE_MEMORY_HOME=/home/claude
MAX_MEMORY_SIZE=2GB
LOG_LEVEL=INFO
ENABLE_CLOUD_SYNC=true
ENABLE_LOCAL_CACHE=true
CLEANUP_INTERVAL=3600
BACKUP_INTERVAL=86400

# Security
SECRET_KEY=generate_a_secure_secret_key_here
JWT_SECRET=generate_a_jwt_secret_here

# Performance
MAX_WORKERS=4
WORKER_TIMEOUT=300
CACHE_TTL=3600

# Feature Flags
ENABLE_REPO_SYNC=true
ENABLE_SEMANTIC_SEARCH=true
ENABLE_AUTO_TAGGING=true
ENABLE_QUALITY_ENFORCEMENT=true
EOF
    
    print_warning "Please edit $ENV_FILE with your actual configuration values"
    print_warning "Press Enter after updating the environment file to continue..."
    read -r
}

# Create required directories
create_directories() {
    print_status "Creating directory structure..."
    
    mkdir -p data/memory/{working,episodic,semantic,procedural}
    mkdir -p logs/{api,worker,sync,health}
    mkdir -p backups/{daily,weekly,monthly}
    mkdir -p cache/{redis,temp}
    mkdir -p uploads
    mkdir -p downloads
    
    # Set permissions
    chmod -R 755 data logs backups cache uploads downloads
    
    print_success "Directory structure created"
}

# Build Docker images
build_images() {
    print_status "Building Docker images..."
    
    # Build main Claude memory system
    docker-compose -f $COMPOSE_FILE build claude-memory
    
    # Build supporting services if needed
    docker-compose -f $COMPOSE_FILE build
    
    print_success "Docker images built successfully"
}

# Deploy services
deploy_services() {
    print_status "Deploying Claude Memory System..."
    
    # Stop any existing services
    docker-compose -f $COMPOSE_FILE down --remove-orphans
    
    # Start all services
    docker-compose -f $COMPOSE_FILE up -d
    
    print_success "Services deployed successfully"
}

# Wait for services to be ready
wait_for_services() {
    print_status "Waiting for services to be ready..."
    
    local max_attempts=30
    local attempt=0
    
    while [ $attempt -lt $max_attempts ]; do
        if curl -f -s http://localhost:8000/health > /dev/null 2>&1; then
            print_success "Claude Memory API is ready!"
            break
        fi
        
        attempt=$((attempt + 1))
        echo -n "."
        sleep 5
    done
    
    echo "" # New line
    
    if [ $attempt -eq $max_attempts ]; then
        print_error "Services failed to start within expected time"
        print_status "Checking service logs..."
        docker-compose -f $COMPOSE_FILE logs claude-memory
        return 1
    fi
    
    return 0
}

# Perform health check
health_check() {
    print_status "Performing comprehensive health check..."
    
    # Check main API
    if curl -f -s http://localhost:8000/health > /dev/null; then
        print_success "✅ Claude Memory API - Healthy"
    else
        print_error "❌ Claude Memory API - Unhealthy"
        return 1
    fi
    
    # Check management API
    if curl -f -s http://localhost:8001/health > /dev/null; then
        print_success "✅ Memory Management API - Healthy"
    else
        print_warning "⚠️ Memory Management API - May not be ready yet"
    fi
    
    # Check admin dashboard
    if curl -f -s http://localhost:8002/health > /dev/null; then
        print_success "✅ Admin Dashboard API - Healthy"
    else
        print_warning "⚠️ Admin Dashboard API - May not be ready yet"
    fi
    
    # Check database
    if docker-compose -f $COMPOSE_FILE exec -T postgres pg_isready -U claude -d claude_memory > /dev/null; then
        print_success "✅ PostgreSQL Database - Connected"
    else
        print_error "❌ PostgreSQL Database - Connection failed"
        return 1
    fi
    
    # Check Redis
    if docker-compose -f $COMPOSE_FILE exec -T redis redis-cli -a claudecache ping | grep -q PONG; then
        print_success "✅ Redis Cache - Connected"
    else
        print_error "❌ Redis Cache - Connection failed"
        return 1
    fi
    
    print_success "Health check completed"
    return 0
}

# Show deployment summary
show_summary() {
    print_success "🎉 Claude Enterprise Memory System Deployed Successfully!"
    echo ""
    echo "📊 Service URLs:"
    echo "  Main API: http://localhost:8000"
    echo "  API Documentation: http://localhost:8000/docs"
    echo "  Management API: http://localhost:8001"
    echo "  Admin Dashboard: http://localhost:8002"
    echo ""
    echo "🗄️ Database Connections:"
    echo "  PostgreSQL: postgresql://claude:claudepass@localhost:5432/claude_memory"
    echo "  Redis Cache: redis://:claudecache@localhost:6379"
    echo ""
    echo "📁 Data Directories:"
    echo "  Memory Data: $(pwd)/data/memory"
    echo "  Logs: $(pwd)/logs"
    echo "  Backups: $(pwd)/backups"
    echo ""
    echo "🛠️ Management Commands:"
    echo "  View logs: docker-compose -f $COMPOSE_FILE logs -f"
    echo "  Stop system: docker-compose -f $COMPOSE_FILE down"
    echo "  Restart system: docker-compose -f $COMPOSE_FILE restart"
    echo "  Update system: docker-compose -f $COMPOSE_FILE pull && docker-compose -f $COMPOSE_FILE up -d"
    echo ""
    echo "📋 Next Steps:"
    echo "  1. Configure your Supabase credentials in $ENV_FILE"
    echo "  2. Set up GitHub and Vercel tokens for repository sync"
    echo "  3. Access the API documentation at http://localhost:8000/docs"
    echo "  4. Monitor system health at http://localhost:8000/health"
    echo ""
}

# Rollback function
rollback() {
    print_warning "Rolling back deployment..."
    docker-compose -f $COMPOSE_FILE down --remove-orphans
    print_success "Rollback completed"
}

# Main deployment flow
main() {
    echo "Starting deployment at $(date)"
    echo ""
    
    # Parse command line arguments
    case "${1:-deploy}" in
        "deploy"|"start")
            check_prerequisites
            create_directories
            build_images
            deploy_services
            
            if wait_for_services; then
                if health_check; then
                    show_summary
                else
                    print_error "Health check failed. Check the logs for issues."
                    exit 1
                fi
            else
                print_error "Services failed to start properly."
                exit 1
            fi
            ;;
            
        "stop")
            print_status "Stopping Claude Memory System..."
            docker-compose -f $COMPOSE_FILE down
            print_success "System stopped"
            ;;
            
        "restart")
            print_status "Restarting Claude Memory System..."
            docker-compose -f $COMPOSE_FILE restart
            print_success "System restarted"
            ;;
            
        "logs")
            docker-compose -f $COMPOSE_FILE logs -f
            ;;
            
        "health")
            health_check
            ;;
            
        "status")
            docker-compose -f $COMPOSE_FILE ps
            ;;
            
        "update")
            print_status "Updating Claude Memory System..."
            docker-compose -f $COMPOSE_FILE pull
            docker-compose -f $COMPOSE_FILE up -d
            print_success "System updated"
            ;;
            
        "backup")
            print_status "Creating system backup..."
            timestamp=$(date +%Y%m%d_%H%M%S)
            backup_dir="backups/system_backup_$timestamp"
            mkdir -p "$backup_dir"
            
            # Backup data
            cp -r data "$backup_dir/"
            cp -r logs "$backup_dir/"
            cp $ENV_FILE "$backup_dir/"
            
            # Backup databases
            docker-compose -f $COMPOSE_FILE exec -T postgres pg_dump -U claude -d claude_memory > "$backup_dir/claude_memory.sql"
            docker-compose -f $COMPOSE_FILE exec -T redis redis-cli -a claudecache --rdb "$backup_dir/redis.rdb"
            
            print_success "Backup created at: $backup_dir"
            ;;
            
        "clean")
            print_warning "This will remove all containers, volumes, and data. Are you sure? (y/N)"
            read -r response
            if [[ "$response" =~ ^[Yy]$ ]]; then
                print_status "Cleaning up Claude Memory System..."
                docker-compose -f $COMPOSE_FILE down -v --remove-orphans
                docker system prune -f
                rm -rf data logs backups cache
                print_success "Cleanup completed"
            else
                print_status "Cleanup cancelled"
            fi
            ;;
            
        "help")
            echo "Usage: $0 [command]"
            echo ""
            echo "Commands:"
            echo "  deploy    - Deploy the complete system (default)"
            echo "  start     - Start the system"
            echo "  stop      - Stop all services"
            echo "  restart   - Restart all services"
            echo "  logs      - Show and follow logs"
            echo "  health    - Perform health check"
            echo "  status    - Show service status"
            echo "  update    - Update and restart services"
            echo "  backup    - Create system backup"
            echo "  clean     - Remove all data and containers"
            echo "  help      - Show this help"
            echo ""
            ;;
            
        *)
            print_error "Unknown command: $1"
            print_status "Use '$0 help' to see available commands"
            exit 1
            ;;
    esac
    
    echo ""
    echo "Deployment completed at $(date)"
}

# Trap for cleanup on exit
trap 'rollback' ERR

# Run main function
main "$@"