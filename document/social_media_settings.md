# Social Media Settings API Documentation

## Base URL
```
http://localhost:3004/api/social-media-settings
```

## Endpoints

### 1. Get Social Media Settings
**GET** `/api/social-media-settings/`

**Description:**
Fetch the current social media links/settings.

**Example Request:**
```
curl -X GET "http://localhost:3004/api/social-media-settings/"
```

**Response:**
```json
{
  "id": 1,
  "facebook_url": "https://www.facebook.com/share/1K8H6SPtR5/",
  "instagram_url": "https://www.instagram.com/nibog_100",
  "linkedin_url": "https://www.linkedin.com/in/new-india-baby-olympicgames",
  "youtube_url": "https://youtube.com/@newindiababyolympics",
  "created_at": "2025-12-14T10:00:00.000Z",
  "updated_at": "2025-12-14T10:00:00.000Z"
}
```

---

### 2. Update Social Media Settings (Protected)
**PUT** `/api/social-media-settings/`

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body Example:**
```json
{
  "facebook_url": "https://facebook.com/newpage",
  "instagram_url": "https://instagram.com/newpage",
  "linkedin_url": "https://linkedin.com/in/newpage",
  "youtube_url": "https://youtube.com/@newpage"
}
```

**Response:**
```json
{
  "message": "Settings updated successfully"
}
```

---

## Notes
- The update endpoint requires a valid Bearer token in the `Authorization` header.
- The get endpoint is public.
- For errors, a JSON object with a `message` and optional `error` field is returned.
