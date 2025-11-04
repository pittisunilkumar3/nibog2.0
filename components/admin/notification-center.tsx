"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuHeader,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Bell,
  Check,
  CheckCheck,
  X,
  Calendar,
  CreditCard,
  Users,
  AlertTriangle,
  Info,
  Settings,
  Trash2,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { formatDistanceToNow } from "date-fns"

export interface Notification {
  id: string
  type: 'booking' | 'payment' | 'system' | 'user' | 'event' | 'alert'
  title: string
  message: string
  timestamp: Date
  read: boolean
  priority: 'low' | 'medium' | 'high'
  actionUrl?: string
  metadata?: Record<string, any>
}

interface NotificationCenterProps {
  className?: string
}

// Mock notifications - in real app, these would come from an API
const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'booking',
    title: 'New Booking Received',
    message: 'Baby Crawling event in Mumbai - Priya Sharma',
    timestamp: new Date(Date.now() - 2 * 60 * 1000), // 2 minutes ago
    read: false,
    priority: 'high',
    actionUrl: '/admin/bookings/123',
  },
  {
    id: '2',
    type: 'payment',
    title: 'Payment Confirmed',
    message: '₹1,800 payment received from Rajesh Kumar',
    timestamp: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
    read: false,
    priority: 'medium',
    actionUrl: '/admin/payments/456',
  },
  {
    id: '3',
    type: 'event',
    title: 'Event Capacity Reached',
    message: 'Running Race in Delhi is now full (50/50)',
    timestamp: new Date(Date.now() - 15 * 60 * 1000), // 15 minutes ago
    read: false,
    priority: 'medium',
    actionUrl: '/admin/events/789',
  },
  {
    id: '4',
    type: 'user',
    title: 'New User Registration',
    message: 'Anita Patel registered from Ahmedabad',
    timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
    read: true,
    priority: 'low',
    actionUrl: '/admin/users/101',
  },
  {
    id: '5',
    type: 'system',
    title: 'System Maintenance',
    message: 'Scheduled maintenance completed successfully',
    timestamp: new Date(Date.now() - 60 * 60 * 1000), // 1 hour ago
    read: true,
    priority: 'low',
  },
  {
    id: '6',
    type: 'alert',
    title: 'Low Venue Availability',
    message: 'Only 2 venues available in Bangalore for next month',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    read: true,
    priority: 'high',
    actionUrl: '/admin/venues?city=bangalore',
  },
]

const getNotificationIcon = (type: Notification['type']) => {
  switch (type) {
    case 'booking':
      return <Calendar className="h-4 w-4" />
    case 'payment':
      return <CreditCard className="h-4 w-4" />
    case 'user':
      return <Users className="h-4 w-4" />
    case 'event':
      return <Calendar className="h-4 w-4" />
    case 'alert':
      return <AlertTriangle className="h-4 w-4" />
    case 'system':
      return <Settings className="h-4 w-4" />
    default:
      return <Info className="h-4 w-4" />
  }
}

const getNotificationColor = (type: Notification['type'], priority: Notification['priority']) => {
  if (priority === 'high') {
    return 'text-red-600 dark:text-red-400'
  }
  
  switch (type) {
    case 'booking':
      return 'text-blue-600 dark:text-blue-400'
    case 'payment':
      return 'text-green-600 dark:text-green-400'
    case 'user':
      return 'text-purple-600 dark:text-purple-400'
    case 'event':
      return 'text-orange-600 dark:text-orange-400'
    case 'alert':
      return 'text-red-600 dark:text-red-400'
    case 'system':
      return 'text-gray-600 dark:text-gray-400'
    default:
      return 'text-muted-foreground'
  }
}

export default function NotificationCenter({ className }: NotificationCenterProps) {
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications)
  const [isOpen, setIsOpen] = useState(false)

  const unreadCount = notifications.filter(n => !n.read).length

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    )
  }

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(n => ({ ...n, read: true }))
    )
  }

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }

  const clearAllNotifications = () => {
    setNotifications([])
  }

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.read) {
      markAsRead(notification.id)
    }
    
    if (notification.actionUrl) {
      window.open(notification.actionUrl, '_blank')
    }
    
    setIsOpen(false)
  }

  // Group notifications by type
  const groupedNotifications = notifications.reduce((acc, notification) => {
    if (!acc[notification.type]) {
      acc[notification.type] = []
    }
    acc[notification.type].push(notification)
    return acc
  }, {} as Record<string, Notification[]>)

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className={cn("relative", className)}>
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center">
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
          <span className="sr-only">Notifications</span>
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-semibold">Notifications</h3>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={markAllAsRead}
                className="text-xs"
              >
                <CheckCheck className="h-3 w-3 mr-1" />
                Mark all read
              </Button>
            )}
            {notifications.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAllNotifications}
                className="text-xs text-destructive hover:text-destructive"
              >
                <Trash2 className="h-3 w-3 mr-1" />
                Clear all
              </Button>
            )}
          </div>
        </div>

        <ScrollArea className="h-96">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Bell className="h-8 w-8 text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">No notifications</p>
              <p className="text-xs text-muted-foreground">You're all caught up!</p>
            </div>
          ) : (
            <div className="p-2">
              {Object.entries(groupedNotifications).map(([type, typeNotifications]) => (
                <div key={type} className="mb-4 last:mb-0">
                  <div className="flex items-center gap-2 px-2 py-1 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    {getNotificationIcon(type as Notification['type'])}
                    {type}
                  </div>
                  <div className="space-y-1">
                    {typeNotifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={cn(
                          "group flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-colors",
                          !notification.read 
                            ? "bg-muted/50 hover:bg-muted" 
                            : "hover:bg-muted/30",
                          notification.priority === 'high' && "border-l-2 border-red-500"
                        )}
                        onClick={() => handleNotificationClick(notification)}
                      >
                        <div className={cn(
                          "flex-shrink-0 mt-0.5",
                          getNotificationColor(notification.type, notification.priority)
                        )}>
                          {getNotificationIcon(notification.type)}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <p className={cn(
                              "text-sm font-medium",
                              !notification.read && "font-semibold"
                            )}>
                              {notification.title}
                            </p>
                            <div className="flex items-center gap-1 flex-shrink-0">
                              {!notification.read && (
                                <div className="w-2 h-2 bg-primary rounded-full" />
                              )}
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  deleteNotification(notification.id)
                                }}
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                          
                          <p className="text-xs text-muted-foreground mt-1">
                            {notification.message}
                          </p>
                          
                          <p className="text-xs text-muted-foreground mt-2">
                            {formatDistanceToNow(notification.timestamp, { addSuffix: true })}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <Separator className="mt-3" />
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        {notifications.length > 0 && (
          <div className="border-t p-2">
            <Button variant="ghost" className="w-full text-sm" asChild>
              <a href="/admin/notifications">View all notifications</a>
            </Button>
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
