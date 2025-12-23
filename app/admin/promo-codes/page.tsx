"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Plus, Search, Filter, Eye, Edit, Trash, Copy, AlertTriangle, BarChart, Loader2, RefreshCw } from "lucide-react"
import EnhancedDataTable, { Column, TableAction, BulkAction } from "@/components/admin/enhanced-data-table"
import { ExportColumn } from "@/lib/export-utils"
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
import { deletePromoCode } from "@/services/promoCodeService"

// Types for API response
interface PromoCodeAPI {
  id: number
  promo_code: string
  type: "percentage" | "fixed"
  value: string
  valid_from: string
  valid_to: string
  usage_limit: number
  usage_count: number
  minimum_purchase_amount: string
  maximum_discount_amount: string
  description: string
  is_active: boolean
  created_at: string
  updated_at: string
}

// Internal type for component
interface PromoCode {
  id: string
  code: string
  discount: number
  discountType: "percentage" | "fixed"
  maxDiscount: number | null
  minPurchase: number
  validFrom: string
  validTo: string
  usageLimit: number
  usageCount: number
  status: "active" | "inactive" | "expired"
  description: string
}

// API function to fetch promo codes
const fetchPromoCodes = async (): Promise<PromoCode[]> => {
  try {
    const timestamp = new Date().getTime()
    const response = await fetch(`/api/promo-codes/get-all?t=${timestamp}`, {
      cache: 'no-store',
      headers: {
        'Cache-Control': 'no-cache',
      }
    })
    if (!response.ok) {
      throw new Error('Failed to fetch promo codes')
    }
    const data: PromoCodeAPI[] = await response.json()

    // Transform API data to component format
    return data.map((item) => {
      const validFrom = new Date(item.valid_from).toISOString().split('T')[0]
      const validTo = new Date(item.valid_to).toISOString().split('T')[0]
      const currentDate = new Date()
      const validToDate = new Date(item.valid_to)

      // Determine status
      let status: "active" | "inactive" | "expired" = "inactive"
      if (item.is_active) {
        status = validToDate < currentDate ? "expired" : "active"
      }

      return {
        id: item.id.toString(),
        code: item.promo_code,
        discount: parseFloat(item.value),
        discountType: item.type,
        maxDiscount: item.maximum_discount_amount ? parseFloat(item.maximum_discount_amount) : null,
        minPurchase: parseFloat(item.minimum_purchase_amount),
        validFrom,
        validTo,
        usageLimit: item.usage_limit,
        usageCount: item.usage_count,
        status,
        description: item.description
      }
    })
  } catch (error) {
    console.error('Error fetching promo codes:', error)
    throw error
  }
}

// Discount types
const discountTypes = [
  { id: "1", name: "percentage" },
  { id: "2", name: "fixed" },
]

// Promo code statuses
const statuses = [
  { id: "1", name: "active" },
  { id: "2", name: "inactive" },
  { id: "3", name: "expired" },
]

const getStatusBadge = (status: string) => {
  switch (status) {
    case "active":
      return <Badge className="bg-green-500 hover:bg-green-600">Active</Badge>
    case "inactive":
      return <Badge variant="outline">Inactive</Badge>
    case "expired":
      return <Badge className="bg-red-500 hover:bg-red-600">Expired</Badge>
    default:
      return <Badge variant="outline">{status}</Badge>
  }
}

export default function PromoCodesPage() {
  const { toast } = useToast()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [selectedType, setSelectedType] = useState("all")
  const [promoCodesList, setPromoCodesList] = useState<PromoCode[]>([])
  const [isProcessing, setIsProcessing] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Fetch promo codes from API
  const loadPromoCodes = async () => {
    try {
      setError(null)
      const codes = await fetchPromoCodes()
      setPromoCodesList(codes)
    } catch (err) {
      setError('Failed to load promo codes. Please try again.')
      console.error('Error loading promo codes:', err)
      toast({
        title: "Error",
        description: "Failed to load promo codes. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }

  // Fetch promo codes on component mount
  useEffect(() => {
    setIsLoading(true)
    loadPromoCodes()
  }, [])

  // Handle refresh
  const handleRefresh = async () => {
    setIsRefreshing(true)
    await loadPromoCodes()
    toast({
      title: "Success",
      description: "Promo codes data refreshed successfully.",
    })
  }

  // Handle copy promo code
  const handleCopyPromoCode = (code: string) => {
    navigator.clipboard.writeText(code)
      .then(() => {
        alert(`Promo code ${code} copied to clipboard!`)
      })
      .catch(err => {
        console.error('Failed to copy: ', err)
      })
  }

  // Handle delete promo code
  const handleDeletePromoCode = async (id: string) => {
    setIsProcessing(id)

    try {

      // Call the delete API
      const response = await deletePromoCode(parseInt(id))

      if (response.success) {
        // Remove the deleted promo code from the list
        setPromoCodesList(promoCodesList.filter((code: PromoCode) => code.id !== id))

        toast({
          title: "Success",
          description: "Promo code deleted successfully!",
        })
      } else {
        throw new Error(response.error || "Failed to delete promo code")
      }
    } catch (error: any) {
      console.error("Error deleting promo code:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to delete promo code. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(null)
    }
  }

  // Filter promo codes based on search and filters
  const filteredPromoCodes = promoCodesList.filter((promoCode: PromoCode) => {
    // Search query filter
    if (
      searchQuery &&
      !promoCode.code.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false
    }

    // Status filter
    if (selectedStatus !== "all" && promoCode.status !== selectedStatus) {
      return false
    }

    // Discount type filter
    if (selectedType !== "all" && promoCode.discountType !== selectedType) {
      return false
    }

    return true
  })

  // Define table columns for EnhancedDataTable
  const columns: Column<any>[] = [
    {
      key: 'code',
      label: 'Code',
      sortable: true,
      priority: 1, // Highest priority for mobile
      render: (value, row) => (
        <div>
          <div className="font-medium">{value}</div>
          <div className="text-xs text-muted-foreground truncate">{row.description}</div>
        </div>
      )
    },
    {
      key: 'discount',
      label: 'Value',
      sortable: true,
      priority: 2, // Second priority for mobile
      render: (value, row) =>
        row.discountType === 'percentage' ? `${value}%` : `₹${value}`
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      priority: 3, // Third priority for mobile
      render: (value) => {
        const statusColors = {
          active: 'bg-green-500 hover:bg-green-600',
          expired: 'bg-red-500 hover:bg-red-600',
          inactive: 'bg-gray-500 hover:bg-gray-600'
        }
        return (
          <Badge className={statusColors[value as keyof typeof statusColors] || 'bg-gray-500'}>
            {value}
          </Badge>
        )
      }
    },
    {
      key: 'discountType',
      label: 'Type',
      sortable: true,
      hideOnMobile: true, // Hide on mobile to save space
      render: (value) => (
        <Badge variant="outline">
          {value === 'percentage' ? 'Percentage' : 'Fixed Amount'}
        </Badge>
      )
    },
    {
      key: 'usageCount',
      label: 'Used',
      sortable: true,
      hideOnMobile: true, // Hide on mobile to save space
      render: (value, row) => `${value}/${row.usageLimit || '∞'}`
    },
    {
      key: 'validTo',
      label: 'Expires',
      sortable: true,
      hideOnMobile: true, // Hide on mobile to save space
      render: (value) => new Date(value).toLocaleDateString()
    }
  ]

  // Define table actions
  const actions: TableAction<any>[] = [
    {
      label: "View",
      icon: <Eye className="h-4 w-4" />,
      onClick: (promoCode) => {
        window.location.href = `/admin/promo-codes/${promoCode.id}`
      }
    },
    {
      label: "Edit",
      icon: <Edit className="h-4 w-4" />,
      onClick: (promoCode) => {
        window.location.href = `/admin/promo-codes/${promoCode.id}/edit`
      }
    },
    {
      label: "Copy Code",
      icon: <Copy className="h-4 w-4" />,
      onClick: (promoCode) => {
        navigator.clipboard.writeText(promoCode.code)
      }
    },
    {
      label: "Delete",
      icon: <Trash className="h-4 w-4" />,
      onClick: (promoCode) => handleDeletePromoCode(promoCode.id),
      variant: 'destructive'
    }
  ]

  // Define bulk actions
  const bulkActions: BulkAction<any>[] = [
    {
      label: "Delete Selected",
      icon: <Trash className="h-4 w-4" />,
      onClick: (selectedPromoCodes) => {
        // TODO: Implement bulk delete handler
      },
      variant: 'destructive'
    }
  ]

  // Define export columns
  const exportColumns: ExportColumn<PromoCode>[] = [
    { key: 'code', label: 'Code' },
    { key: 'description', label: 'Description' },
    { key: 'discountType', label: 'Type' },
    { key: 'discount', label: 'Value' },
    { key: 'usageCount', label: 'Usage Count' },
    { key: 'usageLimit', label: 'Usage Limit' },
    { key: 'validFrom', label: 'Valid From' },
    { key: 'validTo', label: 'Valid To' },
    { key: 'status', label: 'Status' }
  ]

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Promo Codes</h1>
          <p className="text-sm sm:text-base text-muted-foreground">Manage discount codes for NIBOG events</p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="touch-manipulation"
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="outline" asChild className="touch-manipulation">
            <Link href="/admin/promo-codes/analytics">
              <BarChart className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Analytics</span>
              <span className="sm:hidden">Stats</span>
            </Link>
          </Button>
          <Button asChild className="touch-manipulation">
            <Link href="/admin/promo-codes/new">
              <Plus className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Add New Promo Code</span>
              <span className="sm:hidden">New Code</span>
            </Link>
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
              <Input
                placeholder="Search promo codes..."
                className="pl-9 h-10 touch-manipulation"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Filter className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <Select value={selectedStatus} onValueChange={setSelectedStatus} disabled={isLoading}>
                  <SelectTrigger className="h-10 w-full sm:w-[150px] touch-manipulation">
                    <SelectValue placeholder="All Statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all" className="touch-manipulation">All Statuses</SelectItem>
                    {statuses.map((status) => (
                      <SelectItem key={status.id} value={status.name} className="touch-manipulation">
                        {status.name.charAt(0).toUpperCase() + status.name.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Select value={selectedType} onValueChange={setSelectedType} disabled={isLoading}>
                <SelectTrigger className="h-10 w-full sm:w-[180px] touch-manipulation">
                  <SelectValue placeholder="All Discount Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all" className="touch-manipulation">All Discount Types</SelectItem>
                  {discountTypes.map((type) => (
                    <SelectItem key={type.id} value={type.name} className="touch-manipulation">
                      {type.name === "percentage" ? "Percentage" : "Fixed Amount"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <EnhancedDataTable
        data={filteredPromoCodes}
        columns={columns}
        actions={actions}
        bulkActions={bulkActions}
        loading={isLoading}
        searchable={false} // We have custom search above
        filterable={false} // We have custom filters above
        exportable={true}
        selectable={true}
        pagination={true}
        pageSize={25}
        exportColumns={exportColumns}
        exportTitle="NIBOG Promo Codes Report"
        exportFilename="nibog-promo-codes"
        emptyMessage="No promo codes found"
        onRefresh={handleRefresh}
        className="min-h-[400px]"
      />
    </div>
  )
}
