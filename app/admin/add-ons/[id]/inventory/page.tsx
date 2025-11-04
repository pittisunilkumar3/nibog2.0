"use client"

import { use, useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Plus, Minus, Save, Package } from "lucide-react"
import { addOns } from "@/data/add-ons"
import { getAddOnById } from "@/services/addOnService"
// Import AddOn type from service to ensure compatibility
import { AddOn as ServiceAddOn } from "@/services/addOnService"
import { AddOn } from "@/types"

type Props = {
  params: { id: string }
}

export default function AddOnInventoryPage({ params }: Props) {
  const router = useRouter()
  
  // Get the ID from params
  const addOnId = params.id
  
  // State for add-on data and loading states
  const [addOnData, setAddOnData] = useState<any | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [stockQuantity, setStockQuantity] = useState(0)
  const [variantStocks, setVariantStocks] = useState<Record<string, number>>({})
  const [isSaved, setIsSaved] = useState(false)
  const [stockHistory, setStockHistory] = useState<Array<{
    date: string;
    action: "add" | "remove";
    quantity: number;
    notes: string;
  }>>([
    {
      date: "2023-10-15",
      action: "add",
      quantity: 50,
      notes: "Initial stock"
    },
    {
      date: "2023-11-20",
      action: "add",
      quantity: 25,
      notes: "Restocked"
    },
    {
      date: "2023-12-05",
      action: "remove",
      quantity: 10,
      notes: "Damaged items"
    }
  ])
  
  // New stock adjustment form
  const [adjustmentQuantity, setAdjustmentQuantity] = useState(0)
  const [adjustmentAction, setAdjustmentAction] = useState<"add" | "remove">("add")
  const [adjustmentNotes, setAdjustmentNotes] = useState("")
  const [selectedVariantId, setSelectedVariantId] = useState("")

  // Fetch add-on data when component mounts or ID changes
  useEffect(() => {
    async function loadAddOnData() {
      setIsLoading(true);
      setError(null);
      try {
        // Try to get add-on data using the service
        const data = await getAddOnById(addOnId);
        setAddOnData(data);
        
        // Access properties with type safety
        const hasVariants = Boolean(data.has_variants);
        const variants = data.variants || [];

        // Initialize stock quantities
        if (hasVariants && variants.length > 0) {
          const initialVariantStocks: Record<string, number> = {};
          data.variants.forEach((variant: any) => {
            // Use stock_quantity property
            const variantId = String(variant.id || ''); // Ensure ID is a string
            initialVariantStocks[variantId] = variant.stock_quantity || 0;
          });
          setVariantStocks(initialVariantStocks);
          if (data.variants.length > 0) {
            const firstVariantId = String(data.variants[0].id || '');
            setSelectedVariantId(firstVariantId);
          }
        } else {
          // Use stock_quantity property
          const stockQty = typeof data.stock_quantity !== 'undefined' ? data.stock_quantity : 0;
          setStockQuantity(stockQty);
        }
      } catch (err: any) {
        console.error('Error fetching add-on data:', err);
        setError(err.message || 'Failed to load add-on data');
      } finally {
        setIsLoading(false);
      }
    }
    
    loadAddOnData();
  }, [addOnId])

  const handleStockAdjustment = () => {
    if (adjustmentQuantity <= 0 || !adjustmentNotes.trim()) {
      return
    }
    
    const newAdjustment = {
      date: new Date().toISOString().split('T')[0],
      action: adjustmentAction,
      quantity: adjustmentQuantity,
      notes: adjustmentNotes.trim()
    }
    
    setStockHistory([newAdjustment, ...stockHistory])
    
    // Update stock quantity
    if (addOnData?.hasVariants) {
      if (selectedVariantId) {
        setVariantStocks(prev => ({
          ...prev,
          [selectedVariantId]: adjustmentAction === "add" 
            ? (prev[selectedVariantId] || 0) + adjustmentQuantity
            : Math.max(0, (prev[selectedVariantId] || 0) - adjustmentQuantity)
        }))
      }
    } else {
      setStockQuantity(prev => 
        adjustmentAction === "add" 
          ? prev + adjustmentQuantity
          : Math.max(0, prev - adjustmentQuantity)
      )
    }
    
    // Reset form
    setAdjustmentQuantity(0)
    setAdjustmentNotes("")
  }

  const handleSaveInventory = () => {
    // In a real app, this would be an API call to update inventory
    console.log("Saving inventory changes:", {
      addOnId,
      hasVariants: addOnData?.hasVariants || addOnData?.has_variants,
      stockQuantity,
      variantStocks
    })
    
    // Show saved state
    setIsSaved(true)
    setTimeout(() => {
      setIsSaved(false)
      router.push(`/admin/add-ons/${addOnId}`)
    }, 1500)
  }

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Loading...</h2>
          <p className="text-muted-foreground">Fetching add-on inventory data</p>
        </div>
      </div>
    )
  }

  // Show error state
  if (error || !addOnData) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Add-on Not Found</h2>
          <p className="text-muted-foreground">{error || "The add-on you're looking for doesn't exist or has been removed."}</p>
          <Button className="mt-4" asChild>
            <Link href="/admin/add-ons">Back to Add-ons</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" asChild>
          <Link href={`/admin/add-ons/${addOnId}`}>
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back</span>
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Manage Inventory</h1>
          <p className="text-muted-foreground">{addOnData.name}</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Current Inventory</CardTitle>
              <CardDescription>
                {(addOnData.hasVariants || addOnData.has_variants) 
                  ? "Manage inventory for each variant" 
                  : "Manage inventory for this add-on"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {(addOnData.hasVariants || addOnData.has_variants) && addOnData.variants && addOnData.variants.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Variant</TableHead>
                      <TableHead>SKU</TableHead>
                      <TableHead>Current Stock</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {addOnData.variants.map((variant: any) => (
                      <TableRow key={String(variant.id || '')}>
                        <TableCell className="font-medium">{variant.name}</TableCell>
                        <TableCell>{variant.sku}</TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            min="0"
                            value={variantStocks[variant.id] || 0}
                            onChange={(e) => setVariantStocks(prev => ({
                              ...prev,
                              [variant.id]: parseInt(e.target.value) || 0
                            }))}
                            className="w-24"
                          />
                        </TableCell>
                        <TableCell>
                          {(variantStocks[variant.id] || 0) === 0 ? (
                            <Badge variant="outline" className="bg-red-50 text-red-500">Out of Stock</Badge>
                          ) : (variantStocks[variant.id] || 0) <= 5 ? (
                            <Badge variant="outline" className="bg-amber-50 text-amber-500">Low Stock</Badge>
                          ) : (
                            <Badge variant="outline" className="bg-green-50 text-green-500">In Stock</Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="flex items-center gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="stock-quantity">Stock Quantity</Label>
                    <Input
                      id="stock-quantity"
                      type="number"
                      min="0"
                      value={stockQuantity}
                      onChange={(e) => setStockQuantity(parseInt(e.target.value) || 0)}
                      className="w-32"
                    />
                  </div>
                  <div className="space-y-2 pt-7">
                    {stockQuantity === 0 ? (
                      <Badge variant="outline" className="bg-red-50 text-red-500">Out of Stock</Badge>
                    ) : stockQuantity <= 10 ? (
                      <Badge variant="outline" className="bg-amber-50 text-amber-500">Low Stock</Badge>
                    ) : (
                      <Badge variant="outline" className="bg-green-50 text-green-500">In Stock</Badge>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button onClick={handleSaveInventory} disabled={isSaved}>
                <Save className="mr-2 h-4 w-4" />
                {isSaved ? "Saved!" : "Save Inventory Changes"}
              </Button>
            </CardFooter>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Stock History</CardTitle>
              <CardDescription>Record of inventory changes</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Notes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stockHistory.map((entry, index) => (
                    <TableRow key={index}>
                      <TableCell>{entry.date}</TableCell>
                      <TableCell>
                        {entry.action === "add" ? (
                          <Badge className="bg-green-500 hover:bg-green-600">Added</Badge>
                        ) : (
                          <Badge className="bg-red-500 hover:bg-red-600">Removed</Badge>
                        )}
                      </TableCell>
                      <TableCell>{entry.quantity}</TableCell>
                      <TableCell>{entry.notes}</TableCell>
                    </TableRow>
                  ))}
                  {stockHistory.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className="h-24 text-center">
                        <p className="text-muted-foreground">No stock history available</p>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Adjust Stock</CardTitle>
              <CardDescription>Add or remove stock</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {(addOnData.hasVariants || addOnData.has_variants) && addOnData.variants && (
                <div className="space-y-2">
                  <Label htmlFor="variant">Select Variant</Label>
                  <select
                    id="variant"
                    value={selectedVariantId}
                    onChange={(e) => setSelectedVariantId(e.target.value)}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    {addOnData.variants.map((variant: any) => (
                      <option key={variant.id} value={variant.id}>
                        {variant.name} ({variant.sku})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="adjustment-action">Action</Label>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant={adjustmentAction === "add" ? "default" : "outline"}
                    className="flex-1"
                    onClick={() => setAdjustmentAction("add")}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Stock
                  </Button>
                  <Button
                    type="button"
                    variant={adjustmentAction === "remove" ? "default" : "outline"}
                    className="flex-1"
                    onClick={() => setAdjustmentAction("remove")}
                  >
                    <Minus className="mr-2 h-4 w-4" />
                    Remove Stock
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="adjustment-quantity">Quantity</Label>
                <Input
                  id="adjustment-quantity"
                  type="number"
                  min="1"
                  value={adjustmentQuantity || ""}
                  onChange={(e) => setAdjustmentQuantity(parseInt(e.target.value) || 0)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="adjustment-notes">Notes</Label>
                <Input
                  id="adjustment-notes"
                  value={adjustmentNotes}
                  onChange={(e) => setAdjustmentNotes(e.target.value)}
                  placeholder="e.g., New shipment received"
                  required
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button
                onClick={handleStockAdjustment}
                disabled={adjustmentQuantity <= 0 || !adjustmentNotes.trim() || (addOnData.hasVariants && !selectedVariantId)}
                className="w-full"
              >
                {adjustmentAction === "add" ? "Add to Stock" : "Remove from Stock"}
              </Button>
            </CardFooter>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Inventory Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center">
                <div className="text-center">
                  <Package className="mx-auto h-12 w-12 text-muted-foreground" />
                  <div className="mt-4 text-2xl font-bold">
                    {addOnData.hasVariants && addOnData.variants
                      ? Object.values(variantStocks).reduce((sum, qty) => sum + qty, 0)
                      : stockQuantity}
                  </div>
                  <div className="text-sm text-muted-foreground">Total Units in Stock</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
