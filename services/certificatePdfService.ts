import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { saveAs } from 'file-saver';
import JSZip from 'jszip';
import { downloadCertificateHTML } from './certificateGenerationService';
import { CertificateDownloadResponse, CertificateTemplate, CertificateData, CertificateListItem, CertificateField } from '@/types/certificate';
import { getCertificateTemplateById } from '@/services/certificateTemplateService';

/**
 * Generate and download PDF from certificate HTML (API-based)
 */
export async function generateCertificatePDF(
  certificateId: number,
  filename?: string
): Promise<void> {
  try {
    // Get HTML from API
    const certificateData = await downloadCertificateHTML(certificateId);

    if (!certificateData || !certificateData.html) {
      throw new Error('Failed to get certificate HTML');
    }

    // Generate PDF from HTML
    await generatePDFFromHTML(
      certificateData.html,
      filename || certificateData.filename || `certificate_${certificateId}.pdf`
    );
  } catch (error) {
    console.error('Error generating certificate PDF:', error);
    throw error;
  }
}

/**
 * Generate and download PDF from certificate data (Frontend-only using preview modal logic)
 */
export async function generateCertificatePDFFrontend(
  certificate: CertificateListItem,
  filename?: string
): Promise<void> {
  try {
    console.log('Generating PDF for certificate:', certificate);

    // Use the same template fetching logic as the preview modal
    const template = await getCertificateTemplateById(certificate.template_id);

    if (!template) {
      throw new Error(`Failed to get certificate template with ID: ${certificate.template_id}`);
    }

    console.log('Using template:', template);

    // Generate HTML using the exact same logic as the preview modal
    const html = generateCertificateHTMLFromPreview(template, certificate);

    console.log('Generated HTML length:', html.length);
    console.log('Generated HTML preview:', html.substring(0, 500) + '...');

    // For debugging: show the HTML in a modal first
    // Uncomment the next line to preview the HTML before PDF generation
    // previewCertificateHTML(html);

    // Generate PDF from HTML
    const pdfFilename = filename || `certificate_${certificate.child_name || certificate.user_name || certificate.id}.pdf`;
    await generatePDFFromHTML(html, pdfFilename);
  } catch (error) {
    console.error('Error generating certificate PDF (frontend):', error);
    throw error;
  }
}

/**
 * Generate and download multiple certificates as ZIP (Frontend-only)
 */
export async function generateBulkPDFsFrontend(
  certificates: CertificateListItem[],
  zipFilename: string,
  onProgress?: (current: number, total: number) => void
): Promise<void> {
  try {
    const zip = new JSZip();
    const total = certificates.length;

    // Cache templates to avoid repeated API calls
    const templateCache = new Map<number, CertificateTemplate>();

    for (let i = 0; i < certificates.length; i++) {
      const certificate = certificates[i];

      try {
        // Update progress
        if (onProgress) {
          onProgress(i, total);
        }

        // Get template (use cache if available)
        let template = templateCache.get(certificate.template_id);
        if (!template) {
          const fetchedTemplate = await getCertificateTemplateById(certificate.template_id);
          if (fetchedTemplate) {
            template = fetchedTemplate;
            templateCache.set(certificate.template_id, template);
          }
        }

        if (!template) {
          console.warn(`Failed to get template for certificate ${certificate.id}`);
          continue;
        }

        // Generate HTML using the same logic as the preview modal
        const html = generateCertificateHTMLFromPreview(template, certificate);

        // Generate PDF blob
        const pdfBlob = await generatePDFFromHTML_ToBlob(html);

        // Add to ZIP
        const participantName = certificate.child_name || certificate.user_name || certificate.parent_name || 'Participant';
        const filename = `${participantName.replace(/[^a-zA-Z0-9]/g, '_')}_Certificate_${certificate.id}.pdf`;
        zip.file(filename, pdfBlob);

      } catch (error) {
        console.error(`Error generating PDF for certificate ${certificate.id}:`, error);
        // Continue with other certificates
      }
    }

    // Update progress to complete
    if (onProgress) {
      onProgress(total, total);
    }

    // Generate and download ZIP
    const zipBlob = await zip.generateAsync({ type: 'blob' });
    saveAs(zipBlob, zipFilename);

  } catch (error) {
    console.error('Error generating bulk PDFs (frontend):', error);
    throw error;
  }
}

/**
 * Generate PDF blob from HTML string (without downloading)
 */
async function generatePDFBlob(html: string): Promise<Blob> {
  try {
    // Create a temporary container
    const tempContainer = document.createElement('div');
    tempContainer.innerHTML = html;
    tempContainer.style.position = 'absolute';
    tempContainer.style.left = '-9999px';
    tempContainer.style.top = '-9999px';
    tempContainer.style.width = '1123px'; // A4 landscape width in pixels
    tempContainer.style.height = '794px'; // A4 landscape height in pixels
    tempContainer.style.backgroundColor = 'white';

    // Add to DOM temporarily
    document.body.appendChild(tempContainer);

    // Wait for images to load
    await waitForImages(tempContainer);

    // Convert to canvas
    const canvas = await html2canvas(tempContainer, {
      scale: 2, // Higher quality
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      width: 1123,
      height: 794,
      scrollX: 0,
      scrollY: 0
    });

    // Remove temporary container
    document.body.removeChild(tempContainer);

    // Create PDF
    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    });

    // Calculate dimensions
    const imgWidth = 297; // A4 landscape width in mm
    const imgHeight = 210; // A4 landscape height in mm

    // Add image to PDF
    const imgData = canvas.toDataURL('image/png', 1.0);
    pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);

    // Return PDF as blob
    return pdf.output('blob');
  } catch (error) {
    console.error('Error generating PDF blob from HTML:', error);
    throw error;
  }
}

/**
 * Parse variables in text and replace them with actual certificate data (from preview modal)
 */
function parseVariablesFromPreview(text: string, certificate: CertificateListItem): string {
  if (!text) return text;

  const certData = certificate.certificate_data || {};

  // Define variable mappings
  const variables: Record<string, string> = {
    'participant_name': certificate.child_name || certData.participant_name || certificate.parent_name || 'Participant',
    'event_name': certData.event_name || certificate.event_title || 'Event',
    'game_name': certificate.game_name || certData.game_name || '',
    'venue_name': certData.venue_name || certificate.venue_name || '',
    'city_name': certData.city_name || certificate.city_name || '',
    'certificate_number': certData.certificate_number || certificate.certificate_number || '',
    'event_date': certificate.event_date || certData.event_date || '',
    'date': certificate.generated_at ? new Date(certificate.generated_at).toLocaleDateString() : new Date().toLocaleDateString(),
    'score': certData.score || certData.points || '',
    'instructor': certData.instructor || certData.teacher || '',
    'organization': certData.organization || 'Nibog Events',
  };

  // Replace variables in the format {variable_name}
  let parsedText = text;
  Object.entries(variables).forEach(([key, value]) => {
    const regex = new RegExp(`\\{${key}\\}`, 'gi');
    parsedText = parsedText.replace(regex, value);
  });

  return parsedText;
}

/**
 * Enhanced field data mapping function that handles various field name formats (from preview modal)
 */
function getFieldValue(field: CertificateField, certificate: CertificateListItem, template?: CertificateTemplate): string {
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
 * Generate HTML for certificate from template and certificate data (from preview modal)
 */
function generateCertificateHTMLFromPreview(
  template: CertificateTemplate,
  certificate: CertificateListItem
): string {
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

    // Check if we have new background_style or need to use legacy background_image
    if (template.background_style && template.background_style.type) {
      console.log('Using new background style:', template.background_style);

      if (template.background_style.type === 'image') {
        const imageUrl = template.background_style.image_url || template.background_image;
        if (imageUrl && imageUrl !== 'null' && imageUrl !== null) {
          const backgroundImageUrl = imageUrl.startsWith('http')
            ? imageUrl
            : `${window.location.origin}${imageUrl.startsWith('/') ? '' : '/'}${imageUrl}`;
          backgroundStyle = `background-image: url('${backgroundImageUrl}'); background-size: cover; background-position: center; background-repeat: no-repeat;`;
        }
      } else if (template.background_style.type === 'solid' && template.background_style.solid_color) {
        backgroundStyle = `background-color: ${template.background_style.solid_color};`;
      } else if (template.background_style.type === 'gradient' && template.background_style.gradient_colors?.length === 2) {
        backgroundStyle = `background: linear-gradient(135deg, ${template.background_style.gradient_colors[0]}, ${template.background_style.gradient_colors[1]});`;
      }
    } else if (template.background_image && template.background_image !== 'null' && template.background_image !== null) {
      console.log('Using legacy background image:', template.background_image);
      // Legacy background image support
      const backgroundImageUrl = template.background_image.startsWith('http')
        ? template.background_image
        : `${window.location.origin}${template.background_image.startsWith('/') ? '' : '/'}${template.background_image}`;
      backgroundStyle = `background-image: url('${backgroundImageUrl}'); background-size: cover; background-position: center; background-repeat: no-repeat;`;
    }

    console.log('Final background style:', backgroundStyle);

    // Generate fields HTML
    let fieldsHTML = '';

    if (template.fields && Array.isArray(template.fields)) {
      template.fields.forEach((field, index) => {
        try {
          // Skip fields that are handled separately
          const fieldName = field.name.toLowerCase();
          if (fieldName.includes('certificate') && fieldName.includes('title') ||
              (fieldName.includes('event') && fieldName.includes('name')) ||
              fieldName.includes('participant') || (fieldName.includes('name') && !fieldName.includes('event') && !fieldName.includes('venue') && !fieldName.includes('city'))) {
            return; // Skip these fields as they're handled separately
          }

          const fieldValue = getFieldValue(field, certificate, template);

          // Skip empty fields unless they're required
          if (!fieldValue && !field.required) {
            return;
          }

          // Validate field positioning
          const x = typeof field.x === 'number' ? field.x : 50
          const y = typeof field.y === 'number' ? field.y : 50

          // Handle different field types
          if (field.type === 'signature' && field.signature_type === 'image' && template.signature_image) {
            // Render signature as image
            fieldsHTML += `
              <div class="field signature-field" style="
                position: absolute;
                left: ${x}%;
                top: ${y}%;
                transform: translate(-50%, -50%);
                ${field.width ? `width: ${field.width}px;` : 'width: 150px;'}
                ${field.height ? `height: ${field.height}px;` : 'height: 50px;'}
              ">
                <img src="${template.signature_image}" alt="Signature" style="width: 100%; height: 100%; object-fit: contain;" />
              </div>
            `;
          } else {
            // Render as text field
            fieldsHTML += `
              <div class="field" style="
                position: absolute;
                left: ${x}%;
                top: ${y}%;
                font-size: ${field.font_size || 24}px;
                color: ${field.color || '#000000'};
                font-family: '${field.font_family || 'Arial'}', sans-serif;
                font-weight: bold;
                text-align: ${field.alignment || 'center'};
                transform: translate(-50%, -50%);
                ${field.width ? `width: ${field.width}px;` : ''}
                ${field.height ? `height: ${field.height}px;` : ''}
                ${field.underline ? 'text-decoration: underline;' : ''}
              ">
                ${fieldValue}
              </div>
            `;
          }
        } catch (fieldError) {
          console.warn(`Error processing field ${index}:`, fieldError)
          // Continue with other fields
        }
      });
    }

    // Generate certificate title - check for title field in template fields first
    let titleText = '';

    // First, look for a "Certificate Title" field in the template fields
    const titleField = template.fields?.find((field: any) =>
      field.name.toLowerCase().includes('certificate') && field.name.toLowerCase().includes('title')
    );

    if (titleField) {
      // Use the title from the field, but don't render it as a regular field (we'll skip it later)
      titleText = titleField.name === 'Certificate Title'
        ? `Certificate of ${template.type === 'participation' ? 'Participation' : (template.type === 'winner' ? 'Achievement' : 'Excellence')}`
        : titleField.name;
    } else if (template.certificate_title) {
      // Fallback to template.certificate_title if it exists
      titleText = template.certificate_title;
    } else {
      // Default title based on template type
      titleText = `Certificate of ${template.type === 'participation' ? 'Participation' : (template.type === 'winner' ? 'Achievement' : 'Excellence')}`;
    }

    // Check if title field has underline styling
    const titleFieldUnderline = titleField?.underline || false;

    const certificateTitle = titleText ? `
      <div class="certificate-title" style="
        position: absolute;
        left: 50%;
        top: 15%;
        transform: translateX(-50%);
        text-align: center;
        width: 90%;
        font-family: Arial, sans-serif;
        font-size: 32px;
        font-weight: bold;
        color: #333;
        text-transform: uppercase;
        letter-spacing: 2px;
        ${titleFieldUnderline ? 'text-decoration: underline;' : ''}
      ">
        ${parseVariablesFromPreview(titleText, certificate)}
      </div>
    ` : '';

    // Generate participant name element
    const participantNameField = template.fields?.find((field: any) =>
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
        ${parseVariablesFromPreview(template.appreciation_text, certificate)}
      </div>
    ` : '';

    return `
<!DOCTYPE html>
<html>
<head>
  <style>
    @page {
      size: ${template.paper_size || 'a4'} ${template.orientation || 'landscape'};
      margin: 0;
    }
    body {
      margin: 0;
      font-family: Arial;
      width: 100%;
      height: 100vh;
      background-color: #f5f5f5;
      display: flex;
      justify-content: center;
      align-items: center;
    }
    .certificate-container {
      width: ${(() => {
        if (template.paper_size === 'a4') {
          return template.orientation === 'landscape' ? '1000px' : '707px';
        } else if (template.paper_size === 'a3') {
          return template.orientation === 'landscape' ? '1414px' : '1000px';
        } else if (template.paper_size === 'letter') {
          return template.orientation === 'landscape' ? '1100px' : '850px';
        } else {
          return template.orientation === 'landscape' ? '1000px' : '750px';
        }
      })()};
      height: ${(() => {
        if (template.paper_size === 'a4') {
          return template.orientation === 'landscape' ? '707px' : '1000px';
        } else if (template.paper_size === 'a3') {
          return template.orientation === 'landscape' ? '1000px' : '1414px';
        } else if (template.paper_size === 'letter') {
          return template.orientation === 'landscape' ? '850px' : '1100px';
        } else {
          return template.orientation === 'landscape' ? '750px' : '1000px';
        }
      })()};
      ${backgroundStyle}
      position: relative;
      box-shadow: 0 4px 8px rgba(0,0,0,0.1);
      border-radius: 8px;
      overflow: hidden;
      margin: 0 auto;
    }
    .certificate-container::before {
      content: '';
      position: absolute;
      top: 20px;
      left: 20px;
      right: 20px;
      bottom: 20px;
      ${template.background_style?.border_enabled ? `
        border: ${template.background_style.border_width || 2}px ${template.background_style.border_style || 'solid'} ${template.background_style.border_color || '#000000'};
      ` : ''}
      pointer-events: none;
    }
    .field {
      position: absolute;
      text-align: center;
    }
    .certificate-title {
      position: absolute;
      text-align: center;
      width: 90%;
      left: 50%;
      transform: translateX(-50%);
      font-weight: bold;
      text-transform: uppercase;
      letter-spacing: 2px;
    }
    .appreciation-text {
      position: absolute;
      text-align: center;
      width: 80%;
      left: 50%;
      transform: translateX(-50%);
      line-height: 1.5;
      white-space: pre-line;
    }
  </style>
</head>
<body>
  <div class="certificate-container">
    ${certificateTitle}
    ${participantNameHTML}
    ${fieldsHTML}
    ${appreciationText}
  </div>
</body>
</html>
    `;
  } catch (error) {
    console.error('Error generating certificate HTML:', error)
    throw new Error(`Failed to generate certificate HTML: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * Get certificate template by ID
 */
async function getCertificateTemplate(templateId: number): Promise<CertificateTemplate | null> {
  try {
    console.log('Fetching template with ID:', templateId);

    const response = await fetch('/api/certificate-templates/get', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id: templateId }),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch template: ${response.statusText}`);
    }

    const data = await response.json();
    const template = data.template || data;

    console.log('Fetched template:', template);

    if (!template) {
      throw new Error('Template not found in response');
    }

    return template;
  } catch (error) {
    console.error('Error fetching certificate template:', error);
    return null;
  }
}

/**
 * Generate PDF from HTML string
 */
export async function generatePDFFromHTML(
  html: string,
  filename: string
): Promise<void> {
  try {
    console.log('Starting PDF generation for:', filename);
    console.log('HTML content length:', html.length);

    // Create a temporary container
    const tempContainer = document.createElement('div');
    tempContainer.innerHTML = html;
    tempContainer.style.position = 'absolute';
    tempContainer.style.left = '-9999px';
    tempContainer.style.top = '-9999px';
    tempContainer.style.width = '1123px'; // A4 landscape width in pixels
    tempContainer.style.height = '794px'; // A4 landscape height in pixels
    tempContainer.style.backgroundColor = 'white';

    // Add to DOM temporarily
    document.body.appendChild(tempContainer);

    console.log('Container added to DOM, content:', tempContainer.innerHTML.substring(0, 200));

    // Wait for images to load
    console.log('Waiting for images to load...');
    await waitForImages(tempContainer);
    console.log('Images loaded, converting to canvas...');

    // Convert to canvas
    const canvas = await html2canvas(tempContainer, {
      scale: 2, // Higher quality
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      width: 1123,
      height: 794,
      scrollX: 0,
      scrollY: 0
    });

    console.log('Canvas created, dimensions:', canvas.width, 'x', canvas.height);

    // Remove temporary container
    document.body.removeChild(tempContainer);

    // Create PDF
    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    });

    // Calculate dimensions
    const imgWidth = 297; // A4 landscape width in mm
    const imgHeight = 210; // A4 landscape height in mm

    // Add image to PDF
    const imgData = canvas.toDataURL('image/png', 1.0);
    pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);

    // Save PDF
    pdf.save(filename);
  } catch (error) {
    console.error('Error generating PDF from HTML:', error);
    throw error;
  }
}

/**
 * Wait for all images in container to load
 */
function waitForImages(container: HTMLElement): Promise<void> {
  return new Promise((resolve) => {
    const images = container.querySelectorAll('img');
    
    if (images.length === 0) {
      resolve();
      return;
    }

    let loadedCount = 0;
    const totalImages = images.length;

    const checkComplete = () => {
      loadedCount++;
      if (loadedCount === totalImages) {
        resolve();
      }
    };

    images.forEach((img) => {
      if (img.complete) {
        checkComplete();
      } else {
        img.onload = checkComplete;
        img.onerror = checkComplete; // Continue even if image fails to load
      }
    });

    // Fallback timeout
    setTimeout(resolve, 5000);
  });
}

/**
 * Preview certificate HTML in a modal
 */
export function previewCertificateHTML(html: string): void {
  // Create modal overlay
  const overlay = document.createElement('div');
  overlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.8);
    z-index: 9999;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
  `;

  // Create modal content
  const modal = document.createElement('div');
  modal.style.cssText = `
    background: white;
    border-radius: 8px;
    max-width: 95%;
    max-height: 95%;
    overflow: auto;
    position: relative;
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
  `;

  // Create close button
  const closeButton = document.createElement('button');
  closeButton.innerHTML = '×';
  closeButton.style.cssText = `
    position: absolute;
    top: 10px;
    right: 15px;
    background: none;
    border: none;
    font-size: 24px;
    cursor: pointer;
    z-index: 10000;
    color: #666;
    width: 30px;
    height: 30px;
    display: flex;
    align-items: center;
    justify-content: center;
  `;

  // Create iframe for preview
  const iframe = document.createElement('iframe');
  iframe.style.cssText = `
    width: 1000px;
    height: 750px;
    border: none;
    border-radius: 8px;
  `;

  // Set iframe content
  iframe.onload = () => {
    const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
    if (iframeDoc) {
      iframeDoc.open();
      iframeDoc.write(html);
      iframeDoc.close();
    }
  };

  // Close modal function
  const closeModal = () => {
    document.body.removeChild(overlay);
  };

  // Event listeners
  closeButton.onclick = closeModal;
  overlay.onclick = (e) => {
    if (e.target === overlay) {
      closeModal();
    }
  };

  // Escape key to close
  const handleEscape = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      closeModal();
      document.removeEventListener('keydown', handleEscape);
    }
  };
  document.addEventListener('keydown', handleEscape);

  // Assemble modal
  modal.appendChild(closeButton);
  modal.appendChild(iframe);
  overlay.appendChild(modal);
  document.body.appendChild(overlay);

  // Trigger iframe load
  iframe.src = 'about:blank';
}

/**
 * Generate certificate preview from template and sample data
 */
export async function generateCertificatePreview(
  template: CertificateTemplate,
  sampleData: CertificateData
): Promise<void> {
  try {
    // Generate HTML for the certificate
    const html = generateCertificateHTML(template, sampleData);

    // Show preview in modal
    previewCertificateHTML(html);
  } catch (error) {
    console.error('Error generating certificate preview:', error);
    throw error;
  }
}

/**
 * Parse variables in text and replace them with actual certificate data
 */
function parseVariables(text: string, data: CertificateData): string {
  if (!text) return text;

  // Define variable mappings
  const variables: Record<string, string> = {
    'participant_name': data.participant_name || 'John Doe',
    'event_name': data.event_name || 'Baby Crawling Championship 2024',
    'game_name': data.game_name || '',
    'venue_name': data.venue_name || 'Sports Arena',
    'city_name': data.city_name || 'New York',
    'certificate_number': data.certificate_number || 'CERT-001',
    'event_date': data.event_date || new Date().toLocaleDateString(),
    'date': data.event_date || new Date().toLocaleDateString(),
    'position': data.position || '1st Place',
    'score': data.score || '',
    'achievement': data.achievement || 'Outstanding Performance',
    'instructor': data.instructor || '',
    'organization': data.organization || 'Nibog Events',
  };

  // Replace variables in the format {variable_name}
  let parsedText = text;
  Object.entries(variables).forEach(([key, value]) => {
    const regex = new RegExp(`\\{${key}\\}`, 'gi');
    parsedText = parsedText.replace(regex, value);
  });

  return parsedText;
}

/**
 * Generate HTML for certificate from template and data
 */
function generateCertificateHTML(
  template: CertificateTemplate,
  data: CertificateData
): string {
  // Validate template
  if (!template) {
    throw new Error('Template is required');
  }

  // Ensure fields array exists
  if (!template.fields) {
    template.fields = [];
  }

  // Handle background styling - support both legacy and new background options
  let backgroundStyle = '';

  // Check if we have new background_style or need to use legacy background_image
  if (template.background_style && template.background_style.type) {
    console.log('Using new background style:', template.background_style);

    if (template.background_style.type === 'image') {
      const imageUrl = template.background_style.image_url || template.background_image;
      if (imageUrl && imageUrl !== 'null' && imageUrl !== null) {
        const backgroundImageUrl = imageUrl.startsWith('http')
          ? imageUrl
          : `${process.env.NEXT_PUBLIC_BASE_URL || (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3111')}${imageUrl.startsWith('/') ? '' : '/'}${imageUrl}`;
        backgroundStyle = `background-image: url('${backgroundImageUrl}'); background-size: cover; background-position: center; background-repeat: no-repeat;`;
      }
    } else if (template.background_style.type === 'solid' && template.background_style.solid_color) {
      backgroundStyle = `background-color: ${template.background_style.solid_color};`;
    } else if (template.background_style.type === 'gradient' && template.background_style.gradient_colors?.length === 2) {
      backgroundStyle = `background: linear-gradient(135deg, ${template.background_style.gradient_colors[0]}, ${template.background_style.gradient_colors[1]});`;
    }
  } else if (template.background_image && template.background_image !== 'null' && template.background_image !== null) {
    console.log('Using legacy background image:', template.background_image);
    // Legacy background image support
    const backgroundImageUrl = template.background_image.startsWith('http')
      ? template.background_image
      : `${process.env.NEXT_PUBLIC_BASE_URL || (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3111')}${template.background_image.startsWith('/') ? '' : '/'}${template.background_image}`;
    backgroundStyle = `background-image: url('${backgroundImageUrl}'); background-size: cover; background-position: center; background-repeat: no-repeat;`;
  }

  console.log('Final background style:', backgroundStyle);

  // Extract data values
  const participantName = data.participant_name || 'John Doe';

  // Generate certificate title - check for title field in template fields first
  let certificateTitle = '';
  let titleText = '';

  // First, look for a "Certificate Title" field in the template fields
  const titleField = template.fields?.find((field: any) =>
    field.name.toLowerCase().includes('certificate') && field.name.toLowerCase().includes('title')
  );

  if (titleField) {
    // Use the title from the field, but don't render it as a regular field (we'll skip it later)
    titleText = titleField.name === 'Certificate Title'
      ? `Certificate of ${template.type === 'participation' ? 'Participation' : (template.type === 'winner' ? 'Achievement' : 'Excellence')}`
      : titleField.name;
  } else if (template.certificate_title) {
    // Fallback to template.certificate_title if it exists
    titleText = template.certificate_title;
  } else {
    // Default title based on template type
    titleText = `Certificate of ${template.type === 'participation' ? 'Participation' : (template.type === 'winner' ? 'Achievement' : 'Excellence')}`;
  }

  if (titleText) {
    // Check if title field has underline styling
    const titleFieldUnderline = titleField?.underline || false;

    certificateTitle = `
      <div class="certificate-title" style="
        position: absolute;
        left: 50%;
        top: 15%;
        transform: translateX(-50%);
        text-align: center;
        width: 90%;
        font-family: Arial, sans-serif;
        font-size: 32px;
        font-weight: bold;
        color: #333;
        text-transform: uppercase;
        letter-spacing: 2px;
        ${titleFieldUnderline ? 'text-decoration: underline;' : ''}
      ">
        ${parseVariables(titleText, data)}
      </div>
    `;
  }

  // Get default appreciation text based on template type
  let defaultAppreciationText = '';
  if (template.type === 'participation') {
    defaultAppreciationText = `In recognition of enthusiastic participation in {event_name}.\nYour involvement, energy, and commitment at NIBOG are truly appreciated.\nThank you for being a valued part of the NIBOG community!`;
  } else if (template.type === 'winner') {
    defaultAppreciationText = `For achieving {achievement} in {event_name}.\nYour dedication, talent, and outstanding performance at NIBOG have distinguished you among the best.\nCongratulations on this remarkable achievement from the entire NIBOG team!`;
  }





  // Use structured appreciation text if available, otherwise use legacy text or default
  let appreciationContent = '';
  let appreciationStyle = {
    x: 50,
    y: 55,
    font_size: 16,
    font_family: 'Arial',
    color: '#333333',
    alignment: 'center',
    line_height: 1.6,
    max_width: 80
  };

  if (template.appreciation_text_style) {
    // Use new structured appreciation text
    appreciationContent = template.appreciation_text_style.text || template.appreciation_text || defaultAppreciationText;
    appreciationStyle = {
      x: template.appreciation_text_style.x || 50,
      y: template.appreciation_text_style.y || 55,
      font_size: template.appreciation_text_style.font_size || 16,
      font_family: template.appreciation_text_style.font_family || 'Arial',
      color: template.appreciation_text_style.color || '#333333',
      alignment: template.appreciation_text_style.alignment || 'center',
      line_height: template.appreciation_text_style.line_height || 1.6,
      max_width: template.appreciation_text_style.max_width || 80
    };
  } else {
    // Use legacy appreciation text
    appreciationContent = template.appreciation_text || defaultAppreciationText;
  }

  // Parse variables in the appreciation text
  appreciationContent = parseVariables(appreciationContent, data);

  // Format the text with line breaks converted to <br> tags
  const formattedText = appreciationContent.replace(/\n/g, '<br>');

  // Find the participant name field to use its styling properties
  let participantNameField = template.fields?.find((field: any) =>
    field.name.toLowerCase().includes('participant') && field.name.toLowerCase().includes('name')
  );

  // Set default position and styling if field doesn't exist
  const nameFieldStyle = participantNameField || {
    x: 50,
    y: 40,
    font_size: 28,
    font_family: 'Arial',
    color: '#333333',
    alignment: 'center'
  };

  // Create the participant name element separately above the appreciation text with custom styling
  const participantNameHTML = `
    <div class="participant-name" style="
      position: absolute;
      left: ${nameFieldStyle.x}%;
      top: ${nameFieldStyle.y}%;
      transform: translate(-50%, -50%);
      font-size: ${nameFieldStyle.font_size}px;
      font-weight: bold;
      color: ${nameFieldStyle.color || '#333333'};
      font-family: '${nameFieldStyle.font_family || 'Arial'}', sans-serif;
      text-align: ${nameFieldStyle.alignment || 'center'};
      width: 90%;
      ${participantNameField && (participantNameField as any).underline ? 'text-decoration: underline;' : ''}
    ">
      ${participantName}
    </div>
  `;

  // Add the appreciation text with custom positioning and styling
  const appreciationTextHTML = `
    <div class="appreciation-text" style="
      position: absolute;
      left: ${appreciationStyle.x}%;
      top: ${appreciationStyle.y}%;
      transform: translate(-50%, -50%);
      font-size: ${appreciationStyle.font_size}px;
      color: ${appreciationStyle.color};
      font-family: '${appreciationStyle.font_family}', sans-serif;
      text-align: ${appreciationStyle.alignment};
      width: ${appreciationStyle.max_width}%;
      line-height: ${appreciationStyle.line_height};
      white-space: pre-line;
    ">
      <div style="margin-top: 15px; margin-bottom: 20px;">
        ${formattedText}
      </div>
    </div>
  `;

  // Combine the certificate title, participant name and appreciation text
  const combinedContent = certificateTitle + participantNameHTML + appreciationTextHTML;

  let fieldsHTML = '';

  // Process each field in the template
  template.fields?.forEach((field: any) => {
    // Skip fields that are already handled separately
    const fieldName = field.name.toLowerCase();
    if ((fieldName.includes('event') && fieldName.includes('name')) ||
        (fieldName.includes('certificate') && fieldName.includes('title')) ||
        fieldName.includes('participant') || (fieldName.includes('name') && !fieldName.includes('event') && !fieldName.includes('venue') && !fieldName.includes('city'))) {
      // Skip these fields as they're already included elsewhere
      return;
    }

    // Map field names to data keys
    let value = '';

    if (fieldName.includes('date')) {
      value = data.event_date || new Date().toLocaleDateString();
    } else if (fieldName.includes('venue')) {
      value = data.venue_name || 'Sports Arena';
    } else if (fieldName.includes('city')) {
      value = data.city_name || 'New York';
    } else if (fieldName.includes('certificate') && fieldName.includes('number')) {
      value = data.certificate_number || 'CERT-001';
    } else {
      // For other fields, try to get value from data object or use field name
      value = (data as any)[fieldName] ||
              (data as any)[field.name.toLowerCase().replace(/\s+/g, '_')] ||
              (data as any)[field.name] ||
              field.name;
    }

    fieldsHTML += `
      <div class="field" style="
        position: absolute;
        left: ${field.x}%;
        top: ${field.y}%;
        font-size: ${field.font_size || 24}px;
        color: ${field.color || '#000000'};
        font-family: '${field.font_family || 'Arial'}', sans-serif;
        font-weight: bold;
        text-align: ${field.alignment || 'center'};
        transform: translate(-50%, -50%);
        ${field.underline ? 'text-decoration: underline;' : ''}
      ">
        ${value}
      </div>
    `;
  });

  // Calculate container dimensions based on paper size and orientation
  let containerWidth, containerHeight;

  if (template.paper_size === 'a4') {
    if (template.orientation === 'landscape') {
      containerWidth = '297mm';
      containerHeight = '210mm';
    } else {
      containerWidth = '210mm';
      containerHeight = '297mm';
    }
  } else if (template.paper_size === 'a3') {
    if (template.orientation === 'landscape') {
      containerWidth = '420mm';
      containerHeight = '297mm';
    } else {
      containerWidth = '297mm';
      containerHeight = '420mm';
    }
  } else if (template.paper_size === 'letter') {
    if (template.orientation === 'landscape') {
      containerWidth = '11in';
      containerHeight = '8.5in';
    } else {
      containerWidth = '8.5in';
      containerHeight = '11in';
    }
  }

  return `
<!DOCTYPE html>
<html>
<head>
  <style>
    @page {
      size: ${template.paper_size} ${template.orientation};
      margin: 0;
    }
    body {
      margin: 0;
      font-family: Arial;
      width: 100%;
      height: 100vh;
      display: flex;
      justify-content: center;
      align-items: center;
      background-color: #f5f5f5;
    }
    .certificate-container {
      width: ${containerWidth};
      height: ${containerHeight};
      ${backgroundStyle}
      position: relative;
      box-shadow: 0 4px 8px rgba(0,0,0,0.1);
    }
    .certificate-container::before {
      content: '';
      position: absolute;
      top: 20px;
      left: 20px;
      right: 20px;
      bottom: 20px;
      ${template.background_style?.border_enabled ? `
        border: ${template.background_style.border_width || 2}px ${template.background_style.border_style || 'solid'} ${template.background_style.border_color || '#000000'};
      ` : ''}
      pointer-events: none;
    }
    .field {
      position: absolute;
      text-align: center;
    }
    .certificate-title {
      position: absolute;
      text-align: center;
      width: 90%;
      left: 50%;
      transform: translateX(-50%);
      font-weight: bold;
      text-transform: uppercase;
      letter-spacing: 2px;
    }
    .appreciation-text {
      position: absolute;
      text-align: center;
      width: 80%;
      left: 50%;
      transform: translateX(-50%);
      line-height: 1.5;
      white-space: pre-line;
    }
  </style>
</head>
<body>
  <div class="certificate-container">
    ${fieldsHTML}
    ${combinedContent}
  </div>
</body>
</html>
  `;
}

/**
 * Generate multiple PDFs and download as ZIP (for bulk operations)
 */
export async function generateBulkPDFs(
  certificateIds: number[],
  zipFilename: string = 'certificates.zip',
  onProgress?: (current: number, total: number) => void
): Promise<void> {
  try {
    const zip = new JSZip();
    let completedCount = 0;
    
    // Create a folder inside the zip
    const certificatesFolder = zip.folder('certificates');
    
    if (!certificatesFolder) {
      throw new Error('Failed to create certificates folder');
    }
    
    // Process certificates in sequence to avoid memory issues
    for (let i = 0; i < certificateIds.length; i++) {
      const certificateId = certificateIds[i];
      
      try {
        // Get certificate data
        const certificateData = await downloadCertificateHTML(certificateId);
        
        if (!certificateData || !certificateData.html) {
          console.error(`Failed to get HTML for certificate ID ${certificateId}`);
          continue;
        }
        
        // Generate PDF from HTML
        const pdf = await generatePDFFromHTML_ToBlob(certificateData.html);
        
        // Add to zip with unique filename
        const filename = certificateData.filename || `certificate_${certificateId}.pdf`;
        certificatesFolder.file(filename, pdf);
        
        completedCount++;
        
        if (onProgress) {
          onProgress(i + 1, certificateIds.length);
        }
      } catch (err) {
        console.error(`Error processing certificate ID ${certificateId}:`, err);
        // Continue with other certificates even if one fails
      }
    }
    
    if (completedCount === 0) {
      throw new Error('No certificates were successfully processed');
    }
    
    // Generate the zip file
    const zipBlob = await zip.generateAsync({ 
      type: 'blob',
      compression: 'DEFLATE',
      compressionOptions: { level: 6 } 
    }, (_metadata: { percent: number }) => {
      if (onProgress) {
        // Indicate zip compression progress after all PDFs are created
        onProgress(certificateIds.length, certificateIds.length);
      }
    });
    
    // Download the zip file
    saveAs(zipBlob, zipFilename);
    
  } catch (error) {
    console.error('Error generating bulk PDFs:', error);
    throw error;
  }
}

/**
 * Generate PDF blob from template and certificate data (for email attachments)
 */
export async function generateCertificatePDFBlob(
  template: CertificateTemplate,
  certificate: CertificateListItem
): Promise<Blob> {
  try {
    // Generate HTML using the same logic as the preview modal
    const html = generateCertificateHTMLFromPreview(template, certificate);

    // Generate PDF from HTML and return as blob
    return await generatePDFFromHTML_ToBlob(html);
  } catch (error) {
    console.error('Error generating certificate PDF blob:', error);
    throw error;
  }
}

/**
 * Generate PDF from HTML and return as Blob (for bulk downloads)
 */
async function generatePDFFromHTML_ToBlob(html: string): Promise<Blob> {
  try {
    // Create a temporary container
    const tempContainer = document.createElement('div');
    tempContainer.innerHTML = html;
    tempContainer.style.position = 'absolute';
    tempContainer.style.left = '-9999px';
    tempContainer.style.top = '-9999px';
    tempContainer.style.width = '1123px'; // A4 landscape width in pixels
    tempContainer.style.height = '794px'; // A4 landscape height in pixels
    tempContainer.style.backgroundColor = 'white';
    
    // Add to DOM temporarily
    document.body.appendChild(tempContainer);

    // Wait for images to load
    await waitForImages(tempContainer);

    // Convert to canvas
    const canvas = await html2canvas(tempContainer, {
      scale: 2, // Higher quality
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      width: 1123,
      height: 794,
      scrollX: 0,
      scrollY: 0
    });

    // Remove temporary container
    document.body.removeChild(tempContainer);

    // Create PDF
    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    });

    // Calculate dimensions
    const imgWidth = 297; // A4 landscape width in mm
    const imgHeight = 210; // A4 landscape height in mm

    // Add image to PDF
    const imgData = canvas.toDataURL('image/png', 1.0);
    pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);

    // Return as blob
    return pdf.output('blob');
  } catch (error) {
    console.error('Error generating PDF from HTML:', error);
    throw error;
  }
}

/**
 * Download certificate as image (PNG)
 */
export async function downloadCertificateAsImage(
  certificateId: number,
  filename?: string
): Promise<void> {
  try {
    const certificateData = await downloadCertificateHTML(certificateId);

    if (!certificateData || !certificateData.html) {
      throw new Error('Failed to get certificate HTML');
    }

    // Create temporary container
    const tempContainer = document.createElement('div');
    tempContainer.innerHTML = certificateData.html;
    tempContainer.style.position = 'absolute';
    tempContainer.style.left = '-9999px';
    tempContainer.style.width = '1123px';
    tempContainer.style.height = '794px';
    
    document.body.appendChild(tempContainer);

    // Wait for images to load
    await waitForImages(tempContainer);

    // Convert to canvas
    const canvas = await html2canvas(tempContainer, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff'
    });

    // Remove temporary container
    document.body.removeChild(tempContainer);

    // Convert to blob and download
    canvas.toBlob((blob) => {
      if (blob) {
        const imageName = filename || `certificate_${certificateId}.png`;
        saveAs(blob, imageName);
      }
    }, 'image/png', 1.0);
  } catch (error) {
    console.error('Error downloading certificate as image:', error);
    throw error;
  }
}
