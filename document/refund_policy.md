# Refund Policy API Documentation

## Base URL
```
http://localhost:3004/api/refund-policy
```

---

## 1. Get Refund Policy

**GET** `/api/refund-policy`


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
  "message": "Refund policy not found"
}
```

---

## 2. Update Refund Policy

**PUT** `/api/refund-policy`

### Headers
```
Authorization: Bearer <JWT_TOKEN>
```

### Request Body (JSON)
```
{
  "policy_text": "New refund policy text here."
}
```

### Success Response
```
{
  "success": true,
  "message": "Refund policy updated successfully"
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
- All refund policy logic is handled in `model/RefundPolicyModel.js` and `controller/refundPolicyController.js`.
- The GET endpoint returns the latest refund policy.
- The PUT endpoint creates a new version of the refund policy.
- Both endpoints require authentication with a Bearer token.
