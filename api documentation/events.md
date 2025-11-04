## create event

POST https://ai.nibog.in/webhook/v1/nibog/event/create

Payload

{
    "title" : "Playtime Fiesta",
    "description" : "A fun-filled games.",
    "city_id" : 2,
    "venue_id" : 1,
    "event_date" : "2025-07-30",
    "status" : "Published"
}

Response (201 Created)

[
  {
    "id": 17,
    "title": "Playtime Fiesta",
    "description": "A fun-filled games.",
    "city_id": 2,
    "venue_id": 2,
    "event_date": "2025-07-30T00:00:00.000Z",
    "status": "Published",
    "created_at": "2025-06-08T07:56:52.731Z",
    "updated_at": "2025-06-08T07:56:52.731Z"
  }
]

## get event

POST https://ai.nibog.in/webhook/v1/nibog/event/get
{
    "id": 17
}

Response (200 OK)

[
  {
    "id": 17,
    "title": "Playtime Fiesta",
    "description": "A fun-filled games.",
    "city_id": 2,
    "venue_id": 2,
    "event_date": "2025-07-30T00:00:00.000Z",
    "status": "Published",
    "created_at": "2025-06-08T07:56:52.731Z",
    "updated_at": "2025-06-08T07:56:52.731Z"
  }
]

## get all events

GET https://ai.nibog.in/webhook/v1/nibog/event/get-all

Response (200 OK)

[
  {
    "id": 11,
    "title": "Spring Carnival",
    "description": "A fun-filled day with games and activities.",
    "city_id": 1,
    "venue_id": 1,
    "event_date": "2025-05-10T00:00:00.000Z",
    "status": "Published",
    "created_at": "2025-05-05T10:15:15.750Z",
    "updated_at": "2025-05-05T10:15:15.750Z"
  },
  {
    "id": 12,
    "title": "Friday Fun Bonanza",
    "description": "Hyderabad Biggest event",
    "city_id": 1,
    "venue_id": 1,
    "event_date": "2025-06-30T00:00:00.000Z",
    "status": "Published",
    "created_at": "2025-05-31T10:28:02.579Z",
    "updated_at": "2025-05-31T10:28:02.579Z"
  },
  {
    "id": 16,
    "title": "Spring Carnival",
    "description": "A fun-filled day with games and activities.",
    "city_id": 2,
    "venue_id": 2,
    "event_date": "2025-05-10T00:00:00.000Z",
    "status": "Published",
    "created_at": "2025-06-03T11:41:10.804Z",
    "updated_at": "2025-06-03T11:41:10.804Z"
  },
  {
    "id": 17,
    "title": "Playtime Fiesta",
    "description": "A fun-filled games.",
    "city_id": 2,
    "venue_id": 2,
    "event_date": "2025-07-30T00:00:00.000Z",
    "status": "Published",
    "created_at": "2025-06-08T07:56:52.731Z",
    "updated_at": "2025-06-08T07:56:52.731Z"
  }
]

## update event

POST https://ai.nibog.in/webhook/v1/nibog/event/update

payload

{
    "id": 17,
    "title": "Playtime Fiesta",
    "description": "A fun-filled games.",
    "city_id": 2,
    "venue_id": 2,
    "event_date": "2025-07-30",
    "status": "Published"
}

response

[
  {
    "id": 17,
    "title": "Playtime Fiesta",
    "description": "A fun-filled games.",
    "city_id": 2,
    "venue_id": 2,
    "event_date": "2025-07-30T00:00:00.000Z",
    "status": "Published",
    "created_at": "2025-06-08T07:56:52.731Z",
    "updated_at": "2025-06-08T07:56:52.731Z"
  }
]

## delete event

POST https://ai.nibog.in/webhook/v1/nibog/event/delete
{
    "id": 17
}

response

[
  {
    "success": true
  }
]

## Get Upcoming Events 

GET https://ai.nibog.in/webhook/v1/nibog/events/upcoming-events

Response (200 OK)

[
  {
    "id": 12,
    "title": "Friday Fun Bonanza",
    "description": "Hyderabad Biggest event",
    "city_id": 1,
    "venue_id": 1,
    "event_date": "2025-06-29T18:30:00.000Z",
    "status": "Published",
    "created_at": "2025-05-31T04:58:02.579Z",
    "updated_at": "2025-05-31T04:58:02.579Z"
  },
  {
    "id": 21,
    "title": "Mini Miracles Marathon",
    "description": "A fun-filled race for babies and toddlers! Whether they crawl or toddle, every little step is a big win. Parents are welcome to cheer or join in. Smiles, giggles, and medals guaranteed!",
    "city_id": 1,
    "venue_id": 1,
    "event_date": "2025-06-29T18:30:00.000Z",
    "status": "Published",
    "created_at": "2025-06-09T04:02:40.122Z",
    "updated_at": "2025-06-09T04:02:40.122Z"
  },
  {
    "id": 24,
    "title": "Friday Fun Bonanza (Copy)",
    "description": "Hyderabad Biggest event",
    "city_id": 1,
    "venue_id": 1,
    "event_date": "2025-07-06T18:30:00.000Z",
    "status": "Published",
    "created_at": "2025-06-09T05:44:45.103Z",
    "updated_at": "2025-06-09T05:44:45.103Z"
  },
  {
    "id": 17,
    "title": "Playtime Fiesta",
    "description": "A fun-filled games.",
    "city_id": 2,
    "venue_id": 2,
    "event_date": "2025-07-29T18:30:00.000Z",
    "status": "Published",
    "created_at": "2025-06-08T02:26:52.731Z",
    "updated_at": "2025-06-08T02:26:52.731Z"
  },
  {
    "id": 16,
    "title": "LaughFest Carnival",
    "description": "A fun-filled games.",
    "city_id": 2,
    "venue_id": 2,
    "event_date": "2025-07-29T18:30:00.000Z",
    "status": "Published",
    "created_at": "2025-06-03T06:11:10.804Z",
    "updated_at": "2025-06-03T06:11:10.804Z"
  }
]








POST https://ai.nibog.in/webhook/v1/nibog/events/participants

Payload:--
{
  "event_id": 1
}

Response (200 OK)


[
  {
    "event_date": "2035-05-31T18:30:00.000Z",
    "venue_name": "S3 Sports",
    "total_participants": 18,
    "participants": [
      {
        "booking_id": 11,
        "booking_ref": "nibog",
        "parent_id": 35,
        "parent_name": "saarah",
        "email": "sarah@example.com",
        "additional_phone": "+916303727148",
        "child_id": 35,
        "child_name": "dimbuu",
        "date_of_birth": "2018-05-11T18:30:00.000Z",
        "gender": "Female",
        "event_title": "vizag baby olympics aug2025",
        "event_date": "2035-05-31T18:30:00.000Z",
        "venue_name": "S3 Sports",
        "game_id": 4,
        "game_name": "Baby Crawling"
      },
      {
        "booking_id": 11,
        "booking_ref": "nibog",
        "parent_id": 35,
        "parent_name": "saarah",
        "email": "sarah@example.com",
        "additional_phone": "+916303727148",
        "child_id": 35,
        "child_name": "dimbuu",
        "date_of_birth": "2018-05-11T18:30:00.000Z",
        "gender": "Female",
        "event_title": "vizag baby olympics aug2025",
        "event_date": "2035-05-31T18:30:00.000Z",
        "venue_name": "S3 Sports",
        "game_id": 2,
        "game_name": "Obstacle Course"
      },
      {
        "booking_id": 12,
        "booking_ref": "nibog",
        "parent_id": 36,
        "parent_name": "sneha",
        "email": "sneha@example.com",
        "additional_phone": "+916303727148",
        "child_id": 36,
        "child_name": "dimbuu",
        "date_of_birth": "2018-05-11T18:30:00.000Z",
        "gender": "Female",
        "event_title": "vizag baby olympics aug2025",
        "event_date": "2035-05-31T18:30:00.000Z",
        "venue_name": "S3 Sports",
        "game_id": 4,
        "game_name": "Baby Crawling"
      },
      {
        "booking_id": 12,
        "booking_ref": "nibog",
        "parent_id": 36,
        "parent_name": "sneha",
        "email": "sneha@example.com",
        "additional_phone": "+916303727148",
        "child_id": 36,
        "child_name": "dimbuu",
        "date_of_birth": "2018-05-11T18:30:00.000Z",
        "gender": "Female",
        "event_title": "vizag baby olympics aug2025",
        "event_date": "2035-05-31T18:30:00.000Z",
        "venue_name": "S3 Sports",
        "game_id": 2,
        "game_name": "Obstacle Course"
      },
      {
        "booking_id": 13,
        "booking_ref": "nibog",
        "parent_id": 38,
        "parent_name": "uma",
        "email": "umakallepally6543@gmail.com",
        "additional_phone": "+916303727148",
        "child_id": 38,
        "child_name": "uma",
        "date_of_birth": "2023-12-31T18:30:00.000Z",
        "gender": "Female",
        "event_title": "vizag baby olympics aug2025",
        "event_date": "2035-05-31T18:30:00.000Z",
        "venue_name": "S3 Sports",
        "game_id": 11,
        "game_name": "Hurdle Toddle"
      },
      {
        "booking_id": 14,
        "booking_ref": "nibog",
        "parent_id": 39,
        "parent_name": "uma",
        "email": "umakallepally6543@gmail.com",
        "additional_phone": "+916303727148",
        "child_id": 39,
        "child_name": "uma",
        "date_of_birth": "2023-12-31T18:30:00.000Z",
        "gender": "Female",
        "event_title": "vizag baby olympics aug2025",
        "event_date": "2035-05-31T18:30:00.000Z",
        "venue_name": "S3 Sports",
        "game_id": 11,
        "game_name": "Hurdle Toddle"
      },
      {
        "booking_id": 15,
        "booking_ref": "nibog",
        "parent_id": 40,
        "parent_name": "uma",
        "email": "umakallepally6543@gmail.com",
        "additional_phone": "+916303727148",
        "child_id": 40,
        "child_name": "uma",
        "date_of_birth": "2023-12-31T18:30:00.000Z",
        "gender": "Female",
        "event_title": "vizag baby olympics aug2025",
        "event_date": "2035-05-31T18:30:00.000Z",
        "venue_name": "S3 Sports",
        "game_id": 11,
        "game_name": "Hurdle Toddle"
      },
      {
        "booking_id": 16,
        "booking_ref": "nibog",
        "parent_id": 41,
        "parent_name": "uma",
        "email": "umakallepally6543@gmail.com",
        "additional_phone": "+916303727148",
        "child_id": 41,
        "child_name": "uma",
        "date_of_birth": "2024-01-09T18:30:00.000Z",
        "gender": "Female",
        "event_title": "vizag baby olympics aug2025",
        "event_date": "2035-05-31T18:30:00.000Z",
        "venue_name": "S3 Sports",
        "game_id": 11,
        "game_name": "Hurdle Toddle"
      },
      {
        "booking_id": 17,
        "booking_ref": "nibog",
        "parent_id": 42,
        "parent_name": "harshitha",
        "email": "harshitha@gmail.com",
        "additional_phone": "+916303727148",
        "child_id": 42,
        "child_name": "harsh",
        "date_of_birth": "2023-12-31T18:30:00.000Z",
        "gender": "Female",
        "event_title": "vizag baby olympics aug2025",
        "event_date": "2035-05-31T18:30:00.000Z",
        "venue_name": "S3 Sports",
        "game_id": 11,
        "game_name": "Hurdle Toddle"
      },
      {
        "booking_id": 18,
        "booking_ref": "nibog",
        "parent_id": 43,
        "parent_name": "xyz",
        "email": "xyz@email.com",
        "additional_phone": "+916303727148",
        "child_id": 43,
        "child_name": "uma",
        "date_of_birth": "2024-01-19T18:30:00.000Z",
        "gender": "Female",
        "event_title": "vizag baby olympics aug2025",
        "event_date": "2035-05-31T18:30:00.000Z",
        "venue_name": "S3 Sports",
        "game_id": 11,
        "game_name": "Hurdle Toddle"
      },
      {
        "booking_id": 19,
        "booking_ref": "nibog",
        "parent_id": 44,
        "parent_name": "harsh",
        "email": "harsh@gmail.com",
        "additional_phone": "+916303727148",
        "child_id": 44,
        "child_name": "uma",
        "date_of_birth": "2024-01-01T18:30:00.000Z",
        "gender": "Female",
        "event_title": "vizag baby olympics aug2025",
        "event_date": "2035-05-31T18:30:00.000Z",
        "venue_name": "S3 Sports",
        "game_id": 11,
        "game_name": "Hurdle Toddle"
      },
      {
        "booking_id": 20,
        "booking_ref": "nibog",
        "parent_id": 45,
        "parent_name": "harshitha",
        "email": "harsh@gmail.com",
        "additional_phone": "+916303727148",
        "child_id": 45,
        "child_name": "harsh",
        "date_of_birth": "2023-12-31T18:30:00.000Z",
        "gender": "Female",
        "event_title": "vizag baby olympics aug2025",
        "event_date": "2035-05-31T18:30:00.000Z",
        "venue_name": "S3 Sports",
        "game_id": 11,
        "game_name": "Hurdle Toddle"
      },
      {
        "booking_id": 21,
        "booking_ref": "nibog",
        "parent_id": 46,
        "parent_name": "harshitha",
        "email": "harsh@gmail.com",
        "additional_phone": "+916303727148",
        "child_id": 46,
        "child_name": "harsh",
        "date_of_birth": "2023-12-31T18:30:00.000Z",
        "gender": "Female",
        "event_title": "vizag baby olympics aug2025",
        "event_date": "2035-05-31T18:30:00.000Z",
        "venue_name": "S3 Sports",
        "game_id": 11,
        "game_name": "Hurdle Toddle"
      },
      {
        "booking_id": 22,
        "booking_ref": "nibog",
        "parent_id": 47,
        "parent_name": "uma",
        "email": "umakallepally6543@gmail.com",
        "additional_phone": "+916303727148",
        "child_id": 47,
        "child_name": "umaaa",
        "date_of_birth": "2024-12-31T18:30:00.000Z",
        "gender": "Female",
        "event_title": "vizag baby olympics aug2025",
        "event_date": "2035-05-31T18:30:00.000Z",
        "venue_name": "S3 Sports",
        "game_id": 4,
        "game_name": "Baby Crawling"
      },
      {
        "booking_id": 23,
        "booking_ref": "nibog",
        "parent_id": 48,
        "parent_name": "test",
        "email": "test@gmail.com",
        "additional_phone": "+919876543210",
        "child_id": 48,
        "child_name": "ytdusid",
        "date_of_birth": "2024-12-31T18:30:00.000Z",
        "gender": "Female",
        "event_title": "vizag baby olympics aug2025",
        "event_date": "2035-05-31T18:30:00.000Z",
        "venue_name": "S3 Sports",
        "game_id": 4,
        "game_name": "Baby Crawling"
      },
      {
        "booking_id": 24,
        "booking_ref": "nibog",
        "parent_id": 49,
        "parent_name": "test2",
        "email": "test@gmail.com",
        "additional_phone": "+919876543210",
        "child_id": 49,
        "child_name": "test",
        "date_of_birth": "2024-12-31T18:30:00.000Z",
        "gender": "Female",
        "event_title": "vizag baby olympics aug2025",
        "event_date": "2035-05-31T18:30:00.000Z",
        "venue_name": "S3 Sports",
        "game_id": 4,
        "game_name": "Baby Crawling"
      },
      {
        "booking_id": 25,
        "booking_ref": "nibog",
        "parent_id": 50,
        "parent_name": "sneha",
        "email": "sneha@example.com",
        "additional_phone": "+916303727148",
        "child_id": 50,
        "child_name": "dimbuu",
        "date_of_birth": "2018-05-11T18:30:00.000Z",
        "gender": "Female",
        "event_title": "vizag baby olympics aug2025",
        "event_date": "2035-05-31T18:30:00.000Z",
        "venue_name": "S3 Sports",
        "game_id": 4,
        "game_name": "Baby Crawling"
      },
      {
        "booking_id": 25,
        "booking_ref": "nibog",
        "parent_id": 50,
        "parent_name": "sneha",
        "email": "sneha@example.com",
        "additional_phone": "+916303727148",
        "child_id": 50,
        "child_name": "dimbuu",
        "date_of_birth": "2018-05-11T18:30:00.000Z",
        "gender": "Female",
        "event_title": "vizag baby olympics aug2025",
        "event_date": "2035-05-31T18:30:00.000Z",
        "venue_name": "S3 Sports",
        "game_id": 2,
        "game_name": "Obstacle Course"
      }
    ]
  }
]




