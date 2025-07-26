#!/bin/bash

# Development helper script for Cookie Clicker Auto-Clicker Firefox Extension

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

show_help() {
    echo -e "${BLUE}Cookie Clicker Auto-Clicker Development Helper${NC}"
    echo ""
    echo "Usage: ./dev.sh [command]"
    echo ""
    echo "Commands:"
    echo "  build     - Build the extension for distribution"
    echo "  clean     - Clean build artifacts"
    echo "  test      - Run basic validation tests"
    echo "  icons     - Regenerate icons (requires ImageMagick)"
    echo "  install   - Show installation instructions"
    echo "  help      - Show this help message"
    echo ""
}

build_extension() {
    echo -e "${YELLOW}Building extension...${NC}"
    ./build.sh
}

clean_artifacts() {
    echo -e "${YELLOW}Cleaning build artifacts...${NC}"
    rm -rf build/
    rm -f cookie-clicker-auto-clicker.zip
    echo -e "${GREEN}Clean complete${NC}"
}

run_tests() {
    echo -e "${YELLOW}Running validation tests...${NC}"
    
    # Check required files
    files=("manifest.json" "popup.html" "popup.js" "content.js")
    for file in "${files[@]}"; do
        if [ -f "$file" ]; then
            echo -e "${GREEN}$file exists${NC}"
        else
            echo -e "${RED}$file missing${NC}"
            exit 1
        fi
    done
    
    # Validate JSON
    if python3 -m json.tool manifest.json > /dev/null 2>&1; then
        echo -e "${GREEN}manifest.json is valid JSON${NC}"
    else
        echo -e "${RED}manifest.json has invalid JSON${NC}"
        exit 1
    fi
    
    # Check icons
    if [ -d "icons" ] && [ -f "icons/icon-128.png" ]; then
        echo -e "${GREEN}Icons directory exists${NC}"
    else
        echo -e "${YELLOW}Icons missing - run './dev.sh icons' to generate${NC}"
    fi
    
    echo -e "${GREEN}All tests passed!${NC}"
}

generate_icons() {
    echo -e "${YELLOW}Generating icons...${NC}"
    
    if ! command -v magick &> /dev/null; then
        echo -e "${RED}ImageMagick not found${NC}"
        echo "Install with: brew install imagemagick"
        exit 1
    fi
    
    mkdir -p icons
    
    echo "Creating cookie-themed icons..."
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
    
    echo -e "${GREEN}Icons generated successfully${NC}"
}

show_install() {
    echo -e "${BLUE}Installation Instructions${NC}"
    echo ""
    echo -e "${YELLOW}Step 1: Build the extension${NC}"
    echo "./dev.sh build"
    echo ""
    echo -e "${YELLOW}Step 2: Install in Firefox${NC}"
    echo "Option A - Temporary (Development):"
    echo "  1. Open Firefox -> about:debugging"
    echo "  2. Click 'This Firefox'"
    echo "  3. Click 'Load Temporary Add-on...'"
    echo "  4. Select build/manifest.json"
    echo ""
    echo "Option B - Package Install:"
    echo "  1. Firefox -> about:addons"
    echo "  2. Gear icon -> 'Install Add-on From File...'"
    echo "  3. Select cookie-clicker-auto-clicker.zip"
    echo ""
    echo -e "${YELLOW}Step 3: Test${NC}"
    echo "  1. Go to https://orteil.dashnet.org/cookieclicker/"
    echo "  2. Click the extension icon"
    echo "  3. Configure and start auto-clicking"
}

# Main script logic
case "${1:-help}" in
    "build")
        run_tests
        build_extension
        ;;
    "clean")
        clean_artifacts
        ;;
    "test")
        run_tests
        ;;
    "icons")
        generate_icons
        ;;
    "install")
        show_install
        ;;
    "help"|*)
        show_help
        ;;
esac
