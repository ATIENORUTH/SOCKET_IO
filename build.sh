#!/bin/bash

set -e  # Exit on any error

echo "🚀 Starting build process..."

# Install root dependencies
echo "📦 Installing root dependencies..."
npm install

# Install server dependencies
echo "📦 Installing server dependencies..."
cd server
npm install
cd ..

# Install client dependencies
echo "📦 Installing client dependencies..."
cd client
npm install

# Build client
echo "🔨 Building client..."
npm run build

# Check if build was successful
if [ -d "dist" ]; then
    echo "✅ Client build successful! dist/ directory exists"
    ls -la dist/
else
    echo "❌ Client build failed! dist/ directory not found"
    exit 1
fi

cd ..

echo "🎉 Build completed successfully!" 