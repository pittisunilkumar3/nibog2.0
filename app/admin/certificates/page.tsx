"use client"

import { useState, useEffect } from "react"

import { Download, Mail, FileText, Loader2, Filter, Search, Eye, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import EnhancedDataTable, { Column, TableAction, BulkAction } from "@/components/admin/enhanced-data-table"
import { ExportColumn } from "@/lib/export-utils"

import { useToast } from "@/hooks/use-toast"
import { CertificateListItem } from "@/types/certificate"
import { getAllCertificates } from "@/services/certificateGenerationService"
import { generateCertificatePDFFrontend, generateBulkPDFsFrontend } from "@/services/certificatePdfService"
import { sendCertificateEmail } from "@/services/certificateEmailService"
import { EmailCertificateModal } from "@/components/email-certificate-modal"
import { CertificatePreviewModal } from "@/components/certificate-preview-modal"

export default function CertificatesPage() {

  const { toast } = useToast()

  // State
  const [certificates, setCertificates] = useState<CertificateListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [eventFilter, setEventFilter] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<string | null>(null)

  const [selectedCertificates, setSelectedCertificates] = useState<Set<number>>(new Set())
  const [downloadProgress, setDownloadProgress] = useState<{current: number, total: number} | null>(null)
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false)
  const [emailTarget, setEmailTarget] = useState<CertificateListItem[]>([])
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false)
  const [previewTarget, setPreviewTarget] = useState<CertificateListItem | null>(null)
  const [emailingCertificates, setEmailingCertificates] = useState<Set<number>>(new Set())
  const itemsPerPage = 10

  // Load certificates
  useEffect(() => {
    loadCertificates()
  }, [eventFilter, statusFilter])

  const loadCertificates = async () => {
    try {
      setLoading(true)
      
      const filters: Record<string, any> = {}
      
      if (eventFilter) {
        filters.eventId = parseInt(eventFilter)
      }
      
      if (statusFilter) {
        filters.status = statusFilter
      }
      

      const data = await getAllCertificates(filters)

      // Validate data
      if (!Array.isArray(data)) {
        throw new Error('Invalid response format from server');
      }

      setCertificates(data)
    } catch (error) {
      console.error('Error loading certificates:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';

      toast({
        title: "Error Loading Certificates",
        description: errorMessage.includes('Failed to fetch')
          ? "Network error. Please check your connection and try again."
          : errorMessage,
        variant: "destructive"
      })

      // Set empty state on error
      setCertificates([]);
    } finally {
      setLoading(false)
    }
  }



  // Filter certificates by search term
  const filteredCertificates = certificates.filter(cert => {
    const searchTermLower = searchTerm.toLowerCase()
    
    const userName = cert.user_name?.toLowerCase() || ''
    const userEmail = cert.user_email?.toLowerCase() || ''
    const eventTitle = cert.event_title?.toLowerCase() || ''
    const venueName = cert.venue_name?.toLowerCase() || ''
    
    return userName.includes(searchTermLower) || 
           userEmail.includes(searchTermLower) || 
           eventTitle.includes(searchTermLower) || 
           venueName.includes(searchTermLower)
  })

  // Download individual certificate (Frontend-only)
  const handleDownload = async (certificate: CertificateListItem) => {
    try {
      // Generate filename based on participant name and certificate ID
      const participantName = certificate.child_name || certificate.user_name || certificate.parent_name || 'Participant';
      const filename = `${participantName.replace(/[^a-zA-Z0-9]/g, '_')}_Certificate_${certificate.id}.pdf`;

      await generateCertificatePDFFrontend(certificate, filename)
      toast({
        title: "Success",
        description: "Certificate downloaded successfully",
      })
    } catch (error) {
      console.error('Error downloading certificate:', error)
      toast({
        title: "Error",
        description: "Failed to download certificate. Please try again.",
        variant: "destructive"
      })
    }
  }

  // Email individual certificate
  const handleEmailCertificate = async (certificate: CertificateListItem) => {
    const recipientEmail = certificate.parent_email || certificate.user_email
    if (!recipientEmail) {
      toast({
        title: "Error",
        description: "No email address found for this certificate",
        variant: "destructive"
      })
      return
    }

    setEmailingCertificates(prev => new Set(prev).add(certificate.id))

    try {
      const result = await sendCertificateEmail(certificate)

      if (result.success) {
        toast({
          title: "Success",
          description: `Certificate sent successfully to ${recipientEmail}`
        })
      } else {
        toast({
          title: "Error",
          description: `Failed to send certificate: ${result.message}`,
          variant: "destructive"
        })
      }
    } catch (error: any) {
      console.error("Error sending certificate email:", error)
      toast({
        title: "Error",
        description: `Failed to send certificate: ${error.message || 'Unknown error'}`,
        variant: "destructive"
      })
    } finally {
      setEmailingCertificates(prev => {
        const newSet = new Set(prev)
        newSet.delete(certificate.id)
        return newSet
      })
    }
  }

  // Download selected certificates as ZIP (Frontend-only)
  const handleBulkDownload = async () => {
    if (selectedCertificates.size === 0) {
      toast({
        title: "No certificates selected",
        description: "Please select at least one certificate to download",
        variant: "destructive"
      })
      return
    }

    try {
      setDownloadProgress({ current: 0, total: selectedCertificates.size })

      // Generate ZIP filename based on date
      const date = new Date().toISOString().split('T')[0]
      const zipFilename = `certificates_${date}.zip`

      // Get the selected certificate objects
      const selectedCerts = filteredCertificates.filter(cert =>
        selectedCertificates.has(cert.id)
      );

      await generateBulkPDFsFrontend(
        selectedCerts,
        zipFilename,
        (current, total) => setDownloadProgress({ current, total })
      )

      toast({
        title: "Success",
        description: `${selectedCerts.length} certificates downloaded as ZIP`,
      })
    } catch (error) {
      console.error('Error downloading certificates as ZIP:', error)
      toast({
        title: "Error",
        description: "Failed to download certificates as ZIP. Please try again.",
        variant: "destructive"
      })
    } finally {
      setDownloadProgress(null)
    }
  }



  // Get status badge color
  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'generated': return 'bg-blue-100 text-blue-800'
      case 'sent': return 'bg-green-100 text-green-800'
      case 'downloaded': return 'bg-purple-100 text-purple-800'
      case 'failed': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  // Define table columns for EnhancedDataTable
  const columns: Column<CertificateListItem>[] = [
    {
      key: 'event_title',
      label: 'Event',
      sortable: true,
      priority: 1, // Most important for mobile
      render: (value, row) => (
        <div>
          <div className="font-medium mobile-text-sm">{value || 'Event Name Not Available'}</div>
          <div className="text-xs text-muted-foreground">{row.event_date || ''}</div>
          <div className="text-xs text-muted-foreground">
            {row.venue_name || ''}
            {row.city_name && row.venue_name ? `, ${row.city_name}` : row.city_name || ''}
          </div>
          {row.certificate_number && (
            <div className="text-xs text-muted-foreground">{row.certificate_number}</div>
          )}
        </div>
      )
    },
    {
      key: 'child_name',
      label: 'Recipient',
      sortable: true,
      priority: 2, // Important for mobile
      render: (value, row) => (
        <div>
          <div className="font-medium mobile-text-sm">{value || 'Participant Name Not Available'}</div>
          {row.game_name && (
            <div className="text-xs text-muted-foreground">{row.game_name}</div>
          )}
          <div className="text-xs text-muted-foreground">{row.user_name || 'Parent Name Not Available'}</div>
          <div className="text-xs text-muted-foreground">{row.user_email || 'Email Not Available'}</div>
        </div>
      )
    },
    {
      key: 'generated_at',
      label: 'Generated Date',
      sortable: true,
      priority: 3, // Less important on mobile
      hideOnMobile: true,
      render: (value) => new Date(value).toLocaleDateString()
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      priority: 2, // Important for mobile
      render: (value) => (
        <Badge className={getStatusBadgeColor(value)}>
          {value.charAt(0).toUpperCase() + value.slice(1)}
        </Badge>
      )
    }
  ]

  // Define table actions
  const actions: TableAction<CertificateListItem>[] = [
    {
      label: "Download",
      icon: <Download className="h-4 w-4" />,
      onClick: handleDownload
    },
    {
      label: "Email",
      icon: <Mail className="h-4 w-4" />,
      onClick: handleEmailCertificate,
      disabled: (row) => emailingCertificates.has(row.id)
    },
    {
      label: "Preview",
      icon: <Eye className="h-4 w-4" />,
      onClick: (row) => {
        setPreviewTarget(row);
        setIsPreviewModalOpen(true);
      }
    },
    {
      label: "Details",
      icon: <FileText className="h-4 w-4" />,
      onClick: (row) => window.location.href = `/admin/certificates/${row.id}`
    }
  ]

  // Define bulk actions
  const bulkActions: BulkAction<CertificateListItem>[] = [
    {
      label: "Download as ZIP",
      icon: <Download className="h-4 w-4" />,
      onClick: (selectedRows) => {
        const selectedIds = new Set(selectedRows.map(row => row.id))
        setSelectedCertificates(selectedIds)
        handleBulkDownload()
      }
    },
    {
      label: "Email certificates",
      icon: <Mail className="h-4 w-4" />,
      onClick: (selectedRows) => {
        setEmailTarget(selectedRows);
        setIsEmailModalOpen(true);
      }
    }
  ]

  // Export columns
  const exportColumns: ExportColumn<CertificateListItem>[] = [
    { key: 'id', label: 'Certificate ID' },
    { key: 'event_title', label: 'Event' },
    { key: 'child_name', label: 'Child Name' },
    { key: 'user_name', label: 'Parent Name' },
    { key: 'user_email', label: 'Email' },
    { key: 'status', label: 'Status' },
    { key: 'generated_at', label: 'Generated Date' }
  ]

  return (
    <div className="mobile-space-y">
      <div className="flex flex-col gap-3 sm:gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="mobile-text-xl font-bold tracking-tight">Certificates</h1>
          <p className="text-muted-foreground mobile-text-sm">
            View and manage all generated certificates
          </p>
        </div>

        {/* Bulk Actions */}
        {selectedCertificates.size > 0 && (
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-2">
            <span className="text-sm text-muted-foreground">
              {selectedCertificates.size} selected
            </span>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="mobile-button w-full sm:w-auto">
                  <span>Bulk Actions</span>
                  <Plus className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={handleBulkDownload}>
                  <Download className="mr-2 h-4 w-4" />
                  <span>Download as ZIP</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    // Get the selected certificates
                    const selectedCerts = filteredCertificates.filter(cert =>
                      selectedCertificates.has(cert.id)
                    );
                    setEmailTarget(selectedCerts);
                    setIsEmailModalOpen(true);
                  }}
                >
                  <Mail className="mr-2 h-4 w-4" />
                  <span>Email certificates</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>

      {/* Filter and Search */}
      <Card className="mobile-card">
        <CardHeader className="mobile-card-header">
          <CardTitle className="mobile-text-lg">Filter Certificates</CardTitle>
        </CardHeader>
        <CardContent className="mobile-card-content">
          <div className="mobile-form-grid-3 lg:grid-cols-4">
            <div className="sm:col-span-2 lg:col-span-1">
              <div className="flex items-center gap-2">
                <Search className="h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, email, event..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="mobile-text-sm"
                />
              </div>
            </div>
            <div>
              <Select
                value={eventFilter || "all"}
                onValueChange={(value) => setEventFilter(value === "all" ? null : value)}
              >
                <SelectTrigger className="mobile-button">
                  <SelectValue placeholder="Filter by event" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Events</SelectItem>
                  {/* This would ideally be populated from an API call to get all events */}
                  <SelectItem value="1">Baby Crawling Championship</SelectItem>
                  <SelectItem value="2">Toddler Race</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Select
                value={statusFilter || "all"}
                onValueChange={(value) => setStatusFilter(value === "all" ? null : value)}
              >
                <SelectTrigger className="mobile-button">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="generated">Generated</SelectItem>
                  <SelectItem value="sent">Sent</SelectItem>
                  <SelectItem value="downloaded">Downloaded</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="sm:col-span-2 lg:col-span-1">
              <Button onClick={loadCertificates} className="mobile-button w-full">
                <Filter className="mr-2 h-4 w-4" />
                Apply Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Certificates Table */}
      <Card className="mobile-card">
        <CardHeader className="mobile-card-header">
          <CardTitle className="mobile-text-lg">Generated Certificates</CardTitle>
          <CardDescription className="mobile-text-sm">
            Total certificates: {filteredCertificates.length}
          </CardDescription>
        </CardHeader>
        <CardContent className="mobile-card-content">
          {/* Progress Overlay for Bulk Downloads */}
          {downloadProgress && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <Card className="w-[400px]">
                <CardHeader>
                  <CardTitle>Downloading Certificates</CardTitle>
                  <CardDescription>
                    Preparing {downloadProgress.total} certificates for download
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary transition-all duration-300" 
                        style={{ width: `${(downloadProgress.current / downloadProgress.total) * 100}%` }}
                      />
                    </div>
                    <div className="flex justify-between">
                      <span>{downloadProgress.current} of {downloadProgress.total}</span>
                      <span>{Math.round((downloadProgress.current / downloadProgress.total) * 100)}%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
          
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
              <span className="ml-2">Loading certificates...</span>
            </div>
          ) : filteredCertificates.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No certificates found</p>
            </div>
          ) : (
            <EnhancedDataTable
              data={filteredCertificates}
              columns={columns}
              actions={actions}
              bulkActions={bulkActions}
              loading={loading}
              searchable={false} // We have custom search above
              filterable={false} // We have custom filters above
              exportable={true}
              selectable={true}
              pagination={true}
              pageSize={itemsPerPage}
              exportColumns={exportColumns}
              exportTitle="NIBOG Certificates Report"
              exportFilename="nibog-certificates"
              emptyMessage="No certificates found"
              className="min-h-[400px]"
            />
          )}
        </CardContent>
      </Card>

      {/* Email Certificate Modal */}
      <EmailCertificateModal
        isOpen={isEmailModalOpen}
        onClose={() => setIsEmailModalOpen(false)}
        certificates={emailTarget}
        onSuccess={() => {
          // Refresh certificates list to update status
          loadCertificates();
        }}
      />

      {/* Certificate Preview Modal */}
      <CertificatePreviewModal
        isOpen={isPreviewModalOpen}
        onClose={() => setIsPreviewModalOpen(false)}
        certificate={previewTarget}
      />
    </div>
  )
}
