const express = require('express');
const cors = require('cors');
const db = require('./config/db');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const taskRoutes = require('./routes/taskRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);

// Base route for connectivity checks
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    database: db.dbType,
    timestamp: new Date()
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Error:', err.stack);
  res.status(500).json({
    success: false,
    message: 'An internal server error occurred',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

const PORT = process.env.PORT || 5000;

// Initialize Database migrations and start listening
async function bootstrap() {
  try {
    await db.initDb();
    
    // Only bind to port if we aren't running supertest tests
    if (process.env.NODE_ENV !== 'test') {
      app.listen(PORT, () => {
        console.log(`Server is successfully running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode.`);
      });
    }
  } catch (error) {
    console.error('Failed to bootstrap application:', error.message);
  }
}

bootstrap();

module.exports = app;
