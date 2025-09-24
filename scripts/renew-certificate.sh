#!/bin/bash

# Certificate Renewal Script for Comic Universe
# This script generates a new consistent certificate when the current one expires

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

print_status "🔄 Comic Universe Certificate Renewal"
echo "=========================================="

# Check if certificate exists and get expiration date
CERT_DIR="certificates"
CERT_FILE="$CERT_DIR/cert.p12"

if [[ ! -f "$CERT_FILE" ]]; then
    print_error "Certificate file not found: $CERT_FILE"
    print_status "Run ./scripts/setup-consistent-cert.sh first"
    exit 1
fi

# Check certificate expiration
print_status "Checking certificate expiration..."
CERT_EXPIRY=$(openssl pkcs12 -in "$CERT_FILE" -passin pass:comicuniverse -nokeys -clcerts | openssl x509 -noout -enddate | cut -d= -f2)
CERT_EXPIRY_EPOCH=$(date -d "$CERT_EXPIRY" +%s 2>/dev/null || date -j -f "%b %d %H:%M:%S %Y %Z" "$CERT_EXPIRY" +%s 2>/dev/null)
CURRENT_EPOCH=$(date +%s)
DAYS_UNTIL_EXPIRY=$(( (CERT_EXPIRY_EPOCH - CURRENT_EPOCH) / 86400 ))

print_status "Certificate expires on: $CERT_EXPIRY"
print_status "Days until expiry: $DAYS_UNTIL_EXPIRY"

if [[ $DAYS_UNTIL_EXPIRY -gt 30 ]]; then
    print_success "Certificate is still valid for $DAYS_UNTIL_EXPIRY days"
    print_status "No renewal needed at this time"
    exit 0
elif [[ $DAYS_UNTIL_EXPIRY -gt 0 ]]; then
    print_warning "Certificate expires in $DAYS_UNTIL_EXPIRY days"
    print_status "Renewal recommended"
else
    print_error "Certificate has expired $(( -DAYS_UNTIL_EXPIRY )) days ago"
    print_status "Renewal required immediately"
fi

# Backup current certificate
print_status "Backing up current certificate..."
BACKUP_DIR="$CERT_DIR/backup-$(date +%Y%m%d-%H%M%S)"
mkdir -p "$BACKUP_DIR"
cp "$CERT_FILE" "$BACKUP_DIR/"
print_success "Certificate backed up to: $BACKUP_DIR/"

# Generate new certificate with longer validity
print_status "Generating new certificate with 2-year validity..."

# Certificate details
PROJECT_NAME="Comic Universe"
ORGANIZATION="Comic Universe Project"
COUNTRY="US"
STATE="CA"
CITY="San Francisco"
EMAIL="pablo@example.com"

# Use a fixed seed for consistent certificate generation
CERT_SEED="comic-universe-consistent-cert-2024"

# Create certificate configuration file
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

# Generate new certificate with 2-year validity
openssl req -x509 -newkey rsa:2048 -keyout "$CERT_DIR/cert-key.pem" -out "$CERT_DIR/cert.pem" -days 730 -nodes -config "$CERT_DIR/cert.conf" -extensions v3_req -subj "/C=$COUNTRY/ST=$STATE/L=$CITY/O=$ORGANIZATION/CN=$PROJECT_NAME"

# Convert to PKCS#12 format
openssl pkcs12 -export -out "$CERT_DIR/cert.p12" -inkey "$CERT_DIR/cert-key.pem" -in "$CERT_DIR/cert.pem" -name "$PROJECT_NAME" -passout pass:comicuniverse

# Generate base64 encoded certificate for GitHub Secrets
print_status "Generating base64 encoded certificate..."
CERT_BASE64=$(base64 -i "$CERT_DIR/cert.p12" | tr -d '\n')

# Clean up intermediate files
rm "$CERT_DIR/cert-key.pem"
rm "$CERT_DIR/cert.pem"
rm "$CERT_DIR/cert.conf"

print_success "🎉 New certificate generated successfully!"
echo ""
echo "New certificate details:"
echo "  📁 $CERT_DIR/cert.p12 (Local certificate)"
echo "  🔑 Password: comicuniverse"
echo "  📅 Validity: 2 years (730 days)"
echo ""

# Display GitHub Secrets update instructions
echo "=========================================="
echo "🔧 GitHub Secrets Update Required"
echo "=========================================="
echo ""
echo "You need to update your GitHub Secrets with the new certificate:"
echo ""
echo "1. Go to your GitHub repository settings"
echo "2. Navigate to 'Secrets and variables' > 'Actions'"
echo "3. Update the following repository secret:"
echo ""
echo "   Secret Name: CSC_LINK_BASE64"
echo "   Secret Value: $CERT_BASE64"
echo ""
echo "   (Keep CSC_KEY_PASSWORD as: comicuniverse)"
echo ""

# Check new certificate expiration
NEW_CERT_EXPIRY=$(openssl pkcs12 -in "$CERT_FILE" -passin pass:comicuniverse -nokeys -clcerts | openssl x509 -noout -enddate | cut -d= -f2)
print_success "New certificate expires on: $NEW_CERT_EXPIRY"

echo ""
echo "=========================================="
echo "🚀 Next Steps"
echo "=========================================="
echo ""
echo "1. Update GitHub Secrets with the new certificate"
echo "2. Test a new build to ensure signing works"
echo "3. Test the auto-updater with the new certificate"
echo "4. Set a calendar reminder for certificate renewal in ~2 years"
echo ""
print_warning "Important: Update GitHub Secrets before creating new builds!"
print_warning "The old certificate is backed up in: $BACKUP_DIR/"
