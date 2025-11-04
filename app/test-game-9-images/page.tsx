"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { fetchGameImages } from "@/services/babyGameService"

export default function TestGame9Images() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const testFetchGameImages = async () => {
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      console.log('🔍 Testing fetchGameImages(9)...')
      
      const images = await fetchGameImages(9)
      console.log('✅ Game images fetched:', images)
      
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
      console.log('📡 Testing direct API call to game 9...')
      
      const response = await fetch('/api/gamesimage/get', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ game_id: 9 }),
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

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle>Test Game 9 Image Fetching</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2 flex-wrap">
            <Button onClick={testFetchGameImages} disabled={loading}>
              {loading ? "Testing..." : "Test Game Service"}
            </Button>
            <Button onClick={testDirectAPI} disabled={loading} variant="outline">
              Test Direct API
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
                    <p className="text-green-700">Found {result.imageCount} images</p>
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
                  <h3 className="font-medium text-gray-800">Game Image Details:</h3>
                  {result.images.map((img: any, index: number) => (
                    <div key={index} className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div><strong>ID:</strong> {img.id}</div>
                        <div><strong>Game ID:</strong> {img.game_id}</div>
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
              <li>• <strong>Game Service:</strong> Should find 1 image with priority 1</li>
              <li>• <strong>Direct API:</strong> Should return same image data</li>
              <li>• <strong>Image URL:</strong> gameimage_1757958552367_9377.jpg</li>
              <li>• <strong>Priority:</strong> 1</li>
              <li>• <strong>Status:</strong> Active</li>
            </ul>
          </div>

          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <h3 className="font-medium text-green-800">Edit Page Test:</h3>
            <p className="text-green-700 text-sm mt-2">
              After confirming the API works here, test the edit page:
            </p>
            <a 
              href="/admin/games/9/edit" 
              className="text-blue-600 hover:text-blue-800 underline text-sm"
              target="_blank"
            >
              🔗 Open Game 9 Edit Page
            </a>
            <div className="text-green-600 text-xs mt-2">
              Expected: Priority field should show "1" and Current Game Images section should display the image
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
