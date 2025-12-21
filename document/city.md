# City API Documentation
These two endpoints provide everything needed for a complete booking system!| `/api/bookings` | POST | Create a new booking with children & games || `/api/city/booking-info/list` | GET | Get all cities with events, games, slots & availability ||----------|--------|---------|| Endpoint | Method | Purpose |## API Endpoints Summary- **Real-time Updates:** Working perfectly- **Total Participants:** 3 children booked- **Bookings Created:** 2 successful bookings- **Slots:** 4 total slots across events- **Events:** 2 active events- **City:** Test City (ID: 1)### 📊 Test Data:7. Pricing information accurate6. Age restrictions properly returned5. Venue details included in response4. Game information with images and descriptions3. Multiple events per city with different slots2. Real-time availability tracking (slot 8: 2 booked → 3 booked)1. City booking info API returns complete data structure### ✅ Tested Successfully:## Testing Summary```}  }    console.error('Booking failed:', result.error);  } else {    await loadBookingData();    // Refresh availability    console.log('Booking successful!', result.booking_id);  if (response.ok) {    const result = await response.json();    });    body: JSON.stringify(bookingData)    headers: { 'Content-Type': 'application/json' },    method: 'POST',  const response = await fetch('http://localhost:3004/api/bookings', {async function createBooking(bookingData) {// Step 2: Create booking}  });    });      });        }          console.log(`    Available: ${slot.available_slots}/${slot.max_participants}`);          console.log(`    Price: ₹${slot.price}`);          console.log(`    Time: ${slot.start_time} - ${slot.end_time}`);          console.log(`    Game: ${slot.game_name}`);        if (slot.is_available) {      event.games_with_slots.forEach(slot => {      // Display available slots            console.log(`  Venue: ${event.venue_name}`);      console.log(`  Event: ${event.title} on ${event.event_date}`);    city.events.forEach(event => {    // Display events in city        console.log(`${city.city_name} - ${city.total_events} events`);  cities.forEach(city => {  // Display cities    const { data: cities } = await response.json();  const response = await fetch('http://localhost:3004/api/city/booking-info/list');async function loadBookingData() {// Step 1: Fetch booking information```javascript## Frontend Integration Example- ✅ Invalid child_id returns clear error- ✅ child_id must match children array index- ✅ Parent information required- ✅ At least one game/slot required- ✅ At least one child requiredThe booking API validates:### 4. Data Validation- Immediate feedback on capacity- No confusion about which slot to book- Direct mapping: slot_id → booking- User sees only available slots### 3. Efficient Booking Process- Current bookings- Age restrictions- Time slots with pricing- All games/activities- Event information with images- City and venue details### 2. Complete Information in One Call- No need for separate availability check- `is_available` flag for easy filtering- Shows `booked_count` vs `max_participants`- The API calculates availability dynamically### 1. Real-Time Availability## Key Features```└─────────────────────────────────────────────────────────────────┘│  Real-time availability updates automatically for next user!     ││                                                                   ││  9. Frontend shows confirmation                                  ││     ↓                                                            ││  8. Returns booking_id and payment_id                           ││     ↓                                                            ││     • Creates payment record                                     ││     • Links booking_games with slot                              ││     • Creates booking                                            ││     • Creates child record(s)                                    ││     • Creates parent record                                      ││  7. Backend:                                                     ││     ↓                                                            ││     with event_id, game_id, slot_id                             ││  6. Frontend calls: POST /api/bookings                          ││     ↓                                                            ││     • Child details (name, DOB, gender, school)                 ││     • Parent details (name, email, phone)                        ││  5. User fills booking form:                                     ││     ↓                                                            ││     • Time Slot                                                  ││     • Game/Activity                                              ││     • Event                                                      ││     • City                                                       ││  4. User selects:                                                ││     ↓                                                            ││     • Pricing for each slot                                      ││     • Real-time availability (10/12 slots available)            ││     • Available games/activities with time slots                 ││     • Events in selected city                                    ││     • Cities dropdown                                            ││  3. Display:                                                     ││     ↓                                                            ││  2. Frontend calls: GET /api/city/booking-info/list            ││     ↓                                                            ││  1. User Opens Booking Page                                     │┌─────────────────────────────────────────────────────────────────┐```## Complete Booking Flow Diagram```}  "is_available": true  "available_slots": 9,        // Decreased from 10 to 9  "booked_count": 3,          // Increased from 2 to 3  "max_participants": 12,  "game_id": 1,  "slot_id": 8,{```jsonThe `booked_count` and `available_slots` will be updated in real-time:**Endpoint:** `GET /api/city/booking-info/list`After creating a booking, call the booking info API again to see updated availability:## Step 3: Verify Real-Time Availability Update```}  "payment_id": 3  "booking_id": 5,  "message": "Booking created successfully",{```json### Success Response:```  }'    }      "payment_status": "Paid"      "payment_method": "Credit Card",      "amount": 1799.00,      "transaction_id": "TXN555666777",    "payment": {    ],      }        "game_price": 1799.00        "slot_id": 8,        "game_id": 1,        "child_id": 1,      {    "booking_games": [    ],      }        "school_name": "Sunshine School"        "gender": "Female",        "date_of_birth": "2019-04-22",        "full_name": "Emily Johnson",      {    "children": [    "total_amount": 1799.00,    "status": "Pending",    "booking_ref": "MAN2025123461",    "event_id": 5,    "phone": "9876543212",    "email": "sarah.j@example.com",    "parent_name": "Sarah Johnson",  -d '{  -H "Content-Type: application/json" \curl -X POST "http://localhost:3004/api/bookings" \```bash### Test Request:Use the `slot_id`, `game_id`, and `event_id` from the previous response to create a booking.**Endpoint:** `POST /api/bookings`## Step 2: Create Booking Using Retrieved Information```}  ]    }      ]        }          ]            }              "max_age": 8              "min_age": 0,              "end_time": "11:30:00",              "start_time": "10:00:00",              "is_available": true,              "available_slots": 10,              "booked_count": 2,              "max_participants": 12,              "price": "1799.00",              "game_name": "Test Game",              "game_id": 1,              "slot_id": 8,            {          "games_with_slots": [          "event_date": "2025-12-31T18:30:00.000Z",          "venue_name": "2",          "title": "tt",          "id": 5,        {      "events": [      "total_events": 2,      "state": "Test State",      "city_name": "Test City",      "id": 1,    {  "data": [  "success": true,{```json### Sample Response:```curl -X GET "http://localhost:3004/api/city/booking-info/list"```bash### Test Request:- Age restrictions- Pricing information- Real-time availability- Games/activities with time slots- Events with venue details- Cities with eventsThis single endpoint provides all the information needed to build a booking form:**Endpoint:** `GET /api/city/booking-info/list`## Step 1: Get Available Cities, Events, and GamesThis document demonstrates the complete booking flow using the new City Booking Info API.## Base URL
```
http://localhost:3004/api/city
```

## Endpoints

## City-wise Events

### List All Events for a City
**GET** `/api/city/{city_id}/events`

**Description:**
Fetch all events for a given city, including venue and city names.

**Example Request:**
```
curl -X GET "http://localhost:3004/api/city/1/events"
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 10,
      "title": "Winter Carnival 2025",
      "description": "A fun event for all ages!",
      "city_id": 1,
      "city_name": "Mumbai",
      "venue_id": 2,
      "venue_name": "Juhu Beach",
      "event_date": "2025-12-31",
      "status": "Published",
      "is_active": 1,
      "image_url": null,
      "priority": 1,
      "created_at": "2025-12-01T10:00:00.000Z",
      "updated_at": "2025-12-10T10:00:00.000Z"
    }
  ]
}
```

---

### 1. List All Cities
**GET** `/api/city/`

**Description:**
Fetch all cities.

**Example Request:**
```
curl -X GET "http://localhost:3004/api/city/"
```

**Response:**
```json
[
  {
    "id": 1,
    "city_name": "Mumbai",
    "state": "Maharashtra",
    "is_active": 1,
    "created_at": "2025-12-14T10:00:00.000Z",
    "updated_at": "2025-12-14T10:00:00.000Z"
  }
]
```

---

### 1a. List All Cities with Venues and Total Venues
**GET** `/api/city/with-venues/list`

**Description:**
Fetch all cities, each with an array of their venues and a total_venues count.

**Example Request:**
```
curl -X GET "http://localhost:3004/api/city/with-venues/list"
```

**Response:**
```json
[
  {
    "id": 1,
    "city_name": "Mumbai",
    "state": "Maharashtra",
    "is_active": 1,
    "created_at": "2025-12-14T10:00:00.000Z",
    "updated_at": "2025-12-14T10:00:00.000Z",
    "total_venues": 2,
    "venues": [
      {
        "id": 1,
        "venue_name": "Stadium 1",
        "address": "123 Main St",
        "city_id": 1,
        "capacity": 5000,
        "is_active": 1,
        "created_at": "2025-12-14T10:00:00.000Z",
        "updated_at": "2025-12-14T10:00:00.000Z"
      },
      {
        "id": 2,
        "venue_name": "Stadium 2",
        "address": "456 Main St",
        "city_id": 1,
        "capacity": 3000,
        "is_active": 1,
        "created_at": "2025-12-14T10:00:00.000Z",
        "updated_at": "2025-12-14T10:00:00.000Z"
      }
    ]
  }
]
```

---

### 1b. List All Cities with Events, Games and Slots (For Booking)
**GET** `/api/city/booking-info/list`

**Description:**
Fetch all active cities with their events, available games, time slots, and real-time availability. This endpoint is perfect for building a booking interface as it includes:
- City and venue information
- All active events in each city
- Games/activities available for each event
- Time slots with pricing
- Real-time availability (booked count and available slots)
- Age restrictions and other booking details

**Example Request:**
```
curl -X GET "http://localhost:3004/api/city/booking-info/list"
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "city_name": "Mumbai",
      "state": "Maharashtra",
      "is_active": 1,
      "created_at": "2025-12-14T10:00:00.000Z",
      "updated_at": "2025-12-14T10:00:00.000Z",
      "total_events": 2,
      "events": [
        {
          "id": 5,
          "title": "Winter Carnival 2025",
          "description": "Fun event for kids",
          "city_id": 1,
          "venue_id": 2,
          "venue_name": "Juhu Beach",
          "venue_address": "Juhu Beach, Mumbai",
          "venue_capacity": 500,
          "event_date": "2025-12-31T18:30:00.000Z",
          "status": "Published",
          "is_active": 1,
          "image_url": "event_image.jpg",
          "priority": 1,
          "created_at": "2025-12-21T05:40:48.000Z",
          "updated_at": "2025-12-21T05:40:50.000Z",
          "games_with_slots": [
            {
              "slot_id": 8,
              "game_id": 1,
              "game_name": "Ball Pit Adventure",
              "game_image": "./upload/gamesimage/gameimage.png",
              "game_description": "Fun ball pit game for kids",
              "custom_title": "Ball Pit Adventure",
              "custom_description": "Jump and play in colorful balls",
              "duration_minutes": 90,
              "categories": "[\"indoor\",\"active\"]",
              "start_time": "10:00:00",
              "end_time": "11:30:00",
              "price": "1799.00",
              "max_participants": 12,
              "booked_count": 2,
              "available_slots": 10,
              "is_available": true,
              "min_age": 0,
              "max_age": 8,
              "note": "",
              "is_active": 1
            },
            {
              "slot_id": 9,
              "game_id": 1,
              "game_name": "Ball Pit Adventure",
              "game_image": "./upload/gamesimage/gameimage.png",
              "game_description": "Fun ball pit game for kids",
              "custom_title": "Ball Pit Adventure",
              "custom_description": "Jump and play in colorful balls",
              "duration_minutes": 90,
              "categories": "[\"indoor\",\"active\"]",
              "start_time": "14:00:00",
              "end_time": "15:30:00",
              "price": "1799.00",
              "max_participants": 12,
              "booked_count": 1,
              "available_slots": 11,
              "is_available": true,
              "min_age": 0,
              "max_age": 8,
              "note": "",
              "is_active": 1
            }
          ]
        }
      ]
    }
  ]
}
```

**Response Fields:**
- `slot_id` - Use this as the slot_id when creating a booking
- `game_id` - Use this as the game_id when creating a booking
- `booked_count` - Number of participants already booked for this slot
- `available_slots` - Remaining capacity (max_participants - booked_count)
- `is_available` - Boolean indicating if slot has capacity
- `price` - Price for this specific time slot
- `min_age` / `max_age` - Age restrictions for the game

---

### 2. Get Single City
**GET** `/api/city/:id`

**Example Request:**
```
curl -X GET "http://localhost:3004/api/city/1"
```

**Response:**
```json
{
  "id": 1,
  "city_name": "Mumbai",
  "state": "Maharashtra",
  "is_active": 1,
  "created_at": "2025-12-14T10:00:00.000Z",
  "updated_at": "2025-12-14T10:00:00.000Z",
  "total_venues": 2,
  "venues": [
    {
      "id": 1,
      "venue_name": "Stadium 1",
      "address": "123 Main St",
      "city_id": 1,
      "capacity": 5000,
      "is_active": 1,
      "created_at": "2025-12-14T10:00:00.000Z",
      "updated_at": "2025-12-14T10:00:00.000Z"
    },
    {
      "id": 2,
      "venue_name": "Stadium 2",
      "address": "456 Main St",
      "city_id": 1,
      "capacity": 3000,
      "is_active": 1,
      "created_at": "2025-12-14T10:00:00.000Z",
      "updated_at": "2025-12-14T10:00:00.000Z"
    }
  ]
}
```

---

### 3. Create City (Protected)
**POST** `/api/city/`

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body Example:**
```json
{
  "city_name": "Pune",
  "state": "Maharashtra",
  "is_active": 1
}
```

**Response:**
```json
{
  "message": "City created successfully"
}
```

---

### 4. Update City (Protected)
**PUT** `/api/city/:id`

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body Example:**
```json
{
  "city_name": "Pune Updated",
  "state": "Maharashtra",
  "is_active": 1
}
```

**Response:**
```json
{
  "message": "City updated successfully"
}
```

---

### 5. Delete City (Protected)
**DELETE** `/api/city/:id`

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "message": "City deleted successfully"
}
```

---

## Notes
- Create, update, and delete endpoints require a valid Bearer token in the `Authorization` header.
- List and get endpoints are public.
- For errors, a JSON object with a `message` and optional `error` field is returned.
