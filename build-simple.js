#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Simple Build Process Starting...\n');

try {
  // Install dependencies
  console.log('📦 Installing dependencies...');
  execSync('npm install', { stdio: 'inherit' });
  
  // Install client dependencies
  console.log('📦 Installing client dependencies...');
  execSync('cd client && npm install', { stdio: 'inherit' });
  
  // Simple build command
  console.log('🔨 Building client...');
  execSync('cd client && npx vite build', { stdio: 'inherit' });
  
  console.log('✅ Build completed!');
  
} catch (error) {
  console.error('❌ Build error:', error.message);
  process.exit(1);
} 