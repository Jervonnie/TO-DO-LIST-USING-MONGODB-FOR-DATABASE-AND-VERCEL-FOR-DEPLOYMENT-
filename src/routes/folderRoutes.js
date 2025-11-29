const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
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
 *     security: [{ bearerAuth: [] }]
 */
router.post('/', auth, createFolder);

/**
 * @swagger
 * /api/v1/folders/{id}:
 *   get:
 *     summary: Get folder by ID
 *     tags: [Folders]
 *     security: [{ bearerAuth: [] }]
 */
router.get('/:id', auth, getFolderById);

/**
 * @swagger
 * /api/v1/folders/{folderId}/tasks:
 *   get:
 *     summary: Get tasks in folder
 *     tags: [Folders]
 *     security: [{ bearerAuth: [] }]
 */
router.get('/:folderId/tasks', auth, getTasksInFolder);

/**
 * @swagger
 * /api/v1/folders/{folderId}/tasks:
 *   post:
 *     summary: Add a task to a folder
 *     tags: [Folders]
 *     security: [{ bearerAuth: [] }]
 */
router.post('/:folderId/tasks', auth, addTaskToFolder);

/**
 * @swagger
 * /api/v1/folders/{folderId}/tasks/{taskId}:
 *   patch:
 *     summary: Update a task in a folder
 *     tags: [Folders]
 *     security: [{ bearerAuth: [] }]
 */
router.patch('/:folderId/tasks/:taskId', auth, updateTaskInFolder);

/**
 * Update task status in folder
 */
router.patch('/:folderId/tasks/:taskId/status', auth, updateTaskStatus);

/**
 * Delete task in folder
 */
router.delete('/:folderId/tasks/:taskId', auth, deleteTaskInFolder);

/**
 * Reset and clear progress
 */
router.patch('/:id/progress/reset', auth, resetProgress);
router.delete('/:id/progress', auth, clearProgress);

module.exports = router;
