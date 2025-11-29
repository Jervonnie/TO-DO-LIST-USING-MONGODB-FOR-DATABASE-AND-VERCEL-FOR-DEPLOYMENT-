// Replace ESM imports with CommonJS requires:
const Task = require('../models/task');
const Folder = require('../models/folder');
const mongoose = require('mongoose'); // <--- added

// helper: get user id from auth middleware or fallback to params
const getUserId = (req) => req.user?.id || req.user?._id || req.params.userId;

// -------------------------------------------
// Create Task or Folder
// -------------------------------------------
const createTaskOrFolder = async (req, res) => {
    try {
        const userId = getUserId(req);
        const { title, dueDate, status, type, folder } = req.body;

        // Required fields
        if (!title || !type) {
            return res.status(400).json({ error: "Title and type are required." });
        }

        // If creating a folder
        if (type === "folder") {
            const newFolder = await Folder.create({
                name: title,
                user: userId
            });

            return res.status(201).json({
                message: "Folder created successfully",
                data: newFolder
            });
        }

        // Task validation
        if (status && !["Pending", "Working", "Completed"].includes(status)) {
            return res.status(400).json({ error: "Invalid status value." });
        }

        let parsedDueDate = null;
        if (dueDate) {
            const d = new Date(dueDate);
            if (isNaN(d.getTime())) {
                return res.status(400).json({ error: "Invalid date format." });
            }
            parsedDueDate = d;
        }

        // If folder provided, ensure it exists and belongs to user
        let existingFolder = null;
        if (folder) {
            // validate format BEFORE querying to avoid CastError
            if (!mongoose.isValidObjectId(folder)) {
                return res.status(400).json({ error: "Invalid folder ID format." });
            }
            existingFolder = await Folder.findOne({ _id: folder, user: userId });
            if (!existingFolder) {
                return res.status(400).json({ error: "Folder does not exist or does not belong to the user." });
            }
        }

        // Create task
        const newTask = await Task.create({
            title,
            dueDate: parsedDueDate,
            status: status || "Pending",
            folder: folder || null,
            user: userId
        });

        // If task added to a folder, push its id into folder.tasks
        if (existingFolder) {
            await Folder.findByIdAndUpdate(folder, { $push: { tasks: newTask._id } });
        }

        return res.status(201).json({
            message: "Task created successfully",
            data: newTask
        });

    } catch (error) {
        console.error("Error creating task or folder:", error);
        res.status(500).json({ error: "Server error while creating task or folder." });
    }
};

// -------------------------------------------
// Get ALL tasks + folders for a user
// -------------------------------------------
const getAllTasksAndFolders = async (req, res) => {
    try {
        const userId = getUserId(req);

        const tasks = await Task.find({ user: userId }).sort({ createdAt: -1 });
        const folders = await Folder.find({ user: userId }).sort({ folderName: 1 });

        res.status(200).json({ tasks, folders });

    } catch (error) {
        console.error("Error fetching all tasks and folders:", error);
        res.status(500).json({ error: "Server error while fetching tasks and folders." });
    }
};

// -------------------------------------------
// Get TASKS inside a specific folder
// -------------------------------------------
const getTasksByFolder = async (req, res) => {
    try {
        const userId = getUserId(req);
        const { folderId } = req.params;

        const tasks = await Task.find({ user: userId, folder: folderId }).sort({ createdAt: -1 });

        res.status(200).json(tasks);

    } catch (error) {
        console.error("Error fetching tasks by folder:", error);
        res.status(500).json({ error: "Server error while fetching tasks by folder." });
    }
};

// -------------------------------------------
// Get ALL tasks with NO folder
// -------------------------------------------
const getAllTasksWithoutFolder = async (req, res) => {
    try {
        const userId = getUserId(req);

        const tasks = await Task.find({ user: userId, folder: null }).sort({ createdAt: -1 });

        res.status(200).json(tasks);

    } catch (error) {
        console.error("Error fetching tasks without folder:", error);
        res.status(500).json({ error: "Server error while fetching tasks without folder." });
    }
};

// -------------------------------------------
// Get SINGLE TASK by ID
// -------------------------------------------
const getTaskById = async (req, res) => {
    try {
        const userId = getUserId(req);
        const { taskId } = req.params;

        // Try Task first
        let item = await Task.findOne({ _id: taskId, user: userId });
        
        // If not found, try Folder
        if (!item) {
            item = await Folder.findOne({ _id: taskId, user: userId });
        }

        if (!item) {
            return res.status(404).json({ error: "Task or folder not found." });
        }

        res.status(200).json(item);

    } catch (error) {
        console.error("Error fetching task/folder by ID:", error);
        res.status(500).json({ error: "Server error while fetching task/folder." });
    }
};

// -------------------------------------------
// Update Task or Folder (title and/or status)
// -------------------------------------------
const updateTaskStatus = async (req, res) => {
    try {
        const userId = getUserId(req);
        const { taskId } = req.params;
        const { title, status } = req.body;

        // Build update object
        const updateData = {};
        
        if (title !== undefined) {
            updateData.title = title;
        }
        
        if (status !== undefined) {
            if (!["Pending", "Working", "Completed"].includes(status)) {
                return res.status(400).json({ error: "Invalid status." });
            }
            updateData.status = status;
        }

        // If no fields to update
        if (Object.keys(updateData).length === 0) {
            return res.status(400).json({ error: "Provide at least title or status to update." });
        }

        // Try updating Task first
        let updatedItem = await Task.findOneAndUpdate(
            { _id: taskId, user: userId },
            updateData,
            { new: true, runValidators: true }
        );

        // If Task not found, try Folder
        if (!updatedItem) {
            const folderUpdate = title ? { name: title } : {};
            updatedItem = await Folder.findOneAndUpdate(
                { _id: taskId, user: userId },
                folderUpdate,
                { new: true, runValidators: true }
            );
        }

        if (!updatedItem) {
            return res.status(404).json({ error: "Task or folder not found." });
        }

        res.status(200).json({ message: "Task or folder updated.", data: updatedItem });

    } catch (error) {
        console.error("Error updating task or folder:", error);
        res.status(500).json({ error: "Server error while updating task or folder." });
    }
};

// -------------------------------------------
// DELETE Task or Folder
// -------------------------------------------
const deleteTaskOrFolder = async (req, res) => {
  try {
    const userId = getUserId(req);
    let { type, id } = req.params;

    // support route patterns: /:type/:id  OR  /:id  (when only id provided, Express will set id)
    // If only one param was provided and it's an ObjectId, treat it as id
    if (!id && type && mongoose.isValidObjectId(type)) {
      id = type;
      type = undefined;
    }

    if (!id) {
      return res.status(400).json({ error: "Missing id parameter." });
    }

    // explicit delete by type
    if (type === "task") {
      const deletedTask = await Task.findOneAndDelete({ _id: id, user: userId });
      if (!deletedTask) return res.status(404).json({ error: "Task not found." });
      return res.status(200).json({ message: "Task deleted successfully." });
    }

    if (type === "folder") {
      // delete tasks first, then folder
      await Task.deleteMany({ folder: id, user: userId });
      const deletedFolder = await Folder.findOneAndDelete({ _id: id, user: userId });
      if (!deletedFolder) return res.status(404).json({ error: "Folder not found." });
      return res.status(200).json({ message: "Folder and its tasks deleted successfully." });
    }

    // no type provided: try task first, then folder
    const deletedTask = await Task.findOneAndDelete({ _id: id, user: userId });
    if (deletedTask) return res.status(200).json({ message: "Task deleted successfully." });

    // attempt folder delete (and its tasks)
    const deletedFolder = await Folder.findOneAndDelete({ _id: id, user: userId });
    if (deletedFolder) {
      await Task.deleteMany({ folder: id, user: userId });
      return res.status(200).json({ message: "Folder and its tasks deleted successfully." });
    }

    return res.status(404).json({ error: "Task or folder not found." });
  } catch (error) {
    console.error("Error deleting task or folder:", error);
    return res.status(500).json({ error: "Server error while deleting." });
  }
};

// At the end, export the functions as CommonJS:
module.exports = {
  createTaskOrFolder,
  getAllTasksAndFolders,
  getTasksByFolder,
  getAllTasksWithoutFolder,
  getTaskById,
  updateTaskStatus,
  deleteTaskOrFolder
};
