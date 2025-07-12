#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Vercel Build Process Starting...\n');

try {
  // Install root dependencies
  console.log('📦 Installing root dependencies...');
  execSync('npm install', { stdio: 'inherit' });
  
  // Install client dependencies
  console.log('📦 Installing client dependencies...');
  execSync('cd client && npm install', { stdio: 'inherit' });
  
  // Build client
  console.log('🔨 Building client...');
  execSync('cd client && npm run build', { stdio: 'inherit' });
  
  // Verify build
  const clientBuildPath = path.join(__dirname, 'client/dist');
  const indexHtmlPath = path.join(clientBuildPath, 'index.html');
  
  if (fs.existsSync(clientBuildPath) && fs.existsSync(indexHtmlPath)) {
    console.log('✅ Build successful!');
    console.log('📁 Build directory:', clientBuildPath);
    console.log('📄 Index HTML:', indexHtmlPath);
  } else {
    console.error('❌ Build failed!');
    process.exit(1);
  }
  
} catch (error) {
  console.error('❌ Build error:', error.message);
  process.exit(1);
} 