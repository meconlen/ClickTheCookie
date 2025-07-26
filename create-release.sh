#!/bin/bash

# Release helper script for Click the Cookie
# Usage: ./create-release.sh <version>
# Example: ./create-release.sh 1.0.1

set -e

if [ $# -eq 0 ]; then
    echo "Usage: $0 <version>"
    echo "Example: $0 1.0.1"
    echo "Example: $0 1.1.0-beta.1"
    exit 1
fi

VERSION=$1
TAG="v$VERSION"

echo "Creating release for Click the Cookie $TAG"

# Validate version format
if ! [[ $VERSION =~ ^[0-9]+\.[0-9]+\.[0-9]+(-[a-zA-Z0-9.-]+)?$ ]]; then
    echo "Error: Invalid version format. Use semantic versioning (e.g., 1.0.0 or 1.0.0-beta.1)"
    exit 1
fi

# Check if working directory is clean
if [ -n "$(git status --porcelain)" ]; then
    echo "Warning: Working directory is not clean. Uncommitted changes detected."
    read -p "Continue anyway? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Update version in manifest.json
echo "Updating manifest.json version to $VERSION..."
if command -v jq >/dev/null 2>&1; then
    jq --arg version "$VERSION" '.version = $version' manifest.json > manifest.tmp
    mv manifest.tmp manifest.json
else
    echo "Warning: jq not found. Please manually update version in manifest.json to $VERSION"
    read -p "Press enter when done..."
fi

# Update package.json version if it exists
if [ -f "package.json" ]; then
    echo "Updating package.json version to $VERSION..."
    if command -v jq >/dev/null 2>&1; then
        jq --arg version "$VERSION" '.version = $version' package.json > package.tmp
        mv package.tmp package.json
    else
        echo "Warning: jq not found. Please manually update version in package.json to $VERSION"
        read -p "Press enter when done..."
    fi
fi

# Build extension to verify everything works
echo "Building extension..."
./build.sh

# Check if tag already exists
if git rev-parse "$TAG" >/dev/null 2>&1; then
    echo "Error: Tag $TAG already exists"
    exit 1
fi

# Commit version changes
echo "Committing version changes..."
git add manifest.json
if [ -f "package.json" ]; then
    git add package.json
fi
git commit -m "Release $TAG"

# Create and push tag
echo "Creating tag $TAG..."
git tag -a "$TAG" -m "Release $TAG"

echo "Ready to push release!"
echo ""
echo "To complete the release:"
echo "1. Push changes: git push origin main"
echo "2. Push tag: git push origin $TAG"
echo ""
echo "This will trigger the GitHub Actions release workflow."

# Check if it's a pre-release
if [[ $VERSION =~ (alpha|beta|rc|-|\+) ]]; then
    echo ""
    echo "Note: This version ($VERSION) will be marked as a pre-release."
fi
