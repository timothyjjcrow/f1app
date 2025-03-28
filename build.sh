#!/bin/bash

# Build script for Vercel deployment
set -e # Exit immediately if a command exits with a non-zero status

echo "🏗️ Starting build process..."
echo "Current directory: $(pwd)"

# Install root dependencies
echo "📦 Installing root dependencies..."
npm install

# Build frontend
echo "🏗️ Building frontend..."
cd f1-data-viz/frontend
echo "Cleaning previous installations..."
rm -rf node_modules package-lock.json || true
echo "Installing frontend dependencies..."
npm install
echo "Building frontend..."
npm run build
echo "✅ Frontend build completed - output in dist directory"
echo "Dist directory contents:"
ls -la dist

# Ensure dist directory is accessible from project root
echo "Creating symlink to dist for Vercel"
mkdir -p ../../dist
cp -r dist/* ../../dist/
echo "Root dist directory contents:"
ls -la ../../dist

# Build backend
echo "🏗️ Building backend..."
cd ../backend
echo "Installing backend dependencies..."
npm install
echo "✅ Backend build completed"

# Ensure API directory is properly set up
echo "🏗️ Setting up API directory..."
cd ../../
mkdir -p api
if [ ! -f api/index.js ]; then
  echo "// This file serves as an entry point for Vercel serverless API functions" > api/index.js
  echo "const app = require('../f1-data-viz/backend/server.js');" >> api/index.js
  echo "" >> api/index.js
  echo "// Export a module that can be used as a Vercel serverless function" >> api/index.js
  echo "module.exports = app;" >> api/index.js
  echo "Created API entry point"
else
  echo "API entry point already exists"
fi

echo "Final project structure:"
find . -type f -not -path "*/node_modules/*" -not -path "*/\.*" | sort

echo "✅ Build process completed successfully!" 