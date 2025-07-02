# Code-For-Tomorrow-1072025

# emplolyee_management
### Core Functionality
JWT Authentication (Register/Login)
Centralized response and error handling
Request validation with Joi
Logging with Winston
Swagger-compatible API documentation

- **User Authentication**
  - JWT-based secure login/signup
  - Edit user / user details/ delete user
  - Password reset

### Technical Features
- RESTful API with proper status codes
- MVC architecture
- Request validation
- Comprehensive logging
- Error handling
- API documentation

# env file
NODE_ENV = localhost
PORT = 3000
DB_HOST = localhost
DB_NAME = alit_invoice
DB_PORT = 27017
JWT_SECRET = abcd123
JWT_EXPIRE = 24h
LOGIN_BEARER = a1b2c3d4e5
IMAGE_ACCESS_URL = http://localhost:3000/

# Backend dependencies
cd backend
npm install
sudo node index.js

# Swagger URL
http://localhost:3000/api-docs/#/


API Endpoints

# Auth
POST /users/userRegister
POST /users/userLogin
PATCH /users/changePassword
GET /users/getUserDetail
PUT /users/updateUserDetail
DELETE /users/updateUserDetail
POST /users/updateUserDetail
GET /users/userLogOut

# Salary & payroll API these API check on postman
post   salary/addAttendance
post   salary/salaryCalculat
get    salary/salaryEmployeeId"
get    salary/payrollDistribute"
get    salary/payrollHistory"

# Employee API
post    employee/addEmployee
delete  employee/deleteEmployee
post    employee/getEmployeeList
get     employee/getEmployeeDetail
put     employee/editEmployee
