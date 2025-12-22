// Promo Code service for handling promo code API calls

import { apiUrl } from './apiClient';

export interface PromoCodeEvent {
  id: number;
  games_id: number[];
}

export interface CreatePromoCodeRequest {
  promo_code: string;
  type: "percentage" | "fixed";
  value: number;
  valid_from: string;
  valid_to: string;
  usage_limit: number;
  minimum_purchase_amount: number;
  maximum_discount_amount?: number;
  description?: string;
  events: PromoCodeEvent[];
  scope: "all" | "events" | "games";
  is_active: boolean;
}

export interface CreatePromoCodeResponse {
  success: boolean;
  message: string;
  data?: any;
  error?: string;
}

export interface UpdatePromoCodeRequest {
  id: number;
  promo_code: string;
  type: "percentage" | "fixed";
  value: number;
  valid_from: string;
  valid_to: string;
  usage_limit: number;
  usage_count?: number;
  minimum_purchase_amount: number;
  maximum_discount_amount?: number;
}



export interface UpdatePromoCodeResponse {
  success: boolean;
  message: string;
  data?: any;
  error?: string;
}

export interface DeletePromoCodeResponse {
  success: boolean;
  message: string;
  data?: any;
  error?: string;
}

export interface PromoCodeDetail {
  id: number;
  promo_code: string;
  type: "percentage" | "fixed";
  value: number;
  valid_from: string;
  valid_to: string;
  usage_limit: number;
  usage_count: number;
  minimum_purchase_amount: number;
  maximum_discount_amount?: number;
  description?: string;
  is_active?: boolean;
  created_at: string;
  updated_at: string;
  promo_data?: {
    events: Array<{
      games: Array<{
        id: number;
        max_age: number;
        min_age: number;
        game_name: string;
        is_active: boolean;
        categories: string[];
        duration_minutes: number;
      }>;
      event_details: {
        id: number;
        title: string;
        status: string;
        city_id: number;
        venue_id: number;
        event_date: string;
      };
    }>;
    promo_details: {
      id: number;
      promo_code: string;
      type: string;
      value: number;
      valid_from: string;
      valid_to: string;
      usage_limit: number;
      usage_count: number;
      minimum_purchase_amount: number;
      maximum_discount_amount?: number;
      description?: string;
      is_active?: boolean;
      created_at?: string;
      updated_at?: string;
    };
  };
}

/**
 * Create a new promo code
 * @param promoCodeData The promo code data to create
 * @returns Promise with the creation response
 */
export async function createPromoCode(promoCodeData: CreatePromoCodeRequest): Promise<CreatePromoCodeResponse> {

  try {
    // Use our internal API route to avoid CORS issues
    const response = await fetch('/api/promo-codes/create', {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(promoCodeData),
    });

    let data;
    try {
      data = await response.json();
    } catch (parseError) {
      console.error("Failed to parse response as JSON:", parseError);
      throw new Error(`Invalid response from server. Status: ${response.status}`);
    }

    // Check if the response indicates success
    if (response.ok || data.success) {
      return data;
    }

    // If we get here, there was an error
    const errorMessage = data.error || data.message || `API returned error status: ${response.status}`;
    throw new Error(errorMessage);
  } catch (error: any) {
    console.error("Error creating promo code:", error);
    throw error;
  }
}

/**
 * Transform form data to API format
 * @param formData Form data from the UI
 * @param selectedEvents Selected event IDs
 * @param selectedGames Selected game IDs in format "eventId-gameId"
 * @param applyToAll Whether to apply to all events
 * @returns Transformed data for API
 */
export function transformFormDataToAPI(
  formData: {
    code: string;
    discount: string;
    discountType: string;
    maxDiscount: string;
    minPurchase: string;
    validFrom: string;
    validTo: string;
    usageLimit: string;
    description: string;
    status?: string;
  },
  selectedEvents: string[],
  selectedGames: string[],
  applyToAll: boolean,
  allEvents: Array<{id: string, name: string, games: Array<{id: string, name: string}>}>
): CreatePromoCodeRequest {
  
  // Transform dates to ISO format
  const validFromISO = new Date(formData.validFrom + 'T00:00:00Z').toISOString();
  const validToISO = new Date(formData.validTo + 'T23:59:59Z').toISOString();

  // Prepare events array
  let events: PromoCodeEvent[] = [];
  
  // Determine the scope based on selections
  let scope: "all" | "events" | "games" = "all";

  if (applyToAll) {
    // If apply to all, include all events with all their games
    events = allEvents.map(event => ({
      id: parseInt(event.id),
      games_id: event.games.map(game => parseInt(game.id))
    }));
    scope = "all";
  } else {
    // If specific events selected, map them with their selected games
    events = selectedEvents.map(eventId => {
      const event = allEvents.find(e => e.id === eventId);
      if (!event) return { id: parseInt(eventId), games_id: [] };

      // Get games for this event from selectedGames
      const eventGameIds = selectedGames
        .filter(gameId => gameId.startsWith(`${eventId}-`))
        .map(gameId => {
          const parts = gameId.split('-');
          // The second part should be the actual game_id from the API
          return parseInt(parts[1]);
        });

      // If no specific games are selected for this event, include all games from the event
      if (eventGameIds.length === 0) {
        return {
          id: parseInt(eventId),
          games_id: event.games.map(game => parseInt(game.id))
        };
      }

      return {
        id: parseInt(eventId),
        games_id: eventGameIds
      };
    });
    
    // Check if any specific games are selected across all events
    const hasSpecificGamesSelected = selectedEvents.some(eventId => {
      return selectedGames.some(gameId => gameId.startsWith(`${eventId}-`));
    });
    
    scope = hasSpecificGamesSelected ? "games" : "events";
  }

  const apiData: CreatePromoCodeRequest = {
    promo_code: formData.code,
    type: formData.discountType as "percentage" | "fixed",
    value: parseFloat(formData.discount),
    valid_from: validFromISO,
    valid_to: validToISO,
    usage_limit: parseInt(formData.usageLimit),
    minimum_purchase_amount: parseFloat(formData.minPurchase),
    maximum_discount_amount: formData.maxDiscount ? parseFloat(formData.maxDiscount) : undefined,
    description: formData.description || "",
    events: events,
    scope: scope,
    is_active: formData.status ? formData.status === "active" : true
  };


  return apiData; 
}

/**
 * Transform form data to update API format
 * @param formData Form data from the UI
 * @param selectedEvents Selected event IDs
 * @param selectedGames Selected game IDs in format "eventId-gameId"
 * @param applyToAll Whether to apply to all events
 * @param allEvents All available events
 * @returns Transformed data for update API
 */
export function transformFormDataToUpdateAPI(
  formData: {
    code: string;
    discount: string;
    discountType: string;
    maxDiscount: string;
    minPurchase: string;
    validFrom: string;
    validTo: string;
    usageLimit: string;
    description: string;
    status?: string;
  },
  selectedEvents: string[],
  selectedGames: string[],
  applyToAll: boolean,
  allEvents: Array<{id: string, name: string, games: Array<{id: string, name: string}>}>,
  usageCount: number = 0
): Omit<UpdatePromoCodeRequest, 'id'> {

  // Transform dates to YYYY-MM-DD format (not ISO for update API)
  const validFrom = formData.validFrom;
  const validTo = formData.validTo;

  // Prepare applicable_events and applicable_games arrays
  let applicableEvents: number[] = [];
  let applicableGames: number[] = [];

  if (applyToAll) {
    // If apply to all, include all event IDs
    applicableEvents = allEvents.map(event => parseInt(event.id));
    // Include all game IDs
    applicableGames = allEvents.flatMap(event =>
      event.games.map(game => parseInt(game.id))
    );
  } else {
    // If specific events selected, use those
    applicableEvents = selectedEvents.map(eventId => parseInt(eventId));

    // Get games for selected events from selectedGames
    applicableGames = selectedGames.map(gameId => {
      const parts = gameId.split('-');
      // The second part should be the actual game_id from the API
      return parseInt(parts[1]);
    }).filter(gameId => !isNaN(gameId));
  }

  // Determine the scope based on selection
  let scope: "all" | "events" | "games" = "all";
  if (!applyToAll) {
    scope = selectedGames.length > 0 ? "games" : "events";
  }

  // Create events array in the format expected by the API
  const events: Array<{ id: number; games_id: number[] }> = [];
  
  if (applyToAll) {
    // If apply to all, include all events with their games
    allEvents.forEach(event => {
      events.push({
        id: parseInt(event.id),
        games_id: event.games.map(game => parseInt(game.id))
      });
    });
  } else {
    // If specific events selected, create events array with selected events and their games
    selectedEvents.forEach(eventId => {
      const event = allEvents.find(e => e.id === eventId);
      if (event) {
        // Get games for this event from selectedGames
        const eventGames = selectedGames
          .filter(gameId => gameId.startsWith(`${eventId}-`))
          .map(gameId => {
            const parts = gameId.split('-');
            return parseInt(parts[1]);
          });
        
        // If no specific games selected for this event, include all games
        const gamesForEvent = eventGames.length > 0 
          ? eventGames 
          : event.games.map(game => parseInt(game.id));
        
        events.push({
          id: parseInt(eventId),
          games_id: gamesForEvent
        });
      }
    });
  }

  const updateData: Omit<UpdatePromoCodeRequest, 'id'> = {
    promo_code: formData.code,
    type: formData.discountType as "percentage" | "fixed",
    value: parseFloat(formData.discount),
    valid_from: validFrom,
    valid_to: validTo,
    usage_limit: parseInt(formData.usageLimit),
    usage_count: usageCount,
    minimum_purchase_amount: parseFloat(formData.minPurchase),
    maximum_discount_amount: formData.maxDiscount ? parseFloat(formData.maxDiscount) : undefined
  };


  return updateData;
}

/**
 * Get promo code by ID
 * @param id Promo code ID
 * @returns Promo code details
 */
export async function getPromoCodeById(id: number): Promise<PromoCodeDetail> {

  try {
    // Use our internal API route to avoid CORS issues
    const response = await fetch('/api/promo-codes/get', {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Error response: ${errorText}`);
      throw new Error(`API returned error status: ${response.status}`);
    }

    const data = await response.json();

    // The API returns an array with a single promo code, so we need to extract it
    if (Array.isArray(data) && data.length > 0) {
      return data[0];
    } else if (!Array.isArray(data)) {
      return data;
    }

    throw new Error("Promo code not found");
  } catch (error) {
    console.error("Error fetching promo code:", error);
    throw error;
  }
}

/**
 * Update promo code
 * @param promoCodeData Promo code data to update
 * @returns Update response
 */
export async function updatePromoCode(promoCodeData: UpdatePromoCodeRequest): Promise<UpdatePromoCodeResponse> {

  try {
    // Use our internal API route to avoid CORS issues
    const response = await fetch('/api/promo-codes/update', {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(promoCodeData),
    });

    let data;
    try {
      data = await response.json();
    } catch (parseError) {
      console.error("Failed to parse response as JSON:", parseError);
      throw new Error(`Invalid response from server. Status: ${response.status}`);
    }

    // Check if the response indicates success
    if (response.ok || data.success) {
      return data;
    }

    throw new Error(data.error || `Update failed with status: ${response.status}`);
  } catch (error) {
    console.error("Error updating promo code:", error);
    throw error;
  }
}

/**
 * Transform API data to form format for editing
 * @param apiData Promo code data from API
 * @returns Form data for editing
 */
export function transformAPIDataToForm(apiData: PromoCodeDetail) {
  // Format dates to YYYY-MM-DD format for date inputs
  const formatDateForInput = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toISOString().split('T')[0];
    } catch (error) {
      console.error("Error formatting date:", error);
      return dateString;
    }
  };

  // Extract events and games from promo_data if available
  let selectedEvents: string[] = [];
  let selectedGames: string[] = [];
  let applyToAll = false;
  
  // Get the promo details - either from the nested structure or from the top level
  const promoDetails = apiData.promo_data?.promo_details || apiData;

  if (apiData.promo_data?.events) {
    
    // Safely map event IDs with null checks - extract from event_details.id
    selectedEvents = apiData.promo_data.events
      .filter(event => event && event.event_details && event.event_details.id !== undefined)
      .map(event => event.event_details.id.toString());

    // Extract games in the format "eventId-gameId" with null checks
    apiData.promo_data.events.forEach(event => {
      if (event && event.event_details && event.event_details.id !== undefined && Array.isArray(event.games)) {
        const eventId = event.event_details.id;

        event.games.forEach(game => {
          if (game && game.id !== undefined) {
            selectedGames.push(`${eventId}-${game.id}`);
          }
        });
      }
    });
  }

  // If no specific events are selected, assume apply to all
  if (selectedEvents.length === 0) {
    applyToAll = true;
  }

  // Determine status from is_active field
  const status = promoDetails.is_active !== undefined ? (promoDetails.is_active ? "active" : "inactive") : "active";
  
  return {
    formData: {
      code: promoDetails.promo_code || '',
      discount: promoDetails.value !== undefined && promoDetails.value !== null ? promoDetails.value.toString() : '0',
      discountType: promoDetails.type || 'percentage',
      maxDiscount: promoDetails.maximum_discount_amount !== undefined && promoDetails.maximum_discount_amount !== null ? promoDetails.maximum_discount_amount.toString() : "",
      minPurchase: promoDetails.minimum_purchase_amount !== undefined && promoDetails.minimum_purchase_amount !== null ? promoDetails.minimum_purchase_amount.toString() : '0',
      validFrom: promoDetails.valid_from ? formatDateForInput(promoDetails.valid_from) : '',
      validTo: promoDetails.valid_to ? formatDateForInput(promoDetails.valid_to) : '',
      usageLimit: promoDetails.usage_limit !== undefined && promoDetails.usage_limit !== null ? promoDetails.usage_limit.toString() : '0',
      description: promoDetails.description || "",
      status: status
    },
    selectedEvents,
    selectedGames,
    applyToAll,
    usageCount: promoDetails.usage_count || 0
  };
}

/**
 * Delete promo code by ID
 * @param id Promo code ID
 * @returns Delete response
 */
export async function deletePromoCode(id: number): Promise<DeletePromoCodeResponse> {

  try {
    // Use our internal API route to avoid CORS issues
    const response = await fetch('/api/promo-codes/delete', {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id }),
    });

    let data;
    try {
      data = await response.json();
    } catch (parseError) {
      console.error("Failed to parse response as JSON:", parseError);
      throw new Error(`Invalid response from server. Status: ${response.status}`);
    }

    // Check if the response indicates success
    if (response.ok || data.success) {
      return data;
    }

    throw new Error(data.error || `Delete failed with status: ${response.status}`);
  } catch (error) {
    console.error("Error deleting promo code:", error);
    throw error;
  }
}

/**
 * Get promo codes by event ID and game IDs for booking creation
 * @param eventId Event ID
 * @param gameIds Array of game IDs
 * @returns Array of promo codes
 */
export async function getPromoCodesByEventAndGames(eventId: number, gameIds: number[]): Promise<PromoCodeDetail[]> {
  try {
    const response = await fetch('/api/promo-codes/get-by-event-games', {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        event_id: eventId,
        game_ids: gameIds
      }),
    });

    if (!response.ok) {
      throw new Error(`API returned error status: ${response.status}`);
    }

    const data = await response.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    throw error;
  }
}

/**
 * Get all active promo codes for booking creation
 * @returns Array of active promo codes
 */
export async function getAllActivePromoCodes(): Promise<PromoCodeDetail[]> {

  try {
    const response = await fetch(apiUrl('/api/promo-codes/get-all'), {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Error response: ${errorText}`);
      throw new Error(`API returned error status: ${response.status}`);
    }

    const data = await response.json();
    // Filter only active promo codes
    const activePromoCodes = Array.isArray(data) ? data.filter((promo: any) => promo.is_active !== false) : [];
    return activePromoCodes;
  } catch (error) {
    console.error("Error fetching all promo codes:", error);
    throw error;
  }
}

/**
 * Preview promo code validation (without incrementing usage)
 * @param promoCode Promo code string
 * @param eventId Event ID
 * @param gameIds Array of game IDs
 * @param amount Original amount
 * @returns Preview validation result
 */
export async function validatePromoCodePreview(
  promoCode: string,
  eventId: number,
  gameIds: number[],
  amount: number
): Promise<{ isValid: boolean; discountAmount: number; finalAmount: number; message: string }> {
  try {
    const response = await fetch('/api/promo-codes/validate-preview', {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        promocode: promoCode,
        eventId: eventId,
        gameIds: gameIds,
        subtotal: amount
      }),
    });

    if (!response.ok) {
      return {
        isValid: false,
        discountAmount: 0,
        finalAmount: amount,
        message: "Failed to validate promo code"
      };
    }

    const data = await response.json();
    const result = Array.isArray(data) ? data[0] : data;

    return {
      isValid: result.is_valid || false,
      discountAmount: parseFloat((parseFloat(result.discount_amount) || 0).toFixed(2)),
      finalAmount: parseFloat((parseFloat(result.final_amount) || amount).toFixed(2)),
      message: result.message || "Validation completed"
    };
  } catch (error) {
    return {
      isValid: false,
      discountAmount: 0,
      finalAmount: amount,
      message: "Failed to validate promo code"
    };
  }
}

/**
 * Final promo code validation (with usage increment)
 * @param promoCode Promo code string
 * @param eventId Event ID
 * @param gameIds Array of game IDs
 * @param amount Original amount
 * @returns Final validation result with promo details
 */
export async function validatePromoCodeFinal(
  promoCode: string,
  eventId: number,
  gameIds: number[],
  amount: number
): Promise<{
  isValid: boolean;
  discountAmount: number;
  finalAmount: number;
  message: string;
  promoCodeId?: number;
  promoCode?: string;
}> {
  try {
    const response = await fetch('/api/promo-codes/validate-final', {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        promo_code: promoCode,
        event_id: eventId,
        game_ids: gameIds,
        amount: amount
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Promo code validation failed: ${errorText}`);
    }

    const data = await response.json();
    const result = Array.isArray(data) ? data[0] : data;

    return {
      isValid: result.is_valid || false,
      discountAmount: parseFloat(result.discount_amount) || 0,
      finalAmount: parseFloat(result.final_amount) || amount,
      message: result.message || "Validation completed",
      promoCodeId: result.promo_id || result.promo_details?.id,
      promoCode: promoCode
    };
  } catch (error) {
    throw error;
  }
}

/**
 * Rollback promo code usage count
 * @param promoCodeId Promo code ID to rollback
 * @returns Rollback result
 */
export async function rollbackPromoCodeUsage(promoCodeId: number): Promise<{ success: boolean; message: string }> {
  try {
    const response = await fetch('/api/promo-codes/rollback-usage', {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        promo_code_id: promoCodeId,
        reason: "booking_failed"
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to rollback promo code usage: ${errorText}`);
    }

    const data = await response.json();
    return {
      success: data.success || false,
      message: data.message || "Rollback completed"
    };
  } catch (error) {
    throw error;
  }
}

/**
 * Validate promo code form data
 * @param formData Form data to validate
 * @returns Validation result
 */
export function validatePromoCodeForm(formData: {
  code: string;
  discount: string;
  discountType: string;
  minPurchase: string;
  validFrom: string;
  validTo: string;
  usageLimit: string;
}): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Required field validation
  if (!formData.code.trim()) errors.push("Promo code is required");
  if (!formData.discount.trim()) errors.push("Discount value is required");
  if (!formData.minPurchase.trim()) errors.push("Minimum purchase amount is required");
  if (!formData.validFrom) errors.push("Valid from date is required");
  if (!formData.validTo) errors.push("Valid to date is required");
  if (!formData.usageLimit.trim()) errors.push("Usage limit is required");

  // Numeric validation
  if (formData.discount && isNaN(parseFloat(formData.discount))) {
    errors.push("Discount value must be a valid number");
  }
  if (formData.minPurchase && isNaN(parseFloat(formData.minPurchase))) {
    errors.push("Minimum purchase amount must be a valid number");
  }
  if (formData.usageLimit && isNaN(parseInt(formData.usageLimit))) {
    errors.push("Usage limit must be a valid number");
  }

  // Date validation
  if (formData.validFrom && formData.validTo) {
    const fromDate = new Date(formData.validFrom);
    const toDate = new Date(formData.validTo);
    if (toDate <= fromDate) {
      errors.push("Valid to date must be after valid from date");
    }
  }

  // Percentage validation
  if (formData.discountType === "percentage" && formData.discount) {
    const discountValue = parseFloat(formData.discount);
    if (discountValue <= 0 || discountValue > 100) {
      errors.push("Percentage discount must be between 1 and 100");
    }
  }

  // Fixed amount validation
  if (formData.discountType === "fixed" && formData.discount) {
    const discountValue = parseFloat(formData.discount);
    if (discountValue <= 0) {
      errors.push("Fixed discount amount must be greater than 0");
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}
