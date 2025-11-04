## create baby game 
POST https://ai.nibog.in/webhook/v1/nibog/babygame/create

{
  "game_name": "Baby Crawling",
  "description": "Let your little crawler compete in a fun and safe environment.",
  "min_age_months": 5,
  "max_age_months": 13,
  "duration_minutes": 60,
  "categories": ["olympics", "physical", "competition"],
  "is_active": true
}

Response (201 Created)

[
  {
    "id": 1,
    "game_name": "Obstacle Course",
    "description": "A fun physical activity with various obstacles.",
    "min_age": 7,
    "max_age": 26,
    "duration_minutes": 60,
    "categories": ["olympics", "physical", "competition"],
    "is_active": true,
    "created_at": "2025-04-27T00:57:08.538Z",
    "updated_at": "2025-04-27T00:57:08.538Z"
  }
]

## Get baby game list

GET https://ai.nibog.in/webhook/v1/nibog/babygame/get-all

Response (200 OK)
[
  {
    "id": 1,
    "game_name": "Obstacle Course",
    "description": "A fun physical activity with various obstacles.",
    "min_age": 7,
    "max_age": 26,
    "duration_minutes": 60,
    "categories": [
      "running race",
      "vally ball"
    ],
    "is_active": true,
    "created_at": "2025-04-27T00:57:08.538Z",
    "updated_at": "2025-04-27T00:57:08.538Z"
  }
]

## Get baby game by id

POST https://ai.nibog.in/webhook/v1/nibog/babygame/get
{
    "id": 1
}

Response (200 OK)
[
  {
    "id": 1,
    "game_name": "Obstacle Course",
    "description": "A fun physical activity with various obstacles.",
    "min_age": 7,
    "max_age": 26,
    "duration_minutes": 60,
    "categories": [
      "running race",
      "vally ball"
    ],
    "is_active": true,
    "created_at": "2025-04-27T00:57:08.5    38Z",
    "updated_at": "2025-04-27T00:57:08.538Z"
  }
]

## Update baby game

POST https://ai.nibog.in/webhook/v1/nibog/babygame/update
{
  "id": 1,
  "game_name": "Obstacle Course",
  "description": "A fun physical activity with various obstacles.",
  "min_age": 7,
  "max_age": 26,
  "duration_minutes": 60,
  "categories": [
    "running race",
    "vally ball"
  ],
  "is_active": true
}

Response (200 OK)

[
  {
    "id": 1,
    "game_name": "Obstacle Course",
    "description": "A fun physical activity with various obstacles.",
    "min_age": 7,
    "max_age": 26,
    "duration_minutes": 60,
    "categories": [
      "running race",
      "vally ball"
    ],
    "is_active": true,
    "created_at": "2025-04-27T00:57:08.538Z",
    "updated_at": "2025-04-27T00:57:08.538Z"
  }
]

## Delete baby game

POST https://ai.nibog.in/webhook/v1/nibog/babygame/delete
{
  "id": 1
}

Response (200 OK)

[
  {
    "success": true
  }
]








POST https://ai.nibog.in/webhook/v1/nibog/events/get-games-by-ageandevent-new


Payload:-
{ 
  "event_id": 29, 
  "child_age": 25
}


Responsive:-
[
    {
        "event_id": 29,
        "game_id": 22,
        "title": "KIDS RAMP WALK",
        "description": " KIDS RAMP WALK – CONFIDENCE ON THE CATWALK! \n\nLet your little stars shine bright! \nThe Kids Ramp Walk is the perfect platform for children to express their inner talent, confidence, and creativity – while giving parents a chance to witness their child’s unique spark! \n\n Age Group: 2 to 12 years\nWalk, pose, smile & shine in front of a cheering crowd!\n\nWhether it’s cute, stylish, funny, or fabulous – every child gets their moment in the spotlight. \n All participants receive E-certificates, medals, and tons of encouragement!",
        "listed_price": "1500.00",
        "min_age": 24,
        "max_age": 90,
        "duration_minutes": 120,
        "event_date": "2025-08-12",
        "venue_name": "S3 Sports Arena",
        "slots": [
            {
                "slot_id": 92,
                "start_time": "10:00:00",
                "end_time": "11:30:00",
                "slot_price": 1500,
                "max_participants": 12
            },
            {
                "slot_id": 91,
                "start_time": "15:00:00",
                "end_time": "20:00:00",
                "slot_price": 1500,
                "max_participants": 40
            }
        ]
    }
]



