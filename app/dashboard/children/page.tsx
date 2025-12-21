"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Baby, Loader2, AlertTriangle } from "lucide-react"
import { formatAge } from "@/lib/age-calculation"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { useCustomerProfile } from "@/lib/swr-hooks"

// Force dynamic rendering for this page
export const dynamic = 'force-dynamic'

export default function ChildrenPage() {
  const { user, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const { customerProfile: userProfile, isLoading: profileLoading, isError, mutate } = useCustomerProfile(user?.user_id || null)

  // Show loading state while checking authentication or loading profile
  if (authLoading || profileLoading) {
    return (
      <div className="container py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight">My Children</h1>
          <p className="text-muted-foreground">Manage your children's profiles</p>
        </div>
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="flex items-center gap-2">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span>Loading children profiles...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Redirect to login if not authenticated (after loading is complete)
  if (!user) {
    router.push('/login')
    return null
  }

  // Show error state
  if (isError || !userProfile) {
    return (
      <div className="container py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight">My Children</h1>
          <p className="text-muted-foreground">Manage your children's profiles</p>
        </div>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <AlertTriangle className="h-12 w-12 text-amber-500 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Unable to Load Children</h3>
            <p className="text-sm text-muted-foreground mb-4">
              We couldn't load your children's profiles. Please try again later.
            </p>
            <Button onClick={() => mutate()}>Retry</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const children = userProfile.children || []

  return (
    <div className="container py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">My Children</h1>
        <p className="text-muted-foreground">View your children's profiles</p>
      </div>

      {children.length === 0 ? (
        <div className="flex h-[300px] flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
          <Baby className="h-10 w-10 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold">No Children Added Yet</h3>
          <p className="mb-4 mt-2 text-sm text-muted-foreground">
            Your children's profiles will appear here.
          </p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {children.map((child) => {
            return (
              <Card key={child.child_id} className="overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20">
                  <CardTitle>{child.child_name}</CardTitle>
                  <CardDescription>
                    {child.date_of_birth} ({formatAge(child.age_in_months)})
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Age:</span>
                      <span className="font-medium">{child.age_in_months} months</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Child ID:</span>
                      <span className="font-medium">{child.child_id}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
