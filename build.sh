#!/bin/bash

set -e  # Exit on any error

echo "🚀 Starting build process..."
echo "Current directory: $(pwd)"
echo "Available files:"
ls -la

# Install root dependencies
echo "📦 Installing root dependencies..."
npm install

# Check if client directory exists
if [ ! -d "client" ]; then
    echo "❌ Client directory not found!"
    exit 1
fi

# Install client dependencies
echo "📦 Installing client dependencies..."
cd client
npm install

# Build client
echo "🔨 Building client..."
npm run build

# Check if build was successful
if [ ! -d "dist" ]; then
    echo "❌ Client build failed - dist directory not found"
    exit 1
fi

if [ ! -f "dist/index.html" ]; then
    echo "❌ Client build failed - index.html not found"
    exit 1
fi

echo "✅ Client build successful"
echo "📁 Dist directory contents:"
ls -la dist/

# Go back to root
cd ..

# Create public directory
echo "📋 Creating public directory..."
mkdir -p public

# Copy build files to public
echo "📋 Copying build files to public..."
cp -r client/dist/* public/

# Verify the copy
if [ ! -f "public/index.html" ]; then
    echo "❌ Failed to copy index.html to public"
    exit 1
fi

echo "✅ Build and copy completed successfully!"
echo "📁 Public directory contents:"
ls -la public/

echo "🎉 Build process completed!" 