"use client"

import { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Save, Star } from "lucide-react"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

import { getAllCities, City } from "@/services/cityService"
import { getAllEventsWithDetails, getEventsByCityId } from "@/services/eventService"

// Testimonial statuses
const statuses = [
  { id: "1", name: "published", label: "Published" },
  { id: "2", name: "pending", label: "Pending" },
  { id: "3", name: "rejected", label: "Rejected" },
]

type Props = {
  params: {
    id: string;
  }
}

export default function EditTestimonialPage({ params }: Props) {
  const router = useRouter()
  const testimonialId = params.id

  const [testimonial, setTestimonial] = useState<any>(null)
  const [name, setName] = useState("")
  const [selectedCityId, setSelectedCityId] = useState<number | null>(null)
  const [event, setEvent] = useState("")
  const [rating, setRating] = useState("")
  const [testimonialText, setTestimonialText] = useState("")
  const [status, setStatus] = useState("")
  const [date, setDate] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSaved, setIsSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [cities, setCities] = useState<City[]>([])
  const [events, setEvents] = useState<Array<{ id: number, title: string }>>([])
  const [isLoadingEvents, setIsLoadingEvents] = useState(false)

  // Helper to convert local path to public URL
  const getImageUrl = (path: string | null) => {
    if (!path) return null;

    // If it's a data URL (from FileReader), return as is
    if (path.startsWith('data:')) {
      return path;
    }

    // If it's already a full URL, return as is
    if (/^https?:\/\//.test(path)) {
      return path;
    }

    // If it already starts with /api/serve-image/, return as is (already transformed)
    if (path.startsWith('/api/serve-image/')) {
      return path;
    }

    // If it starts with '/upload/', use it directly with serve-image API
    if (path.startsWith('/upload/')) {
      return `/api/serve-image${path}`;
    }
    // If it starts with './upload/' or 'upload/', convert to serve-image API
    else if (path.startsWith('./upload/') || path.startsWith('upload/')) {
      const cleanPath = path.replace(/^\.\//, '');
      return `/api/serve-image/${cleanPath}`;
    }
    // If it starts with '/', assume it's already a valid path but needs serve-image prefix
    else if (path.startsWith('/')) {
      return `/api/serve-image${path}`;
    }
    // Default: assume it's a filename in testmonialimage directory
    else {
      return `/api/serve-image/upload/testmonialimage/${path}`;
    }
  }

  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [existingImageUrl, setExistingImageUrl] = useState<string | null>(null)
  const [isUploadingImage, setIsUploadingImage] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadedImagePath, setUploadedImagePath] = useState<string | null>(null)
  const [priority, setPriority] = useState<number>(1)

  useEffect(() => {
    // Fetch cities on mount
    const fetchCities = async () => {
      try {
        const citiesData = await getAllCities();
        setCities(citiesData);
      } catch (error) {
        console.error('Error fetching cities:', error)
      }
    }

    fetchCities()
  }, [])

  // Load events when city is selected
  useEffect(() => {
    const fetchEvents = async () => {
      if (!selectedCityId) {
        setEvents([]);
        return;
      }

      setIsLoadingEvents(true);
      try {
        const eventsData = await getEventsByCityId(selectedCityId);
        
        // Transform events to consistent format
        const transformedEvents = eventsData.map((e: any) => ({
          id: e.id || e.event_id,
          title: e.title || e.event_title
        }));
        setEvents(transformedEvents);
      } catch (error) {
        console.error('Error fetching events:', error)
        setEvents([]);
      } finally {
        setIsLoadingEvents(false);
      }
    }

    fetchEvents()
  }, [selectedCityId])

  useEffect(() => {
    const fetchTestimonial = async () => {
      try {
        const response = await fetch('/api/testimonials/get', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            id: parseInt(testimonialId)
          })
        })

        if (!response.ok) {
          throw new Error('Failed to fetch testimonial')
        }

        const data = await response.json()
        if (data && data.length > 0) {
          const testimonialData = data[0]

          setTestimonial(testimonialData)
          setName(testimonialData.name)
          setSelectedCityId(testimonialData.city_id)
          setRating(testimonialData.rating.toString())
          setTestimonialText(testimonialData.testimonial)
          setStatus(testimonialData.status.toLowerCase()) // Convert to lowercase for frontend
          setDate(testimonialData.submitted_at.split('T')[0]) // Extract date from ISO string
          setPriority(testimonialData.priority || 1)
          
          // Set event after events are loaded for the city
          if (testimonialData.event_id) {
            setEvent(testimonialData.event_id.toString())
          }
        }
      } catch (error) {
        console.error('Error fetching testimonial:', error)
        setError('Failed to fetch testimonial data')
      }
    }

    if (testimonialId) {
      fetchTestimonial()
    }
  }, [testimonialId])

  // Fetch existing testimonial image data
  useEffect(() => {
    const fetchTestimonialImage = async () => {
      try {
        // Fetching existing testimonial image (debug log removed)

        const response = await fetch('/api/testimonials/images/get-single', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            testmonial_id: parseInt(testimonialId)
          })
        })

        if (!response.ok) {
          // If no image found, that's okay (debug log removed)
          return
        }

        const data = await response.json()
        // Existing testimonial image data received (debug log removed)

        // Handle array response (API returns array)
        const imageData = Array.isArray(data) ? data[0] : data

        if (imageData && imageData.image_url) {
          // Loading existing image (debug log removed)

          // For existing images, store the URL separately and don't set imagePreview
          // imagePreview should only be used for new uploads (data URLs)
          setExistingImageUrl(imageData.image_url)
          setUploadedImagePath(imageData.image_url)
          setPriority(imageData.priority || 1)

          // Loaded existing image and priority (debug logs removed)
        } else {
          // No existing image found for testimonial (debug log removed)
        }
      } catch (error) {
        console.error('Error fetching testimonial image:', error)
        // Don't show error to user - it's okay if no image exists
      }
    }

    if (testimonialId) {
      fetchTestimonialImage()
    }
  }, [testimonialId])

  // Handle image upload
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      setError('Please select a valid image file (JPEG, PNG, GIF, or WebP)')
      return
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024 // 5MB in bytes
    if (file.size > maxSize) {
      setError('Image file size must be less than 5MB')
      return
    }

    setSelectedImage(file)
    setError(null)

    // Create preview
    const reader = new FileReader()
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string)
    }
    reader.readAsDataURL(file)

    // Actually upload the file to the server
    setIsUploadingImage(true)
    setUploadProgress(0)

    try {
      // Create FormData for file upload
      const formData = new FormData()
      formData.append('file', file)

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + 10
        })
      }, 100)

      // Upload file to our API
      const uploadResponse = await fetch('/api/testimonials/upload-image', {
        method: 'POST',
        body: formData
      })

      clearInterval(progressInterval)
      setUploadProgress(100)

      if (!uploadResponse.ok) {
        const errorData = await uploadResponse.json()
        throw new Error(errorData.error || 'Failed to upload image')
      }

      const uploadResult = await uploadResponse.json()
      // Upload result received (debug log removed)

      // Set the uploaded image path from the server response
      setUploadedImagePath(uploadResult.path)

      // Image upload info (debug logs removed)

    } catch (error) {
      console.error('Error uploading image:', error)
      setError(error instanceof Error ? error.message : 'Failed to upload image. Please try again.')
    } finally {
      setIsUploadingImage(false)
    }
  }

  // Remove uploaded image
  const removeImage = () => {
    setSelectedImage(null)
    setImagePreview(null)
    setExistingImageUrl(null)
    setUploadedImagePath(null)
    setUploadProgress(0)
    setError(null)

    // Reset file input
    const fileInput = document.getElementById('testimonial-image-edit') as HTMLInputElement
    if (fileInput) {
      fileInput.value = ''
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      if (!selectedCityId) {
        throw new Error('Please select a city')
      }

      if (!event) {
        throw new Error('Please select an event')
      }

      // Prepare update data
      const updateData: any = {
        id: parseInt(testimonialId),
        name,
        city_id: selectedCityId,
        event_id: parseInt(event),
        rating: parseInt(rating),
        testimonial: testimonialText,
        submitted_at: date || new Date().toISOString().split('T')[0],
        status: status.charAt(0).toUpperCase() + status.slice(1), // Capitalize first letter
        priority: priority,
        is_active: 1
      }

      // Include image_url if a new image was uploaded or if there's an existing image
      if (uploadedImagePath) {
        // Extract just the filename from the path (e.g., "testimonial_1766294157627_3470.jpg")
        const imageFilename = uploadedImagePath.split('/').pop() || uploadedImagePath
        updateData.image_url = imageFilename
        // Including new uploaded image in update (debug log removed)
      } else if (existingImageUrl) {
        // Keep the existing image URL
        const imageFilename = existingImageUrl.split('/').pop() || existingImageUrl
        updateData.image_url = imageFilename
        // Keeping existing image in update (debug log removed)
      }

      // Submitting update with data (debug log removed)

      const token = typeof window !== 'undefined' ? (localStorage.getItem('adminToken') || sessionStorage.getItem('adminToken') || localStorage.getItem('token') || sessionStorage.getItem('token')) : null
      // Using token for testimonial update (debug log removed)
      if (!token) {
        throw new Error('No authentication token found. Please log in again.')
      }

      const response = await fetch(`/api/testimonials/${testimonialId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updateData)
      })

      const responseData = await response.text();
      let parsedData;
      try {
        parsedData = JSON.parse(responseData);
      } catch (e) {
        console.error('Response is not JSON:', responseData);
        throw new Error('Invalid response from server');
      }

      if (!response.ok) {
        console.error('Error response:', parsedData);
        
        // Specific handling for authentication errors
        if (response.status === 401) {
          throw new Error('Your session has expired or you are not authenticated. Please log in again and try updating the testimonial.');
        }
        
        throw new Error(parsedData.message || `Failed to update testimonial (Status: ${response.status})`);
      }

      // Testimonial updated successfully (debug log removed)

      setIsLoading(false)
      setIsSaved(true)

      // Reset the saved state after 1.5 seconds
      setTimeout(() => {
        setIsSaved(false)
        // Redirect to the testimonial details page
        router.push(`/admin/testimonials/${testimonialId}`)
      }, 1500)

    } catch (error) {
      console.error('Error updating testimonial:', error)
      setIsLoading(false)
      setError(error instanceof Error ? error.message : 'An error occurred while updating the testimonial')
    }
  }

  const renderError = () => {
    if (error) {
      return (
        <div className="mb-4 p-4 text-sm text-red-800 bg-red-50 rounded-lg">
          {error}
        </div>
      )
    }
    return null
  }

  if (!testimonial) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold">Testimonial not found</h2>
          <p className="text-muted-foreground">The testimonial you are looking for does not exist.</p>
          <Button className="mt-4" onClick={() => router.push("/admin/testimonials")}>
            Back to Testimonials
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
            <Link href={`/admin/testimonials/${testimonialId}`}>
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Back</span>
            </Link>
          </Button>
          <div className="min-w-0 flex-1">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight truncate">Edit Testimonial</h1>
            <p className="text-sm sm:text-base text-muted-foreground truncate">Update testimonial from {testimonial.name}</p>
          </div>
        </div>
      </div>

      {renderError()}
      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Testimonial Information</CardTitle>
            <CardDescription>Update the testimonial details below</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Customer Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter customer name"
                required
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Select 
                  value={selectedCityId?.toString()} 
                  onValueChange={(value) => {
                    setSelectedCityId(parseInt(value));
                    setEvent(""); // Reset event when city changes
                  }} 
                  required
                >
                  <SelectTrigger id="city">
                    <SelectValue placeholder="Select city" />
                  </SelectTrigger>
                  <SelectContent>
                    {cities.map((c, index) => (
                      <SelectItem key={c.id ?? `city-${index}`} value={String(c.id ?? '')}>
                        {c.city_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="event">Event</Label>
                <Select 
                  value={event} 
                  onValueChange={setEvent} 
                  required
                  disabled={!selectedCityId || isLoadingEvents}
                >
                  <SelectTrigger id="event">
                    <SelectValue placeholder={
                      !selectedCityId 
                        ? "Select a city first" 
                        : isLoadingEvents 
                          ? "Loading events..." 
                          : "Select event"
                    } />
                  </SelectTrigger>
                  <SelectContent>
                    {events.map((e) => (
                      <SelectItem key={e.id} value={e.id.toString()}>
                        {e.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="rating">Rating</Label>
              <RadioGroup
                id="rating"
                value={rating}
                onValueChange={setRating}
                className="flex space-x-2"
              >
                {[1, 2, 3, 4, 5].map((value) => (
                  <div key={value} className="flex flex-col items-center space-y-1">
                    <RadioGroupItem
                      value={value.toString()}
                      id={`rating-${value}`}
                      className="sr-only"
                    />
                    <label
                      htmlFor={`rating-${value}`}
                      className={`flex h-10 w-10 cursor-pointer items-center justify-center rounded-full ${parseInt(rating) >= value
                        ? "bg-yellow-100 text-yellow-500 dark:bg-yellow-900/20"
                        : "bg-muted text-muted-foreground"
                        }`}
                    >
                      <Star className={`h-6 w-6 ${parseInt(rating) >= value ? "fill-yellow-500" : ""}`} />
                    </label>
                    <span className="text-xs">{value}</span>
                  </div>
                ))}
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label htmlFor="testimonialText">Testimonial</Label>
              <Textarea
                id="testimonialText"
                value={testimonialText}
                onChange={(e) => setTestimonialText(e.target.value)}
                placeholder="Enter testimonial text"
                rows={5}
                required
              />
            </div>

            <Separator className="my-4" />

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={status} onValueChange={setStatus} required>
                  <SelectTrigger id="status">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {statuses.map((s) => (
                      <SelectItem key={s.id} value={s.name}>
                        {s.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                />
              </div>
            </div>

            <Separator className="my-4" />

            {/* Image Upload Field */}
            <div className="space-y-2">
              <Label htmlFor="testimonial-image-edit">Testimonial Image</Label>
              <div className="space-y-4">
                <Input
                  id="testimonial-image-edit"
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                  onChange={handleImageUpload}
                  disabled={isUploadingImage}
                  className="cursor-pointer"
                />

                {/* Upload Progress */}
                {isUploadingImage && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Uploading...</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      ></div>
                    </div>
                  </div>
                )}

                {/* Image Preview */}
                {(imagePreview || existingImageUrl) && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">
                        {selectedImage ? 'New Image Preview:' : 'Current Image:'}
                      </span>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={removeImage}
                        className="text-red-600 hover:text-red-700"
                      >
                        Remove
                      </Button>
                    </div>
                    <div className="relative w-32 h-32 border rounded-lg overflow-hidden">
                      <img
                        src={
                          imagePreview || // New upload (data URL)
                          getImageUrl(existingImageUrl) || // Existing image (server path)
                          '/placeholder-user.jpg'
                        }
                        alt="Preview"
                        className="w-full h-full object-cover"
                        onLoad={() => {/* Image loaded successfully (debug log removed) */}}
                        onError={(e) => {
                          console.error('❌ Image failed to load');
                          e.currentTarget.src = '/placeholder-user.jpg';
                        }}
                      />
                    </div>
                    {/* Status info */}
                    <div className="text-xs text-gray-500">
                      {selectedImage ? 'New image selected' : existingImageUrl ? 'Existing image loaded' : 'No image'}
                    </div>
                    {uploadedImagePath && (
                      <p className="text-xs text-green-600">
                        ✓ Saved to: {uploadedImagePath}
                      </p>
                    )}
                  </div>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                Upload an image for this testimonial. Supported formats: JPEG, PNG, GIF, WebP. Max size: 5MB.
              </p>
            </div>

            <Separator className="my-4" />

            {/* Priority Field */}
            <div className="space-y-2">
              <Label htmlFor="priority-edit">Priority</Label>
              <Input
                id="priority-edit"
                type="number"
                min="1"
                max="100"
                value={priority}
                onChange={(e) => setPriority(parseInt(e.target.value) || 1)}
                required
              />
              <p className="text-sm text-muted-foreground">
                Set the display priority for this testimonial (1 = highest priority, 100 = lowest priority).
              </p>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" type="button" asChild>
              <Link href={`/admin/testimonials/${testimonialId}`}>
                Cancel
              </Link>
            </Button>
            <Button type="submit" disabled={isLoading || isSaved}>
              {isLoading ? (
                "Saving..."
              ) : isSaved ? (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Saved
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  )
}
