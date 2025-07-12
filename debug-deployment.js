#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔍 Debugging Deployment Issues...\n');

// Check if we can access the deployed URL
console.log('📋 Quick Checks:');
console.log('1. Go to your Render dashboard');
console.log('2. Click on your socket-io-chat service');
console.log('3. Check the "Logs" tab for any errors');
console.log('4. Look for the "Events" tab to see build status');

console.log('\n🎯 Common Issues:');
console.log('- Build failed: Check build logs');
console.log('- Port issues: Render uses different ports');
console.log('- Dependencies missing: Check package.json');
console.log('- Client build failed: Check client/dist exists');

console.log('\n🔧 Manual Test:');
console.log('1. Try visiting: https://your-app-name.onrender.com/health');
console.log('2. This should return a JSON response');
console.log('3. If it works, the server is running');

console.log('\n📞 Your Render URL should be visible in:');
console.log('- Render dashboard → socket-io-chat service → URL field');

console.log('\n🚨 If still loading after 20 minutes:');
console.log('- Check Render logs for errors');
console.log('- Verify the service is actually "Live" not "Building"');
console.log('- Try refreshing the page');
console.log('- Check if the URL is correct');

console.log('\n💡 Quick Fix:');
console.log('1. Go to Render dashboard');
console.log('2. Find your service');
console.log('3. Click "Manual Deploy"');
console.log('4. Wait 5-10 minutes');
console.log('5. Check the new URL'); 