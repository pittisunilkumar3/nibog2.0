# Employee Management API Documentation

## Base URL
`http://localhost:3000/api/employees`

## Authentication
All endpoints (except where noted) require authentication via JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

## Models

### Employee
```typescript
interface Employee {
  id: number;
  employee_id: string;
  department: string;
  designation: string;
  qualification: string;
  work_exp: string;
  name: string;
  surname: string;
  father_name: string;
  mother_name: string;
  contact_no: string;
  emeregency_contact_no: string;
  email: string;
  dob: string; // ISO date string
  marital_status: string;
  date_of_joining: string; // ISO date string
  date_of_leaving?: string; // ISO date string (optional)
  local_address: string;
  permanent_address: string;
  note?: string;
  image?: string;
  gender: string;
  acount_title: string;
  bank_account_no: string;
  bank_name: string;
  ifsc_code: string;
  bank_branch: string;
  payscale: string;
  basic_salary: string;
  epf_no: string;
  contract_type: string;
  shift: string;
  location: string;
  resume: string; // file path
  joining_letter: string; // file path
  resignation_letter?: string; // file path (optional)
  other_document_name?: string;
  other_document_file?: string; // file path
  is_active: boolean;
  is_superadmin: boolean;
  verification_code?: string;
  created_at: string; // ISO date string
  updated_at: string; // ISO date string
}
```

## Endpoints

### 1. Create Employee
**POST** `/`

**Request Body:**
```json
{
  "employee_id": "EMP001",
  "department": "IT",
  "designation": "Developer",
  "qualification": "B.Tech",
  "work_exp": "5 years",
  "name": "John",
  "surname": "Doe",
  "father_name": "Mike Doe",
  "mother_name": "Sarah Doe",
  "contact_no": "1234567890",
  "emeregency_contact_no": "0987654321",
  "email": "john.doe@example.com",
  "dob": "1990-01-01",
  "marital_status": "Single",
  "date_of_joining": "2023-01-01",
  "local_address": "123 Main St, City",
  "permanent_address": "456 Oak St, Hometown",
  "note": "Sample employee",
  "gender": "Male",
  "acount_title": "John Doe",
  "bank_account_no": "1234567890",
  "bank_name": "Example Bank",
  "ifsc_code": "EXMP1234567",
  "bank_branch": "Main Branch",
  "payscale": "E1",
  "basic_salary": "50000",
  "epf_no": "EPF12345",
  "contract_type": "Permanent",
  "shift": "Day",
  "location": "Head Office",
  "password": "securepassword123",
  "resume" : "resume",
  "joining_letter" : "joiningletter",
  "resignation_letter" : "resignation_letter",
  "other_document_name" : "otherdocument",
  "other_document_file" : "otherfile",
  "is_superadmin": false
}

```

**Note:** File uploads (image, resume, joining_letter, etc.) should be handled via multipart/form-data.

**Responses:**
- `201 Created`: Employee created successfully
- `400 Bad Request`: Validation error
- `409 Conflict`: Employee with email/employee_id already exists

### 2. Get All Employees
**GET** `/`

**Query Parameters:**
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 10)
- `department` (string): Filter by department
- `is_active` (boolean): Filter by active status

**Responses:**
- `200 OK`: Returns paginated list of employees
```json
[
  {
    "id": 1,
    "employee_id": "1",
    "department": "test",
    "designation": "test",
    "qualification": "test",
    "work_exp": "10 years",
    "name": "superadmin",
    "surname": "super",
    "father_name": "father",
    "mother_name": "mother",
    "contact_no": "9876543210",
    "emeregency_contact_no": "9876543211",
    "email": "admin@gmail.com",
    "dob": "2000-10-11T00:00:00.000Z",
    "marital_status": "married",
    "date_of_joining": "2025-05-05T00:00:00.000Z",
    "date_of_leaving": null,
    "local_address": "test",
    "permanent_address": "test",
    "note": null,
    "image": null,
    "password": "12345678",
    "gender": "male",
    "acount_title": "test",
    "bank_account_no": "876543",
    "bank_name": "test",
    "ifsc_code": "test",
    "bank_branch": "test",
    "payscale": "test",
    "basic_salary": "20000",
    "epf_no": "23",
    "contract_type": "test",
    "shift": "test",
    "location": "test",
    "resume": "test",
    "joining_letter": "test",
    "resignation_letter": "test",
    "other_document_name": "test",
    "other_document_file": "test",
    "is_active": true,
    "is_superadmin": true,
    "verification_code": "true",
    "created_at": "2025-06-04T07:14:03.490Z",
    "updated_at": "2025-06-04T07:14:03.490Z"
  },
  {
    "id": 3,
    "employee_id": "EMP001",
    "department": "IT",
    "designation": "Developer",
    "qualification": "B.Tech",
    "work_exp": "5 years",
    "name": "John",
    "surname": "Doe",
    "father_name": "Mike Doe",
    "mother_name": "Sarah Doe",
    "contact_no": "1234567890",
    "emeregency_contact_no": "0987654321",
    "email": "john.doe@example.com",
    "dob": "1990-01-01T00:00:00.000Z",
    "marital_status": "Single",
    "date_of_joining": "2023-01-01T00:00:00.000Z",
    "date_of_leaving": null,
    "local_address": "123 Main St, City",
    "permanent_address": "456 Oak St, Hometown",
    "note": null,
    "image": null,
    "password": "securepassword123",
    "gender": "Male",
    "acount_title": "John Doe",
    "bank_account_no": "1234567890",
    "bank_name": "Example Bank",
    "ifsc_code": "EXMP1234567",
    "bank_branch": "Main Branch",
    "payscale": "E1",
    "basic_salary": "50000",
    "epf_no": "EPF12345",
    "contract_type": "Permanent",
    "shift": "Day",
    "location": "Head Office",
    "resume": "resume",
    "joining_letter": "joiningletter",
    "resignation_letter": "resignation_letter",
    "other_document_name": "otherdocument",
    "other_document_file": "otherfile",
    "is_active": true,
    "is_superadmin": false,
    "verification_code": null,
    "created_at": "2025-06-08T10:31:04.139Z",
    "updated_at": "2025-06-08T10:31:04.139Z"
  }
]
```

### 3. Get Single Employee
**GET** `/:id`



**Responses:**
- `200 OK`: Returns employee details
- `404 Not Found`: Employee not found

[
  {
    "id": 1,
    "employee_id": "1",
    "department": "test",
    "designation": "test",
    "qualification": "test",
    "work_exp": "10 years",
    "name": "superadmin",
    "surname": "super",
    "father_name": "father",
    "mother_name": "mother",
    "contact_no": "9876543210",
    "emeregency_contact_no": "9876543211",
    "email": "admin@gmail.com",
    "dob": "2000-10-11T00:00:00.000Z",
    "marital_status": "married",
    "date_of_joining": "2025-05-05T00:00:00.000Z",
    "date_of_leaving": null,
    "local_address": "test",
    "permanent_address": "test",
    "note": null,
    "image": null,
    "password": "12345678",
    "gender": "male",
    "acount_title": "test",
    "bank_account_no": "876543",
    "bank_name": "test",
    "ifsc_code": "test",
    "bank_branch": "test",
    "payscale": "test",
    "basic_salary": "20000",
    "epf_no": "23",
    "contract_type": "test",
    "shift": "test",
    "location": "test",
    "resume": "test",
    "joining_letter": "test",
    "resignation_letter": "test",
    "other_document_name": "test",
    "other_document_file": "test",
    "is_active": true,
    "is_superadmin": true,
    "verification_code": "true",
    "created_at": "2025-06-04T07:14:03.490Z",
    "updated_at": "2025-06-04T07:14:03.490Z"
  }
]

### 4. Update Employee
**PUT** `/:id`

**Request Body:**
```json
{
  "department": "Updated Department",
  "designation": "Updated Designation",
  "contact_no": "9876543210",
  "is_active": true
  // Other fields to update
}
```

**Responses:**
- `200 OK`: Employee updated successfully
- `404 Not Found`: Employee not found
- `400 Bad Request`: Validation error

### 5. Delete Employee
**DELETE** `/:id`

**Responses:**
- `204 No Content`: Employee deleted successfully
- `404 Not Found`: Employee not found

### 6. Upload Employee Documents
**POST** `/:id/documents`

**Content-Type:** `multipart/form-data`

**Form Data:**
- `type`: Document type (image, resume, joining_letter, resignation_letter, other)
- `file`: The file to upload
- `document_name`: Required if type is 'other'

**Responses:**
- `200 OK`: Document uploaded successfully
- `400 Bad Request`: Invalid file type or missing fields
- `404 Not Found`: Employee not found

### 7. Change Password
**POST** `/:id/change-password`

**Request Body:**
```json
{
  "current_password": "oldpassword123",
  "new_password": "newsecurepassword456"
}
```

**Responses:**
- `200 OK`: Password changed successfully
- `400 Bad Request`: Current password is incorrect
- `404 Not Found`: Employee not found

## Error Responses
All error responses follow this format:
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": {} // Optional additional error details
  }
}
```

## File Uploads
For file uploads (image, resume, etc.), use `multipart/form-data` with the appropriate field names. The server will return the file path that can be used to access the uploaded file.

## Pagination
All list endpoints support pagination using `page` and `limit` query parameters. The response includes pagination metadata.

## Filtering
You can filter results by adding query parameters that match the employee model fields. For example:
- `?department=IT&is_active=true`
- `?designation=Manager&location=Head%20Office`
