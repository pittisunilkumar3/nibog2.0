"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import {
  BarChart3, TrendingUp, IndianRupee, Users, Calendar,
  Gamepad2, RefreshCw, MapPin, Building2, CreditCard,
  PieChart as PieChartIcon, Baby, UserCheck, Trophy, Filter, Clock
} from "lucide-react"
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from "recharts"

// ---------- types ----------
interface Overview {
  totalBookings: number; totalRevenue: number; paidRevenue: number;
  paidBookings: number; pendingBookings: number; confirmedBookings: number;
  avgBookingValue: number; totalChildren: number; totalGameBookings: number;
  uniqueParents: number; gamesPerBooking: number;
}
interface NameVal { name: string; value?: number; bookings?: number; revenue?: number; city?: string; date?: string; month?: number; children?: number; gameBookings?: number }
interface ReportsData {
  overview: Overview
  revenueByCity: NameVal[]
  revenueByEvent: NameVal[]
  gamePopularity: NameVal[]
  monthlyTrend: NameVal[]
  paymentStatusDist: NameVal[]
  bookingStatusDist: NameVal[]
  childGenderDist: NameVal[]
  childAgeGroupDist: NameVal[]
  cities: { id: string; name: string }[]
  events: { id: string; name: string }[]
  activeEvents: number
  completedEvents: number
  trend: TrendItem[]
}

interface TrendItem {
  label: string; bookings: number; revenue: number; children: number; gameBookings: number;
}

const COLORS = ["#6366f1","#f59e0b","#10b981","#ef4444","#3b82f6","#ec4899","#8b5cf6","#14b8a6","#f97316","#06b6d4"]
const PIE_COLORS: Record<string, string> = {
  Paid:"#10b981", Confirmed:"#6366f1", Pending:"#f59e0b", Failed:"#ef4444",
  Refunded:"#3b82f6", Unknown:"#94a3b8", null:"#94a3b8",
  Male:"#3b82f6", Female:"#ec4899", Unknown:"#94a3b8",
}

const fmt = (v: number) => `₹${v.toLocaleString("en-IN",{maximumFractionDigits:0})}`
const fmtNum = (v: number) => v.toLocaleString("en-IN")

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border bg-background p-3 shadow-xl text-sm max-w-[250px]">
      <p className="font-semibold mb-1">{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} style={{color:p.color}} className="text-xs">
          {p.name}: {p.name.toLowerCase().includes("revenue")||p.name.toLowerCase().includes("amount")||p.name.toLowerCase().includes("price") ? fmt(p.value) : fmtNum(p.value)}
        </p>
      ))}
    </div>
  )
}

function KPI({ title, value, sub, icon, color }: { title: string; value: string; sub?: string; icon: React.ReactNode; color: string }) {
  return (
    <Card className="hover:shadow-md transition-shadow">
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

function ChartSkeleton() {
  return <div className="space-y-3"><Skeleton className="h-4 w-40" /><Skeleton className="h-[300px] w-full rounded-xl" /></div>
}

const EVENT_STATUS_OPTIONS = [
  { value: "all", label: "All Events" },
  { value: "active", label: "Active / Upcoming" },
  { value: "completed", label: "Completed" },
] as const

export default function ReportsPage() {
  const [data, setData] = useState<ReportsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [cityFilter, setCityFilter] = useState("all")
  const [eventFilter, setEventFilter] = useState("all")
  const [chartType, setChartType] = useState<"revenue"|"bookings">("revenue")

  // Trend chart-specific period filter
  const [trendPeriod, setTrendPeriod] = useState<string>("monthly")
  const [trendData, setTrendData] = useState<TrendItem[] | null>(null)
  const [trendLoading, setTrendLoading] = useState(false)

  // City chart-specific event status filter
  const [cityEventStatus, setCityEventStatus] = useState<string>("all")
  const [cityChartData, setCityChartData] = useState<NameVal[] | null>(null)
  const [cityChartLoading, setCityChartLoading] = useState(false)

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
      // Initialize city chart data
      setCityChartData(json.data.revenueByCity)
    } catch (e: any) { setError(e.message) }
    finally { setLoading(false) }
  }, [cityFilter, eventFilter])

  // Fetch city chart data when event status filter changes
  const fetchCityChartData = useCallback(async (status: string) => {
    if (status === "all") {
      // "All" uses the main data
      setCityChartData(data?.revenueByCity || null)
      return
    }
    setCityChartLoading(true)
    try {
      const params = new URLSearchParams()
      params.set("event_status", status)
      if (cityFilter !== "all") params.set("city_id", cityFilter)
      const res = await fetch(`/api/reports?${params.toString()}`)
      if (!res.ok) throw new Error("Failed")
      const json = await res.json()
      if (json.success) {
        setCityChartData(json.data.revenueByCity)
      }
    } catch {
      // fallback to main data
      setCityChartData(data?.revenueByCity || null)
    } finally {
      setCityChartLoading(false)
    }
  }, [cityFilter, data])

  useEffect(() => { fetchReports() }, [fetchReports])

  // When cityEventStatus changes, refetch city chart
  useEffect(() => {
    if (data) fetchCityChartData(cityEventStatus)
  }, [cityEventStatus, data, fetchCityChartData])

  // Fetch trend data when period changes
  const fetchTrendData = useCallback(async (period: string) => {
    setTrendLoading(true)
    try {
      const params = new URLSearchParams()
      params.set("trend_period", period)
      if (cityFilter !== "all") params.set("city_id", cityFilter)
      if (eventFilter !== "all") params.set("event_id", eventFilter)
      const res = await fetch(`/api/reports?${params.toString()}`)
      if (!res.ok) throw new Error("Failed")
      const json = await res.json()
      if (json.success) {
        setTrendData(json.data.trend)
      }
    } catch {
      setTrendData(data?.trend || null)
    } finally {
      setTrendLoading(false)
    }
  }, [cityFilter, eventFilter, data])

  useEffect(() => {
    if (data) fetchTrendData(trendPeriod)
  }, [trendPeriod, data, fetchTrendData])

  const ov = data?.overview
  const cKey = chartType === "revenue" ? "revenue" : "bookings"
  const cLabel = chartType === "revenue" ? "Revenue" : "Bookings"

  const selectedStatusLabel = EVENT_STATUS_OPTIONS.find(o => o.value === cityEventStatus)?.label || "All Events"

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-indigo-600" />
            Reports &amp; Analytics
          </h1>
          <p className="text-muted-foreground">Real-time insights across all NIBOG events, bookings, children and games.</p>
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
            <SelectTrigger className="w-[220px]"><SelectValue placeholder="All Events" /></SelectTrigger>
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
            <TrendingUp className="h-4 w-4" /> {error}
            <Button variant="link" onClick={fetchReports} className="ml-auto">Retry</Button>
          </CardContent>
        </Card>
      )}

      {/* ===== KPI ROW 1: Financials ===== */}
      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({length:4}).map((_,i)=><Card key={i}><CardContent className="pt-6 space-y-2"><Skeleton className="h-4 w-24"/><Skeleton className="h-8 w-32"/></CardContent></Card>)}
        </div>
      ) : ov && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <KPI title="Total Revenue" value={fmt(ov.totalRevenue)} sub={`${fmt(ov.paidRevenue)} collected`} icon={<IndianRupee className="h-4 w-4 text-white"/>} color="bg-green-500" />
          <KPI title="Total Bookings" value={fmtNum(ov.totalBookings)} sub={`${ov.confirmedBookings} confirmed`} icon={<Calendar className="h-4 w-4 text-white"/>} color="bg-indigo-500" />
          <KPI title="Avg Booking Value" value={fmt(ov.avgBookingValue)} sub={`${ov.paidBookings} paid`} icon={<TrendingUp className="h-4 w-4 text-white"/>} color="bg-amber-500" />
          <KPI title="Pending Bookings" value={fmtNum(ov.pendingBookings)} sub="Awaiting payment" icon={<CreditCard className="h-4 w-4 text-white"/>} color="bg-red-500" />
        </div>
      )}

      {/* ===== KPI ROW 2: Children & Games ===== */}
      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({length:4}).map((_,i)=><Card key={i}><CardContent className="pt-6 space-y-2"><Skeleton className="h-4 w-24"/><Skeleton className="h-8 w-32"/></CardContent></Card>)}
        </div>
      ) : ov && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <KPI title="Total Children" value={fmtNum(ov.totalChildren)} sub={`${ov.uniqueParents} unique parents`} icon={<Baby className="h-4 w-4 text-white"/>} color="bg-pink-500" />
          <KPI title="Game Bookings" value={fmtNum(ov.totalGameBookings)} sub={`${ov.gamesPerBooking} avg per booking`} icon={<Gamepad2 className="h-4 w-4 text-white"/>} color="bg-purple-500" />
          <KPI title="Unique Parents" value={fmtNum(ov.uniqueParents)} sub={`${ov.totalChildren} children registered`} icon={<UserCheck className="h-4 w-4 text-white"/>} color="bg-blue-500" />
          <KPI title="Games per Child" value={ov.totalChildren > 0 ? (ov.totalGameBookings / ov.totalChildren).toFixed(1) : "0"} sub={`${data?.gamePopularity.length || 0} game types`} icon={<Trophy className="h-4 w-4 text-white"/>} color="bg-teal-500" />
        </div>
      )}

      {/* Chart toggle */}
      <div className="flex gap-2">
        <Button variant={chartType==="revenue"?"default":"outline"} size="sm" onClick={()=>setChartType("revenue")}>
          <IndianRupee className="h-4 w-4 mr-1" /> Revenue
        </Button>
        <Button variant={chartType==="bookings"?"default":"outline"} size="sm" onClick={()=>setChartType("bookings")}>
          <BarChart3 className="h-4 w-4 mr-1" /> Bookings
        </Button>
      </div>

      {/* ===== ROW 1: City Bar (with event status dropdown) + Payment Pie ===== */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2 text-base">
                  <MapPin className="h-4 w-4 text-indigo-500"/> City-wise {cLabel}
                </CardTitle>
                <CardDescription className="mt-1">
                  Filter by event status • Includes children &amp; game booking counts
                </CardDescription>
              </div>
              <div className="flex flex-col items-end gap-1.5">
                <Select value={cityEventStatus} onValueChange={setCityEventStatus}>
                  <SelectTrigger className="w-[180px] h-8 text-xs">
                    <Filter className="h-3 w-3 mr-1 text-muted-foreground" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {EVENT_STATUS_OPTIONS.map(opt => (
                      <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <span className="text-[11px] text-muted-foreground">
                  {cityEventStatus === "active" && `🟢 ${data?.activeEvents ?? 0} active events`}
                  {cityEventStatus === "completed" && `🔴 ${data?.completedEvents ?? 0} completed events`}
                  {cityEventStatus === "all" && `📊 All events`}
                </span>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {cityChartLoading ? (
              <div className="flex items-center justify-center h-[320px]">
                <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={cityChartData||[]} margin={{top:5,right:20,left:10,bottom:5}}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3}/>
                  <XAxis dataKey="name" tick={{fontSize:11}} angle={-20} textAnchor="end" height={60}/>
                  <YAxis tickFormatter={chartType==="revenue"?(v)=>`₹${(v/1000).toFixed(0)}k`:undefined} tick={{fontSize:11}}/>
                  <Tooltip content={<CustomTooltip/>}/>
                  <Legend/>
                  <Bar dataKey={cKey} name={cLabel} radius={[6,6,0,0]}>
                    {(cityChartData||[]).map((_,i)=><Cell key={i} fill={COLORS[i%COLORS.length]}/>)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
            {/* Summary pills below chart */}
            {cityChartData && cityChartData.length > 0 && !cityChartLoading && (
              <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t">
                <span className="text-xs bg-indigo-50 text-indigo-700 px-2 py-1 rounded-full font-medium">
                  {cityChartData.reduce((s,c)=>s+(c.bookings||0),0)} bookings
                </span>
                <span className="text-xs bg-pink-50 text-pink-700 px-2 py-1 rounded-full font-medium">
                  {cityChartData.reduce((s,c)=>s+(c.children||0),0)} children
                </span>
                <span className="text-xs bg-purple-50 text-purple-700 px-2 py-1 rounded-full font-medium">
                  {cityChartData.reduce((s,c)=>s+(c.gameBookings||0),0)} games
                </span>
                <span className="text-xs bg-green-50 text-green-700 px-2 py-1 rounded-full font-medium">
                  {fmt(cityChartData.reduce((s,c)=>s+(c.revenue||0),0))} total
                </span>
              </div>
            )}
            {(!cityChartData || cityChartData.length === 0) && !cityChartLoading && (
              <div className="text-center py-8 text-muted-foreground text-sm">
                No data for {selectedStatusLabel.toLowerCase()}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base"><PieChartIcon className="h-4 w-4 text-green-500"/> Payment Status</CardTitle>
            <CardDescription>Distribution of booking payment statuses</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? <ChartSkeleton/> : (
              <ResponsiveContainer width="100%" height={320}>
                <PieChart>
                  <Pie data={data?.paymentStatusDist||[]} cx="50%" cy="50%" innerRadius={60} outerRadius={110}
                    paddingAngle={3} dataKey="value" nameKey="name"
                    label={({name,percent})=>`${name} (${(percent*100).toFixed(0)}%)`}>
                    {(data?.paymentStatusDist||[]).map((entry,i)=><Cell key={i} fill={PIE_COLORS[entry.name]||COLORS[i]}/>)}
                  </Pie>
                  <Tooltip formatter={(v:number)=>fmtNum(v)}/>
                  <Legend/>
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ===== ROW 2: Revenue Trend + Game Popularity ===== */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2 text-base">
                  <TrendingUp className="h-4 w-4 text-amber-500"/>
                  {trendPeriod === "today" && "Today's Bookings & Revenue"}
                  {trendPeriod === "weekly" && "This Week's Bookings & Revenue"}
                  {trendPeriod === "monthly" && "This Month's Bookings & Revenue"}
                  {trendPeriod === "yearly" && "Yearly Bookings & Revenue"}
                </CardTitle>
                <CardDescription className="mt-1">
                  {trendPeriod === "today" && "Hourly breakdown • Hover bars for details"}
                  {trendPeriod === "weekly" && "Mon-Sun breakdown • Hover bars for details"}
                  {trendPeriod === "monthly" && "Day-by-day breakdown • Hover bars for details"}
                  {trendPeriod === "yearly" && "Month-by-month breakdown • Hover bars for details"}
                </CardDescription>
              </div>
              <div className="flex flex-col items-end gap-1.5">
                <Select value={trendPeriod} onValueChange={setTrendPeriod}>
                  <SelectTrigger className="w-[140px] h-8 text-xs">
                    <Clock className="h-3 w-3 mr-1 text-muted-foreground" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="today">Today</SelectItem>
                    <SelectItem value="weekly">This Week</SelectItem>
                    <SelectItem value="monthly">This Month</SelectItem>
                    <SelectItem value="yearly">This Year</SelectItem>
                  </SelectContent>
                </Select>
                <span className="text-[11px] text-muted-foreground">
                  {trendData && trendData.length > 0 && !trendLoading && (
                    <>₹{trendData.reduce((s,d)=>s+(d.revenue||0),0).toLocaleString("en-IN")} total</>
                  )}
                </span>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {trendLoading ? (
              <div className="flex items-center justify-center h-[320px]">
                <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={340}>
                <BarChart data={trendData||[]} margin={{top:5,right:10,left:10,bottom:5}} barGap={2}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3}/>
                  <XAxis
                    dataKey="label"
                    tick={{fontSize: trendPeriod === "monthly" ? 9 : 11}}
                    angle={trendPeriod === "monthly" ? -45 : 0}
                    textAnchor={trendPeriod === "monthly" ? "end" : "middle"}
                    height={trendPeriod === "monthly" ? 60 : 40}
                    interval={trendPeriod === "today" ? 1 : 0}
                  />
                  {/* Left Y-axis: Revenue */}
                  <YAxis
                    yAxisId="revenue"
                    tickFormatter={(v)=>`₹${(v/1000).toFixed(0)}k`}
                    tick={{fontSize:10, fill:"#6366f1"}}
                    label={{value:"Revenue", angle:-90, position:"insideLeft", offset:5, style:{fontSize:11,fill:"#6366f1"}}}
                  />
                  {/* Right Y-axis: Bookings */}
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
                      // Find the raw data entry for this label
                      const entry = (trendData||[]).find((d:any)=>d.label===label) as TrendItem | undefined
                      const prefix = trendPeriod==="today"?"Hour":trendPeriod==="weekly"?"Day":trendPeriod==="monthly"?"Date":"Month"
                      return (
                        <div className="rounded-lg border bg-background p-3 shadow-xl text-sm min-w-[180px]">
                          <p className="font-semibold mb-2 border-b pb-1">{prefix}: {label}</p>
                          <div className="space-y-1.5">
                            <p className="flex justify-between gap-4 text-xs">
                              <span className="flex items-center gap-1.5">
                                <span className="inline-block w-3 h-3 rounded-sm bg-indigo-500"/> Revenue
                              </span>
                              <span className="font-semibold text-indigo-700">{fmt(entry?.revenue||0)}</span>
                            </p>
                            <p className="flex justify-between gap-4 text-xs">
                              <span className="flex items-center gap-1.5">
                                <span className="inline-block w-3 h-3 rounded-sm bg-amber-500"/> Bookings
                              </span>
                              <span className="font-semibold text-amber-700">{fmtNum(entry?.bookings||0)}</span>
                            </p>
                            <p className="flex justify-between gap-4 text-xs">
                              <span className="flex items-center gap-1.5">
                                <span className="inline-block w-3 h-3 rounded-sm bg-pink-500"/> Children
                              </span>
                              <span className="font-semibold text-pink-700">{fmtNum(entry?.children||0)}</span>
                            </p>
                            <p className="flex justify-between gap-4 text-xs">
                              <span className="flex items-center gap-1.5">
                                <span className="inline-block w-3 h-3 rounded-sm bg-purple-500"/> Games
                              </span>
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
                  <Legend
                    formatter={(value:string)=>(
                      <span style={{color:value==="Revenue"?"#6366f1":"#f59e0b",fontWeight:500}}>{value}</span>
                    )}
                  />
                  {/* Revenue bar (left axis) */}
                  <Bar yAxisId="revenue" dataKey="revenue" name="Revenue" radius={[4,4,0,0]} fill="#6366f1" opacity={0.85}>
                    {(trendData||[]).map((_:any, i:number)=><Cell key={i} fill="#6366f1" opacity={0.85}/>)}
                  </Bar>
                  {/* Bookings bar (right axis) */}
                  <Bar yAxisId="bookings" dataKey="bookings" name="Bookings" radius={[4,4,0,0]} fill="#f59e0b" opacity={0.85}>
                    {(trendData||[]).map((_:any, i:number)=><Cell key={i} fill="#f59e0b" opacity={0.85}/>)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
            {/* Summary pills */}
            {trendData && trendData.length > 0 && !trendLoading && (
              <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t">
                <span className="text-xs bg-amber-50 text-amber-700 px-2 py-1 rounded-full font-medium">
                  ₹{trendData.reduce((s,d)=>s+(d.revenue||0),0).toLocaleString("en-IN")} revenue
                </span>
                <span className="text-xs bg-indigo-50 text-indigo-700 px-2 py-1 rounded-full font-medium">
                  {trendData.reduce((s,d)=>s+(d.bookings||0),0)} bookings
                </span>
                <span className="text-xs bg-pink-50 text-pink-700 px-2 py-1 rounded-full font-medium">
                  {trendData.reduce((s,d)=>s+(d.children||0),0)} children
                </span>
                <span className="text-xs bg-purple-50 text-purple-700 px-2 py-1 rounded-full font-medium">
                  {trendData.reduce((s,d)=>s+(d.gameBookings||0),0)} games
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base"><Gamepad2 className="h-4 w-4 text-purple-500"/> Game Popularity</CardTitle>
            <CardDescription>Total game bookings count per game</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? <ChartSkeleton/> : (
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={data?.gamePopularity||[]} layout="vertical" margin={{top:5,right:20,left:10,bottom:5}}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3}/>
                  <XAxis type="number" tick={{fontSize:11}}/>
                  <YAxis dataKey="name" type="category" width={130} tick={{fontSize:11}}/>
                  <Tooltip content={<CustomTooltip/>}/>
                  <Bar dataKey="bookings" name="Game Bookings" radius={[0,6,6,0]}>
                    {(data?.gamePopularity||[]).map((_,i)=><Cell key={i} fill={COLORS[i%COLORS.length]}/>)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ===== ROW 3: Event Bar (full width) ===== */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base"><Building2 className="h-4 w-4 text-teal-500"/> Event-wise {cLabel}</CardTitle>
          <CardDescription>Children &amp; game bookings per event</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? <ChartSkeleton/> : (
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={data?.revenueByEvent||[]} margin={{top:5,right:20,left:10,bottom:80}}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3}/>
                <XAxis dataKey="name" tick={{fontSize:10}} angle={-30} textAnchor="end" height={80}/>
                <YAxis tickFormatter={chartType==="revenue"?(v)=>`₹${(v/1000).toFixed(0)}k`:undefined} tick={{fontSize:11}}/>
                <Tooltip content={<CustomTooltip/>}/>
                <Legend/>
                <Bar dataKey={cKey} name={cLabel} radius={[6,6,0,0]}>
                  {(data?.revenueByEvent||[]).map((_,i)=><Cell key={i} fill={COLORS[i%COLORS.length]}/>)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* ===== ROW 4: Child Gender + Age Group ===== */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base"><Baby className="h-4 w-4 text-pink-500"/> Child Gender Distribution</CardTitle>
            <CardDescription>Boys vs Girls registered across all bookings</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? <ChartSkeleton/> : (
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie data={data?.childGenderDist||[]} cx="50%" cy="50%" outerRadius={100}
                    paddingAngle={3} dataKey="value" nameKey="name"
                    label={({name,value,percent})=>`${name}: ${value} (${(percent*100).toFixed(0)}%)`}>
                    {(data?.childGenderDist||[]).map((entry,i)=><Cell key={i} fill={PIE_COLORS[entry.name]||COLORS[i]}/>)}
                  </Pie>
                  <Tooltip formatter={(v:number)=>fmtNum(v)}/>
                  <Legend/>
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base"><Users className="h-4 w-4 text-blue-500"/> Child Age Groups</CardTitle>
            <CardDescription>Distribution of children by age at event time</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? <ChartSkeleton/> : (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={data?.childAgeGroupDist||[]} margin={{top:5,right:20,left:10,bottom:5}}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3}/>
                  <XAxis dataKey="name" tick={{fontSize:12}}/>
                  <YAxis tick={{fontSize:11}}/>
                  <Tooltip content={<CustomTooltip/>}/>
                  <Bar dataKey="value" name="Children" radius={[6,6,0,0]}>
                    {(data?.childAgeGroupDist||[]).map((_,i)=><Cell key={i} fill={COLORS[i%COLORS.length]}/>)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ===== ROW 5: Booking Status Pie + City Summary Table (with event status filter) ===== */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base"><CreditCard className="h-4 w-4 text-indigo-500"/> Booking Status</CardTitle>
            <CardDescription>Confirmed vs Paid vs Pending breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? <ChartSkeleton/> : (
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie data={data?.bookingStatusDist||[]} cx="50%" cy="50%" outerRadius={100}
                    paddingAngle={3} dataKey="value" nameKey="name"
                    label={({name,value,percent})=>`${name}: ${value} (${(percent*100).toFixed(0)}%)`}>
                    {(data?.bookingStatusDist||[]).map((entry,i)=><Cell key={i} fill={PIE_COLORS[entry.name]||COLORS[i]}/>)}
                  </Pie>
                  <Tooltip formatter={(v:number)=>fmtNum(v)}/>
                  <Legend/>
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2 text-base"><Calendar className="h-4 w-4 text-rose-500"/> City Performance Summary</CardTitle>
                <CardDescription>Bookings, children, games &amp; revenue per city</CardDescription>
              </div>
              <div className="flex items-center gap-1.5">
                <Filter className="h-3 w-3 text-muted-foreground" />
                <span className="text-[11px] text-muted-foreground font-medium">{selectedStatusLabel}</span>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {cityChartLoading ? (
              <div className="flex items-center justify-center h-[320px]"><RefreshCw className="h-6 w-6 animate-spin text-muted-foreground"/></div>
            ) : (
              <div className="overflow-auto max-h-[320px]">
                <table className="w-full text-sm">
                  <thead className="sticky top-0 bg-background">
                    <tr className="border-b">
                      <th className="text-left py-2 px-2 font-semibold">City</th>
                      <th className="text-right py-2 px-2 font-semibold">Bookings</th>
                      <th className="text-right py-2 px-2 font-semibold">Children</th>
                      <th className="text-right py-2 px-2 font-semibold">Games</th>
                      <th className="text-right py-2 px-2 font-semibold">Revenue</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(cityChartData||[]).map((c,i)=>(
                      <tr key={i} className="border-b hover:bg-muted/50 transition-colors">
                        <td className="py-2 px-2 font-medium">{c.name}</td>
                        <td className="text-right py-2 px-2">{fmtNum(c.bookings||0)}</td>
                        <td className="text-right py-2 px-2 text-pink-600 font-medium">{fmtNum(c.children||0)}</td>
                        <td className="text-right py-2 px-2 text-purple-600 font-medium">{fmtNum(c.gameBookings||0)}</td>
                        <td className="text-right py-2 px-2 text-green-600 font-semibold">{fmt(c.revenue||0)}</td>
                      </tr>
                    ))}
                    {(!cityChartData || cityChartData.length === 0) && (
                      <tr><td colSpan={5} className="py-8 text-center text-muted-foreground">No data for {selectedStatusLabel.toLowerCase()}</td></tr>
                    )}
                    {/* Totals row */}
                    {cityChartData && cityChartData.length > 0 && (
                      <tr className="border-t-2 border-muted font-bold bg-muted/30">
                        <td className="py-2 px-2">TOTAL</td>
                        <td className="text-right py-2 px-2">{fmtNum(cityChartData.reduce((s,c)=>s+(c.bookings||0),0))}</td>
                        <td className="text-right py-2 px-2 text-pink-600">{fmtNum(cityChartData.reduce((s,c)=>s+(c.children||0),0))}</td>
                        <td className="text-right py-2 px-2 text-purple-600">{fmtNum(cityChartData.reduce((s,c)=>s+(c.gameBookings||0),0))}</td>
                        <td className="text-right py-2 px-2 text-green-600">{fmt(cityChartData.reduce((s,c)=>s+(c.revenue||0),0))}</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ===== ROW 6: Game Booking Summary Table ===== */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base"><Trophy className="h-4 w-4 text-amber-500"/> Game Booking Summary</CardTitle>
          <CardDescription>Booking count, revenue &amp; share per game</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? <ChartSkeleton/> : (
            <div className="overflow-auto">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-background">
                  <tr className="border-b">
                    <th className="text-left py-2 px-3 font-semibold">#</th>
                    <th className="text-left py-2 px-3 font-semibold">Game</th>
                    <th className="text-right py-2 px-3 font-semibold">Bookings</th>
                    <th className="text-right py-2 px-3 font-semibold">Revenue</th>
                    <th className="text-right py-2 px-3 font-semibold">Avg Price</th>
                    <th className="text-right py-2 px-3 font-semibold">% of Total</th>
                  </tr>
                </thead>
                <tbody>
                  {(data?.gamePopularity||[]).map((g,i)=>{
                    const total = data?.overview?.totalGameBookings || 1
                    const pct = ((g.bookings||0)/total*100).toFixed(1)
                    return (
                      <tr key={i} className="border-b hover:bg-muted/50 transition-colors">
                        <td className="py-2 px-3 text-muted-foreground">{i+1}</td>
                        <td className="py-2 px-3 font-medium flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full flex-shrink-0" style={{backgroundColor:COLORS[i%COLORS.length]}}/>
                          {g.name}
                        </td>
                        <td className="text-right py-2 px-3 font-semibold">{fmtNum(g.bookings||0)}</td>
                        <td className="text-right py-2 px-3 text-green-600 font-semibold">{fmt(g.revenue||0)}</td>
                        <td className="text-right py-2 px-3">{fmt((g.revenue||0)/(g.bookings||1))}</td>
                        <td className="text-right py-2 px-3">
                          <div className="flex items-center justify-end gap-2">
                            <div className="w-16 bg-gray-200 rounded-full h-2">
                              <div className="bg-indigo-500 h-2 rounded-full" style={{width:`${Math.min(Number(pct),100)}%`}}/>
                            </div>
                            <span className="text-xs w-10 text-right">{pct}%</span>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                  {(!data?.gamePopularity?.length) && (
                    <tr><td colSpan={6} className="py-8 text-center text-muted-foreground">No data available</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
