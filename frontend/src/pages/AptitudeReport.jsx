import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import client from '../api/client';

export default function AptitudeReport() {
  const { id } = useParams();
  const [data, setData] = useState(null);

  useEffect(() => {
    client.get(`/aptitude/report/${id}`).then(res => setData(res.data));
  }, [id]);

  if (!data) return <div className="page-loading">Loading report...</div>;

  const { session, breakdown } = data;

  const topicStats = {};
  breakdown.forEach(b => {
    if (!topicStats[b.topic]) topicStats[b.topic] = { correct: 0, total: 0 };
    topicStats[b.topic].total++;
    if (b.isCorrect) topicStats[b.topic].correct++;
  });

  return (
    <div className="content-page">
      <motion.div className="card wide" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="report-header">
          <h1>{session.topic || (session.category === 'mixed' ? 'Mixed Practice' : session.category)}</h1>
          <span className="score-badge">{session.correctCount}/{session.questionCount} · {session.scorePercent}%</span>
        </div>

        <div className="topic-breakdown-row">
          {Object.entries(topicStats).map(([topic, s]) => (
            <span key={topic} className="topic-chip">
              {topic}: {s.correct}/{s.total}
            </span>
          ))}
        </div>

        <div className="question-review">
          {breakdown.map((b, idx) => (
            <div key={b.questionId} className={`review-item ${b.isCorrect ? 'correct' : 'incorrect'}`}>
              <p className="review-question">{idx + 1}. {b.questionText}</p>
              <div className="review-options">
                {['A', 'B', 'C', 'D'].map(letter => {
                  const text = b[`option${letter}`];
                  const isCorrectOption = letter === b.correctOption;
                  const isSelected = letter === b.selectedOption;
                  let cls = 'review-option';
                  if (isCorrectOption) cls += ' is-correct';
                  if (isSelected && !isCorrectOption) cls += ' is-wrong-selected';
                  return (
                    <div key={letter} className={cls}>
                      <span className="review-option-letter">{letter}</span>
                      {text}
                      {isSelected && <span className="review-tag">Your answer</span>}
                      {isCorrectOption && !isSelected && <span className="review-tag correct-tag">Correct</span>}
                    </div>
                  );
                })}
              </div>
              {b.solution && <p className="review-solution">{b.solution}</p>}
            </div>
          ))}
        </div>

        <Link to="/reports" className="cta-btn">Back to reports</Link>
      </motion.div>
    </div>
  );
}
