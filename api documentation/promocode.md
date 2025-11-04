## create promocode

POST https://ai.nibog.in/webhook/v1/nibog/promocode/create

payload

{
  "promo_code": "NIBOG25",
  "type": "percentage",
  "value": 25,
  "valid_from": "2025-01-01T00:00:00Z",
  "valid_to": "2025-12-31T23:59:59Z",
  "usage_limit": 1000,
  "minimum_purchase_amount": 1000,
  "maximum_discount_amount": 500,
  "description": "25% off on all NIBOG events. Maximum discount of ₹500.",
  "events": [
    {
      "id": 1,
      "games_id": [4, 5]
    },
    {
      "id": 2,
      "games_id": []
    },
    {
      "id": 3,
      "games_id": [6]
    }
  ]
}

response

[
  {
    "id": 1,
    "promo_code": "NIBOG25",
    "type": "percentage",
    "value": "25.00",
    "valid_from": "2025-01-01T00:00:00.000Z",
    "valid_to": "2025-12-31T23:59:59.000Z",
    "usage_limit": 1000,
    "usage_count": 0,
    "minimum_purchase_amount": "1000.00",
    "maximum_discount_amount": "500.00",
    "description": "25% off on all NIBOG events. Maximum discount of ₹500.",
    "created_at": "2025-06-08T12:49:31.420Z",
    "updated_at": "2025-06-08T12:49:31.420Z",
    "is_active": true
  }
]


## get promocode by id and status

GET https://ai.nibog.in/webhook/v1/nibog/promocode/get-by-status
{
    "id": 1,
    "is_active": true
}

response

[
  {
    "id": 1,
    "promo_code": "NIBOG25",
    "type": "percentage",
    "value": 25,
    "valid_from": "2025-01-01",
    "valid_to": "2025-12-31",
    "usage_limit": 1000,
    "usage_count": 0,
    "minimum_purchase_amount": 1000,
    "maximum_discount_amount": 500,
    "description": "25% off on all NIBOG events. Maximum discount of ₹500.",
    "created_at": "2025-05-07T18:41:35.185Z",
    "updated_at": "2025-05-07T18:41:35.185Z"
  }
]


## get promocode by id

GET https://ai.nibog.in/webhook/v1/nibog/promocode/get
{
    "id": 1
}

response

[
  {
    "promo_data": {
      "events": [
        {
          "games": null,
          "event_details": {
            "id": null,
            "title": null,
            "status": null,
            "city_id": null,
            "venue_id": null,
            "event_date": null,
            "description": null
          }
        }
      ],
      "promo_details": {
        "id": 1,
        "type": "percentage",
        "value": 25,
        "valid_to": "2025-12-31T23:59:59",
        "is_active": true,
        "created_at": "2025-06-08T12:49:31.420408",
        "promo_code": "NIBOG25",
        "updated_at": "2025-06-08T12:49:31.420408",
        "valid_from": "2025-01-01T00:00:00",
        "description": "25% off on all NIBOG events. Maximum discount of ₹500.",
        "usage_count": 0,
        "usage_limit": 1000,
        "maximum_discount_amount": 500,
        "minimum_purchase_amount": 1000
      }
    }
  }
]


## get all promocode

GET https://ai.nibog.in/webhook/v1/nibog/promocode/get-all

response

[
  {
    "id": 1,
    "promo_code": "NIBOG25",
    "type": "percentage",
    "value": 25,
    "valid_from": "2025-01-01",
    "valid_to": "2025-12-31",
    "usage_limit": 1000,
    "usage_count": 0,
    "minimum_purchase_amount": 1000,
    "maximum_discount_amount": 500,
    "description": "25% off on all NIBOG events. Maximum discount of ₹500.",
    "created_at": "2025-05-07T18:41:35.185Z",
    "updated_at": "2025-05-07T18:41:35.185Z"
  }
]


## update promocode

POST https://ai.nibog.in/webhook/v1/nibog/promocode/update

payload

{
  "promo_code": "NIBOG25",
  "type": "percentage",
  "value": 25,
  "valid_from": "2025-01-01T00:00:00Z",
  "valid_to": "2025-12-31T23:59:59Z",
  "usage_limit": 1000,
  "minimum_purchase_amount": 1000,
  "maximum_discount_amount": 500,
  "description": "25% off on all NIBOG events. Maximum discount of ₹500.",
  "events": [
    {
      "id": 1,
      "games_id": [4, 5]
    },
    {
      "id": 2,
      "games_id": []
    },
    {
      "id": 3,
      "games_id": [6]
    }
  ]
}

response

[
  {
    "id": 1,
    "promo_code": "NIBOG25UP",
    "type": "percentage",
    "value": "25.00",
    "valid_from": "2025-01-01T00:00:00.000Z",
    "valid_to": "2025-12-31T23:59:59.000Z",
    "usage_limit": 1000,
    "usage_count": 0,
    "minimum_purchase_amount": "1000.00",
    "maximum_discount_amount": "500.00",
    "description": "25% off on all NIBOG events. Maximum discount of ₹500.",
    "created_at": "2025-06-08T12:49:31.420Z",
    "updated_at": "2025-06-08T12:49:31.420Z",
    "is_active": true
  }
]



## delete promocode

POST https://ai.nibog.in/webhook/v1/nibog/promocode/delete
{
    "id": 1
}

response

[
  {
    "success": true
  }
]


## get promocode by code

GET https://ai.nibog.in/webhook/v1/nibog/promocode/get-by-code

payload

{
    "promo_code": "NIBOG25"
}

response

[
  {
    "id": 1,
    "promo_code": "NIBOG25",
    "type": "percentage",
    "value": 25,
    "valid_from": "2025-01-01",
    "valid_to": "2025-12-31",
    "usage_limit": 1000,
    "usage_count": 0,
    "minimum_purchase_amount": 1000,
    "maximum_discount_amount": 500,
    "description": "25% off on all NIBOG events. Maximum discount of ₹500.",
    "created_at": "2025-05-07T18:41:35.185Z", 
    "updated_at": "2025-05-07T18:41:35.185Z"
  }
]


## get promocode by event id

GET https://ai.nibog.in/webhook/v1/nibog/promocode/get-by-event
{
    "event_id": 11
}

response

[
  {
    "id": 2,
    "promo_code": "NIBOGIMPRQ",
    "type": "percentage",
    "value": "10.00",
    "valid_from": "2025-06-11T18:30:00.000Z",
    "valid_to": "2025-06-20T18:29:59.000Z",
    "usage_limit": 20,
    "usage_count": 0,
    "minimum_purchase_amount": "502.00",
    "maximum_discount_amount": null,
    "description": "test",
    "created_at": "2025-06-11T23:36:03.890Z",
    "updated_at": "2025-06-11T23:36:03.890Z",
    "is_active": true
  },
  {
    "id": 2,
    "promo_code": "NIBOGIMPRQ",
    "type": "percentage",
    "value": "10.00",
    "valid_from": "2025-06-11T18:30:00.000Z",
    "valid_to": "2025-06-20T18:29:59.000Z",
    "usage_limit": 20,
    "usage_count": 0,
    "minimum_purchase_amount": "502.00",
    "maximum_discount_amount": null,
    "description": "test",
    "created_at": "2025-06-11T23:36:03.890Z",
    "updated_at": "2025-06-11T23:36:03.890Z",
    "is_active": true
  },
  {
    "id": 3,
    "promo_code": "NIBOGS7O44",
    "type": "percentage",
    "value": "12.00",
    "valid_from": "2025-06-14T18:30:00.000Z",
    "valid_to": "2025-07-15T18:29:59.000Z",
    "usage_limit": 10,
    "usage_count": 0,
    "minimum_purchase_amount": "1000.00",
    "maximum_discount_amount": null,
    "description": "",
    "created_at": "2025-06-15T06:43:55.314Z",
    "updated_at": "2025-06-15T06:43:55.314Z",
    "is_active": true
  },
  {
    "id": 3,
    "promo_code": "NIBOGS7O44",
    "type": "percentage",
    "value": "12.00",
    "valid_from": "2025-06-14T18:30:00.000Z",
    "valid_to": "2025-07-15T18:29:59.000Z",
    "usage_limit": 10,
    "usage_count": 0,
    "minimum_purchase_amount": "1000.00",
    "maximum_discount_amount": null,
    "description": "",
    "created_at": "2025-06-15T06:43:55.314Z",
    "updated_at": "2025-06-15T06:43:55.314Z",
    "is_active": true
  }
]

## get promocode by status

GET https://ai.nibog.in/webhook/v1/nibog/promocode/get-by-status
{
    "is_active": true
}

response

[
  {
    "id": 1,
    "promo_code": "NIBOG25",
    "type": "percentage",
    "value": 25,
    "valid_from": "2025-01-01",
    "valid_to": "2025-12-31",
    "usage_limit": 1000,
    "minimum_purchase_amount": 1000,
    "maximum_discount_amount": 500,
    "description": "25% off on all NIBOG events. Maximum discount of ₹500.",
    "created_at": "2025-05-07T18:41:35.185Z",
    "updated_at": "2025-05-07T18:41:35.185Z"
  }
]

## Get Promocodes by Event + Games

POST https://ai.nibog.in/webhook/v1/nibog/promocode/get-by-event-games

payload

{
  "event_id": 11,
  "game_ids": [4, 11]
}

response

[
  {
    "id": 1,
    "promo_code": "NIBOG25UP",
    "type": "percentage",
    "value": "25.00",
    "valid_from": "2024-12-31T18:30:00.000Z",
    "valid_to": "2025-12-30T18:30:00.000Z",
    "usage_limit": 1000,
    "usage_count": 5,
    "minimum_purchase_amount": "1000.00",
    "maximum_discount_amount": "500.00",
    "description": "25% off on all NIBOG events. Maximum discount of ₹500.",
    "applicable_scope": "all",
    "applicable_events": null,
    "applicable_games": null
  },
  {
    "id": 2,
    "promo_code": "NIBOGIMPRQ",
    "type": "percentage",
    "value": "10.00",
    "valid_from": "2025-06-11T18:30:00.000Z",
    "valid_to": "2025-06-19T18:30:00.000Z",
    "usage_limit": 20,
    "usage_count": 0,
    "minimum_purchase_amount": "502.00",
    "maximum_discount_amount": null,
    "description": "test",
    "applicable_scope": "games",
    "applicable_events": [
      11,
      12,
      16,
      19,
      21,
      23,
      24,
      25,
      26
    ],
    "applicable_games": [
      2,
      4,
      5,
      11,
      22
    ]
  },
  {
    "id": 3,
    "promo_code": "NIBOGS7O44",
    "type": "percentage",
    "value": "12.00",
    "valid_from": "2025-06-14T18:30:00.000Z",
    "valid_to": "2025-07-14T18:30:00.000Z",
    "usage_limit": 10,
    "usage_count": 0,
    "minimum_purchase_amount": "1000.00",
    "maximum_discount_amount": null,
    "description": "",
    "applicable_scope": "games",
    "applicable_events": [
      11,
      12,
      19
    ],
    "applicable_games": [
      4,
      11,
      22
    ]
  },
  {
    "id": 5,
    "promo_code": "NIBOG2367",
    "type": "percentage",
    "value": "12.00",
    "valid_from": "2024-12-31T18:30:00.000Z",
    "valid_to": "2025-12-30T18:30:00.000Z",
    "usage_limit": 100,
    "usage_count": 0,
    "minimum_purchase_amount": "1000.00",
    "maximum_discount_amount": "500.00",
    "description": "25% off on all NIBOG events. Maximum discount of ₹500.",
    "applicable_scope": "all",
    "applicable_events": null,
    "applicable_games": null
  }
]

## Enhanced Promocode Validation

POST https://ai.nibog.in/webhook/v1/nibog/promocode/validate

payload

{
  "promo_code": "NIBOG25UP",
  "event_id": 11,
  "game_ids": [4, 11],
  "total_amount": 1000
}

response

[
  {
    "is_valid": true,
    "discount_amount": "250.00",
    "final_amount": "750.00",
    "message": "Promo code applied successfully",
    "promo_details": {
      "id": 1,
      "promo_code": "NIBOG25UP",
      "type": "percentage",
      "value": "25.00",
      "maximum_discount_amount": "500.00"
    }
  }
]

## Preview Validation

POST https://ai.nibog.in/webhook/v1/nibog/promocode/preview-validation

payload

{
  "promo_code": "NIBOG25UP",
  "event_id": 11,
  "game_ids": [4, 11],
  "total_amount": 1000
}

response

[
  {
    "is_valid": true,
    "discount_amount": "250.00",
    "final_amount": "750.00",
    "message": "Promo code previewed successfully",
    "promo_details": {
      "id": 1,
      "promo_code": "NIBOG25UP",
      "type": "percentage",
      "value": "25.00",
      "maximum_discount_amount": "500.00"
    }
  }
]

## Rollback Usage

POST https://ai.nibog.in/webhook/v1/nibog/promocode/rollback-usage

payload

{
  "id": 1
}

response

[
  {
    "success": true
  }
]
