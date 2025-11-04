"use client"

import { useState, useEffect } from "react"
import { useTheme } from "next-themes"
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  Line,
  LineChart,
  ComposedChart
} from "recharts"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { BarChart3, TrendingUp, Calendar } from "lucide-react"
import { getRevenueData, RevenueData, DashboardMetrics } from "@/services/dashboardService"
import { SkeletonChart } from "@/components/ui/skeleton-loader"

interface AdminOverviewChartProps {
  metrics?: DashboardMetrics | null
}

// Enhanced mock data with more metrics
const data = [
  {
    name: "Jan",
    revenue: 180000,
    bookings: 100,
    events: 8,
    avgTicketPrice: 1800,
  },
  {
    name: "Feb",
    revenue: 250000,
    bookings: 140,
    events: 10,
    avgTicketPrice: 1786,
  },
  {
    name: "Mar",
    revenue: 320000,
    bookings: 180,
    events: 12,
    avgTicketPrice: 1778,
  },
  {
    name: "Apr",
    revenue: 450000,
    bookings: 250,
    events: 15,
    avgTicketPrice: 1800,
  },
  {
    name: "May",
    revenue: 520000,
    bookings: 290,
    events: 16,
    avgTicketPrice: 1793,
  },
  {
    name: "Jun",
    revenue: 610000,
    bookings: 340,
    events: 18,
    avgTicketPrice: 1794,
  },
  {
    name: "Jul",
    revenue: 680000,
    bookings: 380,
    events: 20,
    avgTicketPrice: 1789,
  },
  {
    name: "Aug",
    revenue: 720000,
    bookings: 400,
    events: 22,
    avgTicketPrice: 1800,
  },
]

type ChartType = 'bar' | 'line' | 'combined'
type TimeRange = '3m' | '6m' | '12m'

export default function AdminOverviewChart({ metrics }: AdminOverviewChartProps) {
  const { theme } = useTheme()
  const [chartType, setChartType] = useState<ChartType>('combined')
  const [timeRange, setTimeRange] = useState<TimeRange>('6m')
  const [revenueData, setRevenueData] = useState<RevenueData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchRevenueData = async () => {
      try {
        setIsLoading(true)
        setError(null)
        const data = await getRevenueData()
        setRevenueData(data)
      } catch (error: any) {
        console.error('Error fetching revenue data:', error)
        setError(error.message || 'Failed to load revenue data')
      } finally {
        setIsLoading(false)
      }
    }

    fetchRevenueData()
  }, [])

  const getFilteredData = () => {
    const months = timeRange === '3m' ? 3 : timeRange === '6m' ? 6 : 12
    const dataToUse = revenueData.length > 0 ? revenueData : data
    return dataToUse.slice(-months)
  }

  const filteredData = getFilteredData()

  if (isLoading) {
    return <SkeletonChart />
  }

  if (error) {
    return (
      <div className="h-[300px] flex items-center justify-center text-muted-foreground">
        <div className="text-center">
          <p className="text-destructive mb-2">Failed to load chart data</p>
          <p className="text-sm">{error}</p>
        </div>
      </div>
    )
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
          <p className="font-medium mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center gap-2 text-sm">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-muted-foreground">{entry.name}:</span>
              <span className="font-medium">
                {entry.name === 'revenue' ? `₹${entry.value.toLocaleString()}` : entry.value}
              </span>
            </div>
          ))}
        </div>
      )
    }
    return null
  }

  const renderChart = () => {
    const commonProps = {
      data: filteredData,
      margin: { top: 20, right: 30, left: 20, bottom: 5 }
    }

    switch (chartType) {
      case 'bar':
        return (
          <BarChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis
              dataKey="name"
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `₹${value / 1000}k`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Bar
              dataKey="revenue"
              fill="hsl(var(--primary))"
              radius={[4, 4, 0, 0]}
              name="Revenue"
            />
          </BarChart>
        )

      case 'line':
        return (
          <LineChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis
              dataKey="name"
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `₹${value / 1000}k`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Line
              type="monotone"
              dataKey="revenue"
              stroke="hsl(var(--primary))"
              strokeWidth={3}
              dot={{ fill: "hsl(var(--primary))", strokeWidth: 2, r: 4 }}
              name="Revenue"
            />
          </LineChart>
        )

      default:
        return (
          <ComposedChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis
              dataKey="name"
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              yAxisId="left"
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `₹${value / 1000}k`}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Bar
              yAxisId="left"
              dataKey="revenue"
              fill="hsl(var(--primary))"
              radius={[4, 4, 0, 0]}
              name="Revenue"
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="bookings"
              stroke="hsl(var(--chart-2))"
              strokeWidth={3}
              dot={{ fill: "hsl(var(--chart-2))", strokeWidth: 2, r: 4 }}
              name="Bookings"
            />
          </ComposedChart>
        )
    }
  }

  return (
    <div className="space-y-4">
      {/* Chart Controls */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Chart Type:</span>
          </div>
          <Select value={chartType} onValueChange={(value: ChartType) => setChartType(value)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="bar">Bar Chart</SelectItem>
              <SelectItem value="line">Line Chart</SelectItem>
              <SelectItem value="combined">Combined</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Period:</span>
          </div>
          <div className="flex items-center gap-1">
            {(['3m', '6m', '12m'] as TimeRange[]).map((range) => (
              <Button
                key={range}
                variant={timeRange === range ? "default" : "outline"}
                size="sm"
                onClick={() => setTimeRange(range)}
              >
                {range === '3m' ? '3 Months' : range === '6m' ? '6 Months' : '1 Year'}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          {renderChart()}
        </ResponsiveContainer>
      </div>

      {/* Chart Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t">
        <div className="text-center">
          <div className="text-2xl font-bold text-primary">
            ₹{filteredData.reduce((sum, item) => sum + item.revenue, 0).toLocaleString()}
          </div>
          <div className="text-sm text-muted-foreground">Total Revenue</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-chart-2">
            {filteredData.reduce((sum, item) => sum + item.bookings, 0)}
          </div>
          <div className="text-sm text-muted-foreground">Total Bookings</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-chart-3">
            {filteredData.reduce((sum, item) => sum + item.events, 0)}
          </div>
          <div className="text-sm text-muted-foreground">Events Held</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-chart-4">
            ₹{Math.round(filteredData.reduce((sum, item) => sum + item.avgTicketPrice, 0) / filteredData.length)}
          </div>
          <div className="text-sm text-muted-foreground">Avg. Ticket Price</div>
        </div>
      </div>
    </div>
  )
}
