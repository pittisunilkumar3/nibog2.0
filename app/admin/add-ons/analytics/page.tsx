"use client"

import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import AdminAddonAnalytics from "@/components/admin/admin-addon-analytics"

export default function AddOnAnalyticsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" asChild>
            <Link href="/admin/add-ons">
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Back</span>
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Add-on Analytics</h1>
            <p className="text-muted-foreground">
              Detailed analytics for add-on products and sales
            </p>
          </div>
        </div>
      </div>
      
      <AdminAddonAnalytics />
    </div>
  )
}
