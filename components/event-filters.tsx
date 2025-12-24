"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { CalendarIcon, Search, Filter, X } from "lucide-react"
import { cn, formatAge } from "@/lib/utils"
import { Badge } from "./ui/badge"
import { Separator } from "./ui/separator"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Checkbox } from "./ui/checkbox"

export default function EventFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()

  // Initialize state from URL params or defaults
  const [city, setCity] = useState(searchParams.get("city") || "")
  const [ageRange, setAgeRange] = useState<[number, number]>([
    Number.parseInt(searchParams.get("minAge") || "5"),
    Number.parseInt(searchParams.get("maxAge") || "144"),
  ])
  const [date, setDate] = useState<Date | undefined>(
    searchParams.get("date") ? new Date(searchParams.get("date")!) : undefined,
  )
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "")
  const [categories, setCategories] = useState<string[]>([])
  const [venues, setVenues] = useState<string[]>([])

  // Mock data - in a real app, this would come from an API
  const cities = [
    { value: "hyderabad", label: "Hyderabad" },
    { value: "bangalore", label: "Bangalore" },
    { value: "chennai", label: "Chennai" },
    { value: "vizag", label: "Vizag" },
    { value: "patna", label: "Patna" },
    { value: "ranchi", label: "Ranchi" },
    { value: "nagpur", label: "Nagpur" },
    { value: "kochi", label: "Kochi" },
    { value: "mumbai", label: "Mumbai" },
    { value: "indore", label: "Indore" },
    { value: "lucknow", label: "Lucknow" },
    { value: "chandigarh", label: "Chandigarh" },
    { value: "kolkata", label: "Kolkata" },
    { value: "gurgaon", label: "Gurgaon" },
    { value: "delhi", label: "Delhi" },
    { value: "jaipur", label: "Jaipur" },
    { value: "ahmedabad", label: "Ahmedabad" },
    { value: "bhubaneswar", label: "Bhubaneswar" },
    { value: "pune", label: "Pune" },
    { value: "raipur", label: "Raipur" },
    { value: "gandhinagar", label: "Gandhi Nagar" },
  ]

  const categoryOptions = [
    { id: "crawling", label: "Baby Crawling" },
    { id: "walker", label: "Baby Walker" },
    { id: "running", label: "Running Race" },
    { id: "hurdle", label: "Hurdle Toddle" },
    { id: "cycle", label: "Cycle Race" },
    { id: "ring", label: "Ring Holding" },
    { id: "ball", label: "Ball Throw" },
    { id: "balance", label: "Balancing Beam" },
    { id: "jump", label: "Frog Jump" },
    { id: "olympics", label: "NIBOG Olympics" },
  ]

  const venueOptions = [
    { id: "gachibowli", label: "Gachibowli Indoor Stadium" },
    { id: "chennai-stadium", label: "Indoor Stadium, Chennai" },
    { id: "bangalore-stadium", label: "Indoor Stadium, Bangalore" },
    { id: "vizag-complex", label: "Sports Complex, Vizag" },
    { id: "mumbai-stadium", label: "Indoor Stadium, Mumbai" },
    { id: "delhi-complex", label: "Sports Complex, Delhi" },
    { id: "kolkata-stadium", label: "Indoor Stadium, Kolkata" },
  ]

  const handleSearch = () => {
    const params = new URLSearchParams()
    if (city) params.set("city", city)
    if (ageRange[0] > 5) params.set("minAge", ageRange[0].toString())
    if (ageRange[1] < 144) params.set("maxAge", ageRange[1].toString())
    if (date) params.set("date", format(date, "yyyy-MM-dd"))
    if (searchQuery) params.set("q", searchQuery)
    if (categories.length > 0) params.set("categories", categories.join(","))
    if (venues.length > 0) params.set("venues", venues.join(","))

    router.push(`/events?${params.toString()}`)
  }

  const handleReset = () => {
    setCity("")
    setAgeRange([5, 144])
    setDate(undefined)
    setSearchQuery("")
    setCategories([])
    setVenues([])
    router.push("/events")
  }

  // Count active filters
  const activeFilterCount = [
    city,
    ageRange[0] > 5 || ageRange[1] < 144,
    date,
    categories.length > 0,
    venues.length > 0,
  ].filter(Boolean).length

  return null
}
