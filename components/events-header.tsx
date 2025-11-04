"use client"

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CalendarRange, Grid3X3 } from "lucide-react"
import { useEvents } from "@/lib/swr-hooks"

interface EventsHeaderProps {
  searchParams?: URLSearchParams
}

export default function EventsHeader({ searchParams }: EventsHeaderProps) {
  // Use SWR hook to get events data and loading state
  const { events, isLoading, isError } = useEvents()
  
  // Filter events based on URL params if provided
  const filteredEvents = searchParams ? events.filter((event) => {
    const city = searchParams.get('city')
    const minAge = searchParams.get('minAge')
    const maxAge = searchParams.get('maxAge')
    const date = searchParams.get('date')

    if (city && event.city.toLowerCase() !== city.toLowerCase()) return false
    if (minAge && event.minAgeMonths < parseInt(minAge)) return false
    if (maxAge && event.maxAgeMonths > parseInt(maxAge)) return false
    if (date && event.date !== date) return false
    return true
  }) : events

  // Get the count to display
  const eventCount = isLoading ? "..." : filteredEvents.length
  const eventText = filteredEvents.length === 1 ? "amazing Events" : "amazing Events"

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-0 bg-gradient-to-r from-lavender-100 to-mint-100 dark:from-lavender-900/20 dark:to-mint-900/20 rounded-2xl p-4 sm:p-6 shadow-lg">
      <div className="text-base sm:text-lg font-semibold text-neutral-charcoal dark:text-white text-center sm:text-left">
        {isError ? (
          <span className="text-red-600">⚠️ Error loading events</span>
        ) : (
          <>
            🎯 Showing <span className="font-bold text-sunshine-600">{eventCount}</span> {eventText}
          </>
        )}
      </div>
      <TabsList className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border-2 border-white/50 w-full sm:w-auto">
        <TabsTrigger
          value="grid"
          className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-sunshine-400 data-[state=active]:to-coral-400 data-[state=active]:text-white font-semibold rounded-lg px-3 sm:px-4 py-2 text-sm sm:text-base flex-1 sm:flex-none touch-manipulation"
        >
          <Grid3X3 className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
          <span className="hidden xs:inline">🎮 Grid View</span>
          <span className="xs:hidden">🎮 Grid</span>
        </TabsTrigger>
        <TabsTrigger
          value="calendar"
          className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-coral-400 data-[state=active]:to-mint-400 data-[state=active]:text-white font-semibold rounded-lg px-3 sm:px-4 py-2 text-sm sm:text-base flex-1 sm:flex-none touch-manipulation"
        >
          <CalendarRange className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
          <span className="hidden xs:inline">📅 Calendar View</span>
          <span className="xs:hidden">📅 Calendar</span>
        </TabsTrigger>
      </TabsList>
    </div>
  )
}
