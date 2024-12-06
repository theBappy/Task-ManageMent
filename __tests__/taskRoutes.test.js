const request = require("supertest");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const app = require("../server");
const User = require("../backend/models/User");
const Task = require("../backend/models/Task");

let token;

beforeAll(async () => {
    jest.setTimeout(20000);
    await mongoose.connect(process.env.MONGO_URI);

    const user = new User({
        name: "Bappy",
        email: "bappy@example.com",
        password: "albappy123",
    });
    await user.save();

    token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

});

afterAll(async () => {
    await User.deleteMany();
    await Task.deleteMany();
    await mongoose.connection.close();
});
describe('GET /api/private', () => {
    it('should return a protected route with user data', async () => {
        const res = await request(app)
            .get('/api/private')
            .set('Authorization', `Bearer ${token}`);  // Ensure you pass a valid token

        expect(res.status).toBe(200);
        expect(res.body.message).toBe('This is a protected route');
        expect(res.body.user).toBeDefined();
    });
});
describe("Task Routes", () => {
    it("GET /api/tasks should return all tasks", async () => {
        const response = await request(app)
            .get("/api/tasks")
            .set("Authorization", `Bearer ${token}`);

        expect(response.statusCode).toBe(200);
        expect(Array.isArray(response.body.tasks)).toBe(true);
        expect(response.body.pagination).toBeDefined();
    });

    it("POST /api/tasks should create a new task", async () => {
        const newTask = { title: "Test Task", description: "Test Description" };

        const response = await request(app)
            .post("/api/tasks")
            .set("Authorization", `Bearer ${token}`)
            .send(newTask);

        expect(response.statusCode).toBe(201);
        expect(response.body.title).toBe(newTask.title);
    });
});


