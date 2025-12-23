"use client"

import { useState, useEffect } from "react"
import { useToast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { Trash } from "lucide-react"
import { MobileTestHelper } from "@/components/admin/mobile-test-helper"

import { getAllHomepageSections, deleteHomepageSection, createHomepageSection, updateHomepageSection, HomepageSection } from "@/services/homepageSectionService"

export default function HomeSection() {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [imageUrls, setImageUrls] = useState<string[]>([])
  const [imageMeta, setImageMeta] = useState<HomepageSection[]>([])


  // Function to refresh image data from server
  const refreshImages = async () => {
    try {
      const data = await getAllHomepageSections()
      const safeData = Array.isArray(data) ? data.slice(0, 50) : []

      // Filter out items with invalid image_path and keep arrays synchronized
      const validItems = safeData.filter((img: any) => img?.image_path)

      setImageMeta(validItems)
      setImageUrls(
        validItems.map((img: any) => {
          // The new API should return correct paths, but we'll keep the sanitization just in case
          const rel = img.image_path.replace(/^public/, "")
          return rel.startsWith("/") ? rel : "/" + rel
        })
      )

      // Refreshed images (debug logs removed)
    } catch (error) {
      console.error("Failed to fetch images:", error)
      setImageMeta([])
      setImageUrls([])
      toast({
        title: "Error",
        description: "Failed to fetch images from the new API.",
        variant: "destructive",
      })
    }
  }

  // Comprehensive cache cleanup and frontend notification function
  const performCacheCleanupAndNotification = async () => {
    // Starting comprehensive cache cleanup (debug logs removed)

    // 1. Refresh data from server to ensure arrays stay synchronized
    await refreshImages()

    // 2. Clear any cached image data from localStorage
    try {
      const keysToRemove = []
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key && (key.includes('image') || key.includes('slider') || key.includes('cache'))) {
          keysToRemove.push(key)
        }
      }
      keysToRemove.forEach(key => {
        // Clearing localStorage key (debug logs removed)
        localStorage.removeItem(key)
      })
    } catch (error) {
      console.warn("Could not clear localStorage cache:", error)
    }

    // 3. Send multiple notification signals to frontend
    const timestamp = Date.now()
    localStorage.setItem('homeSliderUpdate', timestamp.toString())
    localStorage.setItem('homeSliderClearCache', timestamp.toString())

    // 4. Trigger browser cache invalidation by setting cache-busting flags
    localStorage.setItem('homeSlideCacheBust', timestamp.toString())

    // Cache cleanup complete (debug logs removed)
  }

  useEffect(() => {
    refreshImages()
  }, [])

  // Handle file input change
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return
    const fileArr = Array.from(files)
    setSelectedFiles((prev) => [...prev, ...fileArr])
  }

  // Remove image by index (removes from preview list and server)
  const handleDelete = async (idx: number) => {
    // Validate index bounds
    if (idx < 0 || idx >= imageMeta.length) {
      console.error("Invalid index:", idx, "Array length:", imageMeta.length)
      toast({
        title: "Error",
        description: "Invalid image index.",
        variant: "destructive",
      })
      return
    }

    const meta = imageMeta[idx]
    if (!meta?.id) {
      console.error("No image metadata or ID found for index:", idx, "Meta:", meta)
      toast({
        title: "Error",
        description: "Cannot delete image: missing ID.",
        variant: "destructive",
      })
      return
    }

    if (!window.confirm("Delete this image from the slider?")) return

    try {
      const success = await deleteHomepageSection(meta.id)

      if (success) {
        // Comprehensive cache cleanup and frontend notification
        await performCacheCleanupAndNotification()

        toast({
          title: "Deleted",
          description: "Image deleted successfully.",
        })
      } else {
        throw new Error("Delete failed - API returned unsuccessful status")
      }
    } catch (err) {
      console.error("Delete error:", err)
      toast({
        title: "Error",
        description: `Failed to delete image: ${err instanceof Error ? err.message : 'Unknown error'}`,
        variant: "destructive",
      })
    }
  }

  // Drag and drop reordering - keep both arrays synchronized
  const handleDragStart = (idx: number) => {
    setDraggingIdx(idx)
  }
  const handleDragOver = async (idx: number) => {
    if (draggingIdx === null || draggingIdx === idx) return

    // Update both arrays for immediate visual feedback
    const newUrls = [...imageUrls]
    const newMeta = [...imageMeta]

    const [draggedUrl] = newUrls.splice(draggingIdx, 1)
    const [draggedMeta] = newMeta.splice(draggingIdx, 1)

    newUrls.splice(idx, 0, draggedUrl)
    newMeta.splice(idx, 0, draggedMeta)

    setImageUrls(newUrls)
    setImageMeta(newMeta)
    setDraggingIdx(idx)
  }
  const [draggingIdx, setDraggingIdx] = useState<number | null>(null)
  const handleDragEnd = async () => {
    setDraggingIdx(null)
    // Here we could persist the new order to the backend using the priority field for each item
    // For now, we'll just keep it in memory as the original code did
  }

  // Upload images to server and update preview list
  const handleSave = async () => {
    if (selectedFiles.length === 0) return
    setIsLoading(true)
    try {
      const formData = new FormData()
      selectedFiles.forEach((file) => formData.append("files", file))

      // Still using existing local upload route to save files to public/images/blog/home
      const res = await fetch("/api/home-hero/upload-images", {
        method: "POST",
        body: formData,
      })
      const data = await res.json()

      if (data.success && data.files) {
        setSelectedFiles([])

        // Register each uploaded image with the NEW homepage section API
        await Promise.all(
          data.files.map(async (f: any) => {
            // f.url is like "/images/blog/home/filename"
            try {
              await createHomepageSection({
                image_path: f.url,
                status: "active",
                priority: imageMeta.length + 1
              });
            } catch (err) {
              console.error(`Failed to register image with backend: ${f.url}`, err);
              toast({
                title: "Warning",
                description: `Failed to register image with backend API for ${f.filename}`,
                variant: "destructive",
              });
            }
          })
        );

        // Refresh data from server to ensure arrays stay synchronized
        await refreshImages()

        // Notify frontend about the update
        localStorage.setItem('homeSliderUpdate', Date.now().toString())

        toast({
          title: "Success!",
          description: "Images uploaded and synced with the new API successfully.",
        })
      } else {
        throw new Error(data.error || "Upload failed")
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to upload images.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-4 sm:py-8 px-3 sm:px-0">
      <div className="w-full max-w-full">
        <div className="mb-6 sm:mb-8 flex flex-col items-center">
          <h1 className="text-2xl sm:text-3xl font-bold text-blue-900 mb-2 w-full text-center px-4">Home Hero Image Slider Manager</h1>
          <p className="text-sm sm:text-base text-gray-600 w-full text-center px-4">Upload, preview, reorder, and manage your homepage hero images.</p>
        </div>
        <Card className="shadow border-blue-100 w-full">
          <CardHeader className="mobile-card-header bg-blue-50 rounded-t-lg border-b border-blue-100 w-full">
            <CardTitle className="mobile-text-lg font-semibold text-blue-800">Image Management</CardTitle>
          </CardHeader>
          <CardContent className="mobile-card-content">
            <div className="flex flex-col mobile-gap mb-4 sm:mb-6 w-full">
              <Input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                className="w-full mobile-input"
              />
              <div className="mobile-form-grid-3">
                <Button
                  onClick={handleSave}
                  disabled={isLoading || selectedFiles.length === 0}
                  className="mobile-button w-full"
                >
                  {isLoading ? "Uploading..." : "Upload"}
                </Button>
                <Button
                  onClick={refreshImages}
                  variant="outline"
                  className="mobile-button w-full"
                >
                  Refresh
                </Button>
                <Button
                  onClick={() => {
                    localStorage.setItem('homeSliderUpdate', Date.now().toString())
                    toast({
                      title: "Notification Sent",
                      description: "Frontend will refresh slider images.",
                    })
                  }}
                  variant="secondary"
                  className="mobile-button w-full"
                >
                  Notify Frontend
                </Button>
              </div>
            </div>
            {/* Debug info */}
            <div className="mb-4 p-3 bg-gray-100 rounded text-xs sm:text-sm">
              <strong>Debug:</strong> ImageUrls: {imageUrls.length}, ImageMeta: {imageMeta.length}
              {imageUrls.length !== imageMeta.length && (
                <span className="text-red-600 font-bold"> ⚠️ ARRAYS OUT OF SYNC!</span>
              )}
            </div>

            <div className="overflow-x-auto mobile-scroll rounded-lg border border-gray-200 bg-white w-full">
              <table className="min-w-full w-full divide-y divide-gray-200 text-xs sm:text-sm">
                <thead className="bg-blue-50">
                  <tr>
                    <th className="px-2 sm:px-4 py-3 font-semibold text-left text-blue-900 min-w-[80px]">Preview</th>
                    <th className="px-2 sm:px-4 py-3 font-semibold text-left text-blue-900 min-w-[120px]">Filename</th>
                    <th className="px-2 sm:px-4 py-3 font-semibold text-left text-blue-900 min-w-[80px] hidden sm:table-cell">Size</th>
                    <th className="px-2 sm:px-4 py-3 font-semibold text-center text-blue-900 min-w-[80px]">Order</th>
                    <th className="px-2 sm:px-4 py-3 font-semibold text-center text-blue-900 min-w-[100px]">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {imageUrls.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-8 text-gray-400">
                        No images uploaded yet.
                      </td>
                    </tr>
                  ) : (
                    imageUrls.map((src, idx) => {
                      // Extract filename and fake size (since we don't store it, show N/A)
                      const filename = src.split("/").pop() || "N/A"
                      return (
                        <tr
                          key={idx}
                          className={`transition ${draggingIdx === idx ? "bg-blue-50" : ""}`}
                          draggable
                          onDragStart={() => handleDragStart(idx)}
                          onDragOver={(e) => {
                            e.preventDefault()
                            handleDragOver(idx)
                          }}
                          onDragEnd={handleDragEnd}
                        >
                          <td className="px-2 sm:px-4 py-2">
                            <img
                              src={src}
                              alt={`Hero ${idx + 1}`}
                              className="w-16 h-12 sm:w-28 sm:h-16 object-cover rounded border"
                            />
                          </td>
                          <td className="px-2 sm:px-4 py-2 max-w-[100px] sm:max-w-none truncate" title={filename}>{filename}</td>
                          <td className="px-2 sm:px-4 py-2 hidden sm:table-cell">N/A</td>
                          <td className="px-2 sm:px-4 py-2 text-center">
                            <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2">
                              <Button
                                size="icon"
                                variant="ghost"
                                className="p-1 touch-manipulation h-8 w-8 sm:h-9 sm:w-9"
                                disabled={idx === 0}
                                onClick={() => {
                                  if (idx > 0) {
                                    const newUrls = [...imageUrls]
                                    const temp = newUrls[idx - 1]
                                    newUrls[idx - 1] = newUrls[idx]
                                    newUrls[idx] = temp
                                    setImageUrls(newUrls)
                                  }
                                }}
                                title="Move Up"
                              >
                                <span className="text-blue-600 font-bold text-sm">↑</span>
                              </Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="p-1 touch-manipulation h-8 w-8 sm:h-9 sm:w-9"
                                disabled={idx === imageUrls.length - 1}
                                onClick={() => {
                                  if (idx < imageUrls.length - 1) {
                                    const newUrls = [...imageUrls]
                                    const temp = newUrls[idx + 1]
                                    newUrls[idx + 1] = newUrls[idx]
                                    newUrls[idx] = temp
                                    setImageUrls(newUrls)
                                  }
                                }}
                                title="Move Down"
                              >
                                <span className="text-blue-600 font-bold text-sm">↓</span>
                              </Button>
                            </div>
                          </td>
                          <td className="px-2 sm:px-4 py-2 text-center">
                            <Button
                              size="icon"
                              variant="destructive"
                              className="p-1 touch-manipulation h-8 w-8 sm:h-9 sm:w-9"
                              onClick={() => handleDelete(idx)}
                              title="Delete"
                            >
                              <Trash className="h-4 w-4 sm:h-5 sm:w-5" />
                            </Button>
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
      <MobileTestHelper />
    </div>
  )
}





