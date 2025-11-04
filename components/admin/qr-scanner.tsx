"use client"

import { useState, useEffect, useRef } from "react"
import { Html5Qrcode } from "html5-qrcode"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { QrCode, Check, X, Camera, CameraOff, Volume2, VolumeX, RefreshCw } from "lucide-react"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"

interface QrScannerProps {
  onScan: (decodedText: string, decodedResult: any) => void
  scanType: "event" | "addon"
}

export default function QrScanner({ onScan, scanType }: QrScannerProps) {
  const [scanning, setScanning] = useState(false)
  const [cameraId, setCameraId] = useState<string | null>(null)
  const [cameras, setCameras] = useState<Array<{ id: string; label: string }>>([])
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [muted, setMuted] = useState(false)
  const [lastScanned, setLastScanned] = useState<string | null>(null)
  const [scanHistory, setScanHistory] = useState<Array<{ code: string; time: Date; success: boolean }>>([])
  
  const scannerRef = useRef<Html5Qrcode | null>(null)
  const scannerContainerRef = useRef<HTMLDivElement>(null)
  const successAudioRef = useRef<HTMLAudioElement>(null)
  const errorAudioRef = useRef<HTMLAudioElement>(null)
  
  // Initialize scanner and get available cameras
  useEffect(() => {
    if (typeof window !== "undefined") {
      Html5Qrcode.getCameras()
        .then(devices => {
          if (devices && devices.length) {
            setCameras(devices.map(device => ({ id: device.id, label: device.label })))
            setCameraId(devices[0].id)
          }
        })
        .catch(err => {
          setError("Unable to access camera: " + err)
        })
    }
    
    return () => {
      if (scannerRef.current && scannerRef.current.isScanning) {
        scannerRef.current.stop().catch(console.error)
      }
    }
  }, [])
  
  const startScanner = async () => {
    if (!cameraId || !scannerContainerRef.current) return
    
    setError(null)
    setSuccess(null)
    
    try {
      if (!scannerRef.current) {
        scannerRef.current = new Html5Qrcode("qr-scanner-container")
      }
      
      await scannerRef.current.start(
        cameraId,
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1,
        },
        (decodedText, decodedResult) => {
          handleScan(decodedText, decodedResult)
        },
        (errorMessage) => {
          // QR code scan error (not found in frame)
          // We don't need to show this to the user
          console.log(errorMessage)
        }
      )
      
      setScanning(true)
    } catch (err) {
      setError("Failed to start scanner: " + err)
      setScanning(false)
    }
  }
  
  const stopScanner = async () => {
    if (scannerRef.current && scannerRef.current.isScanning) {
      try {
        await scannerRef.current.stop()
        setScanning(false)
      } catch (err) {
        console.error("Failed to stop scanner:", err)
      }
    }
  }
  
  const handleScan = (decodedText: string, decodedResult: any) => {
    // Prevent duplicate scans
    if (lastScanned === decodedText) return
    
    setLastScanned(decodedText)
    
    // Validate QR code format
    let isValid = false
    try {
      // Check if it's a valid JSON
      const data = JSON.parse(decodedText)
      
      // Validate based on scan type
      if (scanType === "event" && data.type === "event-ticket") {
        isValid = true
        setSuccess(`Valid ticket: ${data.ticketId}`)
      } else if (scanType === "addon" && data.type === "addon") {
        isValid = true
        setSuccess(`Valid add-on: ${data.addonName}`)
      } else {
        setError(`Invalid QR code type for ${scanType} scanning`)
      }
    } catch (e) {
      setError("Invalid QR code format")
    }
    
    // Play sound
    if (!muted) {
      if (isValid && successAudioRef.current) {
        successAudioRef.current.play().catch(console.error)
      } else if (!isValid && errorAudioRef.current) {
        errorAudioRef.current.play().catch(console.error)
      }
    }
    
    // Add to scan history
    setScanHistory(prev => [
      { code: decodedText, time: new Date(), success: isValid },
      ...prev.slice(0, 9) // Keep only the last 10 scans
    ])
    
    // Call the onScan callback
    onScan(decodedText, decodedResult)
    
    // Reset after 3 seconds
    setTimeout(() => {
      setSuccess(null)
      setError(null)
      setLastScanned(null)
    }, 3000)
  }
  
  const toggleMute = () => {
    setMuted(!muted)
  }
  
  const switchCamera = async () => {
    if (scanning) {
      await stopScanner()
    }
    
    // Cycle to the next camera
    if (cameras.length > 1) {
      const currentIndex = cameras.findIndex(cam => cam.id === cameraId)
      const nextIndex = (currentIndex + 1) % cameras.length
      setCameraId(cameras[nextIndex].id)
    }
  }
  
  useEffect(() => {
    if (scanning && cameraId) {
      stopScanner().then(startScanner)
    }
  }, [cameraId])
  
  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>QR Code Scanner</CardTitle>
            <CardDescription>
              {scanType === "event" ? "Scan event tickets" : "Scan add-on QR codes"}
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="icon" 
              onClick={toggleMute}
              title={muted ? "Unmute" : "Mute"}
            >
              {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            </Button>
            {cameras.length > 1 && (
              <Button 
                variant="outline" 
                size="icon" 
                onClick={switchCamera}
                title="Switch Camera"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div 
            className="relative mx-auto aspect-square max-w-md overflow-hidden rounded-lg border bg-black"
          >
            <div 
              id="qr-scanner-container" 
              ref={scannerContainerRef} 
              className="h-full w-full"
            />
            
            {/* Scanner overlay with animation */}
            {scanning && (
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                <div className="relative h-64 w-64">
                  {/* Corner markers */}
                  <div className="absolute left-0 top-0 h-8 w-8 border-l-2 border-t-2 border-green-500"></div>
                  <div className="absolute right-0 top-0 h-8 w-8 border-r-2 border-t-2 border-green-500"></div>
                  <div className="absolute bottom-0 left-0 h-8 w-8 border-b-2 border-l-2 border-green-500"></div>
                  <div className="absolute bottom-0 right-0 h-8 w-8 border-b-2 border-r-2 border-green-500"></div>
                  
                  {/* Scanning line animation */}
                  <motion.div 
                    className="absolute left-0 h-0.5 w-full bg-green-500"
                    initial={{ top: 0 }}
                    animate={{ top: "100%" }}
                    transition={{ 
                      duration: 2, 
                      repeat: Infinity, 
                      ease: "linear" 
                    }}
                  />
                </div>
              </div>
            )}
            
            {/* Status overlays */}
            <AnimatePresence>
              {!scanning && (
                <motion.div 
                  className="absolute inset-0 flex flex-col items-center justify-center bg-black/80"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <QrCode className="mb-4 h-16 w-16 text-white" />
                  <p className="text-center text-white">
                    Camera is off. Click "Start Scanning" to begin.
                  </p>
                </motion.div>
              )}
              
              {success && (
                <motion.div 
                  className="absolute inset-0 flex flex-col items-center justify-center bg-green-500/80"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <Check className="mb-4 h-16 w-16 text-white" />
                  <p className="text-center text-white font-medium">{success}</p>
                </motion.div>
              )}
              
              {error && (
                <motion.div 
                  className="absolute inset-0 flex flex-col items-center justify-center bg-red-500/80"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <X className="mb-4 h-16 w-16 text-white" />
                  <p className="text-center text-white font-medium">{error}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          <div className="flex justify-center">
            {!scanning ? (
              <Button onClick={startScanner} disabled={!cameraId}>
                <Camera className="mr-2 h-4 w-4" />
                Start Scanning
              </Button>
            ) : (
              <Button onClick={stopScanner} variant="outline">
                <CameraOff className="mr-2 h-4 w-4" />
                Stop Scanning
              </Button>
            )}
          </div>
        </div>
        
        {/* Hidden audio elements */}
        <audio ref={successAudioRef} src="/sounds/success-scan.mp3" preload="auto" />
        <audio ref={errorAudioRef} src="/sounds/error-scan.mp3" preload="auto" />
      </CardContent>
      <CardFooter className="flex flex-col">
        <Tabs defaultValue="history" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="history">Scan History</TabsTrigger>
            <TabsTrigger value="help">Help</TabsTrigger>
          </TabsList>
          <TabsContent value="history" className="mt-4">
            <div className="max-h-60 overflow-y-auto rounded-md border">
              {scanHistory.length === 0 ? (
                <div className="flex h-20 items-center justify-center text-sm text-muted-foreground">
                  No scans yet
                </div>
              ) : (
                <div className="space-y-2 p-2">
                  {scanHistory.map((scan, index) => (
                    <div 
                      key={index} 
                      className={cn(
                        "flex items-center justify-between rounded-md border p-2",
                        scan.success ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"
                      )}
                    >
                      <div className="flex items-center gap-2">
                        {scan.success ? (
                          <Check className="h-4 w-4 text-green-500" />
                        ) : (
                          <X className="h-4 w-4 text-red-500" />
                        )}
                        <div className="text-sm font-medium truncate max-w-[200px]">
                          {scan.code}
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {scan.time.toLocaleTimeString()}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>
          <TabsContent value="help" className="mt-4">
            <div className="rounded-md border p-4">
              <h3 className="font-medium">Scanning Tips</h3>
              <ul className="mt-2 space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <Check className="mt-0.5 h-4 w-4 text-green-500 shrink-0" />
                  <span>Hold the QR code steady and ensure it's well-lit</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="mt-0.5 h-4 w-4 text-green-500 shrink-0" />
                  <span>Position the QR code within the scanning frame</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="mt-0.5 h-4 w-4 text-green-500 shrink-0" />
                  <span>Make sure the QR code is not damaged or obscured</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="mt-0.5 h-4 w-4 text-green-500 shrink-0" />
                  <span>If scanning fails, try adjusting the distance or angle</span>
                </li>
              </ul>
            </div>
          </TabsContent>
        </Tabs>
      </CardFooter>
    </Card>
  )
}
