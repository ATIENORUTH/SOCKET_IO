const fs = require('fs');
const path = require('path');

const clientBuildPath = path.join(__dirname, 'client/dist');
const indexHtmlPath = path.join(clientBuildPath, 'index.html');

console.log('🔍 Verifying build...');
console.log('Client build path:', clientBuildPath);
console.log('Index HTML path:', indexHtmlPath);
console.log('Client build exists:', fs.existsSync(clientBuildPath));
console.log('Index HTML exists:', fs.existsSync(indexHtmlPath));

if (fs.existsSync(clientBuildPath)) {
  console.log('✅ Client build found!');
  console.log('Contents:', fs.readdirSync(clientBuildPath));
} else {
  console.log('❌ Client build not found!');
  console.log('Available directories:', fs.readdirSync(__dirname));
  process.exit(1);
}

console.log('🎉 Build verification completed!'); 