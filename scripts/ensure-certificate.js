#!/usr/bin/env node

const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

console.log('🔐 [BEFORE BUILD HOOK] Checking for Windows certificate...')
console.log('🔐 [BEFORE BUILD HOOK] Platform:', process.platform)
console.log('🔐 [BEFORE BUILD HOOK] Working directory:', process.cwd())
console.log('🔐 [BEFORE BUILD HOOK] CI environment:', process.env.CI || process.env.GITHUB_ACTIONS ? 'Yes' : 'No')

const certDir = path.join(__dirname, '..', 'certificates')
const certPath = path.join(certDir, 'windows-cert.p12')

console.log('🔐 [BEFORE BUILD HOOK] Certificate directory:', certDir)
console.log('🔐 [BEFORE BUILD HOOK] Certificate path:', certPath)
console.log('🔐 [BEFORE BUILD HOOK] Certificate exists:', fs.existsSync(certPath))

// Create certificates directory if it doesn't exist
if (!fs.existsSync(certDir)) {
  fs.mkdirSync(certDir, { recursive: true })
  console.log('📁 Created certificates directory')
}

// Check if certificate already exists
if (fs.existsSync(certPath)) {
  console.log('✅ Windows certificate already exists')
  return
}

console.log('🔧 Generating Windows certificate...')

try {
  if (process.platform === 'win32') {
    // Windows: Use PowerShell to generate certificate
    console.log('🔧 Creating certificate with PowerShell...')
    console.log('🔧 Target path:', certPath)

    // First, let's test if PowerShell is working at all
    const testCommand = `Write-Host 'PowerShell is working'`

    console.log('🔧 Testing PowerShell execution...')
    try {
      const testOutput = execSync(`powershell -ExecutionPolicy Bypass -Command "${testCommand}"`, {
        stdio: 'pipe',
        encoding: 'utf8',
        timeout: 10000
      })
      console.log('🔧 PowerShell test output:', testOutput)
    } catch (testError) {
      console.log('❌ PowerShell test failed:', testError.message)
      console.log('⚠️  Continuing without certificate generation - this is not a critical failure')
      return
    }

    // Create a PowerShell script file instead of inline command
    const psScriptPath = path.join(__dirname, 'generate-cert.ps1')
    const psScriptContent = `
Write-Host 'Starting certificate generation...'
try {
  $cert = New-SelfSignedCertificate -Type CodeSigningCert -Subject 'CN=Comic Universe' -KeyUsage DigitalSignature -FriendlyName 'Comic Universe Code Signing' -CertStoreLocation Cert:\\CurrentUser\\My
  Write-Host 'Certificate created successfully'
  $pwd = ConvertTo-SecureString -String 'comicuniverse' -Force -AsPlainText
  Write-Host 'Password created successfully'
  Export-PfxCertificate -Cert $cert -FilePath '${certPath.replace(/\\/g, '\\\\')}' -Password $pwd
  Write-Host 'Certificate exported successfully to: ${certPath}'
  if (Test-Path '${certPath.replace(/\\/g, '\\\\')}') {
    Write-Host 'Certificate file exists: YES'
  } else {
    Write-Host 'Certificate file exists: NO'
  }
} catch {
  Write-Host 'Error occurred:' $_.Exception.Message
  Write-Host 'Error details:' $_.Exception.ToString()
  exit 1
}
`

    // Write the PowerShell script to a file
    fs.writeFileSync(psScriptPath, psScriptContent)
    console.log('🔧 Created PowerShell script:', psScriptPath)

    console.log('🔧 Executing PowerShell script...')
    try {
      const output = execSync(`powershell -ExecutionPolicy Bypass -File "${psScriptPath}"`, {
        stdio: 'pipe',
        encoding: 'utf8',
        timeout: 30000
      })
      console.log('🔧 PowerShell output:', output)
    } catch (psError) {
      console.log('❌ PowerShell script failed:', psError.message)
      console.log('❌ PowerShell stderr:', psError.stderr)
      console.log('❌ PowerShell stdout:', psError.stdout)
      throw psError
    } finally {
      // Clean up the script file
      try {
        fs.unlinkSync(psScriptPath)
        console.log('🔧 Cleaned up PowerShell script file')
      } catch (cleanupError) {
        console.log('⚠️  Could not clean up script file:', cleanupError.message)
      }
    }

    // Verify the certificate was created
    if (fs.existsSync(certPath)) {
      console.log('✅ Windows certificate generated successfully')
      console.log('✅ Certificate file exists at:', certPath)

      // Set environment variable for electron-builder
      process.env.WIN_CSC_LINK = certPath
      process.env.CSC_LINK = certPath
      console.log('🔧 Set WIN_CSC_LINK environment variable:', certPath)
    } else {
      throw new Error('Certificate file was not created at: ' + certPath)
    }
  } else {
    // macOS/Linux: Use OpenSSL to generate certificate
    const keyPath = path.join(certDir, 'windows-key.pem')
    const certPemPath = path.join(certDir, 'windows-cert.pem')
    const csrPath = path.join(certDir, 'windows-cert.csr')

    // Generate private key
    execSync(`openssl genrsa -out "${keyPath}" 2048`, { stdio: 'inherit' })

    // Generate certificate request
    execSync(
      `openssl req -new -key "${keyPath}" -out "${csrPath}" -subj "/C=US/ST=CA/L=San Francisco/O=Comic Universe Project/OU=Development/CN=Comic Universe/emailAddress=pablo@example.com"`,
      { stdio: 'inherit' }
    )

    // Generate self-signed certificate
    execSync(
      `openssl x509 -req -days 365 -in "${csrPath}" -signkey "${keyPath}" -out "${certPemPath}"`,
      { stdio: 'inherit' }
    )

    // Convert to PKCS#12 format
    execSync(
      `openssl pkcs12 -export -out "${certPath}" -inkey "${keyPath}" -in "${certPemPath}" -name "Comic Universe" -passout pass:comicuniverse`,
      { stdio: 'inherit' }
    )

    // Clean up intermediate files
    ;[keyPath, certPemPath, csrPath].forEach((file) => {
      if (fs.existsSync(file)) {
        fs.unlinkSync(file)
      }
    })

    console.log('✅ Windows certificate generated successfully')

    // Set environment variable for electron-builder
    process.env.WIN_CSC_LINK = certPath
    process.env.CSC_LINK = certPath
    console.log('🔧 Set WIN_CSC_LINK environment variable:', certPath)
  }

  console.log('📋 Certificate details:')
  console.log('  📁 Path:', certPath)
  console.log('  🔑 Password: comicuniverse')
} catch (error) {
  console.error('❌ Failed to generate certificate:', error.message)
  console.log('⚠️  Continuing build without code signing...')
  console.log('⚠️  This is not a critical failure - build will continue')

  // Set environment variable to disable code signing
  process.env.WIN_CSC_LINK = ''
  process.env.CSC_LINK = ''
}
