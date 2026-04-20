"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Activity, Calendar, DollarSign, Users, Package, Tag, TrendingUp, MapPin, Star, Award, RefreshCw, Clock, Gamepad2, Baby, UserCheck, IndianRupee, CreditCard, BarChart3 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import AdminOverviewChart from "@/components/admin/admin-overview-chart"
import AdminRecentBookings from "@/components/admin/admin-recent-bookings"
import AdminUpcomingEvents from "@/components/admin/admin-upcoming-events"
import EnhancedKPICard, { KPIData } from "@/components/admin/enhanced-kpi-card"
import QuickActions from "@/components/admin/quick-actions"
import { PageTransition, Stagger, StaggerItem, FadeIn } from "@/components/ui/animated-components"
import { SkeletonKPI, SkeletonChart } from "@/components/ui/skeleton-loader"
import { getDashboardMetricsFromAPI, DashboardMetrics } from "@/services/dashboardService"
import { useToast } from "@/hooks/use-toast"
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell
} from "recharts"

// ---------- Trend types ----------
interface TrendItem {
  label: string; bookings: number; revenue: number; children: number; gameBookings: number;
}

const fmt = (v: number) => `₹${v.toLocaleString("en-IN",{maximumFractionDigits:0})}`
const fmtNum = (v: number) => v.toLocaleString("en-IN")

export default function AdminDashboard() {
  const { toast } = useToast()
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Trend state
  const [trendPeriod, setTrendPeriod] = useState<string>("monthly")
  const [trendData, setTrendData] = useState<TrendItem[] | null>(null)
  const [trendLoading, setTrendLoading] = useState(false)

  // Fetch dashboard data
  const fetchDashboardData = async (showRefreshToast = false) => {
    try {
      if (showRefreshToast) setIsRefreshing(true)
      else setIsLoading(true)
      setError(null)
      const dashboardMetrics = await getDashboardMetricsFromAPI()
      setMetrics(dashboardMetrics)
      if (showRefreshToast) {
        toast({ title: "Dashboard Refreshed", description: "Latest data loaded successfully." })
      }
    } catch (error: any) {
      console.error('Error fetching dashboard data:', error)
      setError(error.message || 'Failed to load dashboard data')
      toast({ title: "Error", description: "Failed to load dashboard data.", variant: "destructive" })
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }

  // Fetch trend data
  const fetchTrendData = useCallback(async (period: string) => {
    setTrendLoading(true)
    try {
      const params = new URLSearchParams()
      params.set("trend_period", period)
      const res = await fetch(`/api/reports?${params.toString()}`)
      if (!res.ok) throw new Error("Failed")
      const json = await res.json()
      if (json.success) setTrendData(json.data.trend)
    } catch {
      setTrendData(null)
    } finally {
      setTrendLoading(false)
    }
  }, [])

  useEffect(() => { fetchDashboardData() }, [])
  useEffect(() => { fetchTrendData(trendPeriod) }, [trendPeriod, fetchTrendData])

  // Auto-refresh every 5 minutes
  useEffect(() => {
    const interval = setInterval(() => fetchDashboardData(), 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  const formatCurrency = (amount: number): string => {
    return `₹${amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }

  const generateKPIData = (metrics: DashboardMetrics): KPIData[] => [
    {
      title: "Total Revenue", value: formatCurrency(metrics.totalRevenue),
      change: { value: metrics.monthlyGrowth.revenue, period: "last month", type: metrics.monthlyGrowth.revenue >= 0 ? "increase" : "decrease" },
      icon: <DollarSign className="h-5 w-5" />, description: "Total confirmed revenue", color: "success", href: "/admin/payments",
    },
    {
      title: "Total Bookings", value: metrics.totalBookings.toString(),
      change: { value: metrics.monthlyGrowth.bookings, period: "last month", type: metrics.monthlyGrowth.bookings >= 0 ? "increase" : "decrease" },
      icon: <Calendar className="h-5 w-5" />, description: "All time bookings", color: "info", href: "/admin/bookings",
      subtitle: `${metrics.confirmedBookings} confirmed`
    },
    {
      title: "Active Users", value: metrics.activeUsers.toString(),
      change: { value: metrics.monthlyGrowth.users, period: "last month", type: metrics.monthlyGrowth.users >= 0 ? "increase" : "decrease" },
      icon: <Users className="h-5 w-5" />, description: "Registered active users", color: "default", href: "/admin/users",
      subtitle: `${metrics.totalUsers} total users`
    },
    {
      title: "Total Events", value: metrics.totalEvents.toString(),
      icon: <MapPin className="h-5 w-5" />, description: "All events created", color: "warning", href: "/admin/events",
      subtitle: `${metrics.upcomingEvents} upcoming`
    },
    {
      title: "Avg Ticket Price", value: formatCurrency(metrics.averageTicketPrice),
      icon: <Star className="h-5 w-5" />, description: "Average booking value", color: "success", href: "/admin/reports",
    },
    {
      title: "Completion Rate", value: `${Math.round((metrics.completedEvents / metrics.totalEvents) * 100)}%`,
      icon: <Award className="h-5 w-5" />, description: "Events completed successfully", color: "info",
    },
    ...(metrics.totalCities ? [{
      title: "Total Cities", value: metrics.totalCities.toString(),
      icon: <MapPin className="h-5 w-5" />, description: "Cities with events", color: "default", href: "/admin/cities",
    }] : []),
    ...(metrics.totalVenues ? [{
      title: "Total Venues", value: metrics.totalVenues.toString(),
      icon: <Package className="h-5 w-5" />, description: "Event venues available", color: "warning", href: "/admin/venues",
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
              <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />Retry
            </Button>
          </div>
          <Card className="border-destructive">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-destructive mb-4">{error}</p>
                <Button onClick={() => fetchDashboardData(true)} variant="outline">Try Again</Button>
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
        {/* Header */}
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
          <Button onClick={() => fetchDashboardData(true)} disabled={isRefreshing} variant="outline" className="w-full sm:w-auto touch-manipulation">
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />Refresh Data
          </Button>
        </div>

        {/* KPI Grid */}
        {isLoading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className={index >= 4 ? "xl:col-span-3" : ""}><SkeletonKPI /></div>
            ))}
          </div>
        ) : (
          <Stagger>
            <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4">
              {kpiData.map((kpi, index) => (
                <StaggerItem key={index}><EnhancedKPICard data={kpi} loading={isRefreshing} /></StaggerItem>
              ))}
            </div>
          </Stagger>
        )}

        {/* Quick Actions */}
        <FadeIn delay={0.3}>
          <QuickActions metrics={metrics} />
        </FadeIn>

        {/* ============================================
            BOOKINGS & REVENUE TREND CHART
            ============================================ */}
        <FadeIn delay={0.4}>
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <BarChart3 className="h-5 w-5 text-indigo-600" />
                    {trendPeriod === "today" && "Today's Bookings & Revenue"}
                    {trendPeriod === "weekly" && "This Week's Bookings & Revenue"}
                    {trendPeriod === "monthly" && "This Month's Bookings & Revenue"}
                    {trendPeriod === "yearly" && "Yearly Bookings & Revenue"}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    {trendPeriod === "today" && "Hourly breakdown • Hover bars for details"}
                    {trendPeriod === "weekly" && "Mon–Sun breakdown • Hover bars for details"}
                    {trendPeriod === "monthly" && "Day-by-day breakdown • Hover bars for details"}
                    {trendPeriod === "yearly" && "Month-by-month breakdown • Hover bars for details"}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Select value={trendPeriod} onValueChange={setTrendPeriod}>
                    <SelectTrigger className="w-[150px] h-9 text-sm">
                      <Clock className="h-4 w-4 mr-1.5 text-muted-foreground" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="today">Today</SelectItem>
                      <SelectItem value="weekly">This Week</SelectItem>
                      <SelectItem value="monthly">This Month</SelectItem>
                      <SelectItem value="yearly">This Year</SelectItem>
                    </SelectContent>
                  </Select>
                  {trendData && trendData.length > 0 && !trendLoading && (
                    <div className="hidden md:flex items-center gap-3 text-xs">
                      <span className="bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-full font-semibold">
                        {fmt(trendData.reduce((s,d)=>s+(d.revenue||0),0))}
                      </span>
                      <span className="bg-amber-50 text-amber-700 px-2.5 py-1 rounded-full font-semibold">
                        {trendData.reduce((s,d)=>s+(d.bookings||0),0)} bookings
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {trendLoading ? (
                <SkeletonChart />
              ) : trendData && trendData.length > 0 ? (
                <>
                  <ResponsiveContainer width="100%" height={350}>
                    <BarChart data={trendData} margin={{top:5,right:10,left:10,bottom:5}} barGap={2}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.3}/>
                      <XAxis
                        dataKey="label"
                        tick={{fontSize: trendPeriod === "monthly" ? 9 : 11}}
                        angle={trendPeriod === "monthly" ? -45 : 0}
                        textAnchor={trendPeriod === "monthly" ? "end" : "middle"}
                        height={trendPeriod === "monthly" ? 60 : 40}
                        interval={trendPeriod === "today" ? 1 : 0}
                      />
                      <YAxis
                        yAxisId="revenue"
                        tickFormatter={(v)=>`₹${(v/1000).toFixed(0)}k`}
                        tick={{fontSize:10, fill:"#6366f1"}}
                        label={{value:"Revenue", angle:-90, position:"insideLeft", offset:5, style:{fontSize:11,fill:"#6366f1"}}}
                      />
                      <YAxis
                        yAxisId="bookings"
                        orientation="right"
                        tick={{fontSize:10, fill:"#f59e0b"}}
                        label={{value:"Bookings", angle:90, position:"insideRight", offset:5, style:{fontSize:11,fill:"#f59e0b"}}}
                        allowDecimals={false}
                      />
                      <Tooltip
                        content={({active,payload,label}:any)=>{
                          if(!active||!payload?.length) return null
                          const entry = trendData.find(d=>d.label===label)
                          const prefix = trendPeriod==="today"?"Hour":trendPeriod==="weekly"?"Day":trendPeriod==="monthly"?"Date":"Month"
                          return (
                            <div className="rounded-lg border bg-background p-3 shadow-xl text-sm min-w-[180px]">
                              <p className="font-semibold mb-2 border-b pb-1">{prefix}: {label}</p>
                              <div className="space-y-1.5">
                                <p className="flex justify-between gap-4 text-xs">
                                  <span className="flex items-center gap-1.5"><span className="inline-block w-3 h-3 rounded-sm bg-indigo-500"/>Revenue</span>
                                  <span className="font-semibold text-indigo-700">{fmt(entry?.revenue||0)}</span>
                                </p>
                                <p className="flex justify-between gap-4 text-xs">
                                  <span className="flex items-center gap-1.5"><span className="inline-block w-3 h-3 rounded-sm bg-amber-500"/>Bookings</span>
                                  <span className="font-semibold text-amber-700">{fmtNum(entry?.bookings||0)}</span>
                                </p>
                                <p className="flex justify-between gap-4 text-xs">
                                  <span className="flex items-center gap-1.5"><span className="inline-block w-3 h-3 rounded-sm bg-pink-500"/>Children</span>
                                  <span className="font-semibold text-pink-700">{fmtNum(entry?.children||0)}</span>
                                </p>
                                <p className="flex justify-between gap-4 text-xs">
                                  <span className="flex items-center gap-1.5"><span className="inline-block w-3 h-3 rounded-sm bg-purple-500"/>Games</span>
                                  <span className="font-semibold text-purple-700">{fmtNum(entry?.gameBookings||0)}</span>
                                </p>
                              </div>
                              {entry && entry.revenue > 0 && entry.bookings > 0 && (
                                <p className="mt-2 pt-1.5 border-t text-[11px] text-muted-foreground">
                                  Avg: {fmt(entry.revenue / entry.bookings)}/booking
                                </p>
                              )}
                            </div>
                          )
                        }}
                      />
                      <Legend formatter={(value:string)=>(
                        <span style={{color:value==="Revenue"?"#6366f1":"#f59e0b",fontWeight:500}}>{value}</span>
                      )}/>
                      <Bar yAxisId="revenue" dataKey="revenue" name="Revenue" radius={[4,4,0,0]} fill="#6366f1" opacity={0.85}>
                        {trendData.map((_:any, i:number)=><Cell key={i} fill="#6366f1" opacity={0.85}/>)}
                      </Bar>
                      <Bar yAxisId="bookings" dataKey="bookings" name="Bookings" radius={[4,4,0,0]} fill="#f59e0b" opacity={0.85}>
                        {trendData.map((_:any, i:number)=><Cell key={i} fill="#f59e0b" opacity={0.85}/>)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                  {/* Summary pills */}
                  <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t">
                    <span className="text-xs bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-full font-medium">
                      {fmt(trendData.reduce((s,d)=>s+(d.revenue||0),0))} revenue
                    </span>
                    <span className="text-xs bg-amber-50 text-amber-700 px-2.5 py-1 rounded-full font-medium">
                      {trendData.reduce((s,d)=>s+(d.bookings||0),0)} bookings
                    </span>
                    <span className="text-xs bg-pink-50 text-pink-700 px-2.5 py-1 rounded-full font-medium">
                      {trendData.reduce((s,d)=>s+(d.children||0),0)} children
                    </span>
                    <span className="text-xs bg-purple-50 text-purple-700 px-2.5 py-1 rounded-full font-medium">
                      {trendData.reduce((s,d)=>s+(d.gameBookings||0),0)} games
                    </span>
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-center h-[200px] text-muted-foreground">
                  No trend data available
                </div>
              )}
            </CardContent>
          </Card>
        </FadeIn>

        {/* ============================================
            RECENT BOOKINGS + UPCOMING EVENTS (side by side)
            ============================================ */}
        <FadeIn delay={0.5}>
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Calendar className="h-5 w-5 text-blue-600" />
                  Recent Bookings
                </CardTitle>
                <p className="text-sm text-muted-foreground mt-1">Latest event registrations and their status</p>
              </CardHeader>
              <CardContent>
                {isLoading ? <SkeletonChart /> : <AdminRecentBookings bookings={metrics?.recentBookings} />}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Activity className="h-5 w-5 text-green-600" />
                  Upcoming Events
                </CardTitle>
                <p className="text-sm text-muted-foreground mt-1">Scheduled events and their booking status</p>
              </CardHeader>
              <CardContent>
                {isLoading ? <SkeletonChart /> : <AdminUpcomingEvents events={metrics?.upcomingEvents} />}
              </CardContent>
            </Card>
          </div>
        </FadeIn>

        {/* ============================================
            REVENUE OVERVIEW CHART (full width)
            ============================================ */}
        <FadeIn delay={0.6}>
          <Card>
            <CardHeader>
              <div className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <TrendingUp className="h-5 w-5 text-emerald-600" />
                    Revenue Overview
                  </CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">Monthly revenue and booking trends</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pl-2">
              {isLoading ? <SkeletonChart /> : <AdminOverviewChart metrics={metrics} />}
            </CardContent>
          </Card>
        </FadeIn>
      </div>
    </PageTransition>
  )
}
