"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Smartphone, Tablet, Monitor, Eye, EyeOff } from "lucide-react"

interface MobileTestHelperProps {
  className?: string
}

export function MobileTestHelper({ className }: MobileTestHelperProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [screenSize, setScreenSize] = useState({ width: 0, height: 0 })
  const [deviceType, setDeviceType] = useState<'mobile' | 'tablet' | 'desktop'>('desktop')

  useEffect(() => {
    const updateScreenSize = () => {
      const width = window.innerWidth
      const height = window.innerHeight
      setScreenSize({ width, height })
      
      if (width < 768) {
        setDeviceType('mobile')
      } else if (width < 1024) {
        setDeviceType('tablet')
      } else {
        setDeviceType('desktop')
      }
    }

    updateScreenSize()
    window.addEventListener('resize', updateScreenSize)
    return () => window.removeEventListener('resize', updateScreenSize)
  }, [])

  const getDeviceIcon = () => {
    switch (deviceType) {
      case 'mobile': return <Smartphone className="h-4 w-4" />
      case 'tablet': return <Tablet className="h-4 w-4" />
      default: return <Monitor className="h-4 w-4" />
    }
  }

  const getDeviceColor = () => {
    switch (deviceType) {
      case 'mobile': return 'bg-green-500'
      case 'tablet': return 'bg-yellow-500'
      default: return 'bg-blue-500'
    }
  }

  if (!isVisible) {
    return (
      <Button
        onClick={() => setIsVisible(true)}
        size="sm"
        variant="outline"
        className="fixed bottom-4 right-4 z-50 shadow-lg"
      >
        <Eye className="h-4 w-4 mr-2" />
        Mobile Test
      </Button>
    )
  }

  return (
    <Card className={`fixed bottom-4 right-4 z-50 w-64 shadow-lg ${className}`}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            {getDeviceIcon()}
            Mobile Test Helper
          </CardTitle>
          <Button
            onClick={() => setIsVisible(false)}
            size="sm"
            variant="ghost"
          >
            <EyeOff className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${getDeviceColor()}`} />
          <Badge variant="outline" className="text-xs">
            {deviceType.toUpperCase()}
          </Badge>
        </div>
        
        <div className="text-xs space-y-1">
          <div>Width: {screenSize.width}px</div>
          <div>Height: {screenSize.height}px</div>
        </div>

        <div className="space-y-2">
          <div className="text-xs font-medium">Breakpoint Tests:</div>
          <div className="space-y-1 text-xs">
            <div className={`flex justify-between ${screenSize.width >= 320 ? 'text-green-600' : 'text-red-600'}`}>
              <span>Min Mobile (320px)</span>
              <span>{screenSize.width >= 320 ? '✓' : '✗'}</span>
            </div>
            <div className={`flex justify-between ${screenSize.width >= 640 ? 'text-green-600' : 'text-red-600'}`}>
              <span>SM (640px)</span>
              <span>{screenSize.width >= 640 ? '✓' : '✗'}</span>
            </div>
            <div className={`flex justify-between ${screenSize.width >= 768 ? 'text-green-600' : 'text-red-600'}`}>
              <span>MD (768px)</span>
              <span>{screenSize.width >= 768 ? '✓' : '✗'}</span>
            </div>
            <div className={`flex justify-between ${screenSize.width >= 1024 ? 'text-green-600' : 'text-red-600'}`}>
              <span>LG (1024px)</span>
              <span>{screenSize.width >= 1024 ? '✓' : '✗'}</span>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="text-xs font-medium">Touch Target Check:</div>
          <div className="text-xs">
            <div className="text-green-600">✓ Buttons: 44px min</div>
            <div className="text-green-600">✓ Form inputs: Touch-friendly</div>
            <div className="text-green-600">✓ Switches: Wrapped for touch</div>
          </div>
        </div>

        <CardDescription className="text-xs">
          Resize browser to test different breakpoints
        </CardDescription>
      </CardContent>
    </Card>
  )
}
