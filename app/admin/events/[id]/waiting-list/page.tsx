"use client"

import Link from "next/link"
import { useParams } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import WaitingListManager from "@/components/admin/waiting-list-manager"

// Mock event data - in a real app, this would come from an API
const getEventData = (id: string) => ({
  id,
  title: "Baby Sensory Play",
  date: "October 26, 2025",
  venue: "Kids Paradise",
  city: "Hyderabad",
})

export default function EventWaitingListPage() {
  const params = useParams()
  const eventId = params.id as string
  const event = getEventData(eventId)
  
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" asChild>
          <Link href={`/admin/events/${eventId}`}>
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back</span>
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Waiting List</h1>
          <p className="text-muted-foreground">
            {event.title} • {event.date} • {event.venue}, {event.city}
          </p>
        </div>
      </div>
      
      <WaitingListManager eventId={eventId} eventTitle={event.title} />
    </div>
  )
}
