require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// Import Routes
const authRoutes = require('./src/routes/authRoutes');
const taskRoutes = require('./src/routes/taskRoutes');
const folderRoutes = require('./src/routes/folderRoutes');

// Swagger imports
const swaggerUi = require('swagger-ui-express');
const swaggerJSDoc = require('swagger-jsdoc');

const app = express();

// -----------------------------------------
// GLOBAL MIDDLEWARE
// -----------------------------------------
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// -----------------------------------------
// API ROUTES
// -----------------------------------------
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/task', taskRoutes);
app.use('/api/v1/folders', folderRoutes);

// -----------------------------------------
// SWAGGER CONFIGURATION (FIXED)
// -----------------------------------------
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',

    info: {
      title: 'TASK LIST API',
      version: '1.0.0',
      description: 'Members: Jervonnie Corpuz, Peter John Delos Reyes, Jerome Cordova'
    },

    servers: [
      { url: `http://localhost:${process.env.PORT || 3000}` }
    ],

    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    },

    // ⭐ GLOBAL SECURITY —
    // Makes all endpoints require bearer token unless overridden
    security: [
      { bearerAuth: [] }
    ]
  },

  // ⭐ IMPORTANT —
  // This tells Swagger to scan your route files for @swagger JSDoc blocks.
  apis: ['./src/routes/*.js']
};

// Create Swagger spec
const swaggerSpec = swaggerJSDoc(swaggerOptions);

// Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, { explorer: true }));

// ⭐ ADDED ROUTE:
// This returns the RAW Swagger JSON used by Swagger UI.
// We need this to debug why Execute button is not sending requests.
app.get('/api-docs-json', (req, res) => {
  res.json(swaggerSpec); // sends the entire spec as JSON
});

// -----------------------------------------
// DATABASE CONNECTION + SERVER START
// -----------------------------------------
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connected');

    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () =>
      console.log(`🚀 Server running on port ${PORT}`)
    );
  })
  .catch(err => console.error('❌ DB connection error:', err));
