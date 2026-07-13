const { InterviewSession, InterviewMessage } = require('../models');
const { getAIReply } = require('../utils/groq');

exports.start = async (req, res) => {
  try {
    const { role, questionCount } = req.body;
    if (!role) return res.status(400).json({ error: 'role is required' });
    const qCount = questionCount || 6;

    const session = await InterviewSession.create({
      user: req.userId,
      role,
      questionCount: qCount,
      status: 'in_progress'
    });

    const openingUserMsg = "Hi, I'm ready to begin the interview.";
    const reply = await getAIReply(role, qCount, [{ role: 'user', content: openingUserMsg }]);

    await InterviewMessage.create({ session: session.id, sender: 'ai', content: reply });

    res.status(201).json({ sessionId: session.id, reply });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not start interview', details: err.message });
  }
};

exports.chat = async (req, res) => {
  try {
    const { sessionId, message } = req.body;
    if (!sessionId || !message) {
      return res.status(400).json({ error: 'sessionId and message are required' });
    }

    const session = await InterviewSession.findOne({ _id: sessionId, user: req.userId });
    if (!session) return res.status(404).json({ error: 'Interview session not found' });
    if (session.status === 'completed') {
      return res.status(400).json({ error: 'This interview has already finished' });
    }

    await InterviewMessage.create({ session: session.id, sender: 'user', content: message });

    const history = await InterviewMessage.find({ session: session.id }).sort({ createdAt: 1 });
    const formatted = history.map(m => ({
      role: m.sender === 'ai' ? 'assistant' : 'user',
      content: m.content
    }));

    const reply = await getAIReply(session.role, session.questionCount, formatted);

    if (reply.includes('FEEDBACK_START')) {
      const cleaned = reply.replace('FEEDBACK_START', '').replace('FEEDBACK_END', '').trim();
      const scoreMatch = cleaned.match(/Overall Score:\s*([\d.]+)/i);
      const strengthsMatch = cleaned.match(/Strengths:\s*([\s\S]*?)Areas to Improve:/i);
      const improvementsMatch = cleaned.match(/Areas to Improve:\s*([\s\S]*?)Summary:/i);
      const summaryMatch = cleaned.match(/Summary:\s*([\s\S]*)/i);

      session.status = 'completed';
      session.overallScore = scoreMatch ? parseFloat(scoreMatch[1]) : null;
      session.strengths = strengthsMatch ? strengthsMatch[1].trim() : null;
      session.improvements = improvementsMatch ? improvementsMatch[1].trim() : null;
      session.summary = summaryMatch ? summaryMatch[1].trim() : null;
      session.completedAt = new Date();
      await session.save();

      return res.json({
        finished: true,
        feedback: {
          score: session.overallScore,
          strengths: session.strengths,
          improvements: session.improvements,
          summary: session.summary
        }
      });
    }

    await InterviewMessage.create({ session: session.id, sender: 'ai', content: reply });
    res.json({ finished: false, reply });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Chat failed', details: err.message });
  }
};

exports.history = async (req, res) => {
  const sessions = await InterviewSession.find({ user: req.userId })
    .sort({ createdAt: -1 })
    .select('role status overallScore createdAt completedAt');
  res.json({ sessions });
};

exports.sessionDetail = async (req, res) => {
  try {
    const session = await InterviewSession.findOne({ _id: req.params.id, user: req.userId });
    if (!session) return res.status(404).json({ error: 'Session not found' });

    const messages = await InterviewMessage.find({ session: session.id }).sort({ createdAt: 1 });

    const sessionJSON = session.toJSON();
    sessionJSON.messages = messages;

    res.json({ session: sessionJSON });
  } catch (err) {
    console.error(err);
    res.status(404).json({ error: 'Session not found' });
  }
};

exports.analytics = async (req, res) => {
  const sessions = await InterviewSession.find({ user: req.userId, status: 'completed' })
    .sort({ createdAt: 1 })
    .select('role overallScore createdAt');

  const totalInterviews = sessions.length;
  const avgScore = totalInterviews
    ? +(sessions.reduce((sum, s) => sum + (s.overallScore || 0), 0) / totalInterviews).toFixed(1)
    : 0;

  const roleCounts = {};
  sessions.forEach(s => { roleCounts[s.role] = (roleCounts[s.role] || 0) + 1; });

  res.json({
    totalInterviews,
    avgScore,
    scoreTrend: sessions.map(s => ({ date: s.createdAt, score: s.overallScore, role: s.role })),
    roleCounts
  });
};
