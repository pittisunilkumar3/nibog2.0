# Venue API Documentation

## Base URL
```
http://localhost:3004/api/venue
```

## Endpoints

### 1. List All Venues
**GET** `/api/venue/`

**Description:**
Fetch all venues.

**Example Request:**
```
curl -X GET "http://localhost:3004/api/venue/"
```

**Response:**
```json
[
  {
    "id": 1,
    "venue_name": "Stadium 1",
    "address": "123 Main St",
    "city_id": 1,
    "city_name": "Mumbai",
    "state": "Maharashtra",
    "capacity": 5000,
    "is_active": 1,
    "created_at": "2025-12-14T10:00:00.000Z",
    "updated_at": "2025-12-14T10:00:00.000Z"
  }
]
```

---

### 2. Get Single Venue
**GET** `/api/venue/:id`

**Example Request:**
```
curl -X GET "http://localhost:3004/api/venue/1"
```

**Response:**
```json
{
  "id": 1,
  "venue_name": "Stadium 1",
  "address": "123 Main St",
  "city_id": 1,
  "city_name": "Mumbai",
  "state": "Maharashtra",
  "capacity": 5000,
  "is_active": 1,
  "created_at": "2025-12-14T10:00:00.000Z",
  "updated_at": "2025-12-14T10:00:00.000Z"
}
```

---

### 3. Create Venue (Protected)
**POST** `/api/venue/`

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body Example:**
```json
{
  "venue_name": "New Venue",
  "address": "456 New St",
  "city_id": 2,
  "capacity": 1000,
  "is_active": 1
}
```

**Response:**
```json
{
  "message": "Venue created successfully"
}
```

---

### 4. Update Venue (Protected)
**PUT** `/api/venue/:id`

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body Example:**
```json
{
  "venue_name": "Updated Venue",
  "address": "789 Updated St",
  "city_id": 2,
  "capacity": 2000,
  "is_active": 1
}
```

**Response:**
```json
{
  "message": "Venue updated successfully"
}
```

---

### 5. Delete Venue (Protected)
**DELETE** `/api/venue/:id`

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "message": "Venue deleted successfully"
}
```

---

## Notes
- Create, update, and delete endpoints require a valid Bearer token in the `Authorization` header.
- List and get endpoints are public.
- For errors, a JSON object with a `message` and optional `error` field is returned.
