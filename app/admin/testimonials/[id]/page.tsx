"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Edit, Trash, Star, AlertTriangle, Check, X } from "lucide-react"
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
import { Loader2 } from "lucide-react"

interface Testimonial {
  id: number;
  name: string;
  city: string;
  event_id: number;
  rating: number;
  testimonial: string;
  submitted_at: string;
  status: string;
}

const getStatusBadge = (status: string) => {
  switch (status) {
    case "published":
      return <Badge className="bg-green-500 hover:bg-green-600">Published</Badge>
    case "pending":
      return <Badge className="bg-yellow-500 hover:bg-yellow-600">Pending</Badge>
    case "rejected":
      return <Badge className="bg-red-500 hover:bg-red-600">Rejected</Badge>
    default:
      return <Badge variant="outline">{status}</Badge>
  }
}

const getRatingStars = (rating: number) => {
  return (
    <div className="flex items-center">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`h-5 w-5 ${i < rating ? "fill-yellow-500 text-yellow-500" : "text-gray-300"}`}
        />
      ))}
    </div>
  )
}

type Props = {
  params: { id: string }
}

export default function TestimonialDetailPage({ params }: Props) {
  const router = useRouter()
  const [testimonial, setTestimonial] = useState<Testimonial | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState<string | null>(null)

  useEffect(() => {
    const fetchTestimonial = async () => {
      try {
        setIsLoading(true)
        setError(null)

        const response = await fetch('/api/testimonials/get', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            id: parseInt(params.id)
          })
        })

        if (!response.ok) {
          throw new Error('Failed to fetch testimonial')
        }

        const data = await response.json()
        if (data && data.length > 0) {
          setTestimonial(data[0])
        } else {
          throw new Error('Testimonial not found')
        }
      } catch (error) {
        console.error('Error fetching testimonial:', error)
        setError(error instanceof Error ? error.message : 'An error occurred')
      } finally {
        setIsLoading(false)
      }
    }

    fetchTestimonial()
  }, [params.id])
  
  // Handle delete testimonial
  const handleDeleteTestimonial = async () => {
    try {
      setIsProcessing("delete")

      const token = typeof window !== 'undefined' ? (localStorage.getItem('adminToken') || sessionStorage.getItem('adminToken') || localStorage.getItem('token') || sessionStorage.getItem('token')) : null
      
      if (!token) {
        throw new Error('No authentication token found. Please log in again.')
      }

      // Use RESTful DELETE endpoint
      const response = await fetch(`/api/testimonials/${testimonial?.id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('Delete API error:', errorText)
        throw new Error('Failed to delete testimonial')
      }

      const data = await response.json()
      console.log('Delete response:', data)

      if (!data.success) {
        throw new Error(data.message || 'Delete operation failed')
      }

      router.push("/admin/testimonials")
    } catch (error) {
      console.error('Error deleting testimonial:', error)
      setError(error instanceof Error ? error.message : 'Failed to delete testimonial')
    } finally {
      setIsProcessing(null)
    }
  }
  
  // Handle approve testimonial
  const handleApproveTestimonial = async () => {
    try {
      if (!testimonial) return;
      
      setIsProcessing("approve")
      
      const token = typeof window !== 'undefined' ? (localStorage.getItem('adminToken') || sessionStorage.getItem('adminToken') || localStorage.getItem('token') || sessionStorage.getItem('token')) : null
      
      if (!token) {
        throw new Error('No authentication token found. Please log in again.')
      }

      const response = await fetch(`/api/testimonials/${testimonial.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: testimonial.name,
          event_id: testimonial.event_id,
          rating: testimonial.rating,
          testimonial: testimonial.testimonial,
          status: "Published"
        })
      })

      if (!response.ok) {
        throw new Error('Failed to approve testimonial')
      }

      router.refresh()
    } catch (error) {
      console.error('Error approving testimonial:', error)
      setError(error instanceof Error ? error.message : 'Failed to approve testimonial')
    } finally {
      setIsProcessing(null)
    }
  }
  
  // Handle reject testimonial
  const handleRejectTestimonial = async () => {
    try {
      if (!testimonial) return;
      
      setIsProcessing("reject")
      
      const token = typeof window !== 'undefined' ? (localStorage.getItem('adminToken') || sessionStorage.getItem('adminToken') || localStorage.getItem('token') || sessionStorage.getItem('token')) : null
      
      if (!token) {
        throw new Error('No authentication token found. Please log in again.')
      }

      const response = await fetch(`/api/testimonials/${testimonial.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: testimonial.name,
          event_id: testimonial.event_id,
          rating: testimonial.rating,
          testimonial: testimonial.testimonial,
          status: "Rejected"
        })
      })

      if (!response.ok) {
        throw new Error('Failed to reject testimonial')
      }

      router.refresh()
    } catch (error) {
      console.error('Error rejecting testimonial:', error)
      setError(error instanceof Error ? error.message : 'Failed to reject testimonial')
    } finally {
      setIsProcessing(null)
    }
  }
  
  // Loading state
  if (isLoading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <h2 className="text-xl font-semibold">Loading testimonial...</h2>
          <p className="text-muted-foreground">Please wait while we fetch the testimonial data.</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold">Error loading testimonial</h2>
          <p className="text-muted-foreground">{error}</p>
          <Button className="mt-4" onClick={() => router.push("/admin/testimonials")}>
            Back to Testimonials
          </Button>
        </div>
      </div>
    )
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
            <h1 className="text-3xl font-bold tracking-tight">Testimonial</h1>
            <p className="text-muted-foreground">From {testimonial.name}</p>
          </div>
        </div>
        <div className="flex gap-2">
          {testimonial.status === "pending" && (
            <>
              <Button 
                variant="default"
                onClick={handleApproveTestimonial}
                disabled={isProcessing !== null}
              >
                <Check className="mr-2 h-4 w-4" />
                {isProcessing === "approve" ? "Approving..." : "Approve"}
              </Button>
              <Button 
                variant="outline"
                className="text-red-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/20"
                onClick={handleRejectTestimonial}
                disabled={isProcessing !== null}
              >
                <X className="mr-2 h-4 w-4" />
                {isProcessing === "reject" ? "Rejecting..." : "Reject"}
              </Button>
            </>
          )}
          <Button variant="outline" asChild>
            <Link href={`/admin/testimonials/${testimonial.id}/edit`}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Link>
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" className="text-red-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/20">
                <Trash className="mr-2 h-4 w-4" />
                Delete
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Testimonial</AlertDialogTitle>
                <AlertDialogDescription>
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="mt-0.5 h-5 w-5 text-amber-500" />
                    <div className="space-y-2">
                      <div className="font-medium">This action cannot be undone.</div>
                      <div>
                        This will permanently delete the testimonial from {testimonial.name}.
                        Are you sure you want to continue?
                      </div>
                    </div>
                  </div>
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction 
                  className="bg-red-500 hover:bg-red-600"
                  onClick={handleDeleteTestimonial}
                  disabled={isProcessing === "delete"}
                >
                  {isProcessing === "delete" ? "Deleting..." : "Delete Testimonial"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Testimonial Content</CardTitle>
            <div className="mt-2 flex items-center gap-4">
              {getStatusBadge(testimonial.status)}
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Rating:</span>
                {getRatingStars(testimonial.rating)}
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg border p-4">
              <p className="italic text-muted-foreground">"{testimonial.testimonial}"</p>
            </div>
            
            <Separator />
            
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <h3 className="mb-2 font-medium">Customer Information</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Name</span>
                    <span className="font-medium">{testimonial.name}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">City</span>
                    <span>{testimonial.city}</span>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="mb-2 font-medium">Event Information</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Event</span>
                    <span>{testimonial.event_name ? testimonial.event_name : `Event ${testimonial.event_id}`}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Date</span>
                    <span>{new Date(testimonial.submitted_at).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button className="w-full justify-start" asChild>
              <Link href={`/admin/testimonials/${testimonial.id}/edit`}>
                <Edit className="mr-2 h-4 w-4" />
                Edit Testimonial
              </Link>
            </Button>
            
            {testimonial.status === "pending" && (
              <>
                <Button 
                  className="w-full justify-start" 
                  variant="outline"
                  onClick={handleApproveTestimonial}
                  disabled={isProcessing !== null}
                >
                  <Check className="mr-2 h-4 w-4 text-green-500" />
                  {isProcessing === "approve" ? "Approving..." : "Approve Testimonial"}
                </Button>
                <Button 
                  className="w-full justify-start text-red-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/20" 
                  variant="outline"
                  onClick={handleRejectTestimonial}
                  disabled={isProcessing !== null}
                >
                  <X className="mr-2 h-4 w-4" />
                  {isProcessing === "reject" ? "Rejecting..." : "Reject Testimonial"}
                </Button>
              </>
            )}
            
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button 
                  className="w-full justify-start text-red-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/20" 
                  variant="outline"
                >
                  <Trash className="mr-2 h-4 w-4" />
                  Delete Testimonial
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Testimonial</AlertDialogTitle>
                  <AlertDialogDescription>
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="mt-0.5 h-5 w-5 text-amber-500" />
                      <div className="space-y-2">
                        <div className="font-medium">This action cannot be undone.</div>
                        <div>
                          This will permanently delete the testimonial from {testimonial.name}.
                          Are you sure you want to continue?
                        </div>
                      </div>
                    </div>
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction 
                    className="bg-red-500 hover:bg-red-600"
                    onClick={handleDeleteTestimonial}
                    disabled={isProcessing === "delete"}
                  >
                    {isProcessing === "delete" ? "Deleting..." : "Delete Testimonial"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
