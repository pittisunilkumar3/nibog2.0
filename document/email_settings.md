# Email Settings API Documentation

## Base URL
```
http://localhost:3004/api/email-settings
```


## Authentication
- `GET /api/email-settings/` is public (no authentication required)
- `PUT /api/email-settings/` requires Bearer token authentication (employee only)

---

## Endpoints


### 1. Get Email Settings (Public)
**GET** `/api/email-settings/`

**Description:**
Fetch the current email SMTP configuration. Only one row exists in the database. This endpoint is public and does not require authentication.

**Example Request:**
```bash
curl -X GET "http://localhost:3004/api/email-settings/"
```

**Success Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "smtp_host": "smtp.example.com",
    "smtp_port": 587,
    "smtp_username": "user@example.com",
    "smtp_password": "password123",
    "sender_name": "Example Sender",
    "sender_email": "sender@example.com",
    "created_at": "2025-12-14T10:00:00.000Z",
    "updated_at": "2025-12-14T10:00:00.000Z"
  }
}
```

**Error Response (Not Found):**
```json
{
  "success": false,
  "message": "Email settings not found. Please configure email settings first."
}
```

---

### 2. Update Email Settings (Protected)
**PUT** `/api/email-settings/`

**Description:**
Update the email SMTP configuration. Always updates the single existing row. If no row exists, creates a new one.

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "smtp_host": "smtp.gmail.com",
  "smtp_port": 587,
  "smtp_username": "your-email@gmail.com",
  "smtp_password": "your-app-password",
  "sender_name": "My Company",
  "sender_email": "noreply@mycompany.com"
}
```

**Field Validations:**
- `smtp_host` (required): SMTP server hostname
- `smtp_port` (required): Port number (1-65535)
- `smtp_username` (required): SMTP authentication username
- `smtp_password` (required): SMTP authentication password
- `sender_name` (required): Display name for outgoing emails
- `sender_email` (required): Email address for outgoing emails

**Example Request:**
```bash
curl -X PUT "http://localhost:3004/api/email-settings/" \
  -H "Authorization: Bearer <your_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "smtp_host": "smtp.gmail.com",
    "smtp_port": 587,
    "smtp_username": "your-email@gmail.com",
    "smtp_password": "your-app-password",
    "sender_name": "My Company",
    "sender_email": "noreply@mycompany.com"
  }'
```

**Success Response:**
```json
{
  "success": true,
  "message": "Email settings updated successfully",
  "data": {
    "id": 1,
    "smtp_host": "smtp.gmail.com",
    "smtp_port": 587,
    "smtp_username": "your-email@gmail.com",
    "smtp_password": "your-app-password",
    "sender_name": "My Company",
    "sender_email": "noreply@mycompany.com",
    "created_at": "2025-12-14T10:00:00.000Z",
    "updated_at": "2025-12-14T12:30:00.000Z"
  }
}
```

**Error Response (Validation Error):**
```json
{
  "success": false,
  "message": "All fields are required: smtp_host, smtp_port, smtp_username, smtp_password, sender_name, sender_email"
}
```

**Error Response (Invalid Port):**
```json
{
  "success": false,
  "message": "smtp_port must be between 1 and 65535"
}
```

---

## Common SMTP Configurations

### Gmail
```json
{
  "smtp_host": "smtp.gmail.com",
  "smtp_port": 587,
  "smtp_username": "your-email@gmail.com",
  "smtp_password": "your-app-password"
}
```

### Outlook/Office 365
```json
{
  "smtp_host": "smtp.office365.com",
  "smtp_port": 587,
  "smtp_username": "your-email@outlook.com",
  "smtp_password": "your-password"
}
```

### SendGrid
```json
{
  "smtp_host": "smtp.sendgrid.net",
  "smtp_port": 587,
  "smtp_username": "apikey",
  "smtp_password": "your-sendgrid-api-key"
}
```

---

## Notes
- Only one email configuration exists in the database at a time
- All endpoints require employee authentication
- The `smtp_password` is stored in plain text - ensure proper security measures
- Always test email configuration after updating settings
