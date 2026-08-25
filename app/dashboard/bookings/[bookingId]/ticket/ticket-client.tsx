"use client"

import { useState, useRef } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Download, ArrowLeft, Loader2 } from "lucide-react"
import { QRCodeSVG } from "qrcode.react"
import { formatDateShort } from "@/lib/utils"
import html2canvas from "html2canvas"
import jsPDF from "jspdf"

type TicketClientProps = {
  bookingData: any
  bookingId: string
}

export default function TicketClient({ bookingData, bookingId }: TicketClientProps) {
  const [isDownloading, setIsDownloading] = useState(false)
  // When rendered under /admin (staff view), "Back" returns to the admin
  // booking detail instead of the customer dashboard.
  const pathname = typeof window !== "undefined" ? window.location.pathname : ""
  const isAdminView = pathname.startsWith("/admin")
  const backHref = isAdminView ? `/admin/bookings/${bookingId}` : "/dashboard/bookings"
  const [downloadError, setDownloadError] = useState<string | null>(null)
  const ticketRef = useRef<HTMLDivElement>(null)

  // Handle download ticket as PDF
  const handleDownloadTicket = async () => {
    if (!ticketRef.current) {
      setDownloadError("Unable to generate ticket. Please try again.")
      return
    }

    setIsDownloading(true)
    setDownloadError(null)

    try {
      const ticketElement = ticketRef.current
      
      // Wait for QR code to render
      await new Promise(resolve => setTimeout(resolve, 100))
      
      // Clone the element
      const clone = ticketElement.cloneNode(true) as HTMLElement
      
      // Style the clone
      clone.style.position = 'absolute'
      clone.style.left = '-9999px'
      clone.style.top = '0'
      clone.style.width = ticketElement.offsetWidth + 'px'
      clone.style.backgroundColor = '#ffffff'
      clone.style.padding = '20px'
      document.body.appendChild(clone)
      
      // Wait a bit for clone to settle
      await new Promise(resolve => setTimeout(resolve, 200))
      
      // Capture the cloned ticket
      const canvas = await html2canvas(clone, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false,
        width: ticketElement.offsetWidth + 40,
        height: clone.offsetHeight,
        x: 0,
        y: 0,
        scrollX: 0,
        scrollY: 0,
      })
      
      // Remove the clone
      document.body.removeChild(clone)

      // Create PDF — landscape "brochure" orientation when the ticket is wide
      const isLandscape = canvas.width > canvas.height
      const pdf = new jsPDF({
        orientation: isLandscape ? 'landscape' : 'portrait',
        unit: 'mm',
        format: 'a4'
      })

      const imgData = canvas.toDataURL('image/png', 1.0)
      const pdfWidth = pdf.internal.pageSize.getWidth()
      const pdfHeight = pdf.internal.pageSize.getHeight()
      // Fit the whole ticket on one page, centred vertically
      const scale = Math.min(pdfWidth / canvas.width, pdfHeight / canvas.height)
      const imgW = canvas.width * scale
      const imgH = canvas.height * scale
      pdf.addImage(imgData, 'PNG', (pdfWidth - imgW) / 2, (pdfHeight - imgH) / 2, imgW, imgH)

      // Generate filename — use the numeric booking id for consistency with admin
      const bookingRef = bookingData.booking_id || bookingId
      const childName = bookingData.child_full_name || bookingData.child_name || 'ticket'
      const filename = `NIBOG_Ticket_${bookingRef}_${childName.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`

      pdf.save(filename)
      
    } catch (error) {
      console.error("Error generating ticket PDF:", error)
      setDownloadError("Failed to download ticket. Please try again.")
    } finally {
      setIsDownloading(false)
    }
  }

  if (!bookingData) {
    return (
      <div className="container flex h-[400px] items-center justify-center py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Booking Not Found</h2>
          <p className="text-muted-foreground">The booking you're looking for doesn't exist or has been removed.</p>
          <Button className="mt-4" asChild>
            <Link href={backHref}>Back to Bookings</Link>
          </Button>
        </div>
      </div>
    )
  }

  // Format functions
  const formatDate = (dateString: string) => {
    if (!dateString) return 'TBD'
    try {
      return formatDateShort(dateString)
    } catch {
      return dateString
    }
  }

  const formatTime = (timeString: string) => {
    if (!timeString) return ''
    try {
      if (/^\d{1,2}:\d{2}(:\d{2})?$/.test(timeString)) {
        const [hours, minutes] = timeString.split(':')
        const hour = parseInt(hours, 10)
        const ampm = hour >= 12 ? 'PM' : 'AM'
        const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour
        return `${displayHour}:${minutes} ${ampm}`
      }
      const date = new Date(timeString)
      if (!isNaN(date.getTime())) {
        return date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })
      }
      return timeString
    } catch {
      return timeString
    }
  }

  // Get display values
  const eventTitle = bookingData.event_title || bookingData.game_name || 'NIBOG Event'
  const eventDate = bookingData.event_date || bookingData.event_event_date
  const venueName = bookingData.venue_name || 'NIBOG Venue'
  const childName = bookingData.child_full_name || bookingData.child_name || 'Child'
  // Show the numeric booking id (same as the admin dashboard) so parents and
  // staff reference the SAME id everywhere: admin table, ticket page, PDF.
  const bookingRef = bookingData.booking_id || bookingId
  const status = bookingData.booking_status || bookingData.status || 'Confirmed'
  const bookingGames = bookingData.booking_games || []
  const startTime = bookingData.earliest_start_time || bookingData.start_time
  const endTime = bookingData.latest_end_time || bookingData.end_time

  // QR code data
  const qrCodeData = JSON.stringify({
    ref: bookingRef,
    id: bookingData.booking_id || bookingId,
    name: childName,
    event: eventTitle,
    booking_id: bookingData.booking_id || bookingId
  })

  return (
    <div className="container py-8">
      {/* Header */}
      <div className="mb-6 flex items-center gap-2">
        <Button variant="outline" size="icon" asChild>
          <Link href={backHref}>
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back</span>
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Event Ticket</h1>
          <p className="text-muted-foreground">
            Booking ID: {bookingRef} | {eventTitle}
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-4xl">
        {/* Error message */}
        {downloadError && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {downloadError}
          </div>
        )}
        
        {/* Ticket Card */}
<div ref={ticketRef} className="bg-white p-3">
          <Card className="overflow-hidden rounded-2xl border-2 shadow-[0_20px_60px_-30px_rgba(147,51,234,0.45)]">
            {/* ── Top brand band ─────────────────────────────── */}
            <div className="flex items-center justify-between bg-gradient-to-r from-purple-600 via-fuchsia-500 to-pink-500 px-5 py-3.5 text-white sm:px-7">
              <div className="flex items-center gap-3">
                <span className="text-2xl">🎫</span>
                <div>
                  <h2 className="text-lg font-black uppercase tracking-[0.18em] sm:text-xl">NIBOG Event Ticket</h2>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-white/80">Official Entry Pass</p>
                </div>
              </div>
              <div className="text-right">
                <span className={`inline-block rounded-full px-3 py-1 text-[11px] font-black ${status === 'Confirmed' ? 'bg-emerald-300 text-emerald-950' : 'bg-amber-300 text-amber-950'}`}>
                  {status === 'Confirmed' ? '✓ CONFIRMED' : status.toUpperCase()}
                </span>
                <p className="mt-1 text-[10px] text-white/85">Booked {formatDate(bookingData.booking_created_at || bookingData.created_at)}</p>
              </div>
            </div>

            {/* ── Body: 3 columns (stacks on mobile) ─────────── */}
            <CardContent className="p-0">
              <div className="grid grid-cols-1 md:grid-cols-[1.15fr_1.15fr_0.85fr]">
                {/* Column 1 — EVENT */}
                <div className="space-y-3 border-b border-slate-100 p-5 sm:p-6 md:border-b-0 md:border-r">
                  <h3 className="text-[11px] font-black uppercase tracking-[0.22em] text-purple-600">Event</h3>
                  <p className="text-lg font-black leading-snug text-slate-950 sm:text-xl">{eventTitle}</p>
                  <div className="space-y-2.5 pt-1 text-sm">
                    <div className="flex items-center gap-2.5">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-purple-100 text-sm">📅</span>
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Date</p>
                        <p className="font-bold text-slate-800">{formatDate(eventDate)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm">🕐</span>
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Time</p>
                        <p className="font-bold text-slate-800">
                          {startTime && endTime ? `${formatTime(startTime)} – ${formatTime(endTime)}` : startTime ? formatTime(startTime) : 'Time TBD'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2.5">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-sm">📍</span>
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Venue</p>
                        <p className="font-bold leading-tight text-slate-800">{venueName}</p>
                        {bookingData.venue_address && <p className="text-xs text-slate-500">{bookingData.venue_address}</p>}
                        {bookingData.city_name && (
                          <p className="text-xs text-slate-500">{bookingData.city_name}{bookingData.city_state ? `, ${bookingData.city_state}` : ''}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Column 2 — PARTICIPANT + GAMES + PAYMENT */}
                <div className="space-y-3 border-b border-slate-100 p-5 sm:p-6 md:border-b-0 md:border-r">
                  <h3 className="text-[11px] font-black uppercase tracking-[0.22em] text-pink-600">Participant</h3>
                  <p className="text-lg font-black leading-snug text-slate-950">{childName}</p>
                  <p className="-mt-2 text-xs text-slate-500">
                    👶 DOB: {formatDate(bookingData.child_date_of_birth || '')}{bookingData.child_school_name ? ` · ${bookingData.child_school_name.trim()}` : ''}
                  </p>

                  <Separator className="my-1" />

                  <div className="space-y-1.5">
                    <h3 className="text-[11px] font-black uppercase tracking-[0.22em] text-purple-600">Games ({bookingGames.length})</h3>
                    {bookingGames.map((game: any, index: number) => (
                      <div key={index} className="flex items-center justify-between gap-2 text-sm">
                        <div className="min-w-0">
                          <p className="truncate font-bold text-slate-800">🎮 {game.game_name}</p>
                          {game.slot_start_time && game.slot_end_time && (
                            <p className="text-[11px] text-slate-500">{formatTime(game.slot_start_time)} – {formatTime(game.slot_end_time)}</p>
                          )}
                        </div>
                        <Badge variant="outline" className="shrink-0 font-bold">₹{game.game_price || '0'}</Badge>
                      </div>
                    ))}
                    {bookingGames.length === 0 && bookingData.all_games && bookingData.all_games.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {bookingData.all_games.map((game: string, index: number) => (
                          <Badge key={index} variant="secondary" className="text-xs">{game}</Badge>
                        ))}
                      </div>
                    )}
                  </div>

                  <Separator className="my-1" />

                  <div className="flex items-end justify-between">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Amount Paid</p>
                      <p className="text-2xl font-black text-emerald-700">₹{bookingData.total_amount || '0'}</p>
                    </div>
                    <div className="text-right text-[11px]">
                      <p className="font-black text-emerald-600">{bookingData.payment_status || 'Paid'}</p>
                      <p className="text-slate-500">via {bookingData.payment_method || 'Online'}</p>
                    </div>
                  </div>
                </div>

                {/* Column 3 — QR (perforated stub) */}
                <div className="relative flex flex-col items-center justify-center gap-2 bg-slate-50/60 p-5 md:border-l-2 md:border-dashed md:border-slate-300">
                  <div className="rounded-xl border-2 border-slate-200 bg-white p-2.5 shadow-sm">
                    <QRCodeSVG
                      value={qrCodeData}
                      size={128}
                      level="H"
                      includeMargin={false}
                    />
                  </div>
                  <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">Scan at venue</p>
                  <p className="text-xl font-black tracking-tight text-purple-700">{bookingRef}</p>
                  <p className="-mt-1.5 text-[9px] font-bold uppercase tracking-widest text-slate-400">Booking ID</p>
                </div>
              </div>

              {/* ── Footer strip ─────────────────────────────── */}
              <div className="flex flex-wrap items-center gap-x-5 gap-y-1 bg-gradient-to-r from-purple-600 to-pink-500 px-5 py-2.5 text-[11px] font-semibold text-white sm:px-7">
                <span>⚠️ Arrive 15 minutes early</span>
                <span className="hidden sm:inline">👨‍👩‍👧 Parents must stay with children</span>
                <span>🎟️ Bring printed or digital ticket</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex flex-col sm:flex-row justify-between gap-3">
          <Button variant="outline" asChild className="w-full sm:w-auto">
            <Link href={backHref}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Bookings
            </Link>
          </Button>
          <Button 
            onClick={handleDownloadTicket} 
            disabled={isDownloading}
            className="w-full sm:w-auto bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600"
          >
            {isDownloading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Downloading...
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                Download PDF
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
