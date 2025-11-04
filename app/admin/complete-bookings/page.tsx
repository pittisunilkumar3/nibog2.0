"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Eye, Edit, Check, X, AlertTriangle, Loader2, RefreshCw, CheckCircle, Mail, Phone, Filter, XCircle, Calendar, CalendarDays } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { getAllBookings, getPaginatedBookings, updateBookingStatus, Booking, PaginatedBookingsResponse } from "@/services/bookingService"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import EnhancedDataTable, { Column, TableAction, BulkAction } from "@/components/admin/enhanced-data-table"
import { createBookingExportColumns } from "@/lib/export-utils"
import { EmptyBookings, EmptyError } from "@/components/ui/empty-state"
import { SkeletonTable } from "@/components/ui/skeleton-loader"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { getAllEvents } from "@/services/eventService"
import { getAllBabyGames, type BabyGame } from "@/services/babyGameService"

// Booking statuses for filtering
const statusOptions = [
  { id: "1", name: "Confirmed", value: "confirmed" },
  { id: "2", name: "Pending", value: "pending" },
  { id: "3", name: "Cancelled", value: "cancelled" },
  { id: "4", name: "Completed", value: "completed" },
]

// Status badge component
const getStatusBadge = (status: string) => {
  switch (status?.toLowerCase()) {
    case 'confirmed':
      return <Badge className="bg-green-500 hover:bg-green-600">Confirmed</Badge>
    case 'pending':
      return <Badge className="bg-yellow-500 hover:bg-yellow-600">Pending</Badge>
    case 'cancelled':
      return <Badge className="bg-red-500 hover:bg-red-600">Cancelled</Badge>
    case 'completed':
      return <Badge className="bg-blue-500 hover:bg-blue-600">Completed</Badge>
    default:
      return <Badge variant="outline">{status}</Badge>
  }
}

export default function CompleteBookingsPage() {
  const { toast } = useToast()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState<number | null>(null)

  // Date filter state
  const [fromDate, setFromDate] = useState<string>("")
  const [toDate, setToDate] = useState<string>("")

  // Event and Game filter state
  const [events, setEvents] = useState<Array<{ id: number; event_title: string }>>([])
  const [games, setGames] = useState<BabyGame[]>([])
  const [selectedEventId, setSelectedEventId] = useState<string>("all")
  const [selectedGameId, setSelectedGameId] = useState<string>("all")
  const [selectedStatus, setSelectedStatus] = useState<string>("all")
  const [isLoadingFilters, setIsLoadingFilters] = useState(false)

  // Fetch complete bookings from API
  const fetchBookings = async () => {
    try {
      setIsLoading(true)
      setError(null)

      // Use the new complete bookings API endpoint
      const response = await fetch('/api/complete-bookings/get-all?page=1&limit=1000')
      if (!response.ok) {
        throw new Error(`Failed to fetch complete bookings: ${response.status}`)
      }

      const data = await response.json()
      // Filter out empty booking objects
      const validBookings = (data.data || []).filter((booking: any) => {
        return booking && Object.keys(booking).length > 0 &&
          Object.values(booking).some((value: any) => value !== null && value !== undefined && value !== '')
      })
      setBookings(validBookings)
    } catch (error: any) {
      console.error("Failed to fetch complete bookings:", error)
      setError(error.message || "Failed to load complete bookings. Please try again.")
      toast({
        title: "Error",
        description: "Failed to load complete bookings. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchBookings()
  }, [])

  // Load events and games for filters
  useEffect(() => {
    const loadFilters = async () => {
      try {
        setIsLoadingFilters(true)
        const [eventsData, gamesData] = await Promise.all([
          getAllEvents(true),
          getAllBabyGames()
        ])
        // Normalize events minimal structure
        setEvents(eventsData.map((e: any) => ({ id: e.event_id ?? e.id, event_title: e.event_title ?? e.title })))
        setGames(Array.isArray(gamesData) ? gamesData : [])
      } catch (err) {
        console.error('Failed to load filter data:', err)
      } finally {
        setIsLoadingFilters(false)
      }
    }
    loadFilters()
  }, [])

  // Enhanced filtering logic with better date handling
  const filteredBookings = bookings.filter(b => {
    // Date filter with improved logic
    if (fromDate || toDate) {
      const bookingDate = new Date(b.booking_created_at)
      
      // Ensure valid date
      if (isNaN(bookingDate.getTime())) return false
      
      if (fromDate) {
        const fromDateTime = new Date(fromDate)
        fromDateTime.setHours(0, 0, 0, 0) // Start of day
        if (bookingDate < fromDateTime) return false
      }
      
      if (toDate) {
        const toDateTime = new Date(toDate)
        toDateTime.setHours(23, 59, 59, 999) // End of day
        if (bookingDate > toDateTime) return false
      }
    }
    
    // Event filter with improved matching
    if (selectedEventId !== 'all') {
      const evId = Number(selectedEventId)
      if (isNaN(evId)) return false
      
      const matchesEventId = (b as any).event_id ? (b as any).event_id === evId : false
      const eventFromTitle = events.find(e => e.event_title === b.event_title)
      const matchesEventTitleId = eventFromTitle ? eventFromTitle.id === evId : false
      
      if (!(matchesEventId || matchesEventTitleId)) return false
    }
    
    // Game filter with improved matching
    if (selectedGameId !== 'all') {
      const gId = Number(selectedGameId)
      if (isNaN(gId)) return false
      
      const matchesGameId = (b as any).game_id ? (b as any).game_id === gId : false
      const matchesGameName = b.game_name ? games.some(g => (g.id === gId) && g.game_name === b.game_name) : false
      
      if (!(matchesGameId || matchesGameName)) return false
    }
    
    // Status filter
    if (selectedStatus !== 'all') {
      const bookingStatus = b.booking_status?.toLowerCase() || ''
      if (bookingStatus !== selectedStatus.toLowerCase()) return false
    }
    
    return true
  })

  // Define table columns with responsive configuration
  const columns: Column<Booking>[] = [
    {
      key: 'booking_id',
      label: 'ID',
      sortable: true,
      width: '80px',
      priority: 1, // Highest priority - always shown
      render: (value) => <span className="font-mono text-sm">#{value}</span>
    },
    {
      key: 'parent_name',
      label: 'Parent',
      sortable: true,
      priority: 2, // High priority
      render: (value, row) => (
        <div className="min-w-0">
          <div className="font-medium truncate">{value}</div>
          <div className="text-xs text-muted-foreground truncate">{row.parent_email}</div>
          {row.parent_additional_phone && (
            <div className="text-xs text-muted-foreground flex items-center gap-1">
              <Phone className="h-3 w-3 flex-shrink-0" />
              <span className="truncate">{row.parent_additional_phone}</span>
            </div>
          )}
        </div>
      )
    },
    {
      key: 'event_title',
      label: 'Event',
      sortable: true,
      priority: 3, // Medium-high priority
      render: (value, row) => (
        <div className="min-w-0">
          <div className="font-medium truncate">{value}</div>
          <div className="text-xs text-muted-foreground truncate">{row.city_name}</div>
          <div className="text-xs text-muted-foreground truncate">{row.venue_name}</div>
        </div>
      )
    },
    {
      key: 'booking_status',
      label: 'Status',
      sortable: true,
      width: '100px',
      priority: 4, // Medium priority
      render: (value) => getStatusBadge(value)
    },
    {
      key: 'child_full_name',
      label: 'Child',
      sortable: true,
      hideOnMobile: true, // Hide on mobile to save space
      render: (value, row) => (
        <div className="min-w-0">
          <div className="font-medium truncate">{value}</div>
          <div className="text-xs text-muted-foreground">{row.child_gender}</div>
        </div>
      )
    },
    {
      key: 'child_age',
      label: 'Child Age',
      sortable: true,
      width: '120px',
      hideOnMobile: true, // Hide on mobile to save space
      render: (value) => (
        <div className="min-w-0">
          <div className="font-medium text-sm">{value || 'N/A'}</div>
        </div>
      )
    },
    {
      key: 'game_name',
      label: 'Game',
      sortable: true,
      hideOnMobile: true, // Hide on mobile
      render: (value) => (
        <div className="min-w-0">
          <div className="font-medium truncate">{value}</div>
        </div>
      )
    },
    {
      key: 'total_amount',
      label: 'Amount',
      sortable: true,
      align: 'right',
      width: '100px',
      hideOnMobile: true, // Hide on mobile
      render: (value) => <span className="font-medium">₹{value}</span>
    },
    {
      key: 'parent_additional_phone',
      label: 'Phone',
      sortable: false,
      hideOnMobile: true, // Hide on mobile since it's shown in parent column
      render: (value, row) => (
        <div className="min-w-0">
          <span className="truncate">{row.parent_additional_phone || "-"}</span>
        </div>
      )
    },
    {
      key: 'booking_created_at',
      label: 'Date',
      sortable: true,
      width: '100px',
      hideOnMobile: true, // Hide on mobile
      render: (value) => (
        <div className="text-sm">
          {new Date(value).toLocaleDateString()}
        </div>
      )
    },
  ]

  // Handle confirm booking
  const handleConfirmBooking = async (booking: Booking) => {
    try {
      setIsProcessing(booking.booking_id)
      await updateBookingStatus(booking.booking_id, "Confirmed")

      setBookings(bookings.map(b =>
        b.booking_id === booking.booking_id ? { ...b, booking_status: "Confirmed" } : b
      ))

      toast({
        title: "Success",
        description: `Booking #${booking.booking_id} has been confirmed.`,
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to confirm booking.",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(null)
    }
  }

  // Handle cancel booking
  const handleCancelBooking = async (booking: Booking) => {
    try {
      setIsProcessing(booking.booking_id)
      await updateBookingStatus(booking.booking_id, "Cancelled")

      setBookings(bookings.map(b =>
        b.booking_id === booking.booking_id ? { ...b, booking_status: "Cancelled" } : b
      ))

      toast({
        title: "Success",
        description: `Booking #${booking.booking_id} has been cancelled.`,
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to cancel booking.",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(null)
    }
  }

  // Define table actions
  const actions: TableAction<Booking>[] = [
    {
      label: "View Details",
      icon: <Eye className="h-4 w-4 mr-2" />,
      onClick: (booking) => window.open(`/admin/bookings/${booking.booking_id}`, '_blank'),
    },
    {
      label: "Edit",
      icon: <Edit className="h-4 w-4 mr-2" />,
      onClick: (booking) => window.open(`/admin/bookings/${booking.booking_id}/edit`, '_blank'),
    },
    {
      label: "Confirm",
      icon: <Check className="h-4 w-4 mr-2" />,
      onClick: handleConfirmBooking,
      disabled: (booking) => booking.booking_status?.toLowerCase() !== 'pending',
    },
    {
      label: "Cancel",
      icon: <X className="h-4 w-4 mr-2" />,
      onClick: handleCancelBooking,
      variant: "destructive",
      disabled: (booking) => !['pending', 'confirmed'].includes(booking.booking_status?.toLowerCase() || ''),
    },
  ]

  // Define bulk actions
  const bulkActions: BulkAction<Booking>[] = [
    {
      label: "Confirm Selected",
      icon: <CheckCircle className="h-4 w-4 mr-2" />,
      onClick: async (selectedBookings) => {
        const pendingBookings = selectedBookings.filter(b => b.booking_status?.toLowerCase() === 'pending')
        if (pendingBookings.length === 0) {
          toast({
            title: "No Action Needed",
            description: "No pending bookings selected.",
          })
          return
        }

        try {
          await Promise.all(
            pendingBookings.map(booking => updateBookingStatus(booking.booking_id, "Confirmed"))
          )

          setBookings(bookings.map(b =>
            pendingBookings.some(pb => pb.booking_id === b.booking_id)
              ? { ...b, booking_status: "Confirmed" }
              : b
          ))

          toast({
            title: "Success",
            description: `${pendingBookings.length} booking(s) confirmed.`,
          })
        } catch (error: any) {
          toast({
            title: "Error",
            description: "Failed to confirm some bookings.",
            variant: "destructive",
          })
        }
      },
    },
    {
      label: "Cancel Selected",
      icon: <X className="h-4 w-4 mr-2" />,
      variant: "destructive",
      onClick: async (selectedBookings) => {
        const cancellableBookings = selectedBookings.filter(b =>
          ['pending', 'confirmed'].includes(b.booking_status?.toLowerCase() || '')
        )

        if (cancellableBookings.length === 0) {
          toast({
            title: "No Action Needed",
            description: "No cancellable bookings selected.",
          })
          return
        }

        try {
          await Promise.all(
            cancellableBookings.map(booking => updateBookingStatus(booking.booking_id, "Cancelled"))
          )

          setBookings(bookings.map(b =>
            cancellableBookings.some(cb => cb.booking_id === b.booking_id)
              ? { ...b, booking_status: "Cancelled" }
              : b
          ))

          toast({
            title: "Success",
            description: `${cancellableBookings.length} booking(s) cancelled.`,
          })
        } catch (error: any) {
          toast({
            title: "Error",
            description: "Failed to cancel some bookings.",
            variant: "destructive",
          })
        }
      },
    },
  ]

  // Calculate summary statistics for complete bookings
  const confirmedBookings = bookings.filter(b => b.booking_status?.toLowerCase() === 'confirmed').length
  const pendingBookings = bookings.filter(b => b.booking_status?.toLowerCase() === 'pending').length
  const cancelledBookings = bookings.filter(b => b.booking_status?.toLowerCase() === 'cancelled').length
  const completedBookings = bookings.filter(b => b.booking_status?.toLowerCase() === 'completed').length
  const totalRevenue = bookings
    .filter(b => ['confirmed', 'completed'].includes(b.booking_status?.toLowerCase() || ''))
    .reduce((sum, b) => sum + parseFloat(b.total_amount || '0'), 0)

  if (isLoading) {
    return <SkeletonTable />
  }

  if (error) {
    return (
      <EmptyError
        title="Failed to load bookings"
        description={error}
        action={
          <Button onClick={fetchBookings} variant="outline">
            <RefreshCw className="mr-2 h-4 w-4" />
            Try Again
          </Button>
        }
      />
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Complete Bookings</h1>
          <p className="text-muted-foreground">
            Manage all event registrations and bookings
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={fetchBookings} variant="outline" size="sm">
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Summary Statistics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{bookings.length}</div>
            <p className="text-xs text-muted-foreground">Total Bookings</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600">{confirmedBookings}</div>
            <p className="text-xs text-muted-foreground">Confirmed</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-yellow-600">{pendingBookings}</div>
            <p className="text-xs text-muted-foreground">Pending</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-red-600">{cancelledBookings}</div>
            <p className="text-xs text-muted-foreground">Cancelled</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">₹{totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Total Revenue</p>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Filters Section */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold">Filters</h3>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSelectedEventId('all');
                setSelectedGameId('all');
                setSelectedStatus('all');
                setFromDate('');
                setToDate('');
              }}
              className="text-muted-foreground hover:text-foreground"
            >
              <XCircle className="mr-2 h-4 w-4" />
              Clear All
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 lg:gap-6">
            {/* Date Range Filter */}
            <div className="space-y-3">
              <Label className="text-sm font-medium flex items-center gap-2">
                <CalendarDays className="h-4 w-4" />
                Date Range
              </Label>
              <div className="space-y-2">
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="date"
                    value={fromDate}
                    onChange={e => setFromDate(e.target.value)}
                    className="pl-10"
                    placeholder="From date"
                  />
                </div>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="date"
                    value={toDate}
                    onChange={e => setToDate(e.target.value)}
                    className="pl-10"
                    placeholder="To date"
                  />
                </div>
              </div>
            </div>

            {/* Event Filter */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Event</Label>
              <Select value={selectedEventId} onValueChange={setSelectedEventId}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={isLoadingFilters ? "Loading events..." : "Select event"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Events</SelectItem>
                  {events.map((e) => (
                    <SelectItem key={e.id} value={String(e.id)}>
                      {e.event_title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedEventId !== 'all' && (
                <p className="text-xs text-muted-foreground">
                  {events.find(e => String(e.id) === selectedEventId)?.event_title}
                </p>
              )}
            </div>

            {/* Game Filter */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Game</Label>
              <Select value={selectedGameId} onValueChange={setSelectedGameId}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={isLoadingFilters ? "Loading games..." : "Select game"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Games</SelectItem>
                  {games.map((g) => (
                    <SelectItem key={g.id ?? g.game_name} value={String(g.id)}>
                      {g.game_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedGameId !== 'all' && (
                <p className="text-xs text-muted-foreground">
                  {games.find(g => String(g.id) === selectedGameId)?.game_name}
                </p>
              )}
            </div>

            {/* Status Filter */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Status</Label>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  {statusOptions.map((status) => (
                    <SelectItem key={status.id} value={status.value}>
                      {status.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedStatus !== 'all' && (
                <p className="text-xs text-muted-foreground">
                  {statusOptions.find(s => s.value === selectedStatus)?.name}
                </p>
              )}
            </div>

            {/* Filter Summary - Hidden on mobile, shown on larger screens */}
            <div className="hidden lg:block space-y-3">
              <Label className="text-sm font-medium">Active Filters</Label>
              <div className="space-y-2">
                {(fromDate || toDate) && (
                  <div className="flex items-center gap-2 text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                    <Calendar className="h-3 w-3" />
                    {fromDate && toDate ? `${fromDate} to ${toDate}` :
                     fromDate ? `From ${fromDate}` : `Until ${toDate}`}
                  </div>
                )}
                {selectedEventId !== 'all' && (
                  <div className="flex items-center gap-2 text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                    Event: {events.find(e => String(e.id) === selectedEventId)?.event_title}
                  </div>
                )}
                {selectedGameId !== 'all' && (
                  <div className="flex items-center gap-2 text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                    Game: {games.find(g => String(g.id) === selectedGameId)?.game_name}
                  </div>
                )}
                {selectedStatus !== 'all' && (
                  <div className="flex items-center gap-2 text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">
                    Status: {statusOptions.find(s => s.value === selectedStatus)?.name}
                  </div>
                )}
                {fromDate === '' && toDate === '' && selectedEventId === 'all' && selectedGameId === 'all' && selectedStatus === 'all' && (
                  <p className="text-xs text-muted-foreground">No filters applied</p>
                )}
              </div>
            </div>
          </div>

          {/* Mobile Filter Summary - Shown only on smaller screens */}
          <div className="lg:hidden">
            <div className="flex flex-wrap gap-2 mt-4">
              {(fromDate || toDate) && (
                <Badge variant="secondary" className="text-xs">
                  <Calendar className="h-3 w-3 mr-1" />
                  {fromDate && toDate ? `${fromDate} to ${toDate}` :
                   fromDate ? `From ${fromDate}` : `Until ${toDate}`}
                </Badge>
              )}
              {selectedEventId !== 'all' && (
                <Badge variant="secondary" className="text-xs">
                  Event: {events.find(e => String(e.id) === selectedEventId)?.event_title}
                </Badge>
              )}
              {selectedGameId !== 'all' && (
                <Badge variant="secondary" className="text-xs">
                  Game: {games.find(g => String(g.id) === selectedGameId)?.game_name}
                </Badge>
              )}
              {selectedStatus !== 'all' && (
                <Badge variant="secondary" className="text-xs">
                  Status: {statusOptions.find(s => s.value === selectedStatus)?.name}
                </Badge>
              )}
            </div>
          </div>

          <Separator className="my-4" />

          {/* Results Summary */}
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>
              Showing {filteredBookings.length} of {bookings.length} bookings
            </span>
            {filteredBookings.length !== bookings.length && (
              <span className="text-primary font-medium">
                {bookings.length - filteredBookings.length} filtered out
              </span>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Data Table */}
      <EnhancedDataTable
        data={filteredBookings}
        columns={columns}
        actions={actions}
        bulkActions={bulkActions}
        loading={isLoading}
        searchable={true}
        filterable={true}
        exportable={true}
        selectable={true}
        pagination={true}
        pageSize={25}
        exportColumns={createBookingExportColumns()}
        exportTitle="NIBOG Complete Bookings Report"
        exportFilename="nibog-complete-bookings"
        emptyMessage="No bookings found"
        onRefresh={fetchBookings}
        className="min-h-[400px]"
      />
    </div>
  )
}
