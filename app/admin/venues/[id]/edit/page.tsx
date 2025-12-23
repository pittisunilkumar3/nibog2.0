"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Save, Loader2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { getVenueById, updateVenue } from "@/services/venueService"
import { getAllCities, getCityById } from "@/services/cityService"
import { City } from "@/types/city"

type Props = {
  params: { id: string }
}

export default function EditVenuePage({ params }: Props) {
  const router = useRouter()
  const { toast } = useToast()
  const venueId = parseInt(params.id)

  const [venue, setVenue] = useState<any>(null)
  const [venueName, setVenueName] = useState("")
  const [cityId, setCityId] = useState("")
  const [address, setAddress] = useState("")
  const [capacity, setCapacity] = useState("")
  const [isActive, setIsActive] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [isSaved, setIsSaved] = useState(false)
  const [isLoadingData, setIsLoadingData] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [cities, setCities] = useState<City[]>([])

  // Fetch venue data and cities on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoadingData(true)
        setError(null)

        // Fetch cities
        const citiesData = await getAllCities()
        setCities(citiesData)

        // Fetch venue data
        const venueData = await getVenueById(venueId)
        setVenue(venueData)

        // Set form values
        setVenueName(venueData.venue_name || venueData.name || "")
        setCityId(venueData.city_id ? venueData.city_id.toString() : "")
        setAddress(venueData.address || "")
        setCapacity(venueData.capacity ? venueData.capacity.toString() : "")
        setIsActive(venueData.is_active || venueData.venue_is_active || false)
      } catch (error: any) {
        console.error("Failed to fetch data:", error)
        setError(error.message || "Failed to load venue data. Please try again.")
      } finally {
        setIsLoadingData(false)
      }
    }

    fetchData()
  }, [venueId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      setIsLoading(true)

      // Prepare venue data for update
      const venueData = {
        id: venueId,
        venue_name: venueName,
        city_id: parseInt(cityId),
        address,
        capacity: parseInt(capacity),
        is_active: isActive
      }
      // Call the API to update the venue
      const updatedVenue = await updateVenue(venueData)
      // Additional validation to ensure the update was successful
      if (!updatedVenue) {
        throw new Error("Update returned empty response")
      }

      setIsSaved(true)

      toast({
        title: "Success",
        description: "Venue updated successfully",
      })

      // Reset the saved state after 1.5 seconds and redirect
      setTimeout(() => {
        setIsSaved(false)
        // Redirect to the venues list page
        router.push('/admin/venues')
      }, 1500)
    } catch (error: any) {
      console.error("Error updating venue:", error)

      toast({
        title: "Error",
        description: error.message || "Failed to update venue. Please try again.",
        variant: "destructive",
      })

      setIsLoading(false)
    }
  }

  if (isLoadingData) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <h2 className="text-xl font-semibold">Loading venue data...</h2>
        </div>
      </div>
    )
  }

  if (error || !venue) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold">Venue not found</h2>
          <p className="text-muted-foreground">{error || "The venue you are looking for does not exist."}</p>
          <Button className="mt-4" onClick={() => router.push("/admin/venues")}>
            Back to Venues
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 min-w-0">
          <Button variant="outline" size="icon" asChild className="touch-manipulation flex-shrink-0">
            <Link href="/admin/venues">
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Back</span>
            </Link>
          </Button>
          <div className="min-w-0 flex-1">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight truncate">Edit Venue</h1>
            <p className="text-sm sm:text-base text-muted-foreground truncate">Update venue information for NIBOG events</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Venue Information</CardTitle>
            <CardDescription>Update the venue details below</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Venue Name</Label>
              <Input
                id="name"
                value={venueName}
                onChange={(e) => setVenueName(e.target.value)}
                placeholder="Enter venue name"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Select value={cityId} onValueChange={setCityId} required>
                <SelectTrigger id="city">
                  <SelectValue placeholder="Select city" />
                </SelectTrigger>
                <SelectContent>
                  {cities.map((city) => (
                    <SelectItem key={city.id} value={city.id.toString()}>
                      {city.city_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Enter venue address"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="capacity">Capacity</Label>
              <Input
                id="capacity"
                type="number"
                value={capacity}
                onChange={(e) => setCapacity(e.target.value)}
                placeholder="Enter venue capacity"
                min="1"
                required
              />
            </div>

            <Separator className="my-4" />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="active-status">Active Status</Label>
                <p className="text-sm text-muted-foreground">
                  Inactive venues will not be shown on the website
                </p>
              </div>
              <Switch
                id="active-status"
                checked={isActive}
                onCheckedChange={setIsActive}
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" type="button" asChild>
              <Link href="/admin/venues">
                Cancel
              </Link>
            </Button>
            <Button type="submit" disabled={isLoading || isSaved}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : isSaved ? (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Saved
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </>
              )}
            </Button>
          </CardFooter>
        </Card>

        <div className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Venue Information</CardTitle>
              <CardDescription>Current venue details</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-lg border p-4">
                  <h3 className="text-sm font-medium text-muted-foreground">Venue ID</h3>
                  <p className="mt-2 text-2xl font-bold">{venue.id || venue.venue_id}</p>
                </div>
                <div className="rounded-lg border p-4">
                  <h3 className="text-sm font-medium text-muted-foreground">Capacity</h3>
                  <p className="mt-2 text-2xl font-bold">{venue.capacity}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </form>
    </div>
  )
}
