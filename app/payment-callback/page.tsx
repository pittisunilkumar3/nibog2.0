"use client"

import { useEffect, useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardFooter, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, CheckCircle, XCircle, AlertTriangle } from "lucide-react"
import { checkPhonePePaymentResult } from "@/services/paymentService"

function PaymentCallbackContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isLoading, setIsLoading] = useState(true)
  const [paymentStatus, setPaymentStatus] = useState<'SUCCESS' | 'FAILED' | 'PENDING' | 'CANCELLED' | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [bookingId, setBookingId] = useState<string | null>(null)
  const [transactionId, setTransactionId] = useState<string | null>(null)
  const [retryCount, setRetryCount] = useState(0)
  const [isRetrying, setIsRetrying] = useState(false)

  useEffect(() => {
    let cancelled = false
    let retryTimer: number | undefined

    const checkPaymentStatus = async (currentRetryCount = 0) => {
      let retryScheduled = false
      try {
        setIsLoading(true)
        const txnId = searchParams.get('transactionId')
        if (!txnId) throw new Error('Missing booking transaction ID')
        setTransactionId(txnId)

        const result = await checkPhonePePaymentResult(txnId)
        if (cancelled) return
        setPaymentStatus(result.status)

        if (result.status === 'SUCCESS') {
          if (!result.bookingId) throw new Error('Backend confirmation did not return a booking ID')
          setBookingId(result.bookingId)
          try {
            localStorage.setItem('lastBookingId', result.bookingId)
            localStorage.removeItem('lastBookingRef')
            localStorage.removeItem('nibog_booking_data')
          } catch { /* Server confirmation is authoritative when storage is unavailable. */ }
          router.replace(`/booking-confirmation?bookingId=${encodeURIComponent(result.bookingId)}`)
          return
        }

        if (result.status === 'PENDING' && currentRetryCount < 6) {
          setRetryCount(currentRetryCount + 1)
          setIsRetrying(true)
          retryScheduled = true
          retryTimer = window.setTimeout(() => checkPaymentStatus(currentRetryCount + 1), 5000)
          return
        }
        if (result.status === 'PENDING') {
          setError('Payment is taking longer than expected. Check the status again or contact support before paying again.')
        }
      } catch (caughtError) {
        if (cancelled) return
        setError(caughtError instanceof Error ? caughtError.message : 'Failed to check payment status')
        setPaymentStatus('FAILED')
      } finally {
        if (!cancelled && !retryScheduled) {
          setIsLoading(false)
          setIsRetrying(false)
        }
      }
    }

    checkPaymentStatus()
    return () => {
      cancelled = true
      clearTimeout(retryTimer)
    }
  }, [searchParams, router])

  function getStatusText() {
    if (isLoading) return 'Processing'
    switch (paymentStatus) {
      case 'SUCCESS': return 'Successful'
      case 'FAILED': return 'Failed'
      case 'PENDING': return 'Pending'
      case 'CANCELLED': return 'Cancelled'
      default: return 'Status'
    }
  }

  function getStatusDescription() {
    if (error) return error
    switch (paymentStatus) {
      case 'SUCCESS': return 'Your payment and booking are confirmed. Redirecting to your confirmation page.'
      case 'FAILED': return 'Your payment was not successful. Please try again.'
      case 'PENDING': return 'PhonePe is still processing your payment.'
      case 'CANCELLED': return 'Your payment was cancelled.'
      default: return 'We are verifying your payment with PhonePe.'
    }
  }

  return (
    <div className="container mx-auto max-w-md px-4 py-10">
      <Card className="rounded-[2rem] border border-orange-100 shadow-lg">
        <CardHeader className="text-center">
          <h1 className="text-3xl font-black tracking-tight">Payment {getStatusText()}</h1>
          <CardDescription>{getStatusDescription()}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-10">
          {isLoading || isRetrying ? (
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="h-16 w-16 text-primary animate-spin" />
              <p className="text-muted-foreground">
                {isRetrying ? `Checking payment status... (Attempt ${retryCount + 1}/6)` : 'Please wait while we verify your payment...'}
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-4">
              {paymentStatus === 'SUCCESS' && <CheckCircle className="h-16 w-16 text-green-500" />}
              {paymentStatus === 'FAILED' && <XCircle className="h-16 w-16 text-red-500" />}
              {paymentStatus === 'PENDING' && <AlertTriangle className="h-16 w-16 text-amber-500" />}
              {paymentStatus === 'CANCELLED' && <XCircle className="h-16 w-16 text-gray-500" />}
              {bookingId && (
                <Link href={`/booking-confirmation?bookingId=${encodeURIComponent(bookingId)}`} className="text-blue-600 underline">
                  View booking #{bookingId}
                </Link>
              )}
              {transactionId && <p className="break-all text-center text-sm text-muted-foreground">Transaction: {transactionId}</p>}
            </div>
          )}
        </CardContent>
        <CardFooter className="flex flex-col justify-center gap-2">
          {paymentStatus === 'SUCCESS' && bookingId && (
            <Button className="h-12 w-full rounded-full" onClick={() => router.push(`/booking-confirmation?bookingId=${bookingId}`)}>
              View Booking Details
            </Button>
          )}
          {(paymentStatus === 'FAILED' || paymentStatus === 'CANCELLED') && (
            <Button className="h-12 w-full rounded-full" variant="outline" onClick={() => router.push('/register-event')}>
              Try Again
            </Button>
          )}
          {paymentStatus === 'PENDING' && !isRetrying && (
            <Button className="h-12 w-full rounded-full" variant="outline" onClick={() => window.location.reload()}>
              Check Status Again
            </Button>
          )}
          <Button asChild variant="ghost" className="h-12 w-full rounded-full"><Link href="/contact">Contact support</Link></Button>
        </CardFooter>
      </Card>
    </div>
  )
}

export default function PaymentCallbackPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center">Loading payment status...</div>}>
      <PaymentCallbackContent />
    </Suspense>
  )
}
