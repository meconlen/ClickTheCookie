#!/bin/bash

# GitFlow helper script for Click the Cookie
# Provides common GitFlow operations

set -e

COMMAND=${1:-help}

case $COMMAND in
    "feature-start")
        if [ -z "$2" ]; then
            echo "Usage: $0 feature-start <feature-name>"
            exit 1
        fi
        
        FEATURE_NAME=$2
        echo "Starting feature: $FEATURE_NAME"
        
        git checkout dev
        git pull origin dev
        git checkout -b "feature/$FEATURE_NAME"
        
        echo "✅ Feature branch 'feature/$FEATURE_NAME' created"
        echo "Start developing and commit your changes!"
        ;;
        
    "feature-finish")
        CURRENT_BRANCH=$(git branch --show-current)
        
        if [[ ! $CURRENT_BRANCH =~ ^feature/ ]]; then
            echo "Error: You must be on a feature branch"
            exit 1
        fi
        
        FEATURE_NAME=${CURRENT_BRANCH#feature/}
        echo "Finishing feature: $FEATURE_NAME"
        
        # Ensure everything is committed
        if [ -n "$(git status --porcelain)" ]; then
            echo "Error: Working directory is not clean. Please commit your changes."
            exit 1
        fi
        
        # Switch to dev and merge
        git checkout dev
        git pull origin dev
        git merge --no-ff "$CURRENT_BRANCH"
        git push origin dev
        
        # Delete feature branch
        git branch -d "$CURRENT_BRANCH"
        
        echo "✅ Feature '$FEATURE_NAME' merged to dev and branch deleted"
        ;;
        
    "release-start")
        if [ -z "$2" ]; then
            echo "Usage: $0 release-start <version>"
            echo "Example: $0 release-start 1.2.0"
            exit 1
        fi
        
        VERSION=$2
        ./create-release.sh "$VERSION" --release-branch
        ;;
        
    "release-finish")
        CURRENT_BRANCH=$(git branch --show-current)
        
        if [[ ! $CURRENT_BRANCH =~ ^release/ ]]; then
            echo "Error: You must be on a release branch"
            exit 1
        fi
        
        TAG=${CURRENT_BRANCH#release/}
        echo "Finishing release: $TAG"
        
        # Ensure everything is committed
        if [ -n "$(git status --porcelain)" ]; then
            echo "Error: Working directory is not clean. Please commit your changes."
            exit 1
        fi
        
        echo "This will:"
        echo "1. Merge release branch to main"
        echo "2. Create tag $TAG"
        echo "3. Merge release branch to dev"
        echo "4. Delete release branch"
        echo ""
        read -p "Continue? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            exit 1
        fi
        
        # Merge to main
        git checkout main
        git pull origin main
        git merge --no-ff "$CURRENT_BRANCH"
        git tag -a "$TAG" -m "Release $TAG"
        git push origin main --tags
        
        # Merge to dev
        git checkout dev
        git pull origin dev
        git merge --no-ff "$CURRENT_BRANCH"
        git push origin dev
        
        # Delete release branch
        git branch -d "$CURRENT_BRANCH"
        git push origin --delete "$CURRENT_BRANCH"
        
        echo "✅ Release $TAG completed successfully!"
        echo "GitHub Actions will create the release automatically."
        ;;
        
    "hotfix-start")
        if [ -z "$2" ]; then
            echo "Usage: $0 hotfix-start <version>"
            echo "Example: $0 hotfix-start 1.1.1"
            exit 1
        fi
        
        VERSION=$2
        git checkout main
        ./create-release.sh "$VERSION" --hotfix
        ;;
        
    "hotfix-finish")
        CURRENT_BRANCH=$(git branch --show-current)
        
        if [[ ! $CURRENT_BRANCH =~ ^hotfix/ ]]; then
            echo "Error: You must be on a hotfix branch"
            exit 1
        fi
        
        TAG=${CURRENT_BRANCH#hotfix/}
        echo "Finishing hotfix: $TAG"
        
        # Ensure everything is committed
        if [ -n "$(git status --porcelain)" ]; then
            echo "Error: Working directory is not clean. Please commit your changes."
            exit 1
        fi
        
        echo "This will:"
        echo "1. Merge hotfix branch to main"
        echo "2. Create tag $TAG"
        echo "3. Merge hotfix branch to dev"
        echo "4. Delete hotfix branch"
        echo ""
        read -p "Continue? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            exit 1
        fi
        
        # Merge to main
        git checkout main
        git pull origin main
        git merge --no-ff "$CURRENT_BRANCH"
        git tag -a "$TAG" -m "Hotfix $TAG"
        git push origin main --tags
        
        # Merge to dev
        git checkout dev
        git pull origin dev
        git merge --no-ff "$CURRENT_BRANCH"
        git push origin dev
        
        # Delete hotfix branch
        git branch -d "$CURRENT_BRANCH"
        git push origin --delete "$CURRENT_BRANCH"
        
        echo "✅ Hotfix $TAG completed successfully!"
        ;;
        
    "status")
        echo "GitFlow Status for Click the Cookie"
        echo "=================================="
        
        CURRENT_BRANCH=$(git branch --show-current)
        echo "Current branch: $CURRENT_BRANCH"
        
        echo ""
        echo "Available branches:"
        git branch -a | grep -E "(main|dev|feature|release|hotfix)" | sed 's/^[ *]*/  /'
        
        echo ""
        echo "Recent tags:"
        git tag -l | tail -5 | sed 's/^/  /'
        
        echo ""
        if [[ $CURRENT_BRANCH =~ ^feature/ ]]; then
            echo "💡 You're on a feature branch. Use: $0 feature-finish"
        elif [[ $CURRENT_BRANCH =~ ^release/ ]]; then
            echo "🚀 You're on a release branch. Use: $0 release-finish"
        elif [[ $CURRENT_BRANCH =~ ^hotfix/ ]]; then
            echo "🔥 You're on a hotfix branch. Use: $0 hotfix-finish"
        elif [ "$CURRENT_BRANCH" = "dev" ]; then
            echo "🔧 You're on dev. Create features with: $0 feature-start <name>"
        elif [ "$CURRENT_BRANCH" = "main" ]; then
            echo "📦 You're on main. Create hotfixes with: $0 hotfix-start <version>"
        fi
        ;;
        
    "help"|*)
        echo "GitFlow Helper for Click the Cookie"
        echo "=================================="
        echo ""
        echo "Commands:"
        echo "  feature-start <name>    Start a new feature branch"
        echo "  feature-finish          Finish current feature branch"
        echo "  release-start <version> Start a new release branch"
        echo "  release-finish          Finish current release branch"
        echo "  hotfix-start <version>  Start a new hotfix branch"
        echo "  hotfix-finish           Finish current hotfix branch"
        echo "  status                  Show GitFlow status"
        echo "  help                    Show this help"
        echo ""
        echo "Examples:"
        echo "  $0 feature-start add-new-ui"
        echo "  $0 release-start 1.2.0"
        echo "  $0 hotfix-start 1.1.1"
        echo ""
        echo "For detailed instructions, see RELEASE.md"
        ;;
esac
