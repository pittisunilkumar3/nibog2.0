"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { ArrowLeft, Save } from "lucide-react"
import { createCity } from "@/services/cityService"
import { toast } from "@/components/ui/use-toast"

export default function NewCityPage() {
  const router = useRouter()
  const [cityName, setCityName] = useState("")
  const [state, setState] = useState("")
  const [isActive, setIsActive] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      

      // Create city using the API service
      const result = await createCity({
        city_name: cityName,
        state,
        is_active: isActive ? 1 : 0
      })


      toast({
        title: "Success",
        description: "City created successfully",
      })

      // Redirect to cities page after successful creation
      setTimeout(() => {
        router.push("/admin/cities")
      }, 1000)
    } catch (err: any) {
      console.error("Failed to create city:", err)
      setError(`Failed to create city: ${err.message || "Please try again."}`)
      toast({
        title: "Error",
        description: `Failed to create city: ${err.message || "Please try again."}`,
        variant: "destructive",
      })
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
          <Button variant="outline" size="icon" onClick={() => router.push("/admin/cities")} className="touch-manipulation flex-shrink-0">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Add New City</h1>
            <p className="text-muted-foreground text-sm sm:text-base">Add a new city for NIBOG events</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-lg sm:text-xl">City Information</CardTitle>
            <CardDescription className="text-sm">Enter the details for the new city</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 sm:space-y-4 p-4 sm:p-6">
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
          <CardFooter className="flex flex-col sm:flex-row gap-3 sm:justify-between p-4 sm:p-6">
            <Button variant="outline" type="button" onClick={() => router.push("/admin/cities")} className="w-full sm:w-auto touch-manipulation">
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading} className="w-full sm:w-auto touch-manipulation">
              {isLoading ? (
                "Creating..."
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Create City
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  )
}
