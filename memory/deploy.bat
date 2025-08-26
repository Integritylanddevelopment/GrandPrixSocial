@echo off
REM Deploy Grand Prix Social Memory System with Docker (Windows)

echo ================================================
echo Grand Prix Social Memory System - Docker Deploy
echo ================================================

REM Check if Docker is installed
docker --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Docker is not installed
    pause
    exit /b 1
)

docker-compose --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Docker Compose is not installed
    pause
    exit /b 1
)

REM Check if .env file exists
if not exist .env (
    echo WARNING: .env file not found
    echo Creating .env from .env.example...
    copy .env.example .env
    echo Please edit .env file with your actual values before continuing
    echo Especially set your OPENAI_API_KEY and ANTHROPIC_API_KEY
    pause
)

REM Create necessary directories
echo Creating directories...
if not exist docker\ssl mkdir docker\ssl
if not exist data mkdir data
if not exist data\logs mkdir data\logs
if not exist data\cache mkdir data\cache
if not exist data\semantic mkdir data\semantic
if not exist data\procedural mkdir data\procedural
if not exist data\episodic mkdir data\episodic
if not exist data\working mkdir data\working
if not exist data\longterm mkdir data\longterm
if not exist data\shortterm mkdir data\shortterm

REM Build and start services
echo Building memory system image...
docker-compose build memory-system

echo Starting infrastructure services (Redis, PostgreSQL)...
docker-compose up -d redis postgres

echo Waiting for database to be ready...
timeout /t 10 /nobreak

REM Check database health
echo Checking database connection...
docker-compose exec postgres pg_isready -U memory_user -d memory_system
if errorlevel 1 (
    echo ERROR: Database is not ready
    docker-compose logs postgres
    pause
    exit /b 1
)

echo Starting memory system...
docker-compose up -d memory-system

echo Starting monitoring services...
docker-compose up -d prometheus grafana

echo Starting API gateway...
docker-compose up -d memory-api

REM Wait for services to be ready
echo Waiting for services to start...
timeout /t 30 /nobreak

REM Check service health
echo Checking service health...
docker-compose ps | findstr "Up" >nul
if errorlevel 1 (
    echo ERROR: Some services failed to start
    docker-compose ps
    pause
    exit /b 1
) else (
    echo [OK] Services are running
)

REM Test memory system health
echo Testing memory system health...
curl -f http://localhost:8081/health >nul 2>&1
if errorlevel 1 (
    echo WARNING: Memory system health check failed
    echo Check logs with: docker-compose logs memory-system
) else (
    echo [OK] Memory system is healthy
)

echo.
echo ================================================
echo DEPLOYMENT COMPLETE!
echo ================================================
echo.
echo Services available at:
echo   Memory System API:    http://localhost:8080
echo   Health Check:         http://localhost:8081/health
echo   Prometheus:           http://localhost:9090
echo   Grafana:              http://localhost:3000 (admin/admin123)
echo   API Gateway:          http://localhost:80
echo.
echo To view logs:           docker-compose logs -f memory-system
echo To stop services:       docker-compose down
echo To restart:             docker-compose restart memory-system
echo.
echo Memory system is now running in Docker!
pause