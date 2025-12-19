// API Base URL
export const API_BASE_URL = "https://ai.nibog.in/webhook/v1/nibog";

// Authentication API endpoints
export const AUTH_API = {
  SUPERADMIN: {
    LOGIN: `${API_BASE_URL}/superadmin/login`,
    VERIFY: `${API_BASE_URL}/superadmin/verify`,
    LOGOUT: `${API_BASE_URL}/superadmin/logout`,
  },
  USER: {
    LOGIN: `${API_BASE_URL}/user/login`,
    VERIFY: `${API_BASE_URL}/user/verify`,
    LOGOUT: `${API_BASE_URL}/user/logout`,
  },
};

// City API endpoints - Exactly as specified in the API documentation
export const CITY_API = {
  CREATE: `${API_BASE_URL}/city/create`,     // POST
  UPDATE: `${API_BASE_URL}/city/update`,     // POST
  GET: `${API_BASE_URL}/city/get`,           // GET with body (non-standard but specified in docs)
  GET_ALL: `${API_BASE_URL}/city/get-all`,   // GET
  DELETE: `${API_BASE_URL}/city/delete`,     // DELETE with body
};

// Venue API endpoints - Exactly as specified in the API documentation with correct case
export const VENUE_API = {
  CREATE: `${API_BASE_URL}/venues/create`,
  UPDATE: `${API_BASE_URL}/venues/update`,
  GET: `${API_BASE_URL}/venues/get`,
  GET_ALL: `${API_BASE_URL}/venues/get-all`,
  GET_BY_CITY: `${API_BASE_URL}/venues/get-by-city`,
  GET_ALL_WITH_CITY: `${API_BASE_URL}/venues/getall-with-city`,
  DELETE: `${API_BASE_URL}/venues/delete`,
};

// Baby Game API endpoints
export const BABY_GAME_API = {
  CREATE: `${API_BASE_URL}/babygame/create`,
  UPDATE: `${API_BASE_URL}/babygame/update`,
  GET: `${API_BASE_URL}/babygame/get`,
  GET_ALL: `${API_BASE_URL}/babygame/get-all`,
  DELETE: `${API_BASE_URL}/babygame/delete`,
};

// New Baby Games REST API (Backend)
export const BABY_GAMES_REST_API = {
  BASE: `${process.env.BACKEND_URL}/api/baby-games`,
};

// Basic Event API endpoints (for events without games/slots)
export const BASIC_EVENT_API = {
  CREATE: `${API_BASE_URL}/event/create`, // POST
  GET: `${API_BASE_URL}/event/get`,       // POST with id in body
  GET_ALL: `${API_BASE_URL}/event/get-all`, // GET
  UPDATE: `${API_BASE_URL}/event/update`, // POST with full event data
  DELETE:  `${API_BASE_URL}/event/delete`, // POST with id in body
};

// Event Registration API endpoints (for events with games and slots)
export const EVENT_API = {
  CREATE: `${API_BASE_URL}/event-registration/create`, // POST - This is the correct endpoint for creating events with games and slots
  // GET: `${API_BASE_URL}/event-registration/get`,   // POST with id in body
  GET: `${API_BASE_URL}/event-registration/get`,
  GET_ALL: `${API_BASE_URL}/event-registration/get-all`, // GET
  UPDATE: `${API_BASE_URL}/event-registration/update`, // POST with full event data
  DELETE:  `${API_BASE_URL}/event-registration/delete`, // POST with id in body
};

// Event Game Slot API endpoints (for individual game slot management)
export const EVENT_GAME_SLOT_API = {
  CREATE: `${API_BASE_URL}/event-game-slot/create`, // POST - For creating individual game slots
  GET: `${API_BASE_URL}/event-game-slot/get`,       // POST with id in body
  GET_ALL: `${API_BASE_URL}/event-game-slot/get-all`, // GET
  UPDATE: `${API_BASE_URL}/event-game-slot/update`, // POST with full event data
  DELETE:  `${API_BASE_URL}/event-game-slot/delete`, // POST with id in body
};



// Social Media API endpoints
export const SOCIAL_MEDIA_API = {
  CREATE: "https://ai.nibog.in/webhook/v1/nibog/socialmedia/create", // POST
  GET: "https://ai.nibog.in/webhook/v1/nibog/socialmedia/get", // GET
};

// Sports Importance API endpoints
export const SPORTS_IMPORTANCE_API = {
  GET: `${API_BASE_URL}/sports-importance/get`, // GET
  SAVE: `${API_BASE_URL}/sports-importance/save`, // POST
};

// Game Importance API endpoints
export const GAME_IMPORTANCE_API = {
  GET: `${API_BASE_URL}/game-importance/get`, // GET
  SAVE: `${API_BASE_URL}/game-importance/save`, // POST
};



// Email Settings API endpoints
export const EMAIL_SETTING_API = {
  CREATE: "https://ai.nibog.in/webhook/v1/nibog/emailsetting/create", // POST
  GET: "https://ai.nibog.in/webhook/v1/nibog/emailsetting/get", // GET
};




// General Settings API endpoints
export const GENERAL_SETTING_API = {
  CREATE: "https://ai.nibog.in/webhook/v1/nibog/generalsetting/create", // POST
  GET: "https://ai.nibog.in/webhook/v1/nibog/generalsetting/get", // GET
};




// User Authentication API endpoints
export const USER_AUTH_API = {
  REGISTER: "https://ai.nibog.in/webhook/v1/nibog/user/register", // POST
  LOGIN: "https://ai.nibog.in/webhook/v1/nibog/user/login", // POST
};

// User Management API endpoints
export const USER_API = {
  GET_ALL: "https://ai.nibog.in/webhook/v1/nibog/user/get-all", // GET
  GET: "https://ai.nibog.in/webhook/v1/nibog/user/get", // GET with id
  UPDATE: "https://ai.nibog.in/webhook/v1/nibog/user/edit", // POST - Using the edit endpoint as specified in the API docs
  DELETE: "https://ai.nibog.in/webhook/v1/nibog/user/delete", // POST
};

// Booking API endpoints
export const BOOKING_API = {
  CREATE: "https://ai.nibog.in/webhook/v1/nibog/bookingsevents/create", // POST
  GET_ALL: "https://ai.nibog.in/webhook/v1/nibog/bookingsevents/get-all", // GET
  GET_USER_BOOKINGS: "https://ai.nibog.in/webhook/v1/nibog/user/booking", // POST
  UPDATE: "https://ai.nibog.in/webhook/v1/nibog/bookingsevents/update", // POST
  UPDATE_STATUS: "https://ai.nibog.in/webhook/v1/nibog/bookingsevents/update-status", // POST
};

// Promo Code API endpoints
export const PROMO_CODE_API = {
  CREATE: "https://ai.nibog.in/webhook/v1/nibog/promocode/create", // POST
  GET_ALL: "https://ai.nibog.in/webhook/v1/nibog/promocode/get-all", // GET
  GET_BY_ID: "https://ai.nibog.in/webhook/v1/nibog/promocode/get", // POST
};

// Payment API endpoints
export const PAYMENT_API = {
  CREATE: "https://ai.nibog.in/webhook/v1/nibog/payments/create", // POST
  GET_ALL: "https://ai.nibog.in/webhook/v1/nibog/payments/get-all", // GET
  GET_BY_ID: "https://ai.nibog.in/webhook/v1/nibog/payments/get", // POST
  UPDATE_STATUS: "https://ai.nibog.in/webhook/v1/nibog/payments/update-status", // POST
  ANALYTICS: "https://ai.nibog.in/webhook/v1/nibog/payments/analytics", // GET
  EXPORT: "https://ai.nibog.in/webhook/v1/nibog/payments/export", // GET
};

// Event Details with Image API endpoints
export const EVENT_DETAILS_API = {
  GET_WITH_IMAGES: "https://ai.nibog.in/webhook/nibog/getting/eventdetailswithimage", // GET
};

// Testimonials API endpoints
export const TESTIMONIALS_API = {
  CREATE: `${API_BASE_URL}/testimonials/create`, // POST
  GET: `${API_BASE_URL}/testimonials/get`, // POST with id in body
  GET_ALL: `${API_BASE_URL}/testimonials/get-all`, // GET
  UPDATE: `${API_BASE_URL}/testimonials/update`, // POST
  DELETE: `${API_BASE_URL}/testimonials/delete`, // POST with id in body
};

// FAQ API endpoints
export const FAQ_API = {
  CREATE: "https://ai.nibog.in/webhook/nibog/v1/faq/create", // POST
  GET_SINGLE: "https://ai.nibog.in/webhook/nibog/v1/faq/get_single", // POST with id in body
  GET_ALL: "https://ai.nibog.in/webhook/nibog/v1/faq/getall", // GET
  UPDATE: "https://ai.nibog.in/webhook/nibog/v1/faq/updated", // POST
  DELETE: "https://ai.nibog.in/webhook/nibog/v1/faq/delete", // POST with id in body
};

// PhonePe API endpoints are now in config/phonepe.ts
