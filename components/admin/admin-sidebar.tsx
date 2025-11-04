"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  BarChart3,
  Calendar,
  Home,
  LayoutDashboard,
  MapPin,
  Users,
  Tag,
  CreditCard,
  MessageSquare,
  Settings,
  LogOut,
  Menu,
  X,
  Package,
  FileText,
  QrCode,
  UserCheck,
  CheckSquare,
  ChevronDown,
  ChevronRight,
  TrendingUp,
  Building2,
  ShoppingCart,
  Mail,
  Award,
  Star,
  Layout,
  Trophy,
  HelpCircle,

} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

// Organized admin routes with sections
type AdminRouteItem = {
  href: string;
  label: string;
  icon: React.ReactNode;
  description: string;
  badge?: string; // Optional badge property
  children?: AdminRouteItem[]; // Optional children for nested routes
};

type AdminRouteSection = {
  section: string;
  items: AdminRouteItem[];
};

const adminRoutes: AdminRouteSection[] = [
  {
    section: "Analytics",
    items: [
      {
        href: "/admin",
        label: "Dashboard",
        icon: <LayoutDashboard className="h-4 w-4" />,
        description: "Overview & Analytics",
      },
    ],
  },
  {
    section: "Event Management",
    items: [
      {
        href: "/admin/events",
        label: "NIBOG Events",
        icon: <Calendar className="h-4 w-4" />,
        description: "Manage events",
        badge: "Active",
      },
      {
        href: "/admin/completed-events",
        label: "Completed Events",
        icon: <CheckSquare className="h-4 w-4" />,
        description: "Past events",
      },
      {
        href: "/admin/games",
        label: "Baby Games",
        icon: <BarChart3 className="h-4 w-4" />,
        description: "Game categories",
      },
    ],
  },
  {
    section: "Bookings & Users",
    items: [
      {
        href: "/admin/bookings",
        label: "Bookings",
        icon: <ShoppingCart className="h-4 w-4" />,
        description: "Event registrations",
        badge: "New",
      },
      {
        href: "/admin/complete-bookings",
        label: "Complete Bookings",
        icon: <CheckSquare className="h-4 w-4" />,
        description: "All booking records",
      },
      {
        href: "/admin/users",
        label: "Users",
        icon: <Users className="h-4 w-4" />,
        description: "User management",
      },
      {
        href: "/admin/attendance",
        label: "Attendance",
        icon: <UserCheck className="h-4 w-4" />,
        description: "Event check-ins",
      },
    ],
  },
  {
    section: "Locations",
    items: [
      {
        href: "/admin/cities",
        label: "Cities",
        icon: <MapPin className="h-4 w-4" />,
        description: "Event cities",
      },
      {
        href: "/admin/venues",
        label: "Venues",
        icon: <Building2 className="h-4 w-4" />,
        description: "Event locations",
      },
    ],
  },
  {
    section: "Commerce",
    items: [
      {
        href: "/admin/payments",
        label: "Payments",
        icon: <CreditCard className="h-4 w-4" />,
        description: "Payment tracking",
      },
      {
        href: "/admin/promo-codes",
        label: "Promo Codes",
        icon: <Tag className="h-4 w-4" />,
        description: "Discount codes",
      },
      {
        href: "/admin/add-ons",
        label: "Add-ons",
        icon: <Package className="h-4 w-4" />,
        description: "Extra services",
      },
    ],
  },
  {
    section: "Content & Communication",
    items: [
      {
        href: "/admin/home",
        label: "Home Section",
        icon: <Home className="h-4 w-4" />,
        description: "Homepage content",
      },
      {
        href: "/admin/partners",
        label: "Partners",
        icon: <Trophy className="h-4 w-4" />,
        description: "Partner logos & management",
      },
      {
        href: "/admin/footer",
        label: "Footer Management",
        icon: <Layout className="h-4 w-4" />,
        description: "Footer content & links",
      },
      {
        href: "/admin/email",
        label: "Email Sending",
        icon: <Mail className="h-4 w-4" />,
        description: "Email campaigns",
      },
      {
        href: "/admin/testimonials",
        label: "Testimonials",
        icon: <Star className="h-4 w-4" />,
        description: "Customer reviews",
      },
      {
        href: "/admin/faq",
        label: "Frequently Asked Questions",
        icon: <HelpCircle className="h-4 w-4" />,
        description: "Manage FAQ content",
      },
      {
        href: "/admin/privacy-policy",
        label: "Privacy Policy",
        icon: <FileText className="h-4 w-4" />,
        description: "Manage privacy policy content",
      },
      {
        href: "/admin/refund-policy",
        label: "Refund Policy",
        icon: <FileText className="h-4 w-4" />,
        description: "Manage refund policy content",
      },
      {
        href: "/admin/terms-conditions",
        label: "Terms & Conditions",
        icon: <FileText className="h-4 w-4" />,
        description: "Manage terms & conditions content",
      },
      {
        href: "#",
        label: "Certificates",
        icon: <Award className="h-4 w-4" />,
        description: "Certificate management",
        children: [
          {
            href: "/admin/certificate-templates",
            label: "Templates",
            icon: <FileText className="h-4 w-4" />,
            description: "Certificate designs",
          },
          {
            href: "/admin/certificates",
            label: "Generated",
            icon: <Award className="h-4 w-4" />,
            description: "Issued certificates",
          },
        ],
      },
    ],
  },
  {
    section: "Reports & Analytics",
    items: [
      {
        href: "/admin/reports",
        label: "Reports",
        icon: <BarChart3 className="h-4 w-4" />,
        description: "Data reports & exports",
      },
      {
        href: "/admin/reports/payments",
        label: "Payment Reports",
        icon: <CreditCard className="h-4 w-4" />,
        description: "Payment analytics",
      },
    ],
  },
  {
    section: "System",
    items: [
      {
        href: "/admin/settings",
        label: "Settings",
        icon: <Settings className="h-4 w-4" />,
        description: "System configuration",
      },
    ],
  },
]

export default function AdminSidebar() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({})
  const router = useRouter()
  
  const toggleSection = (label: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [label]: !prev[label]
    }))
  }

  const handleLogout = async () => {
    try {
      // Call logout API
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      })

      // Clear localStorage
      localStorage.removeItem('superadmin')

      // Redirect to login page
      window.location.href = '/superadmin/login'
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  return (
    <>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="fixed left-3 top-3 z-50 md:hidden h-10 w-10 touch-manipulation bg-background/80 backdrop-blur-sm border shadow-sm hover:bg-accent"
          >
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle Menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-72 p-0 touch-manipulation">
          <div className="flex h-full flex-col">
            <div className="border-b p-4">
              <div className="flex items-center justify-between">
                <Link
                  href="/admin"
                  className="flex items-center gap-2 font-semibold text-lg"
                  onClick={() => setOpen(false)}
                >
                  NIBOG Admin
                </Link>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setOpen(false)}
                  className="h-10 w-10 touch-manipulation"
                >
                  <X className="h-5 w-5" />
                  <span className="sr-only">Close</span>
                </Button>
              </div>
            </div>
            <nav className="flex-1 overflow-auto p-3">
              <div className="space-y-6">
                {adminRoutes.map((section, sectionIndex) => (
                  <div key={section.section}>
                    <div className="mb-3">
                      <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        {section.section}
                      </h3>
                    </div>
                    <ul className="space-y-1">
                      {section.items.map((item, itemIndex) => {
                        // Check if this is a parent item with children
                        if ('children' in item && item.children) {
                          const isExpanded = expandedSections[item.label] || false;
                          const hasActiveChild = item.children.some(child => child.href && pathname === child.href);

                          return (
                            <li key={`parent-${sectionIndex}-${itemIndex}`}>
                              <button
                                className={cn(
                                  "w-full flex items-center justify-between gap-2 rounded-lg px-4 py-3 text-sm font-medium hover:bg-muted/50 transition-colors touch-manipulation",
                                  (isExpanded || hasActiveChild) ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground",
                                )}
                                onClick={() => toggleSection(item.label)}
                              >
                                <div className="flex items-center gap-3 min-w-0">
                                  <div className="flex-shrink-0">
                                    {item.icon}
                                  </div>
                                  <div className="flex-1 text-left min-w-0">
                                    <div className="font-medium">{item.label}</div>
                                    {item.description && (
                                      <div className="text-xs text-muted-foreground truncate">
                                        {item.description}
                                      </div>
                                    )}
                                  </div>
                                </div>
                                <div className="flex items-center gap-2 flex-shrink-0">
                                  {item.badge && (
                                    <Badge variant="secondary" className="text-xs px-1.5 py-0.5">
                                      {item.badge}
                                    </Badge>
                                  )}
                                  {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                                </div>
                              </button>
                              {isExpanded && (
                                <ul className="mt-1 ml-7 space-y-1">
                                  {item.children.map((child, childIndex) => (
                                    <li key={`child-${sectionIndex}-${itemIndex}-${childIndex}`}>
                                      <Link
                                        href={child.href || '#'}
                                        className={cn(
                                          "flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors touch-manipulation",
                                          pathname === child.href ? "bg-muted text-foreground font-medium" : "text-muted-foreground hover:text-foreground hover:bg-muted/80",
                                        )}
                                        onClick={() => setOpen(false)}
                                      >
                                        <div className="flex-1">
                                          <div>{child.label}</div>
                                          {child.description && (
                                            <div className="text-xs text-muted-foreground">
                                              {child.description}
                                            </div>
                                          )}
                                        </div>
                                      </Link>
                                    </li>
                                  ))}
                                </ul>
                              )}
                            </li>
                          );
                        }

                        // Regular menu item without children
                        return (
                          <li key={`item-${sectionIndex}-${itemIndex}`}>
                            <Link
                              href={item.href as string}
                              className={cn(
                                "flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors group touch-manipulation",
                                pathname === item.href
                                  ? "bg-primary text-primary-foreground hover:bg-primary/90"
                                  : "text-muted-foreground hover:text-foreground hover:bg-muted/80",
                              )}
                              onClick={() => setOpen(false)}
                            >
                              <div className="flex-shrink-0">
                                {item.icon}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="font-medium">{item.label}</div>
                                {item.description && (
                                  <div className={cn(
                                    "text-xs truncate",
                                    pathname === item.href ? "text-primary-foreground/70" : "text-muted-foreground"
                                  )}>
                                    {item.description}
                                  </div>
                                )}
                              </div>
                              {item.badge && (
                                <Badge
                                  variant={pathname === item.href ? "secondary" : "outline"}
                                  className="text-xs px-1.5 py-0.5 flex-shrink-0"
                                >
                                  {item.badge}
                                </Badge>
                              )}
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                    {sectionIndex < adminRoutes.length - 1 && (
                      <Separator className="mt-4" />
                    )}
                  </div>
                ))}
              </div>
            </nav>
            <div className="border-t p-4">
              <Button
                variant="outline"
                className="w-full justify-start touch-manipulation"
                onClick={handleLogout}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      <aside className="hidden w-64 border-r bg-background md:block">
        <div className="flex h-full flex-col">
          <div className="border-b p-4">
            <Link href="/admin" className="flex items-center gap-2 font-semibold">
              NIBOG Admin
            </Link>
          </div>
          <nav className="flex-1 overflow-auto p-3">
            <div className="space-y-6">
              {adminRoutes.map((section, sectionIndex) => (
                <div key={section.section}>
                  <div className="mb-3">
                    <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      {section.section}
                    </h3>
                  </div>
                  <ul className="space-y-1">
                    {section.items.map((item, itemIndex) => {
                      // Check if this is a parent item with children
                      if ('children' in item && item.children) {
                        const isExpanded = expandedSections[item.label] || false;
                        const hasActiveChild = item.children.some(child => child.href && pathname === child.href);

                        return (
                          <li key={`parent-${sectionIndex}-${itemIndex}`}>
                            <button
                              className={cn(
                                "w-full flex items-center justify-between gap-2 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                                (isExpanded || hasActiveChild) ? "bg-muted text-foreground hover:bg-muted/90" : "text-muted-foreground hover:text-foreground hover:bg-muted/80",
                              )}
                              onClick={() => toggleSection(item.label)}
                            >
                              <div className="flex items-center gap-3 min-w-0">
                                <div className="flex-shrink-0">
                                  {item.icon}
                                </div>
                                <div className="flex-1 text-left min-w-0">
                                  <div className="font-medium">{item.label}</div>
                                  {item.description && (
                                    <div className="text-xs text-muted-foreground truncate">
                                      {item.description}
                                    </div>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center gap-2 flex-shrink-0">
                                {item.badge && (
                                  <Badge variant="secondary" className="text-xs px-1.5 py-0.5">
                                    {item.badge}
                                  </Badge>
                                )}
                                {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                              </div>
                            </button>
                            {isExpanded && (
                              <ul className="mt-1 ml-7 space-y-1">
                                {item.children.map((child, childIndex) => (
                                  <li key={`child-${sectionIndex}-${itemIndex}-${childIndex}`}>
                                    <Link
                                      href={child.href || '#'}
                                      className={cn(
                                        "flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors",
                                        pathname === child.href ? "bg-muted text-foreground font-medium" : "text-muted-foreground hover:text-foreground hover:bg-muted/80",
                                      )}
                                    >
                                      <div className="flex-1">
                                        <div>{child.label}</div>
                                        {child.description && (
                                          <div className="text-xs text-muted-foreground">
                                            {child.description}
                                          </div>
                                        )}
                                      </div>
                                    </Link>
                                  </li>
                                ))}
                              </ul>
                            )}
                          </li>
                        );
                      }

                      // Regular menu item without children
                      return (
                        <li key={`item-${sectionIndex}-${itemIndex}`}>
                          <Link
                            href={item.href as string}
                            className={cn(
                              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors group",
                              pathname === item.href
                                ? "bg-primary text-primary-foreground hover:bg-primary/90"
                                : "text-muted-foreground hover:text-foreground hover:bg-muted/80",
                            )}
                          >
                            <div className="flex-shrink-0">
                              {item.icon}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="font-medium">{item.label}</div>
                              {item.description && (
                                <div className={cn(
                                  "text-xs truncate",
                                  pathname === item.href ? "text-primary-foreground/70" : "text-muted-foreground"
                                )}>
                                  {item.description}
                                </div>
                              )}
                            </div>
                            {item.badge && (
                              <Badge
                                variant={pathname === item.href ? "secondary" : "outline"}
                                className="text-xs px-1.5 py-0.5 flex-shrink-0"
                              >
                                {item.badge}
                              </Badge>
                            )}
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                  {sectionIndex < adminRoutes.length - 1 && (
                    <Separator className="mt-4" />
                  )}
                </div>
              ))}
            </div>
          </nav>
          <div className="border-t p-4">
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={handleLogout}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </aside>
    </>
  )
}
