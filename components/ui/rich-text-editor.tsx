'use client'

import React, { useEffect, useRef } from 'react'
import { cn } from "@/lib/utils"

// Declare CKEditor types for TypeScript
declare global {
  interface Window {
    CKEDITOR: any;
  }
}

interface RichTextEditorProps {
  content: string
  onChange: (content: string) => void
  placeholder?: string
  className?: string
  disabled?: boolean
}

export function RichTextEditor({
  content,
  onChange,
  placeholder = "",
  className,
  disabled = false
}: RichTextEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const editorInstanceRef = useRef<any>(null)
  const isInitializedRef = useRef(false)
  const editorIdRef = useRef(`editor1`)

  useEffect(() => {
    // Load CKEditor script exactly like in reference file
    const loadCKEditor = () => {
      if (window.CKEDITOR) {
        initializeCKEditor()
        return
      }

      // Check if script already exists
      const existingScript = document.querySelector('script[src*="ckeditor"]')
      if (existingScript) {
        // Wait for existing script to load
        existingScript.addEventListener('load', initializeCKEditor)
        return
      }

      // Create script tag exactly like reference file
      const script = document.createElement('script')
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/ckeditor/4.22.1/ckeditor.js'
      script.onload = initializeCKEditor
      document.head.appendChild(script)
    }

    const initializeCKEditor = () => {
      if (!window.CKEDITOR || isInitializedRef.current) return

      // Exact initialization from reference file
      window.CKEDITOR.env.isCompatible = true

      editorInstanceRef.current = window.CKEDITOR.replace(editorIdRef.current, {
        toolbar: "FrontCMS",
        extraPlugins: '',
        entities: false,
        allowedContent: true,
        extraAllowedContent: 'p(*)[*]{*};div(*)[*]{*};li(*)[*]{*};ul(*)[*]{*}',
        enterMode: window.CKEDITOR.ENTER_BR,
        shiftEnterMode: window.CKEDITOR.ENTER_P,
        autoParagraph: false,
        toolbar_FrontCMS: [
          { name: 'document', items: ['Source', 'Preview', 'Print'] },
          { name: 'clipboard', items: ['Cut', 'Copy', 'Paste', 'PasteText', 'PasteFromWord', '-', 'Undo', 'Redo'] },
          { name: 'editing', items: ['Find', 'Replace', '-', 'SelectAll', '-', 'SpellChecker', 'Scayt'] },
          { name: 'forms', items: ['Form', 'Checkbox', 'Radio', 'TextField', 'Textarea', 'Select', 'Button', 'ImageButton', 'HiddenField'] },
          { name: 'basicstyles', items: ['Bold', 'Italic', 'Underline', 'Strike', 'Subscript', 'Superscript', '-', 'RemoveFormat'] },
          { name: 'links', items: ['Link', 'Unlink', 'Anchor'] },
          { name: 'colors', items: ['TextColor', 'BGColor'] },
          '/',
          { name: 'insert', items: ['Image', 'Flash', 'Table', 'HorizontalRule', 'Smiley', 'SpecialChar', 'PageBreak', 'Iframe'] },
          { name: 'paragraph', items: ['NumberedList', 'BulletedList', '-', 'Outdent', 'Indent', '-', 'Blockquote', 'CreateDiv', '-', 'JustifyLeft', 'JustifyCenter', 'JustifyRight', 'JustifyBlock', '-', 'BidiLtr', 'BidiRtl'] },
          { name: 'styles', items: ['Styles', 'Format', 'Font', 'FontSize'] }
        ]
      })

      isInitializedRef.current = true

      // Set initial content if provided
      if (content) {
        editorInstanceRef.current.setData(content)
      }

      // Handle content changes
      editorInstanceRef.current.on('change', () => {
        const data = editorInstanceRef.current.getData()
        onChange(data)
      })
    }

    loadCKEditor()

    return () => {
      if (editorInstanceRef.current) {
        try {
          editorInstanceRef.current.destroy()
          editorInstanceRef.current = null
          isInitializedRef.current = false
        } catch (error) {
          console.error('Error destroying CKEditor:', error)
        }
      }
    }
  }, [])

  // Update content when prop changes
  useEffect(() => {
    if (editorInstanceRef.current && isInitializedRef.current && content !== editorInstanceRef.current.getData()) {
      editorInstanceRef.current.setData(content)
    }
  }, [content])

  return (
    <div className={cn("w-full", className)}>
      <textarea
        ref={textareaRef}
        id={editorIdRef.current}
        name="description"
        placeholder={placeholder}
        type="text"
        className="form-control ss"
        disabled={disabled}
        defaultValue={content}
      />
    </div>
  )
}
