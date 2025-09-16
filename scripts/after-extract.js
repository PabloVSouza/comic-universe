const { execSync } = require('child_process');
const path = require('path');

module.exports = async (context) => {
  console.log('🔐 [AFTER EXTRACT HOOK] Running certificate generation and SQLite rebuild...');
  console.log('🔐 [AFTER EXTRACT HOOK] Platform:', context.electronPlatformName);
  
  if (context.electronPlatformName === 'win32') {
    try {
      // Call the certificate generation script
      const certScriptPath = path.join(__dirname, 'ensure-certificate.js');
      console.log('🔐 [AFTER EXTRACT HOOK] Calling certificate script:', certScriptPath);
      
      execSync(`node "${certScriptPath}"`, { stdio: 'inherit' });
      console.log('✅ [AFTER EXTRACT HOOK] Certificate generation completed');
    } catch (error) {
      console.log('⚠️  [AFTER EXTRACT HOOK] Certificate generation failed:', error.message);
      console.log('⚠️  [AFTER EXTRACT HOOK] Continuing build process - this is not a critical failure');
    }

    try {
      // Call the SQLite rebuild script
      const sqliteScriptPath = path.join(__dirname, 'rebuild-sqlite.js');
      console.log('🔧 [AFTER EXTRACT HOOK] Calling SQLite rebuild script:', sqliteScriptPath);
      
      execSync(`node "${sqliteScriptPath}"`, { stdio: 'inherit' });
      console.log('✅ [AFTER EXTRACT HOOK] SQLite rebuild completed');
    } catch (error) {
      console.log('⚠️  [AFTER EXTRACT HOOK] SQLite rebuild failed:', error.message);
      console.log('⚠️  [AFTER EXTRACT HOOK] Continuing build process - app may have database issues');
    }
  } else {
    console.log('⏭️  [AFTER EXTRACT HOOK] Skipping certificate generation and SQLite rebuild for platform:', context.electronPlatformName);
  }
};
