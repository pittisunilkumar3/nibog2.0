"use client"

import { ArrowRight, CalendarDays, LogOut, Menu, UserRound } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"

import { useAuth } from "@/contexts/auth-context"
import { cn } from "@/lib/utils"
import { ModeToggle } from "./mode-toggle"
import { NibogLogo } from "./nibog-logo"
import { Button } from "./ui/button"
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet"

const routes = [
  { href: "/", label: "Home" },
  { href: "/events", label: "Events" },
  { href: "/baby-one", label: "NIBOG Games" },
  { href: "/register-event", label: "Register Event" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
]

function isRouteActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/"
  return pathname === href || pathname.startsWith(`${href}/`)
}

export default function Header() {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()
  const { isAuthenticated, logout } = useAuth()

  const closeMenu = () => setIsOpen(false)
  const handleLogout = () => {
    closeMenu()
    logout()
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-orange-100/90 bg-[#fffaf3]/95 shadow-[0_8px_30px_-24px_rgba(51,32,20,0.55)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/92">
      <div className="container flex h-[4.75rem] items-center justify-between px-4 sm:px-6 xl:h-[5.5rem]">
        <Link
          href="/"
          className="flex min-h-11 items-center rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
          aria-label="NIBOG home"
        >
          <NibogLogo className="h-14 w-auto" />
        </Link>

        <nav className="hidden items-center gap-1 xl:flex" aria-label="Primary navigation">
          {routes.map((route) => {
            const active = isRouteActive(pathname, route.href)
            return (
              <Link
                key={route.href}
                href={route.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex min-h-11 items-center rounded-full px-3.5 text-sm font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500",
                  active
                    ? "bg-[#ef5f52] text-white shadow-sm"
                    : "text-slate-700 hover:bg-orange-50 hover:text-slate-950 dark:text-slate-200 dark:hover:bg-white/10 dark:hover:text-white",
                )}
              >
                {route.label}
              </Link>
            )
          })}
        </nav>

        <div className="flex items-center gap-1.5">
          <div className="hidden items-center gap-2 xl:flex">
            <ModeToggle />
            {isAuthenticated ? (
              <Button asChild variant="outline" className="h-11 rounded-full px-5 font-bold">
                <Link href="/dashboard">My account</Link>
              </Button>
            ) : (
              <>
                <Button asChild variant="ghost" className="h-11 rounded-full px-4 font-bold">
                  <Link href="/login">Login</Link>
                </Button>
                <Button asChild className="h-11 rounded-full bg-[#ef5f52] px-5 font-black text-white hover:bg-[#dc4e43]">
                  <Link href="/register">Sign up</Link>
                </Button>
              </>
            )}
          </div>

          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                className="h-11 w-11 touch-manipulation rounded-xl p-0 xl:hidden"
                aria-label={isOpen ? "Close navigation menu" : "Open navigation menu"}
                aria-expanded={isOpen}
              >
                <Menu className="h-5 w-5 text-slate-800 dark:text-white" aria-hidden="true" />
              </Button>
            </SheetTrigger>
            <SheetContent
              side="right"
              className="w-[min(22rem,92vw)] overflow-y-auto overscroll-contain border-l-orange-100 bg-[#fffaf3] px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-16 dark:border-white/10 dark:bg-slate-950"
            >
              <div className="flex min-h-full flex-col">
                <div className="rounded-3xl bg-gradient-to-br from-amber-100 via-orange-50 to-rose-100 p-5 dark:from-amber-400/10 dark:via-orange-400/5 dark:to-rose-400/10">
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-orange-700 dark:text-orange-300">For proud little moments</p>
                  <p className="mt-2 text-lg font-black leading-snug text-slate-950 dark:text-white">Find the right event for your little champion.</p>
                  <Button asChild className="mt-4 h-12 w-full rounded-full bg-[#ef5f52] font-black text-white hover:bg-[#dc4e43]">
                    <Link href="/events" onClick={closeMenu}>
                      Browse events <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
                    </Link>
                  </Button>
                </div>

                <nav className="mt-5 flex flex-col gap-1" aria-label="Mobile navigation">
                  {routes.map((route) => {
                    const active = isRouteActive(pathname, route.href)
                    return (
                      <Link
                        key={route.href}
                        href={route.href}
                        aria-current={active ? "page" : undefined}
                        className={cn(
                          "flex min-h-12 items-center justify-between rounded-2xl px-4 text-base font-bold touch-manipulation",
                          active
                            ? "bg-white text-[#d94f43] shadow-sm dark:bg-white/10 dark:text-orange-200"
                            : "text-slate-700 hover:bg-white/70 dark:text-slate-200 dark:hover:bg-white/5",
                        )}
                        onClick={closeMenu}
                      >
                        {route.label}
                        {route.href === "/register-event" && <CalendarDays className="h-4 w-4" aria-hidden="true" />}
                      </Link>
                    )
                  })}
                </nav>

                <div className="mt-auto border-t border-orange-100 pt-4 dark:border-white/10">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sm font-bold text-slate-600 dark:text-slate-300">Appearance</span>
                    <ModeToggle />
                  </div>
                  {isAuthenticated ? (
                    <div className="mt-4 grid gap-2">
                      <Button asChild variant="outline" className="h-12 rounded-full font-bold">
                        <Link href="/dashboard" onClick={closeMenu}><UserRound className="mr-2 h-4 w-4" />My account</Link>
                      </Button>
                      <Button variant="ghost" onClick={handleLogout} className="h-12 rounded-full font-bold text-rose-700 dark:text-rose-300">
                        <LogOut className="mr-2 h-4 w-4" />Logout
                      </Button>
                    </div>
                  ) : (
                    <div className="mt-4 grid grid-cols-2 gap-2">
                      <Button asChild variant="outline" className="h-12 rounded-full font-bold">
                        <Link href="/login" onClick={closeMenu}>Login</Link>
                      </Button>
                      <Button asChild className="h-12 rounded-full bg-slate-950 font-black text-white hover:bg-slate-800 dark:bg-white dark:text-slate-950">
                        <Link href="/register" onClick={closeMenu}>Sign up</Link>
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
