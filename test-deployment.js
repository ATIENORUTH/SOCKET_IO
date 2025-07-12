#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🧪 Testing Deployment Readiness...\n');

// Test 1: Check if client build exists
console.log('📁 Test 1: Client Build');
const clientBuildPath = path.join(__dirname, 'client/dist');
const indexHtmlPath = path.join(clientBuildPath, 'index.html');

if (fs.existsSync(clientBuildPath) && fs.existsSync(indexHtmlPath)) {
  console.log('✅ Client build exists');
  const buildContents = fs.readdirSync(clientBuildPath);
  console.log('📋 Build contents:', buildContents);
} else {
  console.log('❌ Client build missing');
  process.exit(1);
}

// Test 2: Check package.json scripts
console.log('\n📦 Test 2: Package.json Scripts');
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const requiredScripts = ['start', 'build'];
const missingScripts = requiredScripts.filter(script => !packageJson.scripts[script]);

if (missingScripts.length === 0) {
  console.log('✅ All required scripts present');
} else {
  console.log('❌ Missing scripts:', missingScripts);
  process.exit(1);
}

// Test 3: Check server configuration
console.log('\n🖥️ Test 3: Server Configuration');
const serverPath = path.join(__dirname, 'server/server.js');
if (fs.existsSync(serverPath)) {
  console.log('✅ Server file exists');
} else {
  console.log('❌ Server file missing');
  process.exit(1);
}

// Test 4: Check render.yaml
console.log('\n⚙️ Test 4: Render Configuration');
const renderPath = path.join(__dirname, 'render.yaml');
if (fs.existsSync(renderPath)) {
  console.log('✅ Render configuration exists');
} else {
  console.log('❌ Render configuration missing');
  process.exit(1);
}

// Test 5: Check dependencies
console.log('\n📚 Test 5: Dependencies');
const clientPackageJson = JSON.parse(fs.readFileSync('client/package.json', 'utf8'));
const requiredDeps = ['react', 'react-dom', 'socket.io-client'];
const missingDeps = requiredDeps.filter(dep => !clientPackageJson.dependencies[dep]);

if (missingDeps.length === 0) {
  console.log('✅ All required dependencies present');
} else {
  console.log('❌ Missing dependencies:', missingDeps);
  process.exit(1);
}

console.log('\n🎉 All tests passed! Your app is ready for deployment!');
console.log('\n📋 Next Steps:');
console.log('1. Push to GitHub: git push origin main');
console.log('2. Check Render dashboard for deployment');
console.log('3. Test your deployed app'); 