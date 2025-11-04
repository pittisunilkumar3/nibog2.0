"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useIsMobile } from "@/hooks/use-mobile"
import { Monitor, Smartphone, Tablet } from "lucide-react"

interface ResponsiveTestHelperProps {
  showHelper?: boolean
}

export default function ResponsiveTestHelper({ showHelper = false }: ResponsiveTestHelperProps) {
  const [screenSize, setScreenSize] = useState({ width: 0, height: 0 })
  const [isVisible, setIsVisible] = useState(showHelper)
  const isMobile = useIsMobile()

  useEffect(() => {
    const updateScreenSize = () => {
      setScreenSize({
        width: window.innerWidth,
        height: window.innerHeight
      })
    }

    updateScreenSize()
    window.addEventListener('resize', updateScreenSize)
    return () => window.removeEventListener('resize', updateScreenSize)
  }, [])

  const getDeviceType = () => {
    const width = screenSize.width
    if (width < 768) return 'mobile'
    if (width < 1024) return 'tablet'
    return 'desktop'
  }

  const getBreakpointInfo = () => {
    const width = screenSize.width
    if (width < 640) return { name: 'xs', color: 'bg-red-500' }
    if (width < 768) return { name: 'sm', color: 'bg-orange-500' }
    if (width < 1024) return { name: 'md', color: 'bg-yellow-500' }
    if (width < 1280) return { name: 'lg', color: 'bg-green-500' }
    if (width < 1536) return { name: 'xl', color: 'bg-blue-500' }
    return { name: '2xl', color: 'bg-purple-500' }
  }

  const deviceType = getDeviceType()
  const breakpoint = getBreakpointInfo()

  if (!isVisible) {
    return (
      <Button
        onClick={() => setIsVisible(true)}
        className="fixed bottom-4 right-4 z-50 rounded-full w-12 h-12 p-0"
        variant="outline"
        size="icon"
      >
        <Monitor className="h-4 w-4" />
      </Button>
    )
  }

  return (
    <Card className="fixed bottom-4 right-4 z-50 w-64 shadow-lg">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm">Responsive Helper</CardTitle>
          <Button
            onClick={() => setIsVisible(false)}
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0"
          >
            ×
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-2">
          {deviceType === 'mobile' && <Smartphone className="h-4 w-4" />}
          {deviceType === 'tablet' && <Tablet className="h-4 w-4" />}
          {deviceType === 'desktop' && <Monitor className="h-4 w-4" />}
          <span className="text-sm font-medium capitalize">{deviceType}</span>
        </div>

        <div className="space-y-1">
          <div className="text-xs text-muted-foreground">Screen Size</div>
          <div className="text-sm font-mono">
            {screenSize.width} × {screenSize.height}
          </div>
        </div>

        <div className="space-y-1">
          <div className="text-xs text-muted-foreground">Tailwind Breakpoint</div>
          <Badge className={`${breakpoint.color} text-white`}>
            {breakpoint.name}
          </Badge>
        </div>

        <div className="space-y-1">
          <div className="text-xs text-muted-foreground">useIsMobile Hook</div>
          <Badge variant={isMobile ? "destructive" : "secondary"}>
            {isMobile ? "Mobile" : "Desktop"}
          </Badge>
        </div>

        <div className="space-y-1">
          <div className="text-xs text-muted-foreground">Touch Support</div>
          <Badge variant={('ontouchstart' in window) ? "default" : "outline"}>
            {('ontouchstart' in window) ? "Touch" : "No Touch"}
          </Badge>
        </div>

        <div className="pt-2 border-t">
          <div className="text-xs text-muted-foreground mb-1">Test Checklist</div>
          <div className="space-y-1 text-xs">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${screenSize.width >= 320 ? 'bg-green-500' : 'bg-red-500'}`} />
              Min width (320px)
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${isMobile ? 'bg-green-500' : 'bg-gray-300'}`} />
              Mobile layout active
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${document.documentElement.scrollWidth <= screenSize.width ? 'bg-green-500' : 'bg-red-500'}`} />
              No horizontal scroll
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Hook to easily add responsive testing to any page
export function useResponsiveTest() {
  const [showHelper, setShowHelper] = useState(false)

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Press Ctrl+Shift+R to toggle responsive helper
      if (e.ctrlKey && e.shiftKey && e.key === 'R') {
        e.preventDefault()
        setShowHelper(prev => !prev)
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [])

  return { showHelper, setShowHelper }
}
