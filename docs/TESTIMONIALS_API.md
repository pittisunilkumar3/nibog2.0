# Testimonials API Documentation 📣

**Base URL:** `/api/testimonials`

---

## Overview
User-submitted testimonials for events (with optional image). Public endpoints allow listing and fetching testimonials; protected endpoints (employee auth) allow creating, updating, and deleting.

---

## Authentication
- **Protected endpoints** require **Bearer** token authentication from an employee account.
- Add the token to the `Authorization` header: `Authorization: Bearer {token}`
- Protected endpoints: POST, PUT, DELETE

---

## Endpoints

### 1. List Testimonials (Public)

**GET** `/api/testimonials`

List all testimonials with optional filtering and pagination.

**Query Parameters:**
- `limit` (number, optional) - Number of items per page (default: 20)
- `offset` (number, optional) - Number of items to skip (default: 0)
- `status` (string, optional) - Filter by status: `Published`, `Pending`, `Rejected`
- `city_id` (number, optional) - Filter by city ID
- `event_id` (number, optional) - Filter by event ID
- `is_active` (number, optional) - Filter by active status (0 or 1)

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "id": 123,
      "name": "Sahana Kumar",
      "city_id": 3,
      "city_name": "Bangalore",
      "event_id": 12,
      "event_name": "Winter Carnival 2025",
      "rating": 5,
      "testimonial": "Amazing event — the kids had a blast!",
      "submitted_at": "2025-12-20",
      "status": "Published",
      "image_url": "https://cdn.example.com/uploads/testimonial-12.jpg",
      "priority": 10,
      "is_active": 1,
      "created_at": "2025-12-20T06:30:00.000Z",
      "updated_at": "2025-12-20T06:30:00.000Z"
    },
    {
      "id": 124,
      "name": "Ravi Patel",
      "city_id": 2,
      "city_name": "Chennai",
      "event_id": 15,
      "event_name": "Summer Fest 2025",
      "rating": 4,
      "testimonial": "Good, but could be better organized.",
      "submitted_at": "2025-12-19",
      "status": "Published",
      "image_url": null,
      "priority": 5,
      "is_active": 1,
      "created_at": "2025-12-19T10:00:00.000Z",
      "updated_at": "2025-12-19T10:00:00.000Z"
    }
  ],
  "meta": {
    "limit": 20,
    "offset": 0,
    "total": 42
  }
}
```

**cURL Example:**
```bash
curl -X GET "http://localhost:3111/api/testimonials?status=Published&limit=10"
```

---

### 2. Get Single Testimonial (Public)

**GET** `/api/testimonials/{id}`

Get a specific testimonial by ID.

**Path Parameters:**
- `id` (number, required) - Testimonial ID

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": 123,
    "name": "Sahana Kumar",
    "city_id": 3,
    "event_id": 12,
    "rating": 5,
    "testimonial": "Amazing event — the kids had a blast!",
    "submitted_at": "2025-12-20",
    "status": "Published",
    "image_url": "https://cdn.example.com/uploads/testimonial-12.jpg",
    "priority": 10,
    "is_active": 1,
    "created_at": "2025-12-20T06:30:00.000Z",
    "updated_at": "2025-12-20T06:30:00.000Z"
  }
}
```

**Error Response:** `404 Not Found`
```json
{
  "success": false,
  "message": "Testimonial not found"
}
```

**cURL Example:**
```bash
curl -X GET "http://localhost:3111/api/testimonials/123"
```

---

### 3. Create Testimonial (Protected)

**POST** `/api/testimonials`

Create a new testimonial. Requires employee authentication.

**Headers:**
- `Authorization: Bearer {token}` (required)
- `Content-Type: application/json` (required)

**Request Body:**
```json
{
  "name": "Sahana Kumar",
  "city_id": 3,
  "event_id": 12,
  "rating": 5,
  "testimonial": "Amazing event — the kids had a blast!",
  "submitted_at": "2025-12-20",
  "status": "Published",
  "image_url": "https://cdn.example.com/uploads/testimonial-12.jpg",
  "priority": 10,
  "is_active": 1
}
```

**Required Fields:**
- `name` (string) - Name of the person giving testimonial

**Optional Fields:**
- `city_id` (number) - City ID reference
- `event_id` (number) - Event ID reference
- `rating` (number, 1-5) - Rating value (default: 5)
- `testimonial` (string) - Testimonial text
- `submitted_at` (date, YYYY-MM-DD) - Date submitted (default: today)
- `status` (string) - `Published`, `Pending`, or `Rejected` (default: `Pending`)
- `image_url` (string) - URL to testimonial image
- `priority` (number) - Display priority (higher = first, default: 0)
- `is_active` (number, 0 or 1) - Active status (default: 1)

**Response:** `201 Created`
```json
{
  "success": true,
  "message": "Testimonial created",
  "id": 123,
  "data": {
    "id": 123,
    "name": "Sahana Kumar",
    "city_id": 3,
    "event_id": 12,
    "rating": 5,
    "testimonial": "Amazing event — the kids had a blast!",
    "submitted_at": "2025-12-20",
    "status": "Published",
    "image_url": "https://cdn.example.com/uploads/testimonial-12.jpg",
    "priority": 10,
    "is_active": 1,
    "created_at": "2025-12-20T06:30:00.000Z",
    "updated_at": "2025-12-20T06:30:00.000Z"
  }
}
```

**Error Responses:**

`400 Bad Request` - Validation error
```json
{
  "success": false,
  "message": "name is required"
}
```

`401 Unauthorized` - Missing or invalid token
```json
{
  "success": false,
  "message": "Unauthorized"
}
```

**cURL Example:**
```bash
curl -X POST "http://localhost:3111/api/testimonials" \
  -H "Authorization: Bearer {your_token}" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Sahana Kumar",
    "city_id": 3,
    "event_id": 12,
    "rating": 5,
    "testimonial": "Amazing event — the kids had a blast!",
    "status": "Published",
    "priority": 10
  }'
```

---

### 4. Update Testimonial (Protected)

**PUT** `/api/testimonials/{id}`

Update an existing testimonial. Requires employee authentication.

**Path Parameters:**
- `id` (number, required) - Testimonial ID

**Headers:**
- `Authorization: Bearer {token}` (required)
- `Content-Type: application/json` (required)

**Request Body:**
Partial updates are supported. Include only the fields you want to change.

```json
{
  "name": "Sahana K.",
  "rating": 4,
  "status": "Published",
  "priority": 5
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Testimonial updated"
}
```

**Error Responses:**

`400 Bad Request` - Validation error
```json
{
  "success": false,
  "message": "rating must be between 1 and 5"
}
```

`401 Unauthorized` - Missing or invalid token
```json
{
  "success": false,
  "message": "Unauthorized"
}
```

`404 Not Found` - Testimonial doesn't exist
```json
{
  "success": false,
  "message": "Testimonial not found"
}
```

**cURL Example:**
```bash
curl -X PUT "http://localhost:3111/api/testimonials/123" \
  -H "Authorization: Bearer {your_token}" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "Published",
    "priority": 5
  }'
```

---

### 5. Delete Testimonial (Protected)

**DELETE** `/api/testimonials/{id}`

Delete a testimonial. Requires employee authentication.

**Path Parameters:**
- `id` (number, required) - Testimonial ID

**Headers:**
- `Authorization: Bearer {token}` (required)

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Testimonial deleted"
}
```

**Error Responses:**

`401 Unauthorized` - Missing or invalid token
```json
{
  "success": false,
  "message": "Unauthorized"
}
```

`404 Not Found` - Testimonial doesn't exist
```json
{
  "success": false,
  "message": "Testimonial not found"
}
```

**cURL Example:**
```bash
curl -X DELETE "http://localhost:3111/api/testimonials/123" \
  -H "Authorization: Bearer {your_token}"
```

---

## Data Model

### Testimonial Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | integer | Auto | Primary key (auto-generated) |
| `name` | string | Yes | Name of person giving testimonial |
| `city_id` | integer | No | Foreign key to cities table |
| `city_name` | string | Auto | Name of the city (populated in responses) |
| `event_id` | integer | No | Foreign key to events table |
| `event_name` | string | Auto | Name of the event (populated in responses) |
| `rating` | integer | No | Rating 1-5 (default: 5) |
| `testimonial` | text | No | Testimonial content |
| `submitted_at` | date | No | Date submitted (default: today) |
| `status` | enum | No | `Published`, `Pending`, `Rejected` (default: `Pending`) |
| `image_url` | string | No | URL to image |
| `priority` | integer | No | Sort priority (higher first, default: 0) |
| `is_active` | tinyint | No | Active flag 0/1 (default: 1) |
| `created_at` | timestamp | Auto | Record creation time |
| `updated_at` | timestamp | Auto | Last update time |

---

## Status Values

- **Published** - Approved and visible to public
- **Pending** - Awaiting review
- **Rejected** - Not approved for display

---

## Common Error Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 201 | Created successfully |
| 400 | Bad request (validation error) |
| 401 | Unauthorized (missing/invalid token) |
| 404 | Resource not found |
| 500 | Internal server error |

---

## Testing with Postman

1. **Get all testimonials:**
   - Method: GET
   - URL: `http://localhost:3111/api/testimonials`
   
2. **Get one testimonial:**
   - Method: GET
   - URL: `http://localhost:3111/api/testimonials/123`

3. **Create testimonial:**
   - Method: POST
   - URL: `http://localhost:3111/api/testimonials`
   - Headers: `Authorization: Bearer {token}`
   - Body: JSON with required fields

4. **Update testimonial:**
   - Method: PUT
   - URL: `http://localhost:3111/api/testimonials/123`
   - Headers: `Authorization: Bearer {token}`
   - Body: JSON with fields to update

5. **Delete testimonial:**
   - Method: DELETE
   - URL: `http://localhost:3111/api/testimonials/123`
   - Headers: `Authorization: Bearer {token}`

---

## Related APIs

- **Events API:** `/api/events` (testimonials can reference events)
- **Cities API:** `/api/city` (testimonials can reference cities)
- **Auth API:** See employee authentication documentation

---

## Notes

- All timestamps are in ISO 8601 format (UTC)
- Pagination: Use `limit` and `offset` for large datasets
- Filtering: Combine multiple query parameters for refined searches
- The API uses `BACKEND_URL` environment variable (default: `http://localhost:3004`)
- Response includes `city_name` and `event_name` automatically populated from their respective IDs
- Image uploads: Currently accepts `image_url` directly. For file uploads, use a separate upload endpoint first to get the URL.

---

**Last Updated:** December 20, 2025
