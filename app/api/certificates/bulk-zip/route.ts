import { NextRequest, NextResponse } from 'next/server'
import puppeteer from 'puppeteer'
import JSZip from 'jszip'
import { readFile } from 'fs/promises'
import { join } from 'path'

export const dynamic = 'force-dynamic'
export const maxDuration = 600

const BACKEND = 'http://localhost:3004'

// Inline /uploads images as base64 (read from disk — no network per page)
const imgCache = new Map<string, string>()
async function inlineUploads(html: string): Promise<string> {
  const urls = [...new Set(html.match(/\/uploads\/[A-Za-z0-9_\-.\/]+/g) || [])]
  for (const u of urls) {
    try {
      let dataUri = imgCache.get(u)
      if (!dataUri) {
        const rel = u.replace(/^\/uploads\//, '')
        const buf = await readFile(join(process.cwd(), 'upload', rel))
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

export async function POST(request: NextRequest) {
  let browser: any = null
  try {
    const { event_id, template_id } = await request.json()
    if (!event_id) return NextResponse.json({ error: 'event_id is required' }, { status: 400 })

    // 1) ensure certificates exist (server-side bulk generate, skips existing)
    const gen = await fetch(`${BACKEND}/api/certificates/bulk-generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ event_id, template_id }),
    })
    if (!gen.ok) {
      const t = await gen.text()
      return NextResponse.json({ error: `bulk-generate failed: ${t}` }, { status: 500 })
    }
    const genData = await gen.json()
    const certs: any[] = genData.certificates || []
    if (!certs.length) return NextResponse.json({ error: 'No certificates found for this event' }, { status: 404 })

    // 2) render each certificate HTML -> PDF (single reused browser)
    const zip = new JSZip()
    browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] })
    const page = await browser.newPage()
    let pdfWidth = '842px'
    let pdfHeight = '595px'

    for (let i = 0; i < certs.length; i++) {
      const c = certs[i]
      try {
        const dres = await fetch(`${BACKEND}/api/certificates/download/${c.id}`)
        if (!dres.ok) continue
        const djson = await dres.json()
        const dhtml = Array.isArray(djson) ? djson[0] : djson
        let html: string = dhtml.html || ''
        if (!html) continue

        // inline background images from disk (fast, no network)
        html = await inlineUploads(html)
        // derive page size from the first certificate
        if (i === 0) {
          const m = html.match(/width:(\d+)px;height:(\d+)px/)
          if (m) { pdfWidth = `${m[1]}px`; pdfHeight = `${m[2]}px` }
        }

        await page.setContent(html, { waitUntil: 'load', timeout: 20000 })
        const buf = await page.pdf({ width: pdfWidth, height: pdfHeight, printBackground: true, pageRanges: '1' })

        const child = (c.child_name || c.participant_name || 'Participant').toString().trim().replace(/[^a-zA-Z0-9]+/g, '_')
        zip.file(`${child}_${c.certificate_number || c.id}.pdf`, buf)
      } catch (e) {
        console.error(`zip: cert ${c.id} failed`, e)
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
