/**
 * Server-side PDF generation service
 * This service generates PDFs on the server side for email attachments
 */

import { CertificateListItem, CertificateTemplate, CertificateField } from '@/types/certificate'

/**
 * Generate certificate HTML for server-side PDF generation
 */
export function generateCertificateHTMLForServer(
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

    // Handle background styling
    let backgroundStyle = '';

    if (template.background_style && template.background_style.type) {
      if (template.background_style.type === 'image') {
        const imageUrl = template.background_style.image_url || template.background_image;
        if (imageUrl && imageUrl !== 'null' && imageUrl !== null) {
          // Use absolute URL for server-side generation
          const backgroundImageUrl = imageUrl.startsWith('http')
            ? imageUrl
            : `https://ai.nibog.in${imageUrl.startsWith('/') ? '' : '/'}${imageUrl}`;
          backgroundStyle = `background-image: url('${backgroundImageUrl}'); background-size: cover; background-position: center; background-repeat: no-repeat;`;
        }
      } else if (template.background_style.type === 'solid' && template.background_style.solid_color) {
        backgroundStyle = `background-color: ${template.background_style.solid_color};`;
      } else if (template.background_style.type === 'gradient' && template.background_style.gradient_colors?.length === 2) {
        backgroundStyle = `background: linear-gradient(135deg, ${template.background_style.gradient_colors[0]}, ${template.background_style.gradient_colors[1]});`;
      }
    } else if (template.background_image && template.background_image !== 'null' && template.background_image !== null) {
      // Legacy background image support
      const backgroundImageUrl = template.background_image.startsWith('http')
        ? template.background_image
        : `https://ai.nibog.in${template.background_image.startsWith('/') ? '' : '/'}${template.background_image}`;
      backgroundStyle = `background-image: url('${backgroundImageUrl}'); background-size: cover; background-position: center; background-repeat: no-repeat;`;
    }

    // Generate fields HTML
    let fieldsHTML = '';

    if (template.fields && Array.isArray(template.fields)) {
      template.fields.forEach((field, index) => {
        try {
          const fieldValue = getFieldValueForServer(field, certificate, template);

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
            const signatureUrl = template.signature_image.startsWith('http')
              ? template.signature_image
              : `https://ai.nibog.in${template.signature_image.startsWith('/') ? '' : '/'}${template.signature_image}`;
            
            fieldsHTML += `
              <div class="field signature-field" style="
                position: absolute;
                left: ${x}%;
                top: ${y}%;
                transform: translate(-50%, -50%);
                ${field.width ? `width: ${field.width}px;` : 'width: 150px;'}
                ${field.height ? `height: ${field.height}px;` : 'height: 50px;'}
              ">
                <img src="${signatureUrl}" alt="Signature" style="width: 100%; height: 100%; object-fit: contain;" />
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
        }
      });
    }

    // Generate certificate title
    let titleText = '';
    const titleField = template.fields?.find((field: any) =>
      field.name.toLowerCase().includes('certificate') && field.name.toLowerCase().includes('title')
    );

    if (titleField) {
      titleText = titleField.name === 'Certificate Title'
        ? `Certificate of ${template.type === 'participation' ? 'Participation' : (template.type === 'winner' ? 'Achievement' : 'Excellence')}`
        : titleField.name;
    } else if (template.certificate_title) {
      titleText = template.certificate_title;
    } else {
      titleText = `Certificate of ${template.type === 'participation' ? 'Participation' : (template.type === 'winner' ? 'Achievement' : 'Excellence')}`;
    }

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
        ${parseVariablesForServer(titleText, certificate)}
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

    // Generate appreciation text if present
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
        ${parseVariablesForServer(template.appreciation_text, certificate)}
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
    console.error('Error generating certificate HTML for server:', error);
    throw error;
  }
}

/**
 * Get field value for server-side generation
 */
function getFieldValueForServer(field: CertificateField, certificate: CertificateListItem, template?: CertificateTemplate): string {
  const certData = certificate.certificate_data || {}
  const fieldName = field.name.toLowerCase()

  // Handle signature fields
  if (field.type === 'signature') {
    if (field.signature_type === 'image' && template?.signature_image) {
      return template.signature_image;
    } else {
      return 'Authorized Signature';
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
  }

  // Try direct mapping first
  if (directMappings[fieldName]) {
    return String(directMappings[fieldName])
  }

  // Fallback to field name if no value found
  return field.name
}

/**
 * Parse variables in text for server-side generation
 */
function parseVariablesForServer(text: string, certificate: CertificateListItem): string {
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
