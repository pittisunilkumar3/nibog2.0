import { AddOn } from "@/types"

// Mock data for add-ons
export const addOns: AddOn[] = [
  {
    id: "addon-1",
    name: "Meal Pack",
    description: "Nutritious meal pack for your child including snacks and drinks",
    price: 299,
    images: ["/images/meal-pack.jpg"],
    category: "meal",
    isActive: true,
    hasVariants: false,
    stockQuantity: 100,
    sku: "MEAL-001",
    bundleDiscount: {
      minQuantity: 2,
      discountPercentage: 10
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "addon-2",
    name: "NIBOG T-Shirt",
    description: "Official NIBOG event t-shirt for your child (available in various sizes)",
    price: 499,
    images: ["/images/tshirt.jpg", "/images/tshirt-back.jpg"],
    category: "merchandise",
    isActive: true,
    hasVariants: true,
    variants: [
      {
        id: "variant-1",
        name: "Small - Red",
        price: 499,
        attributes: { size: "S", color: "Red" },
        stockQuantity: 25,
        sku: "TS-S-RED"
      },
      {
        id: "variant-2",
        name: "Medium - Red",
        price: 499,
        attributes: { size: "M", color: "Red" },
        stockQuantity: 30,
        sku: "TS-M-RED"
      },
      {
        id: "variant-3",
        name: "Large - Red",
        price: 499,
        attributes: { size: "L", color: "Red" },
        stockQuantity: 20,
        sku: "TS-L-RED"
      },
      {
        id: "variant-4",
        name: "Small - Blue",
        price: 499,
        attributes: { size: "S", color: "Blue" },
        stockQuantity: 25,
        sku: "TS-S-BLUE"
      },
      {
        id: "variant-5",
        name: "Medium - Blue",
        price: 499,
        attributes: { size: "M", color: "Blue" },
        stockQuantity: 30,
        sku: "TS-M-BLUE"
      },
      {
        id: "variant-6",
        name: "Large - Blue",
        price: 499,
        attributes: { size: "L", color: "Blue" },
        stockQuantity: 20,
        sku: "TS-L-BLUE"
      }
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "addon-3",
    name: "Sports Shoes",
    description: "Comfortable sports shoes for your child (available in various sizes)",
    price: 799,
    images: ["/images/shoes.jpg", "/images/shoes-side.jpg", "/images/shoes-back.jpg"],
    category: "merchandise",
    isActive: true,
    hasVariants: true,
    variants: [
      {
        id: "variant-7",
        name: "Size 5",
        price: 799,
        attributes: { size: "5" },
        stockQuantity: 15,
        sku: "SHOE-5"
      },
      {
        id: "variant-8",
        name: "Size 6",
        price: 799,
        attributes: { size: "6" },
        stockQuantity: 20,
        sku: "SHOE-6"
      },
      {
        id: "variant-9",
        name: "Size 7",
        price: 799,
        attributes: { size: "7" },
        stockQuantity: 25,
        sku: "SHOE-7"
      },
      {
        id: "variant-10",
        name: "Size 8",
        price: 799,
        attributes: { size: "8" },
        stockQuantity: 20,
        sku: "SHOE-8"
      },
      {
        id: "variant-11",
        name: "Size 9",
        price: 799,
        attributes: { size: "9" },
        stockQuantity: 15,
        sku: "SHOE-9"
      }
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "addon-4",
    name: "Professional Photography",
    description: "Professional photography service to capture your child's special moments",
    price: 999,
    images: ["/images/photography.jpg"],
    category: "service",
    isActive: true,
    hasVariants: false,
    stockQuantity: 50,
    sku: "PHOTO-001",
    bundleDiscount: {
      minQuantity: 1,
      discountPercentage: 0
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "addon-5",
    name: "Participation Medal",
    description: "Commemorative medal for your child's participation",
    price: 199,
    images: ["/images/medal.jpg"],
    category: "merchandise",
    isActive: true,
    hasVariants: false,
    stockQuantity: 200,
    sku: "MEDAL-001",
    bundleDiscount: {
      minQuantity: 3,
      discountPercentage: 15
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "addon-6",
    name: "Parent Refreshment Pack",
    description: "Refreshment pack for parents including snacks and beverages",
    price: 349,
    images: ["/images/parent-refreshment.jpg"],
    category: "meal",
    isActive: true,
    hasVariants: false,
    stockQuantity: 100,
    sku: "REFRESH-001",
    bundleDiscount: {
      minQuantity: 2,
      discountPercentage: 10
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
]
