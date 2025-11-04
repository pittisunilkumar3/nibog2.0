# Refund Policy API Documentation

## Base URL
```
https://ai.nibog.in/webhook/v1/nibog
```

## Endpoints

### 1. Get Refund Policy Content
**Endpoint:** `/refundpolicyget`  
**Method:** `GET`  
**Description:** Retrieve the current refund policy content

**Request:**
```http
GET https://ai.nibog.in/webhook/v1/nibog/refundpolicyget
Content-Type: application/json
```

**Response (Success - 200 OK):**
```json
[
  {
    "html_content": "<h2>1. Refund Policy Overview</h2><p>...</p>",
    "created_at": "2024-01-15T10:30:00Z"
  }
]
```

**Response (No Content - 200 OK):**
```json
[]
```

---

### 2. Save/Update Refund Policy Content
**Endpoint:** `/refundpolicy`  
**Method:** `POST`  
**Description:** Create or update refund policy content

**Request:**
```http
POST https://ai.nibog.in/webhook/v1/nibog/refundpolicy
Content-Type: application/json
```

**Request Body:**
```json
{
  "text": "<h2>1. Refund Policy Overview</h2><p>At NIBOG...</p>"
}
```

**Response (Success - 200 OK):**
```json
{
  "success": true,
  "message": "Refund policy content saved successfully"
}
```

---

## Usage in Admin Panel

The refund policy admin page is located at:
```
/admin/refund-policy
```

### Features:
- Rich text editor for content creation
- Auto-save with change tracking
- Version control
- Mobile responsive design
- Real-time preview
- Reset to default content option

### Default Content Includes:
1. Refund Policy Overview
2. Cancellation & Refund Eligibility
3. Refund Process
4. Non-Refundable Situations
5. Event Postponement or Cancellation
6. Refund Method
7. Contact Information

---

## Testing the API

### Using cURL

**Get Refund Policy:**
```bash
curl -X GET "https://ai.nibog.in/webhook/v1/nibog/refundpolicyget" \
  -H "Content-Type: application/json"
```

**Save Refund Policy:**
```bash
curl -X POST "https://ai.nibog.in/webhook/v1/nibog/refundpolicy" \
  -H "Content-Type: application/json" \
  -d '{
    "text": "<h2>Refund Policy</h2><p>Your content here...</p>"
  }'
```

### Using Node.js

```javascript
// Get Refund Policy
const getRefundPolicy = async () => {
  try {
    const response = await fetch('https://ai.nibog.in/webhook/v1/nibog/refundpolicyget', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });
    const data = await response.json();
    console.log('Refund Policy:', data);
  } catch (error) {
    console.error('Error fetching refund policy:', error);
  }
};

// Save Refund Policy
const saveRefundPolicy = async (content) => {
  try {
    const response = await fetch('https://ai.nibog.in/webhook/v1/nibog/refundpolicy', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: content
      })
    });
    const result = await response.json();
    console.log('Save result:', result);
  } catch (error) {
    console.error('Error saving refund policy:', error);
  }
};
```

---

## Notes

1. **HTML Content:** The API accepts and returns HTML formatted content
2. **Single Entry:** Only one refund policy entry is maintained (latest version)
3. **Timestamps:** The `created_at` field shows when the content was last updated
4. **Error Handling:** The admin page gracefully handles API errors and falls back to default content
5. **Auto-save:** Content changes are tracked and require manual save action

---

## Integration with Frontend

The refund policy content is displayed on the public-facing website at:
```
/refund-policy
```

The page fetches content from the API and renders it with proper styling and formatting.
