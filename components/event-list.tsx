"use client"

import { AlertCircle, Baby, Calendar, Clock, MapPin, RefreshCw } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { useEffect, useMemo, useState } from "react"

import { Button } from "@/components/ui/button"
import { useEvents } from "@/lib/swr-hooks"
import { formatDateShort } from "@/lib/utils"
import type { EventListItem } from "@/types"

const ITEMS_PER_PAGE = 8

function EventCard({ event }: { event: EventListItem }) {
  const eventDate = new Date(`${event.date}T00:00:00`)
  const isComplete = eventDate < new Date(new Date().setHours(0, 0, 0, 0))

  return (
    <article className="group overflow-hidden rounded-[1.75rem] border border-emerald-100 bg-white shadow-[0_18px_45px_-32px_rgba(25,72,56,0.5)] dark:border-white/10 dark:bg-slate-900">
      <div className="relative aspect-[4/3] overflow-hidden bg-emerald-50">
        <Image
          src={event.image || "/images/baby-crawling.jpg"}
          alt={event.title}
          fill
          sizes="(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 33vw"
          className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent" />
        <span className="absolute bottom-4 left-4 rounded-full border border-white/20 bg-slate-950/60 px-3 py-1.5 text-xs font-bold text-white backdrop-blur-sm">
          {event.minAgeMonths}–{event.maxAgeMonths} months
        </span>
        {isComplete && (
          <span className="absolute right-4 top-4 rounded-full bg-white/90 px-3 py-1.5 text-xs font-black text-slate-700">Completed</span>
        )}
      </div>

      <div className="p-5 sm:p-6">
        <h2 className="text-xl font-black leading-tight text-slate-950 dark:text-white">{event.title}</h2>
        {event.description && <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{event.description}</p>}

        <dl className="mt-5 space-y-3 border-t border-slate-100 pt-4 text-sm dark:border-white/10">
          <EventFact icon={Calendar} label="Date" value={formatDateShort(event.date)} />
          <EventFact icon={Clock} label="Time" value={event.time || "To be announced"} />
          <EventFact icon={MapPin} label="Venue" value={[event.venue, event.city].filter(Boolean).join(", ")} />
          <EventFact icon={Baby} label="Age" value={`${event.minAgeMonths}–${event.maxAgeMonths} months`} />
        </dl>

        {isComplete ? (
          <Button disabled className="mt-5 h-12 w-full rounded-full">Event completed</Button>
        ) : (
          <Button asChild className="mt-5 h-12 w-full rounded-full bg-[#ef5f52] font-black text-white hover:bg-[#dc4e43]">
            <Link href={`/events/${event.id}`}>View event details</Link>
          </Button>
        )}
      </div>
    </article>
  )
}

function EventFact({ icon: Icon, label, value }: { icon: typeof Calendar; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-300">
        <Icon className="h-4 w-4" aria-hidden="true" />
      </span>
      <div className="min-w-0">
        <dt className="text-xs font-black uppercase tracking-wide text-slate-400">{label}</dt>
        <dd className="break-words font-semibold text-slate-700 dark:text-slate-200">{value}</dd>
      </div>
    </div>
  )
}

export default function EventList() {
  const searchParams = useSearchParams()
  const [page, setPage] = useState(1)
  const { events, isLoading, isError, mutate } = useEvents()

  const filteredEvents = useMemo(() => {
    const city = searchParams.get("city")
    const minAge = searchParams.get("minAge")
    const maxAge = searchParams.get("maxAge")
    const date = searchParams.get("date")

    return events
      .filter((event) => {
        if (city && event.city.toLowerCase() !== city.toLowerCase()) return false
        if (minAge && event.minAgeMonths < Number.parseInt(minAge)) return false
        if (maxAge && event.maxAgeMonths > Number.parseInt(maxAge)) return false
        if (date && event.date !== date) return false
        return true
      })
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  }, [events, searchParams])

  useEffect(() => setPage(1), [searchParams])

  if (isLoading) {
    return (
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3" role="status" aria-label="Loading events">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="overflow-hidden rounded-[1.75rem] bg-white dark:bg-slate-900">
            <div className="aspect-[4/3] animate-pulse bg-emerald-100 dark:bg-slate-800" />
            <div className="space-y-3 p-5"><div className="h-6 w-2/3 animate-pulse rounded bg-slate-100 dark:bg-slate-800" /><div className="h-4 w-full animate-pulse rounded bg-slate-100 dark:bg-slate-800" /></div>
          </div>
        ))}
      </div>
    )
  }

  if (isError) {
    return (
      <div className="mx-auto max-w-xl rounded-[2rem] border border-orange-100 bg-white p-6 text-center shadow-sm dark:border-white/10 dark:bg-slate-900 sm:p-10">
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-50 text-orange-700 dark:bg-orange-400/10 dark:text-orange-300"><AlertCircle className="h-6 w-6" /></span>
        <h2 className="mt-4 text-2xl font-black">We couldn’t load the event calendar</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">Your connection may be fine. Our event service is temporarily unavailable, so please try again in a moment.</p>
        <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-center">
          <Button onClick={() => mutate()} className="h-12 rounded-full bg-[#ef5f52] px-6 font-black text-white"><RefreshCw className="mr-2 h-4 w-4" />Try again</Button>
          <Button asChild variant="outline" className="h-12 rounded-full px-6 font-bold"><Link href="/contact">Contact NIBOG</Link></Button>
        </div>
      </div>
    )
  }

  if (events.length === 0) {
    return <EmptyEvents title="New dates are coming soon" copy="There are no scheduled events to show right now. Check back soon or contact NIBOG for the latest city updates." />
  }

  if (filteredEvents.length === 0) {
    return <EmptyEvents title="No events match those filters" copy="Clear the filters to see every currently available NIBOG event." clearFilters />
  }

  const visibleEvents = filteredEvents.slice(0, page * ITEMS_PER_PAGE)
  return (
    <div>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {visibleEvents.map((event) => <EventCard key={event.id} event={event} />)}
      </div>
      {visibleEvents.length < filteredEvents.length && (
        <div className="mt-8 flex justify-center"><Button onClick={() => setPage((current) => current + 1)} variant="outline" className="h-12 rounded-full px-7 font-black">Load more events</Button></div>
      )}
    </div>
  )
}

function EmptyEvents({ title, copy, clearFilters = false }: { title: string; copy: string; clearFilters?: boolean }) {
  return (
    <div className="mx-auto max-w-xl rounded-[2rem] bg-white p-8 text-center shadow-sm dark:bg-slate-900">
      <Baby className="mx-auto h-8 w-8 text-emerald-700 dark:text-emerald-300" />
      <h2 className="mt-4 text-2xl font-black">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{copy}</p>
      <Button asChild variant="outline" className="mt-5 h-12 rounded-full px-6 font-bold"><Link href={clearFilters ? "/events" : "/contact"}>{clearFilters ? "Clear filters" : "Contact NIBOG"}</Link></Button>
    </div>
  )
}
