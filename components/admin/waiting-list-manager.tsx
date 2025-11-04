"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { formatDateShort } from "@/lib/utils"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Search, Mail, CheckCircle2, X } from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

interface WaitingListManagerProps {
  eventId: string
  eventTitle: string
}

// Mock waiting list data - in a real app, this would come from an API
const waitingListEntries = [
  {
    id: "wl-1",
    bookingId: "B0045",
    parentName: "Priya Sharma",
    childName: "Arjun Sharma",
    childAge: 14, // months
    email: "priya.sharma@example.com",
    phone: "+91 98765 43210",
    requestDate: "2025-09-15T10:30:00Z",
    status: "waiting", // waiting, notified, confirmed, expired
    notes: "Requested to be notified if any spot becomes available",
  },
  {
    id: "wl-2",
    bookingId: "B0046",
    parentName: "Rahul Patel",
    childName: "Aanya Patel",
    childAge: 18, // months
    email: "rahul.patel@example.com",
    phone: "+91 87654 32109",
    requestDate: "2025-09-16T14:45:00Z",
    status: "notified", // waiting, notified, confirmed, expired
    notifiedDate: "2025-09-20T09:15:00Z",
    notes: "Notified about available spot",
  },
  {
    id: "wl-3",
    bookingId: "B0047",
    parentName: "Ananya Singh",
    childName: "Vihaan Singh",
    childAge: 22, // months
    email: "ananya.singh@example.com",
    phone: "+91 76543 21098",
    requestDate: "2025-09-17T16:20:00Z",
    status: "confirmed", // waiting, notified, confirmed, expired
    notifiedDate: "2025-09-21T11:30:00Z",
    confirmedDate: "2025-09-21T15:45:00Z",
    notes: "Confirmed spot after notification",
  },
]

export default function WaitingListManager({ eventId, eventTitle }: WaitingListManagerProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedEntry, setSelectedEntry] = useState<typeof waitingListEntries[0] | null>(null)
  const [isNotifying, setIsNotifying] = useState(false)
  const [notificationMessage, setNotificationMessage] = useState("")
  const [notificationMethod, setNotificationMethod] = useState("email")
  
  // Filter waiting list entries based on search query
  const filteredEntries = waitingListEntries.filter(entry => 
    entry.parentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    entry.childName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    entry.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    entry.phone.includes(searchQuery)
  )
  
  const handleNotifyUser = async () => {
    if (!selectedEntry) return
    
    setIsNotifying(true)
    
    try {
      // In a real app, this would be an API call
      // await fetch(`/api/admin/bookings/${selectedEntry.bookingId}/waiting-list/notify`, {
      //   method: "POST",
      //   body: JSON.stringify({
      //     method: notificationMethod,
      //     message: notificationMessage,
      //   }),
      // })
      
      console.log(`Notifying user ${selectedEntry.parentName} via ${notificationMethod}`)
      
      // Simulate API delay
      setTimeout(() => {
        setIsNotifying(false)
        setSelectedEntry(null)
      }, 1500)
    } catch (error) {
      console.error("Error notifying user:", error)
      setIsNotifying(false)
    }
  }
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "waiting":
        return <Badge variant="outline">Waiting</Badge>
      case "notified":
        return <Badge variant="secondary">Notified</Badge>
      case "confirmed":
        return <Badge variant="default">Confirmed</Badge>
      case "expired":
        return <Badge variant="destructive">Expired</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Waiting List</CardTitle>
        <CardDescription>
          Manage waiting list for {eventTitle}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-4 flex items-center gap-2">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search waiting list..."
            className="h-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Parent</TableHead>
              <TableHead>Child</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Request Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredEntries.map(entry => (
              <TableRow key={entry.id}>
                <TableCell className="font-medium">{entry.parentName}</TableCell>
                <TableCell>
                  {entry.childName}
                  <div className="text-xs text-muted-foreground">
                    {entry.childAge} months old
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-sm">{entry.email}</div>
                  <div className="text-xs text-muted-foreground">{entry.phone}</div>
                </TableCell>
                <TableCell>
                  {formatDateShort(entry.requestDate)}
                </TableCell>
                <TableCell>
                  {getStatusBadge(entry.status)}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    {entry.status === "waiting" && (
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setSelectedEntry(entry)}
                          >
                            <Mail className="mr-2 h-4 w-4" />
                            Notify
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Notify About Available Spot</DialogTitle>
                            <DialogDescription>
                              Send a notification to {entry.parentName} about an available spot for {entry.childName}.
                            </DialogDescription>
                          </DialogHeader>
                          
                          <div className="grid gap-4 py-4">
                            <div className="space-y-2">
                              <Label htmlFor="notification-method">Notification Method</Label>
                              <Select 
                                value={notificationMethod} 
                                onValueChange={setNotificationMethod}
                              >
                                <SelectTrigger id="notification-method">
                                  <SelectValue placeholder="Select method" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="email">Email</SelectItem>
                                  <SelectItem value="sms">SMS</SelectItem>
                                  <SelectItem value="both">Both Email & SMS</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            
                            <div className="space-y-2">
                              <Label htmlFor="notification-message">Message</Label>
                              <Textarea
                                id="notification-message"
                                value={notificationMessage || `Dear ${entry.parentName},\n\nWe're pleased to inform you that a spot has become available for ${entry.childName} at our "${eventTitle}" event. Please confirm your booking within 24 hours to secure your spot.\n\nThank you,\nNIBOG Team`}
                                onChange={(e) => setNotificationMessage(e.target.value)}
                                rows={6}
                              />
                            </div>
                          </div>
                          
                          <DialogFooter>
                            <Button variant="outline" onClick={() => setSelectedEntry(null)}>
                              Cancel
                            </Button>
                            <Button onClick={handleNotifyUser} disabled={isNotifying}>
                              {isNotifying ? "Sending..." : "Send Notification"}
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    )}
                    
                    {entry.status === "notified" && (
                      <>
                        <Button variant="outline" size="sm">
                          <CheckCircle2 className="mr-2 h-4 w-4" />
                          Confirm
                        </Button>
                        <Button variant="outline" size="sm">
                          <X className="mr-2 h-4 w-4" />
                          Expire
                        </Button>
                      </>
                    )}
                    
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            
            {filteredEntries.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  No waiting list entries found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
