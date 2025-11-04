import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { name, email, phone, subject, message } = await request.json()

    // Validate required fields
    if (!name || !email || !message) {
      return NextResponse.json(
        { error: 'Missing required fields: name, email, and message are required' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    // Get email settings from the existing API
    const emailSettingsResponse = await fetch('https://ai.nibog.in/webhook/v1/nibog/emailsetting/get', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store'
    })

    if (!emailSettingsResponse.ok) {
      console.error('Failed to fetch email settings')
      return NextResponse.json(
        { error: 'Email service temporarily unavailable' },
        { status: 500 }
      )
    }

    const emailSettings = await emailSettingsResponse.json()
    if (!emailSettings || emailSettings.length === 0) {
      console.error('No email settings found')
      return NextResponse.json(
        { error: 'Email service not configured' },
        { status: 500 }
      )
    }

    const settings = emailSettings[0]

    // Generate HTML email content
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>New Contact Form Submission - NIBOG</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #f59e0b, #f97316, #06b6d4); padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .header h1 { color: white; margin: 0; font-size: 24px; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
          .field { margin-bottom: 20px; }
          .field-label { font-weight: bold; color: #374151; margin-bottom: 5px; }
          .field-value { background: white; padding: 10px; border-radius: 5px; border: 1px solid #e5e7eb; }
          .message-box { background: white; padding: 15px; border-radius: 5px; border: 1px solid #e5e7eb; min-height: 100px; }
          .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎯 New Contact Form Submission</h1>
            <p style="color: white; margin: 10px 0 0 0;">NIBOG - New India Baby Olympic Games</p>
          </div>
          <div class="content">
            <div class="field">
              <div class="field-label">👤 Name:</div>
              <div class="field-value">${name}</div>
            </div>
            <div class="field">
              <div class="field-label">📧 Email:</div>
              <div class="field-value">${email}</div>
            </div>
            ${phone ? `
            <div class="field">
              <div class="field-label">📱 Phone:</div>
              <div class="field-value">${phone}</div>
            </div>
            ` : ''}
            ${subject ? `
            <div class="field">
              <div class="field-label">📝 Subject:</div>
              <div class="field-value">${subject}</div>
            </div>
            ` : ''}
            <div class="field">
              <div class="field-label">💬 Message:</div>
              <div class="message-box">${message.replace(/\n/g, '<br>')}</div>
            </div>
            <div class="field">
              <div class="field-label">🕒 Submitted At:</div>
              <div class="field-value">${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}</div>
            </div>
          </div>
          <div class="footer">
            <p>This message was sent from the NIBOG contact form on your website.</p>
            <p>Please respond to the customer at: ${email}</p>
          </div>
        </div>
      </body>
      </html>
    `

    // Send email using existing send-receipt-email API
    const emailResponse = await fetch(`${request.url.split('/api')[0]}/api/send-receipt-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: 'newindiababyolympics@gmail.com',
        subject: `🎯 New Contact Form Submission${subject ? ` - ${subject}` : ''} | NIBOG`,
        html: htmlContent,
        settings: settings
      })
    })

    if (!emailResponse.ok) {
      const errorText = await emailResponse.text()
      console.error('Failed to send email:', errorText)
      return NextResponse.json(
        { error: 'Failed to send email. Please try again later.' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Your message has been sent successfully! We will get back to you soon.'
    })

  } catch (error) {
    console.error('Contact form error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred. Please try again later.' },
      { status: 500 }
    )
  }
}
