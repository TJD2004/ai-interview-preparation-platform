const mongoose = require('mongoose');
require('dotenv').config();

// MongoDB Atlas (or any Mongo URI) - see backend/.env.example
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ai_interview_db';

async function connectDB() {
  mongoose.set('strictQuery', true);
  await mongoose.connect(MONGODB_URI);
  return mongoose.connection;
}

module.exports = { mongoose, connectDB };
