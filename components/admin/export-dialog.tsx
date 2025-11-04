"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import {
  Download,
  FileText,
  FileSpreadsheet,
  File,
  Calendar,
  Settings,
  Eye,
  Loader2,
} from "lucide-react"
import { ExportService, ExportColumn, ExportOptions } from "@/lib/export-utils"
import { cn } from "@/lib/utils"

interface ExportDialogProps<T> {
  open: boolean
  onOpenChange: (open: boolean) => void
  data: T[]
  columns: ExportColumn<T>[]
  title: string
  defaultFilename: string
}

type ExportFormat = 'csv' | 'pdf' | 'excel'

export default function ExportDialog<T>({
  open,
  onOpenChange,
  data,
  columns,
  title,
  defaultFilename,
}: ExportDialogProps<T>) {
  const [format, setFormat] = useState<ExportFormat>('csv')
  const [filename, setFilename] = useState(defaultFilename)
  const [includeTimestamp, setIncludeTimestamp] = useState(true)
  const [selectedColumns, setSelectedColumns] = useState<Set<keyof T>>(
    new Set(columns.map(col => col.key))
  )
  const [exportTitle, setExportTitle] = useState(title)
  const [exportSubtitle, setExportSubtitle] = useState('')
  const [isExporting, setIsExporting] = useState(false)
  const [showPreview, setShowPreview] = useState(false)

  const formatOptions = [
    {
      value: 'csv' as const,
      label: 'CSV',
      description: 'Comma-separated values, compatible with Excel and Google Sheets',
      icon: <FileText className="h-4 w-4" />,
      color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    },
    {
      value: 'pdf' as const,
      label: 'PDF',
      description: 'Professional formatted document with branding',
      icon: <File className="h-4 w-4" />,
      color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    },
    {
      value: 'excel' as const,
      label: 'Excel',
      description: 'Microsoft Excel format with formatting',
      icon: <FileSpreadsheet className="h-4 w-4" />,
      color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    },
  ]

  const selectedFormat = formatOptions.find(opt => opt.value === format)!
  const filteredColumns = columns.filter(col => selectedColumns.has(col.key))
  const preview = ExportService.getExportPreview(data, filteredColumns, 3)

  const handleColumnToggle = (columnKey: keyof T, checked: boolean) => {
    const newSelected = new Set(selectedColumns)
    if (checked) {
      newSelected.add(columnKey)
    } else {
      newSelected.delete(columnKey)
    }
    setSelectedColumns(newSelected)
  }

  const handleSelectAllColumns = (checked: boolean) => {
    if (checked) {
      setSelectedColumns(new Set(columns.map(col => col.key)))
    } else {
      setSelectedColumns(new Set())
    }
  }

  const handleExport = async () => {
    if (selectedColumns.size === 0) {
      return
    }

    setIsExporting(true)
    
    try {
      const exportOptions: ExportOptions<T> = {
        filename,
        title: exportTitle,
        subtitle: exportSubtitle || undefined,
        data,
        columns: filteredColumns,
        format,
        includeTimestamp,
        brandingInfo: {
          companyName: 'NIBOG - Baby Games Platform',
          address: 'India',
          website: 'www.nibog.com',
        },
      }

      switch (format) {
        case 'csv':
          await ExportService.exportToCSV(exportOptions)
          break
        case 'pdf':
          await ExportService.exportToPDF(exportOptions)
          break
        case 'excel':
          await ExportService.exportToExcel(exportOptions)
          break
      }

      onOpenChange(false)
    } catch (error) {
      console.error('Export failed:', error)
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Export Data
          </DialogTitle>
          <DialogDescription>
            Export {data.length} records to your preferred format
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          {/* Format Selection */}
          <div className="space-y-3">
            <Label className="text-base font-medium">Export Format</Label>
            <div className="grid gap-3 sm:grid-cols-3">
              {formatOptions.map((option) => (
                <Card
                  key={option.value}
                  className={cn(
                    "cursor-pointer transition-all hover:shadow-md",
                    format === option.value && "ring-2 ring-primary"
                  )}
                  onClick={() => setFormat(option.value)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className={cn("p-2 rounded-lg", option.color)}>
                        {option.icon}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium">{option.label}</div>
                        <div className="text-xs text-muted-foreground">
                          {option.description}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <Separator />

          {/* Export Options */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="filename">Filename</Label>
                <Input
                  id="filename"
                  value={filename}
                  onChange={(e) => setFilename(e.target.value)}
                  placeholder="Enter filename"
                />
              </div>

              {format === 'pdf' && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="export-title">Document Title</Label>
                    <Input
                      id="export-title"
                      value={exportTitle}
                      onChange={(e) => setExportTitle(e.target.value)}
                      placeholder="Enter document title"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="export-subtitle">Subtitle (Optional)</Label>
                    <Textarea
                      id="export-subtitle"
                      value={exportSubtitle}
                      onChange={(e) => setExportSubtitle(e.target.value)}
                      placeholder="Enter subtitle or description"
                      rows={2}
                    />
                  </div>
                </>
              )}

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="timestamp"
                  checked={includeTimestamp}
                  onCheckedChange={setIncludeTimestamp}
                />
                <Label htmlFor="timestamp" className="text-sm">
                  Include timestamp in filename
                </Label>
              </div>
            </div>

            {/* Column Selection */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-base font-medium">Columns to Export</Label>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleSelectAllColumns(true)}
                  >
                    Select All
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleSelectAllColumns(false)}
                  >
                    Clear All
                  </Button>
                </div>
              </div>

              <div className="max-h-48 overflow-y-auto space-y-2 border rounded-lg p-3">
                {columns.map((column) => (
                  <div key={String(column.key)} className="flex items-center space-x-2">
                    <Checkbox
                      id={String(column.key)}
                      checked={selectedColumns.has(column.key)}
                      onCheckedChange={(checked) => 
                        handleColumnToggle(column.key, checked as boolean)
                      }
                    />
                    <Label 
                      htmlFor={String(column.key)} 
                      className="text-sm flex-1 cursor-pointer"
                    >
                      {column.label}
                    </Label>
                  </div>
                ))}
              </div>

              <div className="text-sm text-muted-foreground">
                {selectedColumns.size} of {columns.length} columns selected
              </div>
            </div>
          </div>

          {/* Preview */}
          {selectedColumns.size > 0 && (
            <>
              <Separator />
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-base font-medium">Preview</Label>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowPreview(!showPreview)}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    {showPreview ? 'Hide' : 'Show'} Preview
                  </Button>
                </div>

                {showPreview && (
                  <Card>
                    <CardContent className="p-4">
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b">
                              {preview.headers.map((header, index) => (
                                <th key={index} className="text-left p-2 font-medium">
                                  {header}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {preview.rows.map((row, rowIndex) => (
                              <tr key={rowIndex} className="border-b">
                                {row.map((cell, cellIndex) => (
                                  <td key={cellIndex} className="p-2">
                                    {cell}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      <div className="mt-3 text-xs text-muted-foreground">
                        Showing first 3 rows of {preview.totalRows} total records
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleExport} 
            disabled={selectedColumns.size === 0 || isExporting}
            className="min-w-[120px]"
          >
            {isExporting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Exporting...
              </>
            ) : (
              <>
                <Download className="h-4 w-4 mr-2" />
                Export {selectedFormat.label}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
