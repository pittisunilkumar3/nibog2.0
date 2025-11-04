// Receipt service for generating and sending payment receipts

import { Payment } from './paymentService'

/**
 * Generate receipt HTML content for a payment
 * @param payment Payment data
 * @returns HTML string for the receipt
 */
export function generateReceiptHTML(payment: Payment): string {
  const receiptDate = new Date().toLocaleDateString()
  const paymentDate = new Date(payment.payment_date).toLocaleDateString()
  const eventDate = new Date(payment.event_date).toLocaleDateString()
  const amount = typeof payment.amount === 'string' ? parseFloat(payment.amount) : payment.amount

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Payment Receipt - ${payment.payment_id}</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
          color: #333;
        }
        .header {
          text-align: center;
          border-bottom: 2px solid #007bff;
          padding-bottom: 20px;
          margin-bottom: 30px;
        }
        .logo {
          font-size: 28px;
          font-weight: bold;
          color: #007bff;
          margin-bottom: 10px;
        }
        .receipt-title {
          font-size: 24px;
          font-weight: bold;
          margin-bottom: 10px;
        }
        .receipt-info {
          display: flex;
          justify-content: space-between;
          margin-bottom: 30px;
        }
        .info-section {
          flex: 1;
          margin-right: 20px;
        }
        .info-section:last-child {
          margin-right: 0;
        }
        .info-title {
          font-weight: bold;
          font-size: 16px;
          margin-bottom: 10px;
          color: #007bff;
        }
        .info-item {
          margin-bottom: 8px;
          display: flex;
          justify-content: space-between;
        }
        .info-label {
          font-weight: 500;
          color: #666;
        }
        .info-value {
          font-weight: 600;
        }
        .amount-section {
          background-color: #f8f9fa;
          padding: 20px;
          border-radius: 8px;
          margin: 30px 0;
          text-align: center;
        }
        .amount-label {
          font-size: 18px;
          color: #666;
          margin-bottom: 10px;
        }
        .amount-value {
          font-size: 32px;
          font-weight: bold;
          color: #28a745;
        }
        .status-badge {
          display: inline-block;
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: bold;
          text-transform: uppercase;
        }
        .status-successful {
          background-color: #d4edda;
          color: #155724;
        }
        .status-pending {
          background-color: #fff3cd;
          color: #856404;
        }
        .status-failed {
          background-color: #f8d7da;
          color: #721c24;
        }
        .status-refunded {
          background-color: #d1ecf1;
          color: #0c5460;
        }
        .footer {
          margin-top: 40px;
          padding-top: 20px;
          border-top: 1px solid #dee2e6;
          text-align: center;
          color: #666;
          font-size: 14px;
        }
        @media print {
          body {
            margin: 0;
            padding: 15px;
          }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="logo">NIBOG</div>
        <div class="receipt-title">Payment Receipt</div>
        <div>Receipt Date: ${receiptDate}</div>
      </div>

      <div class="receipt-info">
        <div class="info-section">
          <div class="info-title">Payment Details</div>
          <div class="info-item">
            <span class="info-label">Payment ID:</span>
            <span class="info-value">${payment.payment_id}</span>
          </div>
          <div class="info-item">
            <span class="info-label">Transaction ID:</span>
            <span class="info-value">${payment.transaction_id}</span>
          </div>
          <div class="info-item">
            <span class="info-label">Payment Date:</span>
            <span class="info-value">${paymentDate}</span>
          </div>
          <div class="info-item">
            <span class="info-label">Payment Method:</span>
            <span class="info-value">${payment.payment_method}</span>
          </div>
          <div class="info-item">
            <span class="info-label">Status:</span>
            <span class="status-badge status-${payment.payment_status}">${payment.payment_status}</span>
          </div>
        </div>

        <div class="info-section">
          <div class="info-title">Customer Details</div>
          <div class="info-item">
            <span class="info-label">Name:</span>
            <span class="info-value">${payment.user_name}</span>
          </div>
          <div class="info-item">
            <span class="info-label">Email:</span>
            <span class="info-value">${payment.user_email}</span>
          </div>
          <div class="info-item">
            <span class="info-label">Phone:</span>
            <span class="info-value">${payment.user_phone}</span>
          </div>
        </div>
      </div>

      <div class="receipt-info">
        <div class="info-section">
          <div class="info-title">Event Details</div>
          <div class="info-item">
            <span class="info-label">Event:</span>
            <span class="info-value">${payment.event_title}</span>
          </div>
          <div class="info-item">
            <span class="info-label">Event Date:</span>
            <span class="info-value">${eventDate}</span>
          </div>
          <div class="info-item">
            <span class="info-label">Venue:</span>
            <span class="info-value">${payment.venue_name}</span>
          </div>
          <div class="info-item">
            <span class="info-label">City:</span>
            <span class="info-value">${payment.city_name}</span>
          </div>
        </div>

        <div class="info-section">
          <div class="info-title">Booking Details</div>
          <div class="info-item">
            <span class="info-label">Booking ID:</span>
            <span class="info-value">${payment.booking_id}</span>
          </div>
          ${payment.booking_ref ? `
          <div class="info-item">
            <span class="info-label">Booking Ref:</span>
            <span class="info-value">${payment.booking_ref}</span>
          </div>
          ` : ''}
        </div>
      </div>

      <div class="amount-section">
        <div class="amount-label">Total Amount Paid</div>
        <div class="amount-value">₹${amount.toLocaleString()}</div>
      </div>

      ${payment.refund_amount && parseFloat(payment.refund_amount.toString()) > 0 ? `
      <div class="amount-section" style="background-color: #f8d7da;">
        <div class="amount-label">Refund Amount</div>
        <div class="amount-value" style="color: #721c24;">₹${parseFloat(payment.refund_amount.toString()).toLocaleString()}</div>
        ${payment.refund_reason ? `<div style="margin-top: 10px; font-size: 14px;">Reason: ${payment.refund_reason}</div>` : ''}
      </div>
      ` : ''}

      <div class="footer">
        <p>Thank you for choosing NIBOG!</p>
        <p>For any queries, please contact us at newindiababyolympics@gmail.com</p>
        <p>This is a computer-generated receipt and does not require a signature.</p>
      </div>
    </body>
    </html>
  `
}

/**
 * Download receipt as PDF (using browser's print to PDF functionality)
 * @param payment Payment data
 */
export function downloadReceiptAsPDF(payment: Payment): void {
  const receiptHTML = generateReceiptHTML(payment)
  
  // Create a new window with the receipt content
  const printWindow = window.open('', '_blank')
  if (printWindow) {
    printWindow.document.write(receiptHTML)
    printWindow.document.close()
    
    // Wait for content to load, then trigger print dialog
    printWindow.onload = () => {
      setTimeout(() => {
        printWindow.print()
        // Close the window after printing
        printWindow.onafterprint = () => {
          printWindow.close()
        }
      }, 500)
    }
  }
}

/**
 * Send receipt via email
 * @param payment Payment data
 * @returns Promise with the result
 */
export async function sendReceiptEmail(payment: Payment): Promise<{ success: boolean; message: string }> {
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
    const receiptHTML = generateReceiptHTML(payment)

    // Send email using a custom API endpoint
    const emailResponse = await fetch('/api/send-receipt-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: payment.user_email,
        subject: `Payment Receipt - ${payment.payment_id}`,
        html: receiptHTML,
        paymentId: payment.payment_id,
        settings: settings
      }),
    })

    if (!emailResponse.ok) {
      const errorData = await emailResponse.json()
      throw new Error(errorData.error || 'Failed to send email')
    }

    const result = await emailResponse.json()
    return { success: true, message: result.message || 'Receipt sent successfully' }

  } catch (error: any) {
    return { success: false, message: error.message || 'Failed to send receipt email' }
  }
}
