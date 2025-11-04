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
import { ArrowLeft, Loader2 } from "lucide-react"
import { getUserById, updateUser, UpdateUserData } from "@/services/userService"
import { getAllCities, City } from "@/services/cityService"
import { useToast } from "@/components/ui/use-toast"

// User roles - We'll keep this for now, but it's not used with the current API
// In the future, we might want to add role information to the API response
const roles = [
  { id: "1", name: "user", label: "User" },
  { id: "2", name: "admin", label: "Admin" },
]

// User statuses
const statuses = [
  { id: "1", name: "active", label: "Active" },
  { id: "2", name: "inactive", label: "Inactive" },
  { id: "3", name: "locked", label: "Locked" },
]

type PageParams = {
  id: string
}

type Props = {
  params: PageParams
}

export default function EditUserPage({ params }: Props) {
  const router = useRouter()
  const { toast } = useToast()

  // In Next.js app router, params is already resolved
  const userId = Number(params.id)

  const [user, setUser] = useState<any>(null)
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [cityId, setCityId] = useState<number | null>(null)
  const [password, setPassword] = useState("")
  const [isActive, setIsActive] = useState(true)
  const [isLocked, setIsLocked] = useState(false)
  const [cities, setCities] = useState<City[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSaved, setIsSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Fetch user data
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setIsLoading(true)
        setError(null)

        // Fetch user data from API
        const userData = await getUserById(userId)
        console.log('Fetched user data:', userData);

        if (userData) {
          setUser(userData)
          setFullName(userData.full_name || '')
          setEmail(userData.email || '')
          setPhone(userData.phone || '')
          console.log('Setting cityId from user data:', userData.city_id);
          setCityId(userData.city_id !== undefined ? userData.city_id : null)
          setIsActive(userData.is_active || false)
          setIsLocked(userData.is_locked || false)
        } else {
          setError("User not found")
          toast({
            title: "Error",
            description: "User not found.",
            variant: "destructive",
          })
          router.push('/admin/users')
        }
      } catch (error: any) {
        console.error(`Failed to fetch user with ID ${userId}:`, error)
        setError(error.message || "Failed to load user details")
        toast({
          title: "Error",
          description: "Failed to load user details. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    // Fetch cities data
    const fetchCities = async () => {
      try {
        const citiesData = await getAllCities()
        setCities(citiesData)
      } catch (error: any) {
        console.error("Failed to fetch cities:", error)
        toast({
          title: "Warning",
          description: "Failed to load cities. City selection may be limited.",
          variant: "destructive",
        })
      }
    }

    if (userId) {
      fetchUserData()
      fetchCities()
    }
  }, [userId, toast])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)
    
    console.log('Form submitted with cityId:', cityId, 'type:', typeof cityId)

    try {
      // Prepare user data for update
      console.log('Preparing user data - cityId:', cityId, 'type:', typeof cityId);
      
      const userData: UpdateUserData = {
        user_id: userId,
        full_name: fullName,
        email: email,
        phone: phone,
        // Explicitly set city_id to null when no city is selected
        ...(cityId ? { city_id: cityId } : { city_id: null }),
      } as UpdateUserData;
      
      // Ensure accept_terms is always true as required by API
      userData.accept_terms = true;
      
      console.log("User data being sent:", JSON.stringify(userData, null, 2));

      // Only include password if it's provided
      if (password.trim() !== "") {
        userData.password = password
      }

      // Add status fields
      if (user) {
        // If we're changing the status, include the new values
        if (isActive !== user.is_active || isLocked !== user.is_locked) {
          userData.is_active = isActive;
          userData.is_locked = isLocked;
        }
      }

      console.log("Submitting user data:", userData);

      // Call the API to update the user
      const updatedUser = await updateUser(userData)

      console.log("API response:", updatedUser);

      setIsSaved(true)
      toast({
        title: "Success",
        description: "User updated successfully.",
      })

      // Reset the saved state after 1.5 seconds
      setTimeout(() => {
        setIsSaved(false)
        // Redirect to the user details page
        router.push(`/admin/users/${userId}`)
      }, 1500)
    } catch (error: any) {
      console.error(`Failed to update user ${userId}:`, error)
      setError(error.message || "Failed to update user")
      toast({
        title: "Error",
        description: "Failed to update user. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading user details...</p>
        </div>
      </div>
    )
  }

  if (error || !user) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold">User not found</h2>
          <p className="text-muted-foreground">{error || "The user you are looking for does not exist."}</p>
          <Button className="mt-4" onClick={() => router.push("/admin/users")}>
            Back to Users
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
            <Link href={`/admin/users/${userId}`}>
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Back</span>
            </Link>
          </Button>
          <div className="min-w-0 flex-1">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight truncate">Edit User</h1>
            <p className="text-sm sm:text-base text-muted-foreground truncate">Update user information for {user.full_name}</p>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-destructive/15 text-destructive p-3 rounded-md mb-4">
          <p>{error}</p>
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Edit User</CardTitle>
            <CardDescription>Update user information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Enter full name"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter email"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Enter phone number"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Select
                  value={cityId ? cityId.toString() : 'none'}
                  onValueChange={(value) => {
                    const newValue = value === 'none' ? null : Number(value);
                    console.log('City selection changed:', { value, newValue });
                    setCityId(newValue);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a city" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No city selected</SelectItem>
                    {cities.map((city) => {
                      if (!city?.id) return null;
                      return (
                        <SelectItem key={city.id} value={city.id.toString()}>
                          {city.city_name || 'Unnamed City'}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
                <div className="text-xs text-muted-foreground mt-1">
                  Current cityId: {cityId === null ? 'null' : cityId || 'none'}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">New Password (leave blank to keep current)</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter new password"
                />
              </div>
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="isActive"
                    checked={isActive}
                    onCheckedChange={setIsActive}
                  />
                  <Label htmlFor="isActive">Active Account</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="isLocked"
                    checked={isLocked}
                    onCheckedChange={setIsLocked}
                  />
                  <Label htmlFor="isLocked">Lock Account</Label>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button type="button" variant="outline" onClick={() => router.back()}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <Button type="submit" disabled={isSubmitting || isSaved}>
              {isSubmitting ? 'Saving...' : isSaved ? 'Saved!' : 'Save Changes'}
            </Button>
          </CardFooter>
        </Card>

        <div className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Account Information</CardTitle>
              <CardDescription>View account details</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-lg border p-4">
                  <h3 className="text-sm font-medium text-muted-foreground">Registered On</h3>
                  <p className="mt-2 text-lg font-medium">
                    {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
                <div className="rounded-lg border p-4">
                  <h3 className="text-sm font-medium text-muted-foreground">Last Login</h3>
                  <p className="mt-2 text-lg font-medium">
                    {user?.last_login_at ? new Date(user.last_login_at).toLocaleDateString() : 'Never'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </form>
    </div>
  )
}
