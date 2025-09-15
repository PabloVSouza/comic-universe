#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔐 [BEFORE BUILD HOOK] Checking for Windows certificate...');
console.log('🔐 [BEFORE BUILD HOOK] Platform:', process.platform);
console.log('🔐 [BEFORE BUILD HOOK] Working directory:', process.cwd());

const certDir = path.join(__dirname, '..', 'certificates');
const certPath = path.join(certDir, 'windows-cert.p12');

console.log('🔐 [BEFORE BUILD HOOK] Certificate directory:', certDir);
console.log('🔐 [BEFORE BUILD HOOK] Certificate path:', certPath);
console.log('🔐 [BEFORE BUILD HOOK] Certificate exists:', fs.existsSync(certPath));

// Create certificates directory if it doesn't exist
if (!fs.existsSync(certDir)) {
  fs.mkdirSync(certDir, { recursive: true });
  console.log('📁 Created certificates directory');
}

// Check if certificate already exists
if (fs.existsSync(certPath)) {
  console.log('✅ Windows certificate already exists');
  return;
}

console.log('🔧 Generating Windows certificate...');

try {
  if (process.platform === 'win32') {
    // Windows: Use PowerShell to generate certificate
    const powershellCommand = `
      $cert = New-SelfSignedCertificate -Type CodeSigningCert -Subject 'CN=Comic Universe' -KeyUsage DigitalSignature -FriendlyName 'Comic Universe Code Signing' -CertStoreLocation Cert:\\CurrentUser\\My
      $pwd = ConvertTo-SecureString -String 'comicuniverse' -Force -AsPlainText
      Export-PfxCertificate -Cert $cert -FilePath '${certPath.replace(/\\/g, '\\\\')}' -Password $pwd
    `;
    
    execSync(`powershell -Command "${powershellCommand}"`, { stdio: 'inherit' });
          console.log('✅ Windows certificate generated successfully');
          
          // Set environment variable for electron-builder
          process.env.WIN_CSC_LINK = certPath;
          process.env.CSC_LINK = certPath;
          console.log('🔧 Set WIN_CSC_LINK environment variable:', certPath);
        } else {
          // macOS/Linux: Use OpenSSL to generate certificate
    const keyPath = path.join(certDir, 'windows-key.pem');
    const certPemPath = path.join(certDir, 'windows-cert.pem');
    const csrPath = path.join(certDir, 'windows-cert.csr');
    
    // Generate private key
    execSync(`openssl genrsa -out "${keyPath}" 2048`, { stdio: 'inherit' });
    
    // Generate certificate request
    execSync(`openssl req -new -key "${keyPath}" -out "${csrPath}" -subj "/C=US/ST=CA/L=San Francisco/O=Comic Universe Project/OU=Development/CN=Comic Universe/emailAddress=pablo@example.com"`, { stdio: 'inherit' });
    
    // Generate self-signed certificate
    execSync(`openssl x509 -req -days 365 -in "${csrPath}" -signkey "${keyPath}" -out "${certPemPath}"`, { stdio: 'inherit' });
    
    // Convert to PKCS#12 format
    execSync(`openssl pkcs12 -export -out "${certPath}" -inkey "${keyPath}" -in "${certPemPath}" -name "Comic Universe" -passout pass:comicuniverse`, { stdio: 'inherit' });
    
    // Clean up intermediate files
    [keyPath, certPemPath, csrPath].forEach(file => {
      if (fs.existsSync(file)) {
        fs.unlinkSync(file);
      }
    });
    
            console.log('✅ Windows certificate generated successfully');
            
            // Set environment variable for electron-builder
            process.env.WIN_CSC_LINK = certPath;
            process.env.CSC_LINK = certPath;
            console.log('🔧 Set WIN_CSC_LINK environment variable:', certPath);
          }
          
          console.log('📋 Certificate details:');
  console.log('  📁 Path:', certPath);
  console.log('  🔑 Password: comicuniverse');
  
} catch (error) {
  console.error('❌ Failed to generate certificate:', error.message);
  console.log('⚠️  Continuing build without code signing...');
  
  // Set environment variable to disable code signing
  process.env.WIN_CSC_LINK = '';
  process.env.CSC_LINK = '';
}
