"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { truncateText } from "@/lib/text-utils"

interface TruncatedTextProps {
  text: string | null | undefined
  maxLength?: number
  className?: string
  showTooltip?: boolean
  expandable?: boolean
}

export function TruncatedText({ 
  text, 
  maxLength = 150, 
  className = "", 
  showTooltip = true,
  expandable = false 
}: TruncatedTextProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  
  if (!text) return null
  
  const shouldTruncate = text.length > maxLength
  const displayText = shouldTruncate && !isExpanded ? truncateText(text, maxLength) : text
  
  if (!shouldTruncate) {
    return <span className={className}>{text}</span>
  }
  
  if (expandable) {
    return (
      <div className={className}>
        <span>{displayText}</span>
        {shouldTruncate && (
          <Button
            variant="link"
            size="sm"
            className="h-auto p-0 ml-1 text-xs"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? "Show less" : "Show more"}
          </Button>
        )}
      </div>
    )
  }
  
  if (showTooltip && shouldTruncate) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <span className={`cursor-help ${className}`}>{displayText}</span>
          </TooltipTrigger>
          <TooltipContent className="max-w-xs">
            <p>{text}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }
  
  return <span className={className}>{displayText}</span>
}
