# Connecting Your Development Machine to F1 AI Server

## 🔗 Update Your .env.local

Once your server is running, update your main development machine:

```bash
# .env.local on your main development machine
NEXT_PUBLIC_SUPABASE_URL=https://eeyboymoyvrgsbmnezag.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Point to your AI server (replace with your server's IP)
QWEN_API_URL=http://192.168.1.100:12434/v1/chat/completions

# Backup OpenAI key (optional)
OPENAI_API_KEY=your-openai-key
```

## 🌐 Finding Your Server IP

### Local Network IP:
```bash
# On your server
ip addr show | grep "inet 192"
# Example output: 192.168.1.100
```

### External IP (for remote access):
```bash
# On your server
curl ifconfig.me
# Example output: 203.0.113.45
```

## 🧪 Test Connection

From your development machine:

```bash
# Test local connection
curl -X POST http://192.168.1.100:12434/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "qwen2.5:7b",
    "messages": [{"role": "user", "content": "Test F1 server"}],
    "max_tokens": 50
  }'

# Test your F1 news API
curl http://localhost:3000/api/scrape-f1-news
```

## 🔧 Remote Management

### SSH Access:
```bash
# Connect to your server from anywhere
ssh username@your-server-ip

# Start/stop services
cd ~/f1-server
docker-compose up -d    # Start
docker-compose down     # Stop
docker-compose logs     # View logs
```

### Web Management:
- **Portainer**: `http://your-server-ip:9000` (Docker management)
- **Nginx Status**: `http://your-server-ip/health`

## 📊 Monitoring

### Check Server Status:
```bash
# CPU and memory usage
htop

# Docker container status  
docker ps

# Qwen3 logs
docker logs f1-server_qwen3_1

# Disk space
df -h
```

## 🔄 Automatic Startup

### Make server auto-start on boot:
```bash
# On your server
sudo systemctl enable docker
crontab -e

# Add this line:
@reboot sleep 60 && /home/username/f1-server/start-server.sh
```

## 🎯 Benefits of Your Setup

✅ **$0 monthly costs** (just electricity ~$10-15/month)  
✅ **Complete control** over your AI infrastructure  
✅ **Privacy** - all data stays in your house  
✅ **Learning** - hands-on server management experience  
✅ **Scalability** - add more services later  
✅ **Independence** - no reliance on cloud providers  

## 🚀 Future Expansion Ideas

Once your F1 server is stable, you can add:
- **Local database** for analytics backup
- **File storage** for training data
- **Monitoring dashboard** for performance
- **Fantasy league calculations** 
- **Premium AI strategy engine**
- **Automated backups** to external storage

Your old desktop becomes a powerful F1 AI infrastructure!