"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Plus, Search, Filter, Eye, Edit, Trash, Star, AlertTriangle, Check, X, Loader2, RefreshCw } from "lucide-react"
import EnhancedDataTable, { Column, TableAction, BulkAction } from "@/components/admin/enhanced-data-table"
import { ExportColumn } from "@/lib/export-utils"
import { useToast } from "@/components/ui/use-toast"
import { getAllTestimonials, deleteTestimonial, updateTestimonialStatus, type TestimonialWithImage } from "@/services/testimonialService"
import { getAllEvents } from "@/services/eventService"
import { getAllCities } from "@/services/cityService"

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

// Testimonial statuses
const statuses = [
  { id: "1", name: "Published" },
  { id: "2", name: "Pending" },
  { id: "3", name: "Rejected" },
]

const getStatusBadge = (status: string) => {
  switch (status.toLowerCase()) {
    case "published":
      return <Badge className="bg-green-500 hover:bg-green-600">Published</Badge>
    case "pending":
      return <Badge className="bg-yellow-500 hover:bg-yellow-600">Pending</Badge>
    case "rejected":
      return <Badge className="bg-red-500 hover:bg-red-600">Rejected</Badge>
    default:
      return <Badge variant="outline">{status}</Badge>
  }
}

const getRatingStars = (rating: number) => {
  return (
    <div className="flex items-center">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`h-4 w-4 ${i < rating ? "fill-yellow-500 text-yellow-500" : "text-gray-300"}`}
        />
      ))}
    </div>
  )
}

export default function TestimonialsPage() {
  const { toast } = useToast()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [selectedEvent, setSelectedEvent] = useState("all")
  const [selectedCity, setSelectedCity] = useState("all")
  const [testimonialsList, setTestimonialsList] = useState<TestimonialWithImage[]>([])
  const [events, setEvents] = useState<any[]>([])
  const [cities, setCities] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState<string | null>(null)

  // Fetch real data from database
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        setError(null)

        console.log("Fetching testimonials data from database...")

        // Fetch all data from APIs
        const [testimonialsData, eventsData, citiesData] = await Promise.all([
          getAllTestimonials(),
          getAllEvents(),
          getAllCities()
        ])

        console.log("Data received:", {
          testimonials: testimonialsData?.length || 0,
          events: eventsData?.length || 0,
          cities: citiesData?.length || 0
        })

        // Debug: Log the first few items to see the structure
        if (testimonialsData && testimonialsData.length > 0) {
          console.log("Sample testimonial:", testimonialsData[0])
        }
        if (eventsData && eventsData.length > 0) {
          console.log("Sample event:", eventsData[0])
        }
        if (citiesData && citiesData.length > 0) {
          console.log("Sample city:", citiesData[0])
        }

        // Set the data
        setTestimonialsList(testimonialsData || [])
        setEvents(eventsData || [])
        setCities(citiesData || [])

        console.log(`Successfully loaded ${testimonialsData?.length || 0} testimonials from database`)

      } catch (error: any) {
        console.error("Failed to fetch testimonials data:", error)
        setError(error.message || "Failed to load testimonials data")
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, []) // Remove toast from dependencies to prevent infinite loop

  // Handle refresh data
  const handleRefreshData = async () => {
    try {
      setIsLoading(true)
      setError(null)

      console.log("Refreshing all data...")

      // Fetch all data from APIs
      const [testimonialsData, eventsData, citiesData] = await Promise.all([
        getAllTestimonials(),
        getAllEvents(),
        getAllCities()
      ])

      // Set the data
      setTestimonialsList(testimonialsData || [])
      setEvents(eventsData || [])
      setCities(citiesData || [])

      console.log("Refreshed data:", {
        testimonials: testimonialsData?.length || 0,
        events: eventsData?.length || 0,
        cities: citiesData?.length || 0
      })
    } catch (error: any) {
      console.error("Failed to refresh data:", error)
      setError(error.message || "Failed to refresh data")
    } finally {
      setIsLoading(false)
    }
  }

  // Handle delete testimonial
  const handleDeleteTestimonial = async (id: number) => {
    try {
      setIsProcessing(String(id))

      // Use local API instead of external API
      const response = await fetch('/api/testimonials/delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id })
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('Delete API error:', errorText)
        throw new Error('Failed to delete testimonial')
      }

      const data = await response.json()
      console.log('Delete response:', data)

      if (!data[0]?.success) {
        throw new Error('Delete operation failed')
      }

      // Remove from local state
      setTestimonialsList(testimonialsList.filter(testimonial => testimonial.id !== id))

      toast({
        title: "Success",
        description: "Testimonial deleted successfully",
      })
    } catch (error: any) {
      console.error("Failed to delete testimonial:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to delete testimonial. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(null)
    }
  }

  // Handle approve testimonial
  const handleApproveTestimonial = async (id: number) => {
    try {
      setIsProcessing(String(id))

      await updateTestimonialStatus(id, "Published")

      // Update local state
      setTestimonialsList(testimonialsList.map(testimonial => {
        if (testimonial.id === id) {
          return {
            ...testimonial,
            status: "Published"
          }
        }
        return testimonial
      }))

      toast({
        title: "Success",
        description: "Testimonial approved successfully",
      })
    } catch (error: any) {
      console.error("Failed to approve testimonial:", error)
      toast({
        title: "Error",
        description: "Failed to approve testimonial. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(null)
    }
  }

  // Handle reject testimonial
  const handleRejectTestimonial = async (id: number) => {
    try {
      setIsProcessing(String(id))

      await updateTestimonialStatus(id, "Rejected")

      // Update local state
      setTestimonialsList(testimonialsList.map(testimonial => {
        if (testimonial.id === id) {
          return {
            ...testimonial,
            status: "Rejected"
          }
        }
        return testimonial
      }))

      toast({
        title: "Success",
        description: "Testimonial rejected successfully",
      })
    } catch (error: any) {
      console.error("Failed to reject testimonial:", error)
      toast({
        title: "Error",
        description: "Failed to reject testimonial. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(null)
    }
  }

  // Get event name by ID
  const getEventName = (eventId: number) => {
    if (!eventId || !events || events.length === 0) {
      return `Event ${eventId}`
    }

    const event = events.find(e =>
      Number(e.event_id) === Number(eventId) ||
      Number(e.id) === Number(eventId)
    )

    if (event) {
      const eventName = event.event_title || event.title || event.name
      console.log(`Found event for ID ${eventId}:`, eventName)
      return eventName
    }

    console.log(`No event found for ID ${eventId}. Available events:`, events.map(e => ({ id: e.event_id || e.id, name: e.event_title || e.title || e.name })))
    return `Event ${eventId}`
  }

  // Filter testimonials based on search and filters
  const filteredTestimonials = testimonialsList.filter((testimonial) => {
    // Search query filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      const searchableFields = [
        testimonial.name?.toLowerCase() || '',
        testimonial.testimonial?.toLowerCase() || '',
        testimonial.city?.toLowerCase() || '',
        getEventName(testimonial.event_id)?.toLowerCase() || ''
      ]

      const matchesSearch = searchableFields.some(field =>
        field.includes(query)
      )

      if (!matchesSearch) {
        return false
      }
    }

    // Status filter
    if (selectedStatus !== "all" && testimonial.status.toLowerCase() !== selectedStatus.toLowerCase()) {
      return false
    }

    // Event filter
    if (selectedEvent !== "all" && getEventName(testimonial.event_id) !== selectedEvent) {
      return false
    }

    // City filter
    if (selectedCity !== "all" && testimonial.city !== selectedCity) {
      return false
    }

    return true
  })

  // Loading state
  if (isLoading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <h2 className="text-xl font-semibold">Loading testimonials...</h2>
          <p className="text-muted-foreground">Please wait while we fetch the testimonials data.</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <div className="text-center space-y-4">
          <AlertTriangle className="h-8 w-8 mx-auto text-destructive" />
          <h2 className="text-xl font-semibold">Error loading testimonials</h2>
          <p className="text-muted-foreground max-w-md">{error}</p>
          <div className="flex gap-2 justify-center">
            <Button variant="outline" onClick={handleRefreshData}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Try Again
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // Define table columns for EnhancedDataTable
  const columns: Column<TestimonialWithImage>[] = [
    {
      key: 'name',
      label: 'Parent Name',
      sortable: true,
      priority: 1, // Most important for mobile
    },
    {
      key: 'city',
      label: 'City',
      sortable: true,
      priority: 3, // Less important on mobile
      hideOnMobile: true,
      // No render function needed - city names are stored directly
    },
    {
      key: 'event_id',
      label: 'Event',
      sortable: true,
      priority: 2, // Important for mobile
      render: (value, row) => {
        // Try to find the event title from the events list
        const event = events.find(e => (e.event_id || e.id) === value);
        return event ? (event.event_title || event.title || event.name || `Event #${value}`) : `Event #${value}`;
      }
    },
    {
      key: 'rating',
      label: 'Rating',
      sortable: true,
      priority: 2, // Important for mobile
      render: (value) => getRatingStars(value)
    },
    {
      key: 'testimonial',
      label: 'Testimonial',
      priority: 4, // Hide on mobile due to length
      hideOnMobile: true,
      render: (value) => (
        <div className="max-w-xs truncate" title={value}>
          {value}
        </div>
      )
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      priority: 2, // Important for mobile
      render: (value) => getStatusBadge(value)
    },
    {
      key: 'submitted_at',
      label: 'Date',
      sortable: true,
      priority: 4, // Hide on mobile
      hideOnMobile: true,
      render: (value) => value ? new Date(value).toLocaleDateString() : 'N/A'
    }
  ]

  // Define table actions
  const actions: TableAction<TestimonialWithImage>[] = [
    {
      label: "View",
      icon: <Eye className="h-4 w-4" />,
      onClick: (testimonial: TestimonialWithImage) => {
        window.location.href = `/admin/testimonials/${testimonial.id}`
      }
    },
    {
      label: "Edit",
      icon: <Edit className="h-4 w-4" />,
      onClick: (testimonial: TestimonialWithImage) => {
        window.location.href = `/admin/testimonials/${testimonial.id}/edit`
      }
    },
    {
      label: "Approve",
      icon: <Check className="h-4 w-4" />,
      onClick: (testimonial: TestimonialWithImage) => handleApproveTestimonial(testimonial.id),
      disabled: (testimonial: TestimonialWithImage) => testimonial.status?.toLowerCase() !== 'pending'
    },
    {
      label: "Reject",
      icon: <X className="h-4 w-4" />,
      onClick: (testimonial: TestimonialWithImage) => handleRejectTestimonial(testimonial.id),
      variant: 'destructive',
      disabled: (testimonial: TestimonialWithImage) => testimonial.status?.toLowerCase() !== 'pending'
    },
    {
      label: "Delete",
      icon: <Trash className="h-4 w-4" />,
      onClick: (testimonial: TestimonialWithImage) => handleDeleteTestimonial(testimonial.id),
      variant: 'destructive'
    }
  ]

  // Define bulk actions
  const bulkActions: BulkAction<TestimonialWithImage>[] = [
    {
      label: "Approve Selected",
      icon: <Check className="h-4 w-4" />,
      onClick: (selectedTestimonials: TestimonialWithImage[]) => {
        selectedTestimonials.forEach(testimonial => {
          if (testimonial.status?.toLowerCase() === 'pending') {
            handleApproveTestimonial(testimonial.id)
          }
        })
      }
    },
    {
      label: "Delete Selected",
      icon: <Trash className="h-4 w-4" />,
      onClick: (selectedTestimonials: TestimonialWithImage[]) => {
        selectedTestimonials.forEach(testimonial => handleDeleteTestimonial(testimonial.id))
      },
      variant: 'destructive'
    }
  ]

  // Define export columns
  const exportColumns: ExportColumn<TestimonialWithImage>[] = [
    { key: 'name', label: 'Parent Name' },
    { key: 'city', label: 'City' },
    { key: 'event_id', label: 'Event ID' },
    { key: 'rating', label: 'Rating' },
    { key: 'testimonial', label: 'Testimonial' },
    { key: 'status', label: 'Status' },
    { key: 'submitted_at', label: 'Date' }
  ]

  return (
    <div className="mobile-space-y">
      <div className="flex flex-col gap-3 sm:gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="mobile-text-xl font-bold tracking-tight">Testimonials</h1>
          <p className="text-muted-foreground mobile-text-sm">Manage parent testimonials for NIBOG events</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={handleRefreshData} disabled={isLoading} className="mobile-button">
            <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button asChild className="mobile-button">
            <Link href="/admin/testimonials/new">
              <Plus className="mr-2 h-4 w-4" />
              Add New Testimonial
            </Link>
          </Button>
        </div>
      </div>

      <Card className="mobile-card">
        <CardContent className="mobile-card-content pt-6">
          <div className="flex flex-col gap-3 sm:gap-4 sm:flex-row sm:items-center">
            <div className="flex items-center gap-2 flex-1">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search testimonials..."
                className="mobile-button mobile-text-sm w-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-2">
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="mobile-button w-full sm:w-[150px]">
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  {statuses.map((status) => (
                    <SelectItem key={status.id} value={status.name}>
                      {status.name.charAt(0).toUpperCase() + status.name.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedEvent} onValueChange={setSelectedEvent}>
                <SelectTrigger className="mobile-button w-full sm:w-[180px]">
                  <SelectValue placeholder="All Events" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Events</SelectItem>
                  {events.map((event) => (
                    <SelectItem key={event.event_id || event.id} value={event.event_title || event.title || event.name}>
                      {event.event_title || event.title || event.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedCity} onValueChange={setSelectedCity}>
                <SelectTrigger className="mobile-button w-full sm:w-[150px]">
                  <SelectValue placeholder="All Cities" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Cities</SelectItem>
                  {cities.map((city) => (
                    <SelectItem key={city.id} value={city.city_name || city.name}>
                      {city.city_name || city.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <EnhancedDataTable
        data={filteredTestimonials}
        columns={columns}
        actions={actions}
        bulkActions={bulkActions}
        loading={false}
        searchable={false} // We have custom search above
        filterable={false} // We have custom filters above
        exportable={true}
        selectable={true}
        pagination={true}
        pageSize={25}
        exportColumns={exportColumns}
        exportTitle="NIBOG Testimonials Report"
        exportFilename="nibog-testimonials"
        emptyMessage="No testimonials found"
        className="min-h-[400px]"
      />
    </div>
  )
}
