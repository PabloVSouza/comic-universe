const { execSync } = require('child_process');
const path = require('path');

module.exports = async (context) => {
  console.log('🔧 Running afterPack hook to embed Windows icon...');
  
  if (context.electronPlatformName === 'win') {
    try {
      const scriptPath = path.join(__dirname, 'embed-executable-icon.js');
      execSync(`node "${scriptPath}" --context '${JSON.stringify(context)}'`, { stdio: 'inherit' });
      console.log('✅ Windows icon embedding completed');
    } catch (error) {
      console.log('⚠️  Windows icon embedding failed:', error.message);
      console.log('⚠️  Continuing build process - this is not a critical failure');
    }
  }
};
