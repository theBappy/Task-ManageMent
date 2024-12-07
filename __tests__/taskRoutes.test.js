const request = require("supertest");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const app = require("../server");
const User = require("../backend/models/User");
const Task = require("../backend/models/Task");

let token;
let user;
let taskId;

beforeAll(async () => {
  jest.setTimeout(50000);
  await mongoose.connect(process.env.MONGO_URI);

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
  taskId = task._id; // Save the task ID for update/delete tests
});

afterAll(async () => {
  await User.deleteMany();
  await Task.deleteMany();
  await mongoose.connection.close();
});

describe("Task Routes", () => {
  describe("GET /api/tasks", () => {
    it("should return all tasks for the logged-in user", async () => {
      const res = await request(app)
        .get("/api/tasks")
        .set("Authorization", `Bearer ${token}`);
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.tasks)).toBe(true);
    });

    it("should return tasks filtered by status", async () => {
      const res = await request(app)
        .get("/api/tasks?status=completed")
        .set("Authorization", `Bearer ${token}`);
      expect(res.status).toBe(200);
      res.body.tasks.forEach(task => {
        expect(task.status).toBe("completed");
      });
    });

    it("should return tasks sorted by a specific field", async () => {
      const res = await request(app)
        .get("/api/tasks?sortBy=createdAt&order=desc")
        .set("Authorization", `Bearer ${token}`);
      expect(res.status).toBe(200);
      const tasks = res.body.tasks;
      for (let i = 1; i < tasks.length; i++) {
        expect(new Date(tasks[i - 1].createdAt)).toBeGreaterThanOrEqual(
          new Date(tasks[i].createdAt)
        );
      }
    });

    it("should return paginated tasks", async () => {
      const res = await request(app)
        .get("/api/tasks?page=2&limit=2")
        .set("Authorization", `Bearer ${token}`);
      expect(res.status).toBe(200);
      expect(res.body.pagination.currentPage).toBe(2);
      expect(res.body.tasks.length).toBeLessThanOrEqual(2);
    });

    it("should return 400 for invalid query parameters", async () => {
      const res = await request(app)
        .get("/api/tasks?sortBy=invalidField")
        .set("Authorization", `Bearer ${token}`);
      expect(res.status).toBe(400);
      expect(res.body.error).toBe("Invalid sortBy field");
    });

    it("should return an empty array if no tasks match", async () => {
      const res = await request(app)
        .get("/api/tasks?status=nonexistentStatus")
        .set("Authorization", `Bearer ${token}`);
      expect(res.status).toBe(200);
      expect(res.body.tasks.length).toBe(0);
    });

    it("should return 401 for unauthorized users", async () => {
      const res = await request(app).get("/api/tasks");
      expect(res.status).toBe(401);
    });
  });

  describe("POST /api/tasks", () => {
    it("should create a new task", async () => {
      const newTask = { title: "Test Task", description: "Test Description" };

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

  describe("PUT /api/tasks/:id", () => {
    it("should update an existing task", async () => {
      const updatedTask = { title: "Updated Title", status: "completed", description: "Updated Description" };

      const res = await request(app)
        .put(`/api/tasks/${taskId}`)
        .set("Authorization", `Bearer ${token}`)
        .send(updatedTask);

      expect(res.status).toBe(200);
      expect(res.body.title).toBe(updatedTask.title);
      expect(res.body.status).toBe(updatedTask.status);
    });

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
});












