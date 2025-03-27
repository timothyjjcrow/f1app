#!/bin/bash

# Build script for Vercel deployment

echo "🏗️ Starting build process..."

# Install root dependencies if any
echo "📦 Installing root dependencies..."
npm install

# Build frontend
echo "🏗️ Building frontend..."
cd f1-data-viz/frontend
npm install
npm run build
echo "✅ Frontend build completed - output in dist directory"

# Build backend
echo "🏗️ Building backend..."
cd ../backend
npm install
echo "✅ Backend build completed"

# Ensure API directory is properly set up
echo "🏗️ Setting up API directory..."
cd ../../
mkdir -p api
cp -f api/index.js api/index.js 2>/dev/null || echo "API entry point already exists"

echo "✅ Build process completed successfully!" 