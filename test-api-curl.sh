#!/bin/bash

echo "=== TESTING BOOKING API WITH CURL ==="
echo "Testing the exact API endpoint: https://ai.nibog.in/webhook/v1/nibog/bookingsevents/create"
echo ""

# Test 1: Your original payload
echo "TEST 1: Your original payload with 2015-01-01"
curl -X POST "https://ai.nibog.in/webhook/v1/nibog/bookingsevents/create" \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": 114,
    "parent": {
      "parent_name": "Pitti Sunil Kumar",
      "email": "pittisunilkumar3@gmail.com",
      "additional_phone": "6303727148"
    },
    "child": {
      "full_name": "Pitti Sunil Kumar",
      "date_of_birth": "2015-01-01",
      "school_name": "hgfds",
      "gender": "Male"
    },
    "booking": {
      "event_id": 109,
      "booking_date": "2025-08-14",
      "total_amount": 1,
      "payment_method": "PhonePe",
      "payment_status": "Paid",
      "terms_accepted": true,
      "transaction_id": "TEST_ORIGINAL_' $(date +%s) '",
      "merchant_transaction_id": "TEST_MERCHANT_ORIGINAL_' $(date +%s) '",
      "booking_ref": "TEST_ORIG_' $(date +%s | tail -c 4) '",
      "status": "Confirmed"
    },
    "booking_games": [
      {
        "slot_id": 339,
        "game_id": 9,
        "game_price": 1
      }
    ]
  }'

echo ""
echo ""

# Test 2: Modified payload with different DOB
echo "TEST 2: Modified payload with different DOB (2020-05-15)"
curl -X POST "https://ai.nibog.in/webhook/v1/nibog/bookingsevents/create" \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": 114,
    "parent": {
      "parent_name": "Test Parent Modified",
      "email": "testmodified@example.com",
      "additional_phone": "9876543210"
    },
    "child": {
      "full_name": "Test Child Modified",
      "date_of_birth": "2020-05-15",
      "school_name": "Test School Modified",
      "gender": "Female"
    },
    "booking": {
      "event_id": 109,
      "booking_date": "2025-08-14",
      "total_amount": 1,
      "payment_method": "PhonePe",
      "payment_status": "Paid",
      "terms_accepted": true,
      "transaction_id": "TEST_MODIFIED_' $(date +%s) '",
      "merchant_transaction_id": "TEST_MERCHANT_MODIFIED_' $(date +%s) '",
      "booking_ref": "TEST_MOD_' $(date +%s | tail -c 4) '",
      "status": "Confirmed"
    },
    "booking_games": [
      {
        "slot_id": 339,
        "game_id": 9,
        "game_price": 1
      }
    ]
  }'

echo ""
echo ""

# Test 3: Current date DOB
echo "TEST 3: Payload with current date DOB"
CURRENT_DATE=$(date +%Y-%m-%d)
curl -X POST "https://ai.nibog.in/webhook/v1/nibog/bookingsevents/create" \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": 114,
    "parent": {
      "parent_name": "Test Parent Current",
      "email": "testcurrent@example.com",
      "additional_phone": "1234567890"
    },
    "child": {
      "full_name": "Test Child Current",
      "date_of_birth": "' $CURRENT_DATE '",
      "school_name": "Test School Current",
      "gender": "Male"
    },
    "booking": {
      "event_id": 109,
      "booking_date": "2025-08-14",
      "total_amount": 1,
      "payment_method": "PhonePe",
      "payment_status": "Paid",
      "terms_accepted": true,
      "transaction_id": "TEST_CURRENT_' $(date +%s) '",
      "merchant_transaction_id": "TEST_MERCHANT_CURRENT_' $(date +%s) '",
      "booking_ref": "TEST_CUR_' $(date +%s | tail -c 4) '",
      "status": "Confirmed"
    },
    "booking_games": [
      {
        "slot_id": 339,
        "game_id": 9,
        "game_price": 1
      }
    ]
  }'

echo ""
echo ""
echo "=== CURL TESTS COMPLETED ==="
