# Certificate Expiration Management

## What Happens When the Certificate Expires

### **Current Setup (Self-Signed Certificate)**

The current self-signed certificate has a **365-day validity period**. When it expires, several critical issues will occur:

#### **Immediate Impact**

1. **❌ CI/CD Build Failures**

   ```bash
   Error: Could not get code signature for running application
   Error: Certificate has expired
   Error: Invalid certificate
   ```

2. **❌ Auto-Updater Breaks**

   - Users cannot update to new versions
   - "Could not get code signature" errors
   - Update downloads fail

3. **❌ Installation Issues**

   - New installations may be blocked
   - Severe security warnings
   - Users must manually override security settings

4. **❌ Security Warnings**
   - "Unidentified developer" warnings become more severe
   - "Certificate has expired" messages
   - Users lose trust in the application

### **Timeline of Problems**

| Days Before Expiry | Impact Level | Issues                         |
| ------------------ | ------------ | ------------------------------ |
| 30+ days           | ✅ Healthy   | No issues                      |
| 15-30 days         | ⚠️ Warning   | Auto-updater may start failing |
| 1-14 days          | 🚨 Critical  | Build failures, update issues  |
| 0 days (expired)   | 💥 Broken    | Complete failure               |

## Solutions

### **1. Automatic Monitoring**

A GitHub Action workflow (`certificate-monitor.yml`) automatically monitors certificate expiration:

- **Runs every Monday** to check certificate status
- **Creates GitHub issues** when expiration is approaching
- **Sends alerts** for critical situations
- **Provides renewal instructions**

### **2. Certificate Renewal Process**

#### **Step 1: Check Current Status**

```bash
./scripts/renew-certificate.sh
```

This script will:

- Check current certificate expiration
- Show days until expiry
- Generate new certificate if needed
- Provide GitHub Secrets update instructions

#### **Step 2: Update GitHub Secrets**

1. Go to GitHub repository settings
2. Navigate to "Secrets and variables" > "Actions"
3. Update `CSC_LINK_BASE64` with new certificate
4. Keep `CSC_KEY_PASSWORD` as `comicuniverse`

#### **Step 3: Test the Fix**

1. Create a new build to verify signing works
2. Test auto-updater functionality
3. Verify no more certificate errors

### **3. Prevention Strategies**

#### **A. Extended Validity Period**

The renewal script generates certificates with **2-year validity** (730 days) instead of 1 year:

```bash
# Old: 365 days
openssl req -x509 -newkey rsa:2048 -days 365 ...

# New: 730 days (2 years)
openssl req -x509 -newkey rsa:2048 -days 730 ...
```

#### **B. Calendar Reminders**

Set up reminders for:

- **6 months before expiry**: Plan renewal
- **1 month before expiry**: Execute renewal
- **1 week before expiry**: Final check

#### **C. Automated Alerts**

The monitoring workflow provides:

- Weekly status checks
- Automatic GitHub issue creation
- Email notifications (if configured)

## Long-Term Solutions

### **Option 1: Official Certificates (Recommended)**

#### **macOS - Apple Developer Program ($99/year)**

```yaml
# electron-builder.yml
mac:
  identity: 'Developer ID Application: Your Name (TEAM_ID)'
  notarize: true
  hardenedRuntime: true
  gatekeeperAssess: true
```

**Benefits:**

- ✅ No expiration issues (auto-renewal)
- ✅ No security warnings
- ✅ Notarization support
- ✅ App Store distribution
- ✅ Timestamping included

#### **Windows - Microsoft Partner Center (Free for Open Source)**

```yaml
# electron-builder.yml
win:
  certificateFile: 'path/to/official-cert.p12'
  certificatePassword: 'official_password'
  sign: 1
```

**Benefits:**

- ✅ Free for open source projects
- ✅ No expiration issues
- ✅ No security warnings
- ✅ Timestamping included

### **Option 2: Certificate Rotation Strategy**

For continued use of self-signed certificates:

1. **Generate new certificate** before expiry
2. **Update GitHub Secrets** with new certificate
3. **Test thoroughly** before old certificate expires
4. **Communicate with users** about the change

### **Option 3: Hybrid Approach**

- Use self-signed certificates for development/beta releases
- Use official certificates for stable releases
- Implement automatic certificate rotation

## Emergency Procedures

### **If Certificate Has Already Expired**

1. **Immediate Actions:**

   ```bash
   # Generate new certificate
   ./scripts/renew-certificate.sh

   # Update GitHub Secrets immediately
   # Create emergency build
   ```

2. **User Communication:**

   - Create GitHub issue explaining the situation
   - Provide manual download links
   - Guide users through security override

3. **Recovery Steps:**
   - Deploy new build with valid certificate
   - Test auto-updater functionality
   - Monitor for any remaining issues

### **If Auto-Updater is Broken**

1. **Temporary Workaround:**

   - Provide manual download links
   - Guide users to download latest version
   - Explain security override process

2. **Permanent Fix:**
   - Renew certificate
   - Deploy new build
   - Test auto-updater

## Monitoring and Alerts

### **GitHub Actions Monitoring**

The `certificate-monitor.yml` workflow provides:

- **Weekly checks** every Monday at 9 AM UTC
- **Automatic issue creation** when problems detected
- **Status summaries** in workflow runs
- **Manual trigger** option for immediate checks

### **Manual Monitoring**

Check certificate status anytime:

```bash
# Check current certificate
openssl pkcs12 -in certificates/cert.p12 -passin pass:comicuniverse -nokeys -clcerts | openssl x509 -noout -enddate

# Run renewal check
./scripts/renew-certificate.sh
```

### **Alert Thresholds**

| Days Until Expiry | Action Required    |
| ----------------- | ------------------ |
| 30+ days          | ✅ Monitor only    |
| 15-30 days        | ⚠️ Plan renewal    |
| 1-14 days         | 🚨 Execute renewal |
| 0 days            | 💥 Emergency fix   |

## Best Practices

### **1. Proactive Management**

- Monitor certificate status regularly
- Renew before expiration
- Test thoroughly after renewal

### **2. Documentation**

- Keep renewal procedures documented
- Maintain emergency contact information
- Document user communication templates

### **3. Testing**

- Test certificate renewal process
- Verify auto-updater after renewal
- Test on multiple platforms

### **4. Communication**

- Notify users of certificate changes
- Provide clear security override instructions
- Maintain transparency about self-signed certificates

## Files and Scripts

### **Scripts**

- `scripts/renew-certificate.sh` - Certificate renewal
- `scripts/setup-consistent-cert.sh` - Initial setup
- `scripts/generate-consistent-cert.sh` - Certificate generation

### **Workflows**

- `.github/workflows/certificate-monitor.yml` - Expiration monitoring
- `.github/workflows/setup-consistent-cert.yml` - Certificate setup

### **Documentation**

- `docs/CERTIFICATE_EXPIRATION.md` - This document
- `docs/AUTO_UPDATER_FIX.md` - Auto-updater fix guide
- `docs/CODE_SIGNING.md` - General code signing guide

## Summary

Certificate expiration is a critical issue that can break auto-updater functionality and prevent new builds. The solution involves:

1. **Monitoring** - Automatic weekly checks
2. **Renewal** - 2-year certificates with renewal scripts
3. **Prevention** - Proactive management and alerts
4. **Recovery** - Emergency procedures for expired certificates

For production use, consider upgrading to official certificates to eliminate expiration issues entirely.
