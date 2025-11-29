const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const {
  createTaskOrFolder,
  getAllTasksAndFolders,
  getTasksByFolder,
  getAllTasksWithoutFolder,
  getTaskById,
  updateTaskStatus,
  deleteTaskOrFolder
} = require('../controllers/taskController');

/**
 * @swagger
 * /api/v1/task:
 *   get:
 *     summary: Get all tasks and folders for the authenticated user
 *     tags: [Tasks]
 *     security: [{ bearerAuth: [] }]
 */
router.get('/', auth, getAllTasksAndFolders);

/**
 * @swagger
 * /api/v1/task/folder/{folderId}:
 *   get:
 *     summary: Get tasks inside a specific folder
 *     tags: [Tasks]
 *     security: [{ bearerAuth: [] }]
 */
router.get('/folder/:folderId', auth, getTasksByFolder);

/**
 * @swagger
 * /api/v1/task/nofolder:
 *   get:
 *     summary: Get all tasks that are not in any folder
 *     tags: [Tasks]
 *     security: [{ bearerAuth: [] }]
 */
router.get('/nofolder', auth, getAllTasksWithoutFolder);

/**
 * @swagger
 * /api/v1/task:
 *   post:
 *     summary: Create a task or folder
 *     tags: [Tasks]
 *     security: [{ bearerAuth: [] }]
 */
router.post('/', auth, createTaskOrFolder);

/**
 * @swagger
 * /api/v1/task/{taskId}:
 *   get:
 *     summary: Get a single task by ID
 *     tags: [Tasks]
 *     security: [{ bearerAuth: [] }]
 */
router.get('/:taskId', auth, getTaskById);

/**
 * @swagger
 * /api/v1/task/{taskId}:
 *   patch:
 *     summary: Update task status/title
 *     tags: [Tasks]
 *     security: [{ bearerAuth: [] }]
 */
router.patch('/:taskId', auth, updateTaskStatus);

/**
 * Delete by type/id or by id only
 */
router.delete('/:type/:id', auth, deleteTaskOrFolder);
router.delete('/:id', auth, deleteTaskOrFolder);

module.exports = router;
