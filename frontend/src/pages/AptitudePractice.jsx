import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import client from '../api/client';

export default function AptitudePractice() {
  const [topics, setTopics] = useState([]);
  const [category, setCategory] = useState('mixed');
  const [topic, setTopic] = useState('all');
  const [questionCount, setQuestionCount] = useState(10);
  const [stage, setStage] = useState('setup'); // setup | quiz
  const [sessionId, setSessionId] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [starting, setStarting] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    client.get('/aptitude/topics').then(res => setTopics(res.data.topics));
  }, []);

  const topicsForCategory = topics.filter(t => category === 'mixed' || t.category === category);

  async function startPractice(e) {
    e.preventDefault();
    setStarting(true);
    setError('');
    try {
      const res = await client.post('/aptitude/start', { category, topic, questionCount });
      setSessionId(res.data.sessionId);
      setQuestions(res.data.questions);
      setAnswers({});
      setStage('quiz');
    } catch (err) {
      setError(err.response?.data?.error || 'Could not start practice session');
    } finally {
      setStarting(false);
    }
  }

  function selectAnswer(questionId, option) {
    setAnswers(prev => ({ ...prev, [questionId]: option }));
  }

  async function submitQuiz() {
    if (submitting) return;
    setSubmitting(true);
    setError('');
    try {
      const payload = {
        sessionId,
        answers: questions.map(q => ({ questionId: q.id, selectedOption: answers[q.id] || null }))
      };
      await client.post('/aptitude/submit', payload);
      navigate(`/aptitude/report/${sessionId}`);
    } catch (err) {
      setError(err.response?.data?.error || 'Could not submit answers');
    } finally {
      setSubmitting(false);
    }
  }

  const answeredCount = Object.keys(answers).length;

  if (stage === 'quiz') {
    return (
      <div className="content-page">
        <div className="page-header">
          <h1>Aptitude Practice</h1>
          <p className="muted">{answeredCount} of {questions.length} answered</p>
        </div>

        {error && <p className="error-text">{error}</p>}

        <div className="quiz-list">
          {questions.map((q, idx) => (
            <motion.div
              key={q.id}
              className="card quiz-card"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(idx * 0.03, 0.3) }}
            >
              <div className="quiz-topic-tag">{q.topic}</div>
              <p className="quiz-question">{idx + 1}. {q.questionText}</p>
              <div className="quiz-options">
                {['A', 'B', 'C', 'D'].map(letter => {
                  const optionText = q[`option${letter}`];
                  const selected = answers[q.id] === letter;
                  return (
                    <button
                      key={letter}
                      type="button"
                      className={`quiz-option${selected ? ' selected' : ''}`}
                      onClick={() => selectAnswer(q.id, letter)}
                    >
                      <span className="quiz-option-letter">{letter}</span>
                      {optionText}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          ))}
        </div>

        <div className="quiz-submit-bar">
          <button className="cta-btn full" onClick={submitQuiz} disabled={submitting}>
            {submitting ? 'Submitting...' : `Submit (${answeredCount}/${questions.length} answered)`}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="content-page">
      <div className="page-header">
        <h1>Aptitude Practice</h1>
        <p className="muted">Logical reasoning and quantitative aptitude, drawn from a bank of 600 questions across 40 topics.</p>
      </div>

      <motion.div className="card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ maxWidth: 480 }}>
        {error && <p className="error-text">{error}</p>}
        <form onSubmit={startPractice} className="start-form">
          <label>Category</label>
          <select value={category} onChange={e => { setCategory(e.target.value); setTopic('all'); }}>
            <option value="mixed">Mixed (Logical + Quantitative)</option>
            <option value="logical">Logical Reasoning</option>
            <option value="quantitative">Quantitative Aptitude</option>
          </select>

          <label>Topic</label>
          <select value={topic} onChange={e => setTopic(e.target.value)}>
            <option value="all">All topics in this category</option>
            {topicsForCategory.map(t => (
              <option key={`${t.category}-${t.topic}`} value={t.topic}>
                {t.topic} ({t.count})
              </option>
            ))}
          </select>

          <label>Number of questions</label>
          <select value={questionCount} onChange={e => setQuestionCount(Number(e.target.value))}>
            <option value={5}>5 — Quick</option>
            <option value={10}>10 — Standard</option>
            <option value={20}>20 — Full</option>
          </select>

          <button className="cta-btn full" type="submit" disabled={starting}>
            {starting ? 'Starting...' : 'Start practice'}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
