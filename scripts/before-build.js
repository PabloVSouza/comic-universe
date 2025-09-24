const { execSync } = require('child_process');
const path = require('path');

module.exports = async (context) => {
  console.log('🔐 [BEFORE BUILD HOOK] Running certificate generation...');
  console.log('🔐 [BEFORE BUILD HOOK] Platform:', context.electronPlatformName);
  
  if (context.electronPlatformName === 'win32') {
    try {
      // Call the certificate generation script
      const scriptPath = path.join(__dirname, 'ensure-certificate.js');
      console.log('🔐 [BEFORE BUILD HOOK] Calling certificate script:', scriptPath);
      
      execSync(`node "${scriptPath}"`, { stdio: 'inherit' });
      console.log('✅ [BEFORE BUILD HOOK] Certificate generation completed');
    } catch (error) {
      console.log('⚠️  [BEFORE BUILD HOOK] Certificate generation failed:', error.message);
      console.log('⚠️  [BEFORE BUILD HOOK] Continuing build process - this is not a critical failure');
    }
  } else {
    console.log('⏭️  [BEFORE BUILD HOOK] Skipping certificate generation for platform:', context.electronPlatformName);
  }
};
