#!/bin/bash

# Package Chrome Extension
# Creates a ZIP file for distribution

echo "📦 Packaging Minerva Auto-Register Extension..."

# Check if icons exist
if [ ! -f "icons/icon16.png" ] || [ ! -f "icons/icon48.png" ] || [ ! -f "icons/icon128.png" ]; then
    echo "⚠️  Warning: Icon files not found!"
    echo "Please generate icons first using one of these methods:"
    echo "  1. Open icon-generator.html in browser"
    echo "  2. Run: python3 generate_icons.py"
    echo "  3. Run: ./generate-icons.sh"
    echo ""
    read -p "Continue anyway? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Create package directory
PACKAGE_NAME="minerva-auto-register-extension"
TIMESTAMP=$(date +%Y%m%d-%H%M%S)
ZIP_NAME="${PACKAGE_NAME}-${TIMESTAMP}.zip"

echo "Creating package: ${ZIP_NAME}"

# Create zip file with necessary files
zip -r "${ZIP_NAME}" \
    manifest.json \
    popup.html \
    popup.css \
    popup.js \
    content.js \
    background.js \
    icons/ \
    -x "*.DS_Store" "*.git*" "__pycache__/*" "venv/*"

echo "✅ Package created: ${ZIP_NAME}"
echo ""
echo "To install:"
echo "1. Go to chrome://extensions/"
echo "2. Enable Developer mode"
echo "3. Click 'Load unpacked'"
echo "4. Select this directory"
echo ""
echo "Or extract ${ZIP_NAME} and load that directory"
