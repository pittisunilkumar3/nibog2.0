# Homepage Sections API Documentation

Base URL: `/api/homepage-sections`

## Authentication
- All POST, PUT, DELETE endpoints require Bearer token authentication (employee).

---

## List All Homepage Sections
**GET** `/api/homepage-sections`

**Response:**
```
{
  "success": true,
  "data": [
    {
      "id": 1,
      "image_path": "/images/section1.jpg",
      "priority": 1,
      "status": "active",
      "created_at": "2025-12-14T10:00:00.000Z",
      "updated_at": "2025-12-14T10:00:00.000Z"
    },
    ...
  ]
}
```

---

## Get Single Homepage Section
**GET** `/api/homepage-sections/{id}`

**Response:**
```
{
  "success": true,
  "data": {
    "id": 1,
    "image_path": "/images/section1.jpg",
    "priority": 1,
    "status": "active",
    "created_at": "2025-12-14T10:00:00.000Z",
    "updated_at": "2025-12-14T10:00:00.000Z"
  }
}
```

---

## Create Homepage Section
**POST** `/api/homepage-sections`

**Headers:**
- Authorization: Bearer {token}

**Body:**
```
{
  "image_path": "/images/section1.jpg",
  "priority": 1,           // optional, default 1
  "status": "active"      // optional, default 'active'
}
```

**Response:**
```
{
  "success": true,
  "data": {
    "id": 2,
    "image_path": "/images/section1.jpg",
    "priority": 1,
    "status": "active"
  }
}
```

---

## Update Homepage Section
**PUT** `/api/homepage-sections/{id}`

**Headers:**
- Authorization: Bearer {token}

**Body:**
```
{
  "image_path": "/images/section1.jpg", // optional
  "priority": 2,                         // optional
  "status": "inactive"                  // optional
}
```

**Response:**
```
{
  "success": true,
  "message": "Section updated"
}
```

---

## Delete Homepage Section
**DELETE** `/api/homepage-sections/{id}`

**Headers:**
- Authorization: Bearer {token}

**Response:**
```
{
  "success": true,
  "message": "Section deleted"
}
```

---

## Error Responses
- All endpoints return `{ success: false, message: "..." }` on error.

---

## Example cURL Requests

### List Sections
```
curl -X GET http://localhost:3000/api/homepage-sections
```

### Get Section
```
curl -X GET http://localhost:3000/api/homepage-sections/1
```

### Create Section
```
curl -X POST http://localhost:3000/api/homepage-sections \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{ "image_path": "/images/section1.jpg", "priority": 1, "status": "active" }'
```

### Update Section
```
curl -X PUT http://localhost:3000/api/homepage-sections/1 \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{ "priority": 2 }'
```

### Delete Section
```
curl -X DELETE http://localhost:3000/api/homepage-sections/1 \
  -H "Authorization: Bearer {token}"
```
