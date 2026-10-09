import type React from "react"
import { Toaster } from "@/components/ui/toaster"
import AdminSidebar from "@/components/admin/admin-sidebar"
import AdminHeader from "@/components/admin/admin-header"
import AuthGuard from "@/components/auth/auth-guard"
import ResponsiveTestHelper from "@/components/admin/responsive-test-helper"

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <>
      <Toaster />
      <AuthGuard>
        <div className="flex h-screen overflow-hidden bg-background">
          <AdminSidebar />
          <div className="flex-1 flex flex-col min-w-0 h-screen">
            <AdminHeader />
            <main className="flex-1 min-h-0 overflow-y-auto">
              <div className="container mx-auto p-3 sm:p-4 lg:p-6 space-y-4 sm:space-y-6 max-w-full">
                {children}
              </div>
            </main>
          </div>
        </div>
        <ResponsiveTestHelper />
      </AuthGuard>
    </>
  )
}
