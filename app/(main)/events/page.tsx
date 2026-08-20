import { Suspense } from "react"
import type { Metadata } from "next"
import { CalendarDays, ShieldCheck, Sparkles } from "lucide-react"

import EventsCalendar from "@/components/events-calendar"
import EventList from "@/components/event-list"
import EventsHeaderWrapper from "@/components/events-header-wrapper"
import EventsLoading from "./loading"
import { Tabs, TabsContent } from "@/components/ui/tabs"

export const metadata: Metadata = {
  title: "Upcoming Baby Games & Events | NIBOG",
  description: "Browse upcoming NIBOG baby games by date, city and age group.",
}

export default function EventsPage() {
  return (
    <div className="bg-[#fffaf3] text-slate-950 dark:bg-slate-950 dark:text-white">
      <section className="border-b border-orange-100 bg-[radial-gradient(circle_at_15%_20%,rgba(251,191,36,.22),transparent_32%),radial-gradient(circle_at_90%_15%,rgba(244,114,182,.14),transparent_30%),linear-gradient(180deg,#fffaf3,#ffffff)] px-4 py-12 text-center dark:border-white/10 dark:bg-none sm:py-16">
        <div className="mx-auto max-w-3xl">
          <span className="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-white/80 px-4 py-2 text-xs font-black uppercase tracking-[0.16em] text-orange-800 shadow-sm dark:border-white/10 dark:bg-white/5 dark:text-orange-200"><Sparkles className="h-4 w-4" />Plan their big little day</span>
          <h1 className="mt-5 text-4xl font-black leading-[1.02] tracking-[-0.04em] sm:text-5xl lg:text-6xl">Find the right NIBOG event for your family</h1>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg dark:text-slate-300">Browse upcoming dates, venues and age groups. Event details stay together so you can choose with confidence.</p>
          <div className="mt-6 flex flex-wrap justify-center gap-3 text-sm font-bold text-slate-700 dark:text-slate-200">
            <span className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 shadow-sm dark:bg-white/5"><CalendarDays className="h-4 w-4 text-orange-600" />Clear dates & venues</span>
            <span className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 shadow-sm dark:bg-white/5"><ShieldCheck className="h-4 w-4 text-emerald-700" />Age-matched games</span>
          </div>
        </div>
      </section>

      <section className="container px-4 py-10 sm:px-6 sm:py-14" aria-label="Event calendar">
        <Tabs defaultValue="grid" className="w-full">
          <Suspense fallback={<EventsLoading />}><EventsHeaderWrapper /></Suspense>
          <TabsContent value="grid" className="mt-6"><Suspense fallback={<EventsLoading />}><EventList /></Suspense></TabsContent>
          <TabsContent value="calendar" className="mt-6"><Suspense fallback={<EventsLoading />}><EventsCalendar /></Suspense></TabsContent>
        </Tabs>
      </section>
    </div>
  )
}
