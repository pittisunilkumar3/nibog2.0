import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import * as XLSX from 'xlsx'

// Extend jsPDF type to include autoTable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF
  }
}

export interface ExportColumn<T> {
  key: keyof T
  label: string
  width?: number
  format?: (value: any, row: T) => string
  align?: 'left' | 'center' | 'right'
}

export interface ExportOptions<T> {
  filename: string
  title?: string
  subtitle?: string
  data: T[]
  columns: ExportColumn<T>[]
  format: 'csv' | 'pdf' | 'excel'
  includeTimestamp?: boolean
  brandingInfo?: {
    companyName: string
    logo?: string
    address?: string
    website?: string
  }
}

export class ExportService {
  private static formatValue<T>(value: any, column: ExportColumn<T>, row: T): string {
    if (column.format) {
      return column.format(value, row)
    }
    
    if (value === null || value === undefined) {
      return ''
    }
    
    if (typeof value === 'boolean') {
      return value ? 'Yes' : 'No'
    }
    
    if (value instanceof Date) {
      return value.toLocaleDateString()
    }
    
    return String(value)
  }

  static async exportToCSV<T>(options: ExportOptions<T>): Promise<void> {
    try {
      const { data, columns, filename, includeTimestamp = true } = options

      // Create CSV headers
      const headers = columns.map(col => col.label)

      // Create CSV rows
      const rows = data.map(row =>
        columns.map(col => {
          const value = ExportService.formatValue(row[col.key], col, row)
          // Escape quotes and wrap in quotes if contains comma, quote, or newline
          return value.includes(',') || value.includes('"') || value.includes('\n')
            ? `"${value.replace(/"/g, '""')}"`
            : value
        })
      )

      // Combine headers and rows
      const csvContent = [headers, ...rows]
        .map(row => row.join(','))
        .join('\n')

      // Add BOM for proper UTF-8 encoding in Excel
      const BOM = '\uFEFF'
      const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' })

      // Generate filename with timestamp if requested
      const finalFilename = ExportService.generateFilename(filename, 'csv', includeTimestamp)

      ExportService.downloadBlob(blob, finalFilename)
    } catch (error) {
      console.error('CSV export failed:', error)
      throw new Error('Failed to export CSV file. Please try again.')
    }
  }

  static async exportToPDF<T>(options: ExportOptions<T>): Promise<void> {
    try {
      const {
        data,
        columns,
        filename,
        title = 'Data Export',
        subtitle,
        includeTimestamp = true,
        brandingInfo
      } = options
    
    const doc = new jsPDF()
    const pageWidth = doc.internal.pageSize.width
    const pageHeight = doc.internal.pageSize.height
    let yPosition = 20
    
    // Add branding header
    if (brandingInfo) {
      doc.setFontSize(16)
      doc.setFont('helvetica', 'bold')
      doc.text(brandingInfo.companyName, 20, yPosition)
      yPosition += 10
      
      if (brandingInfo.address) {
        doc.setFontSize(10)
        doc.setFont('helvetica', 'normal')
        doc.text(brandingInfo.address, 20, yPosition)
        yPosition += 8
      }
      
      if (brandingInfo.website) {
        doc.setFontSize(10)
        doc.text(brandingInfo.website, 20, yPosition)
        yPosition += 8
      }
      
      yPosition += 10
    }
    
    // Add title
    doc.setFontSize(18)
    doc.setFont('helvetica', 'bold')
    doc.text(title, 20, yPosition)
    yPosition += 15
    
    // Add subtitle if provided
    if (subtitle) {
      doc.setFontSize(12)
      doc.setFont('helvetica', 'normal')
      doc.text(subtitle, 20, yPosition)
      yPosition += 10
    }
    
    // Add timestamp
    if (includeTimestamp) {
      doc.setFontSize(10)
      doc.setFont('helvetica', 'normal')
      doc.text(`Generated on: ${new Date().toLocaleString()}`, 20, yPosition)
      yPosition += 15
    }
    
    // Prepare table data
    const tableHeaders = columns.map(col => col.label)
    const tableRows = data.map(row =>
      columns.map(col => ExportService.formatValue(row[col.key], col, row))
    )
    
    // Add table using autoTable with enhanced styling
    autoTable(doc, {
      head: [tableHeaders],
      body: tableRows,
      startY: yPosition,
      theme: 'striped',
      styles: {
        fontSize: 9,
        cellPadding: { top: 4, right: 3, bottom: 4, left: 3 },
        textColor: [51, 51, 51],
        lineColor: [200, 200, 200],
        lineWidth: 0.1,
        overflow: 'linebreak',
        cellWidth: 'wrap'
      },
      headStyles: {
        fillColor: [41, 128, 185], // Professional blue header
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 10,
        halign: 'center',
        valign: 'middle',
      },
      alternateRowStyles: {
        fillColor: [248, 249, 250], // Very light gray for better readability
      },
      columnStyles: columns.reduce((acc, col, index) => {
        acc[index] = {
          cellWidth: col.width ? Math.max(col.width / 4, 20) : 'auto',
          halign: col.align || (
            col.key.includes('amount') ||
            col.key.includes('price') ||
            col.key.includes('count') ||
            col.key.includes('revenue') ||
            col.key.includes('total')
              ? 'right' : 'left'
          ),
          valign: 'middle'
        }
        return acc
      }, {} as any),
      margin: { top: 20, right: 15, bottom: 25, left: 15 },
      tableWidth: 'auto',
      showHead: 'everyPage',
      didDrawPage: (data: any) => {
        // Add professional footer with branding
        const pageHeight = doc.internal.pageSize.height
        const pageWidth = doc.internal.pageSize.width

        // Footer separator line
        doc.setDrawColor(41, 128, 185)
        doc.setLineWidth(0.5)
        doc.line(15, pageHeight - 20, pageWidth - 15, pageHeight - 20)

        // Page numbers (centered)
        doc.setTextColor(51, 51, 51)
        doc.setFontSize(8)
        doc.setFont('helvetica', 'normal')
        const pageNumber = doc.internal.getCurrentPageInfo().pageNumber
        const totalPages = doc.internal.pages.length - 1
        doc.text(
          `Page ${pageNumber} of ${totalPages}`,
          pageWidth / 2,
          pageHeight - 10,
          { align: 'center' }
        )

        // Company branding in footer
        doc.text('NIBOG - Baby Games Platform', 15, pageHeight - 10)
        doc.text('www.nibog.com', pageWidth - 15, pageHeight - 10, { align: 'right' })
      },
      didParseCell: (data: any) => {
        // Enhance cell styling based on content
        if (data.section === 'head') {
          data.cell.styles.fillColor = [41, 128, 185]
          data.cell.styles.textColor = [255, 255, 255]
        } else {
          // Add subtle zebra striping
          if (data.row.index % 2 === 0) {
            data.cell.styles.fillColor = [255, 255, 255]
          } else {
            data.cell.styles.fillColor = [248, 249, 250]
          }

          // Right-align numeric columns
          const cellText = data.cell.text[0]
          if (cellText && /^[\d,.$₹%\s-]+$/.test(cellText)) {
            data.cell.styles.halign = 'right'
          }
        }
      }
    })
    
      // Generate filename with timestamp if requested
      const finalFilename = ExportService.generateFilename(filename, 'pdf', includeTimestamp)

      doc.save(finalFilename)
    } catch (error) {
      console.error('PDF export failed:', error)
      throw new Error('Failed to export PDF file. Please try again.')
    }
  }

  static async exportToExcel<T>(options: ExportOptions<T>): Promise<void> {
    try {
      const { data, columns, filename, title, subtitle, includeTimestamp = true, brandingInfo } = options

      // Create a new workbook
      const workbook = XLSX.utils.book_new()

      // Prepare worksheet data
      const headers = columns.map(col => col.label)
      const rows = data.map(row =>
        columns.map(col => {
          const value = ExportService.formatValue(row[col.key], col, row)
          // Try to convert numeric strings back to numbers for Excel
          const numValue = parseFloat(value)
          return !isNaN(numValue) && isFinite(numValue) && value.trim() !== '' ? numValue : value
        })
      )

      // Create worksheet data with headers
      const worksheetData = [headers, ...rows]

      // Add title and subtitle if provided
      if (title || subtitle || brandingInfo) {
        const titleRows: any[][] = []

        if (brandingInfo?.companyName) {
          titleRows.push([brandingInfo.companyName])
          titleRows.push([]) // Empty row
        }

        if (title) {
          titleRows.push([title])
        }

        if (subtitle) {
          titleRows.push([subtitle])
        }

        if (includeTimestamp) {
          titleRows.push([`Generated on: ${new Date().toLocaleString()}`])
        }

        if (titleRows.length > 0) {
          titleRows.push([]) // Empty row before data
          worksheetData.unshift(...titleRows)
        }
      }

      // Create worksheet
      const worksheet = XLSX.utils.aoa_to_sheet(worksheetData)

      // Set column widths based on content
      const columnWidths = columns.map(col => ({
        wch: Math.max(col.width || 100, col.label.length * 1.2) / 8 // Convert pixels to character width
      }))
      worksheet['!cols'] = columnWidths

      // Add the worksheet to workbook
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Data')

      // Generate Excel file
      const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' })

      // Create blob and download
      const finalFilename = ExportService.generateFilename(filename, 'xlsx', includeTimestamp)
      const blob = new Blob([excelBuffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      })
      ExportService.downloadBlob(blob, finalFilename)
    } catch (error) {
      console.error('Excel export failed:', error)
      throw new Error('Failed to export Excel file. Please try again.')
    }
  }

  private static downloadBlob(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    link.style.display = 'none'

    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    // Clean up the URL object
    setTimeout(() => URL.revokeObjectURL(url), 100)
  }

  private static generateFilename(filename: string, extension: string, includeTimestamp: boolean = true): string {
    const timestamp = includeTimestamp
      ? `_${new Date().toISOString().split('T')[0]}`
      : ''
    return `${filename}${timestamp}.${extension}`
  }

  static getExportPreview<T>(data: T[], columns: ExportColumn<T>[], maxRows: number = 5): {
    headers: string[]
    rows: string[][]
    totalRows: number
  } {
    const headers = columns.map(col => col.label)
    const previewData = data.slice(0, maxRows)
    const rows = previewData.map(row =>
      columns.map(col => ExportService.formatValue(row[col.key], col, row))
    )
    
    return {
      headers,
      rows,
      totalRows: data.length
    }
  }
}

// Utility functions for common export scenarios
export const createBookingExportColumns = () => [
  { key: 'booking_id' as const, label: 'Booking ID', width: 80 },
  { key: 'booking_ref' as const, label: 'Booking Ref', width: 120 },
  { key: 'game_name' as const, label: 'Game Name', width: 120 },
  { key: 'parent_name' as const, label: 'Parent Name', width: 120 },
  { key: 'parent_email' as const, label: 'Email', width: 150 },
  { key: 'parent_additional_phone' as const, label: 'Phone Number', width: 120 },
  { key: 'child_full_name' as const, label: 'Child Name', width: 120 },
  {
    key: 'child_age' as const,
    label: 'Child Age',
    width: 120,
    format: (value: any) => value || 'N/A'
  },
  { key: 'child_gender' as const, label: 'Child Gender', width: 100 },
  { key: 'child_school_name' as const, label: 'School Name', width: 150, format: (value: any) => value || 'Not Specified' },
  { key: 'child_date_of_birth' as const, label: 'Child DOB', width: 120, format: (value: any) => value ? new Date(value).toLocaleDateString() : 'N/A' },
  { key: 'event_title' as const, label: 'Event', width: 150 },
  { key: 'city_name' as const, label: 'City', width: 100 },
  { key: 'venue_name' as const, label: 'Venue', width: 120 },
  { key: 'total_amount' as const, label: 'Amount', width: 80, format: (value: any) => `₹${value}`, align: 'right' as const },
  { key: 'booking_status' as const, label: 'Status', width: 80 },
  { key: 'payment_status' as const, label: 'Payment Status', width: 100 },
  { key: 'booking_created_at' as const, label: 'Booking Date', width: 100, format: (value: any) => new Date(value).toLocaleDateString() },
]

export const createEventExportColumns = () => [
  { key: 'id' as const, label: 'Event ID', width: 80 },
  { key: 'title' as const, label: 'Event Title', width: 200 },
  { key: 'gameTemplate' as const, label: 'Games', width: 150 },
  { key: 'venue' as const, label: 'Venue', width: 150 },
  { key: 'city' as const, label: 'City', width: 100 },
  { key: 'date' as const, label: 'Date', width: 100, format: (value: any) => new Date(value).toLocaleDateString() },
  { key: 'status' as const, label: 'Status', width: 100 },
  { key: 'slots' as const, label: 'Total Slots', width: 80, format: (value: any) => Array.isArray(value) ? value.length.toString() : '0', align: 'right' as const },
]

export const createUserExportColumns = () => [
  { key: 'user_id' as const, label: 'User ID', width: 80 },
  { key: 'full_name' as const, label: 'Full Name', width: 150 },
  { key: 'email' as const, label: 'Email', width: 200 },
  { key: 'phone' as const, label: 'Phone', width: 120 },
  { key: 'city_name' as const, label: 'City', width: 100 },
  { key: 'state' as const, label: 'State', width: 100 },
  { key: 'is_active' as const, label: 'Active Status', width: 100, format: (value: any) => value ? 'Active' : 'Inactive' },
  { key: 'is_locked' as const, label: 'Locked Status', width: 100, format: (value: any) => value ? 'Locked' : 'Unlocked' },
  { key: 'email_verified' as const, label: 'Email Verified', width: 120, format: (value: any) => value ? 'Yes' : 'No' },
  { key: 'phone_verified' as const, label: 'Phone Verified', width: 120, format: (value: any) => value ? 'Yes' : 'No' },
  { key: 'created_at' as const, label: 'Registration Date', width: 120, format: (value: any) => new Date(value).toLocaleDateString() },
  { key: 'last_login_at' as const, label: 'Last Login', width: 120, format: (value: any) => value ? new Date(value).toLocaleDateString() : 'Never' },
]

export const createPaymentExportColumns = () => [
  { key: 'payment_id' as const, label: 'Payment ID', width: 80 },
  { key: 'transaction_id' as const, label: 'Transaction ID', width: 150 },
  { key: 'booking_id' as const, label: 'Booking ID', width: 80 },
  { key: 'user_name' as const, label: 'Customer Name', width: 150 },
  { key: 'user_email' as const, label: 'Customer Email', width: 200 },
  { key: 'user_phone' as const, label: 'Customer Phone', width: 120 },
  { key: 'amount' as const, label: 'Amount', width: 100, format: (value: any) => `₹${parseFloat(value.toString()).toFixed(2)}`, align: 'right' as const },
  { key: 'payment_method' as const, label: 'Payment Method', width: 120 },
  { key: 'payment_status' as const, label: 'Status', width: 100 },
  { key: 'payment_date' as const, label: 'Payment Date', width: 120, format: (value: any) => new Date(value).toLocaleDateString() },
  { key: 'event_title' as const, label: 'Event', width: 200 },
  { key: 'event_date' as const, label: 'Event Date', width: 100, format: (value: any) => new Date(value).toLocaleDateString() },
  { key: 'city_name' as const, label: 'City', width: 100 },
  { key: 'venue_name' as const, label: 'Venue', width: 150 },
  { key: 'child_name' as const, label: 'Child Name', width: 120 },
  { key: 'game_name' as const, label: 'Game', width: 120 },
  { key: 'refund_amount' as const, label: 'Refund Amount', width: 100, format: (value: any) => value ? `₹${parseFloat(value.toString()).toFixed(2)}` : '₹0.00', align: 'right' as const },
  { key: 'refund_reason' as const, label: 'Refund Reason', width: 200 },
  { key: 'admin_notes' as const, label: 'Admin Notes', width: 200 },
  { key: 'created_at' as const, label: 'Created At', width: 120, format: (value: any) => new Date(value).toLocaleDateString() },
]

export const createVenueExportColumns = (): ExportColumn<any>[] => [
  { key: 'venue_id' as const, label: 'Venue ID', width: 80 },
  { key: 'venue_name' as const, label: 'Venue Name', width: 200 },
  { key: 'address' as const, label: 'Address', width: 250 },
  { key: 'city_name' as const, label: 'City', width: 100 },
  { key: 'capacity' as const, label: 'Capacity', width: 80, align: 'right' as const },
  { key: 'venue_is_active' as const, label: 'Status', width: 80, format: (value: any) => value ? 'Active' : 'Inactive' },
  { key: 'venue_created_at' as const, label: 'Created At', width: 120, format: (value: any) => new Date(value).toLocaleDateString() },
]

export const createCityExportColumns = () => [
  { key: 'city_id' as const, label: 'City ID', width: 80 },
  { key: 'city_name' as const, label: 'City Name', width: 150 },
  { key: 'state' as const, label: 'State', width: 100 },
  { key: 'is_active' as const, label: 'Status', width: 80, format: (value: any) => value ? 'Active' : 'Inactive' },
  { key: 'total_venues' as const, label: 'Total Venues', width: 100, align: 'right' as const },
  { key: 'total_events' as const, label: 'Total Events', width: 100, align: 'right' as const },
  { key: 'created_at' as const, label: 'Created At', width: 120, format: (value: any) => new Date(value).toLocaleDateString() },
]

export const createGameExportColumns = () => [
  { key: 'id' as const, label: 'Game ID', width: 80 },
  { key: 'game_name' as const, label: 'Game Name', width: 200 },
  { key: 'description' as const, label: 'Description', width: 300 },
  { key: 'min_age' as const, label: 'Min Age', width: 80, align: 'right' as const },
  { key: 'max_age' as const, label: 'Max Age', width: 80, align: 'right' as const },
  { key: 'duration_minutes' as const, label: 'Duration (min)', width: 100, align: 'right' as const },
  { key: 'categories' as const, label: 'Categories', width: 150, format: (value: any) => Array.isArray(value) ? value.join(', ') : String(value) },
  { key: 'is_active' as const, label: 'Status', width: 80, format: (value: any) => value ? 'Active' : 'Inactive' },
  { key: 'created_at' as const, label: 'Created At', width: 120, format: (value: any) => value ? new Date(value).toLocaleDateString() : '' },
]

export const createAttendanceExportColumns = () => [
  { key: 'attendance_id' as const, label: 'Attendance ID', width: 100 },
  { key: 'booking_ref' as const, label: 'Booking Ref', width: 120 },
  { key: 'parent_name' as const, label: 'Parent Name', width: 150 },
  { key: 'child_name' as const, label: 'Child Name', width: 150 },
  { key: 'event_title' as const, label: 'Event', width: 200 },
  { key: 'game_name' as const, label: 'Game', width: 150 },
  { key: 'venue_name' as const, label: 'Venue', width: 150 },
  { key: 'city_name' as const, label: 'City', width: 100 },
  { key: 'event_date' as const, label: 'Event Date', width: 100, format: (value: any) => new Date(value).toLocaleDateString() },
  { key: 'check_in_time' as const, label: 'Check-in Time', width: 120, format: (value: any) => value ? new Date(value).toLocaleString() : 'Not checked in' },
  { key: 'attendance_status' as const, label: 'Status', width: 100 },
  { key: 'notes' as const, label: 'Notes', width: 200 },
]

export const createCompletedEventExportColumns = () => [
  { key: 'event_id' as const, label: 'Event ID', width: 80 },
  { key: 'title' as const, label: 'Event Title', width: 200 },
  { key: 'gameTemplate' as const, label: 'Games', width: 150 },
  { key: 'venue' as const, label: 'Venue', width: 150 },
  { key: 'city' as const, label: 'City', width: 100 },
  { key: 'date' as const, label: 'Event Date', width: 100, format: (value: any) => new Date(value).toLocaleDateString() },
  { key: 'registrations' as const, label: 'Registrations', width: 100, align: 'right' as const },
  { key: 'attendance' as const, label: 'Attendance', width: 100, align: 'right' as const },
  { key: 'attendanceRate' as const, label: 'Attendance Rate', width: 120, format: (value: any) => `${value}%`, align: 'right' as const },
  { key: 'revenue' as const, label: 'Revenue', width: 100, format: (value: any) => `₹${value}`, align: 'right' as const },
  { key: 'completedAt' as const, label: 'Completed At', width: 120, format: (value: any) => new Date(value).toLocaleDateString() },
]
