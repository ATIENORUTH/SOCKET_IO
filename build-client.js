const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Building client for Render...');
console.log('Current directory:', process.cwd());

try {
  // Check if client directory exists
  const clientPath = path.join(process.cwd(), 'client');
  if (!fs.existsSync(clientPath)) {
    console.log('❌ Client directory not found!');
    process.exit(1);
  }

  // Install client dependencies
  console.log('📦 Installing client dependencies...');
  execSync('cd client && npm install', { stdio: 'inherit' });

  // Build client
  console.log('🔨 Building client...');
  execSync('cd client && npm run build', { stdio: 'inherit' });

  // Verify build
  const distPath = path.join(clientPath, 'dist');
  const indexHtmlPath = path.join(distPath, 'index.html');
  
  if (fs.existsSync(distPath) && fs.existsSync(indexHtmlPath)) {
    console.log('✅ Client build successful!');
    console.log('Build location:', distPath);
  } else {
    console.log('❌ Client build failed!');
    process.exit(1);
  }

} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
} 