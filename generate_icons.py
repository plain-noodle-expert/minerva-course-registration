#!/usr/bin/env python3
"""
Simple icon generator for Minerva Auto-Register Chrome Extension
Creates PNG icons in McGill red with white "M"
Requires: PIL/Pillow (pip install Pillow)
"""

try:
    from PIL import Image, ImageDraw, ImageFont
    import os
except ImportError:
    print("Error: Pillow library required")
    print("Install with: pip3 install Pillow")
    exit(1)

# McGill red color
MCGILL_RED = (237, 27, 47)
WHITE = (255, 255, 255)

def create_icon(size, output_path):
    """Create a simple icon with McGill red background and white M"""
    # Create image
    img = Image.new('RGB', (size, size), MCGILL_RED)
    draw = ImageDraw.Draw(img)
    
    # Try to use a font, fallback to default if not available
    try:
        font_size = int(size * 0.6)
        font = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", font_size)
    except:
        font = ImageFont.load_default()
    
    # Draw "M" in center
    text = "M"
    
    # Get text bounding box for centering
    bbox = draw.textbbox((0, 0), text, font=font)
    text_width = bbox[2] - bbox[0]
    text_height = bbox[3] - bbox[1]
    
    position = ((size - text_width) // 2, (size - text_height) // 2 - size // 10)
    draw.text(position, text, fill=WHITE, font=font)
    
    # Save
    img.save(output_path, 'PNG')
    print(f"Created {output_path}")

def main():
    # Create icons directory if it doesn't exist
    icons_dir = os.path.join(os.path.dirname(__file__), 'icons')
    os.makedirs(icons_dir, exist_ok=True)
    
    # Create icons in different sizes
    sizes = [16, 48, 128]
    for size in sizes:
        output_path = os.path.join(icons_dir, f'icon{size}.png')
        create_icon(size, output_path)
    
    print("\nIcons created successfully!")
    print("All icons are in the 'icons/' directory")

if __name__ == '__main__':
    main()
