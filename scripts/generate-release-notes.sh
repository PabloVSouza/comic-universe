#!/bin/bash

# Generate release notes from commit messages
# Usage: ./scripts/generate-release-notes.sh [from_commit] [to_commit]

set -e

FROM_COMMIT=${1:-HEAD~10}
TO_COMMIT=${2:-HEAD}

echo "## 🚀 Release Notes"
echo ""
echo "**Generated from commits:** \`$FROM_COMMIT\` to \`$TO_COMMIT\`"
echo ""

# Get commit messages and format them
git log --pretty=format:"- %s (%h)" $FROM_COMMIT..$TO_COMMIT | head -20

echo ""
echo ""
echo "## 📋 Full Changelog"
echo ""
echo "For the complete list of changes, see the [full changelog](https://github.com/PabloVSouza/comic-universe/compare/$FROM_COMMIT...$TO_COMMIT)."
