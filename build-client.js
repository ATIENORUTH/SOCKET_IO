const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Starting client build process...');

function copyRecursiveSync(src, dest) {
  try {
    // Ensure destination directory exists
    const destDir = path.dirname(dest);
    if (!fs.existsSync(destDir)) {
      fs.mkdirSync(destDir, { recursive: true });
    }
    
    // If destination exists, remove it first
    if (fs.existsSync(dest)) {
      if (fs.lstatSync(dest).isDirectory()) {
        fs.rmSync(dest, { recursive: true, force: true });
      } else {
        fs.unlinkSync(dest);
      }
    }
    
    if (fs.lstatSync(src).isDirectory()) {
      fs.mkdirSync(dest, { recursive: true });
      fs.readdirSync(src).forEach(child => {
        copyRecursiveSync(path.join(src, child), path.join(dest, child));
      });
    } else {
      fs.copyFileSync(src, dest);
    }
  } catch (error) {
    console.error(`Error copying ${src} to ${dest}:`, error.message);
    throw error;
  }
}

try {
  // Check if client directory exists
  const clientDir = path.join(__dirname, 'client');
  if (!fs.existsSync(clientDir)) {
    throw new Error('Client directory not found');
  }

  console.log('📁 Installing client dependencies...');
  try {
    execSync('npm install --production=false', { 
      cwd: clientDir, 
      stdio: 'inherit',
      env: { ...process.env, NODE_ENV: 'production' }
    });
  } catch (installError) {
    console.log('⚠️ Client dependencies install failed, trying without --production=false...');
    execSync('npm install', { 
      cwd: clientDir, 
      stdio: 'inherit',
      env: { ...process.env, NODE_ENV: 'production' }
    });
  }

  console.log('🔨 Building client...');
  execSync('npm run build', { 
    cwd: clientDir, 
    stdio: 'inherit',
    env: { ...process.env, NODE_ENV: 'production' }
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
  copyRecursiveSync(distDir, publicDir);

  console.log('✅ Client build completed successfully!');
  console.log('📂 Public directory contents:');
  console.log(fs.readdirSync(publicDir));

} catch (error) {
  console.error('❌ Build failed:', error.message);
  console.error('Full error:', error);
  process.exit(1);
} 