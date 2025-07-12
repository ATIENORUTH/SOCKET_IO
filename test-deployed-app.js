#!/usr/bin/env node

const https = require('https');

console.log('🧪 Testing Deployed App...\n');

const deployedUrl = 'https://socket-io-4-no7f.onrender.com';

console.log('📋 Testing URL:', deployedUrl);

// Test 1: Health endpoint
console.log('\n🔍 Test 1: Health Endpoint');
const healthUrl = `${deployedUrl}/health`;

https.get(healthUrl, (res) => {
  console.log('✅ Health endpoint status:', res.statusCode);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('📄 Health response:', data);
    
    // Test 2: Main app
    console.log('\n🔍 Test 2: Main App');
    https.get(deployedUrl, (res2) => {
      console.log('✅ Main app status:', res2.statusCode);
      console.log('📄 Content-Type:', res2.headers['content-type']);
      
      let data2 = '';
      res2.on('data', (chunk) => {
        data2 += chunk;
      });
      
      res2.on('end', () => {
        if (data2.includes('Socket.IO Chat')) {
          console.log('✅ App is loading correctly!');
        } else if (data2.includes('Server is running')) {
          console.log('⚠️ Server is running but client build might be missing');
        } else {
          console.log('❌ Unexpected response');
          console.log('📄 Response preview:', data2.substring(0, 200));
        }
        
        console.log('\n🎯 Next Steps:');
        console.log('1. Open:', deployedUrl);
        console.log('2. Wait 30 seconds for full load');
        console.log('3. You should see the chat interface');
      });
    }).on('error', (err) => {
      console.log('❌ Main app error:', err.message);
    });
  });
}).on('error', (err) => {
  console.log('❌ Health endpoint error:', err.message);
  console.log('\n🚨 Possible issues:');
  console.log('- App is still building');
  console.log('- Server crashed');
  console.log('- Network issues');
}); 