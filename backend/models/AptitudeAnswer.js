const mongoose = require('mongoose');
const idPlugin = require('./plugins/idPlugin');

const aptitudeAnswerSchema = new mongoose.Schema({
  session: { type: mongoose.Schema.Types.ObjectId, ref: 'AptitudeSession', required: true, index: true },
  question: { type: mongoose.Schema.Types.ObjectId, ref: 'AptitudeQuestion', required: true },
  selectedOption: { type: String, default: null },
  isCorrect: { type: Boolean, required: true }
}, { timestamps: { createdAt: true, updatedAt: false } });

idPlugin(aptitudeAnswerSchema);

module.exports = mongoose.model('AptitudeAnswer', aptitudeAnswerSchema);
