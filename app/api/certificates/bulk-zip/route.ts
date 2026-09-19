import { NextRequest, NextResponse } from 'next/server'
import puppeteer from 'puppeteer'
import { readFile } from 'fs/promises'
import { join } from 'path'
import sharp from 'sharp'

export const dynamic = 'force-dynamic'
export const maxDuration = 600

const BACKEND = 'http://localhost:3004'

// Inline /uploads images as base64 (read from disk — no network per page)
const imgCache = new Map<string, string>()
async function inlineUploads(html: string): Promise<string> {
  const urls = [...new Set(html.match(/\/uploads\/[A-Za-z0-9_\-./]+/g) || [])]
  for (const u of urls) {
    try {
      let dataUri = imgCache.get(u)
      if (!dataUri) {
        const rel = u.replace(/^\/uploads\//, '')
        const buf = await readFile(join(process.cwd(), 'upload', rel))
        // downscale to A4@2x and jpeg-compress to keep PDFs light
        const small = await sharp(buf).resize({ width: 1654, withoutEnlargement: true }).jpeg({ quality: 82 }).toBuffer()
        dataUri = `data:image/jpeg;base64,${small.toString('base64')}`
        imgCache.set(u, dataUri)
      }
      html = html.split(u).join(dataUri)
    } catch {}
  }
  return html
}

export async function POST(request: NextRequest) {
  let browser: any = null
  try {
    const { event_id, template_id } = await request.json()
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

    // 2) render each certificate HTML -> PDF (single reused browser)
    const JSZip = (await import('jszip')).default
    const zip = new JSZip()
    browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] })
    const page = await browser.newPage()
    let pdfWidth = '842px'
    let pdfHeight = '595px'

    for (let i = 0; i < items.length; i++) {
      const it = items[i]
      try {
        let html: string = it.html || ''
        if (i === 0) {
          const m = html.match(/width:(\d+)px;height:(\d+)px/)
          if (m) { pdfWidth = `${m[1]}px`; pdfHeight = `${m[2]}px` }
        }
        html = await inlineUploads(html)
        await page.setContent(html, { waitUntil: 'load', timeout: 20000 })
        const buf = await page.pdf({ width: pdfWidth, height: pdfHeight, printBackground: true, pageRanges: '1' })

        const child = (it.child_name || 'Participant').toString().trim().replace(/[^a-zA-Z0-9]+/g, '_')
        zip.file(`${child}_${it.certificate_number}.pdf`, buf)
      } catch (e) {
        console.error(`bulk-zip: cert ${it.certificate_number} failed`, e)
      }
    }
    await browser.close()
    browser = null

    const zbuf = await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' })
    return new NextResponse(zbuf, {
      status: 200,
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="certificates_event_${event_id}.zip"`,
      },
    })
  } catch (e: any) {
    if (browser) { try { await browser.close() } catch (_) {} }
    return NextResponse.json({ error: e.message || 'bulk zip failed' }, { status: 500 })
  }
}
