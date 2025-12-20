# User API Documentation

## Base URL
```
http://localhost:3004/api/user
```

---

## Endpoints

### 1. Register User
**POST** `/api/user/register`

**Description:** Register a new user.



**Request Body:**
```json
{
  "full_name": "John Doe",
  "email": "john@example.com",
  "password": "yourpassword",
  "phone": "1234567890",
  // city_id is optional
}
```

**Note:**
- `city_id` is optional. If not provided, the user will be registered without a city.

**Success Response:**
```json
{
  "success": true,
  "user": {
    "user_id": 1,
    "full_name": "John Doe",
    "email": "john@example.com",
    "email_verified": 0,
    "phone": "1234567890",
    "phone_verified": 0,
    "city_id": 1,
    "city_name": "Mumbai",
    "state": "Maharashtra",
    "accepted_terms": 0,
    "terms_accepted_at": null,
    "is_active": 1,
    "is_locked": 0,
    "locked_until": null,
    "deactivated_at": null,
    "created_at": "2025-12-14T10:00:00.000Z",
    "updated_at": "2025-12-14T10:00:00.000Z",
    "last_login_at": null
  }
}
```

**Error Response:**
```json
{
  "success": false,
  "message": "All fields are required."
}
```

---

### 2. Login
**POST** `/api/user/login`

**Description:** Login with email and password. Returns JWT token.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "yourpassword"
}
```


**Success Response:**
```json
{
  "success": true,
  "token": "<jwt_token>",
  "user": {
    "user_id": 1,
    "full_name": "John Doe",
    "email": "john@example.com",
    "email_verified": 0,
    "phone": "1234567890",
    "phone_verified": 0,
    "city_id": 1,
    "city_name": "Mumbai",
    "state": "Maharashtra",
    "accepted_terms": 0,
    "terms_accepted_at": null,
    "is_active": 1,
    "is_locked": 0,
    "locked_until": null,
    "deactivated_at": null,
    "created_at": "2025-12-14T10:00:00.000Z",
    "updated_at": "2025-12-14T10:00:00.000Z",
    "last_login_at": null
  }
}
```

**Error Response:**
```json
{
  "success": false,
  "message": "Invalid credentials."
}
```

---

### 3. Get Profile (Protected)
**GET** `/api/user/profile`

**Headers:**
```
Authorization: Bearer <jwt_token>
```


**Success Response:**
```json
{
  "success": true,
  "user": {
    "user_id": 1,
    "full_name": "John Doe",
    "email": "john@example.com",
    "email_verified": 0,
    "phone": "1234567890",
    "phone_verified": 0,
    "city_id": 1,
    "city_name": "Mumbai",
    "state": "Maharashtra",
    "accepted_terms": 0,
    "terms_accepted_at": null,
    "is_active": 1,
    "is_locked": 0,
    "locked_until": null,
    "deactivated_at": null,
    "created_at": "2025-12-14T10:00:00.000Z",
    "updated_at": "2025-12-14T10:00:00.000Z",
    "last_login_at": null
  }
}
```

**Error Response:**
```json
{
  "success": false,
  "message": "User not found."
}
```

---

## JWT Authentication
- Use the token from the login response as a Bearer token in the `Authorization` header for protected endpoints.
- Example:
```
Authorization: Bearer <jwt_token>
```
