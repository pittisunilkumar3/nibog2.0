"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, CheckCircle2, Package, BarChart } from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface AddonCollectionTrackerProps {
  eventId: string
  eventTitle: string
}

// Mock add-on collection data - in a real app, this would come from an API
const addonCollections = [
  {
    id: "addon-coll-1",
    bookingId: "B0032",
    parentName: "Vikram Reddy",
    childName: "Aarav Reddy",
    addonName: "NIBOG T-Shirt",
    addonVariant: "Size: 2T, Color: Blue",
    addonPrice: 499,
    status: "collected", // collected, pending
    collectedAt: "2025-10-26T10:15:00Z",
  },
  {
    id: "addon-coll-2",
    bookingId: "B0033",
    parentName: "Meera Gupta",
    childName: "Ishaan Gupta",
    addonName: "NIBOG T-Shirt",
    addonVariant: "Size: 3T, Color: Red",
    addonPrice: 499,
    status: "pending", // collected, pending
  },
  {
    id: "addon-coll-3",
    bookingId: "B0034",
    parentName: "Arjun Kumar",
    childName: "Zara Kumar",
    addonName: "Meal Pack",
    addonVariant: "Vegetarian",
    addonPrice: 299,
    status: "collected", // collected, pending
    collectedAt: "2025-10-26T11:30:00Z",
  },
  {
    id: "addon-coll-4",
    bookingId: "B0035",
    parentName: "Neha Sharma",
    childName: "Advait Sharma",
    addonName: "NIBOG Cap",
    addonVariant: "One Size",
    addonPrice: 249,
    status: "pending", // collected, pending
  },
  {
    id: "addon-coll-5",
    bookingId: "B0035",
    parentName: "Neha Sharma",
    childName: "Advait Sharma",
    addonName: "Meal Pack",
    addonVariant: "Non-Vegetarian",
    addonPrice: 349,
    status: "collected", // collected, pending
    collectedAt: "2025-10-26T12:45:00Z",
  },
]

// Mock add-on summary data - in a real app, this would come from an API
const addonSummary = [
  {
    addonName: "NIBOG T-Shirt",
    totalSold: 15,
    totalCollected: 8,
    pendingCollection: 7,
    revenue: 7485,
  },
  {
    addonName: "Meal Pack",
    totalSold: 22,
    totalCollected: 14,
    pendingCollection: 8,
    revenue: 6578,
  },
  {
    addonName: "NIBOG Cap",
    totalSold: 10,
    totalCollected: 5,
    pendingCollection: 5,
    revenue: 2490,
  },
  {
    addonName: "Photo Package",
    totalSold: 8,
    totalCollected: 6,
    pendingCollection: 2,
    revenue: 3992,
  },
]

export default function AddonCollectionTracker({ eventId, eventTitle }: AddonCollectionTrackerProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [filterAddon, setFilterAddon] = useState("all")
  
  // Get unique add-on names for filter
  const uniqueAddons = Array.from(new Set(addonCollections.map(item => item.addonName)))
  
  // Filter add-on collections based on search query and filters
  const filteredCollections = addonCollections.filter(item => {
    // Apply search filter
    const matchesSearch = 
      item.parentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.childName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.bookingId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.addonName.toLowerCase().includes(searchQuery.toLowerCase())
    
    // Apply status filter
    const matchesStatus = 
      filterStatus === "all" || 
      (filterStatus === "collected" && item.status === "collected") ||
      (filterStatus === "pending" && item.status === "pending")
    
    // Apply add-on filter
    const matchesAddon = 
      filterAddon === "all" || 
      item.addonName === filterAddon
    
    return matchesSearch && matchesStatus && matchesAddon
  })
  
  const handleMarkAsCollected = (id: string) => {
    // In a real app, this would be an API call
    // await fetch(`/api/admin/events/${eventId}/scan-addon/${bookingId}/${addonId}`, { method: "POST" })
    
    console.log(`Marking add-on ${id} as collected`)
  }
  
  const formatPrice = (price: number) => {
    return `₹${price.toLocaleString('en-IN')}`
  }
  
  return (
    <Tabs defaultValue="collections">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="collections">
          <Package className="mr-2 h-4 w-4" />
          Collections
        </TabsTrigger>
        <TabsTrigger value="summary">
          <BarChart className="mr-2 h-4 w-4" />
          Summary
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="collections">
        <Card>
          <CardHeader>
            <CardTitle>Add-on Collections</CardTitle>
            <CardDescription>
              Track add-on collections for {eventTitle}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center">
              <div className="flex items-center gap-2 flex-1">
                <Search className="h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search collections..."
                  className="h-9"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              <div className="flex flex-wrap gap-2">
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-[130px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="collected">Collected</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select value={filterAddon} onValueChange={setFilterAddon}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Add-on Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Add-ons</SelectItem>
                    {uniqueAddons.map(addon => (
                      <SelectItem key={addon} value={addon}>
                        {addon}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Booking</TableHead>
                  <TableHead>Add-on</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCollections.map(item => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <div className="font-medium">{item.bookingId}</div>
                      <div className="text-sm">{item.parentName}</div>
                      <div className="text-xs text-muted-foreground">{item.childName}</div>
                    </TableCell>
                    <TableCell>
                      <div>{item.addonName}</div>
                      <div className="text-xs text-muted-foreground">{item.addonVariant}</div>
                    </TableCell>
                    <TableCell>{formatPrice(item.addonPrice)}</TableCell>
                    <TableCell>
                      {item.status === "collected" ? (
                        <Badge variant="default" className="bg-green-500 hover:bg-green-600">
                          Collected
                        </Badge>
                      ) : (
                        <Badge variant="outline">Pending</Badge>
                      )}
                      {item.collectedAt && (
                        <div className="text-xs text-muted-foreground mt-1">
                          {new Date(item.collectedAt).toLocaleTimeString()}
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {item.status === "pending" ? (
                        <Button 
                          size="sm" 
                          onClick={() => handleMarkAsCollected(item.id)}
                        >
                          <CheckCircle2 className="mr-2 h-4 w-4" />
                          Mark Collected
                        </Button>
                      ) : (
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/admin/bookings/${item.bookingId}`}>
                            View Booking
                          </Link>
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
                
                {filteredCollections.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                      No add-on collections found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </TabsContent>
      
      <TabsContent value="summary">
        <Card>
          <CardHeader>
            <CardTitle>Add-on Summary</CardTitle>
            <CardDescription>
              Summary of add-on sales and collections for {eventTitle}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Add-on</TableHead>
                  <TableHead>Total Sold</TableHead>
                  <TableHead>Collected</TableHead>
                  <TableHead>Pending</TableHead>
                  <TableHead className="text-right">Revenue</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {addonSummary.map(item => (
                  <TableRow key={item.addonName}>
                    <TableCell className="font-medium">{item.addonName}</TableCell>
                    <TableCell>{item.totalSold}</TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <span className="mr-2">{item.totalCollected}</span>
                        <span className="text-xs text-muted-foreground">
                          ({Math.round((item.totalCollected / item.totalSold) * 100)}%)
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <span className="mr-2">{item.pendingCollection}</span>
                        <span className="text-xs text-muted-foreground">
                          ({Math.round((item.pendingCollection / item.totalSold) * 100)}%)
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatPrice(item.revenue)}
                    </TableCell>
                  </TableRow>
                ))}
                
                <TableRow className="bg-muted/50">
                  <TableCell className="font-bold">Total</TableCell>
                  <TableCell className="font-bold">
                    {addonSummary.reduce((sum, item) => sum + item.totalSold, 0)}
                  </TableCell>
                  <TableCell className="font-bold">
                    {addonSummary.reduce((sum, item) => sum + item.totalCollected, 0)}
                  </TableCell>
                  <TableCell className="font-bold">
                    {addonSummary.reduce((sum, item) => sum + item.pendingCollection, 0)}
                  </TableCell>
                  <TableCell className="text-right font-bold">
                    {formatPrice(addonSummary.reduce((sum, item) => sum + item.revenue, 0))}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  )
}
