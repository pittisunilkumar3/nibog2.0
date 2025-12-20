# Addons API Documentation

Base URL: `/api/addons`

## 1. List All Addons
**Endpoint:** `GET /api/addons`
**Access:** Public
**Description:** Retrieves a list of all available addons.

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "name": "Extra Balloons",
    "description": "50 colorful balloons",
    "price": 500,
    "category": "Decor",
    "is_active": 1,
    "image_url": "http://example.com/balloons.jpg"
  },
  ...
]
```

## 2. Get Single Addon
**Endpoint:** `GET /api/addons/:id`
**Access:** Public
**Description:** Retrieves details of a specific addon by ID.

**Response (200 OK):**
```json
{
  "id": 1,
  "name": "Extra Balloons",
  "description": "50 colorful balloons",
  "price": 500,
  "category": "Decor",
  "is_active": 1,
  ...
}
```

## 3. Create Addon
**Endpoint:** `POST /api/addons`
**Access:** Protected (Employee Token Required)
**Headers:**
- `Content-Type: application/json`
- `Authorization: Bearer <your_token>`

**Request Body:**
```json
{
  "name": "Party Hat Set",
  "description": "Set of 10 party hats",
  "price": 150,
  "category": "Accessories",
  "is_active": 1,
  "has_variants": 0,
  "stock_quantity": 100,
  "sku": "HAT-001",
  "bundle_min_quantity": 10,
  "bundle_discount_percentage": 5,
  "image_url": "http://example.com/hats.jpg"
}
```

**Response (201 Created):**
```json
{
  "message": "Addon created successfully",
  "addon": {
    "id": 2,
    "name": "Party Hat Set",
    ...
  }
}
```

## 4. Update Addon
**Endpoint:** `PUT /api/addons/:id`
**Access:** Protected (Employee Token Required)
**Headers:**
- `Content-Type: application/json`
- `Authorization: Bearer <your_token>`

**Request Body:**
```json
{
  "price": 200,
  "stock_quantity": 90
}
```

**Response (200 OK):**
```json
{
  "message": "Addon updated successfully",
  "addon": {
    "id": 2,
    "name": "Party Hat Set",
    "price": 200,
    "stock_quantity": 90,
    ...
  }
}
```

## 5. Delete Addon
**Endpoint:** `DELETE /api/addons/:id`
**Access:** Protected (Employee Token Required)
**Headers:**
- `Content-Type: application/json`
- `Authorization: Bearer <your_token>`

**Response (200 OK):**
```json
{
  "message": "Addon deleted successfully"
}
```

## Testing with cURL

**List Addons:**
```bash
curl http://localhost:3004/api/addons
```

**Create Addon (Replace TOKEN):**
```bash
curl -X POST http://localhost:3004/api/addons \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_EMPLOYEE_TOKEN" \
  -d '{"name":"Test Addon", "price":100, "category":"Test"}'
```
