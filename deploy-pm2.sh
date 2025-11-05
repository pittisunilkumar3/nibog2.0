#!/bin/bash

# NIBOG Platform - PM2 Deployment Script
# This script rebuilds and deploys the application with PM2

echo "🚀 Starting NIBOG Platform deployment..."

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Step 1: Install dependencies
echo -e "${YELLOW}📦 Installing dependencies...${NC}"
pnpm install
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Failed to install dependencies${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Dependencies installed${NC}"

# Step 2: Build the application
echo -e "${YELLOW}🔨 Building application...${NC}"
pnpm build
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Build failed${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Build completed${NC}"

# Step 3: Stop existing PM2 process (if running)
echo -e "${YELLOW}🛑 Stopping existing PM2 process...${NC}"
pm2 stop nibog-platform 2>/dev/null || echo "No existing process to stop"
pm2 delete nibog-platform 2>/dev/null || echo "No existing process to delete"
echo -e "${GREEN}✅ Cleaned up existing process${NC}"

# Step 4: Start with PM2
echo -e "${YELLOW}🚀 Starting application with PM2...${NC}"
pm2 start ecosystem.config.js
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Failed to start PM2 process${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Application started${NC}"

# Step 5: Save PM2 configuration
echo -e "${YELLOW}💾 Saving PM2 configuration...${NC}"
pm2 save
echo -e "${GREEN}✅ PM2 configuration saved${NC}"

# Step 6: Show status
echo -e "${YELLOW}📊 Application Status:${NC}"
pm2 status

# Step 7: Show logs
echo -e "${YELLOW}📝 Recent logs:${NC}"
pm2 logs nibog-platform --lines 20 --nostream

echo ""
echo -e "${GREEN}✅ Deployment completed successfully!${NC}"
echo -e "${YELLOW}📌 Useful commands:${NC}"
echo "  - View logs: pm2 logs nibog-platform"
echo "  - Restart: pm2 restart nibog-platform"
echo "  - Stop: pm2 stop nibog-platform"
echo "  - Monitor: pm2 monit"
echo ""
echo -e "${GREEN}🌐 Application is running on port 3111${NC}"
