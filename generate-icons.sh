#!/bin/bash

# Script to generate icons for the Chrome extension
# This creates simple placeholder icons. For production, use proper graphic design tools.

# Check if ImageMagick is installed
if ! command -v convert &> /dev/null; then
    echo "ImageMagick not found. Installing via Homebrew..."
    if command -v brew &> /dev/null; then
        brew install imagemagick
    else
        echo "Please install ImageMagick manually: brew install imagemagick"
        exit 1
    fi
fi

# Create a simple icon using ImageMagick
# Red background with white "M" for Minerva

# 128x128 icon
convert -size 128x128 xc:'#ED1B2F' \
    -gravity center \
    -pointsize 80 \
    -fill white \
    -annotate +0+0 'M' \
    icons/icon128.png

# 48x48 icon
convert -size 48x48 xc:'#ED1B2F' \
    -gravity center \
    -pointsize 30 \
    -fill white \
    -annotate +0+0 'M' \
    icons/icon48.png

# 16x16 icon
convert -size 16x16 xc:'#ED1B2F' \
    -gravity center \
    -pointsize 12 \
    -fill white \
    -annotate +0+0 'M' \
    icons/icon16.png

echo "Icons generated successfully!"
echo "Icons are located in the icons/ directory"
echo ""
echo "Note: These are placeholder icons. For a production extension,"
echo "consider creating professional icons using design software."
