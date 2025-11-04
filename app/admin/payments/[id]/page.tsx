"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Download, Printer, Mail, RefreshCw, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { getPaymentById, Payment } from "@/services/paymentService"
import { downloadReceiptAsPDF, sendReceiptEmail, generateReceiptHTML } from "@/services/receiptService"

const getStatusBadge = (status: string) => {
  switch (status) {
    case "successful":
      return <Badge className="bg-green-500 hover:bg-green-600">Successful</Badge>
    case "pending":
      return <Badge className="bg-yellow-500 hover:bg-yellow-600">Pending</Badge>
    case "failed":
      return <Badge className="bg-red-500 hover:bg-red-600">Failed</Badge>
    case "refunded":
      return <Badge className="bg-blue-500 hover:bg-blue-600">Refunded</Badge>
    default:
      return <Badge variant="outline">{status}</Badge>
  }
}

type Props = {
  params: { id: string }
}

export default function PaymentDetailPage({ params }: Props) {
  const router = useRouter()
  const { toast } = useToast()

  // In Next.js app router, params is already resolved
  const paymentId = params.id

  // State management
  const [payment, setPayment] = useState<Payment | null>(null)
  const [isLoading, setIsLoading] = useState({
    fetching: true,
    print: false,
    download: false,
    email: false,
    refresh: false
  })
  const [error, setError] = useState<string | null>(null)

  // Fetch payment data
  useEffect(() => {
    const fetchPayment = async () => {
      try {
        setIsLoading(prev => ({ ...prev, fetching: true }))
        setError(null)

        const paymentData = await getPaymentById(Number(paymentId))

        if (!paymentData) {
          throw new Error("No payment data returned from API")
        }

        // Handle array response (API returns array with single payment)
        if (Array.isArray(paymentData) && paymentData.length > 0) {
          setPayment(paymentData[0])
        } else if (!Array.isArray(paymentData)) {
          setPayment(paymentData)
        } else {
          throw new Error("Payment not found")
        }
      } catch (error: any) {
        console.error("Failed to fetch payment data:", error)
        setError(error.message || "Failed to load payment data. Please try again.")

        toast({
          title: "Error",
          description: error.message || "Failed to load payment data. Please try again later",
          variant: "destructive"
        })
      } finally {
        setIsLoading(prev => ({ ...prev, fetching: false }))
      }
    }

    if (paymentId) {
      fetchPayment()
    }
  }, [paymentId])
  
  // Handle print receipt
  const handlePrintReceipt = () => {
    if (!payment) return

    setIsLoading(prev => ({ ...prev, print: true }))

    try {
      // Generate receipt HTML and open in new window for printing
      const receiptHTML = generateReceiptHTML(payment)
      const printWindow = window.open('', '_blank')

      if (printWindow) {
        printWindow.document.write(receiptHTML)
        printWindow.document.close()

        printWindow.onload = () => {
          setTimeout(() => {
            printWindow.print()
            printWindow.onafterprint = () => {
              printWindow.close()
            }
          }, 500)
        }

        toast({
          title: "Success",
          description: "Receipt opened for printing"
        })
      } else {
        toast({
          title: "Error",
          description: "Unable to open print window. Please check your browser settings.",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error("Error printing receipt:", error)
      toast({
        title: "Error",
        description: "Failed to print receipt",
        variant: "destructive"
      })
    } finally {
      setIsLoading(prev => ({ ...prev, print: false }))
    }
  }

  // Handle download receipt
  const handleDownloadReceipt = () => {
    if (!payment) return

    setIsLoading(prev => ({ ...prev, download: true }))

    try {
      downloadReceiptAsPDF(payment)
      toast({
        title: "Success",
        description: "Receipt download initiated! Please use your browser's print dialog to save as PDF."
      })
    } catch (error) {
      console.error("Error downloading receipt:", error)
      toast({
        title: "Error",
        description: "Failed to download receipt",
        variant: "destructive"
      })
    } finally {
      setIsLoading(prev => ({ ...prev, download: false }))
    }
  }

  // Handle email receipt
  const handleEmailReceipt = async () => {
    if (!payment) return

    setIsLoading(prev => ({ ...prev, email: true }))

    try {
      const result = await sendReceiptEmail(payment)

      if (result.success) {
        toast({
          title: "Success",
          description: `Receipt sent successfully to ${payment.user_email}`
        })
      } else {
        toast({
          title: "Error",
          description: `Failed to send receipt: ${result.message}`,
          variant: "destructive"
        })
      }
    } catch (error: any) {
      console.error("Error sending receipt email:", error)
      toast({
        title: "Error",
        description: `Failed to send receipt: ${error.message || 'Unknown error'}`,
        variant: "destructive"
      })
    } finally {
      setIsLoading(prev => ({ ...prev, email: false }))
    }
  }

  // Handle refresh payment status
  const handleRefreshStatus = async () => {
    if (!payment) return

    setIsLoading(prev => ({ ...prev, refresh: true }))

    try {
      // Refetch payment data to get updated status
      const updatedPayment = await getPaymentById(Number(paymentId))

      if (Array.isArray(updatedPayment) && updatedPayment.length > 0) {
        setPayment(updatedPayment[0])
      } else if (!Array.isArray(updatedPayment)) {
        setPayment(updatedPayment)
      }

      toast({
        title: "Success",
        description: "Payment status refreshed"
      })
    } catch (error: any) {
      console.error("Failed to refresh payment status:", error)
      toast({
        title: "Error",
        description: "Failed to refresh payment status",
        variant: "destructive"
      })
    } finally {
      setIsLoading(prev => ({ ...prev, refresh: false }))
    }
  }


  
  // Loading state
  if (isLoading.fetching) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <h2 className="text-xl font-semibold">Loading payment details...</h2>
          <p className="text-muted-foreground">Please wait while we fetch the payment information.</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error || !payment) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold">
            {error ? "Error loading payment" : "Payment not found"}
          </h2>
          <p className="text-muted-foreground">
            {error || "The payment you are looking for does not exist."}
          </p>
          <div className="mt-4 space-x-2">
            <Button variant="outline" onClick={() => window.location.reload()}>
              Try Again
            </Button>
            <Button onClick={() => router.push("/admin/payments")}>
              Back to Payments
            </Button>
          </div>
        </div>
      </div>
    )
  }
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" asChild>
            <Link href="/admin/payments">
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Back</span>
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Payment {payment.payment_id}</h1>
            <p className="text-muted-foreground">{payment.event_title} - {new Date(payment.event_date).toLocaleDateString()}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handlePrintReceipt} disabled={isLoading.print}>
            <Printer className="mr-2 h-4 w-4" />
            {isLoading.print ? "Printing..." : "Print"}
          </Button>
          <Button variant="outline" onClick={handleDownloadReceipt} disabled={isLoading.download}>
            <Download className="mr-2 h-4 w-4" />
            {isLoading.download ? "Downloading..." : "Download"}
          </Button>
          <Button variant="outline" onClick={handleEmailReceipt} disabled={isLoading.email}>
            <Mail className="mr-2 h-4 w-4" />
            {isLoading.email ? "Sending..." : "Email Receipt"}
          </Button>

          {payment.payment_status === "pending" && (
            <Button onClick={handleRefreshStatus} disabled={isLoading.refresh}>
              <RefreshCw className={`mr-2 h-4 w-4 ${isLoading.refresh ? "animate-spin" : ""}`} />
              {isLoading.refresh ? "Refreshing..." : "Refresh Status"}
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Payment Details</CardTitle>
            <div className="mt-2">
              {getStatusBadge(payment.payment_status)}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <h3 className="mb-2 font-medium">Transaction Information</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Transaction ID</span>
                    <span className="font-mono text-sm">{payment.transaction_id}</span>
                  </div>
                  {payment.phonepe_transaction_id && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">PhonePe Transaction ID</span>
                      <span className="font-mono text-sm">{payment.phonepe_transaction_id}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Date & Time</span>
                    <span className="text-sm">{new Date(payment.payment_date).toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Payment Method</span>
                    <span className="text-sm">{payment.payment_method}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Created At</span>
                    <span className="text-sm">{new Date(payment.created_at).toLocaleString()}</span>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="mb-2 font-medium">Customer Information</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Name</span>
                    <span className="text-sm">{payment.user_name}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Email</span>
                    <span className="text-sm">{payment.user_email}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Phone</span>
                    <span className="text-sm">{payment.user_phone}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <Separator />
            
            <div>
              <h3 className="mb-2 font-medium">Booking Information</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Booking ID</span>
                  <Link href={`/admin/bookings/${payment.booking_id}`} className="text-sm text-blue-500 hover:underline">
                    {payment.booking_id}
                  </Link>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Booking Reference</span>
                  <span className="text-sm">{payment.booking_ref}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Booking Status</span>
                  <span className="text-sm">{payment.booking_status}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Booking Total</span>
                  <span className="text-sm">₹{payment.booking_total_amount}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Event</span>
                  <span className="text-sm">{payment.event_title}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Event Description</span>
                  <span className="text-sm">{payment.event_description}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Venue</span>
                  <span className="text-sm">{payment.venue_name}, {payment.city_name}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Venue Address</span>
                  <span className="text-sm">{payment.venue_address}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Event Date</span>
                  <span className="text-sm">{new Date(payment.event_date).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
            
            <Separator />
            
            {payment.gateway_response && (
              <div>
                <h3 className="mb-2 font-medium">Gateway Response</h3>
                <div className="rounded-lg border p-3">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Response Code</span>
                      <span className="font-mono text-sm">{payment.gateway_response.code}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">State</span>
                      <span className="text-sm">{payment.gateway_response.state}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Merchant ID</span>
                      <span className="font-mono text-sm">{payment.gateway_response.merchantId}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Gateway Amount</span>
                      <span className="text-sm">₹{payment.gateway_response.amount ? (payment.gateway_response.amount / 100).toFixed(2) : 'N/A'}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {(payment.refund_amount && parseFloat(payment.refund_amount.toString()) > 0) && (
              <>
                <Separator />
                <div>
                  <h3 className="mb-2 font-medium">Refund Information</h3>
                  <div className="rounded-lg border p-3 border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950/50">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Refund Amount</span>
                        <span className="text-sm">₹{payment.refund_amount}</span>
                      </div>
                      {payment.refund_date && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Refund Date</span>
                          <span className="text-sm">
                            {new Date(payment.refund_date).toLocaleString()}
                          </span>
                        </div>
                      )}
                      {payment.refund_reason && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Reason</span>
                          <span className="text-sm">{payment.refund_reason}</span>
                        </div>
                      )}
                      {payment.admin_notes && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Admin Notes</span>
                          <span className="text-sm">{payment.admin_notes}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Payment Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg border p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Amount</span>
                <span className="text-xl font-bold">₹{payment.amount}</span>
              </div>
            </div>

            <div className="rounded-lg border p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Status</span>
                <div>{getStatusBadge(payment.payment_status)}</div>
              </div>
            </div>

            <div className="mt-4">
              <Button className="w-full" asChild>
                <Link href={`/admin/bookings/${payment.booking_id}`}>
                  View Booking
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

    </div>
  )
}
