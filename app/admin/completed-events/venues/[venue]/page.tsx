"use client"

import { useState } from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { format } from "date-fns"
import { ArrowLeft, Search, Building, Calendar, Users, BarChart, ChevronRight } from "lucide-react"
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

export default function CompletedEventsVenuePage() {
  const router = useRouter()
  const params = useParams()
  const venueName = decodeURIComponent(params.venue as string)
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("events")

  // Filter events for this venue
  const venueEvents = completedEvents.filter(event => event.venue === venueName)
  const cityName = venueEvents.length > 0 ? venueEvents[0].city : ""

  // Further filter based on search query
  const filteredEvents = venueEvents.filter(event => {
    if (!searchQuery) return true

    return (
      event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.gameTemplate.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })

  // Get unique game templates for this venue
  const gameTemplates = Array.from(new Set(filteredEvents.map(event => event.gameTemplate)))

  // Group events by game template
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

  // Format currency
  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString('en-IN')}`
  }

  // Calculate venue totals
  const venueTotals = {
    totalEvents: venueEvents.length,
    totalRegistrations: venueEvents.reduce((sum, event) => sum + event.registrations, 0),
    totalAttendance: venueEvents.reduce((sum, event) => sum + event.attendance, 0),
    averageAttendanceRate: venueEvents.length > 0
      ? Math.round(venueEvents.reduce((sum, event) => sum + event.attendanceRate, 0) / venueEvents.length)
      : 0,
    totalRevenue: venueEvents.reduce((sum, event) => sum + event.revenue, 0),
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 min-w-0">
          <Button variant="outline" size="icon" asChild className="touch-manipulation flex-shrink-0">
            <Link href={`/admin/completed-events/cities/${encodeURIComponent(cityName)}`}>
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Back</span>
            </Link>
          </Button>
          <div className="min-w-0 flex-1">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight truncate">{venueName}</h1>
            <p className="text-sm sm:text-base text-muted-foreground truncate">Completed events at {venueName}, {cityName}</p>
          </div>
        </div>
        <Button
          variant="outline"
          onClick={() => setActiveTab(activeTab === "events" ? "analytics" : "events")}
          className="touch-manipulation"
        >
          {activeTab === "events" ? (
            <>
              <BarChart className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">View Analytics</span>
              <span className="sm:hidden">Analytics</span>
            </>
          ) : (
            <>
              <Calendar className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">View Events</span>
              <span className="sm:hidden">Events</span>
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
            <div className="text-2xl font-bold">{venueTotals.totalEvents}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Registrations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{venueTotals.totalRegistrations}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Attendance Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{venueTotals.averageAttendanceRate}%</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(venueTotals.totalRevenue)}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={`Search events at ${venueName}...`}
              className="h-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {activeTab === "events" ? (
          <div className="transition-all duration-300 ease-in-out space-y-6">
            {eventsByGame.length === 0 ? (
              <div className="flex h-40 items-center justify-center rounded-md border">
                <p className="text-muted-foreground">No events found matching your search.</p>
              </div>
            ) : (
              eventsByGame.map((gameData) => (
                <Card key={gameData.template} className="overflow-hidden">
                  <div
                    className="flex cursor-pointer items-center justify-between border-b p-4 hover:bg-muted/50"
                    onClick={() => router.push(`/admin/completed-events/games/${encodeURIComponent(gameData.template)}`)}
                  >
                    <div className="flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <h3 className="font-semibold">{gameData.template}</h3>
                        <p className="text-sm text-muted-foreground">
                          {gameData.totalEvents} events • {gameData.totalRegistrations} registrations
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <div className="text-sm font-medium">Attendance Rate</div>
                        <div className="flex items-center justify-end">
                          <Badge variant={gameData.averageAttendanceRate >= 90 ? "default" : "outline"}>
                            {gameData.averageAttendanceRate}%
                          </Badge>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium">Total Revenue</div>
                        <div className="font-semibold">{formatCurrency(gameData.totalRevenue)}</div>
                      </div>
                      <ChevronRight className="h-5 w-5 text-muted-foreground" />
                    </div>
                  </div>

                  <div className="max-h-[300px] overflow-y-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Event</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Registrations</TableHead>
                          <TableHead>Attendance</TableHead>
                          <TableHead>Revenue</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {gameData.events.map((event) => (
                          <TableRow key={event.id}>
                            <TableCell className="font-medium">{event.title}</TableCell>
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
                <CardTitle>Analytics for {venueName}</CardTitle>
                <CardDescription>Performance metrics for completed events</CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="games">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="games">By Game Type</TabsTrigger>
                    <TabsTrigger value="timeline">Timeline</TabsTrigger>
                    <TabsTrigger value="attendance">Attendance</TabsTrigger>
                  </TabsList>

                  <TabsContent value="games" className="mt-4 space-y-4">
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
                      <h3 className="mb-4 text-sm font-medium">Revenue by Game Type</h3>
                      <div className="space-y-4">
                        {eventsByGame.map((gameData) => (
                          <div key={gameData.template} className="flex items-center">
                            <div className="w-48 font-medium truncate">{gameData.template}</div>
                            <div className="flex-1">
                              <div className="flex h-4 items-center gap-2">
                                <div className="relative h-2 w-full rounded-full bg-muted">
                                  <div
                                    className="absolute inset-y-0 left-0 rounded-full bg-primary"
                                    style={{ width: `${(gameData.totalRevenue / eventsByGame.reduce((max, game) => Math.max(max, game.totalRevenue), 1)) * 100}%` }}
                                  />
                                </div>
                                <span className="text-sm font-medium">{formatCurrency(gameData.totalRevenue)}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
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
                                      <TableHead>Game Template</TableHead>
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

                  <TabsContent value="attendance" className="mt-4 space-y-4">
                    <div className="grid gap-4 md:grid-cols-3">
                      <div className="rounded-lg border p-4">
                        <h3 className="text-sm font-medium text-muted-foreground">Total Registrations</h3>
                        <p className="mt-2 text-2xl font-bold">{venueTotals.totalRegistrations}</p>
                      </div>
                      <div className="rounded-lg border p-4">
                        <h3 className="text-sm font-medium text-muted-foreground">Total Attendance</h3>
                        <p className="mt-2 text-2xl font-bold">{venueTotals.totalAttendance}</p>
                      </div>
                      <div className="rounded-lg border p-4">
                        <h3 className="text-sm font-medium text-muted-foreground">No-Shows</h3>
                        <p className="mt-2 text-2xl font-bold">
                          {venueTotals.totalRegistrations - venueTotals.totalAttendance}
                        </p>
                      </div>
                    </div>

                    <div className="rounded-lg border p-4">
                      <h3 className="mb-4 text-sm font-medium">Attendance Rate by Game Type</h3>
                      <div className="space-y-4">
                        {eventsByGame.map((gameData) => (
                          <div key={gameData.template} className="flex items-center">
                            <div className="w-48 font-medium truncate">{gameData.template}</div>
                            <div className="flex-1">
                              <div className="flex h-4 items-center gap-2">
                                <div className="relative h-2 w-full rounded-full bg-muted">
                                  <div
                                    className="absolute inset-y-0 left-0 rounded-full bg-primary"
                                    style={{ width: `${gameData.averageAttendanceRate}%` }}
                                  />
                                </div>
                                <span className="text-sm font-medium">{gameData.averageAttendanceRate}%</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="rounded-lg border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Event</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Registrations</TableHead>
                            <TableHead>Attendance</TableHead>
                            <TableHead>No-Shows</TableHead>
                            <TableHead>Attendance Rate</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredEvents.map((event) => (
                            <TableRow key={event.id}>
                              <TableCell className="font-medium">{event.title}</TableCell>
                              <TableCell>{format(new Date(event.date), "MMM d, yyyy")}</TableCell>
                              <TableCell>{event.registrations}</TableCell>
                              <TableCell>{event.attendance}</TableCell>
                              <TableCell>{event.registrations - event.attendance}</TableCell>
                              <TableCell>
                                <Badge variant={event.attendanceRate >= 90 ? "default" : "outline"}>
                                  {event.attendanceRate}%
                                </Badge>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        )}
    </div>
  )
}
