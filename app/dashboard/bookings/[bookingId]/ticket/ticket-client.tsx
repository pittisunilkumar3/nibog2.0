"use client"

import { useState, useRef } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, MapPin, Baby, Download, ArrowLeft, Loader2, Gamepad2 } from "lucide-react"
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

      // Create PDF
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      })

      const imgData = canvas.toDataURL('image/png', 1.0)
      const pdfWidth = pdf.internal.pageSize.getWidth()
      const imgHeight = (canvas.height * pdfWidth) / canvas.width

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, imgHeight)

      // Generate filename
      const bookingRef = bookingData.booking_ref || bookingData.booking_id || bookingId
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
            <Link href="/dashboard/bookings">Back to Bookings</Link>
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
  const bookingRef = bookingData.booking_ref || bookingData.booking_id || bookingId
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
          <Link href="/dashboard/bookings">
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

      <div className="mx-auto max-w-2xl">
        {/* Error message */}
        {downloadError && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {downloadError}
          </div>
        )}
        
        {/* Ticket Card */}
        <div ref={ticketRef} className="bg-white p-4">
          <Card className="overflow-hidden border-2 shadow-lg">
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-600 to-pink-500 px-6 py-4 text-center text-white">
              <h2 className="text-2xl font-bold tracking-wide">🎫 NIBOG EVENT TICKET</h2>
            </div>
            
            <CardHeader className="flex flex-row items-center justify-between border-b pb-4">
              <div>
                <CardTitle className="text-2xl">{eventTitle}</CardTitle>
                <p className="text-muted-foreground text-sm mt-1">Booking ID: {bookingRef}</p>
              </div>
              <div className="text-right">
                <p className="font-medium">
                  Status: <span className={status === 'Confirmed' ? 'text-green-600' : 'text-orange-500'}>{status}</span>
                </p>
                <p className="text-sm text-muted-foreground">
                  Booked on {formatDate(bookingData.booking_created_at || bookingData.created_at)}
                </p>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-6 p-6">
              <div className="flex flex-col gap-6 sm:flex-row">
                <div className="flex-1 space-y-4">
                  {/* Event Details Grid */}
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100 text-lg">
                        📅
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Date</p>
                        <p className="font-medium">{formatDate(eventDate)}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-lg">
                        🕐
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Time</p>
                        <p className="font-medium">
                          {startTime && endTime
                            ? `${formatTime(startTime)} - ${formatTime(endTime)}`
                            : startTime ? formatTime(startTime) : 'Time TBD'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 text-lg">
                        📍
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Venue</p>
                        <p className="font-medium">{venueName}</p>
                        {bookingData.venue_address && (
                          <p className="text-xs text-muted-foreground">{bookingData.venue_address}</p>
                        )}
                        {bookingData.city_name && (
                          <p className="text-xs text-muted-foreground">{bookingData.city_name}{bookingData.city_state ? `, ${bookingData.city_state}` : ''}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-pink-100 text-lg">
                        👶
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Child</p>
                        <p className="font-medium">{childName}</p>
                        {bookingData.child_date_of_birth && (
                          <p className="text-xs text-muted-foreground">DOB: {formatDate(bookingData.child_date_of_birth)}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Games Section */}
                  {bookingGames.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-lg">🎮</span>
                        <h3 className="font-semibold">Games Booked ({bookingGames.length})</h3>
                      </div>
                      <div className="space-y-2">
                        {bookingGames.map((game: any, index: number) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
                            <div className="flex-1">
                              <p className="font-medium">{game.game_name}</p>
                              {game.slot_start_time && game.slot_end_time && (
                                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                                  <Clock className="h-3 w-3" />
                                  {formatTime(game.slot_start_time)} - {formatTime(game.slot_end_time)}
                                </p>
                              )}
                            </div>
                            <Badge variant="outline" className="ml-2 font-semibold">
                              ₹{game.game_price || '0'}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {bookingGames.length === 0 && bookingData.all_games && bookingData.all_games.length > 0 && (
                    <div>
                      <h3 className="font-semibold mb-2">Games Booked</h3>
                      <div className="flex flex-wrap gap-2">
                        {bookingData.all_games.map((game: string, index: number) => (
                          <Badge key={index} variant="secondary">
                            {game}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Payment Summary */}
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4 border border-green-200">
                    <h3 className="font-semibold mb-2 text-green-800">💰 Payment Summary</h3>
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-2xl font-bold text-green-700">₹{bookingData.total_amount || '0'}</p>
                        <p className="text-xs text-muted-foreground">Amount Paid</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-green-600">
                          {bookingData.payment_status || 'Paid'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          via {bookingData.payment_method || 'Online'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Important Note */}
                  <div className="text-xs text-muted-foreground bg-gray-50 p-3 rounded-lg">
                    <p className="font-medium mb-1">⚠️ Important:</p>
                    <p>Please arrive 15 minutes before the event starts. Parents must stay with their children throughout the event. Bring this ticket (printed or digital) for entry.</p>
                  </div>
                </div>

                {/* QR Code Section */}
                <div className="flex flex-col items-center justify-center">
                  <div className="bg-white p-3 rounded-xl border-2 border-gray-200 shadow-sm">
                    <QRCodeSVG
                      value={qrCodeData}
                      size={140}
                      level="H"
                      includeMargin={false}
                    />
                  </div>
                  <p className="mt-3 text-center text-xs text-muted-foreground">Scan at venue for entry</p>
                  <p className="text-center text-sm font-bold mt-1 text-purple-600">
                    {bookingRef}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex flex-col sm:flex-row justify-between gap-3">
          <Button variant="outline" asChild className="w-full sm:w-auto">
            <Link href="/dashboard/bookings">
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
