const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Starting simple deployment...');

try {
  // Step 1: Install root dependencies
  console.log('📦 Installing root dependencies...');
  execSync('npm install', { stdio: 'inherit' });

  // Step 2: Install client dependencies
  console.log('📦 Installing client dependencies...');
  execSync('npm install', { cwd: path.join(__dirname, 'client'), stdio: 'inherit' });

  // Step 3: Build client
  console.log('🔨 Building client...');
  execSync('npm run build', { cwd: path.join(__dirname, 'client'), stdio: 'inherit' });

  // Step 4: Create public directory
  console.log('📁 Setting up public directory...');
  const publicDir = path.join(__dirname, 'public');
  const clientDistDir = path.join(__dirname, 'client', 'dist');

  // Remove existing public directory
  if (fs.existsSync(publicDir)) {
    fs.rmSync(publicDir, { recursive: true, force: true });
  }

  // Create public directory
  fs.mkdirSync(publicDir, { recursive: true });

  // Copy files manually
  console.log('📋 Copying files...');
  
  function copyFile(src, dest) {
    const destDir = path.dirname(dest);
    if (!fs.existsSync(destDir)) {
      fs.mkdirSync(destDir, { recursive: true });
    }
    fs.copyFileSync(src, dest);
  }

  function copyDirectory(src, dest) {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    
    const items = fs.readdirSync(src);
    items.forEach(item => {
      const srcPath = path.join(src, item);
      const destPath = path.join(dest, item);
      
      if (fs.lstatSync(srcPath).isDirectory()) {
        copyDirectory(srcPath, destPath);
      } else {
        copyFile(srcPath, destPath);
      }
    });
  }

  copyDirectory(clientDistDir, publicDir);

  // Step 5: Verify
  console.log('✅ Verifying deployment...');
  const indexHtmlPath = path.join(publicDir, 'index.html');
  
  if (!fs.existsSync(indexHtmlPath)) {
    throw new Error('index.html not found');
  }

  console.log('📂 Public directory contents:');
  console.log(fs.readdirSync(publicDir));

  console.log('🎉 Simple deployment completed successfully!');

} catch (error) {
  console.error('❌ Simple deployment failed:', error.message);
  process.exit(1);
} 