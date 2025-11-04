## create email setting

POST https://ai.nibog.in/webhook/v1/nibog/emailsetting/create


Payload

{
  "smtp_host": "smtp.example.com",
  "smtp_port": 587,
  "smtp_username": "notifications@nibog.in",
  "smtp_password": "securePassword123!",
  "sender_name": "NIBOG Team",
  "sender_email": "notifications@nibog.in"
}

Response

[
  {
    "id": 1,
    "smtp_host": "smtp.example.com",
    "smtp_port": 587,
    "smtp_username": "notifications@nibog.in",
    "smtp_password": "securePassword123!",
    "sender_name": "NIBOG Team",
    "sender_email": "notifications@nibog.in",
    "created_at": "2025-05-05T07:42:19.317Z",
    "updated_at": "2025-05-05T07:42:19.317Z"
  }
]

## get email setting

GET https://ai.nibog.in/webhook/v1/nibog/emailsetting/get


Response

[
  {
    "id": 1,
    "smtp_host": "smtp.example.com",
    "smtp_port": 587,
    "smtp_username": "notifications@nibog.in",
    "smtp_password": "securePassword123!",
    "sender_name": "NIBOG Team",
    "sender_email": "notifications@nibog.in",
    "created_at": "2025-05-05T07:42:19.317Z",
    "updated_at": "2025-05-05T07:42:19.317Z"
  }
]



