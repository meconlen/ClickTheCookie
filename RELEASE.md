# Release Instructions for Click the Cookie (GitFlow)

This document outlines the GitFlow-based release process for the Click the Cookie Firefox extension, including automated GitHub Actions workflows and GitFlow branch management procedures.

## Table of Contents

- [Overview](#overview)
- [GitFlow Branch Structure](#gitflow-branch-structure)
- [Development Workflow](#development-workflow)
- [Release Process](#release-process)
- [Hotfix Process](#hotfix-process)
- [Automated GitHub Actions](#automated-github-actions)
- [Version Numbering](#version-numbering)
- [GitFlow Commands](#gitflow-commands)
- [Troubleshooting](#troubleshooting)

## Overview

The Click the Cookie extension uses GitFlow for branch management combined with automated GitHub Actions for CI/CD. This provides a structured approach to development, testing, and releasing while maintaining code quality and stability.

## GitFlow Branch Structure

### Main Branches

- **`main`** - Production-ready code, tagged releases
- **`dev`** - Integration branch for features, always buildable

### Supporting Branches

- **`feature/*`** - New features, branch from `dev`, merge back to `dev`
- **`release/*`** - Release preparation, branch from `dev`, merge to `main` and `dev`
- **`hotfix/*`** - Critical fixes, branch from `main`, merge to `main` and `dev`

### Branch Naming Conventions

```
feature/feature-name
release/v1.2.0
hotfix/v1.1.1
```

## Development Workflow

### Starting New Features

1. **Ensure you're on dev branch**:
   ```bash
   git checkout dev
   git pull origin dev
   ```

2. **Create feature branch**:
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Develop and commit**:
   ```bash
   # Make your changes
   git add .
   git commit -m "Add new feature description"
   git push -u origin feature/your-feature-name
   ```

4. **Create Pull Request**:
   - Target: `dev` branch
   - Review and merge when approved

### Daily Development

- Work on feature branches
- Regularly sync with `dev`: `git rebase dev`
- Create PRs to merge features into `dev`
- The `dev` branch should always be buildable

## Release Process

### 1. Create Release Branch

When ready to prepare a release:

```bash
# Ensure dev is up to date
git checkout dev
git pull origin dev

# Create release branch
git checkout -b release/v1.2.0

# Push release branch
git push -u origin release/v1.2.0
```

### 2. Prepare Release

```bash
# Update version numbers using the release script
./create-release.sh 1.2.0 --release-branch

# Or manually update versions
jq '.version = "1.2.0"' manifest.json > manifest.tmp && mv manifest.tmp manifest.json
jq '.version = "1.2.0"' package.json > package.tmp && mv package.tmp package.json

# Test the build
./build.sh

# Commit version changes
git add manifest.json package.json
git commit -m "Bump version to 1.2.0"
git push
```

### 3. Release Testing

- Create PR from `release/v1.2.0` → `main` for review
- Run final tests and validation
- Fix any critical issues on the release branch
- Merge fixes back to `dev` if needed

### 4. Complete Release

```bash
# Merge release to main
git checkout main
git pull origin main
git merge --no-ff release/v1.2.0
git push origin main

# Create and push tag
git tag -a v1.2.0 -m "Release v1.2.0"
git push origin v1.2.0

# Merge release back to dev
git checkout dev
git merge --no-ff release/v1.2.0
git push origin dev

# Delete release branch (optional)
git branch -d release/v1.2.0
git push origin --delete release/v1.2.0
```

### 5. Automated Release Creation

The GitHub Actions workflow will automatically:
- Build the extension
- Create GitHub release
- Upload extension zip file
- Generate release notes

## Hotfix Process

For critical fixes that need immediate release:

### 1. Create Hotfix Branch

```bash
# Branch from main
git checkout main
git pull origin main
git checkout -b hotfix/v1.1.1
```

### 2. Fix and Test

```bash
# Make the critical fix
# Update version to patch level (e.g., 1.1.0 → 1.1.1)
./create-release.sh 1.1.1 --hotfix

# Test the fix
./build.sh

# Commit
git add .
git commit -m "Fix critical issue - bump to v1.1.1"
git push -u origin hotfix/v1.1.1
```

### 3. Complete Hotfix

```bash
# Merge to main
git checkout main
git merge --no-ff hotfix/v1.1.1
git tag -a v1.1.1 -m "Hotfix v1.1.1"
git push origin main
git push origin v1.1.1

# Merge to dev
git checkout dev
git merge --no-ff hotfix/v1.1.1
git push origin dev

# Delete hotfix branch
git branch -d hotfix/v1.1.1
git push origin --delete hotfix/v1.1.1
```

## Automated GitHub Actions

## Version Numbering

We follow [Semantic Versioning](https://semver.org/) (SemVer):

```
MAJOR.MINOR.PATCH[-PRERELEASE]
```

### When to Increment:

- **MAJOR**: Breaking changes or significant feature overhauls
- **MINOR**: New features, backward-compatible changes
- **PATCH**: Bug fixes, small improvements

### Examples:

- `1.0.0` → Initial release
- `1.0.1` → Bug fix
- `1.1.0` → New feature
- `2.0.0` → Breaking changes
- `1.1.0-beta.1` → Beta version of upcoming 1.1.0

## Pre-Release Testing

Before creating a release, ensure:

### Local Testing
```bash
# Build and test locally
./build.sh

# Verify the extension loads in Firefox
# 1. Open Firefox
# 2. Go to about:debugging
# 3. Click "This Firefox"
# 4. Click "Load Temporary Add-on"
# 5. Select manifest.json from build/ directory
```

### Automated Testing

The GitHub Actions workflows automatically run tests:

- **Build & Test**: Runs on every push/PR
- **PR Validation**: Validates structure and builds
- **Release**: Builds and creates release package

### GitHub Actions Workflows

#### 1. Build and Test (`.github/workflows/build-test.yml`)
- **Triggers**: Push to `main`/`dev`, PRs to `main`, release branches
- **Purpose**: Validates builds, runs tests, ensures code quality
- **Artifacts**: Stores build files for 30 days

#### 2. Release (`.github/workflows/release.yml`)
- **Triggers**: Tags matching `v[0-9]*` (created when releasing)
- **Purpose**: Creates GitHub releases with extension package
- **Artifacts**: Stores release files for 90 days

#### 3. PR Validation (`.github/workflows/validate-pr.yml`)
- **Triggers**: PR events (open, sync, reopen)
- **Purpose**: Validates PR changes before merge

## Version Numbering

We follow [Semantic Versioning](https://semver.org/) (SemVer) with GitFlow:

```
MAJOR.MINOR.PATCH[-PRERELEASE]
```

### GitFlow Version Strategy

- **Features**: Develop on `dev`, no version changes
- **Releases**: Bump version on release branch
- **Hotfixes**: Bump patch version immediately
- **Pre-releases**: Use for release candidates

### When to Increment

- **MAJOR**: Breaking changes, major feature overhauls
- **MINOR**: New features, significant improvements
- **PATCH**: Bug fixes, hotfixes, small improvements

### GitFlow Version Examples

- `dev` branch: Working version (don't change until release)
- `release/v1.2.0`: Bump to 1.2.0 when creating release branch
- `hotfix/v1.1.1`: Bump to 1.1.1 when creating hotfix
- `v1.2.0-rc.1`: Release candidate tag before final release

## GitFlow Commands

### Essential GitFlow Commands

```bash
# Initialize GitFlow (optional - we manage manually)
git flow init

# Start a feature
git flow feature start feature-name
# Equivalent to: git checkout -b feature/feature-name dev

# Finish a feature
git flow feature finish feature-name
# Equivalent to: merge to dev and delete feature branch

# Start a release
git flow release start v1.2.0
# Equivalent to: git checkout -b release/v1.2.0 dev

# Finish a release
git flow release finish v1.2.0
# Equivalent to: merge to main, tag, merge to dev, cleanup

# Start a hotfix
git flow hotfix start v1.1.1
# Equivalent to: git checkout -b hotfix/v1.1.1 main

# Finish a hotfix
git flow hotfix finish v1.1.1
# Equivalent to: merge to main, tag, merge to dev, cleanup
```

### Manual GitFlow (Recommended for CI/CD)

We recommend manual GitFlow management for better control with GitHub Actions:

```bash
# Feature workflow
git checkout dev
git checkout -b feature/my-feature
# ... develop ...
git checkout dev
git merge --no-ff feature/my-feature

# Release workflow
git checkout dev
git checkout -b release/v1.2.0
# ... prepare release ...
git checkout main
git merge --no-ff release/v1.2.0
git tag v1.2.0
git checkout dev
git merge --no-ff release/v1.2.0
```

## Installation Instructions for Users

The automated release process generates installation instructions for each release:

### Temporary Installation (Development)
1. Download the `click-the-cookie.zip` file from the release
2. Extract the zip file
3. Open Firefox → `about:debugging`
4. Click "This Firefox"
5. Click "Load Temporary Add-on..."
6. Select `manifest.json` from extracted folder

### Package Installation
1. Download `click-the-cookie.zip` from the release
2. Firefox → `about:addons`
3. Click gear icon → "Install Add-on From File..."
4. Select the zip file
5. May require `xpinstall.signatures.required=false` in `about:config`

## Troubleshooting

### Common Issues

#### "Tag already exists"
```bash
# Delete local tag
git tag -d v1.0.1

# Delete remote tag
git push origin :refs/tags/v1.0.1
```

#### "Working directory not clean"
```bash
# Check what's uncommitted
git status

# Commit or stash changes
git add .
git commit -m "Prepare for release"
```

#### "Build failed"
```bash
# Check build script
chmod +x build.sh
./build.sh

# Verify required files exist
ls -la manifest.json popup.html popup.js content.js
```

#### "jq not found"
```bash
# Install jq (macOS)
brew install jq

# Install jq (Ubuntu)
sudo apt-get install jq
```

### GitHub Actions Failures

1. **Check workflow logs** in GitHub Actions tab
2. **Common fixes**:
   - Ensure all required files are committed
   - Verify manifest.json is valid JSON
   - Check build.sh has execute permissions

### Rolling Back a Release

If you need to remove a release:

1. **Delete the release** on GitHub (Releases page)
2. **Delete the tag**:
   ```bash
   git tag -d v1.0.1
   git push origin :refs/tags/v1.0.1
   ```

## Best Practices

### GitFlow Best Practices

1. **Keep dev stable**: Always ensure `dev` branch builds successfully
2. **Feature branches**: Keep them small and focused
3. **Release branches**: Only bug fixes, no new features
4. **Hotfix sparingly**: Use only for critical production issues
5. **Merge strategy**: Use `--no-ff` to preserve branch history
6. **Testing**: Test thoroughly on release branches before merging

### Development Workflow Best Practices

1. **Regular syncing**: Keep feature branches updated with `dev`
2. **Meaningful commits**: Clear, descriptive commit messages
3. **Code review**: All changes go through PR review
4. **Documentation**: Update docs when adding features
5. **Testing**: Test locally before pushing
6. **Clean history**: Squash commits when appropriate

## Release Checklist

### Pre-Release (on release branch)

- [ ] All features merged from `dev`
- [ ] Version numbers updated in all files
- [ ] Extension builds successfully (`./build.sh`)
- [ ] Extension loads and works in Firefox
- [ ] No critical bugs or issues
- [ ] Documentation updated
- [ ] CHANGELOG.md updated (if you have one)

### Release Execution

- [ ] Release branch merged to `main`
- [ ] Tag created and pushed
- [ ] GitHub Actions completed successfully
- [ ] GitHub release created with zip file
- [ ] Release branch merged back to `dev`
- [ ] Team notified of release

### Post-Release

- [ ] Verify release is available on GitHub
- [ ] Test installation from release zip
- [ ] Monitor for any immediate issues
- [ ] Clean up old release branches

## Troubleshooting

### Common GitFlow Issues

#### "Merge conflicts between release and main"
```bash
# On release branch, sync with main first
git checkout release/v1.2.0
git merge main
# Resolve conflicts, then continue with release
```

#### "Feature branch is behind dev"
```bash
# Rebase feature on latest dev
git checkout feature/my-feature
git rebase dev
# Resolve conflicts if any
```

#### "Accidentally committed to wrong branch"
```bash
# Move commits to correct branch
git checkout correct-branch
git cherry-pick <commit-hash>
git checkout wrong-branch
git reset --hard HEAD~1
```

### GitHub Actions Failures

1. **Build failures on release branch**: Fix on release branch, don't merge to main until green
2. **Version conflicts**: Ensure version is properly updated on release branch
3. **Missing files**: Verify all required files are committed

### Rolling Back a Release

If you need to rollback:

```bash
# Delete the tag
git tag -d v1.2.0
git push origin :refs/tags/v1.2.0

# Revert the merge on main
git checkout main
git revert -m 1 <merge-commit-hash>
git push origin main

# Delete GitHub release manually
```

## GitFlow Setup for New Contributors

### First-time Setup

```bash
# Clone repository
git clone https://github.com/meconlen/ClickTheCookie.git
cd ClickTheCookie

# Install GitFlow (optional)
# macOS: brew install git-flow-avh
# Ubuntu: sudo apt-get install git-flow

# Set up tracking for main branches
git checkout main
git pull origin main
git checkout dev
git pull origin dev
```

### Recommended Git Configuration

```bash
# Better merge commit messages
git config merge.log true

# Always create merge commits for GitFlow
git config branch.dev.mergeoptions "--no-ff"
git config branch.main.mergeoptions "--no-ff"

# Set up aliases for common GitFlow commands
git config alias.feature-start '!f() { git checkout dev && git pull && git checkout -b feature/$1; }; f'
git config alias.feature-finish '!f() { git checkout dev && git merge --no-ff feature/$1; }; f'
```

## Contact

For questions about the GitFlow process or release procedures:
- Check GitHub Issues for existing discussions
- Create new issue for process improvements
- Review this documentation for standard procedures
