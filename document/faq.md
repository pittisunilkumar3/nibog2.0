# Create FAQ
**POST** `/api/faq/faqs`

**Description:** Create a new FAQ. Requires employee authentication.

**Headers:**
```
Authorization: Bearer <employee_token>
Content-Type: application/json
```

**Request Body Example:**
```json
{
  "question": "How do I register?",
  "answer": "Click the register button and fill out the form.",
  "category": "General",
  "display_priority": 1,
  "status": "Active"
}
```

**Success Response:**
```json
{
  "message": "FAQ created successfully",
  "faq": {
    "id": 5,
    "question": "How do I register?",
    "answer": "Click the register button and fill out the form.",
    "category": "General",
    "display_priority": 1,
    "status": "Active"
  }
}
```

**Error Response:**
```json
{
  "message": "Question and answer are required."
}
```

# FAQ API Documentation

## Base URL
```
http://localhost:3004/api/faq
```

## API Endpoints

### 1. List All FAQs
**GET** `/api/faq/faqs`

**Query Parameters (optional):**
- `status`: Filter by status (`Active` or `Inactive`)
- `category`: Filter by category

**Example Request:**
```
GET http://localhost:3004/api/faq/faqs?status=Active&category=General
```

**Response:**
```json
[
  {
    "id": 1,
    "question": "What is NIBOG?",
    "answer": "NIBOG stands for ...",
    "category": "General",
    "display_priority": 1,
    "status": "Active",
    "created_at": "2025-12-14T10:00:00.000Z",
    "updated_at": "2025-12-14T10:00:00.000Z"
  }
]
```

---

### 2. Get Single FAQ
**GET** `/api/faq/faqs/:id`

**Example Request:**
```
GET http://localhost:3004/api/faq/faqs/1
```

**Response:**
```json
{
  "id": 1,
  "question": "What is NIBOG?",
  "answer": "NIBOG stands for ...",
  "category": "General",
  "display_priority": 1,
  "status": "Active",
  "created_at": "2025-12-14T10:00:00.000Z",
  "updated_at": "2025-12-14T10:00:00.000Z"
}
```

---

### 3. Edit FAQ (Protected)
**PUT** `/api/faq/faqs/:id`

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body Example:**
```json
{
  "question": "Updated question?",
  "answer": "Updated answer.",
  "category": "General",
  "display_priority": 2,
  "status": "Inactive"
}
```

**Response:**
```json
{
  "message": "FAQ updated successfully"
}
```

---

### 4. Delete FAQ (Protected)
**DELETE** `/api/faq/faqs/:id`

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "message": "FAQ deleted successfully"
}
```

---

## Testing with Postman or cURL

### List All FAQs
```
curl -X GET "http://localhost:3004/api/faq/faqs"
```

### Get Single FAQ
```
curl -X GET "http://localhost:3004/api/faq/faqs/1"
```

### Edit FAQ
```
curl -X PUT "http://localhost:3004/api/faq/faqs/1" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{"question":"Updated?","answer":"Updated answer."}'
```

### Delete FAQ
```
curl -X DELETE "http://localhost:3004/api/faq/faqs/1" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## Notes
- All edit and delete operations require a valid Bearer token in the `Authorization` header.
- List and single get endpoints are public.
- For errors, a JSON object with a `message` and optional `error` field is returned.
