## Validate QR code

POST https://ai.nibog.in/webhook/v1/nibog/validateqrcode

payload - 
{
    "booking_id":2
}

response 200 OK

The Responses will get based on status

if the status is "success" then the response will be 

[
    {
        "status": "valid QR code",
        "data": [
            {
                "booking_game_id": 2,
                "booking_id": 2,
                "child_id": 5,
                "game_id": 2,
                "game_price": "60.00",
                "attendance_status": "Registered",
                "is_active": true,
                "created_at": "2025-05-07T17:20:17.068Z"
            }
        ]
    }
]

if the status is "invalid QR code" then the response will be 

[
    {
        "status": "invalid QR code",
        "data":[]
    }
]

if the status is "QR code is already validated" then the response will be 

[
    {
        "status": "already used",
        "data": [
            {
                "booking_game_id": 2,
                "booking_id": 2,
                "child_id": 5,
                "game_id": 2,
                "game_price": "60.00",
                "attendance_status": "Registered",
                "is_active": true,
                "created_at": "2025-05-07T17:20:17.068Z"
            }
        ]
    }
]

