const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const {
  createFolder,
  getFolderById,
  getTasksInFolder,
  addTaskToFolder,
  updateTaskInFolder,
  updateTaskStatus,
  deleteTaskInFolder,
  resetProgress,
  clearProgress,
} = require("../controllers/folderController");

/**
 * @swagger
 * tags:
 *   name: Folders
 *   description: Folder management
 */

/**
 * @swagger
 * /api/v1/folders:
 *   post:
 *     summary: Create a new folder
 *     tags: [Folders]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name]
 *             properties:
 *               name:
 *                 type: string
 *                 example: School Tasks
 *     responses:
 *       201:
 *         description: Folder created successfully
 *       400:
 *         description: Validation error
 */
router.post("/", auth, createFolder);

/**
 * @swagger
 * /api/v1/folders/{id}:
 *   get:
 *     summary: Get folder details (including tasks)
 *     tags: [Folders]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: Folder ID
 *     responses:
 *       200:
 *         description: Folder found
 *       404:
 *         description: Folder not found
 */
router.get("/:id", auth, getFolderById);

/**
 * @swagger
 * /api/v1/folders/{folderId}/tasks:
 *   get:
 *     summary: Get all tasks inside a folder
 *     tags: [Folders]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - name: folderId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: Folder ID
 *     responses:
 *       200:
 *         description: Tasks returned
 *
 *   post:
 *     summary: Add a new task to a folder
 *     tags: [Folders]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - name: folderId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title]
 *             properties:
 *               title:
 *                 type: string
 *                 example: Clean room
 *               dueDate:
 *                 type: string
 *                 format: date
 *     responses:
 *       201:
 *         description: Task added
 */
router
  .route("/:folderId/tasks")
  .get(auth, getTasksInFolder)
  .post(auth, addTaskToFolder);

/**
 * @swagger
 * /api/v1/folders/{folderId}/tasks/{taskId}:
 *   patch:
 *     summary: Update a task inside a folder
 *     tags: [Folders]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - name: folderId
 *         in: path
 *         required: true
 *       - name: taskId
 *         in: path
 *         required: true
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               dueDate:
 *                 type: string
 *                 format: date
 *               status:
 *                 type: string
 *     responses:
 *       200:
 *         description: Task updated
 *
 *   delete:
 *     summary: Delete a task from a folder
 *     tags: [Folders]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - name: folderId
 *         in: path
 *         required: true
 *       - name: taskId
 *         in: path
 *         required: true
 *     responses:
 *       200:
 *         description: Task deleted
 */
router
  .route("/:folderId/tasks/:taskId")
  .patch(auth, updateTaskInFolder)
  .delete(auth, deleteTaskInFolder);

/**
 * @swagger
 * /api/v1/folders/{id}/progress/reset:
 *   patch:
 *     summary: Reset all task statuses in folder
 *     tags: [Folders]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *     responses:
 *       200:
 *         description: Progress reset to Pending
 */
router.patch("/:id/progress/reset", auth, resetProgress);

/**
 * @swagger
 * /api/v1/folders/{id}/progress:
 *   delete:
 *     summary: Clear all tasks inside folder
 *     tags: [Folders]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *     responses:
 *       200:
 *         description: Progress cleared
 */
router.delete("/:id/progress", auth, clearProgress);

module.exports = router;
