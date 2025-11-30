const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const {
  createTaskOrFolder,
  getAllTasksAndFolders,
  getTasksByFolder,
  getAllTasksWithoutFolder,
  getTaskById,
  updateTaskStatus,
  deleteTaskOrFolder,
} = require("../controllers/taskController");

/**
 * @swagger
 * tags:
 *   name: Tasks
 *   description: Task management
 */

/**
 * @swagger
 * /api/v1/task:
 *   get:
 *     summary: Get all tasks & folders for the user
 *     tags: [Tasks]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: List of tasks and folders
 *
 *   post:
 *     summary: Create a new task or folder
 *     tags: [Tasks]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [type, title]
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [task, folder]
 *               title:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [Pending, Completed]
 *               dueDate:
 *                 type: string
 *                 format: date
 *               folder:
 *                 type: string
 *     responses:
 *       201:
 *         description: Created
 */
router
  .route("/")
  .get(auth, getAllTasksAndFolders)
  .post(auth, createTaskOrFolder);

/**
 * @swagger
 * /api/v1/task/folder/{folderId}:
 *   get:
 *     summary: Get tasks inside a folder
 *     tags: [Tasks]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - name: folderId
 *         in: path
 *         required: true
 *     responses:
 *       200:
 *         description: Tasks returned
 */
router.get("/folder/:folderId", auth, getTasksByFolder);

/**
 * @swagger
 * /api/v1/task/nofolder:
 *   get:
 *     summary: Get tasks that are not inside any folder
 *     tags: [Tasks]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Tasks returned
 */
router.get("/nofolder", auth, getAllTasksWithoutFolder);

/**
 * @swagger
 * /api/v1/task/{taskId}:
 *   get:
 *     summary: Get a task or folder by ID
 *     tags: [Tasks]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - name: taskId
 *         in: path
 *         required: true
 *     responses:
 *       200:
 *         description: Returned successfully
 *       404:
 *         description: Not found
 *
 *   patch:
 *     summary: Update task title or status
 *     tags: [Tasks]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
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
 *               status:
 *                 type: string
 *                 enum: [Pending, Completed]
 *     responses:
 *       200:
 *         description: Updated successfully
 */
router
  .route("/:taskId")
  .get(auth, getTaskById)
  .patch(auth, updateTaskStatus);

/**
 * @swagger
 * /api/v1/task/{type}/{id}:
 *   delete:
 *     summary: Delete a task or folder
 *     tags: [Tasks]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - name: type
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           enum: [task, folder]
 *       - name: id
 *         in: path
 *         required: true
 *     responses:
 *       200:
 *         description: Deleted successfully
 */
router.delete("/:type/:id", auth, deleteTaskOrFolder);

/**
 * @swagger
 * /api/v1/task/{id}:
 *   delete:
 *     summary: Delete by ID only (auto-detects type)
 *     tags: [Tasks]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *     responses:
 *       200:
 *         description: Deleted successfully
 */
router.delete("/:id", auth, deleteTaskOrFolder);

module.exports = router;
