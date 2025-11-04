import { API_BASE_URL } from "@/config/api"

async function getEventParticipants(eventId: string) {
  try {
    const response = await fetch(`${API_BASE_URL}/events/participants`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ event_id: parseInt(eventId) }),
      cache: 'no-store',
    })

    if (!response.ok) {
      throw new Error('Failed to fetch participants')
    }

    const data = await response.json()
    return data[0] // API returns an array with one item
  } catch (error) {
    console.error('Error fetching participants:', error)
    throw error
  }
}

export default async function ParticipantsPage({ params }: { params: { id: string } }) {
  try {
    const eventData = await getEventParticipants(params.id)
    
    // Return a simple div as a boundary to prevent hydration errors
    return (
      <div id="participants-data" data-event-data={JSON.stringify(eventData)} />
    )
  } catch (error) {
    return (
      <div id="participants-error" data-error="true" />
    )
  }
}
