const Task = require('../models/task');
const Folder = require('../models/folder');
const mongoose = require('mongoose');

// helper to get authenticated user id
const getUserId = (req) => req.user?.id || req.params.userId;

// Create task or folder
const createTaskOrFolder = async (req, res) => {
  try {
    const userId = getUserId(req);
    const { type, title, dueDate, status, folder } = req.body;

    if (!type || !title) return res.status(400).json({ error: 'type and title required' });

    if (type === 'folder') {
      const newFolder = await Folder.create({ name: title, user: userId });
      return res.status(201).json({ message: 'Folder created', data: newFolder });
    }

    // validate status
    if (status && !['Pending','Working','Completed'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    let parsedDue = null;
    if (dueDate) {
      const d = new Date(dueDate);
      if (isNaN(d.getTime())) return res.status(400).json({ error: 'Invalid dueDate' });
      parsedDue = d;
    }

    // if folder provided validate it
    let existingFolder = null;
    if (folder) {
      if (!mongoose.isValidObjectId(folder)) return res.status(400).json({ error: 'Invalid folder id' });
      existingFolder = await Folder.findOne({ _id: folder, user: userId });
      if (!existingFolder) return res.status(400).json({ error: 'Folder not found / not yours' });
    }

    const newTask = await Task.create({
      title,
      dueDate: parsedDue,
      status: status || 'Pending',
      folder: folder || null,
      user: userId
    });

    if (existingFolder) {
      await Folder.findByIdAndUpdate(folder, { $push: { tasks: newTask._id } });
    }

    return res.status(201).json({ message: 'Task created', data: newTask });
  } catch (err) {
    console.error('createTaskOrFolder error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
};

// Get all tasks and folders
const getAllTasksAndFolders = async (req, res) => {
  try {
    const userId = getUserId(req);
    const tasks = await Task.find({ user: userId }).sort({ createdAt: -1 });
    const folders = await Folder.find({ user: userId }).sort({ name: 1 });
    return res.status(200).json({ tasks, folders });
  } catch (err) {
    console.error('getAll error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
};

// tasks by folder
const getTasksByFolder = async (req, res) => {
  try {
    const userId = getUserId(req);
    const { folderId } = req.params;
    if (!mongoose.isValidObjectId(folderId)) return res.status(400).json({ error: 'Invalid folder id' });

    const tasks = await Task.find({ user: userId, folder: folderId }).sort({ createdAt: -1 });
    return res.status(200).json(tasks);
  } catch (err) {
    console.error('getTasksByFolder error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
};

// tasks without folder
const getAllTasksWithoutFolder = async (req, res) => {
  try {
    const userId = getUserId(req);
    const tasks = await Task.find({ user: userId, folder: null }).sort({ createdAt: -1 });
    return res.status(200).json(tasks);
  } catch (err) {
    console.error('getAllTasksWithoutFolder error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
};

// get single task or folder by id
const getTaskById = async (req, res) => {
  try {
    const userId = getUserId(req);
    const id = req.params.taskId || req.params.id;
    if (!mongoose.isValidObjectId(id)) return res.status(400).json({ error: 'Invalid id' });

    let item = await Task.findOne({ _id: id, user: userId });
    if (!item) item = await Folder.findOne({ _id: id, user: userId }).populate('tasks');

    if (!item) return res.status(404).json({ error: 'Not found' });
    return res.status(200).json(item);
  } catch (err) {
    console.error('getTaskById error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
};

// update task or folder title/status
const updateTaskStatus = async (req, res) => {
  try {
    const userId = getUserId(req);
    const id = req.params.taskId || req.params.id;
    const { title, status, dueDate } = req.body;

    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (status !== undefined) {
      if (!['Pending','Working','Completed'].includes(status)) {
        return res.status(400).json({ error: 'Invalid status' });
      }
      updateData.status = status;
    }
    if (dueDate !== undefined) {
      const d = new Date(dueDate);
      if (isNaN(d.getTime())) return res.status(400).json({ error: 'Invalid dueDate' });
      updateData.dueDate = d;
    }

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ error: 'Provide at least one field to update' });
    }

    // try update Task first
    let updated = await Task.findOneAndUpdate({ _id: id, user: userId }, updateData, { new: true, runValidators: true });

    if (!updated) {
      // maybe it's a folder rename
      if (title) {
        updated = await Folder.findOneAndUpdate({ _id: id, user: userId }, { name: title }, { new: true, runValidators: true });
      }
    }

    if (!updated) return res.status(404).json({ error: 'Not found' });
    return res.status(200).json({ message: 'Updated', data: updated });
  } catch (err) {
    console.error('updateTaskStatus error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
};

// delete task or folder
const deleteTaskOrFolder = async (req, res) => {
  try {
    const userId = getUserId(req);
    let { type, id } = req.params;

    // allow both /:type/:id and /:id
    if (!id && type && mongoose.isValidObjectId(type)) {
      id = type;
      type = undefined;
    }

    if (!id) return res.status(400).json({ error: 'Missing id' });

    if (type === 'task') {
      const deleted = await Task.findOneAndDelete({ _id: id, user: userId });
      if (!deleted) return res.status(404).json({ error: 'Task not found' });
      // remove from folder tasks array
      if (deleted.folder) await Folder.updateOne({ _id: deleted.folder }, { $pull: { tasks: deleted._id } });
      return res.status(200).json({ message: 'Task deleted' });
    }

    if (type === 'folder') {
      await Task.deleteMany({ folder: id, user: userId });
      const deletedFolder = await Folder.findOneAndDelete({ _id: id, user: userId });
      if (!deletedFolder) return res.status(404).json({ error: 'Folder not found' });
      return res.status(200).json({ message: 'Folder and tasks deleted' });
    }

    // no type: try task then folder
    const deletedTask = await Task.findOneAndDelete({ _id: id, user: userId });
    if (deletedTask) {
      if (deletedTask.folder) await Folder.updateOne({ _id: deletedTask.folder }, { $pull: { tasks: deletedTask._id } });
      return res.status(200).json({ message: 'Task deleted' });
    }

    const deletedFolder = await Folder.findOneAndDelete({ _id: id, user: userId });
    if (deletedFolder) {
      await Task.deleteMany({ folder: id, user: userId });
      return res.status(200).json({ message: 'Folder and tasks deleted' });
    }

    return res.status(404).json({ error: 'Not found' });
  } catch (err) {
    console.error('deleteTaskOrFolder error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
};

module.exports = {
  createTaskOrFolder,
  getAllTasksAndFolders,
  getTasksByFolder,
  getAllTasksWithoutFolder,
  getTaskById,
  updateTaskStatus,
  deleteTaskOrFolder
};
