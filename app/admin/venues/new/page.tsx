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
import { getAllCities } from "@/services/cityService"
import { createVenue } from "@/services/venueService"
import { useToast } from "@/components/ui/use-toast"

export default function NewVenuePage() {
  const router = useRouter()
  const { toast } = useToast()
  const [name, setName] = useState("")
  const [city, setCity] = useState("")
  const [address, setAddress] = useState("")
  const [capacity, setCapacity] = useState("")
  const [isActive, setIsActive] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [cities, setCities] = useState<Array<{ id: string | number, name: string }>>([])
  const [isFetchingCities, setIsFetchingCities] = useState(true)
  const [cityError, setCityError] = useState<string | null>(null)

  // Fetch cities from API when component mounts
  useEffect(() => {
    const fetchCities = async () => {
      try {
        setIsFetchingCities(true)
        setCityError(null)

        // Fetch cities from the API
        const citiesData = await getAllCities()

        // Map the API response to the format expected by the dropdown
        const formattedCities = citiesData.map(city => ({
          id: city.id || 0,
          name: city.city_name
        }))

        setCities(formattedCities)
      } catch (error: any) {
        console.error("Failed to fetch cities:", error)
        setCityError("Failed to load cities. Please try again.")
        toast({
          title: "Error",
          description: "Failed to load cities. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsFetchingCities(false)
      }
    }

    fetchCities()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Find the selected city object to get its ID
      const selectedCity = cities.find(c => c.name === city)

      if (!selectedCity || !selectedCity.id) {
        throw new Error("Please select a valid city")
      }

      // Validate capacity
      let capacityValue: number | undefined = undefined;
      if (capacity) {
        capacityValue = parseInt(capacity);
        if (isNaN(capacityValue)) {
          throw new Error("Capacity must be a valid number");
        }
      }

      // Prepare venue data for API - exactly matching the expected format
      const venueData = {
        venue_name: name,
        city_id: Number(selectedCity.id),
        address: address,
        capacity: capacityValue,
        is_active: isActive
      }

      console.log("Creating venue with data:", venueData)

      try {
        // Call the API to create the venue
        const newVenue = await createVenue(venueData)

        console.log("Venue created successfully:", newVenue)

        // Show success message
        toast({
          title: "Success",
          description: "Venue created successfully",
        })

        // Redirect to the venues list
        router.push("/admin/venues")
      } catch (apiError: any) {
        console.error("API Error creating venue:", apiError)

        // Show error message
        toast({
          title: "API Error",
          description: apiError.message || "Failed to create venue. Please try again.",
          variant: "destructive",
        })

        setIsLoading(false)
      }
    } catch (error: any) {
      console.error("Form validation error:", error)

      // Show error message
      toast({
        title: "Validation Error",
        description: error.message || "Please check your form inputs and try again.",
        variant: "destructive",
      })

      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" asChild>
            <Link href="/admin/venues">
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Back</span>
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Add New Venue</h1>
            <p className="text-muted-foreground">Create a new venue for NIBOG events</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Venue Information</CardTitle>
            <CardDescription>Enter the details for the new venue</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Venue Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter venue name"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              {isFetchingCities ? (
                <div className="flex h-10 items-center rounded-md border border-input px-3 py-2 text-sm">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  <span className="text-muted-foreground">Loading cities...</span>
                </div>
              ) : cityError ? (
                <div className="flex h-10 items-center rounded-md border border-destructive px-3 py-2 text-sm text-destructive">
                  {cityError}
                </div>
              ) : (
                <Select value={city} onValueChange={setCity} required disabled={cities.length === 0}>
                  <SelectTrigger id="city">
                    <SelectValue placeholder={cities.length === 0 ? "No cities available" : "Select city"} />
                  </SelectTrigger>
                  <SelectContent>
                    {cities.map((c) => (
                      <SelectItem key={c.id} value={c.name}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
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
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                "Creating..."
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Create Venue
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  )
}
