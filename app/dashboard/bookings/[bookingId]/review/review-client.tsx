"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Star } from "lucide-react"
import { cn } from "@/lib/utils"

type BookingType = {
  id: string
  eventName: string
  venue: {
    name: string
    city: string
  }
  date: string
  time: string
  child: {
    name: string
  }
  status: string
  image: string
  hasReviewed: boolean
}

type ReviewClientProps = {
  booking: BookingType
  bookingId: string
}

export default function ReviewClient({ booking, bookingId }: ReviewClientProps) {
  const router = useRouter()

  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [review, setReview] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  // Handle rating change
  const handleRatingChange = (value: number) => {
    setRating(value)
  }

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (rating === 0) {
      alert("Please select a rating.")
      return
    }

    setIsSubmitting(true)

    // Simulate API call
    setTimeout(() => {


      setIsSubmitting(false)
      setIsSubmitted(true)
    }, 1500)
  }

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

  if (booking.status !== "completed") {
    return (
      <div className="container flex h-[400px] items-center justify-center py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Cannot Review Yet</h2>
          <p className="text-muted-foreground">You can only review events that have been completed.</p>
          <Button className="mt-4" asChild>
            <Link href={`/dashboard/bookings/${bookingId}`}>Back to Booking</Link>
          </Button>
        </div>
      </div>
    )
  }

  if (booking.hasReviewed) {
    return (
      <div className="container flex h-[400px] items-center justify-center py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Already Reviewed</h2>
          <p className="text-muted-foreground">You have already submitted a review for this event.</p>
          <Button className="mt-4" asChild>
            <Link href={`/dashboard/bookings/${bookingId}`}>Back to Booking</Link>
          </Button>
        </div>
      </div>
    )
  }

  if (isSubmitted) {
    return (
      <div className="container py-8">
        <div className="mx-auto max-w-md">
          <Card>
            <CardHeader>
              <CardTitle className="text-center">Thank You for Your Review!</CardTitle>
              <CardDescription className="text-center">
                Your feedback helps us improve our events and helps other parents make informed decisions.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center">
              <div className="flex">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={cn(
                      "h-8 w-8",
                      i < rating ? "fill-yellow-500 text-yellow-500" : "text-muted-foreground"
                    )}
                  />
                ))}
              </div>
            </CardContent>
            <CardFooter className="flex justify-center">
              <Button asChild>
                <Link href="/dashboard/bookings">Back to Bookings</Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-8">
      <div className="mb-6 flex items-center gap-2">
        <Button variant="outline" size="icon" asChild>
          <Link href={`/dashboard/bookings/${bookingId}`}>
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back</span>
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Write a Review</h1>
          <p className="text-muted-foreground">
            Share your experience at {booking.eventName}
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-2xl">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-4">
              <div className="relative h-16 w-16 overflow-hidden rounded-md">
                <Image
                  src={booking.image}
                  alt={booking.eventName}
                  fill
                  className="object-cover"
                />
              </div>
              <div>
                <CardTitle>{booking.eventName}</CardTitle>
                <CardDescription>
                  {booking.venue.name}, {booking.venue.city} | {booking.date}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit}>
              <div className="space-y-6">
                <div className="space-y-2">
                  <h3 className="font-medium">How would you rate your experience?</h3>
                  <div className="flex justify-center">
                    <div className="flex">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <button
                          key={i}
                          type="button"
                          className="p-1"
                          onClick={() => handleRatingChange(i + 1)}
                          onMouseEnter={() => setHoverRating(i + 1)}
                          onMouseLeave={() => setHoverRating(0)}
                        >
                          <Star
                            className={cn(
                              "h-8 w-8 transition-colors",
                              (hoverRating ? i < hoverRating : i < rating)
                                ? "fill-yellow-500 text-yellow-500"
                                : "text-muted-foreground hover:text-yellow-500"
                            )}
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                  {rating > 0 && (
                    <p className="text-center text-sm text-muted-foreground">
                      {rating === 1 && "Poor"}
                      {rating === 2 && "Fair"}
                      {rating === 3 && "Good"}
                      {rating === 4 && "Very Good"}
                      {rating === 5 && "Excellent"}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <h3 className="font-medium">Share your thoughts (optional)</h3>
                  <Textarea
                    placeholder="Tell us about your experience..."
                    rows={5}
                    value={review}
                    onChange={(e) => setReview(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Your review will help other parents decide if this event is right for their child.
                  </p>
                </div>

                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" asChild>
                    <Link href={`/dashboard/bookings/${bookingId}`}>Cancel</Link>
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Submitting..." : "Submit Review"}
                  </Button>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

