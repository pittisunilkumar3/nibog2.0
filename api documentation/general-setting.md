## create general setting

POST https://ai.nibog.in/webhook/v1/nibog/generalsetting/create

payload

{
  "site_name": "NIBOG - New India Baby Olympics Games",
  "site_tagline": "India's Biggest Baby Games",
  "contact_email": "info@nibog.in",
  "contact_phone": "+919876543210",
  "address": "Gachibowli Indoor Stadium, Hyderabad, Telangana 500032",
  "logo": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
  "favicon": "data:image/x-icon;base64,AAABAAEAEBAQAAEA..."
}

response

[
  {
    "id": 1,
    "site_name": "NIBOG - New India Baby Olympics Games",
    "site_tagline": "India's Biggest Baby Games",
    "contact_email": "info@nibog.in",
    "contact_phone": "+919876543210",
    "address": "Gachibowli Indoor Stadium, Hyderabad, Telangana 500032",
    "logo": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
    "favicon": "data:image/x-icon;base64,AAABAAEAEBAQAAEA..."
  }
]

## get general setting

GET https://ai.nibog.in/webhook/v1/nibog/generalsetting/get

response

[
  {
    "id": 1,
    "site_name": "NIBOG - New India Baby Olympics Games",
    "site_tagline": "India's Biggest Baby Games",
    "contact_email": "info@nibog.in",
    "contact_phone": "+919876543210",
    "address": "Gachibowli Indoor Stadium, Hyderabad, Telangana 500032",
    "logo": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
    "favicon": "data:image/x-icon;base64,AAABAAEAEBAQAAEA..."
  }
]





