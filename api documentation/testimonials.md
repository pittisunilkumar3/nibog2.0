## create testimonial

POST https://ai.nibog.in/webhook/v1/nibog/testimonials/create

payload

{
  "name": "John Doe",
  "city_id": "Mumbai",
  "event_id": 11,
  "rating": 4,
  "testimonial": "Great experience!",
  "date": "2025-06-08",
  "status": "Published"
}

response

[
  {
    "id": 0,
    "name": "John Doe",
    "city": "Mumbai",
    "event_id": 11,
    "rating": 4,
    "testimonial": "Great experience!",
    "submitted_at": "2025-06-08T00:00:00.000Z",
    "status": "Published"
  }
]

## get testimonial by id  

POST https://ai.nibog.in/webhook/v1/nibog/testimonials/get
{
    "id": 0
}

response

[
  {
    "id": 0,
    "name": "John Doe",
    "city": "Mumbai",
    "event_id": 11,
    "rating": 4,
    "testimonial": "Great experience!",
    "submitted_at": "2025-06-08T00:00:00.000Z",
    "status": "Published"
  }
]

## get all testimonials

GET https://ai.nibog.in/webhook/v1/nibog/testimonials/get-all

response

[
  {
    "id": 0,
    "name": "John Doe",
    "city": "Mumbai",
    "event_id": 11,
    "rating": 4,
    "testimonial": "Great experience!",
    "submitted_at": "2025-06-08T00:00:00.000Z",
    "status": "Published"
  }
]

## update testimonial

POST https://ai.nibog.in/webhook/v1/nibog/testimonials/update
{
  "id": 1,
  "name": "Uma",
  "city": "Mumbai",
  "event_id": 11,
  "rating": 4,
  "testimonial": "Great experience! updated testimonial",
  "date": "2025-06-08",
  "status": "Published"
}

response

[
  {
    "id": 1,
    "name": "Uma",
    "city": "Mumbai",
    "event_id": 11,
    "rating": 4,
    "testimonial": "Great experience! updated testimonial",
    "submitted_at": "2025-06-08T00:00:00.000Z",
    "status": "Published"
  }
]

## delete testimonial

POST https://ai.nibog.in/webhook/v1/nibog/testimonials/delete
{
    "id": 1
}

response

[
  {
    "success": true
  }
] 
