## Certificate Templates API

### Create Certificate Template

**POST** https://ai.nibog.in/webhook/v1/nibog/certificate-templates/create

Payload

```json
 {
  "name": "Winner Certificate",
  "description": "Certificate awarded to winners of the event",
  "type": "winner",
  "background_image": "/images/certificatetemplates/template_1749795583929_376.jpeg",
  "paper_size": "a4",
  "orientation": "landscape",
  "fields": [
    {
      "id": "1",
      "name": "Participant Name",
      "type": "text",
      "required": true,
      "x": 50,
      "y": 40,
      "font_size": 24,
      "font_family": "Arial",
      "color": "#000000"
    }
  ],
  "appreciation_text": "For achieving {achievement} in {event_name}. Your dedication, talent, and outstanding performance at NIBOG have distinguished you among the best. Congratulations on this remarkable achievement from the entire NIBOG team!"
}
```

Response (201 Created)

```json
[
  {
    "id": 20,
    "name": "Winner Certificate",
    "description": "Certificate awarded to winners of the event",
    "type": "winner",
    "background_image": "/images/certificatetemplates/template_1749795583929_376.jpeg",
    "paper_size": "a4",
    "orientation": "landscape",
    "fields": [
      {
        "x": 50,
        "y": 40,
        "id": "1",
        "name": "Participant Name",
        "type": "text",
        "color": "#000000",
        "required": true,
        "font_size": 24,
        "font_family": "Arial"
      }
    ],
    "is_active": true,
    "created_at": "2025-06-16T02:26:05.240Z",
    "updated_at": "2025-06-16T02:26:05.240Z",
    "appreciation_text": "For achieving {achievement} in {event_name}. Your dedication, talent, and outstanding performance at NIBOG have distinguished you among the best. Congratulations on this remarkable achievement from the entire NIBOG team!"
  }
]
```


-------------------------------------------------


{
  "name": "Employee of the Month Template",
  "description": "Template for employee recognition certificates",
  "type": "participation",
  "certificate_title": "Certificate of Appreciation",
  "certificate_title_style": {
    "position": { "x": 150, "y": 200 },
    "font": { "family": "Arial", "size": 36, "weight": "bold" },
    "color": "#000000",
    "alignment": "center"
  },
  "background_image": "/images/certificates/template_1_bg.jpg",
  "background_style": {
    "type": "gradient",
    "colors": ["#ffffff", "#f0f0f0"]
  },
  "paper_size": "a4",
  "orientation": "landscape",
  "fields": [
    {
      "id": "1",
      "name": "Participant Name",
      "type": "text",
      "required": true,
      "x": 50,
      "y": 40,
      "font_size": 24,
      "font_family": "Arial",
      "color": "#000000"
    },
    {
      "id": "1",
      "name": "Participant Name",
      "type": "text",
      "required": true,
      "x": 50,
      "y": 40,
      "font_size": 24,
      "font_family": "Arial",
      "color": "#000000"
    }
  ],
  "appreciation_text": "In recognition of outstanding performance and dedication.",
  "appreciation_text_style": {
    "position": { "x": 150, "y": 600 },
    "font": { "family": "Georgia", "size": 20, "style": "italic" },
    "color": "#555555",
    "alignment": "center"
  },
  "signature_image": "/images/signatures/director_sig.png"
}


### Get All Certificate Templates

**GET** https://ai.nibog.in/webhook/v1/nibog/certificate-templates/get-all

Response (200 OK)

```json
[
  {
    "id": 2,
    "name": "Participation Certificate",
    "description": "General participation certificate for all events",
    "type": "participation",
    "background_image": "/images/certificatetemplates/template_1749795583929_376.jpeg",
    "paper_size": "a4",
    "orientation": "landscape",
    "fields": [
      {
        "x": 50,
        "y": 40,
        "id": "1",
        "name": "Participant Name",
        "type": "text",
        "color": "#000000",
        "required": true,
        "font_size": 24,
        "font_family": "Arial"
      }
    ],
    "is_active": true,
    "created_at": "2025-06-13T06:25:20.361Z",
    "updated_at": "2025-06-13T06:25:20.361Z"
  }
]
```

### Get Certificate Template by ID

**POST** https://ai.nibog.in/webhook/v1/nibog/certificate-templates/get

Payload

```json
{
  "id": 2
}
```

Response (200 OK)

```json
[
  {
    "id": 2,
    "name": "Participation Certificate",
    "description": "General participation certificate for all events",
    "type": "participation",
    "background_image": "/images/certificatetemplates/template_1749795583929_376.jpeg",
    "paper_size": "a4",
    "orientation": "landscape",
    "fields": [
      {
        "x": 50,
        "y": 40,
        "id": "1",
        "name": "Participant Name",
        "type": "text",
        "color": "#000000",
        "required": true,
        "font_size": 24,
        "font_family": "Arial"
      }
    ],
    "is_active": true,
    "created_at": "2025-06-13T06:25:20.361Z",
    "updated_at": "2025-06-13T06:25:20.361Z"
  }
]
```

### Update Certificate Template

**POST** https://ai.nibog.in/webhook/v1/nibog/certificate-templates/update

Payload

```json
{
  "id": 2,
  "name": "Updated Participation Certificate",
  "description": "Updated description for participation certificate",
  "type": "participation",
  "background_image": "/images/certificatetemplates/template_1749795583929_376.jpeg",
  "paper_size": "a4",
  "orientation": "portrait",
  "fields": [
    {
      "x": 50,
      "y": 40,
      "id": "1",
      "name": "Participant Name",
      "type": "text",
      "color": "#000000",
      "required": true,
      "font_size": 26,
      "font_family": "Arial"
    },
    {
      "x": 50,
      "y": 50,
      "id": "2",
      "name": "Event Name",
      "type": "text",
      "color": "#000000",
      "required": true,
      "font_size": 20,
      "font_family": "Arial"
    }
  ],
  "is_active": true
}
```

Response (200 OK)

```json
[
  {
    "success": true
  }
]
```

### Delete Certificate Template

**POST** https://ai.nibog.in/webhook/v1/nibog/certificate-templates/delete

Payload

```json
{
  "id": 2
}
```

Response (200 OK)

```json
{
  "success": true
}
```

### Get Certificate Templates by Type

**POST** https://ai.nibog.in/webhook/v1/nibog/certificate-templates/by-type

Payload

```json
{
  "type": "participation"
}
```

Response (200 OK)

```json
[
  {
    "id": 3,
    "name": "Participation Certificate",
    "description": "General participation certificate for all events",
    "type": "participation",
    "background_image": "/images/certificatetemplates/template_1749795583929_376.jpeg",
    "paper_size": "a4",
    "orientation": "landscape",
    "fields": [
      {
        "x": 50,
        "y": 40,
        "id": "1",
        "name": "Participant Name",
        "type": "text",
        "color": "#000000",
        "required": true,
        "font_size": 24,
        "font_family": "Arial"
      }
    ],
    "is_active": true,
    "created_at": "2025-06-13T07:09:05.042Z",
    "updated_at": "2025-06-13T07:09:05.043Z"
  }
]
```

---

## Certificate Generation APIs

### Generate Single Certificate

**POST** https://ai.nibog.in/webhook/v1/nibog/certificate/generate-single

Payload

```json
{
  "template_id": 25,
  "event_id": 11,
  "game_id": 2,
  "user_id": 4, // This could be null or omitted if backend does lookup
  "parent_id": 35, // The parent_id from participants data
  "child_id": 5,
  "certificate_data": {
    "participant_name": "John Doe",
    "event_name": "Baby Olympics 2025",
    "date": "2025-06-13",
    "position": "1st Place",
    "score": "95"
  }
}
```

Response (201 Created)

```json
[
  {
    "id": 5,
    "template_id": 25,
    "event_id": 11,
    "game_id": 2,
    "user_id": 4,
    "child_id": 5,
    "certificate_data": {
      "city_name": "Hyderabad",
      "event_name": "Spring Carnival",
      "venue_name": "NIBOG Stadium",
      "certificate_number": "CERT-1750082715606-ITGGYL"
    },
    "pdf_url": null,
    "status": "generated",
    "generated_at": "2025-06-16T08:41:30.702Z",
    "sent_at": null,
    "downloaded_at": null,
    "parent_email": "saarah",
    "parent_name": "sarah@example.com"
  }
]

### Download Certificate PDF

**GET** https://ai.nibog.in/webhook/v1/nibog/certificates/download/{certificate_id}

**Example**: GET https://ai.nibog.in/webhook/v1/nibog/certificates/download/0

Response: 
[
  {
    "html": "\n<!DOCTYPE html>\n<html>\n<head>\n  <style>\n    @page { \n      size: a4 landscape; \n      margin: 0; \n    }\n    body { \n      margin: 0; \n      font-family: Arial; \n      width: 100%;\n      height: 100vh;\n    }\n    .certificate-container {\n      width: 100%;\n      height: 100vh;\n      background-image: url('https://nibog.in/images/certificatetemplates/template_1749795583929_376.jpeg');\n      background-size: cover;\n      background-position: center;\n      background-repeat: no-repeat;\n      position: relative;\n    }\n    .field { \n      position: absolute; \n      text-align: center; \n    }\n  </style>\n</head>\n<body>\n  <div class=\"certificate-container\">\n    \n        <div class=\"field\" style=\"\n          left: 50%; \n          top: 40%; \n          font-size: 24px;\n          color: #000000;\n          font-family: 'Arial', sans-serif;\n          font-weight: bold;\n        \">\n          Alice Doe\n        </div>\n      \n  </div>\n</body>\n</html>\n",
    "certificate_id": 0,
    "filename": "certificate_0_1749813379294.pdf",
    "pdf_path": "/certificates/certificate_0_1749813379294.pdf",
    "full_path": "public/certificates/certificate_0_1749813379294.pdf"
  }
]

### Get Certificate Generation Status

**GET** https://ai.nibog.in/webhook/v1/nibog/certificates/status/{event_id}

**Example**: GET https://ai.nibog.in/webhook/v1/nibog/certificates/status/5

Response (200 OK)

```json
{
  "event_id": 5,
  "total_participants": 50,
  "certificates_generated": 45,
  "certificates_sent": 30,
  "certificates_downloaded": 15,
  "generation_status": "completed",
  "last_generated_at": "2025-06-13T06:30:00Z"
}
```

### Get Event Participants for Certificate Generation

**GET** https://ai.nibog.in/webhook/v1/nibog/events/participants?event_id=11

Response (200 OK)

```json
[
  {
    "event_date": "2025-05-09T18:30:00.000Z",
    "venue_name": "NIBOG Stadium",
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
        "event_title": "Spring Carnival",
        "event_date": "2025-05-09T18:30:00.000Z",
        "venue_name": "NIBOG Stadium",
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
        "event_title": "Spring Carnival",
        "event_date": "2025-05-09T18:30:00.000Z",
        "venue_name": "NIBOG Stadium",
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
        "event_title": "Spring Carnival",
        "event_date": "2025-05-09T18:30:00.000Z",
        "venue_name": "NIBOG Stadium",
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
        "event_title": "Spring Carnival",
        "event_date": "2025-05-09T18:30:00.000Z",
        "venue_name": "NIBOG Stadium",
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
        "event_title": "Spring Carnival",
        "event_date": "2025-05-09T18:30:00.000Z",
        "venue_name": "NIBOG Stadium",
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
        "event_title": "Spring Carnival",
        "event_date": "2025-05-09T18:30:00.000Z",
        "venue_name": "NIBOG Stadium",
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
        "event_title": "Spring Carnival",
        "event_date": "2025-05-09T18:30:00.000Z",
        "venue_name": "NIBOG Stadium",
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
        "event_title": "Spring Carnival",
        "event_date": "2025-05-09T18:30:00.000Z",
        "venue_name": "NIBOG Stadium",
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
        "event_title": "Spring Carnival",
        "event_date": "2025-05-09T18:30:00.000Z",
        "venue_name": "NIBOG Stadium",
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
        "event_title": "Spring Carnival",
        "event_date": "2025-05-09T18:30:00.000Z",
        "venue_name": "NIBOG Stadium",
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
        "event_title": "Spring Carnival",
        "event_date": "2025-05-09T18:30:00.000Z",
        "venue_name": "NIBOG Stadium",
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
        "event_title": "Spring Carnival",
        "event_date": "2025-05-09T18:30:00.000Z",
        "venue_name": "NIBOG Stadium",
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
        "event_title": "Spring Carnival",
        "event_date": "2025-05-09T18:30:00.000Z",
        "venue_name": "NIBOG Stadium",
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
        "event_title": "Spring Carnival",
        "event_date": "2025-05-09T18:30:00.000Z",
        "venue_name": "NIBOG Stadium",
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
        "event_title": "Spring Carnival",
        "event_date": "2025-05-09T18:30:00.000Z",
        "venue_name": "NIBOG Stadium",
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
        "event_title": "Spring Carnival",
        "event_date": "2025-05-09T18:30:00.000Z",
        "venue_name": "NIBOG Stadium",
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
        "event_title": "Spring Carnival",
        "event_date": "2025-05-09T18:30:00.000Z",
        "venue_name": "NIBOG Stadium",
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
        "event_title": "Spring Carnival",
        "event_date": "2025-05-09T18:30:00.000Z",
        "venue_name": "NIBOG Stadium",
        "game_name": "Obstacle Course"
      }
    ]
  }
]

## Get all generated certificates

**GET** https://ai.nibog.in/webhook/v1/nibog/certificates/get-all

Response (200 OK)

```json
[
  {
    "id": 20,
    "template_id": 25,
    "event_id": 11,
    "game_id": 2,
    "user_id": 8,
    "child_id": 36,
    "certificate_data": {
      "city_name": "Hyderabad",
      "event_name": "Spring Carnival",
      "venue_name": "NIBOG Stadium",
      "certificate_number": "CERT-1750086985546-CGN763"
    },
    "pdf_url": null,
    "status": "generated",
    "generated_at": "2025-06-16T09:46:25.559Z",
    "sent_at": null,
    "downloaded_at": null,
    "parent_email": "sneha",
    "parent_name": "sneha@example.com",
    "game_name": "Obstacle Course",
    "child_name": "dimbuu"
  },
  {
    "id": 19,
    "template_id": 25,
    "event_id": 11,
    "game_id": 4,
    "user_id": 8,
    "child_id": 36,
    "certificate_data": {
      "city_name": "Hyderabad",
      "event_name": "Spring Carnival",
      "venue_name": "NIBOG Stadium",
      "certificate_number": "CERT-1750086985139-C5N4S3"
    },
    "pdf_url": null,
    "status": "generated",
    "generated_at": "2025-06-16T09:46:25.148Z",
    "sent_at": null,
    "downloaded_at": null,
    "parent_email": "sneha",
    "parent_name": "sneha@example.com",
    "game_name": "Baby Crawling",
    "child_name": "dimbuu"
  },
  {
    "id": 18,
    "template_id": 25,
    "event_id": 11,
    "game_id": 2,
    "user_id": 4,
    "child_id": 35,
    "certificate_data": {
      "city_name": "Hyderabad",
      "event_name": "Spring Carnival",
      "venue_name": "NIBOG Stadium",
      "certificate_number": "CERT-1750086984813-R2RQKE"
    },
    "pdf_url": null,
    "status": "generated",
    "generated_at": "2025-06-16T09:46:24.824Z",
    "sent_at": null,
    "downloaded_at": null,
    "parent_email": "saarah",
    "parent_name": "sarah@example.com",
    "game_name": "Obstacle Course",
    "child_name": "dimbuu"
  },
  {
    "id": 17,
    "template_id": 25,
    "event_id": 11,
    "game_id": 4,
    "user_id": 4,
    "child_id": 35,
    "certificate_data": {
      "city_name": "Hyderabad",
      "event_name": "Spring Carnival",
      "venue_name": "NIBOG Stadium",
      "certificate_number": "CERT-1750086984394-0UAXGB"
    },
    "pdf_url": null,
    "status": "generated",
    "generated_at": "2025-06-16T09:46:24.406Z",
    "sent_at": null,
    "downloaded_at": null,
    "parent_email": "saarah",
    "parent_name": "sarah@example.com",
    "game_name": "Baby Crawling",
    "child_name": "dimbuu"
  },
  {
    "id": 16,
    "template_id": 25,
    "event_id": 11,
    "game_id": 4,
    "user_id": 4,
    "child_id": 35,
    "certificate_data": {
      "city_name": "Hyderabad",
      "event_name": "Spring Carnival",
      "venue_name": "NIBOG Stadium",
      "certificate_number": "CERT-1750086952266-P9WQXD"
    },
    "pdf_url": null,
    "status": "generated",
    "generated_at": "2025-06-16T09:45:52.279Z",
    "sent_at": null,
    "downloaded_at": null,
    "parent_email": "saarah",
    "parent_name": "sarah@example.com",
    "game_name": "Baby Crawling",
    "child_name": "dimbuu"
  },
  {
    "id": 15,
    "template_id": 25,
    "event_id": 11,
    "game_id": null,
    "user_id": 4,
    "child_id": 35,
    "certificate_data": {
      "city_name": "Hyderabad",
      "event_name": "Spring Carnival",
      "venue_name": "NIBOG Stadium",
      "certificate_number": "CERT-1750086497426-5PBAYP"
    },
    "pdf_url": null,
    "status": "generated",
    "generated_at": "2025-06-16T09:38:17.435Z",
    "sent_at": null,
    "downloaded_at": null,
    "parent_email": "saarah",
    "parent_name": "sarah@example.com",
    "game_name": null,
    "child_name": "dimbuu"
  },
  {
    "id": 14,
    "template_id": 25,
    "event_id": 11,
    "game_id": null,
    "user_id": 4,
    "child_id": 35,
    "certificate_data": {
      "city_name": "Hyderabad",
      "event_name": "Spring Carnival",
      "venue_name": "NIBOG Stadium",
      "certificate_number": "CERT-1750086321967-YGUC0D"
    },
    "pdf_url": null,
    "status": "generated",
    "generated_at": "2025-06-16T09:35:21.984Z",
    "sent_at": null,
    "downloaded_at": null,
    "parent_email": "saarah",
    "parent_name": "sarah@example.com",
    "game_name": null,
    "child_name": "dimbuu"
  },
  {
    "id": 13,
    "template_id": 25,
    "event_id": 11,
    "game_id": null,
    "user_id": 4,
    "child_id": 35,
    "certificate_data": {
      "city_name": "Hyderabad",
      "event_name": "Spring Carnival",
      "venue_name": "NIBOG Stadium",
      "certificate_number": "CERT-1750085113294-KDSJ8P"
    },
    "pdf_url": null,
    "status": "generated",
    "generated_at": "2025-06-16T09:15:13.307Z",
    "sent_at": null,
    "downloaded_at": null,
    "parent_email": "saarah",
    "parent_name": "sarah@example.com",
    "game_name": null,
    "child_name": "dimbuu"
  },
  {
    "id": 12,
    "template_id": 25,
    "event_id": 11,
    "game_id": null,
    "user_id": 4,
    "child_id": 35,
    "certificate_data": {
      "city_name": "Hyderabad",
      "event_name": "Spring Carnival",
      "venue_name": "NIBOG Stadium",
      "certificate_number": "CERT-1750084718161-1RDHQC"
    },
    "pdf_url": null,
    "status": "generated",
    "generated_at": "2025-06-16T09:08:38.173Z",
    "sent_at": null,
    "downloaded_at": null,
    "parent_email": "saarah",
    "parent_name": "sarah@example.com",
    "game_name": null,
    "child_name": "dimbuu"
  },
  {
    "id": 11,
    "template_id": 25,
    "event_id": 11,
    "game_id": null,
    "user_id": 8,
    "child_id": 36,
    "certificate_data": {
      "city_name": "Hyderabad",
      "event_name": "Spring Carnival",
      "venue_name": "NIBOG Stadium",
      "certificate_number": "CERT-1750084353101-WWVMHT"
    },
    "pdf_url": null,
    "status": "generated",
    "generated_at": "2025-06-16T09:02:33.110Z",
    "sent_at": null,
    "downloaded_at": null,
    "parent_email": "sneha",
    "parent_name": "sneha@example.com",
    "game_name": null,
    "child_name": "dimbuu"
  },
  {
    "id": 10,
    "template_id": 25,
    "event_id": 11,
    "game_id": null,
    "user_id": 8,
    "child_id": 36,
    "certificate_data": {
      "city_name": "Hyderabad",
      "event_name": "Spring Carnival",
      "venue_name": "NIBOG Stadium",
      "certificate_number": "CERT-1750084352436-3MN2S8"
    },
    "pdf_url": null,
    "status": "generated",
    "generated_at": "2025-06-16T09:02:32.443Z",
    "sent_at": null,
    "downloaded_at": null,
    "parent_email": "sneha",
    "parent_name": "sneha@example.com",
    "game_name": null,
    "child_name": "dimbuu"
  },
  {
    "id": 9,
    "template_id": 25,
    "event_id": 11,
    "game_id": null,
    "user_id": 4,
    "child_id": 35,
    "certificate_data": {
      "city_name": "Hyderabad",
      "event_name": "Spring Carnival",
      "venue_name": "NIBOG Stadium",
      "certificate_number": "CERT-1750084352093-7K0JBA"
    },
    "pdf_url": null,
    "status": "generated",
    "generated_at": "2025-06-16T09:02:32.103Z",
    "sent_at": null,
    "downloaded_at": null,
    "parent_email": "saarah",
    "parent_name": "sarah@example.com",
    "game_name": null,
    "child_name": "dimbuu"
  },
  {
    "id": 8,
    "template_id": 25,
    "event_id": 11,
    "game_id": null,
    "user_id": 4,
    "child_id": 35,
    "certificate_data": {
      "city_name": "Hyderabad",
      "event_name": "Spring Carnival",
      "venue_name": "NIBOG Stadium",
      "certificate_number": "CERT-1750084351756-A1RUN2"
    },
    "pdf_url": null,
    "status": "generated",
    "generated_at": "2025-06-16T09:02:31.769Z",
    "sent_at": null,
    "downloaded_at": null,
    "parent_email": "saarah",
    "parent_name": "sarah@example.com",
    "game_name": null,
    "child_name": "dimbuu"
  },
  {
    "id": 7,
    "template_id": 25,
    "event_id": 11,
    "game_id": null,
    "user_id": 4,
    "child_id": 35,
    "certificate_data": {
      "city_name": "Hyderabad",
      "event_name": "Spring Carnival",
      "venue_name": "NIBOG Stadium",
      "certificate_number": "CERT-1750083675623-MVXTGM"
    },
    "pdf_url": null,
    "status": "generated",
    "generated_at": "2025-06-16T08:51:15.641Z",
    "sent_at": null,
    "downloaded_at": null,
    "parent_email": "saarah",
    "parent_name": "sarah@example.com",
    "game_name": null,
    "child_name": "dimbuu"
  },
  {
    "id": 6,
    "template_id": 25,
    "event_id": 11,
    "game_id": null,
    "user_id": 4,
    "child_id": 35,
    "certificate_data": {
      "city_name": "Hyderabad",
      "event_name": "Spring Carnival",
      "venue_name": "NIBOG Stadium",
      "certificate_number": "CERT-1750083544281-9X8RAF"
    },
    "pdf_url": null,
    "status": "generated",
    "generated_at": "2025-06-16T08:49:04.299Z",
    "sent_at": null,
    "downloaded_at": null,
    "parent_email": "saarah",
    "parent_name": "sarah@example.com",
    "game_name": null,
    "child_name": "dimbuu"
  },
  {
    "id": 5,
    "template_id": 25,
    "event_id": 11,
    "game_id": 2,
    "user_id": 4,
    "child_id": 5,
    "certificate_data": {
      "city_name": "Hyderabad",
      "event_name": "Spring Carnival",
      "venue_name": "NIBOG Stadium",
      "certificate_number": "CERT-1750082715606-ITGGYL"
    },
    "pdf_url": null,
    "status": "generated",
    "generated_at": "2025-06-16T08:41:30.702Z",
    "sent_at": null,
    "downloaded_at": null,
    "parent_email": "saarah",
    "parent_name": "sarah@example.com",
    "game_name": "Obstacle Course",
    "child_name": "Alice Doe"
  },
  {
    "id": 4,
    "template_id": 25,
    "event_id": 11,
    "game_id": 2,
    "user_id": 4,
    "child_id": 5,
    "certificate_data": {
      "city_name": "Hyderabad",
      "event_name": "Spring Carnival",
      "venue_name": "NIBOG Stadium",
      "certificate_number": "CERT-1750082399851-52JLY7"
    },
    "pdf_url": null,
    "status": "generated",
    "generated_at": "2025-06-16T08:29:59.867Z",
    "sent_at": null,
    "downloaded_at": null,
    "parent_email": null,
    "parent_name": null,
    "game_name": "Obstacle Course",
    "child_name": "Alice Doe"
  },
  {
    "id": 0,
    "template_id": 3,
    "event_id": 11,
    "game_id": 2,
    "user_id": 4,
    "child_id": 5,
    "certificate_data": {
      "city_name": "Hyderabad",
      "event_name": "Spring Carnival",
      "venue_name": "NIBOG Stadium",
      "certificate_number": "CERT-1749806228024-CD3YI7"
    },
    "pdf_url": null,
    "status": "generated",
    "generated_at": "2025-06-13T03:47:19.983Z",
    "sent_at": null,
    "downloaded_at": null,
    "parent_email": null,
    "parent_name": null,
    "game_name": "Obstacle Course",
    "child_name": "Alice Doe"
  }
]

## Get all generated certificates

**POST** https://ai.nibog.in/webhook/v1/nibog/certificates/get

Request Body

```json
{
  "id": 0
}
```

Response (200 OK)

```json
[
  {
    "id": 0,
    "template_id": 3,
    "event_id": 11,
    "game_id": 2,
    "user_id": 4,
    "child_id": 5,
    "certificate_data": {
      "city_name": "Hyderabad",
      "event_name": "Spring Carnival",
      "venue_name": "NIBOG Stadium",
      "certificate_number": "CERT-1749806228024-CD3YI7"
    },
    "pdf_url": null,
    "status": "generated",
    "generated_at": "2025-06-13T03:47:19.983Z",
    "sent_at": null,
    "downloaded_at": null,
    "parent_email": null,
    "parent_name": null,
    "game_name": "Obstacle Course",
    "child_name": "Alice Doe"
  }
]
```