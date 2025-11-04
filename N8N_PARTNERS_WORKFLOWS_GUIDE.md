# Quick Guide: Creating Partners API Workflows in n8n

## 🎯 Overview

You need to create **5 workflows** in n8n to make the Partners API work.

---

## 📋 Workflow 1: Partners - Create

### Nodes Configuration:

1. **Webhook (Trigger)**
   - HTTP Method: `POST`
   - Path: `v1/nibog/partners/create`
   - Response Mode: `Last Node`
   - Authentication: `None` (or as per your setup)

2. **Code Node (Validation)** - Optional but recommended
   ```javascript
   // Validate required fields
   const body = $input.item.json.body;
   
   if (!body.partner_name || !body.image_url || !body.display_priority || !body.status) {
     throw new Error('Missing required fields: partner_name, image_url, display_priority, status');
   }
   
   if (!['Active', 'Inactive'].includes(body.status)) {
     throw new Error('Status must be Active or Inactive');
   }
   
   return { json: body };
   ```

3. **PostgreSQL Node (Insert)**
   - Operation: `Execute Query`
   - Query:
   ```sql
   INSERT INTO partners (partner_name, image_url, display_priority, status, created_at)
   VALUES (
     '{{ $json.partner_name }}',
     '{{ $json.image_url }}',
     {{ $json.display_priority }},
     '{{ $json.status }}',
     CURRENT_TIMESTAMP
   )
   RETURNING *;
   ```

4. **Respond to Webhook**
   - Response Code: `200`
   - Response Body: `{{ $json }}`

---

## 📋 Workflow 2: Partners - Get All

### Nodes Configuration:

1. **Webhook (Trigger)**
   - HTTP Method: `GET`
   - Path: `v1/nibog/partners`
   - Response Mode: `Last Node`

2. **PostgreSQL Node (Select)**
   - Operation: `Execute Query`
   - Query:
   ```sql
   SELECT id, partner_name, image_url, display_priority, status, created_at, updated_at
   FROM partners
   WHERE status = 'Active'
   ORDER BY display_priority ASC, created_at DESC;
   ```

3. **Respond to Webhook**
   - Response Code: `200`
   - Response Body: `{{ $json }}`

---

## 📋 Workflow 3: Partners - Get By ID

### Nodes Configuration:

1. **Webhook (Trigger)**
   - HTTP Method: `GET`
   - Path: `v1/nibog/partners/:id`
   - Response Mode: `Last Node`

2. **Code Node (Extract ID)**
   ```javascript
   const id = $input.params.id;
   return { json: { id: parseInt(id) } };
   ```

3. **PostgreSQL Node (Select)**
   - Operation: `Execute Query`
   - Query:
   ```sql
   SELECT id, partner_name, image_url, display_priority, status, created_at, updated_at
   FROM partners
   WHERE id = {{ $json.id }};
   ```

4. **IF Node (Check if found)**
   - Condition: `{{ $json.length > 0 }}`

5a. **Respond to Webhook (Success - True Branch)**
   - Response Code: `200`
   - Response Body: `{{ $json[0] }}`

5b. **Respond to Webhook (Not Found - False Branch)**
   - Response Code: `404`
   - Response Body: `{ "error": "Partner not found" }`

---

## 📋 Workflow 4: Partners - Update

### Nodes Configuration:

1. **Webhook (Trigger)**
   - HTTP Method: `PUT`
   - Path: `v1/nibog/partners/update`
   - Response Mode: `Last Node`

2. **Code Node (Validation)**
   ```javascript
   const body = $input.item.json.body;
   
   if (!body.id) {
     throw new Error('Partner ID is required');
   }
   
   return { json: body };
   ```

3. **PostgreSQL Node (Update)**
   - Operation: `Execute Query`
   - Query:
   ```sql
   UPDATE partners
   SET 
     partner_name = '{{ $json.partner_name }}',
     image_url = '{{ $json.image_url }}',
     display_priority = {{ $json.display_priority }},
     status = '{{ $json.status }}',
     updated_at = CURRENT_TIMESTAMP
   WHERE id = {{ $json.id }}
   RETURNING *;
   ```

4. **IF Node (Check if updated)**
   - Condition: `{{ $json.length > 0 }}`

5a. **Respond to Webhook (Success - True Branch)**
   - Response Code: `200`
   - Response Body: `{{ $json[0] }}`

5b. **Respond to Webhook (Not Found - False Branch)**
   - Response Code: `404`
   - Response Body: `{ "error": "Partner not found or not updated" }`

---

## 📋 Workflow 5: Partners - Delete

### Nodes Configuration:

1. **Webhook (Trigger)**
   - HTTP Method: `DELETE`
   - Path: `v1/nibog/partners/:id`
   - Response Mode: `Last Node`

2. **Code Node (Extract ID)**
   ```javascript
   const id = $input.params.id;
   return { json: { id: parseInt(id) } };
   ```

3. **PostgreSQL Node (Delete)**
   - Operation: `Execute Query`
   - Query:
   ```sql
   DELETE FROM partners
   WHERE id = {{ $json.id }}
   RETURNING *;
   ```

4. **IF Node (Check if deleted)**
   - Condition: `{{ $json.length > 0 }}`

5a. **Respond to Webhook (Success - True Branch)**
   - Response Code: `200`
   - Response Body: `{{ $json[0] }}`

5b. **Respond to Webhook (Not Found - False Branch)**
   - Response Code: `404`
   - Response Body: `{ "error": "Partner not found" }`

---

## 🔧 PostgreSQL Connection Settings

Make sure your PostgreSQL node is configured with:
- **Host:** Your database host
- **Database:** Your database name (probably `nibog`)
- **User:** Your database user
- **Password:** Your database password
- **SSL:** As per your setup

---

## ✅ Activation Checklist

After creating each workflow:

1. ✅ Click "Execute Workflow" to test
2. ✅ Fix any errors shown
3. ✅ Click the toggle in top-right to **ACTIVATE** the workflow
4. ✅ Workflow status should show **"Active"** in green
5. ✅ Webhook URL should be visible and accessible

---

## 🧪 Testing After Activation

Run this command to test:
```bash
node test-partners-api-v2.js
```

**Expected Results:**
- ✅ All tests should pass (except those expecting errors)
- ✅ You should see partner data with IDs in responses
- ✅ Create, Read, Update, Delete should all work

---

## 📞 Common Issues

### Issue: "Webhook not registered"
**Solution:** Workflow is not activated. Click the toggle!

### Issue: "Database connection failed"
**Solution:** Check PostgreSQL credentials in n8n settings

### Issue: "Syntax error in SQL"
**Solution:** Check for single quotes vs double curly braces in SQL

### Issue: "Cannot read property 'body'"
**Solution:** Webhook node might not be parsing JSON. Check webhook settings.

---

## 🎯 Quick Copy: Database Table

If the table doesn't exist:

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

-- Create index for better performance
CREATE INDEX idx_partners_status ON partners(status);
CREATE INDEX idx_partners_priority ON partners(display_priority);

-- Insert sample data for testing
INSERT INTO partners (partner_name, image_url, display_priority, status)
VALUES 
  ('Partner 1', 'https://example.com/partner1.png', 1, 'Active'),
  ('Partner 2', 'https://example.com/partner2.png', 2, 'Active'),
  ('Partner 3', 'https://example.com/partner3.png', 3, 'Active');
```

---

## ⚡ Pro Tips

1. **Copy Existing Workflows:** If you have working workflows for Events or Games, duplicate them and modify for Partners
2. **Test Mode:** Use n8n's "Test" button before activating
3. **Error Handling:** Add error handling nodes for production
4. **Logging:** Add "Set" nodes to log requests for debugging
5. **Version Control:** Export workflows as JSON for backup

---

**Need Help?** Check your existing NIBOG API workflows (Events, Games, etc.) - they should have the same structure!
