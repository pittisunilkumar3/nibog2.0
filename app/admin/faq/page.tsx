"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Eye, 
  EyeOff,
  ArrowUp,
  ArrowDown,
  HelpCircle
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { getAllFAQs, deleteFAQ, updateFAQ, type FAQ } from "@/services/faqService"

// Update interface to match API response
interface FAQItem {
  id: number
  question: string
  answer: string
  category: string
  display_priority: number
  status: string  // "Active" or "Inactive"
  created_at: string
  updated_at: string
}

export default function FAQListPage() {
  const { toast } = useToast()
  const [faqs, setFaqs] = useState<FAQItem[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState<'all' | 'Active' | 'Inactive'>('all')

  // Fetch FAQs from API
  useEffect(() => {
    const fetchFAQs = async () => {
      try {
        setLoading(true)
        console.log('🔄 Fetching FAQs from API...')
        
        const data = await getAllFAQs()
        console.log('✅ FAQs fetched:', data)
        
        // Transform FAQ to FAQItem format
        const transformedData: FAQItem[] = data.map(faq => ({
          id: faq.id || 0,
          question: faq.question,
          answer: faq.answer,
          category: faq.category,
          display_priority: faq.display_priority || faq.display_order || 0,
          status: faq.status || (faq.is_active !== false ? 'Active' : 'Inactive'),
          created_at: faq.created_at || new Date().toISOString(),
          updated_at: faq.updated_at || new Date().toISOString(),
        }))
        
        setFaqs(transformedData)
      } catch (error) {
        console.error('❌ Error fetching FAQs:', error)
        toast({
          title: "Error Loading FAQs",
          description: "Failed to fetch FAQs from the server. Please try again.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchFAQs()
  }, [])

  const filteredFaqs = faqs.filter(faq => {
    const matchesSearch = faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (faq.category && faq.category.toLowerCase().includes(searchTerm.toLowerCase()))
    
    const matchesStatus = filterStatus === 'all' || faq.status === filterStatus
    
    return matchesSearch && matchesStatus
  }).sort((a, b) => a.display_priority - b.display_priority)

  const handleToggleStatus = async (id: number) => {
    try {
      const faq = faqs.find(f => f.id === id)
      if (!faq) return

      const newStatus = faq.status === 'Active' ? 'Inactive' : 'Active'
      
      // Persist status update via API
      try {
        await updateFAQ({ id, status: newStatus } as any)
        setFaqs(prev => prev.map(f => 
          f.id === id ? { ...f, status: newStatus, updated_at: new Date().toISOString() } : f
        ))

        toast({
          title: "Status Updated",
          description: `FAQ ${newStatus === 'Active' ? 'activated' : 'deactivated'} successfully.`,
        })
      } catch (err) {
        console.error('Failed to update status:', err)
        toast({
          title: "Error",
          description: "Failed to update FAQ status.",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update FAQ status.",
        variant: "destructive",
      })
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this FAQ? This action cannot be undone.")) {
      return
    }

    try {
      console.log(`🗑️ Attempting to delete FAQ ID: ${id}`)
      
      // Call the actual API to delete FAQ
      const result = await deleteFAQ(id)
      
      if (result.success) {
        // Remove from local state after successful deletion
        setFaqs(prev => prev.filter(f => f.id !== id))

        toast({
          title: "FAQ Deleted Successfully! ✅",
          description: "The FAQ has been permanently deleted.",
        })
        
        console.log(`✅ FAQ ${id} deleted from UI`)
      }
    } catch (error) {
      console.error('❌ Error deleting FAQ:', error)
      toast({
        title: "Error Deleting FAQ",
        description: error instanceof Error ? error.message : "Failed to delete FAQ. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handlePriorityChange = async (id: number, direction: 'up' | 'down') => {
    try {
      const currentFaq = faqs.find(f => f.id === id)
      if (!currentFaq) return

      const sortedFaqs = [...faqs].sort((a, b) => a.display_priority - b.display_priority)
      const currentIndex = sortedFaqs.findIndex(f => f.id === id)
      
      if (direction === 'up' && currentIndex > 0) {
        const targetFaq = sortedFaqs[currentIndex - 1]
        const tempPriority = currentFaq.display_priority
        
        // Persist priority swap via API
        try {
          await updateFAQ({ id: currentFaq.id, display_priority: targetFaq.display_priority } as any)
          await updateFAQ({ id: targetFaq.id, display_priority: tempPriority } as any)

          setFaqs(prev => prev.map(f => {
            if (f.id === currentFaq.id) return { ...f, display_priority: targetFaq.display_priority }
            if (f.id === targetFaq.id) return { ...f, display_priority: tempPriority }
            return f
          }))
        } catch (err) {
          console.error('Failed to update priority:', err)
          toast({ title: "Error", description: "Failed to update FAQ priority.", variant: "destructive" })
        }
      } else if (direction === 'down' && currentIndex < sortedFaqs.length - 1) {
        const targetFaq = sortedFaqs[currentIndex + 1]
        const tempPriority = currentFaq.display_priority
        
        // Persist priority swap via API
        try {
          await updateFAQ({ id: currentFaq.id, display_priority: targetFaq.display_priority } as any)
          await updateFAQ({ id: targetFaq.id, display_priority: tempPriority } as any)

          setFaqs(prev => prev.map(f => {
            if (f.id === currentFaq.id) return { ...f, display_priority: targetFaq.display_priority }
            if (f.id === targetFaq.id) return { ...f, display_priority: tempPriority }
            return f
          }))
        } catch (err) {
          console.error('Failed to update priority:', err)
          toast({ title: "Error", description: "Failed to update FAQ priority.", variant: "destructive" })
        }
      }

      toast({
        title: "Priority Updated",
        description: "FAQ priority has been updated successfully.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update FAQ priority.",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading FAQs...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <HelpCircle className="h-8 w-8" />
              Frequently Asked Questions
            </h1>
            <p className="text-muted-foreground">
              Manage FAQ content for your website
            </p>
          </div>
          <Link href="/admin/faq/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add New FAQ
            </Button>
          </Link>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Search FAQs..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant={filterStatus === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterStatus('all')}
                >
                  All ({faqs.length})
                </Button>
                <Button
                  variant={filterStatus === 'Active' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterStatus('Active')}
                >
                  Active ({faqs.filter(f => f.status === 'Active').length})
                </Button>
                <Button
                  variant={filterStatus === 'Inactive' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterStatus('Inactive')}
                >
                  Inactive ({faqs.filter(f => f.status === 'Inactive').length})
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* FAQ List */}
        <div className="grid gap-4">
          {filteredFaqs.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <HelpCircle className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No FAQs Found</h3>
                <p className="text-muted-foreground mb-4">
                  {searchTerm || filterStatus !== 'all' 
                    ? "No FAQs match your current filters." 
                    : "Get started by creating your first FAQ."}
                </p>
                <Link href="/admin/faq/new">
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Add New FAQ
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            filteredFaqs.map((faq) => (
              <Card key={faq.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{faq.question}</CardTitle>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant={faq.status === 'Active' ? 'default' : 'secondary'}>
                          {faq.status}
                        </Badge>
                        {faq.category && (
                          <Badge variant="outline">{faq.category}</Badge>
                        )}
                        <span className="text-sm text-muted-foreground">
                          Priority: {faq.display_priority}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handlePriorityChange(faq.id, 'up')}
                        title="Move up"
                      >
                        <ArrowUp className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handlePriorityChange(faq.id, 'down')}
                        title="Move down"
                      >
                        <ArrowDown className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleToggleStatus(faq.id)}
                        title={faq.status === 'Active' ? 'Deactivate' : 'Activate'}
                      >
                        {faq.status === 'Active' ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                      <Link href={`/admin/faq/${faq.id}/edit`}>
                        <Button variant="ghost" size="sm" title="Edit">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(faq.id)}
                        title="Delete"
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-muted-foreground line-clamp-3">{faq.answer}</p>
                  <div className="flex justify-between items-center mt-3 text-sm text-muted-foreground">
                    <span>Created: {new Date(faq.created_at).toLocaleDateString()}</span>
                    <span>Updated: {new Date(faq.updated_at).toLocaleDateString()}</span>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
