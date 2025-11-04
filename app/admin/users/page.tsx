"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Plus, Search, Filter, Eye, Edit, Trash, AlertTriangle, X, Check, Loader2, RefreshCw } from "lucide-react"
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
import EnhancedDataTable, { Column, TableAction, BulkAction } from "@/components/admin/enhanced-data-table"
import { createUserExportColumns } from "@/lib/export-utils"
import { getAllUsers, toggleUserActiveStatus, toggleUserLockedStatus, deleteUser, User } from "@/services/userService"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"



export default function UsersPage() {
  const [usersList, setUsersList] = useState<User[]>([])
  const [isProcessing, setIsProcessing] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedStatus, setSelectedStatus] = useState("all")
  const { toast } = useToast()

  // Fetch users from API
  const fetchUsers = async () => {
    try {
      setError(null)
      const data = await getAllUsers()
      setUsersList(data)
    } catch (error) {
      console.error('Failed to fetch users:', error)
      setError('Failed to load users. Please try again.')
      toast({
        title: "Error",
        description: "Failed to load users. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }

  useEffect(() => {
    setIsLoading(true)
    fetchUsers()
  }, [])

  // Handle refresh
  const handleRefresh = async () => {
    setIsRefreshing(true)
    await fetchUsers()
    toast({
      title: "Success",
      description: "Users data refreshed successfully.",
    })
  }

  // Handle delete user
  const handleDeleteUser = async (user: User) => {
    setIsProcessing(user.user_id)

    try {
      // Call the API to delete the user
      await deleteUser(user.user_id)

      // Update the local state
      setUsersList(usersList.filter(u => u.user_id !== user.user_id))

      toast({
        title: "Success",
        description: "User deleted successfully.",
      })
    } catch (error) {
      console.error(`Failed to delete user ${user.user_id}:`, error)
      toast({
        title: "Error",
        description: "Failed to delete user. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(null)
    }
  }

  // Handle toggle active status
  const handleToggleActiveStatus = async (user: User) => {
    setIsProcessing(user.user_id)

    try {
      // Call the API to toggle the user's active status
      await toggleUserActiveStatus(user.user_id, !user.is_active)

      // Update the local state
      setUsersList(usersList.map(u => {
        if (u.user_id === user.user_id) {
          return {
            ...u,
            is_active: !user.is_active
          }
        }
        return u
      }))

      toast({
        title: "Success",
        description: `User ${user.is_active ? 'deactivated' : 'activated'} successfully.`,
      })
    } catch (error) {
      console.error(`Failed to toggle active status for user ${user.user_id}:`, error)
      toast({
        title: "Error",
        description: "Failed to update user status. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(null)
    }
  }

  // Handle toggle locked status
  const handleToggleLockedStatus = async (user: User) => {
    setIsProcessing(user.user_id)

    try {
      // Call the API to toggle the user's locked status
      await toggleUserLockedStatus(user.user_id, !user.is_locked)

      // Update the local state
      setUsersList(usersList.map(u => {
        if (u.user_id === user.user_id) {
          return {
            ...u,
            is_locked: !user.is_locked
          }
        }
        return u
      }))

      toast({
        title: "Success",
        description: `User ${user.is_locked ? 'unlocked' : 'locked'} successfully.`,
      })
    } catch (error) {
      console.error(`Failed to toggle locked status for user ${user.user_id}:`, error)
      toast({
        title: "Error",
        description: "Failed to update user status. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(null)
    }
  }

  // Define table columns
  const columns: Column<User>[] = [
    {
      key: 'full_name',
      label: 'Name',
      sortable: true,
      priority: 1, // Highest priority for mobile
      render: (value, row) => (
        <div>
          <div className="font-medium">{value}</div>
          <div className="text-xs text-muted-foreground truncate">{row.email}</div>
        </div>
      )
    },
    {
      key: 'phone',
      label: 'Phone',
      sortable: true,
      priority: 2, // Second priority for mobile
      render: (value) => (
        <span className="text-sm">{value}</span>
      )
    },
    {
      key: 'is_active',
      label: 'Status',
      sortable: true,
      priority: 3, // Third priority for mobile
      render: (value, row) => {
        if (value) {
          return row.is_locked ? (
            <Badge className="bg-amber-500 hover:bg-amber-600">Locked</Badge>
          ) : (
            <Badge className="bg-green-500 hover:bg-green-600">Active</Badge>
          )
        } else {
          return <Badge variant="outline">Inactive</Badge>
        }
      }
    },
    {
      key: 'user_id',
      label: 'ID',
      sortable: true,
      width: '80px',
      hideOnMobile: true // Hide on mobile to save space
    },
    {
      key: 'city_name',
      label: 'City',
      sortable: true,
      hideOnMobile: true, // Hide on mobile to save space
      render: (value) => value || 'N/A'
    },
    {
      key: 'state',
      label: 'State',
      sortable: true,
      hideOnMobile: true, // Hide on mobile to save space
      render: (value) => value || 'N/A'
    }
  ]

  // Define table actions
  const actions: TableAction<User>[] = [
    {
      label: "View",
      icon: <Eye className="h-4 w-4" />,
      onClick: (user) => {
        window.location.href = `/admin/users/${user.user_id}`
      }
    },
    {
      label: "Edit",
      icon: <Edit className="h-4 w-4" />,
      onClick: (user) => {
        window.location.href = `/admin/users/${user.user_id}/edit`
      }
    },
    {
      label: "Toggle Lock",
      icon: <Check className="h-4 w-4" />,
      onClick: handleToggleLockedStatus,
      disabled: (user: any) => isProcessing === user.user_id
    },
    {
      label: "Toggle Active",
      icon: <Check className="h-4 w-4" />,
      onClick: handleToggleActiveStatus,
      disabled: (user: any) => isProcessing === user.user_id
    }
  ]

  // Define bulk actions
  const bulkActions: BulkAction<User>[] = [
    {
      label: "Delete Selected",
      icon: <Trash className="h-4 w-4" />,
      onClick: (selectedUsers) => {
        // Handle bulk delete - would need confirmation dialog
        console.log("Bulk delete:", selectedUsers)
      },
      variant: 'destructive'
    }
  ]

  // Filter users based on search query and status
  const filteredUsers = usersList.filter(user => {
    // Search filter
    if (searchQuery &&
        !user.full_name.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !user.email.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !user.phone.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false
    }

    // Status filter
    if (selectedStatus !== "all") {
      if (selectedStatus === "active" && (!user.is_active || user.is_locked)) {
        return false
      }
      if (selectedStatus === "inactive" && user.is_active) {
        return false
      }
      if (selectedStatus === "locked" && !user.is_locked) {
        return false
      }
    }

    return true
  })

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Users</h1>
          <p className="text-sm sm:text-base text-muted-foreground">Manage NIBOG users and their accounts</p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="touch-manipulation"
          >
            <RefreshCw className={cn("mr-2 h-4 w-4", isRefreshing && "animate-spin")} />
            Refresh
          </Button>
          <Button asChild className="touch-manipulation">
            <Link href="/admin/users/new">
              <Plus className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Add New User</span>
              <span className="sm:hidden">New User</span>
            </Link>
          </Button>
        </div>
      </div>

      {/* Search and Filter Controls */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
              <Input
                placeholder="Search users..."
                className="pl-9 h-10 touch-manipulation"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Filter className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <Select value={selectedStatus} onValueChange={setSelectedStatus} disabled={isLoading}>
                <SelectTrigger className="h-10 w-full sm:w-[180px] touch-manipulation">
                  <SelectValue placeholder="All Users" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all" className="touch-manipulation">All Users</SelectItem>
                  <SelectItem value="active" className="touch-manipulation">Active Users</SelectItem>
                  <SelectItem value="inactive" className="touch-manipulation">Inactive Users</SelectItem>
                  <SelectItem value="locked" className="touch-manipulation">Locked Users</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Data Table */}
      <EnhancedDataTable
        data={filteredUsers}
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
        exportColumns={createUserExportColumns()}
        exportTitle="NIBOG Users Report"
        exportFilename="nibog-users"
        emptyMessage="No users found"
        onRefresh={handleRefresh}
        className="min-h-[400px]"
      />

      {error && (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-4 w-4" />
              <span>{error}</span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
