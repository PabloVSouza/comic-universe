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
  // Try to use rcedit to embed the icon and set app metadata
  const rceditCommands = [
    `npx rcedit "${executablePath}" --set-icon "${iconPath}" --set-version-string "ProductName" "Comic Universe" --set-version-string "FileDescription" "Comic Universe" --set-version-string "CompanyName" "PabloVSouza" --set-version-string "LegalCopyright" "© 2025 PabloVSouza" --set-version-string "OriginalFilename" "comic-universe.exe"`,
    `rcedit "${executablePath}" --set-icon "${iconPath}" --set-version-string "ProductName" "Comic Universe" --set-version-string "FileDescription" "Comic Universe" --set-version-string "CompanyName" "PabloVSouza" --set-version-string "LegalCopyright" "© 2025 PabloVSouza" --set-version-string "OriginalFilename" "comic-universe.exe"`,
    `node_modules/.bin/rcedit "${executablePath}" --set-icon "${iconPath}" --set-version-string "ProductName" "Comic Universe" --set-version-string "FileDescription" "Comic Universe" --set-version-string "CompanyName" "PabloVSouza" --set-version-string "LegalCopyright" "© 2025 PabloVSouza" --set-version-string "OriginalFilename" "comic-universe.exe"`,
    `"${path.join(__dirname, '..', 'node_modules', 'rcedit', 'bin', 'rcedit.exe')}" "${executablePath}" --set-icon "${iconPath}" --set-version-string "ProductName" "Comic Universe" --set-version-string "FileDescription" "Comic Universe" --set-version-string "CompanyName" "PabloVSouza" --set-version-string "LegalCopyright" "© 2025 PabloVSouza" --set-version-string "OriginalFilename" "comic-universe.exe"`,
    `"${path.join(__dirname, '..', 'node_modules', 'rcedit', 'bin', 'rcedit-x64.exe')}" "${executablePath}" --set-icon "${iconPath}" --set-version-string "ProductName" "Comic Universe" --set-version-string "FileDescription" "Comic Universe" --set-version-string "CompanyName" "PabloVSouza" --set-version-string "LegalCopyright" "© 2025 PabloVSouza" --set-version-string "OriginalFilename" "comic-universe.exe"`
  ];

  let success = false;
  for (const command of rceditCommands) {
    try {
      console.log('🔧 Trying:', command);
      execSync(command, { stdio: 'inherit' });
      console.log('✅ Icon and metadata embedded successfully!');
      
      // Try to verify the changes by running rcedit with --get-version-string
      try {
        const verifyCommand = command.replace('--set-icon', '').replace('--set-version-string "ProductName" "Comic Universe"', '--get-version-string "ProductName"').replace('--set-version-string "FileDescription" "Comic Universe"', '').replace('--set-version-string "CompanyName" "PabloVSouza"', '').replace('--set-version-string "LegalCopyright" "© 2025 PabloVSouza"', '').replace('--set-version-string "OriginalFilename" "comic-universe.exe"', '');
        console.log('🔍 Verifying metadata...');
        const result = execSync(verifyCommand, { encoding: 'utf8' });
        console.log('📋 ProductName:', result.trim());
      } catch (verifyError) {
        console.log('⚠️  Could not verify metadata:', verifyError.message);
      }
      
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
    console.log('⚠️  Continuing build process - this is not a critical failure');
  }

} catch (error) {
  console.log('❌ Unexpected error:', error.message);
  console.log('⚠️  Continuing build process - this is not a critical failure');
}

console.log('✅ Icon embedding process completed');
