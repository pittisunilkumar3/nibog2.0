"use client"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  MoreHorizontal,
  ExternalLink,
  RefreshCw
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ReactNode, useState } from "react"
import Link from "next/link"

export interface KPIData {
  title: string
  value: string | number
  change?: {
    value: number
    period: string
    type: 'increase' | 'decrease' | 'neutral'
  }
  icon?: ReactNode
  description?: string
  color?: 'default' | 'success' | 'warning' | 'danger' | 'info'
  href?: string
  actions?: Array<{
    label: string
    onClick: () => void
  }>
  loading?: boolean
  subtitle?: string
}

interface EnhancedKPICardProps {
  data: KPIData
  className?: string
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
}

const colorVariants = {
  default: {
    card: "border-border",
    icon: "text-muted-foreground",
    accent: "bg-muted"
  },
  success: {
    card: "border-green-200 bg-green-50/50 dark:border-green-800 dark:bg-green-950/20",
    icon: "text-green-600 dark:text-green-400",
    accent: "bg-green-100 dark:bg-green-900/30"
  },
  warning: {
    card: "border-yellow-200 bg-yellow-50/50 dark:border-yellow-800 dark:bg-yellow-950/20",
    icon: "text-yellow-600 dark:text-yellow-400",
    accent: "bg-yellow-100 dark:bg-yellow-900/30"
  },
  danger: {
    card: "border-red-200 bg-red-50/50 dark:border-red-800 dark:bg-red-950/20",
    icon: "text-red-600 dark:text-red-400",
    accent: "bg-red-100 dark:bg-red-900/30"
  },
  info: {
    card: "border-blue-200 bg-blue-50/50 dark:border-blue-800 dark:bg-blue-950/20",
    icon: "text-blue-600 dark:text-blue-400",
    accent: "bg-blue-100 dark:bg-blue-900/30"
  }
}

const sizeVariants = {
  sm: {
    card: "p-4",
    title: "text-sm",
    value: "text-xl",
    icon: "h-4 w-4"
  },
  md: {
    card: "p-6",
    title: "text-sm",
    value: "text-2xl",
    icon: "h-5 w-5"
  },
  lg: {
    card: "p-8",
    title: "text-base",
    value: "text-3xl",
    icon: "h-6 w-6"
  }
}

export default function EnhancedKPICard({
  data,
  className,
  size = 'md',
  loading = false
}: EnhancedKPICardProps) {
  const [isRefreshing, setIsRefreshing] = useState(false)
  const colors = colorVariants[data.color || 'default']
  const sizes = sizeVariants[size]

  const handleRefresh = async () => {
    setIsRefreshing(true)
    // Simulate refresh delay
    await new Promise(resolve => setTimeout(resolve, 1000))
    setIsRefreshing(false)
  }

  const getTrendIcon = () => {
    if (!data.change) return null
    
    switch (data.change.type) {
      case 'increase':
        return <TrendingUp className="h-3 w-3 text-green-600" />
      case 'decrease':
        return <TrendingDown className="h-3 w-3 text-red-600" />
      default:
        return <Minus className="h-3 w-3 text-muted-foreground" />
    }
  }

  const getTrendColor = () => {
    if (!data.change) return "text-muted-foreground"
    
    switch (data.change.type) {
      case 'increase':
        return "text-green-600"
      case 'decrease':
        return "text-red-600"
      default:
        return "text-muted-foreground"
    }
  }

  const CardWrapper = data.href ? Link : 'div'
  const cardProps = data.href ? { href: data.href } : {}

  return (
    <CardWrapper {...cardProps}>
      <Card className={cn(
        "relative overflow-hidden transition-all duration-200 hover:shadow-md",
        colors.card,
        data.href && "cursor-pointer hover:scale-[1.02]",
        className
      )}>
        <CardHeader className={cn("flex flex-row items-center justify-between space-y-0 pb-2", sizes.card)}>
          <div className="flex items-center space-x-2">
            {data.icon && (
              <div className={cn("flex-shrink-0", colors.icon)}>
                {data.icon}
              </div>
            )}
            <div>
              <h3 className={cn("font-medium leading-none tracking-tight", sizes.title)}>
                {data.title}
              </h3>
              {data.subtitle && (
                <p className="text-xs text-muted-foreground mt-1">
                  {data.subtitle}
                </p>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-1">
            {data.href && (
              <Button variant="ghost" size="icon" className="h-6 w-6">
                <ExternalLink className="h-3 w-3" />
              </Button>
            )}
            
            {(data.actions || !data.loading) && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-6 w-6">
                    <MoreHorizontal className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={handleRefresh} disabled={isRefreshing}>
                    <RefreshCw className={cn("mr-2 h-3 w-3", isRefreshing && "animate-spin")} />
                    Refresh
                  </DropdownMenuItem>
                  {data.actions?.map((action, index) => (
                    <DropdownMenuItem key={index} onClick={action.onClick}>
                      {action.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </CardHeader>
        
        <CardContent className={cn("space-y-3", sizes.card, "pt-0")}>
          <div className="space-y-1">
            <div className={cn("font-bold tracking-tight", sizes.value)}>
              {data.loading ? (
                <div className="animate-pulse bg-muted rounded h-8 w-24" />
              ) : (
                data.value
              )}
            </div>
            
            {data.change && !data.loading && (
              <div className="flex items-center space-x-1">
                {getTrendIcon()}
                <span className={cn("text-xs font-medium", getTrendColor())}>
                  {data.change.value > 0 ? '+' : ''}{data.change.value}%
                </span>
                <span className="text-xs text-muted-foreground">
                  from {data.change.period}
                </span>
              </div>
            )}
            
            {data.description && (
              <p className="text-xs text-muted-foreground">
                {data.description}
              </p>
            )}
          </div>
        </CardContent>
        
        {/* Accent bar */}
        <div className={cn("absolute bottom-0 left-0 right-0 h-1", colors.accent)} />
      </Card>
    </CardWrapper>
  )
}
