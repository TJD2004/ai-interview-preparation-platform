const mongoose = require('mongoose');
const idPlugin = require('./plugins/idPlugin');

const aptitudeSessionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  category: { type: String, enum: ['logical', 'quantitative', 'mixed'], required: true },
  // null/'all' = mixed across topics in the category
  topic: { type: String, default: null },
  questionCount: { type: Number, required: true },
  correctCount: { type: Number, default: null },
  scorePercent: { type: Number, default: null },
  status: { type: String, enum: ['in_progress', 'completed'], default: 'in_progress' },
  completedAt: { type: Date, default: null }
}, { timestamps: true });

idPlugin(aptitudeSessionSchema);

module.exports = mongoose.model('AptitudeSession', aptitudeSessionSchema);
