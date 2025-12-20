# City API Documentation

## Base URL
```
http://localhost:3004/api/city
```

## Endpoints

## City-wise Events

### List All Events for a City
**GET** `/api/city/{city_id}/events`

**Description:**
Fetch all events for a given city, including venue and city names.

**Example Request:**
```
curl -X GET "http://localhost:3004/api/city/1/events"
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 10,
      "title": "Winter Carnival 2025",
      "description": "A fun event for all ages!",
      "city_id": 1,
      "city_name": "Mumbai",
      "venue_id": 2,
      "venue_name": "Juhu Beach",
      "event_date": "2025-12-31",
      "status": "Published",
      "is_active": 1,
      "image_url": null,
      "priority": 1,
      "created_at": "2025-12-01T10:00:00.000Z",
      "updated_at": "2025-12-10T10:00:00.000Z"
    }
  ]
}
```

---

### 1. List All Cities
**GET** `/api/city/`

**Description:**
Fetch all cities.

**Example Request:**
```
curl -X GET "http://localhost:3004/api/city/"
```

**Response:**
```json
[
  {
    "id": 1,
    "city_name": "Mumbai",
    "state": "Maharashtra",
    "is_active": 1,
    "created_at": "2025-12-14T10:00:00.000Z",
    "updated_at": "2025-12-14T10:00:00.000Z"
  }
]
```

---

### 1a. List All Cities with Venues and Total Venues
**GET** `/api/city/with-venues/list`

**Description:**
Fetch all cities, each with an array of their venues and a total_venues count.

**Example Request:**
```
curl -X GET "http://localhost:3004/api/city/with-venues/list"
```

**Response:**
```json
[
  {
    "id": 1,
    "city_name": "Mumbai",
    "state": "Maharashtra",
    "is_active": 1,
    "created_at": "2025-12-14T10:00:00.000Z",
    "updated_at": "2025-12-14T10:00:00.000Z",
    "total_venues": 2,
    "venues": [
      {
        "id": 1,
        "venue_name": "Stadium 1",
        "address": "123 Main St",
        "city_id": 1,
        "capacity": 5000,
        "is_active": 1,
        "created_at": "2025-12-14T10:00:00.000Z",
        "updated_at": "2025-12-14T10:00:00.000Z"
      },
      {
        "id": 2,
        "venue_name": "Stadium 2",
        "address": "456 Main St",
        "city_id": 1,
        "capacity": 3000,
        "is_active": 1,
        "created_at": "2025-12-14T10:00:00.000Z",
        "updated_at": "2025-12-14T10:00:00.000Z"
      }
    ]
  }
]
```

---

### 2. Get Single City
**GET** `/api/city/:id`

**Example Request:**
```
curl -X GET "http://localhost:3004/api/city/1"
```

**Response:**
```json
{
  "id": 1,
  "city_name": "Mumbai",
  "state": "Maharashtra",
  "is_active": 1,
  "created_at": "2025-12-14T10:00:00.000Z",
  "updated_at": "2025-12-14T10:00:00.000Z",
  "total_venues": 2,
  "venues": [
    {
      "id": 1,
      "venue_name": "Stadium 1",
      "address": "123 Main St",
      "city_id": 1,
      "capacity": 5000,
      "is_active": 1,
      "created_at": "2025-12-14T10:00:00.000Z",
      "updated_at": "2025-12-14T10:00:00.000Z"
    },
    {
      "id": 2,
      "venue_name": "Stadium 2",
      "address": "456 Main St",
      "city_id": 1,
      "capacity": 3000,
      "is_active": 1,
      "created_at": "2025-12-14T10:00:00.000Z",
      "updated_at": "2025-12-14T10:00:00.000Z"
    }
  ]
}
```

---

### 3. Create City (Protected)
**POST** `/api/city/`

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body Example:**
```json
{
  "city_name": "Pune",
  "state": "Maharashtra",
  "is_active": 1
}
```

**Response:**
```json
{
  "message": "City created successfully"
}
```

---

### 4. Update City (Protected)
**PUT** `/api/city/:id`

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body Example:**
```json
{
  "city_name": "Pune Updated",
  "state": "Maharashtra",
  "is_active": 1
}
```

**Response:**
```json
{
  "message": "City updated successfully"
}
```

---

### 5. Delete City (Protected)
**DELETE** `/api/city/:id`

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "message": "City deleted successfully"
}
```

---

## Notes
- Create, update, and delete endpoints require a valid Bearer token in the `Authorization` header.
- List and get endpoints are public.
- For errors, a JSON object with a `message` and optional `error` field is returned.
