#!/bin/bash

# Build script for Vercel deployment

echo "🏗️ Starting build process..."

# Install root dependencies if any
if [ -f package.json ]; then
  echo "📦 Installing root dependencies..."
  npm install
fi

# Build frontend
echo "🏗️ Building frontend..."
cd f1-data-viz/frontend
npm install
npm run build

# Build backend
echo "🏗️ Building backend..."
cd ../backend
npm install

echo "✅ Build completed successfully!" 