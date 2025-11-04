import Link from "next/link"
import Image from "next/image"
import type { Metadata } from "next"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar, Clock, MapPin, Volume2 as Music, Palette, Heart as Dumbbell } from "lucide-react"
import AgeSelector from "@/components/age-selector"
import CitySelector from "@/components/city-selector"
import { formatPrice } from "@/lib/utils"

export const metadata: Metadata = {
  title: "Toddler Tuesdays | NIBOG",
  description: "Special weekly events designed for toddlers aged 12-36 months",
}

// Mock data - in a real app, this would come from an API
const toddlerEvents = [
  {
    id: "2",
    title: "Toddler Music & Movement",
    description: "Fun-filled session with music, dance, and movement activities.",
    minAgeMonths: 12,
    maxAgeMonths: 36,
    date: "2025-04-16",
    time: "11:00 AM - 12:30 PM",
    venue: "Rhythm Studio",
    city: "Delhi",
    price: 899,
    image: "/placeholder.svg?height=200&width=300",
    spotsLeft: 8,
    totalSpots: 15,
    category: "Music & Dance",
  },
  {
    id: "6",
    title: "Toddler Art & Craft",
    description: "Creative art and craft activities for toddlers to explore their artistic side.",
    minAgeMonths: 18,
    maxAgeMonths: 36,
    date: "2025-04-25",
    time: "11:00 AM - 12:30 PM",
    venue: "Creative Kids Studio",
    city: "Chennai",
    price: 799,
    image: "/placeholder.svg?height=200&width=300",
    spotsLeft: 10,
    totalSpots: 10,
    category: "Art & Craft",
  },
  {
    id: "8",
    title: "Toddler Dance Party",
    description: "A fun dance party designed specifically for toddlers with age-appropriate music.",
    minAgeMonths: 15,
    maxAgeMonths: 36,
    date: "2025-04-30",
    time: "04:00 PM - 05:30 PM",
    venue: "Rhythm Studio",
    city: "Delhi",
    price: 899,
    image: "/placeholder.svg?height=200&width=300",
    spotsLeft: 15,
    totalSpots: 15,
    category: "Music & Dance",
  },
  {
    id: "14",
    title: "Toddler Yoga",
    description: "Simple yoga poses and breathing exercises for toddlers.",
    minAgeMonths: 18,
    maxAgeMonths: 36,
    date: "2025-05-07",
    time: "10:00 AM - 11:00 AM",
    venue: "Zen Baby Studio",
    city: "Mumbai",
    price: 699,
    image: "/placeholder.svg?height=200&width=300",
    spotsLeft: 8,
    totalSpots: 10,
    category: "Physical Activity",
  },
  {
    id: "15",
    title: "Toddler Storytelling",
    description: "Interactive storytelling session with props and activities.",
    minAgeMonths: 12,
    maxAgeMonths: 36,
    date: "2025-05-14",
    time: "11:00 AM - 12:00 PM",
    venue: "Book Buddies",
    city: "Bangalore",
    price: 599,
    image: "/placeholder.svg?height=200&width=300",
    spotsLeft: 12,
    totalSpots: 15,
    category: "Educational",
  },
  {
    id: "16",
    title: "Toddler Science Exploration",
    description: "Simple science experiments and sensory activities for curious toddlers.",
    minAgeMonths: 24,
    maxAgeMonths: 36,
    date: "2025-05-21",
    time: "10:30 AM - 12:00 PM",
    venue: "Little Explorers Center",
    city: "Mumbai",
    price: 899,
    image: "/placeholder.svg?height=200&width=300",
    spotsLeft: 10,
    totalSpots: 12,
    category: "Educational",
  },
]

export default function ToddlerTuesdaysPage() {
  return (
    <div className="flex flex-col gap-12 pb-8">
      {/* Hero Section */}
      <section className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-purple-600/5" />
        <div className="container relative flex flex-col items-center justify-center gap-4 py-16 text-center md:py-24 lg:py-32">
          <Badge className="bg-purple-500 px-3.5 py-1.5 text-sm font-medium">Weekly Program</Badge>
          <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl">
            Toddler <span className="text-purple-500">Tuesdays</span>
          </h1>
          <p className="max-w-[700px] text-muted-foreground md:text-xl">
            Special weekly events designed for toddlers aged 12-36 months. Join us every Tuesday for a different themed activity!
          </p>
          <div className="w-full max-w-md space-y-4 rounded-lg bg-background/80 p-4 shadow-lg backdrop-blur">
            <Tabs defaultValue="city" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="city">Find by City</TabsTrigger>
                <TabsTrigger value="age">Find by Age</TabsTrigger>
              </TabsList>
              <TabsContent value="city" className="mt-4">
                <CitySelector />
              </TabsContent>
              <TabsContent value="age" className="mt-4">
                <AgeSelector />
              </TabsContent>
            </Tabs>
            <Button className="w-full bg-purple-500 hover:bg-purple-600" size="lg">
              Find Toddler Tuesday Events
            </Button>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="container">
        <div className="grid gap-8 md:grid-cols-2 md:gap-12">
          <div className="flex flex-col justify-center space-y-4">
            <h2 className="text-2xl font-bold tracking-tight md:text-3xl">What is Toddler Tuesdays?</h2>
            <p className="text-muted-foreground">
              Toddler Tuesdays is our special weekly program designed specifically for children aged 12-36 months. Each Tuesday, we host different themed activities that encourage development, creativity, and social interaction in a fun and engaging environment.
            </p>
            <div className="space-y-2">
              <div className="flex items-start gap-2">
                <div className="rounded-full bg-purple-500/10 p-1">
                  <Music className="h-5 w-5 text-purple-500" />
                </div>
                <div>
                  <h3 className="font-medium">Music & Dance</h3>
                  <p className="text-sm text-muted-foreground">Rhythm, movement, and musical exploration</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <div className="rounded-full bg-purple-500/10 p-1">
                  <Palette className="h-5 w-5 text-purple-500" />
                </div>
                <div>
                  <h3 className="font-medium">Art & Craft</h3>
                  <p className="text-sm text-muted-foreground">Creative expression through various art mediums</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <div className="rounded-full bg-purple-500/10 p-1">
                  <Dumbbell className="h-5 w-5 text-purple-500" />
                </div>
                <div>
                  <h3 className="font-medium">Physical Activities</h3>
                  <p className="text-sm text-muted-foreground">Age-appropriate exercises and movement games</p>
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-center">
            <div className="relative h-80 w-full overflow-hidden rounded-lg">
              <Image src="/placeholder.svg?height=320&width=480" alt="Toddler Tuesdays" fill className="object-cover" />
            </div>
          </div>
        </div>
      </section>

      {/* Events Section */}
      <section className="bg-muted/50 py-12">
        <div className="container">
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-2 text-center">
              <h2 className="text-2xl font-bold tracking-tight md:text-3xl">Upcoming Toddler Tuesday Events</h2>
              <p className="mx-auto max-w-[700px] text-muted-foreground">
                Find the perfect activity for your toddler
              </p>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {toddlerEvents.map((event) => (
                <Card key={event.id} className="group overflow-hidden transition-all hover:shadow-md">
                  <div className="relative h-48">
                    <Image src={event.image || "/placeholder.svg"} alt={event.title} fill className="object-cover" />
                    <Badge className="absolute right-2 top-2 bg-purple-500 hover:bg-purple-600">Toddler Tuesdays</Badge>
                  </div>
                  <CardContent className="p-4">
                    <div className="space-y-2">
                      <h3 className="font-semibold group-hover:text-purple-500">{event.title}</h3>
                      <p className="line-clamp-2 text-sm text-muted-foreground">{event.description}</p>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        <span>{event.date}</span>
                        <Clock className="ml-2 h-3 w-3" />
                        <span>{event.time}</span>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <MapPin className="h-3 w-3" />
                        <span>
                          {event.venue}, {event.city}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <Badge variant="outline">Age: {event.minAgeMonths}-{event.maxAgeMonths} months</Badge>
                        <span className="font-medium">{formatPrice(event.price)}</span>
                      </div>
                    </div>
                  </CardContent>
                  <div className="flex items-center justify-between border-t bg-muted/50 p-4">
                    <div className="text-xs text-muted-foreground">
                      <span className={event.spotsLeft <= 3 ? "text-red-500 font-medium" : ""}>
                        {event.spotsLeft} spots left
                      </span>
                      <div className="mt-1 h-1.5 w-16 rounded-full bg-muted">
                        <div
                          className={`h-full rounded-full ${
                            event.spotsLeft <= 3 ? "bg-red-500" : "bg-purple-500"
                          }`}
                          style={{ width: `${(event.spotsLeft / event.totalSpots) * 100}%` }}
                        />
                      </div>
                    </div>
                    <Button size="sm" className="bg-purple-500 hover:bg-purple-600" asChild>
                      <Link href={`/register-event?city=${event.city}`}>Register Now</Link>
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="container">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-2 text-center">
            <h2 className="text-2xl font-bold tracking-tight md:text-3xl">Benefits for Your Toddler</h2>
            <p className="mx-auto max-w-[700px] text-muted-foreground">
              How Toddler Tuesdays helps your child's development
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardContent className="flex flex-col items-center p-6 text-center">
                <div className="mb-4 rounded-full bg-purple-500/10 p-3">
                  <svg className="h-6 w-6 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <h3 className="mb-2 font-medium">Cognitive Development</h3>
                <p className="text-sm text-muted-foreground">
                  Activities that stimulate brain development and problem-solving skills
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex flex-col items-center p-6 text-center">
                <div className="mb-4 rounded-full bg-purple-500/10 p-3">
                  <svg className="h-6 w-6 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="mb-2 font-medium">Social Skills</h3>
                <p className="text-sm text-muted-foreground">
                  Opportunities to interact with peers and develop social confidence
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex flex-col items-center p-6 text-center">
                <div className="mb-4 rounded-full bg-purple-500/10 p-3">
                  <svg className="h-6 w-6 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="mb-2 font-medium">Emotional Growth</h3>
                <p className="text-sm text-muted-foreground">
                  Activities that help toddlers understand and express their emotions
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex flex-col items-center p-6 text-center">
                <div className="mb-4 rounded-full bg-purple-500/10 p-3">
                  <svg className="h-6 w-6 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                  </svg>
                </div>
                <h3 className="mb-2 font-medium">Language Development</h3>
                <p className="text-sm text-muted-foreground">
                  Engaging activities that encourage vocabulary growth and communication
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="container">
        <div className="mx-auto max-w-3xl">
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-2 text-center">
              <h2 className="text-2xl font-bold tracking-tight md:text-3xl">Frequently Asked Questions</h2>
              <p className="text-muted-foreground">Everything you need to know about Toddler Tuesdays</p>
            </div>
            <div className="space-y-4">
              <div className="rounded-lg border p-4">
                <h3 className="font-medium">Do parents need to stay during the session?</h3>
                <p className="mt-1 text-sm text-muted-foreground">Yes, Toddler Tuesdays is not a drop-off program. Parents or caregivers must stay with their children throughout the session.</p>
              </div>
              <div className="rounded-lg border p-4">
                <h3 className="font-medium">What should my toddler wear?</h3>
                <p className="mt-1 text-sm text-muted-foreground">Comfortable clothes that allow for easy movement. For art activities, we recommend clothes that can get messy or bringing a smock.</p>
              </div>
              <div className="rounded-lg border p-4">
                <h3 className="font-medium">Can I bring siblings?</h3>
                <p className="mt-1 text-sm text-muted-foreground">Siblings within the age range (12-36 months) are welcome but require separate registration. Infants under 6 months who will be held by parents throughout the session may attend at no additional cost.</p>
              </div>
              <div className="rounded-lg border p-4">
                <h3 className="font-medium">What if we need to cancel?</h3>
                <p className="mt-1 text-sm text-muted-foreground">Cancellations made at least 24 hours before the event will receive a full refund. No refunds for cancellations within 24 hours of the event.</p>
              </div>
              <div className="rounded-lg border p-4">
                <h3 className="font-medium">Are snacks provided?</h3>
                <p className="mt-1 text-sm text-muted-foreground">No, snacks are not provided. You may bring snacks for your child if needed, but please be mindful of allergies.</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
