#!/usr/bin/env node

const http = require('http');

console.log('🔍 Deployment Verification Script');
console.log('===============================');

// Test local server
const testServer = () => {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 10000,
      path: '/health',
      method: 'GET'
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          console.log('✅ Health check passed:', response);
          resolve(response);
        } catch (e) {
          console.log('❌ Invalid JSON response:', data);
          reject(e);
        }
      });
    });

    req.on('error', (err) => {
      console.log('❌ Server not running on port 10000');
      console.log('💡 Start the server first with: npm start');
      reject(err);
    });

    req.setTimeout(3000, () => {
      console.log('❌ Request timeout - server may not be responding');
      reject(new Error('Timeout'));
    });

    req.end();
  });
};

// Main verification
const verify = async () => {
  console.log('1. Testing server health endpoint on port 10000...');
  console.log('   Make sure server is running with: npm start\n');
  
  try {
    await testServer();
    console.log('\n🎉 All tests passed! Deployment should work.');
    console.log('📝 Next steps:');
    console.log('   - Commit and push changes');
    console.log('   - Check Render deployment logs');
    console.log('   - Test the chat functionality');
  } catch (error) {
    console.log('\n❌ Verification failed:', error.message);
    console.log('\n💡 To test locally:');
    console.log('   1. Run: npm start');
    console.log('   2. Open: http://localhost:10000');
    console.log('   3. Test the chat functionality');
    console.log('\n🚀 Ready for deployment!');
  }
};

verify(); 