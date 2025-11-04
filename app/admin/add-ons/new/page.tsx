"use client"

import React, { useState } from "react"
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
import { ArrowLeft, Plus, Trash, X, Upload as UploadIcon, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { createAddOn, CreateAddOnRequest, uploadAddOnImages } from "@/services/addOnService"
import { cn } from "@/lib/utils"
import { MobileTestHelper } from "@/components/admin/mobile-test-helper"

interface AddOnVariant {
  id: string;
  name: string;
  price_modifier: number;
  sku: string;
  stock_quantity: number;
}

const NewAddOnPage: React.FC = () => {
  const router = useRouter()
  const { toast } = useToast()

  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [price, setPrice] = useState(0)
  const [category, setCategory] = useState<"meal" | "merchandise" | "service" | "other">("other")
  const [isActive, setIsActive] = useState(true)
  const [sku, setSku] = useState("")
  const [stockQuantity, setStockQuantity] = useState("")
  const [hasVariants, setHasVariants] = useState(false)
  const [variants, setVariants] = useState<AddOnVariant[]>([])
  const [images, setImages] = useState<string[]>([])
  const [hasBundleDiscount, setHasBundleDiscount] = useState(false)
  const [minQuantity, setMinQuantity] = useState(2)
  const [discountPercentage, setDiscountPercentage] = useState(10)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [activeTab, setActiveTab] = useState("details")

  // New variant form state
  const [newVariantName, setNewVariantName] = useState("")
  const [newVariantPriceModifier, setNewVariantPriceModifier] = useState(0)
  const [newVariantSku, setNewVariantSku] = useState("")
  const [newVariantStock, setNewVariantStock] = useState(0)

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
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.multiple = true

    input.onchange = async (e) => {
      const files = (e.target as HTMLInputElement).files
      if (files && files.length > 0) {
        try {
          // Show loading state
          const fileArray = Array.from(files)

          // Upload files to server
          const uploadedUrls = await uploadAddOnImages(fileArray)

          // Add the URLs to the images state
          setImages(prev => [...prev, ...uploadedUrls])

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

  // Handle variants toggle
  const handleHasVariantsChange = (checked: boolean) => {
    setHasVariants(checked)
    // Don't auto-navigate, let user stay on current tab
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

    if (!hasVariants && (Number(stockQuantity) <= 0 || stockQuantity === "")) {
      toast({
        title: "Validation Error",
        description: "Stock quantity must be greater than 0 when not using variants",
        variant: "destructive",
      })
      setActiveTab("details")
      return
    }

    try {
      setIsSubmitting(true)

      // Prepare the request data - EXACT format matching your n8n workflow
      const requestData: any = {
        name,
        description,
        price,
        category,
        images,
        isActive,
        hasVariants,
        variants: hasVariants && variants.length > 0 ? variants.map(v => ({
          name: v.name,
          price_modifier: v.price_modifier,
          sku: v.sku,
          stock_quantity: v.stock_quantity
        })) : [],
        stock_quantity: Number(stockQuantity) || 0, // Convert string to number
        sku: hasVariants ? (name.replace(/\s+/g, '-').toUpperCase() + '-BASE').substring(0, 50) : sku,
        bundleDiscount: hasBundleDiscount ? {
          minQuantity,
          discountPercentage
        } : {
          minQuantity: 0,
          discountPercentage: 0
        }
      }

      await createAddOn(requestData)

      toast({
        title: "Success",
        description: "Add-on created successfully",
      })

      // Redirect to the add-ons list
      router.push("/admin/add-ons")
    } catch (error: any) {

      let errorMessage = "Failed to create add-on. Please try again.";

      if (error.message.includes('400')) {
        errorMessage = "Invalid data provided. Please check all required fields.";
      } else if (error.message.includes('timeout')) {
        errorMessage = "Request timed out. Please try again.";
      } else if (error.message.includes('503') || error.message.includes('504')) {
        errorMessage = "Service temporarily unavailable. Please try again later.";
      } else if (error.message) {
        errorMessage = error.message;
      }

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-4 sm:space-y-6 px-3 sm:px-0">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-2">
        <Button variant="outline" size="icon" asChild className="touch-manipulation h-10 w-10 sm:h-9 sm:w-9">
          <Link href="/admin/add-ons">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back</span>
          </Link>
        </Button>
        <div className="min-w-0">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Add New Add-on</h1>
          <p className="text-sm sm:text-base text-muted-foreground">Create a new add-on for NIBOG events</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4 sm:space-y-6">
          <TabsList className="grid w-full mobile-tabs grid-cols-2 sm:grid-cols-4">
            <TabsTrigger value="details" className="mobile-tab-trigger">Basic Details</TabsTrigger>
            <TabsTrigger value="images" className="mobile-tab-trigger">Images</TabsTrigger>
            <TabsTrigger value="variants" className="mobile-tab-trigger">Variants</TabsTrigger>
            <TabsTrigger value="pricing" className="mobile-tab-trigger">Pricing & Discounts</TabsTrigger>
          </TabsList>
          
          {/* Basic Details Tab */}
          <TabsContent value="details">
            <Card>
              <CardHeader className="mobile-card-header">
                <CardTitle className="mobile-text-lg">Add-on Details</CardTitle>
                <CardDescription className="mobile-text-sm">Enter the basic information for the new add-on</CardDescription>
              </CardHeader>
              <CardContent className="mobile-card-content">
                <div className="space-y-2">
                  <Label htmlFor="name" className="mobile-text-sm font-medium">Name</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter add-on name"
                    className="mobile-input"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description" className="mobile-text-sm font-medium">Description</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Enter add-on description"
                    rows={3}
                    className="mobile-input min-h-[80px] sm:min-h-[100px]"
                    required
                  />
                </div>

                <div className="mobile-form-grid">
                  <div className="space-y-2">
                    <Label htmlFor="category" className="mobile-text-sm font-medium">Category</Label>
                    <Select value={category} onValueChange={(value) => setCategory(value as any)}>
                      <SelectTrigger id="category" className="h-10">
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
                    <Label htmlFor="price" className="mobile-text-sm font-medium">Base Price (₹)</Label>
                    <Input
                      id="price"
                      type="number"
                      min="0"
                      step="0.01"
                      value={price || ""}
                      onChange={(e) => setPrice(parseFloat(e.target.value) || 0)}
                      className="mobile-input"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  {/* Product Type Selection */}
                  <div className="rounded-lg border-2 border-dashed border-muted-foreground/25 p-4 space-y-4">
                    <div className="text-center space-y-2">
                      <h3 className="font-semibold text-base sm:text-lg">Product Type</h3>
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        Choose how you want to set up this add-on
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Single Product Option */}
                      <div
                        className={cn(
                          "cursor-pointer rounded-lg border-2 p-4 transition-all",
                          !hasVariants
                            ? "border-primary bg-primary/5 shadow-sm"
                            : "border-muted hover:border-muted-foreground/50"
                        )}
                        onClick={() => handleHasVariantsChange(false)}
                      >
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <div className={cn(
                              "w-4 h-4 rounded-full border-2",
                              !hasVariants ? "border-primary bg-primary" : "border-muted-foreground"
                            )}>
                              {!hasVariants && <div className="w-2 h-2 bg-white rounded-full m-0.5"></div>}
                            </div>
                            <h4 className="font-medium text-sm sm:text-base">Single Product</h4>
                          </div>
                          <p className="text-xs sm:text-sm text-muted-foreground">
                            One product with fixed price, SKU, and stock quantity
                          </p>
                          <div className="text-xs text-muted-foreground">
                            Example: "Event T-Shirt" - ₹299
                          </div>
                        </div>
                      </div>

                      {/* Multiple Variants Option */}
                      <div
                        className={cn(
                          "cursor-pointer rounded-lg border-2 p-4 transition-all",
                          hasVariants
                            ? "border-primary bg-primary/5 shadow-sm"
                            : "border-muted hover:border-muted-foreground/50"
                        )}
                        onClick={() => handleHasVariantsChange(true)}
                      >
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <div className={cn(
                              "w-4 h-4 rounded-full border-2",
                              hasVariants ? "border-primary bg-primary" : "border-muted-foreground"
                            )}>
                              {hasVariants && <div className="w-2 h-2 bg-white rounded-full m-0.5"></div>}
                            </div>
                            <h4 className="font-medium text-sm sm:text-base">Multiple Variants</h4>
                          </div>
                          <p className="text-xs sm:text-sm text-muted-foreground">
                            Multiple options with different prices, sizes, colors, etc.
                          </p>
                          <div className="text-xs text-muted-foreground">
                            Example: "T-Shirt" - Small (₹299), Medium (₹349), Large (₹399)
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {!hasVariants && (
                    <div className="mobile-form-grid">
                      <div className="space-y-2">
                        <Label htmlFor="sku" className="mobile-text-sm font-medium">SKU</Label>
                        <Input
                          id="sku"
                          value={sku}
                          onChange={(e) => setSku(e.target.value)}
                          placeholder="Enter SKU"
                          className="mobile-input"
                          required={!hasVariants}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="stock" className="mobile-text-sm font-medium">Stock Quantity</Label>
                        <Input
                          id="stock"
                          type="number"
                          min="0"
                          value={stockQuantity}
                          onChange={(e) => setStockQuantity(e.target.value)}
                          className="mobile-input"
                          required={!hasVariants}
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between py-2">
                  <Label htmlFor="active" className="mobile-text-sm font-medium">Active</Label>
                  <Switch id="active" checked={isActive} onCheckedChange={setIsActive} />
                </div>
              </CardContent>
              <CardFooter className="mobile-card-footer justify-between">
                <div></div>
                <Button
                  type="button"
                  onClick={() => setActiveTab("images")}
                  variant="outline"
                  className="mobile-button w-full sm:w-auto"
                >
                  Next: Images →
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          {/* Images Tab */}
          <TabsContent value="images">
            <Card>
              <CardHeader className="mobile-card-header">
                <CardTitle className="mobile-text-lg">Add-on Images</CardTitle>
                <CardDescription className="mobile-text-sm">Add images for the new add-on</CardDescription>
              </CardHeader>
              <CardContent className="mobile-card-content">
                <div className="grid grid-cols-2 mobile-gap sm:grid-cols-3 lg:grid-cols-4">
                  {images.map((image, index) => (
                    <div key={index} className="relative aspect-square overflow-hidden rounded-md border">
                      <Image
                        src={image}
                        alt={`${name || "Add-on"} - Image ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                      <Button
                        variant="destructive"
                        size="icon"
                        className="absolute right-1 top-1 sm:right-2 sm:top-2 h-6 w-6 sm:h-7 sm:w-7 rounded-full"
                        onClick={() => handleRemoveImage(index)}
                        type="button"
                      >
                        <X className="h-3 w-3 sm:h-4 sm:w-4" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    className="flex aspect-square h-full w-full flex-col items-center justify-center rounded-md border border-dashed"
                    onClick={handleAddImage}
                    type="button"
                  >
                    <UploadIcon className="mb-1 sm:mb-2 h-4 w-4 sm:h-6 sm:w-6" />
                    <span className="text-xs sm:text-sm">Add Image</span>
                  </Button>
                </div>
              </CardContent>
              <CardFooter className="mobile-card-footer justify-between">
                <Button
                  type="button"
                  onClick={() => setActiveTab("details")}
                  variant="outline"
                  className="mobile-button w-full sm:w-auto"
                >
                  ← Back: Details
                </Button>
                <Button
                  type="button"
                  onClick={() => setActiveTab(hasVariants ? "variants" : "pricing")}
                  variant="outline"
                  className="mobile-button w-full sm:w-auto"
                >
                  {hasVariants ? "Next: Variants →" : "Next: Pricing →"}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          {/* Variants Tab */}
          <TabsContent value="variants">
            <Card>
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="text-lg sm:text-xl">Product Variants</CardTitle>
                <CardDescription className="text-sm sm:text-base">Add variants for this add-on</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 sm:space-y-6 p-4 sm:p-6">
                {!hasVariants ? (
                  <div className="text-center py-8 space-y-4">
                    <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center">
                      <svg className="w-8 h-8 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                      </svg>
                    </div>
                    <div className="space-y-2">
                      <h3 className="font-semibold text-lg">Variants Not Enabled</h3>
                      <p className="text-sm text-muted-foreground max-w-md mx-auto">
                        This add-on is set up as a single product. To create multiple variants (different sizes, colors, etc.),
                        go back to the <strong>Basic Details</strong> tab and select <strong>"Multiple Variants"</strong>.
                      </p>
                    </div>
                    <Button
                      type="button"
                      onClick={() => {
                        handleHasVariantsChange(true)
                        setActiveTab("details")
                      }}
                      className="touch-manipulation"
                    >
                      Enable Variants Now
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="rounded-md border overflow-x-auto mobile-scroll">
                      <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="min-w-[100px]">Name</TableHead>
                        <TableHead className="min-w-[80px]">SKU</TableHead>
                        <TableHead className="min-w-[120px] hidden sm:table-cell">Price Modifier</TableHead>
                        <TableHead className="min-w-[80px]">Stock</TableHead>
                        <TableHead className="min-w-[100px] hidden sm:table-cell">Final Price</TableHead>
                        <TableHead className="w-[60px] sm:w-[80px]"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {variants.map((variant) => (
                        <TableRow key={variant.id}>
                          <TableCell className="font-medium text-xs sm:text-sm">{variant.name}</TableCell>
                          <TableCell className="text-xs sm:text-sm">{variant.sku}</TableCell>
                          <TableCell className="hidden sm:table-cell text-xs sm:text-sm">
                            {variant.price_modifier === 0 ? (
                              <span className="text-muted-foreground">Base price</span>
                            ) : (
                              <span className={variant.price_modifier > 0 ? "text-green-600" : "text-red-600"}>
                                {variant.price_modifier > 0 ? "+" : ""}₹{variant.price_modifier}
                              </span>
                            )}
                          </TableCell>
                          <TableCell className="text-xs sm:text-sm">{variant.stock_quantity}</TableCell>
                          <TableCell className="hidden sm:table-cell text-xs sm:text-sm">
                            ₹{(price + variant.price_modifier).toFixed(2)}
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleRemoveVariant(variant.id)}
                              type="button"
                              className="touch-manipulation h-8 w-8 sm:h-9 sm:w-9"
                            >
                              <Trash className="h-3 w-3 sm:h-4 sm:w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                      {variants.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={6} className="h-16 sm:h-24 text-center">
                            <p className="text-muted-foreground text-xs sm:text-sm">No variants added yet</p>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                      </Table>
                    </div>

                    <Card>
                  <CardHeader className="p-4 sm:p-6">
                    <CardTitle className="text-lg sm:text-xl">Add New Variant</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 p-4 sm:p-6">
                    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="variant-name" className="text-sm sm:text-base font-medium">Variant Name</Label>
                        <Input
                          id="variant-name"
                          value={newVariantName}
                          onChange={(e) => setNewVariantName(e.target.value)}
                          placeholder="e.g., Small - Red"
                          className="mobile-input touch-manipulation"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="variant-sku" className="text-sm sm:text-base font-medium">SKU</Label>
                        <Input
                          id="variant-sku"
                          value={newVariantSku}
                          onChange={(e) => setNewVariantSku(e.target.value)}
                          placeholder="e.g., TS-S-RED"
                          className="mobile-input touch-manipulation"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="variant-price-modifier" className="text-sm sm:text-base font-medium">Price Modifier (₹)</Label>
                        <Input
                          id="variant-price-modifier"
                          type="number"
                          step="0.01"
                          value={newVariantPriceModifier || ""}
                          onChange={(e) => setNewVariantPriceModifier(parseFloat(e.target.value) || 0)}
                          placeholder="0 for base price"
                          className="mobile-input touch-manipulation"
                        />
                        <p className="text-xs text-muted-foreground">
                          Amount to add/subtract from base price (use negative for discount)
                        </p>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="variant-stock" className="text-sm sm:text-base font-medium">Stock Quantity</Label>
                        <Input
                          id="variant-stock"
                          type="number"
                          min="0"
                          value={newVariantStock || ""}
                          onChange={(e) => setNewVariantStock(parseInt(e.target.value) || 0)}
                          className="mobile-input touch-manipulation"
                        />
                      </div>
                    </div>


                  </CardContent>
                  <CardFooter className="p-4 sm:p-6">
                    <Button
                      type="button"
                      onClick={handleAddVariant}
                      disabled={!newVariantName.trim() || !newVariantSku.trim()}
                      className="w-full sm:w-auto touch-manipulation h-10"
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Add Variant
                    </Button>
                  </CardFooter>
                   </Card>
                  </div>
               )}
              </CardContent>
              <CardFooter className="flex flex-col sm:flex-row justify-between gap-3 sm:gap-0 p-4 sm:p-6">
                <Button
                  type="button"
                  onClick={() => setActiveTab("images")}
                  variant="outline"
                  className="w-full sm:w-auto touch-manipulation h-10"
                >
                  ← Back: Images
                </Button>
                <Button
                  type="button"
                  onClick={() => setActiveTab("pricing")}
                  variant="outline"
                  className="w-full sm:w-auto touch-manipulation h-10"
                >
                  Next: Pricing →
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          {/* Pricing & Discounts Tab */}
          <TabsContent value="pricing">
            <Card>
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="text-lg sm:text-xl">Pricing & Discounts</CardTitle>
                <CardDescription className="text-sm sm:text-base">Set up pricing and discount options</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 sm:space-y-6 p-4 sm:p-6">
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
              <CardFooter className="flex flex-col sm:flex-row justify-between gap-3 sm:gap-0 p-4 sm:p-6">
                <Button
                  type="button"
                  onClick={() => setActiveTab(hasVariants ? "variants" : "images")}
                  variant="outline"
                  className="w-full sm:w-auto touch-manipulation h-10"
                >
                  {hasVariants ? "← Back: Variants" : "← Back: Images"}
                </Button>
                <div className="text-xs sm:text-sm text-muted-foreground text-center sm:text-left">
                  Ready to create add-on
                </div>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="mt-4 sm:mt-6 flex flex-col sm:flex-row justify-between mobile-gap">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/admin/add-ons")}
            className="mobile-button w-full sm:w-auto"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="mobile-button w-full sm:w-auto"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              "Create Add-on"
            )}
          </Button>
        </div>
      </form>
      <MobileTestHelper />
    </div>
  )
}

export default NewAddOnPage;
