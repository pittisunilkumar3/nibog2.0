"use client"

import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, Calendar, MapPin, User, Phone, Mail, ArrowRight } from "lucide-react"
import { useEffect, useState, Suspense } from "react"
import { TicketDetails, getTicketDetails } from "@/services/bookingService"
import { checkPhonePePaymentStatus } from "@/services/paymentService"


function BookingConfirmationContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const bookingRef = searchParams.get('ref')
  const [bookingDetails, setBookingDetails] = useState<TicketDetails | null>(null)
  const [ticketDetails, setTicketDetails] = useState<TicketDetails[] | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch booking details when component mounts


  // Helper function to normalize booking reference formats to ensure API compatibility
  // Simply extract the booking reference without any format conversion
  // This ensures we use the EXACT SAME reference ID throughout the entire system
  const normalizeBookingRef = (ref: string): string => {
    if (!ref) return '';
    
    // If the reference is a URL, extract the ref parameter
    if (ref.includes('ref=')) {
      try {
        const url = new URL(ref, window.location.origin);
        const bookingRef = url.searchParams.get('ref');
        if (bookingRef) {
          localStorage.setItem('lastBookingRef', bookingRef);
          return bookingRef;
        }
      } catch (e) {
      }
    }
    
    // If not a URL, use the reference as-is
    localStorage.setItem('lastBookingRef', ref);
    return ref;
  };

  useEffect(() => {
    // Clear all registration/session data after booking confirmation
    sessionStorage.removeItem('registrationData')
    sessionStorage.removeItem('selectedAddOns')
    sessionStorage.removeItem('eligibleGames')
    sessionStorage.removeItem('nibog_restored_city')
    sessionStorage.removeItem('nibog_restored_eventType')
    sessionStorage.removeItem('nibog_restored_childAgeMonths')
    localStorage.removeItem('nibog_booking_data')

    const fetchBookingDetails = async () => {
      setIsLoading(true);
      setError(null);
      
      // Check if we have a booking reference from URL or need to check localStorage
      let refToUse = bookingRef;
      
      if (!refToUse) {
        // Check if we have a stored booking reference from the payment callback
        try {
          const storedBookingRef = localStorage.getItem('lastBookingRef');
          
          if (storedBookingRef) {
            refToUse = storedBookingRef;
          }
        } catch (e) {
        }
      }
      
      // If we still don't have a reference, show error
      if (!refToUse) {
        setError("No booking reference provided - please check your confirmation email")
        setIsLoading(false)
        return
      }

      try {
        setIsLoading(true)
        
        // Normalize the booking reference
        const normalizedRef = normalizeBookingRef(refToUse);
        
        // Try to get comprehensive ticket details using the API with normalized ref
        try {
          const ticketData = await getTicketDetails(normalizedRef)
          
          if (ticketData && ticketData.length > 0) {
            
            setTicketDetails(ticketData)
            // Store the first ticket as the booking details for display
            if (ticketData[0]) {
              setBookingDetails(ticketData[0])
            }

            // Ticket email is sent automatically from the payment callback
            // No need to send it again from the confirmation page

            return
          }
        } catch (ticketError) {
        }
        
        // Try to check if this is a payment transaction ID by calling payment status API
        // Skip PhonePe API call if we already have a PPT reference
        if (!refToUse.startsWith('PPT')) {
          try {
            const response = await fetch('/api/payments/phonepe-status', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                transactionId: refToUse,
                bookingData: null,
              }),
            });

            const data = await response.json();

            if (data.bookingCreated && data.bookingId) {
              const normalizedApiBookingId = normalizeBookingRef(data.bookingId);

              try {
                const ticketData = await getTicketDetails(normalizedApiBookingId);
                if (ticketData && ticketData.length > 0) {
                  setTicketDetails(ticketData);
                  // Store the first ticket as the booking details for display
                  if (ticketData[0]) {
                    setBookingDetails(ticketData[0]);
                  }

                  // Ticket email is sent automatically from the payment callback
                  // No need to send it again from the confirmation page

                  return;
                }
              } catch (ticketError) {
                console.error("Error fetching ticket details with payment API bookingId:", ticketError);
                // Continue to fallback methods if this fails
              }
            }

            // If we couldn't get booking ID from the payment API or couldn't fetch it,
            // Try with PPT format as a fallback
            try {
              // Format with PPT prefix + date + ID portion
              if (!refToUse) {
                throw new Error("No booking reference for PPT attempt");
              }

              // Try to extract just numbers if reference has other characters
              const numericPart = refToUse.replace(/\D/g, '');
              if (numericPart.length > 0) {
                // Create date variables for PPT format
                const currentDate = new Date();
                const year = currentDate.getFullYear().toString().slice(-2);
                const month = (currentDate.getMonth() + 1).toString().padStart(2, '0');
                const day = currentDate.getDate().toString().padStart(2, '0');

                const pptRef = `PPT${year}${month}${day}${numericPart.slice(0, 3)}`;

                const ticketData = await getTicketDetails(pptRef);
                if (ticketData && ticketData.length > 0) {
                  setTicketDetails(ticketData);
                  if (ticketData[0]) {
                    setBookingDetails(ticketData[0]);
                  }
                  // Store this successful reference
                  localStorage.setItem('lastBookingRef', JSON.stringify(pptRef));
                  return;
                }
              }

              setError("Payment was successful, but booking details could not be found. Please check your email for booking confirmation.");
            } catch (pptError) {
              console.error("Error with PPT format attempt:", pptError);
              setError("Payment was successful, but booking details could not be found. Please check your email for booking confirmation.");
            }
          } catch (paymentError) {
            console.error("Error checking payment status:", paymentError);
            setError("Failed to check payment status");
          }
        }

        // If we still don't have ticket details, try direct booking lookup as a final attempt
        if (!ticketDetails) {
          try {
            // Try ticket details API first
            if (!refToUse) {
              throw new Error("No booking reference for ticket details");
            }
            const ticketData = await getTicketDetails(refToUse);
            if (ticketData && ticketData.length > 0) {
              setTicketDetails(ticketData);
              return;
            }
          } catch (ticketError) {
            console.error("Error fetching ticket details as final attempt:", ticketError);
            setError("Failed to fetch booking details");
          }
        }
      } catch (error: any) {
        console.error("Error in booking confirmation flow:", error);
        setError(error.message || "Failed to process booking confirmation");
      } finally {
        setIsLoading(false);
      }
    };

    fetchBookingDetails();
  }, [bookingRef]);

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

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="animate-spin h-12 w-12 border-4 border-green-500 border-t-transparent rounded-full mb-4"></div>
            <p className="text-gray-600">Loading booking details...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center">
            <div className="bg-red-100 p-3 rounded-full inline-block mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-600">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="15" y1="9" x2="9" y2="15"></line>
                <line x1="9" y1="9" x2="15" y2="15"></line>
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-red-700 mb-2">Error Loading Booking</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <Button variant="outline" onClick={() => window.location.href = "/"}>Return to Home</Button>
          </div>
        ) : (
          <>
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

              <div className="bg-green-50 p-6 rounded-lg border-2 border-green-200 mb-6">
                <p className="text-gray-700 mb-2">
                  <strong>Booking Reference:</strong>
                </p>
                <p className="text-2xl font-bold text-green-700 mb-4">
                  {ticketDetails?.[0]?.booking_ref || bookingDetails?.booking_ref || "N/A"}
                </p>
                
                {(ticketDetails?.[0]?.event_title || bookingDetails?.event_title) && (
                  <div className="mt-4 pt-4 border-t border-green-200">
                    <p className="text-gray-700 mb-1">
                      <strong>Event:</strong> {ticketDetails?.[0]?.event_title || bookingDetails?.event_title}
                    </p>
                    {(ticketDetails?.[0]?.event_date || bookingDetails?.event_date) && (
                      <p className="text-gray-700">
                        <strong>Date:</strong> {ticketDetails?.[0]?.event_date ? new Date(ticketDetails[0].event_date).toLocaleDateString() : new Date(bookingDetails!.event_date).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                )}
              </div>

              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mb-4">
                <p className="text-blue-800 text-sm">
                  📧 A confirmation email has been sent to your registered email address with all the event details.
                </p>
              </div>

              <p className="text-gray-600 text-sm">
                Please save your booking reference for future reference.
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
          </>
        )}
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
