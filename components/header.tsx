"use client"

import Link from "next/link"
import { useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Menu, User, Baby, Calendar, LogOut } from "lucide-react"
import { cn } from "@/lib/utils"
import { ModeToggle } from "./mode-toggle"
import { UserNav } from "./user-nav"
import { Badge } from "./ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "./ui/use-toast"
import { NibogLogo } from "./nibog-logo"

export default function Header() {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const { user, isAuthenticated, logout } = useAuth()
  const { toast } = useToast()

  // For now, we'll consider any user as a regular user
  const isAdmin = false

  const handleLogout = () => {
    logout()
    setIsOpen(false)
    toast({
      title: "Logged out",
      description: "You have been logged out successfully.",
    })
    router.push('/')
  }

  const routes = [
    {
      href: "/",
      label: "Home",
      active: pathname === "/",
    },
    {
      href: "/events",
      label: "Events",
      active: pathname === "/events",
    },
    {
      href: "/baby-olympics",
      label: "NIBOG Games",
      active: pathname === "/baby-olympics",
    },
    {
      href: "/register-event",
      label: "Register Event",
      active: pathname === "/register-event",
    },
    {
      href: "/about",
      label: "About",
      active: pathname === "/about",
    },
    {
      href: "/contact",
      label: "Contact",
      active: pathname === "/contact",
    },
  ]

  return (
    <header className="sticky top-0 z-50 w-full border-b-4 border-sunshine-300/50 dark:border-sunshine-600/50 bg-gradient-to-r from-sunshine-100/95 via-coral-100/95 to-mint-100/95 dark:from-sunshine-900/95 dark:via-coral-900/95 dark:to-mint-900/95 backdrop-blur-lg supports-[backdrop-filter]:bg-transparent shadow-2xl transition-all duration-300 hover:shadow-3xl">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_50%,rgba(255,215,0,0.3),transparent_70%),radial-gradient(circle_at_85%_30%,rgba(255,127,127,0.3),transparent_70%),radial-gradient(circle_at_50%_80%,rgba(152,251,152,0.2),transparent_70%)] animate-rainbow-shift" />
      <div className="container flex h-20 md:h-24 items-center justify-between relative z-10">
        <div className="flex items-center gap-6 md:gap-10">
          <Link href="/" className="flex items-center h-full py-2">
            <NibogLogo className="h-full w-auto" />
          </Link>
          <nav className="hidden gap-5 md:flex">
            {routes.map((route) => (
              <Link
                key={route.href}
                href={route.href}
                className={cn(
                  "relative px-6 py-3 text-sm font-semibold rounded-2xl transition-all duration-300 group overflow-hidden",
                  "hover:bg-white/40 dark:hover:bg-white/20 hover:scale-110 hover:shadow-xl hover:shadow-sunshine-200/50 dark:hover:shadow-sunshine-800/30",
                  route.active
                    ? [
                        "text-neutral-charcoal font-bold shadow-xl",
                        "bg-gradient-to-r from-sunshine-400 via-coral-400 to-mint-400",
                        "bg-[length:200%_auto] animate-rainbow-shift",
                        "shadow-sunshine-400/50 dark:shadow-sunshine-600/50",
                        "border-2 border-white/50",
                        "before:absolute before:inset-0 before:bg-gradient-to-r before:from-white/30 before:via-white/0 before:to-white/30 before:animate-shine"
                      ].join(' ')
                    : "text-neutral-charcoal dark:text-white hover:text-sunshine-700 dark:hover:text-sunshine-300 font-medium",
                )}
              >
                <span className="relative z-10 flex items-center gap-2">
                  {route.label}
                  {route.active && (
                    <span className="absolute -right-1 -top-1 flex items-center justify-center">
                      <span className="absolute h-2 w-2 animate-ping rounded-full bg-white/90"></span>
                      <span className="relative h-1.5 w-1.5 rounded-full bg-white"></span>
                    </span>
                  )}
                </span>
                {!route.active && (
                  <span className={cn(
                    "absolute inset-0 rounded-xl bg-gradient-to-r from-purple-500/0 via-purple-500/15 to-purple-500/0",
                    "opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  )}></span>
                )}
              </Link>
            ))}
            {isAdmin && (
              <Link 
                href="/admin" 
                className="relative px-3 py-2 text-sm font-medium rounded-full transition-all duration-300 text-rose-600 dark:text-rose-400 hover:bg-rose-100/30 dark:hover:bg-rose-900/20 hover:scale-105"
              >
                Admin Panel
              </Link>
            )}
          </nav>
        </div>
        <div className="flex items-center gap-2">
          <div className="hidden md:flex md:items-center md:gap-3">
            <ModeToggle />
            {isAuthenticated ? (
              <UserNav />
            ) : (
              <>
                <Button 
                  variant="ghost" 
                  className="rounded-full px-4 font-medium text-blue-600 dark:text-blue-300 hover:bg-blue-100/50 dark:hover:bg-blue-900/30 hover:text-blue-700 dark:hover:text-blue-200 transition-all duration-300 hover:scale-105"
                  asChild
                >
                  <Link href="/login">Login</Link>
                </Button>
                <Button 
                  className="rounded-full px-5 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 border-0 font-medium shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105"
                  asChild
                >
                  <Link href="/register">Sign up</Link>
                </Button>
              </>
            )}
          </div>
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button 
                variant="ghost" 
                className="px-3 py-2 md:hidden rounded-xl hover:bg-white/30 dark:hover:bg-white/10 transition-all duration-300 group" 
                aria-label="Toggle Menu"
              >
                <Menu className="h-5 w-5 text-blue-700 dark:text-blue-300 group-hover:text-purple-600 dark:group-hover:text-purple-300 transition-colors" />
              </Button>
            </SheetTrigger>
            <SheetContent 
              side="right" 
              className="pr-0 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-blue-950/90 dark:via-purple-950/90 dark:to-pink-950/90 border-l-pink-200 dark:border-l-purple-800">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_20%,rgba(120,190,255,0.2),transparent_70%),radial-gradient(circle_at_30%_70%,rgba(255,182,193,0.2),transparent_70%)] z-0"></div>
              <div className="flex flex-col h-full relative z-10">
                <div className="flex-1">
                  <nav className="flex flex-col gap-3 mt-6 px-2">
                    {routes.map((route) => (
                      <Link
                        key={route.href}
                        href={route.href}
                        className={cn(
                          "px-4 py-3 text-sm font-medium rounded-xl transition-all duration-300",
                          "hover:bg-white/40 dark:hover:bg-white/10",
                          route.active 
                            ? "text-purple-700 dark:text-purple-300 font-semibold bg-white/30 dark:bg-white/10 shadow-sm" 
                            : "text-blue-700 dark:text-blue-300",
                        )}
                        onClick={() => setIsOpen(false)}
                      >
                        <div className="flex items-center">
                          <span>{route.label}</span>
                          {route.active && (
                            <span className="ml-2 h-2 w-2 rounded-full bg-gradient-to-r from-pink-400 to-purple-400"></span>
                          )}
                        </div>
                      </Link>
                    ))}
                    {isAdmin && (
                      <Link
                        href="/admin"
                        className="px-4 py-3 text-sm font-medium rounded-xl transition-all duration-300 text-rose-600 dark:text-rose-400 hover:bg-rose-100/50 dark:hover:bg-rose-900/20"
                        onClick={() => setIsOpen(false)}
                      >
                        Admin Panel
                      </Link>
                    )}
                  </nav>
                </div>

                <div className="border-t border-pink-200 dark:border-purple-800/50 py-4 mt-6">
                  {isAuthenticated ? (
                    <div className="space-y-4">
                      <div className="flex items-center gap-4 px-4 py-3 mx-2 rounded-xl bg-white/30 dark:bg-white/5 shadow-sm">
                        <Avatar className="border-2 border-pink-200 dark:border-purple-700">
                          <AvatarImage
                            src={`https://ui-avatars.com/api/?name=${user?.full_name?.split(' ').map(n => n[0]).join('') || 'U'}&background=random&color=fff`}
                          />
                          <AvatarFallback className="bg-gradient-to-br from-blue-400 to-purple-500 text-white">
                            {user?.full_name
                              ? user.full_name
                                  .split(' ')
                                  .map(name => name[0])
                                  .join('')
                                  .toUpperCase()
                                  .substring(0, 2)
                              : 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium text-purple-700 dark:text-purple-300">{user?.full_name || 'User'}</p>
                          <p className="text-xs text-blue-600 dark:text-blue-400">{user?.email || 'No email'}</p>
                        </div>
                      </div>

                      <div className="space-y-2 px-2">
                        <Button 
                          variant="ghost" 
                          className="w-full justify-start rounded-xl px-4 py-3 text-blue-700 dark:text-blue-300 hover:bg-white/40 dark:hover:bg-white/10 transition-all duration-300" 
                          asChild
                        >
                          <Link href="/dashboard" onClick={() => setIsOpen(false)}>
                            <User className="mr-3 h-4 w-4" />
                            My Profile
                          </Link>
                        </Button>
                        <Button 
                          variant="ghost" 
                          className="w-full justify-start rounded-xl px-4 py-3 text-blue-700 dark:text-blue-300 hover:bg-white/40 dark:hover:bg-white/10 transition-all duration-300" 
                          asChild
                        >
                          <Link href="/dashboard/bookings" onClick={() => setIsOpen(false)}>
                            <Calendar className="mr-3 h-4 w-4" />
                            My Bookings
                          </Link>
                        </Button>
                        <Button 
                          variant="ghost" 
                          className="w-full justify-start rounded-xl px-4 py-3 text-blue-700 dark:text-blue-300 hover:bg-white/40 dark:hover:bg-white/10 transition-all duration-300" 
                          asChild
                        >
                          <Link href="/dashboard/children" onClick={() => setIsOpen(false)}>
                            <Baby className="mr-3 h-4 w-4" />
                            My Children
                          </Link>
                        </Button>
                        <Button
                          variant="ghost"
                          className="w-full justify-start rounded-xl px-4 py-3 text-red-500 hover:text-red-600 hover:bg-red-100/50 dark:hover:bg-red-900/20 transition-all duration-300"
                          onClick={handleLogout}
                        >
                          <LogOut className="mr-3 h-4 w-4" />
                          Logout
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-3 px-4 py-2">
                      <Button 
                        className="w-full rounded-xl py-5 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 border-0 font-medium shadow-md hover:shadow-lg transition-all duration-300" 
                        onClick={() => setIsOpen(false)} 
                        asChild
                      >
                        <Link href="/register">Signup</Link>
                      </Button>
                      <Button 
                        variant="outline" 
                        className="w-full rounded-xl py-5 border-2 border-blue-300 dark:border-blue-700 text-blue-600 dark:text-blue-300 hover:bg-blue-100/30 dark:hover:bg-blue-900/30 transition-all duration-300" 
                        onClick={() => setIsOpen(false)} 
                        asChild
                      >
                        <Link href="/login">Login</Link>
                      </Button>
                    </div>
                  )}
                  <div className="mt-6 flex justify-center">
                    <ModeToggle />
                  </div>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
