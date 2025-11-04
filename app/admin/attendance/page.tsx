"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import AdminAttendanceAnalytics from "@/components/admin/admin-attendance-analytics"

export default function AttendanceAnalyticsPage() {
  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Attendance Analytics</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Detailed analytics for event attendance and no-shows
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button variant="outline" asChild className="touch-manipulation">
            <Link href="/admin/events">
              <span className="hidden sm:inline">View Events</span>
              <span className="sm:hidden">Events</span>
            </Link>
          </Button>
          <Button asChild className="touch-manipulation">
            <Link href="/admin/bookings">
              <span className="hidden sm:inline">View Bookings</span>
              <span className="sm:hidden">Bookings</span>
            </Link>
          </Button>
        </div>
      </div>

      <AdminAttendanceAnalytics />
    </div>
  )
}
