#!/bin/bash
set -e

echo "🚀 Starting deployment..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
  echo "❌ Error: Not in my-messenger directory"
  echo "Run from: ~/DevOps messenger project/my-messenger/my-messenger"
  exit 1
fi

# Build frontend
echo "📦 Building frontend..."
npm install
npm run build

# Build Docker images
echo "🐳 Building Docker images..."
docker build --platform linux/amd64 -t messengercr31090.azurecr.io/backend:latest ./backend
docker build --platform linux/amd64 -t messengercr31090.azurecr.io/frontend:latest .

# Login to ACR
echo "🔐 Logging into ACR..."
ACR_USERNAME=$(az acr credential show --name messengercr31090 --query username --output tsv)
ACR_PASSWORD=$(az acr credential show --name messengercr31090 --query 'passwords[0].value' --output tsv)
docker login messengercr31090.azurecr.io -u $ACR_USERNAME -p $ACR_PASSWORD

# Push images
echo "⬆️  Pushing images..."
docker push messengercr31090.azurecr.io/backend:latest
docker push messengercr31090.azurecr.io/frontend:latest

# Restart containers
echo "�� Restarting Azure containers..."
az container restart --resource-group BCSAI2025-DEVOPS-STUDENTS-B --name messenger-backend-ms-17326 --no-wait
az container restart --resource-group BCSAI2025-DEVOPS-STUDENTS-B --name messenger-frontend-ms-17326 --no-wait

echo ""
echo "✅ Deployment complete!"
echo "🌐 Frontend: http://messenger-app-ms-17326.northeurope.azurecontainer.io"
echo "🔧 Backend: http://messenger-backend-ms-17326.northeurope.azurecontainer.io:5000"
echo ""
echo "⏳ Wait ~2 minutes for containers to restart, then test!"
