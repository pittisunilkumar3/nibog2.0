# PowerShell script to generate favicons from SVG
# This script uses .NET libraries to convert SVG to PNG

Write-Host "🎨 NIBOG Favicon Generator" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
$publicPath = Join-Path (Split-Path -Parent $scriptPath) "public"
$svgPath = Join-Path $publicPath "noboggamelogo.svg"

if (-not (Test-Path $svgPath)) {
    Write-Host "❌ Error: SVG file not found at $svgPath" -ForegroundColor Red
    exit 1
}

Write-Host "📁 Source SVG: $svgPath" -ForegroundColor Green
Write-Host ""

# Check if we can use online converter
Write-Host "⚠️  Note: PowerShell doesn't have built-in SVG to PNG conversion." -ForegroundColor Yellow
Write-Host ""
Write-Host "Please use one of these methods:" -ForegroundColor Yellow
Write-Host ""
Write-Host "Method 1: Use the HTML generator" -ForegroundColor Cyan
Write-Host "  1. Open scripts/generate-favicons.html in your browser"
Write-Host "  2. Click 'Generate All Favicons'"
Write-Host "  3. Download each file and save to public/ folder"
Write-Host ""
Write-Host "Method 2: Use an online converter" -ForegroundColor Cyan
Write-Host "  1. Go to https://cloudconvert.com/svg-to-png"
Write-Host "  2. Upload: $svgPath"
Write-Host "  3. Convert to these sizes:"
Write-Host "     - 192x192 → save as logo192.png"
Write-Host "     - 512x512 → save as logo512.png"
Write-Host "     - 32x32 → save as favicon.ico"
Write-Host ""
Write-Host "Method 3: Install ImageMagick" -ForegroundColor Cyan
Write-Host "  1. Download from: https://imagemagick.org/script/download.php#windows"
Write-Host "  2. Install ImageMagick"
Write-Host "  3. Run these commands:"
Write-Host "     magick $svgPath -resize 192x192 -background white -flatten $(Join-Path $publicPath 'logo192.png')"
Write-Host "     magick $svgPath -resize 512x512 -background white -flatten $(Join-Path $publicPath 'logo512.png')"
Write-Host "     magick $svgPath -resize 32x32 -background white -flatten $(Join-Path $publicPath 'favicon.ico')"
Write-Host ""

# Open the HTML generator in default browser
$htmlPath = Join-Path $scriptPath "generate-favicons.html"
if (Test-Path $htmlPath) {
    Write-Host "🌐 Opening HTML generator in your browser..." -ForegroundColor Green
    Start-Process $htmlPath
} else {
    Write-Host "⚠️  HTML generator not found at $htmlPath" -ForegroundColor Yellow
}

