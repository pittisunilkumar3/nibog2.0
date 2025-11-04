"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { fetchEventImages } from "@/services/eventService"

export default function TestEvent99Images() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const testFetchImages = async () => {
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      console.log('🔍 Testing fetchEventImages(99) with mapping...')
      
      const images = await fetchEventImages(99)
      console.log('✅ Images fetched:', images)
      
      setResult({
        success: true,
        imageCount: images.length,
        images: images
      })

    } catch (err: any) {
      console.error('❌ Test error:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const testDirectAPI = async () => {
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      console.log('📡 Testing direct API call to event 99...')
      
      const response = await fetch('/api/eventimages/get', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ event_id: 99 }),
      })

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`)
      }

      const data = await response.json()
      console.log('📊 Direct API response:', data)
      
      setResult({
        success: true,
        type: 'direct',
        response: data
      })

    } catch (err: any) {
      console.error('❌ Direct API test error:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const testWorkingAPI = async () => {
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      console.log('📡 Testing working API ID 6...')
      
      const response = await fetch('/api/eventimages/get', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ event_id: 6 }),
      })

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`)
      }

      const data = await response.json()
      console.log('📊 Working API response:', data)
      
      setResult({
        success: true,
        type: 'working',
        response: data
      })

    } catch (err: any) {
      console.error('❌ Working API test error:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle>Test Event 99 Image Fetching</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2 flex-wrap">
            <Button onClick={testFetchImages} disabled={loading}>
              {loading ? "Testing..." : "Test Mapping System"}
            </Button>
            <Button onClick={testDirectAPI} disabled={loading} variant="outline">
              Test Direct API (Event 99)
            </Button>
            <Button onClick={testWorkingAPI} disabled={loading} variant="outline">
              Test Working API (ID 6)
            </Button>
          </div>

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <h3 className="font-medium text-red-800">Error:</h3>
              <p className="text-red-700">{error}</p>
            </div>
          )}

          {result && (
            <div className="space-y-4">
              {result.success && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <h3 className="font-medium text-green-800">Success!</h3>
                  {result.imageCount !== undefined && (
                    <p className="text-green-700">Found {result.imageCount} images with mapping system</p>
                  )}
                  {result.type && (
                    <p className="text-green-700">Test type: {result.type}</p>
                  )}
                </div>
              )}

              <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                <h3 className="font-medium text-gray-800">Response:</h3>
                <pre className="text-xs text-gray-600 mt-2 overflow-auto max-h-96">
                  {JSON.stringify(result, null, 2)}
                </pre>
              </div>

              {result.images && result.images.length > 0 && (
                <div className="space-y-2">
                  <h3 className="font-medium text-gray-800">Image Details:</h3>
                  {result.images.map((img: any, index: number) => (
                    <div key={index} className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div><strong>ID:</strong> {img.id}</div>
                        <div><strong>Event ID:</strong> {img.event_id}</div>
                        <div><strong>Priority:</strong> {img.priority}</div>
                        <div><strong>Active:</strong> {img.is_active ? 'Yes' : 'No'}</div>
                        <div className="col-span-2"><strong>Image URL:</strong> {img.image_url}</div>
                        <div><strong>Created:</strong> {new Date(img.created_at).toLocaleString()}</div>
                        <div><strong>Updated:</strong> {new Date(img.updated_at).toLocaleString()}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="font-medium text-blue-800">Expected Results:</h3>
            <ul className="text-blue-700 text-sm mt-2 space-y-1">
              <li>• <strong>Mapping System:</strong> Should find 1 image with priority 4</li>
              <li>• <strong>Direct API (Event 99):</strong> Should return empty object [{}]</li>
              <li>• <strong>Working API (ID 6):</strong> Should return image with event_id: 99</li>
              <li>• <strong>Image URL:</strong> eventimage_1757958299602_7914.png</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
