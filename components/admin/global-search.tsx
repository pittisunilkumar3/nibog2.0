"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Search,
  Calendar,
  Users,
  CreditCard,
  MapPin,
  Building2,
  Package,
  Tag,
  Star,
  Mail,
  Settings,
  FileText,
  Award,
  Clock,
  ArrowRight,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface SearchResult {
  id: string
  title: string
  subtitle?: string
  description?: string
  type: 'booking' | 'event' | 'user' | 'payment' | 'city' | 'venue' | 'game' | 'promo' | 'addon' | 'testimonial' | 'page'
  url: string
  metadata?: Record<string, any>
  priority?: number
}

interface GlobalSearchProps {
  className?: string
}

// Mock search results - in real app, these would come from API
const mockSearchResults: SearchResult[] = [
  // Bookings
  {
    id: 'booking-123',
    title: 'Booking #123',
    subtitle: 'Priya Sharma',
    description: 'Baby Crawling - Mumbai',
    type: 'booking',
    url: '/admin/bookings/123',
    priority: 1,
  },
  {
    id: 'booking-456',
    title: 'Booking #456',
    subtitle: 'Rajesh Kumar',
    description: 'Running Race - Delhi',
    type: 'booking',
    url: '/admin/bookings/456',
    priority: 1,
  },
  // Events
  {
    id: 'event-789',
    title: 'Baby Crawling Championship',
    subtitle: 'Mumbai - Phoenix Mall',
    description: 'Dec 15, 2024 at 10:00 AM',
    type: 'event',
    url: '/admin/events/789',
    priority: 2,
  },
  // Users
  {
    id: 'user-101',
    title: 'Anita Patel',
    subtitle: 'anita.patel@email.com',
    description: 'Ahmedabad - 3 bookings',
    type: 'user',
    url: '/admin/users/101',
    priority: 2,
  },
  // Pages
  {
    id: 'page-bookings',
    title: 'Bookings',
    description: 'Manage event bookings',
    type: 'page',
    url: '/admin/bookings',
    priority: 3,
  },
  {
    id: 'page-events',
    title: 'Events',
    description: 'Manage NIBOG events',
    type: 'page',
    url: '/admin/events',
    priority: 3,
  },
  {
    id: 'page-users',
    title: 'Users',
    description: 'User management',
    type: 'page',
    url: '/admin/users',
    priority: 3,
  },
  {
    id: 'page-payments',
    title: 'Payments',
    description: 'Payment transactions',
    type: 'page',
    url: '/admin/payments',
    priority: 3,
  },
]

const getSearchIcon = (type: SearchResult['type']) => {
  switch (type) {
    case 'booking':
      return <Calendar className="h-4 w-4" />
    case 'event':
      return <Calendar className="h-4 w-4" />
    case 'user':
      return <Users className="h-4 w-4" />
    case 'payment':
      return <CreditCard className="h-4 w-4" />
    case 'city':
      return <MapPin className="h-4 w-4" />
    case 'venue':
      return <Building2 className="h-4 w-4" />
    case 'game':
      return <Package className="h-4 w-4" />
    case 'promo':
      return <Tag className="h-4 w-4" />
    case 'addon':
      return <Package className="h-4 w-4" />
    case 'testimonial':
      return <Star className="h-4 w-4" />
    case 'page':
      return <FileText className="h-4 w-4" />
    default:
      return <Search className="h-4 w-4" />
  }
}

const getTypeLabel = (type: SearchResult['type']) => {
  switch (type) {
    case 'booking':
      return 'Booking'
    case 'event':
      return 'Event'
    case 'user':
      return 'User'
    case 'payment':
      return 'Payment'
    case 'city':
      return 'City'
    case 'venue':
      return 'Venue'
    case 'game':
      return 'Game'
    case 'promo':
      return 'Promo Code'
    case 'addon':
      return 'Add-on'
    case 'testimonial':
      return 'Testimonial'
    case 'page':
      return 'Page'
    default:
      return 'Result'
  }
}

const getTypeColor = (type: SearchResult['type']) => {
  switch (type) {
    case 'booking':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
    case 'event':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
    case 'user':
      return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
    case 'payment':
      return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200'
    case 'city':
      return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
    case 'venue':
      return 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200'
    case 'page':
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    default:
      return 'bg-muted text-muted-foreground'
  }
}

export default function GlobalSearch({ className }: GlobalSearchProps) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<SearchResult[]>([])
  const [recentSearches, setRecentSearches] = useState<string[]>([])
  const router = useRouter()

  // Keyboard shortcut to open search
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }

    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

  // Search function
  const performSearch = useCallback((searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([])
      return
    }

    // Filter mock results based on query
    const filtered = mockSearchResults.filter(result => 
      result.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      result.subtitle?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      result.description?.toLowerCase().includes(searchQuery.toLowerCase())
    )

    // Sort by priority and relevance
    const sorted = filtered.sort((a, b) => {
      const aPriority = a.priority || 999
      const bPriority = b.priority || 999
      return aPriority - bPriority
    })

    setResults(sorted.slice(0, 10)) // Limit to 10 results
  }, [])

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      performSearch(query)
    }, 150)

    return () => clearTimeout(timer)
  }, [query, performSearch])

  const handleSelect = (result: SearchResult) => {
    // Add to recent searches
    setRecentSearches(prev => {
      const updated = [result.title, ...prev.filter(s => s !== result.title)].slice(0, 5)
      localStorage.setItem('nibog-recent-searches', JSON.stringify(updated))
      return updated
    })

    // Navigate to result
    router.push(result.url)
    setOpen(false)
    setQuery("")
  }

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('nibog-recent-searches')
    if (saved) {
      try {
        setRecentSearches(JSON.parse(saved))
      } catch (error) {
        console.error('Failed to parse recent searches:', error)
      }
    }
  }, [])

  // Group results by type
  const groupedResults = results.reduce((acc, result) => {
    if (!acc[result.type]) {
      acc[result.type] = []
    }
    acc[result.type].push(result)
    return acc
  }, {} as Record<string, SearchResult[]>)

  return (
    <>
      <Button
        variant="outline"
        className={cn(
          "relative h-9 w-9 p-0 xl:h-10 xl:w-60 xl:justify-start xl:px-3 xl:py-2",
          className
        )}
        onClick={() => setOpen(true)}
      >
        <Search className="h-4 w-4 xl:mr-2" />
        <span className="hidden xl:inline-flex">Search...</span>
        <kbd className="pointer-events-none absolute right-1.5 top-2 hidden h-6 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 xl:flex">
          <span className="text-xs">⌘</span>K
        </kbd>
      </Button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput
          placeholder="Search bookings, events, users, and more..."
          value={query}
          onValueChange={setQuery}
        />
        <CommandList>
          <CommandEmpty>
            <div className="flex flex-col items-center gap-2 py-6">
              <Search className="h-8 w-8 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                {query ? `No results found for "${query}"` : "Start typing to search..."}
              </p>
            </div>
          </CommandEmpty>

          {!query && recentSearches.length > 0 && (
            <CommandGroup heading="Recent Searches">
              {recentSearches.map((search, index) => (
                <CommandItem
                  key={index}
                  onSelect={() => setQuery(search)}
                  className="flex items-center gap-2"
                >
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>{search}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          )}

          {Object.entries(groupedResults).map(([type, typeResults]) => (
            <CommandGroup key={type} heading={getTypeLabel(type as SearchResult['type'])}>
              {typeResults.map((result) => (
                <CommandItem
                  key={result.id}
                  onSelect={() => handleSelect(result)}
                  className="flex items-center gap-3 p-3"
                >
                  <div className="flex-shrink-0">
                    {getSearchIcon(result.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{result.title}</span>
                      <Badge variant="secondary" className={cn("text-xs", getTypeColor(result.type))}>
                        {getTypeLabel(result.type)}
                      </Badge>
                    </div>
                    {result.subtitle && (
                      <p className="text-sm text-muted-foreground">{result.subtitle}</p>
                    )}
                    {result.description && (
                      <p className="text-xs text-muted-foreground">{result.description}</p>
                    )}
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                </CommandItem>
              ))}
            </CommandGroup>
          ))}

          {query && results.length > 0 && (
            <>
              <CommandSeparator />
              <CommandGroup>
                <CommandItem className="text-center text-sm text-muted-foreground">
                  Press Enter to search across all data
                </CommandItem>
              </CommandGroup>
            </>
          )}
        </CommandList>
      </CommandDialog>
    </>
  )
}
