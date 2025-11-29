const mongoose = require('mongoose');
const Folder = require('../models/folder');
const Task = require('../models/task');

const sanitize = v => v == null ? null : String(v).trim();
const isValidId = id => mongoose.Types.ObjectId.isValid(sanitize(id));

const getFolderById = async (req, res) => {
  try {
    const id = sanitize(req.params.id);
    if (!isValidId(id)) return res.status(400).json({ error: 'Invalid folder id' });

    const folder = await Folder.findOne({ _id: id, user: req.user.id }).populate('tasks');
    if (!folder) return res.status(404).json({ error: 'Folder not found' });
    return res.json(folder);
  } catch (err) {
    console.error('getFolderById error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
};

const getTasksInFolder = async (req, res) => {
  try {
    const folderId = sanitize(req.params.folderId);
    if (!isValidId(folderId)) return res.status(400).json({ error: 'Invalid folder id' });

    const tasks = await Task.find({ folder: folderId, user: req.user.id }).sort({ createdAt: -1 });
    return res.json(tasks);
  } catch (err) {
    console.error('getTasksInFolder error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
};

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

    return res.status(201).json(task);
  } catch (err) {
    console.error('addTaskToFolder error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
};

const updateTaskInFolder = async (req, res) => {
  try {
    const folderId = sanitize(req.params.folderId);
    const taskId = sanitize(req.params.taskId);
    if (!isValidId(folderId) || !isValidId(taskId)) return res.status(400).json({ error: 'Invalid id(s)' });

    const task = await Task.findOneAndUpdate(
      { _id: taskId, folder: folderId, user: req.user.id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!task) return res.status(404).json({ error: 'Task not found' });
    return res.json(task);
  } catch (err) {
    console.error('updateTaskInFolder error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
};

const updateTaskStatus = async (req, res) => {
  try {
    const folderId = sanitize(req.params.folderId);
    const taskId = sanitize(req.params.taskId);
    if (!isValidId(folderId) || !isValidId(taskId)) return res.status(400).json({ error: 'Invalid id(s)' });

    if (!['Pending','Working','Completed'].includes(req.body.status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const task = await Task.findOneAndUpdate(
      { _id: taskId, folder: folderId, user: req.user.id },
      { status: req.body.status },
      { new: true, runValidators: true }
    );
    if (!task) return res.status(404).json({ error: 'Task not found' });
    return res.json(task);
  } catch (err) {
    console.error('updateTaskStatus error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
};

const deleteTaskInFolder = async (req, res) => {
  try {
    const folderId = sanitize(req.params.folderId);
    const taskId = sanitize(req.params.taskId);
    if (!isValidId(folderId) || !isValidId(taskId)) return res.status(400).json({ error: 'Invalid id(s)' });

    const task = await Task.findOneAndDelete({ _id: taskId, folder: folderId, user: req.user.id });
    if (!task) return res.status(404).json({ error: 'Task not found' });

    await Folder.updateOne({ _id: folderId }, { $pull: { tasks: task._id } });
    return res.json({ message: 'Task deleted' });
  } catch (err) {
    console.error('deleteTaskInFolder error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
};

const resetProgress = async (req, res) => {
  try {
    const id = sanitize(req.params.id);
    if (!isValidId(id)) return res.status(400).json({ error: 'Invalid folder id' });

    await Task.updateMany({ folder: id, user: req.user.id }, { status: 'Pending' });
    return res.json({ message: 'Folder progress reset' });
  } catch (err) {
    console.error('resetProgress error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
};

const clearProgress = async (req, res) => {
  try {
    const id = sanitize(req.params.id);
    if (!isValidId(id)) return res.status(400).json({ error: 'Invalid folder id' });

    await Task.deleteMany({ folder: id, user: req.user.id });
    await Folder.findByIdAndUpdate(id, { tasks: [] });
    return res.json({ message: 'Folder progress cleared' });
  } catch (err) {
    console.error('clearProgress error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
};

const createFolder = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: 'Folder name required' });

    const folder = await Folder.create({ name, user: req.user.id });
    return res.status(201).json(folder);
  } catch (err) {
    console.error('createFolder error:', err);
    return res.status(500).json({ error: 'Server error' });
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
