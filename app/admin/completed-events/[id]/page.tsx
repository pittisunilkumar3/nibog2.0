"use client"

import { useState, useEffect } from "react"
import { CompletedEvent, fetchCompletedEventById } from "@/services/completedEventsService"
import Link from "next/link"
import { useParams } from "next/navigation"
import { format } from "date-fns"
import { ArrowLeft, Calendar, MapPin, Users, CheckCircle, XCircle, Download, Mail, Printer, BarChart, DollarSign, TrendingUp, PieChart, Award } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

// Keep the mock data for additional details not in API
const mockEventData = {
  description: "A fun and exciting event with multiple games and activities.",
  participants: [
    { id: "P001", parentName: "Rahul Sharma", childName: "Arjun Sharma", childAge: 8, attended: true, addons: ["T-Shirt", "Photo Package"] },
    { id: "P002", parentName: "Priya Patel", childName: "Aarav Patel", childAge: 7, attended: true, addons: ["T-Shirt"] },
    { id: "P003", parentName: "Neha Singh", childName: "Ishaan Singh", childAge: 9, attended: true, addons: ["Meal Pack", "Photo Package"] },
  ],
  addonSales: [
    { name: "T-Shirt", sold: 18, collected: 16, revenue: 8982 },
    { name: "Meal Pack", sold: 15, collected: 14, revenue: 4485 },
    { name: "Photo Package", sold: 12, collected: 12, revenue: 11988 },
  ],
  winners: [
    { position: 1, childName: "Arjun Sharma", parentName: "Rahul Sharma", prize: "Gold Medal + Gift Hamper" },
    { position: 2, childName: "Aarav Patel", parentName: "Priya Patel", prize: "Silver Medal + Gift Hamper" },
    { position: 3, childName: "Ishaan Singh", parentName: "Neha Singh", prize: "Bronze Medal + Gift Hamper" },
  ],
  certificatesSent: 40,
  feedbackRating: 4.8,
}

export default function CompletedEventDetailPage() {
  const params = useParams()
  const eventId = params.id as string
  const [event, setEvent] = useState<CompletedEvent | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("participants")

  useEffect(() => {
    const loadEvent = async () => {
      try {
        const data = await fetchCompletedEventById(eventId)
        setEvent(data)
      } catch (error) {
        console.error('Error loading event:', error)
      } finally {
        setLoading(false)
      }
    }

    loadEvent()
  }, [eventId])

  if (loading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <div className="text-muted-foreground">Loading event details...</div>
      </div>
    )
  }

  if (!event) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Event Not Found</h2>
          <p className="text-muted-foreground">The event you're looking for doesn't exist or has been removed.</p>
          <Button className="mt-4" asChild>
            <Link href="/admin/completed-events">Back to Completed Events</Link>
          </Button>
        </div>
      </div>
    )
  }

  // Filter participants based on search query
  const filteredParticipants = mockEventData.participants.filter(participant => {
    if (!searchQuery) return true
    return (
      participant.parentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      participant.childName.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })

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
            <h1 className="text-3xl font-bold tracking-tight">{event.event_name}</h1>
            <p className="text-muted-foreground">
              {event.venue_name}, {event.city_name} • {event.event_date}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href={`/admin/completed-events/venues/${encodeURIComponent(event.venue_name)}`}>
              <MapPin className="mr-2 h-4 w-4" />
              View Venue
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href={`/admin/completed-events/cities/${encodeURIComponent(event.city_name)}`}>
              <Calendar className="mr-2 h-4 w-4" />
              View City
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="space-y-6 md:col-span-2">
          {/* Enhanced Statistics Section */}
          {event.statistics && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart className="h-5 w-5" />
                    Event Statistics
                  </CardTitle>
                  <CardDescription>Comprehensive analytics and metrics</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Booking Statistics */}
                  <div>
                    <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Booking Overview
                    </h3>
                    <div className="grid gap-4 sm:grid-cols-4">
                      <div className="rounded-lg border p-3">
                        <div className="text-xs text-muted-foreground">Total Bookings</div>
                        <div className="text-2xl font-bold">{event.statistics.total_bookings}</div>
                      </div>
                      <div className="rounded-lg border p-3">
                        <div className="text-xs text-muted-foreground">Parents</div>
                        <div className="text-2xl font-bold">{event.statistics.total_parents}</div>
                      </div>
                      <div className="rounded-lg border p-3">
                        <div className="text-xs text-muted-foreground">Children</div>
                        <div className="text-2xl font-bold">{event.statistics.total_children}</div>
                      </div>
                      <div className="rounded-lg border p-3">
                        <div className="text-xs text-muted-foreground">Game Bookings</div>
                        <div className="text-2xl font-bold">{event.statistics.total_game_bookings}</div>
                      </div>
                    </div>
                  </div>

                  {/* Booking Status */}
                  <div>
                    <h3 className="text-sm font-semibold mb-3">Booking Status</h3>
                    <div className="grid gap-3 sm:grid-cols-3">
                      <div className="rounded-lg border p-3 bg-green-50 dark:bg-green-950">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <div className="text-xs text-muted-foreground">Confirmed</div>
                        </div>
                        <div className="text-xl font-bold mt-1">{event.statistics.bookings_by_status.confirmed}</div>
                      </div>
                      <div className="rounded-lg border p-3 bg-yellow-50 dark:bg-yellow-950">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-yellow-600" />
                          <div className="text-xs text-muted-foreground">Pending</div>
                        </div>
                        <div className="text-xl font-bold mt-1">{event.statistics.bookings_by_status.pending}</div>
                      </div>
                      <div className="rounded-lg border p-3 bg-red-50 dark:bg-red-950">
                        <div className="flex items-center gap-2">
                          <XCircle className="h-4 w-4 text-red-600" />
                          <div className="text-xs text-muted-foreground">Cancelled</div>
                        </div>
                        <div className="text-xl font-bold mt-1">{event.statistics.bookings_by_status.cancelled}</div>
                      </div>
                    </div>
                  </div>

                  {/* Revenue Statistics */}
                  <div>
                    <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                      <DollarSign className="h-4 w-4" />
                      Revenue Breakdown
                    </h3>
                    <div className="grid gap-3 sm:grid-cols-3">
                      <div className="rounded-lg border p-3 bg-blue-50 dark:bg-blue-950">
                        <div className="text-xs text-muted-foreground">Total Revenue</div>
                        <div className="text-xl font-bold mt-1">
                          ₹{event.statistics.revenue.total.toLocaleString('en-IN')}
                        </div>
                      </div>
                      <div className="rounded-lg border p-3 bg-green-50 dark:bg-green-950">
                        <div className="text-xs text-muted-foreground">Paid</div>
                        <div className="text-xl font-bold mt-1">
                          ₹{event.statistics.revenue.paid.toLocaleString('en-IN')}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {((event.statistics.revenue.paid / event.statistics.revenue.total) * 100).toFixed(1)}%
                        </div>
                      </div>
                      <div className="rounded-lg border p-3 bg-orange-50 dark:bg-orange-950">
                        <div className="text-xs text-muted-foreground">Pending</div>
                        <div className="text-xl font-bold mt-1">
                          ₹{event.statistics.revenue.pending.toLocaleString('en-IN')}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {((event.statistics.revenue.pending / event.statistics.revenue.total) * 100).toFixed(1)}%
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Payment Methods */}
                  {event.statistics.payment_methods && event.statistics.payment_methods.length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                        <PieChart className="h-4 w-4" />
                        Payment Methods
                      </h3>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Method</TableHead>
                            <TableHead className="text-right">Transactions</TableHead>
                            <TableHead className="text-right">Amount</TableHead>
                            <TableHead className="text-right">%</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {event.statistics.payment_methods.map((method, idx) => (
                            <TableRow key={idx}>
                              <TableCell className="font-medium">{method.method}</TableCell>
                              <TableCell className="text-right">{method.count}</TableCell>
                              <TableCell className="text-right">
                                ₹{method.amount.toLocaleString('en-IN')}
                              </TableCell>
                              <TableCell className="text-right">
                                {((method.amount / event.statistics.revenue.total) * 100).toFixed(1)}%
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}

                  {/* Top Games */}
                  {event.statistics.top_games && event.statistics.top_games.length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                        <Award className="h-4 w-4" />
                        Top Performing Games
                      </h3>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Game</TableHead>
                            <TableHead className="text-right">Bookings</TableHead>
                            <TableHead className="text-right">Revenue</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {event.statistics.top_games.map((game) => (
                            <TableRow key={game.game_id}>
                              <TableCell className="font-medium">{game.game_name}</TableCell>
                              <TableCell className="text-right">{game.bookings}</TableCell>
                              <TableCell className="text-right">
                                ₹{game.revenue.toLocaleString('en-IN')}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}

                  {/* Age Distribution */}
                  {event.statistics.age_distribution && event.statistics.age_distribution.length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                        <TrendingUp className="h-4 w-4" />
                        Age Distribution
                      </h3>
                      <div className="space-y-3">
                        {event.statistics.age_distribution.map((age, idx) => {
                          const percentage = (age.count / event.statistics.total_children) * 100
                          return (
                            <div key={idx} className="flex items-center gap-3">
                              <div className="w-24 text-sm font-medium">{age.age_group}</div>
                              <div className="flex-1">
                                <div className="flex h-6 items-center gap-2">
                                  <div className="relative h-2 w-full rounded-full bg-muted">
                                    <div
                                      className="absolute inset-y-0 left-0 rounded-full bg-primary"
                                      style={{ width: `${percentage}%` }}
                                    />
                                  </div>
                                  <span className="text-sm font-medium w-16 text-right">
                                    {age.count} ({percentage.toFixed(1)}%)
                                  </span>
                                </div>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          )}

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div>
                <CardTitle className="text-base font-medium">Event Summary</CardTitle>
                <CardDescription>Overview of event performance</CardDescription>
              </div>
              <Badge className="bg-green-500 hover:bg-green-600">Completed</Badge>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Registrations</div>
                  <div className="text-2xl font-bold">{event.registrations}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Attendance</div>
                  <div className="text-2xl font-bold">{event.attendance_count}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Attendance Rate</div>
                  <div className="text-2xl font-bold">{event.attendance_percentage}</div>
                </div>
              </div>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Total Revenue</div>
                  <div className="text-2xl font-bold">{event.revenue}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Feedback Rating</div>
                  <div className="text-2xl font-bold">{mockEventData.feedbackRating}/5.0</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Event Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{event.description || mockEventData.description}</p>
              <div className="mt-4">
                <h3 className="text-sm font-medium mb-2">Games ({event.games?.length || 0})</h3>
                <div className="flex flex-wrap gap-2">
                  {event.games && event.games.length > 0 ? (
                    event.games.map((game) => (
                      <Badge key={game.game_id} variant="outline" className="text-xs">
                        {game.game_name}
                        {game.min_age && game.max_age && (
                          <span className="ml-1 text-muted-foreground">({game.min_age}-{game.max_age}y)</span>
                        )}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-sm text-muted-foreground">No games configured</span>
                  )}
                </div>
              </div>
              
              {/* Show Event Games with Slots if available */}
              {event.event_games_with_slots && event.event_games_with_slots.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-sm font-medium mb-3">Game Slots & Timing</h3>
                  <div className="space-y-3">
                    {event.event_games_with_slots.map((slot) => (
                      <div key={slot.id} className="rounded-lg border p-3 bg-muted/30">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex-1">
                            <h4 className="font-medium text-sm">{slot.custom_title || slot.game_name}</h4>
                            <p className="text-xs text-muted-foreground mt-1">{slot.custom_description}</p>
                          </div>
                          <Badge variant="secondary" className="text-xs">
                            ₹{slot.custom_price.toLocaleString('en-IN')}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {slot.start_time.substring(0, 5)} - {slot.end_time.substring(0, 5)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            Max: {slot.max_participants}
                          </span>
                          {slot.min_age && slot.max_age && (
                            <span>Ages: {slot.min_age}-{slot.max_age}</span>
                          )}
                        </div>
                        {slot.note && (
                          <p className="text-xs text-muted-foreground mt-2 italic">{slot.note}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Winners</CardTitle>
              <CardDescription>Top performers in the event</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockEventData.winners.map((winner) => (
                  <div key={winner.position} className="flex items-center gap-4">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-full ${
                      winner.position === 1 ? "bg-yellow-100 text-yellow-700" :
                      winner.position === 2 ? "bg-gray-100 text-gray-700" :
                      "bg-amber-100 text-amber-700"
                    }`}>
                      {winner.position}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">{winner.childName}</div>
                      <div className="text-sm text-muted-foreground">{winner.parentName}</div>
                    </div>
                    <div className="text-sm">{winner.prize}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button className="w-full justify-start" variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Download Attendance Report
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <Mail className="mr-2 h-4 w-4" />
                Send Certificates
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <Printer className="mr-2 h-4 w-4" />
                Print Event Summary
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <BarChart className="mr-2 h-4 w-4" />
                View Detailed Analytics
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Add-on Sales</CardTitle>
              <CardDescription>Summary of add-on products sold</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockEventData.addonSales.map((addon) => (
                  <div key={addon.name} className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">{addon.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {addon.sold} sold • {addon.collected} collected
                      </div>
                    </div>
                    <div className="font-medium">₹{addon.revenue.toLocaleString('en-IN')}</div>
                  </div>
                ))}
                <div className="border-t pt-4 flex items-center justify-between">
                  <div className="font-medium">Total Add-on Revenue</div>
                  <div className="font-bold">
                    ₹{mockEventData.addonSales.reduce((sum, addon) => sum + addon.revenue, 0).toLocaleString('en-IN')}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Certificates</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="text-sm">Certificates Generated</div>
                  <div className="font-medium">{event.attendance_count}</div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-sm">Certificates Sent</div>
                  <div className="font-medium">{mockEventData.certificatesSent}</div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-sm">Pending</div>
                  <div className="font-medium">
                    {parseInt(event.attendance_count) - mockEventData.certificatesSent}
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              {parseInt(event.attendance_count) > mockEventData.certificatesSent && (
                <Button className="w-full" variant="outline">
                  <Mail className="mr-2 h-4 w-4" />
                  Send Pending Certificates
                </Button>
              )}
            </CardFooter>
          </Card>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Participant Details</CardTitle>
          <CardDescription>
            {event.attendance_count} out of {event.registrations} registered participants attended
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex items-center gap-2">
            <Input
              placeholder="Search participants..."
              className="max-w-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
              <TabsList className="grid w-[400px] grid-cols-3">
                <TabsTrigger value="participants">All</TabsTrigger>
                <TabsTrigger value="attended">Attended</TabsTrigger>
                <TabsTrigger value="no-show">No-Show</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Parent Name</TableHead>
                  <TableHead>Child Name</TableHead>
                  <TableHead>Child Age</TableHead>
                  <TableHead>Attendance</TableHead>
                  <TableHead>Add-ons</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredParticipants
                  .filter(p => {
                    if (activeTab === "participants") return true
                    if (activeTab === "attended") return p.attended
                    if (activeTab === "no-show") return !p.attended
                    return true
                  })
                  .map((participant) => (
                    <TableRow key={participant.id}>
                      <TableCell className="font-medium">{participant.parentName}</TableCell>
                      <TableCell>{participant.childName}</TableCell>
                      <TableCell>{participant.childAge} months</TableCell>
                      <TableCell>
                        {participant.attended ? (
                          <div className="flex items-center">
                            <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                            <span>Attended</span>
                          </div>
                        ) : (
                          <div className="flex items-center">
                            <XCircle className="mr-2 h-4 w-4 text-red-500" />
                            <span>No-show</span>
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {participant.addons.length > 0 ? (
                            participant.addons.map((addon, index) => (
                              <Badge key={index} variant="outline">{addon}</Badge>
                            ))
                          ) : (
                            <span className="text-sm text-muted-foreground">None</span>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}

                {filteredParticipants
                  .filter(p => {
                    if (activeTab === "participants") return true
                    if (activeTab === "attended") return p.attended
                    if (activeTab === "no-show") return !p.attended
                    return true
                  })
                  .length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="h-24 text-center">
                        No participants found.
                      </TableCell>
                    </TableRow>
                  )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
