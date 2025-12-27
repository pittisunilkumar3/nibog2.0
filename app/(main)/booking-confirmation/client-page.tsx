"use client"

import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, ArrowRight } from "lucide-react"
import { useEffect, useState, Suspense } from "react"


function BookingConfirmationContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const bookingRef = searchParams.get('ref')

  useEffect(() => {
    // Clear all registration/session data after booking confirmation
    sessionStorage.removeItem('registrationData')
    sessionStorage.removeItem('selectedAddOns')
    sessionStorage.removeItem('eligibleGames')
    sessionStorage.removeItem('nibog_restored_city')
    sessionStorage.removeItem('nibog_restored_eventType')
    sessionStorage.removeItem('nibog_restored_childAgeMonths')
    localStorage.removeItem('nibog_booking_data')
  }, []);

  return (
    <div className="container py-8 px-4 sm:px-6 relative">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-10 -left-10 w-40 h-40 rounded-full bg-green-200 opacity-20 animate-pulse"></div>
        <div className="absolute top-1/4 -right-10 w-32 h-32 rounded-full bg-blue-200 opacity-20 animate-pulse delay-700"></div>
        <div className="absolute bottom-1/4 -left-10 w-36 h-36 rounded-full bg-yellow-200 opacity-20 animate-pulse delay-1000"></div>
        <div className="absolute -bottom-10 -right-10 w-44 h-44 rounded-full bg-pink-200 opacity-20 animate-pulse delay-500"></div>
      </div>

      <Card className="mx-auto w-full max-w-3xl relative overflow-hidden shadow-lg border-2 border-green-500/10 bg-white/90 backdrop-blur-sm">
        {/* Decorative top pattern */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-green-500 via-teal-500 to-emerald-500"></div>

        <CardHeader className="space-y-1 relative">
          <div className="flex items-center gap-4">
            <div className="bg-green-100 p-3 rounded-full">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <div>
              <CardTitle className="text-2xl bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent">Registration Completed!</CardTitle>
              <CardDescription>
                Your event registration has been successfully completed
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Success Message */}
          <div className="text-center py-8 px-4">
            <div className="bg-green-100 p-4 rounded-full inline-block mb-6">
              <CheckCircle className="h-16 w-16 text-green-600" />
            </div>
            
            <h2 className="text-3xl font-bold text-green-800 mb-4">
              Thank You for Registering!
            </h2>
            
            <p className="text-lg text-gray-700 mb-6">
              Your registration has been successfully completed and confirmed.
            </p>

            {bookingRef && (
              <div className="bg-green-50 p-6 rounded-lg border-2 border-green-200 mb-6">
                <p className="text-gray-700 mb-2">
                  <strong>Booking Reference:</strong>
                </p>
                <p className="text-2xl font-bold text-green-700 mb-4">
                  {bookingRef}
                </p>
              </div>
            )}

            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mb-4">
              <p className="text-blue-800 text-sm">
                📋 Your booking has been recorded in our system. Please save your booking reference for future use.
              </p>
            </div>

            <p className="text-gray-600 text-sm">
              For any queries, please contact support with your booking reference.
            </p>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col space-y-4">
          <div className="flex justify-center w-full">
            <Button className="px-8 bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700" asChild>
              <Link href="/">
                Return to Home <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>

          <div className="text-center text-sm text-gray-500">
            Need help? Contact us at{" "}
            <Link href="mailto:newindiababyolympics@gmail.com" className="text-green-600 font-medium underline-offset-4 hover:underline transition-colors">
              newindiababyolympics@gmail.com
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}

export default function BookingConfirmationClientPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading booking confirmation...</div>}>
      <BookingConfirmationContent />
    </Suspense>
  )
}
