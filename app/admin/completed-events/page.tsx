"use client"

import { useState, useEffect } from "react"
import { CompletedEvent, fetchCompletedEvents } from "@/services/completedEventsService"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { Calendar, Search, MapPin, ChevronRight, BarChart, Building, Eye, Edit } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import EnhancedDataTable, { Column, TableAction, BulkAction } from "@/components/admin/enhanced-data-table"
import { createCompletedEventExportColumns } from "@/lib/export-utils"
// We'll implement animations without framer-motion

interface NormalizedEvent {
  id: string
  title: string
  gameTemplate: string
  venue: string
  city: string
  date: string
  registrations: number
  attendance: number
  attendanceRate: number
  revenue: number
  status: string
}

export default function CompletedEventsPage() {
  const router = useRouter()
  const [events, setEvents] = useState<CompletedEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCity, setSelectedCity] = useState<string | null>(null)
  const [selectedVenue, setSelectedVenue] = useState<string | null>(null)
  const [selectedDateRange, setSelectedDateRange] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<"list" | "cities" | "analytics">("list")

  useEffect(() => {
  const loadEvents = async () => {
    try {
      const data = await fetchCompletedEvents()
      setEvents(data)
    } catch (error) {
      console.error('Error loading events:', error)
    } finally {
      setLoading(false)
    }
  }

  loadEvents()
}, [])

// Convert API data to normalized format for UI
const normalizeEvent = (event: CompletedEvent): NormalizedEvent => {
  const revenue = parseFloat(event.revenue?.replace(/[^0-9.-]+/g, '') || '0') || 0
  const registrations = parseInt(event.registrations || '0') || 0
  const attendance = parseInt(event.attendance_count || '0') || 0
  const attendanceRate = parseInt(event.attendance_percentage?.replace('%', '') || '0') || 0
  
  // Use the games array from API response
  const gameTemplate = event.games && event.games.length > 0 
    ? event.games.map(g => g.game_name).join(", ") 
    : "No games"

  return {
    id: event.event_id.toString(),
    title: event.event_name,
    gameTemplate,
    venue: event.venue_name || event.venue?.name || '',
    city: event.city_name || event.city?.name || '',
    date: event.event_date,
    registrations,
    attendance,
    attendanceRate,
    revenue,
    status: "completed"
  }
}

const completedEvents = events.map(normalizeEvent)

// Get unique cities from events
const cities = Array.from(new Set(completedEvents.map(event => event.city)))

// Get unique venues from events
const venues = Array.from(new Set(completedEvents.map(event => event.venue)))

  // Format currency
  const formatCurrency = (amount: number) => {
    const formatted = amount.toLocaleString('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })
    return formatted
  }

  // Filter events based on search query and filters
  const filteredEvents = completedEvents.filter(event => {
    // Search filter
    if (searchQuery && !event.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !event.gameTemplate.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !event.venue.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !event.city.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false
    }

    // City filter
    if (selectedCity && event.city !== selectedCity) {
      return false
    }

    // Venue filter
    if (selectedVenue && event.venue !== selectedVenue) {
      return false
    }

    // Date range filter
    if (selectedDateRange) {
      const eventDate = new Date(event.date)
      const today = new Date()

      if (selectedDateRange === "last-week") {
        const lastWeek = new Date(today)
        lastWeek.setDate(today.getDate() - 7)
        if (eventDate < lastWeek) return false
      } else if (selectedDateRange === "last-month") {
        const lastMonth = new Date(today)
        lastMonth.setMonth(today.getMonth() - 1)
        if (eventDate < lastMonth) return false
      } else if (selectedDateRange === "last-3-months") {
        const last3Months = new Date(today)
        last3Months.setMonth(today.getMonth() - 3)
        if (eventDate < last3Months) return false
      }
    }

    return true
  })

  // Group events by city for the cities view
  const eventsByCity = cities.map(city => {
    const cityEvents = filteredEvents.filter(event => event.city === city)
    return {
      city,
      events: cityEvents,
      totalEvents: cityEvents.length,
      totalRegistrations: cityEvents.reduce((sum, event) => sum + event.registrations, 0),
      totalAttendance: cityEvents.reduce((sum, event) => sum + event.attendance, 0),
      averageAttendanceRate: cityEvents.length > 0
        ? Math.round(cityEvents.reduce((sum, event) => sum + event.attendanceRate, 0) / cityEvents.length)
        : 0,
      totalRevenue: cityEvents.reduce((sum, event) => sum + event.revenue, 0),
    }
  }).filter(cityData => cityData.events.length > 0)

  // Define table columns for EnhancedDataTable
  const columns: Column<NormalizedEvent>[] = [
    {
      key: 'title',
      label: 'Event',
      sortable: true,
      priority: 1, // Highest priority for mobile
    },
    {
      key: 'city',
      label: 'City',
      sortable: true,
      priority: 2, // Second priority for mobile
    },
    {
      key: 'date',
      label: 'Date',
      sortable: true,
      priority: 3, // Third priority for mobile
      render: (value) => format(new Date(value), "MMM d, yyyy")
    },
    {
      key: 'attendance',
      label: 'Attendance',
      sortable: true,
      priority: 4, // Fourth priority for mobile
      render: (value, row) => (
        <div className="flex items-center">
          <span className="mr-2">{value}</span>
          <Badge variant={row.attendanceRate >= 90 ? "default" : "outline"}>
            {row.attendanceRate}%
          </Badge>
        </div>
      )
    },
    {
      key: 'gameTemplate',
      label: 'Game Template',
      sortable: true,
      hideOnMobile: true, // Hide on mobile to save space
    },
    {
      key: 'venue',
      label: 'Venue',
      sortable: true,
      hideOnMobile: true, // Hide on mobile to save space
    },
    {
      key: 'registrations',
      label: 'Registrations',
      sortable: true,
      hideOnMobile: true, // Hide on mobile to save space
    },
    {
      key: 'revenue',
      label: 'Revenue',
      sortable: true,
      hideOnMobile: true, // Hide on mobile to save space
      render: (value) => formatCurrency(value)
    }
  ]

  // Define table actions
  const actions: TableAction<CompletedEvent>[] = [
    {
      label: "View Details",
      icon: <Eye className="h-4 w-4" />,
      onClick: (event) => {
        window.location.href = `/admin/completed-events/${event.id}`
      }
    }
  ]

  // Define bulk actions
  const bulkActions: BulkAction<CompletedEvent>[] = []

  return (
    <div className="space-y-4 sm:space-y-6">
      {loading ? (
        <div className="flex h-[400px] items-center justify-center">
          <div className="text-muted-foreground">Loading events...</div>
        </div>
      ) : (
        <>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Completed Events</h1>
          <p className="text-sm sm:text-base text-muted-foreground">View and analyze past NIBOG events</p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button
            variant="outline"
            onClick={() => setViewMode("list")}
            className="touch-manipulation"
          >
            <span className="hidden sm:inline">List View</span>
            <span className="sm:hidden">List</span>
          </Button>
          <Button
            variant="outline"
            onClick={() => setViewMode("cities")}
            className="touch-manipulation"
          >
            <span className="hidden sm:inline">Cities View</span>
            <span className="sm:hidden">Cities</span>
          </Button>
          <Button
            variant="outline"
            onClick={() => setViewMode("analytics")}
            className="touch-manipulation"
          >
            <BarChart className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Analytics</span>
            <span className="sm:hidden">Stats</span>
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
              <Input
                placeholder="Search events..."
                className="pl-9 h-10 touch-manipulation"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
              <Select value={selectedCity || "all"} onValueChange={(value) => setSelectedCity(value === "all" ? null : value)}>
                <SelectTrigger className="w-full sm:w-[150px] touch-manipulation">
                  <SelectValue placeholder="All Cities" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all" className="touch-manipulation">All Cities</SelectItem>
                  {cities.map((city) => (
                    <SelectItem key={city} value={city} className="touch-manipulation">
                      {city}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedVenue || "all"} onValueChange={(value) => setSelectedVenue(value === "all" ? null : value)}>
                <SelectTrigger className="w-full sm:w-[180px] touch-manipulation">
                  <SelectValue placeholder="All Venues" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all" className="touch-manipulation">All Venues</SelectItem>
                  {venues.map((venue) => (
                    <SelectItem key={venue} value={venue} className="touch-manipulation">
                      {venue}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedDateRange || "all"} onValueChange={(value) => setSelectedDateRange(value === "all" ? null : value)}>
                <SelectTrigger className="w-full sm:w-[180px] touch-manipulation">
                  <SelectValue placeholder="All Time" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all" className="touch-manipulation">All Time</SelectItem>
                  <SelectItem value="last-week" className="touch-manipulation">Last Week</SelectItem>
                  <SelectItem value="last-month" className="touch-manipulation">Last Month</SelectItem>
                  <SelectItem value="last-3-months" className="touch-manipulation">Last 3 Months</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {viewMode === "list" && (
        <EnhancedDataTable
          data={filteredEvents}
          columns={columns}
          actions={actions}
          bulkActions={bulkActions}
          loading={loading}
          searchable={false} // We have custom search above
          filterable={false} // We have custom filters above
          exportable={true}
          selectable={true}
          pagination={true}
          pageSize={25}
          exportColumns={createCompletedEventExportColumns()}
          exportTitle="NIBOG Completed Events Report"
          exportFilename="nibog-completed-events"
          emptyMessage="No completed events found"
          className="min-h-[400px]"
        />
      )}

        {viewMode === "cities" && (
          <div className="transition-all duration-300 ease-in-out space-y-6">
            {eventsByCity.length === 0 ? (
              <div className="flex h-40 items-center justify-center rounded-md border">
                <p className="text-muted-foreground">No cities found with completed events matching your filters.</p>
              </div>
            ) : (
              eventsByCity.map((cityData) => (
                <Card key={cityData.city} className="overflow-hidden">
                  <div
                    className="flex cursor-pointer items-center justify-between border-b p-3 sm:p-4 hover:bg-muted/50 touch-manipulation"
                    onClick={() => router.push(`/admin/completed-events/cities/${encodeURIComponent(cityData.city)}`)}
                  >
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <MapPin className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-sm sm:text-base truncate">{cityData.city}</h3>
                        <p className="text-xs sm:text-sm text-muted-foreground truncate">
                          {cityData.totalEvents} events • {cityData.totalRegistrations} registrations
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-6 flex-shrink-0">
                      <div className="text-right hidden sm:block">
                        <div className="text-sm font-medium">Attendance Rate</div>
                        <div className="flex items-center justify-end">
                          <Badge variant={cityData.averageAttendanceRate >= 90 ? "default" : "outline"}>
                            {cityData.averageAttendanceRate}%
                          </Badge>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs sm:text-sm font-medium hidden sm:block">Total Revenue</div>
                        <div className="font-semibold text-sm sm:text-base">{formatCurrency(cityData.totalRevenue)}</div>
                      </div>
                      <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
                    </div>
                  </div>

                  {/* Mobile-responsive table */}
                  <div className="max-h-[300px] overflow-y-auto">
                    <div className="hidden sm:block">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Event</TableHead>
                            <TableHead>Venue</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Registrations</TableHead>
                            <TableHead>Attendance</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {cityData.events.map((event) => (
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
                              <TableCell className="text-right">
                                <Button variant="ghost" size="sm" asChild className="touch-manipulation">
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

                    {/* Mobile card view */}
                    <div className="sm:hidden space-y-3 p-3">
                      {cityData.events.map((event) => (
                        <div key={event.id} className="border rounded-lg p-3 space-y-2 bg-card shadow-sm hover:shadow-md transition-shadow touch-manipulation">
                          <div className="flex justify-between items-start gap-3">
                            <div className="min-w-0 flex-1">
                              <h4 className="font-medium text-sm truncate">{event.title}</h4>
                              <p className="text-xs text-muted-foreground truncate">{event.venue}</p>
                            </div>
                            <Badge variant={event.attendanceRate >= 90 ? "default" : "outline"} className="flex-shrink-0">
                              {event.attendanceRate}%
                            </Badge>
                          </div>
                          <div className="flex justify-between items-center text-xs text-muted-foreground">
                            <span>{format(new Date(event.date), "MMM d, yyyy")}</span>
                            <span>{event.attendance}/{event.registrations}</span>
                          </div>
                          <div className="flex justify-end">
                            <Button variant="ghost" size="sm" asChild className="touch-manipulation h-8 px-3">
                              <Link href={`/admin/completed-events/${event.id}`}>
                                <Eye className="h-3 w-3 mr-1" />
                                View
                              </Link>
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        )}

        {viewMode === "analytics" && (
          <div className="transition-all duration-300 ease-in-out">
            <Card>
              <CardContent className="pt-6">
                <Tabs defaultValue="attendance">
                  <TabsList className="grid w-full grid-cols-3 h-auto">
                    <TabsTrigger value="attendance" className="text-xs sm:text-sm touch-manipulation">
                      <span className="hidden sm:inline">Attendance</span>
                      <span className="sm:hidden">Attend.</span>
                    </TabsTrigger>
                    <TabsTrigger value="revenue" className="text-xs sm:text-sm touch-manipulation">
                      Revenue
                    </TabsTrigger>
                    <TabsTrigger value="comparison" className="text-xs sm:text-sm touch-manipulation">
                      <span className="hidden sm:inline">City Comparison</span>
                      <span className="sm:hidden">Compare</span>
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="attendance" className="mt-4 space-y-4">
                    <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
                      <div className="rounded-lg border p-3 sm:p-4 touch-manipulation">
                        <h3 className="text-xs sm:text-sm font-medium text-muted-foreground">Total Registrations</h3>
                        <p className="mt-1 sm:mt-2 text-xl sm:text-2xl font-bold">
                          {filteredEvents.reduce((sum, event) => sum + event.registrations, 0)}
                        </p>
                      </div>
                      <div className="rounded-lg border p-3 sm:p-4 touch-manipulation">
                        <h3 className="text-xs sm:text-sm font-medium text-muted-foreground">Total Attendance</h3>
                        <p className="mt-1 sm:mt-2 text-xl sm:text-2xl font-bold">
                          {filteredEvents.reduce((sum, event) => sum + event.attendance, 0)}
                        </p>
                      </div>
                      <div className="rounded-lg border p-3 sm:p-4 touch-manipulation sm:col-span-2 md:col-span-1">
                        <h3 className="text-xs sm:text-sm font-medium text-muted-foreground">Average Attendance Rate</h3>
                        <p className="mt-1 sm:mt-2 text-xl sm:text-2xl font-bold">
                          {filteredEvents.length > 0
                            ? Math.round(filteredEvents.reduce((sum, event) => sum + event.attendanceRate, 0) / filteredEvents.length)
                            : 0}%
                        </p>
                      </div>
                    </div>

                    <div className="rounded-lg border p-4">
                      <h3 className="mb-4 text-sm font-medium">Attendance by City</h3>
                      <div className="space-y-4">
                        {eventsByCity.map((cityData) => (
                          <div key={cityData.city} className="flex items-center">
                            <div className="w-32 font-medium">{cityData.city}</div>
                            <div className="flex-1">
                              <div className="flex h-4 items-center gap-2">
                                <div className="relative h-2 w-full rounded-full bg-muted">
                                  <div
                                    className="absolute inset-y-0 left-0 rounded-full bg-primary"
                                    style={{ width: `${cityData.averageAttendanceRate}%` }}
                                  />
                                </div>
                                <span className="text-sm font-medium">{cityData.averageAttendanceRate}%</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="revenue" className="mt-4 space-y-4">
                    <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
                      <div className="rounded-lg border p-3 sm:p-4 touch-manipulation">
                        <h3 className="text-xs sm:text-sm font-medium text-muted-foreground">Total Revenue</h3>
                        <p className="mt-1 sm:mt-2 text-xl sm:text-2xl font-bold">
                          {formatCurrency(filteredEvents.reduce((sum, event) => sum + event.revenue, 0))}
                        </p>
                      </div>
                      <div className="rounded-lg border p-3 sm:p-4 touch-manipulation">
                        <h3 className="text-xs sm:text-sm font-medium text-muted-foreground">Average Revenue per Event</h3>
                        <p className="mt-1 sm:mt-2 text-xl sm:text-2xl font-bold">
                          {filteredEvents.length > 0
                            ? formatCurrency(Math.round(filteredEvents.reduce((sum, event) => sum + event.revenue, 0) / filteredEvents.length))
                            : formatCurrency(0)}
                        </p>
                      </div>
                      <div className="rounded-lg border p-3 sm:p-4 touch-manipulation sm:col-span-2 md:col-span-1">
                        <h3 className="text-xs sm:text-sm font-medium text-muted-foreground">Average Revenue per Attendee</h3>
                        <p className="mt-1 sm:mt-2 text-xl sm:text-2xl font-bold">
                          {filteredEvents.reduce((sum, event) => sum + event.attendance, 0) > 0
                            ? formatCurrency(Math.round(filteredEvents.reduce((sum, event) => sum + event.revenue, 0) / filteredEvents.reduce((sum, event) => sum + event.attendance, 0)))
                            : formatCurrency(0)}
                        </p>
                      </div>
                    </div>

                    <div className="rounded-lg border p-4">
                      <h3 className="mb-4 text-sm font-medium">Revenue by City</h3>
                      <div className="space-y-4">
                        {eventsByCity.map((cityData) => (
                          <div key={cityData.city} className="flex items-center">
                            <div className="w-32 font-medium">{cityData.city}</div>
                            <div className="flex-1">
                              <div className="flex h-4 items-center gap-2">
                                <div className="relative h-2 w-full rounded-full bg-muted">
                                  <div
                                    className="absolute inset-y-0 left-0 rounded-full bg-primary"
                                    style={{ width: `${(cityData.totalRevenue / eventsByCity.reduce((max, city) => Math.max(max, city.totalRevenue), 1)) * 100}%` }}
                                  />
                                </div>
                                <span className="text-sm font-medium">{formatCurrency(cityData.totalRevenue)}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="comparison" className="mt-4">
                    {/* Desktop table view */}
                    <div className="rounded-lg border hidden sm:block">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>City</TableHead>
                            <TableHead>Events</TableHead>
                            <TableHead>Registrations</TableHead>
                            <TableHead>Attendance</TableHead>
                            <TableHead>Attendance Rate</TableHead>
                            <TableHead>Revenue</TableHead>
                            <TableHead>Avg. Revenue per Event</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {eventsByCity.map((cityData) => (
                            <TableRow key={cityData.city}>
                              <TableCell className="font-medium">{cityData.city}</TableCell>
                              <TableCell>{cityData.totalEvents}</TableCell>
                              <TableCell>{cityData.totalRegistrations}</TableCell>
                              <TableCell>{cityData.totalAttendance}</TableCell>
                              <TableCell>
                                <Badge variant={cityData.averageAttendanceRate >= 90 ? "default" : "outline"}>
                                  {cityData.averageAttendanceRate}%
                                </Badge>
                              </TableCell>
                              <TableCell>{formatCurrency(cityData.totalRevenue)}</TableCell>
                              <TableCell>
                                {formatCurrency(Math.round(cityData.totalRevenue / cityData.totalEvents))}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>

                    {/* Mobile card view */}
                    <div className="sm:hidden space-y-3">
                      {eventsByCity.map((cityData) => (
                        <Card key={cityData.city} className="p-4 space-y-3 touch-manipulation">
                          <div className="flex justify-between items-start gap-3">
                            <div className="min-w-0 flex-1">
                              <h3 className="font-semibold text-base">{cityData.city}</h3>
                              <p className="text-sm text-muted-foreground">
                                {cityData.totalEvents} events
                              </p>
                            </div>
                            <Badge variant={cityData.averageAttendanceRate >= 90 ? "default" : "outline"}>
                              {cityData.averageAttendanceRate}%
                            </Badge>
                          </div>

                          <div className="grid grid-cols-2 gap-3 text-sm">
                            <div>
                              <span className="text-muted-foreground">Registrations:</span>
                              <div className="font-medium">{cityData.totalRegistrations}</div>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Attendance:</span>
                              <div className="font-medium">{cityData.totalAttendance}</div>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Revenue:</span>
                              <div className="font-medium">{formatCurrency(cityData.totalRevenue)}</div>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Avg/Event:</span>
                              <div className="font-medium">{formatCurrency(Math.round(cityData.totalRevenue / cityData.totalEvents))}</div>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        )}
        </>
      )}
    </div>
  )
}
