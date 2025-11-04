"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Plus, Search, Edit, Trash, Copy, FileText, Loader2, Eye, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
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
import { useToast } from "@/hooks/use-toast"
import { CertificateTemplate } from "@/types/certificate"
import EnhancedDataTable, { Column, TableAction, BulkAction } from "@/components/admin/enhanced-data-table"
import { ExportColumn } from "@/lib/export-utils"
import {
  getAllCertificateTemplates,
  deleteCertificateTemplate,
  duplicateCertificateTemplate
} from "@/services/certificateTemplateService"
import { generateCertificatePreview } from "@/services/certificatePdfService"

export default function CertificateTemplatesPage() {
  const [templates, setTemplates] = useState<CertificateTemplate[]>([])
  const [filteredTemplates, setFilteredTemplates] = useState<CertificateTemplate[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [typeFilter, setTypeFilter] = useState<string>("all")
  const [loading, setLoading] = useState(true)
  const [deleteLoading, setDeleteLoading] = useState<number | null>(null)
  const [previewLoading, setPreviewLoading] = useState<number | null>(null)
  const { toast } = useToast()

  // Load templates on component mount
  useEffect(() => {
    loadTemplates()
  }, [])

  // Filter templates when search term or type filter changes
  useEffect(() => {
    let filtered = templates.filter(template =>
      template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.description.toLowerCase().includes(searchTerm.toLowerCase())
    )

    if (typeFilter !== "all") {
      filtered = filtered.filter(template => template.type === typeFilter)
    }

    setFilteredTemplates(filtered)
  }, [templates, searchTerm, typeFilter])

  const loadTemplates = async () => {
    try {
      setLoading(true)
      const data = await getAllCertificateTemplates()
      setTemplates(data)
    } catch (error) {
      console.error('Error loading templates:', error)
      toast({
        title: "Error",
        description: "Failed to load certificate templates",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (templateId: number) => {
    try {
      setDeleteLoading(templateId)
      await deleteCertificateTemplate(templateId)

      // Remove from local state
      setTemplates(prev => prev.filter(t => t.id !== templateId))

      toast({
        title: "Success",
        description: "Certificate template deleted successfully"
      })
    } catch (error) {
      console.error('Error deleting template:', error)
      toast({
        title: "Error",
        description: "Failed to delete certificate template",
        variant: "destructive"
      })
    } finally {
      setDeleteLoading(null)
    }
  }

  const handleDuplicate = async (templateId: number) => {
    try {
      const template = templates.find(t => t.id === templateId)
      if (!template) return

      const newName = `${template.name} (Copy)`
      const duplicatedTemplate = await duplicateCertificateTemplate(template.id, newName)

      // Add to local state
      setTemplates(prev => [duplicatedTemplate, ...prev])

      toast({
        title: "Success",
        description: "Certificate template duplicated successfully"
      })
    } catch (error) {
      console.error('Error duplicating template:', error)
      toast({
        title: "Error",
        description: "Failed to duplicate certificate template",
        variant: "destructive"
      })
    }
  }

  const handleDownload = async (templateId: number) => {
    try {
      const template = templates.find(t => t.id === templateId)
      if (!template) return

      // Create a download link for the template
      const dataStr = JSON.stringify(template, null, 2)
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr)

      const exportFileDefaultName = `${template.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_template.json`

      const linkElement = document.createElement('a')
      linkElement.setAttribute('href', dataUri)
      linkElement.setAttribute('download', exportFileDefaultName)
      linkElement.click()

      toast({
        title: "Success",
        description: "Template downloaded successfully",
      })
    } catch (error) {
      console.error('Error downloading template:', error)
      toast({
        title: "Error",
        description: "Failed to download template",
        variant: "destructive",
      })
    }
  }

  const handlePreview = async (template: CertificateTemplate) => {
    try {
      setPreviewLoading(template.id)

      // Generate sample certificate data for preview
      const sampleData = {
        participant_name: "John Doe",
        event_name: "Baby Crawling Championship 2024",
        event_date: new Date().toLocaleDateString(),
        venue_name: "Community Center Hall",
        city_name: "Mumbai",
        certificate_number: "CERT-001",
        position: "1st Place",
        score: "95 points",
        achievement: "Outstanding Performance",
        instructor: "Ms. Sarah Johnson",
        organization: "Nibog Events"
      }

      await generateCertificatePreview(template, sampleData)

      toast({
        title: "Preview Generated",
        description: "Certificate preview opened in new window"
      })
    } catch (error) {
      console.error('Error generating preview:', error)
      toast({
        title: "Error",
        description: "Failed to generate certificate preview",
        variant: "destructive"
      })
    } finally {
      setPreviewLoading(null)
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'participation':
        return 'bg-blue-100 text-blue-800'
      case 'winner':
        return 'bg-yellow-100 text-yellow-800'
      case 'event_specific':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Certificate Templates</h1>
            <p className="text-muted-foreground">Manage certificate templates for NIBOG events</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link href="/admin/events">
                <Download className="mr-2 h-4 w-4" />
                Generate for Events
              </Link>
            </Button>
            <Button asChild>
              <Link href="/admin/certificate-templates/new">
                <Plus className="mr-2 h-4 w-4" />
                Create New Template
              </Link>
            </Button>
          </div>
        </div>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
              <span className="ml-2">Loading templates...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Define table columns for EnhancedDataTable
  const columns: Column<any>[] = [
    {
      key: 'name',
      label: 'Template Name',
      sortable: true,
      priority: 1, // Most important for mobile
    },
    {
      key: 'description',
      label: 'Description',
      sortable: true,
      priority: 3, // Less important on mobile
      hideOnMobile: true, // Hide on very small screens
      render: (value) => (
        <div className="max-w-xs truncate" title={value}>
          {value || 'No description'}
        </div>
      )
    },
    {
      key: 'category',
      label: 'Category',
      sortable: true,
      priority: 2, // Important for mobile
      render: (value) => (
        <Badge variant="outline">
          {value || 'General'}
        </Badge>
      )
    },
    {
      key: 'is_active',
      label: 'Status',
      sortable: true,
      priority: 2, // Important for mobile
      render: (value) => (
        <Badge variant={value ? "default" : "secondary"}>
          {value ? "Active" : "Inactive"}
        </Badge>
      )
    },
    {
      key: 'created_at',
      label: 'Created',
      sortable: true,
      priority: 4, // Hide on mobile
      hideOnMobile: true,
      render: (value) => formatDate(value)
    },
    {
      key: 'updated_at',
      label: 'Updated',
      sortable: true,
      priority: 5, // Hide on mobile
      hideOnMobile: true,
      render: (value) => formatDate(value)
    }
  ]

  // Define table actions
  const actions: TableAction<any>[] = [
    {
      label: "View",
      icon: <Eye className="h-4 w-4" />,
      onClick: (template) => {
        window.location.href = `/admin/certificate-templates/${template.id}`
      }
    },
    {
      label: "Edit",
      icon: <Edit className="h-4 w-4" />,
      onClick: (template) => {
        window.location.href = `/admin/certificate-templates/${template.id}/edit`
      }
    },
    {
      label: "Duplicate",
      icon: <Copy className="h-4 w-4" />,
      onClick: (template) => handleDuplicate(template.id)
    },
    {
      label: "Download",
      icon: <Download className="h-4 w-4" />,
      onClick: (template) => handleDownload(template.id)
    },
    {
      label: "Delete",
      icon: <Trash className="h-4 w-4" />,
      onClick: (template) => handleDelete(template.id),
      variant: 'destructive'
    }
  ]

  // Define bulk actions
  const bulkActions: BulkAction<any>[] = [
    {
      label: "Delete Selected",
      icon: <Trash className="h-4 w-4" />,
      onClick: (selectedTemplates) => {
        selectedTemplates.forEach(template => handleDelete(template.id))
      },
      variant: 'destructive'
    }
  ]

  // Define export columns
  const exportColumns: ExportColumn<any>[] = [
    { key: 'name', label: 'Template Name' },
    { key: 'description', label: 'Description' },
    { key: 'category', label: 'Category' },
    { key: 'is_active', label: 'Status', format: (value: any) => value ? 'Active' : 'Inactive' },
    { key: 'created_at', label: 'Created Date' },
    { key: 'updated_at', label: 'Updated Date' }
  ]

  return (
    <div className="mobile-space-y">
      <div className="flex flex-col gap-3 sm:gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="mobile-text-xl font-bold tracking-tight">Certificate Templates</h1>
          <p className="text-muted-foreground mobile-text-sm">Manage certificate templates for NIBOG events</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button variant="outline" asChild className="mobile-button">
            <Link href="/admin/events">
              <Download className="mr-2 h-4 w-4" />
              Generate for Events
            </Link>
          </Button>
          <Button asChild className="mobile-button">
            <Link href="/admin/certificate-templates/new">
              <Plus className="mr-2 h-4 w-4" />
              Create New Template
            </Link>
          </Button>
        </div>
      </div>

      <Card className="mobile-card">
        <CardContent className="mobile-card-content pt-6">
          <div className="flex flex-col gap-3 sm:gap-4 md:flex-row md:items-center">
            <div className="flex items-center gap-2 flex-1">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search templates..."
                className="mobile-button mobile-text-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="mobile-button w-full md:w-[200px]">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="participation">Participation</SelectItem>
                <SelectItem value="winner">Winner</SelectItem>
                <SelectItem value="event_specific">Event Specific</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card className="mobile-card">
        <CardHeader className="mobile-card-header">
          <CardTitle className="mobile-text-lg">Certificate Templates</CardTitle>
          <CardDescription className="mobile-text-sm">
            {filteredTemplates.length} template{filteredTemplates.length !== 1 ? 's' : ''} found
          </CardDescription>
        </CardHeader>
        <CardContent className="mobile-card-content">
          <EnhancedDataTable
            data={filteredTemplates}
            columns={columns}
            actions={actions}
            bulkActions={bulkActions}
            loading={loading}
            searchable={false} // We have custom search above
            filterable={false} // We have custom filters above
            exportable={true}
            selectable={true}
            pagination={true}
            pageSize={25}
            exportColumns={exportColumns}
            exportTitle="NIBOG Certificate Templates Report"
            exportFilename="nibog-certificate-templates"
            emptyMessage="No certificate templates found"
            className="min-h-[400px]"
          />
        </CardContent>
      </Card>
    </div>
  )
}
