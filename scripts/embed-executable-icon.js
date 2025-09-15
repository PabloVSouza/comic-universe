#!/usr/bin/env node

const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');

console.log('🔧 Embedding icon into Windows executable...');

// Find the built executable
const distDir = path.join(__dirname, '..', 'dist');
const winUnpackedDir = path.join(distDir, 'win-unpacked');

if (!fs.existsSync(winUnpackedDir)) {
  console.log('❌ Windows unpacked directory not found. Build the Windows version first.');
  process.exit(0);
}

// Find the executable file
const executablePath = path.join(winUnpackedDir, 'comic-universe.exe');
if (!fs.existsSync(executablePath)) {
  console.log('❌ Executable file not found at:', executablePath);
  process.exit(0);
}

// Icon file path - try multiple options
const iconPaths = [
  path.join(__dirname, '..', 'build', 'icon.ico'),
  path.join(__dirname, '..', 'build', 'icon-256.png'),
  path.join(__dirname, '..', 'build', 'icons', 'icon.ico')
];

let iconPath = null;
for (const testPath of iconPaths) {
  if (fs.existsSync(testPath)) {
    iconPath = testPath;
    break;
  }
}

if (!iconPath) {
  console.log('❌ No icon file found. Tried:', iconPaths);
  process.exit(0);
}

console.log('📁 Executable:', executablePath);
console.log('🎨 Icon:', iconPath);

try {
  // Try to use rcedit to embed the icon
  const rceditCommands = [
    `npx rcedit "${executablePath}" --set-icon "${iconPath}"`,
    `rcedit "${executablePath}" --set-icon "${iconPath}"`,
    `node_modules/.bin/rcedit "${executablePath}" --set-icon "${iconPath}"`,
    `"${path.join(__dirname, '..', 'node_modules', 'rcedit', 'bin', 'rcedit.exe')}" "${executablePath}" --set-icon "${iconPath}"`,
    `"${path.join(__dirname, '..', 'node_modules', 'rcedit', 'bin', 'rcedit-x64.exe')}" "${executablePath}" --set-icon "${iconPath}"`
  ];

  let success = false;
  for (const command of rceditCommands) {
    try {
      console.log('🔧 Trying:', command);
      execSync(command, { stdio: 'inherit' });
      console.log('✅ Icon embedded successfully!');
      success = true;
      break;
    } catch (cmdError) {
      console.log('⚠️  Command failed:', cmdError.message);
      continue;
    }
  }

  if (!success) {
    console.log('❌ All rcedit approaches failed');
    console.log('💡 The executable icon might already be embedded correctly');
    console.log('💡 Or you may need to install rcedit: npm install -g rcedit');
  }

} catch (error) {
  console.log('❌ Unexpected error:', error.message);
}

console.log('✅ Icon embedding process completed');
