"use client"

import { useState } from "react"
import Image from "next/image"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Minus, Plus, ShoppingCart, AlertCircle, Package, Tag, ChevronDown } from "lucide-react"
import { AddOn, AddOnVariant } from "@/types"
import { formatPrice } from "@/lib/utils"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface AddOnSelectorProps {
  addOns: AddOn[]
  onAddOnsChange: (selectedAddOns: { addOn: AddOn; quantity: number; variantId?: string }[]) => void
  initialSelectedAddOns?: { addOn: AddOn; quantity: number; variantId?: string }[]
}

export default function AddOnSelector({
  addOns,
  onAddOnsChange,
  initialSelectedAddOns = [],
}: AddOnSelectorProps) {
  const [selectedAddOns, setSelectedAddOns] = useState<{ addOn: AddOn; quantity: number; variantId?: string }[]>(
    initialSelectedAddOns
  )
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({})
  const [expandedDescriptions, setExpandedDescriptions] = useState<{ [key: string]: boolean }>({})

  const handleAddOnToggle = (addOn: AddOn, isChecked: boolean) => {
    let updatedAddOns = [...selectedAddOns]

    if (isChecked) {
      // Add the add-on if it doesn't exist
      if (!updatedAddOns.some((item) => item.addOn.id === addOn.id)) {
        if (addOn.hasVariants && addOn.variants && addOn.variants.length > 0) {
          // For variants, select the first variant by default
          const defaultVariant = addOn.variants[0]
          updatedAddOns.push({ addOn, quantity: 1, variantId: defaultVariant.id })
          setSelectedVariants(prev => ({ ...prev, [addOn.id]: defaultVariant.id }))
        } else {
          updatedAddOns.push({ addOn, quantity: 1 })
        }
      }
    } else {
      // Remove the add-on
      updatedAddOns = updatedAddOns.filter((item) => item.addOn.id !== addOn.id)

      // Clean up selected variant
      if (addOn.id in selectedVariants) {
        const updatedVariants = { ...selectedVariants }
        delete updatedVariants[addOn.id]
        setSelectedVariants(updatedVariants)
      }
    }

    setSelectedAddOns(updatedAddOns)
    onAddOnsChange(updatedAddOns)
  }

  const handleVariantChange = (addOnId: string, variantId: string) => {
    setSelectedVariants(prev => ({ ...prev, [addOnId]: variantId }))

    // Update selected addons array with the new variant
    const updatedAddOns = selectedAddOns.map(item => {
      if (item.addOn.id === addOnId) {
        // Log the variant selection for debugging
        const addon = item.addOn;
        if (addon.hasVariants && addon.variants) {
          const variant = addon.variants.find(v => v.id === variantId);
          if (variant) {

          }
        }
        return { ...item, variantId }
      }
      return item
    })

    setSelectedAddOns(updatedAddOns)
    onAddOnsChange(updatedAddOns)
  }

  const handleQuantityChange = (addOnId: string, newQuantity: number) => {
    if (newQuantity < 1) return

    // Check if we're exceeding available stock
    const addOn = addOns.find(a => a.id === addOnId)
    if (!addOn) return

    let maxAvailable = 999 // Default high value

    if (addOn.hasVariants && addOn.variants) {
      const variantId = selectedVariants[addOnId]
      const variant = addOn.variants.find(v => v.id === variantId)
      if (variant) {
        maxAvailable = variant.stockQuantity
      }
    } else if (addOn.stockQuantity !== undefined) {
      maxAvailable = addOn.stockQuantity
    }

    // Limit quantity to available stock
    const limitedQuantity = Math.min(newQuantity, maxAvailable)

    const updatedAddOns = selectedAddOns.map((item) => {
      if (item.addOn.id === addOnId) {
        return { ...item, quantity: limitedQuantity }
      }
      return item
    })

    setSelectedAddOns(updatedAddOns)
    onAddOnsChange(updatedAddOns)
  }

  const isSelected = (addOnId: string) => {
    return selectedAddOns.some((item) => item.addOn.id === addOnId)
  }

  const getQuantity = (addOnId: string) => {
    const item = selectedAddOns.find((item) => item.addOn.id === addOnId)
    return item ? item.quantity : 0
  }

  const getSelectedVariant = (addOnId: string) => {
    return selectedVariants[addOnId] || ""
  }

  const getVariantById = (addOn: AddOn, variantId: string) => {
    if (!addOn.hasVariants || !addOn.variants) return null
    return addOn.variants.find(v => v.id === variantId) || null
  }

  // Helper function to safely get price modifier from variant
  // This handles both API response format (price_modifier) and type definition format (price)
  const getVariantPriceModifier = (variant: any): number => {
    // First try the API response format
    if (typeof variant.price_modifier === 'number') {
      return variant.price_modifier
    }
    // Then try the type definition format (using price - base price)
    else if (typeof variant.price === 'number' && typeof variant.addOn?.price === 'number') {
      return variant.price - variant.addOn.price
    }
    // Default to 0 if neither is available
    return 0
  }

  // Get the final price for an addon with variant consideration
  const getAddonFinalPrice = (addOn: any, variantId?: string): number => {
    // Ensure price is a number
    let price = parseFloat(addOn.price) || 0;

    // If there's a selected variant, add its price modifier
    if (variantId && addOn.hasVariants && addOn.variants) {
      const variant = addOn.variants.find((v: any) => v.id === variantId);
      if (variant) {
        if (typeof variant.price === 'number') {
          price = parseFloat(variant.price);
        } else if (typeof variant.price_modifier === 'number') {
          price = parseFloat(addOn.price) + parseFloat(variant.price_modifier);
        }
      }
    }

    return price;
  }

  // Debug function to log price calculations
  const logPriceCalculation = (addOn: any, variantId?: string) => {
    const basePrice = parseFloat(addOn.price) || 0;
    let finalPrice = basePrice;
    let modifier = 0;

    if (variantId && addOn.hasVariants && addOn.variants) {
      const variant = addOn.variants.find((v: any) => v.id === variantId);
      if (variant) {
        if (typeof variant.price === 'number') {
          finalPrice = parseFloat(variant.price);
          modifier = finalPrice - basePrice;
        } else if (typeof variant.price_modifier === 'number') {
          modifier = parseFloat(variant.price_modifier);
          finalPrice = basePrice + modifier;
        }
      }
    }



    return finalPrice;
  }

  const getStockStatus = (addOn: AddOn) => {
    if (addOn.hasVariants && addOn.variants) {
      const variantId = selectedVariants[addOn.id]
      const variant = addOn.variants.find(v => v.id === variantId)

      if (!variant) return { status: "unknown", quantity: 0 }

      if (variant.stockQuantity <= 0) {
        return { status: "out-of-stock", quantity: 0 }
      } else if (variant.stockQuantity <= 5) {
        return { status: "low-stock", quantity: variant.stockQuantity }
      } else {
        return { status: "in-stock", quantity: variant.stockQuantity }
      }
    } else {
      if (!addOn.stockQuantity || addOn.stockQuantity <= 0) {
        return { status: "out-of-stock", quantity: 0 }
      } else if (addOn.stockQuantity <= 10) {
        return { status: "low-stock", quantity: addOn.stockQuantity }
      } else {
        return { status: "in-stock", quantity: addOn.stockQuantity }
      }
    }
  }

  const getDiscountedPrice = (addOn: AddOn, quantity: number) => {
    if (!addOn.bundleDiscount || quantity < addOn.bundleDiscount.minQuantity) {
      return addOn.price
    }

    const discountMultiplier = 1 - (addOn.bundleDiscount.discountPercentage / 100)
    return addOn.price * discountMultiplier
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Enhance Your Experience</h3>
        {selectedAddOns.length > 0 && (
          <Badge variant="outline" className="flex items-center gap-1">
            <ShoppingCart className="h-3 w-3" />
            {selectedAddOns.reduce((total, item) => total + item.quantity, 0)} items
          </Badge>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {addOns.map((addOn) => {
          const stockStatus = getStockStatus(addOn)
          const isOutOfStock = stockStatus.status === "out-of-stock"
          const isLowStock = stockStatus.status === "low-stock"
          const quantity = getQuantity(addOn.id)
          const hasDiscount = addOn.bundleDiscount &&
            addOn.bundleDiscount.discountPercentage > 0 &&
            quantity >= addOn.bundleDiscount.minQuantity
          const discountedPrice = hasDiscount ? getDiscountedPrice(addOn, quantity) : addOn.price

          return (
            <Card
              key={addOn.id}
              className={`${isSelected(addOn.id) ? "border-primary" : ""} ${isOutOfStock ? "opacity-60" : ""}`}
            >
              <CardHeader className="p-4 pb-2">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-base">{addOn.name}</CardTitle>
                    </div>
                    <CardDescription
                      className={`text-xs text-left cursor-pointer transition-all duration-200 ${expandedDescriptions[addOn.id]
                        ? 'line-clamp-none'
                        : 'line-clamp-2 text-ellipsis overflow-hidden'
                        }`}
                      onClick={() => setExpandedDescriptions(prev => ({
                        ...prev,
                        [addOn.id]: !prev[addOn.id]
                      }))}
                    >
                      {addOn.description}
                    </CardDescription>
                  </div>
                  <div className="flex flex-col items-end">
                    {(() => {
                      // Get the selected variant if any
                      const selectedVariant = addOn.hasVariants && addOn.variants && selectedVariants[addOn.id]
                        ? addOn.variants.find(v => v.id === selectedVariants[addOn.id])
                        : null;

                      // Calculate the final price using our helper function
                      const variantPrice = getAddonFinalPrice(addOn, selectedVariants[addOn.id]);

                      // Apply discount if applicable
                      const finalPrice = hasDiscount
                        ? getDiscountedPrice({ ...addOn, price: variantPrice }, quantity)
                        : variantPrice;

                      if (hasDiscount && (addOn.bundleDiscount?.discountPercentage ?? 0) > 0) {
                        return (
                          <>
                            <Badge className="bg-green-500 hover:bg-green-600 mb-1">
                              {addOn.bundleDiscount?.discountPercentage}% OFF
                            </Badge>
                            <div className="flex flex-col items-end">
                              <span className="text-xs line-through text-muted-foreground">
                                {formatPrice(variantPrice)}
                              </span>
                              <Badge>{formatPrice(finalPrice)}</Badge>
                            </div>
                          </>
                        );
                      }

                      return (
                        <Badge>{formatPrice(finalPrice)}</Badge>
                      );
                    })()}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="relative mb-3 h-32 w-full overflow-hidden rounded-md bg-gray-100 flex items-center justify-center">
                  {addOn.images && addOn.images.length > 0 ? (
                    <Image
                      src={addOn.images[0]}
                      alt={addOn.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex flex-col items-center text-gray-400">
                      <svg
                        className="w-12 h-12 mb-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="1.5"
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                      <span className="text-xs">No image available</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id={`addon-${addOn.id}`}
                      checked={isSelected(addOn.id)}
                      onCheckedChange={(checked) => handleAddOnToggle(addOn, checked as boolean)}
                      disabled={isOutOfStock}
                    />
                    <Label htmlFor={`addon-${addOn.id}`} className="text-sm font-medium">
                      Add to booking
                    </Label>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div>
                            {isOutOfStock ? (
                              <Badge variant="outline" className="bg-red-50 text-red-500">
                                <AlertCircle className="mr-1 h-3 w-3" />
                                Out of Stock
                              </Badge>
                            ) : isLowStock ? (
                              <Badge variant="outline" className="bg-amber-50 text-amber-500">
                                <Package className="mr-1 h-3 w-3" />
                                Low Stock: {stockStatus.quantity}
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="bg-green-50 text-green-500">
                                <Package className="mr-1 h-3 w-3" />
                                In Stock
                              </Badge>
                            )}
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          {isOutOfStock
                            ? "This item is currently out of stock"
                            : isLowStock
                              ? `Only ${stockStatus.quantity} units left in stock`
                              : `${stockStatus.quantity} units available`}
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>

                </div>

                {addOn.bundleDiscount && addOn.bundleDiscount.discountPercentage > 0 && (
                  <div className="text-xs text-muted-foreground mb-2">
                    Buy {addOn.bundleDiscount.minQuantity}+ for {addOn.bundleDiscount.discountPercentage}% off
                  </div>
                )}

                {/* Dropdown variant selector when not selected */}
                {!isSelected(addOn.id) && addOn.hasVariants && addOn.variants && addOn.variants.length > 0 && (
                  <div className="mt-2">
                    <Collapsible className="w-full">
                      <CollapsibleTrigger className="flex w-full items-center justify-between rounded-md border p-2 text-sm font-medium bg-primary/5 border-primary/20 hover:bg-primary/10 transition-colors">
                        <div className="flex items-center">
                          <Tag className="mr-2 h-4 w-4 text-primary" />
                          <span>View All Variants ({addOn.variants.length})</span>
                        </div>
                        <ChevronDown className="h-4 w-4 text-primary transition-transform duration-200 ui-open:rotate-180" />
                      </CollapsibleTrigger>
                      <CollapsibleContent className="mt-2 space-y-2">
                        {addOn.variants.map((variant) => {
                          const variantStockStatus = variant.stockQuantity <= 0 ? "out-of-stock" :
                            variant.stockQuantity <= 5 ? "low-stock" : "in-stock";
                          return (
                            <div
                              key={variant.id}
                              className="flex justify-between items-center bg-white border rounded p-2 text-sm"
                            >
                              <div className="font-medium">{variant.name}</div>
                              <div className="flex gap-1 items-center">
                                <Badge
                                  variant="outline"
                                  className={`text-xs ${variantStockStatus === "out-of-stock" ? "bg-red-50 text-red-500" :
                                    variantStockStatus === "low-stock" ? "bg-amber-50 text-amber-500" :
                                      "bg-green-50 text-green-500"}`}
                                >
                                  {variantStockStatus === "out-of-stock" ? "Out of stock" :
                                    variantStockStatus === "low-stock" ? `${variant.stockQuantity} left` :
                                      "In stock"}
                                </Badge>
                                {getVariantPriceModifier(variant) !== 0 && (
                                  <Badge className="ml-1">
                                    {getVariantPriceModifier(variant) > 0 ? '+' : ''}{formatPrice(getVariantPriceModifier(variant))}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </CollapsibleContent>
                    </Collapsible>
                  </div>
                )}

                {/* Enhanced variant selector when add-on is selected */}
                {isSelected(addOn.id) && addOn.hasVariants && addOn.variants && (
                  <div className="mt-2">
                    <Label htmlFor={`variant-${addOn.id}`} className="text-xs font-medium mb-1 block">
                      Select {addOn.name} Option
                    </Label>
                    <Select
                      value={getSelectedVariant(addOn.id)}
                      onValueChange={(value) => handleVariantChange(addOn.id, value)}
                    >
                      <SelectTrigger id={`variant-${addOn.id}`} className="h-8 text-xs">
                        <SelectValue placeholder="Select variant" />
                      </SelectTrigger>
                      <SelectContent>
                        {addOn.variants.map((variant) => {
                          const variantStockStatus = variant.stockQuantity <= 0 ? "out-of-stock" :
                            variant.stockQuantity <= 5 ? "low-stock" : "in-stock";
                          const stockLabel = variantStockStatus === "out-of-stock" ? "Out of Stock" :
                            variantStockStatus === "low-stock" ? `${variant.stockQuantity} left` :
                              "In Stock";
                          return (
                            <SelectItem
                              key={variant.id}
                              value={variant.id}
                              disabled={variant.stockQuantity <= 0}
                            >
                              <div className="flex items-center justify-between w-full">
                                <span className="font-medium">{variant.name}</span>
                                <div className="flex items-center gap-1">
                                  <span className={`text-xs ${variantStockStatus === "out-of-stock" ? "text-red-500" :
                                    variantStockStatus === "low-stock" ? "text-amber-500" :
                                      "text-green-500"}`}>
                                    {stockLabel}
                                  </span>
                                  {getVariantPriceModifier(variant) !== 0 && (
                                    <Badge className="ml-1">
                                      {getVariantPriceModifier(variant) > 0 ? '+' : ''}{formatPrice(getVariantPriceModifier(variant))}
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>

                    {/* Variant details section - enhanced */}
                    {addOn.variants.map(variant => {
                      if (variant.id === getSelectedVariant(addOn.id)) {
                        // Calculate the correct variant price using our helper function
                        // Log the calculation for debugging
                        logPriceCalculation(addOn, variant.id);
                        const variantPrice = getAddonFinalPrice(addOn, variant.id);
                        return (
                          <div key={`detail-${variant.id}`} className="mt-2 text-xs border rounded-md p-2 bg-gray-50">
                            <div className="flex justify-between">
                              <div>
                                <span className="font-medium">{variant.name}</span>
                                <div className="mt-1 text-muted-foreground">
                                  SKU: {variant.sku || 'N/A'}
                                </div>
                              </div>
                              <div className="flex flex-col items-end">

                                {getVariantPriceModifier(variant) !== 0 && (
                                  <span className="text-xs text-muted-foreground mt-1">
                                    Base {formatPrice(addOn.price)} {getVariantPriceModifier(variant) > 0 ? '+' : ''}{formatPrice(getVariantPriceModifier(variant))}
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="mt-2 flex justify-between items-center border-t pt-2">
                              <span className="font-medium">Availability:</span>
                              <span className={`text-xs ${variant.stockQuantity <= 0 ? "text-red-500" :
                                variant.stockQuantity <= 5 ? "text-amber-500" :
                                  "text-green-500"}`}>
                                {variant.stockQuantity <= 0 ? "Out of Stock" :
                                  variant.stockQuantity <= 5 ? `Only ${variant.stockQuantity} left in stock!` :
                                    `${variant.stockQuantity} in stock`}
                              </span>
                            </div>
                          </div>
                        )
                      }
                      return null;
                    })}
                  </div>
                )}
              </CardContent>
              {isSelected(addOn.id) && (
                <CardFooter className="flex items-center justify-between p-4 pt-0">
                  <div className="flex items-center">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8 rounded-r-none"
                      onClick={() => handleQuantityChange(addOn.id, getQuantity(addOn.id) - 1)}
                      disabled={getQuantity(addOn.id) <= 1}
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    <Input
                      type="number"
                      min={1}
                      value={getQuantity(addOn.id)}
                      onChange={(e) => handleQuantityChange(addOn.id, parseInt(e.target.value) || 1)}
                      className="h-8 w-12 rounded-none border-x-0 text-center"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8 rounded-l-none"
                      onClick={() => handleQuantityChange(addOn.id, getQuantity(addOn.id) + 1)}
                      disabled={isOutOfStock || (addOn.hasVariants && addOn.variants
                        ? getQuantity(addOn.id) >= (addOn.variants.find(v => v.id === getSelectedVariant(addOn.id))?.stockQuantity || 0)
                        : addOn.stockQuantity ? getQuantity(addOn.id) >= addOn.stockQuantity : false)}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                  <div className="text-sm font-medium">
                    {(() => {
                      // Calculate base price with variant modifier if applicable
                      const variantId = getSelectedVariant(addOn.id);

                      // Get the selected variant if any
                      const selectedVariant = addOn.hasVariants && addOn.variants && variantId
                        ? addOn.variants.find(v => v.id === variantId)
                        : null;

                      // Calculate the base price (including variant modifier if any)
                      let basePrice = Number(addOn.price) || 0;
                      let variantPriceModifier = 0;

                      if (selectedVariant) {
                        if (typeof selectedVariant.price === 'number') {
                          basePrice = Number(selectedVariant.price);
                          variantPriceModifier = basePrice - Number(addOn.price);
                        } else if (typeof selectedVariant.price_modifier === 'number') {
                          variantPriceModifier = Number(selectedVariant.price_modifier);
                          basePrice = Number(addOn.price) + variantPriceModifier;
                        }
                      }
                      // Apply discount if applicable
                      const finalUnitPrice = hasDiscount ? basePrice * (1 - (addOn.bundleDiscount?.discountPercentage || 0) / 100) : basePrice;
                      const totalPrice = finalUnitPrice * getQuantity(addOn.id);
                      const originalTotalPrice = basePrice * getQuantity(addOn.id);

                      return hasDiscount ? (
                        <>
                          <span className="text-muted-foreground line-through mr-2">
                            {formatPrice(originalTotalPrice)}
                          </span>
                          <span>{formatPrice(totalPrice)}</span>
                        </>
                      ) : (
                        <span>{formatPrice(totalPrice)}</span>
                      );
                    })()}
                  </div>
                </CardFooter>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
