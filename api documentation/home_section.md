POST https://ai.nibog.in/webhook/v1/nibog/homesection/create

payload :-

{
  "image_path": "/uploads/home/section1.jpg",
  "status": "active"
}


response :-

[
    {
        "id": 1,
        "image_path": "/uploads/home/section1.jpg",
        "status": "active",
        "created_at": "2025-07-07T12:33:12.230Z",
        "updated_at": "2025-07-07T12:33:12.230Z"
    }
]





GET https://ai.nibog.in/webhook/v1/nibog/homesection/get


Response :-

[
    {
        "id": 2,
        "image_path": "public/images/blog/home/homehero_1751912207353_9806.jpg",
        "status": "active",
        "created_at": "2025-07-07T12:46:47.925Z",
        "updated_at": "2025-07-07T12:46:47.925Z"
    },
    {
        "id": 3,
        "image_path": "public/images/blog/home/homehero_1751912973507_5792.jpg",
        "status": "active",
        "created_at": "2025-07-07T12:59:34.453Z",
        "updated_at": "2025-07-07T12:59:34.453Z"
    }
]



POST https://ai.nibog.in/webhook/v1/nibog/homesection/delete

payload :-

{
    "id": 1
}

response :-

[
    {
        "success": true
    }
]
