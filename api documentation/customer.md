POST https://ai.nibog.in/webhook/v1/nibog/customer/profile

paylod

{
  "user_id": 1
}

response
[
    {
        "user_id": 15,
        "user_name": "Atchyutha Rekha Sri Naga Sai Sowmya",
        "email": "sowmyaatchyutha7@gmail.com",
        "email_status": "Not Verified",
        "phone": "7013492866",
        "phone_status": "Not Verified",
        "city": null,
        "parent_id": 289,
        "parent_name": "Atchyutha Rekha Sri Naga Sai Sowmya",
        "parent_email": "sowmyaatchyutha7@gmail.com",
        "children": [
            {
                "child_id": 261,
                "child_name": "Chakka Ashvik Krishna",
                "age_in_months": 129,
                "date_of_birth": "January   01, 2015"
            }
        ],
        "bookings": [
            {
                "games": [
                    {
                        "game_id": 11,
                        "game_name": "Running Race",
                        "game_price": 1800,
                        "attendance_status": "Registered"
                    }
                ],
                "status": "Confirmed",
                "payments": [
                    {
                        "amount": 1800,
                        "payment_id": 195,
                        "payment_date": "2025-07-15T05:02:27.465",
                        "payment_method": "PhonePe",
                        "payment_status": "successful",
                        "transaction_id": "OMO2507151032013056796841"
                    }
                ],
                "venue_id": 26,
                "booking_id": 209,
                "event_date": "2025-08-16",
                "event_name": "New India Baby Olympic Games Vizag 2025",
                "booking_ref": "PPT250715841",
                "total_amount": 1800,
                "payment_status": "Paid"
            }
        ]
    }
]