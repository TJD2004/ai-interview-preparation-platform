const mongoose = require('mongoose');
const idPlugin = require('./plugins/idPlugin');

const aptitudeQuestionSchema = new mongoose.Schema({
  category: { type: String, enum: ['logical', 'quantitative'], required: true },
  topic: { type: String, required: true },
  questionNumber: { type: Number, required: true },
  questionText: { type: String, required: true },
  optionA: { type: String, required: true },
  optionB: { type: String, required: true },
  optionC: { type: String, required: true },
  optionD: { type: String, required: true },
  correctOption: { type: String, required: true },
  solution: { type: String, default: null }
}, { timestamps: true });

aptitudeQuestionSchema.index({ category: 1, topic: 1 });

idPlugin(aptitudeQuestionSchema);

module.exports = mongoose.model('AptitudeQuestion', aptitudeQuestionSchema);
