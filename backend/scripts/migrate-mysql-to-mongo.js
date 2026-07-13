// One-time migration: copies existing data from your old MySQL database into
// the new MongoDB database. Run this ONCE, after you've confirmed the app
// works against MongoDB but before you retire the MySQL database.
//
// Requires the `mysql2` package (not a normal dependency anymore, since the
// app itself no longer talks to MySQL). Install it just for this script:
//   npm install mysql2 --no-save
//
// Usage:
//   MYSQL_HOST=localhost \
//   MYSQL_PORT=3306 \
//   MYSQL_USER=root \
//   MYSQL_PASSWORD=your_mysql_password \
//   MYSQL_DATABASE=ai_interview_db \
//   MYSQL_SSL=false \
//   node scripts/migrate-mysql-to-mongo.js
//
// (Set MYSQL_SSL=true if your old DB was a cloud provider like Aiven.)
// Also make sure MONGODB_URI in your .env already points at the destination.
//
// Safe to re-run accidentally: it refuses to proceed if the target MongoDB
// already has users in it, unless you pass MIGRATION_FORCE=true.

require('dotenv').config();
const mysql = require('mysql2/promise');
const {
  mongoose,
  connectDB,
  User,
  InterviewSession,
  InterviewMessage,
  AptitudeQuestion,
  AptitudeSession,
  AptitudeAnswer,
  ResumeCheck
} = require('../models');

const { Types } = mongoose;

function safeJSONParse(value, fallback) {
  if (value === null || value === undefined || value === '') return fallback;
  if (Array.isArray(value)) return value; // already an array somehow
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

async function getMysqlConnection() {
  return mysql.createConnection({
    host: process.env.MYSQL_HOST || 'localhost',
    port: process.env.MYSQL_PORT || 3306,
    user: process.env.MYSQL_USER || 'root',
    password: process.env.MYSQL_PASSWORD || '',
    database: process.env.MYSQL_DATABASE || 'ai_interview_db',
    ssl: process.env.MYSQL_SSL === 'true' ? { rejectUnauthorized: false } : undefined
  });
}

async function migrate() {
  const mysqlConn = await getMysqlConnection();
  console.log('Connected to MySQL');

  await connectDB();
  console.log('Connected to MongoDB');

  const existingUsers = await User.estimatedDocumentCount();
  if (existingUsers > 0 && process.env.MIGRATION_FORCE !== 'true') {
    console.error(`MongoDB already has ${existingUsers} user(s). Refusing to run to avoid creating duplicates.`);
    console.error('If you\'re sure you want to proceed anyway, re-run with MIGRATION_FORCE=true.');
    await mysqlConn.end();
    await mongoose.disconnect();
    process.exit(1);
  }

  // ---------- USERS ----------
  const [users] = await mysqlConn.query('SELECT * FROM users');
  const userIdMap = new Map(); // old MySQL id (number) -> new Mongo ObjectId
  const userDocs = users.map(u => {
    const newId = new Types.ObjectId();
    userIdMap.set(u.id, newId);
    return {
      _id: newId,
      name: u.name,
      email: u.email,
      passwordHash: u.password_hash,
      googleId: u.google_id,
      avatarUrl: u.avatar_url,
      createdAt: u.created_at,
      updatedAt: u.updated_at
    };
  });
  if (userDocs.length) await User.insertMany(userDocs, { timestamps: false });
  console.log(`Migrated ${userDocs.length} users`);

  // ---------- INTERVIEW SESSIONS ----------
  const [sessions] = await mysqlConn.query('SELECT * FROM interview_sessions');
  const sessionIdMap = new Map();
  const sessionDocs = sessions
    .filter(s => userIdMap.has(s.user_id))
    .map(s => {
      const newId = new Types.ObjectId();
      sessionIdMap.set(s.id, newId);
      return {
        _id: newId,
        user: userIdMap.get(s.user_id),
        role: s.role,
        questionCount: s.question_count,
        status: s.status,
        overallScore: s.overall_score,
        strengths: s.strengths,
        improvements: s.improvements,
        summary: s.summary,
        completedAt: s.completed_at,
        createdAt: s.created_at,
        updatedAt: s.updated_at
      };
    });
  if (sessionDocs.length) await InterviewSession.insertMany(sessionDocs, { timestamps: false });
  console.log(`Migrated ${sessionDocs.length} interview sessions`);

  // ---------- INTERVIEW MESSAGES ----------
  const [messages] = await mysqlConn.query('SELECT * FROM interview_messages');
  const messageDocs = messages
    .filter(m => sessionIdMap.has(m.session_id))
    .map(m => ({
      session: sessionIdMap.get(m.session_id),
      sender: m.sender,
      content: m.content,
      createdAt: m.created_at
    }));
  if (messageDocs.length) await InterviewMessage.insertMany(messageDocs, { timestamps: false });
  console.log(`Migrated ${messageDocs.length} interview messages`);

  // ---------- APTITUDE QUESTIONS ----------
  const [questions] = await mysqlConn.query('SELECT * FROM aptitude_questions');
  const questionIdMap = new Map();
  const questionDocs = questions.map(q => {
    const newId = new Types.ObjectId();
    questionIdMap.set(q.id, newId);
    return {
      _id: newId,
      category: q.category,
      topic: q.topic,
      questionNumber: q.question_number,
      questionText: q.question_text,
      optionA: q.option_a,
      optionB: q.option_b,
      optionC: q.option_c,
      optionD: q.option_d,
      correctOption: q.correct_option,
      solution: q.solution,
      createdAt: q.created_at,
      updatedAt: q.updated_at
    };
  });
  if (questionDocs.length) await AptitudeQuestion.insertMany(questionDocs, { timestamps: false });
  console.log(`Migrated ${questionDocs.length} aptitude questions`);

  // ---------- APTITUDE SESSIONS ----------
  const [aptSessions] = await mysqlConn.query('SELECT * FROM aptitude_sessions');
  const aptSessionIdMap = new Map();
  const aptSessionDocs = aptSessions
    .filter(s => userIdMap.has(s.user_id))
    .map(s => {
      const newId = new Types.ObjectId();
      aptSessionIdMap.set(s.id, newId);
      return {
        _id: newId,
        user: userIdMap.get(s.user_id),
        category: s.category,
        topic: s.topic,
        questionCount: s.question_count,
        correctCount: s.correct_count,
        scorePercent: s.score_percent,
        status: s.status,
        completedAt: s.completed_at,
        createdAt: s.created_at,
        updatedAt: s.updated_at
      };
    });
  if (aptSessionDocs.length) await AptitudeSession.insertMany(aptSessionDocs, { timestamps: false });
  console.log(`Migrated ${aptSessionDocs.length} aptitude sessions`);

  // ---------- APTITUDE ANSWERS ----------
  const [answers] = await mysqlConn.query('SELECT * FROM aptitude_answers');
  const answerDocs = answers
    .filter(a => aptSessionIdMap.has(a.session_id) && questionIdMap.has(a.question_id))
    .map(a => ({
      session: aptSessionIdMap.get(a.session_id),
      question: questionIdMap.get(a.question_id),
      selectedOption: a.selected_option,
      isCorrect: !!a.is_correct,
      createdAt: a.created_at
    }));
  if (answerDocs.length) await AptitudeAnswer.insertMany(answerDocs, { timestamps: false });
  console.log(`Migrated ${answerDocs.length} aptitude answers`);

  // ---------- RESUME CHECKS ----------
  const [checks] = await mysqlConn.query('SELECT * FROM resume_checks');
  const checkDocs = checks
    .filter(c => userIdMap.has(c.user_id))
    .map(c => ({
      user: userIdMap.get(c.user_id),
      targetRole: c.target_role,
      fileName: c.file_name,
      atsScore: c.ats_score,
      matchedKeywords: safeJSONParse(c.matched_keywords, []),
      missingKeywords: safeJSONParse(c.missing_keywords, []),
      formattingIssues: safeJSONParse(c.formatting_issues, []),
      suggestions: safeJSONParse(c.suggestions, []),
      summary: c.summary,
      createdAt: c.created_at,
      updatedAt: c.updated_at
    }));
  if (checkDocs.length) await ResumeCheck.insertMany(checkDocs, { timestamps: false });
  console.log(`Migrated ${checkDocs.length} resume checks`);

  await mysqlConn.end();
  await mongoose.disconnect();
  console.log('\nMigration complete!');
}

migrate().catch(async err => {
  console.error('Migration failed:', err);
  try { await mongoose.disconnect(); } catch {}
  process.exit(1);
});
