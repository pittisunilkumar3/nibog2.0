# Terms and Conditions API Documentation

## Base URL
```
http://localhost:3004/api/terms
```

---

## 1. Get Terms and Conditions

**GET** `/api/terms`


### Success Response
```
{
  "success": true,
  "terms": {
    "id": 1,
    "terms_text": "...",
    "updated_at": "2025-12-14T12:00:00.000Z"
  }
}
```

### Error Response
```
{
  "success": false,
  "message": "Terms and conditions not found"
}
```

---

## 2. Update Terms and Conditions

**PUT** `/api/terms`

### Headers
```
Authorization: Bearer <JWT_TOKEN>
```

### Request Body (JSON)
```
{
  "terms_text": "New terms and conditions text here."
}
```

### Success Response
```
{
  "success": true,
  "message": "Terms and conditions updated successfully"
}
```

### Error Response
```
{
  "success": false,
  "message": "terms_text is required"
}
```

---

## Implementation Notes
- All terms and conditions logic is handled in `model/TermsModel.js` and `controller/termsController.js`.
- The GET endpoint returns the latest terms and conditions.
- The PUT endpoint creates a new version of the terms and conditions.
- Both endpoints require authentication with a Bearer token.
