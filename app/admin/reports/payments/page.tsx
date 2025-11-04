"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  ArrowLeft,
  CreditCard, 
  TrendingUp, 
  TrendingDown,
  DollarSign,
  Users,
  Calendar,
  RefreshCw,
  Download,
  Filter,
  Search
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import EnhancedDataTable, { Column, TableAction } from "@/components/admin/enhanced-data-table"
import { PageTransition, FadeIn, Stagger, StaggerItem } from "@/components/ui/animated-components"
import { SkeletonKPI, SkeletonTable } from "@/components/ui/skeleton-loader"
import { 
  getAllPayments, 
  getPaymentAnalytics, 
  Payment, 
  PaymentAnalytics 
} from "@/services/paymentService"
import { createPaymentExportColumns } from "@/lib/export-utils"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"
import { format } from "date-fns"

export default function PaymentReportsPage() {
  const { toast } = useToast()
  const [payments, setPayments] = useState<Payment[]>([])
  const [analytics, setAnalytics] = useState<PaymentAnalytics | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Filters
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [methodFilter, setMethodFilter] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [dateRange, setDateRange] = useState<string>("all")

  // Fetch payment data
  const fetchPaymentData = async () => {
    try {
      setError(null)
      
      // Build filters
      const filters: any = {}
      if (statusFilter !== "all") filters.status = statusFilter
      if (dateRange !== "all") {
        const now = new Date()
        switch (dateRange) {
          case "today":
            filters.start_date = format(now, "yyyy-MM-dd")
            filters.end_date = format(now, "yyyy-MM-dd")
            break
          case "week":
            const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
            filters.start_date = format(weekAgo, "yyyy-MM-dd")
            filters.end_date = format(now, "yyyy-MM-dd")
            break
          case "month":
            const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
            filters.start_date = format(monthAgo, "yyyy-MM-dd")
            filters.end_date = format(now, "yyyy-MM-dd")
            break
        }
      }
      if (searchQuery) filters.search = searchQuery

      // Fetch data in parallel
      const [paymentsData, analyticsData] = await Promise.all([
        getAllPayments(filters),
        getPaymentAnalytics(filters).catch(() => null) // Don't fail if analytics fails
      ])

      setPayments(paymentsData)
      setAnalytics(analyticsData)
    } catch (error) {
      console.error("Error fetching payment data:", error)
      setError("Failed to load payment data. Please try again.")
      toast({
        title: "Error",
        description: "Failed to load payment data. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }

  useEffect(() => {
    fetchPaymentData()
  }, [statusFilter, methodFilter, dateRange, searchQuery])

  // Handle refresh
  const handleRefresh = async () => {
    setIsRefreshing(true)
    await fetchPaymentData()
    toast({
      title: "Success",
      description: "Payment data refreshed successfully.",
    })
  }

  // Filter payments by method (client-side filter)
  const filteredPayments = payments.filter(payment => {
    if (methodFilter !== "all" && payment.payment_method !== methodFilter) {
      return false
    }
    return true
  })

  // Calculate analytics from payments if API analytics not available
  const calculatedAnalytics = analytics || {
    summary: {
      total_revenue: filteredPayments.reduce((sum, p) => sum + parseFloat(p.amount.toString()), 0),
      total_payments: filteredPayments.length,
      successful_payments: filteredPayments.filter(p => p.payment_status === 'successful').length,
      pending_payments: filteredPayments.filter(p => p.payment_status === 'pending').length,
      failed_payments: filteredPayments.filter(p => p.payment_status === 'failed').length,
      refunded_payments: filteredPayments.filter(p => p.payment_status === 'refunded').length,
      refund_amount: filteredPayments
        .filter(p => p.payment_status === 'refunded')
        .reduce((sum, p) => sum + parseFloat(p.refund_amount?.toString() || '0'), 0),
      average_transaction: filteredPayments.length > 0 
        ? filteredPayments.reduce((sum, p) => sum + parseFloat(p.amount.toString()), 0) / filteredPayments.length 
        : 0,
    },
    monthly_data: [],
    payment_methods: [],
    city_wise: []
  }

  // Define table columns
  const columns: Column<Payment>[] = [
    {
      key: 'payment_id',
      label: 'Payment ID',
      sortable: true,
      width: '100px',
      priority: 4, // Hide on mobile
      hideOnMobile: true
    },
    {
      key: 'transaction_id',
      label: 'Transaction ID',
      sortable: true,
      priority: 5, // Hide on mobile
      hideOnMobile: true,
      render: (value) => (
        <code className="text-xs bg-muted px-2 py-1 rounded">
          {value}
        </code>
      )
    },
    {
      key: 'user_name',
      label: 'Customer',
      sortable: true,
      priority: 1, // Most important for mobile
      render: (value, row) => (
        <div>
          <div className="font-medium">{value}</div>
          <div className="text-xs text-muted-foreground">{row.user_email}</div>
        </div>
      )
    },
    {
      key: 'amount',
      label: 'Amount',
      sortable: true,
      align: 'right',
      priority: 2, // Important for mobile
      render: (value) => (
        <span className="font-mono">₹{parseFloat(value.toString()).toFixed(2)}</span>
      )
    },
    {
      key: 'payment_method',
      label: 'Method',
      sortable: true,
      priority: 3, // Less important on mobile
      hideOnMobile: true,
      render: (value) => (
        <Badge variant="outline">{value}</Badge>
      )
    },
    {
      key: 'payment_status',
      label: 'Status',
      sortable: true,
      priority: 2, // Important for mobile
      render: (value) => {
        const statusColors = {
          successful: 'bg-green-500 hover:bg-green-600',
          pending: 'bg-yellow-500 hover:bg-yellow-600',
          failed: 'bg-red-500 hover:bg-red-600',
          refunded: 'bg-blue-500 hover:bg-blue-600'
        }
        return (
          <Badge className={statusColors[value as keyof typeof statusColors] || 'bg-gray-500'}>
            {value}
          </Badge>
        )
      }
    },
    {
      key: 'event_title',
      label: 'Event',
      sortable: true,
      priority: 3, // Less important on mobile
      hideOnMobile: true,
      render: (value, row) => (
        <div>
          <div className="font-medium">{value}</div>
          <div className="text-xs text-muted-foreground">
            {row.city_name} • {format(new Date(row.event_date), "MMM d, yyyy")}
          </div>
        </div>
      )
    },
    {
      key: 'payment_date',
      label: 'Date',
      sortable: true,
      priority: 4, // Hide on mobile
      hideOnMobile: true,
      render: (value) => (
        <div className="text-sm">
          {format(new Date(value), "MMM d, yyyy")}
          <div className="text-xs text-muted-foreground">
            {format(new Date(value), "h:mm a")}
          </div>
        </div>
      )
    }
  ]

  // Define table actions
  const actions: TableAction<Payment>[] = [
    {
      label: "View Details",
      icon: <CreditCard className="h-4 w-4" />,
      onClick: (payment) => {
        // Navigate to payment details or open modal
        window.location.href = `/admin/payments/${payment.payment_id}`
      }
    }
  ]

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <div className="h-8 w-8 bg-muted animate-pulse rounded" />
          <div>
            <div className="h-8 w-48 bg-muted animate-pulse rounded" />
            <div className="h-4 w-64 bg-muted animate-pulse rounded mt-2" />
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonKPI key={i} />
          ))}
        </div>
        <SkeletonTable />
      </div>
    )
  }

  return (
    <PageTransition>
      <div className="mobile-space-y">
        <FadeIn>
          <div className="flex flex-col gap-3 sm:gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
              <Button variant="ghost" size="sm" asChild className="mobile-button-sm w-fit">
                <Link href="/admin/reports">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Reports
                </Link>
              </Button>
              <div>
                <h1 className="mobile-text-xl font-bold tracking-tight">Payment Reports</h1>
                <p className="text-muted-foreground mobile-text-sm">
                  Comprehensive payment analytics and transaction history
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="mobile-button"
              >
                <RefreshCw className={cn("mr-2 h-4 w-4", isRefreshing && "animate-spin")} />
                Refresh
              </Button>
            </div>
          </div>
        </FadeIn>

        {/* KPI Cards */}
        <Stagger>
          <div className="mobile-grid-1 lg:grid-cols-4 mobile-gap">
            <StaggerItem>
              <Card className="mobile-card">
                <CardHeader className="mobile-card-header flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="mobile-text-sm font-medium">Total Revenue</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent className="mobile-card-content">
                  <div className="mobile-text-lg font-bold">
                    ₹{calculatedAnalytics.summary.total_revenue.toFixed(2)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    From {calculatedAnalytics.summary.total_payments} transactions
                  </p>
                </CardContent>
              </Card>
            </StaggerItem>
            <StaggerItem>
              <Card className="mobile-card">
                <CardHeader className="mobile-card-header flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="mobile-text-sm font-medium">Successful Payments</CardTitle>
                  <TrendingUp className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent className="mobile-card-content">
                  <div className="mobile-text-lg font-bold text-green-600">
                    {calculatedAnalytics.summary.successful_payments}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {calculatedAnalytics.summary.total_payments > 0
                      ? ((calculatedAnalytics.summary.successful_payments / calculatedAnalytics.summary.total_payments) * 100).toFixed(1)
                      : 0}% success rate
                  </p>
                </CardContent>
              </Card>
            </StaggerItem>
            <StaggerItem>
              <Card className="mobile-card">
                <CardHeader className="mobile-card-header flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="mobile-text-sm font-medium">Failed Payments</CardTitle>
                  <TrendingDown className="h-4 w-4 text-red-600" />
                </CardHeader>
                <CardContent className="mobile-card-content">
                  <div className="mobile-text-lg font-bold text-red-600">
                    {calculatedAnalytics.summary.failed_payments}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {calculatedAnalytics.summary.pending_payments} pending
                  </p>
                </CardContent>
              </Card>
            </StaggerItem>
            <StaggerItem>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Avg Transaction</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    ₹{calculatedAnalytics.summary.average_transaction.toFixed(2)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    ₹{calculatedAnalytics.summary.refund_amount.toFixed(2)} refunded
                  </p>
                </CardContent>
              </Card>
            </StaggerItem>
          </div>
        </Stagger>

        {/* Filters */}
        <FadeIn delay={0.2}>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Filters</CardTitle>
              <CardDescription>Filter payment data by various criteria</CardDescription>
            </CardHeader>
            <CardContent className="mobile-card-content">
              <div className="flex flex-col gap-3 sm:gap-4 sm:flex-row sm:items-center">
                <div className="flex items-center gap-2 flex-1">
                  <Search className="h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search transactions..."
                    className="mobile-button mobile-text-sm w-full"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <Filter className="h-4 w-4 text-muted-foreground" />
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="mobile-button w-full sm:w-[150px]">
                        <SelectValue placeholder="All Statuses" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Statuses</SelectItem>
                        <SelectItem value="successful">Successful</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="failed">Failed</SelectItem>
                        <SelectItem value="refunded">Refunded</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <Select value={methodFilter} onValueChange={setMethodFilter}>
                      <SelectTrigger className="mobile-button w-full sm:w-[150px]">
                        <SelectValue placeholder="All Methods" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Methods</SelectItem>
                        <SelectItem value="PhonePe">PhonePe</SelectItem>
                        <SelectItem value="Cash">Cash</SelectItem>
                        <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                        <SelectItem value="Cheque">Cheque</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <Select value={dateRange} onValueChange={setDateRange}>
                    <SelectTrigger className="h-9 w-full md:w-[150px]">
                      <SelectValue placeholder="All Time" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Time</SelectItem>
                      <SelectItem value="today">Today</SelectItem>
                      <SelectItem value="week">Last 7 Days</SelectItem>
                      <SelectItem value="month">Last 30 Days</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </FadeIn>

        {/* Payment Data Table */}
        <FadeIn delay={0.3}>
          <EnhancedDataTable
            data={filteredPayments}
            columns={columns}
            actions={actions}
            loading={isLoading}
            searchable={false} // We have custom search
            filterable={false} // We have custom filters
            exportable={true}
            selectable={false}
            pagination={true}
            pageSize={25}
            exportColumns={createPaymentExportColumns()}
            exportTitle="NIBOG Payment Reports"
            exportFilename="nibog-payment-reports"
            emptyMessage="No payments found matching your criteria"
            onRefresh={handleRefresh}
            className="min-h-[400px]"
          />
        </FadeIn>

        {error && (
          <FadeIn>
            <Card className="border-destructive">
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 text-destructive">
                  <TrendingDown className="h-4 w-4" />
                  <span>{error}</span>
                </div>
              </CardContent>
            </Card>
          </FadeIn>
        )}
      </div>
    </PageTransition>
  )
}
