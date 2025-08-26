# Grand Prix Social Memory System - Docker Setup

Complete containerized deployment of the cognitive memory system with all dependencies included.

## Quick Start

### Prerequisites
- Docker Desktop installed
- Docker Compose available
- 4GB+ RAM available for containers
- Ports 80, 3000, 5432, 6379, 8080-8082, 9090 available

### Windows Deployment
```bash
# 1. Clone/navigate to memory folder
cd memory

# 2. Copy environment template
copy .env.example .env

# 3. Edit .env with your API keys
# Set OPENAI_API_KEY and ANTHROPIC_API_KEY

# 4. Deploy
deploy.bat
```

### Linux/Mac Deployment
```bash
# 1. Clone/navigate to memory folder
cd memory

# 2. Copy environment template
cp .env.example .env

# 3. Edit .env with your API keys
# Set OPENAI_API_KEY and ANTHROPIC_API_KEY

# 4. Make deploy script executable
chmod +x deploy.sh

# 5. Deploy
./deploy.sh
```

## Services Included

### Core Memory System
- **Memory System**: Main cognitive processing engine
- **PostgreSQL**: Structured data storage
- **Redis**: Caching and session storage

### Monitoring Stack
- **Prometheus**: Metrics collection
- **Grafana**: Monitoring dashboards
- **Nginx**: API gateway and load balancer

### Memory Types
All memory types are containerized with persistent volumes:
- Semantic Memory (f_semantic)
- Procedural Memory (e_procedural) 
- Episodic Memory (g_episodic)
- Working Memory (d_working_memory)
- Long-term Memory (b_long_term_memory)
- Short-term Memory (c_short_term_memory)

## Endpoints

| Service | URL | Purpose |
|---------|-----|---------|
| Memory API | http://localhost:8080 | Main memory system API |
| Health Check | http://localhost:8081/health | System health status |
| WebSocket | http://localhost:8082/ws | Real-time updates |
| API Gateway | http://localhost:80 | Nginx proxy |
| Prometheus | http://localhost:9090 | Metrics dashboard |
| Grafana | http://localhost:3000 | Monitoring (admin/admin123) |

## Management Commands

### Service Control
```bash
# View all services
docker-compose ps

# View logs
docker-compose logs -f memory-system
docker-compose logs -f postgres
docker-compose logs -f redis

# Restart services
docker-compose restart memory-system
docker-compose restart postgres

# Stop all services
docker-compose down

# Stop and remove volumes (DESTRUCTIVE)
docker-compose down -v
```

### Memory System Specific
```bash
# Execute commands in memory container
docker-compose exec memory-system python activate_cognitive_loop.py

# Access memory system shell
docker-compose exec memory-system bash

# View memory system logs
docker-compose logs -f memory-system

# Check memory health
curl http://localhost:8081/health
```

### Database Management
```bash
# Connect to PostgreSQL
docker-compose exec postgres psql -U memory_user -d memory_system

# Backup database
docker-compose exec postgres pg_dump -U memory_user memory_system > backup.sql

# Restore database
docker-compose exec -T postgres psql -U memory_user memory_system < backup.sql
```

## Volume Persistence

All memory data is persisted in Docker volumes:

```bash
# List volumes
docker volume ls | grep gps-memory

# Inspect a volume
docker volume inspect gps-memory_semantic_memory

# Backup volumes
docker run --rm -v gps-memory_semantic_memory:/data -v $(pwd):/backup alpine tar czf /backup/semantic_backup.tar.gz -C /data .
```

## Configuration

### Environment Variables (.env)
```bash
# Required - Add your API keys
OPENAI_API_KEY=your_key_here
ANTHROPIC_API_KEY=your_key_here

# Optional - Database settings
POSTGRES_PASSWORD=memory_secure_password_2024
DATABASE_URL=postgresql://memory_user:password@postgres:5432/memory_system

# Memory system settings
MEMORY_PRESERVATION_MODE=true
MEMORY_AUTO_PROMOTION=true
LOG_LEVEL=INFO
```

### Docker Compose Override
Create `docker-compose.override.yml` for local customizations:

```yaml
version: '3.8'
services:
  memory-system:
    environment:
      LOG_LEVEL: DEBUG
    volumes:
      - ./local_config:/app/memory/local_config
```

## Troubleshooting

### Common Issues

**Services won't start:**
```bash
# Check Docker daemon
docker info

# Check port conflicts
netstat -tulpn | grep :8080

# Check logs
docker-compose logs
```

**Memory system not responding:**
```bash
# Check health
curl http://localhost:8081/health

# Check container status
docker-compose ps memory-system

# Restart memory system
docker-compose restart memory-system
```

**Database connection issues:**
```bash
# Check PostgreSQL logs
docker-compose logs postgres

# Test connection
docker-compose exec postgres pg_isready -U memory_user

# Reset database
docker-compose down
docker volume rm gps-memory_postgres_data
docker-compose up -d postgres
```

**Out of memory:**
```bash
# Check resource usage
docker stats

# Increase Docker memory limit in Docker Desktop settings
# Recommended: 4GB+ for full stack
```

### Performance Tuning

**For production:**
1. Increase memory limits in docker-compose.yml
2. Set up log rotation
3. Configure Redis persistence
4. Set up database backups
5. Use external volumes for data persistence

**For development:**
1. Use volume mounts for code changes
2. Enable debug logging
3. Disable monitoring stack if not needed

## Security

### Production Hardening
1. Change default passwords in .env
2. Use secrets management instead of .env
3. Set up SSL certificates
4. Configure firewall rules
5. Enable audit logging
6. Regular security updates

### Network Security
All services run in isolated Docker network. External access only through defined ports.

## Monitoring

### Grafana Dashboards
- Memory System Performance
- Database Metrics
- Redis Cache Statistics
- Container Resource Usage

### Prometheus Metrics
- Memory agent health
- Processing times
- Error rates
- Resource utilization

## Backup Strategy

### Automated Backups
```bash
# Create backup script
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
docker-compose exec postgres pg_dump -U memory_user memory_system > backup_$DATE.sql
docker run --rm -v gps-memory_semantic_memory:/data -v $(pwd):/backup alpine tar czf /backup/semantic_$DATE.tar.gz -C /data .
```

### Recovery Procedures
1. Stop services: `docker-compose down`
2. Restore volumes from backups
3. Restore database: `docker-compose exec -T postgres psql -U memory_user memory_system < backup.sql`
4. Start services: `docker-compose up -d`

## Development

### Local Development
```bash
# Mount source code for development
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up

# Run tests
docker-compose exec memory-system python -m pytest

# Code formatting
docker-compose exec memory-system black .
docker-compose exec memory-system flake8 .
```

## Support

For issues and questions:
1. Check logs: `docker-compose logs memory-system`
2. Check health: `curl http://localhost:8081/health`  
3. Review this documentation
4. Check Docker and system resources