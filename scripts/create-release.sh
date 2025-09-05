#!/bin/bash

# Create Release Script for Comic Universe
# This script helps create alpha, beta, and stable releases with proper tagging

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

print_status "🚀 Comic Universe Release Creator"
echo "=================================="

# Get current version from package.json
CURRENT_VERSION=$(node -p "require('./package.json').version")
print_status "Current version: $CURRENT_VERSION"

echo ""
echo "Release types:"
echo "1. Alpha release (experimental, for testing)"
echo "2. Beta release (feature complete, for testing)"
echo "3. Stable release (production ready)"
echo "4. Custom version"
echo ""

read -p "Choose release type (1-4): " choice

case $choice in
    1)
        RELEASE_TYPE="alpha"
        print_status "Creating alpha release..."
        
        # Get base version (remove any existing pre-release suffix)
        BASE_VERSION=$(echo $CURRENT_VERSION | sed 's/-.*//')
        
        # Get next alpha version
        read -p "Enter alpha version number (e.g., 1 for v${BASE_VERSION}-alpha.1): " alpha_num
        if [[ -z "$alpha_num" ]]; then
            alpha_num="1"
        fi
        
        NEW_VERSION="${BASE_VERSION}-alpha.${alpha_num}"
        ;;
    2)
        RELEASE_TYPE="beta"
        print_status "Creating beta release..."
        
        # Get base version (remove any existing pre-release suffix)
        BASE_VERSION=$(echo $CURRENT_VERSION | sed 's/-.*//')
        
        # Get next beta version
        read -p "Enter beta version number (e.g., 1 for v${BASE_VERSION}-beta.1): " beta_num
        if [[ -z "$beta_num" ]]; then
            beta_num="1"
        fi
        
        NEW_VERSION="${BASE_VERSION}-beta.${beta_num}"
        ;;
    3)
        RELEASE_TYPE="stable"
        print_status "Creating stable release..."
        
        # Get base version (remove any existing pre-release suffix)
        BASE_VERSION=$(echo $CURRENT_VERSION | sed 's/-.*//')
        
        read -p "Enter stable version (current: $BASE_VERSION): " stable_version
        if [[ -z "$stable_version" ]]; then
            stable_version="$BASE_VERSION"
        fi
        
        NEW_VERSION="$stable_version"
        ;;
    4)
        RELEASE_TYPE="custom"
        print_status "Creating custom release..."
        
        read -p "Enter custom version: " custom_version
        if [[ -z "$custom_version" ]]; then
            print_error "Version cannot be empty"
            exit 1
        fi
        
        NEW_VERSION="$custom_version"
        ;;
    *)
        print_error "Invalid option"
        exit 1
        ;;
esac

echo ""
print_status "Release details:"
echo "  Type: $RELEASE_TYPE"
echo "  Version: $NEW_VERSION"
echo "  Tag: v$NEW_VERSION"
echo ""

# Confirm release
read -p "Create this release? (y/n): " confirm
if [[ "$confirm" != "y" ]]; then
    print_status "Release cancelled"
    exit 0
fi

# Check if we're on the right branch
CURRENT_BRANCH=$(git branch --show-current)
if [[ "$RELEASE_TYPE" == "stable" && "$CURRENT_BRANCH" != "main" ]]; then
    print_warning "You're not on the main branch. Stable releases should typically be created from main."
    read -p "Continue anyway? (y/n): " continue_anyway
    if [[ "$continue_anyway" != "y" ]]; then
        print_status "Release cancelled"
        exit 0
    fi
fi

# Update package.json version
print_status "Updating package.json version..."
npm version "$NEW_VERSION" --no-git-tag-version

# Commit version change
print_status "Committing version change..."
git add package.json package-lock.json
git commit -m "chore: bump version to $NEW_VERSION"

# Create and push tag
print_status "Creating and pushing tag..."
git tag "v$NEW_VERSION"
git push origin "$CURRENT_BRANCH"
git push origin "v$NEW_VERSION"

echo ""
print_success "🎉 Release created successfully!"
echo ""
echo "Release details:"
echo "  Version: $NEW_VERSION"
echo "  Tag: v$NEW_VERSION"
echo "  Type: $RELEASE_TYPE"
echo "  Branch: $CURRENT_BRANCH"
echo ""
echo "The CI/CD pipeline will now:"
echo "  ✅ Build the application for all platforms"
echo "  ✅ Sign Windows and macOS builds with self-signed certificates"
echo "  ✅ Create a GitHub release with all artifacts"
echo "  ✅ Mark as prerelease: $([ "$RELEASE_TYPE" != "stable" ] && echo "Yes" || echo "No")"
echo ""
print_status "Check the Actions tab in GitHub to monitor the build progress:"
echo "  https://github.com/$(git config --get remote.origin.url | sed 's/.*github.com[:/]\([^.]*\).*/\1/')/actions"
echo ""
print_warning "Note: All builds are signed with self-signed certificates"
print_warning "Users may see security warnings - this is normal for self-signed certificates"
