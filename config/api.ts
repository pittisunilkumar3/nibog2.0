// API Base URL - Use environment variable or fallback to localhost
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.BACKEND_URL || "http://localhost:3004";

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

// New Venues REST API (Backend)
export const VENUES_REST_API = {
  BASE: `${process.env.BACKEND_URL}/api/venue`,
};

// Basic Event API endpoints (for events without games/slots)
export const BASIC_EVENT_API = {
  CREATE: `${API_BASE_URL}/event/create`, // POST
  GET: `${API_BASE_URL}/event/get`,       // POST with id in body
  GET_ALL: `${API_BASE_URL}/event/get-all`, // GET
  UPDATE: `${API_BASE_URL}/event/update`, // POST with full event data
  DELETE: `${API_BASE_URL}/event/delete`, // POST with id in body
};

// Event Registration API endpoints (for events with games and slots)
export const EVENT_API = {
  CREATE: `${API_BASE_URL}/event-registration/create`, // POST - This is the correct endpoint for creating events with games and slots
  // GET: `${API_BASE_URL}/event-registration/get`,   // POST with id in body
  GET: `${API_BASE_URL}/event-registration/get`,
  GET_ALL: `${API_BASE_URL}/event-registration/get-all`, // GET
  UPDATE: `${API_BASE_URL}/event-registration/update`, // POST with full event data
  DELETE: `${API_BASE_URL}/event-registration/delete`, // POST with id in body
};

// Event Game Slot API endpoints (for individual game slot management)
export const EVENT_GAME_SLOT_API = {
  CREATE: `${API_BASE_URL}/event-game-slot/create`, // POST - For creating individual game slots
  GET: `${API_BASE_URL}/event-game-slot/get`,       // POST with id in body
  GET_ALL: `${API_BASE_URL}/event-game-slot/get-all`, // GET
  UPDATE: `${API_BASE_URL}/event-game-slot/update`, // POST with full event data
  DELETE: `${API_BASE_URL}/event-game-slot/delete`, // POST with id in body
};



// Social Media API endpoints - FIXED: Using local backend
export const SOCIAL_MEDIA_API = {
  CREATE: `${API_BASE_URL}/api/social-media-settings`, // POST
  GET: `${API_BASE_URL}/api/social-media-settings`, // GET
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



// Email Settings API endpoints - FIXED: Using local backend
export const EMAIL_SETTING_API = {
  CREATE: `${API_BASE_URL}/api/email-settings`, // POST
  GET: `${API_BASE_URL}/api/email-settings`, // GET
};




// General Settings API endpoints
export const GENERAL_SETTING_API = {
  CREATE: `${API_BASE_URL}/api/general-settings`, // POST
  GET: `${API_BASE_URL}/api/general-settings`, // GET
  UPDATE: `${API_BASE_URL}/api/general-settings`, // PUT
};




// User Authentication API endpoints - FIXED: Using local backend
export const USER_AUTH_API = {
  REGISTER: `${API_BASE_URL}/api/user/register`, // POST
  LOGIN: `${API_BASE_URL}/api/user/login`, // POST
};

// User Management API endpoints - FIXED: Using local backend
export const USER_API = {
  GET_ALL: `${API_BASE_URL}/api/user`, // GET
  GET: `${API_BASE_URL}/api/user`, // GET with id
  UPDATE: `${API_BASE_URL}/api/user`, // PUT - Uses backend API: PUT /api/user/:id
  DELETE: `${API_BASE_URL}/api/user`, // POST
};

// Booking API endpoints
export const BOOKING_API = {
  CREATE: `${API_BASE_URL}/api/bookings`, // POST - NEW API structure with nested booking_games
  CREATE_OLD: `${API_BASE_URL}/bookingsevents/create`, // POST - OLD API (deprecated)
  GET_ALL: `${API_BASE_URL}/bookingsevents/get-all`, // GET
  GET_USER_BOOKINGS: `${API_BASE_URL}/user/booking`, // POST
  UPDATE: `${API_BASE_URL}/bookingsevents/update`, // POST
  UPDATE_STATUS: `${API_BASE_URL}/bookingsevents/update-status`, // POST
};

// Promo Code API endpoints - FIXED: Using local backend
export const PROMO_CODE_API = {
  CREATE: `${API_BASE_URL}/api/promo-codes`, // POST
  GET_ALL: `${API_BASE_URL}/api/promo-codes`, // GET
  GET_BY_ID: `${API_BASE_URL}/api/promo-codes`, // POST
};

// Payment API endpoints - Using Backend API
export const PAYMENT_API = {
  BASE: `${API_BASE_URL}/api/payments`,
  CREATE: `${API_BASE_URL}/api/payments`, // POST
  GET_ALL: `${API_BASE_URL}/api/payments`, // GET with query params
  GET_BY_ID: `${API_BASE_URL}/api/payments`, // GET /:id
  UPDATE_STATUS: `${API_BASE_URL}/api/payments`, // PATCH /:id/status
  ANALYTICS: `${API_BASE_URL}/api/payments/analytics`, // GET
  UPDATE: `${API_BASE_URL}/api/payments`, // PATCH /:id
  DELETE: `${API_BASE_URL}/api/payments`, // DELETE /:id
};

// Event Details with Image API endpoints
export const EVENT_DETAILS_API = {
  GET_WITH_IMAGES: `${API_BASE_URL}/api/events/list`, // GET
};

// Testimonials API endpoints
export const TESTIMONIALS_API = {
  CREATE: `${API_BASE_URL}/testimonials/create`, // POST
  GET: `${API_BASE_URL}/testimonials/get`, // POST with id in body
  GET_ALL: `${API_BASE_URL}/testimonials/get-all`, // GET
  UPDATE: `${API_BASE_URL}/testimonials/update`, // POST
  DELETE: `${API_BASE_URL}/testimonials/delete`, // POST with id in body
};

// FAQ API endpoints - FIXED: Using local backend with correct paths
export const FAQ_API = {
  CREATE: `${API_BASE_URL}/api/faq/faqs`, // POST
  GET_SINGLE: `${API_BASE_URL}/api/faq/faqs`, // GET with id in path
  GET_ALL: `${API_BASE_URL}/api/faq/faqs`, // GET
  UPDATE: `${API_BASE_URL}/api/faq/faqs`, // PUT with id in path
  DELETE: `${API_BASE_URL}/api/faq/faqs`, // DELETE with id in path
};

// PhonePe API endpoints are now in config/phonepe.ts
