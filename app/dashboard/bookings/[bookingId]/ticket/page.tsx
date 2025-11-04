import Link from "next/link"
import { Button } from "@/components/ui/button"
import TicketClient from "./ticket-client"

type Props = {
  params: { bookingId: string }
}

async function getBookingData(bookingId: string) {
  try {
    // First try to get booking data from the API
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/bookings/get/${bookingId}`, {
      cache: 'no-store'
    })

    if (response.ok) {
      const bookingData = await response.json()
      return bookingData
    }
  } catch (error) {
    console.error('Error fetching booking data:', error)
  }

  return null
}

export default async function TicketPage({ params }: Props) {
  const bookingData = await getBookingData(params.bookingId)

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

  return <TicketClient bookingData={bookingData} bookingId={params.bookingId} />
}

