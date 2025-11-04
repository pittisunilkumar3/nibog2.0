"use client"

import { useEffect, useState } from "react"

export default function DebugCKEditorPage() {
  const [ckEditorStatus, setCkEditorStatus] = useState<string>("Checking...")
  const [ckEditorVersion, setCkEditorVersion] = useState<string>("")
  const [scriptElements, setScriptElements] = useState<string[]>([])

  useEffect(() => {
    const checkCKEditor = () => {
      // Check if CKEditor is available
      if (typeof window !== 'undefined') {
        if (window.CKEDITOR) {
          setCkEditorStatus("✅ Available")
          setCkEditorVersion(window.CKEDITOR.version || "Unknown")
        } else {
          setCkEditorStatus("❌ Not Available")
        }

        // Check for script elements
        const scripts = Array.from(document.querySelectorAll('script[src*="ckeditor"]'))
        setScriptElements(scripts.map(script => (script as HTMLScriptElement).src))
      }
    }

    // Check immediately
    checkCKEditor()

    // Check periodically
    const interval = setInterval(checkCKEditor, 1000)

    return () => clearInterval(interval)
  }, [])

  const testCKEditor = () => {
    if (window.CKEDITOR) {
      try {
        const textarea = document.getElementById('test-textarea')
        if (textarea) {
          const editor = window.CKEDITOR.replace('test-textarea', {
            height: 200,
            toolbar: [
              { name: 'basicstyles', items: ['Bold', 'Italic'] },
              { name: 'paragraph', items: ['NumberedList', 'BulletedList'] }
            ]
          })
          console.log('Test editor created:', editor)
        }
      } catch (error) {
        console.error('Error creating test editor:', error)
      }
    }
  }

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">CKEditor Debug Page</h1>
      
      <div className="space-y-4">
        <div className="p-4 border rounded">
          <h2 className="text-lg font-semibold mb-2">CKEditor Status</h2>
          <p><strong>Status:</strong> {ckEditorStatus}</p>
          <p><strong>Version:</strong> {ckEditorVersion}</p>
        </div>

        <div className="p-4 border rounded">
          <h2 className="text-lg font-semibold mb-2">Script Elements</h2>
          {scriptElements.length > 0 ? (
            <ul className="list-disc pl-5">
              {scriptElements.map((src, index) => (
                <li key={index} className="text-sm">{src}</li>
              ))}
            </ul>
          ) : (
            <p>No CKEditor scripts found</p>
          )}
        </div>

        <div className="p-4 border rounded">
          <h2 className="text-lg font-semibold mb-2">Test CKEditor</h2>
          <textarea id="test-textarea" className="w-full h-20 border p-2 mb-2">
            Test content for CKEditor
          </textarea>
          <button 
            onClick={testCKEditor}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Initialize Test Editor
          </button>
        </div>

        <div className="p-4 border rounded">
          <h2 className="text-lg font-semibold mb-2">Console Output</h2>
          <p className="text-sm text-gray-600">Check the browser console for detailed logs</p>
        </div>
      </div>
    </div>
  )
}
