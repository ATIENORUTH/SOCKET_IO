const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Starting Render deployment build...');

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
  console.log('📁 Current working directory:', process.cwd());
  console.log('📁 Project structure:');
  console.log(fs.readdirSync('.'));

  // Check if client directory exists
  const clientDir = path.join(__dirname, 'client');
  if (!fs.existsSync(clientDir)) {
    throw new Error('Client directory not found');
  }

  console.log('📁 Installing client dependencies...');
  try {
    execSync('npm install', { 
      cwd: clientDir, 
      stdio: 'inherit',
      env: { ...process.env, NODE_ENV: 'production' }
    });
  } catch (installError) {
    console.error('❌ Client dependencies install failed:', installError.message);
    throw installError;
  }

  console.log('🔨 Building client...');
  try {
    execSync('npm run build', { 
      cwd: clientDir, 
      stdio: 'inherit',
      env: { ...process.env, NODE_ENV: 'production' }
    });
  } catch (buildError) {
    console.error('❌ Client build failed:', buildError.message);
    throw buildError;
  }

  // Check if dist directory was created
  const distDir = path.join(clientDir, 'dist');
  if (!fs.existsSync(distDir)) {
    throw new Error('Client build failed - dist directory not found');
  }

  console.log('📂 Client dist contents:', fs.readdirSync(distDir));

  // Create public directory and copy files
  console.log('📁 Creating public directory...');
  const publicDir = path.join(__dirname, 'public');
  if (fs.existsSync(publicDir)) {
    fs.rmSync(publicDir, { recursive: true, force: true });
  }
  fs.mkdirSync(publicDir, { recursive: true });

  console.log('📋 Copying build files to public...');
  copyRecursiveSync(distDir, publicDir);

  // Also ensure the client/dist directory is properly set up for Render
  console.log('📋 Ensuring client/dist is properly set up...');
  const clientDistDir = path.join(clientDir, 'dist');
  if (!fs.existsSync(clientDistDir)) {
    fs.mkdirSync(clientDistDir, { recursive: true });
  }

  // Copy files to client/dist as well (in case Render looks there)
  console.log('📋 Copying files to client/dist as backup...');
  copyRecursiveSync(distDir, clientDistDir);

  console.log('✅ Render build completed successfully!');
  console.log('📂 Public directory contents:');
  console.log(fs.readdirSync(publicDir));
  console.log('📂 Client dist directory contents:');
  console.log(fs.readdirSync(clientDistDir));

  // Check if index.html exists in both locations
  const publicIndexPath = path.join(publicDir, 'index.html');
  const clientIndexPath = path.join(clientDistDir, 'index.html');
  
  console.log('📄 Public index.html exists:', fs.existsSync(publicIndexPath));
  console.log('📄 Client dist index.html exists:', fs.existsSync(clientIndexPath));

} catch (error) {
  console.error('❌ Render build failed:', error.message);
  console.error('Full error:', error);
  process.exit(1);
} 