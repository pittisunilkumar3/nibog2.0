"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, MapPin, Users, Heart } from "lucide-react"
import { cn } from "@/lib/utils"
import { formatAge } from "@/lib/age-calculation"

interface EventCardProps {
  id: string
  title: string
  description: string
  image: string
  venue: string
  city: string
  date: string
  time: string
  price: number
  minAgeMonths: number
  maxAgeMonths: number
  spotsLeft: number
  totalSpots: number
  categories?: string[]
  featured?: boolean
}

export default function EventCard({
  id,
  title,
  description,
  image,
  venue,
  city,
  date,
  time,
  price,
  minAgeMonths,
  maxAgeMonths,
  spotsLeft,
  totalSpots,
  categories = [],
  featured = false,
}: EventCardProps) {
  const [isFavorite, setIsFavorite] = useState(false)
  
  const isSoldOut = spotsLeft === 0
  const isLowAvailability = spotsLeft <= 3 && spotsLeft > 0
  
  const toggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsFavorite(!isFavorite)
    
    // In a real app, this would call an API to save the favorite status
    console.log(`Toggle favorite for event ${id}: ${!isFavorite}`)
  }

  return (
    <Card className={cn(
      "overflow-hidden transition-all hover:shadow-md",
      featured && "border-primary"
    )}>
      <Link href={`/events/${id}`} className="block">
        <div className="relative">
          <div className="relative h-48 w-full overflow-hidden">
            <Image
              src={image}
              alt={title}
              fill
              className="object-cover transition-transform hover:scale-105"
            />
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-2 top-2 rounded-full bg-background/80 backdrop-blur-sm"
            onClick={toggleFavorite}
          >
            <Heart
              className={cn(
                "h-5 w-5",
                isFavorite ? "fill-red-500 text-red-500" : "text-muted-foreground"
              )}
            />
            <span className="sr-only">Add to favorites</span>
          </Button>
          {featured && (
            <Badge className="absolute left-2 top-2">Featured</Badge>
          )}
        </div>
        <CardHeader className="pb-2">
          <div className="space-y-1">
            <CardTitle className="line-clamp-1">{title}</CardTitle>
            <CardDescription className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {venue}, {city}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="pb-2">
          <p className="line-clamp-2 text-sm text-muted-foreground">{description}</p>
          <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              <span>{date}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>{time}</span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              <span>
                {minAgeMonths === maxAgeMonths
                  ? `${formatAge(minAgeMonths)}`
                  : `${formatAge(minAgeMonths)} - ${formatAge(maxAgeMonths)}`}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <span className="font-medium">₹{price}</span>
            </div>
          </div>
          {categories.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1">
              {categories.map((category) => (
                <Badge key={category} variant="outline" className="text-xs">
                  {category}
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
        <CardFooter className="flex items-center justify-between">
          <div>
            {isSoldOut ? (
              <Badge variant="outline" className="text-red-500">Sold Out</Badge>
            ) : isLowAvailability ? (
              <Badge variant="outline" className="text-amber-500">Only {spotsLeft} left</Badge>
            ) : (
              <Badge variant="outline">{spotsLeft} spots left</Badge>
            )}
          </div>
          <Button size="sm">View Details</Button>
        </CardFooter>
      </Link>
    </Card>
  )
}
