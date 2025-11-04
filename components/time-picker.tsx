"use client"

import * as React from "react"
import { Clock } from "lucide-react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

interface TimePickerProps {
  date: Date | undefined
  setDate: (date: Date | undefined) => void
  label?: string
}

export function TimePickerDemo({
  date,
  setDate,
  label,
}: TimePickerProps) {
  const minuteRef = React.useRef<HTMLInputElement>(null)
  const hourRef = React.useRef<HTMLInputElement>(null)
  const periodRef = React.useRef<HTMLButtonElement>(null)

  const [hour, setHour] = React.useState<number>(date ? date.getHours() % 12 || 12 : 12)
  const [minute, setMinute] = React.useState<number>(date ? date.getMinutes() : 0)
  const [period, setPeriod] = React.useState<"AM" | "PM">(
    date ? (date.getHours() >= 12 ? "PM" : "AM") : "AM"
  )

  React.useEffect(() => {
    if (!date) return

    setHour(date.getHours() % 12 || 12)
    setMinute(date.getMinutes())
    setPeriod(date.getHours() >= 12 ? "PM" : "AM")
  }, [date])

  React.useEffect(() => {
    if (!date) {
      const newDate = new Date()
      newDate.setHours(period === "AM" ? hour : hour + 12)
      newDate.setMinutes(minute)
      setDate(newDate)
      return
    }

    const newDate = new Date(date)
    newDate.setHours(period === "AM" ? hour : hour + 12)
    newDate.setMinutes(minute)
    setDate(newDate)
  }, [hour, minute, period])

  const handleHourChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10)
    if (isNaN(value)) {
      setHour(12)
      return
    }

    if (value > 12) {
      setHour(12)
    } else if (value < 1) {
      setHour(1)
    } else {
      setHour(value)
    }

    if (value > 1) {
      minuteRef.current?.focus()
    }
  }

  const handleMinuteChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10)
    if (isNaN(value)) {
      setMinute(0)
      return
    }

    if (value > 59) {
      setMinute(59)
    } else if (value < 0) {
      setMinute(0)
    } else {
      setMinute(value)
    }

    if (value > 5) {
      periodRef.current?.focus()
    }
  }

  const togglePeriod = () => {
    setPeriod((prev) => (prev === "AM" ? "PM" : "AM"))
  }

  return (
    <div className="flex flex-col gap-2">
      {label && <Label>{label}</Label>}
      <div className="flex items-center gap-2">
        <div className="flex items-center">
          <Input
            ref={hourRef}
            value={hour}
            onChange={handleHourChange}
            className="w-12 text-center"
            type="number"
            min={1}
            max={12}
          />
          <span className="mx-1">:</span>
          <Input
            ref={minuteRef}
            value={minute.toString().padStart(2, "0")}
            onChange={handleMinuteChange}
            className="w-12 text-center"
            type="number"
            min={0}
            max={59}
          />
          <button
            ref={periodRef}
            type="button"
            className={cn(
              "ml-2 rounded-md border px-2 py-1 text-xs",
              period === "AM"
                ? "bg-primary text-primary-foreground"
                : "bg-background text-muted-foreground"
            )}
            onClick={togglePeriod}
          >
            AM
          </button>
          <button
            type="button"
            className={cn(
              "ml-1 rounded-md border px-2 py-1 text-xs",
              period === "PM"
                ? "bg-primary text-primary-foreground"
                : "bg-background text-muted-foreground"
            )}
            onClick={togglePeriod}
          >
            PM
          </button>
        </div>
        <Clock className="ml-auto h-4 w-4 text-muted-foreground" />
      </div>
    </div>
  )
}
