#!/bin/bash

set -e  # Exit on any error

echo "🚀 Starting Render build process..."

# Install root dependencies
echo "📦 Installing root dependencies..."
npm install

# Install client dependencies
echo "📦 Installing client dependencies..."
cd client
npm install

# Build client with explicit output and verbose logging
echo "🔨 Building client..."
echo "Current directory: $(pwd)"
echo "Node version: $(node --version)"
echo "NPM version: $(npm --version)"

# Try building with explicit output directory
npx vite build --outDir dist --mode production

# Verify build with more detailed output
echo "✅ Verifying build..."
echo "Checking dist directory:"
ls -la dist/ || echo "dist directory not found"

if [ -d "dist" ] && [ -f "dist/index.html" ]; then
    echo "✅ Build successful!"
    echo "Build contents:"
    ls -la dist/
    echo "Index.html content (first 5 lines):"
    head -5 dist/index.html
else
    echo "❌ Build failed!"
    echo "Current directory contents:"
    ls -la
    echo "Client directory contents:"
    ls -la client/ || echo "client directory not found"
    exit 1
fi

cd ..

echo "🎉 Render build completed!" 