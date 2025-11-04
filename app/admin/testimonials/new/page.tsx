"use client"

import { useState, useEffect } from "react"
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

// Define interfaces to match API response
interface Event {
  event_id: number;
  event_title: string;
  event_description: string;
  city_id: number;
  venue_id: number;
  event_date: string;
  status: string;
}

interface City {
  id: number;
  city_name: string;
  state: string;
  is_active: boolean;
}

export default function NewTestimonialPage() {
  const router = useRouter()
  const [name, setName] = useState("")
  const [selectedCityName, setSelectedCityName] = useState("")
  const [selectedCityId, setSelectedCityId] = useState<number | null>(null)
  const [selectedEventId, setSelectedEventId] = useState("")
  const [rating, setRating] = useState("5")
  const [testimonialText, setTestimonialText] = useState("")
  const [date, setDate] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isDataLoading, setIsDataLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [events, setEvents] = useState<Event[]>([])
  const [cities, setCities] = useState<City[]>([])

  // New fields for image upload and priority
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [isUploadingImage, setIsUploadingImage] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadedImagePath, setUploadedImagePath] = useState<string | null>(null)
  const [priority, setPriority] = useState<number>(1)

  // Fetch games and cities data
  useEffect(() => {
    const fetchData = async () => {
      setIsDataLoading(true)
      try {
        setError(null)
        console.log('Fetching data...')
        
        // Fetch events from API
        const eventsResponse = await fetch('/api/events/get-all')
        if (!eventsResponse.ok) {
          throw new Error('Failed to fetch events')
        }
        const eventsData = await eventsResponse.json()
        console.log('Events data:', eventsData)
        setEvents(eventsData)

        // Fetch cities from internal API route
        const citiesResponse = await fetch('/api/cities/get-all')
        if (!citiesResponse.ok) {
          throw new Error('Failed to fetch cities')
        }
        const citiesData = await citiesResponse.json()
        console.log('Cities data:', citiesData)

        // Clean up city names by trimming whitespace and ensure proper structure
        const cleanedCities = citiesData.map((city: any) => ({
          id: city.id,
          city_name: city.city_name ? city.city_name.trim() : '',
          state: city.state,
          is_active: city.is_active
        }))

        console.log('Cleaned cities data:', cleanedCities)
        setCities(cleanedCities)

      } catch (error) {
        console.error('Error fetching data:', error)
        const errorMessage = error instanceof Error ? error.message : 'Failed to load required data'
        console.error('Error details:', error)
        setError(errorMessage)
      } finally {
        setIsDataLoading(false)
      }
    }

    fetchData()
  }, [])

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

      const uploadData = await uploadResponse.json()
      setUploadedImagePath(uploadData.path)

      console.log(`Image uploaded successfully: ${uploadData.path}`)
      console.log(`Original file name: ${file.name}`)
      console.log(`File size: ${(file.size / 1024 / 1024).toFixed(2)} MB`)

      // Clear the progress after a short delay
      setTimeout(() => {
        setIsUploadingImage(false)
        setUploadProgress(0)
      }, 500)

    } catch (error) {
      console.error('Error uploading image:', error)
      setError(error instanceof Error ? error.message : 'Failed to upload image. Please try again.')
      setIsUploadingImage(false)
      setUploadProgress(0)
      setSelectedImage(null)
      setImagePreview(null)
      setUploadedImagePath(null)
    }
  }

  // Remove uploaded image
  const removeImage = () => {
    setSelectedImage(null)
    setImagePreview(null)
    setUploadedImagePath(null)
    setUploadProgress(0)
    setError(null)

    // Reset file input
    const fileInput = document.getElementById('testimonial-image') as HTMLInputElement
    if (fileInput) {
      fileInput.value = ''
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      setError(null)

      // Validate required fields
      if (!selectedEventId) {
        throw new Error('Please select an event')
      }
      if (!selectedCityName || selectedCityName.trim() === '') {
        console.error('City validation failed:', { selectedCityName, selectedCityId });
        throw new Error('Please select a city')  
      }

      // Format date to match API requirement (YYYY-MM-DD)
      const formattedDate = new Date(date).toISOString().split('T')[0];

      // Prepare payload for API
      // Send city name as city_id field value
      const payload = {
        name: name.trim(),
        city_id: selectedCityName.trim(), // Send city name as city_id value
        event_id: parseInt(selectedEventId),
        rating: parseInt(rating),
        testimonial: testimonialText.trim(),
        date: formattedDate,
        status: "Published"
      }

      // Extensive debug logging
      console.log('Form Data:', {
        name,
        selectedCityName,
        selectedCityId,
        selectedEventId,
        rating,
        testimonialText,
        date
      });

      console.log('Payload for API:', payload);

      // Additional validation logging
      console.log('City validation:', {
        selectedCityName: selectedCityName,
        selectedCityNameLength: selectedCityName?.length,
        selectedCityNameTrimmed: selectedCityName?.trim(),
        selectedCityId: selectedCityId,
        cityIdInPayload: payload.city_id
      });

      // Step 1: Create testimonial
      const response = await fetch('/api/testimonials/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        const errorData = await response.text();
        console.error('API error response:', errorData);
        throw new Error('Failed to create testimonial: ' + errorData);
      }

      const testimonialResponse = await response.json()
      console.log('✅ Step 1 Complete: Testimonial API response:', testimonialResponse)

      // Handle array response from testimonial API
      const testimonialData = Array.isArray(testimonialResponse) ? testimonialResponse[0] : testimonialResponse
      console.log('✅ Testimonial data extracted:', testimonialData)

      // Step 2: MANDATORY - Associate image with the testimonial
      // Both testimonial creation AND image association must succeed
      if (uploadedImagePath && testimonialData && testimonialData.id) {
        console.log('🔄 Step 2 Starting: Image association is REQUIRED for this testimonial');
        console.log('Associating image with testimonial ID:', testimonialData.id)

        const imagePayload = {
          testimonial_id: testimonialData.id,
          image_url: uploadedImagePath,
          priority: priority,
          is_active: true
        }

        console.log('Image payload:', imagePayload)

        const imageResponse = await fetch('/api/testimonials/images/update', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(imagePayload)
        })

        if (!imageResponse.ok) {
          const imageErrorData = await imageResponse.text();
          console.error('Image API error response:', imageErrorData);
          // FAIL the entire process if image association fails
          throw new Error('Failed to associate image with testimonial: ' + imageErrorData);
        }

        const imageResponse_data = await imageResponse.json()
        // Handle array response from testimonial images API
        const imageData = Array.isArray(imageResponse_data) ? imageResponse_data[0] : imageResponse_data
        console.log('✅ Step 2 Complete: Image associated successfully:', imageData)
        console.log('🎉 SUCCESS: Both testimonial and image created successfully!')
      } else if (uploadedImagePath && (!testimonialData || !testimonialData.id)) {
        // Image was uploaded but testimonial ID is missing
        console.error('❌ CRITICAL ERROR: Testimonial ID missing for image association');
        console.error('Testimonial response was:', testimonialResponse);
        throw new Error('Testimonial was created but ID is missing for image association');
      } else if (!uploadedImagePath) {
        // No image was uploaded, testimonial creation alone is sufficient
        console.log('✅ SUCCESS: Testimonial created successfully (no image to associate)')
      }

      setIsLoading(false)

      // Redirect to the testimonials list ONLY after both APIs succeed
      router.push("/admin/testimonials")

    } catch (error) {
      console.error('Error creating testimonial:', error)
      setIsLoading(false)
      setError(error instanceof Error ? error.message : 'An error occurred while creating the testimonial')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" asChild>
            <Link href="/admin/testimonials">
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Back</span>
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Add New Testimonial</h1>
            <p className="text-muted-foreground">Create a new customer testimonial</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Testimonial Information</CardTitle>
            <CardDescription>Enter the details for the new testimonial</CardDescription>
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
                  value={selectedCityName}
                  onValueChange={(cityName) => {
                    console.log('City selection changed:', {
                      cityName,
                      cityNameType: typeof cityName,
                      cityNameLength: cityName?.length,
                      availableCities: cities.map(c => c.city_name)
                    });

                    setSelectedCityName(cityName);

                    // Find the corresponding city ID for the selected city name
                    const selectedCity = cities.find(c => c.city_name === cityName);
                    if (selectedCity) {
                      console.log('Found matching city:', selectedCity);
                      setSelectedCityId(selectedCity.id);
                    } else {
                      console.log('No matching city found for:', cityName);
                      console.log('Available cities:', cities.map(c => ({ id: c.id, name: c.city_name })));
                      setSelectedCityId(null);
                    }

                    // Verify state after setting
                    setTimeout(() => {
                      console.log('State after city selection:', {
                        selectedCityName: cityName,
                        selectedCityId: selectedCity?.id || null
                      });
                    }, 100);
                  }}
                  required
                  disabled={isDataLoading}
                >
                  <SelectTrigger id="city">
                    <SelectValue placeholder={isDataLoading ? "Loading cities..." : "Select city"} />
                  </SelectTrigger>
                  <SelectContent>
                    {cities && cities.length > 0 ? (
                      cities.map((c) => (
                        <SelectItem
                          key={c.id}
                          value={c.city_name}
                        >
                          {c.city_name}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="_empty" disabled>
                        {isDataLoading ? "Loading..." : "No cities available"}
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
                {error && <p className="text-sm text-red-500">{error}</p>}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="event">Event</Label>
                <Select value={selectedEventId} onValueChange={setSelectedEventId} required disabled={isDataLoading}>
                  <SelectTrigger id="event">
                    <SelectValue placeholder={isDataLoading ? "Loading events..." : "Select event"} />
                  </SelectTrigger>
                  <SelectContent>
                    {events && events.length > 0 ? (
                      events.map((event) => (
                        <SelectItem key={event.event_id} value={event.event_id.toString()}>
                          {event.event_title}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="_empty" disabled>
                        {isDataLoading ? "Loading..." : "No events available"}
                      </SelectItem>
                    )}
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
                      className={`flex h-10 w-10 cursor-pointer items-center justify-center rounded-full ${
                        parseInt(rating) >= value 
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
              <p className="text-sm text-muted-foreground">
                Enter the customer's testimonial about their experience with NIBOG events.
              </p>
            </div>
            
            <Separator className="my-4" />
            
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
              <p className="text-sm text-muted-foreground">
                The date when this testimonial was received.
              </p>
            </div>

            <Separator className="my-4" />

            {/* Image Upload Field */}
            <div className="space-y-2">
              <Label htmlFor="testimonial-image">Testimonial Image</Label>
              <div className="space-y-4">
                <Input
                  id="testimonial-image"
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
                {imagePreview && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Preview:</span>
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
                        src={imagePreview}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
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
              <Label htmlFor="priority">Priority</Label>
              <Input
                id="priority"
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
              <Link href="/admin/testimonials">
                Cancel
              </Link>
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                "Creating..."
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Create Testimonial
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  )
}
