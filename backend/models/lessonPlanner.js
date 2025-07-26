const mongoose = require('mongoose');

const lessonPlannerSchema = new mongoose.Schema({
  title: { type: String, required: true },
  plan: { type: Object, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('LessonPlanner', lessonPlannerSchema); 