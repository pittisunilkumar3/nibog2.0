"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getFooterSettingWithFallback, type FooterSetting } from "@/services/footerSettingService"
import Footer from "@/components/footer"

export default function TestFooterPage() {
  const [footerData, setFooterData] = useState<FooterSetting | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const testFooterAPI = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await getFooterSettingWithFallback()
      setFooterData(data)
    } catch (err) {
      console.error('❌ Footer API test failed:', err)
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    testFooterAPI()
  }, [])

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Footer Component Test Page</h1>
          <p className="text-muted-foreground mt-2">
            This page tests the footer component and API integration
          </p>
        </div>

        {/* API Test Results */}
        <Card>
          <CardHeader>
            <CardTitle>Footer API Test Results</CardTitle>
            <CardDescription>
              Testing the footer settings API and data flow
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <Button onClick={testFooterAPI} disabled={isLoading}>
                {isLoading ? 'Testing...' : 'Test Footer API'}
              </Button>
              {isLoading && <div className="text-sm text-muted-foreground">Loading...</div>}
              {error && <div className="text-sm text-red-500">Error: {error}</div>}
            </div>

            {footerData && (
              <div className="space-y-4">
                <h3 className="font-semibold">Footer Data Retrieved:</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <strong>Company Name:</strong> 
                    <span className="ml-2 p-1 bg-muted rounded">{footerData.company_name}</span>
                  </div>
                  <div>
                    <strong>Email:</strong> 
                    <span className="ml-2 p-1 bg-muted rounded">{footerData.email}</span>
                  </div>
                  <div>
                    <strong>Phone:</strong> 
                    <span className="ml-2 p-1 bg-muted rounded">{footerData.phone}</span>
                  </div>
                  <div>
                    <strong>Newsletter Enabled:</strong> 
                    <span className="ml-2 p-1 bg-muted rounded">
                      {footerData.newsletter_enabled ? 'Yes' : 'No'}
                    </span>
                  </div>
                </div>
                
                <div>
                  <strong>Company Description:</strong>
                  <p className="mt-1 p-2 bg-muted rounded text-sm">
                    {footerData.company_description}
                  </p>
                </div>

                <div>
                  <strong>Address:</strong>
                  <p className="mt-1 p-2 bg-muted rounded text-sm whitespace-pre-line">
                    {footerData.address}
                  </p>
                </div>

                <div>
                  <strong>Social Media URLs:</strong>
                  <div className="mt-1 grid grid-cols-2 gap-2 text-sm">
                    <div>Facebook: {footerData.facebook_url || 'Not set'}</div>
                    <div>Instagram: {footerData.instagram_url || 'Not set'}</div>
                    <div>LinkedIn: {footerData.linkedin_url || 'Not set'}</div>
                    <div>YouTube: {footerData.youtube_url || 'Not set'}</div>
                  </div>
                </div>

                <div>
                  <strong>Copyright Text:</strong>
                  <p className="mt-1 p-2 bg-muted rounded text-sm">
                    {footerData.copyright_text}
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Visual Test Instructions */}
        <Card>
          <CardHeader>
            <CardTitle>Visual Test Instructions</CardTitle>
            <CardDescription>
              Check the footer below for proper display
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border border-gray-300 rounded"></div>
                <span>Company name should be visible with purple gradient text</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border border-gray-300 rounded"></div>
                <span>Company description should appear below the company name</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border border-gray-300 rounded"></div>
                <span>Social media icons should only show if URLs are configured</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border border-gray-300 rounded"></div>
                <span>Contact information should display correctly</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border border-gray-300 rounded"></div>
                <span>Newsletter section should be conditional</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border border-gray-300 rounded"></div>
                <span>Copyright text should show current year</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Debug Information */}
        <Card>
          <CardHeader>
            <CardTitle>Debug Information</CardTitle>
            <CardDescription>
              Technical details for troubleshooting
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm font-mono">
              <div>API Endpoint: https://ai.nibog.in/webhook/v1/nibog/footer_setting/get</div>
              <div>Component: components/footer.tsx</div>
              <div>Service: services/footerSettingService.ts</div>
              <div>Test Page: app/test-footer/page.tsx</div>
            </div>
            
            <div className="mt-4">
              <strong>Browser Console Commands:</strong>
              <div className="mt-2 p-2 bg-muted rounded text-sm font-mono">
                <div>// Test API directly:</div>
                {(() => {
                  fetch('https://ai.nibog.in/webhook/v1/nibog/footer_setting/get')
                    .then(r => r.json())
                    .then(data => console.log(data));
                  return null;
                })()}
                <div className="mt-2">// Check footer element:</div>
                <div>document.querySelector('footer h3').textContent</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Spacer to push footer down */}
        <div className="h-32"></div>
      </div>

      {/* Footer Component */}
      <Footer />
    </div>
  )
}
