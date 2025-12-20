# Booking API Documentation

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
  "total_amount": 499.00,
  "children": [
    {
      "full_name": "Child One",
      "date_of_birth": "2023-01-01",
      "gender": "Male",
      "school_name": "ABC School"
    },
    {
      "full_name": "Child Two",
      "date_of_birth": "2021-05-10",
      "gender": "Female",
      "school_name": "XYZ School"
    }
  ],
  "booking_games": [
    {
      "child_id": 1,
      "game_id": 2,
      "slot_id": 5,
      "game_price": 499.00
    },
    {
      "child_id": 2,
      "game_id": 3,
      "slot_id": 6,
      "game_price": 499.00
    }
  ],
  "payment": {
    "transaction_id": "TXN123456789",
    "amount": 499.00,
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
- All children and booking_games arrays are required.
- Each booking_game must reference a valid child, game, and slot.
- Parent is created if not provided by ID.
- The `payment` object is required for payment record creation and should include transaction_id, amount, payment_method, and payment_status.
