"use client"

import { useState } from "react"
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"
import { cn, calculateAgeInMonths, formatAge } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Badge } from "./ui/badge"

export default function AgeSelector() {
  const [date, setDate] = useState<Date | undefined>(undefined)

  // Calculate age in months if date is selected
  const ageInMonths = date ? calculateAgeInMonths(date) : null

  // Determine age category
  const getAgeCategory = (months: number | null) => {
    if (months === null) return null
    if (months < 5) return "Too young for our events (minimum age: 5 months)"
    if (months <= 12) return "Babies (5-12 months)"
    if (months <= 24) return "Toddlers (1-2 years)"
    if (months <= 60) return "Preschoolers (2-5 years)"
    if (months <= 144) return "School Age (5-12 years)"
    return "Too old for our events (maximum age: 12 years)"
  }

  const ageCategory = getAgeCategory(ageInMonths)
  const isEligible = ageInMonths !== null && ageInMonths >= 5 && ageInMonths <= 144

  return (
    <div className="flex flex-col gap-2">
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date ? format(date, "PPP") : "Select child's date of birth"}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0">
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            initialFocus
            disabled={(date) => {
              const today = new Date()
              const minDate = new Date()
              minDate.setFullYear(today.getFullYear() - 12) // 12 years ago
              const maxDate = new Date()
              maxDate.setMonth(today.getMonth() - 5) // 5 months ago

              return date > maxDate || date < minDate
            }}
            fromYear={new Date().getFullYear() - 12}
            toYear={new Date().getFullYear()}
          />
        </PopoverContent>
      </Popover>
      {ageInMonths !== null && (
        <div className="space-y-1">
          <p className="text-sm">
            <span className="font-medium">Child's age:</span> {formatAge(ageInMonths)}
          </p>
          <div>
            {isEligible ? (
              <Badge className="bg-green-500">{ageCategory}</Badge>
            ) : (
              <Badge variant="destructive">{ageCategory}</Badge>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
