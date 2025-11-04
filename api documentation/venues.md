## create venues
POST https://ai.nibog.in/webhook/v1/nibog/venues/create

{
  "venue_name": "NIBOG Stadium",
  "city_id": 2,
  "address": "123 Elm Street",
  "capacity": 5000,
  "is_active": true
}

Response (201 Created)

[
  {
    "id": 1,
    "venue_name": "NIBOG Stadium",
    "city_id": 2,
    "address": "123 Elm Street",
    "capacity": 5000,
    "is_active": true,
    "created_at": "2025-04-27T02:07:30.936Z",
    "updated_at": "2025-04-27T02:07:30.936Z"
  }
]


## Get all venues

GET https://ai.nibog.in/webhook/v1/nibog/venues/get-all

Response (200 OK)

[
  {
    "id": 1,
    "venue_name": "NIBOG Stadium",
    "city_id": 2,
    "address": "123 Elm Street",
    "capacity": 5000,
    "is_active": true,
    "created_at": "2025-04-27T02:07:30.936Z",
    "updated_at": "2025-04-27T02:07:30.936Z"
  }
]


## Get venue by ID

POST https://ai.nibog.in/webhook/v1/nibog/venues/get
{
    "id": 1
}   

Response (200 OK)

[
  {
    "id": 1,
    "venue_name": "NIBOG Stadium",
    "city_id": 2,
    "address": "123 Elm Street",
    "capacity": 5000,
    "is_active": true,
    "created_at": "2025-04-27T02:07:30.936Z",
    "updated_at": "2025-04-27T02:07:30.936Z"
  }
]

## Update venue by ID

POST https://ai.nibog.in/webhook/v1/nibog/venues/update
{
  "id": 1,
  "venue_name": "NIBOG Stadium",
  "city_id": 2,
  "address": "123 Elm Street",
  "capacity": 5000,
  "is_active": true
}

Response (200 OK)

[
  {
    "id": 1,
    "venue_name": "NIBOG Stadium",
    "city_id": 2,
    "address": "123 Elm Street",
    "capacity": 5000,
    "is_active": true,
    "created_at": "2025-04-27T02:07:30.936Z",
    "updated_at": "2025-04-27T02:07:30.936Z"
  }
]


## Delete venue by ID

POST https://ai.nibog.in/webhook/v1/nibog/venues/delete
{
    "id": 1
}   

Response (200 OK)

[
  {
    "success": true
  }
]

## Get all venues by city ID

POST https://ai.nibog.in/webhook/v1/nibog/venues/get-by-city
{
    "city_id": 2
}   

Response (200 OK)

[
  {
    "id": 1,
    "venue_name": "NIBOG Stadium",
    "city_id": 2,
    "address": "123 Elm Street",
    "capacity": 5000,
    "is_active": true,
    "created_at": "2025-04-27T02:07:30.936Z",
    "updated_at": "2025-04-27T02:07:30.936Z"
  }
]




## Get all Venues with city details

POST https://ai.nibog.in/webhook/v1/nibog/venues/getall-with-city

payload

{
  "city_id": 2
}


Response (200 OK)

[
    {
        "venue_id": 3,
        "venue_name": "NIBOG Stadium",
        "address": "123 Elm Street",
        "capacity": 5000,
        "venue_is_active": true,
        "venue_created_at": "2025-04-29T17:02:42.120Z",
        "venue_updated_at": "2025-04-29T17:02:42.120Z",
        "city_id": 2,
        "city_name": "sun",
        "state": "ss",
        "city_is_active": true,
        "city_created_at": "2025-04-29T16:22:29.680Z",
        "city_updated_at": "2025-04-29T16:22:29.680Z"
    }
]


