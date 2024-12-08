# Task Management System

## Description
This is a Task Management System built using Node.js, Express, MongoDB, and Jest for testing. The application allows users to create, manage, and delete tasks, with features such as task validation, user authentication, and role-based access control.

## Features
- User authentication (JWT)
- Create, update, delete, and retrieve tasks
- Task validation (title, status, due date)
- Pagination and sorting for tasks
- Real-time data validation and error handling

## Technologies Used
- **Node.js**: JavaScript runtime for building server-side applications.
- **Express.js**: Web framework for Node.js to handle routing and middleware.
- **MongoDB**: NoSQL database used for storing tasks and user data.
- **Mongoose**: ODM for interacting with MongoDB.
- **JWT (JSON Web Token)**: Used for user authentication and authorization.
- **Jest**: JavaScript testing framework for unit and integration testing.
- **ESLint**: JavaScript linter to enforce code quality standards.
- **Prettier**: Code formatter to maintain consistent code style.

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/theBappy/Task-ManageMent.git
   cd task-management-system
2. Install dependencies:
   <npm install>
3. Your secret key
   MONGO_URI=your-mongodb-uri
   JWT_SECRET=your-secret-key
4. Start the application
    <npm run dev>
5. For running test and coverage report install jest and run
    <npm run test>
6. Testing with Postman

    You can use Postman to test the API endpoints. Here are the available routes:

POST /api/users/register - Register a new user
POST /api/users/login - Log in and obtain a JWT token
GET /api/tasks - Get all tasks for the logged-in user
GET /api/tasks/:id - Get a single task by ID
POST /api/tasks - Create a new task
PUT /api/tasks/:id - Update an existing task
DELETE /api/tasks/:id - Delete a task by ID
