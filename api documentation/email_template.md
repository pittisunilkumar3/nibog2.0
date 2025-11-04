# created template

POST https://ai.nibog.in/webhook/v1/nibog/emailtemplate/create

payload:- 

{
  "template_name": "Event Reminder ",
  "default_subject": "Reminder: {{event_name}} on {{event_date}} ",
  "template_content": "Hi {{name}},\n\nThis is a friendly reminder for the event '{{event_name}}' happening on {{event_date}} at {{venue}}.\n\nIf you have any questions, feel free to reply to this email: {{email}}.\n\nThank you!"
}
response:- 
[
    {
        "id": 5,
        "template_name": "Event Reminder ",
        "default_subject": "Reminder: {{event_name}} on {{event_date}} ",
        "template_content": "Hi {{name}},\n\nThis is a friendly reminder for the event '{{event_name}}' happening on {{event_date}} at {{venue}}.\n\nIf you have any questions, feel free to reply to this email: {{email}}.\n\nThank you!",
        "created_at": "2025-07-30T11:37:18.368Z",
        "updated_at": "2025-07-30T11:37:18.368Z"
    }
]





# get all templates

GET https://ai.nibog.in/webhook/v1/nibog/emailtemplate/get-all


response:- 

[
    {
        "id": 5,
        "template_name": "Event Reminder",
        "default_subject": "Reminder: {{event_name}} on {{event_date}} ",
        "template_content": "Hi {{name}},\n\nThis is a friendly reminder for the event '{{event_name}}' happening on {{event_date}} at {{venue}}.\n\nIf you have any questions, feel free to reply to this email: {{email}}.\n\nThank you!",
        "created_at": "2025-07-30T11:37:18.368Z",
        "updated_at": "2025-07-30T11:37:18.368Z"
    },
    {
        "id": 4,
        "template_name": "Booking Confirmation",
        "default_subject": "Booking Confirmation for {{event_name}}",
        "template_content": "Hi {{name}},\n\nYour booking for the event '{{event_name}}' has been confirmed. Your booking reference is {{booking_ref}}.\n\nThank you!",
        "created_at": "2025-07-30T11:36:16.026Z",
        "updated_at": "2025-07-30T11:36:16.026Z"
    }
]



# get template by id

POST https://ai.nibog.in/webhook/v1/nibog/emailtemplate/get

payload:- 

{
    "id": 5
}

response:- 

[
    {
        "id": 5,
        "template_name": "Event Reminder ",
        "default_subject": "Reminder: {{event_name}} on {{event_date}} ",
        "template_content": "Hi {{name}},\n\nThis is a friendly reminder for the event '{{event_name}}' happening on {{event_date}} at {{venue}}.\n\nIf you have any questions, feel free to reply to this email: {{email}}.\n\nThank you!",
        "created_at": "2025-07-30T11:37:18.368Z",
        "updated_at": "2025-07-30T11:37:18.368Z"
    }
]




# delete template

POST https://ai.nibog.in/webhook/v1/nibog/emailtemplate/delete

payload:- 

{
    "id": 5
}

response:- 

[
    {
        "success": true
    }
]







# update template

POST https://ai.nibog.in/webhook/v1/nibog/emailtemplate/update

payload:- 

{
    "id": 5,
    "template_name": "Event Reminder ",
    "default_subject": "Reminder: {{event_name}} on {{event_date}} ",
"template_content": "Hi {{name}},\n\nThis is a friendly reminder for the event '{{event_name}}' happening on {{event_date}} at {{venue}}.\n\nIf you have any questions, feel free to reply to this email: {{email}}.\n\nThank you!"
}

response:- 

[
    {
        "id": 5,
        "template_name": "Event Reminder ",
        "default_subject": "Reminder: {{event_name}} on {{event_date}} ",
"template_content": "Hi {{name}},\n\nThis is a friendly reminder for the event '{{event_name}}' happening on {{event_date}} at {{venue}}.\n\nIf you have any questions, feel free to reply to this email: {{email}}.\n\nThank you!",
        "created_at": "2025-07-30T11:37:18.368Z",
"updated_at": "2025-07-30T11:37:18.368Z"
    }
]




