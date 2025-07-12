const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔍 Starting debug build process...');
console.log('Current directory:', process.cwd());
console.log('Node version:', process.version);
console.log('Available memory:', process.memoryUsage());

try {
  // Check if client directory exists
  const clientPath = path.join(__dirname, 'client');
  console.log('Client directory exists:', fs.existsSync(clientPath));
  
  if (fs.existsSync(clientPath)) {
    console.log('Client directory contents:', fs.readdirSync(clientPath));
  }
  
  // Check if client/package.json exists
  const clientPackagePath = path.join(clientPath, 'package.json');
  console.log('Client package.json exists:', fs.existsSync(clientPackagePath));
  
  // Try to install client dependencies
  console.log('📦 Installing client dependencies...');
  execSync('cd client && npm install', { stdio: 'inherit' });
  
  // Check if node_modules was created
  const nodeModulesPath = path.join(clientPath, 'node_modules');
  console.log('Client node_modules exists:', fs.existsSync(nodeModulesPath));
  
  // Try to build client
  console.log('🔨 Building client...');
  execSync('cd client && npm run build', { stdio: 'inherit' });
  
  // Check if build was successful
  const clientBuildPath = path.join(clientPath, 'dist');
  const indexHtmlPath = path.join(clientBuildPath, 'index.html');
  
  console.log('Client build directory exists:', fs.existsSync(clientBuildPath));
  console.log('Index HTML exists:', fs.existsSync(indexHtmlPath));
  
  if (fs.existsSync(clientBuildPath)) {
    console.log('✅ Build successful!');
    console.log('Build contents:', fs.readdirSync(clientBuildPath));
  } else {
    console.log('❌ Build failed - dist directory not found');
  }
  
} catch (error) {
  console.error('❌ Build failed with error:', error.message);
  console.error('Error stack:', error.stack);
  process.exit(1);
} 