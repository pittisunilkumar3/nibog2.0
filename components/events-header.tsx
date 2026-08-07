"use client"

import { CalendarRange, Grid3X3 } from "lucide-react"
import { TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function EventsHeader() {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-emerald-100 bg-white p-3 shadow-sm dark:border-white/10 dark:bg-slate-900 sm:flex-row sm:items-center sm:justify-between sm:p-4">
      <p className="px-2 text-sm font-bold text-slate-600 dark:text-slate-300">Choose how you’d like to browse</p>
      <TabsList className="grid h-12 w-full grid-cols-2 rounded-xl bg-slate-100 p-1 sm:w-auto dark:bg-slate-800">
        <TabsTrigger value="grid" className="min-h-10 rounded-lg px-4 font-bold data-[state=active]:bg-white data-[state=active]:text-emerald-800 dark:data-[state=active]:bg-slate-950 dark:data-[state=active]:text-emerald-200"><Grid3X3 className="mr-2 h-4 w-4" />Grid</TabsTrigger>
        <TabsTrigger value="calendar" className="min-h-10 rounded-lg px-4 font-bold data-[state=active]:bg-white data-[state=active]:text-emerald-800 dark:data-[state=active]:bg-slate-950 dark:data-[state=active]:text-emerald-200"><CalendarRange className="mr-2 h-4 w-4" />Calendar</TabsTrigger>
      </TabsList>
    </div>
  )
}
