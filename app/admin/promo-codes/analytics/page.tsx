"use client"

import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import AdminPromoAnalytics from "@/components/admin/admin-promo-analytics"

export default function PromoCodeAnalyticsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" asChild>
            <Link href="/admin/promo-codes">
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Back</span>
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Promo Code Analytics</h1>
            <p className="text-muted-foreground">
              Detailed analytics for promotional code usage and impact
            </p>
          </div>
        </div>
      </div>
      
      <AdminPromoAnalytics />
    </div>
  )
}
