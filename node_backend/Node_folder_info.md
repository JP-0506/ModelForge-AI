# ModelForge AI - Node.js Backend Folder Guide

This document explains the purpose of each folder in the Node.js backend.

---

# Node Backend Structure

```text
node_backend/
│
├── src/
│   ├── config/
│   ├── controllers/
│   ├── services/
│   ├── repositories/
│   ├── routes/
│   ├── middleware/
│   ├── validators/
│   ├── models/
│   ├── uploads/
│   ├── app.js
│   └── server.js
│
├── tests/
├── .env
├── package.json
├── README.md
└── nodemon.json
```

---

# 📁 src/

## Purpose

Contains the complete source code of the Node.js backend.

Everything related to the application's implementation is placed inside this folder.

---

# 📁 config/

## Purpose

Stores application configuration.

### Responsibilities

- Database Configuration
- JWT Configuration
- File Upload Configuration
- Email Configuration
- CORS Configuration
- Logger Configuration
- Swagger Configuration

### Does NOT Contain

- Business Logic
- Database Queries
- API Logic

---

# 📁 controllers/

## Purpose

Acts as the request handler.

### Responsibilities

- Receive HTTP Requests
- Read Request Parameters
- Call Service Layer
- Return HTTP Response

### Does NOT Contain

- Business Logic
- Database Queries

---

# 📁 services/

## Purpose

Contains all business logic.

### Responsibilities

- Authentication Logic
- Workspace Logic
- Project Logic
- Dataset Logic
- Experiment Logic
- Deployment Logic
- Report Logic
- Notification Logic
- Communication with Django Backend

### Does NOT Contain

- HTTP Response Handling
- MongoDB Queries

---

# 📁 repositories/

## Purpose

Database access layer.

### Responsibilities

- Create Records
- Read Records
- Update Records
- Delete Records
- Aggregate Queries

### Does NOT Contain

- Business Logic
- HTTP Requests

---

# 📁 routes/

## Purpose

Defines all REST API endpoints.

### Responsibilities

- Register Routes
- Group Module APIs
- Connect Routes to Controllers

### Does NOT Contain

- Business Logic
- Database Logic

---

# 📁 middleware/

## Purpose

Executes before Controllers.

### Responsibilities

- Authentication
- Authorization
- File Upload Handling
- Request Validation
- Error Handling
- Logging
- Rate Limiting
- 404 Handling

---

# 📁 validators/

## Purpose

Validates incoming request data.

### Responsibilities

- Validate Request Body
- Validate Request Parameters
- Validate Query Parameters
- Return Validation Errors

---

# 📁 models/

## Purpose

Defines MongoDB collections using Mongoose schemas.

### Responsibilities

- Collection Structure
- Field Types
- Required Fields
- Default Values
- Indexes
- Relationships
- Schema Validation

### Does NOT Contain

- CRUD Operations
- Business Logic

---

# 📁 uploads/

## Purpose

Stores uploaded files temporarily.

### Responsibilities

- Dataset Storage
- Generated Reports
- Temporary Files

---

# 📁 tests/

## Purpose

Contains backend test cases.

### Responsibilities

- Unit Testing
- API Testing
- Integration Testing

---

# Summary

| Folder | Purpose |
|---------|---------|
| **src/** | Contains all backend source code |
| **config/** | Application configuration |
| **controllers/** | Handles HTTP requests and responses |
| **services/** | Contains business logic |
| **repositories/** | Performs MongoDB operations |
| **routes/** | Defines API endpoints |
| **middleware/** | Executes before controllers (auth, upload, validation, etc.) |
| **validators/** | Validates request data |
| **models/** | Defines MongoDB schemas |
| **uploads/** | Stores uploaded and temporary files |
| **tests/** | Backend testing files |