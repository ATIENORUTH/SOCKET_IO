const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🧪 Testing build process...');
console.log('Current directory:', process.cwd());
console.log('Available files:', fs.readdirSync('.'));

try {
  // Test 1: Check if client directory exists
  console.log('\n📁 Checking client directory...');
  const clientPath = path.join(process.cwd(), 'client');
  console.log('Client path:', clientPath);
  console.log('Client exists:', fs.existsSync(clientPath));
  
  if (fs.existsSync(clientPath)) {
    console.log('Client files:', fs.readdirSync(clientPath));
  }

  // Test 2: Try to install client dependencies
  console.log('\n📦 Installing client dependencies...');
  execSync('cd client && npm install', { stdio: 'inherit' });

  // Test 3: Try to build client
  console.log('\n🔨 Building client...');
  execSync('cd client && npm run build', { stdio: 'inherit' });

  // Test 4: Check if dist was created
  console.log('\n📁 Checking build output...');
  const distPath = path.join(clientPath, 'dist');
  console.log('Dist path:', distPath);
  console.log('Dist exists:', fs.existsSync(distPath));
  
  if (fs.existsSync(distPath)) {
    console.log('Dist files:', fs.readdirSync(distPath));
    const indexPath = path.join(distPath, 'index.html');
    console.log('Index.html exists:', fs.existsSync(indexPath));
  }

  // Test 5: Try to copy to public
  console.log('\n📋 Copying to public...');
  const publicPath = path.join(process.cwd(), 'public');
  if (!fs.existsSync(publicPath)) {
    fs.mkdirSync(publicPath, { recursive: true });
  }
  
  if (fs.existsSync(distPath)) {
    execSync(`cp -r "${distPath}"/* "${publicPath}"`, { stdio: 'inherit' });
    console.log('Public files:', fs.readdirSync(publicPath));
  }

  console.log('\n✅ Build test completed successfully!');

} catch (error) {
  console.error('\n❌ Build test failed:', error.message);
  process.exit(1);
} 