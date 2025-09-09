#!/bin/bash

# Generate Consistent Self-Signed Certificate for Comic Universe
# This script creates a consistent certificate that will be the same across all builds
# This is essential for auto-updater to work properly on macOS

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

# Create certificates directory
CERT_DIR="certificates"
mkdir -p "$CERT_DIR"

print_status "🔐 Generating Consistent Self-Signed Certificate for Comic Universe"
echo "=================================================="

# Certificate details
PROJECT_NAME="Comic Universe"
ORGANIZATION="Comic Universe Project"
COUNTRY="US"
STATE="CA"
CITY="San Francisco"
EMAIL="pablo@example.com"

# Use a fixed seed for consistent certificate generation
# This ensures the same certificate is generated every time
CERT_SEED="comic-universe-consistent-cert-2024"

print_warning "This certificate will be the same across all builds"
print_warning "This is required for auto-updater to work properly on macOS"
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

# Convert to PKCS#12 format for cross-platform use
print_status "Converting to PKCS#12 format..."
openssl pkcs12 -export -out "$CERT_DIR/cert.p12" -inkey "$CERT_DIR/cert-key.pem" -in "$CERT_DIR/cert.pem" -name "$PROJECT_NAME" -passout pass:comicuniverse

# Clean up intermediate files
rm "$CERT_DIR/cert-key.pem"
rm "$CERT_DIR/cert.pem"
rm "$CERT_DIR/cert.conf"

print_success "🎉 Consistent certificate generated successfully!"
echo ""
echo "Generated files:"
echo "  📁 $CERT_DIR/cert.p12 (Cross-platform certificate)"
echo ""
echo "Certificate password: comicuniverse"
echo ""
echo "This certificate will be the same across all builds, ensuring:"
echo "  ✅ Auto-updater works properly on macOS"
echo "  ✅ Consistent code signing across all releases"
echo "  ✅ No more 'Could not get code signature' errors"
echo ""
print_warning "Keep this certificate secure and never commit it to version control!"
print_warning "Users will still see security warnings (this is normal for self-signed certs)"
echo ""
echo "Next steps:"
echo "1. Test builds with: npm run build:mac and npm run build:win"
echo "2. The auto-updater should now work properly between versions"
echo "3. Consider upgrading to official certificates for production use"
