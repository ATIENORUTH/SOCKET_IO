#!/bin/bash

echo "🚀 Starting Render build process..."

# Install root dependencies
echo "📦 Installing root dependencies..."
npm install

# Install and build client
echo "📦 Installing client dependencies..."
cd client
npm install

echo "🔨 Building client..."
npm run build

# Go back to root
cd ..

# Create client-dist directory and copy files
echo "📁 Creating client-dist directory..."
mkdir -p client-dist

echo "📋 Copying build files to client-dist..."
cp -r client/dist/* client-dist/

echo "✅ Build completed successfully!"
echo "📁 Files in client-dist:"
ls -la client-dist/

echo "🚀 Ready for deployment!" 