#!/bin/bash

# Create Simple Self-Signed Certificates for Comic Universe
# This creates certificates that work better with electron-builder

set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Create certificates directory
CERT_DIR="certificates"
mkdir -p "$CERT_DIR"

print_status "🔐 Creating Simple Self-Signed Certificates"
echo "============================================="

# Create a simple certificate for macOS
create_macos_cert() {
    print_status "Creating macOS certificate..."
    
    # Create a simple self-signed certificate
    openssl req -x509 -newkey rsa:2048 -keyout "$CERT_DIR/macos-key.pem" -out "$CERT_DIR/macos-cert.pem" -days 365 -nodes -subj "/C=US/ST=CA/L=San Francisco/O=Comic Universe/CN=Comic Universe"
    
    # Convert to PKCS#12
    openssl pkcs12 -export -out "$CERT_DIR/macos-cert.p12" -inkey "$CERT_DIR/macos-key.pem" -in "$CERT_DIR/macos-cert.pem" -name "Comic Universe" -passout pass:comicuniverse
    
    print_success "macOS certificate created: $CERT_DIR/macos-cert.p12"
}

# Create a simple certificate for Windows
create_windows_cert() {
    print_status "Creating Windows certificate..."
    
    # Create a simple self-signed certificate
    openssl req -x509 -newkey rsa:2048 -keyout "$CERT_DIR/windows-key.pem" -out "$CERT_DIR/windows-cert.pem" -days 365 -nodes -subj "/C=US/ST=CA/L=San Francisco/O=Comic Universe/CN=Comic Universe"
    
    # Convert to PKCS#12
    openssl pkcs12 -export -out "$CERT_DIR/windows-cert.p12" -inkey "$CERT_DIR/windows-key.pem" -in "$CERT_DIR/windows-cert.pem" -name "Comic Universe" -passout pass:comicuniverse
    
    print_success "Windows certificate created: $CERT_DIR/windows-cert.p12"
}

# Main execution
main() {
    if ! command -v openssl &> /dev/null; then
        echo "Error: OpenSSL is required but not installed"
        exit 1
    fi
    
    create_macos_cert
    create_windows_cert
    
    echo ""
    print_success "🎉 Certificates created successfully!"
    echo ""
    echo "Files created:"
    echo "  📁 $CERT_DIR/macos-cert.p12"
    echo "  📁 $CERT_DIR/windows-cert.p12"
    echo ""
    echo "Password: comicuniverse"
    echo ""
    print_warning "These are self-signed certificates - users will see security warnings"
    print_warning "This is normal and expected for self-signed certificates"
}

main
