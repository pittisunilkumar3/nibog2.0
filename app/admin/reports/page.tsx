"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import {
  BarChart3, TrendingUp, TrendingDown, IndianRupee, Users, Calendar,
  Gamepad2, RefreshCw, MapPin, Building2, CreditCard, PieChart as PieChartIcon
} from "lucide-react"
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Area, AreaChart
} from "recharts"

// ---------- types ----------
interface Overview {
  totalBookings: number; totalRevenue: number; paidRevenue: number;
  paidBookings: number; pendingBookings: number; confirmedBookings: number;
  avgBookingValue: number;
}
interface NameValue { name: string; value?: number; bookings?: number; revenue?: number; city?: string; date?: string; month?: number }
interface ReportsData {
  overview: Overview
  revenueByCity: NameValue[]
  revenueByEvent: NameValue[]
  gamePopularity: NameValue[]
  monthlyTrend: NameValue[]
  paymentStatusDist: NameValue[]
  bookingStatusDist: NameValue[]
  cities: { id: string; name: string }[]
  events: { id: string; name: string }[]
}

// ---------- colours ----------
const COLORS = ["#6366f1", "#f59e0b", "#10b981", "#ef4444", "#3b82f6", "#ec4899", "#8b5cf6", "#14b8a6", "#f97316", "#06b6d4"]
const PIE_COLORS: Record<string, string> = {
  Paid: "#10b981", Confirmed: "#6366f1", Pending: "#f59e0b", Failed: "#ef4444",
  Refunded: "#3b82f6", Unknown: "#94a3b8", null: "#94a3b8",
}

const fmt = (v: number) => `₹${v.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`
const fmtNum = (v: number) => v.toLocaleString("en-IN")

// ---------- custom tooltip ----------
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border bg-background p-3 shadow-xl text-sm">
      <p className="font-semibold mb-1">{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} style={{ color: p.color }} className="text-xs">
          {p.name}: {p.name.toLowerCase().includes("revenue") || p.name.toLowerCase().includes("amount") ? fmt(p.value) : fmtNum(p.value)}
        </p>
      ))}
    </div>
  )
}

// ---------- KPI Card ----------
function KPI({ title, value, sub, icon, color }: { title: string; value: string; sub?: string; icon: React.ReactNode; color: string }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <div className={`p-2 rounded-lg ${color}`}>{icon}</div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
      </CardContent>
    </Card>
  )
}

// ---------- Skeleton ----------
function ChartSkeleton() {
  return <div className="space-y-3"><Skeleton className="h-4 w-40" /><Skeleton className="h-[300px] w-full rounded-xl" /></div>
}

// ==================== PAGE ====================
export default function ReportsPage() {
  const [data, setData] = useState<ReportsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [cityFilter, setCityFilter] = useState("all")
  const [eventFilter, setEventFilter] = useState("all")
  const [chartType, setChartType] = useState<"revenue" | "bookings">("revenue")

  const fetchReports = useCallback(async () => {
    setLoading(true); setError(null)
    try {
      const params = new URLSearchParams()
      if (cityFilter !== "all") params.set("city_id", cityFilter)
      if (eventFilter !== "all") params.set("event_id", eventFilter)
      const res = await fetch(`/api/reports?${params.toString()}`)
      if (!res.ok) throw new Error("Failed to load reports")
      const json = await res.json()
      if (!json.success) throw new Error(json.error || "Failed")
      setData(json.data)
    } catch (e: any) { setError(e.message) }
    finally { setLoading(false) }
  }, [cityFilter, eventFilter])

  useEffect(() => { fetchReports() }, [fetchReports])

  const ov = data?.overview

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-indigo-600" />
            Reports &amp; Analytics
          </h1>
          <p className="text-muted-foreground">Real-time insights across all NIBOG events, bookings, revenue and games.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Select value={cityFilter} onValueChange={(v) => { setCityFilter(v); setEventFilter("all") }}>
            <SelectTrigger className="w-[160px]"><SelectValue placeholder="All Cities" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Cities</SelectItem>
              {data?.cities.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={eventFilter} onValueChange={setEventFilter}>
            <SelectTrigger className="w-[200px]"><SelectValue placeholder="All Events" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Events</SelectItem>
              {data?.events.map(e => <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>)}
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={fetchReports} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading && "animate-spin"}`} />Refresh
          </Button>
        </div>
      </div>

      {error && (
        <Card className="border-red-300 bg-red-50">
          <CardContent className="pt-6 text-red-700 flex items-center gap-2">
            <TrendingDown className="h-4 w-4" /> {error}
            <Button variant="link" onClick={fetchReports} className="ml-auto">Retry</Button>
          </CardContent>
        </Card>
      )}

      {/* KPI Row */}
      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}><CardContent className="pt-6 space-y-2"><Skeleton className="h-4 w-24" /><Skeleton className="h-8 w-32" /></CardContent></Card>
          ))}
        </div>
      ) : ov && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <KPI title="Total Revenue" value={fmt(ov.totalRevenue)} sub={`${fmt(ov.paidRevenue)} collected`} icon={<IndianRupee className="h-4 w-4 text-white" />} color="bg-green-500" />
          <KPI title="Total Bookings" value={fmtNum(ov.totalBookings)} sub={`${ov.confirmedBookings} confirmed`} icon={<Calendar className="h-4 w-4 text-white" />} color="bg-indigo-500" />
          <KPI title="Avg Booking Value" value={fmt(ov.avgBookingValue)} sub={`${ov.paidBookings} paid bookings`} icon={<TrendingUp className="h-4 w-4 text-white" />} color="bg-amber-500" />
          <KPI title="Pending Bookings" value={fmtNum(ov.pendingBookings)} sub="Awaiting payment" icon={<CreditCard className="h-4 w-4 text-white" />} color="bg-red-500" />
        </div>
      )}

      {/* Chart toggle */}
      <div className="flex gap-2">
        <Button variant={chartType === "revenue" ? "default" : "outline"} size="sm" onClick={() => setChartType("revenue")}>
          <IndianRupee className="h-4 w-4 mr-1" /> Revenue
        </Button>
        <Button variant={chartType === "bookings" ? "default" : "outline"} size="sm" onClick={() => setChartType("bookings")}>
          <BarChart3 className="h-4 w-4 mr-1" /> Bookings
        </Button>
      </div>

      {/* Row 1: Revenue by City + Payment Status Pie */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Revenue by City */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base"><MapPin className="h-4 w-4 text-indigo-500" /> City-wise {chartType === "revenue" ? "Revenue" : "Bookings"}</CardTitle>
            <CardDescription>Performance comparison across cities</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? <ChartSkeleton /> : (
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={data?.revenueByCity || []} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} angle={-20} textAnchor="end" height={60} />
                  <YAxis tickFormatter={chartType === "revenue" ? (v) => `₹${(v / 1000).toFixed(0)}k` : undefined} tick={{ fontSize: 11 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar
                    dataKey={chartType === "revenue" ? "revenue" : "bookings"}
                    name={chartType === "revenue" ? "Revenue" : "Bookings"}
                    radius={[6, 6, 0, 0]}
                  >
                    {(data?.revenueByCity || []).map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Payment Status Pie */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base"><PieChartIcon className="h-4 w-4 text-green-500" /> Payment Status</CardTitle>
            <CardDescription>Distribution of booking payment statuses</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? <ChartSkeleton /> : (
              <ResponsiveContainer width="100%" height={320}>
                <PieChart>
                  <Pie
                    data={data?.paymentStatusDist || []}
                    cx="50%" cy="50%" innerRadius={60} outerRadius={110}
                    paddingAngle={3} dataKey="value" nameKey="name"
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  >
                    {(data?.paymentStatusDist || []).map((entry, i) => (
                      <Cell key={i} fill={PIE_COLORS[entry.name] || COLORS[i]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v: number) => fmtNum(v)} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Row 2: Monthly Trend + Game Popularity */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Monthly Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base"><TrendingUp className="h-4 w-4 text-amber-500" /> Monthly Trend</CardTitle>
            <CardDescription>Booking and revenue trend over time</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? <ChartSkeleton /> : (
              <ResponsiveContainer width="100%" height={320}>
                <AreaChart data={data?.monthlyTrend || []} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorBookings" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis yAxisId="left" tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 11 }} />
                  <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Area yAxisId="left" type="monotone" dataKey="revenue" stroke="#6366f1" fill="url(#colorRevenue)" name="Revenue" />
                  <Area yAxisId="right" type="monotone" dataKey="bookings" stroke="#f59e0b" fill="url(#colorBookings)" name="Bookings" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Game Popularity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base"><Gamepad2 className="h-4 w-4 text-purple-500" /> Game Popularity</CardTitle>
            <CardDescription>Most booked games by {chartType === "revenue" ? "revenue" : "number of bookings"}</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? <ChartSkeleton /> : (
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={data?.gamePopularity || []} layout="vertical" margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis type="number" tickFormatter={chartType === "revenue" ? (v) => `₹${(v / 1000).toFixed(0)}k` : undefined} tick={{ fontSize: 11 }} />
                  <YAxis dataKey="name" type="category" width={120} tick={{ fontSize: 11 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar
                    dataKey={chartType === "revenue" ? "revenue" : "bookings"}
                    name={chartType === "revenue" ? "Revenue" : "Bookings"}
                    radius={[0, 6, 6, 0]}
                  >
                    {(data?.gamePopularity || []).map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Row 3: Revenue by Event (full width) */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base"><Building2 className="h-4 w-4 text-teal-500" /> Event-wise {chartType === "revenue" ? "Revenue" : "Bookings"}</CardTitle>
          <CardDescription>Compare performance of each event</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? <ChartSkeleton /> : (
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={data?.revenueByEvent || []} margin={{ top: 5, right: 20, left: 10, bottom: 60 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} angle={-30} textAnchor="end" height={80} />
                <YAxis tickFormatter={chartType === "revenue" ? (v) => `₹${(v / 1000).toFixed(0)}k` : undefined} tick={{ fontSize: 11 }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar dataKey={chartType === "revenue" ? "revenue" : "bookings"} name={chartType === "revenue" ? "Revenue" : "Bookings"} radius={[6, 6, 0, 0]}>
                  {(data?.revenueByEvent || []).map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Row 4: Booking Status Pie + Data Table summary */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Booking Status Pie */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base"><Users className="h-4 w-4 text-blue-500" /> Booking Status</CardTitle>
            <CardDescription>Confirmed vs Pending breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? <ChartSkeleton /> : (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={data?.bookingStatusDist || []}
                    cx="50%" cy="50%" outerRadius={100}
                    paddingAngle={3} dataKey="value" nameKey="name"
                    label={({ name, value, percent }) => `${name}: ${value} (${(percent * 100).toFixed(0)}%)`}
                  >
                    {(data?.bookingStatusDist || []).map((entry, i) => (
                      <Cell key={i} fill={PIE_COLORS[entry.name] || COLORS[i]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v: number) => fmtNum(v)} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Quick Summary Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base"><Calendar className="h-4 w-4 text-rose-500" /> City Performance Summary</CardTitle>
            <CardDescription>Revenue, bookings and avg value per city</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? <ChartSkeleton /> : (
              <div className="overflow-auto max-h-[300px]">
                <table className="w-full text-sm">
                  <thead className="sticky top-0 bg-background">
                    <tr className="border-b">
                      <th className="text-left py-2 px-3 font-semibold">City</th>
                      <th className="text-right py-2 px-3 font-semibold">Bookings</th>
                      <th className="text-right py-2 px-3 font-semibold">Revenue</th>
                      <th className="text-right py-2 px-3 font-semibold">Avg Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(data?.revenueByCity || []).map((c, i) => (
                      <tr key={i} className="border-b hover:bg-muted/50 transition-colors">
                        <td className="py-2 px-3 font-medium">{c.name}</td>
                        <td className="text-right py-2 px-3">{fmtNum(c.bookings || 0)}</td>
                        <td className="text-right py-2 px-3 text-green-600 font-semibold">{fmt(c.revenue || 0)}</td>
                        <td className="text-right py-2 px-3">{fmt((c.revenue || 0) / (c.bookings || 1))}</td>
                      </tr>
                    ))}
                    {(!data?.revenueByCity?.length) && (
                      <tr><td colSpan={4} className="py-8 text-center text-muted-foreground">No data available</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
