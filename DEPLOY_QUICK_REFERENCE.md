# Quick Reference - Deploy to Server with PM2

## Upload Files to Server
Make sure these files are on your server:
- `ecosystem.config.js`
- `deploy-pm2.sh` (for Linux) or `deploy-pm2.ps1` (for Windows)
- `.next/` (build output)
- `upload/` (your images directory)

## Deploy on Linux Server

```bash
# 1. SSH into your server
ssh user@your-server.com

# 2. Navigate to your project directory
cd /path/to/nibog-platform

# 3. Pull latest changes (if using git)
git pull

# 4. Run the deployment script
chmod +x deploy-pm2.sh
./deploy-pm2.sh
```

## Deploy on Windows Server

```powershell
# 1. Navigate to project directory
cd C:\path\to\nibog-platform

# 2. Run the deployment script
.\deploy-pm2.ps1
```

## Manual Deployment (Any OS)

```bash
# 1. Install dependencies
pnpm install

# 2. Build
pnpm build

# 3. Stop old PM2 process
pm2 stop nibog-platform
pm2 delete nibog-platform

# 4. Start with PM2
pm2 start ecosystem.config.js

# 5. Save PM2 config
pm2 save

# 6. (Optional) Enable auto-start on boot
pm2 startup
# Follow the command it gives you
```

## Verify Everything Works

```bash
# Check status
pm2 status

# View logs
pm2 logs nibog-platform --lines 50

# Look for these in logs:
# ✅ - Success indicators
# 🔍 - Path resolution logs
# ❌ - Error indicators
```

## Quick PM2 Commands

```bash
pm2 restart nibog-platform    # Restart app
pm2 stop nibog-platform       # Stop app
pm2 start nibog-platform      # Start app
pm2 reload nibog-platform     # Zero-downtime reload
pm2 logs nibog-platform       # View logs
pm2 monit                     # Monitor resources
pm2 save                      # Save current config
```

## Test Images Are Loading

Visit these URLs (replace with your domain):
- `http://your-domain:3111/` (check homepage game images)
- `http://your-domain:3111/events` (check event images)
- `http://your-domain:3111/admin` (check admin dashboard)

## If Images Don't Load

```bash
# 1. Check logs
pm2 logs nibog-platform | grep "🔍"

# 2. Verify upload directory
ls -la upload/gamesimage/
ls -la upload/eventimages/

# 3. Fix permissions
chmod -R 755 upload/

# 4. Restart
pm2 restart nibog-platform
```

## Important URLs
- Main site: `http://your-domain:3111`
- Admin panel: `http://your-domain:3111/admin`
- Image API test: `http://your-domain:3111/api/serve-image/upload/gamesimage/[filename.png]`

## Environment Variables
Make sure `.env.production` file exists with:
```
NODE_ENV=production
PORT=3111
# ... other environment variables
```

---
📝 For detailed documentation, see `PM2_DEPLOYMENT_GUIDE.md`
