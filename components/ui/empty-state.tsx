"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import {
  Plus,
  Search,
  FileX,
  Users,
  Calendar,
  CreditCard,
  Package,
  MapPin,
  Star,
  Mail,
  Settings,
  Database,
  Filter,
  RefreshCw,
} from "lucide-react"
import Link from "next/link"

interface EmptyStateProps {
  icon?: React.ReactNode
  title: string
  description: string
  action?: {
    label: string
    href?: string
    onClick?: () => void
    variant?: "default" | "outline" | "secondary"
  }
  secondaryAction?: {
    label: string
    href?: string
    onClick?: () => void
  }
  className?: string
  size?: "sm" | "md" | "lg"
}

const sizeVariants = {
  sm: {
    container: "py-8",
    icon: "h-12 w-12",
    title: "text-lg",
    description: "text-sm",
  },
  md: {
    container: "py-12",
    icon: "h-16 w-16",
    title: "text-xl",
    description: "text-base",
  },
  lg: {
    container: "py-16",
    icon: "h-20 w-20",
    title: "text-2xl",
    description: "text-lg",
  },
}

export default function EmptyState({
  icon,
  title,
  description,
  action,
  secondaryAction,
  className,
  size = "md",
}: EmptyStateProps) {
  const sizes = sizeVariants[size]

  const ActionButton = action?.href ? Link : 'button'
  const SecondaryButton = secondaryAction?.href ? Link : 'button'

  return (
    <div className={cn("flex flex-col items-center justify-center text-center", sizes.container, className)}>
      {icon && (
        <div className={cn("mb-4 text-muted-foreground/50", sizes.icon)}>
          {icon}
        </div>
      )}
      
      <h3 className={cn("font-semibold text-foreground mb-2", sizes.title)}>
        {title}
      </h3>
      
      <p className={cn("text-muted-foreground mb-6 max-w-md", sizes.description)}>
        {description}
      </p>
      
      <div className="flex flex-col sm:flex-row gap-3">
        {action && (
          <ActionButton
            {...(action.href ? { href: action.href } : { onClick: action.onClick })}
            className={cn(
              "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background",
              action.variant === "outline" 
                ? "border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
                : action.variant === "secondary"
                ? "bg-secondary text-secondary-foreground hover:bg-secondary/80 h-10 px-4 py-2"
                : "bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
            )}
          >
            {action.label}
          </ActionButton>
        )}
        
        {secondaryAction && (
          <SecondaryButton
            {...(secondaryAction.href ? { href: secondaryAction.href } : { onClick: secondaryAction.onClick })}
            className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
          >
            {secondaryAction.label}
          </SecondaryButton>
        )}
      </div>
    </div>
  )
}

// Specialized empty state components for common scenarios

export function EmptyBookings({ onCreateBooking }: { onCreateBooking?: () => void }) {
  return (
    <EmptyState
      icon={<Calendar className="h-full w-full" />}
      title="No bookings found"
      description="There are no bookings matching your current filters. Create a new booking or adjust your search criteria."
      action={{
        label: "Create New Booking",
        onClick: onCreateBooking,
      }}
      secondaryAction={{
        label: "Clear Filters",
        onClick: () => window.location.reload(),
      }}
    />
  )
}

export function EmptyEvents() {
  return (
    <EmptyState
      icon={<Calendar className="h-full w-full" />}
      title="No events scheduled"
      description="Get started by creating your first NIBOG event. Events are the foundation of your baby games platform."
      action={{
        label: "Create Event",
        href: "/admin/events/new",
      }}
      secondaryAction={{
        label: "View Templates",
        href: "/admin/events/templates",
      }}
    />
  )
}

export function EmptyUsers() {
  return (
    <EmptyState
      icon={<Users className="h-full w-full" />}
      title="No users found"
      description="No users match your current search criteria. Try adjusting your filters or invite new users to join the platform."
      action={{
        label: "Invite Users",
        href: "/admin/users/invite",
      }}
      secondaryAction={{
        label: "Clear Search",
        onClick: () => window.location.reload(),
      }}
    />
  )
}

export function EmptyPayments() {
  return (
    <EmptyState
      icon={<CreditCard className="h-full w-full" />}
      title="No payment records"
      description="No payment transactions found for the selected period. Payments will appear here once bookings are made."
      action={{
        label: "View All Bookings",
        href: "/admin/bookings",
      }}
      secondaryAction={{
        label: "Refresh Data",
        onClick: () => window.location.reload(),
      }}
    />
  )
}

export function EmptySearch({ searchTerm, onClearSearch }: { 
  searchTerm: string
  onClearSearch: () => void 
}) {
  return (
    <EmptyState
      icon={<Search className="h-full w-full" />}
      title={`No results for "${searchTerm}"`}
      description="We couldn't find any items matching your search. Try different keywords or check your spelling."
      action={{
        label: "Clear Search",
        onClick: onClearSearch,
        variant: "outline",
      }}
      size="sm"
    />
  )
}

export function EmptyFiltered({ onClearFilters }: { onClearFilters: () => void }) {
  return (
    <EmptyState
      icon={<Filter className="h-full w-full" />}
      title="No results match your filters"
      description="Try adjusting your filter criteria to see more results, or clear all filters to view everything."
      action={{
        label: "Clear All Filters",
        onClick: onClearFilters,
        variant: "outline",
      }}
      size="sm"
    />
  )
}

export function EmptyError({ 
  onRetry, 
  error 
}: { 
  onRetry: () => void
  error?: string 
}) {
  return (
    <EmptyState
      icon={<Database className="h-full w-full" />}
      title="Unable to load data"
      description={error || "Something went wrong while loading the data. Please try again or contact support if the problem persists."}
      action={{
        label: "Try Again",
        onClick: onRetry,
      }}
      secondaryAction={{
        label: "Contact Support",
        href: "/admin/support",
      }}
    />
  )
}

export function EmptyDashboard() {
  return (
    <Card className="border-dashed">
      <CardContent className="pt-6">
        <EmptyState
          icon={<Settings className="h-full w-full" />}
          title="Welcome to NIBOG Admin"
          description="Your dashboard is ready! Start by creating events, managing bookings, or customizing your dashboard layout."
          action={{
            label: "Create First Event",
            href: "/admin/events/new",
          }}
          secondaryAction={{
            label: "Customize Dashboard",
            href: "/admin/settings/dashboard",
          }}
          size="lg"
        />
      </CardContent>
    </Card>
  )
}

// Generic empty state for tables
export function EmptyTable({ 
  title = "No data available",
  description = "There are no items to display at the moment.",
  actionLabel,
  onAction,
  actionHref,
}: {
  title?: string
  description?: string
  actionLabel?: string
  onAction?: () => void
  actionHref?: string
}) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="mb-4 text-muted-foreground/50">
        <FileX className="h-12 w-12" />
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-2">
        {title}
      </h3>
      <p className="text-sm text-muted-foreground mb-4 max-w-md">
        {description}
      </p>
      {(actionLabel && (onAction || actionHref)) && (
        <Button
          onClick={onAction}
          {...(actionHref ? { asChild: true } : {})}
          size="sm"
        >
          {actionHref ? (
            <Link href={actionHref}>{actionLabel}</Link>
          ) : (
            actionLabel
          )}
        </Button>
      )}
    </div>
  )
}

// Loading empty state (for when data is being fetched)
export function LoadingEmpty() {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="mb-4">
        <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-2">
        Loading data...
      </h3>
      <p className="text-sm text-muted-foreground">
        Please wait while we fetch the latest information.
      </p>
    </div>
  )
}
