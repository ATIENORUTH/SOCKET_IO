const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Starting Render build process...');

try {
  // Install root dependencies
  console.log('📦 Installing root dependencies...');
  execSync('npm install', { stdio: 'inherit' });

  // Install client dependencies
  console.log('📦 Installing client dependencies...');
  execSync('cd client && npm install', { stdio: 'inherit' });

  // Build client
  console.log('🔨 Building client...');
  console.log('Current directory:', process.cwd());
  console.log('Node version:', process.version);
  
  // Change to client directory and build
  process.chdir('client');
  console.log('Changed to client directory:', process.cwd());
  
  // Build with explicit output directory
  execSync('npx vite build --outDir dist --mode production', { 
    stdio: 'inherit',
    timeout: 120000 // 2 minute timeout
  });

  // Verify build
  console.log('✅ Verifying build...');
  const distPath = path.join(process.cwd(), 'dist');
  const indexHtmlPath = path.join(distPath, 'index.html');
  
  console.log('Dist path:', distPath);
  console.log('Index HTML path:', indexHtmlPath);
  
  if (fs.existsSync(distPath) && fs.existsSync(indexHtmlPath)) {
    console.log('✅ Build successful!');
    console.log('Build contents:');
    const files = fs.readdirSync(distPath);
    files.forEach(file => {
      const stats = fs.statSync(path.join(distPath, file));
      console.log(`  ${file} (${stats.isDirectory() ? 'dir' : stats.size + ' bytes'})`);
    });
  } else {
    console.log('❌ Build failed!');
    console.log('Dist exists:', fs.existsSync(distPath));
    console.log('Index HTML exists:', fs.existsSync(indexHtmlPath));
    console.log('Current directory contents:');
    const files = fs.readdirSync('.');
    files.forEach(file => console.log(`  ${file}`));
    process.exit(1);
  }

  console.log('🎉 Render build completed!');
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
} 