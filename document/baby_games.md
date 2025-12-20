# Baby Games API Documentation

## Base URL
```
http://localhost:3004/api/baby-games
```

---

## 1. Get All Baby Games

**GET** `/api/baby-games`

### Success Response
```
{
  "success": true,
  "games": [
    {
      "id": 1,
      "game_name": "...",
      "image_url": "...",
      "description": "...",
      "min_age": 2,
      "max_age": 5,
      "duration_minutes": 30,
      "categories": "[\"fun\",\"outdoor\"]",
      "priority": 1,
      "is_active": 1,
      "created_at": "2025-12-14T12:00:00.000Z",
      "updated_at": "2025-12-14T12:00:00.000Z"
    }
  ]
}
```

---

## 2. Get Baby Game by ID

**GET** `/api/baby-games/{id}`

### Success Response
```
{
  "success": true,
  "game": { ... }
}
```

### Error Response
```
{
  "success": false,
  "message": "Game not found"
}
```

---

## 3. Create Baby Game

**POST** `/api/baby-games`

### Headers
```
Authorization: Bearer <JWT_TOKEN>
```

### Request Body (JSON)
```
{
  "game_name": "...",
  "image_url": "...",
  "description": "...",
  "min_age": 2,
  "max_age": 5,
  "duration_minutes": 30,
  "categories": "[\"fun\",\"outdoor\"]",
  "priority": 1,
  "is_active": 1
}
```

### Success Response
```
{
  "success": true,
  "message": "Game created",
  "id": 1
}
```

---

## 4. Update Baby Game

**PUT** `/api/baby-games/{id}`

### Headers
```
Authorization: Bearer <JWT_TOKEN>
```

### Request Body (JSON)
```
{
  "game_name": "...",
  "image_url": "...",
  "description": "...",
  "min_age": 2,
  "max_age": 5,
  "duration_minutes": 30,
  "categories": "[\"fun\",\"outdoor\"]",
  "priority": 1,
  "is_active": 1
}
```

### Success Response
```
{
  "success": true,
  "message": "Game updated"
}
```

---

## 5. Delete Baby Game

**DELETE** `/api/baby-games/{id}`

### Headers
```
Authorization: Bearer <JWT_TOKEN>
```

### Success Response
```
{
  "success": true,
  "message": "Game deleted"
}
```

---

## Implementation Notes
- All logic is handled in `model/babyGamesModel.js` and `controller/babyGamesController.js`.
- The `categories` field should be a JSON string (e.g., '["fun","outdoor"]').
- The `image_url` is the main image for the game. For multiple images, use a related images table.
- All endpoints return JSON responses.
- POST, PUT, and DELETE endpoints require a valid JWT access token in the Authorization header.
