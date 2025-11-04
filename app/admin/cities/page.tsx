"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Plus, Search, Eye, Edit, Trash, AlertTriangle, Loader2, RefreshCw } from "lucide-react"
import EnhancedDataTable, { Column, TableAction, BulkAction } from "@/components/admin/enhanced-data-table"
import { ExportColumn } from "@/lib/export-utils"
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
import { getAllCities, deleteCity, City } from "@/services/cityService"
import { toast } from "@/components/ui/use-toast"

export default function CitiesPage() {
  const [citiesList, setCitiesList] = useState<City[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isDeleting, setIsDeleting] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Fetch cities data
  const fetchCities = async () => {
    try {
      setError(null)
      console.log("Fetching all cities...")
      const cities = await getAllCities()
      console.log("Cities data received:", cities)
      setCitiesList(cities)
    } catch (err: any) {
      console.error("Failed to fetch cities:", err)
      setError(`Failed to load cities: ${err.message || "Please try again later."}`)
      toast({
        title: "Error",
        description: `Failed to load cities: ${err.message || "Please try again later."}`,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }

  // Fetch cities on component mount
  useEffect(() => {
    setIsLoading(true)
    fetchCities()
  }, [])

  // Handle refresh
  const handleRefresh = async () => {
    setIsRefreshing(true)
    await fetchCities()
    toast({
      title: "Success",
      description: "Cities data refreshed successfully.",
    })
  }

  // Define table columns
  const columns: Column<City>[] = [
    {
      key: 'city_name',
      label: 'City Name',
      sortable: true,
      priority: 1 // Highest priority for mobile
    },
    {
      key: 'state',
      label: 'State',
      sortable: true,
      priority: 2, // Second priority for mobile
      render: (value) => value || 'N/A'
    },
    {
      key: 'is_active',
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
      key: 'id',
      label: 'ID',
      sortable: true,
      width: '80px',
      hideOnMobile: true // Hide on mobile to save space
    },
    {
      key: 'venues',
      label: 'Total Venues',
      sortable: true,
      align: 'right',
      hideOnMobile: true, // Hide on mobile to save space
      render: (value) => value || 0
    },
    {
      key: 'events',
      label: 'Total Events',
      sortable: true,
      align: 'right',
      hideOnMobile: true, // Hide on mobile to save space
      render: (value) => value || 0
    },
    {
      key: 'created_at',
      label: 'Created',
      sortable: true,
      render: (value) => value ? new Date(value).toLocaleDateString() : 'N/A'
    }
  ]

  // Define table actions
  const actions: TableAction<City>[] = [
    {
      label: "View",
      icon: <Eye className="h-4 w-4" />,
      onClick: (city) => {
        window.location.href = `/admin/cities/${city.id}`
      }
    },
    {
      label: "Edit",
      icon: <Edit className="h-4 w-4" />,
      onClick: (city) => {
        window.location.href = `/admin/cities/${city.id}/edit`
      }
    },
    {
      label: "Delete",
      icon: <Trash className="h-4 w-4" />,
      onClick: (city) => handleDeleteCity(city.id!),
      disabled: (city) => isDeleting === city.id,
      variant: 'destructive'
    }
  ]

  // Define bulk actions
  const bulkActions: BulkAction<City>[] = [
    {
      label: "Delete Selected",
      icon: <Trash className="h-4 w-4" />,
      onClick: (selectedCities) => {
        // Handle bulk delete - would need confirmation dialog
        console.log("Bulk delete:", selectedCities)
      },
      variant: 'destructive'
    }
  ]

  // Handle city deletion
  const handleDeleteCity = async (id: number) => {
    try {
      setIsDeleting(id)
      console.log(`Initiating delete for city ID: ${id}`)

      // Add a delay to ensure UI feedback
      await new Promise(resolve => setTimeout(resolve, 500))

      // Call the delete API
      const result = await deleteCity(id)
      console.log(`Delete result:`, result)

      if (result && result.success) {
        // Always refresh the list from the server to ensure data consistency
        try {
          console.log("Refreshing city list after deletion...")
          const refreshedCities = await getAllCities()
          setCitiesList(refreshedCities)

          // Check if the city was actually deleted
          const cityStillExists = refreshedCities.some(city => city.id === id)

          if (cityStillExists) {
            console.error(`City with ID ${id} still exists after deletion!`)
            throw new Error("City was not deleted from the database. Please try again.")
          } else {
            toast({
              title: "Success",
              description: "City deleted successfully",
            })
          }
        } catch (refreshErr: any) {
          console.error("Failed to refresh cities after deletion:", refreshErr)

          // If we can't verify the deletion, assume it worked but warn the user
          toast({
            title: "Warning",
            description: "City may have been deleted, but we couldn't verify. Please refresh the page.",
            variant: "destructive",
          })

          // Remove the city from the local state as a fallback
          setCitiesList(prevList => prevList.filter(city => city.id !== id))
        }
      } else {
        throw new Error("Failed to delete city: API returned unsuccessful result")
      }
    } catch (err: any) {
      console.error(`Failed to delete city with ID ${id}:`, err)
      toast({
        title: "Error",
        description: `Failed to delete city: ${err.message || "Please try again later."}`,
        variant: "destructive",
      })
    } finally {
      setIsDeleting(null)
    }
  }

  // Define export columns
  const exportColumns: ExportColumn<any>[] = [
    { key: 'id', label: 'City ID', width: 80 },
    { key: 'city_name', label: 'City Name', width: 150 },
    { key: 'state', label: 'State', width: 100 },
    { key: 'is_active', label: 'Status', width: 80, format: (value: any) => value ? 'Active' : 'Inactive' },
    { key: 'venues', label: 'Total Venues', width: 100, align: 'right' },
    { key: 'events', label: 'Total Events', width: 100, align: 'right' },
    { key: 'created_at', label: 'Created At', width: 120, format: (value: any) => value ? new Date(value).toLocaleDateString() : 'N/A' },
  ]

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">NIBOG Cities</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Manage cities where NIBOG events are held
            {!isLoading && (
              <span className="block sm:inline sm:ml-2 text-sm font-medium">
                Total: {citiesList.length} cities
              </span>
            )}
          </p>
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
            <Link href="/admin/cities/new">
              <Plus className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Add New City</span>
              <span className="sm:hidden">New City</span>
            </Link>
          </Button>
        </div>
      </div>

      {/* Enhanced Data Table */}
      <EnhancedDataTable
        data={citiesList}
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
        exportColumns={exportColumns}
        exportTitle="NIBOG Cities Report"
        exportFilename="nibog-cities"
        emptyMessage="No cities found"
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
