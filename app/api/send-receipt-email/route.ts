import { NextResponse } from 'next/server'
import nodemailer from 'nodemailer'

export async function POST(request: Request) {
  try {
    const { to, subject, html, settings, cc } = await request.json()

    // Validate required fields
    if (!to || !subject || !html || !settings) {
      return NextResponse.json(
        { error: 'Missing required fields' },
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

    // Email options
    const mailOptions = {
      from: `"${settings.sender_name}" <${settings.sender_email}>`,
      to: to,
      subject: subject,
      html: html,
      attachments: [], // Could add PDF attachment in the future
      ...(cc && { cc: cc }) // Add CC if provided
    }

    // Send email
    const info = await transporter.sendMail(mailOptions)

    return NextResponse.json({
      success: true,
      message: 'Receipt sent successfully',
      messageId: info.messageId
    })

  } catch (error: any) {
    console.error('Error sending receipt email:', error)
    
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
