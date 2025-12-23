# Deployment Checklist for nibog-platform

## ✅ Pre-deployment Requirements

### Server Requirements
- [ ] Linux server (Ubuntu/Debian/CentOS recommended)
- [ ] Node.js 18+ installed (`node -v`)
- [ ] pnpm installed (`pnpm -v`) - Install: `npm i -g pnpm`
- [ ] pm2 installed (`pm2 -v`) - Install: `npm i -g pm2`
- [ ] curl installed (for health checks) - Install: `apt install curl` or `yum install curl`
- [ ] Git installed (if using git clone)

### Firewall/Security
- [ ] Port 3112 open in firewall (or your custom port)
  ```bash
  # Ubuntu/Debian
  sudo ufw allow 3112
  sudo ufw reload
  
  # CentOS/RHEL
  sudo firewall-cmd --permanent --add-port=3112/tcp
  sudo firewall-cmd --reload
  ```

### Environment File
- [ ] Create `.env` or `.env.production` with all required variables
- [ ] Set `NEXT_PUBLIC_APP_URL` to your server IP or domain
  ```bash
  # Example for IP access
  NEXT_PUBLIC_APP_URL=http://YOUR_SERVER_IP:3112
  
  # Example for domain
  NEXT_PUBLIC_APP_URL=https://www.nibog.in
  ```
- [ ] Set `BACKEND_URL` correctly
- [ ] Set all other env variables from `.env` example

## 🚀 Deployment Steps

### 1. Initial Setup (First Time Only)
```bash
# Clone or upload repository
cd /var/www
git clone <your-repo-url> nibog
cd nibog

# Make deploy script executable
chmod +x scripts/deploy.sh

# Copy your environment file
cp .env.example .env.production
# Edit .env.production with correct values
nano .env.production
```

### 2. Run Deployment
```bash
# From repository root
./scripts/deploy.sh main .env.production
```

The script will:
- ✅ Check for pnpm and pm2
- ✅ Load environment variables
- ✅ Install dependencies
- ✅ Build the Next.js app
- ✅ Start/reload PM2 process
- ✅ Perform health check
- ✅ Display access URLs

### 3. Verify Deployment
After successful deployment, you'll see:
```
========================================
[deploy] Deployment complete!
========================================
Access your website at:
  - Local:    http://127.0.0.1:3112
  - Network:  http://YOUR_IP:3112
```

Check these:
- [ ] Visit `http://YOUR_SERVER_IP:3112` in browser
- [ ] Check PM2 status: `pm2 list`
- [ ] Check logs: `pm2 logs nibog-platform --lines 50`
- [ ] Verify no errors in logs

### 4. Enable Auto-Start on Reboot (First Time Only)
```bash
# Run the command printed by deploy script (example):
pm2 startup
# Copy and run the printed sudo command, then:
pm2 save
```

## 🔧 Configuration Details

### Port Configuration
- Default port: **3112**
- Configured in:
  - `ecosystem.config.js` (args: `-p 3112 -H 0.0.0.0`)
  - `package.json` (scripts.start)
  
### Network Binding
- ✅ **FIXED**: Added `-H 0.0.0.0` to bind to all network interfaces
- This allows access via server IP address (not just localhost)

### Critical Files
1. **ecosystem.config.js** - PM2 configuration
   - Port: 3112
   - Hostname: 0.0.0.0 (all interfaces)
   - Environment variables
   
2. **scripts/deploy.sh** - Deployment automation
   - Health checks
   - PM2 reload/restart logic
   - Environment loading

3. **.env or .env.production** - Environment variables
   - Build-time vars (NEXT_PUBLIC_*)
   - Runtime vars (BACKEND_URL, secrets)

## 🐛 Troubleshooting

### Website not accessible via IP?
```bash
# 1. Check if Next.js is running
pm2 list
pm2 logs nibog-platform

# 2. Check if port is open
sudo netstat -tulpn | grep 3112
# or
sudo ss -tulpn | grep 3112

# 3. Test locally first
curl http://127.0.0.1:3112

# 4. Test from another machine
curl http://YOUR_SERVER_IP:3112

# 5. Check firewall
sudo ufw status
# or
sudo firewall-cmd --list-all
```

### Health check fails?
```bash
# Check PM2 logs for startup errors
pm2 logs nibog-platform --lines 200

# Common issues:
# - Port already in use: change PORT in .env
# - Missing dependencies: run pnpm install
# - Build errors: check pnpm build output
# - Missing env vars: verify .env.production
```

### Build fails?
```bash
# Clear cache and rebuild
rm -rf .next
pnpm install --force
pnpm build

# Check for TypeScript errors
pnpm run lint
```

### PM2 process crashes?
```bash
# Check error logs
pm2 logs nibog-platform --err --lines 100

# Restart manually
pm2 restart nibog-platform

# Check memory usage
pm2 monit

# If OOM (out of memory), increase max_memory_restart in ecosystem.config.js
```

## 🔄 Updating Deployment

For subsequent deployments:
```bash
cd /var/www/nibog
./scripts/deploy.sh main .env.production
```

The script will:
- Pull latest code
- Install new dependencies
- Rebuild
- Gracefully reload PM2 (zero downtime)

## 📊 Monitoring

### Check Status
```bash
pm2 list                           # List all processes
pm2 describe nibog-platform        # Detailed info
pm2 monit                          # Real-time monitor
```

### View Logs
```bash
pm2 logs nibog-platform            # Live tail
pm2 logs nibog-platform --lines 100   # Last 100 lines
pm2 logs nibog-platform --err      # Error logs only
```

### Restart/Reload
```bash
pm2 restart nibog-platform         # Hard restart
pm2 reload nibog-platform          # Graceful reload (zero downtime)
pm2 stop nibog-platform            # Stop
pm2 start nibog-platform           # Start
```

## 🌐 Production Setup (Optional but Recommended)

### Using Nginx Reverse Proxy
```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    location / {
        proxy_pass http://127.0.0.1:3112;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### Adding SSL with Certbot
```bash
# Install certbot
sudo apt install certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# Auto-renewal is set up automatically
```

## ✅ Deployment Success Criteria

After deployment, verify all these:
- [ ] Website loads at `http://YOUR_IP:3112`
- [ ] No console errors in browser
- [ ] `pm2 list` shows process is "online"
- [ ] `pm2 logs` shows no errors
- [ ] Health check returns 200
- [ ] Static assets load correctly
- [ ] API routes work
- [ ] Images display properly

## 📞 Need Help?

If deployment fails:
1. Check `pm2 logs nibog-platform --err --lines 200`
2. Verify all environment variables in `.env.production`
3. Ensure firewall allows port 3112
4. Test local access first: `curl http://127.0.0.1:3112`
5. Check that Next.js binds to 0.0.0.0 (already configured in ecosystem.config.js)
