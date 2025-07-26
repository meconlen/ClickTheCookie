#!/bin/bash

# GitFlow Release helper script for Click the Cookie
# Usage: ./create-release.sh <version> [--release-branch|--hotfix]
# Example: ./create-release.sh 1.0.1
# Example: ./create-release.sh 1.1.0 --release-branch
# Example: ./create-release.sh 1.0.1 --hotfix

set -e

if [ $# -eq 0 ]; then
    echo "Usage: $0 <version> [--release-branch|--hotfix]"
    echo "Example: $0 1.0.1"
    echo "Example: $0 1.1.0 --release-branch (creates release branch)"
    echo "Example: $0 1.0.1 --hotfix (creates hotfix branch)"
    echo ""
    echo "Modes:"
    echo "  default: Direct release from current branch (for simple releases)"
    echo "  --release-branch: Creates release/vX.Y.Z branch for GitFlow"
    echo "  --hotfix: Creates hotfix/vX.Y.Z branch for critical fixes"
    exit 1
fi

VERSION=$1
TAG="v$VERSION"
MODE=${2:-"direct"}

echo "Creating release for Click the Cookie $TAG"

# Validate version format
if ! [[ $VERSION =~ ^[0-9]+\.[0-9]+\.[0-9]+(-[a-zA-Z0-9.-]+)?$ ]]; then
    echo "Error: Invalid version format. Use semantic versioning (e.g., 1.0.0 or 1.0.0-beta.1)"
    exit 1
fi

# Handle different modes
if [ "$MODE" = "--release-branch" ]; then
    echo "Creating GitFlow release branch..."
    
    # Ensure we're on dev branch
    CURRENT_BRANCH=$(git branch --show-current)
    if [ "$CURRENT_BRANCH" != "dev" ]; then
        echo "Error: For release branches, you must be on 'dev' branch"
        echo "Current branch: $CURRENT_BRANCH"
        echo "Run: git checkout dev"
        exit 1
    fi
    
    # Check if working directory is clean
    if [ -n "$(git status --porcelain)" ]; then
        echo "Error: Working directory is not clean. Please commit or stash changes."
        exit 1
    fi
    
    # Pull latest dev
    echo "Pulling latest dev branch..."
    git pull origin dev
    
    # Create release branch
    RELEASE_BRANCH="release/$TAG"
    echo "Creating release branch: $RELEASE_BRANCH"
    git checkout -b "$RELEASE_BRANCH"
    
elif [ "$MODE" = "--hotfix" ]; then
    echo "Creating GitFlow hotfix branch..."
    
    # Ensure we're on main branch
    CURRENT_BRANCH=$(git branch --show-current)
    if [ "$CURRENT_BRANCH" != "main" ]; then
        echo "Error: For hotfix branches, you must be on 'main' branch"
        echo "Current branch: $CURRENT_BRANCH"
        echo "Run: git checkout main"
        exit 1
    fi
    
    # Check if working directory is clean
    if [ -n "$(git status --porcelain)" ]; then
        echo "Error: Working directory is not clean. Please commit or stash changes."
        exit 1
    fi
    
    # Pull latest main
    echo "Pulling latest main branch..."
    git pull origin main
    
    # Create hotfix branch
    HOTFIX_BRANCH="hotfix/$TAG"
    echo "Creating hotfix branch: $HOTFIX_BRANCH"
    git checkout -b "$HOTFIX_BRANCH"
    
else
    # Direct release mode (original behavior)
    echo "Direct release mode..."
    
    # Check if working directory is clean
    if [ -n "$(git status --porcelain)" ]; then
        echo "Warning: Working directory is not clean. Uncommitted changes detected."
        read -p "Continue anyway? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            exit 1
        fi
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

# For GitFlow branches, commit and push the branch
if [ "$MODE" = "--release-branch" ] || [ "$MODE" = "--hotfix" ]; then
    # Commit version changes
    echo "Committing version changes..."
    git add manifest.json
    if [ -f "package.json" ]; then
        git add package.json
    fi
    git commit -m "Bump version to $VERSION"
    
    # Push the branch
    BRANCH_NAME=$(git branch --show-current)
    echo "Pushing $BRANCH_NAME branch..."
    git push -u origin "$BRANCH_NAME"
    
    echo ""
    echo "✅ GitFlow branch created successfully!"
    echo ""
    if [ "$MODE" = "--release-branch" ]; then
        echo "Release branch 'release/$TAG' created and pushed."
        echo ""
        echo "Next steps:"
        echo "1. Test the release branch thoroughly"
        echo "2. Create PR: release/$TAG → main"
        echo "3. After PR approval, merge to main:"
        echo "   git checkout main"
        echo "   git merge --no-ff release/$TAG"
        echo "   git tag $TAG"
        echo "   git push origin main --tags"
        echo "4. Merge back to dev:"
        echo "   git checkout dev"
        echo "   git merge --no-ff release/$TAG"
        echo "   git push origin dev"
    else
        echo "Hotfix branch 'hotfix/$TAG' created and pushed."
        echo ""
        echo "Next steps:"
        echo "1. Test the hotfix thoroughly"
        echo "2. Create PR: hotfix/$TAG → main"
        echo "3. After PR approval, merge to main and dev:"
        echo "   git checkout main"
        echo "   git merge --no-ff hotfix/$TAG"
        echo "   git tag $TAG"
        echo "   git push origin main --tags"
        echo "   git checkout dev"
        echo "   git merge --no-ff hotfix/$TAG"
        echo "   git push origin dev"
    fi
    
    # Check if it's a pre-release
    if [[ $VERSION =~ (alpha|beta|rc|-|\+) ]]; then
        echo ""
        echo "Note: This version ($VERSION) will be marked as a pre-release."
    fi
    
    exit 0
fi

# Original direct release logic continues below
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
