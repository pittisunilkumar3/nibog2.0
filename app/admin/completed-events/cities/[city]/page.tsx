"use client"

import { useState } from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { format } from "date-fns"
import { ArrowLeft, Search, MapPin, Building, Calendar, Users, BarChart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
// We'll implement animations without framer-motion

// Mock data - in a real app, this would come from an API
const completedEvents = [
  {
    id: "CE001",
    title: "Baby Crawling Championship",
    gameTemplate: "Baby Crawling",
    venue: "Gachibowli Indoor Stadium",
    city: "Hyderabad",
    date: "2025-08-15",
    registrations: 45,
    attendance: 42,
    attendanceRate: 93,
    revenue: 35955,
    status: "completed",
  },
  {
    id: "CE002",
    title: "Baby Walker Race",
    gameTemplate: "Baby Walker",
    venue: "Hitex Exhibition Center",
    city: "Hyderabad",
    date: "2025-08-10",
    registrations: 38,
    attendance: 35,
    attendanceRate: 92,
    revenue: 30362,
    status: "completed",
  },
  {
    id: "CE003",
    title: "Toddler Running Competition",
    gameTemplate: "Running Race",
    venue: "Indoor Stadium",
    city: "Chennai",
    date: "2025-08-05",
    registrations: 42,
    attendance: 37,
    attendanceRate: 88,
    revenue: 33558,
    status: "completed",
  },
  {
    id: "CE004",
    title: "Baby Swimming Event",
    gameTemplate: "Swimming",
    venue: "Aqua Sports Complex",
    city: "Mumbai",
    date: "2025-07-28",
    registrations: 30,
    attendance: 28,
    attendanceRate: 93,
    revenue: 22372,
    status: "completed",
  },
  {
    id: "CE005",
    title: "Baby Art & Craft Workshop",
    gameTemplate: "Art & Craft",
    venue: "Creative Kids Center",
    city: "Delhi",
    date: "2025-07-20",
    registrations: 35,
    attendance: 31,
    attendanceRate: 89,
    revenue: 24769,
    status: "completed",
  },
  {
    id: "CE006",
    title: "Baby Sensory Play",
    gameTemplate: "Sensory Play",
    venue: "Little Explorers Hub",
    city: "Bangalore",
    date: "2025-07-15",
    registrations: 40,
    attendance: 38,
    attendanceRate: 95,
    revenue: 30362,
    status: "completed",
  },
]

export default function CompletedEventsCityPage() {
  const router = useRouter()
  const params = useParams()
  const cityName = decodeURIComponent(params.city as string)
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("venues")

  // Filter events for this city
  const cityEvents = completedEvents.filter(event => event.city === cityName)

  // Further filter based on search query
  const filteredEvents = cityEvents.filter(event => {
    if (!searchQuery) return true

    return (
      event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.gameTemplate.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.venue.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })

  // Get unique venues for this city
  const venues = Array.from(new Set(filteredEvents.map(event => event.venue)))

  // Group events by venue
  const eventsByVenue = venues.map(venue => {
    const venueEvents = filteredEvents.filter(event => event.venue === venue)
    return {
      venue,
      events: venueEvents,
      totalEvents: venueEvents.length,
      totalRegistrations: venueEvents.reduce((sum, event) => sum + event.registrations, 0),
      totalAttendance: venueEvents.reduce((sum, event) => sum + event.attendance, 0),
      averageAttendanceRate: venueEvents.length > 0
        ? Math.round(venueEvents.reduce((sum, event) => sum + event.attendanceRate, 0) / venueEvents.length)
        : 0,
      totalRevenue: venueEvents.reduce((sum, event) => sum + event.revenue, 0),
    }
  })

  // Format currency
  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString('en-IN')}`
  }

  // Calculate city totals
  const cityTotals = {
    totalEvents: cityEvents.length,
    totalRegistrations: cityEvents.reduce((sum, event) => sum + event.registrations, 0),
    totalAttendance: cityEvents.reduce((sum, event) => sum + event.attendance, 0),
    averageAttendanceRate: cityEvents.length > 0
      ? Math.round(cityEvents.reduce((sum, event) => sum + event.attendanceRate, 0) / cityEvents.length)
      : 0,
    totalRevenue: cityEvents.reduce((sum, event) => sum + event.revenue, 0),
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" asChild>
            <Link href="/admin/completed-events">
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Back</span>
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{cityName}</h1>
            <p className="text-muted-foreground">Completed events in {cityName}</p>
          </div>
        </div>
        <Button variant="outline" onClick={() => setActiveTab(activeTab === "venues" ? "analytics" : "venues")}>
          {activeTab === "venues" ? (
            <>
              <BarChart className="mr-2 h-4 w-4" />
              View Analytics
            </>
          ) : (
            <>
              <Building className="mr-2 h-4 w-4" />
              View Venues
            </>
          )}
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Events</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{cityTotals.totalEvents}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Registrations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{cityTotals.totalRegistrations}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Attendance Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{cityTotals.averageAttendanceRate}%</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(cityTotals.totalRevenue)}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={`Search events in ${cityName}...`}
              className="h-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {activeTab === "venues" ? (
          <div className="transition-all duration-300 ease-in-out space-y-6">
            {eventsByVenue.length === 0 ? (
              <div className="flex h-40 items-center justify-center rounded-md border">
                <p className="text-muted-foreground">No venues found with completed events matching your search.</p>
              </div>
            ) : (
              eventsByVenue.map((venueData) => (
                <Card key={venueData.venue} className="overflow-hidden">
                  <div
                    className="flex cursor-pointer items-center justify-between border-b p-4 hover:bg-muted/50"
                    onClick={() => router.push(`/admin/completed-events/venues/${encodeURIComponent(venueData.venue)}`)}
                  >
                    <div className="flex items-center gap-2">
                      <Building className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <h3 className="font-semibold">{venueData.venue}</h3>
                        <p className="text-sm text-muted-foreground">
                          {venueData.totalEvents} events • {venueData.totalRegistrations} registrations
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <div className="text-sm font-medium">Attendance Rate</div>
                        <div className="flex items-center justify-end">
                          <Badge variant={venueData.averageAttendanceRate >= 90 ? "default" : "outline"}>
                            {venueData.averageAttendanceRate}%
                          </Badge>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium">Total Revenue</div>
                        <div className="font-semibold">{formatCurrency(venueData.totalRevenue)}</div>
                      </div>
                    </div>
                  </div>

                  <div className="max-h-[300px] overflow-y-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Event</TableHead>
                          <TableHead>Game Template</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Registrations</TableHead>
                          <TableHead>Attendance</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {venueData.events.map((event) => (
                          <TableRow key={event.id}>
                            <TableCell className="font-medium">{event.title}</TableCell>
                            <TableCell>{event.gameTemplate}</TableCell>
                            <TableCell>{format(new Date(event.date), "MMM d, yyyy")}</TableCell>
                            <TableCell>{event.registrations}</TableCell>
                            <TableCell>
                              <div className="flex items-center">
                                <span className="mr-2">{event.attendance}</span>
                                <Badge variant={event.attendanceRate >= 90 ? "default" : "outline"}>
                                  {event.attendanceRate}%
                                </Badge>
                              </div>
                            </TableCell>
                            <TableCell className="text-right">
                              <Button variant="ghost" size="sm" asChild>
                                <Link href={`/admin/completed-events/${event.id}`}>
                                  View Details
                                </Link>
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </Card>
              ))
            )}
          </div>
        ) : (
          <div className="transition-all duration-300 ease-in-out">
            <Card>
              <CardHeader>
                <CardTitle>Analytics for {cityName}</CardTitle>
                <CardDescription>Performance metrics for completed events</CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="venues">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="venues">By Venue</TabsTrigger>
                    <TabsTrigger value="games">By Game Type</TabsTrigger>
                    <TabsTrigger value="timeline">Timeline</TabsTrigger>
                  </TabsList>

                  <TabsContent value="venues" className="mt-4 space-y-4">
                    <div className="rounded-lg border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Venue</TableHead>
                            <TableHead>Events</TableHead>
                            <TableHead>Registrations</TableHead>
                            <TableHead>Attendance</TableHead>
                            <TableHead>Attendance Rate</TableHead>
                            <TableHead>Revenue</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {eventsByVenue.map((venueData) => (
                            <TableRow key={venueData.venue}>
                              <TableCell className="font-medium">{venueData.venue}</TableCell>
                              <TableCell>{venueData.totalEvents}</TableCell>
                              <TableCell>{venueData.totalRegistrations}</TableCell>
                              <TableCell>{venueData.totalAttendance}</TableCell>
                              <TableCell>
                                <Badge variant={venueData.averageAttendanceRate >= 90 ? "default" : "outline"}>
                                  {venueData.averageAttendanceRate}%
                                </Badge>
                              </TableCell>
                              <TableCell>{formatCurrency(venueData.totalRevenue)}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>

                    <div className="rounded-lg border p-4">
                      <h3 className="mb-4 text-sm font-medium">Revenue by Venue</h3>
                      <div className="space-y-4">
                        {eventsByVenue.map((venueData) => (
                          <div key={venueData.venue} className="flex items-center">
                            <div className="w-48 font-medium truncate">{venueData.venue}</div>
                            <div className="flex-1">
                              <div className="flex h-4 items-center gap-2">
                                <div className="relative h-2 w-full rounded-full bg-muted">
                                  <div
                                    className="absolute inset-y-0 left-0 rounded-full bg-primary"
                                    style={{ width: `${(venueData.totalRevenue / eventsByVenue.reduce((max, venue) => Math.max(max, venue.totalRevenue), 1)) * 100}%` }}
                                  />
                                </div>
                                <span className="text-sm font-medium">{formatCurrency(venueData.totalRevenue)}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="games" className="mt-4 space-y-4">
                    {/* Group events by game template */}
                    {(() => {
                      const gameTemplates = Array.from(new Set(filteredEvents.map(event => event.gameTemplate)))
                      const eventsByGame = gameTemplates.map(template => {
                        const gameEvents = filteredEvents.filter(event => event.gameTemplate === template)
                        return {
                          template,
                          events: gameEvents,
                          totalEvents: gameEvents.length,
                          totalRegistrations: gameEvents.reduce((sum, event) => sum + event.registrations, 0),
                          totalAttendance: gameEvents.reduce((sum, event) => sum + event.attendance, 0),
                          averageAttendanceRate: gameEvents.length > 0
                            ? Math.round(gameEvents.reduce((sum, event) => sum + event.attendanceRate, 0) / gameEvents.length)
                            : 0,
                          totalRevenue: gameEvents.reduce((sum, event) => sum + event.revenue, 0),
                        }
                      })

                      return (
                        <>
                          <div className="rounded-lg border">
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>Game Template</TableHead>
                                  <TableHead>Events</TableHead>
                                  <TableHead>Registrations</TableHead>
                                  <TableHead>Attendance</TableHead>
                                  <TableHead>Attendance Rate</TableHead>
                                  <TableHead>Revenue</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {eventsByGame.map((gameData) => (
                                  <TableRow key={gameData.template}>
                                    <TableCell className="font-medium">{gameData.template}</TableCell>
                                    <TableCell>{gameData.totalEvents}</TableCell>
                                    <TableCell>{gameData.totalRegistrations}</TableCell>
                                    <TableCell>{gameData.totalAttendance}</TableCell>
                                    <TableCell>
                                      <Badge variant={gameData.averageAttendanceRate >= 90 ? "default" : "outline"}>
                                        {gameData.averageAttendanceRate}%
                                      </Badge>
                                    </TableCell>
                                    <TableCell>{formatCurrency(gameData.totalRevenue)}</TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </div>

                          <div className="rounded-lg border p-4">
                            <h3 className="mb-4 text-sm font-medium">Popularity by Game Type</h3>
                            <div className="space-y-4">
                              {eventsByGame.map((gameData) => (
                                <div key={gameData.template} className="flex items-center">
                                  <div className="w-48 font-medium truncate">{gameData.template}</div>
                                  <div className="flex-1">
                                    <div className="flex h-4 items-center gap-2">
                                      <div className="relative h-2 w-full rounded-full bg-muted">
                                        <div
                                          className="absolute inset-y-0 left-0 rounded-full bg-primary"
                                          style={{ width: `${(gameData.totalRegistrations / eventsByGame.reduce((max, game) => Math.max(max, game.totalRegistrations), 1)) * 100}%` }}
                                        />
                                      </div>
                                      <span className="text-sm font-medium">{gameData.totalRegistrations} registrations</span>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </>
                      )
                    })()}
                  </TabsContent>

                  <TabsContent value="timeline" className="mt-4 space-y-4">
                    {/* Sort events by date */}
                    {(() => {
                      const sortedEvents = [...filteredEvents].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

                      // Group events by month
                      const months: Record<string, typeof filteredEvents> = {}
                      sortedEvents.forEach(event => {
                        const monthYear = format(new Date(event.date), "MMMM yyyy")
                        if (!months[monthYear]) {
                          months[monthYear] = []
                        }
                        months[monthYear].push(event)
                      })

                      return (
                        <div className="space-y-6">
                          {Object.entries(months).map(([monthYear, events]) => (
                            <div key={monthYear} className="space-y-2">
                              <h3 className="font-medium">{monthYear}</h3>
                              <div className="rounded-lg border">
                                <Table>
                                  <TableHeader>
                                    <TableRow>
                                      <TableHead>Event</TableHead>
                                      <TableHead>Venue</TableHead>
                                      <TableHead>Date</TableHead>
                                      <TableHead>Registrations</TableHead>
                                      <TableHead>Attendance</TableHead>
                                      <TableHead>Revenue</TableHead>
                                    </TableRow>
                                  </TableHeader>
                                  <TableBody>
                                    {events.map((event) => (
                                      <TableRow key={event.id}>
                                        <TableCell className="font-medium">{event.title}</TableCell>
                                        <TableCell>{event.venue}</TableCell>
                                        <TableCell>{format(new Date(event.date), "MMM d, yyyy")}</TableCell>
                                        <TableCell>{event.registrations}</TableCell>
                                        <TableCell>
                                          <div className="flex items-center">
                                            <span className="mr-2">{event.attendance}</span>
                                            <Badge variant={event.attendanceRate >= 90 ? "default" : "outline"}>
                                              {event.attendanceRate}%
                                            </Badge>
                                          </div>
                                        </TableCell>
                                        <TableCell>{formatCurrency(event.revenue)}</TableCell>
                                      </TableRow>
                                    ))}
                                  </TableBody>
                                </Table>
                              </div>
                            </div>
                          ))}
                        </div>
                      )
                    })()}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        )}
    </div>
  )
}
