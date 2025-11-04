"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts"
import { Badge } from "@/components/ui/badge"
import { Tag, TrendingUp, TrendingUp as ArrowUpRight, TrendingDown as ArrowDownRight } from "lucide-react"
import { cn } from "@/lib/utils"

// Mock data - in a real app, this would come from an API
const topPromoCodes = [
  { id: 1, code: "WELCOME20", discount: "20%", usageCount: 245, revenue: 98000, savings: 24500, conversionRate: 68 },
  { id: 2, code: "SUMMER15", discount: "15%", usageCount: 187, revenue: 74800, savings: 13200, conversionRate: 62 },
  { id: 3, code: "FIRSTTIME", discount: "₹500 off", usageCount: 156, revenue: 62400, savings: 78000, conversionRate: 59 },
  { id: 4, code: "REFER10", discount: "10%", usageCount: 134, revenue: 53600, savings: 5950, conversionRate: 55 },
  { id: 5, code: "BIRTHDAY", discount: "25%", usageCount: 98, revenue: 39200, savings: 13067, conversionRate: 72 },
]

const monthlyPromoUsage = [
  { name: "Jan", usage: 65, savings: 16250, revenue: 26000 },
  { name: "Feb", usage: 72, savings: 18000, revenue: 28800 },
  { name: "Mar", usage: 85, savings: 21250, revenue: 34000 },
  { name: "Apr", usage: 93, savings: 23250, revenue: 37200 },
  { name: "May", usage: 112, savings: 28000, revenue: 44800 },
  { name: "Jun", usage: 135, savings: 33750, revenue: 54000 },
  { name: "Jul", usage: 148, savings: 37000, revenue: 59200 },
  { name: "Aug", usage: 162, savings: 40500, revenue: 64800 },
  { name: "Sep", usage: 143, savings: 35750, revenue: 57200 },
  { name: "Oct", usage: 128, savings: 32000, revenue: 51200 },
  { name: "Nov", usage: 105, savings: 26250, revenue: 42000 },
  { name: "Dec", usage: 92, savings: 23000, revenue: 36800 },
]

const conversionRateData = [
  { name: "Converted", value: 820, color: "#4ade80" },
  { name: "Abandoned", value: 380, color: "#f97316" },
]

export default function AdminPromoAnalytics() {
  const [timeRange, setTimeRange] = useState("year")
  
  const formatPrice = (value: number) => {
    return `₹${value.toLocaleString('en-IN')}`
  }
  
  return (
    <Card className="col-span-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle className="text-base font-medium">Promo Code Analytics</CardTitle>
          <CardDescription>Usage and impact of promotional codes</CardDescription>
        </div>
        <Tabs defaultValue={timeRange} onValueChange={setTimeRange} className="w-[400px]">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="week">Week</TabsTrigger>
            <TabsTrigger value="month">Month</TabsTrigger>
            <TabsTrigger value="quarter">Quarter</TabsTrigger>
            <TabsTrigger value="year">Year</TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>
      <CardContent className="px-2 pt-0">
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Promo Usage</CardTitle>
              <Tag className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1,340</div>
              <p className="text-xs text-muted-foreground">
                +12.5% from last {timeRange}
              </p>
              <div className="mt-4 h-[60px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyPromoUsage.slice(-6)} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                    <Bar dataKey="usage" fill="#8884d8" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Customer Savings</CardTitle>
              <Tag className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹3,35,000</div>
              <p className="text-xs text-muted-foreground">
                +8.3% from last {timeRange}
              </p>
              <div className="mt-4 h-[60px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyPromoUsage.slice(-6)} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                    <Bar dataKey="savings" fill="#f43f5e" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Promo Revenue</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹5,36,000</div>
              <p className="text-xs text-muted-foreground">
                +15.2% from last {timeRange}
              </p>
              <div className="mt-4 h-[60px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={monthlyPromoUsage.slice(-6)} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                    <Line type="monotone" dataKey="revenue" stroke="#4ade80" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground">
                <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
                <polyline points="17 6 23 6 23 12"></polyline>
              </svg>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">68.3%</div>
              <p className="text-xs text-muted-foreground">
                +3.7% from last {timeRange}
              </p>
              <div className="mt-4 h-[60px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={conversionRateData}
                      cx="50%"
                      cy="50%"
                      innerRadius={18}
                      outerRadius={30}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {conversionRateData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <Card className="col-span-1">
            <CardHeader>
              <CardTitle>Top Performing Promo Codes</CardTitle>
              <CardDescription>Most used promotional codes and their impact</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topPromoCodes.map((promo) => (
                  <div key={promo.id} className="flex items-center justify-between rounded-lg border p-3 transition-all hover:bg-muted/50">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary">
                        <Tag className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-medium">{promo.code}</p>
                        <p className="text-xs text-muted-foreground">{promo.discount} discount</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{promo.usageCount} uses</p>
                      <div className="flex items-center justify-end gap-1">
                        <p className="text-xs text-muted-foreground">
                          {promo.conversionRate}% conversion
                        </p>
                        <Badge className="ml-1 h-5 px-1.5">
                          <ArrowUpRight className="mr-1 h-3 w-3" />
                          {formatPrice(promo.revenue)}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          
          <Card className="col-span-1">
            <CardHeader>
              <CardTitle>Monthly Promo Usage vs. Savings</CardTitle>
              <CardDescription>Relationship between promo code usage and customer savings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={monthlyPromoUsage}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
                    <YAxis yAxisId="right" orientation="right" stroke="#f43f5e" />
                    <Tooltip formatter={(value, name) => {
                      if (name === "usage") return [`${value} uses`, 'Usage'];
                      if (name === "savings") return [formatPrice(value as number), 'Savings'];
                      return [value, name];
                    }} />
                    <Bar yAxisId="left" dataKey="usage" name="Usage" fill="#8884d8" radius={[4, 4, 0, 0]} />
                    <Line yAxisId="right" type="monotone" dataKey="savings" name="Savings" stroke="#f43f5e" strokeWidth={2} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      </CardContent>
    </Card>
  )
}
