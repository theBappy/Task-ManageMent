const request = require("supertest");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const app = require("../server");
const User = require("../backend/models/User");
const Task = require("../backend/models/Task");

let token;
let user;
let taskId;


const generateValidTokenForUser = (user) => {
  const payload = {
      id: user._id,
      email: user.email,
      // Add any other necessary data to the payload
  };
  const secret = process.env.JWT_SECRET || 'your-secret-key'; // Make sure this is securely managed

  // Generate and return the token
  return jwt.sign(payload, secret, { expiresIn: '7d' });
};
let task;
beforeAll(async () => {
  jest.setTimeout(200000);
  await mongoose.connect(process.env.MONGO_URI);
  await User.deleteMany();
  await Task.deleteMany();

  // Create a test user
  user = await User.create({
    name: "Bappy",
    email: "bappy@example.com",
    password: "albappy123",
  });

  // Generate a valid JWT token
  token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

  // Create a task for update and delete tests
  const task = await Task.create({
    title: "Task to Update",
    description: "Initial Description",
    status: "pending",
    user: user._id,
  });
  taskId = task._id; 
});

afterAll(async () => {

  await mongoose.disconnect();
});

describe("Task Routes", () => {
  // GET /api/tasks
  describe("GET /api/tasks", () => {
    it("should return all tasks for the logged-in user", async () => {
      const res = await request(app)
        .get("/api/tasks")
        .set("Authorization", `Bearer ${token}`);
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.tasks)).toBe(true);
    });

    // Additional test cases...

    it("should return 401 for unauthorized users", async () => {
      const res = await request(app).get("/api/tasks");
      expect(res.status).toBe(401);
    });
  });

  // POST /api/tasks
  describe("POST /api/tasks", () => {
    it("should create a new task", async () => {
      const newTask = { title: "Test Task2", description: "Test Description2" };
      const response = await request(app)
        .post("/api/tasks")
        .set("Authorization", `Bearer ${token}`)
        .send(newTask);
      expect(response.statusCode).toBe(201);
      expect(response.body.title).toBe(newTask.title);
    });

    it("should return 400 for missing required fields", async () => {
      const res = await request(app)
        .post("/api/tasks")
        .set("Authorization", `Bearer ${token}`)
        .send({}); // Empty body

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty("errors");
      expect(Array.isArray(res.body.errors)).toBe(true);
      expect(res.body.errors[0]).toMatchObject({
        type: "field",
        msg: "Title is required",
        path: "title",
        location: "body",
      });
    });
  });

  // PUT /api/tasks/:id
  describe("PUT /api/tasks/:id", () => {
    it("should return 404 for a non-existent task", async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .put(`/api/tasks/${nonExistentId}`)
        .set("Authorization", `Bearer ${token}`)
        .send({ title: "Non-existent Task" });

      expect(res.status).toBe(404);
      expect(res.body.error).toBe("Task not found");
    });
  });

  // DELETE /api/tasks/:id
  describe("DELETE /api/tasks/:id", () => {
    it("should delete an existing task", async () => {
      const res = await request(app)
        .delete(`/api/tasks/${taskId}`)
        .set("Authorization", `Bearer ${token}`);
      expect(res.status).toBe(200);
      expect(res.body.message).toBe("Task deleted successfully");
    });

    it("should return 404 for a non-existent task", async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .delete(`/api/tasks/${nonExistentId}`)
        .set("Authorization", `Bearer ${token}`);
      expect(res.status).toBe(404);
      expect(res.body.error).toBe("Task not found");
    });
  });

  // Private Middleware Tests
  describe('Private Middleware', () => {
    it('should allow access for valid token', async () => {
      user = await User.create({
        name: "Bappy123",
        email: "bappy1@example.com",
        password: "albappy12345",
      });
      token = generateValidTokenForUser(user);
      const res = await request(app)
        .get('/api/private')
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(200);  // Should return 200 for valid token
    });

    it('should reject request with invalid token', async () => {
      const res = await request(app)
        .get('/api/private')
        .set('Authorization', 'Bearer invalidtoken');
      expect(res.status).toBe(401);  // Unauthorized access
    });

    it('should reject request with no token', async () => {
      const res = await request(app).get('/api/private');
      expect(res.status).toBe(401);  // Unauthorized access
    });
  });

  // Error Handler Middleware
  describe('Error Handler Middleware', () => {
    test('should return 500 for unexpected errors', async () => {
      const res = await request(app).get('/api/force-error').set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(500); 
      expect(res.body.message).toBe('Forced Server Error');

  });
  
  });

  // Task Not Found Test
  describe("GET /api/tasks/:id", () => {
    let token;
    let user;
    

    beforeEach(async () => {
      await User.deleteMany();
      await Task.deleteMany();
      user = await User.create({ name: 'John Doe', email: 'john@example.com', password: 'password123' });
      token = generateValidTokenForUser(user);
    });

    test('should return 404 if task is not found', async () => {
      const nonExistentTaskId = new mongoose.Types.ObjectId(); 
      const res = await request(app).get(`/api/tasks/${nonExistentTaskId}`).set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(404); 
      expect(res.body.message).toBe('Task not found'); 
    });
  });
});






// it('should return 403 if user is not the task owner', async () => {
//   const otherUser = await User.create({ name: 'Jane Smith', email: 'jane@example.com', password: 'password123' }); 
//   const tokenForOtherUser = generateValidTokenForUser(otherUser);
//   const task = await Task.create({ title: 'Test Task', description: 'Task description', user: user._id });

//   const res = await request(app).get(`/api/tasks/${task._id}`).set('Authorization', `Bearer ${tokenForOtherUser}`);
//   expect(res.status).toBe(403);
//   expect(res.body.message).toBe('You do not have access to this task');
// });

  //   it('should return 500 for unexpected errors', async () => {
  //     const invalidId = 'invalid-id';
  //     const res = await request(app)
  //         .get(`/api/tasks/${invalidId}`)
  //         .set('Authorization', `Bearer ${token}`);
  
  //     expect(res.status).toBe(500);  // Expect a 500 internal server error
  //     expect(res.body.message).toBe('Something went wrong');  // Expect a generic error message
  // });






