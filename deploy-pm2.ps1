# NIBOG Platform - PM2 Deployment Script (Windows PowerShell)
# This script rebuilds and deploys the application with PM2

Write-Host "🚀 Starting NIBOG Platform deployment..." -ForegroundColor Cyan

# Step 1: Install dependencies
Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
pnpm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to install dependencies" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Dependencies installed" -ForegroundColor Green

# Step 2: Build the application
Write-Host "🔨 Building application..." -ForegroundColor Yellow
pnpm build
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Build failed" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Build completed" -ForegroundColor Green

# Step 3: Stop existing PM2 process (if running)
Write-Host "🛑 Stopping existing PM2 process..." -ForegroundColor Yellow
pm2 stop nibog-platform 2>$null
pm2 delete nibog-platform 2>$null
Write-Host "✅ Cleaned up existing process" -ForegroundColor Green

# Step 4: Start with PM2
Write-Host "🚀 Starting application with PM2..." -ForegroundColor Yellow
pm2 start ecosystem.config.js
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to start PM2 process" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Application started" -ForegroundColor Green

# Step 5: Save PM2 configuration
Write-Host "💾 Saving PM2 configuration..." -ForegroundColor Yellow
pm2 save
Write-Host "✅ PM2 configuration saved" -ForegroundColor Green

# Step 6: Show status
Write-Host "📊 Application Status:" -ForegroundColor Yellow
pm2 status

# Step 7: Show logs
Write-Host "📝 Recent logs:" -ForegroundColor Yellow
pm2 logs nibog-platform --lines 20 --nostream

Write-Host ""
Write-Host "✅ Deployment completed successfully!" -ForegroundColor Green
Write-Host "📌 Useful commands:" -ForegroundColor Yellow
Write-Host "  - View logs: pm2 logs nibog-platform"
Write-Host "  - Restart: pm2 restart nibog-platform"
Write-Host "  - Stop: pm2 stop nibog-platform"
Write-Host "  - Monitor: pm2 monit"
Write-Host ""
Write-Host "🌐 Application is running on port 3111" -ForegroundColor Green
