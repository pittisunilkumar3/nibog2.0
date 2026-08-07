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
    <div className="nibog-public flex min-h-screen flex-col">
      <a href="#main-content" className="sr-only z-[100] rounded-md bg-white px-4 py-3 font-bold text-slate-950 focus:not-sr-only focus:fixed focus:left-3 focus:top-3">
        Skip to main content
      </a>
      <Header />
      <main id="main-content" className="flex-1">{children}</main>
      <Footer />
    </div>
  )
}
