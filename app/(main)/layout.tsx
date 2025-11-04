import type React from "react"
import Header from "@/components/header"
import Footer from "@/components/footer"

// Force dynamic rendering - disable all caching
export const dynamic = 'force-dynamic'
export const revalidate = 0

export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  )
}
