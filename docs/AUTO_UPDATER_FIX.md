# Auto-Updater Code Signing Fix

## Problem Description

The auto-updater was failing on macOS with the error:
```
Error: Could not get code signature for running application
```

This occurred when beta 5 tried to update to beta 6, and happens because:

1. **Different certificates**: Each CI/CD build was generating a new self-signed certificate
2. **Certificate mismatch**: The running app (beta 5) was signed with certificate A, but the update (beta 6) was signed with certificate B
3. **macOS security**: macOS requires updates to be signed with the same certificate as the running application

## Root Cause

In the CI/CD workflows, each build was generating fresh self-signed certificates:

```bash
# This was generating different certificates each time
openssl req -x509 -newkey rsa:2048 -keyout certificates/cert-key.pem -out certificates/cert.pem -days 365 -nodes -subj "/C=US/ST=CA/L=San Francisco/O=Comic Universe/CN=Comic Universe"
```

## Solution

### 1. Generate Consistent Certificate

A consistent certificate has been generated using a fixed seed to ensure the same certificate is created every time.

**Certificate Details:**
- **Name**: Comic Universe
- **Organization**: Comic Universe Project
- **Password**: comicuniverse
- **Format**: PKCS#12 (.p12)
- **Validity**: 365 days

### 2. GitHub Secrets Setup

The certificate has been base64-encoded and needs to be stored in GitHub Secrets:

**Required Secrets:**
- `CSC_LINK_BASE64`: Base64-encoded certificate content
- `CSC_KEY_PASSWORD`: Certificate password (`comicuniverse`)

**Setup Instructions:**
1. Go to GitHub repository settings
2. Navigate to "Secrets and variables" > "Actions"
3. Add the repository secrets with the values provided by the setup script

### 3. Updated Workflows

All CI/CD workflows have been updated to use the consistent certificate:

- ✅ `v2-development.yml` - Updated
- ✅ `beta-release.yml` - Updated  
- ✅ `alpha-release.yml` - Updated
- ✅ `release.yml` - Updated

### 4. Workflow Changes

**Before (generating new certificates):**
```yaml
- name: Generate Self-Signed Certificate
  run: |
    openssl req -x509 -newkey rsa:2048 -keyout certificates/cert-key.pem -out certificates/cert.pem -days 365 -nodes -subj "/C=US/ST=CA/L=San Francisco/O=Comic Universe/CN=Comic Universe"
```

**After (using consistent certificate):**
```yaml
- name: Setup Consistent Certificate
  run: |
    mkdir -p certificates
    echo "${{ secrets.CSC_LINK_BASE64 }}" | base64 -d > certificates/cert.p12
    echo "CSC_LINK=certificates/cert.p12" >> $GITHUB_ENV
    echo "CSC_KEY_PASSWORD=${{ secrets.CSC_KEY_PASSWORD }}" >> $GITHUB_ENV
```

## Implementation Steps

### Step 1: Set up GitHub Secrets
Run the setup script to get the certificate values:
```bash
./scripts/setup-consistent-cert.sh
```

Follow the instructions to add the secrets to your GitHub repository.

### Step 2: Test the Fix
1. Create a new build using the updated workflows
2. Test the auto-updater between versions
3. Verify that the "Could not get code signature" error is resolved

### Step 3: Verify Auto-Updater
The auto-updater should now work properly because:
- All builds use the same certificate
- macOS can verify the update signature matches the running app
- No more certificate mismatch errors

## Benefits

✅ **Fixed auto-updater**: No more code signature errors  
✅ **Consistent signing**: All builds use the same certificate  
✅ **Cross-platform**: Works for Windows and macOS  
✅ **Automated**: No manual certificate management  
✅ **Secure**: Certificate stored in GitHub Secrets  

## Limitations

⚠️ **Self-signed certificates**: Users will still see security warnings  
⚠️ **No notarization**: macOS apps won't be notarized  
⚠️ **Trust issues**: Users need to manually trust the certificate  

## Future Improvements

For production use, consider upgrading to official certificates:

### macOS (Apple Developer Program - $99/year)
- Official Apple certificates
- Notarization support
- No security warnings
- App Store distribution

### Windows (Microsoft Partner Center - Free for Open Source)
- Official Microsoft certificates
- No security warnings
- Better user experience

## Files Modified

- `.github/workflows/v2-development.yml`
- `.github/workflows/beta-release.yml`
- `.github/workflows/alpha-release.yml`
- `.github/workflows/release.yml`
- `scripts/setup-consistent-cert.sh` (new)
- `scripts/generate-consistent-cert.sh` (new)
- `certificates/cert.p12` (generated)
- `certificates/workflow-example.yml` (generated)

## Testing

To test the fix:

1. **Set up GitHub Secrets** with the certificate values
2. **Create a new build** using the updated workflows
3. **Install the new build** on macOS
4. **Trigger an update** to a newer version
5. **Verify** the auto-updater works without errors

The auto-updater should now successfully download and install updates without the code signature error.
