#!/usr/bin/env node

const { execSync } = require('child_process');

console.log('🔧 Building Windows version without code signing...');

// Set environment variables to disable code signing
process.env.CSC_LINK = '';
process.env.CSC_KEY_PASSWORD = '';
process.env.CSC_IDENTITY_AUTO_DISCOVERY = 'false';
process.env.WIN_CSC_LINK = '';
process.env.WIN_CSC_KEY_PASSWORD = '';

try {
  // Run the build command
  execSync('npm run build && electron-builder --win --config', {
    stdio: 'inherit',
    env: {
      ...process.env,
      CSC_LINK: '',
      CSC_KEY_PASSWORD: '',
      CSC_IDENTITY_AUTO_DISCOVERY: 'false',
      WIN_CSC_LINK: '',
      WIN_CSC_KEY_PASSWORD: ''
    }
  });
  
  console.log('✅ Build completed successfully!');
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}
