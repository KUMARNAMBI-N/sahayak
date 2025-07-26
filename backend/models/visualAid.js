const mongoose = require('mongoose');

const visualAidSchema = new mongoose.Schema({
  title: { type: String, required: true },
  aidData: { type: Object, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('VisualAid', visualAidSchema); 