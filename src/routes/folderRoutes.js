const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware'); // JWT middleware
const {
  createFolder,
  getFolderById,
  getTasksInFolder,
  addTaskToFolder,
  updateTaskInFolder,
  updateTaskStatus,
  deleteTaskInFolder,
  resetProgress,
  clearProgress
} = require('../controllers/folderController');

/**
 * @swagger
 * /api/v1/folders:
 *   post:
 *     summary: Create a new folder
 *     tags: [Folders]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Folder'
 *     responses:
 *       201:
 *         description: Folder created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Folder'
 *       400:
 *         description: Validation error
 */
router.post('/', auth, createFolder);

/**
 * @swagger
 * /api/v1/folders/{id}:
 *   get:
 *     summary: Get folder by ID
 *     tags: [Folders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *         description: Folder ID
 *     responses:
 *       200:
 *         description: Folder found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Folder'
 *       404:
 *         description: Folder not found
 */
router.get('/:id', auth, getFolderById);

/**
 * @swagger
 * /api/v1/folders/{folderId}/tasks:
 *   get:
 *     summary: Get all tasks in a folder
 *     tags: [Folders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: folderId
 *         required: true
 *         schema: { type: string }
 *         description: Folder ID
 *     responses:
 *       200:
 *         description: List of tasks in the folder
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Task'
 */
router.get('/:folderId/tasks', auth, getTasksInFolder);

/**
 * @swagger
 * /api/v1/folders/{folderId}/tasks:
 *   post:
 *     summary: Add a task to a folder
 *     tags: [Folders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: folderId
 *         required: true
 *         schema: { type: string }
 *         description: Folder ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Task'
 *     responses:
 *       201:
 *         description: Task added to folder
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Task'
 */
router.post('/:folderId/tasks', auth, addTaskToFolder);

/**
 * @swagger
 * /api/v1/folders/{folderId}/tasks/{taskId}:
 *   patch:
 *     summary: Update a task in a folder
 *     tags: [Folders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: folderId
 *         required: true
 *         schema: { type: string }
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title: { type: string }
 *               description: { type: string }
 *               status: { type: string, enum: [todo, in-progress, done] }
 *     responses:
 *       200:
 *         description: Task updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Task'
 *       404:
 *         description: Task not found
 */
router.patch('/:folderId/tasks/:taskId', auth, updateTaskInFolder);

/**
 * @swagger
 * /api/v1/folders/{folderId}/tasks/{taskId}/status:
 *   patch:
 *     summary: Update task status in a folder
 *     tags: [Folders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: folderId
 *         required: true
 *         schema: { type: string }
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status: { type: string, enum: [todo, in-progress, done] }
 *     responses:
 *       200:
 *         description: Task status updated
 *       404:
 *         description: Task not found
 */
router.patch('/:folderId/tasks/:taskId/status', auth, updateTaskStatus);

/**
 * @swagger
 * /api/v1/folders/{folderId}/tasks/{taskId}:
 *   delete:
 *     summary: Delete a task from a folder
 *     tags: [Folders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: folderId
 *         required: true
 *         schema: { type: string }
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       204:
 *         description: Task deleted
 *       404:
 *         description: Task not found
 */
router.delete('/:folderId/tasks/:taskId', auth, deleteTaskInFolder);

/**
 * @swagger
 * /api/v1/folders/{id}/progress/reset:
 *   patch:
 *     summary: Reset progress of a folder
 *     tags: [Folders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Folder progress reset
 */
router.patch('/:id/progress/reset', auth, resetProgress);

/**
 * @swagger
 * /api/v1/folders/{id}/progress:
 *   delete:
 *     summary: Clear progress of a folder
 *     tags: [Folders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       204:
 *         description: Folder progress cleared
 */
router.delete('/:id/progress', auth, clearProgress);

module.exports = router;