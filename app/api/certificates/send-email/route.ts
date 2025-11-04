import { NextResponse } from 'next/server'
import nodemailer from 'nodemailer'
import { getCertificateTemplateById } from '@/services/certificateTemplateService'
import puppeteer from 'puppeteer'

/**
 * Generate HTML for certificate from template and certificate data (server-side version matching frontend)
 */
async function generateCertificateHTML(template: any, certificate: any): Promise<string> {
  try {
    // Validate inputs
    if (!template) {
      throw new Error('Template is required')
    }

    if (!certificate) {
      throw new Error('Certificate data is required')
    }

    // Handle background styling - support both legacy and new background options
    let backgroundStyle = '';
    let backgroundImageElement = '';

    // Check if we have new background_style or need to use legacy background_image
    if (template.background_style && template.background_style.type) {
      console.log('Using new background style:', template.background_style);

      if (template.background_style.type === 'image') {
        const imageUrl = template.background_style.image_url || template.background_image;
        if (imageUrl && imageUrl !== 'null' && imageUrl !== null) {
          // Construct the correct URL for local images
          let backgroundImageUrl;
          if (imageUrl.startsWith('http')) {
            backgroundImageUrl = imageUrl;
          } else {
            // For local images, construct the full file path
            const path = require('path');
            const fs = require('fs');

            // Try to read the file directly from the public folder
            const publicPath = path.join(process.cwd(), 'public', imageUrl.startsWith('/') ? imageUrl.substring(1) : imageUrl);

            try {
              if (fs.existsSync(publicPath)) {
                // Read the file and convert to base64
                const imageBuffer = fs.readFileSync(publicPath);
                const base64Image = imageBuffer.toString('base64');

                // Determine MIME type based on file extension
                const ext = path.extname(publicPath).toLowerCase();
                let mimeType = 'image/jpeg'; // default
                if (ext === '.png') mimeType = 'image/png';
                else if (ext === '.gif') mimeType = 'image/gif';
                else if (ext === '.webp') mimeType = 'image/webp';
                else if (ext === '.svg') mimeType = 'image/svg+xml';

                backgroundImageUrl = `data:${mimeType};base64,${base64Image}`;
              } else {
                // Fallback to URL approach
                const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
                backgroundImageUrl = `${baseUrl}${imageUrl.startsWith('/') ? '' : '/'}${imageUrl}`;
              }
            } catch (fileError) {
              // Fallback to URL approach
              const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
              backgroundImageUrl = `${baseUrl}${imageUrl.startsWith('/') ? '' : '/'}${imageUrl}`;
            }
          }

          // Convert to base64 if not already done
          if (backgroundImageUrl.startsWith('data:')) {
            // Already base64, use directly
            backgroundImageElement = `<img src="${backgroundImageUrl}" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; object-fit: cover; z-index: -1;" alt="Certificate Background">`;
          } else {
            // Try to convert image to base64 for better PDF compatibility
            try {
              const imageResponse = await fetch(backgroundImageUrl);
              if (imageResponse.ok) {
                const imageBuffer = await imageResponse.arrayBuffer();
                const base64Image = Buffer.from(imageBuffer).toString('base64');
                const mimeType = imageResponse.headers.get('content-type') || 'image/jpeg';
                const dataUrl = `data:${mimeType};base64,${base64Image}`;

                backgroundImageElement = `<img src="${dataUrl}" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; object-fit: cover; z-index: -1;" alt="Certificate Background">`;
              } else {
                backgroundImageElement = `<img src="${backgroundImageUrl}" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; object-fit: cover; z-index: -1;" alt="Certificate Background">`;
              }
            } catch (fetchError) {
              backgroundImageElement = `<img src="${backgroundImageUrl}" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; object-fit: cover; z-index: -1;" alt="Certificate Background">`;
            }
          }
        }
      } else if (template.background_style.type === 'solid' && template.background_style.solid_color) {
        backgroundStyle = `background-color: ${template.background_style.solid_color};`;
      } else if (template.background_style.type === 'gradient' && template.background_style.gradient_colors?.length === 2) {
        backgroundStyle = `background: linear-gradient(135deg, ${template.background_style.gradient_colors[0]}, ${template.background_style.gradient_colors[1]});`;
      }
    } else if (template.background_image && template.background_image !== 'null' && template.background_image !== null) {
      // Legacy background image support - use img element for PDF
      let backgroundImageUrl;
      if (template.background_image.startsWith('http')) {
        backgroundImageUrl = template.background_image;
      } else {
        // For local images, construct the full file path
        const path = require('path');
        const fs = require('fs');

        // Try to read the file directly from the public folder
        const publicPath = path.join(process.cwd(), 'public', template.background_image.startsWith('/') ? template.background_image.substring(1) : template.background_image);

        try {
          if (fs.existsSync(publicPath)) {
            // Read the file and convert to base64
            const imageBuffer = fs.readFileSync(publicPath);
            const base64Image = imageBuffer.toString('base64');

            // Determine MIME type based on file extension
            const ext = path.extname(publicPath).toLowerCase();
            let mimeType = 'image/jpeg'; // default
            if (ext === '.png') mimeType = 'image/png';
            else if (ext === '.gif') mimeType = 'image/gif';
            else if (ext === '.webp') mimeType = 'image/webp';
            else if (ext === '.svg') mimeType = 'image/svg+xml';

            backgroundImageUrl = `data:${mimeType};base64,${base64Image}`;
          } else {
            // Fallback to URL approach
            const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
            backgroundImageUrl = `${baseUrl}${template.background_image.startsWith('/') ? '' : '/'}${template.background_image}`;
          }
        } catch (fileError) {
          // Fallback to URL approach
          const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
          backgroundImageUrl = `${baseUrl}${template.background_image.startsWith('/') ? '' : '/'}${template.background_image}`;
        }
      }

      // Convert to base64 if not already done
      if (backgroundImageUrl.startsWith('data:')) {
        // Already base64, use directly
        backgroundImageElement = `<img src="${backgroundImageUrl}" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; object-fit: cover; z-index: -1;" alt="Certificate Background">`;
      } else {
        // Try to convert legacy image to base64 as well
        try {
          const imageResponse = await fetch(backgroundImageUrl);
          if (imageResponse.ok) {
            const imageBuffer = await imageResponse.arrayBuffer();
            const base64Image = Buffer.from(imageBuffer).toString('base64');
            const mimeType = imageResponse.headers.get('content-type') || 'image/jpeg';
            const dataUrl = `data:${mimeType};base64,${base64Image}`;

            backgroundImageElement = `<img src="${dataUrl}" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; object-fit: cover; z-index: -1;" alt="Certificate Background">`;
          } else {
            backgroundImageElement = `<img src="${backgroundImageUrl}" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; object-fit: cover; z-index: -1;" alt="Certificate Background">`;
          }
        } catch (fetchError) {
          backgroundImageElement = `<img src="${backgroundImageUrl}" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; object-fit: cover; z-index: -1;" alt="Certificate Background">`;
        }
      }
    }



    // Generate fields HTML
    let fieldsHTML = '';

    if (template.fields && Array.isArray(template.fields)) {
      template.fields.forEach((field: any, index: number) => {
        try {
          if (!field || !field.type) {
            return;
          }

          // Skip fields that are handled separately (like frontend does)
          const fieldName = field.name.toLowerCase();
          if (fieldName.includes('certificate') && fieldName.includes('title') ||
              (fieldName.includes('event') && fieldName.includes('name')) ||
              fieldName.includes('participant') || (fieldName.includes('name') && !fieldName.includes('event') && !fieldName.includes('venue') && !fieldName.includes('city'))) {
            return; // Skip these fields as they're handled separately
          }

          // Get field value using the same logic as frontend
          const fieldContent = getFieldValue(field, certificate, template);

          // Skip empty fields unless they're required
          if (!fieldContent && !field.required) {
            return;
          }

          // Apply field styling using percentage-based positioning like frontend
          const x = field.x || 50; // Default to center
          const y = field.y || 50; // Default to center

          const fieldStyle = `
            position: absolute;
            left: ${x}%;
            top: ${y}%;
            transform: translate(-50%, -50%);
            font-size: ${field.font_size || 24}px;
            color: ${field.color || '#000000'};
            text-align: ${field.alignment || 'center'};
            font-family: ${field.font_family || 'Arial, sans-serif'};
            ${field.underline ? 'text-decoration: underline;' : ''}
            ${field.width ? `width: ${field.width}px;` : ''}
            ${field.height ? `height: ${field.height}px;` : ''}
          `;

          const fieldHTML = `<div style="${fieldStyle}">${fieldContent}</div>`;
          fieldsHTML += fieldHTML;
        } catch (fieldError) {
          console.error(`Error processing field ${index}:`, fieldError);
        }
      });
    }

    // Generate certificate title (it's a simple string field, not an array)
    let certificateTitle = '';
    if (template.certificate_title) {
      const titleContent = parseVariables(template.certificate_title, certificate);

      // Certificate title is typically centered at the top
      const titleStyle = `
        position: absolute;
        left: 50%;
        top: 15%;
        transform: translate(-50%, -50%);
        font-family: Arial, sans-serif;
        font-size: 36px;
        font-weight: bold;
        color: #000000;
        text-align: center;
        text-decoration: underline;
      `;

      certificateTitle = `<div style="${titleStyle}">${titleContent}</div>`;
    }

    // Generate participant name element (look for participant name field in template fields)
    const participantNameField = template.fields.find((field: any) =>
      field.name.toLowerCase().includes('participant') && field.name.toLowerCase().includes('name')
    );

    const participantName = certificate.child_name || certificate.certificate_data?.participant_name || certificate.parent_name || 'Participant';

    const participantNameHTML = participantNameField ? `
      <div class="participant-name" style="
        position: absolute;
        left: ${participantNameField.x}%;
        top: ${participantNameField.y}%;
        transform: translate(-50%, -50%);
        font-size: ${participantNameField.font_size || 28}px;
        font-weight: bold;
        color: ${participantNameField.color || '#333333'};
        font-family: '${participantNameField.font_family || 'Arial'}', sans-serif;
        text-align: ${participantNameField.alignment || 'center'};
        width: 90%;
        ${participantNameField.underline ? 'text-decoration: underline;' : ''}
      ">
        ${participantName}
      </div>
    ` : '';

    // Generate appreciation text if present with variable parsing
    // Position it dynamically based on participant name field position
    const appreciationTopPosition = participantNameField ? participantNameField.y + 20 : 65;

    const appreciationText = template.appreciation_text ? `
      <div class="appreciation-text" style="
        position: absolute;
        left: 50%;
        top: ${appreciationTopPosition}%;
        transform: translateX(-50%);
        text-align: center;
        width: 80%;
        font-family: Arial, sans-serif;
        font-size: 16px;
        line-height: 1.6;
        color: #333;
        white-space: pre-line;
      ">
        ${parseVariables(template.appreciation_text, certificate)}
      </div>
    ` : '';

    // Determine paper size and orientation
    const paperSize = template.paper_size || 'A4';
    const orientation = template.orientation || 'landscape';

    let containerWidth, containerHeight;
    if (paperSize === 'A4') {
      if (orientation === 'landscape') {
        containerWidth = 1123;
        containerHeight = 794;
      } else {
        containerWidth = 794;
        containerHeight = 1123;
      }
    } else if (paperSize === 'A3') {
      if (orientation === 'landscape') {
        containerWidth = 1587;
        containerHeight = 1123;
      } else {
        containerWidth = 1123;
        containerHeight = 1587;
      }
    } else { // Letter
      if (orientation === 'landscape') {
        containerWidth = 1056;
        containerHeight = 816;
      } else {
        containerWidth = 816;
        containerHeight = 1056;
      }
    }

    // Extract background image URL for preloading (if using background image element)
    let preloadImageHTML = '';
    if (backgroundImageElement) {
      const urlMatch = backgroundImageElement.match(/src="([^"]+)"/);
      if (urlMatch && urlMatch[1]) {
        const imageUrl = urlMatch[1];
        preloadImageHTML = `<link rel="preload" as="image" href="${imageUrl}">`;
      }
    }



    const finalHTML = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Certificate</title>
  ${preloadImageHTML}
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: Arial, sans-serif;
      background-color: #f0f0f0;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      padding: 20px;
    }
    .certificate-container {
      position: relative;
      width: ${containerWidth}px;
      height: ${containerHeight}px;
      ${backgroundStyle}
      border: 1px solid #ddd;
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
      overflow: hidden;
    }
    .certificate-container > * {
      position: relative;
      z-index: 1;
    }
    ${template.background_style?.border_enabled ? `
    .certificate-container::before {
      content: '';
      position: absolute;
      top: 20px;
      left: 20px;
      right: 20px;
      bottom: 20px;
      border: ${template.background_style.border_width || 2}px ${template.background_style.border_style || 'solid'} ${template.background_style.border_color || '#000000'};
      pointer-events: none;
    }
    ` : ''}
    .field {
      position: absolute;
      text-align: center;
    }
  </style>
</head>
<body>
  <div class="certificate-container">
    ${backgroundImageElement}
    ${certificateTitle}
    ${participantNameHTML}
    ${fieldsHTML}
    ${appreciationText}
  </div>
</body>
</html>
    `;

    return finalHTML;
  } catch (error) {
    console.error('Error generating certificate HTML:', error);
    throw error;
  }
}

/**
 * Enhanced field data mapping function that handles various field name formats
 */
function getFieldValue(field: any, certificate: any, template?: any): string {
  const certData = certificate.certificate_data || {}
  const fieldName = field.name.toLowerCase()

  // Handle signature fields
  if (field.type === 'signature') {
    if (field.signature_type === 'image' && template?.signature_image) {
      return template.signature_image; // Return the image URL for signature fields
    } else {
      return 'Authorized Signature'; // Default text for signature fields
    }
  }

  // Direct field name mapping
  const directMappings: Record<string, any> = {
    'participant name': certificate.child_name || certData.participant_name || certificate.parent_name,
    'participant_name': certificate.child_name || certData.participant_name || certificate.parent_name,
    'child name': certificate.child_name || certData.participant_name,
    'child_name': certificate.child_name || certData.participant_name,
    'event name': certData.event_name || certificate.event_title,
    'event_name': certData.event_name || certificate.event_title,
    'game name': certificate.game_name || certData.game_name,
    'game_name': certificate.game_name || certData.game_name,
    'venue name': certData.venue_name || certificate.venue_name,
    'venue_name': certData.venue_name || certificate.venue_name,
    'city name': certData.city_name || certificate.city_name,
    'city_name': certData.city_name || certificate.city_name,
    'certificate number': certData.certificate_number || certificate.certificate_number,
    'certificate_number': certData.certificate_number || certificate.certificate_number,
    'event date': certificate.event_date || certData.event_date,
    'event_date': certificate.event_date || certData.event_date,
    'date': certificate.generated_at ? new Date(certificate.generated_at).toLocaleDateString() : new Date().toLocaleDateString(),
    'generated_at': certificate.generated_at ? new Date(certificate.generated_at).toLocaleDateString() : new Date().toLocaleDateString(),
    'score': certData.score || certData.points || '',
    'instructor': certData.instructor || certData.teacher || '',
    'organization': certData.organization || 'Nibog Events',
    'signature': field.signature_type === 'image' && template?.signature_image ? template.signature_image : 'Authorized Signature',
  }

  // Try direct mapping first
  if (directMappings[fieldName]) {
    return String(directMappings[fieldName])
  }

  // Try field name variations
  const fieldNameVariations = [
    fieldName,
    fieldName.replace(/\s+/g, '_'),
    fieldName.replace(/_/g, ' '),
    fieldName.replace(/\s+/g, ''),
    field.name, // Original field name
  ]

  // Search in certificate data
  for (const variation of fieldNameVariations) {
    if (certData[variation] !== undefined && certData[variation] !== null) {
      return String(certData[variation])
    }
    if ((certificate as any)[variation] !== undefined && (certificate as any)[variation] !== null) {
      return String((certificate as any)[variation])
    }
  }

  // Fallback to field name if no value found
  return field.name
}

/**
 * Parse variables in text and replace them with actual certificate data
 */
function parseVariables(text: string, data: any): string {
  if (!text) return text;

  return text
    .replace(/\{participant_name\}/g, data.child_name || data.user_name || data.parent_name || 'Participant')
    .replace(/\{child_name\}/g, data.child_name || 'Child')
    .replace(/\{user_name\}/g, data.user_name || 'User')
    .replace(/\{parent_name\}/g, data.parent_name || 'Parent')
    .replace(/\{event_name\}/g, data.event_name || 'Event')
    .replace(/\{position\}/g, data.position || 'Position')
    .replace(/\{achievement\}/g, data.achievement || 'Achievement')
    .replace(/\{date\}/g, data.date || new Date().toLocaleDateString())
    .replace(/\{current_date\}/g, new Date().toLocaleDateString());
}

/**
 * Generate PDF from HTML using Puppeteer
 */
async function generatePDFWithPuppeteer(html: string): Promise<Buffer> {
  let browser;
  try {
    console.log('Launching Puppeteer browser...')
    console.log('HTML content length:', html.length)

    // Platform-specific Puppeteer configuration
    const isWindows = process.platform === 'win32'
    const isProduction = process.env.NODE_ENV === 'production'

    const launchOptions = {
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--disable-gpu',
        '--disable-web-security',
        '--disable-features=VizDisplayCompositor',
        '--disable-extensions',
        '--disable-plugins',
        '--disable-images', // Disable image loading for faster rendering
        ...(isWindows ? [
          '--disable-background-timer-throttling',
          '--disable-backgrounding-occluded-windows',
          '--disable-renderer-backgrounding'
        ] : [
          '--no-zygote',
          '--single-process'
        ]),
        ...(isProduction ? [
          '--disable-dev-shm-usage',
          '--disable-background-timer-throttling',
          '--disable-backgrounding-occluded-windows',
          '--disable-renderer-backgrounding',
          '--disable-features=TranslateUI',
          '--disable-ipc-flooding-protection'
        ] : [])
      ],
      // Add timeout for production environments
      timeout: isProduction ? 60000 : 30000
    }

    browser = await puppeteer.launch(launchOptions)
    const page = await browser.newPage()

    // Set viewport to match certificate dimensions (A4 landscape)
    await page.setViewport({
      width: 1123,
      height: 794,
      deviceScaleFactor: 2
    })

    await page.setContent(html, {
      waitUntil: ['networkidle0', 'load'],
      timeout: 30000
    })

    // Wait for all images to load completely
    await page.evaluate(() => {
      return new Promise((resolve) => {
        const images = Array.from(document.images)

        if (images.length === 0) {
          resolve({ success: true, message: 'No images found' })
          return
        }

        let loadedCount = 0
        let errorCount = 0

        const checkComplete = () => {
          if (loadedCount + errorCount === images.length) {
            resolve({
              success: loadedCount > 0,
              message: `${loadedCount} loaded, ${errorCount} failed`
            })
          }
        }

        images.forEach((img: any) => {
          if (img.complete) {
            if (img.naturalWidth > 0) {
              loadedCount++
            } else {
              errorCount++
            }
            checkComplete()
          } else {
            img.addEventListener('load', () => {
              loadedCount++
              checkComplete()
            })
            img.addEventListener('error', () => {
              errorCount++
              checkComplete()
            })
          }
        })

        // Fallback timeout
        setTimeout(() => {
          resolve({
            success: false,
            message: 'Timeout waiting for images'
          })
        }, 15000)
      })
    })

    // Wait for background images to load (they're not in document.images)
    await new Promise(resolve => setTimeout(resolve, 3000))

    const pdfBuffer = await page.pdf({
      format: 'A4',
      landscape: true,
      printBackground: true,
      preferCSSPageSize: false,
      margin: {
        top: '0mm',
        right: '0mm',
        bottom: '0mm',
        left: '0mm'
      }
    })

    return Buffer.from(pdfBuffer)
  } catch (error: any) {
    console.error('Error generating PDF with Puppeteer:', error)
    throw error
  } finally {
    if (browser) {
      await browser.close()
    }
  }
}

export async function POST(request: Request) {
  try {
    const requestBody = await request.json()
    const { certificateIds, customMessage, includePdf, replyTo, settings, certificatesData } = requestBody

    // Validate required fields
    if (!certificateIds || !Array.isArray(certificateIds) || certificateIds.length === 0) {
      return NextResponse.json(
        { error: 'Certificate IDs are required' },
        { status: 400 }
      )
    }

    if (!settings) {
      return NextResponse.json(
        { error: 'Email settings are required' },
        { status: 400 }
      )
    }

    if (!certificatesData || !Array.isArray(certificatesData)) {
      return NextResponse.json(
        { error: 'Certificate data is required' },
        { status: 400 }
      )
    }

    // Create transporter using the email settings
    const transporter = nodemailer.createTransport({
      host: settings.smtp_host,
      port: settings.smtp_port,
      secure: settings.smtp_port === 465, // true for 465, false for other ports
      auth: {
        user: settings.smtp_username,
        pass: settings.smtp_password,
      },
      tls: {
        rejectUnauthorized: false // Allow self-signed certificates
      }
    })

    // Verify transporter configuration
    try {
      await transporter.verify()
    } catch (verifyError) {
      console.error('SMTP verification failed:', verifyError)
      return NextResponse.json(
        { error: 'Email server configuration error' },
        { status: 500 }
      )
    }

    let sentCount = 0
    let failedCount = 0
    const failedEmails: string[] = []

    // Process each certificate
    for (let index = 0; index < certificatesData.length; index++) {
      const certificateData = certificatesData[index];
      try {



        // Prioritize parent_email first, then user_email
        let recipientEmail = certificateData.parent_email || certificateData.user_email

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

        // If the email fields don't contain valid emails, check if name fields contain emails (due to potential data swap)
        if (!recipientEmail || !emailRegex.test(recipientEmail)) {
          // Check if parent_name or user_name contain email addresses (in case of data swap)
          if (certificateData.parent_name && emailRegex.test(certificateData.parent_name)) {
            recipientEmail = certificateData.parent_name
          } else if (certificateData.user_name && emailRegex.test(certificateData.user_name)) {
            recipientEmail = certificateData.user_name
          }
        }

        if (!recipientEmail || !emailRegex.test(recipientEmail)) {
          console.error(`Invalid or missing email for certificate ${certificateData.id}`)
          failedCount++
          continue
        }

        // Prepare email content
        const participantName = certificateData.child_name || certificateData.user_name || 'Participant'
        const subject = `Certificate for ${participantName}`

        let htmlContent = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">Certificate Ready</h2>
            <p>Dear Parent,</p>
            <p>We are pleased to inform you that the certificate for <strong>${participantName}</strong> is now ready.</p>
            <p>Please find the certificate attached to this email as a PDF file.</p>
        `

        if (customMessage) {
          htmlContent += `<div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p><strong>Additional Message:</strong></p>
            <p>${customMessage}</p>
          </div>`
        }

        htmlContent += `
            <p>Best regards,<br>
            ${settings.sender_name}</p>
          </div>
        `

        // Generate PDF attachment if requested
        const attachments = []

        if (includePdf !== false) {
          try {

            // Get the certificate template
            const template = await getCertificateTemplateById(certificateData.template_id)

            if (template) {
              try {
                // Generate HTML for the certificate using the same logic as frontend downloads
                const certificateHTML = await generateCertificateHTML(template, certificateData)

                // Generate PDF using Puppeteer
                const pdfBuffer = await generatePDFWithPuppeteer(certificateHTML)

                const filename = `${participantName.replace(/[^a-zA-Z0-9]/g, '_')}_Certificate.pdf`

                attachments.push({
                  filename: filename,
                  content: pdfBuffer,
                  contentType: 'application/pdf'
                })
              } catch (htmlOrPdfError) {
                console.error('Error in HTML generation or PDF creation:', htmlOrPdfError)

                // Fallback: Create a simple PDF with basic certificate info
                const fallbackHTML = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Certificate</title>
  <style>
    body { font-family: Arial, sans-serif; padding: 50px; text-align: center; }
    .certificate { border: 2px solid #000; padding: 50px; margin: 20px; }
    .title { font-size: 36px; font-weight: bold; margin-bottom: 30px; }
    .name { font-size: 24px; margin: 20px 0; }
    .text { font-size: 18px; margin: 10px 0; }
  </style>
</head>
<body>
  <div class="certificate">
    <div class="title">Certificate of Achievement</div>
    <div class="text">This is to certify that</div>
    <div class="name">${participantName}</div>
    <div class="text">has successfully completed the requirements</div>
    <div class="text">Date: ${new Date().toLocaleDateString()}</div>
  </div>
</body>
</html>`

                const fallbackPdfBuffer = await generatePDFWithPuppeteer(fallbackHTML)
                const filename = `${participantName.replace(/[^a-zA-Z0-9]/g, '_')}_Certificate.pdf`

                attachments.push({
                  filename: filename,
                  content: fallbackPdfBuffer,
                  contentType: 'application/pdf'
                })
              }
            } else {
              console.error('Template not found for certificate ID:', certificateData.template_id)

              // Create a basic PDF even without template
              const basicHTML = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Certificate</title>
  <style>
    body { font-family: Arial, sans-serif; padding: 50px; text-align: center; }
    .certificate { border: 2px solid #000; padding: 50px; margin: 20px; }
    .title { font-size: 36px; font-weight: bold; margin-bottom: 30px; }
    .name { font-size: 24px; margin: 20px 0; }
    .text { font-size: 18px; margin: 10px 0; }
  </style>
</head>
<body>
  <div class="certificate">
    <div class="title">Certificate</div>
    <div class="text">This is to certify that</div>
    <div class="name">${participantName}</div>
    <div class="text">has participated in our program</div>
    <div class="text">Date: ${new Date().toLocaleDateString()}</div>
  </div>
</body>
</html>`

              const basicPdfBuffer = await generatePDFWithPuppeteer(basicHTML)
              const filename = `${participantName.replace(/[^a-zA-Z0-9]/g, '_')}_Certificate.pdf`

              attachments.push({
                filename: filename,
                content: basicPdfBuffer,
                contentType: 'application/pdf'
              })
            }
          } catch (pdfError: any) {
            console.error(`Error generating PDF for certificate ${certificateData.id}:`, pdfError)
          }
        }

        // Email options
        const mailOptions = {
          from: `"${settings.sender_name}" <${settings.sender_email}>`,
          to: recipientEmail,
          subject: subject,
          html: htmlContent,
          replyTo: replyTo || settings.sender_email,
          attachments: attachments
        }

        // Send email
        await transporter.sendMail(mailOptions)
        sentCount++

        // Add a small delay between emails for bulk operations to avoid overwhelming the SMTP server
        if (certificatesData.length > 1 && index < certificatesData.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000)) // 1 second delay
        }

      } catch (error) {
        console.error(`Error sending email for certificate ${certificateData.id}:`, error)
        failedCount++
        const failedEmail = certificateData?.parent_email || certificateData?.user_email
        if (failedEmail) {
          failedEmails.push(failedEmail)
        }
      }
    }

    return NextResponse.json({
      success: sentCount > 0, // Consider it successful if at least one email was sent
      sent: sentCount,
      failed: failedCount,
      failedEmails: failedEmails,
      message: sentCount > 0
        ? `Successfully sent ${sentCount} certificate${sentCount !== 1 ? 's' : ''} via email${failedCount > 0 ? ` (${failedCount} failed)` : ''}`
        : `Failed to send any certificates. ${failedCount} failed.`
    })

  } catch (error: any) {
    console.error('Error sending certificate email:', error)

    // Handle specific nodemailer errors
    if (error.code === 'EAUTH') {
      return NextResponse.json(
        { error: 'Email authentication failed. Please check email settings.' },
        { status: 500 }
      )
    } else if (error.code === 'ECONNECTION') {
      return NextResponse.json(
        { error: 'Could not connect to email server. Please check email settings.' },
        { status: 500 }
      )
    } else {
      return NextResponse.json(
        { error: error.message || 'Failed to send email' },
        { status: 500 }
      )
    }
  }
}
