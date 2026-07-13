// Seeds the aptitude_questions collection from seed/aptitude_questions.json
// Usage: node seed/seedAptitude.js
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { connectDB, AptitudeQuestion, AptitudeAnswer } = require('../models');

async function seed() {
  try {
    await connectDB();
    console.log('MongoDB connected');

    const jsonPath = path.join(__dirname, 'aptitude_questions.json');
    const raw = fs.readFileSync(jsonPath, 'utf-8');
    const questions = JSON.parse(raw);

    console.log(`Loaded ${questions.length} questions from JSON`);

    const existing = await AptitudeQuestion.countDocuments();
    if (existing > 0) {
      console.log(`aptitude_questions already has ${existing} docs - clearing before reseeding...`);
      // aptitude_answers reference aptitude_questions by _id, so clear the
      // dependent collection first (Mongo has no FK constraint to fight here,
      // but we still want to avoid leaving orphaned answers behind).
      await AptitudeAnswer.deleteMany({});
      await AptitudeQuestion.deleteMany({});
    }

    const rows = questions.map(q => ({
      category: q.category,
      topic: q.topic,
      questionNumber: q.question_number,
      questionText: q.question_text,
      optionA: q.option_a,
      optionB: q.option_b,
      optionC: q.option_c,
      optionD: q.option_d,
      correctOption: q.correct_option,
      solution: q.solution
    }));

    await AptitudeQuestion.insertMany(rows);
    console.log(`Seeded ${rows.length} aptitude questions successfully.`);
    process.exit(0);
  } catch (err) {
    console.error('Seeding failed:', err);
    process.exit(1);
  }
}

seed();
