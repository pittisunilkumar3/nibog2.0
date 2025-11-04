# Game Image create

POST https://ai.nibog.in/webhook/nibog/gamesimage/create

Payload:-

{
  "game_id": 123,
  "image_url": "https://example.com/images/game123.jpg",
  "priority": 1,
  "is_active": true
}


Responsive:-

[
    {
        "id": 2,
        "game_id": 123,
        "image_url": "https://example.com/images/game123.jpg",
        "priority": 1,
        "is_active": true,
        "created_at": "2025-09-15T08:24:01.024Z",
        "updated_at": "2025-09-15T08:24:01.024Z"
    }
]


# Getting the image

POST https://ai.nibog.in/webhook/nibog/gamesimage/get

payload :-

{
    "game_id":4
}

responsive :-

[
    {
        "id": 4,
        "game_id": 131,
        "image_url": "./upload/gameimages/gameimage_1757947801601_4538.png",
        "priority": 1,
        "is_active": true,
        "created_at": "2025-09-15T09:20:04.921Z",
        "updated_at": "2025-09-15T09:20:04.921Z"
    }
]



# update game image 

POST https://ai.nibog.in/webhook/nibog/gamesimage/update

payload :-

{
    "game_id": 131,
    "image_url": "./upload/gameimages/gameimage_1757947801601_4538.png",
    "priority": 1,
    "is_active": true
}

response :-

[
    {
        "id": 4,
        "game_id": 131,
        "image_url": "./upload/gameimages/gameimage_1757947801601_4538.png",
        "priority": 1,
        "is_active": true,
        "created_at": "2025-09-15T09:20:04.921Z",    
        "updated_at": "2025-09-15T09:20:04.921Z"
    }
]


# games details with image

GET https://ai.nibog.in/webhook/nibog/getting/gamedetailswithimage


responsive :-
[
  {
    "game_id": 9,
    "game_name": "Baby Crawling",
    "description": "This fun-filled crawling race is specially designed for babies aged 5 to 15 months, where the little champs showcase their very first moves of excitement and energy. With soft, safe tracks and cheering parents, this adorable race encourages motor skill development, bonding, and lots of giggles. It’s not about speed, but about celebrating every tiny effort as babies crawl toward the finish line with joy.",
    "min_age": 5,
    "max_age": 15,
    "duration_minutes": 60,
    "categories": [
      "crawling"
    ],
    "game_is_active": true,
    "game_created_at": "2025-07-10T01:46:04.987Z",
    "game_updated_at": "2025-07-10T01:46:04.987Z",
    "image_id": 6,
    "image_url": "./upload/gamesimage/internal_api_test.jpg",
    "image_priority": 1,
    "image_is_active": true,
    "image_created_at": "2025-09-15T16:42:07.788Z",
    "image_updated_at": "2025-09-15T16:42:07.788Z"
  },
  {
    "game_id": 11,
    "game_name": "Running Race",
    "description": "The running race is an energetic and fun activity designed for kids aged 13 months to 7 years, encouraging them to experience the thrill of speed in a safe and playful environment. It helps improve their stamina, agility, and confidence while they enjoy friendly competition. With colorful tracks, cheering families, and a lively atmosphere, every child feels like a true champion. This race is all about celebrating movement, fun, and the spirit of participation!",
    "min_age": 13,
    "max_age": 84,
    "duration_minutes": 120,
    "categories": [
      "Race"
    ],
    "game_is_active": true,
    "game_created_at": "2025-07-10T19:41:00.907Z",
    "game_updated_at": "2025-07-10T19:41:00.907Z",
    "image_id": 13,
    "image_url": "./upload/gamesimage/gameimage_1757999909111_9663.png",
    "image_priority": 1,
    "image_is_active": true,
    "image_created_at": "2025-09-15T23:48:30.098Z",
    "image_updated_at": "2025-09-15T23:48:30.098Z"
  },
  {
    "game_id": 12,
    "game_name": "Hurdle Toddle ",
    "description": "The huddle toddle is a playful obstacle race crafted for children aged 13 months to 7 years, where little participants toddle, jump, and navigate simple hurdles with excitement. It’s designed to develop coordination, balance, and problem-solving skills while keeping the fun alive. With vibrant hurdles and supportive applause from the audience, kids feel encouraged to try their best. This game blends adventure and learning, creating moments of joy and achievement for every participant.\n\n",
    "min_age": 13,
    "max_age": 84,
    "duration_minutes": 60,
    "categories": [
      "Jumping"
    ],
    "game_is_active": true,
    "game_created_at": "2025-07-10T19:43:52.475Z",
    "game_updated_at": "2025-07-10T19:43:52.475Z",
    "image_id": 14,
    "image_url": "./upload/gamesimage/gameimage_1757999945333_9249.png",
    "image_priority": 2,
    "image_is_active": true,
    "image_created_at": "2025-09-15T23:49:05.874Z",
    "image_updated_at": "2025-09-15T23:49:05.874Z"
  },
  {
    "game_id": 18,
    "game_name": "Baby Walker Race",
    "description": "The baby walker race is a delightful activity for 5 to 15-month-old toddlers, giving them the confidence to take those early steps with the support of a walker. It’s a safe, interactive, and joyful race where tiny feet push forward, cheered on by proud parents. This game helps build balance, coordination, and endless smiles while turning their first steps into a memorable experience.",
    "min_age": 5,
    "max_age": 15,
    "duration_minutes": 60,
    "categories": [
      "walker"
    ],
    "game_is_active": true,
    "game_created_at": "2025-07-14T08:44:08.219Z",
    "game_updated_at": "2025-07-14T08:44:08.219Z",
    "image_id": 15,
    "image_url": "./upload/gamesimage/gameimage_1758000000870_9442.png",
    "image_priority": 1,
    "image_is_active": true,
    "image_created_at": "2025-09-15T23:50:01.765Z",
    "image_updated_at": "2025-09-15T23:50:01.765Z"
  },
  {
    "game_id": 20,
    "game_name": "Ring Holding ",
    "description": "This engaging ring holding  session is designed for babies aged 37-84 months. During this 60-minute activity, children will explore and develop various skills in a safe and stimulating environment. Parents will be guided through age-appropriate activities that promote development and bonding.",
    "min_age": 37,
    "max_age": 84,
    "duration_minutes": 60,
    "categories": [
      "Ring holding"
    ],
    "game_is_active": true,
    "game_created_at": "2025-08-27T09:54:29.543Z",
    "game_updated_at": "2025-08-27T09:54:29.543Z",
    "image_id": 17,
    "image_url": "./upload/gamesimage/gameimage_1758000728395_1646.png",
    "image_priority": 2,
    "image_is_active": true,
    "image_created_at": "2025-09-16T00:02:09.010Z",
    "image_updated_at": "2025-09-16T00:02:09.010Z"
  },
  {
    "game_id": 21,
    "game_name": "Shot Put",
    "description": "This engaging shot put session is designed for babies aged 25-84 months. During this 60-minute activity, children will explore and develop various skills in a safe and stimulating environment. Parents will be guided through age-appropriate activities that promote development and bonding.",
    "min_age": 25,
    "max_age": 84,
    "duration_minutes": 60,
    "categories": [
      "Shot put"
    ],
    "game_is_active": true,
    "game_created_at": "2025-08-27T09:55:14.138Z",
    "game_updated_at": "2025-08-27T09:55:14.138Z",
    "image_id": 18,
    "image_url": "./upload/gamesimage/gameimage_1758000749370_7054.png",
    "image_priority": 3,
    "image_is_active": true,
    "image_created_at": "2025-09-16T00:02:29.897Z",
    "image_updated_at": "2025-09-16T00:02:29.897Z"
  },
  {
    "game_id": 22,
    "game_name": "Jumping Ball",
    "description": "This engaging jumping ball session is designed for babies aged 0-300 months. During this 60-minute activity, children will explore and develop various skills in a safe and stimulating environment. Parents will be guided through age-appropriate activities that promote development and bonding.",
    "min_age": 49,
    "max_age": 84,
    "duration_minutes": 60,
    "categories": [
      "Ball",
      "Jumping"
    ],
    "game_is_active": true,
    "game_created_at": "2025-09-12T00:24:56.427Z",
    "game_updated_at": "2025-09-12T00:24:56.427Z",
    "image_id": 19,
    "image_url": "./upload/gamesimage/gameimage_1758000770633_5067.png",
    "image_priority": 3,
    "image_is_active": true,
    "image_created_at": "2025-09-16T00:02:51.118Z",
    "image_updated_at": "2025-09-16T00:02:51.118Z"
  },
  {
    "game_id": 23,
    "game_name": "High Jump",
    "description": "This engaging high jump session is designed for babies aged 0-300 months. During this 60-minute activity, children will explore and develop various skills in a safe and stimulating environment. Parents will be guided through age-appropriate activities that promote development and bonding.",
    "min_age": 37,
    "max_age": 84,
    "duration_minutes": 60,
    "categories": [
      "Jump",
      "High"
    ],
    "game_is_active": true,
    "game_created_at": "2025-09-12T00:26:11.666Z",
    "game_updated_at": "2025-09-12T00:26:11.666Z",
    "image_id": 20,
    "image_url": "./upload/gamesimage/gameimage_1758000788631_8888.png",
    "image_priority": 1,
    "image_is_active": true,
    "image_created_at": "2025-09-16T00:03:09.127Z",
    "image_updated_at": "2025-09-16T00:03:09.127Z"
  }
]



