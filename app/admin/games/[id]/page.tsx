"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Edit, Trash, AlertTriangle, Loader2 } from "lucide-react"
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
import { getBabyGameById, deleteBabyGame } from "@/services/babyGameService"
import { useToast } from "@/components/ui/use-toast"

type Props = {
  params: { id: string }
}

export default function GameDetailPage({ params }: Props) {
  const router = useRouter()
  const { toast } = useToast()

  // In Next.js app router, params is already resolved
  const gameId = parseInt(params.id, 10)

  const [game, setGame] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  // Fetch game data when component mounts
  useEffect(() => {
    const fetchGameData = async () => {
      try {
        setIsLoading(true)
        setError(null)

        // Validate gameId
        if (isNaN(gameId) || gameId <= 0) {
          const errorMsg = `Invalid game ID: ${resolvedParams.id}. ID must be a positive number.`
          setError(errorMsg)
          setIsLoading(false)
          return
        }

        const gameData = await getBabyGameById(gameId)

        if (!gameData) {
          throw new Error("No game data returned from API")
        }

        // Add some default values for statistics since they're not in the API
        const enhancedGameData = {
          ...gameData,
          events: 10, // Default value for statistics
          createdBy: "Admin User",
          createdAt: gameData.created_at ? new Date(gameData.created_at).toLocaleDateString() : "N/A",
          lastUpdatedBy: "Admin User",
          lastUpdatedAt: gameData.updated_at ? new Date(gameData.updated_at).toLocaleDateString() : "N/A",
        }

        setGame(enhancedGameData)
      } catch (error: any) {
        const errorMsg = error.message || "Failed to load game data. Please try again."
        setError(errorMsg)

        toast({
          title: "Error",
          description: errorMsg,
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchGameData()
  }, [gameId]) // Removed toast from dependency array to prevent infinite loop

  const handleDelete = async () => {
    try {
      setIsDeleting(true)

      // Call the API to delete the game
      await deleteBabyGame(gameId)

      toast({
        title: "Game Deleted",
        description: "The game has been deleted successfully.",
        variant: "default",
      })

      // Redirect to the games list
      router.push("/admin/games")
    } catch (error: any) {

      toast({
        title: "Error",
        description: error.message || "Failed to delete game. Please try again.",
        variant: "destructive",
      })

      setIsDeleting(false)
      setShowDeleteDialog(false)
    }
  }

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
          <h2 className="mt-4 text-xl font-semibold">Loading Game Data</h2>
          <p className="text-muted-foreground">Please wait while we fetch the game details...</p>
        </div>
      </div>
    )
  }

  // Show error state
  if (error || !game) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Game Not Found</h2>
          <p className="text-muted-foreground">
            {error || "The game template you're looking for doesn't exist or has been removed."}
          </p>
          <Button className="mt-4" asChild>
            <Link href="/admin/games">Back to Games</Link>
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
            <Link href="/admin/games">
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Back</span>
            </Link>
          </Button>
          <div className="min-w-0 flex-1">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight truncate">{game.game_name}</h1>
            <p className="text-sm sm:text-base text-muted-foreground truncate">
              {game.min_age}-{game.max_age} months | {game.duration_minutes} minutes
            </p>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button variant="outline" asChild className="touch-manipulation">
            <Link href={`/admin/games/${game.id}/edit`}>
              <Edit className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Edit Game</span>
              <span className="sm:hidden">Edit</span>
            </Link>
          </Button>
          <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
            <AlertDialogTrigger asChild>
              <Button variant="outline" className="text-red-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/20">
                <Trash className="mr-2 h-4 w-4" />
                Delete Game
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Game Template</AlertDialogTitle>
                <AlertDialogDescription>
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="mt-0.5 h-5 w-5 text-amber-500" />
                    <div className="space-y-2">
                      <div className="font-medium">This action cannot be undone.</div>
                      <div>
                        This will permanently delete the "{game.game_name}" game template. This template is used in {game.events} events.
                        Deleting it will not affect existing events, but you won't be able to create new events with this template.
                      </div>
                    </div>
                  </div>
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  className="bg-red-500 hover:bg-red-600"
                  onClick={handleDelete}
                  disabled={isDeleting}
                >
                  {isDeleting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    "Delete"
                  )}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Game Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="mb-2 font-medium">Description</h3>
            <p className="text-sm text-muted-foreground">{game.description}</p>
          </div>
          <Separator />
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <h3 className="mb-2 font-medium">Age Range</h3>
              <p className="text-sm text-muted-foreground">
                {game.min_age}-{game.max_age} months
              </p>
            </div>
            <div>
              <h3 className="mb-2 font-medium">Duration</h3>
              <p className="text-sm text-muted-foreground">{game.duration_minutes} minutes</p>
            </div>
            <div>
              <h3 className="mb-2 font-medium">Status</h3>
              {game.is_active ? (
                <Badge className="bg-green-500 hover:bg-green-600">Active</Badge>
              ) : (
                <Badge variant="outline">Inactive</Badge>
              )}
            </div>
          </div>
          <Separator />
          <div>
            <h3 className="mb-2 font-medium">Categories</h3>
            <div className="flex flex-wrap gap-2">
              {game.categories && game.categories.map((category: string) => (
                <Badge key={category} variant="secondary">
                  {category}
                </Badge>
              ))}
            </div>
          </div>
          <Separator />
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <h3 className="mb-2 font-medium">Created By</h3>
              <p className="text-sm text-muted-foreground">
                {game.createdBy} on {game.createdAt}
              </p>
            </div>
            <div>
              <h3 className="mb-2 font-medium">Last Updated By</h3>
              <p className="text-sm text-muted-foreground">
                {game.lastUpdatedBy} on {game.lastUpdatedAt}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
