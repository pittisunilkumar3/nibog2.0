"use client"

import { useState, useMemo, useEffect } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Search,
  Filter,
  Download,
  MoreHorizontal,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Eye,
  EyeOff,
  Trash2,
  Edit,
  RefreshCw,
  FileDown,
  Settings2,
  Columns,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useIsMobile } from "@/hooks/use-mobile"
import ExportDialog from "./export-dialog"
import { ExportColumn } from "@/lib/export-utils"

export interface Column<T> {
  key: keyof T
  label: string
  sortable?: boolean
  filterable?: boolean
  render?: (value: any, row: T) => React.ReactNode
  width?: string
  align?: 'left' | 'center' | 'right'
  hidden?: boolean
  hideOnMobile?: boolean
  priority?: number // Lower numbers have higher priority (shown first on mobile)
}

export interface TableAction<T> {
  label: string
  icon?: React.ReactNode
  onClick: (row: T) => void
  variant?: 'default' | 'destructive'
  disabled?: (row: T) => boolean
}

export interface BulkAction<T> {
  label: string
  icon?: React.ReactNode
  onClick: (selectedRows: T[]) => void
  variant?: 'default' | 'destructive'
}

interface EnhancedDataTableProps<T> {
  data: T[]
  columns: Column<T>[]
  actions?: TableAction<T>[]
  bulkActions?: BulkAction<T>[]
  searchable?: boolean
  filterable?: boolean
  exportable?: boolean
  selectable?: boolean
  pagination?: boolean
  pageSize?: number
  loading?: boolean
  emptyMessage?: string
  className?: string
  onRefresh?: () => void
  exportColumns?: ExportColumn<T>[]
  exportTitle?: string
  exportFilename?: string
}

export default function EnhancedDataTable<T extends Record<string, any>>({
  data,
  columns,
  actions = [],
  bulkActions = [],
  searchable = true,
  filterable = true,
  exportable = true,
  selectable = false,
  pagination = true,
  pageSize = 10,
  loading = false,
  emptyMessage = "No data available",
  className,
  onRefresh,
  exportColumns,
  exportTitle = "Data Export",
  exportFilename = "data-export",
}: EnhancedDataTableProps<T>) {
  const isMobile = useIsMobile()
  const [searchQuery, setSearchQuery] = useState("")
  const [sortConfig, setSortConfig] = useState<{
    key: keyof T | null
    direction: 'asc' | 'desc'
  }>({ key: null, direction: 'asc' })
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set())
  const [visibleColumns, setVisibleColumns] = useState<Set<keyof T>>(
    new Set(columns.filter(col => !col.hidden).map(col => col.key))
  )
  const [currentPage, setCurrentPage] = useState(1)
  const [filters, setFilters] = useState<Record<string, string>>({})
  const [showExportDialog, setShowExportDialog] = useState(false)
  const [focusedRowIndex, setFocusedRowIndex] = useState<number>(-1)
  const [statusMessage, setStatusMessage] = useState<string>("")

  // Responsive column management
  const responsiveColumns = useMemo(() => {
    if (!isMobile) return columns

    // On mobile, prioritize columns and hide less important ones
    const sortedColumns = [...columns].sort((a, b) => {
      const aPriority = a.priority ?? 999
      const bPriority = b.priority ?? 999
      return aPriority - bPriority
    })

    // Show only the most important columns on mobile (max 3-4 columns)
    const maxMobileColumns = 3
    return sortedColumns.slice(0, maxMobileColumns).concat(
      sortedColumns.slice(maxMobileColumns).filter(col => !col.hideOnMobile)
    )
  }, [columns, isMobile])

  // Update visible columns when screen size changes
  useEffect(() => {
    if (isMobile) {
      const mobileVisibleColumns = new Set(
        responsiveColumns.filter(col => !col.hidden).map(col => col.key)
      )
      setVisibleColumns(mobileVisibleColumns)
    } else {
      const allVisibleColumns = new Set(
        columns.filter(col => !col.hidden).map(col => col.key)
      )
      setVisibleColumns(allVisibleColumns)
    }
  }, [isMobile, responsiveColumns, columns])

  // Create export columns from table columns if not provided
  const finalExportColumns = exportColumns || columns.map(col => ({
    key: col.key,
    label: col.label,
    format: col.render ? (value: any, row: T) => {
      const rendered = col.render!(value, row)
      return typeof rendered === 'string' ? rendered : String(value)
    } : undefined,
  }))

  // Filter and search data
  const filteredData = useMemo(() => {
    let result = [...data]

    // Apply search
    if (searchQuery) {
      result = result.filter(row =>
        Object.values(row).some(value =>
          String(value).toLowerCase().includes(searchQuery.toLowerCase())
        )
      )
    }

    // Apply filters
    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        result = result.filter(row =>
          String(row[key]).toLowerCase().includes(value.toLowerCase())
        )
      }
    })

    return result
  }, [data, searchQuery, filters])

  // Sort data
  const sortedData = useMemo(() => {
    if (!sortConfig.key) return filteredData

    return [...filteredData].sort((a, b) => {
      const aValue = a[sortConfig.key!]
      const bValue = b[sortConfig.key!]

      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1
      }
      return 0
    })
  }, [filteredData, sortConfig])

  // Paginate data
  const paginatedData = useMemo(() => {
    if (!pagination) return sortedData
    const startIndex = (currentPage - 1) * pageSize
    return sortedData.slice(startIndex, startIndex + pageSize)
  }, [sortedData, currentPage, pageSize, pagination])

  const totalPages = Math.ceil(sortedData.length / pageSize)

  const handleSort = (key: keyof T) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }))
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedRows(new Set(paginatedData.map((_, index) => index)))
      setStatusMessage(`Selected all ${paginatedData.length} rows`)
    } else {
      setSelectedRows(new Set())
      setStatusMessage("Deselected all rows")
    }
    // Clear status message after announcement
    setTimeout(() => setStatusMessage(""), 1000)
  }

  const handleSelectRow = (index: number, checked: boolean) => {
    const newSelected = new Set(selectedRows)
    if (checked) {
      newSelected.add(index)
      setStatusMessage(`Selected row ${index + 1}`)
    } else {
      newSelected.delete(index)
      setStatusMessage(`Deselected row ${index + 1}`)
    }
    setSelectedRows(newSelected)
    // Clear status message after announcement
    setTimeout(() => setStatusMessage(""), 1000)
  }

  // Keyboard navigation handler
  const handleKeyDown = (event: React.KeyboardEvent, rowIndex: number) => {
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault()
        setFocusedRowIndex(Math.min(rowIndex + 1, paginatedData.length - 1))
        break
      case 'ArrowUp':
        event.preventDefault()
        setFocusedRowIndex(Math.max(rowIndex - 1, 0))
        break
      case 'Enter':
      case ' ':
        if (selectable) {
          event.preventDefault()
          handleSelectRow(rowIndex, !selectedRows.has(rowIndex))
        }
        break
      case 'Escape':
        setFocusedRowIndex(-1)
        break
    }
  }



  const getSortIcon = (key: keyof T) => {
    if (sortConfig.key !== key) {
      return <ArrowUpDown className="h-4 w-4" />
    }
    return sortConfig.direction === 'asc' ? 
      <ArrowUp className="h-4 w-4" /> : 
      <ArrowDown className="h-4 w-4" />
  }

  // Mobile card view component
  const MobileCardView = ({ data }: { data: T[] }) => (
    <div className="space-y-3">
      {data.map((row, index) => (
        <div key={index} className="border rounded-lg p-4 space-y-3 bg-card shadow-sm hover:shadow-md transition-shadow touch-manipulation">
          {/* Show only priority columns in mobile card view */}
          {responsiveColumns
            .filter(col => visibleColumns.has(col.key) && col.priority && col.priority <= 4)
            .map((column) => (
              <div key={String(column.key)} className="flex justify-between items-start gap-3">
                <span className="text-sm font-medium text-muted-foreground min-w-0 flex-shrink-0">
                  {column.label}:
                </span>
                <div className="text-sm text-right min-w-0 flex-1 break-words">
                  {column.render ? column.render(row[column.key], row) : String(row[column.key])}
                </div>
              </div>
            ))}

          {/* Actions for mobile */}
          {actions.length > 0 && (
            <div className="flex justify-end pt-3 border-t mt-3">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="touch-manipulation h-9">
                    <MoreHorizontal className="h-4 w-4 mr-2" />
                    Actions
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="min-w-[160px]">
                  {actions.map((action, actionIndex) => (
                    <DropdownMenuItem
                      key={actionIndex}
                      onClick={() => action.onClick(row)}
                      disabled={action.disabled?.(row)}
                      className={cn(
                        "touch-manipulation py-3 px-3 cursor-pointer",
                        action.variant === 'destructive' ? 'text-destructive focus:text-destructive' : ''
                      )}
                    >
                      <div className="flex items-center gap-2">
                        {action.icon}
                        <span>{typeof action.label === 'function' ? action.label(row) : action.label}</span>
                      </div>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>
      ))}
    </div>
  )

  return (
    <div className={cn("space-y-4", className)}>
      {/* Screen Reader Status */}
      <div
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
        role="status"
      >
        {statusMessage}
      </div>

      {/* Table Controls */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-2">
          {searchable && (
            <div className="relative flex-1 min-w-0 sm:max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
              <Input
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 w-full touch-manipulation"
                aria-label="Search table data"
                role="searchbox"
              />
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Column Visibility */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" aria-label="Toggle column visibility" className="flex-shrink-0 touch-manipulation">
                <Columns className="h-4 w-4 sm:mr-2" aria-hidden="true" />
                <span className="hidden sm:inline">Columns</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {columns.map((column) => (
                <DropdownMenuCheckboxItem
                  key={String(column.key)}
                  checked={visibleColumns.has(column.key)}
                  onCheckedChange={(checked) => {
                    const newVisible = new Set(visibleColumns)
                    if (checked) {
                      newVisible.add(column.key)
                    } else {
                      newVisible.delete(column.key)
                    }
                    setVisibleColumns(newVisible)
                  }}
                >
                  <div className="flex items-center justify-between w-full">
                    <span>{column.label}</span>
                    {column.hideOnMobile && (
                      <Badge variant="outline" className="text-xs ml-2">Mobile Hidden</Badge>
                    )}
                  </div>
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {exportable && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowExportDialog(true)}
              disabled={sortedData.length === 0}
              aria-label="Export table data"
              className="flex-shrink-0 touch-manipulation"
            >
              <FileDown className="h-4 w-4 sm:mr-2" aria-hidden="true" />
              <span className="hidden sm:inline">Export</span>
            </Button>
          )}

          {onRefresh && (
            <Button variant="outline" size="sm" onClick={onRefresh} disabled={loading} className="flex-shrink-0 touch-manipulation">
              <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
              <span className="sr-only">Refresh</span>
            </Button>
          )}
        </div>
      </div>

      {/* Bulk Actions */}
      {selectable && selectedRows.size > 0 && bulkActions.length > 0 && (
        <div className="flex flex-col gap-2 p-3 bg-muted/50 rounded-lg sm:flex-row sm:items-center">
          <span className="text-sm font-medium flex-shrink-0">
            {selectedRows.size} row(s) selected
          </span>
          <div className="flex flex-wrap gap-2">
            {bulkActions.map((action, index) => (
              <Button
                key={index}
                variant={action.variant === 'destructive' ? 'destructive' : 'outline'}
                size="sm"
                onClick={() => {
                  const selectedData = Array.from(selectedRows).map(index => paginatedData[index])
                  action.onClick(selectedData)
                  setSelectedRows(new Set())
                }}
                className="flex-shrink-0"
              >
                {action.icon}
                <span className="ml-1">{action.label}</span>
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Table - Show card view on very small screens, table on larger screens */}
      {isMobile ? (
        loading ? (
          <div className="flex items-center justify-center p-8">
            <RefreshCw className="h-6 w-6 animate-spin mr-2" />
            Loading...
          </div>
        ) : paginatedData.length === 0 ? (
          <div className="text-center p-8 text-muted-foreground">
            {emptyMessage}
          </div>
        ) : (
          <MobileCardView data={paginatedData} />
        )
      ) : (
        <div className="rounded-md border overflow-hidden">
          <div className="overflow-x-auto mobile-scroll">
            <Table role="table" aria-label="Data table" className="min-w-full">
            <TableHeader>
              <TableRow>
                {selectable && (
                  <TableHead className="w-12 table-sticky-column">
                    <Checkbox
                      checked={selectedRows.size === paginatedData.length && paginatedData.length > 0}
                      onCheckedChange={handleSelectAll}
                      aria-label="Select all rows"
                    />
                  </TableHead>
                )}
                {columns
                  .filter(col => visibleColumns.has(col.key))
                  .map((column, index) => (
                    <TableHead
                      key={String(column.key)}
                      className={cn(
                        column.width && `w-[${column.width}]`,
                        column.align === 'center' && 'text-center',
                        column.align === 'right' && 'text-right',
                        column.sortable && 'cursor-pointer hover:bg-muted/50',
                        // Make first column sticky on mobile for better UX
                        isMobile && index === 0 && !selectable && 'sticky left-0 bg-background z-10',
                        isMobile && index === 0 && selectable && 'sticky left-12 bg-background z-10',
                        'whitespace-nowrap'
                      )}
                      onClick={() => column.sortable && handleSort(column.key)}
                    >
                      <div className="flex items-center gap-2">
                        <span className="truncate">{column.label}</span>
                        {column.sortable && getSortIcon(column.key)}
                      </div>
                    </TableHead>
                  ))}
                {actions.length > 0 && (
                  <TableHead className="w-12 text-right table-sticky-actions">
                    <span className="sr-only">Actions</span>
                  </TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell
                    colSpan={columns.filter(col => visibleColumns.has(col.key)).length + (selectable ? 1 : 0) + (actions.length > 0 ? 1 : 0)}
                    className="h-24 text-center"
                  >
                    <div className="flex items-center justify-center">
                      <RefreshCw className="h-6 w-6 animate-spin mr-2" />
                      Loading...
                    </div>
                  </TableCell>
                </TableRow>
              ) : paginatedData.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={columns.filter(col => visibleColumns.has(col.key)).length + (selectable ? 1 : 0) + (actions.length > 0 ? 1 : 0)}
                    className="h-24 text-center text-muted-foreground"
                  >
                    {emptyMessage}
                  </TableCell>
                </TableRow>
              ) : (
                paginatedData.map((row, index) => (
                  <TableRow
                    key={index}
                    tabIndex={0}
                    onKeyDown={(e) => handleKeyDown(e, index)}
                    className={cn(
                      "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                      focusedRowIndex === index && "bg-muted/50"
                    )}
                    aria-rowindex={index + 1}
                  >
                    {selectable && (
                      <TableCell className="table-sticky-column">
                        <Checkbox
                          checked={selectedRows.has(index)}
                          onCheckedChange={(checked) => handleSelectRow(index, checked as boolean)}
                          aria-label={`Select row ${index + 1}`}
                        />
                      </TableCell>
                    )}
                    {columns
                      .filter(col => visibleColumns.has(col.key))
                      .map((column, colIndex) => (
                        <TableCell
                          key={String(column.key)}
                          className={cn(
                            column.align === 'center' && 'text-center',
                            column.align === 'right' && 'text-right',
                            // Make first column sticky on mobile for better UX
                            isMobile && colIndex === 0 && !selectable && 'sticky left-0 bg-background z-10',
                            isMobile && colIndex === 0 && selectable && 'sticky left-12 bg-background z-10',
                            'max-w-0 truncate'
                          )}
                          title={typeof row[column.key] === 'string' ? row[column.key] : undefined}
                        >
                          <div className="truncate">
                            {column.render ? column.render(row[column.key], row) : String(row[column.key])}
                          </div>
                        </TableCell>
                      ))}
                    {actions.length > 0 && (
                      <TableCell className="table-sticky-actions text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" aria-label={`Actions for row ${index + 1}`}>
                              <MoreHorizontal className="h-4 w-4" aria-hidden="true" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {actions.map((action, actionIndex) => (
                              <DropdownMenuItem
                                key={actionIndex}
                                onClick={() => action.onClick(row)}
                                disabled={action.disabled?.(row)}
                                className={action.variant === 'destructive' ? 'text-destructive' : ''}
                              >
                                {action.icon}
                                {action.label}
                              </DropdownMenuItem>
                            ))}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    )}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
      )}

      {/* Pagination */}
      {pagination && totalPages > 1 && (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-sm text-muted-foreground order-2 sm:order-1">
            Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, sortedData.length)} of {sortedData.length} entries
          </div>
          <div className="flex items-center justify-center gap-2 order-1 sm:order-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="flex-shrink-0"
            >
              <span className="hidden sm:inline">Previous</span>
              <span className="sm:hidden">Prev</span>
            </Button>
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(isMobile ? 3 : 5, totalPages) }, (_, i) => {
                let page: number
                if (totalPages <= (isMobile ? 3 : 5)) {
                  page = i + 1
                } else {
                  // Smart pagination for mobile
                  const start = Math.max(1, currentPage - Math.floor((isMobile ? 3 : 5) / 2))
                  const end = Math.min(totalPages, start + (isMobile ? 3 : 5) - 1)
                  page = start + i
                  if (page > end) return null
                }

                return (
                  <Button
                    key={page}
                    variant={currentPage === page ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(page)}
                    className={cn(
                      "flex-shrink-0 touch-manipulation",
                      isMobile ? "w-10 h-10 p-0" : "w-8 h-8 p-0"
                    )}
                  >
                    {page}
                  </Button>
                )
              }).filter(Boolean)}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="flex-shrink-0"
            >
              <span className="hidden sm:inline">Next</span>
              <span className="sm:hidden">Next</span>
            </Button>
          </div>
        </div>
      )}

      {/* Export Dialog */}
      <ExportDialog
        open={showExportDialog}
        onOpenChange={setShowExportDialog}
        data={sortedData}
        columns={finalExportColumns}
        title={exportTitle}
        defaultFilename={exportFilename}
      />
    </div>
  )
}
