// Booking registration service for handling booking API calls
import { BOOKING_API } from '../config/api';
import { validateGameData, formatGamesForAPI, createFallbackGame } from '../utils/gameIdValidation';
import { formatDateForAPI } from '../lib/utils';

export interface BookingVariant {
  variant_id: number;
  quantity: number;
}

export interface BookingAddon {
  addon_id: number;
  quantity?: number;
  variants?: BookingVariant[];
}

export interface BookingRegistrationData {
  user_id: number;
  parent: {
    parent_name: string;
    email: string;
    additional_phone: string;
  };
  child: {
    full_name: string;
    date_of_birth: string;
    school_name: string;
    gender: string;
  };
  booking: {
    event_id: number;
    payment_method: string;
    payment_status: string;
    terms_accepted: boolean;
  };
  booking_games: {
    slot_id: number;
    game_id: number;
    game_price: number;
  }[];
  booking_addons?: BookingAddon[];
  promo_code?: string;
}

export interface BookingRegistrationResponse {
  booking_game_id: number;
  booking_id: number;
  child_id: number;
  game_id: number;
  game_price: string;
  attendance_status: string;
  is_active: boolean;
  created_at: string;
}

/**
 * Register a booking
 * @param bookingData The booking data to register
 * @returns Promise with the booking registration response
 *
 * NOTE: This service supports multiple games per booking.
 * `formatBookingDataForAPI` will format multiple `booking_games` entries
 * when provided with arrays of `gameId`, `gamePrice` and optional `slotId`.
 */
export async function registerBooking(bookingData: BookingRegistrationData): Promise<any> {
  try {

    const response = await fetch('https://ai.nibog.in/webhook/v1/nibog/bookingsevents/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(bookingData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Booking registration failed:", errorData);
      throw new Error(errorData.message || 'Failed to create booking');
    }

    const responseData = await response.json();

    return responseData;
  } catch (error) {
    console.error("Error registering booking:", error);
    throw error;
  }
}

/**
 * Format booking data from the form to the API format
 * @param formData The form data
 * @returns The formatted booking data for the API
 */
export function formatBookingDataForAPI(formData: {
  userId: number;
  parentName: string;
  email: string;
  phone: string;
  childName: string;
  childDob: Date | string; // Updated to accept both Date and string
  schoolName: string;
  gender: string;
  eventId: number;
  gameId: number[] | number; // Updated to accept both array and single number
  gamePrice: number[] | number; // Updated to accept both array and single number
  slotId?: number[] | number; // Add slot IDs for proper game details lookup
  totalAmount: number;
  paymentMethod: string;
  paymentStatus: string;
  termsAccepted: boolean;
  selectedAddOns?: { addOn: any; quantity: number; variantId?: string }[];
  promoCode?: string;
}): BookingRegistrationData {
  // Format the date of birth to YYYY-MM-DD using utility function
  const dob = formatDateForAPI(formData.childDob);

  // Format booking add-ons if present
  const bookingAddons: BookingAddon[] = [];
  
  if (formData.selectedAddOns && formData.selectedAddOns.length > 0) {
    formData.selectedAddOns.forEach(item => {
      const addonId = parseInt(item.addOn.id);
      
      // Check if this addon has variants
      if (item.variantId) {
        // Look for existing addon entry in our array
        const existingAddonIndex = bookingAddons.findIndex(addon => addon.addon_id === addonId);
        
        if (existingAddonIndex >= 0) {
          // Add variant to existing addon
          if (!bookingAddons[existingAddonIndex].variants) {
            bookingAddons[existingAddonIndex].variants = [];
          }
          
          bookingAddons[existingAddonIndex].variants?.push({
            variant_id: parseInt(item.variantId),
            quantity: item.quantity
          });
        } else {
          // Create new addon with variant
          bookingAddons.push({
            addon_id: addonId,
            variants: [{
              variant_id: parseInt(item.variantId),
              quantity: item.quantity
            }]
          });
        }
      } else {
        // No variant - simple addon
        bookingAddons.push({
          addon_id: addonId,
          quantity: item.quantity
        });
      }
    });
  }

  // Create the formatted booking data
  const formattedBooking: BookingRegistrationData = {
    user_id: formData.userId,
    parent: {
      parent_name: formData.parentName,
      email: formData.email,
      additional_phone: formData.phone,
    },
    child: {
      full_name: formData.childName,
      date_of_birth: dob,
      school_name: formData.schoolName,
      gender: formData.gender,
    },
    booking: {
      event_id: formData.eventId,
      payment_method: formData.paymentMethod,
      payment_status: formData.paymentStatus,
      terms_accepted: formData.termsAccepted,
    },
    booking_games: (() => {
      // Ensure gameId is always treated as an array for consistent processing
      const gameIds = Array.isArray(formData.gameId) ? formData.gameId : [formData.gameId];
      const gamePrices = Array.isArray(formData.gamePrice) ? formData.gamePrice : [formData.gamePrice];
      const slotIds = formData.slotId ? (Array.isArray(formData.slotId) ? formData.slotId : [formData.slotId]) : undefined;

      // Use validation utility to process game data (support multiple games)
      const validationResult = validateGameData(gameIds, gamePrices, formData.totalAmount, slotIds);

      if (validationResult.isValid && validationResult.validGames.length > 0) {
        // Format all validated games for API consumption
        return formatGamesForAPI(validationResult.validGames);
      } else {
        console.error("Game validation failed for booking registration:", validationResult.errors);
        return [createFallbackGame(formData.totalAmount)];
      }
    })()
  };

  // Add optional fields if present
  if (bookingAddons.length > 0) {
    formattedBooking.booking_addons = bookingAddons;
  }
  
  if (formData.promoCode) {
    formattedBooking.promo_code = formData.promoCode;
  }

  return formattedBooking;
}
