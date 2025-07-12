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
  
  // Check if node_modules exists in client
  const clientNodeModules = path.join(__dirname, 'client/node_modules');
  if (!fs.existsSync(clientNodeModules)) {
    console.error('❌ Client node_modules not found after install');
    process.exit(1);
  }
  
  // Build client with more detailed error handling
  console.log('🔨 Building client...');
  try {
    execSync('cd client && npm run build', { 
      stdio: 'inherit',
      env: { ...process.env, NODE_ENV: 'production' }
    });
  } catch (buildError) {
    console.error('❌ Client build failed:', buildError.message);
    
    // Try to get more info about the error
    console.log('📋 Checking client package.json...');
    const clientPackagePath = path.join(__dirname, 'client/package.json');
    if (fs.existsSync(clientPackagePath)) {
      const packageJson = JSON.parse(fs.readFileSync(clientPackagePath, 'utf8'));
      console.log('📦 Dependencies:', Object.keys(packageJson.dependencies || {}));
      console.log('🔧 DevDependencies:', Object.keys(packageJson.devDependencies || {}));
    }
    
    process.exit(1);
  }
  
  // Verify build
  const clientBuildPath = path.join(__dirname, 'client/dist');
  const indexHtmlPath = path.join(clientBuildPath, 'index.html');
  
  if (fs.existsSync(clientBuildPath) && fs.existsSync(indexHtmlPath)) {
    console.log('✅ Build successful!');
    console.log('📁 Build directory:', clientBuildPath);
    console.log('📄 Index HTML:', indexHtmlPath);
    
    // List build contents
    const buildContents = fs.readdirSync(clientBuildPath);
    console.log('📋 Build contents:', buildContents);
  } else {
    console.error('❌ Build verification failed!');
    console.log('Client build path exists:', fs.existsSync(clientBuildPath));
    console.log('Index HTML exists:', fs.existsSync(indexHtmlPath));
    process.exit(1);
  }
  
} catch (error) {
  console.error('❌ Build error:', error.message);
  process.exit(1);
} 