const mongoose = require('mongoose');
const idPlugin = require('./plugins/idPlugin');

const resumeCheckSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  targetRole: { type: String, required: true },
  fileName: { type: String, default: null },
  atsScore: { type: Number, default: null },
  // Mongo stores arrays natively - no more JSON.stringify/parse round-tripping
  matchedKeywords: { type: [String], default: [] },
  missingKeywords: { type: [String], default: [] },
  formattingIssues: { type: [String], default: [] },
  suggestions: { type: [String], default: [] },
  summary: { type: String, default: null }
}, { timestamps: true });

idPlugin(resumeCheckSchema);

module.exports = mongoose.model('ResumeCheck', resumeCheckSchema);
