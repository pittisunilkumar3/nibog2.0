"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Heart, Search, MapPin, Calendar, Users, Loader2, AlertTriangle } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"

// Force dynamic rendering for this page
export const dynamic = 'force-dynamic'

// Mock data - in a real app, this would come from an API
const mockFavorites = [
  {
    id: "1",
    eventId: "E001",
    title: "Baby Sensory Play",
    description: "Engage your baby's senses with colorful toys, music, and textures.",
    venue: "Little Explorers Center",
    city: "Mumbai",
    date: "2025-04-15",
    time: "10:00 AM - 11:30 AM",
    ageRange: "0-12 months",
    price: 500,
    image: "/placeholder.svg",
    savedAt: "2025-03-20",
  },
  {
    id: "2",
    eventId: "E002",
    title: "Toddler Music & Movement",
    description: "Fun music and movement activities for active toddlers.",
    venue: "Rhythm Studio",
    city: "Delhi",
    date: "2025-04-20",
    time: "11:00 AM - 12:30 PM",
    ageRange: "12-24 months",
    price: 600,
    image: "/placeholder.svg",
    savedAt: "2025-03-22",
  },
]

export default function FavoritesPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [favorites, setFavorites] = useState(mockFavorites)

  // Filter favorites based on search query
  const filteredFavorites = favorites.filter((favorite) => {
    if (!searchQuery) return true

    const query = searchQuery.toLowerCase()
    return (
      favorite.title.toLowerCase().includes(query) ||
      favorite.venue.toLowerCase().includes(query) ||
      favorite.city.toLowerCase().includes(query) ||
      favorite.description.toLowerCase().includes(query)
    )
  })

  // Handle remove from favorites
  const handleRemoveFavorite = (favoriteId: string) => {
    // In a real app, this would be an API call to remove the favorite

    setFavorites(favorites.filter((fav) => fav.id !== favoriteId))
  }

  // Show loading state
  if (isLoading) {
    return (
      <div className="container py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight">Saved Events</h1>
          <p className="text-muted-foreground">Your favorite events and activities</p>
        </div>
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="flex items-center gap-2">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span>Loading your saved events...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Redirect to login if not authenticated
  if (!user) {
    router.push('/login')
    return null
  }

  return (
    <div className="container py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Saved Events</h1>
        <p className="text-muted-foreground">Your favorite events and activities</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <CardTitle>My Favorites</CardTitle>
            <div className="relative w-full sm:max-w-xs">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search saved events..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredFavorites.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Heart className="h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">
                {searchQuery ? "No Events Found" : "No Saved Events"}
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                {searchQuery
                  ? "No saved events match your search criteria."
                  : "You haven't saved any events yet. Browse events and save your favorites!"}
              </p>
              {!searchQuery && (
                <Button className="mt-4" asChild>
                  <Link href="/events">Browse Events</Link>
                </Button>
              )}
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filteredFavorites.map((favorite) => (
                <Card key={favorite.id} className="overflow-hidden">
                  <div className="aspect-video bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/20 dark:to-pink-900/20 flex items-center justify-center">
                    <Calendar className="h-12 w-12 text-purple-400" />
                  </div>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-lg">{favorite.title}</CardTitle>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
                        onClick={() => handleRemoveFavorite(favorite.id)}
                      >
                        <Heart className="h-4 w-4 fill-current" />
                        <span className="sr-only">Remove from favorites</span>
                      </Button>
                    </div>
                    <CardDescription className="line-clamp-2">
                      {favorite.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      <span>{favorite.venue}, {favorite.city}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>{favorite.date}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Users className="h-4 w-4" />
                      <span>{favorite.ageRange}</span>
                    </div>
                    <div className="flex items-center justify-between pt-2">
                      <Badge variant="outline" className="text-base font-semibold">
                        ₹{favorite.price}
                      </Badge>
                      <Button size="sm" asChild>
                        <Link href={`/events/${favorite.eventId}`}>
                          View Details
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {filteredFavorites.length > 0 && (
        <div className="mt-6 text-center">
          <p className="text-sm text-muted-foreground">
            You have {favorites.length} saved event{favorites.length !== 1 ? 's' : ''}
          </p>
        </div>
      )}
    </div>
  )
}

