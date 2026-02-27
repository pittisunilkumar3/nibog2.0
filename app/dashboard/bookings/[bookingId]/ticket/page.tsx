import Link from "next/link"
import { Button } from "@/components/ui/button"
import TicketClient from "./ticket-client"
import { headers } from "next/headers"

type Props = {
  params: Promise<{ bookingId: string }>
}

async function getBookingData(bookingId: string) {
  try {
    // Get the host from headers for server-side fetching
    const headersList = await headers()
    const host = headersList.get("host") || "localhost:3112"
    const protocol = process.env.NODE_ENV === "production" ? "https" : "http"
    const baseUrl = `${protocol}://${host}`
    
    const response = await fetch(`${baseUrl}/api/bookings/get/${bookingId}`, {
      cache: 'no-store'
    })

    if (response.ok) {
      const bookingData = await response.json()
      return bookingData
    }
    
    // Log error for debugging
    const errorData = await response.json().catch(() => ({}))
    console.error('API error:', response.status, errorData)
  } catch (error) {
    console.error('Error fetching booking data:', error)
  }

  return null
}

export default async function TicketPage({ params }: Props) {
  const { bookingId } = await params
  const bookingData = await getBookingData(bookingId)

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

  return <TicketClient bookingData={bookingData} bookingId={bookingId} />
}

