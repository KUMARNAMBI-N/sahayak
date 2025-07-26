require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { corsOptions, listAllowedOrigins } = require('./config/cors');
const authRoutes = require('./routes/authRoutes');
const profileRoutes = require('./routes/profileRoutes');
const chatRoutes = require('./routes/chatRoutes');
const libraryRoutes = require('./routes/libraryRoutes');
const generateStoryRoutes = require('./routes/generateStoryRoutes');
const multigradeWorksheetRoutes = require('./routes/multigradeWorksheetRoutes');
const lessonPlannerRoutes = require('./routes/lessonPlannerRoutes');
const visualAidRoutes = require('./routes/visualAidRoutes');
const readingAssessmentRoutes = require('./routes/readingAssessmentRoutes');
const feedbackRoutes = require('./routes/feedback');

const app = express();
const PORT = process.env.PORT || 5000;

console.log('JSON Database initialized - data will be stored in ./data/ directory');

// Use the CORS configuration for multiple domains
app.use(cors(corsOptions));

app.use(express.json());

// Add request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path} - Origin: ${req.headers.origin || 'No origin'}`);
  next();
});

app.get('/', (req, res) => {
  res.send('Sahayak Backend API is running with JSON Database');
});

// Test endpoint to verify database is working
app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'Backend is working!', 
    database: 'JSON Database (./data/ directory)',
    timestamp: new Date().toISOString(),
    cors: 'Multiple domains supported',
    environment: process.env.NODE_ENV || 'development'
  });
});

// CORS info endpoint
app.get('/api/cors-info', (req, res) => {
  const origins = listAllowedOrigins();
  res.json({
    allowedOrigins: origins,
    environment: process.env.NODE_ENV || 'development',
    customOrigins: process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(',') : []
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/library', libraryRoutes);
app.use('/api/generate-story', generateStoryRoutes);
app.use('/api/multigrade-worksheet', multigradeWorksheetRoutes);
app.use('/api/lesson-planner', lessonPlannerRoutes);
app.use('/api/visual-aid', visualAidRoutes);
app.use('/api/reading-assessment', readingAssessmentRoutes);
app.use('/api', feedbackRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    message: err.message 
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Route not found',
    path: req.originalUrl 
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`API available at http://localhost:${PORT}/api`);
  console.log('CORS configured for multiple domains');
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  listAllowedOrigins();
}); 