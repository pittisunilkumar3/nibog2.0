"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  BarChart3, 
  CreditCard, 
  Users, 
  Calendar, 
  MapPin, 
  Building2,
  FileText,
  Download,
  TrendingUp,
  Activity
} from "lucide-react"
import { PageTransition, FadeIn } from "@/components/ui/animated-components"

interface ReportCard {
  title: string
  description: string
  icon: React.ReactNode
  href: string
  color: string
  stats?: {
    label: string
    value: string
  }
}

export default function ReportsPage() {
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simulate loading time for smooth transition
    const timer = setTimeout(() => setIsLoading(false), 500)
    return () => clearTimeout(timer)
  }, [])

  const reportCards: ReportCard[] = [
    {
      title: "Payment Reports",
      description: "Comprehensive payment analytics, transaction history, and revenue insights",
      icon: <CreditCard className="h-6 w-6" />,
      href: "/admin/reports/payments",
      color: "bg-green-500",
      stats: {
        label: "Total Revenue",
        value: "₹0" // This would be fetched from API
      }
    },
    {
      title: "User Reports",
      description: "User registration trends, demographics, and engagement metrics",
      icon: <Users className="h-6 w-6" />,
      href: "/admin/users?export=true",
      color: "bg-blue-500",
      stats: {
        label: "Total Users",
        value: "0" // This would be fetched from API
      }
    },
    {
      title: "Event Reports",
      description: "Event performance, attendance rates, and booking analytics",
      icon: <Calendar className="h-6 w-6" />,
      href: "/admin/events?export=true",
      color: "bg-purple-500",
      stats: {
        label: "Total Events",
        value: "0" // This would be fetched from API
      }
    },
    {
      title: "Booking Reports",
      description: "Booking trends, conversion rates, and customer behavior analysis",
      icon: <FileText className="h-6 w-6" />,
      href: "/admin/bookings?export=true",
      color: "bg-orange-500",
      stats: {
        label: "Total Bookings",
        value: "0" // This would be fetched from API
      }
    },
    {
      title: "Venue Reports",
      description: "Venue utilization, capacity analysis, and location performance",
      icon: <Building2 className="h-6 w-6" />,
      href: "/admin/venues?export=true",
      color: "bg-indigo-500",
      stats: {
        label: "Active Venues",
        value: "0" // This would be fetched from API
      }
    },
    {
      title: "City Reports",
      description: "Geographic distribution, city-wise performance, and regional insights",
      icon: <MapPin className="h-6 w-6" />,
      href: "/admin/cities?export=true",
      color: "bg-teal-500",
      stats: {
        label: "Active Cities",
        value: "0" // This would be fetched from API
      }
    }
  ]

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="h-8 w-48 bg-muted animate-pulse rounded" />
            <div className="h-4 w-64 bg-muted animate-pulse rounded mt-2" />
          </div>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-6 w-32 bg-muted rounded" />
                <div className="h-4 w-full bg-muted rounded" />
              </CardHeader>
              <CardContent>
                <div className="h-4 w-24 bg-muted rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <PageTransition>
      <div className="mobile-space-y">
        <FadeIn>
          <div className="flex flex-col gap-3 sm:gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="mobile-text-xl font-bold tracking-tight">Reports & Analytics</h1>
              <p className="text-muted-foreground mobile-text-sm">
                Comprehensive data reports and export functionality for all NIBOG admin data
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" asChild className="mobile-button">
                <Link href="/admin">
                  <Activity className="mr-2 h-4 w-4" />
                  Dashboard
                </Link>
              </Button>
            </div>
          </div>
        </FadeIn>

        <FadeIn delay={0.1}>
          <div className="mobile-grid-1 mobile-gap">
            {reportCards.map((card, index) => (
              <Card
                key={card.title}
                className="mobile-card group hover:shadow-lg transition-all duration-200 cursor-pointer touch-manipulation"
                onClick={() => window.location.href = card.href}
              >
                <CardHeader className="mobile-card-header pb-3">
                  <div className="flex items-center justify-between">
                    <div className={`p-2 rounded-lg ${card.color} text-white`}>
                      {card.icon}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      asChild
                      className="mobile-button-sm opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
                    >
                      <Link href={card.href}>
                        <Download className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                  <CardTitle className="mobile-text-lg">{card.title}</CardTitle>
                  <CardDescription className="mobile-text-sm">
                    {card.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="mobile-card-content">
                  {card.stats && (
                    <div className="flex items-center justify-between">
                      <span className="mobile-text-sm text-muted-foreground">
                        {card.stats.label}
                      </span>
                      <span className="font-semibold mobile-text-sm">
                        {card.stats.value}
                      </span>
                    </div>
                  )}
                  <div className="mt-3 flex items-center mobile-text-sm text-muted-foreground">
                    <TrendingUp className="mr-1 h-3 w-3" />
                    Click to view detailed reports
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </FadeIn>

        <FadeIn delay={0.2}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Export Capabilities
              </CardTitle>
              <CardDescription>
                All reports support multiple export formats for comprehensive data analysis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                  <div className="p-2 rounded bg-green-100 text-green-600">
                    <FileText className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="font-medium">CSV Export</div>
                    <div className="text-sm text-muted-foreground">
                      Spreadsheet-compatible format
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                  <div className="p-2 rounded bg-red-100 text-red-600">
                    <FileText className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="font-medium">PDF Export</div>
                    <div className="text-sm text-muted-foreground">
                      Professional formatted reports
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                  <div className="p-2 rounded bg-blue-100 text-blue-600">
                    <FileText className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="font-medium">Excel Export</div>
                    <div className="text-sm text-muted-foreground">
                      Advanced spreadsheet features
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </FadeIn>
      </div>
    </PageTransition>
  )
}
