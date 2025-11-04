import { NextResponse } from 'next/server'
import * as XLSX from 'xlsx'

export async function GET() {
  try {
    // Create sample data for the Excel template
    const sampleData = [
      {
        name: 'John Doe',
        email: 'john.doe@example.com',
        company: 'Acme Corp',
        phone: '+1-555-0123',
        custom_field1: 'VIP Customer',
        custom_field2: 'Gold Member'
      },
      {
        name: 'Jane Smith',
        email: 'jane.smith@example.com',
        company: 'Tech Solutions',
        phone: '+1-555-0124',
        custom_field1: 'Regular Customer',
        custom_field2: 'Silver Member'
      },
      {
        name: 'Mike Johnson',
        email: 'mike.johnson@example.com',
        company: 'Digital Agency',
        phone: '+1-555-0125',
        custom_field1: 'New Customer',
        custom_field2: 'Bronze Member'
      }
    ]

    // Create a new workbook and worksheet
    const workbook = XLSX.utils.book_new()
    const worksheet = XLSX.utils.json_to_sheet(sampleData)

    // Add some formatting - make headers bold and set column widths
    const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1')
    
    // Set column widths
    worksheet['!cols'] = [
      { width: 15 }, // name
      { width: 25 }, // email
      { width: 20 }, // company
      { width: 15 }, // phone
      { width: 15 }, // custom_field1
      { width: 15 }  // custom_field2
    ]

    // Add the worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Email Recipients')

    // Generate buffer
    const excelBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' })

    // Set appropriate headers for Excel file download
    const headers = new Headers()
    headers.set('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
    headers.set('Content-Disposition', 'attachment; filename="bulk-email-template.xlsx"')
    headers.set('Cache-Control', 'no-cache')

    return new NextResponse(excelBuffer, {
      status: 200,
      headers,
    })
  } catch (error) {
    console.error('Error generating Excel template:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to generate Excel template' 
      }, 
      { status: 500 }
    )
  }
}