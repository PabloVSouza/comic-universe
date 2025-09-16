#!/usr/bin/env node

const { execSync } = require('child_process')
const path = require('path')
const fs = require('fs')

module.exports = async function(context) {
  console.log('🔧 [BEFORE BUILD] Rebuilding better-sqlite3 for Electron...')
  console.log('🔧 [BEFORE BUILD] Platform:', process.platform)
  console.log('🔧 [BEFORE BUILD] Working directory:', process.cwd())
  
  try {
    // Check if better-sqlite3 exists
    const sqlite3Path = path.join(process.cwd(), 'node_modules', 'better-sqlite3')
    if (!fs.existsSync(sqlite3Path)) {
      console.log('⚠️  better-sqlite3 not found, skipping rebuild')
      return
    }

    console.log('🔧 [BEFORE BUILD] Found better-sqlite3 at:', sqlite3Path)

    // Get Electron version from context or package.json
    const electronVersion = context?.electronVersion || getElectronVersion()
    console.log('🔧 [BEFORE BUILD] Electron version:', electronVersion)

    // Set environment variables for Electron rebuild
    const targetArch = getTargetArch(process.platform, context)
    const env = {
      ...process.env,
      npm_config_target: electronVersion,
      npm_config_arch: targetArch,
      npm_config_target_arch: targetArch,
      npm_config_disturl: 'https://electronjs.org/headers',
      npm_config_runtime: 'electron',
      npm_config_cache: path.join(process.cwd(), '.electron-gyp'),
      npm_config_build_from_source: 'true'
    }

    console.log('🔧 [BEFORE BUILD] Rebuilding better-sqlite3 with npm rebuild...')
    
    // Try to rebuild better-sqlite3 specifically
    try {
      execSync('npm rebuild better-sqlite3', { 
        stdio: 'inherit', 
        env,
        cwd: process.cwd()
      })
      console.log('✅ [BEFORE BUILD] better-sqlite3 rebuilt successfully with npm rebuild')
    } catch (npmError) {
      console.log('⚠️  npm rebuild failed, trying electron-rebuild...')
      
      // Fallback to electron-rebuild if available
      try {
        execSync('npx electron-rebuild -f -w better-sqlite3', { 
          stdio: 'inherit',
          env,
          cwd: process.cwd()
        })
        console.log('✅ [BEFORE BUILD] better-sqlite3 rebuilt successfully with electron-rebuild')
      } catch (electronRebuildError) {
        console.log('⚠️  electron-rebuild failed, trying direct node-gyp rebuild...')
        
        // Last resort: direct node-gyp rebuild in the better-sqlite3 directory
        try {
          execSync('node-gyp rebuild', {
            stdio: 'inherit',
            env,
            cwd: sqlite3Path
          })
          console.log('✅ [BEFORE BUILD] better-sqlite3 rebuilt successfully with node-gyp')
        } catch (gypError) {
          console.log('❌ [BEFORE BUILD] All rebuild methods failed')
          console.log('⚠️  Continuing build - app may have database issues')
          console.log('💡 Try running: npm run rebuild locally')
        }
      }
    }

  } catch (error) {
    console.error('❌ [BEFORE BUILD] Error rebuilding better-sqlite3:', error.message)
    console.log('⚠️  Continuing build without rebuild - app may have database issues')
  }
}

function getTargetArch(platform, context) {
  if (platform === 'win32') {
    return 'x64'
  } else if (platform === 'darwin') {
    // For macOS, check if we're building universal or specific arch
    const arch = context?.arch || process.arch
    if (arch === 'universal') {
      // For universal builds, we need to rebuild for both architectures
      // But since we can't do that in one go, we'll rebuild for the current arch
      return process.arch === 'arm64' ? 'arm64' : 'x64'
    }
    return arch
  } else {
    return process.arch
  }
}

function getElectronVersion() {
  try {
    const packageJson = require(path.join(process.cwd(), 'package.json'))
    const electronVersion = packageJson.devDependencies?.electron || packageJson.dependencies?.electron
    if (electronVersion) {
      // Remove ^ or ~ from version
      return electronVersion.replace(/^[\^~]/, '')
    }
  } catch (error) {
    console.log('⚠️  Could not determine Electron version, using default')
  }
  return '38.0.0' // Fallback version
}

// Support both module.exports and direct execution
if (require.main === module) {
  module.exports({})
    .then(() => process.exit(0))
    .catch(err => {
      console.error(err)
      process.exit(1)
    })
}
