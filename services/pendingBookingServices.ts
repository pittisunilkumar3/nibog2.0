/**
 * Service for managing pending bookings
 * This replaces sessionStorage with database storage for better reliability
 */

export interface PendingBookingData {
    userId: number;
    parentName: string;
    email: string;
    phone: string;
    childName: string;
    childDob: string;
    schoolName: string;
    gender: string;
    eventId: number;
    gameId: number[];
    gamePrice: number[];
    totalAmount: number;
    paymentMethod: string;
    termsAccepted: boolean;
    addOns?: Array<{
      addOnId: number;
      quantity: number;
      variantId?: string;
    }>;
    promoCode?: string;
  }
  
  export interface PendingBookingResponse {
    success: boolean;
    transactionId?: string;
    pendingBookingId?: number;
    expiresAt?: string;
    error?: string;
  }
  
  /**
   * Create a pending booking record in the database
   * @param bookingData The booking data to store
   * @returns Promise with the transaction ID and expiration time
   */
  export async function createPendingBooking(bookingData: PendingBookingData): Promise<PendingBookingResponse> {
    try {
      console.log("=== CREATING PENDING BOOKING ===");
      console.log("Booking data:", JSON.stringify(bookingData, null, 2));
  
      const response = await fetch('/api/pending-bookings/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bookingData),
      });
  
      if (!response.ok) {
        console.error(`❌ Pending booking API failed with status: ${response.status}`);
        console.error(`❌ Response status text: ${response.statusText}`);

        let errorData;
        try {
          errorData = await response.json();
          console.error('❌ Error response data:', errorData);
        } catch (parseError) {
          console.error('❌ Failed to parse error response as JSON');
          const errorText = await response.text();
          console.error('❌ Raw error response:', errorText);
          errorData = { error: errorText };
        }

        return {
          success: false,
          error: errorData.error || `Failed to create pending booking: ${response.status} - ${response.statusText}`
        };
      }
  
      const result = await response.json();
      console.log("✅ Pending booking created successfully:", result);
  
      return {
        success: true,
        transactionId: result.transactionId,
        pendingBookingId: result.pendingBookingId,
        expiresAt: result.expiresAt
      };
  
    } catch (error: any) {
      console.error("Error creating pending booking:", error);
      return {
        success: false,
        error: error.message || "Failed to create pending booking"
      };
    }
  }
  
  /**
   * Retrieve a pending booking by transaction ID
   * @param transactionId The transaction ID
   * @returns Promise with the booking data or null if not found
   */
  export async function getPendingBooking(transactionId: string): Promise<PendingBookingData | null> {
    try {
      console.log(`🔍 Retrieving pending booking for transaction: ${transactionId}`);
  
      // Retry logic with exponential backoff
      let retryCount = 0;
      const maxRetries = 3;
      
      while (retryCount <= maxRetries) {
        try {
          if (retryCount > 0) {
            const delay = Math.pow(2, retryCount) * 500; // Exponential backoff: 1s, 2s, 4s
            console.log(`⏱️ Retry #${retryCount} after ${delay}ms delay for transaction: ${transactionId}`);
            await new Promise(resolve => setTimeout(resolve, delay));
          }
          
          // Add timeout to avoid hanging requests
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
          
          const response = await fetch('/api/pending-bookings/get', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              transaction_id: transactionId
            }),
            signal: controller.signal
          });
          
          clearTimeout(timeoutId);
  
          if (response.ok) {
            const result = await response.json();
            console.log(`✅ Found pending booking for transaction: ${transactionId}`);
            return result.bookingData;
          } else if (response.status === 404) {
            console.log(`📭 No pending booking found for transaction: ${transactionId}`);
            return null;
          } else if (response.status === 410) {
            console.log(`⏰ Pending booking expired for transaction: ${transactionId}`);
            return null;
          } else if (response.status === 207) {
            // Partial content - attempt to use what we have
            const result = await response.json();
            console.warn(`⚠️ Partial pending booking data for transaction: ${transactionId}`);
            
            if (result.needsCleanup) {
              console.log(`🧹 Cleaning up corrupted pending booking in background`);
              deletePendingBooking(transactionId).catch(err => 
                console.error(`Failed to clean up corrupted booking: ${err}`))
            }
            
            // Try to extract raw booking data if available
            if (result.rawBookingData) {
              try {
                const parsedData = JSON.parse(result.rawBookingData);
                console.log(`✅ Successfully parsed raw booking data from partial response`);
                return parsedData;
              } catch (parseError) {
                console.error(`❌ Failed to parse raw booking data: ${parseError}`);
              }
            }
            
            // Try to use partial data if available
            if (result.partialData && result.partialData.booking_data) {
              try {
                const parsedData = JSON.parse(result.partialData.booking_data);
                console.log(`✅ Successfully parsed booking data from partial response`);
                return parsedData;
              } catch (parseError) {
                console.error(`❌ Failed to parse partial booking data: ${parseError}`);
              }
            }
            
            // If we couldn't recover any usable data, return null
            return null;
          } else {
            console.error(`❌ Error retrieving pending booking: ${response.status}`);
            
            // Try to parse the error response for more details
            try {
              const errorData = await response.json();
              console.error(`❌ Error details:`, errorData);
              
              // If this is not the last retry, continue to the next retry
              if (retryCount < maxRetries) {
                retryCount++;
                continue;
              }
            } catch (jsonError) {
              // If we can't parse the error as JSON, just log it
              console.error(`❌ Unable to parse error response: ${jsonError}`);
            }
            
            return null;
          }
        } catch (fetchError: any) {
          console.error(`❌ Fetch error on attempt #${retryCount + 1}:`, fetchError.message);
          
          // If this is an abort error (timeout), or we've reached max retries, bail out
          if (fetchError.name === 'AbortError' || retryCount >= maxRetries) {
            console.error(`⚠️ Request timed out or max retries reached for transaction: ${transactionId}`);
            return null;
          }
          
          // Otherwise, retry
          retryCount++;
        }
      }
      
      // If we get here, all retries have failed
      return null;
  
    } catch (error) {
      console.error('❌ Unhandled error retrieving pending booking:', error);
      return null;
    }
  }
  
  /**
   * Delete a pending booking (cleanup after successful payment or expiration)
   * @param transactionId The transaction ID
   * @returns Promise with success status
   */
  export async function deletePendingBooking(transactionId: string): Promise<boolean> {
    try {
      console.log(`🗑️ Deleting pending booking for transaction: ${transactionId}`);
  
      const response = await fetch('/api/pending-bookings/delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          transaction_id: transactionId
        }),
      });
  
      if (response.ok) {
        console.log(`✅ Pending booking deleted for transaction: ${transactionId}`);
        return true;
      } else {
        console.error(`❌ Failed to delete pending booking: ${response.status}`);
        return false;
      }
  
    } catch (error) {
      console.error('❌ Error deleting pending booking:', error);
      return false;
    }
  }
  
  /**
   * Store booking data temporarily before payment (replaces sessionStorage)
   * @param bookingData The booking data to store
   * @returns Promise with the transaction ID for payment
   */
  export async function storePendingBookingForPayment(bookingData: PendingBookingData): Promise<string | null> {
    try {
      const result = await createPendingBooking(bookingData);
      
      if (result.success && result.transactionId) {
        console.log(`📦 Booking data stored with transaction ID: ${result.transactionId}`);
        console.log(`⏰ Expires at: ${result.expiresAt}`);
        return result.transactionId;
      } else {
        console.error('Failed to store pending booking:', result.error);
        return null;
      }
    } catch (error) {
      console.error('Error storing pending booking for payment:', error);
      return null;
    }
  }
  
  /**
   * Clean up expired pending bookings (can be called periodically)
   * This would typically be handled by a background job
   */
  export async function cleanupExpiredPendingBookings(): Promise<void> {
    try {
      console.log("🧹 Cleaning up expired pending bookings...");
      
      // This would typically be handled by the backend
      // For now, we'll just log that cleanup should happen
      console.log("Note: Expired pending bookings cleanup should be handled by backend cron job");
      
    } catch (error) {
      console.error('Error cleaning up expired pending bookings:', error);
    }
  }
  