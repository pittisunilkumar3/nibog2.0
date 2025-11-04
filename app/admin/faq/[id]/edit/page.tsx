"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Save, HelpCircle, Loader2, AlertCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { getSingleFAQ, updateFAQ, FAQ } from "@/services/faqService"

interface FormData {
  question: string
  answer: string
  category: string
  display_priority: number
  status: string
}

interface FormErrors {
  question?: string
  answer?: string
  display_priority?: string
}

export default function EditFAQPage() {
  const router = useRouter()
  const params = useParams()
  const { toast } = useToast()
  const faqId = params.id as string
  
  const [faq, setFaq] = useState<FAQ | null>(null)
  const [loading, setLoading] = useState(true)
  const [formData, setFormData] = useState<FormData>({
    question: '',
    answer: '',
    category: '',
    display_priority: 1,
    status: 'Active'
  })
  
  const [errors, setErrors] = useState<FormErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const categories = [
    'General',
    'Registration',
    'Games',
    'Rewards',
    'Locations',
    'Pricing',
    'Events',
    'Support',
    'Rules'
  ]

  // Fetch FAQ from API
  useEffect(() => {
    const fetchFAQ = async () => {
      try {
        setLoading(true)
        const faqData = await getSingleFAQ(parseInt(faqId))
        
        setFaq(faqData)
        setFormData({
          question: faqData.question,
          answer: faqData.answer,
          category: faqData.category || '',
          display_priority: faqData.display_priority || 1,
          status: faqData.status || 'Active'
        })
      } catch (error) {
        console.error('Error fetching FAQ:', error)
        toast({
          title: "❌ Error Loading FAQ",
          description: "Failed to load FAQ details.",
          variant: "destructive",
        })
        router.push('/admin/faq')
      } finally {
        setLoading(false)
      }
    }

    if (faqId) {
      fetchFAQ()
    }
  }, [faqId, router, toast])

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    if (!formData.question.trim()) {
      newErrors.question = 'Question is required'
    } else if (formData.question.trim().length < 10) {
      newErrors.question = 'Question must be at least 10 characters long'
    }

    if (!formData.answer.trim()) {
      newErrors.answer = 'Answer is required'
    } else if (formData.answer.trim().length < 20) {
      newErrors.answer = 'Answer must be at least 20 characters long'
    }

    if (formData.display_priority < 1) {
      newErrors.display_priority = 'Priority must be at least 1'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (field: keyof FormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please fix the errors in the form before submitting.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      if (!faq?.id) {
        throw new Error('FAQ ID is missing')
      }

      // Prepare update payload with all required fields
      const updatePayload: FAQ = {
        id: faq.id,
        question: formData.question,
        answer: formData.answer,
        category: formData.category,
        display_priority: formData.display_priority,
        status: formData.status,
        created_at: faq.created_at,
        updated_at: faq.updated_at
      }

      const updatedFaq = await updateFAQ(updatePayload)
      
      toast({
        title: "✅ FAQ Updated Successfully!",
        description: "The FAQ has been updated on your website.",
      })
      
      router.push('/admin/faq')
    } catch (error) {
      console.error('FAQ update error:', error)
      toast({
        title: "❌ Error Updating FAQ",
        description: error instanceof Error ? error.message : "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading FAQ details...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!faq) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">FAQ Not Found</h1>
          <p className="text-muted-foreground mb-4">The requested FAQ could not be found.</p>
          <Link href="/admin/faq">
            <Button>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to FAQs
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Link href="/admin/faq">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to FAQs
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <HelpCircle className="h-8 w-8" />
              Edit FAQ
            </h1>
            <p className="text-muted-foreground">
              Update the frequently asked question details
            </p>
          </div>
        </div>

        {/* Form */}
        <Card>
          <CardHeader>
            <CardTitle>FAQ Details</CardTitle>
            <p className="text-sm text-muted-foreground">
              Created: {faq.created_at ? new Date(faq.created_at).toLocaleDateString() : 'N/A'} | 
              Last updated: {faq.updated_at ? new Date(faq.updated_at).toLocaleDateString() : 'N/A'}
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Question */}
              <div className="space-y-2">
                <Label htmlFor="question">Question *</Label>
                <Input
                  id="question"
                  value={formData.question}
                  onChange={(e) => handleInputChange('question', e.target.value)}
                  placeholder="Enter the frequently asked question"
                  className={errors.question ? 'border-red-500 focus:border-red-500' : ''}
                />
                {errors.question && (
                  <p className="text-red-500 text-sm flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.question}
                  </p>
                )}
              </div>

              {/* Answer */}
              <div className="space-y-2">
                <Label htmlFor="answer">Answer *</Label>
                <Textarea
                  id="answer"
                  value={formData.answer}
                  onChange={(e) => handleInputChange('answer', e.target.value)}
                  placeholder="Enter the detailed answer to the question"
                  rows={6}
                  className={`resize-none ${errors.answer ? 'border-red-500 focus:border-red-500' : ''}`}
                />
                {errors.answer && (
                  <p className="text-red-500 text-sm flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.answer}
                  </p>
                )}
              </div>

              {/* Category */}
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => handleInputChange('category', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Priority */}
              <div className="space-y-2">
                <Label htmlFor="display_priority">Display Priority *</Label>
                <Input
                  id="display_priority"
                  type="number"
                  min="1"
                  value={formData.display_priority}
                  onChange={(e) => handleInputChange('display_priority', parseInt(e.target.value) || 1)}
                  placeholder="Enter display priority (1 = highest)"
                  className={errors.display_priority ? 'border-red-500 focus:border-red-500' : ''}
                />
                {errors.display_priority && (
                  <p className="text-red-500 text-sm flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.display_priority}
                  </p>
                )}
                <p className="text-sm text-muted-foreground">
                  Lower numbers appear first. Use 1 for highest priority.
                </p>
              </div>

              {/* Status */}
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value: string) => handleInputChange('status', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground">
                  Only active FAQs will be displayed on your website.
                </p>
              </div>

              {/* Submit Button */}
              <div className="flex gap-4 pt-4">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Updating FAQ...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Update FAQ
                    </>
                  )}
                </Button>
                <Link href="/admin/faq">
                  <Button type="button" variant="outline">
                    Cancel
                  </Button>
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
