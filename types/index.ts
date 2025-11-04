export type City = {
  id: string
  name: string
  state: string
  isActive: boolean
}

export type Venue = {
  id: string
  cityId: string
  name: string
  address: string
  latitude?: number
  longitude?: number
  capacity?: number
  photos: string[]
  facilities?: string
  isActive: boolean
}

export type GameTemplate = {
  id: string
  name: string
  description: string
  minAgeMonths: number
  maxAgeMonths: number
  durationMinutes: number
  basePriceSuggestion?: number
  categoryTags: string[]
  mediaUrls: string[]
  isActive: boolean
}

export type EventSchedule = {
  id: string
  gameTemplateId: string
  gameTemplate: GameTemplate
  venueId: string
  venue: Venue
  eventDate: string
  status: "draft" | "scheduled" | "paused" | "cancelled" | "completed"
  createdAt: string
  updatedAt: string
  slots: EventSlot[]
}

export type EventSlot = {
  id: string
  scheduleId: string
  startTime: string
  endTime: string
  price: number
  maxParticipants: number
  currentParticipants: number
  isActive: boolean
  status: "active" | "paused" | "cancelled" | "completed" | "full"
  createdAt: string
  updatedAt: string
}

export type Child = {
  id: string
  userId: string
  name: string
  dob: string
  notes?: string
  createdAt: string
  updatedAt: string
}

export type User = {
  id: string
  name: string
  email: string
  phone?: string
  defaultCityId?: string
  roles: string[]
  emailVerified: boolean
  phoneVerified: boolean
  createdAt: string
  updatedAt: string
  children?: Child[]
}

export type Booking = {
  id: string
  userId: string
  user: User
  slotId: string
  slot: EventSlot
  bookingTime: string
  status:
    | "pending_payment"
    | "confirmed"
    | "cancelled_by_user"
    | "cancelled_by_admin"
    | "attended"
    | "no_show"
    | "pending_cancellation"
    | "refund_processing"
  totalAmount: number
  paymentId?: string
  promoCodeId?: string
  createdAt: string
  updatedAt: string
  children: BookingChild[]
}

export type BookingChild = {
  id: string
  bookingId: string
  childId: string
  child: Child
  childAgeAtEvent: number
}

export type Payment = {
  id: string
  bookingId: string
  gatewayOrderId?: string
  gatewayPaymentId?: string
  gatewaySignature?: string
  amount: number
  currency: string
  status: "pending" | "success" | "failed" | "refunded"
  method?: string
  timestamp: string
}

export type Testimonial = {
  id: string
  userId: string
  user: User
  slotId?: string
  rating: number
  comment: string
  status: "pending" | "approved" | "rejected"
  submittedAt: string
}

export type PromoCode = {
  id: string
  code: string
  type: "percentage" | "fixed_amount"
  value: number
  expiryDate?: string
  maxUses?: number
  currentUses: number
  restrictions?: {
    applicableCities?: string[]
    applicableGames?: string[]
  }
  isActive: boolean
}

export type AuditLogEntry = {
  id: string
  adminUserId: string
  action: string
  targetEntityType: string
  targetEntityId: string
  timestamp: string
  details?: Record<string, any>
}

export type EventFilters = {
  city?: string
  minAge?: number
  maxAge?: number
  date?: string
  search?: string
  category?: string
  venue?: string
}

export type AddOnVariant = {
  id: string
  name: string
  price: number
  price_modifier?: number // Additional price to add to base price
  addon_id?: number // Reference to parent add-on
  attributes: Record<string, string> // e.g., { size: "M", color: "Red" }
  stockQuantity: number
  sku: string
}

export type AddOn = {
  id: string
  name: string
  description: string
  price: number
  images: string[] // Array of image URLs
  category: "meal" | "merchandise" | "service" | "other"
  isActive: boolean
  availableForEvents?: string[] // Array of event IDs this add-on is available for
  hasVariants: boolean
  variants?: AddOnVariant[]
  stockQuantity?: number // Only used if hasVariants is false
  sku?: string // Only used if hasVariants is false
  bundleDiscount?: {
    minQuantity: number
    discountPercentage: number
  }
  createdAt: string
  updatedAt: string
}

export type BookingAddOn = {
  id: string
  bookingId: string
  addOnId: string
  addOn: AddOn
  variantId?: string
  variant?: AddOnVariant
  quantity: number
  unitPrice: number
  totalPrice: number
  status: "pending" | "fulfilled" | "cancelled"
  fulfillmentDate?: string
}

export type BabyGame = {
  id?: number
  game_name: string
  description: string
  min_age: number
  max_age: number
  duration_minutes: number
  categories: string[]
  is_active: boolean
  created_at?: string
  updated_at?: string
}

// Event list item for display in UI components and SWR integration
export type EventListItem = {
  id: string
  title: string
  description: string
  minAgeMonths: number
  maxAgeMonths: number
  date: string
  time: string
  venue: string
  city: string
  price: number
  image: string
  spotsLeft: number
  totalSpots: number
  isOlympics?: boolean
  // Additional fields for enhanced event details
  venueAddress?: string
  cityState?: string
  gameNames?: string[]
  eventStatus?: string
}

// Testimonial data structure from API
export type TestimonialData = {
  testimonial_id: number
  testimonial_name: string
  city: string
  event_id: number
  rating: number
  testimonial: string
  submitted_at: string
  status: string
  image_url: string
  image_priority: number
  image_is_active: boolean
}

// Testimonial item for display in UI components
export type TestimonialListItem = {
  id: string
  name: string
  city: string
  rating: number
  testimonial: string
  image: string
  eventId: string
  submittedAt: string
}
