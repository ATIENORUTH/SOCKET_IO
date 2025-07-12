#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔧 Fixing Render Build Issue...\n');

// The issue is that the client build isn't being created properly on Render
// Let's create a more explicit build process

try {
  console.log('📦 Step 1: Installing dependencies...');
  execSync('npm install', { stdio: 'inherit' });
  
  console.log('📦 Step 2: Installing client dependencies...');
  execSync('cd client && npm install', { stdio: 'inherit' });
  
  console.log('🔨 Step 3: Building client with explicit commands...');
  // Use explicit vite build command
  execSync('cd client && npx vite build --outDir dist', { stdio: 'inherit' });
  
  console.log('✅ Step 4: Verifying build...');
  const clientBuildPath = path.join(__dirname, 'client/dist');
  const indexHtmlPath = path.join(clientBuildPath, 'index.html');
  
  if (fs.existsSync(clientBuildPath) && fs.existsSync(indexHtmlPath)) {
    console.log('✅ Build successful!');
    console.log('📁 Build directory:', clientBuildPath);
    console.log('📄 Index HTML:', indexHtmlPath);
    
    // List all files in build
    const buildFiles = fs.readdirSync(clientBuildPath, { recursive: true });
    console.log('📋 Build files:', buildFiles);
  } else {
    console.error('❌ Build verification failed!');
    process.exit(1);
  }
  
} catch (error) {
  console.error('❌ Build error:', error.message);
  process.exit(1);
} 