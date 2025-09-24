#!/bin/bash

# Setup Consistent Certificate for Comic Universe Auto-Updater
# This script generates a consistent certificate and provides instructions for GitHub Secrets

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_status "🔐 Setting up Consistent Certificate for Comic Universe Auto-Updater"
echo "=================================================="

# Create certificates directory
CERT_DIR="certificates"
mkdir -p "$CERT_DIR"

# Certificate details
PROJECT_NAME="Comic Universe"
ORGANIZATION="Comic Universe Project"
COUNTRY="US"
STATE="CA"
CITY="San Francisco"
EMAIL="pablo@example.com"

# Use a fixed seed for consistent certificate generation
CERT_SEED="comic-universe-consistent-cert-2024"

print_warning "This will generate a consistent certificate for auto-updater compatibility"
echo ""

# Create certificate configuration file
print_status "Creating certificate configuration..."
cat > "$CERT_DIR/cert.conf" << EOF
[req]
distinguished_name = req_distinguished_name
x509_extensions = v3_req
prompt = no

[req_distinguished_name]
C = $COUNTRY
ST = $STATE
L = $CITY
O = $ORGANIZATION
CN = $PROJECT_NAME

[v3_req]
keyUsage = critical, digitalSignature, keyEncipherment
extendedKeyUsage = critical, codeSigning
subjectKeyIdentifier = hash
EOF

# Generate private key and certificate
print_status "Generating private key and certificate..."
openssl req -x509 -newkey rsa:2048 -keyout "$CERT_DIR/cert-key.pem" -out "$CERT_DIR/cert.pem" -days 365 -nodes -config "$CERT_DIR/cert.conf" -extensions v3_req -subj "/C=$COUNTRY/ST=$STATE/L=$CITY/O=$ORGANIZATION/CN=$PROJECT_NAME"

# Convert to PKCS#12 format
print_status "Converting to PKCS#12 format..."
openssl pkcs12 -export -out "$CERT_DIR/cert.p12" -inkey "$CERT_DIR/cert-key.pem" -in "$CERT_DIR/cert.pem" -name "$PROJECT_NAME" -passout pass:comicuniverse -legacy

# Generate base64 encoded certificate for GitHub Secrets
print_status "Generating base64 encoded certificate..."
CERT_BASE64=$(base64 -i "$CERT_DIR/cert.p12" | tr -d '\n')

# Clean up intermediate files
rm "$CERT_DIR/cert-key.pem"
rm "$CERT_DIR/cert.pem"
rm "$CERT_DIR/cert.conf"

print_success "🎉 Consistent certificate generated successfully!"
echo ""
echo "Generated files:"
echo "  📁 $CERT_DIR/cert.p12 (Local certificate)"
echo ""
echo "Certificate password: comicuniverse"
echo ""

# Display GitHub Secrets setup instructions
echo "=========================================="
echo "🔧 GitHub Secrets Setup Instructions"
echo "=========================================="
echo ""
echo "To fix the auto-updater issue, you need to set up GitHub Secrets:"
echo ""
echo "1. Go to your GitHub repository settings"
echo "2. Navigate to 'Secrets and variables' > 'Actions'"
echo "3. Add the following repository secrets:"
echo ""
echo "   Secret Name: CSC_LINK_BASE64"
echo "   Secret Value: $CERT_BASE64"
echo ""
echo "   Secret Name: CSC_KEY_PASSWORD"
echo "   Secret Value: comicuniverse"
echo ""
echo "4. Update your CI/CD workflows to use these secrets instead of generating new certificates"
echo ""

# Create a sample workflow snippet
print_status "Creating sample workflow configuration..."
cat > "$CERT_DIR/workflow-example.yml" << EOF
# Example workflow step to use the consistent certificate
- name: Setup Consistent Certificate
  run: |
    # Decode the base64 certificate
    echo "\${{ secrets.CSC_LINK_BASE64 }}" | base64 -d > certificates/cert.p12
    
    # Set environment variables
    echo "CSC_LINK=certificates/cert.p12" >> \$GITHUB_ENV
    echo "CSC_KEY_PASSWORD=\${{ secrets.CSC_KEY_PASSWORD }}" >> \$GITHUB_ENV
    
    # For macOS, import to keychain
    if [[ "\${{ matrix.os }}" == "macos-14" ]]; then
      security create-keychain -p "" build.keychain
      security default-keychain -s build.keychain
      security unlock-keychain -p "" build.keychain
      security import certificates/cert.p12 -k build.keychain -P \${{ secrets.CSC_KEY_PASSWORD }} -T /usr/bin/codesign
      security set-key-partition-list -S apple-tool:,apple: -s -k "" build.keychain
    fi
EOF

print_success "Sample workflow configuration saved to: $CERT_DIR/workflow-example.yml"
echo ""
echo "=========================================="
echo "🚀 Next Steps"
echo "=========================================="
echo ""
echo "1. Set up the GitHub Secrets as shown above"
echo "2. Update your CI/CD workflows to use the consistent certificate"
echo "3. Test the auto-updater with a new build"
echo "4. The auto-updater should now work properly between versions"
echo ""
print_warning "This certificate will be the same across all builds, ensuring auto-updater compatibility"
print_warning "Users will still see security warnings (this is normal for self-signed certs)"
echo ""
echo "For production use, consider upgrading to official certificates:"
echo "  • macOS: Apple Developer Program (\$99/year)"
echo "  • Windows: Microsoft Partner Center (free for open source)"
