"use client"

import type React from "react"
import Header from "@/components/header"
import Footer from "@/components/footer"
import { ProtectedRoute } from "@/components/auth/protected-route"

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <ProtectedRoute>
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1 bg-gray-50 dark:bg-gray-900">{children}</main>
        <Footer />
      </div>
    </ProtectedRoute>
  )
}

