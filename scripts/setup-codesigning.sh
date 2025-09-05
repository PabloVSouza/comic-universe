#!/bin/bash

# Code Signing Setup Script for Comic Universe
# This script helps set up code signing for the Electron application

set -e

echo "🔐 Comic Universe Code Signing Setup"
echo "===================================="

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

# Check if running on macOS
check_macos() {
    if [[ "$OSTYPE" == "darwin"* ]]; then
        return 0
    else
        return 1
    fi
}

# Check if running on Windows
check_windows() {
    if [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "cygwin" ]]; then
        return 0
    else
        return 1
    fi
}

# Setup macOS code signing
setup_macos() {
    print_status "Setting up macOS code signing..."
    
    echo ""
    echo "macOS Code Signing Options:"
    echo "1. GitHub Sponsors + Apple Developer Program (Recommended)"
    echo "2. Self-signed certificate (Not recommended for production)"
    echo "3. Skip macOS setup"
    
    read -p "Choose an option (1-3): " choice
    
    case $choice in
        1)
            print_status "Setting up GitHub Sponsors + Apple Developer Program..."
            echo ""
            echo "Steps to complete:"
            echo "1. Set up GitHub Sponsors: https://github.com/sponsors"
            echo "2. Apply for free Apple Developer Program membership"
            echo "3. Create a Developer ID Application certificate"
            echo "4. Update electron-builder.yml with your certificate identity"
            echo ""
            read -p "Enter your Apple Developer Team ID (or press Enter to skip): " team_id
            if [[ -n "$team_id" ]]; then
                read -p "Enter your certificate identity name: " cert_name
                if [[ -n "$cert_name" ]]; then
                    print_success "Update electron-builder.yml with:"
                    echo "  identity: \"Developer ID Application: $cert_name ($team_id)\""
                    echo "  notarize: true"
                fi
            fi
            ;;
        2)
            print_warning "Self-signed certificates will show security warnings to users"
            read -p "Enter your certificate identity name: " cert_name
            if [[ -n "$cert_name" ]]; then
                print_success "Update electron-builder.yml with:"
                echo "  identity: \"Developer ID Application: $cert_name\""
                echo "  notarize: false"
            fi
            ;;
        3)
            print_status "Skipping macOS setup"
            ;;
        *)
            print_error "Invalid option"
            setup_macos
            ;;
    esac
}

# Setup Windows code signing
setup_windows() {
    print_status "Setting up Windows code signing..."
    
    echo ""
    echo "Windows Code Signing Options:"
    echo "1. Microsoft Partner Center (Recommended)"
    echo "2. Self-signed certificate (Not recommended for production)"
    echo "3. Skip Windows setup"
    
    read -p "Choose an option (1-3): " choice
    
    case $choice in
        1)
            print_status "Setting up Microsoft Partner Center..."
            echo ""
            echo "Steps to complete:"
            echo "1. Apply for free certificate through Microsoft Partner Center"
            echo "2. Download your certificate (.p12 file)"
            echo "3. Update electron-builder.yml with certificate details"
            echo ""
            read -p "Enter path to your certificate file (or press Enter to skip): " cert_file
            if [[ -n "$cert_file" ]]; then
                read -p "Enter certificate password: " -s cert_password
                echo ""
                if [[ -n "$cert_password" ]]; then
                    print_success "Update electron-builder.yml with:"
                    echo "  certificateFile: \"$cert_file\""
                    echo "  certificatePassword: \"$cert_password\""
                    echo "  sign: 1"
                fi
            fi
            ;;
        2)
            print_warning "Self-signed certificates will show security warnings to users"
            read -p "Enter path to your certificate file: " cert_file
            if [[ -n "$cert_file" ]]; then
                read -p "Enter certificate password: " -s cert_password
                echo ""
                if [[ -n "$cert_password" ]]; then
                    print_success "Update electron-builder.yml with:"
                    echo "  certificateFile: \"$cert_file\""
                    echo "  certificatePassword: \"$cert_password\""
                    echo "  sign: 1"
                fi
            fi
            ;;
        3)
            print_status "Skipping Windows setup"
            ;;
        *)
            print_error "Invalid option"
            setup_windows
            ;;
    esac
}

# Create environment file template
create_env_template() {
    print_status "Creating environment file template..."
    
    cat > .env.codesigning.template << EOF
# Code Signing Environment Variables
# Copy this file to .env.codesigning and fill in your values
# DO NOT commit .env.codesigning to version control

# macOS Code Signing
APPLE_ID=your-apple-id@example.com
APPLE_ID_PASSWORD=your-app-specific-password
APPLE_TEAM_ID=YOUR_TEAM_ID

# Windows Code Signing
CSC_LINK=path/to/certificate.p12
CSC_KEY_PASSWORD=your_certificate_password

# Build Configuration
CSC_IDENTITY_AUTO_DISCOVERY=true
EOF

    print_success "Created .env.codesigning.template"
    print_warning "Copy to .env.codesigning and fill in your values"
}

# Main setup function
main() {
    echo ""
    print_status "This script will help you set up code signing for Comic Universe"
    echo ""
    
    # Create environment template
    create_env_template
    
    # Setup based on platform
    if check_macos; then
        setup_macos
    fi
    
    if check_windows; then
        setup_windows
    fi
    
    # If neither macOS nor Windows, show general instructions
    if ! check_macos && ! check_windows; then
        print_status "You're running on Linux. Code signing is not required for Linux builds."
        print_status "However, you can still set up code signing for cross-platform builds."
        echo ""
        echo "Would you like to set up code signing for other platforms?"
        read -p "Set up macOS code signing? (y/n): " setup_mac
        if [[ "$setup_mac" == "y" ]]; then
            setup_macos
        fi
        
        read -p "Set up Windows code signing? (y/n): " setup_win
        if [[ "$setup_win" == "y" ]]; then
            setup_windows
        fi
    fi
    
    echo ""
    print_success "Code signing setup complete!"
    echo ""
    echo "Next steps:"
    echo "1. Review and update electron-builder.yml with your certificate details"
    echo "2. Copy .env.codesigning.template to .env.codesigning and fill in values"
    echo "3. Test your builds with: npm run build:mac or npm run build:win"
    echo "4. Read CODE_SIGNING.md for detailed instructions"
    echo ""
    print_warning "Remember: Never commit certificates or passwords to version control!"
}

# Run main function
main
