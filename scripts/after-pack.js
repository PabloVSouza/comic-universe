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
      // Pass only the specific properties we need to avoid circular reference issues
      const contextData = {
        electronPlatformName: context.electronPlatformName,
        appOutDir: context.appOutDir,
        outDir: context.outDir
      };
      execSync(`node "${scriptPath}" --context '${JSON.stringify(contextData)}'`, { stdio: 'inherit' });
      console.log('✅ Windows icon embedding completed');
    } catch (error) {
      console.log('⚠️  Windows icon embedding failed:', error.message);
      console.log('⚠️  Continuing build process - this is not a critical failure');
    }
  } else {
    console.log('⏭️  Skipping icon embedding for platform:', context.electronPlatformName);
  }
};
