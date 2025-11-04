"use client"

import { useSearchParams } from "next/navigation"
import EventsHeader from "@/components/events-header"

export default function EventsHeaderWrapper() {
  const searchParams = useSearchParams()
  
  return <EventsHeader searchParams={searchParams} />
}
