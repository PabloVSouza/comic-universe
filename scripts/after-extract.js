const { execSync } = require('child_process');
const path = require('path');

module.exports = async (context) => {
  console.log('🔐 [AFTER EXTRACT HOOK] Running certificate generation...');
  console.log('🔐 [AFTER EXTRACT HOOK] Platform:', context.electronPlatformName);
  
  if (context.electronPlatformName === 'win32') {
    try {
      // Call the certificate generation script
      const scriptPath = path.join(__dirname, 'ensure-certificate.js');
      console.log('🔐 [AFTER EXTRACT HOOK] Calling certificate script:', scriptPath);
      
      execSync(`node "${scriptPath}"`, { stdio: 'inherit' });
      console.log('✅ [AFTER EXTRACT HOOK] Certificate generation completed');
    } catch (error) {
      console.log('⚠️  [AFTER EXTRACT HOOK] Certificate generation failed:', error.message);
      console.log('⚠️  [AFTER EXTRACT HOOK] Continuing build process - this is not a critical failure');
    }
  } else {
    console.log('⏭️  [AFTER EXTRACT HOOK] Skipping certificate generation for platform:', context.electronPlatformName);
  }
};
