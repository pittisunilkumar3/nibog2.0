"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Printer, Download, Mail } from "lucide-react"

// Mock data - in a real app, this would come from an API
const bookings = [
  {
    id: "B001",
    user: "Harikrishna",
    email: "harikrishna@example.com",
    phone: "+91 9876543210",
    event: "Baby Crawling",
    venue: "Gachibowli Indoor Stadium",
    city: "Hyderabad",
    date: "2025-10-26",
    time: "9:00 AM",
    children: 1,
    amount: 1800,
    status: "confirmed",
    childDetails: [
      {
        name: "Arjun",
        age: "14 months",
        gender: "Male"
      }
    ],
    paymentDetails: {
      method: "Credit Card",
      transactionId: "TXN123456789",
      paidOn: "2025-10-20"
    },
    bookingDate: "2025-10-20"
  },
  {
    id: "B002",
    user: "Durga Prasad",
    email: "durgaprasad@example.com",
    phone: "+91 9876543211",
    event: "Baby Walker",
    venue: "Gachibowli Indoor Stadium",
    city: "Hyderabad",
    date: "2025-10-26",
    time: "9:00 AM",
    children: 1,
    amount: 1800,
    status: "pending_payment",
    childDetails: [
      {
        name: "Aarav",
        age: "16 months",
        gender: "Male"
      }
    ],
    paymentDetails: null,
    bookingDate: "2025-10-21"
  },
  {
    id: "B003",
    user: "Srujana",
    email: "srujana@example.com",
    phone: "+91 9876543212",
    event: "Running Race",
    venue: "Gachibowli Indoor Stadium",
    city: "Hyderabad",
    date: "2025-10-26",
    time: "9:00 AM",
    children: 2,
    amount: 3600,
    status: "confirmed",
    childDetails: [
      {
        name: "Ananya",
        age: "3 years",
        gender: "Female"
      },
      {
        name: "Advika",
        age: "5 years",
        gender: "Female"
      }
    ],
    paymentDetails: {
      method: "UPI",
      transactionId: "UPI987654321",
      paidOn: "2025-10-19"
    },
    bookingDate: "2025-10-19"
  }
]

type Props = {
  params: { id: string }
}

export default function BookingReceiptPage({ params }: Props) {
  const router = useRouter()
  
  // In Next.js app router, params is already resolved
  const bookingId = params.id
  
  const booking = bookings.find((b) => b.id === bookingId)
  const [isLoading, setIsLoading] = useState({
    print: false,
    download: false,
    email: false
  })
  
  // Handle print receipt
  const handlePrintReceipt = () => {
    setIsLoading({ ...isLoading, print: true })
    
    // Simulate printing
    setTimeout(() => {
      window.print()
      setIsLoading({ ...isLoading, print: false })
    }, 500)
  }
  
  // Handle download receipt
  const handleDownloadReceipt = () => {
    setIsLoading({ ...isLoading, download: true })
    
    // Simulate download
    setTimeout(() => {
      console.log(`Downloading receipt for booking ${bookingId}`)
      setIsLoading({ ...isLoading, download: false })
      // In a real app, this would trigger a download of a PDF file
    }, 1000)
  }
  
  // Handle email receipt
  const handleEmailReceipt = () => {
    setIsLoading({ ...isLoading, email: true })
    
    // Simulate sending email
    setTimeout(() => {
      console.log(`Emailing receipt for booking ${bookingId} to ${booking?.email}`)
      setIsLoading({ ...isLoading, email: false })
      // In a real app, this would send an email with the receipt
    }, 1500)
  }
  
  if (!booking) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold">Booking not found</h2>
          <p className="text-muted-foreground">The booking you are looking for does not exist.</p>
          <Button className="mt-4" onClick={() => router.push("/admin/bookings")}>
            Back to Bookings
          </Button>
        </div>
      </div>
    )
  }
  
  if (booking.status === "pending_payment") {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold">Receipt Not Available</h2>
          <p className="text-muted-foreground">This booking has not been paid for yet. A receipt will be available after payment is confirmed.</p>
          <Button className="mt-4" asChild>
            <Link href={`/admin/bookings/${bookingId}`}>
              Back to Booking
            </Link>
          </Button>
        </div>
      </div>
    )
  }
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" asChild>
            <Link href={`/admin/bookings/${bookingId}`}>
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Back</span>
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Receipt</h1>
            <p className="text-muted-foreground">Booking {bookingId}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handlePrintReceipt} disabled={isLoading.print}>
            <Printer className="mr-2 h-4 w-4" />
            {isLoading.print ? "Printing..." : "Print"}
          </Button>
          <Button variant="outline" onClick={handleDownloadReceipt} disabled={isLoading.download}>
            <Download className="mr-2 h-4 w-4" />
            {isLoading.download ? "Downloading..." : "Download PDF"}
          </Button>
          <Button variant="outline" onClick={handleEmailReceipt} disabled={isLoading.email}>
            <Mail className="mr-2 h-4 w-4" />
            {isLoading.email ? "Sending..." : "Email Receipt"}
          </Button>
        </div>
      </div>

      <div className="print:shadow-none mx-auto max-w-3xl rounded-lg border p-8 print:border-none">
        <div className="flex flex-col items-center justify-center">
          <h2 className="text-2xl font-bold">NIBOG</h2>
          <p className="text-muted-foreground">Receipt for Booking</p>
        </div>
        
        <div className="mt-8 flex justify-between">
          <div>
            <h3 className="font-semibold">Receipt To:</h3>
            <p>{booking.user}</p>
            <p>{booking.email}</p>
            <p>{booking.phone}</p>
          </div>
          <div className="text-right">
            <h3 className="font-semibold">Receipt Details:</h3>
            <p>Receipt #: R-{booking.id}</p>
            <p>Date: {booking.paymentDetails?.paidOn}</p>
            <p>Status: Paid</p>
          </div>
        </div>
        
        <Separator className="my-6" />
        
        <div>
          <h3 className="mb-4 font-semibold">Event Details</h3>
          <div className="rounded-lg border">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="px-4 py-2 text-left">Event</th>
                  <th className="px-4 py-2 text-left">Date & Time</th>
                  <th className="px-4 py-2 text-left">Venue</th>
                  <th className="px-4 py-2 text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="px-4 py-3">{booking.event}</td>
                  <td className="px-4 py-3">
                    {booking.date}
                    <div className="text-xs text-muted-foreground">{booking.time}</div>
                  </td>
                  <td className="px-4 py-3">
                    {booking.venue}
                    <div className="text-xs text-muted-foreground">{booking.city}</div>
                  </td>
                  <td className="px-4 py-3 text-right">₹{booking.amount}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        
        <div className="mt-6">
          <h3 className="mb-4 font-semibold">Participant Details</h3>
          <div className="rounded-lg border">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="px-4 py-2 text-left">Name</th>
                  <th className="px-4 py-2 text-left">Age</th>
                  <th className="px-4 py-2 text-left">Gender</th>
                </tr>
              </thead>
              <tbody>
                {booking.childDetails.map((child, index) => (
                  <tr key={index} className={index < booking.childDetails.length - 1 ? "border-b" : ""}>
                    <td className="px-4 py-3">{child.name}</td>
                    <td className="px-4 py-3">{child.age}</td>
                    <td className="px-4 py-3">{child.gender}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        
        <div className="mt-6 flex justify-between">
          <div>
            <h3 className="font-semibold">Payment Information</h3>
            <p>Method: {booking.paymentDetails?.method}</p>
            <p>Transaction ID: {booking.paymentDetails?.transactionId}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Subtotal</p>
            <p className="text-xl font-bold">₹{booking.amount}</p>
          </div>
        </div>
        
        <Separator className="my-6" />
        
        <div className="text-center text-sm text-muted-foreground">
          <p>Thank you for booking with NIBOG!</p>
          <p>Please bring this receipt to the event for check-in.</p>
          <p>For any queries, please contact us at newindiababyolympics@gmail.com or call +91-8977939614/15.</p>
        </div>
      </div>
    </div>
  )
}
