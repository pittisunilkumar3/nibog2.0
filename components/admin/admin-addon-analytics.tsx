"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts"
import { Badge } from "@/components/ui/badge"
import { Package, TrendingUp, TrendingUp as ArrowUpRight, TrendingDown as ArrowDownRight } from "lucide-react"
import { cn } from "@/lib/utils"

// Mock data - in a real app, this would come from an API
const topSellingAddons = [
  { id: 1, name: "NIBOG T-Shirt", category: "Apparel", totalSold: 145, revenue: 72355, percentChange: 12 },
  { id: 2, name: "Meal Pack", category: "Food", totalSold: 132, revenue: 39468, percentChange: 8 },
  { id: 3, name: "NIBOG Cap", category: "Apparel", totalSold: 98, revenue: 24402, percentChange: -3 },
  { id: 4, name: "Photo Package", category: "Memorabilia", totalSold: 87, revenue: 43413, percentChange: 15 },
  { id: 5, name: "Baby Shoes", category: "Apparel", totalSold: 76, revenue: 45524, percentChange: 5 },
]

const addonCategoryData = [
  { name: "Apparel", value: 319, color: "#8884d8" },
  { name: "Food", value: 132, color: "#82ca9d" },
  { name: "Memorabilia", value: 87, color: "#ffc658" },
  { name: "Toys", value: 42, color: "#ff8042" },
  { name: "Other", value: 23, color: "#0088fe" },
]

const monthlyAddonSales = [
  { name: "Jan", sales: 45, revenue: 22455 },
  { name: "Feb", sales: 52, revenue: 25890 },
  { name: "Mar", sales: 61, revenue: 30378 },
  { name: "Apr", sales: 78, revenue: 38844 },
  { name: "May", sales: 94, revenue: 46812 },
  { name: "Jun", sales: 112, revenue: 55776 },
  { name: "Jul", sales: 128, revenue: 63744 },
  { name: "Aug", sales: 143, revenue: 71214 },
  { name: "Sep", sales: 129, revenue: 64242 },
  { name: "Oct", sales: 118, revenue: 58764 },
  { name: "Nov", sales: 99, revenue: 49302 },
  { name: "Dec", sales: 87, revenue: 43326 },
]

const collectionRateData = [
  { name: "Collected", value: 538, color: "#4ade80" },
  { name: "Pending", value: 165, color: "#f97316" },
]

export default function AdminAddonAnalytics() {
  const [timeRange, setTimeRange] = useState("year")
  
  const formatPrice = (value: number) => {
    return `₹${value.toLocaleString('en-IN')}`
  }
  
  return (
    <Card className="col-span-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle className="text-base font-medium">Add-on Analytics</CardTitle>
          <CardDescription>Sales and revenue from add-on products</CardDescription>
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
              <CardTitle className="text-sm font-medium">Total Add-on Sales</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">603</div>
              <p className="text-xs text-muted-foreground">
                +8.2% from last {timeRange}
              </p>
              <div className="mt-4 h-[60px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyAddonSales.slice(-6)} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                    <Bar dataKey="sales" fill="#8884d8" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Add-on Revenue</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹3,01,747</div>
              <p className="text-xs text-muted-foreground">
                +12.5% from last {timeRange}
              </p>
              <div className="mt-4 h-[60px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyAddonSales.slice(-6)} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                    <Bar dataKey="revenue" fill="#4ade80" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Collection Rate</CardTitle>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">76.5%</div>
              <p className="text-xs text-muted-foreground">
                +2.3% from last {timeRange}
              </p>
              <div className="mt-4 h-[60px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={collectionRateData}
                      cx="50%"
                      cy="50%"
                      innerRadius={18}
                      outerRadius={30}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {collectionRateData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Top Category</CardTitle>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground">
                <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path>
                <line x1="7" y1="7" x2="7.01" y2="7"></line>
              </svg>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Apparel</div>
              <p className="text-xs text-muted-foreground">
                52.9% of total sales
              </p>
              <div className="mt-4 h-[60px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={addonCategoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={18}
                      outerRadius={30}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {addonCategoryData.map((entry, index) => (
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
              <CardTitle>Top Selling Add-ons</CardTitle>
              <CardDescription>Best performing add-on products by sales volume</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topSellingAddons.map((addon) => (
                  <div key={addon.id} className="flex items-center justify-between rounded-lg border p-3 transition-all hover:bg-muted/50">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "flex h-9 w-9 items-center justify-center rounded-full",
                        addon.category === "Apparel" && "bg-purple-100 text-purple-700",
                        addon.category === "Food" && "bg-green-100 text-green-700",
                        addon.category === "Memorabilia" && "bg-yellow-100 text-yellow-700",
                        addon.category === "Toys" && "bg-orange-100 text-orange-700",
                        addon.category === "Other" && "bg-blue-100 text-blue-700",
                      )}>
                        <Package className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-medium">{addon.name}</p>
                        <p className="text-xs text-muted-foreground">{addon.category}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{addon.totalSold} sold</p>
                      <div className="flex items-center justify-end gap-1">
                        <p className="text-xs text-muted-foreground">{formatPrice(addon.revenue)}</p>
                        <Badge variant={addon.percentChange >= 0 ? "default" : "destructive"} className="ml-1 h-5 px-1.5">
                          {addon.percentChange >= 0 ? (
                            <ArrowUpRight className="mr-1 h-3 w-3" />
                          ) : (
                            <ArrowDownRight className="mr-1 h-3 w-3" />
                          )}
                          {Math.abs(addon.percentChange)}%
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
              <CardTitle>Add-on Sales by Category</CardTitle>
              <CardDescription>Distribution of add-on sales across categories</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={addonCategoryData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {addonCategoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value} items`, 'Sales']} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Monthly Add-on Sales Trend</CardTitle>
              <CardDescription>Sales volume and revenue over the past year</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={monthlyAddonSales}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
                    <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
                    <Tooltip formatter={(value, name) => {
                      if (name === "sales") return [`${value} items`, 'Sales'];
                      if (name === "revenue") return [formatPrice(value as number), 'Revenue'];
                      return [value, name];
                    }} />
                    <Legend />
                    <Bar yAxisId="left" dataKey="sales" name="Sales" fill="#8884d8" radius={[4, 4, 0, 0]} />
                    <Bar yAxisId="right" dataKey="revenue" name="Revenue" fill="#82ca9d" radius={[4, 4, 0, 0]} />
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
