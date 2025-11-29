const mongoose = require('mongoose');
const Folder = require('../models/folder');
const Task = require('../models/task');

const sanitize = (val) => {
    if (val == null) return null;
    return String(val).trim();
};
const isValidId = (id) => mongoose.Types.ObjectId.isValid(sanitize(id));

// Get single folder details including tasks
const getFolderById = async (req, res) => {
    try {
        const id = sanitize(req.params.id);
        if (!isValidId(id)) return res.status(400).json({ error: 'Invalid folder id' });

        const folder = await Folder.findOne({ _id: id, user: req.user.id }).populate('tasks');
        if (!folder) return res.status(404).json({ error: 'Folder not found' });
        res.json(folder);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Get tasks in folder
const getTasksInFolder = async (req, res) => {
    try {
        const folderId = sanitize(req.params.folderId);
        if (!isValidId(folderId)) return res.status(400).json({ error: 'Invalid folder id' });

        const tasks = await Task.find({ folder: folderId, user: req.user.id });
        res.json(tasks);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Add task to folder
const addTaskToFolder = async (req, res) => {
    try {
        const folderId = sanitize(req.params.folderId);
        if (!isValidId(folderId)) return res.status(400).json({ error: 'Invalid folder id' });

        const folder = await Folder.findOne({ _id: folderId, user: req.user.id });
        if (!folder) return res.status(404).json({ error: 'Folder not found' });

        const task = await Task.create({
            title: req.body.title,
            dueDate: req.body.dueDate || null,
            folder: folder._id,
            user: req.user.id
        });

        folder.tasks.push(task._id);
        await folder.save();

        res.status(201).json(task);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Update a task inside folder
const updateTaskInFolder = async (req, res) => {
    try {
        const folderId = sanitize(req.params.folderId);
        const taskId = sanitize(req.params.taskId);
        if (!isValidId(folderId) || !isValidId(taskId)) return res.status(400).json({ error: 'Invalid id(s)' });

        const task = await Task.findOneAndUpdate(
            { _id: taskId, folder: folderId, user: req.user.id },
            req.body,
            { new: true }
        );
        if (!task) return res.status(404).json({ error: 'Task not found' });
        res.json(task);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

// Update task status
const updateTaskStatus = async (req, res) => {
    try {
        const folderId = sanitize(req.params.folderId);
        const taskId = sanitize(req.params.taskId);
        if (!isValidId(folderId) || !isValidId(taskId)) return res.status(400).json({ error: 'Invalid id(s)' });

        const task = await Task.findOneAndUpdate(
            { _id: taskId, folder: folderId, user: req.user.id },
            { status: req.body.status },
            { new: true }
        );
        if (!task) return res.status(404).json({ error: 'Task not found' });
        res.json(task);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

// Delete task from folder
const deleteTaskInFolder = async (req, res) => {
    try {
        const folderId = sanitize(req.params.folderId);
        const taskId = sanitize(req.params.taskId);
        if (!isValidId(folderId) || !isValidId(taskId)) return res.status(400).json({ error: 'Invalid id(s)' });

        const task = await Task.findOneAndDelete({
            _id: taskId,
            folder: folderId,
            user: req.user.id
        });
        if (!task) return res.status(404).json({ error: 'Task not found' });

        await Folder.updateOne(
            { _id: folderId },
            { $pull: { tasks: task._id } }
        );

        res.json({ message: 'Task deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Reset folder progress
const resetProgress = async (req, res) => {
    try {
        const id = sanitize(req.params.id);
        if (!isValidId(id)) return res.status(400).json({ error: 'Invalid folder id' });

        await Task.updateMany({ folder: id, user: req.user.id }, { status: 'Pending' });
        res.json({ message: 'Folder progress reset' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Clear folder progress
const clearProgress = async (req, res) => {
    try {
        const id = sanitize(req.params.id);
        if (!isValidId(id)) return res.status(400).json({ error: 'Invalid folder id' });

        await Task.deleteMany({ folder: id, user: req.user.id });
        await Folder.findByIdAndUpdate(id, { tasks: [] });
        res.json({ message: 'Folder progress cleared' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Create a new folder
const createFolder = async (req, res) => {
    try {
        const { name } = req.body;
        if (!name) return res.status(400).json({ error: 'Folder name required' });

        const folder = await Folder.create({
            name,
            user: req.user.id,
            tasks: []
        });

        res.status(201).json(folder);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = {
    createFolder,
    getFolderById,
    getTasksInFolder,
    addTaskToFolder,
    updateTaskInFolder,
    updateTaskStatus,
    deleteTaskInFolder,
    resetProgress,
    clearProgress
};