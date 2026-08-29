"use client"

import { AlertCircle, ArrowRight, CheckCircle, Download, Loader2 } from "lucide-react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Suspense, useEffect, useState } from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

function BookingConfirmationContent() {
  const bookingRef = useSearchParams().get("ref")?.trim()

  // Resolve the numeric booking id from the reference so we can deep-link
  // straight to the ticket page right after payment.
  const [bookingId, setBookingId] = useState<string | null>(null)
  const [resolving, setResolving] = useState(true)

  useEffect(() => {
    if (!bookingRef) { setResolving(false); return }
    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch("/api/bookings/get-by-ref", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ booking_ref_id: bookingRef }),
        })
        if (res.ok) {
          const json = await res.json()
          const id = json?.data?.booking_id ?? json?.data?.id ?? json?.booking_id ?? json?.id
          if (!cancelled && id) setBookingId(String(id))
        }
      } catch {
        // Ticket stays reachable from the bookings page if this fails
      } finally {
        if (!cancelled) setResolving(false)
      }
    })()
    return () => { cancelled = true }
  }, [bookingRef])

  useEffect(() => {
    if (!bookingRef) return
    sessionStorage.removeItem("registrationData")
    sessionStorage.removeItem("selectedAddOns")
    sessionStorage.removeItem("eligibleGames")
    sessionStorage.removeItem("nibog_restored_city")
    sessionStorage.removeItem("nibog_restored_eventType")
    sessionStorage.removeItem("nibog_restored_childAgeMonths")
    localStorage.removeItem("nibog_booking_data")
  }, [bookingRef])

  if (!bookingRef) {
    return (
      <div className="bg-[#fffaf3] px-4 py-12 dark:bg-slate-950 sm:py-16">
        <Card className="mx-auto max-w-xl rounded-[2rem] border-orange-100 shadow-sm dark:border-white/10">
          <CardContent className="p-6 text-center sm:p-10">
            <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-50 text-orange-700 dark:bg-orange-400/10 dark:text-orange-300"><AlertCircle className="h-6 w-6" /></span>
            <h1 className="mt-5 text-3xl font-black tracking-tight">We couldn’t find this confirmation</h1>
            <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">A valid booking reference was not included. Your bookings page is the safest place to confirm whether registration completed.</p>
            <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
              <Button asChild className="h-12 rounded-full px-6 font-black"><Link href="/dashboard/bookings">View my bookings</Link></Button>
              <Button asChild variant="outline" className="h-12 rounded-full px-6 font-bold"><Link href="/contact">Contact NIBOG</Link></Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="bg-[#fffaf3] px-4 py-12 dark:bg-slate-950 sm:py-16">
      <Card className="mx-auto max-w-2xl overflow-hidden rounded-[2rem] border-emerald-100 shadow-[0_24px_60px_-38px_rgba(4,120,87,.6)] dark:border-white/10">
        <div className="h-2 bg-gradient-to-r from-emerald-500 via-amber-400 to-orange-400" />
        <CardContent className="p-6 text-center sm:p-10">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-300"><CheckCircle className="h-8 w-8" /></span>
          <h1 className="mt-5 text-3xl font-black tracking-tight sm:text-4xl">Registration confirmed</h1>
          <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-slate-600 dark:text-slate-300">Your child’s NIBOG registration has been recorded. Keep the booking ID below for support and event-day questions.</p>
          <div className="mt-6 rounded-2xl border border-emerald-100 bg-emerald-50 p-5 dark:border-emerald-400/20 dark:bg-emerald-400/10">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-emerald-700 dark:text-emerald-300">Booking ID</p>
            <p className="mt-2 break-all font-mono text-xl font-black text-slate-950 dark:text-white sm:text-2xl">{bookingId ? `#${bookingId}` : bookingRef}</p>
          </div>
          <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
            {bookingId ? (
              <Button asChild className="h-12 rounded-full bg-gradient-to-r from-purple-600 to-pink-500 px-6 font-black text-white hover:from-purple-700 hover:to-pink-600">
                <Link href={`/dashboard/bookings/${bookingId}/ticket`}>
                  <Download className="mr-2 h-4 w-4" />
                  Download Ticket
                </Link>
              </Button>
            ) : (
              <Button disabled={resolving} className="h-12 rounded-full px-6 font-black">
                {resolving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading ticket…</> : "Ticket unavailable"}
              </Button>
            )}
            <Button asChild className="h-12 rounded-full bg-[#ef5f52] px-6 font-black text-white hover:bg-[#dc4e43]"><Link href="/dashboard/bookings">View my bookings <ArrowRight className="ml-2 h-4 w-4" /></Link></Button>
            <Button asChild variant="outline" className="h-12 rounded-full px-6 font-bold"><Link href="/">Return home</Link></Button>
          </div>
          <p className="mt-6 text-sm text-slate-500">Need help? <a href="mailto:Nibog100@gmail.com" className="font-bold text-emerald-700 underline">Email NIBOG support</a>.</p>
        </CardContent>
      </Card>
    </div>
  )
}

export default function BookingConfirmationClientPage() {
  return <Suspense fallback={<div className="flex min-h-[50vh] items-center justify-center" role="status">Loading confirmation…</div>}><BookingConfirmationContent /></Suspense>
}
