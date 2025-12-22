"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ArrowLeft, Edit, Trash, AlertTriangle, User, Mail, Phone, MapPin, Calendar, X, Check, Loader2 } from "lucide-react"
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
import { getUserById, deleteUser, User as UserType } from "@/services/userService"
import { useToast } from "@/hooks/use-toast"

// Type for the component props
type Props = {
  params: { id: string }
}

export default function UserDetailPage({ params }: Props) {
  const router = useRouter()
  const { toast } = useToast()

  // In Next.js app router, params is already resolved
  const userId = Number(params.id)

  const [user, setUser] = useState<UserType | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState<string | null>(null)

  // Fetch user data
  useEffect(() => {
    const fetchUser = async () => {
      try {
        setIsLoading(true)
        setError(null)
        const userData = await getUserById(userId)
        setUser(userData)
      } catch (error) {
        console.error(`Failed to fetch user with ID ${userId}:`, error)
        setError('Failed to load user details. Please try again.')
        toast({
          title: "Error",
          description: "Failed to load user details. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    if (userId) {
      fetchUser()
    }
  }, [userId, toast])

  // Handle delete user
  const handleDeleteUser = async () => {
    setIsProcessing("delete")

    try {

      // Call the API to delete the user
      const result = await deleteUser(userId)


      toast({
        title: "Success",
        description: "User deleted successfully.",
      })

      // Add a small delay before redirecting to ensure the toast is shown
      setTimeout(() => {
        // Redirect to the users list page
        router.push("/admin/users")
      }, 500);
    } catch (error: any) {
      console.error(`Failed to delete user ${userId}:`, error)
      toast({
        title: "Error",
        description: error.message || "Failed to delete user. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(null)
    }
  }

  // Handle block/unblock user
  const handleToggleUserStatus = () => {
    if (!user) return

    setIsProcessing("status")

    // This is still a placeholder - we'll need to implement the real API call
    // when the API endpoint is available
    setTimeout(() => {
      setIsProcessing(null)

      // Update the local state
      setUser({
        ...user,
        is_active: !user.is_active
      })

      toast({
        title: "Success",
        description: `User ${user.is_active ? 'deactivated' : 'activated'} successfully.`,
      })
    }, 1000)
  }

  if (isLoading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading user details...</p>
        </div>
      </div>
    )
  }

  if (error || !user) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold">User not found</h2>
          <p className="text-muted-foreground">{error || "The user you are looking for does not exist."}</p>
          <Button className="mt-4" onClick={() => router.push("/admin/users")}>
            Back to Users
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" asChild>
            <Link href="/admin/users">
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Back</span>
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{user.full_name}</h1>
            <p className="text-muted-foreground">{user.email}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href={`/admin/users/${user.user_id}/edit`}>
              <Edit className="mr-2 h-4 w-4" />
              Edit User
            </Link>
          </Button>

          {/* We'll assume regular users don't have admin privileges for now */}
          {/* In the future, we might want to add role information to the API response */}
          <>
            {user.is_active && !user.is_locked ? (
              <Button
                variant="outline"
                className="text-amber-500 hover:bg-amber-50 hover:text-amber-600 dark:hover:bg-amber-950/20"
                onClick={handleToggleUserStatus}
                disabled={isProcessing === "status"}
              >
                <X className="mr-2 h-4 w-4" />
                {isProcessing === "status" ? "Locking..." : "Lock User"}
              </Button>
            ) : user.is_locked ? (
              <Button
                variant="outline"
                className="text-green-500 hover:bg-green-50 hover:text-green-600 dark:hover:bg-green-950/20"
                onClick={handleToggleUserStatus}
                disabled={isProcessing === "status"}
              >
                <Check className="mr-2 h-4 w-4" />
                {isProcessing === "status" ? "Unlocking..." : "Unlock User"}
              </Button>
            ) : (
              <Button
                variant="outline"
                className="text-green-500 hover:bg-green-50 hover:text-green-600 dark:hover:bg-green-950/20"
                onClick={handleToggleUserStatus}
                disabled={isProcessing === "status"}
              >
                <Check className="mr-2 h-4 w-4" />
                {isProcessing === "status" ? "Activating..." : "Activate User"}
              </Button>
            )}

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="outline"
                  className="text-red-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/20"
                  data-testid="delete-user-button"
                >
                  <Trash className="mr-2 h-4 w-4" />
                  Delete User
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete User</AlertDialogTitle>
                  <AlertDialogDescription>
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="mt-0.5 h-5 w-5 text-amber-500" />
                      <div className="space-y-2">
                        <div className="font-medium">This action cannot be undone.</div>
                        <div>
                          This will permanently delete the user account for {user.full_name} ({user.email}).
                          {/* We don't have booking information in the API response yet */}
                          {/* When we do, we can add it back here */}
                          Deleting this user may affect existing booking data.
                        </div>
                      </div>
                    </div>
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    className="bg-red-500 hover:bg-red-600"
                    onClick={(e) => {
                      e.preventDefault();
                      handleDeleteUser();
                    }}
                    disabled={isProcessing === "delete"}
                    data-testid="confirm-delete-user-button"
                  >
                    {isProcessing === "delete" ? "Deleting..." : "Delete User"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>User Details</CardTitle>
            <div className="mt-2 flex gap-2">
              {/* We don't have role information in the API response yet */}
              <Badge variant="outline">User</Badge>

              {user.is_active ? (
                user.is_locked ? (
                  <Badge className="bg-amber-500 hover:bg-amber-600">Locked</Badge>
                ) : (
                  <Badge className="bg-green-500 hover:bg-green-600">Active</Badge>
                )
              ) : (
                <Badge variant="outline">Inactive</Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <h3 className="mb-2 font-medium">Contact Information</h3>
                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <User className="mt-0.5 h-4 w-4 text-muted-foreground" />
                    <p>{user.full_name}</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <Mail className="mt-0.5 h-4 w-4 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                    {user.email_verified && (
                      <Badge variant="outline" className="ml-1 text-xs">Verified</Badge>
                    )}
                  </div>
                  <div className="flex items-start gap-2">
                    <Phone className="mt-0.5 h-4 w-4 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">{user.phone}</p>
                    {user.phone_verified && (
                      <Badge variant="outline" className="ml-1 text-xs">Verified</Badge>
                    )}
                  </div>
                </div>
              </div>
              <div>
                <h3 className="mb-2 font-medium">Location</h3>
                <div className="flex items-start gap-2">
                  <MapPin className="mt-0.5 h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">{user.city_name || 'N/A'}</p>
                    {user.state && (
                      <p className="text-sm text-muted-foreground">{user.state}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <h3 className="mb-2 font-medium">Account Information</h3>
                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <Calendar className="mt-0.5 h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Registered on: {new Date(user.created_at).toLocaleDateString()}
                      </p>
                      {user.last_login_at && (
                        <p className="text-sm text-muted-foreground">
                          Last login: {new Date(user.last_login_at).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="mb-2 font-medium">Account Status</h3>
                <div className="rounded-lg border p-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Active</span>
                      <span>{user.is_active ? 'Yes' : 'No'}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Locked</span>
                      <span>{user.is_locked ? 'Yes' : 'No'}</span>
                    </div>
                    {user.is_locked && user.locked_until && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Locked Until</span>
                        <span>{new Date(user.locked_until).toLocaleDateString()}</span>
                      </div>
                    )}
                    {user.terms_accepted_at && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Terms Accepted</span>
                        <span>{new Date(user.terms_accepted_at).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button className="w-full justify-start" asChild>
              <Link href={`/admin/users/${user.user_id}/edit`}>
                <Edit className="mr-2 h-4 w-4" />
                Edit User Details
              </Link>
            </Button>

            {/* We don't have booking information in the API response yet */}
            {/* When we do, we can add it back here */}

            {user.is_active && !user.is_locked ? (
              <Button
                className="w-full justify-start text-amber-500 hover:bg-amber-50 hover:text-amber-600 dark:hover:bg-amber-950/20"
                variant="outline"
                onClick={handleToggleUserStatus}
                disabled={isProcessing === "status"}
              >
                <X className="mr-2 h-4 w-4" />
                {isProcessing === "status" ? "Locking..." : "Lock User"}
              </Button>
            ) : user.is_locked ? (
              <Button
                className="w-full justify-start text-green-500 hover:bg-green-50 hover:text-green-600 dark:hover:bg-green-950/20"
                variant="outline"
                onClick={handleToggleUserStatus}
                disabled={isProcessing === "status"}
              >
                <Check className="mr-2 h-4 w-4" />
                {isProcessing === "status" ? "Unlocking..." : "Unlock User"}
              </Button>
            ) : (
              <Button
                className="w-full justify-start text-green-500 hover:bg-green-50 hover:text-green-600 dark:hover:bg-green-950/20"
                variant="outline"
                onClick={handleToggleUserStatus}
                disabled={isProcessing === "status"}
              >
                <Check className="mr-2 h-4 w-4" />
                {isProcessing === "status" ? "Activating..." : "Activate User"}
              </Button>
            )}

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  className="w-full justify-start text-red-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/20"
                  variant="outline"
                  data-testid="quick-delete-user-button"
                >
                  <Trash className="mr-2 h-4 w-4" />
                  Delete User
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete User</AlertDialogTitle>
                  <AlertDialogDescription>
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="mt-0.5 h-5 w-5 text-amber-500" />
                      <div className="space-y-2">
                        <div className="font-medium">This action cannot be undone.</div>
                        <div>
                          This will permanently delete the user account for {user.full_name} ({user.email}).
                          Deleting this user may affect existing booking data.
                        </div>
                      </div>
                    </div>
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    className="bg-red-500 hover:bg-red-600"
                    onClick={(e) => {
                      e.preventDefault();
                      handleDeleteUser();
                    }}
                    disabled={isProcessing === "delete"}
                    data-testid="quick-confirm-delete-user-button"
                  >
                    {isProcessing === "delete" ? "Deleting..." : "Delete User"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardContent>
        </Card>
      </div>

      {/* We don't have booking information in the API response yet */}
      {/* When we do, we can add it back here */}
    </div>
  )
}
