const { mongoose, connectDB } = require('../config/db');
const User = require('./User');
const InterviewSession = require('./InterviewSession');
const InterviewMessage = require('./InterviewMessage');
const AptitudeQuestion = require('./AptitudeQuestion');
const AptitudeSession = require('./AptitudeSession');
const AptitudeAnswer = require('./AptitudeAnswer');
const ResumeCheck = require('./ResumeCheck');

// No association wiring needed here (unlike Sequelize) - refs live directly
// on each schema above and relations are resolved with .populate().
module.exports = {
  mongoose,
  connectDB,
  User,
  InterviewSession,
  InterviewMessage,
  AptitudeQuestion,
  AptitudeSession,
  AptitudeAnswer,
  ResumeCheck
};
