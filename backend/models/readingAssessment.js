const mongoose = require('mongoose');

const readingAssessmentSchema = new mongoose.Schema({
  title: { type: String, required: true },
  assessmentData: { type: Object, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('ReadingAssessment', readingAssessmentSchema); 