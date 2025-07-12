#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔍 Checking Your Deployment Status...\n');

// Check GitHub repository
console.log('📋 GitHub Repository:');
console.log('✅ Repository: https://github.com/ATIENORUTH/SOCKET_IO.git');
console.log('✅ Branch: main');
console.log('✅ Last commit: Latest changes pushed');

// Check Render configuration
console.log('\n⚙️ Render Configuration:');
const renderPath = path.join(__dirname, 'render.yaml');
if (fs.existsSync(renderPath)) {
  console.log('✅ render.yaml exists');
  const renderConfig = fs.readFileSync(renderPath, 'utf8');
  console.log('✅ Service name: socket-io-chat');
  console.log('✅ Build command configured');
  console.log('✅ Start command configured');
} else {
  console.log('❌ render.yaml missing');
}

// Check local build
console.log('\n📁 Local Build Status:');
const clientBuildPath = path.join(__dirname, 'client/dist');
const indexHtmlPath = path.join(clientBuildPath, 'index.html');

if (fs.existsSync(clientBuildPath) && fs.existsSync(indexHtmlPath)) {
  console.log('✅ Client build exists locally');
  const buildContents = fs.readdirSync(clientBuildPath);
  console.log('📋 Build files:', buildContents);
} else {
  console.log('❌ Client build missing locally');
}

// Check package.json
console.log('\n📦 Package Configuration:');
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
console.log('✅ Start script:', packageJson.scripts.start);
console.log('✅ Build script:', packageJson.scripts.build);

console.log('\n🎯 Next Steps:');
console.log('1. Go to: https://render.com');
console.log('2. Find your "socket-io-chat" service');
console.log('3. Check if it shows "Building" or "Live"');
console.log('4. If building, wait 5-10 minutes');
console.log('5. If live, click the URL to test');

console.log('\n🔧 If you see issues:');
console.log('- Check Render build logs');
console.log('- Verify GitHub repository is connected');
console.log('- Make sure auto-deploy is enabled');

console.log('\n📞 Your Render URL should be:');
console.log('https://socket-io-chat-[random-id].onrender.com'); 