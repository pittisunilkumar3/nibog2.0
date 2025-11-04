"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Activity, Calendar, DollarSign, Users, Package, Tag, TrendingUp, MapPin, Star, Award, RefreshCw } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import AdminOverviewChart from "@/components/admin/admin-overview-chart"
import AdminRecentBookings from "@/components/admin/admin-recent-bookings"
import AdminUpcomingEvents from "@/components/admin/admin-upcoming-events"
import AdminAddonAnalytics from "@/components/admin/admin-addon-analytics"
import AdminPromoAnalytics from "@/components/admin/admin-promo-analytics"
import EnhancedKPICard, { KPIData } from "@/components/admin/enhanced-kpi-card"
import QuickActions from "@/components/admin/quick-actions"
import { PageTransition, Stagger, StaggerItem, FadeIn } from "@/components/ui/animated-components"
import { SkeletonKPI, SkeletonChart } from "@/components/ui/skeleton-loader"
import { getDashboardMetrics, getDashboardMetricsFromAPI, getRevenueData, DashboardMetrics } from "@/services/dashboardService"
import { useToast } from "@/hooks/use-toast"

export default function AdminDashboard() {
  const { toast } = useToast()
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Fetch dashboard data
  const fetchDashboardData = async (showRefreshToast = false) => {
    try {
      if (showRefreshToast) {
        setIsRefreshing(true)
      } else {
        setIsLoading(true)
      }
      setError(null)

      const dashboardMetrics = await getDashboardMetricsFromAPI()
      setMetrics(dashboardMetrics)

      if (showRefreshToast) {
        toast({
          title: "Dashboard Refreshed",
          description: "Latest data has been loaded successfully.",
        })
      }
    } catch (error: any) {
      console.error('Error fetching dashboard data:', error)
      setError(error.message || 'Failed to load dashboard data')
      toast({
        title: "Error",
        description: "Failed to load dashboard data. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }

  // Initial data fetch
  useEffect(() => {
    fetchDashboardData()
  }, [])

  // Auto-refresh every 5 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      fetchDashboardData()
    }, 5 * 60 * 1000) // 5 minutes

    return () => clearInterval(interval)
  }, [])

  // Format currency with proper Indian formatting
  const formatCurrency = (amount: number): string => {
    return `₹${amount.toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`
  }

  // Generate KPI data from real metrics
  const generateKPIData = (metrics: DashboardMetrics): KPIData[] => [
    {
      title: "Total Revenue",
      value: formatCurrency(metrics.totalRevenue),
      change: {
        value: metrics.monthlyGrowth.revenue,
        period: "last month",
        type: metrics.monthlyGrowth.revenue >= 0 ? "increase" : "decrease"
      },
      icon: <DollarSign className="h-5 w-5" />,
      description: "Total confirmed revenue",
      color: "success",
      href: "/admin/payments",
    },
    {
      title: "Total Bookings",
      value: metrics.totalBookings.toString(),
      change: {
        value: metrics.monthlyGrowth.bookings,
        period: "last month",
        type: metrics.monthlyGrowth.bookings >= 0 ? "increase" : "decrease"
      },
      icon: <Calendar className="h-5 w-5" />,
      description: "All time bookings",
      color: "info",
      href: "/admin/bookings",
      subtitle: `${metrics.confirmedBookings} confirmed`
    },
    {
      title: "Active Users",
      value: metrics.activeUsers.toString(),
      change: {
        value: metrics.monthlyGrowth.users,
        period: "last month",
        type: metrics.monthlyGrowth.users >= 0 ? "increase" : "decrease"
      },
      icon: <Users className="h-5 w-5" />,
      description: "Registered active users",
      color: "default",
      href: "/admin/users",
      subtitle: `${metrics.totalUsers} total users`
    },
    {
      title: "Total Events",
      value: metrics.totalEvents.toString(),
      icon: <MapPin className="h-5 w-5" />,
      description: "All events created",
      color: "warning",
      href: "/admin/events",
      subtitle: `${metrics.upcomingEvents} upcoming`
    },
    {
      title: "Avg Ticket Price",
      value: formatCurrency(metrics.averageTicketPrice),
      icon: <Star className="h-5 w-5" />,
      description: "Average booking value",
      color: "success",
      href: "/admin/analytics",
    },
    {
      title: "Completion Rate",
      value: `${Math.round((metrics.completedEvents / metrics.totalEvents) * 100)}%`,
      icon: <Award className="h-5 w-5" />,
      description: "Events completed successfully",
      color: "info",
      href: "/admin/completed-events",
    },
    ...(metrics.totalCities ? [{
      title: "Total Cities",
      value: metrics.totalCities.toString(),
      icon: <MapPin className="h-5 w-5" />,
      description: "Cities with events",
      color: "default",
      href: "/admin/cities",
    }] : []),
    ...(metrics.totalVenues ? [{
      title: "Total Venues",
      value: metrics.totalVenues.toString(),
      icon: <Package className="h-5 w-5" />,
      description: "Event venues available",
      color: "warning",
      href: "/admin/venues",
    }] : []),
  ]

  const kpiData = metrics ? generateKPIData(metrics) : []

  if (error) {
    return (
      <PageTransition>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
              <p className="text-muted-foreground">NIBOG Admin Overview</p>
            </div>
            <Button onClick={() => fetchDashboardData(true)} disabled={isRefreshing}>
              <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              Retry
            </Button>
          </div>
          <Card className="border-destructive">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-destructive mb-4">{error}</p>
                <Button onClick={() => fetchDashboardData(true)} variant="outline">
                  Try Again
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </PageTransition>
    )
  }

  return (
    <PageTransition>
      <div className="space-y-8">
        {/* Header with Refresh Button */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground text-sm sm:text-base">
              Real-time overview of your NIBOG platform
              {metrics && (
                <span className="block sm:inline sm:ml-2 text-xs text-muted-foreground">
                  Last updated: {new Date().toLocaleTimeString()}
                </span>
              )}
            </p>
          </div>
          <Button
            onClick={() => fetchDashboardData(true)}
            disabled={isRefreshing}
            variant="outline"
            className="w-full sm:w-auto touch-manipulation"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh Data
          </Button>
        </div>

        {/* Enhanced KPI Grid */}
        {isLoading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className={index >= 4 ? "xl:col-span-3" : ""}>
                <SkeletonKPI />
              </div>
            ))}
          </div>
        ) : (
          <Stagger>
            <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4">
              {kpiData.map((kpi, index) => (
                <StaggerItem key={index}>
                  <EnhancedKPICard data={kpi} loading={isRefreshing} />
                </StaggerItem>
              ))}
            </div>
          </Stagger>
        )}

        {/* Quick Actions Section */}
        <FadeIn delay={0.3}>
          <QuickActions metrics={metrics} />
        </FadeIn>

        {/* Enhanced Analytics Dashboard */}
        <FadeIn delay={0.5}>
          <div className="space-y-6">
            <Tabs defaultValue="overview" className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <TabsList className="grid w-full max-w-full sm:max-w-2xl grid-cols-5 h-11 touch-manipulation">
              <TabsTrigger value="overview" className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3">
                <TrendingUp className="h-4 w-4 flex-shrink-0" />
                <span className="hidden sm:inline text-xs sm:text-sm">Overview</span>
              </TabsTrigger>
              <TabsTrigger value="bookings" className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3">
                <Calendar className="h-4 w-4 flex-shrink-0" />
                <span className="hidden sm:inline text-xs sm:text-sm">Bookings</span>
              </TabsTrigger>
              <TabsTrigger value="events" className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3">
                <Activity className="h-4 w-4 flex-shrink-0" />
                <span className="hidden sm:inline text-xs sm:text-sm">Events</span>
              </TabsTrigger>
              <TabsTrigger value="addons" className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3">
                <Package className="h-4 w-4 flex-shrink-0" />
                <span className="hidden sm:inline text-xs sm:text-sm">Add-ons</span>
              </TabsTrigger>
              <TabsTrigger value="promos" className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3">
                <Tag className="h-4 w-4 flex-shrink-0" />
                <span className="hidden sm:inline text-xs sm:text-sm">Promos</span>
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              <Card className="lg:col-span-2">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-xl">Revenue Overview</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      Monthly revenue and booking trends
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-2 text-sm">
                      <div className="w-3 h-3 rounded-full bg-primary"></div>
                      <span>Revenue</span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pl-2">
                  {isLoading ? (
                    <SkeletonChart />
                  ) : (
                    <AdminOverviewChart metrics={metrics} />
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="bookings" className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-xl">Recent Bookings</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    Latest event registrations and their status
                  </p>
                </div>
              </CardHeader>
              <CardContent>
                <AdminRecentBookings />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="events" className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-xl">Upcoming Events</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    Scheduled events and their booking status
                  </p>
                </div>
              </CardHeader>
              <CardContent>
                <AdminUpcomingEvents />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="addons" className="space-y-6">
            <AdminAddonAnalytics />
          </TabsContent>

          <TabsContent value="promos" className="space-y-6">
            <AdminPromoAnalytics />
          </TabsContent>
            </Tabs>
          </div>
        </FadeIn>
      </div>
    </PageTransition>
  )
}
