"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Plus, Edit, Users, Pause, Play, X, Loader2, RefreshCw } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { cn } from "@/lib/utils"
import { getEventWithGames, deleteEventGameSlot, updateSlotStatus, getAllSlotStatuses } from "@/services/eventService"
import { useToast } from "@/hooks/use-toast"
import { TruncatedText } from "@/components/ui/truncated-text"

type Props = {
  params: { id: string }
}

export default function EventSlotsPage({ params }: Props) {
  const { toast } = useToast()

  // In Next.js app router, params is already resolved
  const eventId = params.id

  // State for event data
  const [event, setEvent] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // State for actions
  const [isDeleting, setIsDeleting] = useState(false)
  const [slotToDelete, setSlotToDelete] = useState<string | null>(null)
  const [isPausing, setIsPausing] = useState(false)
  const [slotToPause, setSlotToPause] = useState<string | null>(null)

  // Slot status management
  const [slotStatuses, setSlotStatuses] = useState<Record<string, string>>({})

  // Function to fetch event data and slot statuses
  const fetchEventData = async () => {
    try {
      setIsLoading(true)
      setError(null)

      // Fetch both event data and slot statuses in parallel
      const [eventData, statusData] = await Promise.all([
        getEventWithGames(eventId),
        getAllSlotStatuses()
      ])

      setEvent(eventData)
      setSlotStatuses(statusData)
    } catch (err: any) {
      setError(err.message || "Failed to load event data")
      toast({
        title: "Error",
        description: err.message || "Failed to load event data",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Fetch event data with games/slots
  useEffect(() => {
    fetchEventData()
  }, [eventId, toast])

  // Refetch data when the page becomes visible (when navigating back)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        // Page became visible, refetch data
        fetchEventData()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [eventId])

  // Handle delete slot
  const handleDeleteSlot = async (slotId: string) => {
    try {
      setIsDeleting(true)
      setSlotToDelete(slotId)

      const result = await deleteEventGameSlot(Number(slotId))

      if (result && (result.success || (Array.isArray(result) && result[0]?.success))) {
        toast({
          title: "Success",
          description: "Game slot deleted successfully",
        })

        // Refresh the event data
        await fetchEventData()
      } else {
        throw new Error("Failed to delete slot")
      }
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to delete slot",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
      setSlotToDelete(null)
    }
  }

  // Handle pause/resume slot
  const handleTogglePauseSlot = async (slotId: string, currentStatus: string) => {
    try {
      setIsPausing(true)
      setSlotToPause(slotId)

      // Find the current slot data
      const currentSlot = event.games?.find((game: any) => game.slot_id?.toString() === slotId)
      if (!currentSlot) {
        throw new Error("Slot not found")
      }

      // Determine new status
      const newStatus = currentStatus === 'paused' ? 'active' : 'paused'

      // Update local status state immediately for better UX
      setSlotStatuses(prev => {
        const updated = { ...prev }
        if (newStatus === 'active') {
          delete updated[slotId] // Remove from state if setting to default
        } else {
          updated[slotId] = newStatus
        }
        return updated
      })


      try {
        // Call our status API to update the slot status
        const result = await updateSlotStatus(slotId, newStatus)


        toast({
          title: "Success",
          description: `Game slot ${newStatus === 'paused' ? 'paused' : 'resumed'} successfully`,
        })

        // Refresh the slot statuses to ensure we have the latest data
        const updatedStatuses = await getAllSlotStatuses()
        setSlotStatuses(updatedStatuses)

      } catch (apiError: any) {
        console.error("API error updating slot status:", apiError)

        // Revert the local state change on API error
        setSlotStatuses(prev => {
          const reverted = { ...prev }
          if (currentStatus === 'active') {
            delete reverted[slotId]
          } else {
            reverted[slotId] = currentStatus
          }
          return reverted
        })

        toast({
          title: "Error",
          description: `Failed to ${newStatus === 'paused' ? 'pause' : 'resume'} slot: ${apiError.message}`,
          variant: "destructive",
        })
      }

    } catch (err: any) {
      console.error("Error toggling slot status:", err)

      toast({
        title: "Error",
        description: err.message || "Failed to update slot status",
        variant: "destructive",
      })
    } finally {
      setIsPausing(false)
      setSlotToPause(null)
    }
  }

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <div className="flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          <p className="text-muted-foreground">Loading event data...</p>
        </div>
      </div>
    )
  }

  // Show error state
  if (error || !event) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Event Not Found</h2>
          <p className="text-muted-foreground">
            {error || "The event you're looking for doesn't exist or has been removed."}
          </p>
          <Button className="mt-4" asChild>
            <Link href="/admin/events">Back to Events</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" asChild>
          <Link href={`/admin/events/${eventId}`}>
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back</span>
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Manage Time Slots</h1>
          <p className="text-muted-foreground">
            {event.event_title} | {event.venue?.venue_name}, {event.city?.city_name} | {new Date(event.event_date).toLocaleDateString()}
          </p>
          {event.event_description && (
            <div className="mt-1">
              <TruncatedText
                text={event.event_description}
                maxLength={120}
                className="text-sm text-muted-foreground"
                showTooltip={true}
              />
            </div>
          )}
        </div>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Time Slots</CardTitle>
            <CardDescription>Manage time slots for this event</CardDescription>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={fetchEventData} disabled={isLoading}>
              <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button asChild>
              <Link href={`/admin/events/${eventId}/slots/new`}>
                <Plus className="mr-2 h-4 w-4" />
                Add New Slot
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Game/Slot</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Capacity</TableHead>
                  <TableHead>Bookings</TableHead>
                  <TableHead>Participants</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {!event.games || event.games.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="h-24 text-center">
                      <div className="text-center">
                        <p className="text-muted-foreground">No game slots defined for this event.</p>
                        <p className="text-sm text-muted-foreground mt-2">
                          Add games and time slots to start accepting bookings.
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  event.games.map((game: any) => (
                    <TableRow key={game.slot_id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{game.custom_title || `Game ${game.game_id}`}</div>
                          {game.custom_description && (
                            <TruncatedText
                              text={game.custom_description}
                              maxLength={80}
                              className="text-sm text-muted-foreground"
                              showTooltip={true}
                            />
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>{game.start_time}</div>
                          <div className="text-muted-foreground">to {game.end_time}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium">₹{game.slot_price || game.custom_price || 0}</span>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium">{game.max_participants || 0}</span>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="text-sm font-medium">0/{game.max_participants || 0}</div>
                          <div className="h-2 w-full rounded-full bg-muted">
                            <div
                              className="h-full rounded-full bg-primary"
                              style={{
                                width: `0%`, // TODO: Get actual booking data
                              }}
                            />
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/admin/events/${eventId}/slots/${game.slot_id}/participants`}>
                            <Users className="mr-2 h-4 w-4" />
                            View
                          </Link>
                        </Button>
                      </TableCell>
                      <TableCell>
                        {(() => {
                          // Use API status if available, otherwise use local status, default to active
                          const status = slotStatuses[game.slot_id?.toString()] || game.status || 'active'
                          switch (status) {
                            case 'active':
                              return <Badge className="bg-green-500 hover:bg-green-600">Active</Badge>
                            case 'paused':
                              return <Badge className="bg-amber-500 hover:bg-amber-600">Paused</Badge>
                            case 'cancelled':
                              return <Badge className="bg-red-500 hover:bg-red-600">Cancelled</Badge>
                            case 'completed':
                              return <Badge className="bg-blue-500 hover:bg-blue-600">Completed</Badge>
                            case 'full':
                              return <Badge className="bg-purple-500 hover:bg-purple-600">Full</Badge>
                            default:
                              return <Badge className="bg-gray-500 hover:bg-gray-600">Unknown</Badge>
                          }
                        })()}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="sm" asChild>
                            <Link href={`/admin/events/${eventId}/slots/${game.slot_id}/edit`}>
                              <Edit className="h-4 w-4" />
                            </Link>
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                disabled={isPausing && slotToPause === game.slot_id?.toString()}
                              >
                                {(() => {
                                  const currentStatus = slotStatuses[game.slot_id?.toString()] || game.status || 'active'
                                  return currentStatus === 'paused' ? (
                                    <Play className="h-4 w-4" />
                                  ) : (
                                    <Pause className="h-4 w-4" />
                                  )
                                })()}
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  {(() => {
                                    const currentStatus = slotStatuses[game.slot_id?.toString()] || game.status || 'active'
                                    return currentStatus === 'paused' ? 'Resume' : 'Pause'
                                  })()} Game Slot
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  {(() => {
                                    const currentStatus = slotStatuses[game.slot_id?.toString()] || game.status || 'active'
                                    return currentStatus === 'paused'
                                      ? 'This will resume this game slot and allow new bookings again. Are you sure you want to continue?'
                                      : 'This will pause this game slot. No new bookings will be allowed, but existing bookings will be maintained. Are you sure you want to continue?'
                                  })()}
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => {
                                  const currentStatus = slotStatuses[game.slot_id?.toString()] || game.status || 'active'
                                  handleTogglePauseSlot(game.slot_id?.toString() || "", currentStatus)
                                }}>
                                  {(() => {
                                    const currentStatus = slotStatuses[game.slot_id?.toString()] || game.status || 'active'
                                    return currentStatus === 'paused' ? 'Resume' : 'Pause'
                                  })()} Slot
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-red-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/20"
                                disabled={isDeleting && slotToDelete === game.slot_id?.toString()}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Game Slot</AlertDialogTitle>
                                <AlertDialogDescription>
                                  <p>
                                    This will permanently delete this game slot. This action cannot be undone. Are you sure you want to continue?
                                  </p>
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>No, Keep Slot</AlertDialogCancel>
                                <AlertDialogAction
                                  className="bg-red-500 hover:bg-red-600"
                                  onClick={() => handleDeleteSlot(game.slot_id?.toString() || "")}
                                >
                                  Yes, Delete Slot
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
