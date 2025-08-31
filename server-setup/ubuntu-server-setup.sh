#!/bin/bash
# Ubuntu Server Setup for F1 AI Server
# Run this script on your old desktop after installing Ubuntu Server

echo "🖥️ Setting up F1 AI Server..."

# Update system
sudo apt update && sudo apt upgrade -y

# Install essential packages
sudo apt install -y curl wget git htop nginx certbot python3-certbot-nginx

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Install Node.js (for your Next.js app if needed locally)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Create directories
mkdir -p ~/f1-server/{docker,logs,backups,training-data}
cd ~/f1-server

# Create docker-compose for Qwen3
cat > docker-compose.yml << 'EOF'
version: '3.8'

services:
  qwen3:
    image: ollama/ollama:latest
    ports:
      - "12434:11434"
    volumes:
      - qwen_models:/root/.ollama
      - ./training-data:/app/training-data
    environment:
      - OLLAMA_HOST=0.0.0.0:11434
    restart: unless-stopped
    deploy:
      resources:
        limits:
          memory: 8G  # Adjust based on your RAM
    command: >
      sh -c "
        ollama serve &
        sleep 30 &&
        ollama pull qwen2.5:7b &&
        echo '✅ Qwen3 ready for F1 content generation' &&
        wait
      "

  # Optional: Database for analytics (if you want local backup)
  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: f1_analytics
      POSTGRES_USER: f1user
      POSTGRES_PASSWORD: secure_password_here
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./backups:/backups
    ports:
      - "5432:5432"
    restart: unless-stopped

  # Optional: Monitoring
  portainer:
    image: portainer/portainer-ce:latest
    ports:
      - "9000:9000"
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
      - portainer_data:/data
    restart: unless-stopped

volumes:
  qwen_models:
  postgres_data:
  portainer_data:
EOF

echo "✅ Server setup complete!"
echo "Next steps:"
echo "1. Start services: docker-compose up -d"
echo "2. Set up networking (port forwarding)"
echo "3. Configure SSL certificates"
echo "4. Test connection from your main development machine"