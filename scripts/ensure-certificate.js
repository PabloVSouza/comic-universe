#!/usr/bin/env node

const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

console.log('🔐 [BEFORE BUILD HOOK] Checking for Windows certificate...')
console.log('🔐 [BEFORE BUILD HOOK] Platform:', process.platform)
console.log('🔐 [BEFORE BUILD HOOK] Working directory:', process.cwd())
console.log(
  '🔐 [BEFORE BUILD HOOK] CI environment:',
  process.env.CI || process.env.GITHUB_ACTIONS ? 'Yes' : 'No'
)

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
  // Check if we're in a CI environment where code signing is disabled
  if (process.env.CSC_FOR_PULL_REQUEST === 'false' || process.env.CI) {
    console.log('🔧 Code signing disabled in CI environment, skipping certificate generation')
    console.log('⚠️  Setting empty certificate paths to disable code signing')
    process.env.WIN_CSC_LINK = ''
    process.env.CSC_LINK = ''
    return
  }

  // Use OpenSSL for all platforms - it's more reliable in CI environments
  console.log('🔧 Generating certificate with OpenSSL...')
  console.log('🔧 Target path:', certPath)

  const keyPath = path.join(certDir, 'windows-key.pem')
  const certPemPath = path.join(certDir, 'windows-cert.pem')
  const csrPath = path.join(certDir, 'windows-cert.csr')

  // Check if OpenSSL is available
  try {
    execSync('openssl version', { stdio: 'pipe' })
    console.log('✅ OpenSSL is available')
  } catch (opensslError) {
    console.log('❌ OpenSSL is not available:', opensslError.message)
    console.log('⚠️  Skipping certificate generation - OpenSSL not found')
    process.env.WIN_CSC_LINK = ''
    process.env.CSC_LINK = ''
    return
  }

  // Generate private key
  console.log('🔧 Generating private key...')
  execSync(`openssl genrsa -out "${keyPath}" 2048`, { stdio: 'inherit' })

  // Generate certificate request
  console.log('🔧 Generating certificate request...')
  execSync(
    `openssl req -new -key "${keyPath}" -out "${csrPath}" -subj "/C=US/ST=CA/L=San Francisco/O=Comic Universe Project/OU=Development/CN=Comic Universe/emailAddress=pablo@example.com"`,
    { stdio: 'inherit' }
  )

  // Generate self-signed certificate
  console.log('🔧 Generating self-signed certificate...')
  execSync(
    `openssl x509 -req -days 365 -in "${csrPath}" -signkey "${keyPath}" -out "${certPemPath}"`,
    { stdio: 'inherit' }
  )

  // Convert to PKCS#12 format
  console.log('🔧 Converting to PKCS#12 format...')
  execSync(
    `openssl pkcs12 -export -out "${certPath}" -inkey "${keyPath}" -in "${certPemPath}" -name "Comic Universe" -passout pass:comicuniverse`,
    { stdio: 'inherit' }
  )

  // Clean up intermediate files
  console.log('🔧 Cleaning up intermediate files...')
  ;[keyPath, certPemPath, csrPath].forEach((file) => {
    if (fs.existsSync(file)) {
      fs.unlinkSync(file)
    }
  })

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
