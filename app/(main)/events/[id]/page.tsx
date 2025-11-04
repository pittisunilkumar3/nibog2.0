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

// Mock data - in a real app, this would come from an API
const events = [
  {
    id: "1",
    title: "Baby Sensory Play",
    description:
      "Engage your baby's senses with various textures, sounds, and colors. This interactive session is designed to stimulate your baby's development through sensory exploration. Activities include tactile play, visual stimulation, and sound discovery. All materials used are baby-safe and age-appropriate.",
    minAgeMonths: 6,
    maxAgeMonths: 18,
    date: "2025-04-15",
    time: "10:00 AM - 11:30 AM",
    venue: "Little Explorers Center",
    address: "123 Play Street, Andheri West",
    city: "Mumbai",
    price: 799,
    image: "/placeholder.svg?height=400&width=600",
    gallery: [
      "/placeholder.svg?height=200&width=300",
      "/placeholder.svg?height=200&width=300",
      "/placeholder.svg?height=200&width=300",
      "/placeholder.svg?height=200&width=300",
      "/placeholder.svg?height=200&width=300",
      "/placeholder.svg?height=200&width=300",
    ],
    spotsLeft: 5,
    maxParticipants: 12,
    facilitator: "Ms. Anjali Sharma",
    whatToBring: "Comfortable clothes, extra set of clothes, diapers",
    benefits: [
      "Enhances cognitive development",
      "Improves fine motor skills",
      "Encourages curiosity and exploration",
      "Promotes parent-child bonding",
    ],
    reviews: [
      {
        id: "r1",
        name: "Priya Sharma",
        avatar: "/placeholder.svg?height=40&width=40",
        rating: 5,
        date: "2025-03-10",
        comment:
          "My 10-month-old had a blast at the sensory play event! The organizers were so attentive and the activities were perfectly suited for her age. We'll definitely be back!",
      },
      {
        id: "r2",
        name: "Vikram Singh",
        avatar: "/placeholder.svg?height=40&width=40",
        rating: 4,
        date: "2025-03-05",
        comment:
          "Great event! My baby enjoyed the different textures and sounds. The venue was clean and well-organized. Would recommend to other parents.",
      },
    ],
    faqs: [
      {
        question: "Do parents need to stay with their children during the event?",
        answer: "Yes, parents must stay with their children throughout the event. This is not a drop-off program.",
      },
      {
        question: "What should my child wear?",
        answer:
          "Comfortable clothes that you don't mind getting messy. Some activities may involve paint or other materials that could stain clothing.",
      },
      {
        question: "Is food provided?",
        answer:
          "No, food is not provided. You may bring snacks for your child if needed, but please be mindful of allergies.",
      },
    ],
    relatedEvents: ["2", "4", "5"],
  },
  {
    id: "2",
    title: "Toddler Music & Movement",
    description:
      "Fun-filled session with music, dance, and movement activities designed for toddlers. This class introduces children to rhythm, beat, and melody through interactive songs and simple dance movements. Children will use age-appropriate instruments and props to enhance their musical experience.",
    minAgeMonths: 12,
    maxAgeMonths: 36,
    date: "2025-04-16",
    time: "11:00 AM - 12:30 PM",
    venue: "Rhythm Studio",
    address: "45 Melody Lane, Connaught Place",
    city: "Delhi",
    price: 899,
    image: "/placeholder.svg?height=400&width=600",
    gallery: [
      "/placeholder.svg?height=200&width=300",
      "/placeholder.svg?height=200&width=300",
      "/placeholder.svg?height=200&width=300",
    ],
    spotsLeft: 8,
    maxParticipants: 15,
    facilitator: "Mr. Rohit Kapoor",
    whatToBring: "Comfortable clothes, water bottle",
    benefits: [
      "Develops rhythm and coordination",
      "Enhances listening skills",
      "Builds confidence through self-expression",
      "Improves social interaction",
    ],
    isOlympics: false,
    reviews: [
      {
        id: "r1",
        name: "Ananya Patel",
        avatar: "/placeholder.svg?height=40&width=40",
        rating: 4,
        date: "2025-03-12",
        comment:
          "The music and movement class was engaging and well-organized. My toddler enjoyed the interactive songs and dance activities. The venue was clean and child-friendly.",
      },
    ],
    faqs: [
      {
        question: "Do parents need to participate?",
        answer: "Yes, parents are encouraged to participate alongside their children to enhance the experience.",
      },
      {
        question: "Do we need to bring our own instruments?",
        answer: "No, all instruments and props will be provided during the session.",
      },
    ],
    relatedEvents: ["1", "3", "7"],
  },
  {
    id: "3",
    title: "Baby Olympics: Crawling Race",
    description:
      "Let your little crawler compete in a fun and safe environment. This special Baby Olympics event features a crawling race where babies can show off their mobility skills. The course is designed with soft obstacles and interesting toys to encourage movement. Every participant receives a medal and certificate.",
    minAgeMonths: 8,
    maxAgeMonths: 14,
    date: "2025-04-18",
    time: "09:30 AM - 11:00 AM",
    venue: "Tiny Champions Arena",
    address: "78 Sports Complex, Koramangala",
    city: "Bangalore",
    price: 999,
    image: "/placeholder.svg?height=400&width=600",
    gallery: [
      "/placeholder.svg?height=200&width=300",
      "/placeholder.svg?height=200&width=300",
      "/placeholder.svg?height=200&width=300",
    ],
    spotsLeft: 3,
    maxParticipants: 10,
    facilitator: "Ms. Priya Nair",
    whatToBring: "Comfortable clothes, knee pads (optional), camera for photos",
    benefits: [
      "Encourages physical development",
      "Builds confidence and determination",
      "Creates memorable experiences",
      "Provides a fun social environment",
    ],
    isOlympics: true,
    reviews: [
      {
        id: "r1",
        name: "Rahul Verma",
        avatar: "/placeholder.svg?height=40&width=40",
        rating: 5,
        date: "2025-03-15",
        comment:
          "The Baby Olympics was such a fun experience for our family. Our 14-month-old participated in the crawling race and loved it. The medal ceremony was adorable!",
      },
    ],
    faqs: [
      {
        question: "What if my baby doesn't want to crawl during the event?",
        answer:
          "That's completely fine! This is a fun, no-pressure event. Babies can participate at their own comfort level.",
      },
      {
        question: "Will there be professional photography?",
        answer:
          "Yes, a professional photographer will be present to capture moments. Photos will be available for purchase after the event.",
      },
    ],
    relatedEvents: ["1", "2", "6"],
  },
]

type Props = {
  params: { id: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const event = events.find((e) => e.id === params.id)

  if (!event) {
    return {
      title: "Event Not Found | NIBOG",
    }
  }

  return {
    title: `${event.title} | NIBOG`,
    description: event.description,
  }
}

export default function EventPage({ params }: Props) {
  const event = events.find((e) => e.id === params.id)

  if (!event) {
    notFound()
  }

  const relatedEvents = event.relatedEvents ? events.filter((e) => event.relatedEvents?.includes(e.id)) : []

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
                src={event.image || "/placeholder.svg"}
                alt={event.title}
                width={800}
                height={400}
                className="w-full object-cover"
              />
              <div className="absolute right-3 top-3 flex gap-2">
                {(event as any).isOlympics && <Badge className="bg-yellow-500 hover:bg-yellow-600">Baby Olympics</Badge>}
                {(event as any).isAdventure && <Badge className="bg-green-500 hover:bg-green-600">Adventure Kids</Badge>}
                {(event as any).isToddlerTuesday && <Badge className="bg-blue-500 hover:bg-blue-600">Toddler Tuesday</Badge>}
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
                <h1 className="text-3xl font-bold">{event.title}</h1>
                <Badge variant="outline" className="text-sm">
                  Age: {event.minAgeMonths}-{event.maxAgeMonths} months
                </Badge>
              </div>
              <p className="mt-2 text-muted-foreground">{event.description}</p>
            </div>

            <div className="grid gap-4 rounded-lg border p-4 sm:grid-cols-2 md:grid-cols-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Date</p>
                  <p className="text-sm text-muted-foreground">{formatDate(event.date)}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Time</p>
                  <p className="text-sm text-muted-foreground">{event.time}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Venue</p>
                  <p className="text-sm text-muted-foreground">
                    {event.venue}, {event.city}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Capacity</p>
                  <p className="text-sm text-muted-foreground">
                    {event.spotsLeft} spots left out of {event.maxParticipants}
                  </p>
                </div>
              </div>
            </div>

            <Tabs defaultValue="details">
              <TabsList className="w-full justify-start">
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="gallery">Gallery</TabsTrigger>
                <TabsTrigger value="reviews">Reviews</TabsTrigger>
                <TabsTrigger value="faqs">FAQs</TabsTrigger>
              </TabsList>

              <TabsContent value="details" className="space-y-6 pt-4">
                <div>
                  <h2 className="text-xl font-semibold">Event Details</h2>

                  <div className="mt-4 grid gap-6 sm:grid-cols-2">
                    <div>
                      <h3 className="font-medium">Age Range</h3>
                      <p className="text-sm text-muted-foreground">
                        {event.minAgeMonths}-{event.maxAgeMonths} months
                      </p>
                    </div>

                    <div>
                      <h3 className="font-medium">Facilitator</h3>
                      <p className="text-sm text-muted-foreground">{event.facilitator}</p>
                    </div>

                    <div>
                      <h3 className="font-medium">What to Bring</h3>
                      <p className="text-sm text-muted-foreground">{event.whatToBring}</p>
                    </div>

                    <div>
                      <h3 className="font-medium">Price</h3>
                      <p className="text-sm text-muted-foreground">{formatPrice(event.price)} per child</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h2 className="text-xl font-semibold">Benefits</h2>
                  <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-muted-foreground">
                    {event.benefits.map((benefit, index) => (
                      <li key={index}>{benefit}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h2 className="text-xl font-semibold">Location</h2>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {event.address}, {event.city}
                  </p>
                  <div className="mt-2 h-[200px] overflow-hidden rounded-md bg-muted">
                    <div className="flex h-full items-center justify-center">
                      <MapPin className="h-8 w-8 text-muted-foreground" />
                      <span className="ml-2 text-muted-foreground">Map view</span>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="gallery" className="pt-4">
                <h2 className="text-xl font-semibold">Gallery</h2>
                <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3">
                  {event.gallery.map((image, index) => (
                    <div key={index} className="group relative aspect-square overflow-hidden rounded-md">
                      <Image
                        src={image || "/placeholder.svg"}
                        alt={`${event.title} - Image ${index + 1}`}
                        fill
                        className="object-cover transition-transform group-hover:scale-105"
                      />
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="reviews" className="pt-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold">Reviews</h2>
                  <div className="flex items-center gap-2">
                    <div className="flex">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${i < 4.5 ? "fill-yellow-500 text-yellow-500" : "text-muted-foreground"}`}
                        />
                      ))}
                    </div>
                    <span className="text-sm font-medium">4.5/5</span>
                    <span className="text-sm text-muted-foreground">({event.reviews?.length || 0} reviews)</span>
                  </div>
                </div>

                {event.reviews && event.reviews.length > 0 ? (
                  <div className="mt-4 space-y-4">
                    {event.reviews.map((review) => (
                      <div key={review.id} className="rounded-lg border p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="relative h-10 w-10 overflow-hidden rounded-full">
                              <Image
                                src={review.avatar || "/placeholder.svg"}
                                alt={review.name}
                                fill
                                className="object-cover"
                              />
                            </div>
                            <div>
                              <h4 className="font-medium">{review.name}</h4>
                              <p className="text-xs text-muted-foreground">{formatDate(review.date)}</p>
                            </div>
                          </div>
                          <div className="flex">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star
                                key={i}
                                className={`h-4 w-4 ${
                                  i < review.rating ? "fill-yellow-500 text-yellow-500" : "text-muted-foreground"
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                        <p className="mt-2 text-sm text-muted-foreground">{review.comment}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="mt-4 text-center text-muted-foreground">No reviews yet.</p>
                )}
              </TabsContent>

              <TabsContent value="faqs" className="pt-4">
                <h2 className="text-xl font-semibold">Frequently Asked Questions</h2>

                {event.faqs && event.faqs.length > 0 ? (
                  <div className="mt-4 space-y-4">
                    {event.faqs.map((faq, index) => (
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

            {relatedEvents.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold">Similar Events You Might Like</h2>
                <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {relatedEvents.map((relatedEvent) => (
                    <Link key={relatedEvent.id} href={`/events/${relatedEvent.id}`} className="group">
                      <div className="overflow-hidden rounded-lg border transition-all group-hover:border-primary group-hover:shadow-sm">
                        <div className="relative h-32">
                          <Image
                            src={relatedEvent.image || "/placeholder.svg"}
                            alt={relatedEvent.title}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="p-3">
                          <h3 className="font-medium group-hover:text-primary">{relatedEvent.title}</h3>
                          <div className="mt-1 flex items-center justify-between text-xs text-muted-foreground">
                            <span>{formatDate(relatedEvent.date)}</span>
                            <span>{formatPrice(relatedEvent.price)}</span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div>
          <div className="sticky top-20 rounded-lg border bg-card p-6 shadow-sm">
            <h2 className="text-xl font-semibold">Book This Event</h2>
            <div className="mt-4 space-y-4">
              <div className="flex items-center justify-between">
                <span>Price per child</span>
                <span className="font-medium">{formatPrice(event.price)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Available spots</span>
                <span className="font-medium">{event.spotsLeft}</span>
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
                eventId={event.id}
                price={event.price}
                spotsLeft={event.spotsLeft}
                minAgeMonths={event.minAgeMonths}
                maxAgeMonths={event.maxAgeMonths}
                eventDate={event.date}
                eventCity={event.city}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
