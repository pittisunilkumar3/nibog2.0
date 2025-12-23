"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { X, Star, ArrowLeft, Loader2 } from "lucide-react"
import { getBabyGameById, updateBabyGame, uploadBabyGameImage, fetchGameImages, uploadGameImage, sendGameImageToWebhook, updateGameImage } from "@/services/babyGameService"
import { useToast } from "@/components/ui/use-toast"

type Props = {
  params: { id: string }
}

export default function EditGameTemplate({ params }: Props) {
  const router = useRouter()
  const { toast } = useToast()

  // Get the game ID from params
  const gameId = parseInt(params.id, 10)

  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [game, setGame] = useState<any>(null)

  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [minAge, setMinAge] = useState(0)
  const [maxAge, setMaxAge] = useState(300) // Set default max age to 300
  const [duration, setDuration] = useState(60)
  const [isActive, setIsActive] = useState(true)
  const [newCategory, setNewCategory] = useState("")
  const [categories, setCategories] = useState<string[]>([])
  const [isGeneratingDescription, setIsGeneratingDescription] = useState(false)
  const [isSaved, setIsSaved] = useState(false)
  const [gameImage, setGameImage] = useState<string | null>(null)
  const [gameImageFile, setGameImageFile] = useState<File | null>(null)
  const [existingImages, setExistingImages] = useState<any[]>([])
  const [isUploadingImage, setIsUploadingImage] = useState(false)
  const [isLoadingImages, setIsLoadingImages] = useState(false)
  const [imagePriority, setImagePriority] = useState("1")

  // Fetch game data when component mounts
  useEffect(() => {
    const fetchGameData = async () => {
      try {
        setIsLoading(true)
        setError(null)

        // Validate gameId
        if (isNaN(gameId) || gameId <= 0) {
          const errorMsg = `Invalid game ID: ${params.id}. ID must be a positive number.`
          setError(errorMsg)
          setIsLoading(false)
          return
        }

        const gameData = await getBabyGameById(gameId)

        if (!gameData) {
          throw new Error("No game data returned from API")
        }

        setGame(gameData)
        setName(gameData.game_name || "")
        setDescription(gameData.description || "")
        setMinAge(gameData.min_age || 0)
        setMaxAge(gameData.max_age || 300)
        setDuration(gameData.duration_minutes || 60)
        // Normalize is_active to boolean (API may return 0/1 or boolean)
        setIsActive(Boolean(gameData.is_active))

        // Normalize categories to string[] — handle array, JSON string, or comma-separated string
        {
          const catsRaw = gameData.categories
          let cats: string[] = []
          if (Array.isArray(catsRaw)) {
            cats = catsRaw
          } else if (typeof catsRaw === 'string' && catsRaw.trim()) {
            try {
              const parsed = JSON.parse(catsRaw)
              if (Array.isArray(parsed)) {
                cats = parsed
              } else {
                cats = catsRaw.split(',').map((s) => s.trim()).filter(Boolean)
              }
            } catch {
              cats = catsRaw.split(',').map((s) => s.trim()).filter(Boolean)
            }
          }
          setCategories(cats)
        }

        // Fetch existing images
        fetchExistingImages()

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
  }, [gameId, params.id]) // Removed toast from dependency array to prevent infinite loop

  // Fetch existing images for the game
  const fetchExistingImages = async () => {
    try {
      setIsLoadingImages(true)
      // Fetch existing images (debug logs removed)

      const images = await fetchGameImages(gameId)
      // Raw game images response (debug logs removed)

      // Enhanced filtering to handle empty objects and invalid data
      const validImages = Array.isArray(images)
        ? images.filter(img =>
          img &&
          typeof img === 'object' &&
          img.id !== undefined &&
          img.image_url !== undefined &&
          img.image_url !== null &&
          img.image_url.trim() !== ''
        )
        : []

      setExistingImages(validImages)

      // Get the LATEST image (highest priority or most recent) for editing
      if (validImages.length > 0) {
        // Sort by priority (descending) then by created_at (descending) to get the latest
        const sortedImages = [...validImages].sort((a, b) => {
          if (a.priority !== b.priority) {
            return b.priority - a.priority; // Higher priority first
          }
          // If same priority, use most recent
          return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
        });

        const latestImage = sortedImages[0];

        if (latestImage.image_url) {
          setGameImage(latestImage.image_url)
          setImagePriority(latestImage.priority?.toString() || "1")
        }
      } else {
        // No valid images found
      }
    } catch (error: any) {
      console.error("❌ Failed to fetch existing images:", error)
      // Don't show error toast for images as it's not critical
      console.warn("Could not load existing images, continuing without them")
    } finally {
      setIsLoadingImages(false)
    }
  }

  const handleAddCategory = () => {
    if (newCategory.trim() && !categories.includes(newCategory.trim())) {
      setCategories([...categories, newCategory.trim()])
      setNewCategory("")
    }
  }

  const handleRemoveCategory = (category: string) => {
    setCategories(categories.filter((c) => c !== category))
  }

  const handleGenerateDescription = () => {
    // In a real app, this would call the AI API
    setIsGeneratingDescription(true)
    setTimeout(() => {
      setDescription(
        `This engaging ${name.toLowerCase()} session is designed for babies aged ${minAge}-${maxAge} months. During this ${duration}-minute activity, children will explore and develop various skills in a safe and stimulating environment. Parents will be guided through age-appropriate activities that promote development and bonding.`,
      )
      setIsGeneratingDescription(false)
    }, 1500)
  }

  // Handle image upload - store the file for later use
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Error",
        description: "Invalid file type. Only JPG, PNG, GIF, and WebP images are allowed.",
        variant: "destructive",
      })
      return
    }

    // Validate file size (5MB limit)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      toast({
        title: "Error",
        description: "File size too large. Maximum size is 5MB.",
        variant: "destructive",
      })
      return
    }

    setGameImageFile(file)
    setGameImage(file.name) // Store filename for display
    // Game image selected (debug log removed)

    toast({
      title: "Success",
      description: "Game image selected! It will be uploaded after game update.",
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      setIsSubmitting(true)
      setError(null)

      let finalImageUrl = gameImage;

      // 1. Upload the image first if a new one was selected
      if (gameImageFile) {
        try {
          // Uploading new game image (debug logs removed)
          const uploadResult = await uploadGameImage(gameImageFile);
          finalImageUrl = uploadResult.path;
        } catch (imageError: any) {
          console.error("❌ Error uploading image:", imageError);
          throw new Error(`Image upload failed: ${imageError.message || "Unknown error"}`);
        }
      }

      // 2. Prepare the game data for the new REST API
      const gameData = {
        id: gameId,
        game_name: name,
        description: description,
        min_age: minAge,
        max_age: maxAge,
        duration_minutes: duration,
        categories: JSON.stringify(categories), // Send as JSON string for backend
        is_active: isActive ? 1 : 0,
        image_url: finalImageUrl,
        priority: parseInt(imagePriority) || 1
      }

      // Updating baby game (debug logs removed)

      // 3. Call the API to update the game
      const result = await updateBabyGame(gameData as any)
      // Updated game result (debug logs removed)

      toast({
        title: "Success",
        description: `${name} has been updated successfully!`,
      })

      // Show saved state
      setIsSaved(true)
      setTimeout(() => {
        setIsSaved(false)
        router.push(`/admin/games`)
      }, 2000)

    } catch (error: any) {
      console.error("Update game error:", error);
      setError(error.message || "Failed to update game. Please try again.")

      toast({
        title: "Error",
        description: error.message || "Failed to update game. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
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
            <Link href={`/admin/games/${gameId}`}>
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Back</span>
            </Link>
          </Button>
          <div className="min-w-0 flex-1">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight truncate">Edit Game Template</h1>
            <p className="text-sm sm:text-base text-muted-foreground truncate">Update the details for {game.game_name}</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Game Details</CardTitle>
            <CardDescription>Update the details for this game template</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Game Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter game name"
                required
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="description">Description</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleGenerateDescription}
                  disabled={isGeneratingDescription || !name}
                >
                  <Star className="mr-2 h-4 w-4" />
                  {isGeneratingDescription ? "Generating..." : "Generate with AI"}
                </Button>
              </div>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter game description"
                rows={5}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="gameImage">Game Image</Label>
              <div className="space-y-2">
                <Input
                  id="gameImage"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={isUploadingImage}
                  className="cursor-pointer"
                />
                {isLoadingImages && (
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Loading existing images...
                  </div>
                )}
                {isUploadingImage && (
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Uploading image...
                  </div>
                )}
                {existingImages.length > 0 && !gameImageFile && (
                  <div className="space-y-3">
                    <div className="text-sm font-medium text-gray-700">
                      Current Game Images ({existingImages.length}):
                    </div>
                    {/* Sort images by priority (desc) then by created_at (desc) to show latest first */}
                    {[...existingImages]
                      .sort((a, b) => {
                        if (a.priority !== b.priority) {
                          return b.priority - a.priority; // Higher priority first
                        }
                        return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
                      })
                      .map((img, index) => (
                        <div
                          key={img.id || index}
                          className={`p-3 border rounded-lg ${index === 0
                              ? 'bg-green-50 border-green-200' // Latest image gets green highlight
                              : 'bg-blue-50 border-blue-200'
                            }`}
                        >
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div><strong>Image:</strong> {img.image_url ? img.image_url.split('/').pop() : 'Unknown file'}</div>
                            <div><strong>Priority:</strong>
                              <span className="ml-1 font-semibold text-blue-600">{img.priority || 'N/A'}</span>
                              {index === 0 && <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-1 rounded">CURRENT</span>}
                            </div>
                            <div><strong>Status:</strong>
                              <span className={`ml-1 px-2 py-1 rounded text-xs ${img.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                {img.is_active ? 'Active' : 'Inactive'}
                              </span>
                            </div>
                            <div><strong>ID:</strong> {img.id}</div>
                            <div className="col-span-2"><strong>Created:</strong> {img.created_at ? new Date(img.created_at).toLocaleString() : 'N/A'}</div>
                            <div className="col-span-2"><strong>Updated:</strong> {img.updated_at ? new Date(img.updated_at).toLocaleString() : 'N/A'}</div>
                          </div>
                        </div>
                      ))}
                    <div className="text-xs text-blue-600 bg-blue-50 p-2 rounded">
                      💡 Priority loaded from latest image (highest priority/most recent). Upload a new image to update.
                      <br />
                      ⚠️ Note: Due to API limitations, updates create new records. Latest image is used for editing.
                    </div>
                  </div>
                )}
                {isLoadingImages && (
                  <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                    <div className="flex items-center text-sm text-gray-600">
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Loading existing images...
                    </div>
                  </div>
                )}

                {existingImages.length === 0 && !gameImageFile && !isLoadingImages && (
                  <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="text-sm text-yellow-800">
                      📷 No existing images found for Game ID {gameId}
                    </div>
                    <div className="text-xs text-yellow-600 mt-1">
                      This game doesn't have any images yet. Upload an image above to add one.
                    </div>
                  </div>
                )}

                {gameImageFile && (
                  <div className="flex items-center text-sm text-blue-600">
                    <span>✓ New image selected: {gameImageFile.name} (will be uploaded after game update)</span>
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <Input
                  id="priority"
                  type="number"
                  min="1"
                  max="10"
                  value={imagePriority}
                  onChange={(e) => setImagePriority(e.target.value)}
                  placeholder="Enter priority (1-10)"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Age Range (months)</Label>
              <div className="space-y-4">
                <div>
                  <div className="mb-2 flex justify-between text-sm">
                    <span>Minimum Age: {minAge} months</span>
                    <span>Maximum Age: {maxAge} months</span>
                  </div>
                  <div className="px-1">
                    <Slider
                      value={[minAge, maxAge]}
                      min={0}
                      max={300}
                      step={1}
                      onValueChange={(value) => {
                        setMinAge(value[0])
                        setMaxAge(value[1])
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="duration">Duration (minutes)</Label>
              <div className="space-y-4">
                <div>
                  <div className="mb-2 flex justify-between text-sm">
                    <span>Duration: {duration} minutes</span>
                  </div>
                  <div className="px-1">
                    <Slider
                      value={[duration]}
                      min={30}
                      max={300}
                      step={15}
                      onValueChange={(value) => setDuration(value[0])}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Categories/Tags</Label>
              <div className="flex gap-2">
                <Input
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  placeholder="Add a category"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault()
                      handleAddCategory()
                    }
                  }}
                />
                <Button type="button" onClick={handleAddCategory}>
                  Add
                </Button>
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                {categories.map((category: string) => (
                  <Badge key={category} variant="secondary">
                    {category}
                    <button
                      type="button"
                      className="ml-1 rounded-full outline-none ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2"
                      onClick={() => handleRemoveCategory(category)}
                    >
                      <X className="h-3 w-3" />
                      <span className="sr-only">Remove {category}</span>
                    </button>
                  </Badge>
                ))}
                {categories.length === 0 && <span className="text-sm text-muted-foreground">No categories added</span>}
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Switch id="active" checked={isActive} onCheckedChange={setIsActive} />
              <Label htmlFor="active">Active</Label>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button type="button" variant="outline" onClick={() => router.push(`/admin/games/${gameId}`)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || isSaved}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : isSaved ? (
                "Saved!"
              ) : (
                "Save Changes"
              )}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  )
}
