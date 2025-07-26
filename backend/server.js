require('dotenv').config();
const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/authRoutes');
const profileRoutes = require('./routes/profileRoutes');
const chatRoutes = require('./routes/chatRoutes');
const libraryRoutes = require('./routes/libraryRoutes');
const feedbackRoutes = require('./routes/feedback'); // <-- Add this line

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Sahayak Backend API is running');
});

app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/library', libraryRoutes);
app.use('/api', feedbackRoutes); // <-- Add this line

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});