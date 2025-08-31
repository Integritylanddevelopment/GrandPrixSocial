#!/bin/bash
# Networking and Security Setup for F1 AI Server

echo "🔐 Setting up networking and security..."

# Configure UFW Firewall
sudo ufw allow ssh
sudo ufw allow 22/tcp     # SSH
sudo ufw allow 80/tcp     # HTTP
sudo ufw allow 443/tcp    # HTTPS  
sudo ufw allow 12434/tcp  # Qwen3 API
sudo ufw allow 9000/tcp   # Portainer (optional)
sudo ufw --force enable

# Install fail2ban for security
sudo apt install -y fail2ban
sudo systemctl enable fail2ban
sudo systemctl start fail2ban

# Create nginx reverse proxy config for Qwen3
sudo tee /etc/nginx/sites-available/qwen3-api << 'EOF'
server {
    listen 80;
    server_name your-domain.com;  # Replace with your domain or IP

    location /qwen3/ {
        proxy_pass http://localhost:12434/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 300s;
        proxy_connect_timeout 75s;
    }

    # Health check endpoint
    location /health {
        access_log off;
        return 200 "F1 AI Server is running\n";
        add_header Content-Type text/plain;
    }
}
EOF

# Enable the site
sudo ln -sf /etc/nginx/sites-available/qwen3-api /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx

# Create startup script
cat > ~/f1-server/start-server.sh << 'EOF'
#!/bin/bash
echo "🚀 Starting F1 AI Server..."

cd ~/f1-server

# Start Docker services
docker-compose up -d

# Wait for services to be ready
echo "⏳ Waiting for services to start..."
sleep 30

# Test Qwen3 API
echo "🧪 Testing Qwen3 API..."
curl -s -X POST http://localhost:12434/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "qwen2.5:7b",
    "messages": [{"role": "user", "content": "Hello, are you working?"}],
    "max_tokens": 50
  }' | jq -r '.choices[0].message.content' || echo "❌ API not ready yet"

echo "✅ F1 AI Server startup complete!"
echo "🌐 Access Portainer: http://localhost:9000"
echo "🤖 Qwen3 API: http://localhost:12434"

# Show status
docker-compose ps
EOF

chmod +x ~/f1-server/start-server.sh

echo "✅ Networking setup complete!"
echo ""
echo "📋 IMPORTANT: Router Configuration Needed"
echo "In your router admin panel, set up port forwarding:"
echo "  - External Port 12434 → Internal Port 12434 (Qwen3 API)"
echo "  - External Port 22 → Internal Port 22 (SSH access)"
echo "  - External Port 443 → Internal Port 443 (HTTPS)"
echo ""
echo "🔑 Get your external IP: curl ifconfig.me"