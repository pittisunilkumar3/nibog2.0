import {
  CertificateTemplate,
  CreateCertificateTemplateRequest,
  UpdateCertificateTemplateRequest,
  BackgroundUploadResponse,
  ApiResponse
} from '@/types/certificate';

const API_BASE_URL = 'https://ai.nibog.in/webhook/v1/nibog';

/**
 * Upload certificate background image
 */
export async function uploadCertificateBackground(file: File): Promise<string> {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch('/api/certificate-templates/upload-background', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to upload background image');
    }

    const result = await response.json();

    // Handle the actual response format from n8n API
    if (result && result.success && result.file_path) {
      return result.file_path;
    } else {
      throw new Error(`Upload failed or no file_path in response. Response: ${JSON.stringify(result)}`);
    }
  } catch (error) {
    console.error('Error uploading background:', error);
    throw error;
  }
}

/**
 * Create a new certificate template
 */
export async function createCertificateTemplate(
  templateData: CreateCertificateTemplateRequest
): Promise<CertificateTemplate> {
  try {
    const response = await fetch('/api/certificate-templates/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(templateData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to create certificate template');
    }

    const result: CertificateTemplate[] = await response.json();
    return result[0];
  } catch (error) {
    console.error('Error creating template:', error);
    throw error;
  }
}

/**
 * Get all certificate templates
 */
export async function getAllCertificateTemplates(): Promise<CertificateTemplate[]> {
  try {
    const response = await fetch('/api/certificate-templates/get-all', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to fetch certificate templates');
    }

    const result: CertificateTemplate[] = await response.json();
    return result;
  } catch (error) {
    console.error('Error fetching templates:', error);
    throw error;
  }
}

/**
 * Get certificate template by ID
 */
export async function getCertificateTemplateById(id: number): Promise<CertificateTemplate> {
  try {
    // Determine if we're running on server-side or client-side
    const isServerSide = typeof window === 'undefined';
    const baseUrl = isServerSide
      ? (process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000')
      : '';

    const url = `${baseUrl}/api/certificate-templates/get`;


    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to fetch certificate template');
    }

    const result: CertificateTemplate[] = await response.json();
    if (result.length === 0) {
      throw new Error('Certificate template not found');
    }
    return result[0];
  } catch (error) {
    console.error('Error fetching template:', error);
    throw error;
  }
}

/**
 * Update certificate template
 */
export async function updateCertificateTemplate(
  templateData: UpdateCertificateTemplateRequest
): Promise<CertificateTemplate> {
  try {
    const response = await fetch('/api/certificate-templates/update', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(templateData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to update certificate template');
    }

    const result: CertificateTemplate[] = await response.json();
    return result[0];
  } catch (error) {
    console.error('Error updating template:', error);
    throw error;
  }
}

/**
 * Delete certificate template
 */
export async function deleteCertificateTemplate(id: number): Promise<void> {
  try {
    const response = await fetch('/api/certificate-templates/delete', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to delete certificate template');
    }
  } catch (error) {
    console.error('Error deleting template:', error);
    throw error;
  }
}

/**
 * Get certificate templates by type
 */
export async function getCertificateTemplatesByType(
  type: 'participation' | 'winner' | 'event_specific'
): Promise<CertificateTemplate[]> {
  try {
    const response = await fetch(`/api/certificate-templates/by-type/${type}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to fetch certificate templates by type');
    }

    const result: CertificateTemplate[] = await response.json();
    return result;
  } catch (error) {
    console.error('Error fetching templates by type:', error);
    throw error;
  }
}

/**
 * Duplicate certificate template
 */
export async function duplicateCertificateTemplate(
  id: number,
  newName: string
): Promise<CertificateTemplate> {
  try {
    // First get the template
    const originalTemplate = await getCertificateTemplateById(id);

    // Create new field IDs while preserving all other properties including positions
    const duplicatedFields = originalTemplate.fields.map((field, index) => ({
      ...field,
      id: `field-${Date.now()}-${index}-${Math.random().toString(36).substring(2, 8)}`
    }));

    // Create a new template with modified name
    const duplicateData: CreateCertificateTemplateRequest = {
      name: newName,
      description: `Copy of ${originalTemplate.description}`,
      type: originalTemplate.type,
      certificate_title: originalTemplate.certificate_title,
      appreciation_text: originalTemplate.appreciation_text,
      appreciation_text_style: originalTemplate.appreciation_text_style,
      signature_image: originalTemplate.signature_image,
      background_image: originalTemplate.background_image,
      background_style: originalTemplate.background_style,
      paper_size: originalTemplate.paper_size,
      orientation: originalTemplate.orientation,
      fields: duplicatedFields,
    };

    return await createCertificateTemplate(duplicateData);
  } catch (error) {
    console.error('Error duplicating template:', error);
    throw error;
  }
}
