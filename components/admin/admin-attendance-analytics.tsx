"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts"
import { Badge } from "@/components/ui/badge"
import { Users, UserCheck, X as UserX, Clock } from "lucide-react"
import { cn } from "@/lib/utils"

// Mock data - in a real app, this would come from an API
const attendanceByEvent = [
  { id: 1, name: "Baby Sensory Play", venue: "Kids Paradise, Hyderabad", date: "Oct 26, 2025", registered: 45, attended: 42, noShow: 3, attendanceRate: 93 },
  { id: 2, name: "Baby Crawling Competition", venue: "Little Stars, Mumbai", date: "Oct 18, 2025", registered: 38, attended: 35, noShow: 3, attendanceRate: 92 },
  { id: 3, name: "Baby Walker Race", venue: "Tiny Tots, Bangalore", date: "Oct 12, 2025", registered: 42, attended: 37, noShow: 5, attendanceRate: 88 },
  { id: 4, name: "Baby Swimming", venue: "Aqua Babies, Chennai", date: "Oct 5, 2025", registered: 30, attended: 28, noShow: 2, attendanceRate: 93 },
  { id: 5, name: "Baby Art & Craft", venue: "Creative Kids, Delhi", date: "Sep 28, 2025", registered: 35, attended: 31, noShow: 4, attendanceRate: 89 },
]

const attendanceByCity = [
  { name: "Hyderabad", registered: 120, attended: 112, attendanceRate: 93 },
  { name: "Mumbai", registered: 105, attended: 96, attendanceRate: 91 },
  { name: "Bangalore", registered: 95, attended: 85, attendanceRate: 89 },
  { name: "Chennai", registered: 80, attended: 74, attendanceRate: 93 },
  { name: "Delhi", registered: 110, attended: 98, attendanceRate: 89 },
  { name: "Pune", registered: 75, attended: 68, attendanceRate: 91 },
  { name: "Kolkata", registered: 65, attended: 58, attendanceRate: 89 },
]

const attendanceByTime = [
  { name: "9:00 AM", registered: 45, attended: 42, attendanceRate: 93 },
  { name: "11:00 AM", registered: 50, attended: 47, attendanceRate: 94 },
  { name: "1:00 PM", registered: 40, attended: 35, attendanceRate: 88 },
  { name: "3:00 PM", registered: 35, attended: 30, attendanceRate: 86 },
  { name: "5:00 PM", registered: 30, attended: 26, attendanceRate: 87 },
]

const attendanceByAge = [
  { name: "6-12 months", registered: 120, attended: 110, attendanceRate: 92 },
  { name: "13-18 months", registered: 150, attended: 138, attendanceRate: 92 },
  { name: "19-24 months", registered: 130, attended: 118, attendanceRate: 91 },
  { name: "25-36 months", registered: 100, attended: 87, attendanceRate: 87 },
]

const attendanceOverTime = [
  { month: "Jan", registered: 65, attended: 58, attendanceRate: 89 },
  { month: "Feb", registered: 72, attended: 65, attendanceRate: 90 },
  { month: "Mar", registered: 85, attended: 78, attendanceRate: 92 },
  { month: "Apr", registered: 93, attended: 86, attendanceRate: 92 },
  { month: "May", registered: 112, attended: 104, attendanceRate: 93 },
  { month: "Jun", registered: 135, attended: 126, attendanceRate: 93 },
  { month: "Jul", registered: 148, attended: 139, attendanceRate: 94 },
  { month: "Aug", registered: 162, attended: 152, attendanceRate: 94 },
  { month: "Sep", registered: 143, attended: 133, attendanceRate: 93 },
  { month: "Oct", registered: 128, attended: 118, attendanceRate: 92 },
  { month: "Nov", registered: 105, attended: 96, attendanceRate: 91 },
  { month: "Dec", registered: 92, attended: 83, attendanceRate: 90 },
]

const COLORS = ["#4ade80", "#f97316", "#8884d8", "#82ca9d", "#ffc658", "#ff8042", "#0088fe"]

export default function AdminAttendanceAnalytics() {
  const [timeRange, setTimeRange] = useState("year")
  
  return (
    <Card className="col-span-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle className="text-base font-medium">Attendance Analytics</CardTitle>
          <CardDescription>Attendance statistics and trends for NIBOG events</CardDescription>
        </div>
        <Tabs defaultValue={timeRange} onValueChange={setTimeRange} className="w-full sm:w-[400px]">
          <TabsList className="grid w-full grid-cols-4 h-auto">
            <TabsTrigger value="week" className="text-xs sm:text-sm touch-manipulation">Week</TabsTrigger>
            <TabsTrigger value="month" className="text-xs sm:text-sm touch-manipulation">Month</TabsTrigger>
            <TabsTrigger value="quarter" className="text-xs sm:text-sm touch-manipulation">
              <span className="hidden sm:inline">Quarter</span>
              <span className="sm:hidden">Q</span>
            </TabsTrigger>
            <TabsTrigger value="year" className="text-xs sm:text-sm touch-manipulation">Year</TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>
      <CardContent className="px-2 pt-0">
        <div className="mt-4 grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="touch-manipulation">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium">Total Registrations</CardTitle>
              <Users className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="p-3 sm:p-6">
              <div className="text-xl sm:text-2xl font-bold">1,340</div>
              <p className="text-xs text-muted-foreground">
                +12.5% from last {timeRange}
              </p>
              <div className="mt-2 sm:mt-4 h-[40px] sm:h-[60px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={attendanceOverTime.slice(-6)} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                    <Bar dataKey="registered" fill="#8884d8" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          <Card className="touch-manipulation">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium">Attendance</CardTitle>
              <UserCheck className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="p-3 sm:p-6">
              <div className="text-xl sm:text-2xl font-bold">1,238</div>
              <p className="text-xs text-muted-foreground">
                +14.2% from last {timeRange}
              </p>
              <div className="mt-2 sm:mt-4 h-[40px] sm:h-[60px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={attendanceOverTime.slice(-6)} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                    <Bar dataKey="attended" fill="#4ade80" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          <Card className="touch-manipulation">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium">No-Shows</CardTitle>
              <UserX className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="p-3 sm:p-6">
              <div className="text-xl sm:text-2xl font-bold">102</div>
              <p className="text-xs text-muted-foreground">
                -3.8% from last {timeRange}
              </p>
              <div className="mt-2 sm:mt-4 h-[40px] sm:h-[60px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={attendanceOverTime.slice(-6)} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                    <Bar dataKey={(data) => data.registered - data.attended} fill="#f97316" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          <Card className="touch-manipulation">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium">Attendance Rate</CardTitle>
              <Clock className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="p-3 sm:p-6">
              <div className="text-xl sm:text-2xl font-bold">92.4%</div>
              <p className="text-xs text-muted-foreground">
                +1.7% from last {timeRange}
              </p>
              <div className="mt-2 sm:mt-4 h-[40px] sm:h-[60px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={attendanceOverTime.slice(-6)} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                    <Bar dataKey="attendanceRate" fill="#8884d8" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="mt-4 sm:mt-6 grid gap-3 sm:gap-4 grid-cols-1 md:grid-cols-2">
          <Card className="col-span-1 touch-manipulation">
            <CardHeader className="p-3 sm:p-6">
              <CardTitle className="text-sm sm:text-base">Recent Event Attendance</CardTitle>
              <CardDescription className="text-xs sm:text-sm">Attendance statistics for recent events</CardDescription>
            </CardHeader>
            <CardContent className="p-3 sm:p-6 pt-0">
              <div className="space-y-3 sm:space-y-4">
                {attendanceByEvent.map((event) => (
                  <div key={event.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between rounded-lg border p-3 transition-all hover:bg-muted/50 touch-manipulation gap-2 sm:gap-4">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm sm:text-base truncate">{event.name}</p>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <span className="truncate">{event.venue}</span>
                        <span>•</span>
                        <span>{event.date}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-4">
                      <div className="text-center">
                        <p className="text-xs sm:text-sm font-medium">{event.registered}</p>
                        <p className="text-xs text-muted-foreground">Registered</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs sm:text-sm font-medium">{event.attended}</p>
                        <p className="text-xs text-muted-foreground">Attended</p>
                      </div>
                      <div className="text-center">
                        <Badge variant={event.attendanceRate >= 90 ? "default" : event.attendanceRate >= 80 ? "secondary" : "outline"}>
                          {event.attendanceRate}%
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          
          <Card className="col-span-1 touch-manipulation">
            <CardHeader className="p-3 sm:p-6">
              <CardTitle className="text-sm sm:text-base">Attendance by City</CardTitle>
              <CardDescription className="text-xs sm:text-sm">Comparison of attendance rates across cities</CardDescription>
            </CardHeader>
            <CardContent className="p-3 sm:p-6 pt-0">
              <div className="h-[250px] sm:h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={attendanceByCity}
                    margin={{ top: 20, right: 10, left: 10, bottom: 5 }}
                    layout="vertical"
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" width={60} fontSize={12} />
                    <Tooltip formatter={(value, name) => {
                      if (name === "registered") return [`${value} registrations`, 'Registered'];
                      if (name === "attended") return [`${value} attendees`, 'Attended'];
                      if (name === "attendanceRate") return [`${value}%`, 'Attendance Rate'];
                      return [value, name];
                    }} />
                    <Legend />
                    <Bar dataKey="registered" name="Registered" fill="#8884d8" radius={[0, 4, 4, 0]} />
                    <Bar dataKey="attended" name="Attended" fill="#4ade80" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="mt-4 sm:mt-6 grid gap-3 sm:gap-4 grid-cols-1 md:grid-cols-2">
          <Card className="col-span-1 touch-manipulation">
            <CardHeader className="p-3 sm:p-6">
              <CardTitle className="text-sm sm:text-base">Attendance by Time Slot</CardTitle>
              <CardDescription className="text-xs sm:text-sm">Attendance patterns across different time slots</CardDescription>
            </CardHeader>
            <CardContent className="p-3 sm:p-6 pt-0">
              <div className="h-[250px] sm:h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={attendanceByTime}
                    margin={{ top: 20, right: 10, left: 10, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" fontSize={12} />
                    <YAxis fontSize={12} />
                    <Tooltip formatter={(value, name) => {
                      if (name === "registered") return [`${value} registrations`, 'Registered'];
                      if (name === "attended") return [`${value} attendees`, 'Attended'];
                      if (name === "attendanceRate") return [`${value}%`, 'Attendance Rate'];
                      return [value, name];
                    }} />
                    <Legend />
                    <Bar dataKey="registered" name="Registered" fill="#8884d8" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="attended" name="Attended" fill="#4ade80" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="col-span-1 touch-manipulation">
            <CardHeader className="p-3 sm:p-6">
              <CardTitle className="text-sm sm:text-base">Attendance by Age Group</CardTitle>
              <CardDescription className="text-xs sm:text-sm">Attendance patterns across different age groups</CardDescription>
            </CardHeader>
            <CardContent className="p-3 sm:p-6 pt-0">
              <div className="h-[250px] sm:h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={attendanceByAge}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="attended"
                      nameKey="name"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {attendanceByAge.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value, name, props) => {
                      const item = attendanceByAge.find(item => item.name === props.payload.name);
                      return [`${value} attendees (${item?.attendanceRate}% rate)`, props.payload.name];
                    }} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      </CardContent>
    </Card>
  )
}
