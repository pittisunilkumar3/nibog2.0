# Booking API Documentation

## Endpoints Overview


1. [Create Booking](#create-booking) - `POST /api/bookings`
2. [Edit Booking](#edit-booking) - `PATCH /api/bookings/:id`
3. [Get All Bookings](#get-all-bookings) - `GET /api/bookings`
4. [Get Single Booking](#get-single-booking) - `GET /api/bookings/:id`
5. [Get User Profile with Bookings](#get-user-profile-with-bookings) - `GET /api/bookings/user/:userId`
---

## Edit Booking

**PATCH** `/api/bookings/:id`

Edit an existing booking and its related data (parent, children, games, payment). Now supports granular editing of children and games.

### Request Example
```bash
curl -X PATCH http://localhost:3004/api/bookings/1 \
  -H "Content-Type: application/json" \
  -d '{
    "status": "Confirmed",
    "total_amount": 1999,
    "parent": { "id": 12, "name": "Sarah Williams", "email": "sarah.w@test.com", "phone": "9998887776" },
    "children": [
      {
        "child_id": 14, // update existing child
        "full_name": "Emma Williams",
        "date_of_birth": "2019-04-10",
        "gender": "Female",
        "school_name": "Green Valley School",
        "booking_games": [
          {
            "booking_game_id": 12, // update existing game
            "game_id": 1,
            "slot_id": 8,
            "game_price": 1799
          },
          {
            "game_id": 2, // add new game for this child
            "slot_id": 9,
            "game_price": 999
          }
        ],
        "delete_booking_game_ids": [13] // delete game with id 13 for this child
      },
      {
        "full_name": "New Child",
        "date_of_birth": "2020-01-01",
        "gender": "Male",
        "school_name": "ABC School",
        "booking_games": [
          { "game_id": 3, "slot_id": 10, "game_price": 500 }
        ]
      }
    ],
    "delete_child_ids": [15], // delete child with id 15
    "payment": {
      "payment_id": 7,
      "transaction_id": "TXN555444333",
      "amount": 1999,
      "payment_method": "UPI",
      "payment_status": "Paid"
    }
  }'
```

### Success Response

**200 OK**
```json
{
  "message": "Booking updated successfully",
  "data": { /* ...full updated booking object... */ }
}
```

### Error Responses

**400 Bad Request**
```json
{ "error": "Booking ID is required" }
```
**404 Not Found**
```json
{ "error": "Booking not found" }
```
**500 Internal Server Error**
```json
{ "error": "Error message describing what went wrong" }
```

### Notes
- You can update, add, or delete children and games using `child_id`, `booking_game_id`, `delete_child_ids`, and `delete_booking_game_ids`.
- If a child or game object includes its ID, it will be updated. If no ID is provided, a new record will be created.
- To delete, provide the relevant IDs in `delete_child_ids` or `delete_booking_game_ids`.
- If payment is provided, the payment record is updated.
- All relationships and foreign keys are maintained.
- Returns the full updated booking object on success.

---

## Get All Bookings

**GET** `/api/bookings`

Get a list of all bookings with complete details including parent info, event details, children, games, and payment information.

### Request Example
```bash
GET /api/bookings
```

### Success Response

**200 OK**
```json
{
  "success": true,
  "count": 2,
  "data": [
    {
      "id": 12,
      "booking_ref": "NEW2025123456",
      "status": "Confirmed",
      "total_amount": "3598.00",
      "payment_method": null,
      "payment_status": "Pending",
      "booking_date": "2025-12-21T12:14:47.000Z",
      "parent": {
        "id": 12,
        "name": "Sarah Williams",
        "email": "sarah.w@test.com",
        "phone": "9998887776",
        "user_id": null
      },
      "event": {
        "id": 5,
        "name": "Summer Fun Event",
        "date": "2025-12-31",
        "description": "Exciting games for children",
        "image_url": "event.jpg",
        "status": "Published",
        "venue": {
          "id": 2,
          "name": "Kids Arena",
          "address": "123 Test St",
          "contact": "1234567890",
          "city": "Test City",
          "state": "Test State"
        }
      },
      "children": [
        {
          "child_id": 14,
          "full_name": "Emma Williams",
          "date_of_birth": "2019-04-10",
          "gender": "Female",
          "school_name": "Green Valley School",
          "booking_games": [
            {
              "booking_game_id": 12,
              "game_price": "1799.00",
              "game_id": 1,
              "game_name": "Test Game",
              "game_description": "Test game description",
              "min_age": 1,
              "max_age": 101,
              "game_image_url": "game.png",
              "slot_id": 8,
              "slot_start_time": "10:00:00",
              "slot_end_time": "11:30:00",
              "slot_custom_title": "Test Game"
            }
          ]
        }
      ],
      "payments": [
        {
          "payment_id": 7,
          "transaction_id": "TXN555444333",
          "amount": "3598.00",
          "payment_method": "UPI",
          "payment_status": "Paid",
          "payment_date": "2025-12-21T12:14:47.000Z"
        }
      ]
    }
  ]
}
```

### Features
- Returns all bookings ordered by creation date (newest first)
- Complete parent information with contact details
- Full event details with venue information
- All children enrolled in each booking
- Game and slot details for each child
- Payment records for each booking
- Total count of bookings

---

## Get Single Booking

**GET** `/api/bookings/:id`

Get detailed information for a specific booking by its ID.

### URL Parameters
- `id` (integer, required) - The booking ID

### Request Example
```bash
GET /api/bookings/12
```

### Success Response

**200 OK**
```json
{
  "success": true,
  "data": {
    "id": 12,
    "booking_ref": "NEW2025123456",
    "status": "Confirmed",
    "total_amount": "3598.00",
    "payment_method": null,
    "payment_status": "Pending",
    "booking_date": "2025-12-21T12:14:47.000Z",
    "updated_at": "2025-12-21T12:14:47.000Z",
    "parent": {
      "id": 12,
      "name": "Sarah Williams",
      "email": "sarah.w@test.com",
      "phone": "9998887776",
      "user_id": null
    },
    "event": {
      "id": 5,
      "name": "Summer Fun Event",
      "date": "2025-12-31",
      "description": "Exciting games for children",
      "image_url": "event.jpg",
      "status": "Published",
      "venue": {
        "id": 2,
        "name": "Kids Arena",
        "address": "123 Test St",
        "contact": "1234567890",
        "city": "Test City",
        "state": "Test State"
      }
    },
    "children": [
      {
        "child_id": 14,
        "full_name": "Emma Williams",
        "date_of_birth": "2019-04-10",
        "gender": "Female",
        "school_name": "Green Valley School",
        "created_at": "2025-12-21T12:14:47.000Z",
        "updated_at": "2025-12-21T12:14:47.000Z",
        "booking_games": [
          {
            "booking_game_id": 12,
            "game_price": "1799.00",
            "booked_at": "2025-12-21T12:14:47.000Z",
            "game_id": 1,
            "game_name": "Test Game",
            "game_description": "Test game description",
            "min_age": 1,
            "max_age": 101,
            "duration_minutes": 15,
            "game_image_url": "game.png",
            "slot_id": 8,
            "slot_start_time": "10:00:00",
            "slot_end_time": "11:30:00",
            "slot_custom_title": "Test Game",
            "slot_custom_description": "Custom slot description",
            "slot_custom_price": "1799.00",
            "slot_max_participants": 12
          }
        ]
      }
    ],
    "payments": [
      {
        "payment_id": 7,
        "transaction_id": "TXN555444333",
        "amount": "3598.00",
        "payment_method": "UPI",
        "payment_status": "Paid",
        "payment_date": "2025-12-21T12:14:47.000Z",
        "payment_updated_at": "2025-12-21T12:14:47.000Z"
      }
    ]
  }
}
```

### Error Responses

**404 Not Found**
```json
{
  "error": "Booking not found"
}
```

**400 Bad Request**
```json
{
  "error": "Booking ID is required"
}
```

### Features
- Complete booking information with timestamps
- Parent details with user_id link
- Full event and venue details
- All children with their personal information
- Detailed game information including age ranges and duration
- Complete slot information with timings and capacity
- All payment records with transaction details

---

## Create Booking

**POST** `/api/bookings`

Create a new booking with parent, children, and multiple games/slots per child.


### Request Body Example
```json
{
  "parent_name": "Parent Name",
  "email": "parent@email.com",
  "phone": "9876543210",
  "event_id": 1,
  "booking_ref": "MAN2025123456",
  "status": "Pending",
  "total_amount": 998.00,
  "children": [
    {
      "full_name": "Child One",
      "date_of_birth": "2023-01-01",
      "gender": "Male",
      "school_name": "ABC School",
      "booking_games": [
        {
          "game_id": 1,
          "slot_id": 8,
          "game_price": 499.00
        }
      ]
    },
    {
      "full_name": "Child Two",
      "date_of_birth": "2021-05-10",
      "gender": "Female",
      "school_name": "XYZ School",
      "booking_games": [
        {
          "game_id": 1,
          "slot_id": 9,
          "game_price": 499.00
        }
      ]
    }
  ],
  "payment": {
    "transaction_id": "TXN123456789",
    "amount": 998.00,
    "payment_method": "Cash",
    "payment_status": "Paid"
  }
}
```


### Success Response
- **201 Created**
```json
{
  "message": "Booking created successfully",
  "booking_id": 123,
  "payment_id": 456
}
```

### Error Response
- **400 Bad Request**
- **500 Internal Server Error**

### Notes
- All children array is required (minimum 1 child).
- At least one child must have booking_games array with games/slots.
- Each child's booking_games array contains their games and time slots.
- **No need to pass child_id** - The API automatically uses the database-generated child ID.
- Parent is automatically created in the `parents` table with the provided details.
- Children are automatically created in the `children` table with the provided details.
- After each child is created, their booking_games are linked using the auto-generated child_id.
- The `payment` object is optional but recommended for payment record creation.

### Data Flow
1. API creates parent record → gets `parent_id` from database
2. For each child in the array:
   - Creates child record → gets `child_id` from database
   - Creates booking_games for that child using the auto-generated `child_id`
3. All records are properly linked with correct foreign keys

### Example: Multiple Games for One Child
```json
{
  "children": [
    {
      "full_name": "Alice Johnson",
      "date_of_birth": "2020-01-01",
      "gender": "Female",
      "school_name": "ABC School",
      "booking_games": [
        {
          "game_id": 1,
          "slot_id": 8,
          "game_price": 1799.00
        },
        {
          "game_id": 1,
          "slot_id": 9,
          "game_price": 1799.00
        }
      ]
    }
  ]
}
```
This will book 2 different time slots for Alice.

---

## Get User Profile with Bookings

**GET** `/api/bookings/user/:userId`

Retrieves complete user profile information along with all booking details including parent information, children, games, slots, and payment information based on user ID.

### URL Parameters
- `userId` (integer, required) - The ID of the user

### Request Example
```bash
GET /api/bookings/user/1
```

### Success Response

**200 OK**
```json
{
  "success": true,
  "data": {
    "user": {
      "user_id": 1,
      "full_name": "John Doe",
      "email": "john@example.com",
      "email_verified": 1,
      "phone": "+1234567890",
      "phone_verified": 1,
      "city_id": 1,
      "city_name": "New York",
      "state": "NY",
      "accepted_terms": 1,
      "terms_accepted_at": "2024-01-15T10:30:00.000Z",
      "is_active": 1,
      "is_locked": 0,
      "created_at": "2024-01-15T10:30:00.000Z",
      "updated_at": "2024-01-15T10:30:00.000Z",
      "last_login_at": "2024-01-20T14:25:00.000Z"
    },
    "parents": [
      {
        "id": 1,
        "parent_name": "John Doe",
        "email": "john@example.com",
        "phone": "+1234567890",
        "created_at": "2024-01-15T10:30:00.000Z",
        "updated_at": "2024-01-15T10:30:00.000Z"
      }
    ],
    "bookings": [
      {
        "booking_id": 1,
        "booking_ref": "BK-2024-001",
        "status": "Confirmed",
        "total_amount": 150.00,
        "payment_method": "credit_card",
        "payment_status": "Paid",
        "created_at": "2024-01-16T09:00:00.000Z",
        "updated_at": "2024-01-16T09:15:00.000Z",
        "parent": {
          "parent_id": 1,
          "parent_name": "John Doe",
          "email": "john@example.com",
          "phone": "+1234567890"
        },
        "event": {
          "event_id": 5,
          "event_name": "Summer Fun Games",
          "event_date": "2024-02-15",
          "start_time": "10:00:00",
          "end_time": "16:00:00",
          "event_description": "A fun-filled day of games for children",
          "venue": {
            "venue_id": 2,
            "venue_name": "Kids Play Center",
            "address": "123 Main St",
            "city": "New York"
          }
        },
        "children": [
          {
            "child_id": 1,
            "full_name": "Emma Doe",
            "date_of_birth": "2018-05-10",
            "gender": "Female",
            "school_name": "Sunshine Elementary",
            "created_at": "2024-01-16T09:00:00.000Z",
            "updated_at": "2024-01-16T09:00:00.000Z",
            "booking_games": [
              {
                "booking_game_id": 1,
                "game_price": 50.00,
                "booking_game_created_at": "2024-01-16T09:00:00.000Z",
                "game_id": 3,
                "game_name": "Treasure Hunt",
                "game_description": "An exciting treasure hunt adventure",
                "age_group": "5-8",
                "game_base_price": 50.00,
                "game_image_url": "https://example.com/treasure-hunt.jpg",
                "slot_id": 10,
                "slot_start_time": "10:00:00",
                "slot_end_time": "12:00:00",
                "available_spots": 20,
                "booked_spots": 5
              }
            ]
          },
          {
            "child_id": 2,
            "full_name": "Oliver Doe",
            "date_of_birth": "2016-08-22",
            "gender": "Male",
            "school_name": "Sunshine Elementary",
            "created_at": "2024-01-16T09:00:00.000Z",
            "updated_at": "2024-01-16T09:00:00.000Z",
            "booking_games": [
              {
                "booking_game_id": 2,
                "game_price": 60.00,
                "booking_game_created_at": "2024-01-16T09:00:00.000Z",
                "game_id": 4,
                "game_name": "Sports Challenge",
                "game_description": "Various sports activities",
                "age_group": "8-12",
                "game_base_price": 60.00,
                "game_image_url": "https://example.com/sports.jpg",
                "slot_id": 11,
                "slot_start_time": "13:00:00",
                "slot_end_time": "15:00:00",
                "available_spots": 15,
                "booked_spots": 8
              }
            ]
          }
        ],
        "payments": [
          {
            "payment_id": 1,
            "transaction_id": "TXN-123456789",
            "amount": 150.00,
            "payment_method": "credit_card",
            "payment_status": "Completed",
            "payment_created_at": "2024-01-16T09:15:00.000Z",
            "payment_updated_at": "2024-01-16T09:15:00.000Z"
          }
        ]
      }
    ]
  }
}
```

### Error Responses

**404 Not Found** - User not found
```json
{
  "error": "User not found"
}
```

**400 Bad Request** - Invalid request
```json
{
  "error": "User ID is required"
}
```

**500 Internal Server Error** - Server error
```json
{
  "error": "Error message describing what went wrong"
}
```

### Response Structure

The API returns comprehensive data including:
- **User Profile**: Complete user information with city details
- **Parents**: All parent records associated with the user
- **Bookings**: All bookings made by the user's parent records, including:
  - Booking details (reference, status, amounts, dates)
  - Event information with venue details
  - Children enrolled in each booking
  - Game and slot assignments for each child
  - Payment records and transaction details

### Features
- Complete user profile with city information
- All parent records linked to the user
- Bookings ordered by creation date (most recent first)
- Detailed event and venue information
- Children information for each booking
- Game details including slots, prices, and availability
- Complete payment history for each booking

### Notes
- If the user has no bookings, an empty `bookings` array will be returned
- Each child can have multiple games assigned
- Each booking can have multiple payment records
- All prices are returned in decimal format (2 decimal places)
- Timestamps are in ISO 8601 format
