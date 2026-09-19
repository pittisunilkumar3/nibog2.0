import { NextRequest, NextResponse } from 'next/server'
import puppeteer from 'puppeteer'

export const dynamic = 'force-dynamic'
export const maxDuration = 600

const BACKEND = 'http://localhost:3004'
const SITE = 'https://www.nibog.in'

const imgCache = new Map<string, string>()
async function inlineUploads(html: string): Promise<string> {
  const urls = [...new Set(html.match(/\/uploads\/[A-Za-z0-9_\-./]+/g) || [])]
  for (const u of urls) {
    try {
      let dataUri = imgCache.get(u)
      if (!dataUri) {
        const rel = u.replace(/^\/uploads\//, '')
        const buf = await readFileSafe(rel)
        const ext = (u.split('.').pop() || 'jpg').toLowerCase()
        const mime = ext === 'png' ? 'image/png' : ext === 'webp' ? 'image/webp' : 'image/jpeg'
        dataUri = `data:${mime};base64,${buf.toString('base64')}`
        imgCache.set(u, dataUri)
      }
      html = html.split(u).join(dataUri)
    } catch {}
  }
  return html
}

async function readFileSafe(rel: string): Promise<Buffer> {
  const { readFile } = await import('fs/promises')
  const { join } = await import('path')
  return readFile(join(process.cwd(), 'upload', rel))
}

export async function POST(request: NextRequest) {
  let browser: any = null
  try {
    const { event_id, template_id, custom_message, test_email } = await request.json()
    if (!event_id || !template_id) return NextResponse.json({ error: 'event_id and template_id are required' }, { status: 400 })

    // 1) render all certificates in memory (no DB storage)
    const rend = await fetch(`${BACKEND}/api/certificates/bulk-render`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ event_id, template_id }),
    })
    if (!rend.ok) {
      const t = await rend.text()
      return NextResponse.json({ error: `bulk-render failed: ${t}` }, { status: 500 })
    }
    const rdata = await rend.json()
    const items: any[] = rdata.items || []
    if (!items.length) return NextResponse.json({ error: 'No participants found for this event' }, { status: 404 })

    // 2) email settings
    const sres = await fetch('http://localhost:3112/api/emailsetting/get')
    const sj = await sres.json()
    const settings: any = Array.isArray(sj) ? sj[0] : sj.data || sj
    if (!settings || !settings.smtp_host) {
      return NextResponse.json({ error: 'Email settings not configured' }, { status: 500 })
    }
    const nodemailer = (await import('nodemailer')).default
    const transporter = nodemailer.createTransport({
      host: settings.smtp_host,
      port: Number(settings.smtp_port),
      secure: Number(settings.smtp_port) === 465,
      auth: { user: settings.smtp_username, pass: settings.smtp_password },
      tls: { rejectUnauthorized: false },
    })
    try { await transporter.verify() } catch (e: any) {
      return NextResponse.json({ error: 'Email server configuration error: ' + e.message }, { status: 500 })
    }

    // test mode: send only the first 2 certificates to the test address
    const sendItems = test_email ? items.slice(0, 2) : items

    // 3) PDF + email loop (server-side)
    browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] })
    const page = await browser.newPage()
    let pdfWidth = '842px'
    let pdfHeight = '595px'
    let sent = 0, failed = 0
    const failedEmails: string[] = []

    for (let i = 0; i < sendItems.length; i++) {
      const it = sendItems[i]
      try {
        let html: string = it.html || ''
        if (i === 0) {
          const m = html.match(/width:(\d+)px;height:(\d+)px/)
          if (m) { pdfWidth = `${m[1]}px`; pdfHeight = `${m[2]}px` }
        }
        html = await inlineUploads(html)
        await page.setContent(html, { waitUntil: 'load', timeout: 20000 })
        const buf = await page.pdf({ width: pdfWidth, height: pdfHeight, printBackground: true, pageRanges: '1' })

        const recipient = test_email || it.parent_email
        if (!recipient || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recipient)) {
          failed++; failedEmails.push(it.parent_email || 'unknown'); continue
        }

        await transporter.sendMail({
          from: `"${settings.sender_name || 'NIBOG'}" <${settings.sender_email || settings.smtp_username}>`,
          to: recipient,
          subject: `🎓 Certificate of Participation - ${it.child_name} - NIBOG`,
          html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
            <h2 style="color:#9333ea;">NIBOG Certificate</h2>
            <p>Dear Parent,</p>
            <p>${custom_message || `We are delighted to share the certificate of participation for <strong>${it.child_name}</strong>.`}</p>
            <p>Please find the certificate attached as a PDF.</p>
            <p style="color:#888;">Team NIBOG</p>
          </div>`,
          attachments: [{
            filename: `${(it.child_name || 'Participant').replace(/[^a-zA-Z0-9]+/g, '_')}_Certificate.pdf`,
            content: buf,
            contentType: 'application/pdf',
          }],
        })
        sent++
      } catch (e: any) {
        failed++
        failedEmails.push(it.parent_email || 'unknown')
        console.error(`bulk-email item ${i} failed:`, e.message)
      }
    }
    await browser.close()
    browser = null

    return NextResponse.json({ success: true, sent, failed, failedEmails, total: sendItems.length })
  } catch (e: any) {
    if (browser) { try { await browser.close() } catch (_) {} }
    return NextResponse.json({ error: e.message || 'bulk email failed' }, { status: 500 })
  }
}
