require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// Routes
const authRoutes = require('./src/routes/authRoutes');
const taskRoutes = require('./src/routes/taskRoutes');
const folderRoutes = require('./src/routes/folderRoutes');

// Swagger
const swaggerUi = require('swagger-ui-express');
const swaggerJSDoc = require('swagger-jsdoc');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // parses form data
// API routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/task', taskRoutes);
app.use('/api/v1/folders', folderRoutes);

// Swagger options
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'TASK LIST API',
      version: '1.0.0',
      description: 'Members: Jervonnie Corpuz, Peter John Delos Reyes, Jerome Cordova',
      contact: { name: 'Your Team', email: 'team@example.com' } 
    },
    servers: [{ url: 'http://localhost:' + (process.env.PORT || 3000), description: 'Local Development' }],
    components: {
      securitySchemes: {
        bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' }
      },
      schemas: {
        User: { type: 'object', properties: { _id: { type: 'string' }, username: { type: 'string' } } },
        Task: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            title: { type: 'string' },
            dueDate: { type: 'string', format: 'date-time' },
            status: { type: 'string', enum: ['Pending', 'Completed'] },
            folder: { type: 'string', nullable: true },
            user: { type: 'string' }
          }
        },
        Folder: {
          type: 'object',
          properties: { _id: { type: 'string' }, name: { type: 'string' }, user: { type: 'string' }, tasks: { type: 'array', items: { type: 'string' } } }
        },
        ApiError: { type: 'object', properties: { error: { type: 'string' } } }
      }
    },
    tags: [
      { name: 'Auth', description: 'Authentication endpoints' },
      { name: 'Tasks', description: 'Task management endpoints' },
      { name: 'Folders', description: 'Folder management endpoints' }
    ],
    paths: {
      // Auth
      '/api/v1/auth/login': {
        post: {
          tags: ['Auth'],
          summary: 'Logs the user in',
          requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', properties: { username: { type: 'string' }, password: { type: 'string' } }, required: ['username','password'] } } } },
          responses: { '200': { description: 'Login successful' }, '401': { description: 'Invalid credentials' } }
        }
      },
      '/api/v1/auth/register': {
        post: {
          tags: ['Auth'],
          summary: 'Registers a new user',
          requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', properties: { username: { type: 'string' }, password: { type: 'string' } }, required: ['username','password'] } } } },
          responses: { '201': { description: 'User created' }, '400': { description: 'Validation error' } }
        }
      },

      // Tasks (blue)
      '/api/v1/task': {
        get: {
          tags: ['Tasks'],
          security: [{ bearerAuth: [] }],
          summary: 'Retrieve all task  and folder for the user',
          responses: { '200': { description: 'List of tasks and folders' } }
        },
        post: {
          tags: ['Tasks'],
          security: [{ bearerAuth: [] }],
          summary: 'Create a new task or folder',
          requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', properties: { type: { type: 'string', enum: ['task','folder'] }, title: { type: 'string' }, dueDate: { type: 'string', format: 'date-time' }, status: { type: 'string' }, folder: { type: 'string' } }, required: ['type','title'] } } } },
          responses: { '201': { description: 'Created' }, '400': { description: 'Validation error' } }
        }
      },
      '/api/v1/task/{id}': {
        get: {
          tags: ['Tasks'],
          security: [{ bearerAuth: [] }],
          summary: 'Retrieve a single task or a folder with its id',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          responses: { '200': { description: 'Task or folder retrieved' }, '404': { description: 'Not found' } }
        },
        patch: {
          tags: ['Tasks'],
          security: [{ bearerAuth: [] }],
          summary: 'Update or rename a task or folder',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', properties: { title: { type: 'string' }, status: { type: 'string', enum: ['Pending','Completed'] }, dueDate: { type: 'string', format: 'date-time' } } } } } },
          responses: { '200': { description: 'Updated' }, '400': { description: 'Validation error' } }
        },
        delete: {
          tags: ['Tasks'],
          security: [{ bearerAuth: [] }],
          summary: 'Delete a folder and its tasks (or delete a task by id)',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          responses: { '200': { description: 'Deleted successfully' }, '404': { description: 'Not found' } }
        }
      },

      // Folders (green)
      '/api/v1/folders/{id}': {
        get: {
          tags: ['Folders'],
          security: [{ bearerAuth: [] }],
          summary: 'Returns details of one folder, including tasks and progress',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          responses: { '200': { description: 'Folder details' }, '404': { description: 'Not found' } }
        }
      },
      '/api/v1/folders/{folderId}/tasks': {
        get: {
          tags: ['Folders'],
          security: [{ bearerAuth: [] }],
          summary: 'Returns all tasks in a folder',
          parameters: [{ name: 'folderId', in: 'path', required: true, schema: { type: 'string' } }],
          responses: { '200': { description: 'List of tasks in folder' } }
        },
        post: {
          tags: ['Folders'],
          security: [{ bearerAuth: [] }],
          summary: 'Adds a new task to a folder',
          parameters: [{ name: 'folderId', in: 'path', required: true, schema: { type: 'string' } }],
          requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', properties: { title: { type: 'string' }, dueDate: { type: 'string', format: 'date-time' }, status: { type: 'string' } }, required: ['title'] } } } },
          responses: { '201': { description: 'Task added to folder' }, '400': { description: 'Validation error' } }
        }
      },
      '/api/v1/folders/{folderId}/tasks/{taskId}': {
        patch: {
          tags: ['Folders'],
          security: [{ bearerAuth: [] }],
          summary: 'Updates task details (title, due date, etc.)',
          parameters: [
            { name: 'folderId', in: 'path', required: true, schema: { type: 'string' } },
            { name: 'taskId', in: 'path', required: true, schema: { type: 'string' } }
          ],
          requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', properties: { title: { type: 'string' }, dueDate: { type: 'string', format: 'date-time' }, status: { type: 'string' } } } } } },
          responses: { '200': { description: 'Task updated' }, '404': { description: 'Not found' } }
        },
        delete: {
          tags: ['Folders'],
          security: [{ bearerAuth: [] }],
          summary: 'Deletes a task (completed or not)',
          parameters: [
            { name: 'folderId', in: 'path', required: true, schema: { type: 'string' } },
            { name: 'taskId', in: 'path', required: true, schema: { type: 'string' } }
          ],
          responses: { '200': { description: 'Task deleted' }, '404': { description: 'Not found' } }
        }
      },
      '/api/v1/folders/{folderId}/tasks/{taskId}/status': {
        patch: {
          tags: ['Folders'],
          security: [{ bearerAuth: [] }],
          summary: 'Marks a task as completed or pending',
          parameters: [
            { name: 'folderId', in: 'path', required: true, schema: { type: 'string' } },
            { name: 'taskId', in: 'path', required: true, schema: { type: 'string' } }
          ],
          requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', properties: { status: { type: 'string', enum: ['Pending','Completed'] } }, required: ['status'] } } } },
          responses: { '200': { description: 'Task status updated' }, '400': { description: 'Invalid status' } }
        }
      },
      '/api/v1/folders/{id}/progress/reset': {
        patch: {
          tags: ['Folders'],
          security: [{ bearerAuth: [] }],
          summary: "Set a tasks' statuses to 'Pending' for the folder",
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          responses: { '200': { description: 'Progress reset' } }
        }
      },
      '/api/v1/folders/{id}/progress': {
        delete: {
          tags: ['Folders'],
          security: [{ bearerAuth: [] }],
          summary: 'Clears progress tracking (optional)',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          responses: { '200': { description: 'Progress cleared' } }
        }
      }
    }
  },
  apis: [] // explicit paths only
};

const swaggerSpec = swaggerJSDoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, { explorer: true }));

// MongoDB connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connected');
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  })
  .catch((err) => console.error('❌ DB connection error:', err));