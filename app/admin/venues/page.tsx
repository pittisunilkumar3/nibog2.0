"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Plus, Search, Filter, Eye, Edit, Trash, AlertTriangle, Loader2, RefreshCw, Building, Calendar, MapPin, Users } from "lucide-react"
import EnhancedDataTable, { Column, TableAction, BulkAction } from "@/components/admin/enhanced-data-table"
import { createVenueExportColumns } from "@/lib/export-utils"
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
import { getAllVenuesWithCity, deleteVenue } from "@/services/venueService"
import { getAllCities } from "@/services/cityService"
import { useToast } from "@/components/ui/use-toast"

// Interface for venue with city details
interface VenueWithCity {
  venue_id: number;
  venue_name: string;
  address: string;
  capacity: number;
  venue_is_active: boolean;
  venue_created_at: string;
  venue_updated_at: string;
  city_id: number;
  city_name: string;
  state: string;
  city_is_active: boolean;
  city_created_at: string;
  city_updated_at: string;
  events?: number; // This is not in the API but we'll add it for UI consistency
}

export default function VenuesPage() {
  const { toast } = useToast()
  const [venuesList, setVenuesList] = useState<VenueWithCity[]>([])
  const [cities, setCities] = useState<Array<{ id: number, city_name: string }>>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isDeleting, setIsDeleting] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCity, setSelectedCity] = useState("all")

  // Fetch venues and cities data
  const fetchData = async () => {
    try {
      setError(null)

        // Fetch venues with city details
        const venuesData = await getAllVenuesWithCity()

        console.log("Venues data received:", venuesData)

        // Check if we have valid data
        if (!Array.isArray(venuesData) || venuesData.length === 0) {
          console.log("No venues data found or invalid data format")
          setVenuesList([])
        } else {
          // Normalize the data to ensure it matches our expected structure
          const normalizedVenues = venuesData
            .filter(venue =>
              (venue.venue_id || venue.id) &&
              (venue.venue_name || venue.name) &&
              (venue.address || "") !== "" &&
              (venue.city_name || "") !== ""
            )
            .map(venue => {
              // Log the venue data to help diagnose issues
              console.log("Processing venue:", venue)
      
              // Create a normalized venue object with all required fields
              return {
                venue_id: venue.venue_id || venue.id || 0,
                venue_name: venue.venue_name || venue.name || "Unknown Venue",
                address: venue.address || "No address provided",
                capacity: venue.capacity || 0,
                venue_is_active: venue.venue_is_active !== undefined ? venue.venue_is_active :
                                (venue.is_active !== undefined ? venue.is_active : false),
                venue_created_at: venue.venue_created_at || venue.created_at || new Date().toISOString(),
                venue_updated_at: venue.venue_updated_at || venue.updated_at || new Date().toISOString(),
                city_id: venue.city_id || 0,
                city_name: venue.city_name || "Unknown City",
                state: venue.state || "",
                city_is_active: venue.city_is_active !== undefined ? venue.city_is_active : true,
                city_created_at: venue.city_created_at || new Date().toISOString(),
                city_updated_at: venue.city_updated_at || new Date().toISOString(),
                events: Number(venue.event_count) || 0 // Use event_count from API
              }
            })
    
          console.log("Normalized venues:", normalizedVenues)
          setVenuesList(normalizedVenues)
        }

        // Fetch cities for the filter dropdown
        const citiesData = await getAllCities()
        console.log("Cities data received:", citiesData)
        setCities(
          citiesData
            .filter(city => typeof city.id === "number")
            .map(city => ({ id: city.id ?? 0, city_name: city.city_name }))
        )
      } catch (error: any) {
        console.error("Failed to fetch data:", error)
        setError(error.message || "Failed to load venues. Please try again.")
        toast({
          title: "Error",
          description: error.message || "Failed to load venues. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
        setIsRefreshing(false)
      }
    }

  // Fetch data on component mount
  useEffect(() => {
    setIsLoading(true)
    fetchData()
  }, [])

  // Handle refresh
  const handleRefresh = async () => {
    setIsRefreshing(true)
    await fetchData()
    toast({
      title: "Success",
      description: "Venues data refreshed successfully.",
    })
  }

  // Define table columns
  const columns: Column<VenueWithCity>[] = [
    {
      key: 'venue_name',
      label: 'Venue Name',
      sortable: true,
      priority: 1, // Highest priority for mobile
      render: (value, row) => (
        <div>
          <div className="font-medium">{value}</div>
          <div className="text-xs text-muted-foreground truncate">{row.address}</div>
        </div>
      )
    },
    {
      key: 'city_name',
      label: 'City',
      sortable: true,
      priority: 2, // Second priority for mobile
      render: (value, row) => (
        <div>
          <div className="font-medium">{value}</div>
          <div className="text-xs text-muted-foreground">{row.state}</div>
        </div>
      )
    },
    {
      key: 'venue_is_active',
      label: 'Status',
      sortable: true,
      priority: 3, // Third priority for mobile
      render: (value) => (
        <Badge className={value ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600'}>
          {value ? 'Active' : 'Inactive'}
        </Badge>
      )
    },
    {
      key: 'venue_id',
      label: 'ID',
      sortable: true,
      width: '80px',
      hideOnMobile: true // Hide on mobile to save space
    },
    {
      key: 'capacity',
      label: 'Capacity',
      sortable: true,
      align: 'right',
      hideOnMobile: true, // Hide on mobile to save space
      render: (value) => value || 'N/A'
    },
    {
      key: 'events',
      label: 'Events',
      sortable: true,
      align: 'right',
      hideOnMobile: true, // Hide on mobile to save space
      render: (value) => (
        <div className="text-center">
          <div className="font-semibold text-primary">{value || 0}</div>
          <div className="text-xs text-muted-foreground">Total Events</div>
        </div>
      )
    },
    {
      key: 'venue_created_at',
      label: 'Created',
      sortable: true,
      hideOnMobile: true, // Hide on mobile to save space
      render: (value) => new Date(value).toLocaleDateString()
    }
  ]

  // Define table actions
  const actions: TableAction<VenueWithCity>[] = [
    {
      label: "View",
      icon: <Eye className="h-4 w-4" />,
      onClick: (venue) => {
        window.location.href = `/admin/venues/${venue.venue_id}`
      }
    },
    {
      label: "Edit",
      icon: <Edit className="h-4 w-4" />,
      onClick: (venue) => {
        window.location.href = `/admin/venues/${venue.venue_id}/edit`
      }
    },
    {
      label: "Delete",
      icon: <Trash className="h-4 w-4" />,
      onClick: (venue) => handleDeleteVenue(venue.venue_id),
      disabled: (venue) => isDeleting === venue.venue_id,
      variant: 'destructive'
    }
  ]

  // Define bulk actions
  const bulkActions: BulkAction<VenueWithCity>[] = [
    {
      label: "Delete Selected",
      icon: <Trash className="h-4 w-4" />,
      onClick: (selectedVenues) => {
        // Handle bulk delete - would need confirmation dialog
        console.log("Bulk delete:", selectedVenues)
      },
      variant: 'destructive'
    }
  ]

  // Handle venue deletion
  const handleDeleteVenue = async (id: number) => {
    try {
      setIsDeleting(id)

      // Call the API to delete the venue
      const result = await deleteVenue(id)

      if (result.success) {
        // Remove the deleted venue from the list
        setVenuesList(venuesList.filter(venue => venue.venue_id !== id))

        toast({
          title: "Success",
          description: "Venue deleted successfully",
        })
      } else {
        throw new Error("Failed to delete venue. Please try again.")
      }
    } catch (error: any) {
      console.error("Error deleting venue:", error)

      toast({
        title: "Error",
        description: error.message || "Failed to delete venue. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(null)
    }
  }



  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">NIBOG Venues</h1>
          <p className="text-sm sm:text-base text-muted-foreground">Manage venues where NIBOG events are held</p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="touch-manipulation"
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button asChild className="touch-manipulation">
            <Link href="/admin/venues/new">
              <Plus className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Add New Venue</span>
              <span className="sm:hidden">New Venue</span>
            </Link>
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Venues</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{venuesList.length}</div>
            <p className="text-xs text-muted-foreground">
              {venuesList.filter(v => v.venue_is_active).length} active
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Events</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {venuesList.reduce((sum, venue) => sum + (venue.events || 0), 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Across all venues
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cities Covered</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Set(venuesList.map(v => v.city_name)).size}
            </div>
            <p className="text-xs text-muted-foreground">
              Unique cities
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Capacity</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round(venuesList.reduce((sum, venue) => sum + (venue.capacity || 0), 0) / venuesList.length) || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Per venue
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
              <Input
                placeholder="Search venues..."
                className="pl-9 h-10 touch-manipulation"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Filter className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <Select value={selectedCity} onValueChange={setSelectedCity} disabled={isLoading}>
                <SelectTrigger className="h-10 w-full sm:w-[180px] touch-manipulation">
                  <SelectValue placeholder="All Cities" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all" className="touch-manipulation">All Cities</SelectItem>
                  {cities.map((city) => (
                    <SelectItem key={city.id} value={city.city_name} className="touch-manipulation">
                      {city.city_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Data Table */}
      <EnhancedDataTable
        data={venuesList}
        columns={columns}
        actions={actions}
        bulkActions={bulkActions}
        loading={isLoading}
        searchable={false} // We have custom search above
        filterable={false} // We have custom filters above
        exportable={true}
        selectable={true}
        pagination={true}
        pageSize={25}
        exportColumns={createVenueExportColumns()}
        exportTitle="NIBOG Venues Report"
        exportFilename="nibog-venues"
        emptyMessage="No venues found"
        onRefresh={handleRefresh}
        className="min-h-[400px]"
      />

      {error && (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-4 w-4" />
              <span>{error}</span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
