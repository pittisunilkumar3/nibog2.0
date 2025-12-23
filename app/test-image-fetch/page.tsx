"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function TestImageFetch() {
  const [eventId, setEventId] = useState("4")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const testFetch = async () => {
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      
      const response = await fetch('/api/eventimages/get', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          event_id: parseInt(eventId)
        }),
      })


      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`API error: ${response.status} - ${errorText}`)
      }

      const data = await response.json()
      setResult(data)

    } catch (err: any) {
      console.error('Test error:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle>Test Event Image Fetch</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              type="number"
              value={eventId}
              onChange={(e) => setEventId(e.target.value)}
              placeholder="Event ID"
              className="w-32"
            />
            <Button onClick={testFetch} disabled={loading}>
              {loading ? "Testing..." : "Test Fetch"}
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
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <h3 className="font-medium text-green-800">Success!</h3>
                <p className="text-green-700">Found {Array.isArray(result) ? result.length : 0} images</p>
              </div>

              <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                <h3 className="font-medium text-gray-800">Raw Response:</h3>
                <pre className="text-xs text-gray-600 mt-2 overflow-auto">
                  {JSON.stringify(result, null, 2)}
                </pre>
              </div>

              {Array.isArray(result) && result.length > 0 && (
                <div className="space-y-2">
                  <h3 className="font-medium text-gray-800">Parsed Images:</h3>
                  {result.map((img, index) => (
                    <div key={index} className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div><strong>ID:</strong> {img.id || 'N/A'}</div>
                        <div><strong>Event ID:</strong> {img.event_id || 'N/A'}</div>
                        <div><strong>Priority:</strong> {img.priority || 'N/A'}</div>
                        <div><strong>Active:</strong> {img.is_active ? 'Yes' : 'No'}</div>
                        <div className="col-span-2"><strong>Image URL:</strong> {img.image_url || 'N/A'}</div>
                        <div><strong>Created:</strong> {img.created_at || 'N/A'}</div>
                        <div><strong>Updated:</strong> {img.updated_at || 'N/A'}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="font-medium text-blue-800">Test Instructions:</h3>
            <ul className="text-blue-700 text-sm mt-2 space-y-1">
              <li>• Try Event ID 4 (should have images)</li>
              <li>• Try Event ID 99 (might not have images)</li>
              <li>• Try Event ID 131 (check if it has images)</li>
              <li>• Check browser console for detailed logs</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
