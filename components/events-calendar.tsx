"use client"

import { AlertCircle, Baby, Calendar, CalendarDays, ChevronLeft, ChevronRight, Clock, MapPin, RefreshCw } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { useEffect, useMemo, useState } from "react"
import { DayContentProps } from "react-day-picker"

import { Button } from "@/components/ui/button"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { useEvents } from "@/lib/swr-hooks"
import { formatDateShort } from "@/lib/utils"
import type { EventListItem } from "@/types"
import { cn } from "@/lib/utils"

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
]

function toDateKey(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0")
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

function EventRow({ event }: { event: EventListItem }) {
  const eventDate = new Date(`${event.date}T00:00:00`)
  const isComplete = eventDate < new Date(new Date().setHours(0, 0, 0, 0))

  return (
    <article className="group flex items-stretch gap-4 overflow-hidden rounded-2xl border border-emerald-100 bg-white p-3 shadow-[0_14px_36px_-30px_rgba(25,72,56,0.55)] transition-shadow hover:shadow-[0_18px_45px_-28px_rgba(25,72,56,0.6)] dark:border-white/10 dark:bg-slate-900 sm:p-4">
      <div className="relative hidden h-24 w-32 shrink-0 overflow-hidden rounded-xl bg-emerald-50 sm:block">
        <Image
          src={event.image || "/images/baby-crawling.jpg"}
          alt={event.title}
          fill
          sizes="128px"
          className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
        />
        {isComplete && (
          <span className="absolute right-1.5 top-1.5 rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-black text-slate-700">Completed</span>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="truncate text-base font-black leading-tight text-slate-950 dark:text-white sm:text-lg">{event.title}</h3>
        </div>

        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs font-semibold text-slate-600 dark:text-slate-300 sm:text-sm">
          <span className="inline-flex items-center gap-1.5"><CalendarDays className="h-3.5 w-3.5 text-orange-600" aria-hidden="true" />{formatDateShort(event.date)}</span>
          <span className="inline-flex items-center gap-1.5"><Clock className="h-3.5 w-3.5 text-orange-600" aria-hidden="true" />{event.time || "To be announced"}</span>
          <span className="inline-flex min-w-0 items-center gap-1.5"><MapPin className="h-3.5 w-3.5 shrink-0 text-orange-600" aria-hidden="true" /><span className="truncate">{[event.venue, event.city].filter(Boolean).join(", ")}</span></span>
        </div>

        <div className="mt-3">
          {isComplete ? (
            <Button disabled size="sm" className="h-9 rounded-full px-5 text-xs font-black">Event completed</Button>
          ) : (
            <Button asChild size="sm" className="h-9 rounded-full bg-[#ef5f52] px-5 text-xs font-black text-white hover:bg-[#dc4e43]">
              <Link href={`/events/${event.id}`}>View event details</Link>
            </Button>
          )}
        </div>
      </div>
    </article>
  )
}

function CalendarDayContent(props: DayContentProps) {
  const hasEvents = Boolean(props.activeModifiers?.event)
  return (
    <span className="relative flex h-full w-full items-center justify-center">
      {props.date.getDate()}
      {hasEvents && (
        <span className="absolute bottom-0.5 h-1.5 w-1.5 rounded-full bg-[#ef5f52]" aria-hidden="true" />
      )}
    </span>
  )
}

export default function EventsCalendar() {
  const searchParams = useSearchParams()
  const { events, isLoading, isError, mutate } = useEvents()

  const now = new Date()
  const nowKey = toDateKey(now)
  const [month, setMonth] = useState<Date>(new Date(now.getFullYear(), now.getMonth(), 1))
  const [selected, setSelected] = useState<Date | undefined>(undefined)

  // Apply the same URL filters as the grid view (city / age / exact date)
  const filteredEvents = useMemo(() => {
    const city = searchParams.get("city")
    const minAge = searchParams.get("minAge")
    const maxAge = searchParams.get("maxAge")
    const date = searchParams.get("date")

    return events.filter((event) => {
      // Only upcoming events are shown (today and future)
      if (!event.date || event.date < nowKey) return false
      if (city && event.city.toLowerCase() !== city.toLowerCase()) return false
      if (minAge && event.minAgeMonths < Number.parseInt(minAge)) return false
      if (maxAge && event.maxAgeMonths > Number.parseInt(maxAge)) return false
      if (date && event.date !== date) return false
      return true
    })
  }, [events, searchParams])

  const eventsByDate = useMemo(() => {
    const map = new Map<string, EventListItem[]>()
    for (const event of filteredEvents) {
      if (!event.date) continue
      const list = map.get(event.date) ?? []
      list.push(event)
      map.set(event.date, list)
    }
    return map
  }, [filteredEvents])

  const eventDayModifiers = useMemo(
    () => Array.from(eventsByDate.keys()).map((d) => new Date(`${d}T00:00:00`)),
    [eventsByDate]
  )

  // Auto-jump to the first month with upcoming events when the current month is empty
  useEffect(() => {
    if (isLoading || eventDayModifiers.length === 0) return
    const monthHasEvents = eventDayModifiers.some(
      (d) => d.getFullYear() === month.getFullYear() && d.getMonth() === month.getMonth()
    )
    if (monthHasEvents) return
    const next = eventDayModifiers.filter((d) => toDateKey(d) >= nowKey).sort((a, b) => a.getTime() - b.getTime())[0]
    const target = next ?? eventDayModifiers[eventDayModifiers.length - 1]
    if (target.getFullYear() !== month.getFullYear() || target.getMonth() !== month.getMonth()) {
      setMonth(new Date(target.getFullYear(), target.getMonth(), 1))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading, eventDayModifiers])

  const eventsInMonth = useMemo(() => {
    return filteredEvents
      .filter((event) => {
        if (!event.date) return false
        const d = new Date(`${event.date}T00:00:00`)
        return d.getFullYear() === month.getFullYear() && d.getMonth() === month.getMonth()
      })
      .sort((a, b) => a.date.localeCompare(b.date))
  }, [filteredEvents, month])

  const selectedEvents = useMemo(
    () => (selected ? (eventsByDate.get(toDateKey(selected)) ?? []) : []),
    [selected, eventsByDate]
  )

  const listTitle = selected && selectedEvents.length > 0
    ? `${MONTHS[selected.getMonth()]} ${selected.getDate()}, ${selected.getFullYear()}`
    : `${MONTHS[month.getMonth()]} ${month.getFullYear()}`

  const listedEvents = selected && selectedEvents.length > 0 ? selectedEvents : eventsInMonth

  const stepMonth = (delta: number) => {
    setSelected(undefined)
    setMonth(new Date(month.getFullYear(), month.getMonth() + delta, 1))
  }

  if (isLoading) {
    return (
      <div className="grid gap-5 lg:grid-cols-[minmax(0,420px)_1fr]" role="status" aria-label="Loading calendar">
        <div className="h-[380px] animate-pulse rounded-[1.75rem] bg-white dark:bg-slate-900" />
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-28 animate-pulse rounded-2xl bg-white dark:bg-slate-900" />
          ))}
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="mx-auto max-w-xl rounded-[2rem] border border-orange-100 bg-white p-6 text-center shadow-sm dark:border-white/10 dark:bg-slate-900 sm:p-10">
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-50 text-orange-700 dark:bg-orange-400/10 dark:text-orange-300"><AlertCircle className="h-6 w-6" /></span>
        <h2 className="mt-4 text-2xl font-black">We couldn’t load the event calendar</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">Our event service is temporarily unavailable. Please try again in a moment.</p>
        <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-center">
          <Button onClick={() => mutate()} className="h-12 rounded-full bg-[#ef5f52] px-6 font-black text-white"><RefreshCw className="mr-2 h-4 w-4" />Try again</Button>
          <Button asChild variant="outline" className="h-12 rounded-full px-6 font-bold"><Link href="/contact">Contact NIBOG</Link></Button>
        </div>
      </div>
    )
  }

  if (events.length === 0) {
    return (
      <div className="mx-auto max-w-xl rounded-[2rem] bg-white p-8 text-center shadow-sm dark:bg-slate-900">
        <Baby className="mx-auto h-8 w-8 text-emerald-700 dark:text-emerald-300" />
        <h2 className="mt-4 text-2xl font-black">New dates are coming soon</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">There are no scheduled events to show right now. Check back soon or contact NIBOG for the latest city updates.</p>
        <Button asChild variant="outline" className="mt-5 h-12 rounded-full px-6 font-bold"><Link href="/contact">Contact NIBOG</Link></Button>
      </div>
    )
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,430px)_1fr] lg:gap-8">
      {/* Calendar panel */}
      <div className="rounded-[1.75rem] border border-emerald-100 bg-white p-4 shadow-[0_18px_45px_-32px_rgba(25,72,56,0.5)] dark:border-white/10 dark:bg-slate-900 sm:p-6">
        <div className="mb-3 flex items-center justify-between">
          <Button variant="outline" size="icon" className="h-9 w-9 rounded-full" onClick={() => stepMonth(-1)} aria-label="Previous month"><ChevronLeft className="h-4 w-4" /></Button>
          <p className="text-center text-sm font-black uppercase tracking-wide text-slate-700 dark:text-slate-200">
            {MONTHS[month.getMonth()]} {month.getFullYear()}
            <span className="ml-2 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-black text-emerald-800 dark:bg-emerald-400/10 dark:text-emerald-200">{eventsInMonth.length} event{eventsInMonth.length === 1 ? "" : "s"}</span>
          </p>
          <Button variant="outline" size="icon" className="h-9 w-9 rounded-full" onClick={() => stepMonth(1)} aria-label="Next month"><ChevronRight className="h-4 w-4" /></Button>
        </div>

        <CalendarComponent
          month={month}
          onMonthChange={setMonth}
          selected={selected}
          onSelect={(date) => {
            if (!date) { setSelected(undefined); return }
            // Toggle off when clicking the already-selected day
            setSelected((prev) => (prev && toDateKey(prev) === toDateKey(date) ? undefined : date))
          }}
          fromYear={now.getFullYear() - 1}
          toYear={now.getFullYear() + 3}
          modifiers={{ event: eventDayModifiers, booked: [] }}
          modifiersClassNames={{
            event: "relative font-black text-emerald-900 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-400/10 dark:text-emerald-100",
            selected: "!bg-[#ef5f52] !text-white",
            today: "font-black underline decoration-orange-400 decoration-2 underline-offset-4",
          }}
          components={{ DayContent: CalendarDayContent }}
          className="mx-auto w-full rounded-xl [--rdp-cell-size:2.6rem] sm:[--rdp-cell-size:2.9rem]"
        />

        <div className="mt-4 flex items-center justify-center gap-5 border-t border-slate-100 pt-4 text-xs font-bold text-slate-500 dark:border-white/10 dark:text-slate-400">
          <span className="inline-flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-[#ef5f52]" aria-hidden="true" />Event day</span>
          <span className="inline-flex items-center gap-1.5"><span className="h-3 w-3 rounded bg-[#ef5f52]" aria-hidden="true" />Selected</span>
        </div>
      </div>

      {/* Events list panel */}
      <div>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-xl font-black tracking-tight text-slate-950 dark:text-white sm:text-2xl">
            {selected && selectedEvents.length > 0 ? "Events on " : "Events in "}
            <span className="text-[#ef5f52]">{listTitle}</span>
          </h2>
          {selected && (
            <Button variant="outline" size="sm" className="h-9 rounded-full px-4 text-xs font-black" onClick={() => setSelected(undefined)}>Show whole month</Button>
          )}
        </div>

        {listedEvents.length === 0 ? (
          <div className="rounded-[1.75rem] border border-dashed border-orange-200 bg-white p-8 text-center dark:border-white/15 dark:bg-slate-900 sm:p-12">
            <CalendarDays className="mx-auto h-8 w-8 text-orange-600" />
            <h3 className="mt-4 text-lg font-black sm:text-xl">
              {selected ? "No events on this date" : "No events this month"}
            </h3>
            <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-600 dark:text-slate-300">
              {selected ? "Pick a highlighted day on the calendar or browse the whole month." : "Try another month using the arrows — event days are marked with a dot."}
            </p>
          </div>
        ) : (
          <div className={cn("space-y-4", listedEvents.length > 3 && "max-h-[640px] overflow-y-auto pr-1 sm:max-h-[720px]")}>
            {listedEvents.map((event) => <EventRow key={`${event.id}-${event.date}`} event={event} />)}
          </div>
        )}
      </div>
    </div>
  )
}
