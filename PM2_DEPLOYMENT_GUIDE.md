# PM2 Deployment Guide for NIBOG Platform

## Image Loading Issues - Fixed

### Problem
Images were not loading when running the application with PM2 in production mode because:
1. The `upload` directory path resolution was different in PM2 vs development
2. Static file serving configuration needed adjustment for production

### Solution Applied

#### 1. Created `ecosystem.config.js`
A PM2 configuration file that properly sets up the application:
- Sets NODE_ENV to production
- Configures port 3111
- Enables cluster mode for better performance
- Sets up logging
- Configures auto-restart

#### 2. Updated `next.config.mjs`
- Enhanced `outputFileTracingIncludes` to ensure upload directory is included in production build
- Added rewrites for better upload URL handling
- Improved file tracing configuration

#### 3. Enhanced Image Serving API (`app/api/serve-image/[...path]/route.ts`)
- Added production-specific path resolution
- Multiple fallback paths for PM2 deployment scenarios
- Better logging to debug path issues
- Enhanced error handling

## Deployment Steps

### On Your Server

1. **Build the Application**
   ```bash
   pnpm build
   ```

2. **Stop Existing PM2 Process** (if running)
   ```bash
   pm2 stop nibog-platform
   pm2 delete nibog-platform
   ```

3. **Start with PM2 Using Ecosystem File**
   ```bash
   pm2 start ecosystem.config.js
   ```

4. **Save PM2 Configuration**
   ```bash
   pm2 save
   ```

5. **Enable PM2 Startup on Boot** (optional, for server restarts)
   ```bash
   pm2 startup
   # Follow the instructions provided
   ```

## Verify Images Are Loading

### Check PM2 Status
```bash
pm2 status
pm2 logs nibog-platform --lines 50
```

### Check Upload Directory
Make sure the upload directory exists and has images:
```bash
ls -la upload/gamesimage/
ls -la upload/eventimages/
ls -la upload/testmonialimage/
```

### Test Image Loading
Visit these URLs in your browser (replace with your domain/IP):
```
http://your-domain:3111/api/serve-image/upload/gamesimage/[any-game-image.png]
http://your-domain:3111/api/serve-image/upload/eventimages/[any-event-image.png]
```

## Common PM2 Commands

```bash
# View logs
pm2 logs nibog-platform

# Restart application
pm2 restart nibog-platform

# Stop application
pm2 stop nibog-platform

# View detailed info
pm2 info nibog-platform

# Monitor resource usage
pm2 monit

# Reload with zero downtime
pm2 reload nibog-platform
```

## Troubleshooting

### Images Still Not Loading?

1. **Check the logs for path information:**
   ```bash
   pm2 logs nibog-platform | grep "🔍"
   ```
   This will show you the exact paths being used.

2. **Verify file permissions:**
   ```bash
   chmod -R 755 upload/
   ```

3. **Check if upload directory is in the right location:**
   ```bash
   pwd
   ls -la upload/
   ```

4. **Restart PM2:**
   ```bash
   pm2 restart nibog-platform
   ```

### Check Environment Variables
Make sure your `.env.production` file is properly configured and accessible.

## Performance Tips

1. **Use Cluster Mode** (already configured in ecosystem.config.js)
   - Better utilization of multi-core CPUs
   - Automatic load balancing

2. **Monitor Memory Usage**
   ```bash
   pm2 monit
   ```

3. **Set up Log Rotation**
   ```bash
   pm2 install pm2-logrotate
   pm2 set pm2-logrotate:max_size 10M
   pm2 set pm2-logrotate:retain 7
   ```

## Image Path Resolution Strategy

The updated serve-image API now tries multiple paths in production:

1. Direct path: `{cwd}/{imagePath}`
2. Standalone path: `{cwd}/.next/standalone/{imagePath}`
3. Parent directory: `{cwd}/../{imagePath}`
4. Absolute path: `{imagePath}`

This ensures images load correctly regardless of how PM2 is configured or where the app is deployed.

## Next Steps

After deployment, verify:
- ✅ All game images load on the homepage
- ✅ Event images load on event pages
- ✅ Testimonial images display correctly
- ✅ Admin dashboard images show properly
- ✅ No console errors related to image loading

## Contact

If you encounter any issues, check the PM2 logs first:
```bash
pm2 logs nibog-platform --lines 100
```

Look for any error messages or path resolution issues marked with ❌ or 🔍 emojis.
