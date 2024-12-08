const mongoose = require('mongoose');
const Task = require('../models/Task');
const { validationResult } = require('express-validator');
const { notFoundHandler, errorHandler } = require('../middleware/errorMiddleware');  // Import the error handler

// 🟢 **Controller to Create a New Task**
const createTask = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { title, description, status, dueDate } = req.body;
    if (!title || !description) {
        return res.status(400).json({ error: "Missing required fields" });
    }

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
        next(error);  // Pass error to the generic error handler
    }
};

// 🟢 **Controller to Get All Tasks for Logged-in User**
const getAllTasks = async (req, res, next) => {
    const { status, sortBy, order, page = 1, limit = 10 } = req.query;
    const validSortFields = ["createdAt", "updatedAt", "priority"];

    if (sortBy && !validSortFields.includes(sortBy)) {
        return res.status(400).json({ error: "Invalid sortBy field" });
    }

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
        next(error);  // Pass error to the generic error handler
    }
};

// 🟢 **Controller to get a Task by ID**
const getTaskById = async (req, res, next) => {
    try {
      const task = await Task.findById(req.params.id);
      if (!task) {
        return res.status(404).json({ message: 'Task not found' });
      }
  
      if (task.user.toString() !== req.user.id) {
        return res.status(403).json({ message: 'You do not have access to this task' });
      }
  
      res.status(200).json(task);
    } catch (error) {
      next(error); // Pass error to errorHandler middleware
    }
};
  


// 🟢 **Controller to Update a Task**
const updateTask = async (req, res, next) => {
    try {
        const updatedTask = await Task.findByIdAndUpdate(
            req.params.id,
            { ...req.body },
            { new: true, runValidators: true }
        );

        if (!updatedTask) {
            return res.status(404).json({ error: "Task not found" });
        }

        res.status(200).json(updatedTask);
    } catch (error) {
        next(error);  // Pass error to the generic error handler
    }
};

// 🟢 **Controller to Delete a Task**
const deleteTask = async (req, res, next) => {
    try {
        const task = await Task.findByIdAndDelete(req.params.id);

        if (!task) {
            return res.status(404).json({ error: "Task not found" });
        }

        res.status(200).json({ message: "Task deleted successfully" });
    } catch (error) {
        next(error);  // Pass error to the generic error handler
    }
};

module.exports = {
    createTask,
    getAllTasks,
    getTaskById,
    updateTask,
    deleteTask
};
