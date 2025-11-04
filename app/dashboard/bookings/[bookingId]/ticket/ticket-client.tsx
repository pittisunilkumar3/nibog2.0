"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Calendar, Clock, MapPin, Baby, Download, ArrowLeft } from "lucide-react"
import { QRCodeCanvas } from "qrcode.react"
import { formatDateShort } from "@/lib/utils"

type TicketClientProps = {
  bookingData: any // Real booking data from API
  bookingId: string
}

export default function TicketClient({ bookingData, bookingId }: TicketClientProps) {
  const [isPrinting, setIsPrinting] = useState(false)

  // Handle print ticket
  const handlePrintTicket = () => {
    setIsPrinting(true)
    window.print()
    setTimeout(() => setIsPrinting(false), 1000)
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

  // Generate QR code data
  const qrCodeData = JSON.stringify({
    ref: bookingData.booking_ref || bookingId,
    id: bookingData.booking_id || bookingId,
    name: bookingData.child_full_name || bookingData.child_name || 'Child',
    event: bookingData.event_title || bookingData.game_name || 'NIBOG Event',
    booking_id: bookingData.booking_id || bookingId
  })

  // Format date and time
  const formatDate = (dateString: string) => {
    if (!dateString) return 'TBD'
    try {
      return formatDateShort(dateString)
    } catch {
      return dateString
    }
  }

  const formatTime = (timeString: string) => {
    if (!timeString) return 'TBD'
    try {
      return new Date(timeString).toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      })
    } catch {
      return timeString
    }
  }

  return (
    <div className="container py-8">
      <div className="mb-6 flex items-center gap-2 print:hidden">
        <Button variant="outline" size="icon" asChild>
          <Link href={`/dashboard/bookings/${bookingId}`}>
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back</span>
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Event Ticket</h1>
          <p className="text-muted-foreground">
            Booking ID: {bookingData.booking_ref || bookingData.booking_id || bookingId} | {bookingData.event_title || bookingData.game_name || 'NIBOG Event'}
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-2xl">
        <Card className="overflow-hidden border-2">
          <div className="bg-primary px-6 py-2 text-center text-primary-foreground">
            <h2 className="text-lg font-bold">NIBOG EVENT TICKET</h2>
          </div>
          <CardHeader className="flex flex-row items-center justify-between border-b pb-4">
            <div>
              <CardTitle className="text-2xl">{bookingData.event_title || bookingData.game_name || 'NIBOG Event'}</CardTitle>
              <p className="text-muted-foreground">Booking ID: {bookingData.booking_ref || bookingData.booking_id || bookingId}</p>
            </div>
            <div className="text-right">
              <p className="font-medium">Status: {bookingData.booking_status || bookingData.status || 'Confirmed'}</p>
              <p className="text-sm text-muted-foreground">
                Booked on {formatDate(bookingData.booking_created_at || bookingData.created_at)}
              </p>
            </div>
          </CardHeader>
          <CardContent className="space-y-6 p-6">
            <div className="flex flex-col gap-6 sm:flex-row">
              <div className="flex-1 space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Date</p>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(bookingData.event_event_date || bookingData.event_date)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Time</p>
                      <p className="text-sm text-muted-foreground">
                        {bookingData.start_time && bookingData.end_time
                          ? `${formatTime(bookingData.start_time)} - ${formatTime(bookingData.end_time)}`
                          : 'Time TBD'
                        }
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Venue</p>
                      <p className="text-sm text-muted-foreground">
                        {bookingData.venue_name || 'NIBOG Venue'}
                      </p>
                      {bookingData.venue_address && (
                        <p className="text-xs text-muted-foreground">{bookingData.venue_address}</p>
                      )}
                      {bookingData.city_name && (
                        <p className="text-xs text-muted-foreground">{bookingData.city_name}, {bookingData.city_state}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Baby className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Child</p>
                      <p className="text-sm text-muted-foreground">
                        {bookingData.child_full_name || 'Child'}
                      </p>
                      {bookingData.child_date_of_birth && (
                        <p className="text-xs text-muted-foreground">
                          DOB: {formatDate(bookingData.child_date_of_birth)}
                        </p>
                      )}
                      {bookingData.child_gender && (
                        <p className="text-xs text-muted-foreground">
                          Gender: {bookingData.child_gender}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="mb-2 font-medium">Important Information</h3>
                  <p className="text-sm text-muted-foreground">
                    {bookingData.game_description || bookingData.event_description ||
                     'Please arrive 15 minutes before the event starts. Parents must stay with their children throughout the event.'}
                  </p>
                  <div className="mt-2">
                    <p className="text-sm font-medium text-green-600">
                      Amount Paid: ₹{bookingData.total_amount || '0'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Payment Status: {bookingData.payment_status || 'Paid'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Payment Method: {bookingData.payment_method || 'Online'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-center justify-center">
                <div className="relative h-40 w-40 overflow-hidden rounded-md bg-white p-2 border">
                  <QRCodeCanvas
                    value={qrCodeData}
                    size={150}
                    level="M"
                    includeMargin={true}
                    className="w-full h-full"
                  />
                </div>
                <p className="mt-2 text-center text-xs text-muted-foreground">Scan this QR code at the venue</p>
                <p className="text-center text-xs font-medium">
                  {bookingData.booking_ref || `NIBOG-${bookingData.booking_id || bookingId}`}
                </p>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between border-t p-6 print:hidden">
            <Button variant="outline" asChild>
              <Link href={`/dashboard/bookings/${bookingId}`}>
                Back to Booking
              </Link>
            </Button>
            <Button onClick={handlePrintTicket}>
              <Download className="mr-2 h-4 w-4" />
              {isPrinting ? "Printing..." : "Print Ticket"}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}

