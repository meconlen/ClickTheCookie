# Release Instructions for Click the Cookie

This document outlines the release process for the Click the Cookie Firefox extension, including both automated GitHub Actions workflows and manual release procedures.

## Table of Contents

- [Overview](#overview)
- [Automated Release Process](#automated-release-process)
- [Manual Release Process](#manual-release-process)
- [Release Types](#release-types)
- [Version Numbering](#version-numbering)
- [Pre-Release Testing](#pre-release-testing)
- [Troubleshooting](#troubleshooting)

## Overview

The Click the Cookie extension uses an automated release process powered by GitHub Actions. When you create a git tag following the pattern `v[0-9]*`, it automatically:

1. Builds the extension
2. Creates a GitHub release
3. Uploads the extension zip file
4. Generates release notes with installation instructions

## Automated Release Process

### Quick Start

1. **Using the release script** (Recommended):
   ```bash
   ./create-release.sh 1.0.1
   git push origin main
   git push origin v1.0.1
   ```

2. **Manual tagging**:
   ```bash
   git tag v1.0.1
   git push origin v1.0.1
   ```

### Detailed Steps

#### Option 1: Using the Release Script

The `create-release.sh` script automates most of the process:

```bash
# For a stable release
./create-release.sh 1.2.0

# For a pre-release
./create-release.sh 1.3.0-beta.1
```

The script will:
- ✅ Validate the version format
- ✅ Check for uncommitted changes
- ✅ Update `manifest.json` and `package.json` versions
- ✅ Build the extension to verify it works
- ✅ Create a git commit with version changes
- ✅ Create a git tag
- ✅ Provide push instructions

After the script completes, push the changes:
```bash
git push origin main
git push origin v1.2.0
```

#### Option 2: Manual Process

1. **Update version numbers**:
   ```bash
   # Update manifest.json
   jq '.version = "1.2.0"' manifest.json > manifest.tmp && mv manifest.tmp manifest.json
   
   # Update package.json (if needed)
   jq '.version = "1.2.0"' package.json > package.tmp && mv package.tmp package.json
   ```

2. **Test the build**:
   ```bash
   ./build.sh
   ```

3. **Commit changes**:
   ```bash
   git add manifest.json package.json
   git commit -m "Release v1.2.0"
   ```

4. **Create and push tag**:
   ```bash
   git tag -a v1.2.0 -m "Release v1.2.0"
   git push origin main
   git push origin v1.2.0
   ```

## Release Types

### Stable Releases

Tags without pre-release identifiers create stable releases:
- `v1.0.0` → Stable release
- `v1.2.3` → Stable release
- `v2.0.0` → Major stable release

### Pre-Releases

Tags with pre-release identifiers are marked as pre-releases on GitHub:
- `v1.0.0-alpha.1` → Pre-release
- `v1.2.0-beta.2` → Pre-release
- `v1.3.0-rc.1` → Pre-release
- `v1.0.0-dev` → Pre-release

Pre-releases are useful for:
- Testing new features
- Beta testing with users
- Release candidates before stable versions

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

## GitHub Actions Workflows

### 1. Build and Test (`.github/workflows/build-test.yml`)
- **Triggers**: Push to main/develop, PRs to main
- **Purpose**: Validates builds and runs tests
- **Artifacts**: Stores build files for 30 days

### 2. Release (`.github/workflows/release.yml`)
- **Triggers**: Tags matching `v[0-9]*`
- **Purpose**: Creates GitHub releases with extension package
- **Artifacts**: Stores release files for 90 days

### 3. PR Validation (`.github/workflows/validate-pr.yml`)
- **Triggers**: PR events (open, sync, reopen)
- **Purpose**: Validates PR changes before merge

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

1. **Test before releasing**: Always build and test locally first
2. **Use meaningful commit messages**: Clear commit history helps with debugging
3. **Document changes**: Update README.md for significant changes
4. **Follow SemVer**: Consistent versioning helps users understand impact
5. **Pre-release for major changes**: Use beta/rc versions for testing
6. **Keep releases small**: Frequent small releases are better than large ones

## Release Checklist

Before creating a release:

- [ ] All changes committed and pushed
- [ ] Extension builds successfully (`./build.sh`)
- [ ] Extension loads in Firefox
- [ ] Version number follows SemVer
- [ ] No sensitive information in code
- [ ] Documentation updated if needed
- [ ] Tests pass in GitHub Actions

## Contact

For questions about the release process, check the GitHub Issues or contact the maintainers.
