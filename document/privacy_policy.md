# Privacy Policy API Documentation

## Base URL
```
http://localhost:3004/api/privacy-policy
```

---

## 1. Get Privacy Policy


**GET** `/api/privacy-policy`


### Success Response
```
{
  "success": true,
  "policy": {
    "id": 1,
    "policy_text": "...",
    "updated_at": "2025-12-14T12:00:00.000Z"
  }
}
```

### Error Response
```
{
  "success": false,
  "message": "Privacy policy not found"
}
```

---

## 2. Update Privacy Policy


**PUT** `/api/privacy-policy`

### Headers
```
Authorization: Bearer <JWT_TOKEN>
```

### Request Body (JSON)
```
{
  "policy_text": "New privacy policy text here."
}
```

### Success Response
```
{
  "success": true,
  "message": "Privacy policy updated successfully"
}
```

### Error Response
```
{
  "success": false,
  "message": "policy_text is required"
}
```

---

## Implementation Notes
- All privacy policy logic is handled in `model/PrivacyPolicyModel.js` and `controller/privacyPolicyController.js`.
- The GET endpoint returns the latest privacy policy.
- The PUT endpoint creates a new version of the privacy policy.
- Protect the PUT endpoint with authentication/authorization in production.
