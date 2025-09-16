#!/usr/bin/env node

const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')

console.log('🔧 Rebuilding native modules for Electron...')

try {
  // Check if we're in a CI environment
  if (process.env.CI || process.env.GITHUB_ACTIONS) {
    console.log('⚠️  Skipping native module rebuild in CI environment')
    console.log('💡 Run this script locally to rebuild native modules')
    process.exit(0)
  }

  // Check if electron-builder is available
  try {
    execSync('electron-builder --version', { stdio: 'pipe' })
  } catch (error) {
    console.error('❌ electron-builder not found. Please install it first:')
    console.error('   npm install --save-dev electron-builder')
    process.exit(1)
  }

  console.log('🔧 Running electron-builder install-app-deps...')
  execSync('electron-builder install-app-deps', { stdio: 'inherit' })

  console.log('✅ Native modules rebuilt successfully!')
  console.log('💡 You can now build the application with proper native module support')

} catch (error) {
  console.error('❌ Failed to rebuild native modules:', error.message)
  console.error('💡 Try running: npm install && npm run rebuild')
  process.exit(1)
}
