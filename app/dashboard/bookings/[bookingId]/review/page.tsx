import Link from "next/link"
import { Button } from "@/components/ui/button"
import ReviewClient from "./review-client"

// Mock data - in a real app, this would come from an API
const bookings = [
  {
    id: "B002",
    eventName: "Baby Swimming Intro",
    venue: {
      name: "Aqua Tots Center",
      city: "Mumbai",
    },
    date: "2025-03-22",
    time: "10:30 AM - 11:30 AM",
    child: {
      name: "Aryan",
    },
    status: "completed",
    image: "/placeholder.svg?height=200&width=300",
    hasReviewed: false,
  },
]

type Props = {
  params: { bookingId: string }
}

export default function ReviewPage({ params }: Props) {
  const booking = bookings.find((b) => b.id === params.bookingId)

  if (!booking) {
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

  return <ReviewClient booking={booking} bookingId={params.bookingId} />
}

