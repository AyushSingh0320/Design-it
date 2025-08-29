#!/bin/bash
# Deployment script

echo "🚀 Starting deployment process..."

# Pull latest code
git pull origin main

# Install server dependencies
echo "📦 Installing server dependencies..."
cd server && npm install --production

# Install client dependencies and build
echo "📦 Installing client dependencies and building..."
cd ../client && npm install && npm run build

# Restart server (PM2 will handle this)
echo "🔄 Restarting server..."
pm2 restart design-it-api

echo "✅ Deployment complete!"