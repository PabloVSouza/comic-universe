const { execSync } = require('child_process');
const path = require('path');

module.exports = async (context) => {
  console.log('🔧 Running hook to embed Windows icon...');
  console.log('📋 Hook context:', {
    platform: context.electronPlatformName,
    appOutDir: context.appOutDir,
    outDir: context.outDir
  });
  
  if (context.electronPlatformName === 'win32') {
    try {
      const scriptPath = path.join(__dirname, 'embed-executable-icon.js');
      console.log('🔧 Calling icon embedding script:', scriptPath);
      // Write context to a temporary file to avoid command line escaping issues
      const fs = require('fs');
      const contextData = {
        electronPlatformName: context.electronPlatformName,
        appOutDir: context.appOutDir,
        outDir: context.outDir
      };
      const tempFile = path.join(__dirname, 'temp-context.json');
      fs.writeFileSync(tempFile, JSON.stringify(contextData));
      execSync(`node "${scriptPath}" --context-file "${tempFile}"`, { stdio: 'inherit' });
      // Clean up the temporary file
      try {
        fs.unlinkSync(tempFile);
      } catch (e) {
        // Ignore cleanup errors
      }
      console.log('✅ Windows icon embedding completed');
    } catch (error) {
      console.log('⚠️  Windows icon embedding failed:', error.message);
      console.log('⚠️  Continuing build process - this is not a critical failure');
    }
  } else {
    console.log('⏭️  Skipping icon embedding for platform:', context.electronPlatformName);
  }
};
