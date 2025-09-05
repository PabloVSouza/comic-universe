#!/bin/bash

# Setup GitHub Secrets for Code Signing
# This script helps you set up GitHub repository secrets for code signing

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

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

print_status "🔐 GitHub Secrets Setup for Code Signing"
echo "============================================="

# Check if GitHub CLI is installed
if ! command -v gh &> /dev/null; then
    print_error "GitHub CLI (gh) is required but not installed"
    print_status "Install GitHub CLI:"
    echo "  macOS: brew install gh"
    echo "  Ubuntu/Debian: sudo apt install gh"
    echo "  Windows: winget install GitHub.cli"
    echo ""
    print_status "After installation, run: gh auth login"
    exit 1
fi

# Check if user is authenticated
if ! gh auth status &> /dev/null; then
    print_error "Not authenticated with GitHub CLI"
    print_status "Run: gh auth login"
    exit 1
fi

# Get repository information
REPO=$(gh repo view --json nameWithOwner -q .nameWithOwner)
print_status "Repository: $REPO"

echo ""
echo "This script will help you set up GitHub secrets for code signing."
echo "You can set up secrets for:"
echo "1. Self-signed certificates (current setup)"
echo "2. Apple Developer Program certificates (macOS)"
echo "3. Microsoft Partner Center certificates (Windows)"
echo "4. All of the above"
echo ""

read -p "Choose an option (1-4): " choice

case $choice in
    1)
        print_status "Setting up self-signed certificate secrets..."
        print_warning "Self-signed certificates are already handled automatically in CI/CD"
        print_status "No additional secrets needed for self-signed certificates"
        ;;
    2)
        print_status "Setting up Apple Developer Program secrets..."
        echo ""
        echo "You'll need:"
        echo "- Apple Developer Program membership ($99/year)"
        echo "- Apple ID and app-specific password"
        echo "- Team ID from Apple Developer portal"
        echo ""
        
        read -p "Enter your Apple ID: " apple_id
        read -p "Enter your app-specific password: " -s apple_password
        echo ""
        read -p "Enter your Apple Team ID: " apple_team_id
        
        if [[ -n "$apple_id" && -n "$apple_password" && -n "$apple_team_id" ]]; then
            print_status "Setting GitHub secrets..."
            gh secret set APPLE_ID --body "$apple_id"
            gh secret set APPLE_ID_PASSWORD --body "$apple_password"
            gh secret set APPLE_TEAM_ID --body "$apple_team_id"
            print_success "Apple Developer Program secrets set successfully!"
        else
            print_error "Missing required information"
        fi
        ;;
    3)
        print_status "Setting up Microsoft Partner Center secrets..."
        echo ""
        echo "You'll need:"
        echo "- Microsoft Partner Center account"
        echo "- Code signing certificate (.p12 file)"
        echo "- Certificate password"
        echo ""
        
        read -p "Enter path to your certificate file (.p12): " cert_file
        read -p "Enter certificate password: " -s cert_password
        echo ""
        
        if [[ -n "$cert_file" && -f "$cert_file" && -n "$cert_password" ]]; then
            print_status "Converting certificate to base64..."
            cert_base64=$(base64 -i "$cert_file")
            
            print_status "Setting GitHub secrets..."
            gh secret set CSC_LINK --body "$cert_base64"
            gh secret set CSC_KEY_PASSWORD --body "$cert_password"
            print_success "Microsoft Partner Center secrets set successfully!"
        else
            print_error "Invalid certificate file or missing password"
        fi
        ;;
    4)
        print_status "Setting up all certificate secrets..."
        echo ""
        echo "This will set up secrets for both Apple Developer Program and Microsoft Partner Center."
        echo "You can skip any section by pressing Enter."
        echo ""
        
        # Apple Developer Program
        echo "=== Apple Developer Program ==="
        read -p "Enter your Apple ID (or press Enter to skip): " apple_id
        if [[ -n "$apple_id" ]]; then
            read -p "Enter your app-specific password: " -s apple_password
            echo ""
            read -p "Enter your Apple Team ID: " apple_team_id
            
            if [[ -n "$apple_password" && -n "$apple_team_id" ]]; then
                gh secret set APPLE_ID --body "$apple_id"
                gh secret set APPLE_ID_PASSWORD --body "$apple_password"
                gh secret set APPLE_TEAM_ID --body "$apple_team_id"
                print_success "Apple Developer Program secrets set!"
            fi
        fi
        
        # Microsoft Partner Center
        echo ""
        echo "=== Microsoft Partner Center ==="
        read -p "Enter path to your certificate file (.p12) (or press Enter to skip): " cert_file
        if [[ -n "$cert_file" && -f "$cert_file" ]]; then
            read -p "Enter certificate password: " -s cert_password
            echo ""
            
            if [[ -n "$cert_password" ]]; then
                cert_base64=$(base64 -i "$cert_file")
                gh secret set CSC_LINK --body "$cert_base64"
                gh secret set CSC_KEY_PASSWORD --body "$cert_password"
                print_success "Microsoft Partner Center secrets set!"
            fi
        fi
        ;;
    *)
        print_error "Invalid option"
        exit 1
        ;;
esac

echo ""
print_success "🎉 GitHub secrets setup complete!"
echo ""
echo "Next steps:"
echo "1. Update electron-builder.yml to use official certificates (if applicable)"
echo "2. Test the CI/CD pipeline with: git push origin main"
echo "3. Check the Actions tab in GitHub to verify builds are signed"
echo ""
print_warning "Remember: Official certificates provide better user experience (no security warnings)"
print_warning "Self-signed certificates are free but show security warnings to users"
