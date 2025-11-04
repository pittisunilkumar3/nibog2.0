import { NextResponse } from 'next/server'
import { readFileSync } from 'fs'
import { join } from 'path'

export async function GET() {
  try {
    const filePath = join(process.cwd(), 'public', 'templates', 'bulk-email-template.csv')
    
    // Check if file exists and read it
    const fileBuffer = readFileSync(filePath)
    
    // Set appropriate headers for file download
    const headers = new Headers()
    headers.set('Content-Type', 'text/csv')
    headers.set('Content-Disposition', 'attachment; filename="bulk-email-template.csv"')
    headers.set('Cache-Control', 'no-cache')
    
    return new NextResponse(fileBuffer.toString(), {
      status: 200,
      headers,
    })
  } catch (error) {
    console.error('Error serving sample template:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Sample template file not found or could not be read' 
      }, 
      { status: 404 }
    )
  }
}