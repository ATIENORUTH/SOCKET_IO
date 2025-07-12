#!/bin/bash

echo "🚀 Starting simple build process..."

# Install root dependencies
echo "📦 Installing root dependencies..."
npm install

# Install and build client
echo "📦 Installing client dependencies..."
cd client
npm install

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

# Go back to root and create public directory
cd ..
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