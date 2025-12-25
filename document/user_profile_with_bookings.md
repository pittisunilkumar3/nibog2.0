# User Profile with Bookings API

## Endpoint
**GET** `/api/bookings/user/:userId`

## Description
Retrieves complete user profile information along with all booking details including parent information, children, games, slots, and payment information based on user ID.

## URL Parameters
- `userId` (integer, required) - The ID of the user

## Response Format

### Success Response (200 OK)
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
      "locked_until": null,
      "deactivated_at": null,
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

#### User Not Found (404 Not Found)
```json
{
  "error": "User not found"
}
```

#### Bad Request (400 Bad Request)
```json
{
  "error": "User ID is required"
}
```

#### Server Error (500 Internal Server Error)
```json
{
  "error": "Error message describing what went wrong"
}
```

## Features
- Complete user profile with city information
- All parent records linked to the user
- All bookings made by the user's parent records
- Event details with venue information
- Children information for each booking
- Game and slot details for each child
- Payment information for each booking
- Ordered by booking creation date (most recent first)

## Example Request
```bash
curl -X GET http://localhost:3000/api/bookings/user/1
```

## Notes
- The API fetches all related data in a single call for efficiency
- Bookings are returned in descending order by creation date
- Parent can have multiple children and each child can have multiple games
- Each booking can have multiple payment records (in case of partial payments)
- If a user has no bookings, an empty bookings array will be returned
- All prices are in decimal format with 2 decimal places
