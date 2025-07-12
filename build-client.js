const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Building client...');

try {
  // Install client dependencies
  console.log('📦 Installing client dependencies...');
  execSync('cd client && npm install --production=false', { stdio: 'inherit' });

  // Build client
  console.log('🔨 Building client...');
  execSync('cd client && npm run build', { stdio: 'inherit' });

  // Create public directory
  console.log('📋 Creating public directory...');
  if (!fs.existsSync('public')) {
    fs.mkdirSync('public', { recursive: true });
  }

  // Copy files
  console.log('📋 Copying build files...');
  execSync('cp -r client/dist/* public/', { stdio: 'inherit' });

  console.log('✅ Build completed successfully!');
  console.log('📁 Public directory contents:');
  console.log(fs.readdirSync('public'));

} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
} 