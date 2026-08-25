import TicketClient from "@/app/dashboard/bookings/[bookingId]/ticket/ticket-client"
import { headers } from "next/headers"
import Link from "next/link"
import { Button } from "@/components/ui/button"

type Props = {
  params: Promise<{ id: string }>
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

    console.error('API error:', response.status)
  } catch (error) {
    console.error('Error fetching booking data:', error)
  }

  return null
}

// Admin view of the customer ticket — renders the exact same ticket the
// customer sees (with Download PDF). Lives under /admin so staff sessions
// (superadmin token) can open it without a customer login.
export default async function AdminTicketPage({ params }: Props) {
  const { id: bookingId } = await params
  const bookingData = await getBookingData(bookingId)

  if (!bookingData) {
    return (
      <div className="container flex h-[400px] items-center justify-center py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Booking Not Found</h2>
          <p className="text-muted-foreground">The booking you're looking for doesn't exist or has been removed.</p>
          <Button className="mt-4" asChild>
            <Link href="/admin/bookings">Back to Bookings</Link>
          </Button>
        </div>
      </div>
    )
  }

  return <TicketClient bookingData={bookingData} bookingId={bookingId} />
}
