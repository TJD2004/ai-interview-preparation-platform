const mongoose = require('mongoose');
const idPlugin = require('./plugins/idPlugin');

const interviewSessionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  role: { type: String, required: true },
  questionCount: { type: Number, required: true },
  status: { type: String, enum: ['in_progress', 'completed'], default: 'in_progress' },
  overallScore: { type: Number, default: null },
  strengths: { type: String, default: null },
  improvements: { type: String, default: null },
  summary: { type: String, default: null },
  completedAt: { type: Date, default: null }
}, { timestamps: true });

idPlugin(interviewSessionSchema);

module.exports = mongoose.model('InterviewSession', interviewSessionSchema);
