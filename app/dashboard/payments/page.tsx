"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CreditCard, Search, Download, Calendar, CheckCircle, XCircle, Clock, Loader2, AlertTriangle } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { useUserProfileWithBookings } from "@/lib/swr-hooks"

// Force dynamic rendering for this page
export const dynamic = 'force-dynamic'

// Payment with booking reference
interface PaymentWithBooking {
  payment_id: number
  booking_id: number
  amount: number
  payment_status: string
  payment_method: string
  transaction_id: string
  payment_date: string
  booking_ref: string
  event_name: string
}

export default function PaymentsPage() {
  const { user, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const { userProfile, isLoading: profileLoading, isError, mutate } = useUserProfileWithBookings(user?.user_id || null)
  const [activeTab, setActiveTab] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")

  // Extract all payments from bookings
  const allPayments = useMemo(() => {
    if (!userProfile?.bookings) return []

    const payments: PaymentWithBooking[] = []
    userProfile.bookings.forEach((booking) => {
      if (booking.payments && booking.payments.length > 0) {
        booking.payments.forEach((payment) => {
          payments.push({
            payment_id: payment.payment_id,
            booking_id: booking.booking_id,
            amount: payment.amount,
            payment_status: payment.payment_status,
            payment_method: payment.payment_method,
            transaction_id: payment.transaction_id,
            payment_date: payment.payment_created_at,
            booking_ref: booking.booking_ref,
            event_name: booking.event?.event_name || 'Unknown Event',
          })
        })
      }
    })

    // Sort by payment date (newest first)
    return payments.sort((a, b) =>
      new Date(b.payment_date).getTime() - new Date(a.payment_date).getTime()
    )
  }, [userProfile])

  // Filter payments based on status and search query
  const filteredPayments = allPayments.filter((payment) => {
    // Filter by tab
    const status = payment.payment_status?.toLowerCase() || ''
    if (activeTab === "paid" && status !== "paid" && status !== "successful") return false
    if (activeTab === "pending" && status !== "pending") return false
    if (activeTab === "refunded" && status !== "refunded") return false

    // Filter by search query
    if (!searchQuery) return true

    const query = searchQuery.toLowerCase()
    return (
      payment.booking_ref.toLowerCase().includes(query) ||
      payment.event_name.toLowerCase().includes(query) ||
      payment.transaction_id.toLowerCase().includes(query)
    )
  })

  // Calculate totals
  const totalPaid = allPayments
    .filter((p) => {
      const status = p.payment_status?.toLowerCase() || ''
      return status === "paid" || status === "successful"
    })
    .reduce((sum, p) => sum + p.amount, 0)
  const totalPending = allPayments
    .filter((p) => p.payment_status?.toLowerCase() === "pending")
    .reduce((sum, p) => sum + p.amount, 0)
  const totalRefunded = allPayments
    .filter((p) => p.payment_status?.toLowerCase() === "refunded")
    .reduce((sum, p) => sum + p.amount, 0)

  // Handle download receipt
  const handleDownloadReceipt = (paymentId: number) => {
    // In a real app, this would download the receipt

  }

  // Get status badge
  const getStatusBadge = (status: string) => {
    const lowerStatus = status?.toLowerCase() || ''

    if (lowerStatus === "paid" || lowerStatus === "successful") {
      return (
        <Badge className="bg-green-500 hover:bg-green-600">
          <CheckCircle className="mr-1 h-3 w-3" />
          Paid
        </Badge>
      )
    }

    if (lowerStatus === "pending") {
      return (
        <Badge variant="outline" className="text-amber-600 border-amber-600">
          <Clock className="mr-1 h-3 w-3" />
          Pending
        </Badge>
      )
    }

    if (lowerStatus === "refunded") {
      return (
        <Badge variant="outline" className="text-blue-600 border-blue-600">
          <CheckCircle className="mr-1 h-3 w-3" />
          Refunded
        </Badge>
      )
    }

    if (lowerStatus === "failed") {
      return (
        <Badge className="bg-red-500 hover:bg-red-600">
          <XCircle className="mr-1 h-3 w-3" />
          Failed
        </Badge>
      )
    }

    return <Badge variant="outline">{status}</Badge>
  }

  // Show loading state while checking authentication or loading profile
  if (authLoading || profileLoading) {
    return (
      <div className="container py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight">Payment History</h1>
          <p className="text-muted-foreground">View and manage your payment transactions</p>
        </div>
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="flex items-center gap-2">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span>Loading payment history...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Redirect to login if not authenticated (after loading is complete)
  if (!user) {
    router.push('/login')
    return null
  }

  // Show error state
  if (isError || !userProfile) {
    return (
      <div className="container py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight">Payment History</h1>
          <p className="text-muted-foreground">View and manage your payment transactions</p>
        </div>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <AlertTriangle className="h-12 w-12 text-amber-500 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Unable to Load Payment History</h3>
            <p className="text-sm text-muted-foreground mb-4">
              We couldn't load your payment history. Please try again later.
            </p>
            <Button onClick={() => mutate()}>Retry</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Payment History</h1>
        <p className="text-muted-foreground">View and manage your payment transactions</p>
      </div>

      {/* Payment Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3 mb-6">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total Paid</CardDescription>
            <CardTitle className="text-2xl text-green-600">₹{totalPaid}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Pending Payments</CardDescription>
            <CardTitle className="text-2xl text-amber-600">₹{totalPending}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total Refunded</CardDescription>
            <CardTitle className="text-2xl text-blue-600">₹{totalRefunded}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <CardTitle>Transaction History</CardTitle>
            <div className="relative w-full sm:max-w-xs">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search transactions..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="paid">Paid</TabsTrigger>
              <TabsTrigger value="pending">Pending</TabsTrigger>
              <TabsTrigger value="refunded">Refunded</TabsTrigger>
            </TabsList>
            <TabsContent value={activeTab} className="pt-6">
              {filteredPayments.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <CreditCard className="h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-4 text-lg font-semibold">No Transactions Found</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {searchQuery
                      ? "No transactions match your search criteria."
                      : "You don't have any payment transactions yet."}
                  </p>
                  {!searchQuery && (
                    <Button className="mt-4" asChild>
                      <Link href="/events">Browse Events</Link>
                    </Button>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredPayments.map((payment) => (
                    <div key={payment.payment_id} className="rounded-lg border p-4">
                      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                        <div className="space-y-2 flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold">{payment.event_name}</h3>
                            {getStatusBadge(payment.payment_status)}
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-muted-foreground">
                            <div>
                              <span className="font-medium">Booking Ref:</span> {payment.booking_ref}
                            </div>
                            <div>
                              <span className="font-medium">Transaction ID:</span> {payment.transaction_id}
                            </div>
                            <div>
                              <span className="font-medium">Payment Method:</span> {payment.payment_method}
                            </div>
                            <div>
                              <span className="font-medium">Date:</span> {new Date(payment.payment_date).toLocaleDateString('en-IN', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </div>
                          </div>
                          <div className="text-lg font-semibold">₹{payment.amount}</div>
                        </div>
                        <div className="flex flex-row gap-2 sm:flex-col">
                          {(payment.payment_status?.toLowerCase() === "paid" || payment.payment_status?.toLowerCase() === "successful") && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDownloadReceipt(payment.payment_id)}
                            >
                              <Download className="mr-2 h-4 w-4" />
                              Receipt
                            </Button>
                          )}
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/dashboard/bookings/${payment.booking_ref}`}>
                              View Booking
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}

