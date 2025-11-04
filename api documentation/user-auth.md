## user auth register

POST https://ai.nibog.in/webhook/v1/nibog/user/register

payload

{
  "full_name": "John Doe",
  "email": "john.doe@example.com",
  "phone": "+1234567890",
  "password": "SecurePassword123!",
  "city_id": 1,  // Reference to cities table
  "accept_terms": true
}

response

[
    {
        "user_id": 2,
        "full_name": "John Doe",
        "email": "john.doe@example.com",
        "email_verified": false,
        "phone": "+1234567890",
        "phone_verified": false,
        "password_hash": "SecurePassword123!",
        "city_id": 1,
        "accepted_terms": false,
        "terms_accepted_at": null,
        "is_active": true,
        "is_locked": false,
        "locked_until": null,
        "deactivated_at": null,
        "created_at": "2025-05-06T13:18:53.107Z",
        "updated_at": "2025-05-06T13:18:53.107Z",
        "last_login_at": null
    }
]

## user auth login

POST https://ai.nibog.in/webhook/v1/nibog/user/login

payload

{
  "email": "john.doe@example.com",
  "password": "SecurePassword123!",
  "device_info": {
    "device_id": "abc123xyz",
    "os": "Android",
    "os_version": "12",
    "browser": "Chrome",
    "ip_address": "192.168.1.100"
  }
}

response


[
    {
        "object": {
            "user_id": 2,
            "full_name": "John Doe",
            "email": "john.doe@example.com",
            "email_verified": false,
            "phone": "+1234567890",
            "phone_verified": false,
            "password_hash": "SecurePassword123!",
            "city_id": 1,
            "accepted_terms": false,
            "terms_accepted_at": null,
            "is_active": true,
            "is_locked": false,
            "locked_until": null,
            "deactivated_at": null,
            "created_at": "2025-05-06T13:18:53.107Z",
            "updated_at": "2025-05-06T13:18:53.107Z",
            "last_login_at": null
        }
    }
]


if login failed

[]

## get all users

GET https://ai.nibog.in/webhook/v1/nibog/user/get-all

response

[
  {
    "user_id": 2,
    "full_name": "John Doe",
    "email": "john.doe@example.com",
    "email_verified": false,
    "phone": "+1234567890",
    "phone_verified": false,
    "password_hash": "SecurePassword123!",
    "city_id": 1,
    "accepted_terms": false,
    "terms_accepted_at": null,
    "is_active": true,
    "is_locked": false,
    "locked_until": null,
    "deactivated_at": null,
    "created_at": "2025-05-06T13:18:53.107Z",
    "updated_at": "2025-05-06T13:18:53.107Z",
    "last_login_at": null,
    "city_name": "Hyderbad",
    "state": "AP"
  },
  {
    "user_id": 3,
    "full_name": "sunil",
    "email": "user@gmail.com",
    "email_verified": false,
    "phone": "6303727148",
    "phone_verified": false,
    "password_hash": "Neelarani@10",
    "city_id": 1,
    "accepted_terms": false,
    "terms_accepted_at": null,
    "is_active": true,
    "is_locked": false,
    "locked_until": null,
    "deactivated_at": null,
    "created_at": "2025-05-06T15:33:06.754Z",
    "updated_at": "2025-05-06T15:33:06.754Z",
    "last_login_at": null,
    "city_name": "Hyderbad",
    "state": "AP"
  }
]

## delete user

POST https://ai.nibog.in/webhook/v1/nibog/user/delete

payload

{
  "user_id": 2
}


response

[
  {
    "success": true
  }
]

## update user

POST https://ai.nibog.in/webhook/v1/nibog/user/edit


payload

{
    "user_id":"1",
  "full_name": "John Doe",
  "email": "john.doe@example.com",
  "phone": "+1234567890",
  "password": "SecurePassword123!",
  "city_id": 1,  // Reference to cities table
  "accept_terms": true
}

response


[
    {
        "user_id": 2,
        "full_name": "John Doe",
        "email": "john.doe@example.com",
        "email_verified": false,
        "phone": "+1234567890",
        "phone_verified": false,
        "password_hash": "SecurePassword123!",
        "city_id": 1,
        "accepted_terms": false,
        "terms_accepted_at": null,
        "is_active": true,
        "is_locked": false,
        "locked_until": null,
        "deactivated_at": null,
        "created_at": "2025-05-06T13:18:53.107Z",
        "updated_at": "2025-05-06T13:18:53.107Z",
        "last_login_at": null
    }
]



