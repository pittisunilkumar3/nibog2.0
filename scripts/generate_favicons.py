#!/usr/bin/env python3
"""
Generate favicon files from SVG logo
Requires: pip install cairosvg pillow
"""

import os
import sys
from pathlib import Path

try:
    import cairosvg
    from PIL import Image
    import io
except ImportError:
    print("❌ Required packages not installed.")
    print("\nPlease install required packages:")
    print("  pip install cairosvg pillow")
    sys.exit(1)

def generate_favicons():
    """Generate favicon files from the SVG logo"""
    
    # Paths
    script_dir = Path(__file__).parent
    public_dir = script_dir.parent / 'public'
    svg_path = public_dir / 'noboggamelogo.svg'
    
    if not svg_path.exists():
        print(f"❌ SVG file not found: {svg_path}")
        sys.exit(1)
    
    print("🎨 Starting favicon generation...")
    print(f"📁 Source: {svg_path}")
    
    # Read SVG content
    with open(svg_path, 'r', encoding='utf-8') as f:
        svg_content = f.read()
    
    # Sizes to generate
    sizes = [
        (192, 'logo192.png'),
        (512, 'logo512.png'),
        (64, 'favicon-64.png'),
        (32, 'favicon-32.png'),
        (16, 'favicon-16.png'),
    ]
    
    generated_files = []
    
    for size, filename in sizes:
        print(f"\n📐 Generating {filename} ({size}x{size})...")
        
        try:
            # Convert SVG to PNG at specified size
            png_data = cairosvg.svg2png(
                bytestring=svg_content.encode('utf-8'),
                output_width=size,
                output_height=size,
                background_color='white'
            )
            
            # Save PNG file
            output_path = public_dir / filename
            with open(output_path, 'wb') as f:
                f.write(png_data)
            
            print(f"   ✓ Saved: {output_path}")
            generated_files.append(output_path)
            
        except Exception as e:
            print(f"   ❌ Error: {e}")
            continue
    
    # Generate favicon.ico from 32x32 PNG
    print(f"\n🎯 Generating favicon.ico...")
    try:
        favicon_32_path = public_dir / 'favicon-32.png'
        if favicon_32_path.exists():
            # Open the 32x32 PNG
            img = Image.open(favicon_32_path)
            
            # Save as ICO
            favicon_path = public_dir / 'favicon.ico'
            img.save(favicon_path, format='ICO', sizes=[(32, 32)])
            
            print(f"   ✓ Saved: {favicon_path}")
            generated_files.append(favicon_path)
        else:
            print(f"   ⚠️  Could not find favicon-32.png to create favicon.ico")
    except Exception as e:
        print(f"   ❌ Error creating favicon.ico: {e}")
    
    # Summary
    print("\n" + "="*60)
    print("✅ Favicon generation complete!")
    print("="*60)
    print(f"\n📦 Generated {len(generated_files)} files:")
    for file_path in generated_files:
        file_size = file_path.stat().st_size / 1024  # KB
        print(f"   • {file_path.name} ({file_size:.1f} KB)")
    
    print("\n🎉 All favicons are ready to use!")
    print("\n💡 Next steps:")
    print("   1. The favicons have been generated in the public/ directory")
    print("   2. Clear your browser cache to see the new favicon")
    print("   3. Test the application to ensure logos display correctly")

if __name__ == '__main__':
    try:
        generate_favicons()
    except KeyboardInterrupt:
        print("\n\n⚠️  Generation cancelled by user")
        sys.exit(1)
    except Exception as e:
        print(f"\n❌ Unexpected error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

