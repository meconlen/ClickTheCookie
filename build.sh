#!/bin/bash

# Build script for Click the Cookie Firefox Extension using web-ext

set -e  # Exit on any error

echo "Building Click the Cookie Firefox Extension..."

# Clean previous build
if [ -d "build" ]; then
    echo "Cleaning previous build..."
    rm -rf build
fi

if [ -d "web-ext-artifacts" ]; then
    echo "Cleaning web-ext artifacts..."
    rm -rf web-ext-artifacts
fi

if [ -f "click-the-cookie.zip" ]; then
    rm click-the-cookie.zip
fi

# Check if required files exist
required_files=("manifest.json" "popup.html" "popup.js" "content.js")
for file in "${required_files[@]}"; do
    if [ ! -f "$file" ]; then
        echo "Error: Required file $file not found!"
        exit 1
    fi
done

# Check if icons directory exists
if [ ! -d "icons" ]; then
    echo "Warning: Icons directory not found. Creating placeholder icons..."
    mkdir -p icons
    # Create simple placeholder icons if ImageMagick is available
    if command -v magick &> /dev/null; then
        echo "Creating icons with ImageMagick..."
        magick -size 128x128 xc:transparent \
          -fill '#D2691E' -draw "circle 64,64 64,20" \
          -fill '#8B4513' -draw "circle 35,35 35,28" \
          -fill '#8B4513' -draw "circle 85,45 85,38" \
          -fill '#8B4513' -draw "circle 45,85 45,78" \
          -fill '#8B4513' -draw "circle 75,80 75,73" \
          -fill '#8B4513' -draw "circle 55,55 55,48" \
          -fill '#8B4513' -draw "circle 90,70 90,63" \
          icons/icon-128.png
        magick icons/icon-128.png -resize 48x48 icons/icon-48.png
        magick icons/icon-128.png -resize 32x32 icons/icon-32.png
        magick icons/icon-128.png -resize 16x16 icons/icon-16.png
        echo "Icons created successfully!"
    else
        echo "ImageMagick not found. Install with: brew install imagemagick"
        exit 1
    fi
fi

# Validate manifest.json
echo "Validating manifest.json..."
if ! python3 -m json.tool manifest.json > /dev/null 2>&1; then
    echo "Error: Invalid JSON in manifest.json"
    exit 1
fi

# Use web-ext to build the extension
echo "Building extension with web-ext..."
npx web-ext build --overwrite-dest

# Copy the built extension to our expected location
if [ -f "web-ext-artifacts"/*.zip ]; then
    built_file=$(ls web-ext-artifacts/*.zip | head -1)
    cp "$built_file" click-the-cookie.zip
    echo "Extension package copied to click-the-cookie.zip"
else
    echo "Error: web-ext build failed to create zip file"
    exit 1
fi

# Create build directory for backwards compatibility
echo "Creating build directory for compatibility..."
mkdir -p build
cp manifest.json build/
cp popup.html build/
cp popup.js build/
cp content.js build/
cp -r icons build/

# Get file size
size=$(du -h click-the-cookie.zip | cut -f1)

echo ""
echo "Extension built successfully!"
echo "Files copied to build/ directory"
echo "Package created: click-the-cookie.zip ($size)"
echo ""
echo "Installation Options:"
echo ""
echo "   Option 1 - Temporary Install (Development):"
echo "   1. Open Firefox -> about:debugging"
echo "   2. Click 'This Firefox'"
echo "   3. Click 'Load Temporary Add-on...'"
echo "   4. Select manifest.json from the build/ directory"
echo ""
echo "   Option 2 - Package Install:"
echo "   1. Firefox -> about:addons"
echo "   2. Click gear icon -> 'Install Add-on From File...'"
echo "   3. Select click-the-cookie.zip"
echo "   4. (May require setting xpinstall.signatures.required=false)"
echo ""
echo "Happy clicking!"
