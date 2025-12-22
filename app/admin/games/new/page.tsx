"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { X, Star, Loader2 } from "lucide-react"
import { createBabyGame, uploadBabyGameImage, uploadGameImage, sendGameImageToWebhook } from "@/services/babyGameService"
import { toast } from "@/components/ui/use-toast"

export default function NewGameTemplate() {
  const router = useRouter()
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [minAge, setMinAge] = useState(0)
  const [maxAge, setMaxAge] = useState(300) // Support games up to 90 months
  const [duration, setDuration] = useState(60)
  const [isActive, setIsActive] = useState(true)
  const [newCategory, setNewCategory] = useState("")
  const [categories, setCategories] = useState<string[]>([])
  const [isGeneratingDescription, setIsGeneratingDescription] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [gameImage, setGameImage] = useState<string | null>(null)
  const [gameImageFile, setGameImageFile] = useState<File | null>(null)
  const [isUploadingImage, setIsUploadingImage] = useState(false)
  const [imagePriority, setImagePriority] = useState("1")

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

  // Handle image upload - just store the file for now, upload after game creation
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
      description: "Game image selected! It will be uploaded after game creation.",
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      let finalImageUrl = gameImage;

      // 1. Upload the image first if a new one was selected
      if (gameImageFile) {
        try {
          // Uploading game image (debug logs removed)
          const uploadResult = await uploadGameImage(gameImageFile);
          finalImageUrl = uploadResult.path;
        } catch (imageError: any) {
          console.error("Error uploading image:", imageError);
          throw new Error(`Image upload failed: ${imageError.message || "Unknown error"}`);
        }
      }

      // 2. Format the data for the new REST API
      const gameData = {
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

      // Creating baby game (debug logs removed)

      // 3. Call the API to create the game
      const result = await createBabyGame(gameData as any)
      // Created game result (debug logs removed)

      toast({
        title: "Success",
        description: `${name} has been created successfully!`,
      })

      // Redirect to list
      setTimeout(() => {
        router.push("/admin/games")
      }, 2000)
    } catch (error: any) {
      console.error("Create game error:", error);
      setError(error.message || "Failed to create game. Please try again.")

      toast({
        title: "Error",
        description: error.message || "Failed to create game. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Add New Game Template</h1>
        <p className="text-muted-foreground">Create a new game template for scheduling events</p>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Game Details</CardTitle>
            <CardDescription>Enter the details for the new game template</CardDescription>
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
                {isUploadingImage && (
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Uploading image...
                  </div>
                )}
                {gameImageFile && (
                  <div className="flex items-center text-sm text-blue-600">
                    <span>✓ Image selected: {gameImageFile.name} (will be uploaded after game creation)</span>
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
                    <div className="flex items-center gap-2">
                      <span>Minimum Age:</span>
                      <Input
                        type="number"
                        value={minAge}
                        onChange={(e) => {
                          const value = parseInt(e.target.value);
                          if (!isNaN(value) && value >= 0 && value <= maxAge) {
                            setMinAge(value);
                          }
                        }}
                        className="w-16 h-8"
                        min={0}
                        max={maxAge}
                      />
                      <span>months</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span>Maximum Age:</span>
                      <Input
                        type="number"
                        value={maxAge}
                        onChange={(e) => {
                          const value = parseInt(e.target.value);
                          if (!isNaN(value) && value >= minAge && value <= 300) {
                            setMaxAge(value);
                          }
                        }}
                        className="w-16 h-8"
                        min={minAge}
                        max={300}
                      />
                      <span>months</span>
                    </div>
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
                    <div className="flex items-center gap-2">
                      <span>Duration:</span>
                      <Input
                        type="number"
                        value={duration}
                        onChange={(e) => {
                          const value = parseInt(e.target.value);
                          if (!isNaN(value) && value >= 30 && value <= 120) {
                            // Round to nearest 15 minutes
                            const rounded = Math.round(value / 15) * 15;
                            setDuration(rounded);
                          }
                        }}
                        className="w-16 h-8"
                        min={30}
                        max={120}
                        step={15}
                      />
                      <span>minutes</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setDuration(Math.max(30, duration - 15))}
                        className="h-8 px-2"
                      >
                        -15
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setDuration(Math.min(120, duration + 15))}
                        className="h-8 px-2"
                      >
                        +15
                      </Button>
                    </div>
                  </div>
                  <div className="px-1">
                    <Slider
                      value={[duration]}
                      min={30}
                      max={120}
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
          <CardFooter className="flex flex-col gap-4">
            {error && (
              <div className="w-full rounded-md bg-destructive/15 p-3 text-sm text-destructive">
                {error}
              </div>
            )}
            <div className="flex w-full justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/admin/games")}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Save Game Template"
                )}
              </Button>
            </div>
          </CardFooter>
        </Card>
      </form>
    </div>
  )
}
