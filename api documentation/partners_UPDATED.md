# Partners CRUD API Documentation

Complete API documentation for testing Partners CRUD operations built in n8n with PostgreSQL.

---

## **Base URL**

```
https://ai.nibog.in/webhook
```

**⚠️ Important Note:**  
- All partner endpoints use this base URL **without** `/v1/nibog` prefix
- Discovered working path: `https://ai.nibog.in/webhook/partners/*`

---

## **API Status**

✅ **Working:** Endpoints are accessible and activated  
⚠️ **Issue:** Workflow needs configuration (see PARTNERS_API_FIX_REQUIRED.md)

**Current State:**
- GET requests return empty arrays
- POST requests return "Workflow was started" instead of data
- Fix required: Configure "Respond to Webhook" node in n8n

---

## **1. Create Partner**

* **Method:** `POST`
* **Endpoint:** `/partners/create`
* **Full URL:** `https://ai.nibog.in/webhook/partners/create`
* **Body Type:** JSON (raw)

**Request Body Example:**

```json
{
  "partner_name": "Partner A",
  "image_url": "https://example.com/image.jpg",
  "display_priority": 1,
  "status": "Active"
}
```

**Success Response Example (200 OK):**

```json
{
  "id": 1,
  "partner_name": "Partner A",
  "image_url": "https://example.com/image.jpg",
  "display_priority": 1,
  "status": "Active",
  "created_at": "2025-10-14T11:20:30.123Z",
  "updated_at": null
}
```

**Current Response (Needs Fix):**
```json
{
  "message": "Workflow was started"
}
```

**cURL Example:**
```bash
curl -X POST https://ai.nibog.in/webhook/partners/create \
  -H "Content-Type: application/json" \
  -d '{
    "partner_name": "Partner A",
    "image_url": "https://example.com/image.jpg",
    "display_priority": 1,
    "status": "Active"
  }'
```

---

## **2. Get All Active Partners**

* **Method:** `GET`
* **Endpoint:** `/partners`
* **Full URL:** `https://ai.nibog.in/webhook/partners`

**Success Response Example (200 OK):**

```json
[
  {
    "id": 1,
    "partner_name": "Partner A",
    "image_url": "https://example.com/image.jpg",
    "display_priority": 1,
    "status": "Active",
    "created_at": "2025-10-14T11:20:30.123Z",
    "updated_at": null
  },
  {
    "id": 2,
    "partner_name": "Partner B",
    "image_url": "https://example.com/image2.jpg",
    "display_priority": 2,
    "status": "Active",
    "created_at": "2025-10-14T12:00:00.123Z",
    "updated_at": null
  }
]
```

**Current Response:**
```json
[]
```

**cURL Example:**
```bash
curl -X GET https://ai.nibog.in/webhook/partners
```

---

## **3. Get Partner by ID**

* **Method:** `GET`
* **Endpoint:** `/partners/:id`
* **Full URL:** `https://ai.nibog.in/webhook/partners/:id`
* **Path Parameter:** `id` → Partner ID to fetch

**Example URL:**

```
https://ai.nibog.in/webhook/partners/1
```

**Success Response Example (200 OK):**

```json
{
  "id": 1,
  "partner_name": "Partner A",
  "image_url": "https://example.com/image.jpg",
  "display_priority": 1,
  "status": "Active",
  "created_at": "2025-10-14T11:20:30.123Z",
  "updated_at": null
}
```

**cURL Example:**
```bash
curl -X GET https://ai.nibog.in/webhook/partners/1
```

---

## **4. Update Partner**

* **Method:** `PUT`
* **Endpoint:** `/partners/update`
* **Full URL:** `https://ai.nibog.in/webhook/partners/update`
* **Body Type:** JSON (raw)

**Request Body Example:**

```json
{
  "id": 1,
  "partner_name": "Partner A Updated",
  "image_url": "https://example.com/new-image.jpg",
  "display_priority": 1,
  "status": "Active"
}
```

**Success Response Example (200 OK):**

```json
{
  "id": 1,
  "partner_name": "Partner A Updated",
  "image_url": "https://example.com/new-image.jpg",
  "display_priority": 1,
  "status": "Active",
  "created_at": "2025-10-14T11:20:30.123Z",
  "updated_at": "2025-10-14T15:50:00.123Z"
}
```

**cURL Example:**
```bash
curl -X PUT https://ai.nibog.in/webhook/partners/update \
  -H "Content-Type: application/json" \
  -d '{
    "id": 1,
    "partner_name": "Partner A Updated",
    "image_url": "https://example.com/new-image.jpg",
    "display_priority": 1,
    "status": "Active"
  }'
```

---

## **5. Delete Partner**

* **Method:** `DELETE`
* **Endpoint:** `/partners/:id`
* **Full URL:** `https://ai.nibog.in/webhook/partners/:id`
* **Path Parameter:** `id` → Partner ID to delete

**Example URL:**

```
https://ai.nibog.in/webhook/partners/1
```

**Success Response Example (200 OK):**

```json
{
  "id": 1,
  "partner_name": "Partner A Updated",
  "image_url": "https://example.com/new-image.jpg",
  "display_priority": 1,
  "status": "Active",
  "created_at": "2025-10-14T11:20:30.123Z",
  "updated_at": "2025-10-14T15:50:00.123Z"
}
```

**cURL Example:**
```bash
curl -X DELETE https://ai.nibog.in/webhook/partners/1
```

---

## **Testing in Postman**

### Quick Setup

1. **Create a new collection** called "Partners API"
2. **Set collection variable:**
   - Variable: `base_url`
   - Value: `https://ai.nibog.in/webhook`

3. **Create 5 requests:**

#### Request 1: Get All Partners
- Method: GET
- URL: `{{base_url}}/partners`

#### Request 2: Create Partner
- Method: POST
- URL: `{{base_url}}/partners/create`
- Body (raw JSON):
```json
{
  "partner_name": "Test Partner",
  "image_url": "https://example.com/logo.png",
  "display_priority": 1,
  "status": "Active"
}
```
- Tests (to save ID):
```javascript
let response = pm.response.json();
if (response.id) {
    pm.collectionVariables.set("partner_id", response.id);
}
```

#### Request 3: Get Partner by ID
- Method: GET
- URL: `{{base_url}}/partners/{{partner_id}}`

#### Request 4: Update Partner
- Method: PUT
- URL: `{{base_url}}/partners/update`
- Body (raw JSON):
```json
{
  "id": {{partner_id}},
  "partner_name": "Updated Partner Name",
  "image_url": "https://example.com/updated-logo.png",
  "display_priority": 2,
  "status": "Active"
}
```

#### Request 5: Delete Partner
- Method: DELETE
- URL: `{{base_url}}/partners/{{partner_id}}`

---

## **Database Schema**

The `partners` table should have the following structure:

```sql
CREATE TABLE IF NOT EXISTS partners (
  id SERIAL PRIMARY KEY,
  partner_name VARCHAR(255) NOT NULL,
  image_url TEXT NOT NULL,
  display_priority INTEGER DEFAULT 1,
  status VARCHAR(50) DEFAULT 'Active' CHECK (status IN ('Active', 'Inactive')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT NULL
);

-- Indexes for better performance
CREATE INDEX idx_partners_status ON partners(status);
CREATE INDEX idx_partners_priority ON partners(display_priority);
```

---

## **Testing Scripts**

### Automated Testing

Run the comprehensive test suite:

```bash
# Full test with diagnostics
node test-partners-api-final.js

# Quick path discovery
node find-partner-api-path.js

# Database diagnostic
node diagnose-partners-api.js
```

### Expected Test Results (After Fix)

```
✅ All tests should pass (100%)
✅ Create should return partner with ID
✅ GET should return created partners
✅ Update should modify partner data
✅ Delete should remove partner
```

---

## **Common Issues & Solutions**

### Issue 1: "Workflow was started" Response
**Solution:** Configure "Respond to Webhook" node in n8n  
**See:** PARTNERS_API_FIX_REQUIRED.md

### Issue 2: Empty Array Response
**Solution:** Ensure PostgreSQL INSERT is executed and table exists  
**See:** N8N_PARTNERS_WORKFLOWS_GUIDE.md

### Issue 3: 404 Not Found
**Solution:** Check workflow is activated in n8n  
**Path should be:** `/partners/*` not `/v1/nibog/partners/*`

---

## **Required n8n Workflow Configuration**

### Critical Settings:

1. **Webhook Node:**
   - Path: `partners` or `partners/create` etc.
   - Method: As specified above
   - Response Mode: **"Using 'Respond to Webhook' Node"**

2. **PostgreSQL Node:**
   - Use `RETURNING *;` in INSERT/UPDATE/DELETE queries
   - Return the affected row(s)

3. **Respond to Webhook Node:**
   - Response Code: 200
   - Response Body: `{{ $json }}` or `{{ $json[0] }}`

---

## **Status & Next Steps**

**Current Status:** ⚠️ Partially Working
- Endpoints accessible ✅
- Workflows activated ✅
- Data not being saved ❌
- Response not configured ❌

**Next Steps:**
1. Fix "Respond to Webhook" configuration
2. Verify PostgreSQL operations
3. Test with `node test-partners-api-final.js`
4. Update frontend to use the API

---

## **Support Files**

- `PARTNERS_API_FIX_REQUIRED.md` - Detailed fix instructions
- `N8N_PARTNERS_WORKFLOWS_GUIDE.md` - Workflow creation guide
- `test-partners-api-final.js` - Automated test script
- `diagnose-partners-api.js` - Diagnostic tool

---

**Last Updated:** October 14, 2025  
**API Version:** 1.0  
**Status:** In Configuration (Needs n8n fixes)
