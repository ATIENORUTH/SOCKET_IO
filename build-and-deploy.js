const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Starting comprehensive build and deployment preparation...');

function runCommand(command, cwd = process.cwd()) {
  try {
    console.log(`📋 Running: ${command}`);
    execSync(command, { 
      cwd, 
      stdio: 'inherit',
      env: { ...process.env, NODE_ENV: 'production' }
    });
    return true;
  } catch (error) {
    console.error(`❌ Command failed: ${command}`);
    console.error(error.message);
    return false;
  }
}

try {
  // Step 1: Install root dependencies
  console.log('📦 Installing root dependencies...');
  if (!runCommand('npm install --production=false')) {
    throw new Error('Failed to install root dependencies');
  }

  // Step 2: Install client dependencies
  console.log('📦 Installing client dependencies...');
  if (!runCommand('npm install --production=false', path.join(process.cwd(), 'client'))) {
    throw new Error('Failed to install client dependencies');
  }

  // Step 3: Build client
  console.log('🔨 Building client...');
  if (!runCommand('npm run build', path.join(process.cwd(), 'client'))) {
    throw new Error('Failed to build client');
  }

  // Step 4: Run the main build process
  console.log('🔨 Running main build process...');
  if (!runCommand('npm run build')) {
    throw new Error('Failed to run main build process');
  }

  // Step 5: Verify build output
  console.log('✅ Verifying build output...');
  const publicPath = path.join(process.cwd(), 'public');
  const indexHtmlPath = path.join(publicPath, 'index.html');
  
  if (!fs.existsSync(publicPath)) {
    throw new Error('Public directory not found after build');
  }
  
  if (!fs.existsSync(indexHtmlPath)) {
    throw new Error('index.html not found in public directory');
  }

  console.log('📁 Build output verified:');
  console.log('- Public directory exists:', fs.existsSync(publicPath));
  console.log('- index.html exists:', fs.existsSync(indexHtmlPath));
  
  const publicContents = fs.readdirSync(publicPath);
  console.log('- Public contents:', publicContents);
  
  // Additional verification for Render deployment
  console.log('🔍 Render deployment verification:');
  console.log('- Current working directory:', process.cwd());
  console.log('- Public path absolute:', path.resolve(publicPath));
  console.log('- Index HTML absolute path:', path.resolve(indexHtmlPath));
  
  // List all files in public directory recursively
  function listFilesRecursively(dir, prefix = '') {
    const items = fs.readdirSync(dir);
    items.forEach(item => {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      if (stat.isDirectory()) {
        console.log(`${prefix}📁 ${item}/`);
        listFilesRecursively(fullPath, prefix + '  ');
      } else {
        console.log(`${prefix}📄 ${item}`);
      }
    });
  }
  
  console.log('📂 Public directory structure:');
  listFilesRecursively(publicPath);

  console.log('🎉 Build and deployment preparation completed successfully!');
  console.log('📤 Ready for deployment to Render');
  
} catch (error) {
  console.error('❌ Build and deployment preparation failed:', error.message);
  process.exit(1);
} 