## create social media

POST https://ai.nibog.in/webhook/v1/nibog/socialmedia/create

Payload

{
  "facebook_url": "https://www.facebook.com/share/1K8H6SPtR5/",
  "instagram_url": "https://www.instagram.com/nibog_100?igsh=MWlnYXBiNDFydGQxYg%3D%3D&utm_source=qr",
  "linkedin_url": "https://www.linkedin.com/in/new-india-baby-olympicgames?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=ios_app",
  "youtube_url": "https://youtube.com/@newindiababyolympics?si=gdXw5mGsXA93brxB"
}

Response

[
  {
    "id": 1,
    "facebook_url": "https://www.facebook.com/share/1K8H6SPtR5/",
    "instagram_url": "https://www.instagram.com/nibog_100?igsh=MWlnYXBiNDFydGQxYg%3D%3D&utm_source=qr",
    "linkedin_url": "https://www.linkedin.com/in/new-india-baby-olympicgames?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=ios_app",
    "youtube_url": "https://youtube.com/@newindiababyolympics?si=gdXw5mGsXA93brxB",
    "created_at": "2025-05-05T07:42:19.317Z",
    "updated_at": "2025-05-05T07:42:19.317Z"
  }
]

## get social media

GET https://ai.nibog.in/webhook/v1/nibog/socialmedia/get


Response

[
  {
    "id": 1,
    "facebook_url": "https://www.facebook.com/share/1K8H6SPtR5/",
    "instagram_url": "https://www.instagram.com/nibog_100?igsh=MWlnYXBiNDFydGQxYg%3D%3D&utm_source=qr",
    "linkedin_url": "https://www.linkedin.com/in/new-india-baby-olympicgames?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=ios_app",
    "youtube_url": "https://youtube.com/@newindiababyolympics?si=gdXw5mGsXA93brxB",
    "created_at": "2025-05-05T07:42:19.317Z",
    "updated_at": "2025-05-05T07:42:19.317Z"
  }
]
