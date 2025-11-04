# Add-ons API Documentation

## Create Add-on

**POST** `https://ai.nibog.in/webhook/v1/nibog/addons/create`

### Request Body

```json
{
  "name": "Gourmet Snack Box",
  "description": "A premium selection of snacks from around the world.",
  "price": 499.99,
  "category": "meal",
  "images": [
    "https://cdn.example.com/images/snackbox1.png",
    "https://cdn.example.com/images/snackbox2.png"
  ],
  "isActive": true,
  "hasVariants": true,
  "stock_quantity": 100,
  "sku": "SNACK-BOX-PREMIUM",
  "bundleDiscount": {
    "minQuantity": 3,
    "discountPercentage": 15
  },
  "variants": [
    {
      "name": "Small Box",
      "price_modifier": 0,
      "sku": "SNACK-BOX-SM",
      "stock_quantity": 40
    },
    {
      "name": "Medium Box",
      "price_modifier": 100,
      "sku": "SNACK-BOX-MD",
      "stock_quantity": 35
    },
    {
      "name": "Large Box",
      "price_modifier": 200,
      "sku": "SNACK-BOX-LG",
      "stock_quantity": 25
    }
  ]
}
```

### Responses

```json
[
  {
    "id": 6,
    "name": "Gourmet Snack Box",
    "description": "A premium selection of snacks from around the world.",
    "price": "499.99",
    "category": "meal",
    "is_active": true,
    "has_variants": true,
    "stock_quantity": 100,
    "sku": "SNACK-BOX-PREMIUM",
    "bundle_min_quantity": 3,
    "bundle_discount_percentage": "15.00",
    "created_at": "2025-06-10T16:45:19.050Z",
    "updated_at": "2025-06-10T16:45:19.050Z"
  }
]

[
  {
    "addon_id": 6,
    "image_url": "https://cdn.example.com/images/snackbox1.png"
  },
  {
    "addon_id": 6,
    "image_url": "https://cdn.example.com/images/snackbox2.png"
  }
]

[
  {
    "id": 4,
    "addon_id": 6,
    "name": "Small Box",
    "price_modifier": "0.00",
    "sku": "SNACK-BOX-SM",
    "stock_quantity": 40
  },
  {
    "id": 5,
    "addon_id": 6,
    "name": "Medium Box",
    "price_modifier": "100.00",
    "sku": "SNACK-BOX-MD",
    "stock_quantity": 35
  },
  {
    "id": 6,
    "addon_id": 6,
    "name": "Large Box",
    "price_modifier": "200.00",
    "sku": "SNACK-BOX-LG",
    "stock_quantity": 25
  }
]

## Get Add-on by ID

**POST** `https://ai.nibog.in/webhook/v1/nibog/addons/get`

### Request Body

```json
{
  "id": 7
}
```

### Response

[
  {
    "id": 7,
    "name": "Custom Gym Water Bottle",
    "description": "A high-quality stainless steel bottle with custom branding options.",
    "price": "499.00",
    "category": "merchandise",
    "is_active": true,
    "has_variants": true,
    "stock_quantity": 40,
    "sku": "GYM-BOTTLE-BASE",
    "bundle_min_quantity": 5,
    "bundle_discount_percentage": "15.00",
    "images": [
      "https://example.com/images/bottle-front.jpg",
      "https://example.com/images/bottle-side.jpg"
    ],
    "variants": [
      {
        "id": 7,
        "addon_id": 7,
        "name": "Red Logo",
        "price_modifier": 0,
        "sku": "BOTTLE-RED",
        "stock_quantity": 25
      },
      {
        "id": 8,
        "addon_id": 7,
        "name": "Blue Logo",
        "price_modifier": 20,
        "sku": "BOTTLE-BLUE",
        "stock_quantity": 15
      }
    ]
  }
]

## Get All Add-ons

**GET** `https://ai.nibog.in/webhook/v1/nibog/addons/get-all`

### Response
[
  {
    "id": 7,
    "name": "Custom Gym Water Bottle",
    "description": "A high-quality stainless steel bottle with custom branding options.",
    "price": "499.00",
    "category": "merchandise",
    "is_active": true,
    "has_variants": true,
    "stock_quantity": 40,
    "sku": "GYM-BOTTLE-BASE",
    "bundle_min_quantity": 5,
    "bundle_discount_percentage": "15.00",
    "images": [
      "https://example.com/images/bottle-front.jpg",
      "https://example.com/images/bottle-side.jpg"
    ],
    "variants": [
      {
        "id": 7,
        "addon_id": 7,
        "name": "Red Logo",
        "price_modifier": 0,
        "sku": "BOTTLE-RED",
        "stock_quantity": 25
      },
      {
        "id": 8,
        "addon_id": 7,
        "name": "Blue Logo",
        "price_modifier": 20,
        "sku": "BOTTLE-BLUE",
        "stock_quantity": 15
      }
    ]
  },
  {
    "id": 6,
    "name": "Gourmet Snack Box",
    "description": "A premium selection of snacks from around the world.",
    "price": "499.99",
    "category": "meal",
    "is_active": true,
    "has_variants": true,
    "stock_quantity": 100,
    "sku": "SNACK-BOX-PREMIUM",
    "bundle_min_quantity": 3,
    "bundle_discount_percentage": "15.00",
    "images": [
      "https://cdn.example.com/images/snackbox1.png",
      "https://cdn.example.com/images/snackbox2.png"
    ],
    "variants": [
      {
        "id": 4,
        "addon_id": 6,
        "name": "Small Box",
        "price_modifier": 0,
        "sku": "SNACK-BOX-SM",
        "stock_quantity": 40
      },
      {
        "id": 5,
        "addon_id": 6,
        "name": "Medium Box",
        "price_modifier": 100,
        "sku": "SNACK-BOX-MD",
        "stock_quantity": 35
      },
      {
        "id": 6,
        "addon_id": 6,
        "name": "Large Box",
        "price_modifier": 200,
        "sku": "SNACK-BOX-LG",
        "stock_quantity": 25
      }
    ]
  },
  {
    "id": 2,
    "name": "Premium Sauce Add-on",
    "description": "Extra premium sauce for your meals.",
    "price": "25.00",
    "category": "meal",
    "is_active": true,
    "has_variants": false,
    "stock_quantity": 100,
    "sku": "SAUCE-001",
    "bundle_min_quantity": 3,
    "bundle_discount_percentage": "10.00",
    "images": [
      "https://example.com/images/sauce1.png",
      "https://example.com/images/sauce2.png"
    ],
    "variants": []
  },
  {
    "id": 0,
    "name": "Organic Protein Shake",
    "description": "A healthy protein shake made with all-natural ingredients.",
    "price": "199.99",
    "category": "meal",
    "is_active": true,
    "has_variants": true,
    "stock_quantity": 23,
    "sku": "SHAKE-BASE",
    "bundle_min_quantity": 3,
    "bundle_discount_percentage": "12.00",
    "images": [
      "image.png"
    ],
    "variants": [
      {
        "id": 1,
        "addon_id": 0,
        "name": "Chocolate",
        "price_modifier": 0,
        "sku": "SHAKE-CHOC",
        "stock_quantity": 10
      },
      {
        "id": 2,
        "addon_id": 0,
        "name": "Vanilla",
        "price_modifier": 20,
        "sku": "SHAKE-VAN",
        "stock_quantity": 5
      },
      {
        "id": 3,
        "addon_id": 0,
        "name": "Strawberry",
        "price_modifier": 15,
        "sku": "SHAKE-STR",
        "stock_quantity": 8
      }
    ]
  }
]

## update add-on

**POST** `https://ai.nibog.in/webhook/v1/nibog/addons/update`

### Request Body

```json
{
  "id": 0,
  "name": "Updated Name",
  "description": "Updated Description",
  "price": 299,
  "category": "meal",
  "images": [
    "https://example.com/images/new1.png",
    "https://example.com/images/new2.png"
  ],
  "isActive": true,
  "hasVariants": true,
  "variants": [
    {
      "name": "New Variant 1",
      "price_modifier": 0,
      "sku": "NEW-SKU-1",
      "stock_quantity": 10
    }
  ],
  "stockQuantity": 10,
  "sku": "UPDATED-SKU",
  "bundleDiscount": {
    "minQuantity": 2,
    "discountPercentage": 5
  }
}
```

### Response // it will add seperately to the existing images and variants table

[
  {
    "id": 0,
    "name": "Updated Name",
    "description": "Updated Description",
    "price": "299.00",
    "category": "meal",
    "is_active": true,
    "has_variants": true,
    "stock_quantity": 10,
    "sku": "UPDATED-SKU",
    "bundle_min_quantity": 2,
    "bundle_discount_percentage": "5.00",
    "images": [
      "https://example.com/images/new1.png",
      "https://example.com/images/new2.png"
    ],
    "variants": [
      {
        "id": 1,
        "addon_id": 0,
        "name": "New Variant 1",
        "price_modifier": 0,
        "sku": "NEW-SKU-1", 
        "stock_quantity": 10
      }
    ]
  }
]

## delete add-on

**POST** `https://ai.nibog.in/webhook/v1/nibog/addons/delete`

### Request Body

```json
{
  "id": 0
}
```

### Response

[
  {
    "success": true
  }
] 

