# Event Image create

POST https://ai.nibog.in/webhook/nibog/eventimage

Payload:-

{
  "event_id": 123,
  "image_url": "https://example.com/images/event123.jpg",
  "priority": 1,
  "is_active": true
}

Responsive:-

[
    {
        "id": 2,
        "event_id": 123,
        "image_url": "https://example.com/images/event123.jpg",
        "priority": 1,
        "is_active": true,
        "created_at": "2025-09-15T08:24:01.024Z",
        "updated_at": "2025-09-15T08:24:01.024Z"
    }
]




# Getting the image 


POST https://ai.nibog.in/webhook/nibog/geteventwithimages/get

payload :-

{
    "event_id":4
}


responsive :-

[
    {
        "id": 4,
        "event_id": 131,
        "image_url": "./upload/eventimages/eventimage_1757947801601_4538.png",
        "priority": 1,
        "is_active": true,
        "created_at": "2025-09-15T09:20:04.921Z",
        "updated_at": "2025-09-15T09:20:04.921Z"
    }
]


# update event image 


POST https://ai.nibog.in/webhook/nibog/eventimage/updated

payload :-

{
    "event_id": 131,
    "image_url": "./upload/eventimages/eventimage_1757947801601_4538.png",
    "priority": 1,
    "is_active": true
}

response :-

[
    {
        "id": 4,
        "event_id": 131,
        "image_url": "./upload/eventimages/eventimage_1757947801601_4538.png",
        "priority": 1,
        "is_active": true,
        "created_at": "2025-09-15T09:20:04.921Z",
        "updated_at": "2025-09-15T09:20:04.921Z"
    }
]




# event details with image


GET https://ai.nibog.in/webhook/nibog/getting/eventdetailswithimage



[
    
    {
        "event_id": 119,
        "event_title": "New India Baby Olympic Games Chennai 2026",
        "event_description": "India's biggest baby Olympic games. Join us for exciting baby games including crawling races, baby walker, running race, and many more for children aged 5-84 months.",
        "event_date": "2026-02-07T18:30:00.000Z",
        "event_status": "Published",
        "event_image_url": "./upload/eventimages/eventimage_1758012110846_6162.jpg",
        "image_priority": 1,
        "venue_id": 30,
        "venue_name": "Venue Will be updated soon",
        "venue_address": "Will be updated soon",
        "city_id": 36,
        "city_name": "Chennai",
        "city_state": "Tamilnadu",
        "game_custom_title": "Shot Put",
        "game_custom_description": "This engaging shot put session is designed for babies aged 25-84 months. During this 60-minute activity, children will explore and develop various skills in a safe and stimulating environment. Parents will be guided through age-appropriate activities that promote development and bonding.",
        "game_custom_price": "700.00",
        "slot_price": "700.00",
        "start_time": "10:00:00",
        "end_time": "11:30:00",
        "max_participants": 200,
        "baby_game_name": "Shot Put",
        "min_age": 25,
        "max_age": 84,
        "duration_minutes": 60
    },
    {
        "event_id": 119,
        "event_title": "New India Baby Olympic Games Chennai 2026",
        "event_description": "India's biggest baby Olympic games. Join us for exciting baby games including crawling races, baby walker, running race, and many more for children aged 5-84 months.",
        "event_date": "2026-02-07T18:30:00.000Z",
        "event_status": "Published",
        "event_image_url": "./upload/eventimages/eventimage_1758012110846_6162.jpg",
        "image_priority": 1,
        "venue_id": 30,
        "venue_name": "Venue Will be updated soon",
        "venue_address": "Will be updated soon",
        "city_id": 36,
        "city_name": "Chennai",
        "city_state": "Tamilnadu",
        "game_custom_title": "Jumping Ball",
        "game_custom_description": "This engaging jumping ball session is designed for babies aged 0-300 months. During this 60-minute activity, children will explore and develop various skills in a safe and stimulating environment. Parents will be guided through age-appropriate activities that promote development and bonding.",
        "game_custom_price": "700.00",
        "slot_price": "700.00",
        "start_time": "10:00:00",
        "end_time": "11:30:00",
        "max_participants": 100,
        "baby_game_name": "Jumping Ball",
        "min_age": 49,
        "max_age": 84,
        "duration_minutes": 60
    }
]




