const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Starting simple build for Render...');
console.log('📁 Current directory:', process.cwd());
console.log('📁 Available files:', fs.readdirSync('.'));

try {
  // Step 1: Install root dependencies
  console.log('📦 Installing root dependencies...');
  execSync('npm install', { stdio: 'inherit' });

  // Step 2: Check if client directory exists
  const clientDir = path.join(__dirname, 'client');
  if (!fs.existsSync(clientDir)) {
    throw new Error('Client directory not found');
  }

  console.log('📁 Client directory found:', clientDir);
  console.log('📁 Client directory contents:', fs.readdirSync(clientDir));

  // Step 3: Install client dependencies
  console.log('📦 Installing client dependencies...');
  execSync('npm install', { 
    cwd: clientDir, 
    stdio: 'inherit'
  });

  // Step 4: Build client
  console.log('🔨 Building client...');
  execSync('npm run build', { 
    cwd: clientDir, 
    stdio: 'inherit'
  });

  // Step 5: Verify build output
  const distDir = path.join(clientDir, 'dist');
  if (!fs.existsSync(distDir)) {
    throw new Error('Client build failed - dist directory not found');
  }

  console.log('📂 Client dist contents:', fs.readdirSync(distDir));

  // Step 6: Create public directory
  console.log('📁 Creating public directory...');
  const publicDir = path.join(__dirname, 'public');
  if (fs.existsSync(publicDir)) {
    fs.rmSync(publicDir, { recursive: true, force: true });
  }
  fs.mkdirSync(publicDir, { recursive: true });

  // Step 7: Copy files to public
  console.log('📋 Copying files to public...');
  function copyRecursiveSync(src, dest) {
    if (fs.lstatSync(src).isDirectory()) {
      if (!fs.existsSync(dest)) {
        fs.mkdirSync(dest, { recursive: true });
      }
      fs.readdirSync(src).forEach(child => {
        copyRecursiveSync(path.join(src, child), path.join(dest, child));
      });
    } else {
      fs.copyFileSync(src, dest);
    }
  }

  copyRecursiveSync(distDir, publicDir);

  console.log('✅ Build completed successfully!');
  console.log('📂 Public directory contents:', fs.readdirSync(publicDir));

  // Verify index.html exists
  const indexPath = path.join(publicDir, 'index.html');
  if (fs.existsSync(indexPath)) {
    console.log('✅ index.html found in public directory');
  } else {
    console.log('❌ index.html not found in public directory');
  }

} catch (error) {
  console.error('❌ Build failed:', error.message);
  console.error('Full error:', error);
  process.exit(1);
} 