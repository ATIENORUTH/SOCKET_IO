const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Starting Render build process...');

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

  // Step 4: Create public directory and copy files
  console.log('📁 Creating public directory...');
  const publicDir = path.join(__dirname, 'public');
  const clientDistDir = path.join(__dirname, 'client', 'dist');

  // Remove existing public directory
  if (fs.existsSync(publicDir)) {
    fs.rmSync(publicDir, { recursive: true, force: true });
  }

  // Create public directory
  fs.mkdirSync(publicDir, { recursive: true });

  // Copy all files from client/dist to public
  console.log('📋 Copying build files to public...');
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

  copyRecursiveSync(clientDistDir, publicDir);

  // Step 5: Verify the build
  console.log('✅ Verifying build...');
  const indexHtmlPath = path.join(publicDir, 'index.html');
  
  if (!fs.existsSync(indexHtmlPath)) {
    throw new Error('index.html not found in public directory');
  }

  console.log('📂 Public directory contents:');
  console.log(fs.readdirSync(publicDir));

  console.log('🎉 Render build completed successfully!');

} catch (error) {
  console.error('❌ Render build failed:', error.message);
  process.exit(1);
} 