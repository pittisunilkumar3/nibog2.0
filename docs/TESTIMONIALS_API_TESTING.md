# Testimonials API Testing Guide

## Prerequisites
- Server running on port specified in BACKEND_URL (default: http://localhost:3004)
- Valid Bearer token for protected endpoints (get from employee login)

## Test Endpoints

### 1. List All Testimonials (Public)

```bash
# Get all testimonials
curl -X GET "http://localhost:3111/api/testimonials"

# With filters
curl -X GET "http://localhost:3111/api/testimonials?status=Published&limit=10&offset=0"

# Filter by city
curl -X GET "http://localhost:3111/api/testimonials?city_id=3"

# Filter by event
curl -X GET "http://localhost:3111/api/testimonials?event_id=12"
```

**Expected Response:**
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
      "testimonial": "Amazing event!",
      "submitted_at": "2025-12-20",
      "status": "Published",
      "image_url": "...",
      "priority": 10,
      "is_active": 1,
      "created_at": "2025-12-20T06:30:00.000Z",
      "updated_at": "2025-12-20T06:30:00.000Z"
    }
  ],
  "meta": {
    "limit": 20,
    "offset": 0,
    "total": 42
  }
}
```

---

### 2. Get Single Testimonial (Public)

```bash
# Replace 123 with actual testimonial ID
curl -X GET "http://localhost:3111/api/testimonials/123"
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "id": 123,
    "name": "Sahana Kumar",
    "city_id": 3,
    "city_name": "Bangalore",
    "event_id": 12,
    "event_name": "Winter Carnival 2025",
    "rating": 5,
    "testimonial": "Amazing event!",
    "submitted_at": "2025-12-20",
    "status": "Published",
    "image_url": "...",
    "priority": 10,
    "is_active": 1
  }
}
```

---

### 3. Create Testimonial (Protected)

```bash
# Replace YOUR_TOKEN with actual Bearer token
curl -X POST "http://localhost:3111/api/testimonials" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "city_id": 3,
    "event_id": 12,
    "rating": 5,
    "testimonial": "This was an amazing experience!",
    "status": "Pending",
    "priority": 5,
    "is_active": 1
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Testimonial created",
  "id": 125,
  "data": {
    "id": 125,
    "name": "Test User",
    "city_id": 3,
    "event_id": 12,
    "rating": 5,
    "testimonial": "This was an amazing experience!",
    "submitted_at": "2025-12-20",
    "status": "Pending",
    "priority": 5,
    "is_active": 1,
    "created_at": "2025-12-20T10:00:00.000Z",
    "updated_at": "2025-12-20T10:00:00.000Z"
  }
}
```

---

### 4. Update Testimonial (Protected)

```bash
# Partial update - only change status and priority
curl -X PUT "http://localhost:3111/api/testimonials/125" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "Published",
    "priority": 10
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Testimonial updated"
}
```

---

### 5. Delete Testimonial (Protected)

```bash
# Replace 125 with actual testimonial ID
curl -X DELETE "http://localhost:3111/api/testimonials/125" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Testimonial deleted"
}
```

---

## Error Testing

### 1. Test Unauthorized Access (no token)
```bash
curl -X POST "http://localhost:3111/api/testimonials" \
  -H "Content-Type: application/json" \
  -d '{"name": "Test"}'
```

**Expected Response:** `401 Unauthorized`
```json
{
  "success": false,
  "message": "Unauthorized"
}
```

### 2. Test Invalid Rating
```bash
curl -X POST "http://localhost:3111/api/testimonials" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "rating": 10
  }'
```

**Expected Response:** `400 Bad Request`
```json
{
  "success": false,
  "message": "rating must be between 1 and 5"
}
```

### 3. Test Missing Required Field
```bash
curl -X POST "http://localhost:3111/api/testimonials" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "rating": 5
  }'
```

**Expected Response:** `400 Bad Request`
```json
{
  "success": false,
  "message": "name is required"
}
```

### 4. Test Invalid ID
```bash
curl -X GET "http://localhost:3111/api/testimonials/invalid"
```

**Expected Response:** `400 Bad Request`
```json
{
  "success": false,
  "message": "Invalid testimonial ID"
}
```

### 5. Test Non-Existent Testimonial
```bash
curl -X GET "http://localhost:3111/api/testimonials/99999"
```

**Expected Response:** `404 Not Found`
```json
{
  "success": false,
  "message": "Testimonial not found"
}
```

---

## Testing in Browser Console

### Get All Testimonials
```javascript
fetch('/api/testimonials')
  .then(res => res.json())
  .then(data => console.log(data));
```

### Get Single Testimonial
```javascript
fetch('/api/testimonials/123')
  .then(res => res.json())
  .then(data => console.log(data));
```

### Create Testimonial (with auth)
```javascript
const token = sessionStorage.getItem('token');

fetch('/api/testimonials', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    name: 'Browser Test',
    rating: 5,
    testimonial: 'Testing from browser',
    status: 'Pending'
  })
})
  .then(res => res.json())
  .then(data => console.log(data));
```

### Update Testimonial
```javascript
const token = sessionStorage.getItem('token');

fetch('/api/testimonials/123', {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    status: 'Published'
  })
})
  .then(res => res.json())
  .then(data => console.log(data));
```

### Delete Testimonial
```javascript
const token = sessionStorage.getItem('token');

fetch('/api/testimonials/123', {
  method: 'DELETE',
  headers: {
    'Authorization': `Bearer ${token}`
  }
})
  .then(res => res.json())
  .then(data => console.log(data));
```

---

## Admin Page Testing

1. Navigate to: `http://localhost:3111/admin/testimonials`
2. Login with employee credentials
3. Test operations:
   - ✅ View all testimonials
   - ✅ Create new testimonial
   - ✅ Edit existing testimonial
   - ✅ Change testimonial status
   - ✅ Delete testimonial

---

## Checklist

- [ ] Public endpoints work without authentication
- [ ] Protected endpoints require Bearer token
- [ ] List endpoint returns data with city_name and event_name
- [ ] Single get endpoint works
- [ ] Create validates required fields
- [ ] Update allows partial updates
- [ ] Delete works correctly
- [ ] Rating validation (1-5) works
- [ ] Status changes work
- [ ] Admin page integrates correctly
- [ ] Error messages are clear and helpful

---

## Common Issues

### Issue: "Unauthorized" even with token
**Solution:** Check token format. Must be `Bearer {token}`, not just `{token}`

### Issue: "BACKEND_URL not found"
**Solution:** Ensure `.env` file has `BACKEND_URL=http://localhost:3004` and restart server

### Issue: "Failed to fetch testimonials"
**Solution:** Check if backend API at BACKEND_URL is running and accessible

**Note:** If the backend is unreachable, the Next.js proxy will return **503** with a JSON body like `{ "success": false, "message": "Backend unreachable", "data": [] }`. Public pages should fall back to sample testimonials or show an empty list. Administrators trying to refresh data should start the backend and retry.

### Issue: City/Event names not showing
**Solution:** Ensure external API returns these fields or implement join logic

---

**Testing Date:** December 20, 2025  
**API Version:** 1.0  
**Base URL:** http://localhost:3111/api/testimonials
