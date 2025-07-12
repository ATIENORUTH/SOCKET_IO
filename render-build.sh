#!/bin/bash

echo "🚀 Starting Render build process..."

# Install root dependencies
echo "📦 Installing root dependencies..."
npm install

# Install client dependencies
echo "📦 Installing client dependencies..."
cd client
npm install

# Build client with explicit output
echo "🔨 Building client..."
npx vite build --outDir dist

# Verify build
echo "✅ Verifying build..."
if [ -d "dist" ] && [ -f "dist/index.html" ]; then
    echo "✅ Build successful!"
    ls -la dist/
else
    echo "❌ Build failed!"
    exit 1
fi

cd ..

echo "🎉 Render build completed!" 