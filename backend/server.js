require('dotenv').config();
const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const profileRoutes = require('./routes/profileRoutes');
const chatRoutes = require('./routes/chatRoutes');
const libraryRoutes = require('./routes/libraryRoutes');
const generateStoryRoutes = require('./routes/generateStoryRoutes');
const multigradeWorksheetRoutes = require('./routes/multigradeWorksheetRoutes');
const lessonPlannerRoutes = require('./routes/lessonPlannerRoutes');
const visualAidRoutes = require('./routes/visualAidRoutes');
const readingAssessmentRoutes = require('./routes/readingAssessmentRoutes');


const app = express();
const PORT = process.env.PORT || 5000;

console.log('JSON Database initialized - data will be stored in ./data/ directory');

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Sahayak Backend API is running with JSON Database');
});

// Test endpoint to verify database is working
app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'Backend is working!', 
    database: 'JSON Database (./data/ directory)',
    timestamp: new Date().toISOString()
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


app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 