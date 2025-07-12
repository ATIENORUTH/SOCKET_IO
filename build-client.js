const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Starting client build process...');

try {
  // Check if client directory exists
  const clientDir = path.join(__dirname, 'client');
  if (!fs.existsSync(clientDir)) {
    throw new Error('Client directory not found');
  }

  console.log('📁 Installing client dependencies...');
  execSync('npm install --production=false', { 
    cwd: clientDir, 
    stdio: 'inherit' 
  });

  console.log('🔨 Building client...');
  execSync('npm run build', { 
    cwd: clientDir, 
    stdio: 'inherit' 
  });

  // Check if dist directory was created
  const distDir = path.join(clientDir, 'dist');
  if (!fs.existsSync(distDir)) {
    throw new Error('Client build failed - dist directory not found');
  }

  console.log('📁 Creating public directory...');
  const publicDir = path.join(__dirname, 'public');
  if (fs.existsSync(publicDir)) {
    fs.rmSync(publicDir, { recursive: true, force: true });
  }
  fs.mkdirSync(publicDir, { recursive: true });

  console.log('📋 Copying build files to public...');
  execSync('cp -r dist/* ../public/', { 
    cwd: clientDir, 
    stdio: 'inherit' 
  });

  console.log('✅ Client build completed successfully!');
  console.log('📂 Public directory contents:');
  execSync('ls -la public/', { stdio: 'inherit' });

} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
} 