const express = require('express');
const router = express.Router();
const validateTask = require('../validators/taskValidator')
const { 
    createTask, 
    getAllTasks, 
    getTaskById, 
    updateTask, 
    deleteTask 
} = require('../controllers/taskController');
const { protect } = require('../middleware/authMiddleware');
const { body } = require('express-validator');

// 🟢 **Create a Task**
router.post(
    "/",
    protect,
    validateTask, 
    body('title', 'Title is required').notEmpty(), 
    body('status', 'Status must be one of: pending, in-progress, completed').optional().isIn(['pending', 'in-progress', 'completed']),
    body('dueDate', 'Invalid date format').optional().isISO8601(),
    createTask
);

// 🟢 **Get All Tasks for Logged-in User**
router.get("/task", protect, getAllTasks);

// 🟢 **Get a Single Task**
router.get("/task/:id", protect, getTaskById);

// 🟢 **Update a Task**
router.put("/task/:id", protect, updateTask);

// 🟢 **Delete a Task**
router.delete("/task/:id", protect, deleteTask);

module.exports = router;



