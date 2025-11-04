const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

async function generateFavicons() {
  try {
    console.log('Starting favicon generation with sharp...');
    
    // Read the SVG file
    const svgPath = path.join(__dirname, '../public/noboggamelogo.svg');
    const svgBuffer = fs.readFileSync(svgPath);
    
    console.log('SVG file loaded successfully');
    
    // Generate different sizes
    const sizes = [
      { size: 192, name: 'logo192.png' },
      { size: 512, name: 'logo512.png' },
      { size: 64, name: 'favicon-64.png' },
      { size: 32, name: 'favicon-32.png' },
      { size: 16, name: 'favicon-16.png' }
    ];
    
    for (const { size, name } of sizes) {
      console.log(`Generating ${name} (${size}x${size})...`);
      
      const outputPath = path.join(__dirname, '../public', name);
      
      await sharp(svgBuffer)
        .resize(size, size, {
          fit: 'contain',
          background: { r: 255, g: 255, b: 255, alpha: 1 }
        })
        .png()
        .toFile(outputPath);
      
      console.log(`✓ Generated ${name}`);
    }
    
    // Generate favicon.ico from the 32x32 PNG
    console.log('\nGenerating favicon.ico...');
    const favicon32Path = path.join(__dirname, '../public/favicon-32.png');
    const faviconPath = path.join(__dirname, '../public/favicon.ico');
    
    // For ICO, we'll just copy the 32x32 PNG and rename it
    // Note: This creates a PNG-based ICO which works in modern browsers
    await sharp(svgBuffer)
      .resize(32, 32, {
        fit: 'contain',
        background: { r: 255, g: 255, b: 255, alpha: 1 }
      })
      .toFormat('png')
      .toFile(faviconPath);
    
    console.log('✓ Generated favicon.ico');
    
    console.log('\n✅ All favicons generated successfully!');
    console.log('\nGenerated files:');
    console.log('  - favicon.ico (32x32)');
    console.log('  - logo192.png (192x192)');
    console.log('  - logo512.png (512x512)');
    console.log('\nThe favicons are ready to use!');
    
  } catch (error) {
    console.error('❌ Error generating favicons:', error.message);
    console.error('\nMake sure sharp is installed:');
    console.error('  npm install sharp --save-dev');
    process.exit(1);
  }
}

generateFavicons();

