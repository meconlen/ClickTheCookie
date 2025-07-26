# Cookie Clicker Auto-Clicker Extension Icons

This directory should contain the extension icons in the following sizes:
- icon-16.png (16x16 pixels)
- icon-32.png (32x32 pixels) 
- icon-48.png (48x48 pixels)
- icon-128.png (128x128 pixels)

## Creating Icons

You can create these icons using any image editing software. The icons should represent a cookie or clicking theme.

### Suggested Design
- Use a brown cookie with chocolate chips
- Add a small cursor or click indicator
- Keep the design simple and recognizable at small sizes

### Quick Icon Creation with ImageMagick (if installed)

If you have ImageMagick installed, you can create simple placeholder icons:

```bash
# Create a simple brown circle icon
convert -size 128x128 xc:transparent -fill '#8B4513' -draw 'circle 64,64 64,20' icon-128.png
convert icon-128.png -resize 48x48 icon-48.png
convert icon-128.png -resize 32x32 icon-32.png
convert icon-128.png -resize 16x16 icon-16.png
```

### Online Icon Generators
- Favicon.io
- IconMaker
- Canva

## Current Status
Currently using placeholder icons. Replace with actual cookie-themed icons for better user experience.
