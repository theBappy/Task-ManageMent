const express = require('express');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const app = express();

dotenv.config();

// Importing routes and middleware
const userRoutes = require('./backend/routes/userRoutes');
const protect = require('./backend/middleware/authMiddleware').protect; // Protect middleware
const taskRoutes = require('./backend/routes/taskRoutes');
const { errorHandler } = require('./backend/middleware/errorMiddleware'); // Error handler middleware

// Middleware to parse JSON request bodies
app.use(express.json());

// Test route for server status
app.get('/api/status', (req, res) => {
    res.status(200).json({ message: 'Server is running!' });
});

// In server.js or your routes file
app.get('/api/private', protect, (req, res) => {
    res.status(200).json({
        message: 'This is a protected route',
        user: req.user // Ensure protect middleware populates req.user
    });
});


// User-related routes
app.use('/api/users', userRoutes);

// Task-related routes
app.use('/api/tasks', taskRoutes);

// Error handler middleware (should be the last middleware)
app.use(errorHandler);

// MongoDB connection and server startup (skip in test environment)
if (process.env.NODE_ENV !== 'test') {
    const PORT = process.env.PORT || 5000;
    mongoose
        .connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        })
        .then(() => {
            console.log('Connected to MongoDB');
            app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
        })
        .catch(err => console.error(err));
}

module.exports = app;
