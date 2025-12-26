"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Edit, Eye, Plus, Trash, AlertTriangle, Loader2, Search, Filter, RefreshCw } from "lucide-react"
import EnhancedDataTable, { Column, TableAction, BulkAction } from "@/components/admin/enhanced-data-table"
import { createGameExportColumns } from "@/lib/export-utils"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useToast } from "@/components/ui/use-toast"
import { getAllBabyGames, deleteBabyGame } from "@/services/babyGameService"
import { BabyGame } from "@/types"

export default function GameTemplatesPage() {
  const [games, setGames] = useState<BabyGame[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedStatus, setSelectedStatus] = useState("all")
  const { toast } = useToast()

  // Fetch games from API with cache busting
  const fetchGames = async () => {
    try {
      setError(null)
      const data = await getAllBabyGames()
      setGames(data)
    } catch (err: any) {
      const errorMsg = err.message || "Failed to fetch games"
      setError(errorMsg)
      toast({
        title: "Error",
        description: errorMsg,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }

  useEffect(() => {
    setIsLoading(true)
    fetchGames()

    // Listen for localStorage event to trigger refresh after add/edit
    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'nibog_games_admin_update') {
        fetchGames();
        localStorage.removeItem('nibog_games_admin_update');
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, [])

  // Handle refresh
  const handleRefresh = async () => {
    setIsRefreshing(true)
    await fetchGames()
    toast({
      title: "Success",
      description: "Games data refreshed successfully.",
    })
  }

  const handleDeleteGame = async (id: number) => {
    try {
      await deleteBabyGame(id)
      await fetchGames(); // Refetch from backend for instant update
      toast({
        title: "Game Deleted",
        description: "The game has been deleted successfully.",
        variant: "default",
      })
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to delete game",
        variant: "destructive",
      })
    }
  }

  // Define table columns for EnhancedDataTable
  const columns: Column<any>[] = [
    {
      key: 'game_name',
      label: 'Name',
      sortable: true,
      priority: 1, // Highest priority for mobile
    },
    {
      key: 'min_age',
      label: 'Age Range',
      sortable: true,
      priority: 2, // Second priority for mobile
      render: (value, row) => {
        const minAge = row.min_age;
        const maxAge = row.max_age;

        if (minAge && maxAge) {
          // Convert to years if age is in months and > 12
          if (minAge >= 12 && maxAge >= 12) {
            const minYears = Math.floor(minAge / 12);
            const maxYears = Math.floor(maxAge / 12);
            const minMonths = minAge % 12;
            const maxMonths = maxAge % 12;

            if (minMonths === 0 && maxMonths === 0) {
              return `${minYears}-${maxYears} years`;
            } else {
              return `${minAge}-${maxAge} months`;
            }
          } else {
            return `${minAge}-${maxAge} months`;
          }
        } else if (minAge) {
          return `${minAge}+ months`;
        } else if (maxAge) {
          return `Up to ${maxAge} months`;
        } else {
          return 'Not specified';
        }
      }
    },
    {
      key: 'is_active',
      label: 'Status',
      sortable: true,
      priority: 3, // Third priority for mobile
      render: (value) => (
        <Badge variant={value ? "default" : "secondary"}>
          {value ? "Active" : "Inactive"}
        </Badge>
      )
    },
    {
      key: 'description',
      label: 'Description',
      sortable: true,
      hideOnMobile: true, // Hide on mobile to save space
      render: (value) => (
        <span className="text-sm truncate max-w-[200px] block">{value}</span>
      )
    },
    {
      key: 'duration_minutes',
      label: 'Duration',
      sortable: true,
      hideOnMobile: true, // Hide on mobile to save space
      render: (value) => `${value} min`
    },
    {
      key: 'categories',
      label: 'Categories',
      hideOnMobile: true, // Hide on mobile to save space
      render: (value) => {
        // Handle different data types for categories
        let categories: string[] = [];

        if (Array.isArray(value)) {
          categories = value;
        } else if (typeof value === 'string' && value) {
          categories = value.split(',');
        } else if (value) {
          categories = [String(value)];
        }

        return (
          <div className="flex flex-wrap gap-1">
            {categories.map((category: string, index: number) => (
              <Badge key={index} variant="outline" className="text-xs">
                {String(category).trim()}
              </Badge>
            ))}
          </div>
        );
      }
    }
  ]

  // Define table actions
  const actions: TableAction<any>[] = [
    {
      label: "View",
      icon: <Eye className="h-4 w-4" />,
      onClick: (game) => {
        window.location.href = `/admin/games/${game.id}`
      }
    },
    {
      label: "Edit",
      icon: <Edit className="h-4 w-4" />,
      onClick: (game) => {
        window.location.href = `/admin/games/${game.id}/edit`
      }
    },
    {
      label: "Delete",
      icon: <Trash className="h-4 w-4" />,
      onClick: (game) => handleDeleteGame(game.id),
      variant: 'destructive'
    }
  ]

  // Define bulk actions
  const bulkActions: BulkAction<any>[] = [
    {
      label: "Delete Selected",
      icon: <Trash className="h-4 w-4" />,
      onClick: (selectedGames) => {
        // Handle bulk delete - would need confirmation dialog
        // TODO: implement bulk delete with confirmation
      },
      variant: 'destructive'
    }
  ]

  // Filter games based on search query and status
  const filteredGames = games.filter(game => {
    // Search filter
    if (searchQuery &&
        !game.game_name.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !(game.description || '').toLowerCase().includes(searchQuery.toLowerCase())) {
      return false
    }

    // Status filter
    if (selectedStatus !== "all") {
      if (selectedStatus === "active" && !game.is_active) {
        return false
      }
      if (selectedStatus === "inactive" && game.is_active) {
        return false
      }
    }

    return true
  })

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">NIBOG Baby Games</h1>
          <p className="text-sm sm:text-base text-muted-foreground">Manage baby games for NIBOG Olympic events</p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="touch-manipulation"
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button asChild className="touch-manipulation">
            <Link href="/admin/games/new">
              <Plus className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Add New Baby Game</span>
              <span className="sm:hidden">New Game</span>
            </Link>
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Loading games...</span>
        </div>
      ) : error ? (
        <div className="rounded-md bg-destructive/15 p-4 text-center text-destructive">
          <p>{error}</p>
          <Button
            variant="outline"
            className="mt-2 touch-manipulation"
            onClick={() => window.location.reload()}
          >
            Try Again
          </Button>
        </div>
      ) : (
        <>
          {/* Search and Filter Controls */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
                  <Input
                    placeholder="Search games..."
                    className="pl-9 h-10 touch-manipulation"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <Filter className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <Select value={selectedStatus} onValueChange={setSelectedStatus} disabled={isLoading}>
                    <SelectTrigger className="h-10 w-full sm:w-[180px] touch-manipulation">
                      <SelectValue placeholder="All Games" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all" className="touch-manipulation">All Games</SelectItem>
                      <SelectItem value="active" className="touch-manipulation">Active Games</SelectItem>
                      <SelectItem value="inactive" className="touch-manipulation">Inactive Games</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          <EnhancedDataTable
            data={filteredGames}
            columns={columns}
            actions={actions}
            bulkActions={bulkActions}
            loading={isLoading}
            searchable={false} // We have custom search above
            filterable={false} // We have custom filters above
            exportable={true}
            selectable={true}
            pagination={true}
            pageSize={25}
            exportColumns={createGameExportColumns()}
            exportTitle="NIBOG Baby Games Report"
            exportFilename="nibog-baby-games"
            emptyMessage="No games found"
            onRefresh={handleRefresh}
            className="min-h-[400px]"
          />
        </>
      )}
    </div>
  )
}
