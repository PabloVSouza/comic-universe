#!/usr/bin/env node

const path = require('path')
const fs = require('fs')
const { execSync } = require('child_process')

console.log('🔧 Embedding icon into Windows executable...')

// Check if this is being called as an afterPack hook or standalone script
const isAfterPackHook = process.argv.length > 2 && (process.argv[2] === '--context' || process.argv[2] === '--context-file')

let executablePath
let winUnpackedDir

if (isAfterPackHook) {
  // Called as afterPack hook - get paths from context
  let context
  if (process.argv[2] === '--context-file') {
    // Read context from file
    const contextFile = process.argv[3]
    const contextData = fs.readFileSync(contextFile, 'utf8')
    context = JSON.parse(contextData)
  } else {
    // Read context from command line argument
    context = JSON.parse(process.argv[3])
  }
  winUnpackedDir = context.appOutDir
  // Try multiple possible executable names
  const possibleExecutables = ['comic-universe.exe', 'electron.exe', 'Comic Universe.exe']
  let executablePath = null
  
  for (const exeName of possibleExecutables) {
    const testPath = path.join(winUnpackedDir, exeName)
    if (fs.existsSync(testPath)) {
      executablePath = testPath
      console.log('✅ Found executable:', exeName)
      break
    }
  }
  
  if (!executablePath) {
    executablePath = path.join(winUnpackedDir, 'electron.exe') // Default fallback
  }
  
  console.log('📁 Using afterPack context:', winUnpackedDir)
  console.log('🎯 Target executable:', executablePath)
} else {
  // Called as standalone script - use original logic
  const distDir = path.join(__dirname, '..', 'dist')
  winUnpackedDir = path.join(distDir, 'win-unpacked')
  
  if (!fs.existsSync(winUnpackedDir)) {
    console.log('❌ Windows unpacked directory not found. Build the Windows version first.')
    process.exit(0)
  }
  
  executablePath = path.join(winUnpackedDir, 'comic-universe.exe')
}

if (!fs.existsSync(executablePath)) {
  console.log('❌ Executable file not found at:', executablePath)
  if (isAfterPackHook) {
    console.log('⚠️  Continuing build process - this is not a critical failure')
    return
  } else {
    process.exit(0)
  }
}

// Icon file path - try multiple options
const iconPaths = [
  path.join(__dirname, '..', 'build', 'icon.ico'),
  path.join(__dirname, '..', 'build', 'icon-256.png'),
  path.join(__dirname, '..', 'build', 'icons', 'icon.ico')
]

let iconPath = null
for (const testPath of iconPaths) {
  if (fs.existsSync(testPath)) {
    iconPath = testPath
    break
  }
}

if (!iconPath) {
  console.log('❌ No icon file found. Tried:', iconPaths)
  process.exit(0)
}

console.log('📁 Executable:', executablePath)
console.log('🎨 Icon:', iconPath)

try {
  // Try to use rcedit to embed the icon and set app metadata
  const rceditCommands = [
    `npx rcedit "${executablePath}" --set-icon "${iconPath}" --set-version-string "ProductName" "Comic Universe" --set-version-string "FileDescription" "Comic Universe" --set-version-string "CompanyName" "PabloVSouza" --set-version-string "LegalCopyright" "© 2025 PabloVSouza" --set-version-string "OriginalFilename" "comic-universe.exe"`,
    `rcedit "${executablePath}" --set-icon "${iconPath}" --set-version-string "ProductName" "Comic Universe" --set-version-string "FileDescription" "Comic Universe" --set-version-string "CompanyName" "PabloVSouza" --set-version-string "LegalCopyright" "© 2025 PabloVSouza" --set-version-string "OriginalFilename" "comic-universe.exe"`,
    `node_modules/.bin/rcedit "${executablePath}" --set-icon "${iconPath}" --set-version-string "ProductName" "Comic Universe" --set-version-string "FileDescription" "Comic Universe" --set-version-string "CompanyName" "PabloVSouza" --set-version-string "LegalCopyright" "© 2025 PabloVSouza" --set-version-string "OriginalFilename" "comic-universe.exe"`,
    `"${path.join(__dirname, '..', 'node_modules', 'rcedit', 'bin', 'rcedit.exe')}" "${executablePath}" --set-icon "${iconPath}" --set-version-string "ProductName" "Comic Universe" --set-version-string "FileDescription" "Comic Universe" --set-version-string "CompanyName" "PabloVSouza" --set-version-string "LegalCopyright" "© 2025 PabloVSouza" --set-version-string "OriginalFilename" "comic-universe.exe"`,
    `"${path.join(__dirname, '..', 'node_modules', 'rcedit', 'bin', 'rcedit-x64.exe')}" "${executablePath}" --set-icon "${iconPath}" --set-version-string "ProductName" "Comic Universe" --set-version-string "FileDescription" "Comic Universe" --set-version-string "CompanyName" "PabloVSouza" --set-version-string "LegalCopyright" "© 2025 PabloVSouza" --set-version-string "OriginalFilename" "comic-universe.exe"`
  ]

  let success = false
  for (const command of rceditCommands) {
    try {
      console.log('🔧 Trying:', command)
      execSync(command, { stdio: 'inherit' })
      console.log('✅ Icon and metadata embedded successfully!')

      // Try to verify the changes by running rcedit with --get-version-string
      try {
        // Extract the rcedit executable path and target executable from the successful command
        const parts = command.split('"')
        const rceditPath = parts[1] // The rcedit executable path
        const targetExe = parts[3] // The target executable path

        const verifyCommand = `"${rceditPath}" "${targetExe}" --get-version-string "ProductName"`
        console.log('🔍 Verifying metadata...')
        const result = execSync(verifyCommand, { encoding: 'utf8' })
        console.log('📋 ProductName:', result.trim())
      } catch (verifyError) {
        console.log('⚠️  Could not verify metadata:', verifyError.message)
      }

      success = true
      break
    } catch (cmdError) {
      console.log('⚠️  Command failed:', cmdError.message)
      continue
    }
  }

  if (!success) {
    console.log('❌ All rcedit approaches failed')
    console.log('💡 The executable icon might already be embedded correctly')
    console.log('💡 Or you may need to install rcedit: npm install -g rcedit')
    console.log('⚠️  Continuing build process - this is not a critical failure')
  }
} catch (error) {
  console.log('❌ Unexpected error:', error.message)
  console.log('⚠️  Continuing build process - this is not a critical failure')
}

console.log('✅ Icon embedding process completed')

// Note: We don't modify the installer file with rcedit because:
// 1. NSIS installers have a specific internal structure
// 2. rcedit corrupts the installer integrity
// 3. The installer icon is already set via electron-builder configuration
// 4. The important part is that the installed app has the correct icon
//
// If you see "NSIS Error: Installer integrity check has failed" after running this script,
// it means the installer was corrupted by rcedit. You need to rebuild the installer:
// npm run build:win

// If called as afterPack hook, don't exit the process
if (!isAfterPackHook) {
  process.exit(0)
}
