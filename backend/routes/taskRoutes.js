const express = require('express');
const router = express.Router();
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
    body('title', 'Title is required').notEmpty(), 
    body('status', 'Status must be one of: pending, in-progress, completed').optional().isIn(['pending', 'in-progress', 'completed']),
    body('dueDate', 'Invalid date format').optional().isISO8601(),
    createTask
);

// 🟢 **Get All Tasks for Logged-in User**
router.get("/", protect, getAllTasks);

// 🟢 **Get a Single Task**
router.get("/:id", protect, getTaskById);

// 🟢 **Update a Task**
router.put("/:id", protect, updateTask);

// 🟢 **Delete a Task**
router.delete("/:id", protect, deleteTask);

module.exports = router;



