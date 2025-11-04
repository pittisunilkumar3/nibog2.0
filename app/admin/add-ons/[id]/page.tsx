"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ArrowLeft, Edit, Trash, AlertTriangle, Package, Tag, ShoppingCart, Loader2, RefreshCw } from "lucide-react"
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
import { useToast } from "@/hooks/use-toast"
import { getAddOnById, deleteAddOn, AddOn } from "@/services/addOnService"
import { useRouter } from "next/navigation"

type Props = {
  params: { id: string }
}

export default function AddOnDetailPage({ params }: Props) {
  const router = useRouter()
  const { toast } = useToast()
  const [addOn, setAddOn] = useState<AddOn | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [retryCount, setRetryCount] = useState(0)

  const addOnId = params.id

  // Retry function
  const retryFetch = () => {
    setRetryCount(prev => prev + 1)
    setError(null)
  }

  // Fetch add-on data
  useEffect(() => {
    const fetchAddOn = async () => {
      try {
        setIsLoading(true)
        setError(null)

        const data = await getAddOnById(addOnId)
        setAddOn(data)
      } catch (error: any) {
        let errorMessage = "Failed to load add-on details"

        if (error.message.includes('timeout') || error.message.includes('Request timeout')) {
          errorMessage = "The request is taking too long. Please try again or check your connection."
        } else if (error.message.includes('503') || error.message.includes('504')) {
          errorMessage = "The add-on service is temporarily unavailable. Please try again later."
        } else if (error.message.includes('not found')) {
          errorMessage = "Add-on not found. It may have been deleted or the ID is incorrect."
        }

        setError(errorMessage)
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    if (addOnId && !addOn) {
      fetchAddOn()
    }
  }, [addOnId, retryCount])

  const handleDeleteAddOn = async () => {
    try {
      setIsDeleting(true)

      await deleteAddOn(Number(addOnId))

      toast({
        title: "Success",
        description: "Add-on deleted successfully",
      })

      // Redirect to the add-ons list
      router.push("/admin/add-ons")
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to delete add-on. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <h2 className="text-xl font-semibold">Loading add-on details...</h2>
          <p className="text-muted-foreground">
            {retryCount > 0 ? `Retrying... (Attempt ${retryCount + 1})` : "Please wait while we fetch the add-on information."}
          </p>
          <div className="text-xs text-muted-foreground">
            Add-on ID: {addOnId}
          </div>
        </div>
      </div>
    )
  }

  if (error || (!addOn && !isLoading)) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <div className="text-center space-y-4">
          <AlertTriangle className="h-8 w-8 mx-auto text-destructive" />
          <h2 className="text-xl font-semibold">
            {error ? "Error loading add-on" : "Add-on not found"}
          </h2>
          <p className="text-muted-foreground max-w-md">
            {error || "The add-on you are looking for does not exist."}
          </p>
          <div className="flex gap-2 justify-center">
            {error && (
              <Button variant="outline" onClick={retryFetch}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Try Again
              </Button>
            )}
            <Button onClick={() => router.push("/admin/add-ons")}>
              Back to Add-ons
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // Add null check for addOn
  if (!addOn) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-muted-foreground">Add-on data not available</p>
          <Button onClick={() => router.push("/admin/add-ons")} className="mt-4">
            Back to Add-ons
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 min-w-0">
          <Button variant="outline" size="icon" asChild className="touch-manipulation flex-shrink-0">
            <Link href="/admin/add-ons">
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Back</span>
            </Link>
          </Button>
          <div className="min-w-0 flex-1">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight truncate">{addOn.name}</h1>
            <p className="text-sm sm:text-base text-muted-foreground truncate">
              {addOn.category.charAt(0).toUpperCase() + addOn.category.slice(1)} •
              SKU: {addOn.has_variants ? "Multiple" : addOn.sku}
            </p>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button variant="outline" asChild className="touch-manipulation">
            <Link href={`/admin/add-ons/${addOn.id}/edit`}>
              <Edit className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Edit Add-on</span>
              <span className="sm:hidden">Edit</span>
            </Link>
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="outline"
                className="text-red-500 hover:bg-red-50 hover:text-red-600"
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Trash className="mr-2 h-4 w-4" />
                )}
                {isDeleting ? "Deleting..." : "Delete"}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Add-on</AlertDialogTitle>
                <AlertDialogDescription>
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="mt-0.5 h-5 w-5 text-amber-500" />
                    <div className="space-y-2">
                      <div className="font-medium">This action cannot be undone.</div>
                      <div>
                        This will permanently delete the "{addOn.name}" add-on.
                        Deleting it will not affect existing bookings, but it will no longer be available for new bookings.
                      </div>
                    </div>
                  </div>
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  className="bg-red-500 hover:bg-red-600"
                  onClick={handleDeleteAddOn}
                  disabled={isDeleting}
                >
                  {isDeleting ? "Deleting..." : "Delete"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <div className="grid gap-4 sm:gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Add-on Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Name</h3>
                  <p className="mt-1">{addOn.name}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Category</h3>
                  <p className="mt-1 capitalize">{addOn.category}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Base Price</h3>
                  <p className="mt-1">₹{parseFloat(addOn.price).toLocaleString()}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Status</h3>
                  <div className="mt-1">
                    {addOn.is_active ? (
                      <Badge className="bg-green-500 hover:bg-green-600">Active</Badge>
                    ) : (
                      <Badge variant="outline">Inactive</Badge>
                    )}
                  </div>
                </div>
                {!addOn.has_variants && (
                  <>
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">SKU</h3>
                      <p className="mt-1">{addOn.sku}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">Stock Quantity</h3>
                      <p className="mt-1">{addOn.stock_quantity} units</p>
                    </div>
                  </>
                )}
                {addOn.bundle_min_quantity > 0 && (
                  <div className="sm:col-span-2">
                    <h3 className="text-sm font-medium text-muted-foreground">Bundle Discount</h3>
                    <p className="mt-1">
                      {parseFloat(addOn.bundle_discount_percentage)}% off when ordering {addOn.bundle_min_quantity} or more
                    </p>
                  </div>
                )}
              </div>

              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Description</h3>
                <p className="mt-1">{addOn.description}</p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Images</h3>
                <div className="mt-2 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                  {addOn.images.map((image, index) => (
                    <div key={index} className="relative aspect-square overflow-hidden rounded-md border">
                      <Image
                        src={image}
                        alt={`${addOn.name} - Image ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {addOn.has_variants && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Variants</CardTitle>
                <CardDescription>Manage product variants and their inventory</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>SKU</TableHead>
                      <TableHead>Price Modifier</TableHead>
                      <TableHead>Final Price</TableHead>
                      <TableHead>Stock</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {addOn.variants?.map((variant) => (
                      <TableRow key={variant.id}>
                        <TableCell className="font-medium">{variant.name}</TableCell>
                        <TableCell>{variant.sku}</TableCell>
                        <TableCell>
                          {variant.price_modifier === 0 ? (
                            <span className="text-muted-foreground">No change</span>
                          ) : (
                            <span className={variant.price_modifier > 0 ? "text-green-600" : "text-red-600"}>
                              {variant.price_modifier > 0 ? "+" : ""}₹{variant.price_modifier}
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                          ₹{(parseFloat(addOn.price) + variant.price_modifier).toLocaleString()}
                        </TableCell>
                        <TableCell>
                          {variant.stock_quantity <= 5 ? (
                            <span className="text-red-500">{variant.stock_quantity} units</span>
                          ) : (
                            <span>{variant.stock_quantity} units</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button className="w-full justify-start" asChild>
                <Link href={`/admin/add-ons/${addOn.id}/edit`}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Add-on Details
                </Link>
              </Button>
              <Button className="w-full justify-start" variant="outline" asChild>
                <Link href={`/admin/add-ons/${addOn.id}/inventory`}>
                  <Package className="mr-2 h-4 w-4" />
                  Manage Inventory
                </Link>
              </Button>
              {addOn.has_variants && (
                <Button className="w-full justify-start" variant="outline" asChild>
                  <Link href={`/admin/add-ons/${addOn.id}/variants`}>
                    <Tag className="mr-2 h-4 w-4" />
                    Manage Variants
                  </Link>
                </Button>
              )}
              <Button className="w-full justify-start" variant="outline" asChild>
                <Link href={`/admin/add-ons/${addOn.id}/orders`}>
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  View Orders
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Inventory Summary</CardTitle>
            </CardHeader>
            <CardContent>
              {addOn.has_variants ? (
                <div className="space-y-4">
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">Total Variants</div>
                    <div className="mt-1 text-2xl font-bold">{addOn.variants?.length}</div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">Total Stock</div>
                    <div className="mt-1 text-2xl font-bold">
                      {addOn.variants?.reduce((total, variant) => total + variant.stock_quantity, 0)} units
                    </div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">Low Stock Variants</div>
                    <div className="mt-1 text-2xl font-bold">
                      {addOn.variants?.filter(v => v.stock_quantity <= 5).length || 0}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">Current Stock</div>
                    <div className="mt-1 text-2xl font-bold">{addOn.stock_quantity} units</div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">Stock Status</div>
                    <div className="mt-1">
                      {addOn.stock_quantity === 0 ? (
                        <Badge variant="outline" className="bg-red-50 text-red-500">Out of Stock</Badge>
                      ) : addOn.stock_quantity <= 10 ? (
                        <Badge variant="outline" className="bg-amber-50 text-amber-500">Low Stock</Badge>
                      ) : (
                        <Badge variant="outline" className="bg-green-50 text-green-500">In Stock</Badge>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
