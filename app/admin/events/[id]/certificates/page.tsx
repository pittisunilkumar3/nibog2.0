"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Download, Mail, FileText, Loader2, Users, Award, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import {
  EventParticipantsResponse,
  EventParticipant,
  CertificateTemplate,
  BulkGenerationProgress
} from "@/types/certificate"
import { getEventParticipants, generateBulkCertificates } from "@/services/certificateGenerationService"
import { getAllCertificateTemplates } from "@/services/certificateTemplateService"
import { generateCertificatePDF } from "@/services/certificatePdfService"


export default function EventCertificatesPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const eventId = parseInt(params.id as string)

  // State
  const [eventData, setEventData] = useState<EventParticipantsResponse | null>(null)
  const [templates, setTemplates] = useState<CertificateTemplate[]>([])
  const [selectedTemplate, setSelectedTemplate] = useState<number | null>(null)

  const [selectedParticipants, setSelectedParticipants] = useState<Set<string>>(new Set())
  const [searchTerm, setSearchTerm] = useState("")
  const [gameFilter, setGameFilter] = useState<string>("all")

  // Loading states
  const [loading, setLoading] = useState(true)
  const [templatesLoading, setTemplatesLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [bulkProgress, setBulkProgress] = useState<BulkGenerationProgress | null>(null)

  // Load data
  useEffect(() => {
    if (eventId) {
      loadEventParticipants()
      loadTemplates()
    }
  }, [eventId])

  const loadEventParticipants = async () => {
    try {
      setLoading(true)
      // Loading participants for event ID (debug log removed)
      const data = await getEventParticipants(eventId)
      // Participants data received (debug log removed)
      // Handle both array response and direct object response formats
      if (Array.isArray(data)) {
        // If it's an array (new API format), take the first item
        const firstResponse = data[0];
        // Array response format (debug log removed)
        
        // If we have participants, extract event info from the first participant
        if (firstResponse?.participants?.length > 0) {
          const firstParticipant = firstResponse.participants[0];
          // First participant with event info (debug log removed)
          
          // Create enhanced event data with info from both the response and first participant
          const enhancedEventData = {
            ...firstResponse,
            event_title: firstParticipant.event_title,
            event_name: firstParticipant.event_title, // Use event_title as event_name if needed
            venue_name: firstParticipant.venue_name,
            event_date: firstParticipant.event_date
          };
          
          // Enhanced event data created (debug log removed)
          setEventData(enhancedEventData);
        } else {
          setEventData(firstResponse);
        }
      } else {
        // If it's already an object (old format)
        // Object response format (debug log removed)
        
        // Similar logic for object format
        if (data?.participants?.length > 0) {
          const firstParticipant = data.participants[0];
          const enhancedEventData = {
            ...data,
            event_title: firstParticipant.event_title,
            event_name: firstParticipant.event_title,
            venue_name: firstParticipant.venue_name,
            event_date: firstParticipant.event_date
          };
          setEventData(enhancedEventData);
        } else {
          setEventData(data);
        }
      }
    } catch (error) {
      console.error('Error loading participants:', error)
      toast({
        title: "Error",
        description: "Failed to load event participants",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const loadTemplates = async () => {
    try {
      setTemplatesLoading(true)
      const data = await getAllCertificateTemplates()
      setTemplates(data.filter(t => t.is_active))
    } catch (error) {
      console.error('Error loading templates:', error)
      toast({
        title: "Error",
        description: "Failed to load certificate templates",
        variant: "destructive"
      })
    } finally {
      setTemplatesLoading(false)
    }
  }

  // Filter participants - API handles status filtering, we just filter by search term and game
  const filteredParticipants = eventData?.participants?.filter(participant => {
    // Add safety checks for all properties before accessing them
    const parentName = participant?.parent_name || ''
    const childName = participant?.child_name || ''
    const gameId = participant?.game_id?.toString() || ''
    
    const matchesSearch = 
      parentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      childName.toLowerCase().includes(searchTerm.toLowerCase())
      
    const matchesGame = gameFilter === "all" || gameId === gameFilter
    
    return matchesSearch && matchesGame
  }) || []

  // Get unique games
  const uniqueGames = eventData?.participants?.reduce((acc, participant) => {
    const gameId = participant?.game_id
    const gameName = participant?.game_name || ''
    
    if (gameId !== undefined && !acc.find(g => g.id === gameId)) {
      acc.push({ id: gameId, name: gameName })
    }
    return acc
  }, [] as Array<{ id: number; name: string }>) || []

  // Select all participants functionality
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      // Create a new Set with all filtered participant IDs
      const newSelection = new Set(
        filteredParticipants.map(p => 
          `${p.booking_id}-${p.parent_id}-${p.child_id || 0}-${p.game_name}`
        )
      )
      setSelectedParticipants(newSelection)
    } else {
      // Clear all selections
      setSelectedParticipants(new Set())
    }
  }

  const handleSelectParticipant = (participant: EventParticipant, checked: boolean) => {
    const bookingId = participant?.booking_id || 0
    const parentId = participant?.parent_id || 0
    const childId = participant?.child_id || 0
    const gameName = participant?.game_name || ''
    const participantId = `${bookingId}-${parentId}-${childId}-${gameName}`
    
    // Create a new Set based on current selections
    const newSelections = new Set(selectedParticipants)
    
    if (checked) {
      // Add this participant to selections
      newSelections.add(participantId)
    } else {
      // Remove this participant from selections
      newSelections.delete(participantId)
    }
    
    setSelectedParticipants(newSelections)
  }

  const handleBulkGenerate = async () => {
    if (!selectedTemplate || selectedParticipants.size === 0) {
      toast({
        title: "Error",
        description: "Please select a template and at least one participant",
        variant: "destructive"
      })
      return
    }

    const participantsToGenerate = filteredParticipants.filter(p =>
      selectedParticipants.has(`${p.booking_id}-${p.parent_id}-${p.child_id || 0}-${p.game_name}`)
    )

    try {
      setGenerating(true)
      setBulkProgress(null)
      
      // Create a game name to ID mapping from uniqueGames
      const gameNameToIdMap = uniqueGames.reduce((map, game) => {
        map[game.name] = game.id;
        return map;
      }, {} as Record<string, number>);
      
      // Game name to ID mapping created (debug log removed);
      
      // Enhance participants with game IDs from the mapping
      const enhancedParticipants = participantsToGenerate.map(p => ({
        ...p,
        // Ensure game_id is a number or undefined (EventParticipant expects number | undefined)
        game_id: (p.game_id ?? gameNameToIdMap[p.game_name]) as number | undefined
      }));
      


      const progress = await generateBulkCertificates(
        selectedTemplate,
        eventId,
        enhancedParticipants,
        undefined, // No longer needed as each participant has game_id
        (progress) => setBulkProgress(progress)
      )

      toast({
        title: "Success",
        description: `Generated ${progress.completed} certificates successfully. ${progress.failed} failed.`,
        variant: progress.failed > 0 ? "destructive" : "default"
      })

      // Clear selections
      setSelectedParticipants(new Set())
    } catch (error) {
      console.error('Error generating certificates:', error)
      toast({
        title: "Error",
        description: "Failed to generate certificates",
        variant: "destructive"
      })
    } finally {
      setGenerating(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" asChild>
            <Link href="/admin/events">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Event Certificates</h1>
            <p className="text-muted-foreground">Loading event data...</p>
          </div>
        </div>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
              <span className="ml-2">Loading participants...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!eventData) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" asChild>
            <Link href="/admin/events">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Event Not Found</h1>
            <p className="text-muted-foreground">The requested event could not be found.</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/admin/events">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{eventData.event_title || 'Event Certificates'}</h1>
          <p className="text-muted-foreground">
            Generate certificates for participants
          </p>
        </div>
      </div>

      {/* Event Info */}
      <Card>
        <CardHeader>
          <CardTitle>Event Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-500">Event Name</p>
              <p className="text-lg font-semibold">{eventData.event_title}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Date</p>
              <p className="text-lg font-semibold">{eventData.event_date}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Venue</p>
              <p className="text-lg font-semibold">{eventData.venue_name}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Total Participants</p>
              <p className="text-lg font-semibold">{eventData.total_participants}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Certificate Generation */}
      <Card>
        <CardHeader>
          <CardTitle>
            {eventData?.event_title || 'Generate Certificates'}
          </CardTitle>
          <CardDescription>
            Select a template and participants to generate certificates
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Certificate Template</Label>
              <Select
                value={selectedTemplate?.toString() || ""}
                onValueChange={(value) => setSelectedTemplate(parseInt(value))}
                disabled={templatesLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder={templatesLoading ? "Loading templates..." : "Select template"} />
                </SelectTrigger>
                <SelectContent>
                  {templates.map((template) => (
                    <SelectItem key={template.id} value={template.id.toString()}>
                      {template.name} ({template.type})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button
                onClick={handleBulkGenerate}
                disabled={!selectedTemplate || selectedParticipants.size === 0 || generating}
                className="w-full"
              >
                {generating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Award className="mr-2 h-4 w-4" />
                    Generate Certificates ({selectedParticipants.size})
                  </>
                )}
              </Button>
            </div>
          </div>





          {/* Bulk Generation Progress */}
          {bulkProgress && (
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">
                      Generating certificates... {bulkProgress.completed + bulkProgress.failed} of {bulkProgress.total}
                    </span>
                    <span className="text-sm text-gray-500">{bulkProgress.current}</span>
                  </div>
                  <Progress
                    value={((bulkProgress.completed + bulkProgress.failed) / bulkProgress.total) * 100}
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm">
                    <span className="text-green-600">✓ {bulkProgress.completed} completed</span>
                    {bulkProgress.failed > 0 && (
                      <span className="text-red-600">✗ {bulkProgress.failed} failed</span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>

      {/* Participants List */}
      <Card>
        <CardHeader>
          <CardTitle>Participants</CardTitle>
          <CardDescription>
            Select participants to generate certificates for
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <Input
                placeholder="Search participants..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="w-full md:w-48">
              <Select value={gameFilter} onValueChange={setGameFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by game" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Games</SelectItem>
                  {uniqueGames.map((game) => (
                    <SelectItem key={game.id} value={game.id.toString()}>
                      {game.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Participants Table */}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox
                    checked={selectedParticipants.size === filteredParticipants.length && filteredParticipants.length > 0}
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
                <TableHead>Participant</TableHead>
                <TableHead>Booking ID</TableHead>
                <TableHead>Game</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredParticipants.map((participant) => {
                const participantId = `${participant.booking_id}-${participant.parent_id}-${participant.child_id || 0}-${participant.game_name}`
                const isSelected = selectedParticipants.has(participantId)

                return (
                  <TableRow key={participantId}>
                    <TableCell>
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={(checked) => handleSelectParticipant(participant, checked as boolean)}
                      />
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">
                          {participant.child_name || participant.parent_name}
                        </p>
                        <p className="text-sm text-gray-500">{participant.email}</p>
                        {participant.date_of_birth && (
                          <p className="text-xs text-gray-400">
                            DOB: {new Date(participant.date_of_birth).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{participant.booking_id}</Badge>
                      <p className="text-xs text-gray-500 mt-1">{participant.booking_ref}</p>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{participant.game_name}</Badge>
                    </TableCell>


                  </TableRow>
                )
              })}

              {filteredParticipants.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <Users className="h-8 w-8 text-muted-foreground" />
                      <p className="text-muted-foreground">
                        {searchTerm || gameFilter !== "all"
                          ? "No participants match your search criteria"
                          : "No participants found for this event"
                        }
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
