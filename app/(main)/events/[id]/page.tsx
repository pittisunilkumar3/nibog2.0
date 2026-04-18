import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar, Clock, MapPin, Users, Info, Star, Heart, Share2 } from "lucide-react"
import BookingForm from "@/components/booking-form"
import { Button } from "@/components/ui/button"
import { formatPrice, formatDate } from "@/lib/utils"
import EventDetailClient from "./client-page"

// Force dynamic rendering - always fetch fresh data
export const dynamic = 'force-dynamic'
export const revalidate = 0

type Props = {
  params: { id: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3004'
    const response = await fetch(`${BACKEND_URL}/api/events/${params.id}/details`, {
      cache: 'no-store'
    })
    
    if (!response.ok) {
      return { title: "Event Not Found | NIBOG" }
    }
    
    const event = await response.json()
    
    return {
      title: `${event.title || event.event_title || 'Event'} | NIBOG`,
      description: event.description || event.event_description || 'NIBOG Baby Games Event',
    }
  } catch {
    return { title: "Event | NIBOG" }
  }
}

async function getEventDetails(id: string) {
  try {
    const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3004'
    const response = await fetch(`${BACKEND_URL}/api/events/${id}/details`, {
      cache: 'no-store'
    })
    
    if (!response.ok) {
      return null
    }
    
    return await response.json()
  } catch (error) {
    console.error('Error fetching event details:', error)
    return null
  }
}

export default async function EventPage({ params }: Props) {
  const event = await getEventDetails(params.id)

  if (!event) {
    notFound()
  }

  // Normalize event data from API response
  const eventData = {
    id: event.event_id || event.id || params.id,
    title: event.event_title || event.title || 'Baby Games Event',
    description: event.event_description || event.description || 'Join us for an exciting baby games event!',
    minAgeMonths: 6, // Will be computed from games below
    maxAgeMonths: 84, // Will be computed from games below
    date: event.event_date || event.date || new Date().toISOString(),
    time: null, // Will be computed below from event-level or slot-level times
    venue: event.venue_name || event.venue?.venue_name || 'Venue to be announced',
    address: event.venue_address || event.venue?.address || '',
    city: event.city_name || event.city?.city_name || 'City',
    price: 1800, // Default price
    image: event.image_url || '/images/baby-crawling.jpg',
    gallery: [],
    spotsLeft: 100,
    maxParticipants: 100,
    facilitator: "NIBOG Team",
    whatToBring: "Comfortable clothes, water bottle, and a smile!",
    benefits: [
      "Physical development and coordination",
      "Social interaction with other children",
      "Building confidence and self-esteem",
      "Creating memorable experiences",
    ],
    reviews: [],
    faqs: [
      {
        question: "Do parents need to stay with their children during the event?",
        answer: "Yes, parents must stay with their children throughout the event. This is not a drop-off program.",
      },
      {
        question: "What should my child wear?",
        answer: "Comfortable clothes that allow free movement. Sports shoes are recommended.",
      },
      {
        question: "Is food provided?",
        answer: "No, food is not provided. You may bring snacks and water for your child.",
      },
    ],
    games: event.games || event.games_with_slots || [],
  }

  // Calculate age range from ACTIVE games only (is_active === 1)
  if (eventData.games && eventData.games.length > 0) {
    const activeGames = eventData.games.filter((g: any) => g.is_active === 1);
    const gamesToUse = activeGames.length > 0 ? activeGames : eventData.games;
    const minAges = gamesToUse.map((g: any) => g.min_age).filter((a: any) => a != null && a > 0)
    const maxAges = gamesToUse.map((g: any) => g.max_age).filter((a: any) => a != null && a > 0)
    if (minAges.length > 0) eventData.minAgeMonths = Math.min(...minAges)
    if (maxAges.length > 0) eventData.maxAgeMonths = Math.max(...maxAges)
  }
  
  // Only use event-level time, do NOT fall back to slot times
  const formatTime = (t: string) => {
    const [hours, minutes] = t.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };
  if (event.start_time && event.end_time) {
    eventData.time = `${formatTime(event.start_time)} - ${formatTime(event.end_time)}`;
  }
  // If no event-level time, eventData.time stays null — UI shows "Time will be updated soon"
  
  console.log(`[EventDetail] Event ${eventData.id}: minAge=${eventData.minAgeMonths}, maxAge=${eventData.maxAgeMonths}, games=${eventData.games.length}`);

  return (
    <div className="container py-8">
      <div className="mb-6">
        <Link href="/events" className="text-sm text-muted-foreground hover:text-foreground">
          ← Back to Events
        </Link>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="space-y-8">
            <div className="relative overflow-hidden rounded-lg">
              <Image
                src={eventData.image || "/images/baby-crawling.jpg"}
                alt={eventData.title}
                width={800}
                height={400}
                className="w-full object-cover"
              />
              <div className="absolute right-3 top-3 flex gap-2">
                <Badge className="bg-yellow-500 hover:bg-yellow-600">Baby Olympics</Badge>
              </div>
              <div className="absolute right-3 bottom-3 flex gap-2">
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full bg-background/80">
                  <Heart className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full bg-background/80">
                  <Share2 className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">{eventData.title}</h1>
                <Badge variant="outline" className="text-sm">
                  Age: {eventData.minAgeMonths}-{eventData.maxAgeMonths} months
                </Badge>
              </div>
              <p className="mt-2 text-muted-foreground">{eventData.description}</p>
            </div>

            <div className="grid gap-4 rounded-lg border p-4 sm:grid-cols-2 md:grid-cols-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Date</p>
                  <p className="text-sm text-muted-foreground">{formatDate(eventData.date)}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Time</p>
                  <p className="text-sm text-muted-foreground">
                    {eventData.time ? eventData.time : <span className="italic text-amber-600">Time will be updated soon</span>}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Venue</p>
                  <p className="text-sm text-muted-foreground">
                    {eventData.venue}, {eventData.city}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Capacity</p>
                  <p className="text-sm text-muted-foreground">
                    {eventData.spotsLeft} spots left out of {eventData.maxParticipants}
                  </p>
                </div>
              </div>
            </div>

            <Tabs defaultValue="details">
              <TabsList className="w-full justify-start">
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="games">Games</TabsTrigger>
                <TabsTrigger value="faqs">FAQs</TabsTrigger>
              </TabsList>

              <TabsContent value="details" className="space-y-6 pt-4">
                <div>
                  <h2 className="text-xl font-semibold">Event Details</h2>

                  <div className="mt-4 grid gap-6 sm:grid-cols-2">
                    <div>
                      <h3 className="font-medium">Age Range</h3>
                      <p className="text-sm text-muted-foreground">
                        {eventData.minAgeMonths}-{eventData.maxAgeMonths} months
                      </p>
                    </div>

                    <div>
                      <h3 className="font-medium">Venue</h3>
                      <p className="text-sm text-muted-foreground">{eventData.venue}</p>
                    </div>

                    <div>
                      <h3 className="font-medium">What to Bring</h3>
                      <p className="text-sm text-muted-foreground">{eventData.whatToBring}</p>
                    </div>

                    <div>
                      <h3 className="font-medium">Starting Price</h3>
                      <p className="text-sm text-muted-foreground">From {formatPrice(eventData.price)}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h2 className="text-xl font-semibold">Benefits</h2>
                  <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-muted-foreground">
                    {eventData.benefits.map((benefit, index) => (
                      <li key={index}>{benefit}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h2 className="text-xl font-semibold">Location</h2>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {eventData.address}, {eventData.city}
                  </p>
                  <div className="mt-2 h-[200px] overflow-hidden rounded-md bg-muted">
                    <div className="flex h-full items-center justify-center">
                      <MapPin className="h-8 w-8 text-muted-foreground" />
                      <span className="ml-2 text-muted-foreground">Map view</span>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="games" className="pt-4">
                <h2 className="text-xl font-semibold">Available Games</h2>
                {eventData.games && eventData.games.length > 0 ? (
                  <div className="mt-4 space-y-4">
                    {eventData.games.map((game: any, index: number) => (
                      <div key={index} className="rounded-lg border p-4">
                        <div className="flex items-start gap-4">
                          {game.game_image && (
                            <div className="relative h-20 w-20 overflow-hidden rounded-md flex-shrink-0">
                              <Image
                                src={game.game_image.startsWith('./upload/') 
                                  ? `/api/serve-image/${game.game_image.replace('./', '')}`
                                  : game.game_image || '/images/baby-crawling.jpg'}
                                alt={game.custom_title || game.game_name || 'Game'}
                                fill
                                className="object-cover"
                              />
                            </div>
                          )}
                          <div className="flex-1">
                            <h3 className="font-medium">{game.custom_title || game.game_name || 'Game'}</h3>
                            <p className="mt-1 text-sm text-muted-foreground">
                              {game.custom_description || game.game_description || 'Fun activity for kids'}
                            </p>
                            <div className="mt-2 flex flex-wrap gap-2">
                              <Badge variant="outline" className="text-xs">
                                Age: {game.min_age ?? '-'}/{game.max_age ?? '-'} months
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                {formatPrice(game.price || game.slot_price || 1800)}
                              </Badge>
                              {game.start_time && game.end_time && (
                                <Badge variant="outline" className="text-xs">
                                  {game.start_time} - {game.end_time}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="mt-4 text-center text-muted-foreground">
                    Games will be available for selection during registration.
                  </p>
                )}
              </TabsContent>

              <TabsContent value="faqs" className="pt-4">
                <h2 className="text-xl font-semibold">Frequently Asked Questions</h2>

                {eventData.faqs && eventData.faqs.length > 0 ? (
                  <div className="mt-4 space-y-4">
                    {eventData.faqs.map((faq, index) => (
                      <div key={index} className="rounded-lg border p-4">
                        <h3 className="font-medium">{faq.question}</h3>
                        <p className="mt-1 text-sm text-muted-foreground">{faq.answer}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="mt-4 text-center text-muted-foreground">No FAQs available.</p>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>

        <div>
          <div className="sticky top-20 rounded-lg border bg-card p-6 shadow-sm">
            <h2 className="text-xl font-semibold">Register for Event</h2>
            <div className="mt-4 space-y-4">
              <div className="flex items-center justify-between">
                <span>Starting from</span>
                <span className="font-medium">{formatPrice(eventData.price)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Available spots</span>
                <span className="font-medium">{eventData.spotsLeft}</span>
              </div>
              <Separator />

              <div className="rounded-md bg-muted/50 p-3">
                <div className="flex items-start gap-2">
                  <Info className="mt-0.5 h-4 w-4 text-muted-foreground" />
                  <div className="text-xs text-muted-foreground">
                    <p className="font-medium">Important Information</p>
                    <p className="mt-1">
                      Please arrive 15 minutes before the event starts. Parents must stay with their children throughout
                      the event.
                    </p>
                  </div>
                </div>
              </div>

              <BookingForm
                eventId={eventData.id.toString()}
                price={eventData.price}
                spotsLeft={eventData.spotsLeft}
                minAgeMonths={eventData.minAgeMonths}
                maxAgeMonths={eventData.maxAgeMonths}
                eventDate={eventData.date}
                eventCity={eventData.city}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
