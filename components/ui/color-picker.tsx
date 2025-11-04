"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { Check, Palette } from "lucide-react"

interface ColorPickerProps {
  value: string
  onChange: (color: string) => void
  label?: string
  className?: string
  disabled?: boolean
}

// Predefined color palette for quick selection
const PRESET_COLORS = [
  "#000000", "#FFFFFF", "#FF0000", "#00FF00", "#0000FF", "#FFFF00", "#FF00FF", "#00FFFF",
  "#800000", "#008000", "#000080", "#808000", "#800080", "#008080", "#C0C0C0", "#808080",
  "#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4", "#FFEAA7", "#DDA0DD", "#98D8C8", "#F7DC6F",
  "#BB8FCE", "#85C1E9", "#F8C471", "#82E0AA", "#F1948A", "#AED6F1", "#A9DFBF", "#F9E79F",
  "#D7BDE2", "#A3E4D7", "#FAD7A0", "#D5A6BD", "#85929E", "#F4F6F6", "#EAEDED", "#D5DBDB"
]

export function ColorPicker({ value, onChange, label, className, disabled }: ColorPickerProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  const [customColor, setCustomColor] = React.useState(value)

  React.useEffect(() => {
    setCustomColor(value)
  }, [value])

  const handlePresetColorSelect = (color: string) => {
    onChange(color)
    setCustomColor(color)
    setIsOpen(false)
  }

  const handleCustomColorChange = (color: string) => {
    setCustomColor(color)
    onChange(color)
  }

  const handleCustomColorBlur = () => {
    // Validate hex color format
    const hexRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/
    if (!hexRegex.test(customColor)) {
      setCustomColor(value) // Reset to original value if invalid
    }
  }

  return (
    <div className={cn("space-y-2", className)}>
      {label && <Label>{label}</Label>}
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-full justify-start text-left font-normal h-10",
              !value && "text-muted-foreground"
            )}
            disabled={disabled}
          >
            <div className="flex items-center gap-2">
              <div
                className="w-4 h-4 rounded border border-gray-300"
                style={{ backgroundColor: value }}
              />
              <span>{value || "Select color"}</span>
              <Palette className="ml-auto h-4 w-4" />
            </div>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-64 p-3" align="start">
          <div className="space-y-3">
            {/* Preset Colors */}
            <div>
              <Label className="text-xs font-medium text-muted-foreground">Preset Colors</Label>
              <div className="grid grid-cols-8 gap-1 mt-2">
                {PRESET_COLORS.map((color) => (
                  <button
                    key={color}
                    className={cn(
                      "w-6 h-6 rounded border border-gray-200 hover:scale-110 transition-transform relative",
                      value === color && "ring-2 ring-primary ring-offset-1"
                    )}
                    style={{ backgroundColor: color }}
                    onClick={() => handlePresetColorSelect(color)}
                    title={color}
                  >
                    {value === color && (
                      <Check className="w-3 h-3 text-white absolute inset-0 m-auto drop-shadow-sm" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Color Input */}
            <div className="space-y-2">
              <Label className="text-xs font-medium text-muted-foreground">Custom Color</Label>
              <div className="flex gap-2">
                <div className="flex-1">
                  <Input
                    type="text"
                    value={customColor}
                    onChange={(e) => setCustomColor(e.target.value)}
                    onBlur={handleCustomColorBlur}
                    placeholder="#000000"
                    className="font-mono text-sm"
                  />
                </div>
                <Input
                  type="color"
                  value={customColor}
                  onChange={(e) => handleCustomColorChange(e.target.value)}
                  className="w-12 h-10 p-1 cursor-pointer"
                />
              </div>
            </div>

            {/* Apply Button */}
            <Button
              onClick={() => {
                onChange(customColor)
                setIsOpen(false)
              }}
              className="w-full"
              size="sm"
            >
              Apply Color
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}
