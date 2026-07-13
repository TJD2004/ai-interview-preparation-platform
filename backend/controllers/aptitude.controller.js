const { AptitudeQuestion, AptitudeSession, AptitudeAnswer } = require('../models');

exports.topics = async (req, res) => {
  const rows = await AptitudeQuestion.aggregate([
    { $group: { _id: { category: '$category', topic: '$topic' }, count: { $sum: 1 } } },
    { $sort: { '_id.category': 1, '_id.topic': 1 } }
  ]);

  const topics = rows.map(r => ({
    category: r._id.category,
    topic: r._id.topic,
    count: r.count
  }));

  res.json({ topics });
};

exports.start = async (req, res) => {
  try {
    const { category, topic, questionCount } = req.body;
    if (!category) return res.status(400).json({ error: 'category is required' });

    const qCount = questionCount || 10;
    const match = {};

    if (category !== 'mixed') match.category = category;
    if (topic && topic !== 'all') match.topic = topic;

    // Mongo's equivalent of Sequelize's `order: sequelize.random()`
    const questions = await AptitudeQuestion.aggregate([
      { $match: match },
      { $sample: { size: qCount } }
    ]);

    if (questions.length === 0) {
      return res.status(404).json({ error: 'No questions found for this selection' });
    }

    const session = await AptitudeSession.create({
      user: req.userId,
      category,
      topic: topic && topic !== 'all' ? topic : null,
      questionCount: questions.length,
      status: 'in_progress'
    });

    const questionsForClient = questions.map(q => ({
      id: q._id,
      topic: q.topic,
      questionText: q.questionText,
      optionA: q.optionA,
      optionB: q.optionB,
      optionC: q.optionC,
      optionD: q.optionD
    }));

    res.status(201).json({ sessionId: session.id, questions: questionsForClient });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not start practice session', details: err.message });
  }
};

exports.submit = async (req, res) => {
  try {
    const { sessionId, answers } = req.body;
    if (!sessionId || !Array.isArray(answers)) {
      return res.status(400).json({ error: 'sessionId and answers[] are required' });
    }

    const session = await AptitudeSession.findOne({ _id: sessionId, user: req.userId });
    if (!session) return res.status(404).json({ error: 'Session not found' });
    if (session.status === 'completed') {
      return res.status(400).json({ error: 'This session has already been submitted' });
    }

    const questionIds = answers.map(a => a.questionId);
    const questions = await AptitudeQuestion.find({ _id: { $in: questionIds } });
    const questionMap = new Map(questions.map(q => [q.id, q]));

    let correctCount = 0;
    const breakdown = [];

    for (const a of answers) {
      const q = questionMap.get(a.questionId);
      if (!q) continue;

      const isCorrect = (a.selectedOption || '').toUpperCase() === q.correctOption.toUpperCase();
      if (isCorrect) correctCount++;

      await AptitudeAnswer.create({
        session: session.id,
        question: q.id,
        selectedOption: a.selectedOption || null,
        isCorrect
      });

      breakdown.push({
        questionId: q.id,
        topic: q.topic,
        questionText: q.questionText,
        optionA: q.optionA,
        optionB: q.optionB,
        optionC: q.optionC,
        optionD: q.optionD,
        correctOption: q.correctOption,
        selectedOption: a.selectedOption || null,
        isCorrect,
        solution: q.solution
      });
    }

    const scorePercent = +((correctCount / answers.length) * 100).toFixed(1);

    session.correctCount = correctCount;
    session.scorePercent = scorePercent;
    session.status = 'completed';
    session.completedAt = new Date();
    await session.save();

    res.json({
      sessionId: session.id,
      correctCount,
      totalQuestions: answers.length,
      scorePercent,
      breakdown
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not submit answers', details: err.message });
  }
};

exports.history = async (req, res) => {
  const sessions = await AptitudeSession.find({ user: req.userId })
    .sort({ createdAt: -1 })
    .select('category topic questionCount correctCount scorePercent status createdAt');
  res.json({ sessions });
};

exports.report = async (req, res) => {
  try {
    const session = await AptitudeSession.findOne({ _id: req.params.id, user: req.userId });
    if (!session) return res.status(404).json({ error: 'Session not found' });

    const answers = await AptitudeAnswer.find({ session: session.id }).populate('question');

    const breakdown = answers.map(a => ({
      questionId: a.question.id,
      topic: a.question.topic,
      questionText: a.question.questionText,
      optionA: a.question.optionA,
      optionB: a.question.optionB,
      optionC: a.question.optionC,
      optionD: a.question.optionD,
      correctOption: a.question.correctOption,
      selectedOption: a.selectedOption,
      isCorrect: a.isCorrect,
      solution: a.question.solution
    }));

    res.json({
      session: {
        id: session.id,
        category: session.category,
        topic: session.topic,
        questionCount: session.questionCount,
        correctCount: session.correctCount,
        scorePercent: session.scorePercent,
        createdAt: session.createdAt,
        completedAt: session.completedAt
      },
      breakdown
    });
  } catch (err) {
    console.error(err);
    res.status(404).json({ error: 'Session not found' });
  }
};

exports.analytics = async (req, res) => {
  const sessions = await AptitudeSession.find({ user: req.userId, status: 'completed' });
  const sessionIds = sessions.map(s => s.id);

  const answers = await AptitudeAnswer.find({ session: { $in: sessionIds } })
    .populate('question', 'topic category');

  const totalSessions = sessions.length;
  const avgScore = totalSessions
    ? +(sessions.reduce((sum, s) => sum + (s.scorePercent || 0), 0) / totalSessions).toFixed(1)
    : 0;

  const topicStats = {};
  answers.forEach(a => {
    const topic = a.question.topic;
    if (!topicStats[topic]) topicStats[topic] = { attempted: 0, correct: 0 };
    topicStats[topic].attempted++;
    if (a.isCorrect) topicStats[topic].correct++;
  });

  const topicBreakdown = Object.entries(topicStats).map(([topic, s]) => ({
    topic,
    attempted: s.attempted,
    correct: s.correct,
    accuracy: +((s.correct / s.attempted) * 100).toFixed(1)
  })).sort((a, b) => a.accuracy - b.accuracy);

  res.json({
    totalSessions,
    avgScore,
    weakestTopics: topicBreakdown.slice(0, 5),
    strongestTopics: topicBreakdown.slice(-5).reverse(),
    scoreTrend: sessions
      .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
      .map(s => ({ date: s.createdAt, score: s.scorePercent, category: s.category }))
  });
};
