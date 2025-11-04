# N8N CORS Configuration Fix for DELETE Endpoint

## Problem
```
Access to fetch at 'https://ai.nibog.in/webhook/partners/delete' from origin 'http://localhost:3111' 
has been blocked by CORS policy: Response to preflight request doesn't pass access control check: 
No 'Access-Control-Allow-Origin' header is present on the requested resource.
```

## Root Cause
- The DELETE endpoint in n8n is not configured to handle **CORS preflight requests**
- Browsers send an OPTIONS request before DELETE/PUT/PATCH requests
- Your n8n webhook needs to respond to OPTIONS requests with proper CORS headers

## Solution: Configure CORS in n8n Webhook

### Step 1: Open DELETE Workflow in n8n
1. Go to https://ai.nibog.in
2. Navigate to your **Partners Delete** workflow
3. Find the **Webhook** node that triggers the workflow

### Step 2: Configure Webhook to Handle OPTIONS Request

**Option A: Enable CORS in Webhook Node Settings**

1. Click on the **Webhook** node
2. Scroll down to **Options**
3. Enable **CORS**:
   - **Allowed Origins**: `*` (or `http://localhost:3111,https://yourdomain.com`)
   - **Allowed Methods**: `DELETE, OPTIONS`
   - **Allowed Headers**: `Content-Type`
   - **Credentials**: Enable if needed

**Option B: Manual CORS Configuration (If Option A not available)**

Add a **Function** node right after the Webhook node to handle OPTIONS:

```javascript
// Check if this is a preflight OPTIONS request
if ($node["Webhook"].json.method === "OPTIONS") {
  return {
    json: {},
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'DELETE, OPTIONS, POST, GET',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '86400'
    },
    statusCode: 200
  };
}

// For actual DELETE requests, continue normal flow
return $input.all();
```

### Step 3: Add CORS Headers to Response

In your **Respond to Webhook** node (or final response node):

1. Click on the node that sends the response
2. Add these headers in **Response Headers**:
   ```
   Access-Control-Allow-Origin: *
   Access-Control-Allow-Methods: DELETE, OPTIONS, POST, GET
   Access-Control-Allow-Headers: Content-Type
   ```

### Step 4: Complete Workflow Structure

Your DELETE workflow should look like this:

```
Webhook (DELETE) 
    ↓
Function (Handle OPTIONS) ← ADD THIS
    ↓
IF (Check if OPTIONS)
    ├─ YES → Respond with CORS headers (200 OK)
    └─ NO → Continue to deletion logic
           ↓
       PostgreSQL (DELETE)
           ↓
       Respond to Webhook (with CORS headers)
```

## Detailed n8n Configuration

### Webhook Node Configuration
```json
{
  "httpMethod": "DELETE",
  "path": "partners/delete",
  "responseMode": "responseNode",
  "options": {
    "allowedOrigins": "*",
    "allowedMethods": "DELETE,OPTIONS",
    "allowedHeaders": "Content-Type"
  }
}
```

### Function Node (Handle OPTIONS)
```javascript
// Handle CORS preflight
const method = $node["Webhook"].json.method || 
                $node["Webhook"].json.headers['access-control-request-method'];

if (method === "OPTIONS") {
  return [{
    json: { message: "CORS preflight successful" },
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'DELETE, OPTIONS, POST, GET',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400'
    }
  }];
}

// For actual DELETE, pass through
return $input.all();
```

### Respond to Webhook Node
Add these headers:
```
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: DELETE, OPTIONS
Access-Control-Allow-Headers: Content-Type
```

## Alternative: Quick Fix Using HTTP Response Node

If you want a simpler approach:

1. Add an **IF** node after the Webhook
2. Condition: `{{ $node["Webhook"].json.method === "OPTIONS" }}`
3. **TRUE branch**: Add **Respond to Webhook** node with:
   - Status Code: `200`
   - Headers:
     ```
     Access-Control-Allow-Origin: *
     Access-Control-Allow-Methods: DELETE, OPTIONS
     Access-Control-Allow-Headers: Content-Type
     ```
   - Body: `{"success": true}`

4. **FALSE branch**: Your existing DELETE logic

## Testing After Fix

### Test 1: OPTIONS Request (Preflight)
```bash
curl -X OPTIONS https://ai.nibog.in/webhook/partners/delete \
  -H "Access-Control-Request-Method: DELETE" \
  -H "Access-Control-Request-Headers: Content-Type" \
  -H "Origin: http://localhost:3111" \
  -v
```

**Expected Response:**
```
HTTP/1.1 200 OK
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: DELETE, OPTIONS
Access-Control-Allow-Headers: Content-Type
```

### Test 2: Actual DELETE Request
```bash
curl -X DELETE https://ai.nibog.in/webhook/partners/delete \
  -H "Content-Type: application/json" \
  -H "Origin: http://localhost:3111" \
  -d '{"id": 1}' \
  -v
```

**Expected Response:**
```
HTTP/1.1 200 OK
Access-Control-Allow-Origin: *
{
  "success": true,
  "message": "Partner deleted successfully"
}
```

## Apply Same Fix to All Endpoints

Make sure ALL your partner endpoints have CORS configured:
- ✅ GET `/partners` 
- ✅ POST `/partners/create`
- ✅ POST `/partners/update`
- ❌ DELETE `/partners/delete` ← **FIX THIS**

## Production Considerations

### Security: Restrict Origins
Instead of `*`, use specific domains in production:
```
Access-Control-Allow-Origin: https://yourdomain.com
```

Or allow multiple origins:
```javascript
const allowedOrigins = [
  'http://localhost:3111',
  'https://yourdomain.com',
  'https://www.yourdomain.com'
];

const origin = $node["Webhook"].json.headers.origin;
const allowOrigin = allowedOrigins.includes(origin) ? origin : allowedOrigins[0];

return {
  headers: {
    'Access-Control-Allow-Origin': allowOrigin,
    'Access-Control-Allow-Credentials': 'true'
  }
};
```

## Summary

The DELETE endpoint is failing because:
1. ❌ Browser sends OPTIONS preflight request
2. ❌ n8n webhook doesn't respond to OPTIONS
3. ❌ Browser blocks the actual DELETE request
4. ❌ Frontend receives CORS error

**Fix by adding:**
1. ✅ Handle OPTIONS method in webhook
2. ✅ Return CORS headers in OPTIONS response
3. ✅ Return CORS headers in DELETE response
4. ✅ Test both OPTIONS and DELETE requests

## Next Steps

1. **Immediate**: Fix DELETE endpoint CORS in n8n (5 minutes)
2. **Verify**: Test OPTIONS request returns CORS headers
3. **Test**: Try deleting a partner from admin page
4. **Apply**: Add same CORS config to UPDATE endpoint
5. **Document**: Update API documentation with CORS info

---

**Need Help?** 
- Check n8n documentation: https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.webhook/
- Test CORS: https://www.test-cors.org/
