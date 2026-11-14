"use client"

import { AlertCircle, ArrowRight, CheckCircle, Download, Loader2 } from "lucide-react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Suspense, useEffect, useState } from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

type ConfirmationState = 'loading' | 'confirmed' | 'pending' | 'not-found' | 'error'

function BookingConfirmationContent() {
  const bookingRef = useSearchParams().get("ref")?.trim()
  const [bookingId, setBookingId] = useState<string | null>(null)
  const [confirmationState, setConfirmationState] = useState<ConfirmationState>(bookingRef ? 'loading' : 'not-found')
  const resolving = confirmationState === 'loading'

  useEffect(() => {
    let cancelled = false
    if (!bookingRef) {
      setBookingId(null)
      setConfirmationState('not-found')
      return () => { cancelled = true }
    }

    setBookingId(null)
    setConfirmationState('loading')
    ;(async () => {
      try {
        const res = await fetch("/api/bookings/get-by-ref", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ booking_ref_id: bookingRef }),
        })
        if (cancelled) return
        if (res.status === 404) {
          setConfirmationState('not-found')
          return
        }
        if (!res.ok) {
          setConfirmationState('error')
          return
        }

        const json = await res.json()
        const booking = json?.data
        const id = booking?.booking_id ?? booking?.id
        if (booking?.booking_ref !== bookingRef || !Number.isInteger(Number(id)) || Number(id) <= 0) {
          if (!cancelled) setConfirmationState('error')
          return
        }
        const confirmed = String(booking.status).toLowerCase() === 'confirmed'
          && String(booking.payment_status).toLowerCase() === 'paid'
        if (!cancelled) {
          if (confirmed) setBookingId(String(id))
          setConfirmationState(confirmed ? 'confirmed' : 'pending')
        }
      } catch {
        if (!cancelled) setConfirmationState('error')
      }
    })()
    return () => { cancelled = true }
  }, [bookingRef])

  useEffect(() => {
    if (!bookingRef || confirmationState !== 'confirmed') return
    sessionStorage.removeItem("registrationData")
    sessionStorage.removeItem("selectedAddOns")
    sessionStorage.removeItem("eligibleGames")
    sessionStorage.removeItem("nibog_restored_city")
    sessionStorage.removeItem("nibog_restored_eventType")
    sessionStorage.removeItem("nibog_restored_childAgeMonths")
    localStorage.removeItem("nibog_booking_data")
  }, [bookingRef, confirmationState])

  if (confirmationState !== 'confirmed') {
    const content = {
      loading: {
        title: 'Verifying your registration',
        description: 'We are checking the booking and payment status with the server.',
      },
      pending: {
        title: 'Payment is not confirmed yet',
        description: 'This booking is still pending or unpaid. Check the same payment status again or contact support before making another payment.',
      },
      'not-found': {
        title: 'We couldn’t find this confirmation',
        description: 'A valid booking reference was not found. Your bookings page is the safest place to confirm whether registration completed.',
      },
      error: {
        title: 'We couldn’t verify this confirmation',
        description: 'The booking lookup failed or returned unexpected data. No payment confirmation is being assumed.',
      },
      confirmed: { title: '', description: '' },
    }[confirmationState]

    return (
      <div className="bg-[#fffaf3] px-4 py-12 dark:bg-slate-950 sm:py-16">
        <Card className="mx-auto max-w-xl rounded-[2rem] border-orange-100 shadow-sm dark:border-white/10">
          <CardContent className="p-6 text-center sm:p-10">
            <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-50 text-orange-700 dark:bg-orange-400/10 dark:text-orange-300">
              {resolving ? <Loader2 className="h-6 w-6 animate-spin" /> : <AlertCircle className="h-6 w-6" />}
            </span>
            <h1 className="mt-5 text-3xl font-black tracking-tight">{content.title}</h1>
            <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">{content.description}</p>
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
