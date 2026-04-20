"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import {
  BarChart3, TrendingUp, IndianRupee, Users, Calendar,
  Gamepad2, RefreshCw, MapPin, Building2, CreditCard,
  PieChart as PieChartIcon, Baby, UserCheck, Trophy
} from "lucide-react"
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, Area, AreaChart
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

export default function ReportsPage() {
  const [data, setData] = useState<ReportsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [cityFilter, setCityFilter] = useState("all")
  const [eventFilter, setEventFilter] = useState("all")
  const [chartType, setChartType] = useState<"revenue"|"bookings">("revenue")

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
  const cKey = chartType === "revenue" ? "revenue" : "bookings"
  const cLabel = chartType === "revenue" ? "Revenue" : "Bookings"

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

      {/* ===== ROW 1: City Bar + Payment Pie ===== */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base"><MapPin className="h-4 w-4 text-indigo-500"/> City-wise {cLabel}</CardTitle>
            <CardDescription>Includes children &amp; game booking counts</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? <ChartSkeleton/> : (
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={data?.revenueByCity||[]} margin={{top:5,right:20,left:10,bottom:5}}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3}/>
                  <XAxis dataKey="name" tick={{fontSize:11}} angle={-20} textAnchor="end" height={60}/>
                  <YAxis tickFormatter={chartType==="revenue"?(v)=>`₹${(v/1000).toFixed(0)}k`:undefined} tick={{fontSize:11}}/>
                  <Tooltip content={<CustomTooltip/>}/>
                  <Legend/>
                  <Bar dataKey={cKey} name={cLabel} radius={[6,6,0,0]}>
                    {(data?.revenueByCity||[]).map((_,i)=><Cell key={i} fill={COLORS[i%COLORS.length]}/>)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
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

      {/* ===== ROW 2: Monthly Trend + Game Popularity ===== */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base"><TrendingUp className="h-4 w-4 text-amber-500"/> Monthly Trend</CardTitle>
            <CardDescription>Bookings, revenue, children &amp; game bookings over time</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? <ChartSkeleton/> : (
              <ResponsiveContainer width="100%" height={320}>
                <AreaChart data={data?.monthlyTrend||[]} margin={{top:5,right:20,left:10,bottom:5}}>
                  <defs>
                    <linearGradient id="gRev" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/><stop offset="95%" stopColor="#6366f1" stopOpacity={0}/></linearGradient>
                    <linearGradient id="gBk" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/><stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/></linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3}/>
                  <XAxis dataKey="month" tick={{fontSize:11}}/>
                  <YAxis yAxisId="left" tickFormatter={(v)=>`₹${(v/1000).toFixed(0)}k`} tick={{fontSize:11}}/>
                  <YAxis yAxisId="right" orientation="right" tick={{fontSize:11}}/>
                  <Tooltip content={<CustomTooltip/>}/>
                  <Legend/>
                  <Area yAxisId="left" type="monotone" dataKey="revenue" stroke="#6366f1" fill="url(#gRev)" name="Revenue"/>
                  <Area yAxisId="right" type="monotone" dataKey="bookings" stroke="#f59e0b" fill="url(#gBk)" name="Bookings"/>
                </AreaChart>
              </ResponsiveContainer>
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

      {/* ===== ROW 5: Booking Status Pie + City Summary Table ===== */}
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
            <CardTitle className="flex items-center gap-2 text-base"><Calendar className="h-4 w-4 text-rose-500"/> City Performance Summary</CardTitle>
            <CardDescription>Bookings, children, games &amp; revenue per city</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? <ChartSkeleton/> : (
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
                    {(data?.revenueByCity||[]).map((c,i)=>(
                      <tr key={i} className="border-b hover:bg-muted/50 transition-colors">
                        <td className="py-2 px-2 font-medium">{c.name}</td>
                        <td className="text-right py-2 px-2">{fmtNum(c.bookings||0)}</td>
                        <td className="text-right py-2 px-2 text-pink-600 font-medium">{fmtNum(c.children||0)}</td>
                        <td className="text-right py-2 px-2 text-purple-600 font-medium">{fmtNum(c.gameBookings||0)}</td>
                        <td className="text-right py-2 px-2 text-green-600 font-semibold">{fmt(c.revenue||0)}</td>
                      </tr>
                    ))}
                    {(!data?.revenueByCity?.length) && (
                      <tr><td colSpan={5} className="py-8 text-center text-muted-foreground">No data available</td></tr>
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
