## create payment

POST https://ai.nibog.in/webhook/v1/nibog/payments/create

payload

{
  "booking_id": 2,
  "transaction_id": "TXN123456789",
  "phonepe_transaction_id": "NIBOG_123_1234567890",
  "amount": 1800.00,
  "payment_method": "PhonePe",
  "payment_status": "successful",
  "payment_date": "2025-01-15T10:30:00.000Z",
  "gateway_response": {
    "code": "PAYMENT_SUCCESS",
    "merchantId": "NIBOGONLINE",
    "transactionId": "TXN123456789",
    "amount": 180000,
    "state": "COMPLETED"
  }
}

Response
validate
[
  {
    "booking_id": 2,
    "transaction_id": "TXN123456789",
    "phonepe_transaction_id": "NIBOG_123_1234567890",
    "amount": 1800,
    "payment_method": "PhonePe",
    "payment_status": "successful",
    "payment_date": "2025-01-15T10:30:00.000Z",
    "gateway_response": "{\"code\":\"PAYMENT_SUCCESS\",\"merchantId\":\"NIBOGONLINE\",\"transactionId\":\"TXN123456789\",\"amount\":180000,\"state\":\"COMPLETED\"}"
  }
]
insert into payments
[
  {
    "payment_id": 2,
    "booking_id": 2,
    "transaction_id": "TXN123456789",
    "amount": "1800.00",
    "payment_status": "successful",
    "created_at": "2025-06-12T06:22:39.833Z"
  }
]
[
  {
    "success": true,
    "message": "Payment created successfully"
  }
]

## get all payments

GET https://ai.nibog.in/webhook/v1/nibog/payments/get-all

Response
[
  {
    "payment_id": 10,
    "booking_id": 2,
    "transaction_id": "TXN123456789",
    "amount": "1800.00",
    "payment_method": "PhonePe",
    "payment_status": "successful",
    "payment_date": "2025-01-15T10:30:00.000Z",
    "created_at": "2025-06-12T06:40:11.621Z",
    "user_name": "sunil",
    "event_title": "Spring Carnival",
    "event_date": "2025-05-10T00:00:00.000Z",
    "city_name": "Hyderabad",
    "venue_name": "NIBOG Stadium"
  }
]

## get payment by id

POST https://ai.nibog.in/webhook/v1/nibog/payments/get
{
    "id": 10
}

Response
[
  {
    "payment_id": 10,
    "booking_id": 2,
    "transaction_id": "TXN123456789",
    "phonepe_transaction_id": "NIBOG_123_1234567890",
    "amount": "1800.00",
    "payment_method": "PhonePe",
    "payment_status": "successful",
    "payment_date": "2025-01-15T10:30:00.000Z",
    "gateway_response": {
      "code": "PAYMENT_SUCCESS",
      "state": "COMPLETED",
      "amount": 180000,
      "merchantId": "NIBOGONLINE",
      "transactionId": "TXN123456789"
    },
    "refund_amount": "0.00",
    "refund_date": null,
    "refund_reason": null,
    "admin_notes": null,
    "created_at": "2025-06-12T06:40:11.621Z",
    "updated_at": "2025-06-12T06:40:11.621Z",
    "user_name": "sunil",
    "user_email": "pittisunilkumar3@gmail.com",
    "user_phone": "6303727148",
    "event_title": "Spring Carnival",
    "event_date": "2025-05-10T00:00:00.000Z",
    "event_description": "A fun-filled day with games and activities.",
    "city_name": "Hyderabad",
    "venue_name": "NIBOG Stadium",
    "venue_address": "Hitech city, Hyderabad",
    "booking_ref": "nibog",
    "booking_status": "Pending",
    "booking_total_amount": "120.00"
  }
]

## get payment analytics

GET https://ai.nibog.in/webhook/v1/nibog/payments/analytics

Response
[
  {
    "total_payments": "1",
    "total_revenue": "1800.00",
    "successful_payments": "1",
    "pending_payments": "0",
    "failed_payments": "0",
    "refunded_payments": "0",
    "average_transaction": 1800,
    "monthly_data": [
      {
        "month": "2025-01",
        "revenue": 1800,
        "count": 1
      }
    ]
  }
]

## update payment status

POST https://ai.nibog.in/webhook/v1/nibog/payments/update-status

payload

{
  "payment_id": 10,
  "status": "refunded",
  "refund_amount": 1800.00,
  "refund_reason": "Event cancelled",
  "admin_notes": "Refund processed due to event cancellation "
}

Response
[
  {
    "payment_id": 10,
    "payment_status": "refunded",
    "refund_amount": "1800.00",
    "refund_date": "2025-06-12T09:14:59.796Z",
    "updated_at": "2025-06-12T09:14:59.796Z",
    "is_valid_update": true,
    "message": "Success: Payment refunded"
  }
]

## export payments

GET https://ai.nibog.in/webhook/v1/nibog/payments/export

query params

{
  "format": "csv",
  "start_date": "2025-01-01",
  "end_date": "2025-01-31",
  "status": "refunded"
}

Response

[
  {
    "payment_id": "P010",
    "booking_id": "B002",
    "user_name": "sunil",
    "user_email": "pittisunilkumar3@gmail.com",
    "user_phone": "6303727148",
    "event_title": "Spring Carnival",
    "event_date": "2025-05-10T00:00:00.000Z",
    "city_name": "Hyderabad",
    "venue_name": "NIBOG Stadium",
    "amount": "1800.00",
    "payment_method": "PhonePe",
    "payment_status": "refunded",
    "transaction_id": "TXN123456789",
    "payment_date": "2025-01-15T10:30:00.000Z",
    "refund_amount": "1800.00",
    "refund_reason": "Event cancelled by organizer"
  }
]







  
