# Icon Files Needed

This extension requires three icon files in PNG format:

- `icon16.png` (16x16 pixels)
- `icon48.png` (48x48 pixels)  
- `icon128.png` (128x128 pixels)

## Quick Way to Create Icons

### Option 1: Use the HTML Icon Generator
1. Open `icon-generator.html` in your browser
2. Right-click each canvas and save the images
3. Save them to this `icons/` directory

### Option 2: Use Python Script
```bash
# Install Pillow in a virtual environment
python3 -m venv venv
source venv/bin/activate
pip install Pillow
python3 generate_icons.py
```

### Option 3: Use Online Tools
1. Go to any online icon generator (e.g., favicon.io, canva.com)
2. Create a red square (#ED1B2F - McGill Red) with white "M"
3. Export in sizes 16x16, 48x48, and 128x128
4. Save to this directory

### Option 4: Use ImageMagick
```bash
brew install imagemagick
./generate-icons.sh
```

## Temporary Solution
For testing purposes, you can use any 3 PNG files of the correct sizes, or download McGill's logo and resize it.
