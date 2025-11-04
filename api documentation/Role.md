## Create a Role

POST https://ai.nibog.in/webhook/v1/nibog/role/create
Content-Type: application/json

{
  "name": "admin",
  "description": "Full-access administrator"
}

Response (201 Created)

[
  {
    "id": 3,
    "name": "admin",
    "description": "Full-access administrator",
    "created_at": "2025-06-08T06:38:03.742Z",
    "updated_at": "2025-06-08T06:38:03.742Z"
  }
]

## Get a Role

POST https://ai.nibog.in/webhook/vl/nibog/role/get

Content-Type: application/json

{
    "id": 3
}

Response (201 Created)

[
  {
    "id": 3,
    "name": "admin",
    "description": "Full-access administrator",
    "created_at": "2025-06-08T06:54:09.919Z",
    "updated_at": "2025-06-08T06:54:09.919Z"
  }
]


## Get All Roles


GET https://ai.nibog.in/webhook/v1/nibog/role/list

Response (201 Created)

[
  {
    "id": 0,
    "name": "uma",
    "description": "role 3",
    "created_at": "2025-06-08T06:54:09.919Z",
    "updated_at": "2025-06-08T06:54:09.919Z"
  },
  {
    "id": 2,
    "name": "uma",
    "description": "create role 2",
    "created_at": "2025-06-03T09:57:20.085Z",
    "updated_at": "2025-06-03T09:57:20.085Z"
  },
  {
    "id": 3,
    "name": "admin",
    "description": "Full-access administrator",
    "created_at": "2025-06-08T06:38:03.742Z",
    "updated_at": "2025-06-08T06:38:03.742Z"
  }
]

## Update a Role

POST https://ai.nibog.in/webhook/vl/nibog/role/update
Content-Type: application/json

{
    "id": 2,
    "name":"suni",
    "description":"update test"
}

Response (201 Created)

[
  {
    "id": 2,
    "name": "suni",
    "description": "update test",
    "created_at": "2025-06-03T09:57:20.085Z",
    "updated_at": "2025-06-03T09:57:20.085Z"
  }
]


## Delete a Role

DELETE https://ai.nibog.in/webhook/vl/nibog/role/delete

Content-Type: application/json

{
    "id": "0"
}

Response (201 Created)

[
  {
    "success": true
  }
]








