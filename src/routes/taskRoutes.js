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
 * components:
 *   schemas:
 *     Task:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         title:
 *           type: string
 *         dueDate:
 *           type: string
 *           format: date
 *         status:
 *           type: string
 *           enum: [Pending, Completed]
 *         folder:
 *           type: string
 *           nullable: true
 *         user:
 *           type: string
 *       required:
 *         - _id
 *         - title
 *         - user
 *     Folder:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         name:
 *           type: string
 *         user:
 *           type: string
 *         tasks:
 *           type: array
 *           items:
 *             type: string
 *       required:
 *         - _id
 *         - name
 *         - user
 */

/**
 * @swagger
 * /api/v1/task:
 *   get:
 *     summary: Get all tasks and folders for the authenticated user
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of tasks and folders
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 tasks:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Task'
 *                 folders:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Folder'
 */
router.get('/', auth, getAllTasksAndFolders);

/**
 * @swagger
 * /api/v1/task/folder/{folderId}:
 *   get:
 *     summary: Get tasks inside a specific folder
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: folderId
 *         required: true
 *         schema:
 *           type: string
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
router.get('/folder/:folderId', auth, getTasksByFolder);

/**
 * @swagger
 * /api/v1/task/nofolder:
 *   get:
 *     summary: Get all tasks that are not in any folder
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of tasks with no folder
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Task'
 */
router.get('/nofolder', auth, getAllTasksWithoutFolder);

/**
 * @swagger
 * /api/v1/task:
 *   post:
 *     summary: Create a task or folder
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [task, folder]
 *               title:
 *                 type: string
 *                 description: Task title or folder name
 *               status:
 *                 type: string
 *                 enum: [Pending, Completed]
 *                 description: Optional, only for tasks
 *               dueDate:
 *                 type: string
 *                 format: date
 *                 description: Optional, only for tasks
 *               folder:
 *                 type: string
 *                 description: Optional folder ID for tasks
 *             required:
 *               - type
 *               - title
 *     responses:
 *       201:
 *         description: Created successfully
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - $ref: '#/components/schemas/Task'
 *                 - $ref: '#/components/schemas/Folder'
 *       400:
 *         description: Validation error
 */
router.post('/', auth, createTaskOrFolder);

/**
 * @swagger
 * /api/v1/task/{taskId}:
 *   get:
 *     summary: Get a single task by ID
 *     description: Retrieve a specific task by its ID. Only tasks belonging to the authenticated user can be retrieved.
 *     tags:
 *       - Tasks
 *     parameters:
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the task to retrieve
 *     responses:
 *       200:
 *         description: Task retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Task'
 *       404:
 *         description: Task not found
 *       500:
 *         description: Server error
 *     security:
 *       - bearerAuth: []
 */
router.get('/:taskId', auth, getTaskById);

/**
 * @swagger
 * /api/v1/task/{taskId}:
 *   patch:
 *     summary: Update task status
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema:
 *           type: string
 *         description: Task ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [Pending, Completed]
 *     responses:
 *       200:
 *         description: Updated task status
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Task'
 */
router.patch('/:taskId', auth, updateTaskStatus);

/**
 * @swagger
 * /api/v1/task/{type}/{id}:
 *   delete:
 *     summary: Delete a task or folder
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: type
 *         required: true
 *         schema:
 *           type: string
 *           enum: [task, folder]
 *         description: Type of entity to delete
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Task or Folder ID
 *     responses:
 *       200:
 *         description: Deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 */
router.delete('/:type/:id', auth, deleteTaskOrFolder); // existing typed route
router.delete('/:id', auth, deleteTaskOrFolder);       // new: delete by id only

module.exports = router;
