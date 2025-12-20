# General Settings API Documentation

## Base URL
```
http://localhost:3004/api/general-settings
```

## Endpoints

### 1. Get General Settings
**GET** `/api/general-settings/`

**Description:**
Fetch the current general site settings.

**Example Request:**
```
curl -X GET "http://localhost:3004/api/general-settings/"
```

**Response:**
```json
{
  "id": 1,
  "site_name": "Your Site Name",
  "site_tagline": "Your Site Tagline",
  "contact_email": "contact@example.com",
  "contact_phone": "1234567890",
  "address": "Your Address",
  "logo_path": "/path/to/logo.png",
  "favicon_path": "/path/to/favicon.ico",
  "created_at": "2025-12-14T10:00:00.000Z",
  "updated_at": "2025-12-14T10:00:00.000Z"
}
```

---

### 2. Update General Settings (Protected)
**PUT** `/api/general-settings/`

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body Example:**
```json
{
  "site_name": "New Site Name",
  "site_tagline": "New Tagline",
  "contact_email": "new@example.com",
  "contact_phone": "9876543210",
  "address": "New Address",
  "logo_path": "/new/path/to/logo.png",
  "favicon_path": "/new/path/to/favicon.ico"
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
