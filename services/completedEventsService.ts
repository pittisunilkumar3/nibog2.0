export interface CompletedEventStatistics {
  total_bookings: number
  total_parents: number
  total_children: number
  total_game_bookings: number
  bookings_by_status: {
    confirmed: number
    pending: number
    cancelled: number
  }
  revenue: {
    total: number
    paid: number
    pending: number
  }
  payment_methods: Array<{
    method: string
    count: number
    amount: number
  }>
  top_games: Array<{
    game_id: number
    game_name: string
    bookings: number
    revenue: number
  }>
  age_distribution: Array<{
    age_group: string
    count: number
  }>
}

export interface Game {
  game_id: number
  game_name: string
  game_description: string
  game_image_url: string
  min_age: number
  max_age: number
}

export interface EventGameWithSlot {
  id: number
  game_id: number
  game_name: string
  game_description: string
  game_image_url: string
  custom_title: string
  custom_description: string
  custom_price: number
  start_time: string
  end_time: string
  slot_price: number
  max_participants: number
  note: string
  is_active: number
  min_age: number
  max_age: number
}

export interface CompletedEvent {
  event_id: number
  event_name: string
  event_date: string
  description: string
  image_url: string
  status: string
  venue: {
    id: number
    name: string
    address: string
    contact: string
  }
  city: {
    id: number
    name: string
    state: string
  }
  games: Game[]
  event_games_with_slots: EventGameWithSlot[]
  statistics: CompletedEventStatistics
  // Legacy fields for backward compatibility
  city_name?: string
  venue_name?: string
  registrations?: string
  attendance_count?: string
  attendance_percentage?: string
  revenue?: string
}

export const fetchCompletedEvents = async (): Promise<CompletedEvent[]> => {
  try {
    // Use the new API endpoint from backend
    const response = await fetch('/api/events/completed')
    if (!response.ok) {
      throw new Error('Failed to fetch completed events')
    }
    const result = await response.json()
    
    if (result.success && result.data) {
      // Add backward compatibility fields
      return result.data.map((event: CompletedEvent) => ({
        ...event,
        city_name: event.city.name,
        venue_name: event.venue.name,
        registrations: event.statistics.total_bookings.toString(),
        attendance_count: event.statistics.total_children.toString(),
        attendance_percentage: '100%', // Calculate if needed
        revenue: `₹${event.statistics.revenue.total.toLocaleString('en-IN')}`,
        // Ensure games array exists
        games: event.games || [],
        event_games_with_slots: event.event_games_with_slots || []
      }))
    }
    
    return []
  } catch (error) {
    console.error('Error fetching completed events:', error)
    throw error
  }
}

export const fetchCompletedEventById = async (id: string): Promise<CompletedEvent | null> => {
  try {
    const events = await fetchCompletedEvents()
    return events.find(event => event.event_id.toString() === id) || null
  } catch (error) {
    console.error('Error fetching event by ID:', error)
    throw error
  }
}