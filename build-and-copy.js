const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Building client and copying to public folder...');
console.log('Current directory:', process.cwd());

try {
  // Check if client directory exists
  const clientPath = path.join(process.cwd(), 'client');
  const publicPath = path.join(process.cwd(), 'public');
  
  console.log('Client path:', clientPath);
  console.log('Public path:', publicPath);
  
  if (!fs.existsSync(clientPath)) {
    console.log('❌ Client directory not found!');
    process.exit(1);
  }

  // Install client dependencies
  console.log('📦 Installing client dependencies...');
  execSync('cd client && npm install', { 
    stdio: 'inherit',
    timeout: 120000
  });

  // Build client
  console.log('🔨 Building client...');
  execSync('cd client && npm run build', { 
    stdio: 'inherit',
    timeout: 120000
  });

  // Create public directory
  if (!fs.existsSync(publicPath)) {
    fs.mkdirSync(publicPath, { recursive: true });
    console.log('Created public directory');
  }

  // Copy files from client/dist to public
  const distPath = path.join(clientPath, 'dist');
  console.log('Copying files from:', distPath, 'to:', publicPath);

  function copyDirectory(src, dest) {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }

    const items = fs.readdirSync(src);
    items.forEach(item => {
      const srcPath = path.join(src, item);
      const destPath = path.join(dest, item);
      
      if (fs.statSync(srcPath).isDirectory()) {
        copyDirectory(srcPath, destPath);
      } else {
        fs.copyFileSync(srcPath, destPath);
      }
    });
  }

  copyDirectory(distPath, publicPath);
  console.log('✅ Files copied to public folder!');

  // Verify the copy
  console.log('📁 Public folder contents:');
  const publicFiles = fs.readdirSync(publicPath);
  publicFiles.forEach(file => {
    const filePath = path.join(publicPath, file);
    const stats = fs.statSync(filePath);
    console.log(`  ${file} (${stats.isDirectory() ? 'dir' : stats.size + ' bytes'})`);
  });

  // Check if index.html exists in public
  const publicIndexPath = path.join(publicPath, 'index.html');
  if (fs.existsSync(publicIndexPath)) {
    console.log('✅ index.html exists in public folder!');
    console.log('Index HTML content (first 5 lines):');
    const content = fs.readFileSync(publicIndexPath, 'utf8');
    console.log(content.split('\n').slice(0, 5).join('\n'));
  } else {
    console.log('❌ index.html not found in public folder!');
    process.exit(1);
  }

  console.log('🎉 Build and copy completed successfully!');

} catch (error) {
  console.error('❌ Build and copy failed:', error.message);
  process.exit(1);
} 