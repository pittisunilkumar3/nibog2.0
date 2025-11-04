"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle2, AlertCircle, Camera, CameraOff } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// Mock implementation of Html5Qrcode
class MockHtml5Qrcode {
  private elementId: string;
  private onScanSuccess: (decodedText: string) => void;
  private onScanError: (error: string) => void;
  private mockInterval: NodeJS.Timeout | null = null;

  constructor(elementId: string) {
    this.elementId = elementId;
  }

  start(
    cameraConfig: any,
    scanConfig: any,
    onScanSuccess: (decodedText: string) => void,
    onScanError: (error: string) => void
  ) {
    this.onScanSuccess = onScanSuccess;
    this.onScanError = onScanError;

    // Simulate scanning after 3 seconds
    this.mockInterval = setTimeout(() => {
      // Mock a successful scan
      const mockQrData = {
        type: "ticket",
        bookingId: "BOOK" + Math.floor(Math.random() * 10000),
        eventId: "1", // This should match the eventId prop for success
      };

      this.onScanSuccess(JSON.stringify(mockQrData));
    }, 3000);

    return Promise.resolve();
  }

  stop() {
    if (this.mockInterval) {
      clearTimeout(this.mockInterval);
      this.mockInterval = null;
    }
    return Promise.resolve();
  }
}

interface QrCodeScannerProps {
  eventId: string
  onScanSuccess?: (bookingId: string, type: "entry" | "addon", addonId?: string) => void
  onScanError?: (error: string) => void
}

export default function QrCodeScanner({ eventId, onScanSuccess, onScanError }: QrCodeScannerProps) {
  const [scanning, setScanning] = useState(false)
  const [scanResult, setScanResult] = useState<{ success: boolean; message: string } | null>(null)
  const [scanType, setScanType] = useState<"entry" | "addon">("entry")
  const scannerContainerId = "qr-reader"
  // Use a simple state variable instead of a ref for the mock scanner
  const [scanner, setScanner] = useState<MockHtml5Qrcode | null>(null)

  const startScanner = async () => {
    try {
      setScanResult(null)

      const newScanner = new MockHtml5Qrcode(scannerContainerId)
      setScanner(newScanner)

      await newScanner.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        handleScanSuccess,
        handleScanError
      )

      setScanning(true)
    } catch (error) {
      console.error("Error starting scanner:", error)
      setScanResult({
        success: false,
        message: "Failed to start camera. Please check camera permissions.",
      })
    }
  }

  const stopScanner = async () => {
    if (scanner && scanning) {
      try {
        await scanner.stop()
        setScanning(false)
      } catch (error) {
        console.error("Error stopping scanner:", error)
      }
    }
  }

  const handleScanSuccess = (decodedText: string) => {
    try {
      // Stop scanning after successful scan
      stopScanner()

      // Parse the QR code data
      const qrData = JSON.parse(decodedText)

      if (scanType === "entry") {
        // For event entry QR code
        if (qrData.type === "ticket" && qrData.bookingId && qrData.eventId) {
          // Verify this is for the current event
          if (qrData.eventId === eventId) {
            setScanResult({
              success: true,
              message: `Successfully scanned ticket for booking ${qrData.bookingId}`,
            })

            // Call the success callback
            onScanSuccess?.(qrData.bookingId, "entry")
          } else {
            setScanResult({
              success: false,
              message: `Invalid ticket: This ticket is for a different event`,
            })
          }
        } else {
          setScanResult({
            success: false,
            message: "Invalid QR code format for event entry",
          })
        }
      } else if (scanType === "addon") {
        // For add-on collection QR code
        if (qrData.type === "addon" && qrData.bookingId && qrData.addonId) {
          setScanResult({
            success: true,
            message: `Successfully scanned add-on ${qrData.addonId} for booking ${qrData.bookingId}`,
          })

          // Call the success callback
          onScanSuccess?.(qrData.bookingId, "addon", qrData.addonId)
        } else {
          setScanResult({
            success: false,
            message: "Invalid QR code format for add-on collection",
          })
        }
      }
    } catch (error) {
      console.error("Error processing QR code:", error)
      setScanResult({
        success: false,
        message: "Invalid QR code format",
      })

      // Call the error callback
      onScanError?.("Invalid QR code format")
    }
  }

  const handleScanError = (error: string) => {
    console.error("QR Scan error:", error)
    // We don't set scan result on every error as it would be too noisy
    // Only set it if explicitly stopping the scanner

    // Call the error callback
    onScanError?.(error)
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>QR Code Scanner</CardTitle>
        <CardDescription>
          Scan QR codes for event entry or add-on collection
        </CardDescription>
      </CardHeader>

      <Tabs value={scanType} onValueChange={(value) => setScanType(value as "entry" | "addon")}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="entry">Event Entry</TabsTrigger>
          <TabsTrigger value="addon">Add-on Collection</TabsTrigger>
        </TabsList>

        <TabsContent value="entry" className="mt-0">
          <CardContent className="pt-4">
            <p className="text-sm text-muted-foreground mb-4">
              Scan the QR code on the participant's ticket to mark their attendance.
            </p>

            <div id={scannerContainerId} className="w-full h-64 bg-muted rounded-md overflow-hidden relative">
              {!scanning && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <p className="text-muted-foreground">Camera is off</p>
                </div>
              )}
            </div>

            {scanResult && (
              <Alert className="mt-4" variant={scanResult.success ? "default" : "destructive"}>
                {scanResult.success ? (
                  <CheckCircle2 className="h-4 w-4" />
                ) : (
                  <AlertCircle className="h-4 w-4" />
                )}
                <AlertTitle>{scanResult.success ? "Success" : "Error"}</AlertTitle>
                <AlertDescription>{scanResult.message}</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </TabsContent>

        <TabsContent value="addon" className="mt-0">
          <CardContent className="pt-4">
            <p className="text-sm text-muted-foreground mb-4">
              Scan the QR code for add-on collection to track which add-ons have been collected.
            </p>

            <div id={scannerContainerId} className="w-full h-64 bg-muted rounded-md overflow-hidden relative">
              {!scanning && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <p className="text-muted-foreground">Camera is off</p>
                </div>
              )}
            </div>

            {scanResult && (
              <Alert className="mt-4" variant={scanResult.success ? "default" : "destructive"}>
                {scanResult.success ? (
                  <CheckCircle2 className="h-4 w-4" />
                ) : (
                  <AlertCircle className="h-4 w-4" />
                )}
                <AlertTitle>{scanResult.success ? "Success" : "Error"}</AlertTitle>
                <AlertDescription>{scanResult.message}</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </TabsContent>
      </Tabs>

      <CardFooter className="flex justify-between">
        {!scanning ? (
          <Button onClick={startScanner} className="w-full">
            <Camera className="mr-2 h-4 w-4" />
            Start Scanning
          </Button>
        ) : (
          <Button onClick={stopScanner} variant="outline" className="w-full">
            <CameraOff className="mr-2 h-4 w-4" />
            Stop Scanning
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}
