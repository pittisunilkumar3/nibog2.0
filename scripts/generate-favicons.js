const fs = require('fs');
const path = require('path');
const { createCanvas, loadImage } = require('canvas');

async function generateFavicons() {
  try {
    console.log('Starting favicon generation...');
    
    // Read the SVG file
    const svgPath = path.join(__dirname, '../public/noboggamelogo.svg');
    const svgContent = fs.readFileSync(svgPath, 'utf8');
    
    // Parse SVG dimensions
    const widthMatch = svgContent.match(/width="(\d+)"/);
    const heightMatch = svgContent.match(/height="(\d+)"/);
    const originalWidth = widthMatch ? parseInt(widthMatch[1]) : 462;
    const originalHeight = heightMatch ? parseInt(heightMatch[1]) : 316;
    
    console.log(`Original SVG dimensions: ${originalWidth}x${originalHeight}`);
    
    // Convert SVG to data URL for canvas
    const svgDataUrl = `data:image/svg+xml;base64,${Buffer.from(svgContent).toString('base64')}`;
    
    // Generate different sizes
    const sizes = [
      { size: 192, name: 'logo192.png' },
      { size: 512, name: 'logo512.png' },
      { size: 64, name: 'favicon-64.png' }
    ];
    
    for (const { size, name } of sizes) {
      console.log(`Generating ${name}...`);
      
      const canvas = createCanvas(size, size);
      const ctx = canvas.getContext('2d');
      
      // Fill with white background
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, size, size);
      
      // Load and draw the SVG
      const img = await loadImage(svgDataUrl);
      
      // Calculate scaling to fit the logo in the square canvas
      const scale = Math.min(size / originalWidth, size / originalHeight);
      const scaledWidth = originalWidth * scale;
      const scaledHeight = originalHeight * scale;
      
      // Center the logo
      const x = (size - scaledWidth) / 2;
      const y = (size - scaledHeight) / 2;
      
      ctx.drawImage(img, x, y, scaledWidth, scaledHeight);
      
      // Save the PNG
      const buffer = canvas.toBuffer('image/png');
      const outputPath = path.join(__dirname, '../public', name);
      fs.writeFileSync(outputPath, buffer);
      console.log(`✓ Generated ${name}`);
    }
    
    console.log('\n✓ All favicons generated successfully!');
    console.log('\nNext steps:');
    console.log('1. Convert favicon-64.png to favicon.ico using an online tool or ImageMagick');
    console.log('2. Update manifest.json if needed');
    
  } catch (error) {
    console.error('Error generating favicons:', error);
    process.exit(1);
  }
}

generateFavicons();

