"use client"

import { useState } from "react"
import { RichTextEditor } from "@/components/ui/rich-text-editor"

export default function TestEditorPage() {
  const [content, setContent] = useState("")

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">CKEditor Test Page</h1>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Rich Text Editor:</label>
          <RichTextEditor
            content={content}
            onChange={setContent}
            placeholder="Start typing to test the editor..."
            className="border border-gray-300 rounded-md"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">Current Content:</label>
          <pre className="bg-gray-100 p-4 rounded-md text-sm overflow-auto max-h-40">
            {content || "No content yet..."}
          </pre>
        </div>
      </div>
    </div>
  )
}
