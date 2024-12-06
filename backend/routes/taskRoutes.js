const express = require("express");
const Task = require("../models/Task");
const protect = require("../middleware/authMiddleware");
const { body, validationResult } = require('express-validator')

const router = express.Router();

// Create a Task with validation
router.post("/", protect, [
   body('title', 'Title is required').notEmpty(),
   body('status', 'Status must be one of: pending, in-progress, completed')
   .optional()
   .isIn(['pending', 'in-progress', 'completed']),
   body('dueDate', 'Invailid date format').optional().isISO8601(),
],
    async (req, res) => {
        const errors = validationResult(req);
        if(!errors.isEmpty()){
            return res.status(400).json({errors: errors.array()});
        }

        // Main route handler logic
    const { title, description, status, dueDate } = req.body;

    try {
        const task = new Task({
            user: req.user.id,
            title,
            description,
            status,
            dueDate,
        });

        await task.save();
        res.status(201).json(task);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get All Tasks for Logged-in User
router.get("/", protect, async (req, res) => {
    const { status, sortBy, order, page = 1, limit = 10 } = req.query;

    const filter = { user: req.user.id };
    if (status) {
        filter.status = status;
    }

    const sort = {};
    if (sortBy) {
        sort[sortBy] = order === "desc" ? -1 : 1;
    }

    try {
        const tasks = await Task.find(filter)
            .sort(sort)
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        const totalTasks = await Task.countDocuments(filter);

        res.status(200).json({
            tasks,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(totalTasks / limit),
                totalTasks,
            },
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


// Get a Single Task
router.get("/:id", protect, async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);

        if (!task || task.user.toString() !== req.user.id) {
            return res.status(404).json({ message: "Task not found" });
        }

        res.status(200).json(task);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Update a Task
router.put("/:id", protect, [
   body('title', 'Title is required').optional().notEmpty(),
   body('status', 'Status must be one of: pending, in-progress, completed')
   .optional()
   .isIn(['pending','in-progress', 'completed']),
   body('dueDate', 'Invalid date format').optional().isISO8601(),
],
     async (req, res) => {
        const errors = validationResult(req);
        if(!errors.isEmpty()){
            return res.status(400).json({errors: errors.array()});
        }
    const { title, description, status, dueDate } = req.body;

    try {
        const task = await Task.findById(req.params.id);

        if (!task || task.user.toString() !== req.user.id) {
            return res.status(404).json({ message: "Task not found" });
        }

       if(title) task.title = title;
       if(description) task.description = description;
       if(status) task.status = status;
       if(dueDate) task.dueDate = dueDate;

        const updatedTask = await task.save();
        res.status(200).json(updatedTask);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Delete a Task
router.delete("/:id", protect, async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);

        if (!task || task.user.toString() !== req.user.id) {
            return res.status(404).json({ message: "Task not found" });
        }

        await task.deleteOne();
        res.status(200).json({ message: "Task deleted" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;


