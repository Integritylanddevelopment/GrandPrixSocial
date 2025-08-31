# Hardware Requirements for F1 AI Server

## 🖥️ Minimum Requirements

### CPU:
- **Minimum**: 4 cores (Intel i5 or AMD Ryzen 3)
- **Recommended**: 8 cores (Intel i7 or AMD Ryzen 5)
- **Note**: Qwen3 7B model uses CPU primarily

### RAM:
- **Minimum**: 8GB (model will run slowly)
- **Good**: 16GB (smooth operation)  
- **Excellent**: 32GB+ (can run larger models later)

### Storage:
- **System**: 50GB for Ubuntu + Docker
- **Models**: 20GB for Qwen3 models + cache
- **Data**: 10GB for training data, logs, backups
- **Total**: 100GB minimum, 250GB+ recommended

### Network:
- **Upload**: 10+ Mbps (for serving API requests)
- **Ethernet**: Preferred over WiFi for stability

## 🔍 Check Your Old Desktop

Run this on Windows before wiping:

```cmd
# Check specs
systeminfo | findstr "Processor"
systeminfo | findstr "Total Physical Memory"
wmic diskdrive get size,model

# Check network speed
speedtest-cli  # Or use fast.com
```

## ⚡ Performance Expectations

### With 8GB RAM:
- **Response Time**: 3-5 seconds per F1 article
- **Concurrent Users**: 2-3 simultaneous requests
- **Training**: Slower but functional

### With 16GB RAM:
- **Response Time**: 1-3 seconds per F1 article  
- **Concurrent Users**: 5-8 simultaneous requests
- **Training**: Good performance

### With 32GB+ RAM:
- **Response Time**: 1-2 seconds per F1 article
- **Concurrent Users**: 10+ simultaneous requests
- **Training**: Excellent performance
- **Future**: Can run multiple AI models

## 🔧 Optimization Tips

### If RAM is limited:
```bash
# Add swap space
sudo fallocate -l 8G /swapfile
sudo chmod 600 /swapfile  
sudo mkswap /swapfile
sudo swapon /swapfile
```

### If CPU is older:
- Use Qwen3 1.8B model instead of 7B (faster, less accurate)
- Enable Docker memory limits
- Run training during off-hours

## 💰 Upgrade Path

If your old desktop struggles:

1. **Add RAM**: $50-100 for 16-32GB
2. **Add SSD**: $100 for 500GB NVMe  
3. **Better CPU**: Depends on motherboard compatibility

Still cheaper than cloud hosting!

## 🎯 Perfect for Your Use Case

Since you're still building F1 Social and don't have many users yet, even an older desktop will be perfect for:

✅ **Development**: Testing AI features  
✅ **Content Generation**: Daily F1 articles  
✅ **Training Data**: Collecting user feedback  
✅ **Fantasy Features**: Strategy calculations  
✅ **Learning**: Server management skills  

You can always upgrade hardware later as your site grows!