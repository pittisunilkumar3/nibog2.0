## creating the footer setting

POST :- https://ai.nibog.in/webhook/v1/nibog/footer_setting/post

payload :-

{
  "company_name": "Nibog Pvt Ltd",
  "company_description": "Nibog is a premium organizer of children's events like baby olympics, games, and fun educational activities.",
  "address": "NIBOG, P.No:18, H.NO 33-30/4, Officers Colony, R.K Puram, Hyderabad - 500056.",
  "phone": "+91-9876543210",
  "email": "support@nibog.com",
  "newsletter_enabled": true,
  "copyright_text": "© 2025 Nibog. All rights reserved."
}


responsive :-

[
  {
    "id": 1,
    "company_name": "Nibog Pvt Ltd",
    "company_description": "Nibog is a premium organizer of children's events like baby olympics, games, and fun educational activities.",
    "address": "NIBOG, P.No:18, H.NO 33-30/4, Officers Colony, R.K Puram, Hyderabad - 500056.",
    "phone": "+91-9876543210",
    "email": "support@nibog.com",
    "newsletter_enabled": true,
    "copyright_text": "© 2025 Nibog. All rights reserved."
  }
]


## get the footer setting

GET :- https://ai.nibog.in/webhook/v1/nibog/footer_setting/get

responsive :-

[
  {
    "company_name": "Nibog Pvt Ltd",
    "company_description": "Nibog is a premium organizer of children's events like baby olympics, games, and fun educational activities.",
    "address": "NIBOG, P.No:18, H.NO 33-30/4, Officers Colony, R.K Puram, Hyderabad - 500056.",
    "phone": "+91-9876543210",
    "email": "support@nibog.com",
    "newsletter_enabled": true,
    "copyright_text": "© 2025 Nibog. All rights reserved.",
    "facebook_url": "https://www.facebook.com/share/1K8H6SPtR5/",
    "instagram_url": "https://www.instagram.com/nibog_100?igsh=MWlnYXBiNDFydGQxYg%3D%3D&utm_source=qr",
    "linkedin_url": "https://www.linkedin.com/in/new-india-baby-olympicgames?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=ios_app",
    "youtube_url": "https://youtube.com/@newindiababyolympics?si=gdXw5mGsXA93brxB",
    "created_at": "2025-05-05T07:42:19.317Z",
    "updated_at": "2025-08-07T07:28:04.468Z"
  }
]


