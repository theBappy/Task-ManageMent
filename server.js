// 1. Imports
const express = require('express');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

// 2. Initialize app and environment variables
dotenv.config();
const app = express();

// Security Packages
const rateLimiter = require('express-rate-limit');
const helmet = require('helmet')
const mongoSanitize = require('express-mongo-sanitize');


// 3. Import Routes and Middleware
const userRoutes = require('./backend/routes/userRoutes');
const taskRoutes = require('./backend/routes/taskRoutes');
const { protect } = require('./backend/middleware/authMiddleware');
const { notFoundHandler, errorHandler }= require('./backend/middleware/errorMiddleware');

// 4. Middleware to parse JSON request bodies
app.use(express.json());

app.set('trust proxy', 1);
app.use(
    rateLimiter ({
        windowsMs: 15 * 60 * 1000,
        max: 60, 
        message: 'Too many requests from this IP, please try again after 15 minutes',
    })
)
app.use(helmet());
app.use(mongoSanitize());

// 5. Routes
app.get('/api/status', (req, res) => res.status(200).json({ message: 'Server is running!' }));

// Protected route example
app.get('/api/private', protect, (req, res) => res.status(200).json({
    message: 'This is a protected route',
    user: req.user
}));
app.get('/api/force-error', (req, res, next) => {
    next(new Error('Forced Server Error')); // This will trigger the error handler
  });
  
// Register user and task routes
app.use('/api/users', userRoutes);
app.use('/api/tasks', taskRoutes);

// 6. Error handler middleware (this must be at the bottom)
app.use(notFoundHandler);
app.use(errorHandler);

app.use((req, res, next) => {
    console.log(`Incoming Request: ${req.method} ${req.path}`);
    next();
});



// 7. Database connection and server startup
const startServer = async () => {
    try {
        if (process.env.NODE_ENV !== 'test') {
            // Connect to MongoDB
            await mongoose.connect(process.env.MONGO_URI, {
                useNewUrlParser: true,
                useUnifiedTopology: true,
            });
            console.log('Connected to MongoDB');
        }

        const PORT = process.env.PORT || 5000;
        app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));

    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
        process.exit(1); // Exit the process with failure
    }
};

if (process.env.NODE_ENV !== 'test') {
    startServer();
}

module.exports = app;

