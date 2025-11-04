"use client"

import * as React from "react"
import { Calendar as CalendarIcon } from "lucide-react"
import { DayPicker, CaptionProps, useNavigation } from "react-day-picker"
import { format, getYear, getMonth } from "date-fns"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export type CalendarProps = React.ComponentProps<typeof DayPicker>

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  fromYear,
  toYear,
  ...props
}: CalendarProps) {
  // Custom caption component with month and year dropdowns
  const CustomCaption = React.forwardRef<HTMLDivElement, CaptionProps>((props, _ref) => {
    const { displayMonth } = props;
    const { goToMonth } = useNavigation();
    const months = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ]

    // Get current year and month
    const currentYear = getYear(displayMonth)
    const currentMonth = getMonth(displayMonth)

    // Generate years from fromYear to toYear, or use a reasonable default range
    const currentYearNum = new Date().getFullYear()
    const startYear = typeof fromYear === 'number' ? fromYear : 2000
    const endYear = typeof toYear === 'number' ? toYear : currentYearNum + 10
    // Create array in reverse order (newest years first) for better UX
    const years = Array.from(
      { length: endYear - startYear + 1 }, 
      (_, i) => endYear - i
    )

    // Handle month change
    const handleMonthChange = (monthIndex: string) => {
      const newDate = new Date(displayMonth)
      newDate.setMonth(parseInt(monthIndex))
      goToMonth(newDate)
    }

    // Handle year change
    const handleYearChange = (year: string) => {
      const newDate = new Date(displayMonth)
      newDate.setFullYear(parseInt(year))
      goToMonth(newDate)
    }

    return (
      <div className="flex justify-center items-center gap-1 py-2">
        <div className="flex-1">
          <Select
            value={currentMonth.toString()}
            onValueChange={handleMonthChange}
          >
            <SelectTrigger className="h-8 text-xs">
              <SelectValue placeholder="Month" />
            </SelectTrigger>
            <SelectContent className="max-h-40 overflow-y-auto">
              {months.map((month, index) => (
                <SelectItem key={month} value={index.toString()} className="text-sm">
                  {month}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex-1">
          <Select
            value={currentYear.toString()}
            onValueChange={handleYearChange}
          >
            <SelectTrigger className="h-8 text-xs">
              <SelectValue placeholder="Year" />
            </SelectTrigger>
            <SelectContent className="max-h-40 overflow-y-auto">
              {years.map((year) => (
                <SelectItem key={year} value={year.toString()} className="text-sm">
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    )
  })
  CustomCaption.displayName = "CustomCaption"

  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3 rounded-lg border border-dashed border-primary/20 bg-white/50 backdrop-blur-sm", className)}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-2",
        caption: "flex justify-center relative items-center",
        caption_label: "text-sm font-medium hidden", // Hide default caption
        nav: "space-x-1 flex items-center",
        nav_button: cn(
          buttonVariants({ variant: "outline" }),
          "h-7 w-7 bg-white/80 p-0 opacity-70 hover:opacity-100 hover:bg-primary hover:text-white transition-all duration-200"
        ),
        nav_button_previous: "absolute left-1",
        nav_button_next: "absolute right-1",
        table: "w-full border-collapse space-y-1",
        head_row: "flex",
        head_cell:
          "text-primary/70 rounded-md w-9 font-medium text-[0.8rem]",
        row: "flex w-full mt-1",
        cell: "h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20 hover:z-10",
        day: cn(
          buttonVariants({ variant: "ghost" }),
          "h-9 w-9 p-0 font-normal aria-selected:opacity-100 hover:bg-primary/10 transition-all duration-200"
        ),
        day_range_end: "day-range-end",
        day_selected:
          "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground rounded-full transform scale-90 hover:scale-100 transition-all duration-200",
        day_today: "bg-accent text-accent-foreground font-bold border border-primary/30 rounded-full",
        day_outside:
          "day-outside text-muted-foreground aria-selected:bg-accent/50 aria-selected:text-muted-foreground opacity-50",
        day_disabled: "text-muted-foreground opacity-50",
        day_range_middle:
          "aria-selected:bg-accent aria-selected:text-accent-foreground",
        day_hidden: "invisible",
        ...classNames,
      }}
      components={{
        IconLeft: () => <span className="h-4 w-4">←</span>,
        IconRight: () => <span className="h-4 w-4">→</span>,
        Caption: CustomCaption
      }}
      captionLayout="dropdown"
      {...props}
    />
  )
}
Calendar.displayName = "Calendar"

export { Calendar }
