## create city
POST  https://ai.nibog.in/webhook/v1/nibog/city/create


{
  "city_name": "Los Angeles",
  "state": "California",
  "is_active": true
}

Response (201 Created)

[
    {
        "id": 1,
        "city_name": "Los Angeles",
        "state": "California",
        "is_active": true,
        "created_at": "2025-04-27T00:18:06.563Z",
        "updated_at": "2025-04-27T00:18:06.563Z"
    }
]



## update city

POST https://ai.nibog.in/webhook/v1/nibog/city/update

{
  "id": 1,
  "city_name": "New York",
  "state": "New York",
  "is_active": true
}

Response (200 OK) 

[
  {
    "id": 1,
    "city_name": "Tirupati",
    "state": "California",
    "is_active": true,
    "created_at": "2025-04-27T00:18:06.563Z",
    "updated_at": "2025-04-27T00:18:06.563Z"
  }
]



## get city

POST https://ai.nibog.in/webhook/v1/nibog/city/get
{
    "id": 1
}
Response (200 OK)  
[
  {
    "id": 1,
    "city_name": "Tirupati",
    "state": "California",
    "is_active": true,
    "created_at": "2025-04-27T00:18:06.563Z",
    "updated_at": "2025-04-27T00:18:06.563Z"
  }
]


## get all city

GET https://ai.nibog.in/webhook/v1/nibog/city/get-all

Response (200 OK)  
[
    {
        "id": 1,
        "city_name": "New York",
        "state": "New York",
        "is_active": true,
        "created_at": "2025-04-27T00:18:06.563Z",
        "updated_at": "2025-04-27T00:18:06.563Z"
    },
    {
        "id": 2,
        "city_name": "Los Angeles",
        "state": "California",
        "is_active": true,
        "created_at": "2025-04-27T00:18:06.563Z",
        "updated_at": "2025-04-27T00:18:06.563Z"
    }
]

## delete city

POST https://ai.nibog.in/webhook/v1/nibog/city/delete
{
    "id": 1
}

Response (200 OK)  
[
  {
    "success": true
  }
]





GET https://ai.nibog.in/webhook/v1/nibog/city/get-all-city-event-count


response (200 OK)

[
    {
        "city_id": 12,
        "city_name": "vizag",
        "state": "Andhra Pradesh",
        "venue_count": "1",
        "event_count": "1"
    }
]
