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

  console.log('🎉 Build and deployment preparation completed successfully!');
  console.log('📤 Ready for deployment to Render');
  
} catch (error) {
  console.error('❌ Build and deployment preparation failed:', error.message);
  process.exit(1);
} 