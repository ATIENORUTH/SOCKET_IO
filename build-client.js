const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Building client for Render...');
console.log('Current directory:', process.cwd());
console.log('Node version:', process.version);
console.log('NPM version:', execSync('npm --version', { encoding: 'utf8' }).trim());

try {
  // Check if client directory exists
  const clientPath = path.join(process.cwd(), 'client');
  console.log('Client path:', clientPath);
  console.log('Client directory exists:', fs.existsSync(clientPath));
  
  if (!fs.existsSync(clientPath)) {
    console.log('❌ Client directory not found!');
    console.log('Available directories:', fs.readdirSync('.'));
    process.exit(1);
  }

  // Check client directory contents
  console.log('Client directory contents:', fs.readdirSync(clientPath));

  // Install client dependencies
  console.log('📦 Installing client dependencies...');
  execSync('cd client && npm install', { 
    stdio: 'inherit',
    timeout: 120000 // 2 minute timeout
  });

  // Check if package.json exists in client
  const clientPackageJson = path.join(clientPath, 'package.json');
  console.log('Client package.json exists:', fs.existsSync(clientPackageJson));

  // Try to build client
  console.log('🔨 Building client...');
  try {
    execSync('cd client && npm run build', { 
      stdio: 'inherit',
      timeout: 120000 // 2 minute timeout
    });
  } catch (buildError) {
    console.log('⚠️ Main build failed, trying fallback build...');
    console.log('Build error:', buildError.message);
    
    // Try fallback build
    try {
      execSync('node create-fallback-build.js', { 
        stdio: 'inherit',
        timeout: 60000 // 1 minute timeout
      });
      console.log('✅ Fallback build successful!');
    } catch (fallbackError) {
      console.log('❌ Fallback build also failed:', fallbackError.message);
      throw fallbackError;
    }
  }

  // Verify build with detailed output
  console.log('✅ Verifying build...');
  const distPath = path.join(clientPath, 'dist');
  const indexHtmlPath = path.join(distPath, 'index.html');
  
  console.log('Dist path:', distPath);
  console.log('Index HTML path:', indexHtmlPath);
  console.log('Dist directory exists:', fs.existsSync(distPath));
  console.log('Index HTML exists:', fs.existsSync(indexHtmlPath));
  
  if (fs.existsSync(distPath)) {
    console.log('Dist directory contents:', fs.readdirSync(distPath));
  }
  
  if (fs.existsSync(indexHtmlPath)) {
    console.log('Index HTML content (first 5 lines):');
    const content = fs.readFileSync(indexHtmlPath, 'utf8');
    console.log(content.split('\n').slice(0, 5).join('\n'));
  }
  
  if (fs.existsSync(distPath) && fs.existsSync(indexHtmlPath)) {
    console.log('✅ Client build successful!');
    console.log('Build location:', distPath);
    
    // Show build contents
    const files = fs.readdirSync(distPath);
    files.forEach(file => {
      const filePath = path.join(distPath, file);
      const stats = fs.statSync(filePath);
      console.log(`  ${file} (${stats.isDirectory() ? 'dir' : stats.size + ' bytes'})`);
    });
  } else {
    console.log('❌ Client build failed!');
    console.log('Dist exists:', fs.existsSync(distPath));
    console.log('Index HTML exists:', fs.existsSync(indexHtmlPath));
    console.log('Client directory contents after build:');
    const files = fs.readdirSync(clientPath);
    files.forEach(file => console.log(`  ${file}`));
    process.exit(1);
  }

} catch (error) {
  console.error('❌ Build failed:', error.message);
  console.error('Error stack:', error.stack);
  process.exit(1);
} 