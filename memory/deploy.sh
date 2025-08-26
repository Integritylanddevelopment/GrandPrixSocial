#!/bin/bash
# Deploy Grand Prix Social Memory System with Docker

set -e

echo "================================================"
echo "Grand Prix Social Memory System - Docker Deploy"
echo "================================================"

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "ERROR: Docker is not installed"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "ERROR: Docker Compose is not installed"
    exit 1
fi

# Check if .env file exists
if [ ! -f .env ]; then
    echo "WARNING: .env file not found"
    echo "Creating .env from .env.example..."
    cp .env.example .env
    echo "Please edit .env file with your actual values before continuing"
    echo "Especially set your OPENAI_API_KEY and ANTHROPIC_API_KEY"
    read -p "Press Enter to continue or Ctrl+C to exit..."
fi

# Create necessary directories
echo "Creating directories..."
mkdir -p docker/ssl
mkdir -p data/{logs,cache,semantic,procedural,episodic,working,longterm,shortterm}

# Build and start services
echo "Building memory system image..."
docker-compose build memory-system

echo "Starting infrastructure services (Redis, PostgreSQL)..."
docker-compose up -d redis postgres

echo "Waiting for database to be ready..."
sleep 10

# Check database health
echo "Checking database connection..."
docker-compose exec postgres pg_isready -U memory_user -d memory_system || {
    echo "ERROR: Database is not ready"
    docker-compose logs postgres
    exit 1
}

echo "Starting memory system..."
docker-compose up -d memory-system

echo "Starting monitoring services..."
docker-compose up -d prometheus grafana

echo "Starting API gateway..."
docker-compose up -d memory-api

# Wait for services to be ready
echo "Waiting for services to start..."
sleep 30

# Check service health
echo "Checking service health..."
if docker-compose ps | grep -q "Up"; then
    echo "[OK] Services are running"
else
    echo "ERROR: Some services failed to start"
    docker-compose ps
    exit 1
fi

# Test memory system health
echo "Testing memory system health..."
if curl -f http://localhost:8081/health &> /dev/null; then
    echo "[OK] Memory system is healthy"
else
    echo "WARNING: Memory system health check failed"
    echo "Check logs with: docker-compose logs memory-system"
fi

echo ""
echo "================================================"
echo "DEPLOYMENT COMPLETE!"
echo "================================================"
echo ""
echo "Services available at:"
echo "  Memory System API:    http://localhost:8080"
echo "  Health Check:         http://localhost:8081/health"
echo "  Prometheus:           http://localhost:9090"
echo "  Grafana:              http://localhost:3000 (admin/admin123)"
echo "  API Gateway:          http://localhost:80"
echo ""
echo "To view logs:           docker-compose logs -f memory-system"
echo "To stop services:       docker-compose down"
echo "To restart:             docker-compose restart memory-system"
echo ""
echo "Memory system is now running in Docker!"