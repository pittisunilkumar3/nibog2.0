"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Search, Filter, Eye, CheckCircle, XCircle, Clock } from "lucide-react"
import { getAddOnById } from "@/services/addOnService"
import { formatPrice } from "@/lib/utils"

type Props = {
  params: { id: string }
}

// Mock order data
const mockOrders = [
  {
    id: "order-1",
    bookingId: "booking-1",
    customerName: "Rahul Sharma",
    customerEmail: "rahul.sharma@example.com",
    date: "2023-12-15",
    quantity: 2,
    variantName: "Small - Red",
    totalPrice: 998,
    status: "fulfilled"
  },
  {
    id: "order-2",
    bookingId: "booking-2",
    customerName: "Priya Patel",
    customerEmail: "priya.patel@example.com",
    date: "2023-12-18",
    quantity: 1,
    variantName: "Medium - Blue",
    totalPrice: 499,
    status: "pending"
  },
  {
    id: "order-3",
    bookingId: "booking-3",
    customerName: "Amit Kumar",
    customerEmail: "amit.kumar@example.com",
    date: "2023-12-20",
    quantity: 3,
    variantName: "Large - Red",
    totalPrice: 1497,
    status: "pending"
  },
  {
    id: "order-4",
    bookingId: "booking-4",
    customerName: "Sneha Reddy",
    customerEmail: "sneha.reddy@example.com",
    date: "2023-12-22",
    quantity: 1,
    variantName: "Small - Blue",
    totalPrice: 499,
    status: "cancelled"
  },
  {
    id: "order-5",
    bookingId: "booking-5",
    customerName: "Vikram Singh",
    customerEmail: "vikram.singh@example.com",
    date: "2023-12-25",
    quantity: 2,
    variantName: "Medium - Red",
    totalPrice: 998,
    status: "fulfilled"
  }
]

export default function AddOnOrdersPage({ params }: Props) {
  const router = useRouter()
  
  // Get the ID from params
  const addOnId = params.id
  
  // State for add-on data and loading states
  const [addOn, setAddOn] = useState<any | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [orders, setOrders] = useState(mockOrders)
  
  // Fetch add-on data when component mounts or ID changes
  useEffect(() => {
    async function loadAddOnData() {
      setIsLoading(true);
      setError(null);
      try {
        // Try to get add-on data using the service
        const data = await getAddOnById(addOnId);
        setAddOn(data);
      } catch (err: any) {
        console.error('Error fetching add-on data:', err);
        setError(err.message || 'Failed to load add-on data');
      } finally {
        setIsLoading(false);
      }
    }
    
    loadAddOnData();
  }, [addOnId])

  const handleUpdateStatus = (orderId: string, newStatus: "pending" | "fulfilled" | "cancelled") => {
    setOrders(orders.map(order => 
      order.id === orderId ? { ...order, status: newStatus } : order
    ))
  }

  // Filter orders based on search query and status
  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customerEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.bookingId.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesStatus = statusFilter === "all" || order.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Loading...</h2>
          <p className="text-muted-foreground">Fetching add-on data</p>
        </div>
      </div>
    )
  }

  // Show error state
  if (error || !addOn) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Add-on Not Found</h2>
          <p className="text-muted-foreground">{error || "The add-on you're looking for doesn't exist or has been removed."}</p>
          <Button className="mt-4" asChild>
            <Link href="/admin/add-ons">Back to Add-ons</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" asChild>
          <Link href={`/admin/add-ons/${addOnId}`}>
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back</span>
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Orders</h1>
          <p className="text-muted-foreground">{addOn.name}</p>
        </div>
      </div>

      <div className="flex flex-col gap-4 md:flex-row">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search by customer name, email, or booking ID..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        <div className="flex w-full items-center gap-2 md:w-auto">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="fulfilled">Fulfilled</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Order History</CardTitle>
          <CardDescription>Manage orders for {addOn.name}</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Booking ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Variant</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">{order.bookingId}</TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span>{order.customerName}</span>
                      <span className="text-xs text-muted-foreground">{order.customerEmail}</span>
                    </div>
                  </TableCell>
                  <TableCell>{order.date}</TableCell>
                  <TableCell>{order.variantName || "N/A"}</TableCell>
                  <TableCell>{order.quantity}</TableCell>
                  <TableCell>{formatPrice(order.totalPrice)}</TableCell>
                  <TableCell>
                    {order.status === "fulfilled" ? (
                      <Badge className="bg-green-500 hover:bg-green-600">Fulfilled</Badge>
                    ) : order.status === "cancelled" ? (
                      <Badge variant="destructive">Cancelled</Badge>
                    ) : (
                      <Badge variant="outline">Pending</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" asChild>
                        <Link href={`/admin/bookings/${order.bookingId}`}>
                          <Eye className="h-4 w-4" />
                          <span className="sr-only">View Booking</span>
                        </Link>
                      </Button>
                      {order.status === "pending" && (
                        <>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="text-green-500 hover:text-green-600"
                            onClick={() => handleUpdateStatus(order.id, "fulfilled")}
                          >
                            <CheckCircle className="h-4 w-4" />
                            <span className="sr-only">Mark as Fulfilled</span>
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="text-red-500 hover:text-red-600"
                            onClick={() => handleUpdateStatus(order.id, "cancelled")}
                          >
                            <XCircle className="h-4 w-4" />
                            <span className="sr-only">Cancel</span>
                          </Button>
                        </>
                      )}
                      {order.status === "cancelled" && (
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleUpdateStatus(order.id, "pending")}
                        >
                          <Clock className="h-4 w-4" />
                          <span className="sr-only">Mark as Pending</span>
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filteredOrders.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="h-24 text-center">
                    <p className="text-muted-foreground">No orders found</p>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Order Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Total Orders</span>
                <span className="font-medium">{orders.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Pending</span>
                <span className="font-medium">{orders.filter(o => o.status === "pending").length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Fulfilled</span>
                <span className="font-medium">{orders.filter(o => o.status === "fulfilled").length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Cancelled</span>
                <span className="font-medium">{orders.filter(o => o.status === "cancelled").length}</span>
              </div>
              <div className="flex items-center justify-between pt-2 border-t">
                <span className="font-medium">Total Revenue</span>
                <span className="font-bold">
                  {formatPrice(orders.filter(o => o.status !== "cancelled").reduce((sum, o) => sum + o.totalPrice, 0))}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
