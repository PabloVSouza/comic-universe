#!/bin/bash

# Generate Self-Signed Certificates for Comic Universe
# This script creates self-signed certificates for code signing

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

print_status "🔐 Generating Self-Signed Certificates for Comic Universe"
echo "=================================================="

# Get project information
PROJECT_NAME="Comic Universe"
ORGANIZATION="Comic Universe Project"
COUNTRY="US"
STATE="CA"
CITY="San Francisco"
EMAIL="pablo@example.com"

print_warning "Self-signed certificates will show security warnings to users"
print_warning "This is normal and expected for self-signed certificates"
echo ""

# Generate macOS certificate
generate_macos_cert() {
    print_status "Generating macOS self-signed certificate..."
    
    # Create certificate request
    openssl req -new -newkey rsa:2048 -nodes -keyout "$CERT_DIR/macos-key.pem" -out "$CERT_DIR/macos-cert.csr" -subj "/C=$COUNTRY/ST=$STATE/L=$CITY/O=$ORGANIZATION/OU=Development/CN=$PROJECT_NAME/emailAddress=$EMAIL"
    
    # Create self-signed certificate
    openssl x509 -req -days 365 -in "$CERT_DIR/macos-cert.csr" -signkey "$CERT_DIR/macos-key.pem" -out "$CERT_DIR/macos-cert.pem"
    
    # Convert to PKCS#12 format for macOS
    openssl pkcs12 -export -out "$CERT_DIR/macos-cert.p12" -inkey "$CERT_DIR/macos-key.pem" -in "$CERT_DIR/macos-cert.pem" -name "Developer ID Application: $PROJECT_NAME" -passout pass:comicuniverse
    
    # Clean up intermediate files
    rm "$CERT_DIR/macos-cert.csr"
    
    print_success "macOS certificate generated: $CERT_DIR/macos-cert.p12"
    print_warning "Password: comicuniverse"
}

# Generate Windows certificate
generate_windows_cert() {
    print_status "Generating Windows self-signed certificate..."
    
    # Create certificate request
    openssl req -new -newkey rsa:2048 -nodes -keyout "$CERT_DIR/windows-key.pem" -out "$CERT_DIR/windows-cert.csr" -subj "/C=$COUNTRY/ST=$STATE/L=$CITY/O=$ORGANIZATION/OU=Development/CN=$PROJECT_NAME/emailAddress=$EMAIL"
    
    # Create self-signed certificate
    openssl x509 -req -days 365 -in "$CERT_DIR/windows-cert.csr" -signkey "$CERT_DIR/windows-key.pem" -out "$CERT_DIR/windows-cert.pem"
    
    # Convert to PKCS#12 format for Windows
    openssl pkcs12 -export -out "$CERT_DIR/windows-cert.p12" -inkey "$CERT_DIR/windows-key.pem" -in "$CERT_DIR/windows-cert.pem" -name "$PROJECT_NAME" -passout pass:comicuniverse
    
    # Clean up intermediate files
    rm "$CERT_DIR/windows-cert.csr"
    
    print_success "Windows certificate generated: $CERT_DIR/windows-cert.p12"
    print_warning "Password: comicuniverse"
}

# Install macOS certificate to keychain (macOS only)
install_macos_cert() {
    if [[ "$OSTYPE" == "darwin"* ]]; then
        print_status "Installing macOS certificate to keychain..."
        
        # Import certificate to keychain
        security import "$CERT_DIR/macos-cert.p12" -k ~/Library/Keychains/login.keychain -P comicuniverse -T /usr/bin/codesign
        
        print_success "Certificate installed to keychain"
        print_status "You can verify with: security find-identity -v -p codesigning"
    else
        print_warning "Not on macOS - certificate not installed to keychain"
        print_warning "On macOS, run: security import $CERT_DIR/macos-cert.p12 -k ~/Library/Keychains/login.keychain -P comicuniverse"
    fi
}

# Main function
main() {
    # Check if OpenSSL is available
    if ! command -v openssl &> /dev/null; then
        print_error "OpenSSL is required but not installed"
        print_status "Install OpenSSL:"
        echo "  macOS: brew install openssl"
        echo "  Ubuntu/Debian: sudo apt-get install openssl"
        echo "  Windows: Download from https://slproweb.com/products/Win32OpenSSL.html"
        exit 1
    fi
    
    # Generate certificates
    generate_macos_cert
    generate_windows_cert
    
    # Install macOS certificate if on macOS
    install_macos_cert
    
    echo ""
    print_success "🎉 Self-signed certificates generated successfully!"
    echo ""
    echo "Generated files:"
    echo "  📁 $CERT_DIR/macos-cert.p12 (macOS)"
    echo "  📁 $CERT_DIR/windows-cert.p12 (Windows)"
    echo ""
    echo "Certificate password: comicuniverse"
    echo ""
    echo "Next steps:"
    echo "1. Update electron-builder.yml with certificate paths"
    echo "2. Test builds with: npm run build:mac and npm run build:win"
    echo "3. Users will see security warnings (this is normal for self-signed certs)"
    echo ""
    print_warning "Keep these certificates secure and never commit them to version control!"
}

# Run main function
main
