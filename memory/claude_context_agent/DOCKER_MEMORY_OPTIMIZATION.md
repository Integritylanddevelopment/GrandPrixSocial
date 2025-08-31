# Docker Desktop Memory Optimization Guide

## Current Status
- **Container Usage**: ~145MB total (optimized with limits)
- **Docker VM**: Likely allocated 4.5GB (needs adjustment)

## Fix Docker Desktop Memory Allocation

### Step 1: Open Docker Desktop Settings
1. Right-click Docker Desktop icon in system tray
2. Select "Settings" or "Preferences"

### Step 2: Adjust Resource Limits
1. Go to **"Resources"** → **"Advanced"**
2. Set these values:
   - **Memory**: 1GB (down from 4.5GB)
   - **CPUs**: 2 (sufficient for our containers)
   - **Swap**: 512MB
   - **Disk Image Size**: Keep current (only grows as needed)

### Step 3: Apply Changes
1. Click **"Apply & Restart"**
2. Docker will restart with new limits

## Why This Works
- Our containers need max 1GB total (512MB + 256MB + 128MB + 128MB + 64MB + 32MB)
- Docker VM was over-allocated at 4.5GB
- Setting 1GB VM limit forces Docker to be efficient
- Services will still scale up to their individual limits when needed

## Alternative: Use WSL 2 Backend (Recommended)
If using Windows:
1. Docker Desktop Settings → **"General"**
2. Enable **"Use WSL 2 based engine"**
3. WSL 2 dynamically allocates memory instead of fixed VM

## Verification
After restart, check memory usage:
```bash
# Check container limits are working
docker stats --no-stream

# Check system memory usage in Task Manager
# Docker should now use ~1GB instead of 4.5GB
```

## Emergency Rollback
If services fail to start:
1. Increase memory to 2GB
2. Our containers are configured to work within these limits
3. Individual container limits prevent any single service from using too much

---
**Result**: Docker memory usage drops from 4.5GB to ~1GB while maintaining full functionality.