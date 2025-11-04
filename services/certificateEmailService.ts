/**
 * Certificate Email Service
 * Handles sending certificates via email
 */

import { CertificateListItem } from '@/types/certificate'

/**
 * Options for sending certificate emails
 */
export interface SendCertificateEmailOptions {
  certificateIds: number[];
  customMessage?: string;
  includeLink?: boolean;
  includePdf?: boolean;
  replyTo?: string;
}

/**
 * Response from the email sending API
 */
export interface SendCertificateEmailResponse {
  success: boolean;
  sent: number;
  failed: number;
  failedEmails?: string[];
  message?: string;
}

/**
 * Send certificate(s) via email
 */
export async function sendCertificatesViaEmail(options: SendCertificateEmailOptions): Promise<SendCertificateEmailResponse> {
  try {
    // First, get email settings
    const emailSettingsResponse = await fetch('/api/emailsetting/get')
    if (!emailSettingsResponse.ok) {
      throw new Error('Email settings not configured')
    }

    const emailSettings = await emailSettingsResponse.json()
    if (!emailSettings || emailSettings.length === 0) {
      throw new Error('No email settings found')
    }

    const settings = emailSettings[0]

    // Get certificate data for the provided IDs
    const certificatesData: CertificateListItem[] = []

    for (let i = 0; i < options.certificateIds.length; i++) {
      const certificateId = options.certificateIds[i]
      try {
        const response = await fetch(`/api/certificates/get-single?certificate_id=${certificateId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        })

        if (response.ok) {
          const result = await response.json()
          // The get-single API returns a single certificate object, not an array
          if (result && result.id) {
            certificatesData.push(result)
          }
        } else {
          console.error(`Failed to fetch certificate ${certificateId}: ${response.status}`)
        }
      } catch (error) {
        console.error(`Error fetching certificate ${certificateId}:`, error)
      }
    }

    if (certificatesData.length === 0) {
      throw new Error('No valid certificates found')
    }

    // Send email using the certificate email API
    const emailResponse = await fetch('/api/certificates/send-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        certificateIds: options.certificateIds,
        customMessage: options.customMessage,
        includeLink: options.includeLink !== false, // Default to true
        includePdf: options.includePdf !== false, // Default to true
        replyTo: options.replyTo,
        settings: settings,
        certificatesData: certificatesData
      }),
    })

    if (!emailResponse.ok) {
      const errorData = await emailResponse.json()
      throw new Error(errorData.error || 'Failed to send certificate emails')
    }

    const result = await emailResponse.json()
    return result
  } catch (error) {
    console.error('Error sending certificate emails:', error)
    throw error
  }
}

/**
 * Send single certificate via email (similar to receipt email)
 */
export async function sendCertificateEmail(certificate: CertificateListItem): Promise<{ success: boolean; message: string }> {
  try {
    // Check for email address - prioritize parent_email first, then user_email
    const recipientEmail = certificate.parent_email || certificate.user_email

    if (!recipientEmail) {
      throw new Error('No email address found for this certificate')
    }

    // First, get email settings
    const emailSettingsResponse = await fetch('/api/emailsetting/get')
    if (!emailSettingsResponse.ok) {
      throw new Error('Email settings not configured')
    }

    const emailSettings = await emailSettingsResponse.json()
    if (!emailSettings || emailSettings.length === 0) {
      throw new Error('No email settings found')
    }

    const settings = emailSettings[0]

    // Prepare email content
    const participantName = certificate.child_name || certificate.parent_name || certificate.user_name || 'Participant'
    const subject = `Certificate for ${participantName}`

    let htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Certificate Ready</h2>
        <p>Dear Parent,</p>
        <p>We are pleased to inform you that the certificate for <strong>${participantName}</strong> is now ready.</p>
        <p>Please find the certificate attached to this email as a PDF file.</p>
        <p>Best regards,<br>
        ${settings.sender_name}</p>
      </div>
    `

    // Send email using the certificate email API with PDF attachment
    const emailResponse = await fetch('/api/certificates/send-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        certificateIds: [certificate.id],
        customMessage: '',
        includeLink: false,
        includePdf: true,
        replyTo: '',
        settings: settings,
        certificatesData: [certificate]
      }),
    })

    if (!emailResponse.ok) {
      const errorData = await emailResponse.json()
      throw new Error(errorData.error || 'Failed to send certificate email')
    }

    const result = await emailResponse.json()
    return { success: true, message: result.message || 'Certificate sent successfully' }
  } catch (error: any) {
    console.error('Error sending certificate email:', error)
    return { success: false, message: error.message || 'Failed to send certificate email' }
  }
}
