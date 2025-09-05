# CI/CD Code Signing Setup for Comic Universe

This guide explains how to set up code signing in the GitHub Actions CI/CD pipeline for Comic Universe.

## Overview

The CI/CD pipeline automatically generates self-signed certificates and signs the applications during the build process. This ensures that all releases are properly signed without requiring manual intervention.

## How It Works

1. **Automatic Certificate Generation**: The CI/CD pipeline generates fresh self-signed certificates for each build
2. **Environment Variables**: Certificates are created and used via environment variables
3. **Multi-Platform Support**: Works for both Windows and macOS builds
4. **Multi-Version Support**: Handles alpha, beta, and stable releases
5. **No Manual Intervention**: Everything happens automatically in the cloud

## Current Setup

### GitHub Actions Workflow

The `.github/workflows/release.yml` file has been updated to include:

#### Triggers
- **Stable releases**: Push to `main` branch
- **Tagged releases**: Push tags matching `v*.*.*`, `v*.*.*-alpha*`, `v*.*.*-beta*`
- **Automatic version detection**: Determines if release is alpha, beta, or stable

```yaml
- name: Generate Self-Signed Certificates
  if: matrix.os == 'windows-latest' || matrix.os == 'macos-14'
  run: |
    # Create certificates directory
    mkdir -p certificates
    
    # Generate self-signed certificate
    openssl req -x509 -newkey rsa:2048 -keyout certificates/cert-key.pem -out certificates/cert.pem -days 365 -nodes -subj "/C=US/ST=CA/L=San Francisco/O=Comic Universe/CN=Comic Universe"
    
    # Convert to PKCS#12 format
    openssl pkcs12 -export -out certificates/cert.p12 -inkey certificates/cert-key.pem -in certificates/cert.pem -name "Comic Universe" -passout pass:comicuniverse
    
    # Set environment variables for electron-builder
    echo "CSC_LINK=certificates/cert.p12" >> $GITHUB_ENV
    echo "CSC_KEY_PASSWORD=comicuniverse" >> $GITHUB_ENV
```

### Environment Variables

The workflow uses these environment variables:

- `CSC_LINK`: Path to the certificate file
- `CSC_KEY_PASSWORD`: Certificate password
- `APPLE_ID`: Apple Developer ID (for future notarization)
- `APPLE_ID_PASSWORD`: Apple Developer password
- `APPLE_TEAM_ID`: Apple Developer Team ID

## Creating Releases

### Using the Release Script

The easiest way to create releases is using the provided script:

```bash
npm run create:release
```

This script will:
1. Ask you to choose release type (alpha/beta/stable)
2. Generate the appropriate version number
3. Update package.json
4. Create and push a git tag
5. Trigger the CI/CD pipeline

### Manual Release Creation

You can also create releases manually:

```bash
# Create alpha release
git tag v2.0.0-alpha.1
git push origin v2.0.0-alpha.1

# Create beta release  
git tag v2.0.0-beta.1
git push origin v2.0.0-beta.1

# Create stable release
git tag v2.0.0
git push origin v2.0.0
```

### Release Types

- **Alpha**: Experimental features, for internal testing
- **Beta**: Feature complete, for public testing
- **Stable**: Production ready, for general use

## Benefits of CI/CD Code Signing

### ✅ Advantages

1. **Automated**: No manual certificate management
2. **Consistent**: Same process for every release
3. **Secure**: Certificates are generated fresh for each build
4. **Scalable**: Works for multiple platforms simultaneously
5. **Version Controlled**: Configuration is in the repository

### ⚠️ Limitations

1. **Self-Signed**: Users will see security warnings
2. **No Notarization**: macOS apps won't be notarized
3. **Trust Issues**: Users need to manually trust the certificates

## Upgrading to Official Certificates

If you want to use official certificates (no security warnings), you can:

### For macOS (Apple Developer Program - $99/year)

1. **Set up GitHub Secrets**:
   ```
   APPLE_ID: your-apple-id@example.com
   APPLE_ID_PASSWORD: your-app-specific-password
   APPLE_TEAM_ID: YOUR_TEAM_ID
   ```

2. **Update electron-builder.yml**:
   ```yaml
   mac:
     identity: "Developer ID Application: Your Name (TEAM_ID)"
     notarize: true
   ```

### For Windows (Microsoft Partner Center - Free for Open Source)

1. **Apply for free certificate** through Microsoft Partner Center
2. **Set up GitHub Secrets**:
   ```
   CSC_LINK: base64-encoded-certificate-content
   CSC_KEY_PASSWORD: your-certificate-password
   ```

3. **Update the workflow** to use the official certificate instead of generating self-signed ones

## Local Development

For local development, you can still use the local certificates:

1. **Generate local certificates**:
   ```bash
   ./scripts/create-simple-certs.sh
   ```

2. **Update electron-builder.yml** (uncomment the local paths):
   ```yaml
   mac:
     cscLink: "certificates/macos-cert.p12"
     cscKeyPassword: "comicuniverse"
   
   win:
     cscLink: "certificates/windows-cert.p12"
     cscKeyPassword: "comicuniverse"
   ```

3. **Build locally**:
   ```bash
   npm run build:mac
   npm run build:win
   ```

## Security Considerations

### GitHub Secrets

- **Never commit certificates** to the repository
- **Use GitHub Secrets** for sensitive information
- **Rotate secrets** regularly
- **Limit access** to repository secrets

### Certificate Management

- **Self-signed certificates** are generated fresh for each build
- **No long-term storage** of certificates in CI/CD
- **Automatic cleanup** after build completion

## Troubleshooting

### Common Issues

1. **Certificate generation fails**:
   - Check if OpenSSL is available in the CI environment
   - Verify the certificate generation commands

2. **Code signing fails**:
   - Check environment variables are set correctly
   - Verify certificate format and password

3. **Build fails on specific platforms**:
   - Check platform-specific conditions in the workflow
   - Verify the matrix configuration

### Debug Mode

To debug code signing issues:

1. **Add debug output** to the workflow:
   ```yaml
   - name: Debug Certificate
     run: |
       ls -la certificates/
       file certificates/cert.p12
   ```

2. **Check environment variables**:
   ```yaml
   - name: Debug Environment
     run: |
       echo "CSC_LINK: $CSC_LINK"
       echo "CSC_KEY_PASSWORD: [HIDDEN]"
   ```

## Future Improvements

1. **Official Certificates**: Upgrade to Apple Developer Program and Microsoft Partner Center
2. **Notarization**: Add macOS notarization for better user experience
3. **Certificate Caching**: Cache certificates between builds for faster builds
4. **Multi-Architecture**: Support for more architectures and platforms

## Resources

- [Electron Builder Code Signing](https://www.electron.build/code-signing)
- [GitHub Actions Secrets](https://docs.github.com/en/actions/security-guides/encrypted-secrets)
- [Apple Developer Program](https://developer.apple.com/programs/)
- [Microsoft Partner Center](https://partner.microsoft.com/)
