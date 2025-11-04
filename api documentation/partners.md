Here’s a clear Postman documentation for testing your **Partners CRUD API** built in n8n with PostgreSQL. I’ve broken it down endpoint by endpoint.

---

## **Base URL**

Your n8n webhook base URL is:

```
https://ai.nibog.in/webhook
```

**Note:** All partner endpoints use this base URL directly without `/v1/nibog` prefix.

---

## **1. Create Partner**

* **Method:** POST
* **Endpoint:** `/partners/create`
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

---

## **2. Get All Active Partners**

* **Method:** GET
* **Endpoint:** `/partners`

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

---

## **3. Get Partner by ID**

* **Method:** POST
* **Endpoint:** `/partners/get_single`
* **Body Type:** JSON (raw)

**Request Body Example:**

```json
{
  "id": 1
}


**Example URL:**

```
http://ai.nibog.in/webhook/partners/get_single
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

---

## **4. Update Partner**

* **Method:** POST
* **Endpoint:** `/partners/update`
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

---

## **5. Delete Partner**

* **Method:** POST
* **Endpoint:** `/partners/delete`
* **Body Type:** JSON (raw)

**Important:** This endpoint uses POST method (not DELETE) to avoid CORS preflight issues.

**Request Body Example:**

```json
{
  "id": 1
}
```

**Example URL:**

```
https://ai.nibog.in/webhook/partners/delete
```

**Example URL:**

```

https://ai.nibog.in/webhook/partners/delete
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

---

### **Tips for Testing in Postman**

1. For **POST** and **PUT**, set **Body → raw → JSON**.
2. For **GET** and **DELETE**, you only need the URL with the ID if applicable.
3. Ensure your n8n workflow is **activated**, otherwise the webhook endpoints won’t work.
4. You can chain tests using Postman’s **Environment Variables**, e.g., store `id` from creation to use in GET/PUT/DELETE.

---

If you want, I can also **create a ready-to-import Postman collection JSON** for this CRUD API so you can test all endpoints instantly.

Do you want me to do that?
