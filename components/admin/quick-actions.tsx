"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Plus,
  Calendar,
  Users,
  Mail,
  FileText,
  Settings,
  Download,
  Upload,
  QrCode,
  CreditCard,
  MapPin,
  Tag,
  Package,
  Star,
  BarChart3,
  Clock,
  Activity
} from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { getRecentActivity, RecentActivity, DashboardMetrics } from "@/services/dashboardService"

interface QuickActionsProps {
  metrics?: DashboardMetrics | null
}

interface QuickAction {
  title: string
  description: string
  icon: React.ReactNode
  href: string
  color?: 'default' | 'primary' | 'success' | 'warning' | 'danger'
  badge?: string
  external?: boolean
}

const quickActions: QuickAction[] = [
  {
    title: "Create Event",
    description: "Schedule a new NIBOG event",
    icon: <Calendar className="h-5 w-5" />,
    href: "/admin/events/new",
    color: "primary",
  },
  {
    title: "Add User",
    description: "Register a new user account",
    icon: <Users className="h-5 w-5" />,
    href: "/admin/users/new",
    color: "success",
  },
  {
    title: "Send Email",
    description: "Send bulk email to users",
    icon: <Mail className="h-5 w-5" />,
    href: "/admin/email",
    color: "default",
  },
  {
    title: "Generate Reports",
    description: "Create analytics reports",
    icon: <FileText className="h-5 w-5" />,
    href: "/admin/reports",
    color: "default",
  },
  {
    title: "QR Scanner",
    description: "Scan attendance QR codes",
    icon: <QrCode className="h-5 w-5" />,
    href: "/admin/attendance",
    color: "warning",
    badge: "Live",
  },
  {
    title: "Payment Records",
    description: "View payment transactions",
    icon: <CreditCard className="h-5 w-5" />,
    href: "/admin/payments",
    color: "default",
  },
]

const recentActivities = [
  {
    title: "New booking received",
    description: "Baby Crawling event in Mumbai",
    time: "2 minutes ago",
    type: "booking",
  },
  {
    title: "Payment confirmed",
    description: "₹1,800 from Priya Sharma",
    time: "5 minutes ago",
    type: "payment",
  },
  {
    title: "Event capacity reached",
    description: "Running Race in Delhi is full",
    time: "15 minutes ago",
    type: "event",
  },
  {
    title: "New testimonial",
    description: "5-star review from Rajesh Kumar",
    time: "1 hour ago",
    type: "review",
  },
]

const colorVariants = {
  default: "hover:bg-muted/50 border-border",
  primary: "hover:bg-primary/5 border-primary/20 hover:border-primary/40",
  success: "hover:bg-green-50 border-green-200 hover:border-green-300 dark:hover:bg-green-950/20 dark:border-green-800",
  warning: "hover:bg-yellow-50 border-yellow-200 hover:border-yellow-300 dark:hover:bg-yellow-950/20 dark:border-yellow-800",
  danger: "hover:bg-red-50 border-red-200 hover:border-red-300 dark:hover:bg-red-950/20 dark:border-red-800",
}

export default function QuickActions({ metrics }: QuickActionsProps) {
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchRecentActivity = async () => {
      try {
        setIsLoading(true)
        const activities = await getRecentActivity()
        setRecentActivity(activities)
      } catch (error) {
        console.error('Error fetching recent activity:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchRecentActivity()
  }, [])
  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {/* Quick Actions */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {quickActions.map((action, index) => (
              <Link key={index} href={action.href}>
                <div
                  className={cn(
                    "group relative flex flex-col items-center gap-3 rounded-lg border p-4 text-center transition-all duration-200 hover:shadow-md",
                    colorVariants[action.color || 'default']
                  )}
                >
                  <div className="flex items-center justify-center rounded-full bg-muted p-3 group-hover:scale-110 transition-transform">
                    {action.icon}
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-medium text-sm">{action.title}</h3>
                    <p className="text-xs text-muted-foreground">
                      {action.description}
                    </p>
                  </div>
                  {action.badge && (
                    <Badge variant="secondary" className="absolute -top-2 -right-2 text-xs">
                      {action.badge}
                    </Badge>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, index) => (
                  <div key={index} className="flex items-start gap-3 pb-3">
                    <div className="w-2 h-2 rounded-full bg-muted animate-pulse mt-1" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3 bg-muted rounded animate-pulse" />
                      <div className="h-2 bg-muted rounded animate-pulse w-3/4" />
                    </div>
                  </div>
                ))}
              </div>
            ) : recentActivity.length > 0 ? (
              recentActivity.map((activity, index) => (
                <div key={activity.id} className="flex items-start gap-3 pb-3 last:pb-0 border-b last:border-0">
                  <div className="flex-shrink-0 mt-1">
                    {activity.type === 'booking' && (
                      <div className="w-2 h-2 rounded-full bg-blue-500" />
                    )}
                    {activity.type === 'payment' && (
                      <div className="w-2 h-2 rounded-full bg-green-500" />
                    )}
                    {activity.type === 'user' && (
                      <div className="w-2 h-2 rounded-full bg-purple-500" />
                    )}
                    {activity.type === 'event' && (
                      <div className="w-2 h-2 rounded-full bg-yellow-500" />
                    )}
                    {activity.type === 'system' && (
                      <div className="w-2 h-2 rounded-full bg-gray-500" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{activity.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {activity.description}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {activity.timestamp.toLocaleString()}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-4 text-muted-foreground">
                <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No recent activity</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
