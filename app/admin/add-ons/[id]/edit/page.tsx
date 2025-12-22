"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ArrowLeft, Plus, Trash, X, Upload, Edit, Loader2, AlertTriangle, RefreshCw } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { getAddOnById, updateAddOn, AddOn, UpdateAddOnRequest, uploadAddOnImages } from "@/services/addOnService"

interface AddOnVariant {
  id: string;
  name: string;
  price_modifier: number;
  sku: string;
  stock_quantity: number;
}

type Props = {
  params: { id: string }
}

export default function EditAddOnPage({ params }: Props) {
  const router = useRouter()
  const { toast } = useToast()
  const addOnId = params.id

  const [addOn, setAddOn] = useState<AddOn | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [retryCount, setRetryCount] = useState(0)
  const [activeTab, setActiveTab] = useState("details")

  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [price, setPrice] = useState(0)
  const [category, setCategory] = useState<"meal" | "merchandise" | "service" | "other">("other")
  const [isActive, setIsActive] = useState(true)
  const [sku, setSku] = useState("")
  const [stockQuantity, setStockQuantity] = useState(0)
  const [hasVariants, setHasVariants] = useState(false)
  const [variants, setVariants] = useState<AddOnVariant[]>([])
  const [images, setImages] = useState<string[]>([])

  // New variant form state
  const [newVariantName, setNewVariantName] = useState("")
  const [newVariantPriceModifier, setNewVariantPriceModifier] = useState(0)
  const [newVariantSku, setNewVariantSku] = useState("")
  const [newVariantStock, setNewVariantStock] = useState(0)

  // Bundle discount form state
  const [minQuantity, setMinQuantity] = useState(2)
  const [discountPercentage, setDiscountPercentage] = useState(10)
  const [hasBundleDiscount, setHasBundleDiscount] = useState(false)

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

        // Populate form fields
        setName(data.name)
        setDescription(data.description)
        setPrice(parseFloat(data.price))
        setCategory(data.category)
        setIsActive(data.is_active)
        setHasVariants(data.has_variants)
        setImages([...data.images])

        if (data.has_variants && data.variants) {
          // Convert variants to match local interface (id as string)
          const convertedVariants = data.variants.map(v => ({
            ...v,
            id: String(v.id || '')
          }));
          setVariants(convertedVariants)
        } else {
          setSku(data.sku || "")
          setStockQuantity(data.stock_quantity || 0)
        }

        if (data.bundle_min_quantity > 0) {
          setHasBundleDiscount(true)
          setMinQuantity(data.bundle_min_quantity)
          setDiscountPercentage(parseFloat(data.bundle_discount_percentage))
        }
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

  const handleAddVariant = () => {
    if (newVariantName.trim() && newVariantSku.trim()) {
      const newVariant: AddOnVariant = {
        id: `variant-${Date.now()}`,
        name: newVariantName.trim(),
        price_modifier: newVariantPriceModifier,
        sku: newVariantSku.trim(),
        stock_quantity: newVariantStock
      }

      setVariants([...variants, newVariant])

      // Reset form
      setNewVariantName("")
      setNewVariantPriceModifier(0)
      setNewVariantSku("")
      setNewVariantStock(0)
    }
  }

  const handleRemoveVariant = (id: string) => {
    setVariants(variants.filter(v => v.id !== id))
  }

  const handleAddImage = async () => {
    // Add Image clicked (debug log removed)
    // Current images (debug log removed)

    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.multiple = true

    input.onchange = async (e) => {
      // File input changed (debug log removed)
      const files = (e.target as HTMLInputElement).files
      // Files selected (debug log removed)

      if (files && files.length > 0) {
        try {
          // Show loading state
          const fileArray = Array.from(files)
          // Processing files (debug log removed)


          // Upload files to server
          const uploadedUrls = await uploadAddOnImages(fileArray)
          // Files uploaded successfully (debug log removed)

          // Add the URLs to the images state
          setImages(prev => {
            const newImages = [...prev, ...uploadedUrls];
            // Updated images array length (debug log removed)
            return newImages;
          })

          toast({
            title: "Success",
            description: `${fileArray.length} image(s) uploaded successfully`,
          })
        } catch (error: any) {
          console.error('Error uploading images:', error)
          toast({
            title: "Upload Error",
            description: error.message || "Failed to upload images. Please try again.",
            variant: "destructive",
          })
        }
      }
    }

    input.click()
  }

  // Auto-navigate to next tab when hasVariants changes
  const handleHasVariantsChange = (checked: boolean) => {
    setHasVariants(checked)
    if (checked) {
      // Auto-navigate to images tab when variants is enabled
      setActiveTab("images")
    }
  }

  const handleRemoveImage = (index: number) => {
    const updatedImages = [...images]
    updatedImages.splice(index, 1)
    setImages(updatedImages)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validation
    if (!name.trim()) {
      toast({
        title: "Validation Error",
        description: "Add-on name is required",
        variant: "destructive",
      })
      setActiveTab("details")
      return
    }

    if (!description.trim()) {
      toast({
        title: "Validation Error",
        description: "Add-on description is required",
        variant: "destructive",
      })
      setActiveTab("details")
      return
    }

    if (price <= 0) {
      toast({
        title: "Validation Error",
        description: "Add-on price must be greater than 0",
        variant: "destructive",
      })
      setActiveTab("details")
      return
    }

    if (hasVariants && variants.length === 0) {
      toast({
        title: "Validation Error",
        description: "Please add at least one variant or disable 'Has Variants'",
        variant: "destructive",
      })
      setActiveTab("variants")
      return
    }

    if (!hasVariants && !sku.trim()) {
      toast({
        title: "Validation Error",
        description: "SKU is required when not using variants",
        variant: "destructive",
      })
      setActiveTab("details")
      return
    }

    try {
      setIsSubmitting(true)

      // Prepare the request data
      const requestData: UpdateAddOnRequest = {
        id: Number(addOnId),
        name,
        description,
        price,
        category,
        images,
        isActive,
        hasVariants,
        stock_quantity: hasVariants ? 0 : stockQuantity,
        sku: hasVariants ? "" : sku,
        bundleDiscount: hasBundleDiscount ? {
          minQuantity,
          discountPercentage
        } : {
          minQuantity: 0,
          discountPercentage: 0
        },
        variants: hasVariants ? variants.map(v => ({
          name: v.name,
          price_modifier: v.price_modifier,
          sku: v.sku,
          stock_quantity: v.stock_quantity
        })) : undefined
      }

      await updateAddOn(requestData)

      toast({
        title: "Success",
        description: "Add-on updated successfully",
      })

      // Redirect to the add-on details page
      router.push(`/admin/add-ons/${addOnId}`)
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to update add-on. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
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

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 min-w-0">
          <Button variant="outline" size="icon" asChild className="touch-manipulation flex-shrink-0">
            <Link href={`/admin/add-ons/${addOnId}`}>
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Back</span>
            </Link>
          </Button>
          <div className="min-w-0 flex-1">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight truncate">Edit Add-on</h1>
            <p className="text-sm sm:text-base text-muted-foreground truncate">Update the details for {addOn?.name}</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList>
            <TabsTrigger value="details">Basic Details</TabsTrigger>
            <TabsTrigger value="images">Images</TabsTrigger>
            <TabsTrigger value="variants" disabled={!hasVariants}>Variants</TabsTrigger>
            <TabsTrigger value="pricing">Pricing & Discounts</TabsTrigger>
          </TabsList>
          
          {/* Basic Details Tab */}
          <TabsContent value="details">
            <Card>
              <CardHeader>
                <CardTitle>Add-on Details</CardTitle>
                <CardDescription>Edit the basic information for this add-on</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter add-on name"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Enter add-on description"
                    rows={4}
                    required
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select value={category} onValueChange={(value) => setCategory(value as any)}>
                      <SelectTrigger id="category">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="meal">Meal</SelectItem>
                        <SelectItem value="merchandise">Merchandise</SelectItem>
                        <SelectItem value="service">Service</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="price">Base Price (₹)</Label>
                    <Input
                      id="price"
                      type="number"
                      min="0"
                      step="0.01"
                      value={price}
                      onChange={(e) => setPrice(parseFloat(e.target.value) || 0)}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="has-variants">Has Variants</Label>
                    <Switch
                      id="has-variants"
                      checked={hasVariants}
                      onCheckedChange={handleHasVariantsChange}
                    />
                  </div>
                  
                  {!hasVariants && (
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="sku">SKU</Label>
                        <Input
                          id="sku"
                          value={sku}
                          onChange={(e) => setSku(e.target.value)}
                          placeholder="Enter SKU"
                          required={!hasVariants}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="stock">Stock Quantity</Label>
                        <Input
                          id="stock"
                          type="number"
                          min="0"
                          value={stockQuantity}
                          onChange={(e) => setStockQuantity(parseInt(e.target.value) || 0)}
                          required={!hasVariants}
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex items-center space-x-2">
                  <Switch id="active" checked={isActive} onCheckedChange={setIsActive} />
                  <Label htmlFor="active">Active</Label>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <div></div>
                <Button
                  type="button"
                  onClick={() => setActiveTab("images")}
                  variant="outline"
                >
                  Next: Images →
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          {/* Images Tab */}
          <TabsContent value="images">
            <Card>
              <CardHeader>
                <CardTitle>Add-on Images</CardTitle>
                <CardDescription>Manage the images for this add-on</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                  {images.map((image, index) => (
                    <div key={index} className="relative aspect-square overflow-hidden rounded-md border">
                      <Image
                        src={image}
                        alt={`${name} - Image ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                      <Button
                        variant="destructive"
                        size="icon"
                        className="absolute right-2 top-2 h-6 w-6 rounded-full"
                        onClick={() => handleRemoveImage(index)}
                        type="button"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    className="flex aspect-square h-full w-full flex-col items-center justify-center rounded-md border border-dashed"
                    onClick={handleAddImage}
                    type="button"
                  >
                    <Upload className="mb-2 h-6 w-6" />
                    <span>Add Image</span>
                  </Button>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button
                  type="button"
                  onClick={() => setActiveTab("details")}
                  variant="outline"
                >
                  ← Back: Details
                </Button>
                <Button
                  type="button"
                  onClick={() => setActiveTab(hasVariants ? "variants" : "pricing")}
                  variant="outline"
                >
                  {hasVariants ? "Next: Variants →" : "Next: Pricing →"}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          {/* Variants Tab */}
          <TabsContent value="variants">
            <Card>
              <CardHeader>
                <CardTitle>Product Variants</CardTitle>
                <CardDescription>Manage the variants for this add-on</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>SKU</TableHead>
                        <TableHead>Price Modifier</TableHead>
                        <TableHead>Final Price</TableHead>
                        <TableHead>Stock</TableHead>
                        <TableHead className="w-[80px]"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {variants.map((variant) => (
                        <TableRow key={variant.id}>
                          <TableCell className="font-medium">{variant.name}</TableCell>
                          <TableCell>{variant.sku}</TableCell>
                          <TableCell>
                            {variant.price_modifier === 0 ? (
                              <span className="text-muted-foreground">Base price</span>
                            ) : (
                              <span className={variant.price_modifier > 0 ? "text-green-600" : "text-red-600"}>
                                {variant.price_modifier > 0 ? "+" : ""}₹{variant.price_modifier}
                              </span>
                            )}
                          </TableCell>
                          <TableCell>
                            ₹{(price + variant.price_modifier).toFixed(2)}
                          </TableCell>
                          <TableCell>{variant.stock_quantity}</TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleRemoveVariant(variant.id)}
                              type="button"
                            >
                              <Trash className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                      {variants.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={6} className="h-24 text-center">
                            <p className="text-muted-foreground">No variants added yet</p>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>Add New Variant</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="variant-name">Variant Name</Label>
                        <Input
                          id="variant-name"
                          value={newVariantName}
                          onChange={(e) => setNewVariantName(e.target.value)}
                          placeholder="e.g., Small - Red"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="variant-sku">SKU</Label>
                        <Input
                          id="variant-sku"
                          value={newVariantSku}
                          onChange={(e) => setNewVariantSku(e.target.value)}
                          placeholder="e.g., TS-S-RED"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="variant-price-modifier">Price Modifier (₹)</Label>
                        <Input
                          id="variant-price-modifier"
                          type="number"
                          step="0.01"
                          value={newVariantPriceModifier || ""}
                          onChange={(e) => setNewVariantPriceModifier(parseFloat(e.target.value) || 0)}
                          placeholder="0 for base price"
                        />
                        <p className="text-xs text-muted-foreground">
                          Amount to add/subtract from base price (use negative for discount)
                        </p>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="variant-stock">Stock Quantity</Label>
                        <Input
                          id="variant-stock"
                          type="number"
                          min="0"
                          value={newVariantStock || ""}
                          onChange={(e) => setNewVariantStock(parseInt(e.target.value) || 0)}
                        />
                      </div>
                    </div>


                  </CardContent>
                  <CardFooter>
                    <Button
                      type="button"
                      onClick={handleAddVariant}
                      disabled={!newVariantName.trim() || !newVariantSku.trim()}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Add Variant
                    </Button>
                  </CardFooter>
                </Card>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Pricing & Discounts Tab */}
          <TabsContent value="pricing">
            <Card>
              <CardHeader>
                <CardTitle>Pricing & Discounts</CardTitle>
                <CardDescription>Manage pricing and discount options</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="has-bundle-discount">Bundle Discount</Label>
                    <Switch
                      id="has-bundle-discount"
                      checked={hasBundleDiscount}
                      onCheckedChange={setHasBundleDiscount}
                    />
                  </div>
                  
                  {hasBundleDiscount && (
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="min-quantity">Minimum Quantity</Label>
                        <Input
                          id="min-quantity"
                          type="number"
                          min="2"
                          value={minQuantity}
                          onChange={(e) => setMinQuantity(parseInt(e.target.value) || 2)}
                          required={hasBundleDiscount}
                        />
                        <p className="text-xs text-muted-foreground">
                          Minimum quantity required to apply the discount
                        </p>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="discount-percentage">Discount Percentage (%)</Label>
                        <Input
                          id="discount-percentage"
                          type="number"
                          min="0"
                          max="100"
                          value={discountPercentage}
                          onChange={(e) => setDiscountPercentage(parseInt(e.target.value) || 0)}
                          required={hasBundleDiscount}
                        />
                        <p className="text-xs text-muted-foreground">
                          Percentage discount to apply when minimum quantity is reached
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="mt-6 flex justify-between">
          <Button type="button" variant="outline" onClick={() => router.push(`/admin/add-ons/${addOnId}`)}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
