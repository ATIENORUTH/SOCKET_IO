#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Starting Socket.IO Chat Application...\n');

// Check if client build exists
const clientBuildPath = path.join(__dirname, 'client/dist');
const indexHtmlPath = path.join(clientBuildPath, 'index.html');

console.log('📁 Checking client build...');
console.log(`Client build path: ${clientBuildPath}`);
console.log(`Index HTML path: ${indexHtmlPath}`);

if (!fs.existsSync(clientBuildPath)) {
  console.log('❌ Client build not found. Building frontend...');
  try {
    execSync('cd client && npm run build', { stdio: 'inherit' });
    console.log('✅ Frontend built successfully!');
  } catch (error) {
    console.error('❌ Failed to build frontend:', error.message);
    process.exit(1);
  }
} else {
  console.log('✅ Client build already exists!');
}

console.log('\n🌐 Starting server...');
console.log('Server will be available at: http://localhost:5000');
console.log('Press Ctrl+C to stop the server\n');

try {
  execSync('node server/server.js', { stdio: 'inherit' });
} catch (error) {
  console.error('❌ Server error:', error.message);
  process.exit(1);
} 