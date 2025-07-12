const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Starting client build process...');

try {
  // Install client dependencies
  console.log('📦 Installing client dependencies...');
  execSync('cd client && npm install', { stdio: 'inherit' });
  
  // Build client
  console.log('🔨 Building client...');
  execSync('cd client && npm run build', { stdio: 'inherit' });
  
  // Verify build
  const clientBuildPath = path.join(__dirname, 'client/dist');
  const indexHtmlPath = path.join(clientBuildPath, 'index.html');
  
  if (fs.existsSync(clientBuildPath) && fs.existsSync(indexHtmlPath)) {
    console.log('✅ Client build successful!');
    console.log('📁 Build contents:', fs.readdirSync(clientBuildPath));
  } else {
    console.log('❌ Client build failed!');
    process.exit(1);
  }
  
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
} 