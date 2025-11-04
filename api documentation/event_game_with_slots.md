## create event

POST https://ai.nibog.in/webhook/v1/nibog/event-game-slot/create

Payload

{
  "id" :  13,
  "event_id": 11,
  "game_id": 11,
  "custom_title": "Ball Pit Adventure",
  "custom_description": "A fun and colorful ball pit experience for toddlers.",
  "custom_price": 15.00,
  "start_time": "10:00:00",
  "end_time": "11:30:00",
  "slot_price": 5.00,
  "max_participants": 20
}

Response (201 Created)

[
  {
    "id": 19,
    "event_id": 11,
    "game_id": 11,
    "custom_title": "Ball Pit Adventure",
    "custom_description": "A fun and colorful ball pit experience for toddlers.",
    "custom_price": "15.00",
    "start_time": "10:00:00",
    "end_time": "11:30:00",
    "slot_price": "5.00",
    "max_participants": 20,
    "created_at": "2025-06-08T09:11:06.925Z",
    "updated_at": "2025-06-08T09:11:06.925Z"
  }
]

## get event

POST https://ai.nibog.in/webhook/v1/nibog/event-game-slot/get

payload

{
  "id": 13
}

Response (200 OK)

[
  {
    "id": 13,
    "event_id": 11,
    "game_id": 2,
    "custom_title": "Running race",
    "custom_description": "asdf",
    "custom_price": "799.00",
    "start_time": "10:00:00",
    "end_time": "11:30:00",
    "slot_price": "799.00",
    "max_participants": 12,
    "created_at": "2025-05-05T13:32:31.212Z",
    "updated_at": "2025-05-05T13:32:31.212Z"
  }
]

## get all events

GET https://ai.nibog.in/webhook/v1/nibog/event-game-slot/get-all

[
  {
    "id": 12,
    "event_id": 11,
    "game_id": 4,
    "custom_title": "Baby Crawling",
    "custom_description": "Baby Crawling Race is a fun and lighthearted game where babies compete by crawling toward a finish line, cheered on by excited parents and spectators. The goal is simple: the first baby to crawl across the line wins! It’s a playful event often held at family gatherings or community festivals, bringing lots of laughter and unforgettable moments.",
    "custom_price": "799.00",
    "start_time": "10:00:00",
    "end_time": "11:30:00",
    "slot_price": "799.00",
    "max_participants": 12,
    "created_at": "2025-05-05T13:32:31.212Z",
    "updated_at": "2025-05-05T13:32:31.212Z"
  },
  {
    "id": 13,
    "event_id": 11,
    "game_id": 2,
    "custom_title": "Running race",
    "custom_description": "asdf",
    "custom_price": "799.00",
    "start_time": "10:00:00",
    "end_time": "11:30:00",
    "slot_price": "799.00",
    "max_participants": 12,
    "created_at": "2025-05-05T13:32:31.212Z",
    "updated_at": "2025-05-05T13:32:31.212Z"
  },
  {
    "id": 14,
    "event_id": 12,
    "game_id": 2,
    "custom_title": "Running race",
    "custom_description": "asdf",
    "custom_price": "799.00",
    "start_time": "10:00:00",
    "end_time": "11:30:00",
    "slot_price": "799.00",
    "max_participants": 12,
    "created_at": "2025-05-31T10:28:02.645Z",
    "updated_at": "2025-05-31T10:28:02.645Z"
  },
  {
    "id": 15,
    "event_id": 12,
    "game_id": 4,
    "custom_title": "Baby Crawling",
    "custom_description": "Baby Crawling Race is a fun and lighthearted game where babies compete by crawling toward a finish line, cheered on by excited parents and spectators. The goal is simple: the first baby to crawl across the line wins! It’s a playful event often held at family gatherings or community festivals, bringing lots of laughter and unforgettable moments.",
    "custom_price": "799.00",
    "start_time": "10:00:00",
    "end_time": "11:30:00",
    "slot_price": "799.00",
    "max_participants": 12,
    "created_at": "2025-05-31T10:28:02.645Z",
    "updated_at": "2025-05-31T10:28:02.645Z"
  },
  {
    "id": 16,
    "event_id": 16,
    "game_id": 2,
    "custom_title": "Mini Golf Challenge",
    "custom_description": "Try to score a hole-in-one!",
    "custom_price": "5.00",
    "start_time": "10:00:00",
    "end_time": "11:30:00",
    "slot_price": "5.00",
    "max_participants": 20,
    "created_at": "2025-06-03T11:41:10.821Z",
    "updated_at": "2025-06-03T11:41:10.821Z"
  },
  {
    "id": 17,
    "event_id": 16,
    "game_id": 2,
    "custom_title": "Ball Pit Bonanza",
    "custom_description": "Dive into fun!",
    "custom_price": "3.50",
    "start_time": "12:00:00",
    "end_time": "13:00:00",
    "slot_price": "3.50",
    "max_participants": 15,
    "created_at": "2025-06-03T11:41:10.821Z",
    "updated_at": "2025-06-03T11:41:10.821Z"
  },
  {
    "id": 19,
    "event_id": 11,
    "game_id": 11,
    "custom_title": "Ball Pit Adventure",
    "custom_description": "A fun and colorful ball pit experience for toddlers.",
    "custom_price": "15.00",
    "start_time": "10:00:00",
    "end_time": "11:30:00",
    "slot_price": "5.00",
    "max_participants": 20,
    "created_at": "2025-06-08T09:11:06.925Z",
    "updated_at": "2025-06-08T09:11:06.925Z"
  }
]

## update event

POST https://ai.nibog.in/webhook/v1/nibog/event-game-slot/update


payload
{
    "id" : 13,
  "event_id": 11,
  "game_id": 11,
  "custom_title": "Ball Pit Adventure",
  "custom_description": "A fun and colorful ball pit experience for toddlers.",
  "custom_price": 15.00,
  "start_time": "10:00:00",
  "end_time": "11:30:00",
  "slot_price": 5.00,
  "max_participants": 20
}

response 200 OK

[
  {
    "id": 13,
    "event_id": 11,
    "game_id": 11,
    "custom_title": "Ball Pit Adventure",
    "custom_description": "A fun and colorful ball pit experience for toddlers.",
    "custom_price": "15.00",
    "start_time": "10:00:00",
    "end_time": "11:30:00",
    "slot_price": "5.00",
    "max_participants": 20,
    "created_at": "2025-05-05T13:32:31.212Z",
    "updated_at": "2025-05-05T13:32:31.212Z"
  }
]

## Delete event

POST https://ai.nibog.in/webhook/v1/nibog/event-game-slot/delete

payload

{
  "id" : 14
}

response (200 OK)

[
  {
    "success": true
  }
]