const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Pre-build script starting...');
console.log('Current directory:', process.cwd());
console.log('Node version:', process.version);

try {
  // Check if we're in the right directory
  const clientPath = path.join(process.cwd(), 'client');
  const clientExists = fs.existsSync(clientPath);
  console.log('Client directory exists:', clientExists);
  
  if (!clientExists) {
    console.log('❌ Client directory not found!');
    console.log('Available directories:', fs.readdirSync('.'));
    process.exit(1);
  }

  // Install client dependencies
  console.log('📦 Installing client dependencies...');
  execSync('cd client && npm install', { 
    stdio: 'inherit',
    timeout: 120000 // 2 minute timeout
  });

  // Build client
  console.log('🔨 Building client...');
  execSync('cd client && npm run build', { 
    stdio: 'inherit',
    timeout: 120000 // 2 minute timeout
  });

  // Verify build
  console.log('✅ Verifying build...');
  const distPath = path.join(clientPath, 'dist');
  const indexHtmlPath = path.join(distPath, 'index.html');
  
  console.log('Dist path:', distPath);
  console.log('Index HTML path:', indexHtmlPath);
  
  if (fs.existsSync(distPath) && fs.existsSync(indexHtmlPath)) {
    console.log('✅ Build successful!');
    console.log('Build contents:');
    const files = fs.readdirSync(distPath);
    files.forEach(file => {
      const filePath = path.join(distPath, file);
      const stats = fs.statSync(filePath);
      console.log(`  ${file} (${stats.isDirectory() ? 'dir' : stats.size + ' bytes'})`);
    });
  } else {
    console.log('❌ Build failed!');
    console.log('Dist exists:', fs.existsSync(distPath));
    console.log('Index HTML exists:', fs.existsSync(indexHtmlPath));
    console.log('Client directory contents:');
    const files = fs.readdirSync(clientPath);
    files.forEach(file => console.log(`  ${file}`));
    process.exit(1);
  }

  console.log('🎉 Pre-build completed successfully!');
} catch (error) {
  console.error('❌ Pre-build failed:', error.message);
  process.exit(1);
} 