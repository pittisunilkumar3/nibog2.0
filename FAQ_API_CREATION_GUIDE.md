# How to Create FAQ API Endpoint in n8n

## Current Status

❌ **FAQ API endpoint does not exist yet**
- URL: `https://ai.nibog.in/webhook/v1/nibog/faq/get-all`
- Status: 404 - Not registered

✅ **FAQ page is working** with fallback data (25 FAQs)
- URL: `http://localhost:3111/faq`
- Shows: All FAQs without any notification

## To Enable Dynamic FAQs from Database

You need to create the FAQ API endpoint in your n8n workflow.

### Step 1: Create FAQ Table in Database

First, ensure the `faqs` table exists in your database:

```sql
CREATE TABLE faqs (
    id SERIAL PRIMARY KEY,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    category VARCHAR(100) NOT NULL,
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX idx_faqs_category ON faqs(category);
CREATE INDEX idx_faqs_is_active ON faqs(is_active);
CREATE INDEX idx_faqs_display_order ON faqs(display_order);
```

### Step 2: Add Sample FAQ Data

```sql
-- General FAQs
INSERT INTO faqs (question, answer, category, display_order, is_active) VALUES
('What is NIBOG?', 'NIBOG (New India Baby Olympic Games) is India''s biggest baby Olympic games platform, focused exclusively on conducting baby games for children aged 5 months to 12 years. We organize competitive events in 21 cities across India, providing a platform for children to showcase their abilities, build confidence, and have fun.', 'General', 1, true),

('What age groups can participate in NIBOG events?', 'NIBOG events are designed for children aged 5 months to 7 years. Different events have specific age categories, and children can only participate in events appropriate for their age group. The age of the child on the event date will be considered for determining eligibility.', 'General', 2, true),

('Where are NIBOG events held?', 'NIBOG events are currently held in 21 cities across India, including Hyderabad, Bangalore, Mumbai, Delhi, Chennai, Kolkata, Pune, Ahmedabad, and more. Events are typically held in indoor stadiums, sports complexes, or large event venues to ensure comfort and safety for all participants.', 'General', 3, true);

-- Add more FAQs for other categories...
```

### Step 3: Create n8n Workflow for FAQ API

#### In n8n Dashboard:

1. **Create New Workflow**
   - Name: "FAQ API - Get All"

2. **Add Webhook Node**
   - **Webhook URL**: `/v1/nibog/faq/get-all`
   - **Method**: `GET`
   - **Response Mode**: "When Last Node Finishes"
   - **Response**: "Respond to Webhook"

3. **Add Postgres Node** (or your database)
   - **Operation**: `Execute Query`
   - **Query**:
   ```sql
   SELECT 
     id,
     question,
     answer,
     category,
     display_order,
     is_active,
     created_at,
     updated_at
   FROM faqs
   WHERE is_active = true
   ORDER BY category, display_order;
   ```

4. **Add Function Node** (Optional - for formatting)
   ```javascript
   // Format the response
   const faqs = items.map(item => item.json);
   
   return [{
     json: faqs
   }];
   ```

5. **Add Respond to Webhook Node**
   - **Response**: Connect from previous node
   - **Status Code**: 200

6. **Activate the Workflow**
   - Toggle the workflow to "Active"

### Step 4: Test the API Endpoint

```powershell
# Test with PowerShell
Invoke-WebRequest -Uri "https://ai.nibog.in/webhook/v1/nibog/faq/get-all" -Method GET
```

Expected Response:
```json
[
  {
    "id": 1,
    "question": "What is NIBOG?",
    "answer": "NIBOG (New India Baby Olympic Games) is...",
    "category": "General",
    "display_order": 1,
    "is_active": true,
    "created_at": "2024-01-15T10:00:00Z",
    "updated_at": "2024-01-15T10:00:00Z"
  },
  ...
]
```

### Step 5: Alternative - Quick Copy from Existing API

If you already have similar APIs (like testimonials), you can duplicate and modify:

1. **Duplicate Testimonials Workflow**
2. **Rename to FAQ**
3. **Change Webhook URL** to `/v1/nibog/faq/get-all`
4. **Update SQL Query** to select from `faqs` table
5. **Activate**

## n8n Workflow Structure

```
┌─────────────────┐
│  Webhook Node   │
│  GET /v1/nibog/ │
│  faq/get-all    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Postgres Node  │
│  SELECT * FROM  │
│  faqs WHERE     │
│  is_active=true │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Function Node  │
│  Format Data    │
│  (Optional)     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Respond Node   │
│  Return JSON    │
└─────────────────┘
```

## What Happens After Creating the API

Once the FAQ API is created and active:

1. **Automatic Detection**
   - FAQ page will try to fetch from API
   - API will return data successfully
   - Fallback data will NOT be used

2. **Dynamic Content**
   - FAQs displayed from database
   - Can be managed via admin panel
   - Updates appear immediately

3. **No Code Changes**
   - FAQ page already configured
   - Service layer ready
   - Just need to activate n8n workflow

## Current FAQ Page Behavior

**Right Now:**
```
1. Page loads
2. Tries API: https://ai.nibog.in/webhook/v1/nibog/faq/get-all
3. Gets 404 (not found)
4. Uses fallback data (25 FAQs)
5. Displays perfectly ✅
6. No notification shown ✅
```

**After Creating API:**
```
1. Page loads
2. Tries API: https://ai.nibog.in/webhook/v1/nibog/faq/get-all
3. Gets 200 (success) ✅
4. Uses API data
5. Displays dynamically ✅
```

## Quick Reference

### Endpoints Needed:

| Endpoint | Method | Status | Purpose |
|----------|--------|--------|---------|
| `/v1/nibog/faq/get-all` | GET | ❌ Need to create | Get all active FAQs |
| `/v1/nibog/faq/create` | POST | ❌ Need to create | Create new FAQ |
| `/v1/nibog/faq/update` | POST | ❌ Need to create | Update FAQ |
| `/v1/nibog/faq/delete` | POST | ❌ Need to create | Delete FAQ |

### Priority:
Create **`/v1/nibog/faq/get-all`** first - this is what the FAQ page uses.

## Files Already Ready

✅ All frontend files are ready:
- `services/faqService.ts` - Service layer configured
- `config/api.ts` - API endpoints defined
- `app/(main)/faq/page.tsx` - FAQ page ready
- `app/admin/faq/page.tsx` - Admin panel exists

**Only missing**: n8n webhook endpoint for FAQ API

---

## Summary

**Current Status**: FAQ page works perfectly with fallback data, no notification shown

**To Enable API**: Create the n8n workflow for `/v1/nibog/faq/get-all` endpoint

**Benefit**: Manage FAQs dynamically through admin panel instead of code changes

**Impact**: Zero - page works now, will work better with API later
