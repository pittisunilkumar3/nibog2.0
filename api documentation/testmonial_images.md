# create or update image for testimonial 

POST https://ai.nibog.in/webhook/nibog/testmonialimages/update

payload :-

{
  "testimonial_id": 101,
  "image_url": "https://example.com/images.jpg",
  "priority": 1,
  "is_active": true
}

response :- 

[
    {
        "id": 1,
        "testimonial_id": 101,
        "image_url": "https://example.com/images.jpg",
        "priority": 1,
        "is_active": true,
        "created_at": "2025-09-16T04:30:24.635Z",
        "updated_at": "2025-09-16T04:30:24.635Z"
    }
]



# get single testimonial image 

POST https://ai.nibog.in/webhook/nibog/testmonialimages/getsingle

payload :-


{
  "testmonial_id":69
}


Response :-

[
    {
        "id": 21,
        "testimonial_id": 69,
        "image_url": "https://example.com/test-priority-10.jpg",
        "priority": 10,
        "is_active": true,
        "created_at": "2025-09-16T09:42:07.153Z",
        "updated_at": "2025-09-16T09:42:07.153Z"
    }
]




GET https://ai.nibog.in/webhook/nibog/testmonialimages/get


response :-

[
    {
        "testimonial_id": 69,
        "testimonial_name": "Test Updated Priority",
        "city": "Delhi",
        "event_id": 121,
        "rating": 5,
        "testimonial": "Testing priority update",
        "submitted_at": "2025-09-14T18:30:00.000Z",
        "status": "Published",
        "image_id": 21,
        "image_url": "./upload/testmonialimage/testimonial_1758035523364_5598.png",
        "image_priority": 1,
        "image_is_active": true,
        "image_created_at": "2025-09-16T09:42:07.153Z",
        "image_updated_at": "2025-09-16T09:42:07.153Z"
    }
]

