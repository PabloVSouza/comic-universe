# Code Signing Guide for Comic Universe

This guide explains how to set up code signing for the Comic Universe Electron application across different platforms.

## 🚀 CI/CD Code Signing (Recommended)

**The CI/CD pipeline automatically handles code signing!** See [CI_CD_CODE_SIGNING.md](./CI_CD_CODE_SIGNING.md) for details.

The GitHub Actions workflow automatically:

- Generates self-signed certificates for each build
- Signs Windows and macOS applications
- Handles all the complexity for you

## 🛠️ Local Development Code Signing

This section covers manual code signing setup for local development.

## Overview

Code signing is important for:

- Building user trust
- Preventing security warnings
- Enabling automatic updates
- Meeting platform requirements

## Code Signing Options

### Truly Free Options (Limited)

Unfortunately, **truly free code signing for macOS is very limited**:

1. **Self-signed certificates** (free but users see security warnings)
2. **No code signing** (users will see "unidentified developer" warnings)
3. **Community certificates** (rare and not officially supported)

### Paid Options (Recommended for Production)

### 1. macOS Code Signing

#### Option A: Apple Developer Program (Paid)

- **Cost**: $99/year (required for official certificates)
- **Requirements**:
  - Apple Developer Program membership ($99/year)
- **Benefits**:
  - Official Apple certificates
  - Notarization support
  - No security warnings
  - App Store distribution

**Steps:**

1. Sign up for Apple Developer Program ($99/year)
2. Create a Developer ID Application certificate
3. Update `electron-builder.yml`:
   ```yaml
   mac:
     identity: 'Developer ID Application: Your Name (TEAM_ID)'
     notarize: true
     hardenedRuntime: true
     gatekeeperAssess: true
   ```

#### Option B: Self-Signed Certificate (Free but Not Recommended)

- **Cost**: Free
- **Limitations**: Users will see security warnings
- **Use case**: Development/testing only

### 2. Windows Code Signing

#### Option A: Microsoft Partner Center (Free for Open Source)

- **Cost**: Free for qualifying open source projects
- **Requirements**:
  - Apply through Microsoft Partner Center
  - Project must meet open source criteria
- **Benefits**:
  - Official Microsoft certificates
  - No security warnings

**Steps:**

1. Apply for free certificate through Microsoft Partner Center
2. Download your certificate (.p12 file)
3. Update `electron-builder.yml`:
   ```yaml
   win:
     certificateFile: 'path/to/your/certificate.p12'
     certificatePassword: 'your_certificate_password'
     sign: 1
   ```

#### Option B: Self-Signed Certificate (Not Recommended)

- **Cost**: Free
- **Limitations**: Users will see security warnings
- **Use case**: Development/testing only

### 3. Linux Code Signing

Linux doesn't require code signing in the same way as Windows/macOS, but you can:

- Sign packages with GPG
- Use package repositories
- Implement update mechanisms

## Current Configuration

The project is currently configured with code signing disabled (`identity: null`, `sign: null`). To enable:

1. **For macOS**: Uncomment and update the identity line in `electron-builder.yml`
2. **For Windows**: Uncomment and update the certificate configuration
3. **Set environment variables** for sensitive data (passwords, certificates)

## Environment Variables

For security, use environment variables for sensitive information:

```bash
# macOS
export APPLE_ID="your-apple-id@example.com"
export APPLE_ID_PASSWORD="your-app-specific-password"
export APPLE_TEAM_ID="YOUR_TEAM_ID"

# Windows
export CSC_LINK="path/to/certificate.p12"
export CSC_KEY_PASSWORD="your_certificate_password"
```

## Build Commands

With code signing enabled:

```bash
# macOS (with signing)
npm run build:mac

# Windows (with signing)
npm run build:win

# Linux (no signing required)
npm run build:linux-x64
```

## Troubleshooting

### Common Issues

1. **Certificate not found**: Ensure certificate is in keychain (macOS) or file path is correct
2. **Notarization fails**: Check Apple ID credentials and team ID
3. **Windows signing fails**: Verify certificate file and password

### Debug Mode

To build without code signing for testing:

```bash
# macOS
CSC_IDENTITY_AUTO_DISCOVERY=false npm run build:mac

# Windows
CSC_LINK="" npm run build:win
```

## Security Best Practices

1. **Never commit certificates or passwords** to version control
2. **Use environment variables** for sensitive data
3. **Store certificates securely** (keychain, secure storage)
4. **Rotate certificates** before expiration
5. **Use CI/CD secrets** for automated builds

## Next Steps

1. Choose your preferred free code signing option
2. Apply for certificates/accounts
3. Update configuration in `electron-builder.yml`
4. Test builds with signing enabled
5. Set up CI/CD with secure environment variables

## Resources

- [Apple Developer Program](https://developer.apple.com/programs/)
- [Microsoft Partner Center](https://partner.microsoft.com/)
- [Electron Builder Code Signing](https://www.electron.build/code-signing)
- [GitHub Sponsors](https://github.com/sponsors)
