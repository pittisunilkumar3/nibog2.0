# Event API Documentation

## Create Event

**POST** `http://localhost:3004/api/events/create`

Create a new event with event games with slots. Requires employee Bearer token authentication.

### Request Headers
- `Authorization: Bearer <employee_token>`

### Request Body Example
```json
{
  "title": "Event Title",
  "description": "Event description",
  "city_id": 1,
  "venue_id": 2,
  "event_date": "2025-12-31",
  "status": "Draft",
  "is_active": 1,
  "image_url": "http://...",
  "priority": 1,
  "event_games_with_slots": [
    {
      "game_id": 1,
      "custom_title": "Game Title",
      "custom_description": "Description",
      "custom_price": 100.00,
      "start_time": "10:00:00",
      "end_time": "11:00:00",
      "slot_price": 50.00,
      "max_participants": 10,
      "note": "Note",
      "is_active": 1,
      "min_age": 5,
      "max_age": 12
    }
  ]
}
```

### Success Response
- **201 Created**
```json
{
  "message": "Event created successfully",
  "event_id": 123
}
```

### Error Response
- **401 Unauthorized**
- **500 Internal Server Error**

### Notes
- Only authenticated employees can create events.
- The event_games_with_slots array is required for adding games to the event.


## Edit Event

**PUT** `/api/events/:id/edit`

Edit an existing event and its event games with slots. Requires employee Bearer token authentication.

### Request Headers
- `Authorization: Bearer <employee_token>`

### Request Body Example
```json
{
  "title": "Event Title",
  "description": "Event description",
  "city_id": 1,
  "venue_id": 2,
  "event_date": "2025-12-31",
  "status": "Published",
  "is_active": 1,
  "image_url": "http://...",
  "priority": 1,
  "event_games_with_slots": [
    {
      "id": 10, // Existing slot id (omit for new)
      "game_id": 1,
      "custom_title": "Game Title",
      "custom_description": "Description",
      "custom_price": 100.00,
      "start_time": "10:00:00",
      "end_time": "11:00:00",
      "slot_price": 50.00,
      "max_participants": 10,
      "note": "Note",
      "is_active": 1,
      "min_age": 5,
      "max_age": 12
    }
  ],
  "event_games_with_slots_to_delete": [11, 12] // Optional: slot ids to delete
}
```

### Success Response
- **200 OK**
```json
{
  "message": "Event updated successfully",
  "event_id": 123
}
```

### Error Response
- **401 Unauthorized**
- **404 Not Found**
- **500 Internal Server Error**


## Get Event With Details

**GET** `/api/events/:id/details`

Get an event with its games, venue name, city name, and event_games_with_slots. No authentication required.

### Request
- No authentication required

### Success Response
- **200 OK**
```json
{
  "id": 123,
  "title": "Event Title",
  "description": "Event description",
  "city_id": 1,
  "venue_id": 2,
  "event_date": "2025-12-31",
  "status": "Published",
  "is_active": 1,
  "image_url": "http://...",
  "priority": 1,
  "venue_name": "Venue Name",
  "city_name": "City Name",
  "event_games_with_slots": [
    {
      "id": 10,
      "game_id": 1,
      "custom_title": "Game Title",
      "custom_description": "Description",
      "custom_price": 100.00,
      "start_time": "10:00:00",
      "end_time": "11:00:00",
      "slot_price": 50.00,
      "max_participants": 10,
      "note": "Note",
      "is_active": 1,
      "min_age": 5,
      "max_age": 12,
      "game_title": "Game Title",
      "game_description": "Game Description"
    }
  ]
}
```

### Error Response
- **404 Not Found**
- **500 Internal Server Error**



## List Events With Details

**GET** `/api/events/list`

List all events with their slots, venue name, city name, and event_games_with_slots. No authentication required.

### Request
- No authentication required

### Success Response
- **200 OK**
```json
[
  {
    "id": 123,
    "title": "Event Title",
    "description": "Event description",
    "city_id": 1,
    "venue_id": 2,
    "event_date": "2025-12-31",
    "status": "Published",
    "is_active": 1,
    "image_url": "http://...",
    "priority": 1,
    "venue_name": "Venue Name",
    "city_name": "City Name",
    "event_games_with_slots": [
      {
        "id": 10,
        "game_id": 1,
        "custom_title": "Game Title",
        "custom_description": "Description",
        "custom_price": 100.00,
        "start_time": "10:00:00",
        "end_time": "11:00:00",
        "slot_price": 50.00,
        "max_participants": 10,
        "note": "Note",
        "is_active": 1,
        "min_age": 5,
        "max_age": 12,
        "game_title": "Game Title",
        "game_description": "Game Description"
      }
    ]
  }
]
```

### Error Response
- **500 Internal Server Error**



## Delete Event

**DELETE** `/api/events/:id/delete`

Delete an event and its slots. Requires employee Bearer token authentication.

### Request Headers
- `Authorization: Bearer <employee_token>`

### Success Response
- **200 OK**
```json
{
  "message": "Event deleted successfully",
  "event_id": 123
}
```

### Error Response
- **401 Unauthorized**
- **404 Not Found**
- **500 Internal Server Error**

### Notes
- Only authenticated employees can delete events.
