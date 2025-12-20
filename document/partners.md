# Partners API Documentation

Base URL: `/api/partners`

## Authentication
- All POST, PUT, DELETE endpoints require Bearer token authentication (employee).

---

## List All Partners
**GET** `/api/partners`

**Response:**
```
{
  "success": true,
  "data": [
    {
      "id": 1,
      "partner_name": "Partner 1",
      "image_url": "/images/partner1.png",
      "display_priority": 1,
      "status": "Active",
      "created_at": "2025-12-14T10:00:00.000Z",
      "updated_at": "2025-12-14T10:00:00.000Z"
    },
    ...
  ]
}
```

---

## Get Single Partner
**GET** `/api/partners/{id}`

**Response:**
```
{
  "success": true,
  "data": {
    "id": 1,
    "partner_name": "Partner 1",
    "image_url": "/images/partner1.png",
    "display_priority": 1,
    "status": "Active",
    "created_at": "2025-12-14T10:00:00.000Z",
    "updated_at": "2025-12-14T10:00:00.000Z"
  }
}
```

---

## Create Partner
**POST** `/api/partners`

**Headers:**
- Authorization: Bearer {token}

**Body:**
```
{
  "partner_name": "Partner 1",         // optional
  "image_url": "/images/partner1.png", // required
  "display_priority": 1,                // optional, default 1
  "status": "Active"                   // optional, default 'Active'
}
```

**Response:**
```
{
  "success": true,
  "data": {
    "id": 2,
    "partner_name": "Partner 1",
    "image_url": "/images/partner1.png",
    "display_priority": 1,
    "status": "Active"
  }
}
```

---

## Update Partner
**PUT** `/api/partners/{id}`

**Headers:**
- Authorization: Bearer {token}

**Body:**
```
{
  "partner_name": "Partner 1",         // optional
  "image_url": "/images/partner1.png", // optional
  "display_priority": 2,                // optional
  "status": "Inactive"                 // optional
}
```

**Response:**
```
{
  "success": true,
  "message": "Partner updated"
}
```

---

## Delete Partner
**DELETE** `/api/partners/{id}`

**Headers:**
- Authorization: Bearer {token}

**Response:**
```
{
  "success": true,
  "message": "Partner deleted"
}
```

---

## Error Responses
- All endpoints return `{ success: false, message: "..." }` on error.

---

## Example cURL Requests

### List Partners
```
curl -X GET http://localhost:3000/api/partners
```

### Get Partner
```
curl -X GET http://localhost:3000/api/partners/1
```

### Create Partner
```
curl -X POST http://localhost:3000/api/partners \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{ "partner_name": "Partner 1", "image_url": "/images/partner1.png", "display_priority": 1, "status": "Active" }'
```

### Update Partner
```
curl -X PUT http://localhost:3000/api/partners/1 \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{ "display_priority": 2 }'
```

### Delete Partner
```
curl -X DELETE http://localhost:3000/api/partners/1 \
  -H "Authorization: Bearer {token}"
```
