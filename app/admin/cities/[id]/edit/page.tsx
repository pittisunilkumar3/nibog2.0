"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { ArrowLeft, Save, Loader2 } from "lucide-react"
import { getCityById, updateCity, City } from "@/services/cityService"
import { toast } from "@/components/ui/use-toast"

export default function EditCityPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [city, setCity] = useState<City | null>(null)
  const [cityName, setCityName] = useState("")
  const [state, setState] = useState("")
  const [isActive, setIsActive] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [isFetching, setIsFetching] = useState(true)
  const [isSaved, setIsSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // In Next.js app router, params is already resolved
  const cityId = parseInt(params.id)

  // Set error if ID is invalid
  useEffect(() => {
    if (isNaN(cityId) || cityId <= 0) {
      setError(`Invalid city ID: ${params.id}. ID must be a positive number.`)
      setIsFetching(false)
    }
  }, [params.id, cityId])

  useEffect(() => {
    const fetchCityData = async () => {
      try {
        // Skip fetching if ID is invalid
        if (isNaN(cityId) || cityId <= 0) {
          return
        }

        setIsFetching(true)
        console.log(`Fetching city data for ID: ${cityId}`)

        // Fetch city data from API
        const cityData = await getCityById(cityId)
        console.log("City data received:", cityData)

        if (!cityData) {
          throw new Error("No city data returned from API")
        }

        // Check if the city was found or if we got a placeholder
        if (cityData.city_name === "City not found") {
          // This is a placeholder city, show a warning
          setError(`City with ID ${cityId} not found in the database. You can create a new city with this ID.`)
          toast({
            title: "Warning",
            description: `City with ID ${cityId} not found. You can create a new city with this ID.`,
            variant: "destructive",
          })
        }

        setCity(cityData)
        setCityName(cityData.city_name === "City not found" ? "" : cityData.city_name || "")
        setState(cityData.state === "Unknown" ? "" : cityData.state || "")
        setIsActive(Boolean(cityData.is_active))

        // Only clear error if we found a real city
        if (cityData.city_name !== "City not found") {
          setError(null)
        }
      } catch (err: any) {
        console.error(`Failed to fetch city with ID ${cityId}:`, err)
        setError(`Failed to load city data: ${err.message || "Unknown error"}`)
        toast({
          title: "Error",
          description: `Failed to load city data: ${err.message || "Please try again later."}`,
          variant: "destructive",
        })
      } finally {
        setIsFetching(false)
      }
    }

    if (cityId && !isNaN(cityId) && cityId > 0) {
      fetchCityData()
    }
  }, [cityId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    // Validate form data
    if (!cityName.trim()) {
      setError("City name is required")
      setIsLoading(false)
      toast({
        title: "Validation Error",
        description: "City name is required",
        variant: "destructive",
      })
      return
    }

    if (!state.trim()) {
      setError("State is required")
      setIsLoading(false)
      toast({
        title: "Validation Error",
        description: "State is required",
        variant: "destructive",
      })
      return
    }

    try {
      // Validate city ID
      if (isNaN(cityId) || cityId <= 0) {
        throw new Error(`Invalid city ID: ${cityId}. ID must be a positive number.`)
      }

      const cityDataToUpdate = {
        id: cityId,
        city_name: cityName.trim(),
        state: state.trim(),
        is_active: isActive
      }

      console.log("Updating city with data:", cityDataToUpdate)

      // Update city using the API service
      const updatedCity = await updateCity(cityDataToUpdate)

      console.log("City updated successfully:", updatedCity)

      // Update local state with the returned data
      if (updatedCity) {
        setCity(updatedCity)
        setCityName(updatedCity.city_name || cityName)
        setState(updatedCity.state || state)
        setIsActive(Boolean(updatedCity.is_active))
      }

      toast({
        title: "Success",
        description: "City updated successfully",
      })

      setIsSaved(true)

      // Redirect to the cities list after a short delay
      setTimeout(() => {
        router.push("/admin/cities")
      }, 1500)
    } catch (err: any) {
      console.error(`Failed to update city with ID ${cityId}:`, err)
      setError(`Failed to update city: ${err.message || "Please try again."}`)
      toast({
        title: "Error",
        description: `Failed to update city: ${err.message || "Please try again."}`,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (isFetching) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <h2 className="text-xl font-semibold">Loading city data...</h2>
        </div>
      </div>
    )
  }

  if (error || !city) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold">{error || "City not found"}</h2>
          <p className="text-muted-foreground">The city you are looking for does not exist or could not be loaded.</p>
          <Button className="mt-4" onClick={() => router.push("/admin/cities")}>
            Back to Cities
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 min-w-0">
          <Button variant="outline" size="icon" onClick={() => router.push("/admin/cities")} className="touch-manipulation flex-shrink-0">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="min-w-0 flex-1">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight truncate">Edit City</h1>
            <p className="text-sm sm:text-base text-muted-foreground truncate">Update city information for NIBOG events</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>City Information</CardTitle>
            <CardDescription>Update the city details below</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-4">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="name">City Name</Label>
              <Input
                id="name"
                value={cityName}
                onChange={(e) => setCityName(e.target.value)}
                placeholder="Enter city name"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="state">State</Label>
              <Input
                id="state"
                value={state}
                onChange={(e) => setState(e.target.value)}
                placeholder="Enter state name"
                required
              />
            </div>
            <Separator className="my-4" />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="active-status">Active Status</Label>
                <p className="text-sm text-muted-foreground">
                  Inactive cities will not be shown on the website
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
            <Button variant="outline" type="button" onClick={() => router.push("/admin/cities")}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                "Saving..."
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
              <CardTitle>City Statistics</CardTitle>
              <CardDescription>View statistics for this city</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-lg border p-4">
                  <h3 className="text-sm font-medium text-muted-foreground">Venues</h3>
                  <p className="mt-2 text-2xl font-bold">{city.venues || 0}</p>
                </div>
                <div className="rounded-lg border p-4">
                  <h3 className="text-sm font-medium text-muted-foreground">Events</h3>
                  <p className="mt-2 text-2xl font-bold">{city.events || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </form>
    </div>
  )
}
