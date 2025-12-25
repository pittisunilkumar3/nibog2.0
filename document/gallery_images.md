# Gallery Images API Documentation

Base URL: `/api/gallery-images`

## 1. List All Gallery Images
**Endpoint:** `GET /api/gallery-images`
**Access:** Public
**Description:** Retrieves a list of all gallery images, ordered by creation date (newest first).

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "image_path": "uploads/gallery/image1.jpg",
    "created_at": "2023-10-27T10:00:00.000Z",
    "updated_at": "2023-10-27T10:00:00.000Z"
  },
  ...
]
```

## 2. Get Single Gallery Image
**Endpoint:** `GET /api/gallery-images/:id`
**Access:** Public
**Description:** Retrieves details of a specific gallery image by ID.

**Response (200 OK):**
```json
{
  "id": 1,
  "image_path": "uploads/gallery/image1.jpg",
  "created_at": "2023-10-27T10:00:00.000Z",
  "updated_at": "2023-10-27T10:00:00.000Z"
}
```

## 3. Create Gallery Image
**Endpoint:** `POST /api/gallery-images`
**Access:** Protected (Employee Token Required)
**Headers:**
- `Content-Type: application/json`
- `Authorization: Bearer <your_token>`

**Request Body:**
```json
{
  "image_path": "uploads/gallery/new-image.jpg"
}
```

**Response (201 Created):**
```json
{
  "message": "Gallery image created successfully",
  "galleryImage": {
    "id": 2,
    "image_path": "uploads/gallery/new-image.jpg"
  }
}
```

## 4. Update Gallery Image
**Endpoint:** `PUT /api/gallery-images/:id`
**Access:** Protected (Employee Token Required)
**Headers:**
- `Content-Type: application/json`
- `Authorization: Bearer <your_token>`

**Request Body:**
```json
{
  "image_path": "uploads/gallery/updated-image.jpg"
}
```

**Response (200 OK):**
```json
{
  "message": "Gallery image updated successfully",
  "galleryImage": {
    "id": 2,
    "image_path": "uploads/gallery/updated-image.jpg",
    "created_at": "2023-10-27T10:05:00.000Z",
    "updated_at": "2023-10-27T10:10:00.000Z"
  }
}
```

## 5. Delete Gallery Image
**Endpoint:** `DELETE /api/gallery-images/:id`
**Access:** Protected (Employee Token Required)
**Headers:**
- `Content-Type: application/json`
- `Authorization: Bearer <your_token>`

**Response (200 OK):**
```json
{
  "message": "Gallery image deleted successfully"
}
```

## Testing with cURL

**List Gallery Images:**
```bash
curl http://localhost:3004/api/gallery-images
```

**Create Gallery Image (Replace TOKEN):**
```bash
curl -X POST http://localhost:3004/api/gallery-images \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_EMPLOYEE_TOKEN" \
  -d '{"image_path":"uploads/gallery/test.jpg"}'
```
