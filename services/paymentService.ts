// Payment service for handling payment gateway integrations and admin management

import { BOOKING_API, PAYMENT_API } from '@/config/api';
import type { PaymentStatus } from '@/config/phonepe';
import { getSession } from '@/lib/auth/session';
import { z } from 'zod';

// Helper function to create headers with auth (async)
const getAuthHeaders = async () => {
  let token: string | null = null;
  
  if (typeof window !== 'undefined') {
    // Priority 1: Check for adminToken in localStorage (set by superadmin login)
    token = localStorage.getItem('adminToken');
    
    // Priority 2: Check sessionStorage
    if (!token) {
      token = sessionStorage.getItem('adminToken');
    }
    
    // Priority 3: Try getSession which checks nibog-session and other sources
    if (!token) {
      token = await getSession();
    }
    
    // Priority 4: Check for superadmin cookie (contains user data, but we need the actual token)
    // Note: The superadmin-token cookie contains user data JSON, not the token itself
    // The actual token is stored in localStorage as 'adminToken'
  }
  
  console.log('🔐 getAuthHeaders - Token found:', !!token);
  
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}`, 'x-superadmin-token': token } : {})
  };
};

// Normalize payment status to standard values
const normalizePaymentStatus = (status: string): 'successful' | 'pending' | 'failed' | 'refunded' => {
  const statusMap: Record<string, 'successful' | 'pending' | 'failed' | 'refunded'> = {
    'paid': 'successful',
    'success': 'successful',
    'successful': 'successful',
    'completed': 'successful',
    'pending': 'pending',
    'failed': 'failed',
    'failure': 'failed',
    'refunded': 'refunded',
    'refund': 'refunded'
  };
  return statusMap[status?.toLowerCase()] || 'pending';
};

// Payment interface for admin panel
export interface Payment {
  payment_id: number;
  booking_id: number;
  transaction_id: string;
  phonepe_transaction_id?: string;
  amount: string | number;
  payment_method: string;
  payment_status: 'successful' | 'pending' | 'failed' | 'refunded';
  payment_date: string;
  created_at: string;
  updated_at: string;

  // User details
  user_name: string;
  user_email: string;
  user_phone: string;

  // Event details
  event_title: string;
  event_date: string;
  event_description?: string;
  city_name: string;
  venue_name: string;
  venue_address?: string;

  // Booking details
  booking_ref?: string;
  booking_status?: string;
  booking_total_amount?: string;

  // Gateway response (optional)
  gateway_response?: {
    code: string;
    state?: string;
    amount?: number;
    merchantId?: string;
    transactionId?: string;
  };

  // Child details (optional)
  child_name?: string;
  child_age?: number;

  // Game details (optional)
  game_name?: string;
  game_price?: number;

  // Refund details (optional)
  refund_amount?: string | number;
  refund_date?: string;
  refund_reason?: string;
  admin_notes?: string;
}

// Payment analytics interface
export interface PaymentAnalytics {
  summary: {
    total_revenue: number;
    total_payments: number;
    successful_payments: number;
    pending_payments: number;
    failed_payments: number;
    refunded_payments: number;
    refund_amount: number;
    average_transaction: number;
  };
  monthly_data: Array<{
    month: string;
    revenue: number;
    payments: number;
    successful: number;
    failed: number;
  }>;
  payment_methods: Array<{
    method: string;
    count: number;
    amount: number;
    percentage: number;
  }>;
  city_wise: Array<{
    city_name: string;
    revenue: number;
    payments: number;
    percentage: number;
  }>;
}

const phonePeInitiationResponseSchema = z.object({
  success: z.literal(true),
  data: z.object({
    instrumentResponse: z.object({
      redirectInfo: z.object({ url: z.string().url() }),
    }),
  }),
}).passthrough();

const phonePeInitiationErrorSchema = z.object({
  error: z.string().optional(),
  message: z.string().optional(),
}).passthrough();

/** Initiate payment from a persisted booking reference; the server derives and signs the payload. */
export async function initiatePhonePePayment(bookingRef: string): Promise<string> {
  if (!/^NIBOG_\d+_\d+$/.test(bookingRef) || bookingRef.length > 38) {
    throw new Error('A valid pending booking reference is required');
  }
  if (typeof window === 'undefined') {
    throw new Error('Payment initiation must be called from the browser');
  }

  const response = await fetch('/api/payments/phonepe-initiate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ bookingRef }),
  });
  const rawData: unknown = await response.json().catch(() => null);

  if (!response.ok) {
    const errorData = phonePeInitiationErrorSchema.safeParse(rawData);
    const message = errorData.success
      ? errorData.data.error || errorData.data.message || `Payment initiation failed (${response.status})`
      : `Payment initiation failed (${response.status})`;
    throw new Error(message);
  }

  const parsed = phonePeInitiationResponseSchema.safeParse(rawData);
  if (!parsed.success) {
    const errorData = phonePeInitiationErrorSchema.safeParse(rawData);
    throw new Error(errorData.success
      ? errorData.data.error || errorData.data.message || 'PhonePe returned an invalid payment response'
      : 'PhonePe returned an invalid payment response');
  }
  return parsed.data.data.instrumentResponse.redirectInfo.url;
}

export interface PhonePePaymentResult {
  status: PaymentStatus;
  bookingId?: string;
  bookingRef?: string;
  paymentId?: number;
}

const phonePeStatusResponseSchema = z.object({
  code: z.string().optional(),
  error: z.string().optional(),
  data: z.object({
    paymentState: z.string().optional(),
    state: z.string().optional(),
  }).passthrough().optional(),
  bookingCreated: z.boolean().optional(),
  paymentCreated: z.boolean().optional(),
  bookingId: z.union([z.string(), z.number()]).optional(),
  booking_id: z.union([z.string(), z.number()]).optional(),
  paymentId: z.union([z.string(), z.number()]).optional(),
  payment_id: z.union([z.string(), z.number()]).optional(),
  booking_ref: z.string().optional(),
  bookingData: z.object({ booking_ref: z.string().optional() }).optional(),
}).passthrough();

/** Resolve gateway state and a numeric booking ID only after backend confirmation. */
export async function checkPhonePePaymentResult(merchantTransactionId: string): Promise<PhonePePaymentResult> {
  const response = await fetch('/api/payments/phonepe-status', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ transactionId: merchantTransactionId }),
  });
  const parsed = phonePeStatusResponseSchema.safeParse(await response.json().catch(() => null));
  if (!parsed.success) throw new Error('Invalid payment status response');
  const data = parsed.data;
  if (!response.ok) {
    throw new Error(data.error || `Failed to check PhonePe payment status (${response.status})`);
  }

  const paymentState = data.data?.paymentState || data.data?.state;
  const gatewayCompleted = data.code === 'PAYMENT_SUCCESS' && paymentState === 'COMPLETED';
  if (gatewayCompleted) {
    const bookingId = Number(data.bookingId ?? data.booking_id);
    const backendConfirmed = data.bookingCreated === true && data.paymentCreated === true;
    if (!backendConfirmed || !Number.isInteger(bookingId) || bookingId <= 0) {
      throw new Error('Payment has not been confirmed against a booking yet. Please retry status verification.');
    }
    return {
      status: 'SUCCESS',
      bookingId: String(bookingId),
      bookingRef: data.bookingData?.booking_ref || data.booking_ref || merchantTransactionId,
      paymentId: Number(data.paymentId ?? data.payment_id) || undefined,
    };
  }

  if (paymentState === 'PENDING' || data.code === 'PAYMENT_PENDING') return { status: 'PENDING' };
  if (paymentState === 'CANCELLED' || data.code === 'PAYMENT_CANCELLED') return { status: 'CANCELLED' };
  return { status: 'FAILED' };
}

/** Check the status of a PhonePe payment without accepting browser booking data. */
export async function checkPhonePePaymentStatus(merchantTransactionId: string, _bookingData?: unknown): Promise<PaymentStatus> {
  return (await checkPhonePePaymentResult(merchantTransactionId)).status;
}

// ============ ADMIN PAYMENT MANAGEMENT FUNCTIONS ============

// Cache for payments data
const paymentsCache = new Map<string, { data: Payment[], timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes in milliseconds

/**
 * Get all payments for admin panel with caching
 * @param filters Optional filters for payments
 * @param forceRefresh Force a cache refresh
 * @returns Array of payments with details
 */
export async function getAllPayments(filters?: {
  status?: string;
  start_date?: string;
  end_date?: string;
  city_id?: number;
  event_id?: number;
  search?: string;
}, forceRefresh: boolean = false): Promise<Payment[]> {
  try {
    // Build cache key from filters
    const queryParams = new URLSearchParams();
    if (filters?.status) queryParams.append('status', filters.status);
    if (filters?.start_date) queryParams.append('start_date', filters.start_date);
    if (filters?.end_date) queryParams.append('end_date', filters.end_date);
    if (filters?.city_id) queryParams.append('city_id', filters.city_id.toString());
    if (filters?.event_id) queryParams.append('event_id', filters.event_id.toString());
    if (filters?.search) queryParams.append('search', filters.search);
    
    const cacheKey = queryParams.toString();
    const now = Date.now();

    // Return cached data if available and not expired
    const cached = paymentsCache.get(cacheKey);
    if (!forceRefresh && cached && (now - cached.timestamp < CACHE_TTL)) {
      console.log('📦 Returning cached payments data');
      return cached.data;
    }

    // Get the auth token - try multiple sources
    let token: string | null = null;
    
    if (typeof window !== 'undefined') {
      // Try localStorage first
      token = localStorage.getItem('adminToken');
      
      // Try sessionStorage
      if (!token) {
        token = sessionStorage.getItem('adminToken');
      }
      
      // Try cookies as fallback
      if (!token) {
        const cookies = document.cookie.split('; ');
        const authCookie = cookies.find(row => row.startsWith('auth-token='));
        if (authCookie) {
          token = authCookie.split('=')[1];
        }
      }
      
      // Try superadmin-token cookie (contains JSON with token)
      if (!token) {
        const cookies = document.cookie.split('; ');
        const superadminCookie = cookies.find(row => row.startsWith('superadmin-token='));
        if (superadminCookie) {
          try {
            const cookieValue = decodeURIComponent(superadminCookie.split('=')[1]);
            const userData = JSON.parse(cookieValue);
            token = userData.token;
          } catch (e) {
            console.warn('Failed to parse superadmin cookie:', e);
          }
        }
      }
    }
    
    console.log('🔐 Token found:', !!token);
    
    // Build the URL - use the backend URL directly
    const baseUrl = 'http://localhost:3004';
    const url = `${baseUrl}/api/payments${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
    console.log('🔄 Fetching payments from:', url);

    // Make the request with Authorization header
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      },
      cache: 'no-store',
    });

    console.log('📡 Response status:', response.status);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('❌ API Error:', errorData);
      
      // If unauthorized, provide helpful message
      if (response.status === 401) {
        throw new Error('Authentication required. Please log in again.');
      }
      
      throw new Error(errorData.message || `Failed to fetch payments. Status: ${response.status}`);
    }

    const data = await response.json();
    console.log('✅ Payments data received:', data?.data?.length || data?.length || 0, 'records');
    
    // Process data for faster rendering - backend returns { success: true, data: [...] }
    let results: Payment[];
    if (data && data.success && Array.isArray(data.data)) {
      results = data.data;
    } else if (Array.isArray(data)) {
      results = data;
    } else if (data && data.payments && Array.isArray(data.payments)) {
      results = data.payments;
    } else {
      console.warn('Unexpected payments response format:', data);
      results = [];
    }

    // Normalize payment status
    results = results.map(payment => ({
      ...payment,
      payment_status: normalizePaymentStatus(payment.payment_status as string)
    }));
    
    // Update cache with new data
    paymentsCache.set(cacheKey, { data: results, timestamp: now });
    
    return results;
  } catch (error) {
    console.error('Error fetching payments:', error);
    throw error;
  }
}

/**
 * Get payment by ID
 * @param paymentId Payment ID
 * @returns Payment details with booking information
 */
export async function getPaymentById(paymentId: number): Promise<Payment> {
  try {
    // Use backend API instead of webhook
    const headers = await getAuthHeaders();
    const response = await fetch(`${PAYMENT_API.GET_BY_ID}/${paymentId}`, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to fetch payment. Status: ${response.status}`);
    }

    const data = await response.json();
    // Backend returns { success: true, data: {...} }
    const payment = data.data || data;
    
    // Normalize payment status
    return {
      ...payment,
      payment_status: normalizePaymentStatus(payment.payment_status as string)
    };
  } catch (error) {
    console.error('Error fetching payment:', error);
    throw error;
  }
}

/**
 * Update payment status (for refunds, etc.)
 * @param paymentId Payment ID
 * @param status New payment status
 * @param refundData Optional refund information
 * @returns Updated payment response from API
 */
export async function updatePaymentStatus(
  paymentId: number,
  status: 'successful' | 'pending' | 'failed' | 'refunded',
  refundData?: {
    refund_amount?: number;
    refund_reason?: string;
    admin_notes?: string;
  }
): Promise<{
  payment_id: number;
  payment_status: string;
  refund_amount?: string;
  refund_date?: string;
  updated_at: string;
  is_valid_update: boolean;
  message: string;
}> {
  try {
    const payload = {
      payment_status: status,
      ...refundData,
    };

    // Use backend API instead of webhook
    const headers = await getAuthHeaders();
    const response = await fetch(`${PAYMENT_API.UPDATE_STATUS}/${paymentId}/status`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to update payment status. Status: ${response.status}`);
    }

    const data = await response.json();

    // Backend returns { success: true, message: string, data: {...} }
    if (data && data.data) {
      return {
        payment_id: data.data.payment_id,
        payment_status: data.data.payment_status,
        refund_amount: data.data.refund_amount,
        refund_date: data.data.refund_date,
        updated_at: data.data.updated_at,
        is_valid_update: true,
        message: data.message || 'Payment status updated successfully'
      };
    } else if (Array.isArray(data) && data.length > 0) {
      return data[0];
    } else if (!Array.isArray(data)) {
      return data;
    } else {
      throw new Error('Invalid response format from payment status update API');
    }
  } catch (error) {
    console.error('Error updating payment status:', error);
    throw error;
  }
}

/**
 * Get payment analytics for dashboard
 * @param filters Optional date and city filters
 * @returns Payment analytics data
 */
export async function getPaymentAnalytics(filters?: {
  start_date?: string;
  end_date?: string;
  city_id?: number;
}): Promise<PaymentAnalytics> {
  try {
    const queryParams = new URLSearchParams();
    if (filters?.start_date) queryParams.append('start_date', filters.start_date);
    if (filters?.end_date) queryParams.append('end_date', filters.end_date);
    if (filters?.city_id) queryParams.append('city_id', filters.city_id.toString());

    // Use backend API instead of webhook
    const url = `${PAYMENT_API.ANALYTICS}${queryParams.toString() ? '?' + queryParams.toString() : ''}`;

    const headers = await getAuthHeaders();
    const response = await fetch(url, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to fetch payment analytics. Status: ${response.status}`);
    }

    const data = await response.json();

    // Handle backend response format: { success: true, data: {...} }
    let analyticsData;
    if (data && data.success && data.data) {
      analyticsData = data.data;
    } else if (Array.isArray(data) && data.length > 0) {
      analyticsData = data[0];
    } else if (data && typeof data === 'object') {
      analyticsData = data;
    } else {
      throw new Error('Invalid analytics response format');
    }

    // Transform the response to match our interface
    return {
      summary: {
        total_revenue: parseFloat(analyticsData.summary?.total_revenue || analyticsData.total_revenue || 0),
        total_payments: parseInt(analyticsData.summary?.total_payments || analyticsData.total_payments || 0),
        successful_payments: parseInt(analyticsData.summary?.successful_payments || analyticsData.successful_payments || 0),
        pending_payments: parseInt(analyticsData.summary?.pending_payments || analyticsData.pending_payments || 0),
        failed_payments: parseInt(analyticsData.summary?.failed_payments || analyticsData.failed_payments || 0),
        refunded_payments: parseInt(analyticsData.summary?.refunded_payments || analyticsData.refunded_payments || 0),
        refund_amount: parseFloat(analyticsData.summary?.refund_amount || analyticsData.refund_amount || 0),
        average_transaction: parseFloat(analyticsData.summary?.average_transaction || analyticsData.average_transaction || 0),
      },
      monthly_data: analyticsData.monthly_data || [],
      payment_methods: analyticsData.payment_methods || [],
      city_wise: analyticsData.city_wise || [],
    };
  } catch (error) {
    console.error('Error fetching payment analytics:', error);
    throw error;
  }
}

/**
 * Export payments data using server-side API
 * @param filters Export filters including format, dates, and status
 * @returns Success message
 */
export async function exportPayments(filters: {
  format: string;
  start_date?: string;
  end_date?: string;
  status?: string;
  city_id?: number;
}): Promise<string> {
  try {
    // First fetch the payments data
    const payments = await getAllPayments({
      status: filters.status !== 'all' ? filters.status : undefined,
      start_date: filters.start_date,
      end_date: filters.end_date,
      city_id: filters.city_id
    });

    if (!payments || payments.length === 0) {
      throw new Error('No payment data found for the selected filters');
    }

    // Convert to CSV and download
    const csvContent = convertToCSV(payments);
    downloadCSV(csvContent, `payments-export-${new Date().toISOString().split('T')[0]}.csv`);
    return 'Payments exported successfully!';
  } catch (error) {
    console.error('Error exporting payments:', error);
    throw error;
  }
}

// ============ MANUAL PAYMENT RECORDING FUNCTIONS ============

/**
 * Interface for manual payment recording data
 */
export interface ManualPaymentData {
  booking_id: number;
  amount: number;
  payment_method: string;
  payment_status: 'successful' | 'pending' | 'failed';
  payment_date?: string;
  transaction_id?: string;
  admin_notes?: string;
  reference_number?: string; // For cash, cheque, bank transfer reference
}

/**
 * Create a manual payment record for admin use
 * @param paymentData Manual payment data
 * @returns Created payment record
 */
export async function createManualPayment(paymentData: ManualPaymentData): Promise<{
  success: boolean;
  payment_id?: number;
  message: string;
  error?: string;
}> {
  try {

    // Generate transaction ID if not provided
    const transactionId = paymentData.transaction_id || generateUniqueTransactionId("MANUAL");

    // Prepare payment payload for API (matching the API specification)
    const paymentPayload = {
      booking_id: paymentData.booking_id,
      transaction_id: transactionId,
      phonepe_transaction_id: `MANUAL_${paymentData.booking_id}_${Date.now()}`, // Generate unique PhonePe-style ID for manual payments
      amount: paymentData.amount,
      payment_method: paymentData.payment_method,
      payment_status: paymentData.payment_status,
      payment_date: paymentData.payment_date || new Date().toISOString(),
      gateway_response: {
        code: "MANUAL_PAYMENT",
        merchantId: "NIBOGONLINE",
        transactionId: transactionId,
        amount: Math.round(paymentData.amount * 100), // Convert to paise
        state: paymentData.payment_status.toUpperCase(),
        method: paymentData.payment_method,
        reference: paymentData.reference_number || transactionId,
        admin_notes: paymentData.admin_notes || `Manual payment recorded by admin - ${paymentData.payment_method}`
      }
    };

    // Use backend API instead of webhook
    const headers = await getAuthHeaders();
    const response = await fetch(PAYMENT_API.CREATE, {
      method: 'POST',
      headers,
      body: JSON.stringify(paymentPayload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Failed to create manual payment:', errorText);
      return {
        success: false,
        message: 'Failed to create manual payment record',
        error: `API returned status: ${response.status} - ${errorText}`
      };
    }

    const result = await response.json();

    // Extract payment ID from response - backend returns { success: true, data: {...} }
    const paymentId = result.data?.payment_id || result.payment_id;

    // Now update the booking payment status
    try {
      const { updateBookingPaymentStatus } = await import('./bookingService');

      await updateBookingPaymentStatus(paymentData.booking_id, paymentData.payment_status);
    } catch (bookingUpdateError) {
      console.error('⚠️ Failed to update booking payment status:', bookingUpdateError);
      // Don't fail the entire operation if booking update fails
      // The payment record was created successfully
    }

    // Send WhatsApp notification for successful payments
    if (paymentData.payment_status === 'successful') {
      try {
        await sendWhatsAppNotificationForManualPayment(paymentData.booking_id, transactionId);
      } catch (whatsappError) {
        console.error('⚠️ Failed to send WhatsApp notification for manual payment:', whatsappError);
        // Don't fail the entire operation if WhatsApp fails
      }
    }

    return {
      success: true,
      payment_id: paymentId,
      message: 'Manual payment recorded and booking status updated successfully'
    };

  } catch (error) {
    console.error('Error creating manual payment:', error);
    return {
      success: false,
      message: 'Failed to create manual payment record',
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

/**
 * Send WhatsApp notification for manual payment confirmation
 * @param bookingId Booking ID to send notification for
 * @param transactionId Transaction ID for the payment
 */
async function sendWhatsAppNotificationForManualPayment(bookingId: number, transactionId: string): Promise<void> {
  try {
    // Fetch booking details from the backend API
    const headers = await getAuthHeaders();
    const bookingResponse = await fetch(`${BOOKING_API.GET_ALL}/${bookingId}`, {
      headers,
    });

    if (!bookingResponse.ok) {
      throw new Error(`Failed to fetch booking details: ${bookingResponse.status}`);
    }

    const bookingResult = await bookingResponse.json();
    const booking = bookingResult.data || bookingResult.booking || bookingResult;

    if (!booking) {
      throw new Error('Booking not found');
    }

    // Format phone number for WhatsApp
    const formattedPhone = booking.phone?.startsWith('+') ? booking.phone : `+91${booking.phone}`;

    // Prepare game details
    const gameDetails = booking.booking_games?.map((game: any) => ({
      gameName: game.game_name || 'Game',
      gameTime: game.game_time || 'TBD',
      gamePrice: game.game_price || 0
    })) || [];

    // Prepare add-on details
    const addOnDetails = booking.booking_addons?.map((addon: any) => ({
      name: addon.addon_name || 'Add-on',
      quantity: addon.quantity || 1,
      price: addon.addon_price || 0
    })) || [];

    // Prepare WhatsApp message data with enhanced validation
    const whatsappData = {
      bookingId: booking.booking_id || booking.id,
      bookingRef: booking.booking_ref || `B${String(booking.booking_id || booking.id).padStart(7, '0')}`,
      parentName: booking.parent_name || 'Valued Customer',
      parentPhone: formattedPhone,
      childName: booking.child_name || 'Child',
      eventTitle: booking.event_title || 'NIBOG Event',
      eventDate: booking.event_date || new Date().toLocaleDateString(),
      eventVenue: booking.venue_name || 'Event Venue',
      totalAmount: booking.total_amount || 0,
      paymentMethod: 'Manual Payment',
      transactionId: transactionId,
      gameDetails: gameDetails,
      addOns: addOnDetails
    };

    // Validate required fields for WhatsApp template
    const requiredFields = ['bookingId', 'parentName', 'parentPhone', 'childName', 'eventTitle'];
    const missingFields = requiredFields.filter(field => !whatsappData[field as keyof typeof whatsappData]);

    if (missingFields.length > 0) {
      throw new Error(`Missing required WhatsApp fields: ${missingFields.join(', ')}`);
    }

    // Send WhatsApp notification via API endpoint with enhanced error handling
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const whatsappResponse = await fetch(`${baseUrl}/api/whatsapp/send-booking-confirmation`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(whatsappData),
    });

    if (!whatsappResponse.ok) {
      const errorData = await whatsappResponse.json().catch(() => ({ error: 'Unknown error' }));
      console.error(`❌ WhatsApp API request failed:`, {
        status: whatsappResponse.status,
        statusText: whatsappResponse.statusText,
        error: errorData.error,
        zaptraResponse: errorData.zaptraResponse
      });
      throw new Error(`WhatsApp API failed: ${errorData.error || whatsappResponse.status}`);
    }

    const whatsappResult = await whatsappResponse.json();

    if (!whatsappResult.success) {
      console.error(`❌ WhatsApp service failed:`, {
        error: whatsappResult.error,
        zaptraResponse: whatsappResult.zaptraResponse
      });

      // Check for specific #132000 parameter mismatch error
      if (whatsappResult.error && whatsappResult.error.includes('132000')) {
        console.error('🚨 PARAMETER MISMATCH ERROR (#132000) DETECTED!');
        console.error('📋 This error occurs when template parameter count doesn\'t match');
        console.error('📋 WhatsApp data that caused the error:', JSON.stringify(whatsappData, null, 2));
        console.error('📋 Check if WHATSAPP_USE_TEMPLATES=true and template structure is correct');
      }

      throw new Error(`WhatsApp service failed: ${whatsappResult.error}`);
    }

  } catch (error) {
    console.error(`❌ Error sending WhatsApp notification for manual payment:`, error);
    throw error; // Re-throw to let caller handle
  }
}

/**
 * Generate unique transaction ID for manual payments
 * @param prefix Transaction ID prefix
 * @returns Unique transaction ID
 */
function generateUniqueTransactionId(prefix: string = "MANUAL"): string {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `${prefix}_${timestamp}_${random}`;
}

/**
 * Convert payments data to CSV format
 * Handles both client-side Payment objects and server-side export API responses
 */
function convertToCSV(payments: any[]): string {
  if (payments.length === 0) {
    return 'No data to export';
  }

  // CSV headers
  const headers = [
    'Payment ID',
    'Booking ID',
    'User Name',
    'User Email',
    'User Phone',
    'Event Title',
    'Event Date',
    'City',
    'Venue',
    'Amount',
    'Payment Method',
    'Payment Status',
    'Transaction ID',
    'Payment Date',
    'Refund Amount',
    'Refund Reason'
  ];

  // Convert data to CSV rows
  const rows = payments.map(payment => {
    // Handle both server response format and client Payment objects
    const csvRow = [
      // Payment ID - server already returns formatted (P010), use as-is
      payment.payment_id || '',
      // Booking ID - server already returns formatted (B002), use as-is
      payment.booking_id || '',
      payment.user_name || '',
      payment.user_email || 'N/A',
      payment.user_phone || 'N/A',
      payment.event_title || '',
      payment.event_date ? new Date(payment.event_date).toLocaleDateString() : '',
      payment.city_name || '',
      payment.venue_name || '',
      payment.amount || 0,
      payment.payment_method || '',
      payment.payment_status || '',
      payment.transaction_id || '',
      payment.payment_date ? new Date(payment.payment_date).toLocaleDateString() : '',
      payment.refund_amount || 0,
      payment.refund_reason || ''
    ];

    return csvRow;
  });

  // Combine headers and rows
  const csvContent = [headers, ...rows]
    .map(row => row.map(field => `"${field}"`).join(','))
    .join('\n');

  return csvContent;
}

/**
 * Download CSV file
 */
function downloadCSV(csvContent: string, filename: string): void {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');

  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}
