const mongoose = require('mongoose');
const idPlugin = require('./plugins/idPlugin');

const interviewMessageSchema = new mongoose.Schema({
  session: { type: mongoose.Schema.Types.ObjectId, ref: 'InterviewSession', required: true, index: true },
  sender: { type: String, enum: ['ai', 'user'], required: true },
  content: { type: String, required: true }
}, { timestamps: { createdAt: true, updatedAt: false } });

idPlugin(interviewMessageSchema);

module.exports = mongoose.model('InterviewMessage', interviewMessageSchema);
