## 5. Change Password (Protected)

**POST** `/api/employee/change-password`

### Headers
```
Authorization: Bearer <JWT_TOKEN>
```

### Request Body (JSON)
```
{
  "oldPassword": "current_password",
  "newPassword": "new_password"
}
```

### Success Response
```
{
  "success": true,
  "message": "Password changed successfully"
}
```

### Error Responses (examples)
```
{
  "success": false,
  "message": "Old password is incorrect"
}
```
or
```
{
  "success": false,
  "message": "Employee not found"
}
```

**Implementation Note:**
This endpoint verifies the old password, hashes the new password, and updates it using the model layer (`employeeModel.js`).

# Employee API Documentation

> **Update (Dec 2025):**
> The employee API now uses a dedicated model layer (`model/employeeModel.js`) for all database operations. Controller files only handle request/response logic and delegate DB access to the model. This improves maintainability and separation of concerns.

## Base URL
```
http://localhost:3004/api/employee
```

## Default Superadmin Credentials
```
Email: superadmin@gmail.com
Password: superadmin
```

---


## 1. Register Employee

**POST** `/api/employee/register`

### Request Body (JSON)
```
{
  "employee_id": "EMP002",
  "department": "IT",
  "designation": "Developer",
  "qualification": "B.Tech",
  "work_exp": "2 years",
  "name": "John",
  "surname": "Doe",
  "father_name": "Father Name",
  "mother_name": "Mother Name",
  "contact_no": "1234567890",
  "emeregency_contact_no": "9876543210",
  "email": "john@example.com",
  "dob": "1995-01-01",
  "marital_status": "Single",
  "date_of_joining": "2024-01-01",
  "local_address": "Local Address",
  "permanent_address": "Permanent Address",
  "password": "password123",
  "gender": "Male",
  "acount_title": "John Doe",
  "bank_account_no": "1234567890",
  "bank_name": "Bank Name",
  "ifsc_code": "BANK0001234",
  "bank_branch": "Branch Name",
  "payscale": "Grade A",
  "basic_salary": "50000",
  "epf_no": "EPF123456",
  "contract_type": "Permanent",
  "shift": "Day",
  "location": "Head Office",
  "is_superadmin": 0
}
```


### Success Response
```
{
  "success": true,
  "message": "Employee registered successfully",
  "employee_id": 2
}
```

**Implementation Note:**
The registration logic is handled in the controller, but all database queries (checking for existing employee, inserting new employee) are performed via the model layer (`employeeModel.js`).

### Error Response (example)
```
{
  "success": false,
  "message": "Employee with this email or employee ID already exists"
}
```

---

## 2. Employee Login

**POST** `/api/employee/login`

### Request Body (JSON)
```
{
  "email": "superadmin@gmail.com",
  "password": "superadmin"
}
```


### Success Response
```
{
  "success": true,
  "message": "Login successful",
  "token": "<JWT_TOKEN>",
  "employee": {
    "id": 1,
    "employee_id": "EMP001",
    "name": "Super",
    "surname": "Admin",
    "email": "superadmin@gmail.com",
    "department": "Administration",
    "designation": "Super Admin",
    "is_superadmin": 1
  }
}
```

**Implementation Note:**
The login endpoint uses the model to fetch employee data by email and validate credentials.

### Error Response (example)
```
{
  "success": false,
  "message": "Invalid email or password"
}
```

---

## 3. Get Employee Profile (Protected)

**GET** `/api/employee/profile`

### Headers
```
Authorization: Bearer <JWT_TOKEN>
```


### Success Response
```
{
  "success": true,
  "employee": {
    "id": 1,
    "employee_id": "EMP001",
    "name": "Super",
    "surname": "Admin",
    "email": "superadmin@gmail.com",
    "department": "Administration",
    "designation": "Super Admin",
    "is_superadmin": 1,
    ...
  }
}
```

**Implementation Note:**
The profile endpoint retrieves employee data using the model by employee ID.

### Error Response (example)
```
{
  "success": false,
  "message": "Invalid or expired token"
}
```

---


## 4. List Employees (Superadmin Only)

**GET** `/api/employee/list`

### Headers
```
Authorization: Bearer <JWT_TOKEN>
```


### Success Response
```
{
  "success": true,
  "employees": [
    {
      "id": 1,
      "employee_id": "EMP001",
      "name": "Super",
      "surname": "Admin",
      "email": "superadmin@gmail.com",
      "department": "Administration",
      "designation": "Super Admin",
      "is_superadmin": 1,
      "is_active": 1
    },
    // ...more employees
  ]
}
```

**Implementation Note:**
The list endpoint fetches all active employees using the model's list method.

### Error Response (example)
```
{
  "success": false,
  "message": "Access denied: Superadmin only"
}

---

## Postman Testing

### 1. Register Employee
- Method: POST
- URL: `http://localhost:3004/api/employee/register`
- Body: raw, JSON (see above)

### 2. Login
- Method: POST
- URL: `http://localhost:3004/api/employee/login`
- Body: raw, JSON (see above)

### 3. Get Profile
- Method: GET
- URL: `http://localhost:3004/api/employee/profile`
- Header: `Authorization: Bearer <JWT_TOKEN>`

### 4. List Employees
- Method: GET
- URL: `http://localhost:3004/api/employee/list`
- Header: `Authorization: Bearer <JWT_TOKEN>` (must be superadmin)

---


## Notes
- Default superadmin is created automatically on migration.
- Passwords are hashed using bcryptjs.
- JWT token expires in 24 hours.
- Change `JWT_SECRET` in `.env` for production security.
- All employee-related database logic is now handled in `model/employeeModel.js` for better code organization and maintainability.
